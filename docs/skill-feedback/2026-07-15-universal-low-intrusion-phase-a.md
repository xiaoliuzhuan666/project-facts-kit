# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260715-universal-low-intrusion-phase-a` |
| Status | `applied` |
| Created at | `2026-07-15` |
| Source project | `project-facts-kit` |
| Skill | `project-facts-maintainer`, `low-token-context-maintainer`, `ai-context-kit` |
| Target section | CLI contract, plugin distribution, read-only discovery, installer write scope, generated-file ownership, token measurement security |

## Evidence

| Item | Value |
| --- | --- |
| Source task | User request after repository assessment and market research: `按照你的建议帮我开始迭代优化吧` |
| Evidence paths | `docs/research/project-facts-context-market-research-2026-07-15.zh-CN.md`; `packages/ai-context-kit/package.json`; `packages/ai-context-kit/bin/ai-context-kit.mjs`; `plugins/project-facts-kit/`; `plugins/project-facts-kit-codex/`; `scripts/install-project-facts.sh`; `scripts/check-kit.sh`; `docs/ai-context-kit-real-task-ab-audit.md` |
| Verification run | `node --check packages/ai-context-kit/bin/ai-context-kit.mjs` PASS; `bash -n` for changed shell scripts PASS; `./scripts/check-kit.sh` PASS; `git diff --check` PASS; Plugin Skill mirror check, YAML parsing and changed Markdown local-link scan PASS; `skills-ref validate` and `quick_validate.py` PASS for both root Skills; `validate_plugin.py` PASS for both Plugins. GitHub Actions hosted run, npm publish/install, live Repomix measurement and real-task A/B: Not run. |
| Reviewer | User acting as Tool/library owner |
| Reviewer decision | Accepted for Phase A implementation on 2026-07-15 |

## Observed Behavior

- Helpful: The repository already separates approved, observed, unknown and conflicting facts; it also has non-overwrite checks for several project files.
- Missing: There is no zero-write discovery command, helper scripts are copied into target repositories by default, and the primary marketplace plugin is not covered by the same checks as the Codex plugin.
- Misleading: CLI/npm, plugin and documentation versions differ; one plugin Skill copy references commands absent from the current CLI.
- Tool conflict: `tokens` invokes floating `repomix@latest` and disables the security check that Repomix enables by default.

## Why It Should Move Upstream

The failures affect any target repository regardless of business domain or technology stack. A consistent command contract, read-only discovery, explicit helper installation, managed-file protection and reproducible token measurement reduce accidental project changes and make the kit safer to adopt across teams.

## Why It Should Stay Local

No project-specific business rule is included. CodeGraph, RAG, graph databases and memory providers remain research items because current real-task A/B counted records are zero.

## Implementation Result

Applied through PR [#2](https://github.com/xiaoliuzhuan666/project-facts-kit/pull/2) and merge commit `8d4869f` on 2026-07-15: unified the `0.3.60` version and command contract, made root `skills/` canonical for both Plugins, added shallow zero-write `inspect`, made helper scripts opt-in, added ownership guards for default Markdown, JSON, JSONL, hook-script and `.gitignore` outputs while retaining strict legacy-file recognition, pinned `repomix@1.16.1` with its default security scan, corrected current usage documentation and CI templates, documented a single shell line for lite first adoption, and reduced an adopted project's routine refresh to `ai-context-kit upgrade -w .`.

The implementation is merged into `main`. Token-budgeted routing, additional language providers, CodeGraph/RAG and memory-layer changes remain outside this candidate until real-task evidence and separate owner decisions exist.
