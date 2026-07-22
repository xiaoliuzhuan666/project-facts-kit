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

## 2026-07-15 第一阶段实施结果

| 状态 | 数量 | 候选项 | 评审结论 |
| --- | ---: | --- | --- |
| `proposed` | 1 | `SFC-20260623-multistep-form-return-state` | 保持等待 owner，不纳入本次实施。 |
| `needs-evidence` | 0 | 无 | 本次没有此状态的正式候选。 |
| `accepted` | 0 | 无 | 已接受的 Phase A 候选完成修改和资料库检查，转为 `applied`。 |
| `rejected` | 0 | 无 | 本次没有新增拒绝项。 |
| `applied` | 2 | `SFC-20260618-daily-change-inventory`、`SFC-20260715-universal-low-intrusion-phase-a` | Phase A 已修改 CLI、安装脚本、Plugin 分发、Skill 和文档，并通过资料库检查。 |

分类结果：

- 通用工作流改进：已增加浅层、零写入 `inspect`，发现阶段不读取实现源码。
- CLI/脚本缺陷：已统一版本与命令 contract、generated-file ownership、helper scripts 显式启用、Repomix 可复现与安全调用。
- 模板/分发缺陷：根 `skills/` 已作为唯一来源，两个 Plugin 副本由同步检查保证一致；CI 模板不再调用未实现命令。
- 项目专属业务规则：无。
- 低 token 路由缺口：本阶段只实现只读发现入口；token-budgeted router 留待真实任务验证。
- CodeGraph/RAG/memory layer：本阶段不实现，保持研究状态。

状态变化：`SFC-20260715-universal-low-intrusion-phase-a` 从 `accepted` 转为 `applied`。

证据检查：

| 候选项 | 真实任务来源 | 证据路径 | 验证结果 | 适用范围 | Reviewer/owner |
| --- | --- | --- | --- | --- | --- |
| `SFC-20260715-universal-low-intrusion-phase-a` | 用户在调研后明确要求开始迭代 | 候选文件、调研报告、CLI、安装脚本、Plugin、Skill、CI 模板和检查脚本 | CLI/Bash 语法、`check-kit.sh`、`git diff --check`、两个 Skill 和两个 Plugin 校验均通过 | 通用工作流与工具链；不含业务规则、CodeGraph/RAG/memory 实现 | User acting as Tool/library owner，Accepted 2026-07-15 |

已进入 PR 的项：Phase A 已通过 [PR #2](https://github.com/xiaoliuzhuan666/project-facts-kit/pull/2) 合入 `main`，merge commit 为 `8d4869f`。没有仅处于 `accepted` 且尚未实现的候选。

需要补证据的项：`SFC-20260623-multistep-form-return-state` 仍缺 Tool/library owner 决定，完整真实下单返回链路仍为 `Not run`；保持 `proposed`。

未执行检查：GitHub Actions hosted run、npm publish/install、live Repomix measurement、真实业务项目接入和真实任务 A/B，均为 `Not run`。

## 2026-07-14 评审状态

| 状态 | 数量 | 候选项 | 评审结论 |
| --- | ---: | --- | --- |
| `proposed` | 1 | `SFC-20260623-multistep-form-return-state` | 通用工作流候选；真实任务、证据路径、验证结果和适用范围已记录，但 Tool/library owner 仍为 Pending，完整真实下单返回链路为 `Not run`。 |
| `needs-evidence` | 0 | 无 | 本次没有新增需要改为此状态的正式候选。 |
| `accepted` | 0 | 无 | 本次没有只有 owner 接受、尚未应用的候选。 |
| `rejected` | 0 | 无 | 本次没有新增拒绝项。 |
| `applied` | 1 | `SFC-20260618-daily-change-inventory` | 通用多仓库工作流改进；候选文件记录 owner 接受，提交 `d89efa1` 已把规则写入 Skill、CLI prompt 和文档。 |

分类结果：

- 通用工作流改进：以上 2 项。
- 项目专属业务规则：`multistep-form-return-state` 中的具体路由、字段和 `advancePreDays`，继续留在 `kt-travel-lite-web` 项目事实中，不进入共享 Skill。
- CLI/脚本缺陷：`doctor` stale 误报、`contracts` 0 命中仍是工具缺陷调查项，不因本次候选评审改状态。
- 模板缺陷、低 token 路由缺口、CodeGraph/RAG/memory layer 候选：本次未发现新的正式候选。

证据检查：

| 候选项 | 真实任务来源 | 证据路径 | 验证结果 | 适用范围 | Reviewer/owner |
| --- | --- | --- | --- | --- | --- |
| `SFC-20260623-multistep-form-return-state` | 已记录 | 已记录，业务项目文件仍可读取 | `git diff --check`、`build:dev` 和入口页检查有记录；完整真实返回链路 `Not run`；定向 lint 因历史问题失败 | 通用检查流程与项目专属字段已分开 | Pending |
| `SFC-20260618-daily-change-inventory` | 已记录 | 已记录 | 工作区盘点命令有记录；应用提交为 `d89efa1` | 通用多仓库盘点流程与项目业务改动已分开 | User acting as Tool/library owner，Accepted and applied |

可进入后续 PR 的候选：无。当前没有 `accepted` 且尚未应用的候选。

## 待评审候选项

| 候选项 | 来源 | 建议动作 | 状态 | Reviewer 备注 |
| --- | --- | --- | --- | --- |
| `<SFC-YYYYMMDD-name>` | `<project-facts/skill-feedback/...>` | `<improve_skill/new_skill/tooling_fix>` | `proposed` | `<fill>` |
| `SFC-20260623-multistep-form-return-state` | `docs/skill-feedback/2026-06-23-multistep-form-return-state.md` | `improve_skill` | `proposed` | 2026-07-14 复核：真实任务、证据路径、验证结果和适用范围已记录；Reviewer 仍为 Pending，不能标为 `accepted`。具体路由、字段和 `advancePreDays` 留在目标项目事实。 |
| `SFC-20260715-universal-low-intrusion-phase-a` | `docs/skill-feedback/2026-07-15-universal-low-intrusion-phase-a.md` | `tooling_fix` | `applied` | 2026-07-15 已完成 Phase A 修改；CLI/Bash、资料库、Skill 和 Plugin 检查通过。 |
| `SFC-20260717-evidence-first-cross-runtime-ui-debugging` | `docs/skill-feedback/2026-07-17-evidence-first-cross-runtime-ui-debugging.md` | `improve_skill` | `proposed` | 2026-07-17 登记：建议在 `project-facts-maintainer` 的 `Lightweight Change Evidence` 后增加跨运行时 UI 数据检查点规则；Reviewer decision 为 `Pending`，保持 `proposed`。“游园体验”、板块 ID、商品字段名和页面路径留在目标项目。 |
| `SFC-20260720-token-budgeted-context-router` | `docs/skill-feedback/2026-07-20-token-budgeted-context-router.md` | `tooling_fix` | `proposed` | 2026-07-20 登记：query-aware、带硬 token 上限的 `context` 命令（7-15 调研阶段 C、7-20 交叉验证 §5）；Reviewer decision 为 `Pending`，保持 `proposed`。实现前提：至少 1 条 counted 真实任务 A/B，且单独 PR 实施。 |
| `SFC-20260721-real-task-audit-401-heuristic` | `docs/skill-feedback/2026-07-21-real-task-audit-401-heuristic.md` | `tooling_fix` | `proposed` | 2026-07-21 登记：`real-task-audit` 对记录全文匹配 "401"，会把"接口匿名访问被拒"这类正常观测误标为 `exec failed`；建议把失败检测收窄到"执行失败记录"小节；Reviewer decision 为 `Pending`，保持 `proposed`。 |
| `SFC-20260721-provider-adapter-architecture` | `docs/skill-feedback/2026-07-21-provider-adapter-architecture.md` | `tooling_fix` | `accepted` | 2026-07-21 登记：provider 适配架构（平台化集成第三方省 token 方案）：core 零依赖、薄 adapter、只读能力检测、失败静默回落、A/B 效果门槛、用户负担红线；承接 `SFC-20260720`。2026-07-21 owner 与首个实例候选一并接受。 |
| `SFC-20260721-codegraph-adapter-kt-ab-validation` | `docs/skill-feedback/2026-07-21-codegraph-adapter-kt-ab-validation.md` | `tooling_fix` | `accepted` | 2026-07-21 登记：provider 架构首个 adapter 实例——CodeGraph（MIT，已核实）版本钉、查询侧 adapter、崆峒两仓 A/B 验证与效果门槛；Headroom 排除原因已记录。2026-07-21 owner 接受，版本钉定为 1.4.1（v1.5.0 发布当天不钉）。 |
| `SFC-20260721-rg-non-tty-stdin-pitfall` | `docs/skill-feedback/2026-07-21-rg-non-tty-stdin-pitfall.md` | `improve_skill` | `proposed` | 2026-07-21 登记：无路径参数的 `rg <pattern>` 在非 TTY 环境读 stdin 静默返回空；Skill/文档 rg 示例统一带 `.`，排查 CLI 内部调用；崆峒冒烟实测复现；Reviewer decision 为 `Pending`，保持 `proposed`。 |

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
| 多仓库当天改动先做分类盘点 | `project-facts-maintainer`, `low-token-context-maintainer`, `ai-context-kit` | `SFC-20260618-daily-change-inventory` 记录同一天存在已提交业务改动、未提交工作区改动、生成事实目录和远端落后状态，需要先分类再判断是否可反哺 | `Skill Performance Evidence`, `Skill Feedback Automation Setup`, `Automation Workspace Routing`, `automation-prompt` |

## 已改 CLI 的项目

| 项目 | 变化 | 验证 |
| --- | --- | --- |
| 通用性与低侵入 Phase A | 增加浅层零写入 `inspect`；helper 改为显式安装；默认生成文件增加 ownership guard；Repomix 固定版本并启用默认安全扫描；版本、Plugin Skill 和当前命令文档统一 | `scripts/check-kit.sh` 覆盖 inspect 目录不变、默认/显式 helper、Markdown/JSON/JSONL/hooks 拒绝覆盖、旧生成文件升级、版本和 Plugin 同步；Skill 与 Plugin 校验通过 |
| `ticket-console-ui` 误标为 Java 后端 | `repoRole()` 改为先看技术栈，再看 `ticket` 等业务词；Vue/Node 项目会生成前端角色和前端读取顺序 | `scripts/check-kit.sh` 新增临时 `ticket-console-ui` Vue fixture，若生成“票务 Java 后端”会失败 |
| Vue 控制台前端索引标题误写“小程序” | uni-app 继续生成“小程序 API/页面”标题，普通 Vue 仓库生成“前端 API/页面”标题 | `scripts/check-kit.sh` 同时断言 uni-app 与 Vue fixture 的标题 |

## 还没改 CLI 的项目

| 项目 | 原因 |
| --- | --- |
| `doctor` stale 误报 | 需要查 `ai-context-kit` stale 检测逻辑，不属于本次 skill 文案优化 |
| `contracts` 0 命中问题 | 需要查索引生成或查询匹配逻辑，不属于本次 skill 文案优化 |
| `npm run lint` 被 `.eslintignore` 影响 | 属于目标业务项目配置问题，不改 project-facts-kit |

## 最近评审记录

| 日期 | 候选项 | 结果 | 评审摘要 | 下一步 |
| --- | --- | --- | --- | --- |
| 2026-07-15 | 全部候选 | 状态不变 | 本次自动化复核 3 个候选：2 个 `applied` 均有 owner 记录和对应合入提交；`SFC-20260623-multistep-form-return-state` 的任务文件与验证记录仍可读，但完整返回链路仍为 `Not run`，Reviewer 仍为 Pending。 | 等 Tool/library owner 决定并补充真实返回链路验证；通过前不改正式 Skill 或工具。 |
| 2026-07-15 | `SFC-20260715-universal-low-intrusion-phase-a` | `applied` | 用户以 Tool/library owner 身份接受 Phase A；通用 CLI、安装边界、Plugin 分发、生成文件 ownership 和 Repomix 安全配置已实施并通过检查，PR #2 已合入 `main`。 | 动态路由、更多语言 provider、CodeGraph/RAG/memory 保持独立研究项。 |
| 2026-07-15 | `SFC-20260715-fast-local-fix-context-budget` | `accepted` | 用户以 Tool/library owner 身份于 2026-07-15 接受，要求进入上游实施；`low-token-context-maintainer` 快速本地修复路径已在分支 `codex/low-token-fast-local-path` 实施：先选模式再读取、快速本地路径限 3-4 次源码读取、小型本地 UI 修改不更新项目事实、显式升级信号，跨仓、全工作区和 token/CLI 细节移入三个一层 reference，两个 Plugin 镜像已由同步生成；`./scripts/check-kit.sh`（用户级 CLI-link 兜底）、`git diff --check`、Plugin 镜像检查、`skills-ref validate` 和 `quick_validate.py` 均通过。候选在分支评审合入前保持 `accepted`。 | 分支 `codex/low-token-fast-local-path` 评审合入后转为 `applied`；真实项目接入、升级、token 测量和 hosted GitHub Actions 仍为 `Not run`。 |
| 2026-07-14 | 全部候选 | 状态不变 | 自上次运行后没有新增或修改候选文件，也没有新的 Tool/library owner 记录。2 个候选的来源、证据、验证、适用范围和 reviewer 字段均已复核。 | `SFC-20260623-multistep-form-return-state` 等 owner 决定；通过前不改正式 Skill 或工具。 |
| 2026-07-13 | `SFC-20260623-multistep-form-return-state` | `proposed` | 候选有真实来源和可查证据；`../崆峒/kt-travel-lite-web/project-facts/verification.md` 记录 build 通过、入口页浏览器检查、完整真实链路未验证、lint 失败来自历史债务。没有 Tool/library owner 接受记录。 | 等 Tool/library owner 审阅；通过前不改 `skills/`、`template/`、`scripts/` 或 CLI。 |
| 2026-07-13 | `SFC-20260618-daily-change-inventory` | `applied` | 候选文件记录 user 作为 Tool/library owner 接受；提交 `d89efa1` 和当前 Skill、CLI prompt、文档内容可确认已应用。 | 无需动作。 |

## 后续建议

1. 给 `doctor` stale 检测加一个单元或集成用例：合同图表头已有新列时不应继续报 stale。
2. 给 `contracts` 查询加一个回归用例：用存在于 `docs/ai-context-api-contract-map.md` 的 endpoint 和 symbol 验证命中。
3. 增加一个原型驱动迁移的示例 eval：给定设计文档、原型树、源仓库和目标仓库，期望模型产出迁移路径、依赖检查、路由策略和验证清单。
4. 给腾讯云/云效/ACR 共享主机发布 Skill 增加一次独立前向验证：用一个包含后端容器、Postgres/Milvus、静态前端、无宝塔公网入口、DNS/HTTPS 的模拟任务检查 reference 是否足够清楚。
