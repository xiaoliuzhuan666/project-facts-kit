# SFC-20260829 Fragment latest 落地悬置缺少跟踪

## Snapshot

- Date: 2026-08-29
- Source workspace: `崆峒` multi-repo workspace（kit 0.3.55 → 0.3.60 upgrade，2026-08-01）
- Related skill: `project-facts-maintainer`（upgrade / 已接入升级路径）
- Status: `proposed`

## Evidence

- `崆峒/project-facts/AGENTS.fragment.latest.md` 由 2026-08-01 kit 升级写入，标注「待审阅」，此后 28 天内无人合并：根 `AGENTS.md`（generated-by: ai-context-kit）与 12 个子仓库 AGENTS.md 均未包含第 8 条 Skill 反哺工作流。
- 崆峒反哺实践同期反而很活跃：`project-facts/skill-feedback/` 有 19 条候选、`skill-performance-log.md` 到 2026-08-29 仍在追加——反哺在发生，但承载反哺规则的 fragment 没落地，说明「latest 待审阅」没有进入任何任务跟踪。
- 同一升级还新增了 `kongtong-grill`、`ponytail-review` 等 skill 与 `_template.md`，这些都立即被使用；唯独 fragment.latest 因需要人工合并动作而被搁置。

## Observed Behavior

- Missing：upgrade 结束后，`AGENTS.fragment.latest.md` 只是被「写入待审阅」，没有产生任何需要后续处理的记录（不在 iteration-plan、不在 doctor 输出、不在 skill-performance-log），导致该动作脱离一切闭环机制。
- Helpful：kit README 的保留区（`ai-context-kit: preserved-block`）机制已经给出了正确的落地方式，缺的只是升级后的提醒与跟踪。

## Why Move Upstream

- fragment 是反哺闭环的规则载体。它悬置时，所有子仓库和父目录的 Agent 都看不到最新的 Skill 反哺工作流，反哺规则本身成为闭环上最弱的一环。
- 这类「升级产物等待人工动作」的悬置在其他 workspace 复现概率高，适合在 kit 层面统一解决。

## Next Action（候选方案，待评审）

1. `ai-context-kit upgrade` 在写入 `AGENTS.fragment.latest.md` 时，同步在目标 workspace 的 `project-facts/iteration-plan.md` 追加一条待办任务（或输出明显的 stdout 提醒 + 退出码提示），直到 fragment 被合并并删除 latest。
2. `doctor` 增加一项检查：存在 `AGENTS.fragment.latest.md` 且根/子仓库 AGENTS.md 未包含其第 1 条内容时，报 `fragment pending adoption` 状态。
3. 文档层面：在 adoption-guide 的「已接入升级」步骤中，把「合并 fragment.latest 并删除」列为升级的显式收尾步骤。
