---
name: low-token-context-maintainer
description: Keep coding agents on a focused context path in ambiguous, cross-repository, or large workspaces. Use for project-facts-kit first adoption or “首次接入”, generated context upgrades or “已接入升级”, daily Skill feedback routing or “开启每日反哺候选”, local kit preparation, choosing an unclear child repository, cross-repository route or contract mapping, doctor capability review, and token measurement. When the repository and local page, file, or symbol are already named, use the fast local fix path only; do not run the full workflow merely because the parent folder contains multiple repositories.
---

# Low Token Context Maintainer

Choose a mode before reading source. Load only the reference required by that mode.

User-facing entry phrases include:

- First adoption: `帮我做项目事实 kit 首次接入。`
- Existing project upgrade: `帮我做项目事实 kit 已接入升级，不覆盖已有事实。`
- Daily feedback automation: `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。`
- Local kit preparation: `帮我从远端获取项目事实 kit，并准备好本机 Skill 和 CLI。`

## Mode Selection

Use the first matching mode:

1. **Fast local fix**: the repository and page, file, route, component, or symbol are named; the change is local; no cross-repository contract or high-risk state is involved.
2. **Cross-repository contract**: the task involves endpoints, request or response fields, DTOs, mappers, order state, payment, booking, inventory, refund, settlement, or another client/server boundary. Read [references/cross-repository-contracts.md](references/cross-repository-contracts.md).
3. **Full workspace**: the target repository is unclear, the user requests first adoption, upgrade, workspace initialization, migration, domain audit, or daily feedback routing, or generated context artifacts need maintenance. Read [references/workspace-workflows.md](references/workspace-workflows.md).
4. **Token measurement**: the user asks about context size, token savings, capability status, A/B sessions, dashboards, or ai-context-kit CLI usage. Read [references/token-measurement-and-cli.md](references/token-measurement-and-cli.md).

Do not read every reference. Escalate from the fast path only when source evidence requires it.

## Fast Local Fix Path

Use this path when all of the following are true:

- The target repository is explicit or can be inferred without a workspace-wide search.
- The user names a page, file, component, route, symbol, screenshot, or exact visible behavior.
- The expected change is local and reversible.
- The task does not depend on an API contract, another repository, order or payment state, deployment, permissions, data migration, or an unresolved business rule.

Then:

1. Enter the named repository and read its `AGENTS.md`. Do not reopen parent maps or generated workspace documents when the supplied context already identifies the repository.
2. Check `git status --short`, then use exact `rg` searches inside the named path or direct component directory.
3. Limit the first pass to 3-4 source-reading calls or parallel read batches: the target page or file, its direct component, one necessary condition or configuration source, and one existing reference implementation only when needed.
4. Combine independent read-only checks. Do not start a subagent for a routine local lookup unless the first pass leaves a real ambiguity.
5. Edit only the target repository and preserve unrelated worktree changes.
6. Run the fastest meaningful verification: `git diff --check`, a targeted syntax check, a focused unit test, or the available target build. State any runtime or device check that was not run.

Do not invoke `project-facts-maintainer` or update project facts solely for copy, visibility, spacing, styling, or a local UI condition. Use it when the user or repository explicitly requires a record, or when the change affects an API contract, business state, money, permissions, migration, release behavior, or handoff evidence.

## Escalation Signals

Leave the fast path only when one of these appears:

- The target repository cannot be identified from the request and lightweight markers.
- The changed behavior crosses repositories or depends on an endpoint, DTO, mapper, event, or shared state transition.
- The task touches orders, payments, booking, inventory, settlement, refunds, authentication, permissions, deployment, or data migration.
- Generated maps and source evidence disagree.
- The named files do not prove the condition needed for a safe change.

State the reason for escalation, then read only the matching reference.

## Core Guardrails

- Never search all child repositories from a parent folder unless the task genuinely spans them.
- Prefer exact `rg` queries and short line windows over full indexes or package-wide scans.
- Treat generated maps, CodeGraph, contract indexes, and capability reports as routing aids, not runtime proof or permission to write.
- Respect the target repository's `AGENTS.md` and dirty worktree.
- Do not read secrets, credentials, certificates, `.env*`, `application*.yml`, `node_modules`, `target`, `dist`, `build`, `unpackage`, `.codegraph`, minified files, or large SQL archives unless the task explicitly requires them.
- Do not claim measured token savings, successful builds, runtime behavior, or quality preservation without corresponding evidence.

## References

- [references/cross-repository-contracts.md](references/cross-repository-contracts.md): endpoint routing, DTO and field checks, state-path scope, and tool conflicts.
- [references/workspace-workflows.md](references/workspace-workflows.md): first adoption, upgrades, parent workspace intake, generated artifacts, migrations, automation routing, and domain audits.
- [references/token-measurement-and-cli.md](references/token-measurement-and-cli.md): capability status, static and session token evidence, A/B records, CLI commands, and redaction.

## Boundaries

- Control context selection and reading scope; do not approve product intent.
- Prefer source evidence over generated summaries.
- Keep broader findings as follow-up items unless they make the requested change unsafe.
- Never commit CodeGraph indexes, temporary Repomix output, local usage logs, or secrets.
