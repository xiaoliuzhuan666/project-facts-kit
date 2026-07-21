# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260721-real-task-audit-401-heuristic` |
| Status | `proposed` |
| Created at | `2026-07-21` |
| Source project | `project-facts-kit` |
| Skill | `ai-context-kit` |
| Target section | `real-task-audit` status heuristic |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 2026-07-20 登记崆峒回溯 A/B 记录时，7-19 记录被审计误标为 `not counted: exec failed` |
| Evidence paths | `packages/ai-context-kit/bin/ai-context-kit.mjs`（`realTaskAuditStatus`）；`docs/real-task-ab/2026-07-19-kt-h5-reservation-contact-prefill.md` |
| Verification run | 2026-07-20 复现：记录正文含"应用级 401"字样时审计输出 `exec failed`；改写措辞后恢复 `partial evidence`。修复本身的验证：Not run（候选待接受） |
| Reviewer | Pending |
| Reviewer decision | Pending |

## Observed Behavior

- Misleading: `realTaskAuditStatus` 对记录全文做子串匹配，正文任何位置出现 "401"（包括"接口匿名访问被应用级鉴权拒绝"这类正常观测）都把记录归类为执行失败，与真正的 `partial evidence` 混淆。
- Helpful: 对真正的额度/鉴权失败记录（如 cc-connect 的 stderr 401）分类正确。

## Why It Should Move Upstream

审计状态是真实任务 A/B 证据链的入口，误分类会污染 counted 统计口径。这是通用工具缺陷，与任何业务项目无关。

## Why It Should Stay Local

不涉及业务规则。建议修复方向：把失败检测从全文收窄到"执行失败记录"小节，或改用更精确的模式（stderr 路径、out of credits、exec 命令上下文）。属于 CLI 内部实现，不改变记录格式。

## Implementation Note

修复需单独 PR，并增加一条正文含 "401" 字样的非失败记录作为回归样例。
