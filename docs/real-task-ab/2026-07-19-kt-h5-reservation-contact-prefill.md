# 崆峒 H5 预约订单联系人回显 A/B 记录（回溯）

记录日期：2026-07-20

## 记录表

| 字段 | 内容 |
| --- | --- |
| Record ID | `2026-07-19-kt-h5-reservation-contact-prefill` |
| Task type | `cross-end-field`（候选分类，回溯登记；H5 ↔ 后端证件字段映射） |
| Workspace | `<kt-workspace>` |
| Repos involved | `kt-travel-lite-h5`；后端字典值依据旅游后端 `UserContactsServiceImpl`（只读核对，未改后端） |
| Revision checked | 任务执行时工作区状态见变更记录；本记录不重新写业务文件 |
| ai-context-kit version | Not recorded（任务执行时未记录版本） |
| Prompt | H5 预约订单详情把联系人字段回显到结算页，含证件类型转换与未满 6 周岁儿童识别（按变更记录语义复原） |
| Expected task output | H5 两文件修改 + 字段映射断言 + 验证证据 |
| Index status | Not recorded（任务时未跑 `doctor`；2026-07-20 复核未重跑） |
| Non-goals | 不修改中间组合预约页、模板和样式；不执行项目编译（用户工作区要求） |

## 分组结果

| Group | Context tools used | Files read | Contract coverage | Verification | Tokens | Tool calls | Duration | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 无对照组 | - | - | - | - | - | - | 回溯任务，未设对照组 |
| B | `project-facts` 工作流：`changes/` 状态分类与证据模板 | `reservationOrderDetails.vue`、`settlement.vue`、后端 `UserContactsServiceImpl` 已支持值、用户提供的已登录详情响应样本 | 四个 `contact*` 字段、`contactIdType` 枚举（`01→SFZ`、`02→HZ`、`03→GANG_AO`、`04-13→OTHER`、`14→WGRYJZ`） | `git diff --check` Pass；Vue 脚本静态解析 Pass；字段映射与证件类型断言 Pass；6 周岁边界断言 Pass；场景隔离断言 Pass；编译/浏览器/真实预约请求 `Not run`；运行时证件字典匿名不可用（应用级鉴权拒绝） | Not recorded | Not recorded | Not recorded | 联系人回显已实现并留证据；运行时验收未完成 |

## 质量判定

| 检查项 | A | B | Notes |
| --- | --- | --- | --- |
| 选对仓库 | na | yes | 改动限定在 `kt-travel-lite-h5` 两个文件 |
| 选对入口文件 | na | yes | 详情页与结算页均命中，中间预约页确认不消费联系人数据 |
| 前端当前路径已核对 | na | yes | 预约详情 → Vuex → 结算页写入路径已核对 |
| 后端 Controller 路径已核对 | na | partial | 证件字典值依据后端服务实现只读核对；运行时字典接口匿名访问被应用级鉴权拒绝 |
| 请求 DTO 字段已核对 | na | yes | `contact*` 四字段映射断言通过；运行时字典接口匿名访问被应用级鉴权拒绝 |
| 响应 DTO 字段已核对 | na | partial | 依据用户提供的已登录样本，证件号等敏感值未写入项目资料 |
| 同页面相关接口已查看 | na | partial | 字典接口未用登录态独立验证 |
| 状态、支付、失败或取消路径已查看 | na | na | 本任务不涉及支付 |
| 修改或建议可复用到通用项目 | na | yes | 字段映射与年龄边界断言为通用做法，业务枚举留在目标项目 |
| 漏项 | na | 有 | 编译、浏览器、真实登录态订单检查全部 `Not run` |

## Token 与证据来源

| Source | Path or command | Notes |
| --- | --- | --- |
| Evidence record | `<kt-workspace>/project-facts/changes/2026-07-19-h5-reservation-order-contact-prefill/evidence.md` | 已执行/未执行检查 |
| Change record | 同目录 `change.md` | 变更目的与范围 |
| Session usage | Not recorded | 任务时未启用 observe hooks，无 token 数据 |

## 结论

| Question | Answer |
| --- | --- |
| 是否计入三类真实任务验证 | no |
| 计入哪一类 | 暂不计入；可作为 `cross-end-field` 局部证据 |
| B 相比 A 是否减少漏项 | unknown；无 A 组 |
| B 相比 A 是否减少 token | unknown；无 A 组且无 token 记录 |
| 质量是否下降 | unknown；静态断言全部通过，编译与运行时验证 `Not run` |
| 需要修改工具吗 | no |
| 如果修改，属于通用规则还是项目专用 | na |
| 后续验证 | 用户完成编译与登录态页面检查后，可用同一任务 prompt 补跑 A 组对照，并开启 observe hooks 记录 token |

这条记录的作用是保留 7-19 真实跨端字段任务中 `project-facts` 工作流（B 组）的可用证据，同时明确它不满足计入条件：缺对照组、缺 token 记录、缺运行时验证。
