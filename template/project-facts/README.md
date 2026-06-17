# Project Facts

这个目录保存本项目被审阅、可追溯和可验证的事实。Agent、维护者和 reviewer 均以这里的状态与来源字段为依据，不以单独会话内容代替正式记录。

## 常用入口

同事和 Agent 不需要记 CLI。根据场景说下面三句之一：

| 场景 | 推荐说法 |
| --- | --- |
| 新项目第一次接入 | `帮我做项目事实 kit 首次接入。` |
| 已接入项目升级 | `帮我做项目事实 kit 已接入升级，不覆盖已有事实。` |
| 每日 Skill 反哺 | `帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。` |

## 状态

| 状态 | 含义 |
| --- | --- |
| `APPROVED` | 有明确责任人或已审阅资料确认的期望行为 |
| `OBSERVED` | 从代码、测试、接口或发布检查观察到的现状 |
| `UNKNOWN` | 资料不足，期望行为尚待确认 |
| `CONFLICT` | 可用资料之间存在冲突，尚待决定 |
| `DEPRECATED` | 已被正式替代，仅为追溯保留 |

## 读取顺序与 Repo Map

1. `repo_map.txt` (若存在)：AI 优先读取此文件以快速了解仓库符号与目录结构大纲，定位关键代码。它只是导航索引，不代表批准需求。
2. `project.md`
3. `glossary.md`
4. `runtime.md`
5. 与任务有关的 `specs/<domain>/spec.md`
6. `decisions/` 与最近相关 `changes/`
7. `handover/current.md`
8. 对应代码、测试与运行验证

> [!TIP]
> 可以在目标仓库根目录运行 `scripts/generate-repo-map.sh` 自动扫描代码符号并生成/更新 `repo_map.txt`。

## 目录

```text
project-facts/
  project.md
  glossary.md
  runtime.md
  iteration-plan.md
  skill-feedback/
    _template.md
  specs/<domain>/spec.md
  changes/<yyyy-mm-dd>-<change>/*.md
  decisions/ADR-*.md
  handover/current.md
  handover/for-next-maintainer.md
```

## 使用规则

- 复制 `_template` 文件到真实目录后填写；模板本身不是需求。
- 每条要求使用稳定 `REQ-<DOMAIN>-NNN` 标识。
- 变更记录明确写出非目标与未知项。
- `iteration-plan.md` 记录当前迭代任务、负责人、状态和验证入口。
- `runtime.md` 记录运行方式、发布链路、数据目录、反向代理、资源限制和回滚方式。
- `skill-feedback/` 只记录可以反哺到共享 Skill 的候选项，不直接修改正式 Skill。
- `evidence.md` 只记录实际执行的检查结果，未执行写 `Not run`。
- 没有责任人确认或明确批准依据时，状态不得写成 `APPROVED`。
- `handover/for-next-maintainer.md` 用来保存可直接交给下一位维护者和 AI 的读取入口。

## Skill 反馈候选

如果团队开启每日总结任务，该任务只能在 `skill-feedback/` 里新增或更新候选记录。候选必须包含来源任务、涉及 Skill、证据路径、验证结果和是否项目专属的判断。共享 Skill 的修改只能回到 Skill 仓库，通过 reviewer 和 PR 检查后完成。
