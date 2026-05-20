import { readFileSync } from "fs";

function getEnv(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

const AZURE_OPENAI_API_KEY = getEnv("AZURE_OPENAI_API_KEY");
const AZURE_OPENAI_ENDPOINT = getEnv("AZURE_OPENAI_ENDPOINT");
const AZURE_OPENAI_DEPLOYMENT = getEnv("AZURE_OPENAI_DEPLOYMENT");
const AZURE_OPENAI_API_VERSION = getEnv("AZURE_OPENAI_API_VERSION", "2024-10-21");
const GH_TOKEN = getEnv("GH_TOKEN");
const GH_API_URL = getEnv("GH_API_URL");
const REPO = getEnv("REPO");
const PR_NUMBER = getEnv("PR_NUMBER");
const COMMIT_SHA = getEnv("COMMIT_SHA");

function required(name, value) {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function toSeverity(value) {
  const s = String(value || "").toLowerCase();
  if (s === "critical" || s === "warning" || s === "suggestion") return s;
  return "suggestion";
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

async function postIssueComment(body) {
  const url = `${GH_API_URL}/repos/${REPO}/issues/${PR_NUMBER}/comments`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${GH_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub issue comment error: ${res.status} ${text}`);
  }
}

required("AZURE_OPENAI_API_KEY", AZURE_OPENAI_API_KEY);
required("AZURE_OPENAI_ENDPOINT", AZURE_OPENAI_ENDPOINT);
required("AZURE_OPENAI_DEPLOYMENT", AZURE_OPENAI_DEPLOYMENT);
required("GH_TOKEN", GH_TOKEN);
required("GH_API_URL", GH_API_URL);
required("REPO", REPO);
required("PR_NUMBER", PR_NUMBER);
required("COMMIT_SHA", COMMIT_SHA);

const diff = readFileSync("/tmp/pr.diff", "utf-8");
const specs = readFileSync("/tmp/specs.txt", "utf-8");

if (!diff.trim()) {
  console.log("Empty diff, skipping review.");
  process.exit(0);
}

const MAX_CHARS = 120_000;
const truncatedDiff =
  diff.length > MAX_CHARS ? `${diff.slice(0, MAX_CHARS)}\n...[truncated]` : diff;


const systemPrompt = `You are a senior engineer reviewing a pull request.

Review guidelines:
- Identify correctness issues, bugs, and edge cases.
- Flag security, performance, and reliability risks.
- Check for clarity, maintainability, and consistency.
- Ensure changes align with existing architecture and patterns.
- Focus ONLY on changed code. Do not summarize the PR.
- Avoid style-only feedback unless it impacts readability or safety.
- Be concise. Only report actionable findings.

Return STRICT JSON with shape:
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

If no findings:
{ "findings": [] }`;

const userPrompt = `## Specs / Context
${specs.slice(0, 20_000)}

## PR Diff
\`\`\`diff
${truncatedDiff}
\`\`\`

Review this PR and return JSON only.`;

const endpointUrl = new URL(AZURE_OPENAI_ENDPOINT);
const chatUrl = new URL(endpointUrl.origin);
chatUrl.pathname = `/openai/deployments/${encodeURIComponent(AZURE_OPENAI_DEPLOYMENT)}/chat/completions`;
chatUrl.searchParams.set("api-version", AZURE_OPENAI_API_VERSION);

const response = await fetch(chatUrl.toString(), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-key": AZURE_OPENAI_API_KEY,
  },
  body: JSON.stringify({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  }),
});

if (!response.ok) {
  console.error("LLM API error:", response.status, await response.text());
  process.exit(1);
}

const data = await response.json();
const content = data.choices?.[0]?.message?.content ?? '{"findings":[]}';

let findings;
try {
  const parsed = JSON.parse(content);
  findings = normalizeFindings(parsed);
} catch {
  console.error("Failed to parse LLM response:", content);
  findings = [
    {
      path: null,
      line: null,
      body: "Model returned invalid JSON. Please rerun review.",
      severity: "suggestion",
    },
  ];
}

console.log(`Found ${findings.length} review finding(s).`);

if (findings.length === 0) {
  console.log("No findings, skipping comment.");
  process.exit(0);
}


const inlineComments = findings
.filter((f) => f.path && f.line)
.map((f) => ({
  path: f.path,
  line: f.line,
  body: `**[${f.severity}]** ${f.body}`,
}));

const generalComments = findings.filter((f) => !f.path || !f.line);

const reviewBody =
  generalComments.length > 0
    ? "## AI Review\n\n" +
    generalComments.map((f) => `- **[${f.severity}]** ${f.body}`).join("\n")
    : "## AI Review\n\nSee inline comments.";

const reviewPayload = {
  commit_id: COMMIT_SHA,
  event: "COMMENT",
  body: reviewBody,
  comments: inlineComments,
};

let ghResponse = await fetch(`${GH_API_URL}/repos/${REPO}/pulls/${PR_NUMBER}/reviews`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `token ${GH_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
  body: JSON.stringify(reviewPayload),
});

if (!ghResponse.ok) {
  const errText = await ghResponse.text();
  console.error("GitHub review API error:", ghResponse.status, errText);

  // Fallback: post a regular PR comment so signal is not lost.
  await postIssueComment(`${reviewBody}\n\n(Inline comment post failed, fallback to issue comment.)`);
  console.log("Fallback issue comment posted.");
  process.exit(0);
}

console.log("Review posted successfully.");
