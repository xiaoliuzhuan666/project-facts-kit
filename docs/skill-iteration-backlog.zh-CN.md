# Skill 反向优化清单

来源：公开仓库只保留通用候选和已应用规则。真实项目的原始候选、A/B 记录和证据明细应保存在团队自己的私有工作区。

## 使用规则

- 业务项目中的定时任务只生成候选项，不直接修改本仓库 `skills/`。
- 候选项进入本仓库后，先保持 `proposed` 或 `needs-evidence`，由 Tool/library owner 审阅。
- 只有 `accepted` 的候选项才可以修改 `skills/`、模板、安装脚本或 CLI。
- 已合入的候选项标为 `applied`，并记录验证命令。
- 项目专属业务规则不进入共享 Skill；只能留在目标项目的 `project-facts/` 或 `AGENTS.md`。
- 候选项只能记录仓库相对路径、符号、命令、验证状态和脱敏摘要，不复制业务数据、用户数据、请求/响应正文、生产日志、密钥或生产配置值。
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

| 候选项 | 来源 | 建议动作 | 隐私状态 | 状态 | Reviewer 备注 |
| --- | --- | --- | --- | --- | --- |
| `<SFC-YYYYMMDD-name>` | `<docs/skill-feedback/...>` | `<improve_skill/new_skill/tooling_fix>` | `<redacted / needs-review>` | `proposed` | `<fill>` |

## 已优化到 Skill 的通用规则

| 优化项 | 对应 Skill | 通用证据类型 | 已写入位置 |
| --- | --- | --- | --- |
| `ai-context-kit` 不在 `PATH` 时，使用 `~/.cache/project-facts-kit` 内的 Node bin | `low-token-context-maintainer` | CLI 不可用但本地 kit 已 clone | `Workflow`、`CLI` |
| `doctor` stale 与合同图表头不一致时，不重复执行 `init` | `low-token-context-maintainer` | 生成表头已包含新版列，但状态检查仍提示 stale | `Tool Conflict Handling` |
| `contracts` 返回 0 但 generated map 有命中时，用精确 `rg` 复核 | `low-token-context-maintainer` | 精确文档搜索能找到 endpoint 或 symbol | `Workflow`、`Tool Conflict Handling` |
| 原型驱动的跨仓迁移流程 | `low-token-context-maintainer` | 设计资料确认页面树后，再定位源/目标仓库 | `Prototype-Backed Migration Mode` |
| 避免父目录源码大范围搜索 | `low-token-context-maintainer` | 多仓库父目录里只读目标文档和目标仓库路径 | `Prototype-Backed Migration Mode` |
| 旧前端项目迁移依赖要参考源仓库实际版本 | `low-token-context-maintainer` | 新版本构建失败，源仓库锁定版本构建通过 | `Prototype-Backed Migration Mode` |
| 复制大型旧模块时优先验证 import/build，lint 债务单独记录 | `low-token-context-maintainer` | 构建通过，但历史 lint 问题数量较大 | `Prototype-Backed Migration Mode` |
| 后端动态菜单项目要记录 `component` 字段和前端静态路由状态 | `low-token-context-maintainer` | 动态菜单与临时静态路由可能同时渲染同一功能 | `Prototype-Backed Migration Mode` |
| 管理后台弱 route query 的写法 | `low-token-context-maintainer` | 页面名较泛时，需要组合页面、文件名、API wrapper 和业务名词 | `Admin Console Routing Hints` |
| 记录 Skill 表现时区分成功、冲突和未知 | `project-facts-maintainer` | 同一任务里可能同时存在 OBSERVED、CONFLICT 和 UNKNOWN | `Skill Performance Evidence` |
| 迁移记录要覆盖源/目标仓库、文件、依赖、路由、验证和剩余人工检查 | `project-facts-maintainer` | 迁移任务通常同时影响页面、接口、依赖、路由和验证计划 | `Migration Change Records` |
| 运行和发布事实要进入项目事实目录 | `project-facts-maintainer` | 发布任务涉及 CI/CD、镜像、云平台、DNS、证书、持久化目录和共享主机资源 | `Runtime And Release Facts`、`references/runtime-release-facts.md` |
| Docker 共享服务器发布规则要形成团队资料 | `project-facts-kit` | 发布复盘暴露公网入口、数据持久化、资源限制、旧服务隔离和回滚证据要求 | `docs/docker-shared-host-release-pattern.zh-CN.md`、`template/project-facts/runtime.md`、`changes/_template/evidence.md` |
| 共享服务器发布流程不强依赖某个面板环境 | `project-facts-kit` | 原生 Nginx、Caddy、Traefik、云负载均衡和平台入口也能承担公网入口层 | `docs/docker-shared-host-release-pattern.zh-CN.md`、`runtime.md` |
| 仓库角色识别不能只靠业务词 | `ai-context-kit` CLI / `low-token-context-maintainer` | 前端控制台项目可能带有业务名词，仍应按 `package.json`、`.vue`、route 和 API wrapper 判断 | `repoRole()`、`renderAgents()`、`Prototype-Backed Migration Mode` |
| 普通 Vue 控制台的前端索引标题不能写成小程序 | `ai-context-kit` CLI | uni-app 和普通 Vue 项目需要不同标题 | `renderApiEndpoints()`、`renderAppletRouteApiMap()` |
| 迁移后完整性复查要把原型页面树、静态路由、动态菜单、隐藏页和未迁入项放在一张清单里 | `project-facts-maintainer` | 迁移后容易遗漏隐藏页、权限路由和不迁入边界 | `Migration Change Records` |
| 服务端陆续给适配文档时，要记录旧 endpoint、新路径或兼容路径、wrapper、消费页面、字段适配和真实环境验证缺口 | `project-facts-maintainer` | 接口适配资料分批到达时，需要持续对照调整 | `Migration Change Records` |
| 已知双端文件路径时先直读文件 | `low-token-context-maintainer`, `project-facts-maintainer` | 目标和对照客户端路径明确时，直接读取比先查 generated map 更快 | `Fast Cross-Repository Fix Mode`, `Cross-Client Parity Records` |
| 小修记录只写四件事 | `project-facts-maintainer` | 单页面字段修复只需要记录变更、证据、已跑验证和未跑项 | `Lightweight Change Evidence` |
| 每日候选默认脱敏 | `project-facts-maintainer`, `low-token-context-maintainer` | 自动化候选只需要路径、符号、状态和摘要，不需要原始业务数据 | `Skill Feedback Privacy`, `Automation Workspace Routing` |

## 已改 CLI 的项目

| 项目 | 变化 | 验证 |
| --- | --- | --- |
| 控制台前端误标为后端 | `repoRole()` 先看技术栈，再看业务词；Vue/Node 项目会生成前端角色和前端读取顺序 | `scripts/check-kit.sh` 新增临时 Vue fixture，若生成后端角色会失败 |
| Vue 控制台前端索引标题误写“小程序” | uni-app 继续生成“小程序 API/页面”标题，普通 Vue 仓库生成“前端 API/页面”标题 | `scripts/check-kit.sh` 同时断言 uni-app 与 Vue fixture 的标题 |

## 还没改 CLI 的项目

| 项目 | 原因 |
| --- | --- |
| `doctor` stale 误报 | 需要查 `ai-context-kit` stale 检测逻辑，不属于当前 Skill 文案优化 |
| `contracts` 0 命中问题 | 需要查索引生成或查询匹配逻辑，不属于当前 Skill 文案优化 |
| 目标项目 lint 配置差异 | 属于目标业务项目配置问题，不改 project-facts-kit |

## 后续建议

1. 给 `doctor` stale 检测加一个回归用例：合同图表头已有新列时不应继续报 stale。
2. 给 `contracts` 查询加一个回归用例：用存在于 `docs/ai-context-api-contract-map.md` 的 endpoint 和 symbol 验证命中。
3. 增加一个原型驱动迁移的示例 eval：给定设计文档、原型树、源仓库和目标仓库，期望模型产出迁移路径、依赖检查、路由策略和验证清单。
4. 给共享主机发布规则增加一次独立前向验证：用一个包含后端容器、数据库、静态前端、公网入口、DNS/HTTPS 的模拟任务检查 reference 是否足够清楚。
