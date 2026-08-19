# PILOT PROJECT: PR #42 as a Dark Factory
## What we tested, how OpenCode was configured, and how the factory ran inside GitHub Actions

---

### [Slide 1] Framing
The rules cache was the test payload. The pilot evaluated the delivery factory around it.

* **DARK FACTORY**: SPEC -> BUILD -> REVIEW -> FIX -> GATE
* BEAM UI / August 2026

---

### [Slide 2] PATTERN: What is a dark factory?
A software delivery system for routine work—not an invisible or ungoverned AI merge button.

* **SPECIFICATION -> IMPLEMENTATION -> VALIDATION -> REVIEW + FIX -> HUMAN DECISION**
* **Guardrails**: Permissions, file scope, timeouts, risk gates, and exact-SHA handoffs.
* **Artifacts**: Prompts, plans, findings, commits, replies, and test results make the work observable.
* **Exceptions**: Humans decide on ambiguity, risk acceptance, and consequential changes.
* *“Dark” means routine work runs in the background with minimal intervention—not that the process is invisible or unaccountable.*

---

### [Slide 3] OBJECTIVE: Test the factory, not the feature
The experiment asked whether repository structure and workflow design could make AI delivery observable.

1. **Receive**: Versioned implementation spec
2. **Implement**: Change the PR branch
3. **Review**: Generate structured findings
4. **Fix**: Apply bounded changes for exact SHA
5. **Report**: Push commits and replies
* **Success criteria**: Handoffs work • outputs are observable • humans can see where judgment is still required

---

### [Slide 4] TEST PAYLOAD: A small, explicit BEAM UI change
The cache made the agent behavior easy to inspect without introducing a large product change.

* **Cache store**: Module-level in-memory Map.
* **TTL**: 30 seconds; `CACHE_TTL_MS = 30_000`.
* **Read/write**: `getRules()` reads valid entries and writes successes.
* **Invalidation**: Clear after create, update, and delete.
* **Error rule**: Failed GET must not populate cache.
* **Boundaries**: No persistence, cross-tab state, or other services.
* *The payload was narrow by design. The experiment was the implementation / review / fix loop around it.*

---

### [Slide 5] SPEC → RESULT: What the caching spec produced
The requirements mapped to observable service behavior and explicit exports.

* **Cache store**: `rulesCache` Map in `rules.service.ts`
* **Stable key**: Sorted params → `URLSearchParams`
* **30-second TTL**: `CACHE_TTL_MS = 30_000;` expired entries refetch
* **Read before HTTP**: Fresh cached `Rule[]` returned without GET
* **Write after success**: HTTP errors never populate the cache
* **Mutation invalidation**: `clearRulesCache()` after create/update/delete
* **Public helpers**: Exports added in `src/services/index.ts`
* *Functional result: reuse rules for 30 seconds; mutations force the next read to fetch fresh data.*

---

### [Slide 6] ARCHITECTURE: Dark-factory flow in PR #42
Two workflows, three agent roles, and a human merge decision.

* **PR EVENT**: opened • synchronize • ready_for_review
* **SPEC IMPLEMENT**: detect root `specs/` → OpenCode → implementation commit
* **REVIEW**: diff + `docs/specs` → direct Azure → SHA-linked findings
* **FIX**: exact-SHA comments → OpenCode → fix commit + replies
* **Human gate**: Generated commits and findings are inputs to engineering judgment—not automatic approval.

---

### [Slide 7] RUNTIME: How OpenCode runs inside GitHub
It is installed and executed on the ARC runner; it is not a hosted service and does not require Docker.

```bash
npm install --prefix "$RUNNER_TEMP/opencode" opencode-ai \
  --no-audit --no-fund

echo "$RUNNER_TEMP/opencode/node_modules/.bin" >> "$GITHUB_PATH"

opencode --version
opencode run \
  --model "azure-cognitive-services/$AZURE_OPENAI_DEPLOYMENT" \
  --title "PR #42 AI review fix" \
  --dangerously-skip-permissions \
  "$prompt"
```

* **Wrapper owns the workflow**: The Node wrapper handles GitHub API calls, file selection, prompts, git identity, commits, pushes, and review replies. OpenCode is the bounded edit engine.
* **Runner conditions**: ARC runner, Node 22 for review, runtime-installed opencode-ai, persistent checkout credentials for the fix/implement jobs.

---

### [Slide 8] CONFIGURATION: OpenCode configuration is injected at runtime
PR #42 builds JSON in `opencodeConfig()` and passes it through `OPENCODE_CONFIG_CONTENT`.

```json
{
  "model": "azure-cognitive-services/<deployment>",
  "agent": { "build": { "steps": 10 } },
  "provider": {
    "azure-cognitive-services": {
      "options": {
        "baseURL": "<endpoint>/openai",
        "apiVersion": "<version>",
        "useDeploymentBasedUrls": true,
        "timeout": 600000,
        "chunkTimeout": 120000
      }
    }
  }
}
```

* **No committed `opencode.json` is required.**
* **Model**: Azure Cognitive Services deployment
* **Endpoint**: `${AZURE_API_BASE}/openai`
* **Timeout**: 600s provider / 120s chunk
* **Context**: 128k input / 8k output
* **Reproducibility**: auto-update, prune, default plugins, and LSP downloads disabled

---

### [Slide 9] BOUNDS: What the OpenCode settings are trying to control
The configuration defines the intended agent envelope; the wrapper defines the actual file and commit envelope.

* **Build steps: 10**: A maximum tool/planning budget for the build agent. It is a cap, not a promise that ten steps will run.
* **Model capabilities**: `reasoning=true`, `tool_call=true`, `temperature=false`, completion URLs, 128k context, 8k output.
* **Intended permissions**: read/edit/glob/grep/list allowed; bash/webfetch/websearch denied.
* **PILOT CAVEAT**: The command also passes `--dangerously-skip-permissions`. That can undermine the configured deny policy. Before scaling, replace it with an enforceable permission model and verify the effective policy in a runner.

---

### [Slide 10] OPERATIONS: How to change the pilot configuration
Configuration changes are split between GitHub settings, wrapper scripts, and workflow YAML.

* **Model / endpoint**: GitHub variables: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_DEPLOYMENT`; secret: `AZURE_OPENAI_API_KEY`.
* **OpenCode behavior**: Edit `opencodeConfig()` in `pr-fix.mjs` and `pr-implement.mjs`: steps, limits, timeouts, provider, permissions.
* **Agent scope**: Edit `MAX_FILES`, `MAX_COMMENTS`, spec budgets, and `buildPrompt()`; keep selected files and staged files aligned.
* **When it runs**: Edit `on.pull_request.types`, target branches, `runs-on`, permissions, concurrency, and job needs in workflow YAML.
* *A workflow change is what makes a new configuration execute on the next PR event.*

---

### [Slide 11] SEPARATION: The deterministic review path
The most important reliability decision in PR #42: review is not an OpenCode run.

* **Review Path**: Node 22 (Known runtime) -> SHA dedupe -> Skip already-reviewed commits -> Diff + specs (Input context) -> Direct `fetch()` -> One Azure request -> Strict JSON -> Structured findings -> GitHub review (Inline comments)
* **REVIEW**: Direct Azure Chat Completions
* **OUTPUT**: SHA-linked line findings
* *Review = direct, deterministic HTTP*
* *Implementation/fix = bounded, agentic OpenCode run*

---

### [Slide 12] PR-REVIEW-AGENT BRANCH: Hardening the review/fix handoff
I focused on the `pr-review-agent` branch and made the review-to-fix loop more reliable and observable.

* **What I changed**
  * Review writes machine-readable findings to `/tmp/review-findings.json`.
  * The workflow reads `hasFindings` before deciding whether to trigger fix.

* **Why it matters**
  * Fix dispatch only runs when actionable findings exist.
  * Missing workflow path or failed dispatch now surfaces clearly instead of being swallowed.
  * This makes the handoff easier to trust and debug.

* **Code evidence**
```yaml
- name: Read review findings summary
  id: findings
  run: |
    has_findings=$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync("/tmp/review-findings.json","utf8")); process.stdout.write(p.hasFindings ? "true" : "false")')
    echo "has_findings=$has_findings" >> "$GITHUB_OUTPUT"
```

```bash
if [ "${http_code}" != "204" ]; then
  echo "Failed to dispatch pr-fix workflow. HTTP ${http_code}"
  cat /tmp/dispatch.out
  exit 1
fi
```

* *This turned the review/fix boundary into a reusable team pattern rather than a one-off script.*

---

### [Slide 13] RESULTS: What the pilot actually produced
A small test commit exercised the full handoff.

* `70125e5`: Small documentation test commit
* `1205418`: PR Review Agent: success
* `1367797`: 4 inline findings created
* `e49286a`: OpenCode fix commit
* `2 replies`: Fix replies posted
* `1205419`: Spec Implement Agent: success
* `24b0a09`: Follow-up implementation commit
* **OBSERVED**: Review ~1m 47s | Spec implementation ~2m | Final PR head: `24b0a09`
* *Two automation paths ran from one PR event.*

---

### [Slide 14] CONCLUSION: PR #42 is a viable pilot architecture
It validates the plumbing, not autonomous ownership of production changes.

* **Proven**: Versioned specs can trigger implementation; direct review can create line findings; exact-SHA handoff can drive OpenCode fixes; the runner can push traceable commits.
* **Still required**: Human review of generated changes; workflow-safety fixes; clean workspace controls; pinned tools; and an enforceable permission model.
* **Recommended standard**: Direct Azure review + bounded OpenCode mutation + exact-SHA artifacts + human merge gate
* *The cache was the payload. The repeatable factory is the product.*
