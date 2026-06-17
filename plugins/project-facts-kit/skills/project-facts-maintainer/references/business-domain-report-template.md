# Business Domain Report Template

Use this template for one business domain at a time. Keep it technology-neutral and source-backed.

## Read First

| Item | Value |
| --- | --- |
| Domain | `<domain>` |
| Workspace | `<workspace label, repository name, remote URL, or redacted local path>` |
| Repositories | `<repos>` |
| Status | `OBSERVED / APPROVED / UNKNOWN / CONFLICT` |
| Last checked | `<date + command/source>` |
| Recommended next reads | `<short list of files>` |

## Entry Points

| Surface | Entry | Source |
| --- | --- | --- |
| User app | `<page/route/action>` | `<file:line or command>` |
| Admin/operator | `<page/route/action>` | `<file:line or command>` |
| Backend | `<endpoint/job/event/consumer>` | `<file:line or command>` |

## Contract Map

| Endpoint/Event | Caller or wrapper | Controller/handler | Request shape | Response shape | Service/mapper | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `<method path or event>` | `<file:symbol>` | `<file:symbol>` | `<DTO/body fields>` | `<DTO/body fields>` | `<file:symbol>` | `<evidence>` |

## Field Contract Risks

| Field area | Risk | Top-level fields | Nested fields | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `<request/response/state>` | `<risk>` | `<fields>` | `<fields>` | `<file:line or command>` | `OBSERVED / UNKNOWN / CONFLICT` |

## Active and Legacy Paths

| Path or symbol | Current use | Legacy or replaced path | Evidence | Action |
| --- | --- | --- | --- | --- |
| `<path>` | `<yes/no/unknown>` | `<path>` | `<file:line or command>` | `<keep/remove/review>` |

## State Paths

Include only states relevant to this domain.

| Scenario | Trigger | State change | Side effects | Failure/cancel/reversal path | Evidence |
| --- | --- | --- | --- | --- | --- |
| `<create/pay/cancel/refund/settle/etc>` | `<entry>` | `<from -> to>` | `<writes/events/balances/inventory>` | `<path>` | `<file:line or command>` |

## Verification

| Check | Command or manual step | Result | Notes |
| --- | --- | --- | --- |
| Static check | `<command>` | `Pass / Fail / Not run` | `<short evidence>` |
| Unit/integration check | `<command>` | `Pass / Fail / Not run` | `<short evidence>` |
| Manual flow | `<step>` | `Pass / Fail / Not run` | `<short evidence>` |

## Token and Quality Evidence

| Item | Value | Source |
| --- | --- | --- |
| Static token dashboard | `<path / Not run>` | `<command or report>` |
| Static savings | `<percentage / UNKNOWN>` | `<command or report>` |
| Real task session savings | `<percentage / UNKNOWN>` | `<session/event source>` |
| Quality down | `no / yes / mixed / unknown` | `<A/B record or verification evidence>` |
| Missed items | `<none/list/unknown>` | `<source>` |

## Unknowns and Decisions Needed

| Item | Status | Evidence | Owner decision needed |
| --- | --- | --- | --- |
| `<question>` | `UNKNOWN / CONFLICT` | `<source>` | `<decision>` |

## Maintenance Notes

- Update this report after behavior-changing work in this domain.
- Keep generated indexes and route maps separate from manually reviewed facts.
- Do not record secrets, tokens, cookies or production credentials.
