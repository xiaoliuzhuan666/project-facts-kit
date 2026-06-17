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

## 自动化职责

业务项目里的每日任务只读取当天任务记录、项目事实、验证证据和已有反馈，输出候选文件。它不能修改共享 Skill、模板、安装脚本或 CLI。

本资料库里的评审任务只检查候选是否有真实来源、验证结果、跨项目适用性和 reviewer 结论。没有 Tool/library owner 审阅记录时，候选不得进入 `accepted`。

具体设置见 `docs/skill-feedback-automation-runbook.zh-CN.md`。
