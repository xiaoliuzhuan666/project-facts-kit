# Project Facts Kit 市场调研交叉验证（2026-07-20 增量）

- 调研日期：2026-07-20
- 基线文档：[2026-07-15 调研报告](./project-facts-context-market-research-2026-07-15.zh-CN.md)
- 方法：三路并行联网调研（Agent Skills 生态、SDD 工具、记忆/上下文工具）+ 崆峒项目真实使用痕迹核查，与 7-15 基线交叉验证
- 资料范围：以官方仓库、官方文档等一手来源为主；二手报道仅用于 star 量级等参考数据，已在文中和第 6 节标注
- 本文性质：调研结论，不是已批准制度。第 5 节的定位调整建议需按 Skill 反哺流程形成候选，由 Tool/library owner 评审后才生效

## 1. 核心判断

7-15 调研的差异化结论在 2026-07-20 仍然成立：**人工批准与 AI 推断分离、可审计验证证据、低 token 读取路径、记忆与正式事实隔离，四者同时具备的工具仍未出现。**

但三件事发生了变化，需要修正基线结论：

1. **brownfield 接入不再是市场空缺**。GitHub Spec Kit v0.13.0 新增 `/speckit.converge` 并把 Brownfield 列为官方三大开发阶段之一；OpenSpec v1.6.0 明确 brownfield-first 并推出跨仓库 Stores（beta）。7-15 把"已有项目低侵入接入"列为差异点，现在应弱化为：我们的零写入默认行为与它们的 init 体验竞争，而不是补空白。
2. **"跨会话记忆/交接"话术已商品化**。GitHub `agent-handoff` 主题仓库从 6 月中的 40 个增至 56 个，`session-handoff` 32 个、`session-continuity` 34 个；邻近项目已开始使用 "validation evidence""evidence gates" 表述。"记忆/交接"不能再作为卖点，差异化主张应收窄为"人工批准的事实治理"。
3. **行业主流在向"更信任 agent 记忆"移动**。Mem0 把 agent 自述确认（agent confirmations）作为一等公民存储。这与人工批准方向背道而驰，但也使我们的差异化定位更清晰——前提是文档必须正面回答"为什么人工批准不可省略"。

两个外部趋势印证了基线架构判断：

- Claude Code 原生 auto memory 官方二分"CLAUDE.md=人写指令 / auto memory=agent 自学笔记"，并内建 25KB 索引上限——官方认可了 approved/observed 隔离与 routing 分层读取。
- OpenViking 公布 L0/L1/L2 分层基准（对比 Claude Code auto-memory：准确率 57%→80%，token -63%），论文 VikingMem 被 VLDB 2026 接收——分层省 token 有可引用的公开证据。

## 2. 崆峒项目真实使用证据（内部）

核查对象：本机 `崆峒/` 工作区（1 个父目录 + 10 个独立仓库），核查日期 2026-07-20。

| 证据 | 观测值 |
| --- | --- |
| project-facts 目录数 | 11 个（根 + 10 个子仓库） |
| 内容量 | 根目录 33 个文件 / 344K；子仓库 88K–764K，均非空模板 |
| 活跃度 | 最新 change 为 2026-07-19；2026-07-18 单日产生 4 个 change |
| 治理结构 | `change.md` + `evidence.md` 双文件结构在用；`specs/`、`handover/`、`iteration-plan.md`（7-19 更新）、`skill-performance-log.md`（含结构化 UNKNOWN/OBSERVED 记录）均在维护 |
| 反哺机制 | 根目录有 `skill-feedback/SFC-20260706-parent-workspace-doctor-routing.md` 候选记录 |
| 多仓库路由 | skill-performance-log 记录 `codex-mem route` 实测：票务控制台查询命中正确仓库（score=88） |
| 旧产物 | 未发现 `repo_map.txt`、`.ai-context*`、`WORKSPACE.md`；崆峒走的是 facts + Skill 路线，与本仓库当前主推方向一致 |

结论：制度在真实多仓库业务项目中持续运转，内部有效性有实证。缺口不变：真实任务 counted A/B 仍为 0（见 7-15 报告 2.1 节），"省 token 且质量不降"目前只能写观测值，不能写宣称。

## 3. 增量发现（按调研路）

### 3.1 Agent Skills 生态

- obra/superpowers 约 163.8K star（GitHub API，2026-07-20），已公司化运营（Prime Radiant，提供企业支持），进入 Anthropic 官方市场和 OpenAI Codex 官方插件市场双渠道，官方列出 10 个 harness（含 Kimi Code）。v4.3.0 起把 brainstorming 等流程做成硬门禁。
- SKILL.md 已成跨工具事实标准：agentskills.io 定位为开放标准，第三方核实 32+ 工具可读，`skill-md` 主题有 742 个公开仓库。Codex（`~/.codex/skills/`）、Gemini CLI、Cursor、Windsurf 等均已原生支持。
- 无单一官方商店；版本与信任机制出现雏形（市场显示版本号、skills-hub.ai 引入 SLSA L2 签名、Agensi 支持付费 skill）。
- 记忆/交接类 skill 快速拥挤化，出现与"项目记忆+验证证据"直接邻近的竞品（2026-06、2026-07 更新的仓库描述），但均未见"人工批准事实与 AI 推断严格分离 + 批准工作流"。
- 判断：生态爆发**增强**了"治理工作流做成 skill 分发"的路线价值，但分发渠道（双官方 marketplace）比格式本身更成为竞争点。

### 3.2 SDD 工具

- GitHub Spec Kit v0.13.0（2026-06 末），star 约 9 万+（媒体报道量级）；新增 `/speckit.converge` 评估现有代码库与 spec 的差距，官方 README 把 Brownfield 列为三大阶段之一；生态转向 extensions/presets/bundles 平台化。analyze/checklist 仍是 advisory，无强制验证门。
- Fission-AI OpenSpec 约 61.6K star（媒体报道量级），v1.6.0（2026 年 7 月中），已进 YC W26；brownfield-first、`/opsx:explore` 先读老代码再提案、delta spec 面向存量变更；新动向是 Stores（beta）跨仓库共享 specs，向"团队级需求单一事实源"扩张；`/opsx:verify` 不阻塞 archive。
- AWS Kiro 2026-05-07 国际 GA，2026 年 5 月把 spec 流程重构为 TDD（先生成失败测试再实现）；Amazon Q Developer IDE 插件 2027-04-30 停服，Kiro 为继任者。验证在收紧，但证据是测试运行，不是治理档案。
- Tessl 转向企业级 registry+治理（注册表、策略门、审计日志），仍 beta，治理对象是注册表制品而非仓库内项目事实。
- Anthropic（Claude Code `/sdd:*`）、Google（Antigravity 2.0 Plan mode）、OpenAI（Codex 桌面）均已把 SDD 内建为 agent 标配。
- 2026 年 5 月出现 "Stop Writing Specs, Start Writing Facts" 公开讨论，"事实 vs 规格"的话语正在浮现。
- 判断：SDD 工具在向 brownfield 扩张，但**没有**向批准状态机、可审计证据档案、低 token 读取扩张。

### 3.3 记忆/上下文工具

- Claude Code 原生 auto memory（v2.1.59+，默认开启）是最大增量：`MEMORY.md` 索引只加载前 200 行/25KB，主题文件按需读；`.claude/rules/` 支持 path-scoped 加载；官方明确"CLAUDE.md=人写 / auto memory=agent 写、机器本地、不跨机共享"。
- Mem0 2026 年 4 月发布 token 高效算法（LoCoMo 92.5 / LongMemEval 94.4，每次检索约 7K token），把 agent confirmations 作为一等公民；OpenMemory MCP 定位本地个人记忆层，无批准环节。
- Zep/Graphiti 企业定位强化，时序事实有 valid_from/valid_to/invalid_at 失效窗口，但失效由 agent 判定；Community Edition 已废弃。
- Letta 2026 年 2 月推出 Context Repositories（git 支撑的记忆文件系统），写入者仍是 agent 自己。
- OpenViking（火山引擎）L0/L1/L2 分层基准公开，论文被 VLDB 2026 接收；记忆靠自动抽取管线，无人为确认门；许可证 AGPLv3。
- 轻量工具：claude-mem 约 46K star（2026-04）、basic-memory 持续活跃、Serena 走向 v1.0（memories 为 onboarding 笔记）；Windsurf Memories 锁在编辑器内。
- 上下文工程已是公认术语，生产指南普遍把 token 预算显式分配列为成熟标志；Aider 维持 `--map-tokens` 动态预算，Repomix 约 26K star。
- 企业层：Backstage 出现官方 AI 插件方向，GitHub 发布 "Governing Agents" 治理指南（2026-04）；治理叙事升温，但均不做事实批准。
- 判断：四要素组合仍无竞品；Claude Code 官方二分和 OpenViking 基准分别印证了我们的隔离与分层设计；Mem0 方向的"agent 确认即事实"叙事是主要预期风险。

## 4. 对 7-15 结论的确认与修正

| 7-15 结论 | 状态 | 依据 |
| --- | --- | --- |
| 四要素差异化组合无竞品 | 成立 | 三路调研均未发现同时具备者（第 3 节） |
| approved/observed/unknown 分离是核心规则 | 成立且被外部印证 | Claude Code 官方人写/agent 写二分（3.3） |
| 低 token 分层读取方向正确 | 成立且有公开数值证据 | OpenViking L0/L1/L2 基准（3.3） |
| memory 必须与正式事实隔离 | 成立 | 所有记忆工具仍无人工批准门（3.3） |
| brownfield 低侵入接入是差异点 | **需修正** | Spec Kit converge、OpenSpec brownfield-first 已覆盖接入（3.2）；剩余差异是零写入默认与治理深度 |
| "记忆/交接"可作为对外主张 | **需修正** | 该赛道已拥挤化，证据措辞被借用（3.1） |
| Skill 是有效分发载体 | 成立且增强 | SKILL.md 成事实标准、双官方市场成型（3.1） |

## 5. 定位调整建议（待 owner 评审，非已批准方向）

1. **从"SDD 替代品"转为"SDD 之下的事实层"**：spec/changes 交给 Spec Kit/OpenSpec，project-facts/ 装它们不写的东西——已批准事实、验证证据档案、交接。崆峒的实际用法（changes/ 记录跨端协同决策与证据，而非需求规格初稿）与此一致。
2. **卖点从"记忆/交接"收窄为"人工批准治理"**：以"事实 vs AI 推断分离 + 批准人/证据链"为唯一主张，与 56 个 handoff 项目区分。
3. **README 显式对标 Claude Code auto memory**：我们补它缺的四件事——人工批准、验证证据、团队共享、跨机器。
4. **分发渠道优先级抬升**：评估将 plugin 发布到 Claude Code 与 Codex 双官方 marketplace；superpowers 已验证此路径，且其 harness 列表已包含 Kimi Code。
5. **阶段 D 证据缺口仍是发布门槛**：内部有崆峒活跃使用证据，但 counted A/B 为 0 的现状不变；所有效果表述保持观测值口径。

以上每一条如要落实，需按 Skill 反哺流程形成独立 SFC 候选，本报告不作为接受证据（同 7-15 报告第 12 节口径）。

## 6. 证据边界

- 本文外部数据由子代理联网检索汇总（查询日期均为 2026-07-20），主代理未逐条重取 URL 复核。
- 一手来源（官方仓库/文档，已实际抓取）：superpowers 与 anthropics/skills 的 GitHub API 数据及 README、agentskills.io、Spec Kit 与 OpenSpec 官方仓库及 releases、Claude Code 官方 memory 文档、OpenViking 官方仓库与文档。
- 二手来源（媒体/社区报道，仅作量级参考）：Spec Kit 与 OpenSpec 的 star 数、Kiro GA 与 Q Developer 停服时间线、Tessl 现状、各工具对比文章。
- 已知异常：GitHub API 返回的部分 `pushed_at` 时间与媒体报道的活跃状态存在出入，可能为缓存；star 数均为量级而非精确值。
- 崆峒使用证据为本机文件系统直接观测（2026-07-20），属一手观测。
- 本文是调研结论，不构成任何架构或路线方向的接受记录。

## 7. 来源

### 7.1 一手来源（2026-07-20 查询）

- https://api.github.com/repos/obra/superpowers
- https://github.com/obra/superpowers
- https://raw.githubusercontent.com/obra/superpowers/main/RELEASE-NOTES.md
- https://api.github.com/repos/anthropics/skills
- https://agentskills.io
- https://github.com/topics/skill-md
- https://github.com/topics/agent-handoff
- https://github.com/topics/session-handoff
- https://github.com/topics/session-continuity
- https://github.com/github/spec-kit
- https://github.com/github/spec-kit/releases
- https://github.com/Fission-AI/OpenSpec
- https://github.com/Fission-AI/OpenSpec/releases
- https://code.claude.com/docs/en/memory
- https://github.com/volcengine/OpenViking
- https://docs.openviking.ai/en/faq/faq
- https://aider.chat/docs/repomap.html
- https://github.com/basicmachines-co/basic-memory
- https://www.getzep.com/
- https://skills-hub.ai/skills/code-review-expert
- https://www.agensi.io/learn/codex-cli-skills-install-skill-md
- https://github.com/zed-industries/zed/issues/49057

### 7.2 二手来源（量级与背景参考）

- https://vibecoding.app/blog/spec-kit-review （2026-07-09）
- https://winbuzzer.com/2026/05/11/meet-github-spec-kit-an-open-source-toolkit-for-sp-xcxwbn/ （2026-05-11）
- https://vibecodinghub.org/blog/openspec-review （2026-07-10）
- https://codemyspec.com/blog/openspec-vs-spec-kit （2026-06-03）
- https://sparkvibeai.com/blog/spec-kit-vs-kiro-vs-tessl-vs-openspec/ （2026-06-20）
- https://pingax.com/kiro-aws-launch-announcement/ （2026-06-28）
- https://www.usage.ai/blogs/aws/monthly-updates/aws-may-2026/
- https://rywalker.com/research/tessl （2026-06-11）
- https://neuronfeed.com/startups/bloop
- https://thebcms.com/blog/spec-driven-development （2026-05-11）
- https://levelup.gitconnected.com/stop-writing-specs-start-writing-facts-the-entire-sdd-movement-is-already-obsolete-9045f7061e26 （2026-05-11）
- https://mem0.ai/blog/state-of-ai-agent-memory-2026
- https://rywalker.com/research/mem0
- https://vectorize.io/articles/mem0-vs-zep
- https://callsphere.ai/blog/vw3g-letta-memgpt-agent-memory-layer-deep-dive-2026
- https://vectorize.io/articles/claude-code-memory
- https://docs.windsurf.com/ja/windsurf/cascade/memories
- https://www.agentiquette.com/index/repos/basic-memory
- https://mcp.directory/blog/serena-mcp-complete-guide-2026
- https://sourcegraph.com/blog/context-engineering
- https://zylos.ai/research/2026-06-20-context-engineering-long-running-agents/
- https://rywalker.com/research/code-intelligence-tools
- https://ssojet.com/blog/skill-md-playbooks （2026-06-07）
- https://ryandoser.com/claude-skills-marketplace/ （2026-07-09）
- https://www.totalum.app/blog/claude-skills-marketplace-totalum （2026-06-07）
- https://byteiota.com/superpowers-tutorial-claude-code-tdd-framework-2026/ （2026-03-20）
- https://ai-revolution.co.jp/media/superpowers-claude-code-guide/ （2026-04-23）
- https://devops.gheware.com/blog/posts/platform-engineering-ai-agents-idp-2026.html
- https://backstage.spotify.com/discover/blog/aika-data-plugins-coming-to-portal/
