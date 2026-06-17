# Verification Evidence

## Change Metadata

| Field | Value |
| --- | --- |
| Change | `<change name>` |
| Revision checked | `<commit or worktree state>` |
| Checked at | `<YYYY-MM-DD HH:mm timezone>` |
| Checked by | `<person or agent>` |

## Requirement Coverage

| Requirement ID | Verification method | Command or steps | Result | Evidence location |
| --- | --- | --- | --- | --- |
| `REQ-...` | `Automated / Manual / Contract / Not run` | `<fill>` | `Pass / Fail / Not run` | `<path or link>` |

## Release Evidence

Use this section when the change affects deployment, runtime behavior, data storage, public access, background jobs, or shared infrastructure. Delete it only when the change has no release impact.

| Check | Command or steps | Result | Evidence location | Notes |
| --- | --- | --- | --- | --- |
| Source revision | `<git rev-parse HEAD / CI revision>` | `Pass / Fail / Not run` | `<path or link>` | `<commit, branch, dirty state>` |
| Build or CI run | `<CI job URL or command>` | `Pass / Fail / Not run` | `<path or link>` | `<job id, artifact, image tag>` |
| Image registry or artifact | `<docker manifest inspect / artifact checksum / registry UI>` | `Pass / Fail / Not run` | `<path or link>` | `<tag or checksum>` |
| Remote config render | `<docker compose config or platform config check>` | `Pass / Fail / Not run` | `<path or link>` | `<compose project or service>` |
| Data persistence check | `<host data dir, volume, managed DB, backup config>` | `Pass / Fail / Not run` | `<path or link>` | `<data owner and path without secrets>` |
| Resource limits | `<compose config / docker inspect / platform setting>` | `Pass / Fail / Not run` | `<path or link>` | `<memory, CPU, pids>` |
| Service health | `<curl local health / docker compose ps / platform health>` | `Pass / Fail / Not run` | `<path or link>` | `<service list>` |
| Public endpoint | `<curl https://... / DNS and certificate check>` | `Pass / Fail / Not run` | `<path or link>` | `<domain and certificate note>` |
| Browser check | `<page load, title, console, critical flow>` | `Pass / Fail / Not run` | `<path or link>` | `<browser and viewport>` |
| Shared-host isolation | `<old service health checks / port check>` | `Pass / Fail / Not run` | `<path or link>` | `<co-hosted services checked>` |
| Rollback rehearsal or documented command | `<rollback command or documented previous version>` | `Pass / Fail / Not run` | `<path or link>` | `<data migration risk>` |

## Failures And Unverified Items

| Item | Status | Consequence | Next owner |
| --- | --- | --- | --- |
| `<fill or none>` | `Failed / Not run / Blocked` | `<fill>` | `<fill>` |

## Release Statement

`<State only what was verified. Do not describe unexecuted checks as passed.>`
