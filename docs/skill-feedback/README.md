# Skill Feedback

这个目录接收从业务项目回流的共享 Skill 候选项。它只是反馈入口，不是事实仓，也不是正式 Skill 存放地。

## 规则

1. 业务项目每天只产出候选，不直接修改共享 `skills/`。
2. 候选项先保持 `proposed` 或 `needs-evidence`。
3. Tool/library owner 评审后，才允许进入 `docs/skill-iteration-backlog.zh-CN.md` 的 `accepted` 或 `rejected`。
4. 只有 `accepted` 的候选项才能改 `skills/`、模板、安装脚本或 CLI。
5. 候选项必须带真实任务来源、证据路径、验证结果和适用范围说明。

## 推荐结构

```text
docs/skill-feedback/
  YYYY-MM-DD-<candidate>.md
```

每份候选记录尽量只写一件事，避免把多个 skill 问题揉在一起。

## 两份候选模板的分工

| 模板 | 用在哪里 | 为什么字段不同 |
| --- | --- | --- |
| `docs/skill-feedback/_template.md`（简版） | 本资料库的候选接收入口，候选提交到本仓库时使用 | 入口记录只要求快照、证据、观察和下一步，字段尽量少 |
| `template/project-facts/skill-feedback/_template.md`（详版） | 由安装脚本装进业务项目的 `project-facts/skill-feedback/`，在业务项目本地记录候选 | 本地记录需要跟踪建议动作、适用范围、评审结论和上游提交状态，字段更全 |

候选在业务项目里用详版持续维护；提交到本资料库评审时，可以按简版收敛为一份入口记录。

## 自动化职责

业务项目里的每日任务只读取当天任务记录、项目事实、验证证据和已有反馈，输出候选文件。它不能修改共享 Skill、模板、安装脚本或 CLI。

本资料库里的评审任务只检查候选是否有真实来源、验证结果、跨项目适用性和 reviewer 结论。没有 Tool/library owner 审阅记录时，候选不得进入 `accepted`。

具体设置见 `docs/skill-feedback-automation-runbook.zh-CN.md`。
