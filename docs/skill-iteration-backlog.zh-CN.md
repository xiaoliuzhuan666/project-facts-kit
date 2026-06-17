# Skill 反向优化清单

来源：`崆峒` 父目录初始化与 `kt-ticket-console-ui` 到 `kt-marketing-console-ui` 票务票窗迁移任务。

## 使用规则

- 业务项目中的定时任务只生成候选项，不直接修改本仓库 `skills/`。
- 候选项进入本仓库后，先保持 `proposed` 或 `needs-evidence`，由 Tool/library owner 审阅。
- 只有 `accepted` 的候选项才可以修改 `skills/`、模板、安装脚本或 CLI。
- 已合入的候选项标为 `applied`，并记录验证命令。
- 项目专属业务规则不进入共享 Skill；只能留在目标项目的 `project-facts/` 或 `AGENTS.md`。
- 自动运行方式见 `docs/skill-feedback-automation-runbook.zh-CN.md`。业务项目负责产生候选，本资料库负责评审候选。

## 候选项状态

| 状态 | 含义 |
| --- | --- |
| `proposed` | 已提出，证据待审 |
| `needs-evidence` | 方向可能有用，但缺真实任务、验证或复现证据 |
| `accepted` | Tool/library owner 已确认可进入共享资料 |
| `rejected` | 不进入共享 Skill，记录原因 |
| `applied` | 已改入 `skills/`、模板、脚本或 CLI，并完成资料库检查 |

## 待评审候选项

| 候选项 | 来源 | 建议动作 | 状态 | Reviewer 备注 |
| --- | --- | --- | --- | --- |
| `<SFC-YYYYMMDD-name>` | `<project-facts/skill-feedback/...>` | `<improve_skill/new_skill/tooling_fix>` | `proposed` | `<fill>` |

## 已优化到 skill 的项目

| 优化项 | 对应 skill | 实际触发证据 | 已写入位置 |
| --- | --- | --- | --- |
| `ai-context-kit` 不在 `PATH` 时，使用 `~/.cache/project-facts-kit` 内的 Node bin | `low-token-context-maintainer` | `ai-context-kit doctor` 失败，本地 bin 成功 | `Workflow`、`CLI` |
| `doctor` stale 与合同图表头不一致时，不重复执行 `init` | `low-token-context-maintainer` | `doctor` 报缺列，文件表头已有 `Frontend payload fields` 和 `Field check` | `Tool Conflict Handling` |
| `contracts` 返回 0 但 generated map 有命中时，用精确 `rg` 复核 | `low-token-context-maintainer` | 多个 endpoint/symbol 查询为 0，`rg` 能找到 | `Workflow`、`Tool Conflict Handling` |
| 原型驱动的跨仓迁移流程 | `low-token-context-maintainer` | 墨刀原型确认 `票务票窗/票窗预订/团队预报`，再定位源/目标仓库 | `Prototype-Backed Migration Mode` |
| 避免父目录源码大范围搜索 | `low-token-context-maintainer` | 迁移中只读目标文档、原型和目标仓库路径 | `Prototype-Backed Migration Mode` |
| 旧 Vue CLI 项目迁移依赖要参考源仓库实际版本 | `low-token-context-maintainer` | `@panzoom/panzoom@4.6.2` 构建失败，`4.6.1` 构建通过 | `Prototype-Backed Migration Mode` |
| 复制大型旧模块时优先验证 import/build，lint 债务单独记录 | `low-token-context-maintainer` | 构建通过，定向 lint 22048 个格式类问题 | `Prototype-Backed Migration Mode` |
| 后端动态菜单项目要记录 `component` 字段和前端静态路由状态 | `low-token-context-maintainer` | 营销后台使用 `getRouters()`，后续又加了前端静态路由 | `Prototype-Backed Migration Mode` |
| 管理后台弱 route query 的写法 | `low-token-context-maintainer` | `activityCalendar/calendar/index.js` 类查询较弱 | `Admin Console Routing Hints` |
| 记录 skill 表现时区分成功、冲突和未知 | `project-facts-maintainer` | 当前 `skill-performance-log.md` 同时有 OBSERVED/CONFLICT/UNKNOWN | `Skill Performance Evidence` |
| 迁移记录要覆盖源/目标仓库、文件、依赖、路由、验证和剩余人工检查 | `project-facts-maintainer` | 票窗迁移产生页面、接口、依赖、路由和验证差异 | `Migration Change Records` |
| 运行和发布事实要进入项目事实目录 | `project-facts-maintainer` | `knowledge-base-project` 发布中涉及云效、ACR、腾讯云、宝塔、DNS、证书、持久化目录和共享主机资源限制 | `Runtime And Release Facts`、`references/runtime-release-facts.md` |
| Docker 共享服务器发布规则要形成团队资料 | `project-facts-kit` | 同一次发布暴露出前端静态资源、反向代理、数据持久化、资源限制、旧服务隔离和回滚证据要求 | `docs/docker-shared-host-release-pattern.zh-CN.md`、`template/project-facts/runtime.md`、`changes/_template/evidence.md` |
| 腾讯云/云效/ACR 共享主机发布 Skill 支持静态前端和运行资源规则 | `tencent-yunxiao-acr-shared-host-deploy` | 同一次发布确认服务器只拉 ACR 镜像、公网入口层管理静态前端和 HTTPS、数据目录显式映射、容器需要资源限制和旧服务隔离验证 | `references/docker-runtime-practices.md`、`flow-acr.md`、`tencent-shared-host.md`、`nginx-baota.md`、`verification-and-rollback.md` |
| 共享服务器发布流程兼容无宝塔环境 | `project-facts-kit`、`tencent-yunxiao-acr-shared-host-deploy` | 后续复盘确认流程不应强依赖宝塔；原生 Nginx、Caddy、Traefik、云负载均衡和平台入口也能承担公网入口层 | `docs/docker-shared-host-release-pattern.zh-CN.md`、`runtime.md`、发布 Skill `SKILL.md` 和 `references/docker-runtime-practices.md` |
| 仓库角色识别不能只靠业务词 | `ai-context-kit` CLI / `low-token-context-maintainer` | `kt-ticket-console-ui` 是 Vue 控制台项目，但生成的父目录 `AGENTS.md` 曾写成“票务 Java 后端” | `repoRole()`、`renderAgents()`、`Prototype-Backed Migration Mode` |
| Vue 控制台的前端索引标题不能继续写“小程序” | `ai-context-kit` CLI | `kt-ticket-console-ui/project-facts/api-endpoints.md` 是 Vue 控制台接口索引，但标题曾显示“小程序 API endpoint 索引” | `renderApiEndpoints()`、`renderAppletRouteApiMap()` |
| 迁移后完整性复查要把原型页面树、静态路由、动态菜单、隐藏页和未迁入项放在一张清单里 | `project-facts-maintainer` | 票窗迁移后需要确认差价订单、红冲审批、配置页、动态菜单和不迁入登录页等边界 | `Migration Change Records` |
| 服务端陆续给适配文档时，要记录旧 endpoint、新路径或兼容路径、wrapper、消费页面、字段适配和真实环境验证缺口 | `project-facts-maintainer` | 字典、支付方式、售卖站点、打印模板文档分批到达，前端需要持续对照调整 | `Migration Change Records` |
| 已知双端文件路径时先直读文件 | `low-token-context-maintainer`, `project-facts-maintainer` | H5 和小程序结算页路径已知时，先直接看 `pagesA/order/settlement.vue` 比先查 generated map 更快 | `Fast Cross-Repository Fix Mode`, `Cross-Client Parity Records` |
| 小修记录只写四件事 | `project-facts-maintainer` | H5 结算页缺 `selectedChildCommodities` 本质是单页面字段修复，只需要记录变更、证据、已跑验证和未跑项 | `Lightweight Change Evidence` |

## 已改 CLI 的项目

| 项目 | 变化 | 验证 |
| --- | --- | --- |
| `ticket-console-ui` 误标为 Java 后端 | `repoRole()` 改为先看技术栈，再看 `ticket` 等业务词；Vue/Node 项目会生成前端角色和前端读取顺序 | `scripts/check-kit.sh` 新增临时 `ticket-console-ui` Vue fixture，若生成“票务 Java 后端”会失败 |
| Vue 控制台前端索引标题误写“小程序” | uni-app 继续生成“小程序 API/页面”标题，普通 Vue 仓库生成“前端 API/页面”标题 | `scripts/check-kit.sh` 同时断言 uni-app 与 Vue fixture 的标题 |

## 还没改 CLI 的项目

| 项目 | 原因 |
| --- | --- |
| `doctor` stale 误报 | 需要查 `ai-context-kit` stale 检测逻辑，不属于本次 skill 文案优化 |
| `contracts` 0 命中问题 | 需要查索引生成或查询匹配逻辑，不属于本次 skill 文案优化 |
| `npm run lint` 被 `.eslintignore` 影响 | 属于目标业务项目配置问题，不改 project-facts-kit |

## 后续建议

1. 给 `doctor` stale 检测加一个单元或集成用例：合同图表头已有新列时不应继续报 stale。
2. 给 `contracts` 查询加一个回归用例：用存在于 `docs/ai-context-api-contract-map.md` 的 endpoint 和 symbol 验证命中。
3. 增加一个原型驱动迁移的示例 eval：给定设计文档、原型树、源仓库和目标仓库，期望模型产出迁移路径、依赖检查、路由策略和验证清单。
4. 给腾讯云/云效/ACR 共享主机发布 Skill 增加一次独立前向验证：用一个包含后端容器、Postgres/Milvus、静态前端、无宝塔公网入口、DNS/HTTPS 的模拟任务检查 reference 是否足够清楚。
