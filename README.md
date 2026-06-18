# Project Facts Kit

一套面向 AI 协作的项目事实制度、模板、CLI 和 Agent Skill。它让不同同事、不同模型接手同一个项目时，能先看到已确认目标、当前事实、未知项和验证证据，再开始改代码。

## 它解决什么问题

| 问题 | 本项目提供的做法 |
| --- | --- |
| 项目知识只在聊天、个人记忆或某个模型上下文里 | 把项目事实写进目标仓库的 Git 历史 |
| 代码现状、业务意图和 AI 推断混在一起 | 用 `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT` 区分状态 |
| 新同事接手时需要大量口头解释 | 提供 `project-facts/`、`AGENTS.md` 片段和交接模板 |
| 多仓库 workspace 消耗大量上下文 | 用 `ai-context-kit` 生成父目录路由、子仓库索引和 token 报告 |
| 真实项目经验想沉淀为共享 Skill | 先进入候选记录，再由 Tool/library owner 审阅 |

## 核心分工

| 载体 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| `project-facts/` | 项目目标、运行事实、规格、变更、证据和交接 | 不保存未经确认的 AI 推断 |
| `AGENTS.md` | Agent 进入项目后的读取顺序、验证命令和禁读范围 | 不替代业务规格 |
| Agent Skill | 接手、升级、审阅、反哺候选等工作步骤 | 不保存某个业务项目的正式需求 |
| `ai-context-kit` | 多仓库导航、索引、token 报告、自动化 prompt | 不批准业务含义 |
| PR / CODEOWNERS / CI | 阻止未经审阅的规则进入团队默认流程 | 不替代责任人判断 |

## 开始使用

### 1. 准备本机 kit

同事第一次使用，或以后更新本机 kit，执行同一条命令。默认目录是 `~/.cache/project-facts-kit`。

<details>
<summary>展开安装或更新命令</summary>

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

</details>

这个脚本会准备两个入口：

| 入口 | 用途 |
| --- | --- |
| `ai-context-kit` / `project-facts-kit` | 给 Agent 调用的 CLI |
| 用户级 Codex Skill | 让 Codex 在目标项目里识别常用入口 |

如果 GitHub clone 失败，检查网络、账号权限或 Git 凭据。更多可复制命令见 [Project Facts Kit 更新命令速查](docs/project-facts-kit-update-commands.zh-CN.md)。

### 2. 在目标项目里使用三句入口

普通使用者不需要记 CLI。打开目标项目 workspace 后，对 Agent 说下面三句之一：

| 场景 | 推荐说法 | Agent 会做什么 |
| --- | --- | --- |
| 新项目第一次接入 | `帮我做项目事实 kit 首次接入。` | 安装轻量模板；多仓库父目录会生成路由、索引并报告 token 可见性 |
| 已接入项目升级 | `帮我做项目事实 kit 已接入升级，不覆盖已有事实。` | 刷新版 Skill、缺失模板和生成资料；保留已有项目事实 |
| 每日 Skill 反哺 | `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。` | 创建或更新候选自动化；只生成候选，不直接改共享 Skill |

已打开具体项目线程时，也可以说 `首次接入`、`已接入升级` 或 `开启每日反哺候选`。

### 3. 手动安装轻量模板

维护者需要显式执行命令时，从本仓库根目录运行：

```bash
./scripts/install-project-facts.sh /absolute/path/to/target-repo --lite
```

安装后，把 `project-facts/AGENTS.fragment.md` 中适合该项目的内容合并进目标仓库 `AGENTS.md`，并填写首批事实文件：

| 文件 | 记录内容 |
| --- | --- |
| `project-facts/project.md` | 项目目标、范围、责任人 |
| `project-facts/runtime.md` | 运行、部署、数据、验证入口 |
| `project-facts/iteration-plan.md` | 当前任务、状态、依赖和验收入口 |
| `project-facts/handover/current.md` | 当前交接信息 |
| `project-facts/specs/<domain>/spec.md` | 当前业务域的要求、状态和验证方法 |

已有代码行为没有业务批准依据时，写成 `OBSERVED`，不要写成 `APPROVED`。

## 常见场景

### 历史项目接入

多数历史项目先使用轻量模板。目标是让下一位维护者知道项目目标、运行方式、当前任务和相关业务域，不要求一次描述完整系统。

```bash
./scripts/install-project-facts.sh /absolute/path/to/project --lite
```

当项目开始持续记录行为变化，再安装完整模板：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project
```

### 已接入项目升级

升级只补新版候选模板、最新 `AGENTS` 片段、缺失辅助脚本和可选 Skill。已有 `project.md`、`runtime.md`、`specs/`、`handover/` 和人工维护的 `AGENTS.md` 不会被覆盖。

```bash
./scripts/install-project-facts.sh /absolute/path/to/project \
  --upgrade-existing \
  --skill-dir /absolute/path/to/project/.codex/skills \
  --refresh-skills
```

### 多仓库父目录

当一个父目录下有后端、前端、小程序等多个独立仓库时，使用 `ai-context-kit`：

```bash
ai-context-kit doctor --workspace /absolute/path/to/parent
ai-context-kit onboard --workspace /absolute/path/to/parent
ai-context-kit token-status --workspace /absolute/path/to/parent
```

常用能力：

| 命令 | 用途 |
| --- | --- |
| `doctor` | 检查路由、索引、项目事实和能力状态 |
| `onboard` | 补齐缺失的流程材料并输出状态 |
| `upgrade` | 刷新已有生成资料 |
| `tokens` / `dashboard` | 生成静态 token 报告和展示页 |
| `contracts --query <text>` | 按 endpoint、DTO、页面或 API wrapper 筛选契约 |
| `automation-prompt` | 生成每日 Skill 候选或评审任务提示词 |

完整命令和状态说明见 [Project Facts Kit 更新命令速查](docs/project-facts-kit-update-commands.zh-CN.md) 与 [采用指南](docs/adoption-guide.zh-CN.md)。

### Skill 反哺

真实项目中的经验先写成候选记录，不直接改共享 Skill。候选项需要说明来源任务、当前 Skill 表现、验证结果、适用范围和审阅结论。通过审阅后，才修改本仓库的 `skills/`、模板或 CLI。

```bash
ai-context-kit automation-prompt --workspace /absolute/path/to/workspace --type skill-feedback-candidate
```

运行方式见 [Skill 反哺自动化运行手册](docs/skill-feedback-automation-runbook.zh-CN.md)。

## 仓库结构

| 路径 | 用途 |
| --- | --- |
| `docs/project-facts-governance.zh-CN.md` | 项目事实制度正文 |
| `docs/adoption-guide.zh-CN.md` | 新项目、旧项目、Spec Kit、OpenSpec、多仓库的采用方式 |
| `docs/project-facts-kit-update-commands.zh-CN.md` | 本机更新、项目升级、自动化和维护命令 |
| `docs/ai-era-collaboration-playbook.zh-CN.md` | 不依赖外部工具的接手与交接手册 |
| `docs/ai-agent-carrier-roadmap.zh-CN.md` | Skill、CLI、MCP、hooks、CodeGraph、RAG 和 memory layer 分工 |
| `docs/codex-low-token-tooling-research.zh-CN.md` | Codex app 低 token 工具调研 |
| `docs/skill-feedback/` | 共享 Skill 候选项接收区和模板 |
| `docs/research/source-neudrive/` | 2026-05-25 从 neuDrive 复制来的来源快照 |
| `template/project-facts/` | 可安装到目标项目的项目事实目录骨架 |
| `template/AGENTS.project-facts.fragment.md` | 可合并到目标项目 `AGENTS.md` 的 Agent 规则 |
| `skills/project-facts-maintainer/` | 项目事实维护 Skill |
| `skills/low-token-context-maintainer/` | Codex 低 token 接手 Skill |
| `plugins/project-facts-kit-codex/` | Codex plugin 形式的分发外壳 |
| `packages/ai-context-kit/` | 多仓库上下文、索引和 token 报告 CLI |
| `scripts/setup-local-kit.sh` | 本机首次准备和更新脚本 |
| `scripts/install-project-facts.sh` | 目标仓库模板安装脚本 |
| `scripts/check-kit.sh` | 本资料库完整性检查 |

## 关键原则

- 项目事实必须进入目标项目 Git 历史，不能只留在聊天、个人 memory 或模型上下文里。
- `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT` 必须区分记录。
- 模型可以协助阅读、整理、实现和检查，不能自行批准业务含义。
- 需求变化需要对应验证证据；未执行的检查写为 `Not run`。
- 模板升级不能覆盖目标仓库已有项目事实目录或已有 Skill。
- 每个项目需要一名可异步确认业务意图的责任人。

## 深入文档

| 想了解 | 阅读 |
| --- | --- |
| 制度规则和状态定义 | [项目事实制度](docs/project-facts-governance.zh-CN.md) |
| 接入路径和多仓库说明 | [采用指南](docs/adoption-guide.zh-CN.md) |
| 可复制命令 | [Project Facts Kit 更新命令速查](docs/project-facts-kit-update-commands.zh-CN.md) |
| 多项目接手分层 | [AI 时代多项目轻量协作手册](docs/ai-era-collaboration-playbook.zh-CN.md) |
| Skill 是否适合作为载体 | [Skill 作为载体的评估](docs/skill-carrier-assessment.zh-CN.md) |
| 自动化候选和评审 | [Skill 反哺自动化运行手册](docs/skill-feedback-automation-runbook.zh-CN.md) |
| 真实任务验证缺口 | [真实任务 A/B 审计](docs/ai-context-kit-real-task-ab-audit.md) |
| neuDrive 迁移边界 | [迁移与接入说明](docs/neudrive-integration.zh-CN.md) |

## 维护与验证

这个仓库是制度与模板的维护源。目标项目复制过去的事实文件归目标项目负责，不能由模板升级自动覆盖。

修改本仓库后执行：

```bash
./scripts/check-kit.sh
git diff --check
```

如果修改了 Skill，再运行 Agent Skills 校验工具；本机没有该工具时，在交付说明里明确写未验证。

来源资料保存在 `docs/research/source-neudrive/`，用于追溯。需要修订的通用规则写到本项目自己的文档中，不直接改来源快照。
