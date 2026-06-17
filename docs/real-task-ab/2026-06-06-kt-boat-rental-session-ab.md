# Codex session token 统计

生成时间：2026-06-07T14:33:56.579Z

工作区：`.`

Codex home：`../../../.codex`

时间窗口：最近 30 天

筛选 session：`019e9c54-6953-70c0-9b81-35fe52a24eef`, `019e9c5a-b63b-7e31-829b-ed4e98831559`, `019e9d5b-8de9-7490-b20a-3d308e9202cf`

## 汇总

| 指标 | 数值 |
|---|---:|
| sessions | 3 |
| total tokens | 6,011,636 |
| input tokens | 5,967,166 |
| cached input tokens | 5,328,896 |
| output tokens | 44,470 |
| reasoning output tokens | 15,274 |
| tool calls | 197 |

## 会话明细

| 开始时间 | session | source | total | input | cached input | output | reasoning | tools | 耗时 | prompt |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 2026-06-06 09:47:18Z | `019e9c54-6953-70c0-9b81-35fe52a24eef` | exec | 2,442,461 | 2,426,118 | 2,169,728 | 16,343 | 6,507 | 63 | 395.5s | 看一下小程序里面电动船租赁下单和归还结算链路，分析是否还有改进的地方，包含前后端。请把最终答案写入 <kt-workspace>/docs/codex-ab-boat-a-natural-answer.md。 |
| 2026-06-06 09:54:11Z | `019e9c5a-b63b-7e31-829b-ed4e98831559` | exec | 2,054,960 | 2,040,352 | 1,878,784 | 14,608 | 2,926 | 95 | 268.1s | 看一下小程序里面电动船租赁下单和归还结算链路，分析是否还有改进的地方，包含前后端。  请按低 token 路由执行：先读 <kt-workspace>/AGENTS.md、<kt-workspace>/docs/ai-context-works |
| 2026-06-06 14:34:43Z | `019e9d5b-8de9-7490-b20a-3d308e9202cf` | exec | 1,514,215 | 1,500,696 | 1,280,384 | 13,519 | 5,841 | 39 | 384.7s | 只读分析，不修改任何业务代码。只测试“电动船租赁下单和归还结算”这一条跨前后端流程，评估新版契约索引命令是否能减少漏项。  必须先执行： <project-facts-kit>/packages/ai-context-kit/bin/ai-context-kit |

## 选中会话对比

基准 session：`019e9c54-6953-70c0-9b81-35fe52a24eef`

| session | total | total delta | input delta | cached input delta | output delta | reasoning delta | tools delta | duration delta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `019e9c5a-b63b-7e31-829b-ed4e98831559` | 2,054,960 | -387,501 (-15.9%) | -385,766 (-15.9%) | -290,944 (-13.4%) | -1,735 (-10.6%) | -3,581 (-55.0%) | +32 (+50.8%) | -127.4s (-32.2%) |
| `019e9d5b-8de9-7490-b20a-3d308e9202cf` | 1,514,215 | -928,246 (-38.0%) | -925,422 (-38.1%) | -889,344 (-41.0%) | -2,824 (-17.3%) | -666 (-10.2%) | -24 (-38.1%) | -10.9s (-2.7%) |

## 工具调用分布

| 工具 | 次数 |
|---|---:|
| `exec_command` | 197 |

## A/B 使用方式

1. A 组和 B 组都从同一个 workspace 打开 Codex。
2. 任务结束后运行 `ai-context-kit codex-mem sessions --workspace .`。
3. 按 session id 对比 total/input/cached/output/reasoning/tool calls。
4. 质量检查通过后，再把 token 变化当作有效结果。
