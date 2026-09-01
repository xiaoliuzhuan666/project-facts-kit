# SFC-20260901 handover snapshot not diary

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260901-handover-snapshot-not-diary` |
| Status | `applied` |
| Created at | `2026-09-01` |
| Source project | 多仓库业务工作区（已脱敏） |
| Skill | `project-facts-maintainer` |
| Target section | Workflow / Handover Snapshot / AGENTS fragment / `handover/current.md` template |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 同一任务在多个编码软件间切换；`handover/current.md` 被写成数百行流水 |
| Evidence paths | kit `template/project-facts/handover/current.md`、`template/AGENTS.project-facts.fragment.md`、`skills/project-facts-maintainer/SKILL.md` |
| Verification run | `./scripts/check-kit.sh`；`scripts/sync-plugin-skills.sh --check` |
| Reviewer | 用户要求写入 kit，并去掉项目专属信息 |
| Reviewer decision | Accepted and applied |

## Observed Behavior

- Helpful: 仓库内 Markdown 交接可被 Codex / OpenCode / WorkBuddy / Antigravity 等打开同一目录的软件读取。
- Missing: 没有禁止把 `current.md` 当日记，也没有禁止同步聊天记录。
- Misleading: 长 `current.md` 会在每个新会话被整份注入，开场变慢，且把已关闭任务当成当前状态。
- Tool conflict: 各软件会话目录互不相通；同步聊天会污染上下文。

## Why It Should Move Upstream

换编码软件是通用场景。可复用规则是：Git 里保留一页 Continuation Handoff；流水进 `changes/`；过长则 archive。不包含具体业务域、接口、账号或环境。

## Why It Should Stay Local

无。业务任务内容、页面路径、接口字段和环境地址仍留在各业务仓库的 `changes/`。

## Next Action

已写入 Skill、AGENTS 片段和 handover 模板。已接入项目的根 `AGENTS.md` 需把 fragment 合并进 preserved-block 后才会自动遵守。
