# ai-context-kit 真实任务 A/B 审计

生成时间：2026-06-08T03:56:17.911Z

工作区：`.`

记录目录：`docs/real-task-ab`

## 汇总

| 指标 | 数值 |
|---|---:|
| markdown files | 6 |
| candidate records | 2 |
| supporting files | 4 |
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
| `docs/real-task-ab/2026-06-06-kt-boat-rental-cross-end-field.md` | 2026-06-06-kt-boat-rental-cross-end-field | no | 暂不计入；可作为 cross-end-field 局部证据 | not counted: partial evidence | mixed | yes | unknown；没有构建、接口联调或真实支付证据 | 用 v0.3.39+ 刷新临时或真实授权工作区后，重跑跨端字段完整任务；另外增加后端 bug 和小程序联调各一条 |
| `docs/real-task-ab/2026-06-07-cc-connect-backend-path-footer.md` | 2026-06-07-cc-connect-backend-path-footer | no | backend-bug 流程验证候选 | not counted: exec failed | yes，B 组发现并修复了 footer/path 失败后，又通过全量测试发现并修复 diff2html 缺失时的异步回复顺序问题 | unknown | no evidence；相关测试和 go test ./core 已通过 | 需要在 Codex workspace 恢复额度后重跑独立 A/B session；需要再完成小程序联调和跨端字段完整任务 |

## 支撑材料

| file | status |
|---|---|
| `docs/real-task-ab/2026-06-06-kt-boat-rental-session-ab.md` | missing conclusion |
| `docs/real-task-ab/2026-06-08-cc-connect-exec-events.md` | missing conclusion |
| `docs/real-task-ab/2026-06-08-cc-connect-real-ab-exec-events.md` | missing conclusion |
| `docs/real-task-ab/2026-06-08-kt-mcp-success-exec-events.md` | missing conclusion |

## 流程风险提示

| record file | category | warning |
|---|---|---|
| - | - | - |

## 判定规则

- 只有带“是否计入三类真实任务验证”结论且答案为 `yes` 的记录，才进入 counted records。
- counted records 必须落在 `backend-bug`、`miniapp-integration`、`cross-end-field` 三类之一。
- session、exec-events、patch 等支撑材料不会单独计入任务验证。
- 后端单接口记录如果显示读取本地索引、宽 DTO 搜索或过深后续链路，审计会在“流程风险提示”里列出。
- 这份审计只检查记录是否满足计入声明；任务质量仍以记录中的源码阅读、验证命令和失败证据为准。
