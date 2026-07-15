# Workspace Workflows

Read this reference only for first adoption, generated context upgrades, unclear repository routing, parent verification, migration, automation routing, or a reusable domain audit.

## Contents

- Project entry workflows
- Full workspace intake
- Capability and delivery reporting
- Parent workspace verification
- Prototype-backed migration
- Admin console routing
- Workspace domain index
- Automation workspace routing
- Business domain audit

## Project Entry Workflows

For local kit preparation, use `~/.cache/project-facts-kit/scripts/setup-local-kit.sh` when the kit is already cloned. If it is absent, tell the user to clone or update the project-facts-kit repository before using the entry phrases.

For first adoption:

1. Run `ai-context-kit inspect --workspace <path>` when existing standards or acceptable writes are unknown. `inspect` writes nothing and skips implementation-source reads.
2. Run `onboard` only after generated workflow files are acceptable. It repairs missing artifacts, then prints `doctor`, `token-status`, and capability actions.
3. Preserve human-authored `AGENTS.md`, project facts, OpenSpec, Spec Kit, ADRs, CODEOWNERS, and other detected standards.

For an adopted project upgrade:

1. Use `inspect --workspace <path>` for a zero-write preflight, then use `doctor --workspace <path>` to read current capability status.
2. Use `upgrade --workspace <path>` to refresh ai-context-kit-managed maps, reports, and indexes. The current CLI contract does not define `upgrade --dry-run`; do not invent it.
3. After upgrading, run `doctor --workspace <path>` and `token-status --workspace <path>`. Use `token-status --json --output <file>` only when a structured file is required; do not omit `--output`.
4. Use `repair` or `agents` when only missing materials should be generated.
5. Use `init` only when generated materials need regeneration from current repository state.
6. Never use `--force` without explicit user direction, and never overwrite non-generated project facts.

## Full Workspace Intake

1. Determine whether the current directory is one repository or a parent containing multiple repositories.
2. Read the parent `AGENTS.md` when present. Do not treat its absence as permission for a broad search.
3. Read generated workflow, workspace map, and scope report documents only when the task requires workspace routing or maintenance.
4. Run `doctor` as the health check. Interpret low-token artifacts, contract index, CodeGraph, static token report, dashboard, observe hooks, session usage, graph, A/B, and redact statuses separately.
5. Treat capability actions as recommendations, not permission to change the project.
6. Do not initialize CodeGraph merely because it exists. Use it for named repositories when `doctor` recommends it or precise `rg` cannot answer a symbol-level question quickly.
7. Select one main child repository from page names, endpoint paths, packages, logs, or filenames. Ask one short question only when it remains ambiguous.
8. Read the selected repository's `AGENTS.md`. Read project facts only when onboarding, verification planning, business-risk evidence, or repository rules require them.

## Capability and Delivery Reporting

For first adoption or upgrade, report:

- CodeGraph status: `skip`, `missing_cli`, `recommended`, or `initialized`.
- Whether a static token report and dashboard exist.
- Whether observe hooks are enabled.
- Whether real session usage was generated.
- Commands actually run and the next optional command for each missing capability.

Do not claim token savings from the presence of this skill or generated files.

## Parent Workspace Verification

- Confirm expected parent and child instructions, workspace map, scope report, contract map, and relevant verification or boundary records.
- Run measurement commands only when measurement is requested.
- Use one representative route or contract query to prove that generated routing points to the correct first-read files.
- Record weak routing or missing evidence instead of claiming readiness.
- Do not commit `.codex-mem/ledger.jsonl`, `.codex-mem/refs`, `.codegraph`, temporary Repomix output, or local usage logs.

## Prototype-Backed Migration

1. Read the supplied product or design document and the specific prototype outline.
2. Route source and target repositories from workspace markers; do not search every child repository.
3. Confirm repository roles with package manifests, route files, API wrappers, Controllers, or Mapper files rather than names alone.
4. Check target gaps in views, APIs, shared components, routes, utilities, and dependencies.
5. Port in dependency order: pages, direct APIs, shared components, utility exports, dependencies, then routes or menus.
6. For legacy frontend builds, prefer dependency versions proven in the source project.
7. Validate migrated imports with an alias-aware scan limited to migrated files.
8. Run the target build when available. Keep unrelated lint debt separate.
9. Document backend-driven dynamic menus and duplicate-menu risk.
10. Keep the source repository read-only unless the user asks to modify it.

## Admin Console Routing

- Query with page names, file names, wrapper names, and business nouns when route indexes are weak.
- Search generated docs for exact symbols before reading source.
- Check dynamic menu component strings, route files, `views/**/index.vue`, and `api/**/index.js` before broader scans.

## Workspace Domain Index

When the user requests workspace understanding without choosing a domain:

1. Build a lightweight candidate index from routes, wrappers, Controllers, jobs, modules, and precise searches over generated docs.
2. Record likely repositories, user and operator entries, high-risk state paths, verification commands, and first-read files.
3. Rank candidates by user intent, business criticality, recent changes, state complexity, and verification availability.
4. Ask for one selection only if intent remains unclear, then stop until a domain is chosen.

## Automation Workspace Routing

1. Treat the automation `cwd` as an entry point, not necessarily the target repository.
2. Route today's evidence from modified files, recent commits, change directories, handover, evidence, feedback files, page names, endpoints, Controllers, DTOs, wrappers, and logs.
3. Classify committed changes, uncommitted work, generated artifacts, remote sync, business changes, verification, and reusable Skill or tooling candidates before writing.
4. Write to one repository only when ownership is clear. Create separate candidates for separate repositories; list unresolved ownership without guessing.
5. Use `ai-context-kit automation-prompt --workspace <workspace> --type skill-feedback-candidate` when a Codex automation prompt is requested. The command prints prompt text; it does not create the automation.

## Business Domain Audit

1. Keep one business domain per pass.
2. Route with exact names in maps, pages, wrappers, Controllers, jobs, and events.
3. Record user and admin entries, endpoints, wrapper-to-Controller-to-DTO/service mapping, field risks, active and legacy paths, relevant states, verification commands, manual checks, and unknowns.
4. Compare top-level fields separately from nested objects and lists.
5. Treat code and generated maps as observed behavior, not approved intent.
6. Keep business code read-only unless the user requested implementation and the evidence supports it.
7. Do not change money movement, production data, payment configuration, secrets, permissions, or tenant configuration from an audit.
8. Create A/B or project-fact records only when the user, repository rules, or the audit deliverable requires them.
