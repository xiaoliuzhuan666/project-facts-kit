# Domain Index Template

Use this template when a workspace is being initialized and no single business domain has been selected. Keep the first pass shallow and source-backed.

## Workspace

| Item | Value |
| --- | --- |
| Workspace | `<workspace label, repository name, remote URL, or redacted local path>` |
| Shape | `<single repo / parent workspace / unknown>` |
| Repositories | `<repo list>` |
| Generated maps | `<available / missing / stale>` |
| Last checked | `<date + command/source>` |
| Recommended next action | `<choose a domain / repair maps / run verification>` |

## Token Visibility

| Item | Value |
| --- | --- |
| Static token report | `<path / Not run>` |
| Dashboard | `<path / Not run>` |
| Baseline tokens | `<number / UNKNOWN>` |
| Routing or lean context tokens | `<number/range / UNKNOWN>` |
| Static savings | `<percentage / UNKNOWN>` |
| Measurement command | `<command / Not run>` |
| Real task savings | `<percentage / UNKNOWN>` |
| Quality evidence | `<A/B record / verification report / UNKNOWN>` |

## Domain Candidates

| Rank | Candidate domain | Why it matters | Likely repositories | Entry markers | State paths to inspect | First files to read | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `1` | `<domain>` | `<business or technical reason>` | `<repos>` | `<routes/pages/handlers>` | `<states>` | `<files>` | `<commands/manual checks>` | `OBSERVED / UNKNOWN` |

## Workspace Entry Markers

| Marker type | Source | Notes |
| --- | --- | --- |
| Route/API map | `<file or command>` | `<notes>` |
| Page/navigation map | `<file or command>` | `<notes>` |
| Backend route map | `<file or command>` | `<notes>` |
| Jobs/events/consumers | `<file or command>` | `<notes>` |
| Tests/verification | `<file or command>` | `<notes>` |

## Selection Guidance

| User intent | Recommended candidate | Reason | Next report path |
| --- | --- | --- | --- |
| `<intent>` | `<domain>` | `<evidence>` | `<docs/business-domains/domain.md>` |

## Unknowns

| Question | Evidence gap | Suggested next step |
| --- | --- | --- |
| `<question>` | `<gap>` | `<command/file/user decision>` |

## Maintenance Notes

- Update this index after adding or removing major routes, pages, modules, jobs or services.
- Keep candidate ranking short. Detailed source review belongs in a single-domain report.
- Do not record secrets, credentials or environment-specific values.
