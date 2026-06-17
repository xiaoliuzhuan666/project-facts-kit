---
name: project-facts-maintainer
description: Maintain model-independent project facts, specifications, runtime facts, release evidence, unknowns, decisions, handovers, and verification evidence. Use when onboarding to an existing repository, handing a project to another developer or AI agent, documenting behavior-changing work, recording deployment or Docker release facts, comparing implementation with approved requirements, or preparing acceptance evidence without inventing product intent.
---

# Project Facts Maintainer

Build and maintain project facts that remain readable across different models and coding agents. Treat the target repository's reviewed facts as authoritative; treat this skill as process guidance only.

## Workflow

1. Locate the target repository instructions, test commands and any existing project fact or specification directories.
2. Read current specifications, iteration plan, decisions, active changes and both handover files before using code or chat history to infer behavior.
3. Classify each relevant statement as `APPROVED`, `OBSERVED`, `UNKNOWN` or `CONFLICT`, with source paths and revisions.
4. For a new or changed behavior, create or update a change record containing purpose, non-goals, affected requirement IDs, unresolved questions, implementation tasks and planned verification.
5. Stop business-changing implementation when a `Blocker` or `High` unknown remains open and no approved source resolves it.
6. After implementation, run the available facts audit command: `npm run facts:audit` when the target package defines it, otherwise `ai-context-kit audit --workspace <path>` when available, otherwise the local kit entrypoint if this repository is present. Use `ai-context-kit audit --workspace <path> --fail-on-warning` in CI or team scripts that should fail under drift status. If `npm run facts:status` or `ai-context-kit status --workspace <path> --json --output docs/ai-context-workspace-status.json` is available, use it as the shared view that combines token status, audit state and real-task quality evidence; the command also writes `docs/ai-context-workspace-status.schema.json` for downstream checks. If no audit command is available, record `Not run` with the reason. When available, read both `docs/ai-context-audit-report.md` and `docs/ai-context-audit-state.json`; the JSON state is the shared status source for hooks, editors and other agents. If the Stop hook or audit report prints `[CONFLICT ALERT]` or `[CONTRACT DRIFT WARNING]`, you MUST immediately suspend all code modifications, list the drifts and conflicts, and record them in the current task's `unknowns.md` for human arbitration. Do not attempt to force changes or commit under drift status.
7. Execute relevant checks and record the actual result. Mark unexecuted checks `Not run`; do not imply successful acceptance.
8. Update `iteration-plan.md`, `handover/current.md` and, when another maintainer will take over, `handover/for-next-maintainer.md`.

## Existing Repository Baseline

Use this section when onboarding a new project, a new teammate, or a new model to a repository.

1. Read only lightweight entry points first: `AGENTS.md`, README or project entry docs, package manifests such as `package.json`, `pom.xml` or `go.mod`, and any existing `project-facts/`.
2. Decide whether the target is a single repository or a parent workspace. For a parent workspace, follow `low-token-context-maintainer` before reading implementation files.
3. If `project-facts/` is absent and local instructions allow writing, prefer the kit installer in lite mode. If `project-facts/` exists, read and assess it; do not overwrite existing facts.
4. Fill or update `project.md`, `glossary.md`, `iteration-plan.md`, `handover/current.md`, `handover/for-next-maintainer.md`, and the current task's `specs/<domain>/spec.md` when the repository rules allow edits.
5. For the most important current task, maintain a small table with behavior or requirement, status, source path, latest verification, and unknowns.
6. Treat implementation behavior as `OBSERVED` until an approved source or owner decision confirms intent. Never turn code, tests, or agent agreement into `APPROVED` by themselves.
7. If a `Blocker` or `High` `UNKNOWN` or `CONFLICT` affects the business rule, stop changing that rule and record the owner decision needed.
8. Run available checks and record real outcomes. If a check cannot run, write `Not run` with the reason.

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

## Migration Change Records

Use this section when documenting copied or migrated modules between repositories.

1. Record source repository, target repository, copied directories, merged utility functions, package dependency changes and route/menu changes.
2. Distinguish frontend static routes from backend dynamic-menu data. If the app uses backend route records, keep a route table with `title`, `path`, and `component`.
3. Record validation in layers: import/path scan, build, lint, local HTTP/dev-server check and manual browser/API checks.
4. If lint fails because copied legacy code does not match target style rules, state the count or representative classes of lint errors and whether business behavior was still built successfully.
5. Keep remaining manual checks visible: backend menu permissions, live API calls, hardware/device services, print services, payment flows and tenant configuration.
6. For a completeness audit after migration, compare the approved design/prototype page tree, copied view/API/component directories, static routes, dynamic-menu plan, hidden/internal pages, intentionally excluded pages and remaining manual verification in one checklist.
7. When service owners provide new interface adaptation documents during migration, record the old endpoint, new endpoint or compatibility path, wrapper function, consuming page, field adapter notes, build result and live-environment verification gap.

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
