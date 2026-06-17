# Iteration Plan

## Snapshot

| Field | Value |
| --- | --- |
| Updated at | `<YYYY-MM-DD>` |
| Iteration window | `<date range or milestone>` |
| Project owner | `<role or name>` |
| Current maintainer | `<role or name>` |
| Active branch | `<branch>` |
| Revision reviewed | `<commit or working tree state>` |

## Planning Rules

- Every task must reference at least one `specs/` file or `changes/` directory.
- A task is ready for development only when owner, scope, verification command and high-impact unknowns are recorded.
- When ownership changes, update this file and both handover files.
- Finished tasks must point to executed checks in `evidence.md`.

## Task Board

| Task ID | Status | Owner | Scope | Fact paths | Required checks | Handoff note |
| --- | --- | --- | --- | --- | --- | --- |
| `TASK-001` | `Proposed / Ready / In Progress / Review / Done / Waiting` | `<owner>` | `<short scope>` | `<spec/change paths>` | `<commands or manual checks>` | `<what the next maintainer needs>` |

## Ready Next

| Priority | Task ID | Why this is next | Cannot start until |
| --- | --- | --- | --- |
| `P1` | `<task id>` | `<reason>` | `<unknown, review or dependency>` |

## Recently Finished

| Task ID | Result | Evidence | Remaining follow-up |
| --- | --- | --- | --- |
| `<task id>` | `<result>` | `<evidence.md or check output>` | `<follow-up or none>` |

## Open Planning Questions

| ID | Impact | Owner | Question | Location |
| --- | --- | --- | --- | --- |
| `Q-001` | `High / Medium / Low` | `<owner>` | `<question>` | `<path>` |
