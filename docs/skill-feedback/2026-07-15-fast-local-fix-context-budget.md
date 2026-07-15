# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260715-fast-local-fix-context-budget` |
| Status | `accepted` |
| Created at | `2026-07-15` |
| Source project | `崆峒 multi-repository workspace` |
| Skill | `low-token-context-maintainer` |
| Target section | Trigger description, mode selection, fast local fix, project-facts boundary, progressive disclosure |

## Evidence

| Item | Value |
| --- | --- |
| Source task | A named mini-program repository and page needed one conditional label hidden for one product type; the user then requested that the observed workflow delay be analyzed and corrected upstream. |
| Evidence paths | `<workspace>/.codex/skills/low-token-context-maintainer/`; `kt-travel-lite-applet/pagesA/commodity/allCommoodity.vue`; `kt-travel-lite-applet/pagesA/commodity/components/specifications.vue`; this candidate and the canonical Skill diff |
| Verification run | `./scripts/check-kit.sh` PASS (npm was unavailable, so the repository used its user-level CLI-link fallback); `git diff --check` PASS; Plugin mirror check PASS; `skills-ref validate` and `quick_validate.py` PASS for the canonical Skill and both Plugin mirrors; YAML/reference and retained-capability assertions PASS. Canonical forward tests for fast local and cross-repository tasks passed. The first upgrade forward test invented unsupported CLI syntax; after the reference explicitly prohibited `upgrade --dry-run` and required `token-status --json --output <file>`, the repeated test passed. Live project adoption, upgrade, token measurement, and hosted GitHub Actions: Not run. |
| Reviewer | User acting as Tool/library owner |
| Reviewer decision | Accepted for upstream implementation on 2026-07-15 |

## Observed Behavior

- Helpful: The existing Skill prevented parent-workspace source scans and provided reliable cross-repository, onboarding, capability, and token-measurement guidance.
- Missing: It did not choose a local fast path before the full workflow when the repository, page, and visible behavior were already explicit.
- Misleading: Mandatory workspace/project-facts reads and the unconditional behavior-change handoff rule caused a small UI condition to load approximately 71.7 KB of Skill and project-fact guidance before a two-file edit. The low-token Skill itself was 229 lines and about 26.6 KB in the source workspace copy.
- Tool conflict: None observed. Additional delay also came from one broad search and an unnecessary read-only subagent, so the full delay cannot be attributed to the Skill alone.

## Why It Should Move Upstream

Named local fixes recur in any multi-repository workspace. Selecting the fast path before opening generated maps or project facts reduces sequential reads while retaining explicit escalation for contracts, order state, payment, deployment, permissions, migration, and unclear business rules. Progressive disclosure also avoids loading unrelated onboarding, migration, automation, and CLI instructions on every trigger.

## Why It Should Stay Local

The presale product predicate and mini-program UI requirement remain project-specific. Only the reusable routing, read-budget, escalation, and evidence boundaries move upstream.

## Implementation Result

Implemented on branch `codex/low-token-fast-local-path`: the canonical main file now selects a mode before reading, limits fast local work to 3-4 source-reading calls or parallel batches, skips project-facts updates for small local UI changes, and uses explicit escalation signals. Cross-repository, full-workspace, and token/CLI detail moved into three one-level references. Existing first-adoption, upgrade, CodeGraph, capability-reporting, daily feedback, migration, and A/B guidance remains available in the references. Both Plugin mirrors were regenerated from the canonical source.

The candidate remains `accepted` until the published branch is reviewed and merged. The project-specific presale predicate was not copied upstream.
