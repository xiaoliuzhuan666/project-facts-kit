# Skill 载体与 AI 接手资料调研记录

日期：2026-06-17

## 调研目的

确认本项目把 `project-facts/`、`AGENTS.md`、Skill、PR 审阅和定时候选任务分开管理，是否符合目标：

- 让不同的人、不同模型接手时不偏离项目真实情况；
- 保证功能交付有可验证的基本下限；
- 在效果不下降的前提下减少无关上下文和 token 消耗；
- 不让 AI 总结替代业务批准。

## 来源记录

| 来源 | 类型 | 读取日期 | URL | 原文要点 | 本项目吸收点 |
| --- | --- | --- | --- | --- | --- |
| GitHub Spec Kit README | 官方仓库文档 | 2026-06-17 | `https://raw.githubusercontent.com/github/spec-kit/main/README.md` | Spec Kit 用 `/speckit.constitution`、`/speckit.specify`、`/speckit.plan`、`/speckit.tasks` 和 `/speckit.implement` 管理原则、规格、计划、任务和实现；README 也说明 skills mode 会安装 agent skills。 | 规格和任务应作为仓库资料维护；Skill 可以承载流程命令，但不应成为业务事实本身。 |
| GitHub Spec Kit `spec-driven.md` | 官方仓库文档 | 2026-06-17 | `https://raw.githubusercontent.com/github/spec-kit/main/spec-driven.md` | 文档把规格称为主要工程资料，描述 team-reviewed specifications 会通过分支、版本管理和合并进入团队流程；AI 需要结构化规格来减少混乱。 | `project-facts/` 要承担事实层和验证层；AI 总结不能替代团队审阅。 |
| OpenSpec README | 官方仓库文档 | 2026-06-17 | `https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/README.md` | OpenSpec 每个 change 有 proposal、specs、design、tasks；它强调先就规格达成一致再写代码；贡献说明要求较大变化先提交 change proposal，AI 生成代码也要测试和验证。 | 本项目的候选和变更记录要先进入可审阅材料，再决定是否改共享 Skill 或工具。 |
| AGENTS.md | 公开格式说明 | 2026-06-17 | `https://agents.md/` | AGENTS.md 是面向 coding agents 的 README，可放构建步骤、测试、约定、PR 指令和嵌套目录说明；FAQ 说明 agent 会尝试执行相关检查。 | `AGENTS.md` 适合保存读取顺序、验证命令、禁读范围和本仓库规则；业务批准仍回到项目事实和审阅记录。 |
| GitHub CODEOWNERS | 官方文档 | 2026-06-17 | `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners` | CODEOWNERS 定义文件负责人；相关 owner 会被自动请求 review；可配合分支保护要求 code owner approval；文档还建议 CODEOWNERS 文件本身也要有 owner。 | 共享 Skill、模板、安装脚本、候选接收区和 CODEOWNERS 应由 Tool/library owner 审阅。 |
| GitHub protected branches | 官方文档 | 2026-06-17 | `https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches` | 分支保护可以要求 PR review、code owner review、status checks 和 conversation resolution。 | PR 审阅和检查是候选进入共享规则的生效门槛；每日任务不能直接推送修改。 |
| llms.txt | 公开提案 | 2026-06-17 | `https://llmstxt.org/` | llms.txt 提供简洁、LLM 友好的入口、说明和链接，`Optional` 区域可用于较短上下文；它主要解决上下文读取和导航。 | 可借鉴低 token 入口设计，但它不提供事实状态、审批、验证或 reviewer 机制。 |
| Agent Skills specification source | 官方规格源文件 | 2026-06-17 | `https://raw.githubusercontent.com/agentskills/agentskills/main/docs/specification.mdx` | Skill 至少包含 `SKILL.md`；`name` 和 `description` 为必填；可包含 `scripts/`、`references/`、`assets/`；通过 progressive disclosure 按需加载；建议使用 `skills-ref validate` 校验。 | 支持把 Skill 定位为可复用工作流和资源包；它能帮助降低上下文成本，但不替代项目事实、验证证据和 PR 审阅。 |
| Agent Skills repository | 官方仓库 | 2026-06-17 | `https://github.com/agentskills/agentskills` | README 说明 Agent Skills 用 `SKILL.md`、脚本、参考资料和模板打包专业流程，按 discovery、activation、execution 三阶段加载。 | 支持本项目把 Skill 用于接手流程、候选格式和工具用法，而不是保存项目批准事实。 |
| OpenAI Codex Agent Skills | OpenAI 官方文档 | 2026-06-17 | `https://developers.openai.com/codex/skills` | Codex 以 Skill 扩展任务能力；初始上下文只包含 skill 名称、描述和路径，使用时再加载完整 `SKILL.md`；初始 skill 列表有上下文预算；Codex 支持 repo、user、admin、system 等位置。 | 支持本项目在 Codex 中使用 Skill 提升接手效率，同时把正式项目事实留在业务仓库。 |

## 来源链接

- GitHub Spec Kit: https://github.com/github/spec-kit
- Spec Kit SDD 文档: https://github.com/github/spec-kit/blob/main/spec-driven.md
- OpenSpec: https://openspec.dev/
- OpenSpec repository: https://github.com/Fission-AI/OpenSpec
- AGENTS.md: https://agents.md/
- GitHub CODEOWNERS: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- llms.txt: https://llmstxt.org/
- Agent Skills specification source: https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx
- Agent Skills repository: https://github.com/agentskills/agentskills
- OpenAI Codex Agent Skills: https://developers.openai.com/codex/skills

## 本次没有采用的来源

OpenHands 的 microagents / skills 资料本次没有形成稳定的一手引用，原因是公开页面路径读取不稳定。后续若要引用 OpenHands，应重新读取官方文档或仓库源码，并在引用当天记录 URL、commit 或页面版本。

访问备注：Agent Skills specification 的站点页面 `https://agentskills.io/specification` 仍未成功读取。`mcp__fetch` 返回 `robots.txt` 连接失败；内置浏览器打开后显示“无法访问此站点”，错误码为 `ERR_CONNECTION_CLOSED`。本次没有采用站点页面本身作为依据，改用同一官方仓库中的规格源文件 `docs/specification.mdx` 和 OpenAI Codex Skill 文档作为可追溯依据。若后续需要截图或交互验证，应重新用浏览器访问并记录结果。

## 设计判断

1. 事实层必须进目标仓库。项目事实、需求状态、证据和交接记录要进入 Git 历史，便于审阅和追溯。
2. Skill 适合保存流程。它可以告诉 agent 怎样接手、怎样审阅候选项、怎样减少读取范围，但不能成为项目真实情况的唯一来源。
3. `AGENTS.md` 适合做项目入口。它告诉 agent 该读什么、别读什么、怎样验证；业务含义仍要回到事实文件。
4. PR、CODEOWNERS 和 CI 是生效门槛。共享 Skill 的修改必须经审阅和检查，定时任务只能提交候选。
5. 低 token 入口只服务于更快读对。导航索引、llms.txt 风格入口和 token 报告不能替代事实状态和验证证据。
6. 每日任务可以让经验持续出现，但不改变审批权。业务项目生成候选，Skill 仓库评审候选，通过 PR 才进入共享 Skill。

## 反哺机制边界

业务项目可以每天定时生成 Skill 优化候选，但候选不能直接进入共享 `skills/`。候选应包含真实任务来源、证据路径、验证结果、适用范围和是否项目专属的判断。只有 Tool/library owner 审阅通过后，才允许修改共享 Skill、模板、安装脚本或 CLI。

这个边界不违背本项目目标。它把真实项目经验变成可审阅的改进输入，同时防止 AI 总结把项目专属规则扩散成团队通用规则。
