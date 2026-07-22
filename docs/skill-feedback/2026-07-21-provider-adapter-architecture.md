# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260721-provider-adapter-architecture` |
| Status | `proposed` |
| Created at | `2026-07-21` |
| Source project | `project-facts-kit` |
| Skill | `ai-context-kit`, `low-token-context-maintainer` |
| Target section | Provider interface, optional third-party adapters, capability detection, effectiveness gate |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 2026-07-21 用户提出平台化方向：本项目作为平台，第三方成熟省 token 方案作为可选集成；本项目只做能力检测与效果测量，轻量干预，不替用户运维这些方案。用户同时明确约束：普通使用者已经很累，任何新能力必须省心减负、不得复杂化 |
| Evidence paths | `docs/research/project-facts-context-market-research-2026-07-15.zh-CN.md`（§5.5、§5.6、§5.7、§6、§6.4、阶段 E）；`docs/research/project-facts-context-market-research-2026-07-20.zh-CN.md`（§3.3、§5）；`docs/skill-feedback/2026-07-20-token-budgeted-context-router.md` |
| Verification run | Not run（本候选只是登记，未修改 CLI 或 Skill） |
| Reviewer | Pending |
| Reviewer decision | Pending |

## Observed Behavior

- Missing: token-budgeted 上下文路由未实现（见 `SFC-20260720-token-budgeted-context-router`）；当前路由在固定文件集间选择。
- Concern: 直接把成熟方案（向量库、LSP、图谱、记忆服务）集成进 core，会把依赖、安装和运维摊给使用者和维护者——这是臃肿的真正来源，与省心减负冲突。

## Direction

用户提出的平台化方向与 7-15 调研 §6 目标架构一致，本候选将其具体化：

1. **core 零外部依赖**：默认 provider 是 `rg` + 内部 token 估算；没有安装任何第三方工具时，一切功能照旧。
2. **薄 adapter，不做插件市场**：第三方方案（Serena/SCIP、OpenViking 类分层、固定版 Repomix 测量）以用户环境中的独立进程存在，通过各自的薄 adapter 对接；不作为 npm 依赖打包，不建设插件运行时或市场。
3. **只读能力检测**：`providers` 类命令只回答"有什么、缺什么、是否可用、索引新鲜度"，不要求用户处理；检测本身写入 0 个文件。
4. **失败静默回落**：provider 缺失或失败时回落 `rg` 与文本基线，不报错阻断任务；核心事实读取、验证记录和 handover 不受影响（7-15 §9.3 门槛）。
5. **效果门槛**：provider 只有在真实任务 A/B 中持续优于文本基线才被推荐（7-15 阶段 E）；否则保持可选实验。A/B 框架即"检测插件效果"的机制。

## 用户负担红线（2026-07-21 用户明确约束）

- 不新增普通使用者必学的命令或概念；三句入口保持不变。
- 不强制安装任何第三方工具；没有 provider 时体验不降级。
- 检测输出是可读结论，不是待办清单。
- 复杂度归维护者和 adapter，不摊给使用者。

## Why It Should Move Upstream

接口定义、能力检测和效果门槛与业务域无关，是所有目标项目共享的工具能力。分层读取省 token 已有公开基准证据（7-20 调研 §3.3），平台化能以有界维护成本获得该收益。

## Why It Should Stay Local

不包含任何业务规则。各第三方方案的许可证（GitNexus PolyForm Noncommercial、OpenViking AGPLv3 等）在各自 adapter 候选中单独评估，不随本候选通过。

## Implementation Plan

1. 定义 provider 接口（7-15 §5.6 草案）+ `rg` 参考实现 + 只读 `providers` 检测命令。
2. 在接口上实现 token-budgeted `context`，承接 `SFC-20260720-token-budgeted-context-router` 的前提条件。
3. 外部 adapter 逐个独立候选，先 A/B 证明再推荐。首个实例：`SFC-20260721-codegraph-adapter-kt-ab-validation`（CodeGraph 版本钉、查询侧 adapter、崆峒 A/B）。

前置条件：Tool/library owner 接受本候选；每一步单独 PR，不与文档或分发改动混合。
