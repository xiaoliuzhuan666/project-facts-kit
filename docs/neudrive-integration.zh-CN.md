# neuDrive 资料迁移与接入边界

## 本次迁移记录

迁移日期：2026-05-25

来源项目：`<neudrive-workspace>`

下列文件以来源快照方式复制到 `docs/research/source-neudrive/`：

| 来源文件 | 迁移原因 |
| --- | --- |
| `docs/ai-multi-project-requirements-continuity-research.zh-CN.md` | 本项目建立的原始调研结论与外部依据 |
| `docs/team-ai-library.zh-CN.md` | neuDrive 能够分发 playbook、prompt 与 Skill 的当前边界 |
| `docs/model-provider-learning-engine-research.zh-CN.md` | proposal、来源与人工审阅原则的相关研究 |

处理方式是复制，不删除 neuDrive 中的来源资料。原因是这些文件同时属于 neuDrive 的产品判断背景，保留原位置可以维持原项目的追溯关系。

## 可以由 neuDrive 承担的部分

基于来源快照，neuDrive Team Library 当前适合存放：

```text
/team/playbooks/project-facts/README.md
/team/playbooks/project-facts/intake.md
/team/prompts/project-facts/structured-review.md
/skills/project-facts-maintainer/SKILL.md
```

用途：

- 在团队成员与不同 Agent 之间传播本项目的工作规则；
- 保存模板说明、审阅步骤和 Skill；
- 作为项目事实仓库的发现入口与检索辅助；
- 进入现有 Team Library 的读取和备份路径。

## 不能由现有 neuDrive 替代的部分

依据 `team-ai-library.zh-CN.md` 的现有边界，当前不能将 neuDrive 描述为：

- 正式业务规格的审批系统；
- Git PR 的强制 reviewer 或 CI 状态检查；
- 企业级组织审计、SSO 或审批平台；
- 自动将所有 Agent 客户端配置修改为相同状态的系统。

因此：

- `project-facts/` 或项目已有规格目录必须保存在各自代码仓库中；
- 项目负责人的批准与验收证据必须进入该仓库的历史或其正式工作系统；
- neuDrive 可以分发此 kit 的 Skill 和 playbook，但不能自动把建议升级为项目批准事实。

## 后续集成建议

| 阶段 | 交付 | 验收方式 |
| --- | --- | --- |
| 1 | 将 `skills/project-facts-maintainer` 与简要 playbook 上传 Team Library | Claude Code/Codex 至少各读取一次并输出带来源状态表 |
| 2 | 在两个项目安装模板并记录三次真实变更 | PR 中存在要求 ID、未知项和证据 |
| 3 | 为 neuDrive 增加项目事实索引或最近验证状态视图的需求提案 | 先写 proposal，不将未实现功能写成已有能力 |

如后续实现 neuDrive 产品集成，应回到当时的代码与验收记录重新确认真实支持范围。
