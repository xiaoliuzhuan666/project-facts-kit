# Codex 低 token 工具调研

调研日期：2026-06-06

## 目标

这份文档服务于一个很具体的场景：团队主要使用 Codex app，日常会把多个独立仓库放在同一个父目录下打开，例如后端、前端、小程序、管理端同时存在。目标不是更换 Codex，而是减少无关上下文、减少重复阅读源码、让新同事和新线程更快进入正确仓库。

## 当前建议

第一阶段继续使用本项目的 `ai-context-kit`：

- 父目录生成 `AGENTS.md` 和 `docs/ai-context-workspace-map.md`，把父目录变成路由入口。
- 子仓库生成短 `AGENTS.md`、`project-facts/project.md`、`project-facts/context-boundary.md`、`project-facts/verification.md`。
- 接口类问题按需读取 `backend-route-controller-map.md`、`api-endpoints.md`、`applet-route-api-map.md`。
- 用 `ai-context-kit tokens` 和 `ccusage` 分别观察上下文规模和 Codex app 本机用量。
- CodeGraph 只对单个子仓库按需初始化和查询。

第二阶段再按场景试点下面这些项目的部分能力，不建议直接把它们作为第一阶段主系统。

## 调研仓库

| 仓库 | 本次查看版本或来源 | 许可证 | 和本场景的关系 | 建议 |
| --- | --- | --- | --- | --- |
| [TencentCloud/TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory) | `f92b10259b8b5780f8b0056b5c8526fc98f5646f` | MIT | 长任务记忆、工具输出卸载、Mermaid 任务图、可追溯压缩 | 第二阶段试点，不直接接 Codex app 主流程 |
| [openai/privacy-filter](https://github.com/openai/privacy-filter) | `f7f00ca7fb869683eb732c010299d901457f19c3` | Apache-2.0 | 本地 PII/secret 检测和脱敏，适合项目事实、日志和工具输出入库前处理 | 可作为可选脱敏前置工具 |
| [clacky-ai/openclacky](https://github.com/clacky-ai/openclacky) | `49a19867d59d9d64876d88fa4b798e5c4973b35f` | MIT | 低成本 agent harness 设计参考：固定系统提示、少工具、Skill 隔离、MCP 延迟加载、成本记录 | 借鉴机制，不替换 Codex app |
| [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 2026-06-06 raw README/docs | Apache-2.0 | Claude Code / Gemini / OpenCode 等的持久记忆、MCP 检索、按需取回历史观察 | 借鉴“索引先行 + 按 ID 取详情”，Codex app 直接接入需另做适配 |
| [volcengine/OpenViking](https://github.com/volcengine/OpenViking) | 2026-06-06 raw README | AGPLv3 | 上下文数据库、L0/L1/L2 分层、目录式检索、Agent Memory 评测 | 作为第二阶段候选；AGPL 和运行成本需先评估 |
| [chopratejas/headroom](https://github.com/chopratejas/headroom) | 2026-06-06 raw README | Apache-2.0 | 本地代理、MCP、agent wrapper，压缩工具输出、日志、文件、RAG chunk | 可以做小规模试点，但要验证压缩后答案质量 |
| [yvgude/lean-ctx](https://github.com/yvgude/lean-ctx) | 2026-06-06 raw README | 未在本次网页片段中确认 | 本地 Rust context layer，压缩 shell 输出、文件读取、会话记忆和仪表盘 | 观察或局部试点；功能很全，先看稳定性和生态成熟度 |
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | 2026-06-06 raw README / research page | 未在本次网页片段中确认 | 通用 agent memory，强调高准确率和低 tokens 检索 | 更适合产品内 agent 记忆，不是 Codex app 父目录路由第一解 |
| [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | 2026-06-06 raw README | 未在本次网页片段中确认 | MCP / 插件 / API 形式的跨工具持久记忆 | 可观察；团队项目事实仍建议保存在 Git 中 |
| [letta-ai/letta](https://github.com/letta-ai/letta) | 2026-06-06 raw README | 未在本次网页片段中确认 | Stateful agent 框架，内置长期记忆、自改进、skills/subagents | 学习架构，不适合作为 Codex app 的直接替换 |
| [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | 2026-06-07 raw README | MIT | Tree-sitter + LLM multi-agent pipeline，把代码库/知识库生成交互式知识图、guided tours、diff impact analysis | 借鉴结构图、导览和影响分析；不替换 `ai-context-kit` 的低 token 路由和契约索引 |

## 60% 以上 token 节省线索

这次没有找到名为 `cluade-mem` 的主流仓库。更可能是下面几条线索混在了一起：

| 项目 | 公开数字 | 证据强度 | 说明 |
| --- | ---: | --- | --- |
| `claude-mem` | README 写 MCP 三层检索约 `10x token savings`；Smart Explore 文档写端到端 `10-12x cheaper` | 官方文档，但主要是项目自测 | 不是直接写“60%”，而是索引检索、AST 探索和按需取详情带来的数量级节省 |
| `OpenViking` | README 写 Claude Code + OpenViking 在 LoCoMo 上 token 降低 `63.2%`，准确率 `57.21% -> 80.32%` | 官方 README，需看评测可复现性 | 很像用户记得的“60% 以上”；但它是 Claude Code 基座，不等于 Codex app 实测 |
| `Headroom` | README 写 `60-95% fewer tokens`；示例工作负载 `47%` 到 `92%` | 官方 README，加第三方新闻报道 | 更像“开源项目号称节省 60% 以上”的来源；它是压缩层，不是记忆层 |
| `TencentDB-Agent-Memory` | README 写 OpenClaw + 插件在 WideSearch 上 token 降低 `61.38%` | 官方 README | 适合长任务工具输出卸载和可追溯压缩，Codex app 无法直接接入 agent loop |
| `LeanCTX` | README 写 shell output `60-99%` 压缩，缓存重读约 `13 tokens` | 官方 README | 和 Headroom 类似，主打本地 context layer，适合观察 |

判断：如果用户记得的是“Claude 相关、记忆、60%”，可能是 `OpenViking` 或 `TencentDB-Agent-Memory` 的评测数字；如果记得的是“Netflix 工程师、开源、压缩上下文”，那大概率是 `Headroom`。

## claude-mem

### 观察到的能力

官方 README 将它定位为 Claude Code 的持久记忆压缩系统，同时也列出 Gemini CLI、OpenCode、OpenClaw 等入口。核心机制包括：

- 生命周期 hooks 捕获 session、用户 prompt、工具使用和结束摘要。
- 本地 worker、SQLite、可选 Chroma 向量库保存 observations 和 summaries。
- MCP 检索采用三层流程：先 `search` 拿轻量索引，再 `timeline` 看上下文，最后用 `get_observations` 只取需要的详情。
- `File Read Gate` 在有历史 observation 时拦截大文件读取，先给时间线、token 估算和按需读取选择。
- `Endless Mode` 仍是 beta；官方文档明确写了 token 收益尚未生产验证。

### 对我们的价值

它最值得借鉴的是“让模型先看有什么和取回成本，再决定是否读取详情”。这和我们现在 `project-facts` 的方向一致，但可以做得更细：

- 给每条事实、索引、变更记录标注大致 token 成本。
- 对同一个文件或接口形成按时间排序的轻量 observation index。
- 长日志、完整接口响应、大搜索结果进入 `refs/`，主上下文只保留标题、路径、ID 和验证状态。

### 对 Codex app 的限制

`claude-mem` 依赖 Claude Code hooks 和插件安装；Codex app 普通任务不能直接把这些 hooks 插进自己的工具调用消息流。对我们来说，更合适的是把它的设计移植到 `ai-context-kit`，而不是直接安装后期待 Codex app 自动省 token。

## OpenViking

### 观察到的能力

OpenViking 把上下文组织成 `viking://` 虚拟文件系统，写入后生成 L0/L1/L2 三层：

- L0：一句话摘要，用来判断是否相关。
- L1：结构和使用场景，供 agent 计划阶段阅读。
- L2：原始详情，必要时再读取。

它的 2026 年 5 月评测更新里，公开列出 Claude Code auto-memory 和 Claude Code + OpenViking 的 LoCoMo 对比：准确率从 `57.21%` 到 `80.32%`，平均 query 时间从 `49.1s` 到 `20.4s`，总输入 token 从 `353,306,422` 到 `129,968,899`，汇总为 token 降低 `63.2%`。

### 对我们的价值

这个项目对“不能降低准确度”的诉求比较有参考价值，因为它不是单纯压缩，而是分层检索并给出准确率、时延、token 三个指标。可以借鉴到 `ai-context-kit`：

- 父目录层只放 L0：有哪些仓库、技术栈、入口。
- 子仓库层放 L1：模块、路由、接口、测试命令。
- 具体代码、日志、SQL、接口详情作为 L2：只在任务需要时读取。

### 风险

OpenViking 是 AGPLv3，作为团队内部服务或二次分发前要让法务或技术负责人确认。它也需要 embedding/VLM/服务端配置，落地成本高于 `AGENTS.md + project-facts`。

## Headroom

### 观察到的能力

Headroom 是本地 context compression layer，可以作为 library、proxy、agent wrapper、MCP server。README 写它能压缩 tool outputs、logs、RAG chunks、files、conversation history，并列出 Code search、SRE incident debugging、GitHub issue triage、Codebase exploration 等工作负载，节省从 `47%` 到 `92%` 不等。

第三方报道把它描述为 Netflix 工程师开源的 AI 成本压缩工具，提到 reportedly saved `US$700,000` 和 `200 billion tokens`，并说它可压缩 server logs、MCP outputs、数据库输出、file trees、docs chunks 和 JSON responses。

### 对我们的价值

它贴近你们的“后端同事发现问题快、解决慢、token 多”的现象，因为慢往往发生在大量日志、测试输出、文件阅读、搜索结果不断进入上下文之后。Headroom 的适合场景是：

- 先保留 `ai-context-kit` 负责仓库路由和事实索引。
- 对工具输出、长日志、搜索结果做本地压缩。
- 保留原文可取回，避免压缩后丢失关键证据。

### 风险

压缩层可能漏掉罕见但关键的信息。正式使用前不能只看 token 节省，要用真实 bug 任务做 A/B：压缩前后是否都能定位、修改、验证成功。

## LeanCTX

LeanCTX 和 Headroom 很像，也主打本地 context layer，但更偏“编码 agent 操作系统”：shell output 压缩、文件读取模式、缓存重读、会话记忆、知识图谱、仪表盘和预算控制都放在一个 Rust binary 里。

它的 README 写 `Cursor, Claude Code, Copilot, Windsurf, Codex, Gemini` 等都可用，并给了几个醒目的数字：重复文件读从约 `2000 tokens` 到约 `13 tokens`，raw `git status` 从约 `800 tokens` 到约 `120 tokens`，shell output `60-99%` 压缩。

对我们来说，它值得观察，特别是实时 savings dashboard 和 per-event ledger。但一次性引入过多功能会让团队流程变复杂，建议晚于 `Headroom` 或只试用它的观测能力。

## Mem0 / Zep / Supermemory / Letta

这几类都是更通用的 agent memory 或 stateful agent 平台。

- `Mem0`：开源 memory layer，README 和 research page 强调 token-efficient memory algorithm，LoCoMo、LongMemEval、BEAM 等 benchmark 平均每次检索约 `6.7K-7.0K tokens`。论文摘要里写相对 full-context 方法节省超过 `90% token cost`。
- `Zep`：商业 memory/context graph 服务，研究页强调 LoCoMo `94.7%`、LongMemEval `90.2%`，并给出 median context size；auto search 在 LoCoMo 上 context block 约 `2,680 tokens`，比多 scope 检索小 `53%`。
- `Supermemory`：跨工具 memory/context engine，有 MCP、Claude Code/OpenCode/OpenClaw/Hermes 插件、API 和连接器；重点是“一个记忆，多工具共享”。
- `Letta`：stateful agent 框架，适合自己构建有长期记忆的 agent，不适合作为 Codex app 日常修 bug 的直接替代。

这些项目对团队协作有价值，但不是第一阶段省 token 的主路径。我们的问题首先是“父目录多仓库 + Codex app 大范围探索”，不是“产品内聊天机器人没有记忆”。所以第一阶段仍应保持 `AGENTS.md + project-facts + CodeGraph + tokens/ccusage`。

## Understand-Anything

### 观察到的能力

官方 README 把它定位为可把 codebase、knowledge base 或 docs 变成交互式知识图的工具，支持 Claude Code、Codex、Cursor、Copilot、Gemini CLI 等。它的 `/understand` 会用 multi-agent pipeline 扫描项目，抽取文件、函数、类和依赖，生成 `.understand-anything/knowledge-graph.json`；`/understand-dashboard` 提供可搜索、可点击、按架构层着色的图；还提供 guided tours、业务 domain view、diff impact analysis、`/understand-chat`、`/understand-explain`、`/understand-onboard`、`/understand-domain`、`/understand-knowledge`，并支持增量更新和 post-commit auto-update。

### 对我们的价值

它对“准确高效理解上下文”很有参考价值，尤其是：

- 结构图：文件、函数、类、依赖、架构层和业务域可以比 Markdown 索引更直观。
- Guided tours：适合新线程或新同事按依赖顺序理解系统，不只是搜索命中。
- Diff impact analysis：能把“改了这里会影响哪里”前置到修改前，适合跨端字段、支付、设备状态、结算这类链路。
- 增量更新：只重分析变更文件，符合我们节省 token 和减少重复扫描的目标。
- 团队共享图：提交 `.understand-anything/` 后，其他人可以跳过初次分析。

### 和现有方案的关系

它不是长期记忆的完整替代，也不是 refs/offload 压缩层。它更像“结构理解和可视化层”。我们当前已经覆盖：

- 低 token 路由：`AGENTS.md`、workspace map、scope report、`codex-mem route/search`。
- 跨端契约：frontend API wrapper、backend Controller、DTO 字段、同页面相关接口。
- 任务记忆：`.codex-mem/observations.jsonl`、timeline、record、refs/get。
- 长输出处理：compress 模式把原文写 refs，主上下文保留摘要、hash 和路径。
- 真实 Codex 接入：v0.3.27 已验证 `approval_mode="approve"` 下 `codex_mem_route` 能在真实 `codex exec` 返回结果。

还没覆盖 UA 强的部分：

- 代码结构图和 dashboard。
- 按依赖顺序的 guided tour。
- diff impact analysis。
- 业务域图和 domain flow。
- Tree-sitter 级别的稳定结构抽取。

建议：不把 UA 直接作为第一阶段主系统，但把它列为第二阶段试点。v0.3.28 已先让 `ai-context-kit graph` 输出一份简单 graph JSON，包含 repo、frontend API、endpoint、backend handler、DTO 的节点和边；后续再评估是否接 UA dashboard 或借鉴它的图 schema。这样不会偏离“准确理解上下文 + 高质量解决问题 + 节省 token”的核心目标。

## TencentDB-Agent-Memory

### 观察到的能力

官方 README 把它定位为 OpenClaw 插件，也提供 Hermes 接入方式。核心结构是两类记忆：

- 短期上下文卸载：原始工具输出进入 `refs/*.md`，中间层保留摘要，顶层用 Mermaid 任务图表达状态。
- 长期记忆分层：从原始对话到原子事实、场景块、Persona。
- 本地默认存储是 `SQLite + sqlite-vec`，也支持腾讯云向量数据库相关导出和迁移脚本。
- offload 相关代码集中在 `src/offload/`，包含 token 统计、MMD 注入、恢复、状态管理等模块。
- 诊断导出脚本里有基础脱敏逻辑，会处理 API key、token、password、secret、credential 等字段。

### 对我们的价值

它的“上层摘要保留结构，下层原文保留证据”很适合我们的 `project-facts` 体系。我们现在的 `project-facts` 已经解决了项目级事实和交接，但还没有系统处理“长任务中大量工具输出”的问题。可以借鉴它的方式，在后续版本增加：

- `project-facts/runs/<date-task>/trace.md`：任务图或步骤图。
- `project-facts/runs/<date-task>/refs/`：大日志、大搜索结果、大接口响应原文。
- trace 中只保存 `node_id`、结论、文件路径、校验命令，不把长日志直接塞回主上下文。

### 不建议第一阶段直接接入的原因

- 当前主要面向 OpenClaw/Hermes，不是 Codex app 原生插件。
- offload 需要接入 agent 的工具调用消息流；Codex app 普通用户无法直接改它的 agent loop。
- 默认 Node 要求较新，并且有 OpenClaw 插件、Hermes Gateway、可选后端等部署形态，团队学习成本高于 `AGENTS.md + project-facts`。

### 可落地借鉴

短期先把思想放进 `ai-context-kit` 的路线图：大输出不进主上下文，只写入本地 refs；主上下文保留短索引和可追溯路径。

## openai/privacy-filter

### 观察到的能力

这是 OpenAI 发布的本地隐私过滤项目，包名是 `opf`。仓库提供 CLI、Python API、评估和微调流程。

关键点：

- 支持本地运行，默认从 `OPF_CHECKPOINT` 或 `~/.opf/privacy_filter` 取模型，缺少时会下载。
- CLI 支持直接传文本、`-f` 传文件、管道输入、交互模式。
- 输出可以是纯文本或结构化 JSON。
- 检测类别包括账号、地址、邮箱、人名、电话、URL、日期、secret。
- 模型定位是数据最小化辅助工具，不是合规保证，也不是匿名化保证。

### 对我们的价值

它适合处理两类输入：

- 团队要把日志、接口响应、报错、聊天记录放入 `project-facts` 前，先做脱敏。
- 后续如果把任务 trace、refs、历史记录做成团队共享资料，可以在写入前跑一次 `opf`，降低泄漏风险。

### 不建议第一阶段强制接入的原因

- 模型权重较大，首次下载和本地推理成本不低。
- 中文、行业字段、项目自定义 secret 仍需要本地评估，不能只靠默认模型。
- Codex app 的普通任务可以先靠禁读路径和人工脱敏控制风险；privacy-filter 更适合作为团队共享资料的发布前检查。

### 可落地借鉴

`ai-context-kit` v0.3.22 已增加规则版可选命令：

```bash
ai-context-kit redact --input <file> --output <file>
```

第一版不强依赖 `opf`，已先用规则脱敏；团队决定试点后再接 `opf` 做增强检查。

## OpenClacky

### 观察到的能力

OpenClacky 是 Ruby 实现的开源 agent。官方 README 和工程文档把低成本设计集中在几个点：

- 工具数量控制在小集合，把扩展能力放到 Skill。
- 系统提示在会话内保持固定，动态信息作为会话消息注入。
- Skill 和 MCP 的重型上下文进入子 agent，不污染主 agent 历史。
- MCP 通过一个稳定桥接工具按需调用，不把所有 server 的 JSON Schema 都塞进主系统提示。
- 内置 billing/cost tracking，记录 prompt、completion、cache read/write 和 cost。
- 长会话采用插入压缩指令的方式，减少单独压缩请求导致的缓存损失。

### 对我们的价值

这些设计和我们当前问题高度相关，但落地方式不是换工具，而是改团队使用 Codex app 的方式：

- `low-token-context-maintainer` Skill 对应 OpenClacky 的“能力放到 Skill，而不是每轮重复解释”。
- `ai-context-kit` 对应“主上下文只放路由和索引，重内容按需读”。
- CodeGraph 和 MCP 都不要默认全量挂载；先给短描述，真正需要时再进入目标仓库。
- 新同事接手时优先读 Git 中的项目事实，不依赖某个模型私有 memory。

### 不建议替换 Codex app 的原因

- 团队当前主工具是 Codex app，已有线程、worktree、skills、browser、MCP、插件和本地工作流。
- 切换到另一个 agent 会带来配置、权限、模型、成本、协作习惯和验证链路变化。
- OpenClacky 的成本数字主要来自它自己的 harness 和内部基准，不能直接等同于你们项目的 Codex app 账单。

### 可落地借鉴

后续通用工具可以增加：

- 固定且短的父目录 `AGENTS.md`，减少每轮提示变化。
- Skill 只暴露流程，不在系统提示中放大段项目内容。
- MCP 和 CodeGraph 只给短描述，真正调用时进入子仓库。
- 对 `ccusage` 结果做周报，把 cache read/write、输入、输出分开看。

## 对公开样例工作区的判断

`<example-workspace>` 已经验证过父目录路由方案能大幅减少上下文规模。当前报告显示：

- 父目录全量基线：`26,902,543` tokens。
- 父目录路由：`2,141` tokens。
- 目标仓库轻量上下文：约 `3,962` 到 `4,070` tokens。
- 完整接口索引：约 `21,862` 到 `98,961` tokens。

这些数字说明，第一阶段真正有效的是“别让 Codex 从父目录自由探索”。外部项目能提供第二阶段增强，但不应该覆盖这个主路径。

公开样例工作区的下单场景 A/B 反馈也说明，低 token 路由需要保留质量检查项：只列场景不够，跨端分析还要检查请求/响应 DTO、DTO copy/mapper 和新旧接口路径。否则容易漏掉前端字段已传但后端请求对象未接收、后端已有新接口但前端仍调用旧路径这类问题。

这个反馈已转成 `ai-context-kit` 的接口契约索引方向：父目录生成 `docs/ai-context-api-contract-map.md`，Java 仓库生成 `project-facts/api-contract-map.md`，供跨端字段和接口路径分析优先读取。

后续只测单一租用链路时又暴露出一个通用问题：有契约索引不等于模型会低成本使用它。模型仍可能整段读取索引，或者被前端监控插件、UI 库、构建产物等高噪声路径带偏。对应的通用调整是增加 `ai-context-kit contracts --query <endpoint-or-symbol>` 精确筛选命令，并把跨端链路检查清单扩展到支付通道、失败/取消路径、状态流转、前端 import/export、空数据渲染和硬编码配置。这个规则适用于任意前后端项目，不针对某个测试仓库。

B2 短测又补充了一个通用优化点：只查询“归还/结算/支付通道”时，模型能更快命中 Controller、DTO 和支付路由，但仍可能漏掉同一页面里的下单、设备占用/释放、支付发起接口。因此 `contracts --query` 需要在精确命中之外，根据前端 import 提示同页面相关接口；这些提示用于缩小后续阅读范围，不替代源码确认。

## 后续路线

1. 保持 `ai-context-kit` 为团队通用 CLI。
2. 把 `low-token-context-maintainer` 和 `project-facts-maintainer` 作为 Codex Skill 分发。
3. 每个多仓库父目录先跑 `doctor/init/measure/tokens`。
4. 跨端接口问题先跑 `contracts --query` 或精确 `rg`，再进入源码。
5. 每周用 `ccusage` 或 `codex-mem sessions` 记录 Codex app 本机消耗趋势。
6. 第二阶段增加任务 trace/refs 机制，借鉴 TencentDB-Agent-Memory 的可追溯压缩。
7. 第二阶段评估 `opf` 是否作为共享资料的脱敏工具。
8. 暂不替换 Codex app；OpenClacky 作为 agent 成本设计参考。
