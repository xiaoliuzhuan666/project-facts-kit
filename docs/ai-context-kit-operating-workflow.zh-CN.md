# ai-context-kit 日常使用流程

整理日期：2026-06-07

这份文档只保留日常任务默认要用的流程。其他能力先作为候选工具，不放进默认动作。

## 核心目标

- 先判断应该读哪个仓库和哪些文件。
- 跨端问题先看接口契约，再读源码。
- 长输出和历史观察可取回，但不直接塞进主上下文。
- 每次报告都说明实际验证结果，没验证就写没验证。

## 默认流程

默认流程只围绕三件事：

1. 找对上下文：先判断多仓库里该看哪个仓库、哪些文件。
2. 看清跨端契约：前端页面、API wrapper、后端 Controller、DTO、状态链路不要漏。
3. 记住过程证据：长输出和任务观察进入本地记录，下次可检索。

### 1. 任务入口

先用一句话描述任务，跑仓库路由：

```bash
ai-context-kit codex-mem route --workspace <parent-or-repo> --query "<task>"
```

只读取推荐仓库的 `AGENTS.md`、`project-facts/project.md`、`context-boundary.md`、`verification.md`。不要从父目录广搜。

如果 workflow 材料缺失：

1. 先跑 `ai-context-kit doctor --workspace <path>` 看当前资料是否齐全。
2. 允许写文件时，跑 `ai-context-kit agents --workspace <path>` 或 `ai-context-kit repair --workspace <path>`。命令会按 doctor 看到的缺失项生成材料：AGENTS、`docs/ai-context-*.md`、project-facts 骨架、scope report 或 `.codex-mem/index.jsonl`。
3. `doctor` 如果把已有契约表标为 `stale`，表示缺少当前 `Frontend payload fields` 或 `Field check` 列；需要根据当前仓库状态刷新生成的 map、报告和索引时，跑 `ai-context-kit init --workspace <path>`；非 ai-context-kit 生成的项目事实不会被覆盖。
4. 如果直接跑 `contracts`、`codex-mem search` 或 `codex-mem route` 时看到 stale warning，先把结果当旧资料处理；可写时用 `init` 刷新，不可写时改读相关源码确认字段。
5. 不允许写文件时，只读已有的 `docs/ai-context-workspace-map.md`、`docs/ai-context-scope-report.md`、`project-facts/`、`package.json`、`pom.xml`、`go.mod`、`pages.json`、Controller/API wrapper 等轻量入口，并在报告中写明没有生成上下文工件。
6. 仍然不要从父目录广搜。没有 `AGENTS.md` 只表示缺少指引文件，不表示可以读完整项目。

缺项处理规则：

| 当前状态 | 命令 | 结果 |
| --- | --- | --- |
| 没有 `AGENTS.md`，也缺少 workspace map、scope report、project-facts 或 `.codex-mem/index.jsonl` | `doctor` 后执行 `agents` 或 `repair` | 只创建缺失的流程材料 |
| 只缺 `AGENTS.md` | `doctor` 后执行 `agents` 或 `repair` | 只创建父目录和子仓库 `AGENTS.md` |
| 已有 `AGENTS.md`，缺少 docs、project-facts 或 `.codex-mem/index.jsonl` | `doctor` 后执行 `agents` 或 `repair` | 保留已有指引文件，只创建缺失材料；有新材料时刷新 route/search 索引 |
| 已有契约表或 `.codex-mem/index.jsonl` 被标为 `stale` | `init` | 按当前仓库状态刷新生成资料 |
| 已有人工维护的 `project-facts/` | 不用 `--force` | 保留人工内容 |
| 不允许写文件 | 不执行生成命令 | 只读轻量入口，并说明没有生成流程材料 |

### 2. 跨端接口或字段

任务涉及页面、接口、Controller、DTO、下单、支付、设备、归还、结算、退款时，先查契约：

```bash
ai-context-kit contracts --workspace <parent-or-repo> --query "<endpoint-or-symbol>"
```

新生成的契约表会在 `Frontend payload fields` 列展示常见页面调用里的顶层请求字段，并在 `Field check` 列提示已识别的必填字段缺失或前端独有字段；动态组装、嵌套对象和运行时分支仍需读取源码确认。

多前端或多后端时加筛选：

```bash
ai-context-kit contracts --workspace <parent-or-repo> --query "<endpoint-or-symbol>" --frontend-repo <repo>
ai-context-kit contracts --workspace <parent-or-repo> --query "<endpoint-or-symbol>" --backend-repo <repo>
ai-context-kit contracts --workspace <parent-or-repo> --query "<endpoint-or-symbol>" --related payment
```

如果要看结构关系，再生成图：

```bash
ai-context-kit graph --workspace <parent-or-repo> --output docs/ai-context-graph.json
```

`graph` 只作为结构入口，不替代源码复查。

### 3. 读取源码

只读契约命中的 API wrapper、页面入口、Controller、请求 DTO、响应 DTO、Service/ServiceImpl、DTO copy/mapper 和必要 Mapper。

后端单接口 bug 的读取范围要再窄一层：

- 已经知道目标仓库和方法名时，不读取 `.codex-mem/index.jsonl`，也不再读取完整 workspace map。
- 首批只看仓库 `AGENTS.md`、route/contract 命中行、Controller 或 handler、请求 DTO、直接调用的 Service/ServiceImpl、必要 Mapper、响应或状态 DTO。
- 支付、设备、异步任务、核销、通知、调度这类后续链路，只读能证明当前接口 bug 的第一层方法；后续链路不影响当前结论时，写成未验证或后续检查。
- 搜索使用精确符号和已知目录，例如方法名、DTO、枚举名。不要用宽泛字段名扫描整个 `dto/**` 或整个后端包；确实需要时，说明原因并限制目录。

字段问题要分开检查：

- 前端 payload 顶层字段。
- 嵌套对象和列表字段。
- 后端请求 DTO。
- 后端返回 DTO 或 response wrapper。
- DTO copy/mapper、手写 setter、状态转换。

路径问题要分开检查：

- 前端当前调用路径。
- 后端 Controller 路径。
- 旧接口、替代接口、兼容接口。
- 网关前缀、环境配置、运行时拼路径。

### 4. 长输出和历史观察

先看最近记录：

```bash
ai-context-kit codex-mem timeline --workspace <parent-or-repo> --limit 20
```

需要读完整 ref 时再取：

```bash
ai-context-kit codex-mem get --workspace <parent-or-repo> --ref <ref-path-or-sha256>
```

任务中发现可复用事实时记录：

```bash
ai-context-kit codex-mem record --workspace <parent-or-repo> --title "<title>" --summary "<summary>" --tag task
```

### 5. 报告前检查

跨端任务报告前必须写清楚：

- DTO 字段契约是否检查，使用了哪些文件。
- 前端当前路径和后端路径是否比较。
- 同页面相关接口是否查看。
- 执行了哪些测试、构建、接口联调或真实支付检查。
- 未执行的验证项。

## 默认不做

这些能力目前不作为日常默认动作：

- 不默认启用 compress，只在真实 A/B 证明质量不下降后再用。
- 不默认生成或打开 graph，只有结构关系或影响范围不清楚时才用。
- 不默认引入 SQLite/FTS、向量库或外部 memory 服务。
- 不默认试点 Understand-Anything、Headroom、OpenViking、LeanCTX。
- 不默认读取完整契约索引、完整日志、完整搜索结果。

## 当前优先验证

后续验证只看三类真实任务：

- 后端 bug。
- 小程序联调。
- 跨端字段问题。

通过这三类任务判断是否继续改工具，而不是继续堆新能力。

每条真实任务都按 `docs/ai-context-kit-real-task-ab-template.zh-CN.md` 记录。只有从定位、源码阅读、修改或分析到验证结果都有证据，才计入 A/B；单独的 route/search/contracts 命中测试只能作为局部证据。

更新真实任务记录后，运行：

```bash
ai-context-kit real-task-audit --workspace <parent-or-repo>
```

报告会写入 `docs/ai-context-kit-real-task-ab-audit.md`，用于查看三类验证是否齐全，并提示后端单接口记录里是否出现本地索引读取、宽 DTO 搜索或过深后续链路。审计只检查记录声明、分类和流程风险文本，不替代测试、构建或接口联调结果。

本仓库当前 `docs/ai-context-kit-real-task-ab-audit.md` 仍显示 counted records 为 0，三类均 missing；仓库内现有 KT、cc-connect Markdown 只能作为局部证据、流程候选或 exec-events 支撑材料。2026-06-08 外部 KT 工作区曾补齐后端 bug、小程序联调、跨端字段问题三类记录，并显示后端单接口样本仍有 300 万级 total tokens，主要问题是读取了本地索引、宽 DTO 搜索和过深异步状态链路。外部记录未作为可计入记录进入本仓库前，本仓库不能声明三类验证已齐；后续默认流程仍必须优先执行上面的后端单接口规则。
