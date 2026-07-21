# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260720-token-budgeted-context-router` |
| Status | `proposed` |
| Created at | `2026-07-20` |
| Source project | `project-facts-kit` |
| Skill | `low-token-context-maintainer`, `ai-context-kit` |
| Target section | Context routing, token budget enforcement, CLI `context` command |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 2026-07-20 市场调研交叉验证后的迭代评审：用户要求把 token-budgeted context 只写为候选记录，不直接实现 |
| Evidence paths | `docs/research/project-facts-context-market-research-2026-07-15.zh-CN.md`（§5.5、§7、阶段 C）；`docs/research/project-facts-context-market-research-2026-07-20.zh-CN.md`（§3.3、§5）；`docs/ai-context-kit-real-task-ab-audit.md` |
| Verification run | Not run（本候选只是登记，未修改 CLI 或 Skill） |
| Reviewer | Pending |
| Reviewer decision | Pending |

## Observed Behavior

- Helpful: 现有 `tokens`/`measure`/`dashboard` 提供静态测量；`codex-mem route` 和 `contracts --query` 提供仓库级和契约级筛选；7-18/7-19 崆峒真实变更沿用该流程完成。
- Missing: CLI 没有 query-aware、带硬 token 上限的上下文选择命令；当前路由在固定文件集（routing/lean/full 索引）间选择，大项目仍可能读入与任务无关的完整索引。
- Misleading: 无。
- Tool conflict: 无。

外部证据（2026-07-20 核查）：Claude Code 原生 auto memory 内建 25KB 索引上限；OpenViking 公布 L0/L1/L2 分层基准（准确率 57%→80%，token -63%）；Aider `--map-tokens` 动态预算持续维护。token 预算显式分配已成为上下文工程的公认成熟标志。

## Why It Should Move Upstream

带硬上限的上下文路由是跨项目通用能力，不依赖任何业务域。7-15 调研把它列为阶段 C 核心工作，7-20 交叉验证进一步确认外部生态已把 token 预算作为标准实践；本项目的差异化（批准分离、证据档案）需要一个低 token 读取路径才能成立完整叙事。目标形态见 7-15 调研 §7：`ai-context-kit context --workspace . --query "<task>" --budget <tokens>`，输出选中片段、选择理由和下一层读取入口。

## Why It Should Stay Local

实现前必须先有 counted 真实任务 A/B（当前为 0），否则无法证明"减少 token 的同时质量不降"。片段排序算法、provider 接口和 sidecar 缓存位置属于工具内部设计，不包含任何项目专属业务规则。CodeGraph/RAG、Serena/SCIP provider 和 memory layer 不随本候选自动进入，仍需各自独立候选。

## Implementation Preconditions

1. `docs/real-task-ab/` 至少出现 1 条 counted 记录，且 B 组使用路由类能力。
2. Tool/library owner 明确接受该候选。
3. 实现 PR 单独提交，不与文档、模板或分发改动混合。
