#!/usr/bin/env node
/**
 * pr-review.mjs
 *
 * Runs the PR review agent via the `opencode` CLI (same toolchain family as
 * the pr-fix agent, which uses aider — both shipped in Dockerfile.ai).
 *
 * Flow:
 *  1. Load diff + specs context (built by build-context.mjs)
 *  2. Fetch existing AI review comments on this PR and pass them to the
 *     model as "already raised" so it doesn't duplicate feedback
 *  3. Invoke `opencode run` with a strict-JSON system prompt
 *  4. Parse JSON findings, dedupe again locally, then post a GitHub review
 *     (with issue-comment fallback)
 *
 * Required env:
 *   AZURE_API_KEY, AZURE_API_BASE, AZURE_API_VERSION, AZURE_OPENAI_DEPLOYMENT
 *   GH_TOKEN, GH_API_URL, REPO, PR_NUMBER, COMMIT_SHA
 */

import { readFileSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";

function getEnv(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}
function requireEnv(name) {
  const v = getEnv(name);
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const AZURE_API_KEY = requireEnv("AZURE_API_KEY");
requireEnv("AZURE_API_BASE");
requireEnv("AZURE_API_VERSION");
const AZURE_DEPLOYMENT = requireEnv("AZURE_OPENAI_DEPLOYMENT");

const GH_TOKEN = requireEnv("GH_TOKEN");
const GH_API_URL = requireEnv("GH_API_URL").replace(/\/$/, "");
const REPO = requireEnv("REPO");
const PR_NUMBER = requireEnv("PR_NUMBER");
const COMMIT_SHA = requireEnv("COMMIT_SHA");

const diff = readFileSync("/tmp/pr.diff", "utf-8");
const specs = (() => {
  try { return readFileSync("/tmp/specs.txt", "utf-8"); } catch { return ""; }
})();

if (!diff.trim()) {
  console.log("Empty diff, skipping review.");
  process.exit(0);
}

const MAX_DIFF_CHARS = 120_000;
const truncatedDiff =
  diff.length > MAX_DIFF_CHARS ? `${diff.slice(0, MAX_DIFF_CHARS)}\n...[truncated]` : diff;

async function gh(path, init = {}) {
  return fetch(`${GH_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function ghJson(path) {
  const res = await gh(path);
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

async function fetchExistingBotComments() {
  const inline = await ghJson(`/repos/${REPO}/pulls/${PR_NUMBER}/comments?per_page=100`);
  const issueComments = await ghJson(`/repos/${REPO}/issues/${PR_NUMBER}/comments?per_page=100`);
  const isBot = (u) => u?.login === "github-actions[bot]";

  const inlineBot = inline
    .filter((c) => isBot(c.user))
    .map((c) => ({
      path: c.path || null,
      line: c.line ?? c.original_line ?? null,
      body: c.body || "",
    }));
  const issueBot = issueComments
    .filter((c) => isBot(c.user) && /AI Review/i.test(c.body || ""))
    .map((c) => ({ path: null, line: null, body: c.body || "" }));

  return [...inlineBot, ...issueBot];
}

function norm(s) {
  return String(s || "")
    .replace(/\*\*\[(critical|warning|suggestion)\]\*\*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isDuplicate(finding, existing) {
  const fBody = norm(finding.body);
  if (!fBody) return true;
  return existing.some((e) => {
    const samePath = (e.path || null) === (finding.path || null);
    const sameLine = (e.line || null) === (finding.line || null);
    const eBody = norm(e.body);
    if (samePath && sameLine && eBody === fBody) return true;
    if (samePath && sameLine && fBody.length >= 40 && (eBody.includes(fBody) || fBody.includes(eBody))) return true;
    return false;
  });
}

const systemPrompt = `You are a senior engineer reviewing a pull request.

Review guidelines:
- Identify correctness issues, bugs, and edge cases.
- Flag security, performance, and reliability risks.
- Check for clarity, maintainability, and consistency.
- Ensure changes align with existing architecture and patterns.
- Focus ONLY on changed code. Do not summarize the PR.
- Avoid style-only feedback unless it impacts readability or safety.
- Be concise. Only report actionable findings.
- DO NOT repeat any feedback already listed under "Existing AI review comments".

Output: Return ONLY a valid JSON object (no prose, no code fences) with shape:
{
  "findings": [
    {
      "path": "file path relative to repo root or null",
      "line": 123 or null,
      "body": "review comment markdown",
      "severity": "critical" | "warning" | "suggestion"
    }
  ]
}

If no new findings: {"findings": []}`;

function buildUserPrompt(existing) {
  const existingBlock = existing.length
    ? existing
        .slice(0, 50)
        .map((e, i) => `${i + 1}. [${e.path || "general"}${e.line ? `:${e.line}` : ""}] ${norm(e.body).slice(0, 400)}`)
        .join("\n")
    : "(none)";

  return `## Specs / Context
${specs.slice(0, 20_000)}

## Existing AI review comments (do NOT repeat these)
${existingBlock}

## PR Diff
\`\`\`diff
${truncatedDiff}
\`\`\`

Review this PR and return JSON only.`;
}

function runOpencode(prompt) {
  const model = `azure/${AZURE_DEPLOYMENT}`;
  console.log(`Invoking opencode run --model ${model} (prompt ${prompt.length} chars)`);

  const result = spawnSync("opencode", ["run", "--model", model, prompt], {
    encoding: "utf-8",
    env: { ...process.env, AZURE_API_KEY },
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.error) throw new Error(`Failed to spawn opencode: ${result.error.message}`);
  if (result.status !== 0) {
    console.error("opencode stderr:", result.stderr);
    throw new Error(`opencode exited with status ${result.status}`);
  }
  return result.stdout || "";
}

function extractJson(text) {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch {}
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return JSON.parse(trimmed.slice(first, last + 1)); } catch {}
  }
  return null;
}

function toSeverity(v) {
  const s = String(v || "").toLowerCase();
  return s === "critical" || s === "warning" || s === "suggestion" ? s : "suggestion";
}

function normalizeFindings(parsed) {
  const list = Array.isArray(parsed) ? parsed : parsed?.findings;
  if (!Array.isArray(list)) return [];
  return list
    .filter((f) => f && typeof f === "object" && typeof f.body === "string")
    .map((f) => ({
      path: typeof f.path === "string" && f.path.trim() ? f.path.trim() : null,
      line: Number.isInteger(f.line) && f.line > 0 ? f.line : null,
      body: f.body.trim(),
      severity: toSeverity(f.severity),
    }))
    .filter((f) => f.body.length > 0);
}

// ── main ─────────────────────────────────────────────────────────────────────

const existing = await fetchExistingBotComments();
console.log(`Found ${existing.length} existing bot comment(s) on PR #${PR_NUMBER}`);

const userPrompt = buildUserPrompt(existing);
const stdout = runOpencode(`${systemPrompt}\n\n${userPrompt}`);
const parsed = extractJson(stdout);

if (!parsed) {
  console.error("Could not parse JSON from opencode output. Raw output:\n", stdout);
  process.exit(1);
}

let findings = normalizeFindings(parsed);
console.log(`Model returned ${findings.length} raw finding(s).`);

const before = findings.length;
findings = findings.filter((f) => !isDuplicate(f, existing));
console.log(`After dedup vs existing comments: ${findings.length} (removed ${before - findings.length})`);

writeFileSync("/tmp/review-findings.json", JSON.stringify({ findings }, null, 2), "utf-8");

if (findings.length === 0) {
  console.log("No new findings to post.");
  process.exit(0);
}

const inlineComments = findings
  .filter((f) => f.path && f.line)
  .map((f) => ({ path: f.path, line: f.line, body: `**[${f.severity}]** ${f.body}` }));

const generalComments = findings.filter((f) => !f.path || !f.line);

const reviewBody =
  generalComments.length > 0
    ? "## AI Review\n\n" + generalComments.map((f) => `- **[${f.severity}]** ${f.body}`).join("\n")
    : "## AI Review\n\nSee inline comments.";

const reviewRes = await gh(`/repos/${REPO}/pulls/${PR_NUMBER}/reviews`, {
  method: "POST",
  body: JSON.stringify({
    commit_id: COMMIT_SHA,
    event: "COMMENT",
    body: reviewBody,
    comments: inlineComments,
  }),
});

if (!reviewRes.ok) {
  console.error("GitHub review API error:", reviewRes.status, await reviewRes.text());
  const fallback = await gh(`/repos/${REPO}/issues/${PR_NUMBER}/comments`, {
    method: "POST",
    body: JSON.stringify({
      body: `${reviewBody}\n\n(Inline review post failed, fallback to issue comment.)`,
    }),
  });
  if (!fallback.ok) {
    console.error("Fallback issue comment also failed:", fallback.status, await fallback.text());
    process.exit(1);
  }
  console.log("Fallback issue comment posted.");
  process.exit(0);
}

console.log("Review posted successfully.");
