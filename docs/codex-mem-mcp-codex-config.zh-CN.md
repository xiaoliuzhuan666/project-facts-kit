# codex-mem MCP 接入说明

整理日期：2026-06-07

## 资料依据

- OpenAI Codex MCP 文档：`https://developers.openai.com/codex/mcp/`
- Codex CLI 配置文档：`https://developers.openai.com/codex/config/`
- MCP 官方 stdio transport：`https://modelcontextprotocol.io/specification/2025-06-18/basic/transports`
- MCP 官方 tools spec：`https://modelcontextprotocol.io/specification/2025-06-18/server/tools`

## 当前能力

`ai-context-kit` v0.3.33 提供：

```bash
ai-context-kit codex-mem mcp --workspace /path/to/workspace
ai-context-kit codex-mem config --workspace /path/to/workspace --output codex-mem-mcp.toml
ai-context-kit codex-mem route --workspace /path/to/workspace --query "order refund"
ai-context-kit codex-mem timeline --workspace /path/to/workspace --limit 20
ai-context-kit codex-mem record --workspace /path/to/workspace --title "Finding" --summary "Short observation"
```

MCP server 暴露这些工具：

- `codex_mem_search`
- `codex_mem_get`
- `codex_mem_route`
- `codex_mem_timeline`
- `codex_mem_record`

## 配置生成

运行：

```bash
packages/ai-context-kit/bin/ai-context-kit.mjs codex-mem config \
  --workspace /path/to/workspace \
  --name codexMem \
  --output codex-mem-mcp.toml
```

生成内容可放入：

- 用户级：`~/.codex/config.toml`
- 项目级：受信任 workspace 的 `.codex/config.toml`

用户级适合个人试用；项目级适合团队把同一个 workspace 的 MCP 配置版本化。放入项目级配置前，需要确认该 workspace 已被 Codex 信任。

## 生成片段示例

```toml
[mcp_servers.codexMem]
command = "/path/to/packages/ai-context-kit/bin/ai-context-kit.mjs"
args = ["codex-mem", "mcp", "--workspace", "/path/to/workspace"]
cwd = "/path/to/workspace"
startup_timeout_sec = 10
tool_timeout_sec = 60
enabled = true
enabled_tools = ["codex_mem_search", "codex_mem_get", "codex_mem_route", "codex_mem_timeline", "codex_mem_record"]
default_tools_approval_mode = "prompt"

[mcp_servers.codexMem.tools.codex_mem_search]
approval_mode = "approve"

[mcp_servers.codexMem.tools.codex_mem_route]
approval_mode = "approve"

[mcp_servers.codexMem.tools.codex_mem_timeline]
approval_mode = "approve"

[mcp_servers.codexMem.tools.codex_mem_get]
approval_mode = "prompt"

[mcp_servers.codexMem.tools.codex_mem_record]
approval_mode = "prompt"
```

`codex_mem_get` 可能读取原始工具输出；`codex_mem_record` 会写入本地 observations，所以默认要求确认。
`codex_mem_search`、`codex_mem_route`、`codex_mem_timeline` 只读本地索引和 ledger，v0.3.27 起默认生成 `approve`。公开样例工作区的 `codex exec` 复测显示 `auto` 会被标为 `user cancelled MCP tool call`，`approve` 可完成 read-only route 调用。

## 已验证

- `codex-mem mcp` 可处理 JSON-RPC stdio 的 `initialize`、`tools/list`、`tools/call`。
- `codex-mem mcp` 同时支持 JSONL smoke 输入和 `Content-Length` framed stdio 输入。
- MCP search/route 在 `.codex-mem/index.jsonl` 缺失时返回空结果，不让 server 退出。
- `check-kit.sh` 覆盖 `search/get/route/timeline/record` smoke test。
- `codex-mem config` 生成的 TOML 片段包含 command、args、enabled_tools 和工具 approval mode。
- 本机 `codex-cli 0.133.0` 下，使用临时 `CODEX_HOME` 运行 `codex mcp add codexMem -- <command>...`，再用 `codex mcp list/get --json` 能读到 stdio server 配置。
- 公开样例工作区本地 MCP route/search 复测通过：纯中文 `设备租用下单归还结算` 可命中 `api-contract` 行，并同时推荐 `example-miniapp` 与 `example-backend`。
- v0.3.21 增加 CLI `codex-mem route --query`，本地复测同一纯中文查询可直接输出相同的仓库推荐和关键接口。
- v0.3.24 增加 CLI `codex-mem timeline --limit`，本地 smoke 已覆盖最近 hook 事件、ref 路径、短 hash 和错误摘要行。
- v0.3.26 增加 CLI `codex-mem record --title --summary`，本地 smoke 已覆盖写入 observation、search 命中和 timeline 展示。
- v0.3.27 将生成配置里的 read-only MCP 工具 `search/route/timeline` approval 改为 `approve`。公开样例工作区的 `codex exec` 复测中，`approve` 下 `codex_mem_route` 成功返回结构化结果。
- v0.3.30 起，顶层 `ai-context-kit init` 会同时生成 `.codex-mem/index.jsonl`；新 workspace 初始化后可直接使用 `codex-mem route/search`。它不会安装 hooks，也不会启用 compress。

## 未验证

- 尚未把片段写入真实 `~/.codex/config.toml` 或项目 `.codex/config.toml`。
- `codex exec` 真实会话已能调用 `codexMem/codex_mem_search`。v0.3.15 复测结果：tool call completed，模型看到空结果；空结果原因是当时 project-facts-kit 本身未初始化 `.codex-mem/index.jsonl`。v0.3.30 已把顶层 `init` 改为同时写入该索引。
- 临时 workspace 非空索引复测已通过：AGENTS.md 中写入 `codex-mem-real-search-marker`，运行 `codex-mem init` 后，真实 `codex exec` 调用 `codex_mem_search` 返回 `AGENTS.md` 命中。CLI 显示 `tokens used 20,002`。
- 真实 exec 结束时仍可能出现 rmcp shutdown warning，例如旧 HTTP MCP server 或进程组清理提示；本次工具调用阶段显示 `mcp: codexMem/codex_mem_search (completed)`。
- 真实 `codex exec` 会消耗模型 tokens，不放入自动检查；常规检查保留本地 smoke test 和临时 `CODEX_HOME` 注册验证。
- v0.3.18 在公开样例工作区尝试两次真实 `codex exec`，都因本机 Codex 使用的 OpenAI API key 401，在模型请求阶段失败，没有进入 MCP 工具调用。
- v0.3.21 在公开样例工作区再尝试两次真实 `codex exec`：第一次模型启动并尝试调用 `codex_mem_route/search`，但两个 MCP 调用都被 Codex 标为 `user cancelled MCP tool call`；第二次使用 `--ignore-user-config` 后在模型请求阶段失败，OpenAI API key 401。两次都不记为 MCP 真实成功样本。
- v0.3.26 在公开样例工作区再尝试两次真实 `codex exec`，均通过 `-c` 临时注入 `codexMem` 配置，模型都进入 `mcp_tool_call` 并尝试调用 `codex_mem_route`，但结果仍是 `user cancelled MCP tool call`。第二次显式设置 `codex_mem_route/search/timeline` 的 `approval_mode="auto"` 后仍失败。该失败已用 `codex-mem record` 写入本地 observations。
- v0.3.26 第三次真实 `codex exec` 把 `codex_mem_route/search/timeline` 的 `approval_mode` 改为 `approve` 后成功：`codex_mem_route` 返回 `example-miniapp` score `93`、`example-backend` score `85`，前三个命中为样例 API wrapper 和后端处理入口。该成功样本已写入本地 observations。
- 尚未用业务项目真实任务 A/B 证明 MCP 检索能减少漏项或 token；需要先解决真实 exec 的 MCP 审批/鉴权问题，再重跑公开样例工作区纯中文 exec。

下一步应先在一个临时 workspace 做真实 Codex 接入验证，再进入公开样例工作区或团队私有业务项目 A/B。
