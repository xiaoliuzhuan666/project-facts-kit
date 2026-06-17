# ai-context-kit 真实任务 A/B 记录模板

整理日期：2026-06-07

这份模板用于判断 `ai-context-kit` 是否真的帮助 agent 更准、更省、更少漏项。它只记录真实开发任务，不记录单纯 smoke test。

## 计入条件

一条记录只有同时满足下面条件，才计入真实任务 A/B：

- 任务来自真实项目需求、bug、联调或字段问题，不是为测试工具专门构造的玩具项目。
- 至少包含两个对比组，并且任务 prompt 语义一致。
- 写明 workspace、commit 或 worktree 状态、`ai-context-kit` 版本、索引状态和 stale warning。
- 记录 agent 读到的关键文件、命中的接口/DTO/页面、遗漏项和最终判断。
- 记录验证结果。未执行构建、测试、接口联调或真实支付时，必须写 `Not run`。
- `codex exec`、MCP、构建或测试如果启动失败，也要记录事件文件、错误信息、是否读过源码、是否改过文件，并标明不计入 A/B。
- 任何工具修改都来自通用失败模式，不能加入只服务某个项目、页面或 endpoint 的特殊规则。

## 推荐分组

| 组别 | 说明 | 可用能力 |
| --- | --- | --- |
| A | 对照组：普通 Codex 工作方式 | 只读现有项目说明和源码，不使用 `ai-context-kit` route/contracts/search |
| B | 默认流程组 | `doctor`、`route`、`contracts`、项目 `AGENTS.md`、project-facts |
| C | 实验能力组 | 在 B 的基础上加入 MCP、observe hooks、compress refs 或 graph |

C 组只用于验证候选能力。没有真实 A/B 前，不能把 compress、外部 memory、SQLite/FTS 设为默认流程。

## 记录表

| 字段 | 内容 |
| --- | --- |
| Record ID | `<YYYY-MM-DD>-<workspace>-<task>` |
| Task type | `backend-bug / miniapp-integration / cross-end-field` |
| Workspace | `<workspace label or redacted local path; avoid committing personal absolute paths>` |
| Repos involved | `<frontend repo>, <backend repo>, ...` |
| Revision checked | `<commit sha or dirty worktree description>` |
| ai-context-kit version | `<ai-context-kit --version>` |
| Prompt | `<same task prompt for each group>` |
| Expected task output | `<fix / analysis / verification / risk list>` |
| Index status | `<doctor result, stale warnings, whether init was run>` |
| Non-goals | `<what this task must not change>` |

## 分组结果

| Group | Context tools used | Files read | Contract coverage | Verification | Tokens | Tool calls | Duration | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | `<commands or none>` | `<paths>` | `<endpoint/DTO/page checked or missed>` | `<Pass/Fail/Not run>` | `<input/output/reasoning/total>` | `<count>` | `<time>` | `<quality notes>` |
| B | `<route/contracts/search/...>` | `<paths>` | `<endpoint/DTO/page checked or missed>` | `<Pass/Fail/Not run>` | `<input/output/reasoning/total>` | `<count>` | `<time>` | `<quality notes>` |
| C | `<experimental tools>` | `<paths>` | `<endpoint/DTO/page checked or missed>` | `<Pass/Fail/Not run>` | `<input/output/reasoning/total>` | `<count>` | `<time>` | `<quality notes>` |

## 质量判定

| 检查项 | A | B | C | Notes |
| --- | --- | --- | --- | --- |
| 选对仓库 | `<yes/no>` | `<yes/no>` | `<yes/no/na>` | `<evidence>` |
| 选对入口文件 | `<yes/no>` | `<yes/no>` | `<yes/no/na>` | `<evidence>` |
| 前端当前路径已核对 | `<yes/no/na>` | `<yes/no/na>` | `<yes/no/na>` | `<evidence>` |
| 后端 Controller 路径已核对 | `<yes/no/na>` | `<yes/no/na>` | `<yes/no/na>` | `<evidence>` |
| 请求 DTO 字段已核对 | `<yes/no/na>` | `<yes/no/na>` | `<yes/no/na>` | `<evidence>` |
| 响应 DTO 字段已核对 | `<yes/no/na>` | `<yes/no/na>` | `<yes/no/na>` | `<evidence>` |
| 同页面相关接口已查看 | `<yes/no/na>` | `<yes/no/na>` | `<yes/no/na>` | `<evidence>` |
| 状态、支付、失败或取消路径已查看 | `<yes/no/na>` | `<yes/no/na>` | `<yes/no/na>` | `<evidence>` |
| 修改或建议可复用到通用项目 | `<yes/no>` | `<yes/no>` | `<yes/no/na>` | `<evidence>` |
| 漏项 | `<items>` | `<items>` | `<items>` | `<what was missed>` |

## Token 与证据来源

| Source | Path or command | Notes |
| --- | --- | --- |
| Session usage | `ai-context-kit codex-mem sessions --workspace <path>` | `<session row or report path>` |
| Hook ledger | `<workspace>/.codex-mem/ledger.jsonl` | `<observe/compress only>` |
| Timeline | `ai-context-kit codex-mem timeline --workspace <path> --limit 20` | `<important observations or refs>` |
| Ref readback | `ai-context-kit codex-mem get --workspace <path> --ref <ref>` | `<only when compress is tested>` |
| Local record | `ai-context-kit codex-mem record --workspace <path> --title "<title>" --summary "<summary>" --tag real-task-ab` | `<observation id or summary>` |
| Exec events | `ai-context-kit codex-mem exec-events --workspace <path> --events <events.jsonl>` | `<thread/status/MCP/tool/usage/error summary>` |
| Failed exec stderr | `<path/to/stderr.log>` | `<401 / out of credits / MCP approval / sandbox / test command failure>` |

## 执行失败记录

| Item | Evidence |
| --- | --- |
| Group | `<A/B/C>` |
| Command | `<codex exec / build / test / MCP command>` |
| Event or stderr path | `<path>` |
| Failure message | `<exact short message>` |
| Source read before failure | `<yes/no + files>` |
| Files changed before failure | `<yes/no + git status>` |
| Counted as A/B | `no` |

## 结论

| Question | Answer |
| --- | --- |
| 是否计入三类真实任务验证 | `<yes/no>` |
| 计入哪一类 | `<backend-bug / miniapp-integration / cross-end-field>` |
| B 相比 A 是否减少漏项 | `<yes/no/mixed>` |
| B 相比 A 是否减少 token | `<yes/no/mixed>` |
| 质量是否下降 | `<yes/no/unknown>` |
| 需要修改工具吗 | `<yes/no>` |
| 如果修改，属于通用规则还是项目专用 | `<generic/project-specific>` |
| 后续验证 | `<next task or Not run>` |

## 不可计入示例

- 只跑 `doctor`、`contracts`、`route`，没有完整任务输出和验证结果。
- 只在临时玩具仓库里证明扫描规则生效。
- A/B prompt 不一致，或者不同组的任务范围明显不同。
- 只证明 token 下降，但漏掉 DTO、状态、支付或失败路径。
- 修改规则只匹配某个真实项目的文件名、接口名或业务词，不能复用于其他前后端项目。
