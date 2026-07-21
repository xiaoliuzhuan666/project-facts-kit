# 崆峒含船票保险与儿童选项三端迁移 A/B 记录（回溯）

记录日期：2026-07-20

## 记录表

| 字段 | 内容 |
| --- | --- |
| Record ID | `2026-07-18-kt-presale-insurance-child-cross-client` |
| Task type | `cross-end-field`（候选分类，回溯登记） |
| Workspace | `<kt-workspace>` |
| Repos involved | `kt-travel-lite-applet`（基准端）, `kt-travel-lite-h5`, `kt-travel-lite-web` |
| Revision checked | 任务执行时各仓库工作区状态见变更记录；本记录不重新写业务文件 |
| ai-context-kit version | Not recorded（任务执行时未记录版本） |
| Prompt | 把小程序已确认的预售保险选填与儿童规则迁移到 H5 和 PC Web，保持三端一致（按变更记录语义复原） |
| Expected task output | 三端迁移实现 + 差异说明 + 验证证据 + 验收矩阵 |
| Index status | Not recorded（任务时未跑 `doctor`；2026-07-20 复核未重跑） |
| Non-goals | 不审计后端源码、不真实投保、不真实支付、不改生产配置 |

## 分组结果

| Group | Context tools used | Files read | Contract coverage | Verification | Tokens | Tool calls | Duration | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 无对照组 | - | - | - | - | - | - | 回溯任务，未设对照组 |
| B | `project-facts` 工作流：`specs/`、`changes/` 状态分类（APPROVED/OBSERVED/UNKNOWN）、证据模板 | `kt-travel-lite-applet/pagesA/order/settlement.vue`、`kt-travel-lite-h5/pagesA/order/settlement.vue`、`kt-travel-lite-web/src/views/spu/step-one.vue`、`step-two.vue`、`PresaleReservationSelector.vue`、两端 API wrapper、Git 历史 | 预结算 `preSaveOrderCommodity`、`getConfigByKey`、正式 `purchaseList` 字段差异已识别并处理 | `git diff --check` Pass（H5/Web）；Vue SFC 与工具函数静态解析 Pass；Node ESM 场景断言 Pass；step-two/utils eslint Pass；step-one 12 个 lint 错误为 HEAD 既有（无新增）；页面/浏览器/真实接口/支付 `Not run`；后端契约 `Not inspected` | Not recorded | Not recorded | 变更记录估计 2.5–4 人日 | 三端迁移已实现并留证据；运行时验收未完成 |

## 质量判定

| 检查项 | A | B | Notes |
| --- | --- | --- | --- |
| 选对仓库 | na | yes | 基准端与两个待迁移端均在变更记录中明确 |
| 选对入口文件 | na | yes | 三端结算/下单入口文件与 API wrapper 均命中 |
| 前端当前路径已核对 | na | yes | H5 单页结算与 Web 两步下单结构分别处理 |
| 后端 Controller 路径已核对 | na | no | 用户明确本任务不看后端代码，标为 `Not inspected` |
| 请求 DTO 字段已核对 | na | yes | `purchaseList` 由只含首位联系人改为全部实际出行人；`buyInsurance` 逐层处理 |
| 响应 DTO 字段已核对 | na | partial | 预结算配置价已处理；完整响应字段矩阵未建 |
| 同页面相关接口已查看 | na | yes | 预结算、配置、正式下单均覆盖 |
| 状态、支付、失败或取消路径已查看 | na | partial | 携童取消/清除路径已实现并断言；真实支付 `Not run` |
| 修改或建议可复用到通用项目 | na | yes | 产出为通用迁移流程证据，业务规则留在目标项目事实 |
| 漏项 | na | 有 | 运行时验收（页面、接口、支付）全部 `Not run` |

## Token 与证据来源

| Source | Path or command | Notes |
| --- | --- | --- |
| Change record | `<kt-workspace>/project-facts/changes/2026-07-18-presale-insurance-child-cross-client-migration/change.md` | 目标、状态分类、文件矩阵、验收矩阵 |
| Evidence record | 同目录 `evidence.md` | 已执行/未执行检查与 lint 基线对比 |
| Session usage | Not recorded | 任务时未启用 observe hooks，无 token 数据 |
| Related standard | `<kt-workspace>/project-facts/changes/2026-07-18-three-client-sync-standard/` | 同日形成的三端同步标准 |

## 结论

| Question | Answer |
| --- | --- |
| 是否计入三类真实任务验证 | no |
| 计入哪一类 | 暂不计入；可作为 `cross-end-field` 局部证据 |
| B 相比 A 是否减少漏项 | unknown；无 A 组 |
| B 相比 A 是否减少 token | unknown；无 A 组且无 token 记录 |
| 质量是否下降 | unknown；静态检查无新增 lint 错误，运行时验收 `Not run` |
| 需要修改工具吗 | no |
| 如果修改，属于通用规则还是项目专用 | na |
| 后续验证 | 在测试环境完成验收矩阵中的页面/接口/支付项后，可用同一任务 prompt 补跑 A 组对照，并开启 observe hooks 记录 token |

这条记录的作用是保留 7-18 真实跨端迁移任务中 `project-facts` 工作流（B 组）的可用证据，同时明确它不满足计入条件：缺对照组、缺 token 记录、缺运行时验证。
