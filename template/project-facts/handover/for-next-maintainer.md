# For Next Maintainer

## 接手消息

可以把下面这段发给接手同事：

```text
项目：<project name>
仓库：<repository name, remote URL, or redacted local path>
当前分支/commit：<branch and commit>
当前状态：<clean / dirty / no commits / release state>

接手入口：
1. AGENTS.md
2. project-facts/project.md
3. project-facts/handover/current.md
4. project-facts/specs/<domain>/spec.md
5. <active change or key document>

当前目标：
<one or two sentences describing the next approved or proposed goal>

验证命令：
<command 1>
<command 2>
<command 3>

注意事项：
- <do not change area / high-risk boundary>
- <important UNKNOWN or CONFLICT>
- <runtime artifact or secret that must not be committed>
```

## 给 AI 的接手提示词

```text
你现在接手 <repository name, remote URL, or redacted path>。
请先阅读资料，不要马上修改代码。

按顺序读取：
1. AGENTS.md
2. README 或项目入口文档
3. project-facts/project.md
4. project-facts/handover/current.md
5. 与当前任务相关的 project-facts/specs/**
6. 最近相关 changes、ADR、测试和关键代码

输出一张表，列出：
- APPROVED 的产品目标
- OBSERVED 的当前实现
- UNKNOWN 的待确认项
- CONFLICT 的冲突项
- 下一步可做任务
- 开始改代码前必须执行的验证命令

每条结论必须引用文件路径。没有来源就标 UNKNOWN。
```

## 建议的第一项开发任务

| Field | Value |
| --- | --- |
| Task | `<active change or issue>` |
| Why now | `<reason>` |
| Required facts | `<spec/change paths>` |
| Required checks | `<commands or manual checks>` |

## 不建议第一步做的事

- `<scope that needs owner confirmation first>`
- `<high-risk implementation that is not ready>`
- `<tooling migration that is not required for this task>`
