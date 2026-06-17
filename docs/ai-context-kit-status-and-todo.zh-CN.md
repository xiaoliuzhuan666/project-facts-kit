# ai-context-kit 当前状态与待办

整理日期：2026-06-08

## 资料来源

- `docs/codex-low-token-tooling-research.zh-CN.md`
- `docs/codex-mem-adapter-design.zh-CN.md`
- `docs/codex-mem-mcp-codex-config.zh-CN.md`
- `docs/ai-context-kit-real-task-ab-template.zh-CN.md`
- `docs/ai-context-kit-real-task-ab-audit.md`
- `docs/real-task-ab/2026-06-06-kt-boat-rental-cross-end-field.md`
- `docs/real-task-ab/2026-06-06-kt-boat-rental-session-ab.md`
- `docs/real-task-ab/2026-06-07-cc-connect-backend-path-footer.md`
- `docs/real-task-ab/2026-06-08-cc-connect-a-events.redacted.jsonl`
- `docs/real-task-ab/2026-06-08-cc-connect-exec-events.md`
- `docs/real-task-ab/2026-06-08-cc-connect-real-ab-exec-events.md`
- `docs/real-task-ab/2026-06-08-kt-mcp-success-exec-events.md`
- `<kt-workspace>/docs/codex-ab-boat-comparison.md`
- `packages/ai-context-kit/bin/ai-context-kit.mjs`
- `scripts/check-kit.sh`
- `skills/low-token-context-maintainer/SKILL.md`

## 原始目标

团队主要在 Codex app 中从多仓库父目录打开项目。目标是让 agent 更快选对仓库和文件，减少无关上下文、重复源码阅读和长工具输出，同时不牺牲跨前后端问题分析质量。

第一阶段不替换 Codex app，不直接引入外部 memory 平台。主路径是 `AGENTS.md + project-facts + ai-context-kit + CodeGraph 按需查询 + token/session 统计`。

## 已实现功能

### 项目事实与安装

- `scripts/install-project-facts.sh` 支持完整模板和 `--lite` 模式。
- 安装脚本不覆盖已有 `project-facts/`、已有 helper 脚本和已有 skill 目录。
- `scripts/sync-skills.sh` 支持同步项目内 skill，但不覆盖已有 `AGENTS.md` 和已有 skill。
- 模板包含项目摘要、术语、当前计划、规格、变更、决策、交接和 GitHub 规则片段。

### 多仓库上下文生成

- `ai-context-kit doctor` 检查目标 workspace。
- `ai-context-kit init` 生成父目录 `AGENTS.md`、`docs/ai-context-workspace-map.md`、`docs/ai-context-api-contract-map.md`，并为子仓库生成短 `AGENTS.md` 和轻量 `project-facts/`。
- `facts` 只生成子仓库 `project-facts/`。
- `agents` / `repair` 按当前 workspace 缺失项生成 workflow artifacts；只有 AGENTS 缺失时只写 AGENTS，docs、project-facts 或 `.codex-mem/index.jsonl` 缺失时也会生成对应材料。
- 生成文件默认不覆盖非 generated 项目事实。
- 生成内容会排除敏感配置、高 token 构建产物、依赖目录、UI 库、监控插件、SQL 目录和 VM 模板等常见高噪声路径。

### Token 测量与看板

- `measure` 生成 `docs/ai-context-scope-report.md`。
- `tokens` 通过 `repomix@latest` 生成 token 测量报告。
- `summary` 从最新 token 报告打印摘要。
- `dashboard` 从 token 报告生成 `docs/ai-context-token-dashboard.md`。
- 小仓库可能出现索引大于源码的情况，文档已明确不能把节省当固定结果。

### API 契约索引

- Java 后端会生成 `project-facts/backend-route-controller-map.md` 和 `project-facts/api-contract-map.md`。
- uni-app/Vue 前端会生成 `project-facts/api-endpoints.md` 和 `project-facts/applet-route-api-map.md`。
- 父目录会生成 `docs/ai-context-api-contract-map.md`，把前端 endpoint、API wrapper、页面调用 payload 字段、后端 Controller、请求 DTO 字段、字段差异提示和响应类型放在同一张表里。
- Spring class-level mapping 与 method-level mapping 已做路径合并检查，避免 `/api/users/api/users` 这类重复路径。

### `contracts --query`

- `contracts --workspace <path> --query <endpoint-or-symbol>` 可按 endpoint、symbol、DTO、Handler、页面或 API wrapper 精确筛选契约索引。
- 输出包含建议读取顺序，要求只读取匹配行对应的前端调用、Controller、DTO、Service/ServiceImpl、DTO copy/mapper 和必要 Mapper。
- v0.3.9 增加“同页面相关接口”：根据命中 API wrapper 的前端 import，提示同一页面里的下单、支付发起、设备占用/释放、取消或失败接口。
- 对 `api/order.js` 这类大 wrapper 增加具体查询词过滤，减少泛订单页噪声。
- KT 复测中，同一条租赁查询已能提示 `saveOrderInfo`、`listElectricBoatOffLine`、`updateElectricBoatStatus`、`payweapp`、`getCurrentCommodityLeased`。
- v0.3.19 扩展前端静态识别：API endpoint 扫描覆盖 `.js/.ts/.jsx/.tsx` 的 `api/service/services` 目录，支持 `export const` 字符串、`request({ url })`、`fetch('/api')`、`axios.get('/api')` 等写法；同页面相关接口支持 named、default、namespace、CommonJS require 和动态 import 的对象成员调用。
- v0.3.20 增加 `--frontend-repo`、`--backend-repo` 和 `--related/--related-type`，可在多前端、多后端或大 API wrapper 场景下只看指定前端仓库、后端仓库或同页面相关类型。`--related` 只筛“同页面相关接口”区域，不改变精确匹配行。
- v0.3.21 修正相关类型分类：不再用整行文本判断类型，避免前端文件名或请求字段把归还/结算、设备、商品预下单等接口混到同一类；同时增加 `codex-mem route --query` CLI，便于不用 MCP 也能本地验证仓库路由。
- v0.3.25 扩展前端 endpoint 扫描：支持 API wrapper 内的局部路径常量、字符串拼接和简单模板字符串，例如 `BASE + "/cancel"`、`` `${BASE}/detail` ``。
- v0.3.28 增加 `graph --workspace <path> --output <file>`，输出 workspace/repo/frontend-api/endpoint/backend-handler/DTO 节点和边的轻量 JSON，用于后续 dashboard、guided tour 或影响分析。

### 脱敏与共享材料

- v0.3.22 增加 `redact --input <file> --output <file>` 规则版脱敏命令，不依赖 `opf`。
- 当前规则覆盖常见 `sk-` API key（包含已打码形式）、Authorization/Cookie、secret-like 字段、邮箱、手机号、用户主目录路径和 URL 密码。
- 已用 KT 真实 `codex exec` events/stderr 文件做实样检查，能把 `sk-BcSsy...qKKZ` 形式的打码 API key 和 `/Users/<name>/...` 路径继续脱敏。
- 规则版不等同合规或匿名化保证，共享前仍需人工复查；`opf` 后续可作为可选增强试点。

### codex-mem observe 模式

- `codex-mem init/index/search` 已实现本地轻量索引，当前使用 JSONL。
- `install-hooks --mode observe` 生成项目级 `.codex/hooks.json` 和 hook 脚本。
- `install-user-hooks --mode observe` 支持非 Git 父目录，通过 workspace scope 限制用户级 hooks。
- observe hook 记录 token 估算，生成 `.codex-mem/ledger.jsonl`。
- `dashboard` 从 ledger 生成 `docs/codex-mem-dashboard.md`。
- `sessions` 从 `$CODEX_HOME/sessions/**/*.jsonl` 生成 `docs/codex-session-usage.md`，用于 A/B 对比。v0.3.40 起支持重复传 `--session <id>`，按指定 session 生成聚焦报告，并用第一个 session 作为对比基准。v0.3.42 起报告会显示 session status、failed/warning 数量和失败消息。发布前审计补充了 prompt 和失败消息脱敏，本机用户目录与临时目录不会原样写入报告。
- `exec-events` 从 `codex exec --json` 事件文件生成 `docs/codex-exec-events.md`，记录 thread id、status、MCP/tool 调用、usage 和脱敏后的错误消息；传入多个事件文件时会用第一个文件作为基准生成对比表。报告中的外部事件文件路径会显示为 `<tmp>/...`、`~/...` 或 `<external>/...`，避免写入本机绝对路径。
- hook 已能提示整段读取契约索引、`utils/plugins/monitor/**`、`uview-ui/**`、`doc/sql/**`、minified 文件、VM 模板等高噪声路径。
- 当前 observe 模式不拦截工具调用，只提示和记录。

### codex-mem compress 实验模式

- v0.3.10 增加 `PostToolUse` 长输出 refs/offload smoke 实现。
- `install-hooks --mode compress --threshold <tokens>` 可生成 compress hook。
- 大输出且未命中敏感路径时，原文写入 `.codex-mem/refs/<date>/*.md`，文件包含 metadata、结构化摘要、SHA-256 hash 和原始输出。
- v0.3.23 增强摘要策略：返回消息、ref 文件和 ledger 会保留输出行数/字符数、错误/告警/失败行、文件路径行、开头和结尾片段。
- ledger 会记录 `compressed`、`refPath`、`outputHash`、`outputSummary`、`compressedOutputTokens`。
- v0.3.24 增加 `codex-mem timeline --workspace <path> --limit 20` CLI，用同一套 timeline 数据查看最近 hook 事件、observations、ref 路径、短 hash 和摘要提示。
- v0.3.26 增加 `codex-mem record --workspace <path> --title <text> --summary <text>` CLI，和 MCP `codex_mem_record` 共用 observations，可被 search/timeline 读取。
- v0.3.27 将 `codex-mem config` 生成的 read-only MCP 工具 `search/route/timeline` approval 从 `auto` 改为 `approve`；KT 真实 `codex exec` 复测证明 `approve` 可完成 `codex_mem_route` 调用。
- v0.3.11 增加 `codex-mem get --ref <ref-path-or-sha256>`，可按 ref 路径或 SHA-256 hash 回读本地 ref，也支持 `--output <file>`。
- dashboard 会显示已写入 refs 的事件数、因敏感路径跳过 refs 的事件数。
- 命中 `.env`、`application*.yml`、`*.pem`、`*.key`、secret/credential/token 等敏感路径时，不写 ref，只记录 `refSkipped: sensitive-path`。
- 该模式还没有真实任务 A/B，不能默认启用。

### codex-mem MCP smoke 第一版

- v0.3.12 增加 `codex-mem mcp --workspace <path>`，启动本地 stdio MCP server。
- 已提供 `codex_mem_search`、`codex_mem_get`、`codex_mem_route`、`codex_mem_timeline`、`codex_mem_record`。
- MCP server 只读取本地 `.codex-mem/`、`AGENTS.md`、`project-facts/` 和 `docs/ai-context-*.md` 生成的数据，不访问网络。
- `codex_mem_record` 写入 `.codex-mem/observations.jsonl`，CLI `codex-mem search` 和 MCP search 都能检索 observations。
- v0.3.13 增加 `codex-mem config --workspace <path>`，生成 Codex MCP `config.toml` 片段。
- v0.3.14 增加 stdio `Content-Length` framing 支持，同时保留 JSONL smoke 输入，适配 Codex rmcp 客户端。
- v0.3.15 修正 MCP search/route 在 `.codex-mem/index.jsonl` 缺失时导致 server 退出的问题；MCP 现在返回空结果，CLI search 仍保持显式报错。
- v0.3.16 将 workspace API 契约表 `docs/ai-context-api-contract-map.md` 的表格行加入 `.codex-mem/index.jsonl`，类型为 `api-contract`，用于 MCP/CLI search 命中 endpoint、symbol、API wrapper、Controller、DTO 和 response。
- v0.3.17 增加 codex-mem 中文业务词扩展，覆盖租赁、下单、归还、结算、支付、退款、设备、状态、预约等常见词，帮助中文 prompt 命中英文 endpoint/symbol。
- v0.3.18 给 `api-contract` index entry 增加结构化 `contract` 和 `relatedRepos`，`codex_mem_route` 命中跨端契约时会同时给前端仓库和后端仓库计分；旧索引仍可从 summary 中解析 `backend=...`。
- v0.3.30 让 `doctor` 输出缺失工作流工件，并让顶层 `init` 同时生成 `.codex-mem/index.jsonl`。新 workspace 初始化后可直接用 `codex-mem route/search`，但仍不默认安装 hooks 或启用 compress。
- v0.3.31 扩展 contracts 前端扫描：`actions.ts` 进入 API wrapper 候选，SDK-style `client.GET/PATCH('/api')` 和 GraphQL `gql`/`graphql` operation 会进入契约索引，同页面相关接口也能通过页面 import 找回。
- v0.3.32 增加常见 `baseURL` / API prefix 推断：前端只写 `/users/relative` 或 `users/relative` 时，会生成带 `/api` 前缀的候选并尝试匹配后端 Controller。
- v0.3.33 保持 JSONL 索引不变，但给 `codex-mem search/route` 增加结构化字段权重：API 契约的 endpoint、symbol、handler、前后端仓库、文件路径优先于普通 summary 文本。
- v0.3.34 将 `agents` 改为按缺失项生成 workflow artifacts，并增加同义命令 `repair`；如果只缺 AGENTS，不会重写已有 workspace map，生成新材料后会刷新 `.codex-mem/index.jsonl`。
- v0.3.35 根据 KT 电动船实样反馈，给 workspace API 契约表增加 `Frontend payload fields` 列，并把该字段写入 `api-contract` 的结构化索引。当前覆盖 `$http(method, endpoint, data)`、`request({ url, data })`、`axios.post(endpoint, data)`、`client.PATCH(endpoint, { body })` 等常见调用。
- v0.3.36 增加 `Field check` 列，基于前端 payload 字段和后端 DTO 字段给出保守提示：`required-missing` 表示后端 `@NotNull/@NotBlank/@NotEmpty` 字段未在已识别 payload 中出现，`payload-only` 表示前端字段未在请求 DTO 中出现。该提示用于选择源码复查重点，不替代运行时验证。
- v0.3.37 让 `doctor` 识别旧版 `docs/ai-context-api-contract-map.md`：已有契约表缺少 `Frontend payload fields` 或 `Field check` 列时显示 `stale` 并推荐 `init`；`agents` / `repair` 不刷新 stale 契约表，只提示需要 `init`。这来自 KT v0.3.36 验证中发现的升级后旧索引问题。
- v0.3.38 让 `doctor` 同时识别旧版 `.codex-mem/index.jsonl`：如果旧 `api-contract` entry 缺少 `frontendPayloadFields` 或 `fieldCheck` 结构化字段，也显示 `stale` 并推荐 `init`，避免 route/search 继续使用旧契约索引。
- v0.3.39 让 `contracts`、CLI `codex-mem search/route` 和 MCP `codex_mem_search/route` 在读取 stale 生成资料时直接输出 warning；即使没有先跑 `doctor`，也能看到当前结果来自旧契约表或旧索引。
- v0.3.40 给 `codex-mem sessions` 增加 `--session <id>` 过滤和选中 session 对比段，减少真实任务 A/B 记录时手工摘取 token 数据的误差。
- v0.3.41 根据 cc-connect 真实后端任务反馈增加 Go 仓库识别：`doctor` 能从 `go.mod` 或 `.go` 文件识别 `tech: go`，生成的 `AGENTS.md` 和 `project-facts/verification.md` 会提示 `go test ./...`、相关 package 和指定测试。
- v0.3.42 增强 `codex-mem sessions`：会话明细增加 `status` 和 `error` 列，汇总增加 failed/warning session 数量。额度不足、401、MCP 审批或沙箱失败这类执行问题可以进入同一份 A/B 证据报告，但仍不能计入成功任务。
- v0.3.43 增加 `codex-mem exec-events --events <events.jsonl>`，用于摘要 raw `codex exec --json` 事件文件。报告会统计成功/失败文件、MCP/tool 调用、usage 和脱敏后的最后错误，避免 A/B 记录靠人工翻 JSONL。
- v0.3.44 修正 `exec-events` 对旧版 `turn.completed.usage` 的解析：当 raw events 只有 input/output 而没有 `total_tokens` 时，用 input+output 推导 total；MCP 工具分布按调用 id 计数，避免 started/completed 重复。
- v0.3.45 给 `exec-events` 增加多事件文件对比段：第一个 events 文件作为基准，后续文件显示 total/input/output/reasoning tokens、MCP/tool 调用和事件数差异；这只用于减少手工摘数误差，不替代任务质量判断。
- v0.3.46 增加 `real-task-audit --workspace <path>`，从 `docs/real-task-ab/*.md` 生成三类真实任务验证审计；只有结论表明确写入 `yes` 的记录才计入，exec-events、session 报告和 patch 只作为支撑材料。
- v0.3.47 将后端单接口 bug 的窄范围读取规则同步到 Skill、操作流程和生成 AGENTS：已知目标仓库和方法后，不读 `.codex-mem/index.jsonl`，不扫全量 DTO 包，支付、核销或异步后续链路只读能证明当前接口问题的一层。
- v0.3.48 增强 `real-task-audit` 和 observe hook：后端单接口记录如果出现读取 `.codex-mem/index.jsonl`、宽 DTO 搜索或过深后续链路，会在“流程风险提示”段列出；hook 启动提示改为优先使用 `codex-mem search/route`，直接打开本地索引时会给出提示。
- v0.3.49 修正 `codex-mem search/route` 读取大索引的问题：`xbx` 工作区生成的 `.codex-mem/index.jsonl` 约 1MB，旧版使用普通 `safeRead` 会误报索引不存在，现在改为大文件读取并加入超过 1MB 的自动检查。
- v0.3.50 增加 Stop hook token snapshot：每轮结束时返回静态 dashboard 路径、当前 session 工具输入/输出估算、大输出事件数和压缩收益估算；同时把未指定业务域的初始化索引、单业务域报告、token/质量证据规则同步到两个 Skill。
- v0.3.51 增加 `token-status` 和 `editor-tasks`：前者给终端或编辑器任务输出静态节省、hook ledger 和报告路径；后者生成 VS Code 兼容 tasks，并保留既有任务。
- v0.3.52 给 `token-status` 增加 `--json --output <file>`，可写入 `docs/ai-context-token-status.json`；`editor-tasks` 同步增加写 JSON 状态文件的任务，方便 VS Code/Cursor/Windsurf、JetBrains run configuration 或后续插件读取结构化 token 状态。
- v0.3.53 增加 `onboard` 和 `upgrade` 聚合命令：`onboard` 生成缺失的工作流材料后输出 `doctor` 和 `token-status`，`upgrade` 刷新生成资料后输出同样状态；`editor-tasks` 同步增加 `ai-context: onboard workspace` 与 `ai-context: upgrade workspace context`，给 Agent、编辑器任务和 Codex plugin 做普通用户无感入口。
- v0.3.54 增加 `automation-prompt`：输出业务项目每日 Skill 反哺候选 prompt 和 Skill 仓库评审 prompt。业务候选 prompt 支持从当前 workspace 或业务父目录自动识别子仓库，归属冲突时列待确认项；该命令只生成提示词，不创建 automation，也不修改共享 Skill。
- v0.3.55 增加 `capability actions`：`onboard` 和 `upgrade` 在 `doctor`、`token-status` 后继续输出 CodeGraph 状态、静态 token 报告/dashboard 状态、observe hooks、session usage 和下一步命令。两个 Skill 同步要求首次接入和已接入升级的最终报告必须呈现这些状态。
- `check-kit.sh` 会在本机存在 `codex mcp` 时使用临时 `CODEX_HOME` 注册 `codexMem`，并通过 `codex mcp list/get --json` 检查 stdio server 配置。
- `codex exec` 真实会话已能调用 `codexMem/codex_mem_search`。v0.3.15 复测结果：MCP tool call completed，模型看到空结果；空结果原因是当时 project-facts-kit 本身未初始化 `.codex-mem/index.jsonl`。
- 临时 workspace 非空索引复测已通过：创建含 `codex-mem-real-search-marker` 的 AGENTS.md，运行 `codex-mem init` 后，真实 `codex exec` 调用 `codex_mem_search` 返回 `AGENTS.md` 命中；CLI 显示 `tokens used 20,002`。
- 真实 `codex exec` 会消耗模型 tokens，不放入 `check-kit.sh` 自动检查；保留临时 `CODEX_HOME` 注册验证和本地 MCP smoke test 作为常规检查。
- KT 电动船 MCP 短测已完成：旧索引只返回仓库/AGENTS 级结果；v0.3.16 加入 API 契约行后，真实 `codex exec` 的 `codex_mem_search` 能直接返回 `updateElectricBoatStatus`、`saveOrderInfo`、`getCurrentCommodityLeased`、`payweapp` 等接口级命中。
- KT MCP 短测 token：旧索引 input `69,935`、output `1,022`、reasoning `647`；v0.3.16 input `70,564`、output `1,219`、reasoning `592`。v0.3.44 `exec-events` 从 `<tmp>/kt-mcp-boat-v2-events.jsonl` 生成 `docs/real-task-ab/2026-06-08-kt-mcp-success-exec-events.md`，显示 succeeded files `1`、MCP calls `2`、total tokens `71,783`。这是入口定位测试，不和完整源码分析 A/B 直接比较。
- KT v0.3.18 本地 MCP route/search 复测：纯中文 `电动船租赁下单归还结算` 返回 `travel-lite-applet` score `217` 和 `travel-lite-backend` score `199`，并继续命中 `getRevertLeaseOrder`、`saveOrderInfo`、`updateLeaseOrderById`、`updateElectricBoatStatus` 等契约行。
- KT v0.3.18 真实 `codex exec` 复测尝试了两次，均在模型请求阶段因 OpenAI API key 401 失败，没有进入 MCP 工具调用；这次不记为真实 exec 成功样本。
- KT v0.3.26 真实 `codex exec` 复测尝试了两次，均用 `-c` 临时注入 `codexMem` MCP 配置。两次都进入 `mcp_tool_call` 并尝试调用 `codex_mem_route`，但结果仍是 `user cancelled MCP tool call`；第二次显式设置 `codex_mem_route/search/timeline` 的 `approval_mode="auto"` 也没有改变结果。两次输入 token 约 `47k`，未读取源码文件，不记为 MCP 真实成功样本。
- KT v0.3.26 第三次真实 `codex exec` 使用 `approval_mode="approve"` 后成功调用 `codex_mem_route`：返回 `travel-lite-applet` score `93`、`travel-lite-backend` score `85`，前三个命中为 `getRevertLeaseOrder`、`getCommoditySkuInfoForPlaceOrder`、`payOrderFailByPayNumber`；输入 token `47,320`、输出 `296`、reasoning `89`。该成功样本已写入 KT observations。
- KT v0.3.34 只读复测：`doctor` 显示 workflow artifacts 全部 ok；中文 route `电动船租赁下单归还结算` 返回 `travel-lite-applet` score `1587`、`travel-lite-backend` score `1432`，首批命中包含 `getRevertLeaseOrder`、`payOrderFailByPayNumber`、`updateLeaseOrderById`、`saveOrderInfo` 和 `getCommoditySkuInfoForPlaceOrder`；`contracts --query getRevertLeaseOrder` 继续给出归还结算、支付、设备状态、下单保存等同页面相关接口。
- KT v0.3.35 只读源码核对发现：租赁下单页面实际提交 `source`、`skuSaveReqs`，后端 `OrderInfoSaveReq` 暴露 `channelSource`、`skuSaveReqs` 等字段。旧契约表能定位页面和 DTO，但无法直接显示前端 payload 字段，因此增加通用 payload 字段列。
- KT v0.3.36 临时真实片段验证：从 KT 复制电动船相关真实文件到 `<tmp>/kt-ai-context-v036`，包含 `travel-lite-applet/api/leaseShip.js`、`pagesD/rentShip/index.vue`、`pagesD/rentShip/rentSettlement.vue`、`OrderInfoController.java`、`OrderInfoSaveReq.java`、`RevertLeaseOrderGetReq.java`、`LeaseOrderEndUpdateReq.java` 和 `RevertLeaseOrderGetResp.java`。`contracts --query saveOrderInfo` 显示前端 payload 为 `source`、`skuSaveReqs`，后端请求 DTO 为 `skuSaveReqs*`、`channelSource*` 等，并给出 `required-missing: channelSource` 与 `payload-only: source`；`contracts --query getRevertLeaseOrder` 会把 `updateLeaseOrderById` 和 `saveOrderInfo` 作为同页面相关接口提示。临时工作区 `init` 后，`codex-mem route --query "电动船租赁下单归还结算 channelSource source"` 同时推荐 `travel-lite-applet` 与 `travel-lite-backend`，并命中 `getRevertLeaseOrder`、`saveOrderInfo`、`updateLeaseOrderById`。这是跨端字段场景的真实片段验证，不等同完整业务 A/B，也未执行构建、接口联调或真实支付。

### Skills 与项目指引

- `low-token-context-maintainer` 已包含多仓库路由、契约查询、同页面相关接口、跨端字段/路径检查、高噪声路径规则，以及后端单接口 bug 的窄范围读取规则。
- 已同步到 `<local-codex-skills>/low-token-context-maintainer/SKILL.md`。
- KT 父目录和三个子仓库 `AGENTS.md` 已加入同页面相关接口检查规则。

### A/B 与验证记录

- KT 电动船 A/B 记录显示：B 组比 A 组 total tokens 少约 `15.9%`，但工具调用更多且遇到过 429。
- B2 使用 `contracts --query` 后，工具调用降到 `39`，但 session 统计 total tokens 仍有 `1,514,215`，说明仍需控制后续源码阅读范围。
- B2 反馈推动了 v0.3.9 的同页面相关接口和大 wrapper 噪声过滤。
- 新增 `docs/ai-context-kit-real-task-ab-template.zh-CN.md`，把真实任务 A/B 的计入条件、A/B/C 分组、质量判定、token 证据和结论字段固定下来。以后只有完整记录了定位、源码阅读、契约覆盖、验证结果和漏项的任务，才计入三类真实任务验证。
- 已把 KT 电动船旧 A/B 整理为 `docs/real-task-ab/2026-06-06-kt-boat-rental-cross-end-field.md`。该记录保留 A/B/B2 token 和质量对比，但结论标为“不计入三类完整真实任务验证”，原因是没有构建、接口联调或真实支付证据，且 KT 当前原索引仍为 stale。
- 使用 v0.3.40 重新生成 KT 电动船 A/B/B2 聚焦 session 报告：`docs/real-task-ab/2026-06-06-kt-boat-rental-session-ab.md`。报告确认 B 相比 A total tokens 少 `15.9%`，B2 相比 A 少 `38.0%`，但质量结论仍以任务记录为准。
- 新增 `docs/real-task-ab/2026-06-07-cc-connect-backend-path-footer.md`。这是一条真实后端 bug 流程验证：原仓库 `go test ./core` 失败，临时副本经 `doctor`、`agents`、`route/search` 和源码定位后修复 `core/engine.go`，相关测试和 `go test ./core` 通过。它没有独立 A/B session 和 token 数据，因此不计入完整 A/B。
- 2026-06-08 尝试为 cc-connect 后端 bug 运行独立 `codex exec` A/B。A 组在进入工具调用前失败，事件文件 `<tmp>/cc-connect-a-events.jsonl` 显示 `Your workspace is out of credits. Ask your workspace owner to refill in order to continue.`；B 组未启动。这条只作为执行失败证据，不计入 A/B。
- 已把 cc-connect A 组 raw events 脱敏保存为 `docs/real-task-ab/2026-06-08-cc-connect-a-events.redacted.jsonl`，并用 v0.3.43 `codex-mem exec-events` 生成 `docs/real-task-ab/2026-06-08-cc-connect-exec-events.md`。报告显示 failed files `1`、MCP calls `0`、tool calls `0`、total tokens `0`。
- 外部 KT 工作区在 2026-06-08 曾补齐三类完整 A/B 记录：`miniapp-integration`、`cross-end-field`、`backend-bug`。`<kt-workspace>/docs/ai-context-kit-real-task-ab-audit.md` 显示 `counted records = 3`、`missing categories = none`。这些记录尚未以可计入任务记录进入本仓库；本仓库当前审计仍显示 `counted records = 0`，三类均 missing。
- KT 后端 bug 样本显示：B 组先用 `contracts --query updateLeaseOrderById --backend-repo travel-lite-backend`，相比 A 组 total tokens 少 `676,162`，约 `18.27%`；质量没有下降，但仍有 `3,024,037` total tokens，并扩展到了核销服务。因此已经把“后端单接口 bug”规则补进 Skill、日常流程和生成 AGENTS：已知目标仓库和方法后，不读 `.codex-mem/index.jsonl`，不扫全量 DTO 包，后续支付/核销/异步链路只读能证明当前问题的一层。

## 已验证命令

- `node --check packages/ai-context-kit/bin/ai-context-kit.mjs`
- `bash -n scripts/check-kit.sh`
- `./scripts/check-kit.sh`
- `git diff --check`
- `packages/ai-context-kit/bin/ai-context-kit.mjs --version` 返回 `ai-context-kit 0.3.55`
- KT 真实 `contracts --query` 查询确认租赁下单页和归还页相关接口能被提示。
- KT `.codex-mem/index.jsonl` 已用 v0.3.28 重新生成，仍为 `576` 行，`api-contract` entries 带 `contract.backendRepo` 和 `relatedRepos`。
- KT 本地 CLI/MCP route/search 纯中文查询已验证；真实 `codex exec` 在 v0.3.26 使用 `approval_mode="approve"` 时已成功调用 `codex_mem_route`。截至 2026-06-08，外部 KT 工作区三类真实任务 A/B 记录已补齐；本仓库发布证据仍以 `docs/ai-context-kit-real-task-ab-audit.md` 为准，当前为 0 条计入。业务运行时验证仍未执行。
- `check-kit.sh` 临时项目已覆盖 Go 仓库识别和验证建议、TS service、default import、namespace import、局部路径常量、字符串拼接、简单模板字符串、SDK-style `client.GET/PATCH('/api')`、GraphQL `gql` query、Next/React-style `actions.ts`、`baseURL` / API prefix 相对路径匹配、`request({ url })`、`fetch('/api')`、页面调用 payload 字段提取、必填 DTO 字段差异提示、旧契约表 stale 提示、旧 `codex-mem` api-contract entry stale 提示、`contracts` / `codex-mem search/route` stale warning、`agents` 不刷新 stale 契约表、`init` 刷新 stale 契约表和索引、`--frontend-repo`、`--backend-repo`、`--related cancel/device/settlement/payment/inventory`、`graph --output`、`real-task-audit` 三类验证审计和后端流程风险提示、observe hook 对本地索引直读的提示、超过 1MB 的 `codex-mem` 索引 search/route、`agents` 按缺失项生成 workflow artifacts、只缺 AGENTS 时不重写已有 workspace map、`codex-mem route --query`、`codex-mem search` 结构化权重、`codex-mem timeline --limit`、`codex-mem record --title --summary`、`codex-mem sessions` 失败状态、`codex-mem exec-events` raw events 摘要与多文件对比、契约索引、同页面相关接口、observations、结构图和 refs 回读路径，`redact` 的文件/stdin 脱敏，以及 compress ref 结构化摘要。
- `redact` 已实样处理 `<tmp>/kt-mcp-v020b-events.jsonl` 和 `<tmp>/kt-mcp-v020b-stderr.log`，输出到对应 `.redacted.*` 文件。

## 待办

### 第一优先级

- `compress` 模式已有 refs/offload smoke 实现，但还没有真实 A/B 验证，不能给团队默认启用。
- `PostToolUse` refs/offload 已有结构化摘要；跨会话 trace 关联、真实任务中的回读使用方式仍未验证。
- MCP 工具已有本地 stdio smoke、配置片段生成器、临时 Codex CLI 注册验证、真实 `codex exec` 空结果验证、临时 workspace 非空命中验证，以及 KT 电动船入口定位短测；KT v0.3.26 真实 `codex exec` 在 `approval_mode="approve"` 下已成功调用 `codex_mem_route`。还没有业务项目完整源码分析 A/B、团队配置分发方式和跨线程使用验证。
- 当前本地索引仍是 JSONL；v0.3.33 先用结构化字段权重改善 search/route 排序，SQLite/FTS 是否值得切换还需要真实任务 A/B 数据。
- 外部 KT 工作区三类真实任务 A/B 已补齐，但本仓库还没有提交满足计入条件的三类记录。下一步是把可公开的完整记录按模板整理进本仓库，降低后端单接口样本的源码阅读成本，并为业务项目补运行时验证证据。后续记录继续使用 `docs/ai-context-kit-real-task-ab-template.zh-CN.md`。

### 第二优先级

- `contracts --query` 已覆盖常见 named/default/namespace import、CommonJS require、动态 import、TS service endpoint、局部路径常量、字符串拼接、简单模板字符串、SDK-style REST client、GraphQL `gql`/`graphql` operation、Next/React-style `actions.ts`、常见 `baseURL` / API prefix 相对路径和常见页面调用 payload 字段；更复杂的运行时 API client、拦截器函数改写和框架特定封装仍需继续验证。
- API 契约索引还不能完整表达运行时状态条件、权限判断、配置来源、回调路径和 MQ/异步副作用。
- session token 统计需要继续校验不同 Codex 版本 JSONL 格式，尤其是失败事件、累计 token 与 CLI 最终提示的解释差异。
- CodeGraph 当前是可选初始化，v0.3.55 已在 `capability actions` 中显示是否建议安装或初始化，但还没有封装 CodeGraph 查询结果进入 `ai-context-kit` 报告；v0.3.28 的 graph 只使用 ai-context-kit 已有契约扫描结果。

### 第三优先级

- `redact` 规则版已实现；`privacy-filter` / `opf` 仍未接入，后续需要评估是否作为共享资料发布前的增强检查。
- 外部项目只完成调研和取舍，还没有试点 Headroom、OpenViking、TencentDB-Agent-Memory、LeanCTX 或 Understand-Anything。
- 还没有打包发布流程、版本发布说明和安装验证矩阵。
- 还没有团队周报视图，把 `ccusage`、`codex-mem sessions`、dashboard 和任务成功率放在一起看。

## 当前判断

第一阶段的核心能力已经可用：多仓库路由、项目事实索引、跨端契约查询、token 测量、Codex hook observe 和 A/B 记录都已实现并通过脚本验证。

当前不再继续加新能力，先使用 `docs/ai-context-kit-operating-workflow.zh-CN.md` 作为默认流程。下一阶段重点是验证长输出 refs/offload、MCP 检索和更多真实任务 A/B。只有证明任务质量不下降，再考虑把 observe 之外的压缩或拦截能力给团队默认使用。
