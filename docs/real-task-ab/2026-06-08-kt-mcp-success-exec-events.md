# KT MCP 成功 exec events 摘要

生成时间：2026-06-07T16:59:52.114Z

工作区：`.`

输入文件：`<tmp>/kt-mcp-boat-v2-events.jsonl`

## 汇总

| 指标 | 数值 |
|---|---:|
| event files | 1 |
| succeeded files | 1 |
| failed files | 0 |
| warning files | 0 |
| events | 8 |
| turns | 1 |
| MCP calls | 2 |
| tool calls | 0 |
| total tokens | 71,783 |
| input tokens | 70,564 |
| output tokens | 1,219 |
| reasoning output tokens | 592 |

## 文件明细

| events file | thread | status | events | MCP calls | tool calls | total | input | output | reasoning | last error |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| <tmp>/kt-mcp-boat-v2-events.jsonl | 019e9de2-69e4-71a2-9a94-7c3a322836ed | succeeded | 8 | 2 | 0 | 71,783 | 70,564 | 1,219 | 592 | - |

## 工具与 MCP 分布

| tool | calls |
|---|---:|
| `codex_mem_route` | 1 |
| `codex_mem_search` | 1 |

## 记录规则

- 这份报告来自 `codex exec --json` 输出事件，不替代源码阅读、测试或 session token 报告。
- status 为 failed 或 warning 的文件只能作为执行失败证据，不能计入真实任务成功样本。
- 这是 MCP 入口定位成功样本，不等同完整业务 A/B。
