# ai-context-kit 真实任务 A/B 审计

生成时间：2026-06-17T00:00:00.000Z

工作区：`.`

记录目录：`docs/real-task-ab`

## 汇总

| 指标 | 数值 |
|---|---:|
| markdown files | 0 |
| candidate records | 0 |
| supporting files | 0 |
| counted records | 0 |
| missing categories | `backend-bug`, `miniapp-integration`, `cross-end-field` |
| process warnings | 0 |

## 三类验证状态

| category | 中文 | status | counted records |
|---|---|---|---|
| `backend-bug` | 后端 bug | missing | - |
| `miniapp-integration` | 小程序联调 | missing | - |
| `cross-end-field` | 跨端字段问题 | missing | - |

## 任务记录

| record file | record id | counted answer | category answer | status | B missed fewer | B fewer tokens | quality down | next verification |
|---|---|---|---|---|---|---|---|---|
| - | - | - | - | - | - | - | - | - |

## 支撑材料

| file | status |
|---|---|
| - | - |

## 流程风险提示

| record file | category | warning |
|---|---|---|
| - | - | - |

## 判定规则

- 只有带“是否计入三类真实任务验证”结论且答案为 `yes` 的记录，才进入 counted records。
- counted records 必须落在 `backend-bug`、`miniapp-integration`、`cross-end-field` 三类之一。
- session、exec-events、patch 等支撑材料不会单独计入任务验证。
- 后端单接口记录如果显示读取本地索引、宽 DTO 搜索或过深后续链路，审计会在“流程风险提示”里列出。
- 公开仓库不随包发布内部真实任务证据；团队使用时应在自己的私有仓库或工作区保存 A/B 记录。
