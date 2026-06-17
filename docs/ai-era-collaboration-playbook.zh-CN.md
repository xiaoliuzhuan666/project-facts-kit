# AI 时代多项目轻量协作手册

更新日期：2026-05-25
适用范围：多人负责不同项目、团队成员使用不同 AI、项目文档不完整、接手时没有固定宣讲会议的研发团队

## 先回答安装成本

在每个业务项目都安装 Spec Kit、OpenSpec 或 Kiro，通常偏重。它们适合特定项目阶段，不适合作为所有项目接手的前置条件。

团队默认协作方式建议是“零外部工具安装”：

1. 项目仓库里保存少量固定 Markdown 文件。
2. 所有 AI 和人按同一读取顺序工作。
3. 需求状态只分为 `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT`。
4. 行为变化必须有受影响需求、未知项和验证记录。
5. 高风险变更再引入 Spec Kit、OpenSpec、Kiro、CODEOWNERS 或 CI 检查。

这样做的目的不是把文档变多，而是让别人接手时有一条可靠阅读路径。

若项目还没有资料目录，可以使用本资料库的 L1 模式生成这条路径：

```bash
./scripts/install-project-facts.sh /path/to/project --lite
```

它只安装项目摘要、术语、当前迭代计划、当前交接、给下一位维护者的消息、一个规格模板和 Agent 规则片段，不安装完整变更包或 GitHub 规则片段。

## 分层采用

| 层级 | 适用项目 | 需要新增什么 | 不需要什么 |
| --- | --- | --- | --- |
| L0 临时接手 | 老项目、资料几乎没有、只处理一个具体问题 | `handover/current.md` 或一份接手报告 | 不装 Spec Kit/OpenSpec/Kiro |
| L1 可交接项目 | 有人维护、会被别人接手 | `AGENTS.md`、`project-facts/project.md`、`handover/current.md`、相关业务域 `spec.md` | 不要求完整描述全系统 |
| L2 可持续协作项目 | 多人持续改同一项目 | L1 + 每次行为变化的 `changes/<date>-<change>/` | 不强制 CLI 工具 |
| L3 高风险或重大项目 | 权限、付费、删除、同步、上线前关键路径 | L2 + PR 审阅规则、CODEOWNERS/CI、契约测试或人工验收记录 | 不要求所有项目都达到 L3 |
| L4 工具增强项目 | 新产品、重大功能、团队愿意投入流程 | Spec Kit / OpenSpec / Kiro 中的一种 | 不同时运行多套普通变更流程 |

团队可以先把所有项目推进到 L1。L1 成本低，但已经能解决接手时“从哪里读、哪些是事实、哪些还不确定”的问题。

## 最少需要维护的文件

L1 项目只需要四类资料：

```text
AGENTS.md
project-facts/
  project.md
  iteration-plan.md
  specs/<domain>/spec.md
  handover/current.md
  handover/for-next-maintainer.md
```

`AGENTS.md` 写给 AI：

- 先读哪些资料；
- 构建、测试、启动命令；
- 哪些目录不能随意改；
- 修改需求时要更新哪里；
- 没验证时要怎样报告。

`project.md` 写项目身份：

- 项目目标；
- 当前负责人；
- 主要入口；
- 数据和发布入口；
- 常用验证命令；
- 已知高风险问题。

`iteration-plan.md` 写当前迭代：

- 任务顺序；
- 当前负责人；
- 任务状态；
- 关联的规格和变更目录；
- 必须执行的检查；
- 下一位维护者需要知道的内容。

`spec.md` 写当前任务相关业务域，不要求一次覆盖全系统：

- 固定需求 ID；
- 状态；
- 来源；
- 验收场景；
- 最近验证结果。

`handover/current.md` 写接手入口：

- 当前维护者；
- 当前代码版本；
- 最近活跃变更；
- 哪些已批准；
- 哪些只是观察到的行为；
- 未解决问题；
- 下一个人应该读哪些文件。

`handover/for-next-maintainer.md` 写可以发给同事和 AI 的接手消息：

- 当前分支或 commit；
- 接手入口清单；
- 当前目标；
- 验证命令；
- 注意事项和不应提交的本地产物。

## 角色分工

AI 参与越深，角色越要清楚。一个人可以兼多个角色，但责任不能消失。

| 角色 | 最少职责 |
| --- | --- |
| Project owner | 确认项目目标、业务边界、优先级 |
| Domain owner | 确认某个业务域的规则和高影响未知项 |
| Current maintainer | 维护当前代码、验证入口和交接资料 |
| Incoming maintainer | 按固定流程读取资料，记录不一致和未知项 |
| Reviewer | 审查本次改动是否影响需求、验证是否真实执行 |
| AI Agent | 搜索资料、生成表格、实现已确认任务、执行检查、报告未验证项 |

AI 不承担业务批准。两个 AI 得到相同结论，也不能替代 owner。

## 原维护者交接时怎么做

不要求开长会。只要把接手入口写清楚。

### 15 分钟版本

适合临时请别人帮忙。

更新 `project-facts/handover/current.md`：

```markdown
## Snapshot

| Field | Value |
| --- | --- |
| Updated at | 2026-05-25 |
| Current maintainer | <name> |
| Revision reviewed | <commit> |
| Active change | <path or none> |

## Read Next

1. AGENTS.md
2. project-facts/project.md
3. project-facts/specs/<domain>/spec.md
4. <关键代码入口>

## Open Unknowns Or Conflicts

| ID | Impact | Owner | Location |
| --- | --- | --- | --- |
| U-001 | High | <owner> | project-facts/changes/.../unknowns.md |
```

### 30 分钟版本

适合正式换人维护。

在 15 分钟版本基础上补充：

- 当前项目目标；
- 运行和验证命令；
- 最近一次通过或失败的检查；
- 已批准需求列表；
- 只从代码观察到、还没人确认的行为；
- 最近一次线上或测试环境状态；
- 接手人不应改的范围。

### 60 分钟版本

适合高风险项目或跨团队交接。

在 30 分钟版本基础上补充：

- 核心业务流程图或文字路径；
- 关键接口和数据表；
- 权限、计费、删除、备份、通知等高风险点；
- 最近 3 次变更的意图和验证结果；
- 现有测试覆盖不到的地方；
- 需要 owner 决定的问题。

## 接手者怎么操作

接手时不要让 AI 直接“总结整个项目然后修改”。先固定代码版本，再让 AI 按来源输出。

### 第一步：固定读取范围

接手者在项目根目录执行：

```bash
git status --short --branch
git rev-parse --short HEAD
rg --files | sed -n '1,160p'
```

记录：

- 当前分支；
- 当前 commit；
- 工作区是否有未提交修改；
- 是否存在 `AGENTS.md`、`project-facts/`、`specs/`、`openspec/`、`.specify/`。

如果工作区有别人未提交的修改，先记录，不要直接覆盖。

### 第二步：让 AI 按固定提示读取

可直接使用这段提示：

```text
你现在接手这个项目。请不要直接实现需求。

请按顺序读取：
1. AGENTS.md
2. README 或项目入口文档
3. project-facts/project.md
4. project-facts/iteration-plan.md
5. project-facts/handover/current.md
6. 与当前任务相关的 project-facts/specs/**
7. 最近相关 changes、ADR、测试和关键代码

输出一份接手表：
- 项目目标
- 当前负责人和维护者
- 关键入口
- 已批准需求 APPROVED
- 只观察到的行为 OBSERVED
- 未确认问题 UNKNOWN
- 冲突 CONFLICT
- 需要先验证的命令
- 不能马上修改的业务点

每条结论必须引用文件路径。没有来源就标 UNKNOWN。
```

### 第三步：看接手表，而不是看长摘要

接手表至少应包含：

| 行为或需求 | 状态 | 来源 | 最近验证 | 未知项 |
| --- | --- | --- | --- | --- |
| `<fill>` | `APPROVED / OBSERVED / UNKNOWN / CONFLICT` | `<path>` | `Pass / Fail / Not run` | `<fill>` |

接手者只根据信息完整的范围继续工作。高影响 `UNKNOWN` 或 `CONFLICT` 仍存在时，不能把相关业务规则改成新的默认行为。

### 第四步：执行任务时维护变更资料

若只是阅读、修 bug、调整不改变语义的文案，可以只更新 `handover/current.md` 和 `evidence.md`。

若任务状态、负责人、顺序或依赖变化，同时更新 `iteration-plan.md`。

若会改变用户可见行为、接口、权限、数据、通知、费用、发布边界，则创建：

```text
project-facts/changes/<yyyy-mm-dd>-<change>/
  proposal.md
  requirements.md
  unknowns.md
  evidence.md
```

`design.md` 和 `tasks.md` 可按复杂度决定是否填写。轻量项目不必为了形式补齐所有文件。

### 第五步：完成后写清楚验证状态

完成汇报必须包含：

- 改了什么功能行为；
- 关联哪些需求 ID；
- 执行了哪些检查；
- 哪些检查失败；
- 哪些检查没执行；
- 还有哪些未知项。

不要把“AI 认为可以”写成“已验收”。

## 同事接手时的入口清单

给接手同事一条消息即可，不需要长篇口头说明：

```text
项目：<name>
仓库：<repo>
当前分支/commit：<branch or commit>
接手入口：
1. AGENTS.md
2. project-facts/project.md
3. project-facts/handover/current.md
4. project-facts/specs/<domain>/spec.md
当前任务：<一句话>
验证命令：<command>
注意事项：<不能改的范围 / 高风险未知项>
```

如果项目已经有 `project-facts/handover/for-next-maintainer.md`，优先复制其中的接手消息，避免每个人临时改写。

接手同事拿到后，用自己的 AI 执行固定提示即可。这样不依赖同一个模型，也不依赖同一个客户端。

## 什么时候需要外部工具

| 情况 | 建议 |
| --- | --- |
| 只是让别人能接手老项目 | 不装工具，使用 L1 文件 |
| 一次普通业务变更 | 不装工具，使用 L2 变更包 |
| 新产品或大功能，需求还在变化 | 可以用 Spec Kit |
| 已有项目频繁变更，需要 proposal/apply/archive 流程 | 可以用 OpenSpec |
| 团队已经统一使用 Kiro | 可以用 Kiro Specs |
| 权限、计费、删除、隐私、备份恢复 | 不靠工具名，必须有人审阅并留下验证证据 |

工具选择原则：

- 一个项目只选一种主流程。
- 不为迁移目录而迁移目录。
- 已有 Spec Kit/OpenSpec/Kiro 文件就继续用。
- 没有这些文件的老项目，先用 `project-facts/`。
- 外部工具产出的文档也要区分 `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT`。

## 轻量 PR 规则

没有 CODEOWNERS 和 CI 时，先用 PR 描述强制自查。

```markdown
## 需求影响

- [ ] 不影响用户可见行为、接口、权限、数据或发布边界
- [ ] 影响行为，已更新 project-facts/specs 或 changes

## 来源状态

- APPROVED:
- OBSERVED:
- UNKNOWN:
- CONFLICT:

## 验证

- [ ] 自动检查已执行：<command/result>
- [ ] 人工检查已执行：<steps/result>
- [ ] 未执行检查已说明原因：

## 接手影响

- [ ] 已更新 handover/current.md 或确认无需更新
```

当项目进入 L3，再把这些要求转成 CODEOWNERS、branch protection、CI 检查。

## 团队节奏

### 每次接手

- 固定当前 commit。
- 读取接手入口。
- 输出状态表。
- 记录未知项。
- 再开始实现。

### 每次行为变化

- 记录为什么改。
- 记录改变和不改变的内容。
- 更新迭代任务状态和负责人。
- 更新受影响需求。
- 执行验证。
- 写明没验证的部分。

### 每周或每两周

每个活跃项目检查一次：

| 检查项 | 结果 |
| --- | --- |
| `handover/current.md` 是否能指向当前入口 | Pass / Needs update |
| 最近行为变化是否有受影响需求 | Pass / Needs update |
| 高影响未知项是否仍开放 | 数量和负责人 |
| 最近验证是否过期 | Pass / Needs update |
| AI 指令是否还符合真实启动和测试命令 | Pass / Needs update |

## 判断协作是否有效

一个项目达到“可接手”，不看文档页数，看接手者是否能在 30 分钟内回答：

1. 这个项目现在要交付什么？
2. 谁能确认业务意图？
3. 当前任务相关的需求在哪里？
4. 哪些行为已批准，哪些只是代码现状？
5. 当前最大未知项是什么？
6. 怎么验证改动没有偏离需求？

若回答不了，优先维护 `handover/current.md`、`project.md` 和当前业务域 `spec.md`，不要急着引入重工具。

## 推荐推进方式

第一周：

- 选 2 个真实项目；
- 每个项目只做到 L1；
- 让另一个同事用自己的 AI 按固定提示接手阅读；
- 记录读不懂、找不到、冲突的地方。

第二到第四周：

- 对真实变更使用 L2 变更包；
- 高风险变更才使用 L3 审阅和验证；
- 观察接手时间和未知项数量。

第五到第六周：

- 决定哪些项目需要继续轻量维护；
- 哪些项目值得使用 Spec Kit 或 OpenSpec；
- 哪些项目需要 PR 规则和 CODEOWNERS。

最终目标不是所有项目装同一套工具，而是所有项目都能被不同人、不同 AI 读出同一组事实。
