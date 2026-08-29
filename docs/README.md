# docs/ 文档索引

按权威度和用途分类。同一主题以「现行制度」和「操作手册」为准；「历史调研」和「待评审设计」不当作可执行规则。

## 现行制度（权威规则）

| 文档 | 内容 |
| --- | --- |
| [project-facts-governance.zh-CN.md](project-facts-governance.zh-CN.md) | 项目事实制度正文：五状态、证据等级、变更要求、反哺评审分层 |
| [../README.md](../README.md) | 对外总入口与关键原则 |
| [../AGENTS.md](../AGENTS.md) | 本仓库自身的 Agent 规则 |

## 操作手册 / Runbook（照做可执行）

| 文档 | 内容 |
| --- | --- |
| [adoption-guide.zh-CN.md](adoption-guide.zh-CN.md) | 新项目、旧项目、Spec Kit、OpenSpec、多仓库的接入方式 |
| [project-facts-kit-update-commands.zh-CN.md](project-facts-kit-update-commands.zh-CN.md) | 本机更新、项目升级、自动化和维护命令速查（bootstrap 命令的唯一权威位置） |
| [team-quick-start.zh-CN.md](team-quick-start.zh-CN.md) | 团队快速上手，含「当前未实现命令」负面清单 |
| [ai-context-kit-operating-workflow.zh-CN.md](ai-context-kit-operating-workflow.zh-CN.md) | CLI 底层操作流程与排障 |
| [skill-feedback-automation-runbook.zh-CN.md](skill-feedback-automation-runbook.zh-CN.md) | Skill 反哺候选自动化运行手册 |
| [team-training-iteration-runbook.zh-CN.md](team-training-iteration-runbook.zh-CN.md) | 培训与中途接手演练 |
| [monorepo-migration-runbook.zh-CN.md](monorepo-migration-runbook.zh-CN.md) | monorepo 迁移专题 |
| [docker-shared-host-release-pattern.zh-CN.md](docker-shared-host-release-pattern.zh-CN.md) | 共享主机 Docker 发布专题 |

## 状态与台账（动态数据，读前看日期）

| 文档 | 内容 |
| --- | --- |
| [ai-context-kit-status-and-todo.zh-CN.md](ai-context-kit-status-and-todo.zh-CN.md) | CLI 功能清单与三级待办 |
| [skill-iteration-backlog.zh-CN.md](skill-iteration-backlog.zh-CN.md) | 候选评审台账 |
| [ai-context-kit-real-task-ab-audit.md](ai-context-kit-real-task-ab-audit.md) | 真实任务 A/B 审计（工具生成） |
| [skill-feedback/](skill-feedback/) | 共享 Skill 候选接收区与模板 |
| [real-task-ab/](real-task-ab/) | 真实任务 A/B 记录 |

## 模板与工作件

| 文档 | 内容 |
| --- | --- |
| [ai-context-kit-real-task-ab-template.zh-CN.md](ai-context-kit-real-task-ab-template.zh-CN.md) | 真实任务 A/B 记录模板 |
| [task-read-checklists/](task-read-checklists/) | 按任务类型的读取清单（保存在本仓库，供业务项目参照） |

## 调研与设计（历史快照或待评审，非可执行规则）

| 文档 | 状态说明 |
| --- | --- |
| [research/project-facts-context-market-research-2026-07-15.zh-CN.md](research/project-facts-context-market-research-2026-07-15.zh-CN.md) | 市场调研（2026-07-15） |
| [research/project-facts-context-market-research-2026-07-20.zh-CN.md](research/project-facts-context-market-research-2026-07-20.zh-CN.md) | 市场调研交叉验证增量（2026-07-20） |
| [research/skill-carrier-source-notes-2026-06-17.zh-CN.md](research/skill-carrier-source-notes-2026-06-17.zh-CN.md) | Skill 载体来源笔记 |
| [research/source-neudrive/](research/source-neudrive/) | 2026-05-25 neuDrive 来源快照（只读，SHA256 校验） |
| [skill-carrier-assessment.zh-CN.md](skill-carrier-assessment.zh-CN.md) | Skill 是否适合作为载体的评估 |
| [ai-agent-carrier-roadmap.zh-CN.md](ai-agent-carrier-roadmap.zh-CN.md) | Skill、CLI、MCP、hooks、CodeGraph、RAG、memory layer 分工路线 |
| [codex-low-token-tooling-research.zh-CN.md](codex-low-token-tooling-research.zh-CN.md) | Codex app 低 token 工具调研 |
| [codex-mem-adapter-design.zh-CN.md](codex-mem-adapter-design.zh-CN.md) | codex-mem adapter 设计 |
| [codex-mem-mcp-codex-config.zh-CN.md](codex-mem-mcp-codex-config.zh-CN.md) | codex-mem MCP 配置说明 |
| [ai-context-quality-token-consistency-design.zh-CN.md](ai-context-quality-token-consistency-design.zh-CN.md) | **待评审设计**：文内 `install/quickstart/audit/status` 等命令未实现，不要照跑 |
| [examples/](examples/) + [ai-context-workspace-status.schema.json](ai-context-workspace-status.schema.json) | 上述待评审设计的配套样例与 schema，同样未实现 |
| [ai-era-collaboration-playbook.zh-CN.md](ai-era-collaboration-playbook.zh-CN.md) | 早期稿（2026-05-25），分层思路已部分被制度正文吸收 |
| [ai-era-multi-project-requirements-continuity.zh-CN.md](ai-era-multi-project-requirements-continuity.zh-CN.md) | **历史调研稿**，权威规则以项目事实制度为准 |
| [neudrive-integration.zh-CN.md](neudrive-integration.zh-CN.md) | neuDrive 迁移边界说明 |
