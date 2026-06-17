# Codex exec events 摘要

生成时间：2026-06-07T23:11:58.055Z

工作区：`.`

输入文件：`<tmp>/cc-connect-a-20260608-events.jsonl`, `<tmp>/cc-connect-b-20260608-events.jsonl`

## 汇总

| 指标 | 数值 |
|---|---:|
| event files | 2 |
| succeeded files | 2 |
| failed files | 0 |
| warning files | 0 |
| events | 154 |
| turns | 2 |
| MCP calls | 0 |
| tool calls | 55 |
| total tokens | 2,111,785 |
| input tokens | 2,094,838 |
| output tokens | 16,947 |
| reasoning output tokens | 8,861 |

## 文件明细

| events file | thread | status | events | MCP calls | tool calls | total | input | output | reasoning | last error |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| <tmp>/cc-connect-a-20260608-events.jsonl | 019ea437-c24c-7ba1-985d-abb0d059243e | succeeded | 78 | 0 | 27 | 1,263,420 | 1,254,508 | 8,912 | 4,521 | - |
| <tmp>/cc-connect-b-20260608-events.jsonl | 019ea44a-c40f-70a1-8e0d-b366baaf7d27 | succeeded | 76 | 0 | 28 | 848,365 | 840,330 | 8,035 | 4,340 | - |

## 事件文件对比

基准文件：`<tmp>/cc-connect-a-20260608-events.jsonl`

| events file | status | total | total delta | input delta | output delta | reasoning delta | MCP delta | tool delta | event delta |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| <tmp>/cc-connect-b-20260608-events.jsonl | succeeded | 848,365 | -415,055 (-32.9%) | -414,178 (-33.0%) | -877 (-9.8%) | -181 (-4.0%) | 0 (baseline 0) | +1 (+3.7%) | -2 (-2.6%) |

说明：这段只比较 raw event 摘要，第一个输入文件作为基准；任务质量仍以源码阅读、验证结果和真实任务记录为准。

## 工具与 MCP 分布

| tool | calls |
|---|---:|
| `command_execution: go test ./core` | 7 |
| `command_execution: nl -ba core/engine.go` | 6 |
| `command_execution: nl -ba core/engine_test.go` | 4 |
| `command_execution: git status --short` | 3 |
| `command_execution: pwd` | 2 |
| `command_execution: rg --files core` | 2 |
| `command_execution: rg -n "reply` | 2 |
| `command_execution: gofmt -w core/engine.go` | 2 |
| `command_execution: git diff --` | 2 |
| `command_execution: sed -n '1,240p'` | 2 |
| `command_execution: ai-context-kit.mjs codex-mem search` | 2 |
| `command_execution: nl -ba core/workspace_state.go` | 1 |
| `command_execution: rg -n "compactReplyFooterPath|replyFooterWorkDir|resolveLocalDirPath"` | 1 |
| `command_execution: rg -n \"func` | 1 |
| `command_execution: nl -ba core/workspace_state_test.go` | 1 |
| `command_execution: rg -n "type` | 1 |

## 记录规则

- 这份报告来自 `codex exec --json` 输出事件，不替代源码阅读、测试或 session token 报告。
- status 为 failed 或 warning 的文件只能作为执行失败证据，不能计入真实任务成功样本。
- 错误消息已使用本地规则脱敏；共享前仍需人工复查。
