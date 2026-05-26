#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const MAX_TOTAL = 120_000;
const MAX_PER_FILE = 12_000;

function sh(command) {
  return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated]`;
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function gatherByPattern(pattern) {
  try {
    const out = sh(`git ls-files '${pattern}'`);
    if (!out) return [];
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function buildSpecsContext() {
  const patterns = [
    "docs/specs/**/*.md",
    "docs/specs/**/*.txt",
    "specs/**/*.md",
    "specs/**/*.txt",
    "openapi/**/*.yml",
    "openapi/**/*.yaml",
    "openapi/**/*.json",
    "agent-rules/**/*.md",
    "README.md",
    ".github/**/*.md",
  ];

  const files = [...new Set(patterns.flatMap(gatherByPattern))];

  let payload = "## Specs / Context\n";
  for (const file of files) {
    if (!existsSync(file)) continue;
    const content = safeRead(file);
    if (!content) continue;

    payload += `\n### ${file}\n\`\`\`\n${truncate(content, MAX_PER_FILE)}\n\`\`\`\n`;
    if (payload.length >= MAX_TOTAL) break;
  }

  return truncate(payload, MAX_TOTAL);
}

function buildDiff() {
  const base = process.env.PR_BASE_SHA?.trim();
  const head = process.env.PR_HEAD_SHA?.trim() || process.env.COMMIT_SHA?.trim() || "HEAD";

  try {
    if (base) {
      return sh(`git --no-pager diff --no-color ${base}...${head}`);
    }
    return sh("git --no-pager diff --no-color HEAD~1...HEAD");
  } catch {
    return "";
  }
}

const diff = buildDiff();
const context = buildSpecsContext();

writeFileSync("/tmp/pr.diff", diff || "", "utf8");
writeFileSync("/tmp/specs.txt", context || "No specs found.", "utf8");

console.log(`Context prepared: diffChars=${diff.length}, specsChars=${context.length}`);
