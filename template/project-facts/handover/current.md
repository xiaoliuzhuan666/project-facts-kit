# Current Handover

切会话、换编码软件或换维护者时，只覆写下面 Continuation Handoff。流水、核验细节写进 `project-facts/changes/`。`current.md` 变成长日记时，把旧内容移到 `handover/archive/<YYYY-MM-DD>-current.md`，不要继续往这里追加。

不要把某个编码软件的聊天记录同步到另一个软件。下一会话只读本文件顶部快照、`git status --short` 和最近几条提交。

## Continuation Handoff

- task: `<当前任务>`
- current_goal: `<这一段要完成什么>`
- done: `<已完成且可核对的结果>`
- key_decisions: `<已拍板、换软件后仍有效的决定>`
- blockers: `<阻塞或环境缺口；没有写 none>`
- related_files: `<当前 change / spec / 关键文件路径>`
- next_step: `<下一个软件或下一个维护者立刻做的一步>`

## Snapshot

| Field | Value |
| --- | --- |
| Updated at | `<YYYY-MM-DD>` |
| Current maintainer | `<role or name>` |
| Revision reviewed | `<commit or branch>` |
| Active change | `<path or none>` |

## Open Unknowns Or Conflicts

只保留仍挡住当前任务的项。完整历史未知项留在对应 `changes/` 或 archive。

| ID | Impact | Owner | Location |
| --- | --- | --- | --- |
| `<fill or none>` | `<fill>` | `<fill>` | `<change/unknowns.md>` |

## Read Next

1. `AGENTS.md`
2. `<current change or spec path>`
3. 需要历史流水时：`handover/archive/`
