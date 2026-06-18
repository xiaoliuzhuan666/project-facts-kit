# 采用指南

## 选择方式

| 项目现状 | 建议方式 |
| --- | --- |
| 只是希望别的同事能接手阅读 | 不安装外部工具，先维护 `AGENTS.md`、`project.md`、`handover/current.md` 和当前业务域 `spec.md` |
| 历史项目没有持续维护的需求资料 | 安装本项目的 `project-facts/` 模板，从当前要改的业务域开始 |
| 项目已经使用 OpenSpec | 不新增平行体系；把状态、证据、交接规则加入 `openspec/specs` 与 `openspec/changes` |
| 项目已经使用 Spec Kit | 不替换原目录；把来源等级、未知项和 `evidence` 要求加入现有模板 |
| 新建项目且需求影响范围大 | 可以使用 Spec Kit 建立完整阶段流程，同时采用本制度的状态和证据要求 |
| 团队需要跨 Agent 分享流程 | 分发本项目 Skill 和 `AGENTS.md` 片段，正式事实仍归目标仓库 |
| 多个独立仓库放在同一个父目录 | 使用 `ai-context-kit` 生成父目录路由、子仓库索引和 token 测量报告 |
| 多个独立仓库已经按同一业务平台维护 | 评估迁移为 monorepo，参考 `docs/monorepo-migration-runbook.zh-CN.md` |

固定原则：`Skill` 提升接手效率和执行下限；`project-facts/` 保证不偏离项目真实情况；PR 审阅保证经验不会未经确认变成团队规则。分层依据见 [Skill 作为载体的评估](skill-carrier-assessment.zh-CN.md)。Skill、CLI、MCP、hooks、CodeGraph、RAG 和 memory layer 的关系及迭代计划见 [AI Agent 载体调研与迭代计划](ai-agent-carrier-roadmap.zh-CN.md)。

Skill 适合承载“怎么做”的流程，project-facts 适合承载“项目到底是什么”的事实。前者负责接手和审阅步骤，后者负责需求、证据和交接。若把两者混在一起，短期看像是更省事，长期会把项目事实和模型推断搅在一起。

外部工具不是接手协作的前置条件。具体接手、交接和分层采用方式见 [AI 时代多项目轻量协作手册](ai-era-collaboration-playbook.zh-CN.md)。

## 推荐初始接入步骤

### 同事首次拿到 kit

同事在业务项目里说三句入口前，本机需要先有这套 kit。推荐统一放在 `~/.cache/project-facts-kit`。下面这一条命令同时支持首次 clone 和后续更新：

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

脚本会准备两个入口：

| 入口 | 作用 |
| --- | --- |
| `ai-context-kit` / `project-facts-kit` | 给 Agent 调用的 CLI 执行层 |
| 用户级 Codex Skill | 让 Codex 在目标项目线程里识别三句入口 |

如果 GitHub clone 失败，先检查网络、账号权限或 Git 凭据。这个步骤只处理工具获取和本机安装，不会改业务项目。已有本地未提交修改的 kit 目录会被改名备份，不会被覆盖。

本机 kit 更新、项目升级、自动化 prompt 和维护仓库校验命令集中放在 [Project Facts Kit 更新命令速查](project-facts-kit-update-commands.zh-CN.md)。

对没有现成事实制度的项目，推荐按三步接入，不让工具直接替代项目判断：

1. 生成模板：用 `install-project-facts.sh` 安装 `project-facts/`、`AGENTS.fragment.md` 和辅助脚本。老项目先用 `--lite`，需要持续记录行为变化的项目用完整模板。
2. 人工整理项目专属 `AGENTS.md`：把 `AGENTS.fragment.md` 合并进根 `AGENTS.md`，同时写入本项目真实的目录结构、验证命令、敏感路径、不要默认读取的大目录和项目特殊规则。
3. 填写首批事实索引：至少维护 `project.md`、`glossary.md`、`runtime.md`、`iteration-plan.md`、`handover/current.md`，并按当前项目形态增加 `domain-index.md`、`context-boundary.md` 或当前业务域 `spec.md`。现有代码和测试只能标 `OBSERVED`，责任人确认前不要写成 `APPROVED`。

这三步的目标是给后续 AI 和人一个可靠入口：先知道从哪里读、哪些只是现状、哪些还没确认，再开始修改代码。

本机准备完成后，普通使用者不需要记 CLI。推荐固定三句入口：

| 场景 | 推荐说法 | Agent 背后动作 |
| --- | --- | --- |
| 新项目第一次接入 | `帮我做项目事实 kit 首次接入。` | 安装轻量模板；多仓库父目录再运行 `onboard`，并报告 CodeGraph 与 token 可见性 |
| 已接入项目升级 | `帮我做项目事实 kit 已接入升级，不覆盖已有事实。` | 使用升级模式刷新 Skill、缺失模板和生成资料，保留项目事实，并报告 CodeGraph 与 token 可见性 |
| 每日 Skill 反哺 | `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。` | 生成自动化 prompt，并在可用时创建或更新 Codex app automation |

在已经打开目标项目的线程里，也可以简短说 `首次接入`、`已接入升级` 或 `开启每日反哺候选`。如果同事还没打开目标项目，使用完整说法更清楚。

这三句里面已经包含 Skill 和 CLI：Skill 决定工作流程，CLI 负责安装、升级、`doctor` 状态检查、低 token 路由、token 状态、`capability actions` 和自动化 prompt。首次接入和已接入升级的结果里必须说明 CodeGraph 当前是跳过、缺 CLI、建议初始化还是已初始化，也必须说明静态 token 报告、dashboard、observe hooks 和真实 session usage 是否已经可见。

Agent 应优先使用当前打开的 workspace 或业务父目录作为入口，再按当天变更、证据路径和模块线索定位子仓库。只有无法判断候选归属时，才把它列为待确认项。

### 同事如何知道这套 Skill 和 CLI

推荐的团队分发方式按成本从低到高排序：

1. 发给同事 README 里的“第一次使用：先获取 kit”命令块；同事执行一次后只记三句入口。
2. 在目标项目的 `AGENTS.md` 合并 `project-facts/AGENTS.fragment.md`，让任何 Agent 进项目时都能看到读取顺序和 Skill 反哺边界。
3. Codex 用户可安装 `plugins/project-facts-kit-codex/`；已通过插件或团队镜像拿到 Skill 和 CLI 的人，可以跳过 clone 步骤。
4. 使用 `scripts/install-project-facts.sh --skill-dir <project>/.codex/skills` 把两个 Skill 放进目标项目，适合需要随项目一起分发 Skill 的团队。
5. 团队维护者后续可把 `ai-context-kit` 做成内部 npm 包、submodule/subtree 或统一安装脚本；普通同事仍然只使用三句入口。

## 多仓库父目录

当团队习惯从一个父目录打开 Codex app，而这个目录下实际是多个独立 Git 仓库时，先执行：

```bash
ai-context-kit doctor --workspace /absolute/path/to/parent
ai-context-kit onboard --workspace /absolute/path/to/parent
ai-context-kit agents --workspace /absolute/path/to/parent
# 或：ai-context-kit repair --workspace /absolute/path/to/parent
# doctor 提示契约表 stale，或需要按当前仓库状态刷新生成资料时：
ai-context-kit upgrade --workspace /absolute/path/to/parent
ai-context-kit init --workspace /absolute/path/to/parent
ai-context-kit measure --workspace /absolute/path/to/parent
ai-context-kit tokens --workspace /absolute/path/to/parent
ai-context-kit dashboard --workspace /absolute/path/to/parent
ai-context-kit token-status --workspace /absolute/path/to/parent
ai-context-kit token-status --workspace /absolute/path/to/parent --json --output docs/ai-context-token-status.json
ai-context-kit editor-tasks --workspace /absolute/path/to/parent
```

如果从本仓库根目录 `npm link`，也可以使用：

```bash
project-facts-kit context doctor --workspace /absolute/path/to/parent
project-facts-kit context onboard --workspace /absolute/path/to/parent
project-facts-kit context upgrade --workspace /absolute/path/to/parent
project-facts-kit context repair --workspace /absolute/path/to/parent
project-facts-kit context init --workspace /absolute/path/to/parent
project-facts-kit context measure --workspace /absolute/path/to/parent
project-facts-kit context tokens --workspace /absolute/path/to/parent
project-facts-kit context dashboard --workspace /absolute/path/to/parent
project-facts-kit context token-status --workspace /absolute/path/to/parent
project-facts-kit context editor-tasks --workspace /absolute/path/to/parent
```

生成结果：

```text
<parent>/
  AGENTS.md
  docs/
    ai-context-workspace-map.md
    ai-context-api-contract-map.md
    ai-context-scope-report.md
    ai-context-token-savings-measurement.md
  <child-repo>/
    AGENTS.md
    project-facts/
      project.md
      verification.md
      context-boundary.md
      backend-route-controller-map.md、api-contract-map.md 或 api-endpoints.md
```

从父目录开始时，先用 `onboard` 或 `doctor` 判断缺什么，不要先广泛搜索源码。`onboard` 会先补缺失的流程材料，再输出 `doctor`、`token-status` 和 `capability actions`；`upgrade` 刷新生成资料后也会输出同样状态。`doctor` 会输出两组信息：`workflow artifacts` 表示路由、索引和项目事实文件是否存在；`capability status` 表示 CodeGraph、token 报告、observe hooks、session usage、graph、real-task A/B 和 redact 是否可用或需要处理。`capability actions` 会把 CodeGraph 和 token 可见性的下一步命令整理出来。缺流程材料时用 `onboard`、`agents` 或 `repair` 生成缺失项；已有契约表被标为 `stale` 时再用 `upgrade` 或 `init` 刷新生成资料。

`capability status` 的处理规则：

| 能力 | 状态含义 | 建议处理 |
| --- | --- | --- |
| `low-token artifacts` | `ready`、`missing` 或 `stale` | 缺失时用 `onboard`、`agents` 或 `repair`，过期时用 `upgrade` 或 `init` |
| `contract index` | 契约索引是否可用于 `contracts --query` | `missing`、`partial` 或 `stale` 时用 `upgrade` 或 `init` 刷新，再用源码确认 |
| `CodeGraph` | 是否值得对某个仓库建立符号图 | 只在 `recommended` 或复杂项目 `missing_cli` 时按仓库启用，不默认初始化 |
| `static token report` / `token dashboard` | 静态上下文 token 是否测量过 | `not_run` 或 `missing` 时运行 `tokens` 和 `dashboard` |
| `observe hooks` / `session token usage` | 真实任务 token 数据是否可见 | 需要长期观察时启用 `install-hooks --mode observe`，再用 `sessions` |
| `ai-context-graph` / `real-task A/B` / `redact` | 可选结构图、真实任务证据和脱敏能力 | 按任务需要使用，不作为默认业务事实 |

`facts`、`agents`、`measure`、`tokens`、`summary`、`dashboard`、`codegraph --repos <name>` 也可以单独执行。`tokens` 通过 `repomix@latest` 测量 token；`summary` 在终端打印短摘要；`dashboard` 从最新 token 报告生成 `docs/ai-context-token-dashboard.md`。小型仓库可能出现生成索引比源码 token 更多的结果，以报告数字为准。跨端分析需要检查请求/响应 DTO、DTO copy/mapper 和新旧接口路径，避免只停留在页面或接口清单。

需要把节省数字展示给使用者时，按场景选择入口：静态节省看 `docs/ai-context-token-dashboard.md`；终端或编辑器任务看 `ai-context-kit token-status --workspace <path>`；IDE 面板、插件或团队脚本读取 `ai-context-kit token-status --workspace <path> --json --output docs/ai-context-token-status.json`；真实任务用 `codex-mem sessions` 或 `exec-events` 记录 session tokens；Codex app、CLI 和 Codex IDE extension 可通过 `codex-mem install-hooks --mode observe` 在 `Stop` 事件返回本地 token snapshot。VS Code 兼容编辑器可运行 `ai-context-kit editor-tasks --workspace <path>` 生成 `.vscode/tasks.json`，其中包含写入 token status JSON 的任务；其他 IDE 可把同样命令做成 run configuration 或终端别名。

这些文件用于降低 Codex app 初始阅读和搜索范围。它们不替代需求事实、变更记录和验收证据；持续协作仍按 `project-facts/` 模板维护。生成文件提交前要确认没有本机绝对路径、敏感配置路径或临时测量输出。

如果父目录已经从“多个独立 Git 仓库的集合”演变为同一个业务平台的事实入口，例如跨端文档、部署脚本、接口契约和 Agent 指令都在父目录维护，可以考虑把它迁移为 monorepo。迁移过程不要只改 remote；应先备份旧仓库历史，建立父级 `.gitignore`，移走子目录 `.git`，初始化父级 Git，推送到新平台仓库，并同步更新 `AGENTS.md`、workspace map、scope report 和交接说明。完整流程见 [多仓库迁移为 monorepo 实操 runbook](monorepo-migration-runbook.zh-CN.md)。

默认情况下，`ai-context-kit` 不覆盖已有 `AGENTS.md` 或项目事实文件。需要重建生成文件时才使用 `--force`，且只重写带有 `generated-by: ai-context-kit` 标记的文件；没有该标记的项目事实视为人工维护内容并跳过。

外部低 token 工具的取舍见 [Codex 低 token 工具调研](codex-low-token-tooling-research.zh-CN.md)。当前优先采用父目录路由、子仓库事实索引、CodeGraph 按需查询、`ccusage` 统计和规则版 `redact`；长任务记忆、`opf`/privacy-filter 增强脱敏和 agent harness 替换先作为第二阶段试点。

## L1 模式

多数老项目先使用 L1 模式，接手者能读懂项目目标和当前任务即可，不必马上加入完整变更流程：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project --lite
```

结果：

```text
<target>/
  project-facts/
    README.md
    AGENTS.fragment.md
    project.md
    glossary.md
    runtime.md
    iteration-plan.md
    specs/_template/spec.md
    handover/current.md
    handover/for-next-maintainer.md
```

L1 模式不会安装 `changes/_template/`、`decisions/` 或 `integration/github/`。`runtime.md` 会随 L1 安装，用来记录部署、数据目录、反向代理、资源限制和发布验证入口。当项目开始持续记录行为变化，再按完整模板补齐。

安装脚本还会复制两个可选辅助脚本到目标仓库 `scripts/`：`generate-repo-map.sh` 用于生成 `project-facts/repo_map.txt`，`sync-skills.sh` 用于本地 AI 规则和 Skill 软链接。目标仓库已有同名脚本时安装会拒绝覆盖。

## 完整模板

本项目提供不会覆盖已有目录的安装脚本：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project
```

结果：

```text
<target>/
  project-facts/
    README.md
    AGENTS.fragment.md
    project.md
    glossary.md
    runtime.md
    iteration-plan.md
    specs/_template/spec.md
    changes/_template/*.md
    decisions/ADR-0000-template.md
    handover/current.md
    handover/for-next-maintainer.md
    integration/github/*.md
```

操作要求：

1. 将 `project-facts/AGENTS.fragment.md` 的适用内容合并到项目已有 `AGENTS.md`；不存在时可以基于它创建根文件。
2. 复制 `_template` 到真实业务域或真实变更目录后再填写，不直接把模板标为批准事实。
3. 在 PR 规则中纳入项目事实目录的审阅责任。
4. 如需生成 `repo_map.txt`，先审阅 `scripts/generate-repo-map.sh` 的排除规则；生成结果只作为导航索引，不作为业务批准来源。

## 安装 Skill

支持 Agent Skills 的项目可附加安装流程 Skill。目录由使用者指定，避免假设不同 Agent 的本地安装位置：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project \
  --skill-dir /absolute/path/to/project/.codex/skills
```

Skill 提供工作步骤，不包含项目自身的业务批准内容。

已经接入过本项目的仓库，不需要重新安装或重写项目事实。使用升级模式只补新版候选模板、最新 `AGENTS` 片段和缺失辅助脚本；已有 `project.md`、`runtime.md`、`specs/`、`handover/` 和人工维护的 `AGENTS.md` 不会被覆盖：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project \
  --upgrade-existing \
  --skill-dir /absolute/path/to/project/.codex/skills \
  --refresh-skills
```

`--refresh-skills` 会先把旧 Skill 目录改名为 `*.backup-<timestamp>`，再写入新版共享 Skill。若只想补候选模板和最新片段，不替换项目内 Skill，去掉 `--refresh-skills` 即可。升级后如果生成了 `project-facts/AGENTS.fragment.latest.md`，只把其中仍适合该项目的几条合并到根 `AGENTS.md`。

面向同事推荐自然语言入口；需要复制命令时使用 [Project Facts Kit 更新命令速查](project-facts-kit-update-commands.zh-CN.md)。

## Skill 反哺流程

如果团队希望把真实项目中的经验持续改进到共享 Skill，采用候选加评审流程：

1. 在业务项目中记录候选项：使用 `project-facts/skill-feedback/_template.md` 复制出真实记录，或更新 `docs/skill-performance-log.md`。
2. 每天定时汇总一次当天候选项，记录有用行为、缺失行为、误导行为、工具冲突、验证结果和未验证项。
3. 定时任务只提交候选，不直接修改共享 `skills/`。
4. Tool/library owner 在本资料库评审候选项，通过后才修改 `skills/`、模板或 CLI。
5. 修改本资料库后执行 `./scripts/check-kit.sh` 和 `git diff --check`；如果修改了 Skill 且本机有 Agent Skills 校验工具，再运行该工具。没有该工具时，在交付说明中写明未验证。

推荐的每日自动化任务提示词可以由 CLI 生成，避免不同 Agent 临场改写：

```bash
ai-context-kit automation-prompt --workspace /absolute/path/to/workspace --type skill-feedback-candidate
```

生成的提示词要求任务从当前 workspace 或业务父目录自动定位子仓库。核心规则如下：

```text
读取今天的项目事实变更、handover、evidence、skill-feedback 和 skill-performance-log。
如果 automation 工作目录是业务父目录，先根据 AGENTS.md、workspace map、git status、最近提交、文件路径、模块名、页面、endpoint、Controller、DTO、API wrapper、包名和错误日志定位目标子仓库。
先按仓库整理当天改动分类表，区分已提交、未提交、生成资料、远端同步状态、业务改动、项目事实证据、验证结果和可复用 Skill/工具候选。
能明确归属时，把候选写入对应子仓库的 project-facts/skill-feedback/；多个仓库各自有证据时分别写；归属冲突时只列待确认，不猜测写入。
请只整理可以反哺到共享 Skill 的候选项，不要修改正式 Skill。
每个候选项必须包含：来源任务、使用的 skill、观察到的有用/缺失/误导行为、证据路径、实际验证结果、是否跨项目适用、是否可能只是项目专属规则、建议进入哪个 skill 小节。
把结果写成候选记录，状态保持 proposed；证据不足写 needs-evidence。
```

本资料库接收候选项时，先放入 `docs/skill-iteration-backlog.zh-CN.md` 或专门的 `docs/skill-feedback/`。不要把项目里的 AI 总结原样复制进共享 Skill。

三个位置的用途不同：业务项目的 `project-facts/skill-feedback/` 保存原始候选，本资料库 `docs/skill-feedback/` 保存进入资料库的候选文件，`docs/skill-iteration-backlog.zh-CN.md` 保存 reviewer 状态和已应用记录。

需要让流程每天运行时，按 [Skill 反哺自动化运行手册](skill-feedback-automation-runbook.zh-CN.md) 分别设置两个任务：业务项目生成候选，本资料库评审候选。两个任务都不允许直接把 AI 总结写入共享 Skill。

为了减少审阅负担，业务项目的每日任务只生成候选和摘要；没有候选时不创建候选文件，可只写运行记录。Skill 仓库可以按天或按周聚合候选、去重、标注证据状态，只在候选足够明确时创建 draft PR。PR 审阅仍然保留，但 reviewer 处理的是整理后的批量摘要，不需要逐条翻项目原始记录。

### 按项目状态接入反哺流程

已接入本 Skill 的项目：

1. 运行升级命令，默认保留已有项目事实，只刷新共享 Skill 和缺失模板。
2. 如果生成了 `project-facts/AGENTS.fragment.latest.md`，只合并和本项目相关的几条规则。
3. 从下一次任务开始，发现 Skill 改进点时写入 `project-facts/skill-feedback/`；没有候选就不新增。
4. 需要每日总结时，让 Agent 开启“当前 workspace/业务父目录”的候选任务；它会按当天证据识别具体子仓库。
5. 候选进入本资料库后，由 Tool/library owner 评审；通过后才改共享 Skill、模板、脚本或 CLI。

新项目：

1. 先运行 `./scripts/install-project-facts.sh /absolute/path/to/project --lite`。
2. 把生成的 `project-facts/AGENTS.fragment.md` 合并进项目根 `AGENTS.md`。
3. 先填 `project-facts/project.md`、`runtime.md`、`iteration-plan.md`、`handover/current.md` 和当前业务域 `spec.md`。
4. 需要持续记录行为变化时，再安装完整模板。
5. 需要持续反哺时，让 Agent 开启每日候选任务；单仓库直接写本仓库，多仓库父目录自动识别子仓库。

推荐给同事使用时，告诉对方三件事即可：

1. 先读根 `AGENTS.md`，再读 `project-facts/README.md`、`project.md`、`runtime.md`、`iteration-plan.md` 和当前域 `spec.md`。
2. 代码现状只能写成 `OBSERVED`；没有责任人或审阅记录时，不写成 `APPROVED`。
3. 发现 Skill 可改进点时，写候选文件并附来源、验证和适用范围，不直接改共享 Skill。

自动化需要一个入口目录，但不要求普通使用者指定每个子仓库路径。入口可以是当前业务仓库、业务父目录或 Codex app 当前 workspace。任务先自动识别当天证据属于哪个仓库，再按仓库分类已提交、未提交、生成资料、远端同步状态、业务改动、项目事实证据和可复用候选，最后写入对应的 `project-facts/skill-feedback/`；识别不清时只列待确认项。团队维护者也可以在自动化配置中传多个 `cwds`，覆盖一组常用业务父目录。

## 老项目第一次接手

在不阻断正常开发的前提下，按任务范围恢复事实：

1. 填写 `project.md`：仓库入口、负责人、运行方式、验证命令。
2. 填写 `glossary.md`：本次任务涉及的术语，不要求覆盖全部业务。
3. 填写 `iteration-plan.md`：当前任务、负责人、状态、验证命令和接手说明。
4. 选择当前任务所属业务域，复制 `specs/_template/spec.md` 为 `specs/<domain>/spec.md`。
5. 将现有资料分成 `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT`。
6. 为本次改动复制变更模板并填写 `proposal.md`、`unknowns.md` 和 `evidence.md`。
7. 高影响问题得到确认后实施；完成检查后更新证据。

## OpenSpec 映射

若目标项目已采用 OpenSpec：

| 本制度概念 | OpenSpec 位置建议 |
| --- | --- |
| 当前规格 | `openspec/specs/<domain>/spec.md` |
| 单次修改 | `openspec/changes/<change>/` |
| 目的与范围 | `proposal.md` |
| 状态、需求与验收场景 | `specs/` 中对应 delta，或同目录 `requirements.md` |
| 未知项 | 在 change 下新增 `unknowns.md` |
| 验证证据 | 在 change 下新增 `evidence.md` |
| 完成后的历史 | `archive/` |

不强制安装 OpenSpec CLI；项目若已使用它，应继续按其官方流程维护并额外执行团队审阅要求。

## Spec Kit 映射

若目标项目已采用 GitHub Spec Kit：

| 本制度要求 | 加入现有流程的位置 |
| --- | --- |
| 负责人和来源状态 | spec template |
| 未知项确认 | `/speckit.clarify` 产出与单独 unknowns 记录 |
| 规格质量检查 | `/speckit.checklist` |
| 跨资料一致性 | `/speckit.analyze` |
| 验收证据 | feature spec 旁的 `evidence.md` 或项目统一 evidence 目录 |
| 交接摘要 | 项目自己的 handover 文件 |

已有 Spec Kit 内容不因采用本制度而迁移或删除。

## 集中维护与项目副本

制度模板会更新，目标项目事实也会持续变化。两类资料必须分开：

| 资料 | 所有者 | 更新方式 |
| --- | --- | --- |
| 本仓库制度正文与模板 | 工具/流程维护者 | 在本仓库审阅和发布版本 |
| 目标项目的事实文件 | 项目负责人 | 在目标仓库随代码通过 PR 维护 |
| 已复制模板的后续改版 | 目标项目决定是否采用 | 以明确 diff 合入，不自动覆盖 |

当本项目拥有远端仓库后，可由团队选择 submodule 或 subtree 访问最新模板；不要用它覆盖目标项目已经填写的事实。
