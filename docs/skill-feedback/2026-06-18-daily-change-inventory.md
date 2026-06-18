# Skill Feedback Candidate: Daily Change Inventory

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260618-daily-change-inventory` |
| Status | `applied` |
| Created at | `2026-06-18` |
| Source project | `崆峒` parent workspace |
| Skill | `project-facts-maintainer`, `low-token-context-maintainer` |
| Target section | `Skill Performance Evidence`, `Skill Feedback Automation Setup`, `Automation Workspace Routing` |

## Evidence

| Item | Value |
| --- | --- |
| Source task | User asked to review today's modified content, decide whether any experience should feed back into `project-facts-kit-skill-optimization`, update the skill repository after syncing latest remote code, and push the result. |
| Evidence paths | `<workspace>/AGENTS.md`; `kt-travel-lite-applet/project-facts/change-evidence.md`; `kt-travel-lite-applet` commits `c6a4e28`, `0ad5758`, `3707215`; `ticket-backend` commits `f2b1eeb72`, `d25fed4c3`; uncommitted diffs in `travel-lite-backend` and `kt-travel-lite-h5`; generated `AGENTS.md` and `project-facts/` artifacts observed in several child repositories. |
| Verification run | `git pull --ff-only` in the skill repository returned `Already up to date`; workspace inventory used `git status --short --branch`, `git log --since='2026-06-18 00:00:00' --name-status`, `git diff --stat`, targeted `git show --stat`, and `sed` on the relevant evidence file. |
| Reviewer | User acting as Tool/library owner |
| Reviewer decision | `Accepted and applied on 2026-06-18` |

## Today's Workspace Summary

| Repository | Today's Evidence | Classification |
| --- | --- | --- |
| `kt-travel-lite-applet` | Three commits touched shopping cart, commodity/order reservation pages, settlement, order detail/list, homepage analysis, two booking documents, and `project-facts/change-evidence.md`. | Business changes plus lightweight project-facts evidence. Do not move business rules into shared skills. |
| `ticket-backend` | Ticket reprint logic commits added request DTO, controller entry, service interface and implementation changes. | Business/backend change. Keep as project evidence unless a reusable workflow gap appears. |
| `travel-lite-backend` | Uncommitted cart response changes add store and point fields and fill store data in cart item responses. | Active working tree change. Treat separately from committed work and do not summarize as completed. |
| `kt-travel-lite-h5` | Uncommitted booking UI changes avoid sold-out time slots when defaulting, rendering, selecting and validating. | Active working tree change. Verification belongs to the target repository. |
| Several child repositories | Untracked generated `AGENTS.md` and `project-facts/` appeared in already-onboarded repositories. Some branches were also behind remote. | Process artifacts and sync state, not business behavior. Report separately from feature changes. |

## Observed Behavior

- Helpful: Existing workspace routing rules guided the inspection toward lightweight artifacts and per-repository evidence instead of broad parent-folder source reads.
- Helpful: The project-facts distinction between `OBSERVED` behavior and approved intent prevented applet investigation notes from becoming shared skill rules.
- Missing: The daily feedback workflow does not explicitly require a first-pass inventory that separates committed today, uncommitted working tree changes, generated onboarding artifacts, remote sync state and project-specific business changes.
- Missing: A "today's changes summary" task can produce a mixed set of evidence across repositories. Without a required classification table, an agent may over-promote business changes or ignore active uncommitted work.
- Misleading: None observed in the skill text itself. The risk is omission: current guidance says to route by today's evidence, but does not spell out how to present mixed evidence before deciding what is reusable.
- Tool conflict: None observed. `git pull --ff-only` completed cleanly before edits.

## Why It Should Move Upstream

This is a reusable workflow issue for multi-repository parent workspaces. Daily candidate collection and manual "what did we change today" requests both need the same inventory step before deciding whether to update shared skills. The rule would reduce two common mistakes:

- Treating uncommitted work as completed work.
- Turning project-specific business changes into shared skill instructions.

The expected future behavior is:

1. Build a per-repository inventory of today's commits, working tree diffs, generated facts, remote sync state and verification evidence.
2. Classify each item as business change, project-facts evidence, process artifact, sync risk, tooling issue or reusable skill candidate.
3. Only create shared-skill candidates for reusable workflow/tooling behavior; keep business behavior inside the owning project.
4. Record checks as run, failed or `Not run` instead of implying feature verification from source inspection.

## Why It Should Stay Local

The applet, ticket and cart behaviors are project-specific and should stay in their owning repositories. The reusable part is the inventory and classification workflow, not the business content.

## Applied Change

Applied on 2026-06-18. Updated `project-facts-maintainer`, `low-token-context-maintainer`, plugin skill copies, `ai-context-kit automation-prompt`, and the automation/adoption docs to require a per-repository daily change inventory before shared-skill candidates are created.
