# Skill 作为载体的评估

日期：2026-06-17

来源记录：`docs/research/skill-carrier-source-notes-2026-06-17.zh-CN.md`

## 判断

新开的 Skill 反哺机制不违背本项目目标，前提是它只做候选和评审，不让定时任务直接修改共享 Skill。

固定原则如下：

1. `Skill` 提升接手效率和执行下限。
2. `project-facts/` 保证不偏离项目真实情况。
3. PR 审阅保证经验不会未经确认变成团队规则。

本项目的目标是让仓库更适合 AI 大模型和人共同接手：不同的人、不同模型进入项目后，能先看到真实事实、审批状态、验证证据和当前交接；模型能力影响上限，但项目资料要守住功能交付的基本下限；token 节省只能来自更好的读取顺序和导航索引，不能来自省略事实确认和验证。

Skill 适合保存“怎样工作”的流程，不适合单独保存“项目到底是什么”的事实。更合适的分工是：

1. `project-facts/` 保存项目真实情况、需求状态、变更、证据和交接。
2. `AGENTS.md` 保存默认读取顺序、禁读范围、验证命令和项目规则。
3. `Skill` 保存可复用工作流、审阅步骤、候选格式和工具用法。
4. `PR / CODEOWNERS / CI` 保存生效门槛。
5. 每日任务只生成候选，不直接改共享 Skill、模板、脚本或 CLI。

## 依据

### 规格和变更应在仓库里

GitHub Spec Kit 和 OpenSpec 都把规格、变更、计划和任务放在项目目录中，并配合 Git 分支、PR 或团队审阅。它们共同说明一件事：长期有效的项目意图应成为仓库资料，而不是一次会话里的总结。

对本项目的影响：`project-facts/` 必须是事实层。代码现状只能标为 `OBSERVED`；没有责任人或审阅记录时，不能写成 `APPROVED`。

### Agent 指令适合做入口

AGENTS.md 的定位是给 coding agent 的项目说明，适合放构建命令、测试命令、约定、目录读取方式和子项目指令。

对本项目的影响：`AGENTS.md` 可以指导 agent 从哪里开始读、哪些目录不要读、哪些命令必须执行；业务含义仍要回到 `project-facts/`、ADR、变更记录和验收证据。

### Skill 适合按需加载流程

Agent Skills specification 规定 Skill 以 `SKILL.md` 为核心，可附带 `scripts/`、`references/`、`assets/`，并通过 progressive disclosure 按需加载内容。OpenAI Codex 文档也说明 Codex 初始上下文只放 Skill 名称、描述和路径，真正使用时才读取完整 `SKILL.md`。

对本项目的影响：Skill 可以承载接手流程、候选格式、工具用法和低 token 读取策略。它不应保存某个业务项目的批准事实，也不应绕过 `project-facts/`、PR 审阅和验证证据。

### 审阅门槛要靠仓库机制

GitHub CODEOWNERS 可定义文件负责人，并可配合分支保护要求 code owner approval。

对本项目的影响：共享 Skill 和模板的修改应由 Tool/library owner 审阅。每日任务可以提交候选记录，但不能绕过 PR 审阅直接改正式资料。

### 低 token 入口不能替代事实系统

llms.txt 的价值是给 LLM 一个简洁入口和链接列表，适合减少阅读噪音。它没有需求状态、审批、验证和 reviewer 机制。

对本项目的影响：可以考虑以后增加 `llms.txt` 风格的精简入口，但它只能指向 `project-facts/`、`AGENTS.md` 和关键文档，不能替代它们。

## 放进 Skill 的内容

- 接手流程和读取顺序。
- 候选项记录格式和评审步骤。
- 什么时候必须回到 `project-facts/`。
- 哪些检查没执行时必须写 `Not run`。
- 多仓库、跨端任务中如何缩小读取范围。
- token 报告、route map、contract map 等工具的使用方式。

## 不只放进 Skill 的内容

- 业务需求和批准状态。
- 验证证据。
- 项目交接记录。
- 项目专属规则。
- 长期有效的制度变更。
- 需要 PR、CODEOWNERS 或 CI 才能生效的规则。

## 三类文档的角色

| 文档 | 作用 | 不承担 |
| --- | --- | --- |
| `docs/skill-feedback/` | 接收从业务项目回来的单条候选记录 | 不直接决定是否修改 Skill |
| `docs/skill-iteration-backlog.zh-CN.md` | 维护候选状态、reviewer 备注和已应用记录 | 不保存项目业务事实 |
| `docs/skill-carrier-assessment.zh-CN.md` | 说明为什么采用这种分层方式 | 不接收日常候选项 |

## 风险

如果把事实、流程和候选都放进一个 Skill，会出现三类问题：

1. 事实和推断混在一起，接手者看不出什么已被确认。
2. Skill 体积变大，加载成本上升，反而不利于 token 控制。
3. 项目专属规则容易被误写成团队通用规则。

所以 Skill 可以做流程载体，但不能做唯一事实来源。当前方案 B 的边界是合理的：业务项目生成候选，本资料库评审，通过后再修改共享 Skill。
