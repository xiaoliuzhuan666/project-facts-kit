# Project Facts Policy Reference

## Status Vocabulary

| Status | Use when |
| --- | --- |
| `APPROVED` | A responsible person or reviewed artifact explicitly confirms intended behavior |
| `OBSERVED` | Code, tests, API behavior or runtime checks demonstrate current behavior without confirmed intent |
| `UNKNOWN` | Evidence is insufficient to determine intended behavior |
| `CONFLICT` | Credible sources disagree |
| `DEPRECATED` | A recorded decision has replaced the requirement |

## Evidence Priority

| Level | Sources | Interpretation |
| --- | --- | --- |
| A | Reviewed specs, ADRs and acceptance approvals | Supports intended behavior |
| B | Executed tests, contracts and release verification | Supports validated observed behavior |
| C | Code, schemas, migrations, config and logs | Supports investigation and observed drafts |
| D | Issues, chats, agent summaries and memories | Leads only until reviewed |

## Records To Create

Use an existing specification structure when one is already present. Otherwise create:

```text
project-facts/
  project.md
  glossary.md
  iteration-plan.md
  specs/<domain>/spec.md
  changes/<yyyy-mm-dd>-<change>/
    proposal.md
    requirements.md
    design.md
    tasks.md
    unknowns.md
    evidence.md
  decisions/ADR-*.md
  handover/current.md
  handover/for-next-maintainer.md
```

## Existing Project Intake

1. Record repository revision, responsible roles, entry points and validation commands.
2. Scope the first pass to the active change or highest-risk functional domain.
3. Derive `OBSERVED` statements from implementation and executable evidence.
4. List questions that code cannot answer as `UNKNOWN`.
5. Request approval for high-impact intended behavior before making related business changes.

## Review Gate

A behavior-changing change should identify requirement IDs, explicit non-goals, unresolved questions and executed evidence. Open `Blocker` or `High` questions prevent a completed business acceptance statement.
