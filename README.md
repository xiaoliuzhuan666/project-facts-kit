# Project Facts Kit

一套独立于具体大模型的项目事实制度、模板和 Agent 工作流程。它解决的问题是：多人使用不同 AI 维护不同项目时，下一位接手者仍能找到已批准的目标、当前事实、待确认事项和验收证据。

## 基本原则

- `Skill` 用来提升接手效率和执行下限，不保存某个业务项目的正式批准需求。
- `project-facts/` 用来保证人和模型不偏离项目真实情况，项目事实必须有状态、来源和验证记录。
- PR 审阅、CODEOWNERS 和 CI 用来阻止未经确认的经验变成团队规则。
- 模型可以协助阅读、整理、实现和检查，不能自行批准业务含义。
- 项目事实必须进入目标项目的 Git 历史，而不是只留在聊天、个人 memory 或某个模型的上下文里。
- `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT` 必须区分记录。
- 需求变化需要对应的验证证据；未执行的检查写为 `Not run`。
- 每个项目需要一名可异步确认业务意图的责任人。

## 本项目包含什么

| 路径 | 用途 |
| --- | --- |
| `docs/project-facts-governance.zh-CN.md` | 团队制度正文，可作为内部评审基线 |
| `docs/adoption-guide.zh-CN.md` | 在旧项目、新项目、Spec Kit 或 OpenSpec 项目中的采用方法 |
| `docs/project-facts-kit-update-commands.zh-CN.md` | 本机 kit 更新、项目升级、自动化和维护校验命令速查 |
| `docs/docker-shared-host-release-pattern.zh-CN.md` | 共享服务器上的 Docker 发布、持久化、公网入口和验证规则 |
| `docs/ai-era-collaboration-playbook.zh-CN.md` | 不强制安装外部工具的多项目接手与交接协作手册 |
| `docs/ai-era-multi-project-requirements-continuity.zh-CN.md` | AI 时代多项目需求连续性调研报告 |
| `docs/ai-agent-carrier-roadmap.zh-CN.md` | Skill、CLI、MCP、hooks、CodeGraph、RAG 和 memory layer 的载体调研与迭代计划 |
| `docs/codex-low-token-tooling-research.zh-CN.md` | Codex app 低 token 工具调研与外部项目取舍 |
| `docs/codex-mem-adapter-design.zh-CN.md` | 基于 Codex hooks 适配 claude-mem 思路的设计 |
| `docs/ai-context-kit-status-and-todo.zh-CN.md` | `ai-context-kit` 当前已实现功能、验证证据和后续待办 |
| `docs/ai-context-kit-real-task-ab-audit.md` | 从真实任务记录生成的三类验证缺口审计 |
| `docs/skill-feedback/` | 共享 Skill 候选项接收区和模板 |
| `docs/skill-carrier-assessment.zh-CN.md` | Skill 是否适合作载体的评估、依据和边界 |
| `docs/skill-feedback-automation-runbook.zh-CN.md` | 业务项目每日候选与 Skill 仓库评审自动化设置 |
| `docs/team-training-iteration-runbook.zh-CN.md` | 团队培训、迭代计划和中途接手演练流程 |
| `docs/monorepo-migration-runbook.zh-CN.md` | 多仓库迁移为 monorepo 的判断、执行、文档同步和验证流程 |
| `docs/neudrive-integration.zh-CN.md` | 与 neuDrive 资料分发能力的边界和迁移说明 |
| `docs/research/source-neudrive/` | 2026-05-25 从 neuDrive 复制来的调研与依据快照 |
| `template/project-facts/` | 可放入目标项目的项目事实目录骨架，包含 Skill 反哺候选模板 |
| `template/AGENTS.project-facts.fragment.md` | 可合并到目标项目 `AGENTS.md` 的 Agent 规则 |
| `template/github/` | PR 与 CODEOWNERS 规则片段 |
| `skills/project-facts-maintainer/` | 可提供给支持 Agent Skills 的客户端的工作流程 |
| `skills/low-token-context-maintainer/` | 指导 Codex 低 token 接手多仓库项目的工作流程 |
| `plugins/project-facts-kit-codex/` | Codex plugin 形式的 Skill 分发外壳 |
| `packages/ai-context-kit/` | 生成父目录路由、子仓库上下文索引和 token 测量报告的 CLI |
| `scripts/setup-local-kit.sh` | 同事本机首次准备脚本，负责链接 CLI 并安装用户级 Skill |
| `scripts/install-project-facts.sh` | 将模板安装到一个目标仓库，不覆盖已有目录 |
| `scripts/check-kit.sh` | 检查本资料库及安装脚本是否完整可用 |

## 快速采用

### 第一次使用：先获取 kit

三句入口的前提是同事本机已经有本仓库，并且 CLI / Skill 已准备好。把下面这一条命令发给同事即可；它会自动判断本机是首次 clone 还是更新已有目录：

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

这一步会优先执行 `npm link`；如果 npm 全局目录没有写权限，会改用 `~/.local/bin` 用户级命令链接，并把该目录写入常见 shell 启动文件，保证新开终端可直接使用。两个共享 Skill 会安装到 `$CODEX_HOME/skills` 或 `~/.codex/skills`。已有同名 Skill 会先备份成 `*.backup-<timestamp>`，不会静默覆盖。如果 `~/.cache/project-facts-kit` 里有本地未提交修改，旧目录会先改名成 `project-facts-kit.dirty-<timestamp>`，再重新 clone。如果 GitHub clone 失败，先检查网络、账号权限或 Git 凭据。

以后更新 kit 仍执行同一条命令。更多项目升级、自动化和维护仓库校验命令见 [Project Facts Kit 更新命令速查](docs/project-facts-kit-update-commands.zh-CN.md)。

如果同事已经通过 Codex plugin 或团队统一镜像拿到了 Skill 和 CLI，可以跳过上面的本机准备步骤，直接在目标项目 workspace 使用三句入口。

### 给同事的三句入口

普通使用者不需要记 CLI。本机准备完成后，让同事在目标项目 workspace 里对 Agent 说下面三句之一即可：

| 场景 | 推荐说法 | 背后动作 |
| --- | --- | --- |
| 新项目第一次接入 | `帮我做项目事实 kit 首次接入。` | 安装轻量 `project-facts/` 模板；多仓库父目录再生成路由、索引，并报告 CodeGraph 与 token 可见性 |
| 已接入项目升级 | `帮我做项目事实 kit 已接入升级，不覆盖已有事实。` | 刷新版 Skill、缺失模板和生成资料；保留已有项目事实，并报告 CodeGraph 与 token 可见性 |
| 每日 Skill 反哺 | `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。` | 创建或更新候选自动化；只生成候选，不改共享 Skill |

在已经打开目标项目的 Codex 线程里，也可以简短说 `首次接入`、`已接入升级` 或 `开启每日反哺候选`。如果没有打开具体项目，仍建议使用上面的完整说法。

### 10 分钟上手路径

1. 在目标仓库安装 L1 模板：

```bash
./scripts/install-project-facts.sh /path/to/target-repo --lite
```

2. 把 `project-facts/AGENTS.fragment.md` 的适用内容合并到目标仓库 `AGENTS.md`。
3. 先填 `project-facts/project.md`、`runtime.md`、`iteration-plan.md` 和 `handover/current.md`，不要把代码现状写成已批准需求。
4. 处理具体任务时，只补当前业务域的 `specs/<domain>/spec.md` 和必要证据。
5. 多仓库父目录再运行 `ai-context-kit doctor --workspace <parent>`，根据提示生成路由和 token 报告。

新接手者或 Agent 的默认读取顺序是：`AGENTS.md`、`project-facts/README.md`、`project.md`、`runtime.md`、`iteration-plan.md`、相关 `specs/`、最近 `changes/`、`handover/current.md`，然后才是代码。目标是先确认事实和范围，再消耗 token 读实现。

本项目的资料分工是：`project-facts/` 保存事实，`AGENTS.md` 保存读取和验证入口，Skill 保存工作流程，PR / CODEOWNERS / CI 控制哪些变化可以生效。每日 Skill 反馈任务只生成候选，不直接修改共享 Skill。当前本机已有的是本仓库的 Skill 候选评审 cron；业务项目每日候选任务可以挂在当前 workspace 或业务父目录，由任务按当天证据自动识别子仓库，只有识别不清时才列为待确认。设计依据见 [Skill 作为载体的评估](docs/skill-carrier-assessment.zh-CN.md)，自动运行方式见 [Skill 反哺自动化运行手册](docs/skill-feedback-automation-runbook.zh-CN.md)。Skill、CLI、MCP、hooks、CodeGraph、RAG 和 memory layer 的分工及后续路线见 [AI Agent 载体调研与迭代计划](docs/ai-agent-carrier-roadmap.zh-CN.md)。

在目标仓库尚未使用项目事实目录时，优先采用 L1 模式，不要求安装 Spec Kit、OpenSpec 或 Kiro：

```bash
./scripts/install-project-facts.sh /path/to/target-repo --lite
```

执行后，目标仓库会新增 `project-facts/`，其中包含项目摘要、术语、运行事实、当前迭代计划、当前交接、给下一位维护者的消息、Skill 反哺候选模板、一个规格模板，以及需要人工整合到根 `AGENTS.md` 的片段。

推荐的初始接入方式是三步：先生成模板；再人工整理项目专属 `AGENTS.md`，写入真实验证命令、敏感路径和读取顺序；最后填写首批事实索引，例如 `project.md`、`glossary.md`、`runtime.md`、`iteration-plan.md`、`handover/current.md`、`domain-index.md` 或当前业务域 `spec.md`。不要把代码现状直接写成 `APPROVED`。

需要持续记录每次行为变化时，再安装完整模板：

```bash
./scripts/install-project-facts.sh /path/to/target-repo
```

完整模板会包含规格、变更、决策、GitHub 规则片段和交接模板。

若目标 Agent 支持项目内 Skill，可以指定安装目录：

```bash
./scripts/install-project-facts.sh /path/to/target-repo \
  --skill-dir /path/to/target-repo/.codex/skills
```

初次接手已有项目时，不要立即将代码行为写成批准需求。先填写：

1. `project-facts/project.md`
2. `project-facts/glossary.md`
3. `project-facts/runtime.md`
4. `project-facts/iteration-plan.md`
5. `project-facts/handover/current.md`
6. `project-facts/handover/for-next-maintainer.md`
7. 当前任务相关的 `specs/<domain>/spec.md`
8. `changes/<date>-<change>/unknowns.md` 与 `evidence.md`

同事接手时可直接参考 [AI 时代多项目轻量协作手册](docs/ai-era-collaboration-playbook.zh-CN.md)。该手册把项目分为 L0 到 L4：多数老项目先做到 L1 即可，外部工具只作为重大项目或高风险变更的增强选项。

## 多仓库低 token 接手

当团队习惯把后端、前端、小程序等多个独立仓库放在同一个父目录，并从父目录打开 Codex app 时，使用 `ai-context-kit`：

```bash
# 在本仓库根目录执行一次
npm link
# 然后对目标父目录执行
ai-context-kit doctor --workspace /path/to/parent
ai-context-kit onboard --workspace /path/to/parent
ai-context-kit agents --workspace /path/to/parent
# 需要刷新生成资料时再执行 init
ai-context-kit upgrade --workspace /path/to/parent
ai-context-kit init --workspace /path/to/parent
ai-context-kit measure --workspace /path/to/parent
ai-context-kit tokens --workspace /path/to/parent
ai-context-kit dashboard --workspace /path/to/parent
ai-context-kit token-status --workspace /path/to/parent
ai-context-kit token-status --workspace /path/to/parent --json --output docs/ai-context-token-status.json
ai-context-kit editor-tasks --workspace /path/to/parent
ai-context-kit automation-prompt --workspace /path/to/parent --type skill-feedback-candidate
```

根包也提供同等入口：

```bash
project-facts-kit context doctor --workspace /path/to/parent
project-facts-kit context onboard --workspace /path/to/parent
project-facts-kit context upgrade --workspace /path/to/parent
project-facts-kit context repair --workspace /path/to/parent
project-facts-kit context init --workspace /path/to/parent
project-facts-kit context measure --workspace /path/to/parent
project-facts-kit context tokens --workspace /path/to/parent
project-facts-kit context dashboard --workspace /path/to/parent
project-facts-kit context token-status --workspace /path/to/parent
project-facts-kit context editor-tasks --workspace /path/to/parent
project-facts-kit context automation-prompt --workspace /path/to/parent --type skill-feedback-candidate
project-facts-kit context contracts --workspace /path/to/parent --query "/api/orders"
project-facts-kit context real-task-audit --workspace /path/to/parent
```

`onboard` 是普通接手入口，会补缺失的流程材料，然后输出 `doctor`、`token-status` 和 `capability actions`。`upgrade` 用于刷新已有生成资料，并输出同样状态。`doctor` 会同时输出 `workflow artifacts` 和 `capability status`。前者说明路由、索引和项目事实文件是否存在；后者说明 CodeGraph、契约索引、静态 token 报告、token dashboard、observe hooks、session usage、graph、real-task A/B 和 redact 是否已经可用。`capability actions` 会把 CodeGraph 是否跳过、是否需要安装或初始化，以及 token 报告、dashboard、hooks、session usage 的下一步命令整理给普通用户看。`capability status` 和 `capability actions` 只是状态和建议，不会自动初始化 CodeGraph，也不会替项目写事实。

`agents` / `repair` 会按 `doctor` 发现的缺失项生成流程材料：父目录和子仓库 `AGENTS.md`、`docs/ai-context-workspace-map.md`、`docs/ai-context-api-contract-map.md`、轻量 `project-facts/`、`docs/ai-context-scope-report.md` 或 `.codex-mem/index.jsonl`。如果只缺 `AGENTS.md`，就只写 `AGENTS.md`，已有 workspace map、契约表和人工维护的项目事实不会被重写；新材料生成后会刷新本地 route/search 索引。已有契约表缺少当前 `Frontend payload fields` 或 `Field check` 列时，`doctor` 会显示 `stale`，这种情况用 `init` 刷新。`init` 用于根据当前仓库状态重新生成 maps、reports 和 indexes；Java 仓库会额外生成 `project-facts/api-contract-map.md`。`measure` 生成 `docs/ai-context-scope-report.md`；`tokens` 通过 `repomix@latest` 生成 `docs/ai-context-token-savings-measurement.md`；`dashboard` 从最新 token 报告生成 `docs/ai-context-token-dashboard.md`。已有 `AGENTS.md` 或项目事实文件默认跳过；`--force` 只用于重建带有 `generated-by: ai-context-kit` 标记的生成文件，不覆盖人工维护的项目事实。

按需命令：`facts` 只生成子仓库 `project-facts/`，`contracts --query <text>` 只从跨端/后端契约索引筛选匹配 endpoint、DTO、Handler、页面或 API wrapper，并提示命中 wrapper 所在页面的相关接口，避免整段读取契约索引，`redact --input <file> --output <file>` 用于共享日志、接口响应或任务 trace 前的规则脱敏，`codegraph --repos <name>` 只对指定子仓库尝试 CodeGraph 初始化。`codex-mem install-hooks --mode observe` 会在目标工作区生成项目级 Codex hooks，记录工具输出 token 估算并生成本地看板，默认不拦截工具调用。父目录本身不是 Git 仓库时，再用 `codex-mem install-user-hooks --mode observe` 生成带 workspace 限制的用户级 hooks。`codex-mem sessions` 会从 Codex session JSONL 生成会话 token 统计，并显示 session 成功、失败、warning 和失败消息，供 A/B 对比使用；`codex-mem exec-events` 会摘要 `codex exec --json` 事件文件，用于记录额度、401、MCP 审批或工具调用结果，多个事件文件会在报告中增加基准对比表。跨端分析规则已按通用前后端项目整理：检查请求/响应 DTO、顶层与嵌套字段、DTO copy/mapper、新旧接口路径、状态流转、支付通道、失败/取消路径，以及前端 import/export、空数据渲染和硬编码配置。后端单接口 bug 要在已知仓库和方法后保持读取范围更窄：不读 `.codex-mem/index.jsonl`，不扫全量 DTO 包，只看 route/contract 命中、Controller、请求 DTO、直接 Service、必要 Mapper、响应或状态 DTO；支付、核销、异步任务等后续链路只读能证明当前问题的一层。小型仓库的 token 报告可能显示索引比源码更多，推广前看报告中的实际数字，不把“节省”当作固定结果。

用户可见的 token 数字有四种入口：`dashboard` 显示静态上下文节省；`token-status` 把静态节省、hook ledger 和报告路径合成一段终端摘要，也支持 `--json --output docs/ai-context-token-status.json` 给 IDE 面板、插件或团队脚本读取；`codex-mem sessions` 或 `exec-events` 显示真实 Codex session / exec usage；`codex-mem install-hooks` 生成的 Stop hook 会在每轮结束时返回本地 token snapshot，包含静态看板路径、工具输入/输出估算和压缩收益估算。VS Code、Cursor、Windsurf 等 Codex IDE extension 共用 Codex CLI 配置，可使用同一套 hooks；`editor-tasks` 会生成或合并 `.vscode/tasks.json`，把终端状态、JSON 状态文件、刷新 token 报告、session usage 和安装 observe hooks 做成编辑器任务。通用 IDE 可以直接调用这些命令。Stop hook 和 `token-status` 中的 hook 数字是本地估算，不等同于账单，也不代表任务质量。

真实任务 A/B 使用 `docs/ai-context-kit-real-task-ab-template.zh-CN.md` 记录，记录文件放在 `docs/real-task-ab/`。只有完整包含任务 prompt、分组、索引状态、源码阅读、契约覆盖、验证结果、token 数据和漏项的记录，才计入后端 bug、小程序联调、跨端字段问题三类验证；单独的 route/search/contracts 命中只能作为局部证据。`real-task-audit` 会从这些记录生成 `docs/ai-context-kit-real-task-ab-audit.md`，列出三类验证是否齐全、哪些 Markdown 只是支撑材料，以及后端单接口记录里是否出现本地索引读取、宽 DTO 搜索或过深后续链路。

提交前需要人工确认禁读路径、敏感配置排除规则和生成的索引是否合适。生成的 Markdown 不应记录本机绝对路径；`.codegraph/`、`/tmp/ai-context-kit-*.md`、本机 usage 日志不进入目标仓库。安装脚本附带的 `generate-repo-map.sh` 与 `sync-skills.sh` 是可选辅助脚本，目标仓库已有同名脚本时会拒绝覆盖。Go 后端项目会从 `go.mod` 或 `.go` 文件识别，并在生成的验证说明中提示 `go test ./...`。

当多个独立仓库已经长期作为同一个业务平台维护，并且父目录沉淀了跨端文档、部署脚本或 Agent 指令时，可以评估迁移为 monorepo。执行前参考 [多仓库迁移为 monorepo 实操 runbook](docs/monorepo-migration-runbook.zh-CN.md)，先保护旧仓库历史，再更新父目录文档和验证远端。

外部工具取舍见 [Codex 低 token 工具调研](docs/codex-low-token-tooling-research.zh-CN.md)。当前推荐使用 `ai-context-kit`、`project-facts`、CodeGraph 按需查询、`ccusage` 统计和规则版 `redact`；TencentDB-Agent-Memory、`opf`/privacy-filter、OpenClacky 的增强能力放到第二阶段试点。

普通使用者不需要记住所有 CLI 命令。推荐让使用者只使用三句入口：`首次接入`、`已接入升级`、`开启每日反哺候选`。Agent 再按 Skill 调用 `onboard`、`upgrade`、`doctor`、`repair`、`token-status`、`automation-prompt` 或安装脚本。首次接入和已接入升级的最终报告必须写明 CodeGraph 状态、静态 token 报告/dashboard 状态、observe hooks 状态和真实 session usage 状态。CLI 作为执行层隐藏在 Skill、编辑器任务、hooks 或 Codex plugin 背后。

## 与现有工具的关系

| 已有方式 | 使用本项目时的处理 |
| --- | --- |
| 项目没有规格制度 | 安装 `project-facts/` 模板作为起始资料 |
| 已使用 OpenSpec | 保留 `openspec/` 结构，将本项目的状态、证据和交接规则映射进去 |
| 已使用 GitHub Spec Kit | 保留 `.specify` 和已有 `specs`，只增加来源、未知项和验收映射 |
| 已使用 neuDrive | 用 Team Library 分发模板、playbook 与 Skill；正式项目事实仍保存在代码仓库 |

## 更新方式

这个仓库是制度与模板的维护源。目标项目已经复制过去的事实文件归目标项目负责，不能由模板升级自动覆盖。

后续若设置远端 Git 仓库，可选择：

- 手工复制新版模板到项目并通过 PR 审阅变化；
- 将本仓库作为 `tooling/project-facts-kit` 的 Git submodule 或 subtree 引用，再明确哪些文件只是模板；
- 通过 neuDrive 分发 `Skill` 与 playbook，让不同 Agent 采用同一工作步骤。

任何方式都不应绕过目标项目自己的审批与验证。

真实项目中的 Skill 使用经验可以每天整理成候选项，再回到本资料库评审。候选记录先进 `project-facts/skill-feedback/`、`docs/skill-performance-log.md` 或本仓库 `docs/skill-iteration-backlog.zh-CN.md`，通过 Tool/library owner 审阅后才修改共享 `skills/`、模板或 CLI。

## 来源

本项目源自 neuDrive 内的多项目 AI 协作调研。迁移保留为复制快照，不删除原项目资料，见 [迁移与接入说明](docs/neudrive-integration.zh-CN.md)。
