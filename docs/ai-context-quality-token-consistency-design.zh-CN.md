# AI 上下文质量、token 与一致性设计说明

整理日期：2026-06-15

## 背景

团队的实际使用方式是：多人从 Codex app、CLI、VS Code/Cursor/Windsurf 等入口打开同一批项目；参与者可能使用不同模型、不同编辑器和不同上下文窗口。项目理解如果只停留在聊天、个人 memory 或某个模型上下文里，很容易出现三个问题：

1. 为了省 token，Agent 少读了关键源码、契约或验证记录。
2. 不同人或不同模型读到的项目入口不同，对需求状态的判断不一致。
3. 项目事实、生成索引和当前代码发生偏差时，没有统一的预警位置。

本项目避免把所有源码塞进上下文，也避免把 AI 输出当需求依据。目标是让 Agent 用较少上下文找到该读的资料，并且把省 token 的证据、质量证据和偏差状态分开保存。

## 本轮资料来源

- `README.md`
- `docs/project-facts-governance.zh-CN.md`
- `docs/adoption-guide.zh-CN.md`
- `docs/team-quick-start.zh-CN.md`
- `docs/ai-context-kit-operating-workflow.zh-CN.md`
- `docs/ai-context-kit-status-and-todo.zh-CN.md`
- `docs/codex-low-token-tooling-research.zh-CN.md`
- `docs/codex-mem-adapter-design.zh-CN.md`
- `docs/ai-context-kit-real-task-ab-template.zh-CN.md`
- `docs/ai-context-kit-real-task-ab-audit.md`
- `packages/ai-context-kit/bin/ai-context-kit.mjs`
- `packages/ai-context-kit/package.json`
- `scripts/check-kit.sh`
- `skills/project-facts-maintainer/SKILL.md`
- `skills/low-token-context-maintainer/SKILL.md`
- `plugins/project-facts-kit/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

外部资料重新查阅日期：2026-06-15。OpenAI Codex Skills、Plugins、Hooks 与 MCP 能力来自当天抓取的 OpenAI Codex manual；Agent Skills、MCP Resources、Serena、ast-grep、Probe、Repomix 与 OpenAI privacy-filter 取自官方规格页或项目仓库。外部工具能力仍按“候选增强”记录，不写成已验证的本项目能力。

## 设计判断

### 1. 省 token 的前提是读对资料

低 token 的重点不在机械减少文件数；重点是避免从父目录、完整契约索引、全量 DTO 包、长日志和本地索引原文开始阅读。默认流程应把上下文缩到：

- 当前任务最可能涉及的仓库；
- 命中的页面、API wrapper、Controller、DTO、Service 和必要 Mapper；
- 当前变更相关的项目事实、交接、验证说明；
- 已生成的状态文件和审计报告。

所以 `ai-context-kit` 的默认能力集中在 `doctor`、`agents/repair`、`codex-mem route`、`contracts --query`、`token-status`、`audit` 和 `editor-tasks`。它们的作用是给下一步阅读排序，不替代源码和验证。

### 2. 质量证据和 token 证据分开

静态 token 报告只能说明候选上下文大小，例如父目录基准、路由上下文、轻量仓库上下文之间的差异。真实任务是否省 token，要看可比较的 Codex session 或 `codex exec --json` 事件。任务质量是否下降，要看源码阅读、契约覆盖、测试结果和漏项记录。

因此本项目把证据分成三类：

| 证据 | 文件或命令 | 能说明什么 | 不能说明什么 |
| --- | --- | --- | --- |
| 静态上下文 | `ai-context-kit tokens`、`dashboard`、`token-status` | 候选上下文大小、报告路径、生成时间 | 不能证明真实任务一定省 token |
| 真实 session | `codex-mem sessions`、`exec-events` | 实际 input/output/reasoning tokens、工具调用、失败状态 | 不能单独证明质量没有下降 |
| 任务质量 | `docs/real-task-ab/*.md`、`real-task-audit` | 源码阅读、契约覆盖、验证结果、漏项 | 如果缺 session token，只能写 savings unknown |

结论规则：只有真实任务记录同时包含可比较 token 数据和质量证据，并且漏项没有实质影响，才能说该流程在这个任务类别中有效省 token 且质量未下降。其他情况写成 `UNKNOWN` 或局部证据。

### 3. 项目理解进入仓库，不能只留在模型里

多人协作时，最可靠的共享位置是目标项目 Git 历史中的文件：

- `project-facts/project.md` 说明项目目标、范围和验证入口；
- `project-facts/context-boundary.md` 说明哪些资料可先读、哪些不要默认读；
- `project-facts/verification.md` 说明真实检查命令；
- `project-facts/handover/current.md` 与 `for-next-maintainer.md` 记录当前任务状态；
- `docs/ai-context-*.md` 提供生成的导航索引；
- `.codex-mem/index.jsonl` 只作为本地检索索引，不直接提交到团队事实里。

模型、聊天、session 总结和 MCP observation 可以作为线索；进入项目事实前，必须标明 `APPROVED`、`OBSERVED`、`UNKNOWN` 或 `CONFLICT`，并带上来源路径。

### 4. 统一状态文件比解析自然语言更可靠

编辑器、CI、hooks 和不同 Agent 不应该分别解析 Markdown 报告里的自然语言。因此新增两类结构化状态源：

| 状态源 | 生成命令 | 读取者 |
| --- | --- | --- |
| `docs/ai-context-token-status.json` | `ai-context-kit token-status --json --output docs/ai-context-token-status.json` | IDE 面板、团队脚本、编辑器任务 |
| `docs/ai-context-audit-state.json` | `ai-context-kit audit --output docs/ai-context-audit-report.md` | Stop hook、CI、编辑器任务、其他 Agent |
| `docs/ai-context-workspace-status.json` | `ai-context-kit status --json --output docs/ai-context-workspace-status.json` | 需要同时读取 token、偏差和质量证据状态的 IDE 面板、CI、团队脚本 |
| `docs/ai-context-workspace-status.schema.json` | `ai-context-kit status --json --output docs/ai-context-workspace-status.json` 同步写入 | 校验 status JSON 的关键字段、状态枚举和 claims 结构 |

`ai-context-audit-state.json` 包含 `status`、`alertCodes`、drift/conflict/mismatch 计数和简短列表。`ai-context-workspace-status.json` 汇总 token status、audit state 和真实任务审计，只读取已有报告，不重新扫描源码，并在 `claims` 中把静态上下文节省、真实任务节省和“质量未下降的 token 节省”分开标记。schema 只约束关键字段和枚举，允许以后追加字段。这样不同模型看到的是同一份机器可读状态，不需要复述上一个模型的解释。

### 5. 默认 observe guard，不默认 compress

`codex-mem install-hooks --mode observe` 记录本地 token 估算、提示高噪声读取和 Stop snapshot，并对少量明确高风险读取返回 block：未读交接就读取源码、敏感路径、整段契约索引、本地索引直读、父目录宽搜索。普通状态命令如 `token-status` 不会因为包含 `token` 这个词被拦截。`compress` 可以把长输出写入 ref 并返回摘要，但它会改变 Agent 当轮看到的信息形态。

当前没有足够真实任务 A/B 证明 compress 不影响质量，所以团队默认只使用 observe guard。compress 继续保留为实验能力，只有真实任务记录证明质量没有下降时，才考虑给团队默认使用。

### 6. npm CLI 是团队接入主入口

让同事不 clone 工具仓库也能接入，主入口应是 npm CLI，而不是要求每个人理解模板目录结构。`ai-context-kit install` 负责把项目事实模板、helper 脚本、CI 示例和 repo-scoped Skill 复制到目标项目；`quickstart --install-template` 可以把安装和首次状态生成放在同一次执行里。

`0.3.59` 的 npm 包在 `prepack` 时把 `template/`、`skills/`、辅助脚本、关键制度文档、status schema、状态样例和任务阅读清单复制到 `vendor/project-facts-kit/`。CLI 运行时优先使用 `PROJECT_FACTS_KIT`，其次使用 npm 包内 vendor 资产，最后才使用源码仓库根目录。

安装仍保持保守边界：默认 `lite`，已有文件跳过；`--with-skill` 才复制 `.agents/skills`；`--with-ci` 才复制 GitHub Actions workflow；`--inject-package-scripts` 才给 Node 项目增加 `facts:*` 命令。这样避免工具接入无意改变目标项目的开发命令、CI 行为和团队习惯。

### 7. Skill 和 Codex Plugin 是工作流分发，不是项目文件安装器

官方 Codex manual 在 2026-06-15 抓取版本中说明：Skills 是可复用工作流的作者格式，使用 progressive disclosure；Codex 启动时只放名称、描述和路径，任务匹配后才读取完整 `SKILL.md`。Plugins 是可安装的分发单位，可以打包 Skills、MCP server、hooks 和 app integrations。

本项目据此采用分工：

| 形式 | 当前用途 |
| --- | --- |
| `skills/project-facts-maintainer` | 维护项目事实、规格、交接和验证证据 |
| `skills/low-token-context-maintainer` | 约束多仓库低 token 阅读路径、契约查询和后端单接口窄范围读取 |
| `plugins/project-facts-kit` | 把两个 Skill 打包成 Codex Plugin，供团队通过 repo/team marketplace 安装 |
| npm CLI | 安装模板、生成 audit/status/token 文件、注入 CI 和 `facts:*` 命令 |

当前 Codex Plugin 不打包 hooks 或 MCP server，原因是插件内 hook 仍需要用户 trust；而本项目的 observe hook 依赖目标 workspace 的 `.codex/` 与 `.codex-mem/` 运行数据，更适合由 CLI 在目标项目中显式安装。

## 多人、多模型、多编辑器的一致流程

推荐把一个任务的入口固定为下列顺序：

1. 读取根 `AGENTS.md`、`project-facts/project.md`、`context-boundary.md`、`verification.md`。
2. 父目录或多仓库项目运行 `ai-context-kit doctor --workspace <path>`，确认 workflow 资料是否缺失或 stale。
3. 任务涉及仓库选择时，使用 `codex-mem route --query "<task>"`。
4. 任务涉及页面、接口、字段、状态链路时，使用 `contracts --query <endpoint-or-symbol>`，必要时加 `--frontend-repo`、`--backend-repo` 或 `--related`。
5. 只读取命中链路上的源码、DTO、mapper、验证配置和项目事实。
6. 报告前运行 `ai-context-kit audit --workspace <path> --output docs/ai-context-audit-report.md`。
7. 需要 CI 拦截 warning 时运行 `ai-context-kit audit --workspace <path> --output docs/ai-context-audit-report.md --fail-on-warning`。
8. 记录验证结果。没有执行的检查写 `Not run`，不能写成通过。

编辑器侧使用 `ai-context-kit editor-tasks --workspace <path>` 生成任务。VS Code 兼容编辑器可以直接运行 token status、写 JSON、facts audit、刷新 dashboard、查看 session usage 和安装 observe hooks。其他 IDE 读取同样命令即可。

## 偏差预警流程

偏差分三类处理：

| 类型 | 典型来源 | 状态入口 | 处理方式 |
| --- | --- | --- | --- |
| 生成契约与当前源码不一致 | 旧 `docs/ai-context-api-contract-map.md`、旧 `.codex-mem/index.jsonl` | `CONTRACT_DRIFT_WARNING` | 刷新生成资料，或在源码确认前标为 `UNKNOWN` |
| 字段契约未确认 | 前端 payload 与后端 DTO 必填字段或额外字段不一致 | `CONTRACT_DRIFT_WARNING` | 读取页面/API wrapper/DTO/mapper，写入当前变更 `unknowns.md` |
| 冲突观测 | observation、项目事实或交接中出现 conflict/drift 描述 | `CONFLICT_ALERT` | 暂停相关业务行为修改，列出冲突来源，交给责任人确认 |

Stop hook 会优先读取 `docs/ai-context-audit-state.json`。如果状态文件晚于源资料，就直接返回其中的 warning；如果源资料更新而状态文件过旧，hook 会做轻量扫描并提示需要重新审计。

CI 使用 `--fail-on-warning`，可以让 warning 变成非零退出码，同时保留 Markdown 和 JSON 报告供审阅。

## 暂不作为默认能力

| 能力 | 当前状态 | 暂缓原因 |
| --- | --- | --- |
| compress hook 默认启用 | 已有 smoke 实现 | 缺真实任务 A/B 质量证据 |
| 外部 memory 服务 | 调研过，未接入 | 会增加部署、隐私和一致性成本 |
| SQLite/FTS 替换 JSONL | 可作为后续优化 | 当前瓶颈主要在读取范围和任务习惯，不是索引格式 |
| 全量 graph 默认生成 | 已有轻量 JSON graph | 大多数任务用 route/contracts 足够，graph 只在结构关系复杂时需要 |
| 从 session 自动判断质量 | 未实现 | 质量要结合源码、契约、验证和漏项，不能只看 token 数字 |

## 后续路线

1. 把可公开的三类真实任务记录整理进本仓库：后端 bug、小程序联调、跨端字段问题。
2. 用 `real-task-audit` 作为质量证据入口，不再从单个成功日志推导总体结论。
3. 在真实后端单接口样本中继续降低源码阅读范围，重点观察是否仍读取本地索引、宽 DTO 搜索或过深后续链路。
4. 让团队 CI 采用 `audit --fail-on-warning`，把契约偏差和冲突观测从个人提示变成共享失败信号。
5. 如果后续真实任务证明 compress 不影响质量，再设计团队默认配置；当前保持实验状态。

## 本轮新增取舍

- 审计报告继续服务人阅读，`docs/ai-context-audit-state.json` 服务机器读取。
- `audit --fail-on-warning` 把 warning 状态变为 CI 可识别的失败，同时保留报告产物。
- `status --json --output docs/ai-context-workspace-status.json` 汇总 token、偏差和真实任务质量证据，服务编辑器、CI 和团队脚本。
- `status` JSON 增加 `schemaVersion` 和 `schema`；使用 `--output` 时同步写入 `docs/ai-context-workspace-status.schema.json`。
- `status` 的 `claims` 字段区分三类结论：静态节省可测、真实任务节省待证、质量未下降的节省是否可声明。
- `editor-tasks` 增加严格事实审计任务，让编辑器里也能直接看到 warning 失败。
- observe guard 的敏感识别只匹配 `.env`、`*.pem`、`access_token`、`api_key` 等敏感形态，不把普通 `token-status` 或文档里的 `token` 词当成敏感读取。
- `README.md` 增加本说明入口，避免设计原因散在聊天记录里。
- `check-kit.sh` 在本机存在 `skills-ref` 时校验两个 Agent Skill；没有该工具时显式输出跳过信息。
- `ai-context-kit install` 成为 npm 分发后的项目接入入口，支持 `--lite|--full`、`--with-skill`、`--with-ci` 和 `--inject-package-scripts`。
- `quickstart --install-template` 支持把模板安装和首次状态生成放在一次执行中。
- npm 包发布时把模板、Skill、辅助脚本、CI 示例、schema 样例和任务阅读清单打入 `vendor/project-facts-kit/`。
- 新增 `plugins/project-facts-kit/` 和 `.agents/plugins/marketplace.json`，用于 Codex repo/team marketplace 分发两个 Skill。
- 版本记录推进到 `ai-context-kit 0.3.59`。
