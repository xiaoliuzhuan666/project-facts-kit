# cc-connect 后端路径与回复 footer 真实任务记录

记录日期：2026-06-07

## 基本信息

| 字段 | 内容 |
| --- | --- |
| Record ID | `2026-06-07-cc-connect-backend-path-footer` |
| Task type | `backend-bug` |
| Workspace | 原仓库：`<cc-connect-workspace>`；验证副本：`<tmp>/cc-connect-ab` |
| Repos involved | `cc-connect` |
| Revision checked | 原仓库 `main`，存在无关改动：`web/tsconfig.tsbuildinfo`、`.workbuddy/`、`PROJECT-ANALYSIS.md`；验证副本排除 `.git`、`.workbuddy`、`web/tsconfig.tsbuildinfo` 后重新 `git init` |
| ai-context-kit version | `ai-context-kit 0.3.41` |
| Prompt | 修复 `go test ./core` 中 reply footer 工作目录显示和 `resolveLocalDirPath` 路径解析失败 |
| Expected task output | 找到相关 Go 文件，修复通用路径显示/解析问题，相关测试和 `go test ./core` 通过 |
| Index status | 原仓库 `doctor`：`AGENTS.md` ok，缺 `project-facts/*`、scope report 和 `.codex-mem/index.jsonl`；v0.3.41 已识别 `tech: go` |
| Non-goals | 不改平台业务逻辑；不为 `cc-connect` 文件名或测试名加入特殊规则；不改原仓库无关 dirty 文件 |

## 分组结果

| Group | Context tools used | Files read | Contract coverage | Verification | Tokens | Tool calls | Duration | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 直接在原仓库运行 `go test ./core` | `AGENTS.md`，测试失败输出 | n/a | Fail：footer 路径、`resolveLocalDirPath` 失败 | Not measured | Not counted | Not counted | 只作为基线失败证据 |
| B | `doctor`、`agents`、`codex-mem route/search`、`rg`、源码阅读 | `AGENTS.md`、`project-facts/verification.md`、`core/engine.go`、`core/engine_test.go` | n/a | Pass：相关测试和 `go test ./core` 均通过 | Not measured | Not counted | Not counted | 完成真实后端 bug 流程验证，但不是完整 token A/B |
| C | Not run | Not run | n/a | Not run | Not run | Not run | Not run | 未测试 MCP/compress/refs |

## 质量判定

| 检查项 | A | B | C | Notes |
| --- | --- | --- | --- | --- |
| 选对仓库 | yes | yes | n/a | `doctor` 在 v0.3.41 显示 `cc-connect` 为 `tech: go` |
| 选对入口文件 | partial | yes | n/a | `route/search` 给到仓库和验证文件级提示；函数级定位仍靠 `rg` 找 `replyFooterWorkDir`、`compactReplyFooterPath`、`resolveLocalDirPath` |
| 前端当前路径已核对 | n/a | n/a | n/a | 后端 Go/core 测试任务 |
| 后端 Controller 路径已核对 | n/a | n/a | n/a | 非 HTTP Controller 任务 |
| 请求 DTO 字段已核对 | n/a | n/a | n/a | 非 DTO 任务 |
| 响应 DTO 字段已核对 | n/a | n/a | n/a | 非 DTO 任务 |
| 同页面相关接口已查看 | n/a | n/a | n/a | 非跨端任务 |
| 状态、支付、失败或取消路径已查看 | n/a | n/a | n/a | 非订单/支付任务 |
| 修改或建议可复用到通用项目 | yes | yes | n/a | v0.3.41 增加 Go 项目识别；cc-connect 修复使用通用路径处理，不匹配项目名 |
| 漏项 | A 未继续定位 | B 无已知漏项；但缺独立 A/B token 数据 | n/a | 不能据此证明 token 下降 |

## 验证命令

| Command | Result |
| --- | --- |
| `<project-facts-kit>/packages/ai-context-kit/bin/ai-context-kit.mjs doctor --workspace <cc-connect-workspace>` | Pass；v0.3.41 显示 `tech: go`，并报告缺 `project-facts/*`、scope report、`.codex-mem/index.jsonl` |
| `go test ./core` in `<cc-connect-workspace>` | Fail；footer 路径显示为 `…/codes/cc-connect`，期望 `~/codes/cc-connect`；`resolveLocalDirPath` 返回 `/private/var/...`，期望 `/var/...` |
| `ai-context-kit agents --workspace <tmp>/cc-connect-ab` | Pass；保留已有 `AGENTS.md`，生成 `project-facts/*`、scope report、`.codex-mem/index.jsonl` |
| `ai-context-kit codex-mem route --workspace <tmp>/cc-connect-ab --query "Go core failing tests reply footer workdir resolveLocalDirPath" --limit 8` | Pass；推荐 Go 仓库和项目验证文件；未达到函数级源码定位 |
| `go test ./core -run 'TestCmdDiff_FileSenderPath\|TestCmdDiff_PlainTextFallback\|TestProcessInteractiveEvents_AppendsReplyFooterWhenEnabled\|TestProcessInteractiveEvents_AppendsContextIndicatorInsideReplyFooter\|TestProcessInteractiveEvents_ToolSegmentsKeepFinalFooter\|TestProcessInteractiveEvents_ReplyFooterPrefersSessionRuntimeState\|TestResolveLocalDirPath_AcceptsSubdir'` | Pass |
| `go test ./core` in `<tmp>/cc-connect-ab` | Pass：`ok github.com/chenhg5/cc-connect/core 12.031s` |

## 修复摘要

- `compactReplyFooterPath` 先按用户可见的 `HOME` 路径判断 `~`，再使用归一化路径处理真实路径相等的情况，避免 macOS `/var` 与 `/private/var` 造成 footer 退化成 `…/codes/cc-connect`。
- `resolveLocalDirPath` 继续用真实路径做越界检查，但返回清理后的用户可见路径，避免相对子目录从 `/var/...` 变成 `/private/var/...`。
- `cmdDiff` 在 `diff2html` 缺失时，将安装提示和 plain diff 放在同一条回复中，避免异步测试或用户只看到提示没有看到 diff。

## Token 与证据来源

| Source | Path or command | Notes |
| --- | --- | --- |
| Session usage | Not measured | 当前记录不是独立 Codex A/B session |
| Hook ledger | Not run | 未启用 observe/compress hooks |
| Timeline | Not run | 未用 `codex-mem record` 写入临时副本 |
| Ref readback | Not run | 未测试 compress refs |
| Patch evidence | `docs/real-task-ab/2026-06-07-cc-connect-backend-path-footer.patch` | 从临时副本与原仓库 `core/engine.go` 差异提取；原仓库未写入 |
| Exec events raw | `docs/real-task-ab/2026-06-08-cc-connect-a-events.redacted.jsonl` | A 组 raw events 的脱敏副本；原始文件在 `<tmp>/cc-connect-a-events.jsonl` |
| Exec events summary | `docs/real-task-ab/2026-06-08-cc-connect-exec-events.md` | 用 v0.3.43 `codex-mem exec-events` 从脱敏 raw events 生成 |

## 2026-06-08 Codex exec A/B 尝试

| Item | Evidence |
| --- | --- |
| A workspace | `<tmp>/cc-connect-a`，基线提交 `6d79f83 baseline`，执行前后 `git status --short` 均为空 |
| B workspace | `<tmp>/cc-connect-b`，基线提交 `10c7a5e baseline`，已生成 workflow artifacts，执行前 `git status --short` 为空 |
| A command | `codex exec --sandbox workspace-write --cd <tmp>/cc-connect-a --json -o <tmp>/cc-connect-a-last.txt ... > <tmp>/cc-connect-a-events.jsonl` |
| A result | Fail before tool use；`<tmp>/cc-connect-a-events.jsonl` 只有 `thread.started`、`turn.started`、5 次 reconnect 和 `turn.failed` |
| A exec-events report | `docs/real-task-ab/2026-06-08-cc-connect-exec-events.md`；failed files `1`，MCP calls `0`，tool calls `0`，total tokens `0` |
| Failure message | `Your workspace is out of credits. Ask your workspace owner to refill in order to continue.` |
| B result | Not run；B 会遇到同一额度限制，未继续消耗请求 |
| Counted as A/B | no；没有源码阅读、文件修改、测试执行或 token usage |

后续恢复额度后，复用相同 A/B 临时工作区或重新复制原仓库，再运行同一语义任务。A 组禁止使用 `ai-context-kit`，B 组先使用已生成的 `AGENTS.md`、project-facts 和 `codex-mem route/search`。完成后再用 `codex-mem sessions --session <A> --session <B>` 写 token 对比。

## 结论

| Question | Answer |
| --- | --- |
| 是否计入三类完整真实任务 A/B | no |
| 计入哪一类 | `backend-bug` 流程验证候选 |
| B 相比 A 是否减少漏项 | yes，B 组发现并修复了 footer/path 失败后，又通过全量测试发现并修复 `diff2html` 缺失时的异步回复顺序问题 |
| B 相比 A 是否减少 token | unknown |
| 质量是否下降 | no evidence；相关测试和 `go test ./core` 已通过 |
| 需要修改工具吗 | yes，已把 Go 仓库识别加入 v0.3.41 |
| 如果修改，属于通用规则还是项目专用 | generic |
| 后续验证 | 需要在 Codex workspace 恢复额度后重跑独立 A/B session；需要再完成小程序联调和跨端字段完整任务 |
