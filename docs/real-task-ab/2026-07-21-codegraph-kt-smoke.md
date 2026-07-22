# CodeGraph 崆峒冒烟验证（支撑材料，非 counted 记录）

记录日期：2026-07-21

性质：feasibility smoke test。不是完整任务 A/B，不进入 counted records；为正式 A/B（`SFC-20260721-codegraph-adapter-kt-ab-validation` 工作项 3）提供环境证据与基线数字。

## 环境

| 项 | 值 |
| --- | --- |
| CodeGraph 版本 | `1.4.1`（npm 全局安装；v1.5.0 发布当天未钉） |
| 遥测 | 已关闭（`codegraph telemetry off`） |
| 崆峒改造 | 仅两仓 `.gitignore` 增加 `.codegraph/`；未触碰任何 `AGENTS.md`、project-facts 或源码 |
| 索引结果 | `kt-travel-lite-backend`：5,684 文件（Java 5,409、XML 275）、4,575 类、**1,943 条 Spring 路由**、778 接口；`kt-travel-lite-h5`：596 文件（Vue 321、JS 274）、1,781 函数、321 组件。两仓均 `Index is up to date` |

## 查询实测

### T1：后端端点链路（`preSaveOrderCommodity`）

| 路线 | 产出 | 上下文体量 | 耗时 |
| --- | --- | --- | --- |
| `codegraph explore "preSaveOrderCommodity"` | Controller(`CommodityController.java:215`) → 接口(`ICommodityService.java:103`) → 实现(`CommodityServiceImpl.java:1543`) + `POST /api/commodity/public/preSaveOrderCommodity` 路由映射 + `CommoditySaveOrderReq/Resp` DTO + 调用方 blast radius + 下游调用含 `calcInsuranceTrialAmount`（正是 7-18 保险变更相关） | 26,222 B（约 6.5K tokens） | 9.9s |
| `rg -l 'preSaveOrderCommodity' .` 路线 | 4 个文件（含 `application-prod.yml` 配置噪音），不含路由映射与调用图；读完这 4 个文件需 272,450 B（约 68K tokens） | 约 10 倍于 explore | <1s（仅定位） |

### T2：H5 跨文件字段（`reservationOrderDetails` 联系人回显）

| 路线 | 产出 | 上下文体量 | 耗时 |
| --- | --- | --- | --- |
| `codegraph explore "reservationOrderDetails contact prefill settlement"` | 15 个符号 / 8 个文件：两个页面组件、vuex dispatch 动态跳线（`setDataInfo`、`setDict_license_type`）、blast radius、带行号原文 | 18,378 B（约 4.6K tokens） | 1.2s |
| `rg -l 'reservationOrderDetails' .` | 19 个文件（含 `h5/static/js/` 构建产物噪音）；字段级查询只剩 3 个文件，无调用流 | 需人工筛选后读两个大 Vue 文件 | <1s（仅定位） |

## 发现（全部一手实测）

1. **中文自然语言查询无效**：`explore "预约订单详情的联系人信息如何回显到结算页"` 返回空；FTS 面向符号名。adapter 与使用指引必须写"用符号名/英文术语查询"。
2. **构建产物噪音**：`h5/static/js/*.js`（uni-app 编译产物，已提交在树内）进入索引并出现在 blast radius。需在 h5 仓 `codegraph.json` 加 `exclude: ["h5/static/js/"]` 后重建索引。
3. **rg 非 TTY 陷阱**：无路径参数的 `rg <pattern>` 在非 TTY 环境（自动化、子 shell）读 stdin 而非搜文件系统，静默返回空。本次两条"rg 0 命中"均是此误测，不是 rg 失败。所有指引中的 rg 用法必须带路径（`rg <pattern> .`）。已另立候选 `SFC-20260721-rg-non-tty-stdin-pitfall`。
4. **大图查询耗时**：backend explore 约 10s（5,684 文件图），h5 约 1s。可接受，但 adapter 需设超时并异步化。

## 下一步（正式 A/B）

- 在 h5 仓加 `codegraph.json` exclude 后 `codegraph index` 重建。
- 两类任务各一条：backend-bug（Java 仓）、cross-end-field（H5+后端）。B 组=现有流程（route/contracts/rg），C 组=B+CodeGraph，同一 prompt，开 observe hooks 记 token，结果写入 counted 候选记录。
