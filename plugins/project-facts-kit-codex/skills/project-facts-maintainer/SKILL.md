---
name: project-facts-maintainer
description: Maintain model-independent project facts, specifications, runtime facts, release evidence, unknowns, decisions, handovers, and verification evidence. Use when onboarding to an existing repository, doing project-facts-kit first adoption or “首次接入”, upgrading an already adopted project without overwriting facts or “已接入升级”, handing a project to another developer or AI agent, documenting behavior-changing work, recording deployment or Docker release facts, comparing implementation with approved requirements, collecting daily Skill feedback candidates or “开启每日反哺候选”, or preparing acceptance evidence without inventing product intent.
---

# Project Facts Maintainer

Build and maintain project facts that remain readable across different models and coding agents. Treat the target repository's reviewed facts as authoritative; treat this skill as process guidance only.

## Workflow

1. Locate the target repository instructions, test commands and any existing project fact or specification directories.
2. Read current specifications, iteration plan, decisions, active changes and both handover files before using code or chat history to infer behavior.
3. Classify each relevant statement as `APPROVED`, `OBSERVED`, `UNKNOWN` or `CONFLICT`, with source paths and revisions.
4. For a new or changed behavior, create or update a change record containing purpose, non-goals, affected requirement IDs, unresolved questions, implementation tasks and planned verification.
5. Stop business-changing implementation when a `Blocker` or `High` unknown remains open and no approved source resolves it.
6. After implementation, execute relevant checks and record the actual result. Mark unexecuted checks `Not run`; do not imply successful acceptance.
7. Update `iteration-plan.md`, `handover/current.md` and, when another maintainer will take over, `handover/for-next-maintainer.md`.

## Existing Repository Baseline

Use this section when onboarding a new project, a new teammate, or a new model to a repository.

User-facing entry phrases:

- First adoption: `帮我做项目事实 kit 首次接入。`
- Existing project upgrade: `帮我做项目事实 kit 已接入升级，不覆盖已有事实。`
- Daily feedback automation: `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。`

Local kit preparation phrase:

- `帮我从远端获取项目事实 kit，并准备好本机 Skill 和 CLI。`

If these entry phrases are requested but `ai-context-kit` is unavailable, first
check whether the kit exists at `~/.cache/project-facts-kit`. When it exists,
run `~/.cache/project-facts-kit/scripts/setup-local-kit.sh` or use the node
fallback under that directory. When it does not exist, tell the user to clone or
update the public kit repository first; GitHub repository access may require
network access, account permissions or Git credentials.

1. Read only lightweight entry points first: `AGENTS.md`, README or project entry docs, package manifests such as `package.json`, `pom.xml` or `go.mod`, and any existing `project-facts/`.
2. Decide whether the target is a single repository or a parent workspace. For a parent workspace, follow `low-token-context-maintainer` before reading implementation files.
3. If `project-facts/` is absent and local instructions allow writing, prefer the kit installer in lite mode. If `project-facts/` exists, read and assess it; do not overwrite existing facts.
4. Fill or update `project.md`, `glossary.md`, `iteration-plan.md`, `handover/current.md`, `handover/for-next-maintainer.md`, and the current task's `specs/<domain>/spec.md` when the repository rules allow edits.
5. For the most important current task, maintain a small table with behavior or requirement, status, source path, latest verification, and unknowns.
6. Treat implementation behavior as `OBSERVED` until an approved source or owner decision confirms intent. Never turn code, tests, or agent agreement into `APPROVED` by themselves.
7. If a `Blocker` or `High` `UNKNOWN` or `CONFLICT` affects the business rule, stop changing that rule and record the owner decision needed.
8. Run available checks and record real outcomes. If a check cannot run, write `Not run` with the reason.
9. When reporting first adoption or existing project upgrade for a parent workspace, include the low-token capability result: CodeGraph status, static token report/dashboard status, observe hooks status, session usage status, commands run, and the next command if a capability is not enabled.

## Runtime And Release Facts

Use this section when a task touches deployment, CI/CD, Docker, Docker Compose, static assets, reverse proxy, DNS, certificates, environment variables, persistent storage, background jobs or production-like verification.

1. Prefer the target project's existing runtime document. If the project uses this kit, use `project-facts/runtime.md`.
2. Record the release path as facts: CI/CD source, artifact or image registry, server or platform, runtime owner, release owner, host directories, public domains and reverse proxy owner.
3. Record persistent data explicitly: database/storage type, host directory or managed service, backup method, restore note and status. Do not store secret values.
4. For Docker Compose releases, record service names, image tags, port bindings, health checks, resource limits, log limits and data mounts.
5. For shared hosts, include isolation checks for existing services and make clear which service owns 80/443.
6. Put the actual release checks in the related change `evidence.md`: build/CI, registry or artifact, remote config render, health checks, public endpoint, browser check, shared-host checks and rollback command.
7. Mark runtime behavior as `OBSERVED` unless an owner decision or reviewed runbook confirms it as intended.
8. Read `references/runtime-release-facts.md` before writing or reviewing runtime facts or release evidence.

## Workspace Domain Index

Use this section when a project is being initialized or indexed and no single business domain has been selected.

1. Create a lightweight domain index rather than a detailed domain report.
2. Treat candidate domains as `OBSERVED` or `UNKNOWN`, not approved product scope.
3. Base candidates on route maps, API maps, page names, handler names, module names, jobs, consumers, tests and existing documentation.
4. For each candidate, record sources, likely repositories, first files to read, important state paths, verification commands and unresolved questions.
5. Store the index in the existing docs or project-facts structure, for example `docs/business-domains/README.md`, `docs/domain-index.md` or `project-facts/domain-index.md`.
6. For structure, read `references/domain-index-template.md` when creating a new workspace domain index.

## Business Domain Facts

Use this section when a task creates reusable material for one functional domain across one or more repositories.

1. Business-domain reports describe observed implementation unless a reviewed specification or owner decision confirms intended behavior.
2. Every conclusion needs a file path, command output, schema, test, route map, contract row or runtime observation as its source.
3. Keep a short read-first section for future agents, then a detailed evidence section. The report should be useful without requiring another broad search.
4. Separate user-facing entries, operator/admin entries, backend endpoints, field contracts, state paths, verification commands, manual checks, unknowns and recommended next reads.
5. Mark unverified behavior as `Not run` or `UNKNOWN`. Do not infer acceptance from code presence alone.
6. Store reports in the existing documentation structure when one exists, for example `docs/business-domains/<domain>.md` or `project-facts/business-domains/<domain>.md`.
7. For report structure, read `references/business-domain-report-template.md` when creating a new business-domain report.

## Token and Quality Evidence

Use this section when documenting a low-token workflow, project initialization, or real task comparison.

1. Record token evidence as measured data, not as a claim about product quality.
2. For static context measurements, cite the dashboard or measurement report path, generated timestamp, baseline tokens, selected context tokens, and savings percentage.
3. For real task A/B comparisons, cite the session or event source, prompt comparability, total/input/output/reasoning tokens, status, tool calls, and duration.
4. If a project has only static context measurements, mark real task savings as `UNKNOWN`.
5. If a project has only task-quality review but no group-level session tokens, mark savings as `UNKNOWN`.
6. For quality, record checked files, contract coverage, verification results, missed items, and whether quality changed: `no`, `yes`, `mixed`, or `unknown`.
7. Do not state that a low-token workflow preserves accuracy unless the relevant task record shows no material missed items and source-backed quality evidence.
8. For real task A/B coverage, distinguish external workspace evidence from records committed in the current facts repository. Claim a category as counted only when the current repository's refreshed `real-task-audit` report counts it; otherwise label it as external or supporting evidence and leave coverage `UNKNOWN` or missing.

## Skill Performance Evidence

Use this section when a user asks to improve a skill from real project usage.

1. Create or update a performance log such as `project-facts/skill-performance-log.md` or `docs/skill-performance-log.md`.
2. Record the skill name, local path, source repository or installer command, task prompt, workspace shape, commands used, files changed, verification run and verification gaps.
3. Separate useful behavior from tool conflicts. Mark successful guidance as `OBSERVED`, misleading output as `CONFLICT`, missing data as `UNKNOWN`, and user-approved workflow decisions as `APPROVED`.
4. Keep optimization items concrete. Each item should name the skill section or tool behavior to change, the evidence that motivated it, and the expected future behavior.
5. Include dependency and lint lessons from implementation tasks when they affect future skill behavior, especially legacy project migrations where build success and lint style debt differ.
6. When recording local paths, avoid publishing machine-specific absolute paths outside the local workspace. Use placeholders such as `<workspace>`, `<repo>`, `<kit-cache>`, or `<external>`.

## Skill Feedback Intake And Review

Use this section when a project has produced a candidate item for a shared skill and the skill repository needs to decide whether it belongs upstream.

1. Keep candidate items separate from approved skill text. Store them in `docs/skill-iteration-backlog.zh-CN.md`, `docs/skill-feedback/` or a similar candidate area before changing `skills/`.
2. Give each candidate a clear status: `proposed`, `needs-evidence`, `accepted`, `rejected` or `applied`.
3. Write down the source task, the skill under review, the observed behavior, the evidence path, the actual verification run and the reviewer decision.
4. Treat project-specific business rules as project facts, not shared skill rules, unless the same behavior repeats across more than one project or task.
5. Accept only candidates that improve the reusable workflow, the routing heuristic, the verification path or the tooling behavior.
6. When a candidate is accepted, update the relevant skill, template or script in this repository, then run the repository checks required by `AGENTS.md`.
7. If the candidate is really a CLI bug, generated artifact bug or install-script bug, track it as tooling work rather than folding it into a workflow skill.

## Skill Feedback Automation Setup

Use this section when a user asks to make daily skill feedback collection run automatically.

1. Do not require ordinary users to name every child repository path. Use the current workspace or business parent folder as the automation entry when it contains the relevant business repositories.
2. If the current directory is a skill/template repository, do not use it as the business candidate entry. Use it only for shared skill review.
3. For a business candidate automation, route candidates from evidence: `git status --short`, recent commits, `project-facts/changes/`, `handover/`, `evidence.md`, `verification.md`, `project-facts/skill-feedback/`, `docs/skill-performance-log.md`, file paths, module names, pages, endpoints, Controllers, DTOs, API wrappers, packages and logs.
4. Write a candidate to a child repository only when the repository can be identified from evidence. If ownership is ambiguous, report a confirmation item and do not guess.
5. Prefer generating the prompt with `ai-context-kit automation-prompt --workspace <workspace> --type skill-feedback-candidate` when the CLI is available.
6. In Codex app, create or update a cron automation with `cwds` pointing to the business repository, business parent folder, or multiple business parent folders. Keep shared skill review as a separate automation in the skill repository.
7. The automation may create `project-facts/skill-feedback/` candidate files and daily summaries. It must not modify shared skills, templates, scripts, CLI code or approved project facts.

## Lightweight Change Evidence

Use this section when a small, concrete fix needs traceable evidence but a full domain report or long specification would slow the task down.

1. Prefer updating an existing `evidence.md`, `verification.md`, `handover/current.md`, or skill performance log over creating a large new fact tree.
2. Record four items only: changed behavior, files or commands used as evidence, verification actually run, and verification or business questions still not run or unresolved.
3. Keep the source list to files that decided the change. Do not include every file read while exploring unless it changes the conclusion.
4. Mark sibling-client behavior, existing code behavior, and agent summaries as `OBSERVED`; use `APPROVED` only for reviewed specifications or owner decisions.
5. Expand to a full spec, business-domain report, or decision record only when the task changes product intent, money movement, permissions, deletion, data migration, release boundaries, or a reusable domain rule.

## Cross-Client Parity Records

Use this section when one frontend client is corrected by comparing it with another client that already implements the same business page or order flow.

1. Record the failing client, the read-only sibling client, and the shared page, entry, submit method, or API wrapper used for comparison.
2. If exact file paths are already known, open the failing page and sibling page first before generated maps or route queries.
3. List top-level payload fields and nested object or list fields separately, starting from the smallest submit or request builder that produces them.
4. Explain why the sibling client is usable as parity evidence, and keep the finding as `OBSERVED` unless an approved specification or owner decision confirms intent.
5. Record whether backend DTO, contract map, mapper, or endpoint review was needed. If it was not run, write `Not run` with the reason.
6. Record verification evidence such as diff checks, extracted syntax checks, unit/build checks, browser checks, live API checks, or `Not run` gaps.

## Migration Change Records

Use this section when documenting copied or migrated modules between repositories.

1. Record source repository, target repository, copied directories, merged utility functions, package dependency changes and route/menu changes.
2. Distinguish frontend static routes from backend dynamic-menu data. If the app uses backend route records, keep a route table with `title`, `path`, and `component`.
3. Record validation in layers: import/path scan, build, lint, local HTTP/dev-server check and manual browser/API checks.
4. If lint fails because copied legacy code does not match target style rules, state the count or representative classes of lint errors and whether business behavior was still built successfully.
5. Keep remaining manual checks visible: backend menu permissions, live API calls, hardware/device services, print services, payment flows and tenant configuration.
6. For a completeness audit after migration, compare the approved design/prototype page tree, copied view/API/component directories, static routes, dynamic-menu plan, hidden/internal pages, intentionally excluded pages and remaining manual verification in one checklist.
7. When service owners provide new interface adaptation documents during migration, record the old endpoint, new endpoint or compatibility path, wrapper function, consuming page, field adapter notes, build result and live-environment verification gap.

## Cross-Repository Business Flow Records

Use this section when a task changes an end-to-end business flow across user interfaces, API clients, data contracts, adapters or service layers.

1. Confirm the actual user-facing entry, route and variant before changing code, especially when the same capability exists in multiple clients, admin surfaces, public pages, mobile apps or detail pages.
2. Record the full request chain for the changed behavior: page/component/job, API wrapper or client, endpoint/event/message, request or input contract, response or output contract, mapper or adapter method, core service or domain method, and follow-up action such as approval, payment, fulfillment, notification, cancellation, reconciliation or audit.
3. For flows with parent records and child line items, record quantities, amounts, identities, statuses and ownership at each level; do not assume one UI value maps to every backend field.
4. When behavior depends on configuration or rules such as roles, limits, eligibility, time windows, feature flags, grouping, localization, pricing, inventory or retry policy, cite the configuration or rule source and the service logic that consumes it.
5. Record fields that must be preserved across steps, such as correlation IDs, order or task IDs, tokens, authorization handles, idempotency keys, state versions, session parameters or external reference numbers.
6. Keep verification evidence layered: build or unit checks, static source/contract comparison, local route/job/API check, environment-specific authenticated check and any gaps such as login redirects, missing test data, unavailable services or third-party sandboxes.

## Required Distinctions

- Use approved specifications or recorded owner decisions for intended behavior.
- Use code, tests, schemas and runtime observations for observed behavior.
- Use chats, issues, agent memory and previous summaries only as leads unless they have been reviewed into project facts.
- Do not treat agreement between multiple agents as product approval.

## Output Shape

When assessing a project or handoff, provide a table with:

| Requirement or behavior | Status | Sources | Verification | Unknowns or conflicts |
| --- | --- | --- | --- | --- |

When implementing a change, reference the relevant change directory and requirement IDs in the delivery summary.

## Reference

Read [references/policy.md](references/policy.md) when creating a project fact directory, recovering facts in an undocumented project, or deciding which records and review gates are required.
Read [references/runtime-release-facts.md](references/runtime-release-facts.md) when documenting deployment, Docker, persistence, reverse proxy, DNS, certificates or release verification.
Read [references/domain-index-template.md](references/domain-index-template.md) when creating a workspace-level business-domain candidate index.
Read [references/business-domain-report-template.md](references/business-domain-report-template.md) when creating a reusable business-domain report.
