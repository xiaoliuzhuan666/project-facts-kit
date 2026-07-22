# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260721-codegraph-adapter-kt-ab-validation` |
| Status | `accepted` |
| Created at | `2026-07-21` |
| Source project | `project-facts-kit` |
| Skill | `ai-context-kit`, `low-token-context-maintainer` |
| Target section | CodeGraph adapter（code retrieval provider）、CLI 版本钉、崆峒真实任务 A/B 验证 |
| Parent candidate | `SFC-20260721-provider-adapter-architecture`（首个 adapter 实例，承接其约束） |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 2026-07-21 用户要求深度分析 headroomlabs-ai/headroom 与 colbymchenry/codegraph 能否作为第一批省 token 插件在崆峒验证 |
| Evidence paths | 两个仓库 README 与 LICENSE 原文（2026-07-21 核查）；[codegraph releases](https://github.com/colbymchenry/codegraph/releases)（v1.5.0，2026-07-21 发布）；`packages/ai-context-kit/bin/ai-context-kit.mjs`（`runCodegraphInit`、`capabilityCodegraphState`）；两份市场调研（7-15、7-20） |
| Verification run | Not run（本候选只是登记）；外部资料均为一手来源，查询日期 2026-07-21 |
| Reviewer | User acting as Tool/library owner |
| Reviewer decision | Accepted 2026-07-21（PR #7 合并后用户明确"接受并开工"；版本钉定为 1.4.1——v1.5.0 发布当天不钉，待稳定后跟进） |

## Observed Behavior

分析结论（2026-07-21，一手来源）：

- **CodeGraph 适配**：MIT 许可证（已核实原文）；100% 本地（SQLite、无 API key）；Java/Spring、Vue、TS/JS 覆盖崆峒全部栈；`projectPath` 支持跨仓查询；无索引路径静默退回内置工具；厂商基准方法论（with/without MCP、median of 4）与我们 A/B 模板同路数，且作者明确 token 节省为规模相关。
- **已有半成品集成**：CLI 已检测 codegraph 二进制、按仓库 init 并自动加 `.gitignore`、doctor 推荐安装——但版本钉在 `@0.9.9`，上游已发到 v1.5.0；查询侧 adapter 不存在。
- **v1.5.0 增量**（发布日即核查日）：Rust 解析引擎、大 Java/Spring 仓并行解析、npm provenance 与 `gh attestation verify` 构建证明；Pro beta 邀请为严格 opt-in 且每机最多问一次。
- **Headroom 排除**：Apache 2.0 但属会话层压缩代理（wrap/拦截流量），不是查询级 provider 形状；Python+Rust+ONNX+HF 模型依赖违反减负红线；`learn` 自动改写 AGENTS.md 与跨 agent memory 撞 approved/observed 隔离规则。记录排除原因，避免后续重复评估。

## Scope

| # | 工作项 | 说明 |
| --- | --- | --- |
| 1 | 版本钉审查与升级 | `@0.9.9` → 经审查的 1.x：过 v1.0–v1.5 changelog；用 npm provenance / `gh attestation verify` 验证构建来源；v1.5.0 发布当天即钉最新版还是等补丁版，由 owner 在接受时定 |
| 2 | 查询侧 adapter | 在 provider 架构下实现 code retrieval provider：CLI 调 `codegraph explore`，缺失/失败静默回落 `rg`；不作为 npm 依赖打包 |
| 3 | 崆峒 A/B 验证 | `telemetry off`；`kt-travel-lite-backend`（Java/Spring）与 `kt-travel-lite-h5`（Vue）各 init；**不让 installer 改写崆峒各仓 `AGENTS.md`**（用 CLI 直调或 per-project local 配置）；两类任务：backend-bug（Java 仓）、cross-end-field（H5+后端）；B 组现有流程 vs C 组 B+CodeGraph，同一 prompt，开 observe hooks 记 token |
| 4 | 效果门槛 | ≥2 条 counted 记录中 C 组 tool calls/token 下降且质量不降（对照 evidence 验收项）→ adapter 转"推荐 provider"；不达标保持可选实验，厂商数字不得引用为我们的结论 |

## 用户负担红线

- 崆峒使用者不需要学新命令；agent 经 MCP 自动获得使用指引。
- init 为一仓一次的显式命令；`.codegraph/` 由 CLI 自动隔离，不进 Git。
- 未 init 的仓库体验不降级；遥测默认关闭。

## Why It Should Move Upstream

检索 provider、版本钉纪律和效果门槛机制与业务域无关，是所有目标项目共享的工具能力。崆峒 A/B 同时补上 counted records 为 0 的证据缺口（两份调研共同标记）。

## Why It Should Stay Local

不包含任何业务规则；崆峒的业务事实留在崆峒 `project-facts/`。Headroom 类会话层方案不在本候选范围。

## Implementation Preconditions

1. Tool/library owner 接受本候选（父候选 `SFC-20260721-provider-adapter-architecture` 一并接受或先行接受）。
2. 工作项 1–2 各自单独 PR；工作项 3 在崆峒授权工作区执行，记录进 `docs/real-task-ab/`。
3. 未达效果门槛时，版本钉保持 `0.9.9` 或退回，不强行升级。
