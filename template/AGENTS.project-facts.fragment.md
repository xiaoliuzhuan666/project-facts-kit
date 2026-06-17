## Project Facts

本项目使用 `project-facts/` 管理业务事实、变更、决策和交接记录。

常用入口：

- 新项目第一次接入：`帮我做项目事实 kit 首次接入。`
- 已接入项目升级：`帮我做项目事实 kit 已接入升级，不覆盖已有事实。`
- 每日 Skill 反哺：`帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。`

处理涉及用户行为、接口、数据、权限或发布结果的任务时，遵守以下工作流：

1. **大纲优先**：先读取 `project-facts/repo_map.txt`（如果存在），作为仓库符号、类与文件搜索的大纲。根据任务只读取关联代码与 specs，不把 repo map 当成批准需求。
2. **读取事实顺序**：按顺序读取 `project-facts/README.md`、`project-facts/project.md`、`project-facts/iteration-plan.md`、相关业务域的 `specs/`、`decisions/` 以及 `handover/current.md`。
3. **状态表输出**：接手或评估项目时，输出 Markdown 状态表，字段包含：行为或需求、状态、来源、最近验证、备注或未知项。来源必须包含文件路径；能定位到具体行时写行号。
4. **无来源归为 UNKNOWN**：没有明确批准依据（A 类证据如审阅规格、ADR、Owner 确认）时，状态不得记为 `APPROVED`。无法找到文件支撑的意图，记为 `UNKNOWN`。
5. **变更记录**：修改业务行为前，在 `project-facts/changes/<date>-<change>/` 中记录目的、非目标、受影响要求、未知项和验证方式。
6. **验证记录**：实现后将真实执行的检查写入 `evidence.md`；没执行的内容写为 `Not run`。
7. **高影响未知项**：高影响 `UNKNOWN` 或 `CONFLICT` 未解决时，停止改变相关业务规则并向责任人报告。
8. **Skill 反哺**：发现可复用的 Agent Skill 优化点时，只写入 `project-facts/skill-feedback/` 候选记录或 `docs/skill-performance-log.md`，不得在业务项目中直接修改共享 Skill。共享 Skill 只能在 Skill 仓库经 Tool/library owner 审阅和 PR 检查后修改。

项目专有的构建、测试、安全和发布规则继续以本仓库其他说明为准。
