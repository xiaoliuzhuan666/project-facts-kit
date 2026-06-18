---
name: low-token-context-maintainer
description: Keep Codex and other coding agents inside a low-token context path when onboarding to multi-repo workspaces, parent-folder project collections, large legacy repositories, first-adopting project-facts-kit or “首次接入”, upgrading generated ai-context-kit files or “已接入升级”, or routing daily Skill feedback automation from a workspace for “开启每日反哺候选”. Use when reducing agent token cost, selecting the right child repository, measuring token usage, checking doctor capability status, or deciding what source files an agent should read first.
---

# Low Token Context Maintainer

Use this workflow to keep an agent from reading an entire parent directory or large repository before it knows the real task scope.

## Workflow

User-facing entry phrases that may use this skill:

- First adoption: `帮我做项目事实 kit 首次接入。`
- Existing project upgrade: `帮我做项目事实 kit 已接入升级，不覆盖已有事实。`
- Daily feedback automation: `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。`
- Local kit preparation: `帮我从远端获取项目事实 kit，并准备好本机 Skill 和 CLI。`

1. Confirm whether the current folder is a single repository or a parent workspace containing multiple Git repositories.
2. If a parent `AGENTS.md` exists, read it before searching source files. If it does not exist, do not treat that as permission to search broadly.
3. Read `docs/ai-context-kit-operating-workflow.zh-CN.md`, `docs/ai-context-workspace-map.md`, and `docs/ai-context-scope-report.md` when present.
4. Run `ai-context-kit onboard --workspace <path>` when available for a first intake. It generates only missing workflow artifacts, then prints `doctor`, `token-status`, and `capability actions`. If writing generated files is not acceptable, run `ai-context-kit doctor --workspace <path>` instead. If `ai-context-kit` is not on `PATH` but the kit is cloned under `~/.cache/project-facts-kit`, run `~/.cache/project-facts-kit/scripts/setup-local-kit.sh` when local setup is requested, or use `node ~/.cache/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs <command> --workspace <path>` and record the fallback. If the kit is not cloned, tell the user to clone or update the internal repository before using project entry phrases.
5. Use `doctor` capability status as the project health check: `low-token artifacts` tells whether routing files are ready; `contract index` tells whether `contracts --query` can be trusted; `CodeGraph` tells whether symbol graph work should be skipped, installed or initialized for named repositories; `static token report`, `token dashboard`, `observe hooks` and `session token usage` tell whether token visibility is measured; `ai-context-graph`, `real-task A/B` and `redact` show optional evidence and sharing helpers.
6. Treat capability commands as recommendations, not automatic permission to change the project. If writing generated files is acceptable, use `ai-context-kit onboard --workspace <path>` for a first setup or `ai-context-kit repair --workspace <path>` to generate only missing AGENTS, ai-context docs, project-facts skeletons, scope report or `.codex-mem/index.jsonl` from the actual repository structure. Existing non-generated instructions and project facts must be preserved. Use `ai-context-kit upgrade --workspace <path>` or `ai-context-kit init --workspace <path>` when generated maps, reports and indexes should be regenerated from the current repository state, or when `doctor` marks an existing contract map as `stale` because it lacks the current `Frontend payload fields` or `Field check` columns. If writing is not acceptable, route from lightweight project markers such as package names, `package.json`, `pom.xml`, `go.mod`, `pages.json`, Controller paths, API wrapper paths, and error filenames, and report that workflow artifacts were not generated.
7. Do not initialize CodeGraph just because the command exists. Use it only when `doctor` reports `CodeGraph: recommended`, `CodeGraph: missing_cli` for a complex target repository, or the current task needs symbol-level queries that precise `rg` cannot answer quickly. Run it for selected repositories with `ai-context-kit codegraph --workspace <path> --repos <repo-name>`.
8. Do not claim token savings from the presence of this skill. Use `doctor` and `token-status` to see whether `tokens`, `dashboard`, observe hooks or session reports exist. Static token reports show context size; real task savings need comparable session or exec-event data plus quality evidence.
9. Pick one main child repository from page names, endpoint paths, package names, logs, or filenames. Ask one short question only when the main repository still cannot be inferred.
10. Read the selected repository's `AGENTS.md`, `project-facts/project.md`, `project-facts/context-boundary.md`, and `project-facts/verification.md` when present.
11. Read full route/API indexes only when the task involves endpoint, page, Controller, or cross-repository field mapping.
12. When `docs/ai-context-api-contract-map.md` exists, do not read it as a long document. First use `ai-context-kit contracts --workspace <parent-or-repo> --query "<endpoint-or-symbol>"`, or run a precise `rg -n "<endpoint|symbol|page|DTO>" docs/ai-context-api-contract-map.md`.
13. If `contracts` returns zero matches but the generated contract map should contain the endpoint, symbol or field, run a precise `rg -n "<endpoint|symbol|page|DTO>" docs/ai-context-api-contract-map.md` before concluding that the route is absent. Record this as a tool conflict when `rg` finds rows that `contracts` missed.
14. In parent workspaces with many apps/services or noisy API wrappers, narrow `contracts` with `--frontend-repo <name>`, `--backend-repo <name>`, or `--related <payment|refund|cancel|device|settlement|booking|inventory|insurance|order>`.
15. When `contracts` prints a same-page related endpoint section, include those endpoint rows in the first pass for order creation, payment start, device state, cancel and failure paths, then read source to confirm actual calls.
16. For cross-repository page, order, payment, booking, inventory, rental, settlement, refund, or insurance tasks, keep a small scenario matrix: page/entry, frontend API wrapper, endpoint, backend Controller/method, request DTO, response DTO/fields, DTO copy/mapper, core Service, state transitions, payment/provider route, and validation/failure/cancel side effects.
17. For field contract questions, compare frontend payload fields with backend request DTOs, response DTOs, and DTO copy/mapping code such as `BeanUtil.copy`, MapStruct, and manual setters. Check top-level fields and nested list/object fields separately.
18. For a backend-only bug on one endpoint or method, do not read `.codex-mem/index.jsonl` or full workspace maps after the target repo and symbol are known. Read the repo `AGENTS.md`, route/contract hit, Controller or handler, request DTO, directly called Service/ServiceImpl, necessary Mapper, response or status DTO, and one adjacent state/payment/device method only when the bug needs it.
19. For backend-only bugs, prefer exact `rg -n "<method|DTO|enum>" <known file-or-package>` and short `nl -ba file | sed -n` windows. Avoid broad DTO/package searches such as scanning all `dto/**` for generic field names; if a broader search is needed, state why and limit it to the smallest package that can answer the question.
20. For post-payment or async state questions, stop at the first method that proves the immediate contract unless the task asks for the full async lifecycle. Record deeper queues, callbacks, write-off, notification, or scheduler checks as follow-up items when they are not needed for the endpoint bug.
21. Treat `contracts` Field check output as a prioritization hint. `required-missing` and `payload-only` should guide source review; they are not runtime proof because interceptors, mappers or service logic may transform fields.
22. For endpoint path questions, compare active frontend URLs with backend route maps and exact-symbol searches for newer, replaced, or still-used old endpoints before reporting a mismatch.
23. For frontend flows, also check missing export/import, empty-data rendering, runtime-only branches, and hard-coded environment/payment configuration. These issues often do not appear in backend DTOs.
24. `contracts` can index common frontend API wrapper patterns, including local path constants, string concatenation, simple template literals, SDK-style calls such as `client.GET('/api/...')`, GraphQL `gql`/`graphql` operations, Next/React-style `actions.ts` files, common `baseURL` / API prefix configuration for relative paths, and top-level payload fields from common page/component calls such as `$http(method, endpoint, data)`, `request({ url, data })`, `axios.post(endpoint, data)` and `client.PATCH(endpoint, { body })`. For framework-specific wrappers, verify with source search as well.
25. Use `rg` or CodeGraph for specific symbols. Do not run broad searches from the parent directory unless the task explicitly spans every child repository.
26. For real A/B validation, use `docs/ai-context-kit-real-task-ab-template.zh-CN.md` when present. A task counts only when it records the prompt, groups, artifact status, files read, contract coverage, verification result, token data, session status and missed items. Single route/search/contracts hits are partial evidence, not a complete task comparison.
27. After editing `docs/real-task-ab/*.md`, rerun `ai-context-kit real-task-audit --workspace <path>` when available and update workflow/status claims from the refreshed counted and missing state, not from supporting logs alone.
28. For first adoption or existing project upgrade, the final user report must include a visible CodeGraph and token visibility section. State CodeGraph status (`skip`, `missing_cli`, `recommended`, or `initialized`), whether static token report and dashboard are present, whether observe hooks are enabled, whether real session usage was generated, which commands were run, and which command remains if the user wants to enable the missing capability.
29. After behavior-changing work, update the target repository's project facts or handover records according to `project-facts-maintainer`.

## Tool Conflict Handling

Use this section when generated artifacts and CLI output disagree.

1. If `doctor` still reports a stale contract map after `init`, inspect the map header directly. When `docs/ai-context-api-contract-map.md` already contains `Frontend payload fields` and `Field check`, do not loop on repeated `init`; record a conflict and continue with precise searches.
2. If a generated map contains rows that `contracts` cannot find, trust neither result by itself. Use exact `rg` hits to route the first source reads, then record the mismatch for tool maintenance.
3. Prefer a short evidence note over repeated scans: command run, expected row or column, actual result, and the fallback used.

## Fast Cross-Repository Fix Mode

Use this mode when the user asks for a concrete fix and already names a target repository, page, route, URL, screenshot, endpoint, or file.

1. Treat the named repository or page as the main scope. If exact file paths for the target and sibling client are already known, open those files first and defer generated maps, `codex-mem route`, `contracts`, or exact `rg` unless the path or endpoint is still ambiguous.
2. Keep the first source pass small: target page or component, direct API wrapper, direct backend Controller/handler or DTO/service adapter, one read-only sibling implementation when it is clearly the same business flow, and one existing target-side reference when needed for style.
3. Compare only the changed request, response, state, or UI branch in the first pass. For payload issues, compare top-level fields and nested object/list fields separately.
4. If backend DTOs or service adapters confirm the contract, avoid tracing the full payment, booking, refund, notification, scheduler, or async lifecycle unless the changed field is carried into that lifecycle.
5. When a working sibling client exists, use it as read-only parity evidence. Route the failing client as the main repository and patch only that client unless backend behavior is also disputed.
6. Turn broader domain questions into recorded follow-ups instead of expanding the investigation, unless they directly affect the changed path or would make the fix unsafe.
7. Run the fastest meaningful verification first, such as `git diff --check`, targeted syntax extraction, unit checks, or the target build. Record live login, payment, device, or third-party checks as `Not run` when they cannot be executed.

## Prototype-Backed Migration Mode

Use this mode when a user provides a prototype link, screen tree, or design document and asks to migrate a feature across child repositories.

1. Read the product/design document and the prototype outline first. Use browser automation only for the specific prototype pages or frame tree, not for broad web browsing.
2. Route source and target repositories from workspace maps, repo names, page/module names and existing project facts. Do not search the parent workspace source tree for the feature.
3. Sanity-check generated repository roles against lightweight markers. A name such as `ticket` or `order` is only a business hint; treat `package.json`, `.vue` files, route files and API wrappers as frontend evidence unless Java Controllers, `pom.xml`, Mapper XML or backend packages prove a backend service.
4. Confirm source and target gaps with targeted path checks: view directories, API directories, shared components, route files, package dependencies and existing utility functions.
5. Copy or port in dependency order: pages, direct APIs, shared components, utility exports, package dependencies, then route/menu entries.
6. For legacy Vue CLI or webpack projects, compare the source repository's installed or locked dependency versions before adding new dependencies. Prefer exact versions known to build in the source project when a newer semver-compatible version fails the target build.
7. Validate migrated imports with an alias-aware scan scoped to the migrated files. A full-repository scan may expose unrelated historical misses; record them separately.
8. Run the target build before declaring the migration ready. If lint fails only because copied legacy modules differ from target formatting rules, record the lint debt and avoid auto-formatting thousands of copied business lines unless the user approves that scope.
9. Document dynamic-menu systems explicitly. If routes come from backend `getRouters()` or similar APIs, record the `component` strings and whether the temporary frontend route is static, hidden, or permission-controlled. Also record the duplicate-menu risk when static frontend routes and backend dynamic menus can both render the same feature.
10. Keep source repository changes read-only unless the user explicitly asks to modify the source.

## Admin Console Routing Hints

When route or contract queries are weak for admin-console tasks:

- Include page names, file names, API wrapper names and business nouns in the route query, for example `activityCalendar calendar/index.js admin console list`.
- If `codex-mem route` is weak but generated maps mention likely wrappers, search generated docs with exact symbols before reading source.
- For frontend admin modules, check route files, dynamic menu component strings, `views/**/index.vue`, and `api/**/index.js` style wrappers before scanning entire packages.

## Parent Workspace Verification Pass

Use this section when preparing a parent workspace for teammates or future model runs.

1. Start at the parent workspace and run `ai-context-kit onboard --workspace <path>` before broad source search when writing generated files is acceptable. Otherwise run `ai-context-kit doctor --workspace <path>`.
2. Read `doctor` capability status and record any `missing`, `stale`, `not_run`, `not_enabled`, `missing_cli` or `recommended` items before changing files. This is the single place to see whether CodeGraph, token reports, observe hooks, graph output, redaction and A/B evidence are actually active.
3. If `doctor` reports missing workflow artifacts, use `onboard`, `agents`, or `repair` to generate only missing materials. If it reports a stale generated contract map or index, use `upgrade` or `init`. Preserve human-authored `AGENTS.md` and non-generated `project-facts/`.
4. Confirm the expected handoff files: parent `AGENTS.md`, `docs/ai-context-workspace-map.md`, `docs/ai-context-api-contract-map.md`, `docs/ai-context-scope-report.md`, child repository `AGENTS.md`, and needed `project-facts/verification.md` plus `project-facts/context-boundary.md`.
5. Run `measure`, `tokens`, `dashboard`, and `token-status` when the tools are available. Record the static token report path, generated timestamp, baseline tokens, selected context tokens, and savings percentage. If `repomix` or `npx` is unavailable, record `Not run` with the reason.
6. For teammate-facing setup or upgrade reports, include the `capability actions` result from `onboard` or `upgrade`, or summarize the same fields from `doctor`: CodeGraph decision, static token report, token dashboard, observe hooks, session usage, and next command.
7. Choose one representative task query and run `codex-mem route` or `contracts` to prove the workflow points to the correct repository, page or API wrapper, Controller or handler, DTO, Service, Mapper, or other first-read files. If routing is weak, record the gap instead of claiming readiness.
8. For cross-end field tasks, check frontend top-level payload fields, nested fields, backend request DTO, response DTO, DTO copy or mapper, current endpoint path, and legacy or replacement paths.
9. Do not commit `.codex-mem/ledger.jsonl`, `.codex-mem/refs`, `.codegraph`, temporary Repomix output, local usage logs, or Markdown containing personal absolute paths.

## Workspace Intake Mode

Use this mode when the user asks to initialize, onboard, index, understand or prepare a project without naming a specific business domain.

1. Do not force a business-domain question at the start. First identify whether the workspace is one repository or a parent folder, then run `doctor` or route from lightweight markers.
2. Generate or repair workflow artifacts only when local instructions allow writing. Preserve existing human-authored instructions and facts.
3. Build a small domain candidate index from existing maps, route names, page names, API wrapper symbols, Controller/handler names, job/consumer names, package/module names and precise `rg` over generated docs. Avoid reading implementation bodies during the first pass unless a marker is ambiguous.
4. For each candidate, record: likely repositories, user/admin/backend entry markers, highest-risk state paths, available verification commands and the first files a future agent should read.
5. Rank candidates by current user intent, business criticality, recent changes, state complexity and verification availability. If intent is still unclear, present the top candidates and ask for one selection.
6. Produce a workspace-level read-first index such as `docs/business-domains/README.md`, `docs/domain-index.md` or `project-facts/domain-index.md`, depending on the existing project structure.
7. Stop after the candidate index unless the user selects a domain or the task clearly asks to continue into one domain. Then switch to Business Domain Audit Mode.

## Automation Workspace Routing

Use this mode when a recurring automation runs from a parent folder or current Codex workspace and needs to find the right business repository.

1. Treat the automation `cwd` as an entry point, not always as the target repository.
2. If it is a parent workspace, read lightweight routing files first: parent `AGENTS.md`, `docs/ai-context-workspace-map.md`, `docs/ai-context-scope-report.md`, and `doctor` output when available.
3. Locate candidate child repositories from `.git`, package manifests, `pom.xml`, `go.mod`, `pages.json`, README titles and `project-facts/`.
4. Route a daily skill-feedback candidate by today's evidence: modified files, recent commit paths, change directories, handover, evidence records, skill-feedback files, performance logs, endpoint names, page names, Controller/DTO/API wrapper names and log paths.
5. For daily change summaries or skill feedback, make a classification table before writing files. Separate committed-today changes, uncommitted diffs, generated `AGENTS.md` or `project-facts/` artifacts, remote sync state, business changes, project-facts evidence, verification results, and reusable skill/tooling candidates. Treat uncommitted diffs as active work, generated facts as process artifacts, and business changes as target-repository facts unless they reveal a reusable workflow or tooling issue.
6. If one repository clearly owns the evidence, write only there. If multiple repositories have separate evidence, create separate candidates. If ownership is unclear, list a confirmation item and do not write into a guessed repository.
7. Use `ai-context-kit automation-prompt --workspace <workspace> --type skill-feedback-candidate` when a Codex app automation prompt is needed. This command prints prompt text only; it does not create the automation.

## Business Domain Audit Mode

Use this mode when the user asks to build reusable investigation material for one business domain such as orders, payments, bookings, inventory, member accounts, coupons, subscriptions, billing, fulfillment, refunds, settlement or notifications.

1. Require a single business domain for the pass. If the user lists many domains, choose the one implied by the current request or ask one short question.
2. Treat the domain name as a routing hint, not as permission to scan the parent workspace. Start with `doctor`, `contracts`, `codex-mem route` and precise `rg` against generated maps, route files, API wrappers, page names and Controller symbols.
3. Produce a reusable read-first report with: user-facing entries, admin/operator entries, backend endpoints, endpoint to wrapper to Controller to DTO/Service/Mapper mapping, field contract risks, active versus legacy paths, relevant state paths, executable verification commands, manual checks and missed items.
4. For state paths, include only states relevant to the domain, such as create, submit, approve, pay, cancel, fail, expire, refund, schedule, reserve, allocate, release, fulfill, settle and reverse.
5. Compare top-level fields and nested object/list fields separately. If DTOs are absent because a handler receives a map or raw body, state that and verify the service-level field handling.
6. Default to read-only business code. Only change generated maps, stale docs, missing imports/exports or clearly mismatched local API paths when the evidence is direct and the verification path is available.
7. Do not change business rules, money movement, database data, payment provider settings, production secrets or tenant configuration from this mode. Record evidence, options and required owner decisions instead.
8. If this is a real project task, add or update a real-task A/B record. If group-level token data was not measured, write `unknown` rather than implying savings.

## Cross-Repository Quality Check

Before reporting on a cross-repository interface or order-flow task:

- State whether the DTO field contract was checked, and list the files used.
- State whether active and legacy endpoint paths were compared.
- If either check did not apply or was not run, say that directly.

## Token Savings Visibility

Use this section when the user asks whether the workflow saved tokens, or when preparing an initialized workspace for other users.

1. Separate static context savings from real task session savings.
2. Static context savings come from `ai-context-kit tokens`, `summary`, and `dashboard`. They compare parent-folder baseline, routing context, lean repository context, full index context, and single-repository baselines.
3. Real task session savings come from comparable Codex sessions or `codex exec --json` events, usually through `ai-context-kit codex-mem sessions` or `ai-context-kit codex-mem exec-events`.
4. Do not report a real task savings percentage unless both groups have measured token data for comparable prompts and the task quality record is present.
5. If only static measurements exist, say that they show context-size savings, not guaranteed runtime session savings.
6. If group-level session token data is missing, write `unknown` for real task savings rather than inferring from static reports.
7. User-facing reports should include the dashboard path, the headline savings percentage, the measurement command, and the generated timestamp.
8. Quality statements must be separate from savings statements. Token savings are useful only when the task still checks source files, contracts, state paths, verification results, and missed items.
9. Use `ai-context-kit token-status --workspace <path>` for a short editor or terminal summary that does not rescan source files.
10. Use `ai-context-kit token-status --workspace <path> --json --output docs/ai-context-token-status.json` when an IDE panel, plugin, team script, or run configuration needs structured token status.
11. Use `ai-context-kit editor-tasks --workspace <path>` for VS Code-compatible editors when the user wants one-click tasks for token status, JSON status file, report refresh, session usage and Codex observe hook installation.
12. Before committing session reports, `exec-events`, A/B records, or token status JSON, scan prompts, workspace fields, event file paths, and generated Markdown for local absolute paths. Replace local machine paths with placeholders such as `<workspace>`, `<tmp>`, or `<external>`.

## Quality Guardrails

When using generated context to reduce token usage:

- Treat indexes, maps, facts and contract rows as routing aids. They do not replace the source files that decide behavior.
- Read the implementation files needed for the claim being made, such as pages, API wrappers, handlers, DTOs, services, mappers, state transitions, tests, and verification configs.
- Track missed items in A/B records. A lower-token run is not a success if it skipped required files, state paths, or verification evidence.
- Do not promise that accuracy can never decrease across all projects. Report what was measured: quality down `yes`, `no`, `mixed`, or `unknown`, with sources.

## CLI

When `ai-context-kit` is available, prefer these commands:

```bash
ai-context-kit doctor --workspace <parent-or-repo>
ai-context-kit onboard --workspace <parent-or-repo>
ai-context-kit upgrade --workspace <parent-or-repo>
ai-context-kit init --workspace <parent-or-repo>
ai-context-kit repair --workspace <parent-or-repo>
ai-context-kit measure --workspace <parent-or-repo>
ai-context-kit tokens --workspace <parent-or-repo>
ai-context-kit summary --workspace <parent-or-repo>
ai-context-kit dashboard --workspace <parent-or-repo>
ai-context-kit token-status --workspace <parent-or-repo>
ai-context-kit token-status --workspace <parent-or-repo> --json --output docs/ai-context-token-status.json
ai-context-kit editor-tasks --workspace <parent-or-repo>
ai-context-kit facts --workspace <parent-or-repo>
ai-context-kit agents --workspace <parent-or-repo>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol> --frontend-repo <repo>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol> --backend-repo <repo>
ai-context-kit contracts --workspace <parent-or-repo> --query <endpoint-or-symbol> --related <payment|refund|cancel|device|settlement|booking|inventory|insurance|order>
ai-context-kit graph --workspace <parent-or-repo> --output docs/ai-context-graph.json
ai-context-kit redact --input <file> --output <file>
ai-context-kit codex-mem init --workspace <parent-or-repo>
ai-context-kit codex-mem index --workspace <parent-or-repo>
ai-context-kit codex-mem search --workspace <parent-or-repo> --query <text>
ai-context-kit codex-mem route --workspace <parent-or-repo> --query <text>
ai-context-kit codex-mem timeline --workspace <parent-or-repo> --limit 20
ai-context-kit codex-mem record --workspace <parent-or-repo> --title <text> --summary <text>
ai-context-kit codex-mem install-hooks --workspace <parent-or-repo> --mode observe
ai-context-kit codex-mem dashboard --workspace <parent-or-repo>
ai-context-kit codex-mem sessions --workspace <parent-or-repo>
ai-context-kit codex-mem exec-events --workspace <parent-or-repo> --events <events.jsonl>
ai-context-kit codegraph --workspace <parent-or-repo> --repos <repo-name>
project-facts-kit context doctor --workspace <parent-or-repo>
project-facts-kit context onboard --workspace <parent-or-repo>
project-facts-kit context upgrade --workspace <parent-or-repo>
project-facts-kit context init --workspace <parent-or-repo>
```

Use `measure` for the scope report. Use `tokens` to produce a measured report comparing parent-folder baseline, single-repository baseline, routing-only context, lean context, and full index context. Use `summary` to print a short savings summary from the latest token report. Use `dashboard` to write `docs/ai-context-token-dashboard.md` without rescanning source files. `tokens` requires `npx` and `repomix@latest`; if unavailable, record Not run and the missing tool.

If `ai-context-kit` is not installed on `PATH`, try the cloned-kit fallback:

```bash
node ~/.cache/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs doctor --workspace <parent-or-repo>
node ~/.cache/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs <command> --workspace <parent-or-repo>
```

Use `codex-mem install-hooks --mode observe` only after `init` or `index`. Observe mode records local hook event token estimates and lightweight context matches without blocking Codex tools. Review `codex-mem dashboard` before enabling compression or denial behavior. Use `codex-mem sessions` for Codex session token/status reports, and `codex-mem exec-events` for raw `codex exec --json` event files. Use `codex-mem timeline --limit 20` after dashboard or compression tests to locate recent refs, short hashes and important summary lines before reading full output.

Run `redact` before sharing Codex event logs, stderr logs, API responses or task trace snippets outside the local machine. The rule-based version masks common API keys, Authorization/Cookie headers, secret-like fields, email addresses, phone numbers, user home paths and URL passwords; still review the output before sharing.

`onboard` is the preferred first-use command: it repairs missing workflow artifacts, then prints `doctor`, `token-status`, and `capability actions`. `upgrade` refreshes generated maps, reports and indexes from the current repository state, then prints the same status. `capability actions` is the user-facing place to see whether CodeGraph should be skipped, installed or initialized, and whether token report, dashboard, observe hooks or session usage are already visible. `agents` and `repair` generate missing workflow artifacts only and refresh the local codex-mem route/search index after new materials are created. `init` regenerates generated maps, reports and indexes from the current repository state, including stale contract maps. `facts` regenerates only child repository `project-facts/` files. The `project-facts-kit context` prefix accepts the same subcommands as `ai-context-kit`.

Do not use `--force` unless the user explicitly wants to regenerate ai-context-kit managed files. Even then, non-generated project facts must remain untouched.

## Do Not Read By Default

- `src/main/resources/application*.yml`
- `src/main/resources/application*.yaml`
- `src/main/resources/cert/**`
- `.env*`
- `*.pem`
- `*.key`
- `doc/sql/**`
- `**/*.min.js`
- `node_modules/**`
- `target/**`
- `dist/**`
- `build/**`
- `unpackage/**`
- `.codegraph/**`

## Boundaries

- This skill controls context size and repository routing.
- It does not approve requirements or product intent.
- Small repositories can show higher token counts after generated indexes; report the measured numbers instead of claiming savings.
- Use `project-facts-maintainer` for change records, unknowns, decisions, handover, and verification evidence.
- Do not commit CodeGraph indexes, temporary Repomix outputs, local usage logs, or real secrets.
