# AI Agent 载体调研与迭代计划

日期：2026-06-17

## 调研结论

`Skill + CLI` 和 `MCP` 不是互相替代的两套方案。更准确的分工是：

| 载体 | 行业位置 | 适合承担的职责 | 本项目建议 |
| --- | --- | --- | --- |
| `AGENTS.md` / 仓库规则 | Codex、Copilot、Claude Code、Gemini CLI、Cursor 都有类似仓库级指令入口 | 保存项目读取顺序、验证命令、敏感路径和团队约定 | 保持为每个项目的默认入口 |
| `project-facts/` | Git 中可审阅、可追溯的事实资料 | 保存项目目标、状态、来源、验证和交接 | 继续作为事实层，不让 Skill 或 memory 替代 |
| Skill | OpenAI Codex、Claude Code、Cursor 和 Agent Skills 规范都支持或正在支持 | 保存可复用工作流、参考资料和脚本说明，按需加载以节省上下文 | 继续承载接手流程、低 token 流程和 Skill 反哺流程 |
| CLI | Coding agent 常用的本地确定性执行层 | 生成索引、状态检查、token 报告、模板安装、校验 | 保留，但让普通用户不需要记命令 |
| MCP | 明确的跨工具协议，用于连接模型、工具和上下文 | 接外部系统、实时数据、私有工具、知识库和可查询状态 | 做轻量只读查询和外部连接，不作为制度写入入口 |
| Hooks / Automations | Codex 等工具的生命周期扩展和定时任务能力 | 自动记录、提醒、候选汇总、校验提示、token 观察 | 纳入项目，但默认只观察和生成候选 |
| Plugin / Extension | Codex、Gemini CLI 等生态的分发单元 | 把 Skill、MCP、hooks、配置和资产打包给团队安装 | 作为下一阶段降低安装成本的载体 |
| CodeGraph / RAG / memory layer | 大仓库理解和低 token 检索增强层 | 结构图、按需检索、长输出 refs、任务记忆、影响分析 | 分阶段纳入，不替代项目事实和人工审阅 |

所以本项目当前的 `Skill + CLI` 方向是合理的，但要补一个明显短板：普通用户不应该为了使用这套制度去记一串 CLI 命令。CLI 应该成为 Agent、Skill、编辑器任务、hooks 或 plugin 背后的执行层。

## 适合本项目的分层

本项目的核心原则保持不变：

1. `Skill` 提升接手效率和执行下限。
2. `project-facts/` 保证不偏离项目真实情况。
3. PR 审阅保证经验不会未经确认变成团队规则。

在这个原则下，各层职责如下：

| 层级 | 正确用法 | 不应承担 |
| --- | --- | --- |
| 事实层 | `project-facts/`、ADR、changes、evidence | 不保存无来源的 AI 推断 |
| 流程层 | Skill、AGENTS 片段、playbook | 不保存项目批准需求 |
| 执行层 | `ai-context-kit`、安装脚本、校验脚本 | 不自行批准制度变化 |
| 连接层 | MCP、外部系统 connector | 不直接修改共享 Skill |
| 自动层 | Hooks、Automations、scheduled reports | 不把候选直接变成团队规则 |
| 分发层 | Plugin、repo template、team library | 不覆盖目标项目已有事实 |
| 增强层 | CodeGraph、RAG、memory、refs | 不替代源码确认、测试和审阅 |

## 用户无感 CLI

目标不是取消 CLI，而是让 CLI 退到用户看不见的位置。普通使用者只需要说清楚目标，Agent 负责按 Skill 调用命令。

### 普通用户入口

推荐给同事的使用方式固定为三句：

| 场景 | 推荐说法 |
| --- | --- |
| 新项目第一次接入 | `帮我做项目事实 kit 首次接入。` |
| 已接入项目升级 | `帮我做项目事实 kit 已接入升级，不覆盖已有事实。` |
| 每日 Skill 反哺 | `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。` |

Agent 根据 Skill 执行：

```bash
ai-context-kit onboard --workspace <workspace>
```

用户不需要记住这些命令，只需要在结果里看到：

- 当前项目事实是否齐；
- 低 token 路由是否可用；
- token 报告和 hooks 是否开启；
- CodeGraph 是否建议按仓库启用；
- 哪些检查没有执行。

自动化 prompt 由 CLI 输出，供 Agent 或 Codex app automation 使用：

```bash
ai-context-kit automation-prompt --workspace <workspace> --type skill-feedback-candidate
ai-context-kit automation-prompt --workspace <skill-repo> --type skill-feedback-review
```

这个命令只输出提示词，不创建任务、不改 Skill。业务候选任务可以挂在当前业务仓库、业务父目录或多个父目录上，再按当天证据识别具体子仓库。

### 已接入项目的升级入口

已安装过本项目的业务仓库，面向用户只暴露一句话：

```text
帮我做项目事实 kit 已接入升级，不覆盖已有事实。
```

Agent 执行：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project \
  --upgrade-existing \
  --skill-dir /absolute/path/to/project/.codex/skills \
  --refresh-skills
```

执行后只让用户确认功能层结果：

- 已保留已有 `project-facts/`；
- 已刷新共享 Skill；
- 已补缺失模板或最新 AGENTS 片段；
- 需要人工合并的内容单独列出；
- 已执行或未执行的检查明确说明。

### 新项目入口

新项目面向用户只暴露一句话：

```text
帮我做项目事实 kit 首次接入。
```

Agent 执行：

```bash
./scripts/install-project-facts.sh /absolute/path/to/project --lite
```

如果项目是多仓库父目录，再执行：

```bash
ai-context-kit onboard --workspace /absolute/path/to/parent
```

### 编辑器和团队脚本入口

`ai-context-kit editor-tasks` 应继续作为低成本入口，生成可点击任务：

- 接手 workspace；
- 刷新 workspace 生成资料；
- 检查状态；
- 刷新 token 状态 JSON；
- 生成 token dashboard；
- 安装 observe hooks；
- 汇总 session usage。

这适合 VS Code、Cursor、Windsurf 等编辑器，也适合团队把命令挂到内部脚本里。

## PR 审阅的无感方案

PR 审阅不能取消，因为它是“经验不会未经确认变成团队规则”的最后防线。可以减少用户负担，但不能让自动化直接批准共享 Skill。

推荐采用四级处理：

| 等级 | 场景 | 用户感知 | 是否需要人工审阅 |
| --- | --- | --- | --- |
| L0 自动忽略 | 没有候选，或候选没有证据 | 用户无感 | 不需要 |
| L1 自动整理 | 有候选，但只生成 proposed 文件和摘要 | 只在每日摘要中看到 | 暂不需要 |
| L2 批量审阅 | 多个候选已聚合、去重、附证据和建议结论 | reviewer 一次看摘要 | 需要 Tool/library owner 确认 |
| L3 变更 PR | 候选被接受并修改 Skill、模板或 CLI | 用户只看 PR 摘要和检查结果 | 必须审阅 |

这样用户不会被每条候选打扰。日常项目使用者只负责留下真实任务证据；自动化负责整理；Tool/library owner 批量处理。

### 推荐自动化行为

业务项目每日任务：

- 可以从业务父目录或当前 workspace 运行，不要求用户指定每个子仓库；
- 根据 `AGENTS.md`、workspace map、git status、最近提交、文件路径、模块名、页面、endpoint、Controller、DTO、API wrapper、包名和日志定位候选归属；
- 读取当天 `project-facts/changes/`、`handover/`、`evidence`、`skill-feedback/` 和任务记录；
- 只生成候选，不修改共享 Skill；
- 证据不足时标为 `needs-evidence`；
- 归属冲突时只列待确认项，不猜测写入；
- 没有候选时不创建文件，只写一条 summary。

Skill 仓库每日或每周任务：

- 收集多个项目的候选；
- 去重和归类；
- 标出建议状态：`needs-evidence`、`likely-project-specific`、`candidate-for-skill`、`candidate-for-cli`；
- 生成 reviewer 摘要；
- 只在候选达到阈值时创建 PR。

PR 创建策略：

| 触发条件 | 行为 |
| --- | --- |
| 只有候选，没有足够证据 | 不建 PR，只更新 backlog |
| 同类候选跨两个项目出现，且有验证证据 | 建议创建 draft PR |
| 只是文案或模板微调 | 合并进每周批量 PR |
| 涉及 Skill 行为、CLI 命令、hooks 或自动化 | 必须单独 PR |
| 涉及项目业务规则 | 不进入共享 Skill，退回业务项目 |

### 审阅减负要点

- 候选项必须先被自动化整理成摘要，reviewer 不看原始聊天长文。
- PR 模板自动列出来源项目、证据路径、验证命令和未验证项。
- CODEOWNERS 只覆盖 `skills/`、`template/`、`scripts/`、`packages/ai-context-kit/` 和核心制度文档。
- CI 先跑格式、模板完整性、Skill 校验和 CLI smoke test，减少 reviewer 手工检查。
- 对只影响候选 backlog 的 PR，不要求所有业务 owner 参与。

## Hooks / Automations 纳入方式

Hooks 和 Automations 适合做观察、提醒和候选生成，不适合默认拦截开发流程。

### 第一阶段：观察模式

目标：让团队看到真实使用数据，不改变用户工作方式。

- 默认启用 `codex-mem install-hooks --mode observe` 的建议路径；
- Stop hook 返回本地 token snapshot；
- 记录大输出、重复读取、直接读取 `.codex-mem/index.jsonl`、整段读取契约表等行为；
- `token-status` 合并静态 token 报告、hook ledger 和 session usage；
- 每日任务只生成 Skill 反哺候选。

验收标准：

- 用户不需要手动整理 token 数字；
- hooks 不阻断命令；
- 报告中能区分静态估算、本地工具估算和真实 session usage；
- 没有把敏感输出写入 Git。

### 第二阶段：提示模式

目标：在模型明显浪费上下文时给短提示，但不强制阻止。

- 对整段读取大索引、重复打开大文件、输出超长日志给出提示；
- 建议改用 `contracts --query`、`codex-mem route/search` 或 ref 读取；
- 对敏感路径和大输出给出脱敏提醒；
- 仍然不自动改写工具结果。

验收标准：

- 提示不会干扰小任务；
- 真实任务 A/B 显示遗漏率没有上升；
- 用户能看懂提示，不需要理解 hooks 实现。

### 第三阶段：受控模式

目标：只在高风险动作上要求确认。

- 敏感文件读取、未脱敏日志入库、共享 Skill 直接修改等动作进入确认流程；
- 压缩模式仍需真实任务 A/B 通过后再默认开启；
- 高风险项目可以启用更严格的 hooks。

验收标准：

- 误拦截率可接受；
- 有明确绕过和记录机制；
- 不影响紧急修复。

## CodeGraph / RAG / memory layer 纳入方式

这些能力应该进入项目，但要分阶段，不应一次性变成默认依赖。

### CodeGraph

定位：复杂仓库的结构理解和影响分析。

纳入顺序：

1. `doctor` 只判断是否建议启用，不自动初始化；
2. `codegraph --repos <name>` 只对目标仓库启用；
3. 报告里记录图是否存在、更新时间和适用仓库；
4. 跨模块修改前，优先查询影响面；
5. 复杂项目验证通过后，再考虑团队默认安装。

适用场景：

- 大型后端服务；
- 多端共享领域模型；
- 支付、订单、设备状态、结算等链路；
- 影响面不容易靠 `rg` 判断的改动。

不适用场景：

- 小型仓库；
- 单文件修复；
- 图比源码更大、更旧或不可追溯时。

### RAG

定位：对文档、接口说明、历史变更和运行证据做按需检索。

纳入顺序：

1. 先用本地 Markdown 索引和 `codex-mem search/route`；
2. 再评估向量检索是否比关键词和结构索引更有价值；
3. RAG 命中必须返回来源路径和更新时间；
4. 不允许把 RAG 摘要当成 `APPROVED` 需求；
5. 敏感资料进入索引前先走 `redact` 或等价审查。

适用场景：

- 长期项目沉淀了大量变更记录；
- 多仓库跨端资料分散；
- 任务需要快速找到历史上下文。

### Memory layer

定位：记录任务过程中的观察、长输出 refs、历史决策线索和接手摘要。

纳入顺序：

1. 保持 `.codex-mem/observations.jsonl` 和 refs 本地化；
2. `timeline/search/get` 用于取回，不直接污染主上下文；
3. 共享前必须脱敏；
4. 只有经审阅的内容才能进入 `project-facts/`；
5. 不把个人 memory 当成团队事实来源。

适用场景：

- 长任务；
- 多轮 bug 定位；
- 日志和命令输出很长；
- 需要记录“为什么读这些文件”的过程。

## 迭代计划

### M0：现状巩固

目标：把已完成能力变成可理解状态。

- 更新文档，明确 `Skill + CLI`、MCP、hooks、CodeGraph、memory 的分工；
- 在 README 和采用指南里加入用户无感 CLI 入口；
- 保持 `doctor` 为统一状态检查入口；
- 所有文档继续强调不覆盖已有项目事实。

验收：

- `./scripts/check-kit.sh` 通过；
- `git diff --check` 通过；
- Skill 校验通过或明确记录未验证原因。

### M1：用户无感 CLI

目标：普通用户不需要记 `ai-context-kit` 命令。

- 已增加 `scripts/setup-local-kit.sh`，用于同事本机首次准备：链接 CLI，并把共享 Skill 安装到用户级 Codex skill 目录；
- 已在 Skill 中加入“用户只说目标，Agent 自动运行 CLI”的步骤；
- 已增强 `editor-tasks`，让接手、升级、状态检查和 token 报告可点击执行；
- 已增加 `ai-context-kit onboard` / `project-facts-kit context onboard`，用于生成缺失工作流材料并输出 `doctor`、`token-status`；
- 已增加 `ai-context-kit upgrade` / `project-facts-kit context upgrade`，用于刷新已接入项目的生成资料并输出状态；
- 输出结果按功能汇报，不堆命令细节。

验收：

- 新项目可以让 Agent 用一句话触发 `onboard` 和缺失材料检查；
- 旧项目可以让 Agent 用一句话触发 `upgrade`、Skill 刷新和缺失模板检查；
- 不覆盖人工维护事实；
- 用户能从摘要判断下一步。

当前状态：CLI 与 Skill 入口的第一版已经实现。它不是后台常驻服务，也不会替用户自动批准项目事实；它只是把常用命令变成 Agent 和编辑器任务背后的执行层。

首次使用仍需要拿到内部仓库。推荐团队统一使用：

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

之后用户在目标项目 workspace 里说三句入口即可；如果 GitHub clone 失败，先检查网络、账号权限或 Git 凭据。

完整更新命令集中放在 [Project Facts Kit 更新命令速查](project-facts-kit-update-commands.zh-CN.md)。

### M2：无感审阅

目标：保留 PR 审阅，但减少日常用户和 reviewer 的负担。

- 业务项目每日任务只生成候选；
- Skill 仓库定期聚合候选、去重、分类；
- 只有达到阈值才创建 draft PR；
- PR 模板自动列来源、证据、验证和未验证项；
- CI 自动执行资料库检查、Skill 校验和 CLI smoke test。

验收：

- 没有候选时不打扰用户；
- reviewer 能在一个摘要里处理多个候选；
- 自动化不能把候选直接写进共享 Skill；
- 项目专属规则不会进入通用 Skill。

### M3：Hooks / Automations 观察层

目标：自动形成 token 和使用行为证据。

- 默认推荐 observe hooks；
- Stop hook 返回 token snapshot；
- session usage 和 exec-events 进入可读报告；
- 每日候选任务引用真实证据路径；
- 增加敏感输出和本机路径检查。

验收：

- 能看到静态 token、工具估算和 session usage；
- 报告不包含本机绝对路径和敏感值；
- hooks 不阻断正常任务。

### M4：CodeGraph 按需增强

目标：让复杂仓库获得结构图和影响分析能力。

- `doctor` 根据仓库复杂度提示是否建议 CodeGraph；
- `codegraph --repos <name>` 完成单仓库初始化；
- 输出图状态、更新时间和查询入口；
- 在跨模块任务 Skill 中加入 CodeGraph 查询步骤；
- 用真实任务 A/B 判断是否默认推荐。

验收：

- 小仓库不会被强制初始化；
- 复杂仓库能用图缩小阅读范围；
- 查询结果必须回到源码和测试验证。

### M5：RAG / memory layer 受控试点

目标：处理长期项目和长任务的历史上下文。

- 扩展 `codex-mem` 的 observations、timeline、refs；
- 增加共享前脱敏流程；
- 试点本地 RAG，只返回可追溯来源；
- 评估 Headroom、LeanCTX、OpenViking、Understand-Anything 等外部方案的部分能力；
- 通过真实任务 A/B 后再决定是否纳入默认流程。

验收：

- 检索结果有来源路径和更新时间；
- memory 不直接成为 `APPROVED` 事实；
- token 减少不能以遗漏验证为代价。

### M6：Codex Plugin 分发

目标：让团队安装和升级更接近一键化。

- 第一版已把 `project-facts-maintainer` 和 `low-token-context-maintainer` 打包为 Codex plugin；
- MCP 配置、hooks 默认配置、icon 和说明后续再纳入；
- CLI 仍作为执行层；
- 插件只提供入口和配置，不覆盖业务项目事实；
- 支持团队 marketplace 或内部仓库分发。

验收：

- 新同事通过插件获得 Skill 和入口；
- 已接入项目可减少手工复制 Skill；
- 插件禁用后项目事实仍然保留在 Git 中。

## 决策建议

短期不要把项目改成 MCP-only，也不要让 CodeGraph、RAG 或 memory 成为默认强依赖。下一步最有价值的是：

1. 保持 `Skill + CLI` 为核心。
2. 做用户无感 CLI，让 Agent 和编辑器任务替用户运行命令。
3. 做无感审阅，把候选整理和 PR 摘要自动化，但保留 Tool/library owner 确认。
4. Hooks / Automations 先做观察和候选生成。
5. CodeGraph 先按复杂仓库启用。
6. RAG / memory layer 先本地试点，所有共享内容必须可追溯和可脱敏。
7. 等流程稳定后做 Codex plugin，降低安装和分发成本。

## 来源

- OpenAI Codex Manual，2026-06-17 本地 helper 获取成功：`/codex/skills.md`、`/codex/mcp.md`、`/codex/hooks.md`、`/codex/plugins.md`
- Agent Skills specification：`https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx`，2026-06-17 连接失败，未采用为依据
- MCP 官方文档：`https://modelcontextprotocol.io/`
- Claude Code 文档：Skills、MCP、hooks、slash commands、CLAUDE.md
- Gemini CLI 文档与扩展资料：Extensions、MCP、GEMINI.md
- GitHub Copilot 文档：custom instructions、MCP、coding agent
- Cursor 文档：rules、skills、MCP、CLI
- 本仓库现有调研：`docs/skill-carrier-assessment.zh-CN.md`、`docs/codex-low-token-tooling-research.zh-CN.md`、`docs/codex-mem-adapter-design.zh-CN.md`
