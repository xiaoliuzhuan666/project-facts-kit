# Skill Feedback Candidate

## Summary

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-<YYYYMMDD>-<short-name>` |
| Created at | `<YYYY-MM-DD>` |
| Source project | `<repository or workspace name>` |
| Source task | `<task, issue, PR or change path>` |
| Skill | `<skill name>` |
| Target section | `<section title or UNKNOWN>` |
| Candidate status | `proposed` |
| Proposed action | `improve_skill / new_skill / split_skill / archive_or_review / tooling_fix` |
| Owner | `<person or team>` |

## Evidence

| Evidence type | Source | Status | Notes |
| --- | --- | --- | --- |
| Task prompt | `<path, PR, issue or local note>` | `OBSERVED` | `<short note>` |
| Files or commands used | `<paths or commands>` | `OBSERVED` | `<short note>` |
| Verification result | `<command or evidence path>` | `Pass / Fail / Not run` | `<reason if not run>` |
| User or reviewer decision | `<path, PR or approval>` | `APPROVED / UNKNOWN` | `<short note>` |

## Privacy And Redaction

| Check | Status | Notes |
| --- | --- | --- |
| Contains no business data, user data, customer data or production data | `yes / no / unknown` | `<short note>` |
| Contains no request or response bodies, raw logs, database rows or trace dumps | `yes / no / unknown` | `<short note>` |
| Contains no API keys, tokens, cookies, passwords, private keys or production env values | `yes / no / unknown` | `<short note>` |
| Raw evidence was redacted before being summarized | `yes / no / not-needed` | `<redacted path or reason>` |

Only record repository-relative paths, symbols, commands, validation status and a short sanitized summary. If raw logs, API responses, stderr, Codex events or task traces are needed, run `ai-context-kit redact --input <raw-file> --output <redacted-file>` first and review the result. When safety is unclear, keep the raw evidence local and cite its path plus summary instead of copying it here.

## Observed Skill Behavior

- Useful behavior: `<what helped, or Not observed>`
- Missing behavior: `<what was not covered, or Not observed>`
- Misleading behavior: `<what caused a wrong path, or Not observed>`
- Tool conflict: `<generated artifact or command mismatch, or Not observed>`

## Proposed Change

`<Describe the skill or tooling change in one short paragraph. Do not write project-specific business facts as shared skill rules.>`

## Applicability

| Question | Answer |
| --- | --- |
| Repeats across more than one task or project? | `yes / no / unknown` |
| Project-specific rule? | `yes / no / unknown` |
| Could it change business approval meaning? | `yes / no / unknown` |
| Needs tool or CLI change instead of skill text? | `yes / no / unknown` |

## Review

| Reviewer | Decision | Date | Notes |
| --- | --- | --- | --- |
| Tool owner | `Pending / Accepted / Rejected / Needs evidence` | `<YYYY-MM-DD>` | `<notes>` |

## Upstream Tracking

| Field | Value |
| --- | --- |
| Skill repository candidate path | `<docs/skill-feedback/... or Not submitted>` |
| PR | `<url or Not opened>` |
| Applied in | `<commit or Not applied>` |
