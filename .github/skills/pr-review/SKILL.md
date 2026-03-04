---
name: pr-review
description: High-signal pull request review by a senior engineer. Use this when asked to review a pull request, review code changes, or review a diff.
---

# Skill: Pull Request Review

## Description

Act as a senior engineer performing a high-signal pull request review for this project.
Trigger this skill when asked to review a pull request, review code changes, or review a diff.

## Instructions

When reviewing a pull request, spawn two parallel review agents and collate their findings into one final review.

### Agent setup

Spawn two sub-agents in parallel using the `task` tool (agent_type: "general-purpose"), each performing an independent review of the same diff:

1. **Agent 1** — model: `claude-sonnet-4.6` (latest Sonnet)
2. **Agent 2** — model: `gpt-5.3-codex` (latest Codex)

Each agent must receive the full diff/changed files as context and apply all review guidelines below independently.

### Collation

After both agents complete, merge their findings into a single review output:

- Deduplicate identical or near-identical findings (keep one instance).
- For findings raised by only one model, retain them and attribute the source.
- For findings raised by both models, attribute both: `[claude-sonnet-4.6, gpt-5.3-codex]`.
- Each finding must carry an attribution tag at the end of the bullet in the form: `— *claude-sonnet-4.6*`, `— *gpt-5.3-codex*`, or `— *claude-sonnet-4.6, gpt-5.3-codex*`.

When reviewing a pull request, follow the guidelines below.

### Review goals

- Identify correctness issues, bugs, and edge cases.
- Flag security, performance, and reliability risks.
- Check for clarity, maintainability, and consistency.
- Ensure changes align with existing architecture and patterns.
- Do not recommend large rewrites unless the approach is fundamentally broken or poses a clear safety risk.

### Review scope

- Focus ONLY on the files changed in the pull request.
- Do not restate obvious diffs or summarize the PR.
- Avoid style-only feedback unless it impacts readability or safety.

### What to comment on

- Logic errors or missing cases.
- Unsafe assumptions or race conditions.
- Error handling gaps.
- API contract or backward-compatibility risks.
- Test coverage gaps (what should be tested and why).
- Configuration, migration, or rollout risks.

### What NOT to comment on

- Minor formatting or subjective preferences.
- Hypothetical refactors not required by the change.

### Comment style
### Comment style

- Be concise and specific.
- Reference exact lines or functions when possible.
- Use actionable language (what to change and why).
- Prefer suggestions over commands.
- Do not use emojis anywhere in comments or output.

### Output format

- Group feedback by file.
- Use bullet points.
- Clearly label severity where applicable:
  - **Blocker**
  - **Concern**
  - **Suggestion**
- Attribute each finding with the model(s) that raised it: `— *claude-sonnet-4.6*`, `— *gpt-5.3-codex*`, or `— *claude-sonnet-4.6, gpt-5.3-codex*`.
- End the review with a brief **Summary** section noting any patterns or themes observed across both models' findings.
