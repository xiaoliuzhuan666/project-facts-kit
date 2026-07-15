# Token Measurement and CLI

Read this reference only for capability status, context-size measurement, token savings claims, A/B session evidence, generated ai-context-kit maintenance, or CLI conflicts.

## Evidence Rules

1. Separate static context-size comparisons from real task session usage.
2. Use `tokens`, `summary`, and `dashboard` for static context comparisons.
3. Use comparable Codex session or `codex exec --json` events for real task usage.
4. Do not report a real-task savings percentage unless both groups have comparable prompts, measured token data, and a task-quality record.
5. When group-level session data is absent, report real-task savings as `unknown`.
6. Keep quality evidence separate from savings evidence: checked files, contract coverage, verification results, missed items, and quality change status.
7. Do not claim accuracy preservation from static measurements alone.
8. Redact personal paths, prompts, headers, credentials, cookies, emails, phone numbers, and URL passwords before sharing logs or reports.

## Capability Status

Use `doctor` and `token-status` to distinguish:

- Low-token artifacts and contract-index readiness.
- CodeGraph status for named repositories.
- Static token report and dashboard presence.
- Observe hook and real session usage availability.
- Optional graph, A/B, and redaction capabilities.

Treat every suggested capability command as optional until the user or repository authorizes its writes.

## Common Commands

```bash
ai-context-kit inspect --workspace <parent-or-repo>
ai-context-kit doctor --workspace <parent-or-repo>
ai-context-kit onboard --workspace <parent-or-repo>
ai-context-kit upgrade --workspace <parent-or-repo>
ai-context-kit agents --workspace <parent-or-repo>
ai-context-kit repair --workspace <parent-or-repo>
ai-context-kit init --workspace <parent-or-repo>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol> --frontend-repo <repo>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol> --backend-repo <repo>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol> --related <topic>
ai-context-kit measure --workspace <parent-or-repo>
ai-context-kit tokens --workspace <parent-or-repo>
ai-context-kit summary --workspace <parent-or-repo>
ai-context-kit dashboard --workspace <parent-or-repo>
ai-context-kit token-status --workspace <parent-or-repo>
ai-context-kit token-status --workspace <parent-or-repo> --json --output <status.json>
ai-context-kit editor-tasks --workspace <parent-or-repo>
ai-context-kit codex-mem route --workspace <parent-or-repo> --query <text>
ai-context-kit codex-mem install-hooks --workspace <parent-or-repo> --mode observe
ai-context-kit codex-mem sessions --workspace <parent-or-repo>
ai-context-kit codex-mem exec-events --workspace <parent-or-repo> --events <events.jsonl>
ai-context-kit real-task-audit --workspace <parent-or-repo>
ai-context-kit redact --input <file> --output <file>
ai-context-kit codegraph --workspace <parent-or-repo> --repos <repo-name>
```

The `project-facts-kit context` prefix accepts the same context commands.

When `ai-context-kit` is not on `PATH`, use:

```bash
node ~/.cache/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs <command> --workspace <path>
```

Do not use `--force` unless the user explicitly requests regeneration. Use observe hooks only after initialization and only when long-term session measurement is requested.

## A/B Validation

- Use the repository's real-task A/B template when present.
- Record the prompt, groups, artifact status, files read, contract coverage, verification, token data, session status, and missed items.
- Treat isolated route, search, or contract hits as partial evidence rather than a complete task comparison.
- After changing A/B records, rerun `real-task-audit` and report refreshed counted and missing states.

## Measurement Output

- Report the dashboard path, generated timestamp, command used, baseline tokens, selected-context tokens, and savings percentage for static measurements.
- `tokens` uses the pinned `repomix@1.16.1` package with its default security scan; record missing `npx` or Repomix as `Not run`.
- Mark missing session events or quality records as `unknown`.
- Do not infer runtime session savings from the static dashboard.
