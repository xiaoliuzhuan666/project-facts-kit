# KT 电动船租赁下单与归还结算 A/B 记录

记录日期：2026-06-07

## 记录表

| 字段 | 内容 |
| --- | --- |
| Record ID | `2026-06-06-kt-boat-rental-cross-end-field` |
| Task type | `cross-end-field` |
| Workspace | `<kt-workspace>` |
| Repos involved | `travel-lite-applet`, `travel-lite-backend` |
| Revision checked | KT 工作区已有记录，未在本记录中重新写业务文件 |
| ai-context-kit version | A/B 运行后复查使用 `ai-context-kit 0.3.39`；聚焦 session 对比报告使用 `ai-context-kit 0.3.40` 生成 |
| Prompt | 看小程序电动船租赁下单和归还结算链路，分析前后端是否还有改进点 |
| Expected task output | 跨端分析报告，列出接口、DTO、状态、支付、设备和未验证项 |
| Index status | 2026-06-07 复查：`doctor` 标出 `docs/ai-context-api-contract-map.md` 和 `.codex-mem/index.jsonl` stale，缺少 `Frontend payload fields` 和 `Field check` |
| Non-goals | 不修改 KT 业务代码，不执行真实支付 |

## 分组结果

| Group | Context tools used | Files read | Contract coverage | Verification | Tokens | Tool calls | Duration | Result |
| --- | --- | --- | --- | --- | --- | ---:| ---:| --- |
| A | 普通 Codex 源码分析 | 见 `<kt-workspace>/docs/codex-ab-boat-a-natural-answer.md` | 命中主要下单、归还、支付和设备问题 | 小程序构建 `Not run`，后端构建 `Not run`，接口联调 `Not run`，真实支付 `Not run` | total `2,442,461`; input `2,426,118`; output `16,343`; reasoning `6,507` | 63 | 395.5s | 分析完整度较好，但 token 高 |
| B | `AGENTS.md`、workspace map、整段契约索引筛选 | 见 `<kt-workspace>/docs/codex-ab-boat-b-contract-index-answer.md` | endpoint 对应关系更清楚，支付参数和失败标记分析更细 | 小程序构建 `Not run`，后端构建 `Not run`，接口联调 `Not run`，真实支付 `Not run` | total `2,054,960`; input `2,040,352`; output `14,608`; reasoning `2,926` | 95 | 268.1s | token 少 `15.9%`，但工具调用更多，并遇到 429 后通过 resume 完成 |
| B2 | `ai-context-kit contracts --query`，禁止整段读取契约索引 | 见 `<kt-workspace>/docs/codex-ab-boat-b2-contract-command-answer.md` | 同页面相关接口提示后，覆盖 `saveOrderInfo`、`getRevertLeaseOrder`、`updateLeaseOrderById`、`payweapp`、`weapplist`、`updateElectricBoatStatus` 等 | 小程序构建 `Not run`，后端构建 `Not run`，接口联调 `Not run`，真实支付 `Not run` | total `1,514,215`; input `1,500,696`; output `13,519`; reasoning `5,841` | 39 | 384.7s | 相比 A total token 少 `38.0%`，工具调用少 `38.1%`；仍不是完整验证样本 |

## 当前命令复查

2026-06-07 在 KT 原工作区只读复查：

| Command | Result |
| --- | --- |
| `ai-context-kit doctor --workspace <kt-workspace>` | workspace artifacts 基本齐全，但契约表和 `.codex-mem/index.jsonl` stale；推荐 `init` |
| `ai-context-kit codex-mem route --workspace <kt-workspace> --query "电动船租赁下单归还结算" --limit 8` | 推荐 `travel-lite-applet` score `1587`、`travel-lite-backend` score `1432`；输出 stale warning |
| `ai-context-kit contracts --workspace <kt-workspace> --query "getRevertLeaseOrder" --limit 12` | 命中 `getRevertLeaseOrder`，同页面相关接口包括 `updateLeaseOrderById`、`payweapp`、`weapplist`、`getCurrentCommodityLeased`、`listElectricBoatOffLine`、`updateElectricBoatStatus`、`saveOrderInfo`；输出 stale warning |

## 质量判定

| 检查项 | A | B | B2 | Notes |
| --- | --- | --- | --- | --- |
| 选对仓库 | yes | yes | yes | 三组都集中在 `travel-lite-applet` 与 `travel-lite-backend` |
| 选对入口文件 | yes | yes | yes | 入口包括 `api/leaseShip.js`、租船页面、归还页、订单 Controller 和 DTO |
| 前端当前路径已核对 | yes | yes | yes | B2 使用 `contracts --query` 后更少依赖长文档读取 |
| 后端 Controller 路径已核对 | yes | yes | yes | `OrderInfoController.getRevertLeaseOrder`、`updateLeaseOrderById`、`saveOrderInfo` 等被覆盖 |
| 请求 DTO 字段已核对 | yes | yes | partial | 旧 KT 索引没有新版 `Frontend payload fields` 和 `Field check`，B2 还不能代表 v0.3.39 新能力 |
| 响应 DTO 字段已核对 | partial | partial | partial | 没有形成完整响应字段矩阵 |
| 同页面相关接口已查看 | partial | partial | yes | B2 反馈推动了同页面相关接口输出 |
| 状态、支付、失败或取消路径已查看 | yes | yes | partial | B2 覆盖支付和设备入口，但没有真实支付或接口联调 |
| 修改或建议可复用于通用项目 | yes | yes | yes | 后续工具修改集中在通用 contract/query/import/payload 规则 |
| 漏项 | 有 | 有 | 有 | 三组都不能作为完整验收结论 |

## 发现的问题

- 前端下单传 `source` 和 `skuSaveReqs`，后端 `OrderInfoSaveReq` 需要 `channelSource` 和 `skuSaveReqs`；旧索引不能直接给出字段差异。
- `/api/commodity/getCurrentCommodityLeased` 在契约索引里缺后端 Handler。
- 下单和设备 `online` 状态更新是两个前端请求，不在同一个后端事务里。
- 归还后没有确认设备恢复为空闲状态。
- 计费服务存在，但租赁页流程没有证明已按租赁时长计费。
- 归还查询按用户、商品和母单待付款取订单，没有设备、子单或排序维度。
- B 组曾遗漏 `payRouter/listWeAppPayRouter`，后续 `contracts` 同页面相关接口已能提示。

## Token 与证据来源

| Source | Path or command | Notes |
| --- | --- | --- |
| Session usage | `<kt-workspace>/docs/codex-session-usage.md` | A/B/B2 token、工具调用和耗时 |
| Focused session comparison | `docs/real-task-ab/2026-06-06-kt-boat-rental-session-ab.md` | v0.3.40 `codex-mem sessions --session ...` 生成，A 组作为基准 |
| A output | `<kt-workspace>/docs/codex-ab-boat-a-natural-answer.md` | 普通源码分析报告 |
| B output | `<kt-workspace>/docs/codex-ab-boat-b-contract-index-answer.md` | 契约索引提示报告 |
| B2 output | `<kt-workspace>/docs/codex-ab-boat-b2-contract-command-answer.md` | `contracts --query` 提示报告 |
| Comparison | `<kt-workspace>/docs/codex-ab-boat-comparison.md` | 旧 A/B 对比结论 |
| Current doctor | `ai-context-kit doctor --workspace <kt-workspace>` | 2026-06-07 复查索引 stale |
| Current route | `ai-context-kit codex-mem route --workspace <kt-workspace> --query "电动船租赁下单归还结算" --limit 8` | 2026-06-07 复查路由仍能命中双仓库，但有 stale warning |
| Current contracts | `ai-context-kit contracts --workspace <kt-workspace> --query "getRevertLeaseOrder" --limit 12` | 2026-06-07 复查同页面相关接口 |

## 结论

| Question | Answer |
| --- | --- |
| 是否计入三类完整真实任务验证 | no |
| 计入哪一类 | 暂不计入；可作为 `cross-end-field` 局部证据 |
| B 相比 A 是否减少漏项 | mixed |
| B2 相比 A 是否减少 token | yes |
| 质量是否下降 | unknown；没有构建、接口联调或真实支付证据 |
| 需要修改工具吗 | yes，已推动同页面相关接口、payload 字段、Field check、stale warning 等通用能力 |
| 如果修改，属于通用规则还是项目专用 | generic |
| 后续验证 | 用 v0.3.39+ 刷新临时或真实授权工作区后，重跑跨端字段完整任务；另外增加后端 bug 和小程序联调各一条 |

这条记录的作用是保留 KT 电动船 A/B 的有效证据，同时防止把局部命中测试误认为完整任务验证。
