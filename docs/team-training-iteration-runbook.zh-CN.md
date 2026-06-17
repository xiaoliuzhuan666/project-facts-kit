# 团队培训与迭代接手 Runbook

更新日期：2026-05-25

适用范围：团队成员使用不同 AI、项目多人轮换开发、需要让新成员中途加入并继续已有任务的研发团队。

## 培训目标

培训结束后，每位成员应能完成四件事：

1. 从仓库资料判断项目目标、当前任务、已验证内容和待确认内容。
2. 把 AI 输出分成 `APPROVED`、`OBSERVED`、`UNKNOWN`、`CONFLICT`，并给出来源路径。
3. 从 `project-facts/iteration-plan.md` 领取或继续一个任务。
4. 完成阶段工作后更新 `evidence.md`、`handover/current.md`、`handover/for-next-maintainer.md` 和 `iteration-plan.md`。

## 培训前准备

培训负责人选择一个样板项目，并确认以下资料存在：

| 检查项 | 文件 |
| --- | --- |
| 项目目标、边界、验证命令 | `project-facts/project.md` |
| 当前迭代任务与顺序 | `project-facts/iteration-plan.md` |
| 当前接手状态 | `project-facts/handover/current.md` |
| 可发给下一位维护者的消息 | `project-facts/handover/for-next-maintainer.md` |
| 当前任务规格 | `project-facts/specs/<domain>/spec.md` |
| 最近变更证据 | `project-facts/changes/<date>-<change>/evidence.md` |
| AI 工作规则 | `AGENTS.md` |

样板项目如果没有初始 commit，培训中必须把这一点作为风险说明。没有固定代码版本时，中途接手只能依赖当前工作区状态，不能把它当成稳定基线。

## 90 分钟培训安排

| 时间 | 内容 | 产出 |
| --- | --- | --- |
| 0-15 分钟 | 说明项目事实制度和四种状态 | 成员理解 AI 不能批准业务需求 |
| 15-35 分钟 | 用样板项目做接手阅读 | 每人产出一张状态表 |
| 35-55 分钟 | 从 `iteration-plan.md` 选择任务 | 每个任务关联 owner、来源、验证命令 |
| 55-75 分钟 | 演练一次中途交接 | 更新 handover 和任务状态 |
| 75-90 分钟 | 评审训练结果 | 记录缺失资料和下一步负责人 |

## 团队约定

| 场景 | 约定 |
| --- | --- |
| 新任务进入迭代 | 必须写入 `iteration-plan.md`，并关联规格或变更目录 |
| 任务开始开发 | 必须存在负责人、验证命令、未知项处理状态 |
| 中途换人 | 当前维护者更新两个 handover 文件和任务状态 |
| 完成阶段工作 | `evidence.md` 记录实际检查结果，未执行写 `Not run` |
| 高影响未知项仍开放 | 不把相关业务行为描述为已完成 |
| 真实模型、支付、账号、删除、生产发布 | 必须有 reviewer 和人工验收记录 |

## 中途加入流程

新成员拿到项目后，在项目根目录执行：

```bash
git status --short --branch
git rev-parse --short HEAD
rg --files -g 'AGENTS.md' -g 'project-facts/**' | sed -n '1,160p'
```

然后读取：

1. `AGENTS.md`
2. `project-facts/project.md`
3. `project-facts/iteration-plan.md`
4. `project-facts/handover/current.md`
5. `project-facts/handover/for-next-maintainer.md`
6. 当前任务相关 `specs/`、`changes/` 和代码入口

输出接手表：

| 项 | 状态 | 来源 | 最近验证 | 下一步 |
| --- | --- | --- | --- | --- |
| `<requirement or behavior>` | `APPROVED / OBSERVED / UNKNOWN / CONFLICT` | `<path>` | `<result>` | `<action>` |

只有当任务行里有 owner、来源、验证命令，并且高影响未知项已有处理方式时，才继续开发。

## 当前维护者离开前

当前维护者离开任务前，应更新：

| 文件 | 必填内容 |
| --- | --- |
| `project-facts/iteration-plan.md` | 任务状态、当前负责人、下一位维护者需要做什么 |
| `project-facts/handover/current.md` | 当前变更、验证结果、开放未知项 |
| `project-facts/handover/for-next-maintainer.md` | 可直接发送的接手消息和 AI 提示词 |
| `project-facts/changes/<change>/evidence.md` | 已执行和未执行的检查 |

如果工作区还有未提交文件，必须列出哪些文件是本次任务的一部分，哪些是本地产物或无关文件。

## 培训验收

一次培训通过的标准：

| 标准 | 通过条件 |
| --- | --- |
| 成员能读懂项目 | 能用来源路径回答项目目标、当前任务、风险和验证命令 |
| 成员能继续任务 | 能从 `iteration-plan.md` 选出下一项可做任务 |
| 成员能识别边界 | 能指出不能马上改的业务点 |
| 成员能交给别人 | 能更新两个 handover 文件并写清验证状态 |
| 不依赖同一个模型 | 不同 AI 输出的状态表字段一致，分歧点进入 `UNKNOWN` 或 `CONFLICT` |

## 培训后跟踪

培训后的两周内，每个活跃项目检查一次：

| 检查项 | 记录 |
| --- | --- |
| `iteration-plan.md` 是否仍指向当前任务 | Pass / Needs update |
| 最近一次行为变化是否有 evidence | Pass / Needs update |
| handover 是否能让新成员 30 分钟内定位任务 | Pass / Needs update |
| 高影响未知项是否有 owner | 数量和 owner |
| 未提交或忽略文件是否清楚 | Pass / Needs update |
