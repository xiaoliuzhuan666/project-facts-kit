## Project Facts Check

- [ ] This change does not affect user behavior, API/data, permissions, or release behavior; or a related change record is linked below.
- [ ] Affected requirement IDs are listed: `<REQ IDs or N/A>`.
- [ ] Explicit non-goals are recorded for behavior-changing work.
- [ ] `UNKNOWN` or `CONFLICT` items with High/Blocker impact are resolved or this PR is not proposed for merge.
- [ ] Executed verification is recorded in `evidence.md`; unexecuted verification is marked `Not run`.

Change record: `project-facts/changes/<change>/`

Reviewers:

- Domain owner: `<required when business behavior changes>`
- Technical reviewer: `<required when implementation or contract changes>`

## Skill Feedback Check

- [ ] This PR does not change shared Agent Skills; or accepted candidate feedback is linked below.
- [ ] Skill changes are based on real task evidence, not only an AI summary.
- [ ] Project-specific business rules were not copied into a shared Skill.
- [ ] `git diff --check` was run in this repository; changes to the shared kit itself (skills, templates, install scripts) also ran `./scripts/check-kit.sh` in the kit repository, or the reason is recorded.

Skill feedback candidate: `<docs/skill-iteration-backlog.zh-CN.md row, docs/skill-feedback path, or N/A>`

- Tool/library owner: `<required when skills, templates, install scripts, or AI rules change>`
