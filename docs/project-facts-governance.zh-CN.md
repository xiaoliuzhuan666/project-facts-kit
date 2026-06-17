# 项目事实制度

版本：`v0.1`

状态：待团队试行验证

更新日期：2026-05-25

## 目的

多人分别使用不同 AI 开发和维护项目时，模型不能成为需求来源。项目需要拥有一组被人和工具共同读取、可审阅、可追溯、可验证的事实资料。

本项目的核心目标不是让文档或 Skill 变多，而是让仓库更适合 AI 大模型和人共同接手：

- 不同的人、不同模型接手时，不偏离项目真实情况；
- 功能交付有可验证的下限，模型强度只影响上限；
- 在效果不下降的前提下减少无关上下文和 token 消耗；
- 项目事实、导航索引、Skill 和工具各司其职，不互相替代。

本制度固定三条分工原则：

1. `Skill` 提升接手效率和执行下限。
2. `project-facts/` 保证不偏离项目真实情况。
3. PR 审阅保证经验不会未经确认变成团队规则。

本制度管理四类问题：

1. 新维护者如何在没有口头宣讲的情况下理解项目。
2. 业务期望、当前实现和 AI 推断如何区分。
3. 每一次行为变化如何留下批准与验证记录。
4. 团队如何让不同 Agent 使用同一规则工作。

## 制度边界

本制度可以减少误读与遗漏，不能替代业务责任人作决定。没有可确认业务目标的人时，只能记录系统现状和风险，不能证明最终交付符合产品目标。

## 项目事实的状态

所有涉及业务行为的说明应使用以下状态之一：

| 状态 | 含义 | 可用于实施变更 |
| --- | --- | --- |
| `APPROVED` | 已由指定责任人确认，或存在可追溯批准记录 | 可以，仍需验证 |
| `OBSERVED` | 来自代码、发布行为、测试或接口的现状记录 | 仅用于保持或调查现状，不代表产品意图 |
| `UNKNOWN` | 资料不足，无法判断预期行为 | 高影响项确认前不可修改对应业务规则 |
| `CONFLICT` | 两份可信资料互相冲突 | 决定前不可声称已有统一要求 |
| `DEPRECATED` | 已被正式变更替代但为追溯保留 | 不可作为新实现依据 |

## 证据等级

| 等级 | 资料 | 使用规则 |
| --- | --- | --- |
| A | 已审阅规格、决策记录、验收批准 | 可支持 `APPROVED`；同级冲突需要责任人处理 |
| B | 自动验收、接口契约、发布验证记录 | 支持已验证行为；与 A 不一致时记录偏差 |
| C | 源码、配置、schema、migration、日志 | 支持调查 `OBSERVED`，需要验证或确认 |
| D | issue、聊天、AI 总结、个人 memory | 仅作为线索，不直接形成批准需求 |

AI 输出项目理解时，必须引用资料路径与版本；不能只输出无来源的功能摘要。

## 每个项目应保存的资料

目标项目建议将以下目录加入代码仓库：

```text
project-facts/
  README.md
  project.md
  glossary.md
  iteration-plan.md
  specs/
    <domain>/
      spec.md
  changes/
    <yyyy-mm-dd>-<change>/
      proposal.md
      requirements.md
      design.md
      tasks.md
      unknowns.md
      evidence.md
  decisions/
    ADR-0001-<topic>.md
  handover/
    current.md
    for-next-maintainer.md
```

| 文件类型 | 内容 | 维护者 |
| --- | --- | --- |
| `project.md` | 目标、范围、责任人、运行与验证入口 | Maintainer |
| `glossary.md` | 业务名词、边界和易混淆概念 | Domain owner |
| `iteration-plan.md` | 当前迭代任务、负责人、状态、依赖和验收入口 | Current maintainer |
| `specs` | 当前批准或明确标记状态的要求 | Domain owner + Maintainer |
| `changes` | 一次修改的理由、非目标、任务、问题和证据 | 任务负责人 |
| `decisions` | 影响长期实现或行为的决定 | 决定参与者 |
| `handover` | 当前工作状态、风险、给下一位维护者的读取入口和接手消息 | 当前 Maintainer |

## 需求书写要求

每条要求应有稳定 ID、状态、来源、适用范围、明确响应和验证方法。功能规则优先使用下列格式：

```markdown
## REQ-<DOMAIN>-001 <标题>

- 状态：APPROVED | OBSERVED | UNKNOWN | CONFLICT
- 负责人：<角色或姓名>
- 来源：<path, PR, ADR or acceptance record>
- 适用范围：<scope>
- 不适用范围：<non-scope>

### Requirement

WHEN <触发事件>，
THE SYSTEM SHALL <可检查的响应>。

### Acceptance Scenarios

Scenario: <场景名称>
  Given <前置状态>
  When <动作>
  Then <可观察结果>

### Verification

- 自动检查：<test command or Not defined>
- 人工检查：<steps or Not required>
- 最近验证：Not run | YYYY-MM-DD Pass | YYYY-MM-DD Fail
```

代码中已有的行为若没有批准依据，状态写为 `OBSERVED`。AI 不得因为测试通过而把它改为 `APPROVED`。

## 变更要求

影响下列任一内容的修改需要变更资料：

- 用户可见流程或文案语义；
- API、数据格式、权限或账号状态；
- 删除、迁移、导入导出、备份恢复；
- 费用、通知、风控或合规行为；
- 发布和运行边界。

变更资料至少应回答：

| 问题 | 记录位置 |
| --- | --- |
| 为什么修改 | `proposal.md` |
| 改变哪些现有要求，哪些明确不变 | `proposal.md` 与 `requirements.md` |
| 还有什么无法判断 | `unknowns.md` |
| 怎样实施 | `design.md` 与 `tasks.md` |
| 哪些要求已经检查 | `evidence.md` |
| 长期决定为何如此 | 必要时新增 ADR |

`Blocker` 或 `High` 的未知项未得到处理时，不能将相关变更描述为业务完成。

## 接手规则

接手者或 Agent 按以下顺序工作：

1. 读取仓库指令、构建入口和项目事实目录。
2. 在父目录或大型仓库中，先读取父目录路由、工作区地图或 `repo_map.txt` 等导航索引，只按任务范围继续打开源码。
3. 查找与任务有关的现行规格、变化记录、ADR 与最近交接。
4. 检查代码、接口、测试和发布证据是否支持规格描述。
5. 输出 `APPROVED / OBSERVED / UNKNOWN / CONFLICT` 表格，并引用文件路径。
6. 高影响未知项提交责任人处理；低影响未知项在变更中明确记录。
7. 只在范围与验证路径足够明确后开始实现。

导航索引用于降低上下文读取成本，不代表批准需求。它只能帮助定位文件和仓库；业务意图仍以已审阅规格、ADR、验收批准或责任人确认为准。

没有项目事实目录的历史项目，先对正在修改或风险最高的业务域恢复基准，不要求一次性描述全系统。

## 审阅与合并

| 变化类型 | 建议审阅者 | 必要验证 |
| --- | --- | --- |
| 规格和业务目标 | Domain owner | 状态和来源完整 |
| 接口、schema、migration | Domain owner + Technical reviewer | 契约、测试或迁移检查 |
| 权限、计费、删除、恢复 | 至少两名指定 reviewer | 自动检查与人工记录 |
| 模板、Agent 指令、Skill | Tool/library owner | 样例项目安装和流程检查 |

目标仓库应通过分支保护、CODEOWNERS、PR 模板或 CI 将这些要求变为合并条件。只有文档，没有审阅规则，仍会发生长期偏离。

## Skill 反哺机制

项目使用过程中的经验可以反哺到团队 Skill，但不能从项目定时任务直接修改正式 Skill。默认采用候选加评审模式：

1. 业务项目每天或每个工作日汇总一次 Skill 使用反馈，只生成候选记录，不自动修改 `skills/`。
2. 候选记录放在目标项目的 `project-facts/skill-feedback/` 或 `docs/skill-performance-log.md`，并引用任务、命令、文件、验证结果和 reviewer 意见。
3. 候选项进入本资料库后，先进入 `docs/skill-iteration-backlog.zh-CN.md` 或专门的 `docs/skill-feedback/` 目录，状态保持为 `proposed`、`needs-evidence`、`accepted`、`rejected` 或 `applied`。
4. Tool/library owner 审阅候选项，判断它是通用工作流、项目专属规则、工具缺陷还是一次性经验。
5. 只有 `accepted` 的候选项才能修改 `skills/`、模板或 CLI；修改必须通过本资料库 PR，并执行资料库检查。

Skill 反哺的证据要求：

| 证据 | 要求 |
| --- | --- |
| 真实任务来源 | 说明来自哪个项目、任务、PR、变更目录或会话记录 |
| 当前 Skill 表现 | 区分有用、缺失、误导、工具冲突和未验证项 |
| 验证结果 | 写明实际执行的命令或人工检查；未执行写 `Not run` |
| 适用范围 | 说明是否跨项目复现，是否只是某个业务项目规则 |
| 审阅结论 | 由 Tool/library owner 决定接受、拒绝或要求补证据 |

每日自动化任务只负责整理候选项和证据。它不得把 AI 总结直接写成 `APPROVED`，不得绕过 reviewer 修改团队 Skill，也不得把目标项目的业务规则写进通用 Skill。

业务项目和本资料库的自动化设置见 [Skill 反哺自动化运行手册](skill-feedback-automation-runbook.zh-CN.md)。这个流程形成受控循环：真实项目产生候选，本资料库评审候选，只有通过审阅和检查的变化才进入共享 Skill。

## AI 使用规则

- AI 可起草事实、变更、ADR、测试和验收报告。
- AI 必须引用来源，报告未验证项与矛盾项。
- AI 不可自行批准需求、替代责任人处理业务冲突，或把聊天结论写为正式事实。
- 两个模型结论一致，只说明本次解读一致，不能作为业务批准证据。
- Agent Skill 与 `AGENTS.md` 说明工作方式；项目事实正文说明该项目要交付什么。

## 月度检查

每个活跃项目至少定期检查：

| 检查项 | 记录结果 |
| --- | --- |
| 最近功能变更是否更新对应要求 | Pass / Fail / Not checked |
| 高影响未知项是否仍在开放 | 数量与负责人 |
| 验收证据是否过期或未执行 | 列表 |
| 当前迭代任务是否仍指向真实负责人和验证命令 | Pass / Needs update |
| 接手文件是否仍能指向当前入口 | Pass / Needs update |
| AI 指令与真实验证命令是否一致 | Pass / Needs update |

## 首次试行验收

选两个真实项目连续处理至少三次变更，并观察：

- 纳入制度的变更是否都关联要求 ID；
- 高影响未知项是否在合并前处理；
- 验收证据是否真实执行并留下记录；
- 新接手者是否更快定位项目依据；
- 不同 Agent 是否能按相同状态和来源结构输出结果。

试行完成后再决定是否成为团队默认流程，以及是否需要引入 OpenSpec、Spec Kit 或 neuDrive 的进一步集成。
