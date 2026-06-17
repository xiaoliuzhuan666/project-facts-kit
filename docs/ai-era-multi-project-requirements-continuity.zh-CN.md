# AI 时代多项目需求连续性协作报告

调研日期：2026-05-25
适用对象：多人分别维护不同项目、团队成员使用不同 AI 工具、项目缺少持续维护文档、接手时没有专人讲解需求的研发团队

## 主要结论

团队不应把“统一使用某个大模型”当成解决方案。即使所有人使用同一个模型，只要读取顺序、上下文、代码版本、聊天历史和提示词不同，解释仍可能不同。

更可靠的做法是建立一套模型中立的项目事实制度：把需求、现状、未知项、决策和验收证据保存到项目仓库，并让所有 AI 按同一读取顺序、同一状态标签、同一验收规则工作。

这套机制能显著减少误读，但有一个边界必须提前说清楚：如果项目完全没有能确认业务意图的人，团队只能确认“系统现在是什么行为”，无法证明“这个行为就是产品目标”。AI 可以整理事实、发现冲突、执行实现和验证，不能代替负责人批准业务含义。

对你提到的 Spec Kit：可以继续用。它在 2026-05-21 仍有官方发布版本 `v0.8.13`，并且支持多种 Agent。只是 Spec Kit 需要配合来源状态、未知项、验收证据和 PR 审阅规则。只安装工具，不维护项目事实，仍会出现不同 AI 解读不一致的问题。

## 当前公开方案观察

资料以 2026-05-25 可查官方资料为准。

| 方案 | 适合场景 | 对本问题的价值 | 风险或边界 |
| --- | --- | --- | --- |
| GitHub Spec Kit | 新项目、重大功能、需要完整 spec -> plan -> tasks -> implement 流程 | 官方 CLI 和命令体系完整；支持 `constitution`、`specify`、`plan`、`tasks`、`implement`，也有 `clarify`、`checklist`、`analyze` 质量步骤 | 对历史项目可能偏重；AI 仍参与解释，必须有审阅和验收规则 |
| OpenSpec | 已有项目、资料不足、希望从当前改动开始建立规格 | 官方定位偏向 brownfield；每次变更保存 proposal、specs、design、tasks，适合逐步恢复项目事实 | 需要团队自己增加责任人、证据、PR 限制和月度检查 |
| Kiro Specs | 团队愿意统一在 Kiro IDE 内工作 | 官方文档把规格分为 Feature Specs、Bugfix Specs，并有 requirements、design、tasks 等资料 | 若团队工具不统一，不适合作为唯一制度基础 |
| AGENTS.md | 每个仓库给 AI 提供读取规则、测试命令和禁区 | OpenAI 维护的开放 Markdown 格式，适合作为 Agent 的项目入口 | 只能规定工作方式，不应保存正式业务需求全文 |
| Agent Skills | 跨 Agent 分发同一接手、审阅、验收流程 | `SKILL.md` 可配 `scripts/`、`references/`、`assets/`，适合把流程变成可复用能力 | Skill 不是项目事实，不能替代项目仓库内的规格和证据 |
| Gherkin / EARS / OpenAPI / Pact | 把自然语言需求和接口行为变成可检查资料 | Gherkin 适合验收场景，EARS 适合约束自然语言需求，OpenAPI/Pact 适合接口契约 | 只能检查可观察行为；商业策略仍要人确认 |
| GitHub branch protection / rulesets | 把制度变成合并条件 | 可要求 PR 审阅、CODEOWNERS、状态检查、会话处理完成 | 若允许 AI 直接向主分支写入，制度无法生效 |

Thoughtworks Technology Radar 将 spec-driven development 放在 `Assess`，含义是值得探索并评估它对企业的影响。这说明行业方向已经明确转向结构化规格，但还没有到“装一个工具就万事大吉”的阶段。

## 问题的真实形态

团队现在遇到的偏差通常来自四类材料被混在一起：

| 材料 | 能说明什么 | 不能说明什么 |
| --- | --- | --- |
| 已批准需求、ADR、验收记录 | 产品期望、长期规则、必须保持的边界 | 若过期或互相冲突，需要重新处理 |
| 测试、接口契约、发布验证 | 某些行为已被检查过 | 不能单独证明产品意图 |
| 源码、配置、schema、日志 | 系统当前如何运行 | 不能证明当前行为一定正确 |
| 聊天、issue、AI 总结、个人 memory | 背景线索 | 不能直接当成正式需求 |

AI 误读往往发生在第三、第四类材料被写成第一类材料时。比如“代码现在这么做”被模型解释成“业务要求必须这么做”；或者历史聊天里的一句临时想法被另一个模型当成正式需求。

所以团队需要让所有 AI 输出时都区分四个状态：

| 状态 | 含义 | 是否可以作为实现依据 |
| --- | --- | --- |
| `APPROVED` | 已由负责人或可追溯记录确认 | 可以，但仍需验证 |
| `OBSERVED` | 来自代码、测试、接口、日志、线上行为 | 只能说明现状，不代表产品意图 |
| `UNKNOWN` | 资料不足，无法判断 | 高影响项确认前不应修改对应业务规则 |
| `CONFLICT` | 两份可信资料互相冲突 | 需要负责人或指定 reviewer 处理 |

## 推荐机制

推荐采用“项目事实 + 变更包 + 验收证据 + PR 约束”的组合。

实际采用时，不建议把 Spec Kit、OpenSpec 或 Kiro 安装到每个业务项目作为前置条件。多数已有项目先做到轻量接手即可：`AGENTS.md`、`project-facts/project.md`、`project-facts/handover/current.md`、当前业务域 `spec.md`。详细协作流程见 [AI 时代多项目轻量协作手册](ai-era-collaboration-playbook.zh-CN.md)。

### 1. 每个项目保存项目事实目录

项目事实必须进入该项目 Git 历史，而不是只存在于聊天、个人笔记或某个 AI 的 memory。

建议目录：

```text
AGENTS.md
project-facts/
  project.md
  glossary.md
  specs/
    <domain>/
      spec.md
      contract.openapi.yaml
  changes/
    <yyyy-mm-dd>-<change>/
      proposal.md
      requirements.md
      design.md
      tasks.md
      unknowns.md
      evidence.md
  decisions/
    ADR-0001-<topic>.md
  handover/
    current.md
```

如果项目已经有 Spec Kit，则保留 `.specify` 和现有 `specs`。不要迁移目录名，只要把状态、来源、未知项、验收证据和交接资料加入现有模板。

如果项目已经有 OpenSpec，则保留 `openspec/`。把本报告的状态和证据要求加进去。

### 2. 每条需求都要有固定 ID 和来源

建议格式：

```markdown
## REQ-AUTH-003 外部登录失败提示

- 状态：APPROVED
- 负责人：Auth domain owner
- 来源：ADR-0012；PR #123；验收记录 2026-05-20
- 适用范围：Web 登录页
- 不适用范围：管理员后台登录

### Requirement

WHEN 外部身份提供方返回授权拒绝，
THE SYSTEM SHALL 显示用户可理解的取消提示，
AND SHALL NOT 创建新的登录 session。

### Acceptance Scenarios

Scenario: 用户取消授权
- Given 用户未登录且打开外部登录流程
- When 身份提供方返回 access_denied
- Then 页面显示“登录已取消”
- And 系统没有创建新的 session

### Verification

| 方法 | 命令或步骤 | 最近结果 | 证据 |
| --- | --- | --- | --- |
| 自动检查 | `pnpm test auth-login` | 2026-05-25 Pass | CI #456 |
| 人工检查 | 浏览器走取消授权流程 | Not run | - |
```

这里借用了 EARS 的 `WHEN ... THE SYSTEM SHALL ...` 思路，也借用了 Gherkin 的 Given / When / Then 场景结构。这样 AI、工程师和 reviewer 读到的是同一组可检查语句。

### 3. 每次行为变化都要有变更包

影响用户行为、接口、权限、数据、计费、通知、备份、恢复、发布边界的改动，都需要变更包。

`proposal.md` 说明：

```markdown
# Change: <标题>

## Why

为什么需要修改；引用需求、问题、反馈或批准记录。

## Affected Requirements

- Added: REQ-...
- Modified: REQ-...
- Removed: none

## Explicit Non-Goals

- 这次明确不改变什么。

## Approval

- Business owner: Pending / Approved by ...
- Technical reviewer: Pending / Approved by ...
```

`unknowns.md` 说明：

```markdown
| ID | 问题 | 影响 | 当前证据 | 决定者 | 状态 |
| --- | --- | --- | --- | --- | --- |
| U-001 | ... | Blocker / High / Medium / Low | ... | ... | Open / Resolved |
```

`evidence.md` 说明：

```markdown
| REQ ID | 检查方法 | 结果 | 日期 | 执行者或 Agent | 证据位置 |
| --- | --- | --- | --- | --- | --- |
| REQ-... | automated / manual / contract | Pass / Fail / Not run | ... | ... | ... |
```

`Blocker` 或 `High` 未处理时，不应把相关变更描述为业务已完成。

### 4. 接手项目时的固定读取流程

无人讲解需求时，接手人和 AI 使用同一份读取清单：

1. 读取 `AGENTS.md`、README、构建入口、测试入口。
2. 读取 `project-facts/project.md`、`glossary.md`、当前 `specs`、最近 `handover/current.md`。
3. 读取当前任务相关的 `changes`、ADR、PR、验收证据。
4. 查看相关代码、schema、接口、测试、发布配置。
5. 把聊天、issue、AI 总结、个人 memory 只作为线索。
6. 输出 `APPROVED / OBSERVED / UNKNOWN / CONFLICT` 表。
7. 对高影响未知项提出处理建议，不让 AI 直接写成正式需求。

接手报告建议固定为：

| 输出项 | 内容 |
| --- | --- |
| 功能地图 | 功能域、入口、主要数据、外部依赖 |
| 规格覆盖表 | 关键行为是否有批准规格和验收证据 |
| 不一致列表 | 规格、代码、测试、线上行为之间的差异 |
| 未知项列表 | 资料不足、无法判断产品意图的问题 |
| 建议阅读路径 | 下一位维护者应该读取的文件和命令 |

### 5. 用 PR 规则把制度变成实际限制

建议在代码托管平台设置：

| 修改内容 | 必需审阅 | 必需检查 |
| --- | --- | --- |
| `project-facts/specs/**` | Domain owner | 规格格式、来源、未知项状态 |
| `project-facts/changes/**` | 当前项目 maintainer | 受影响 REQ、非目标、证据 |
| API/schema/migration | Domain owner + 技术 reviewer | 测试、OpenAPI/Pact 或迁移验证 |
| 权限、计费、删除、恢复 | 两名明确 reviewer | 自动检查和人工验收记录 |
| `AGENTS.md`、团队 Skill | 工程负责人 | 指令安全检查、样例项目试用 |

GitHub protected branches 可以要求 PR 审阅、CODEOWNERS 审阅、状态检查、会话处理完成，并默认限制 force push 和删除受保护分支。若团队允许 AI 绕过 PR 直接改主分支，需求制度很难持续有效。

## 多模型协作规则

### 同一输出结构

所有 AI 读取项目后都输出同一结构：

```json
{
  "project": "<name>",
  "revision": "<git-commit>",
  "requirements": [
    {
      "id": "REQ-...",
      "status": "APPROVED | OBSERVED | UNKNOWN | CONFLICT",
      "sources": ["project-facts/specs/auth/spec.md#REQ-AUTH-003"],
      "acceptance": ["scenario or check id"],
      "verification": "Pass | Fail | Not run",
      "open_questions": []
    }
  ]
}
```

不同模型之间比较的不是文风，而是状态、来源、验收和未知项。

### 双模型审阅只用于发现风险

支付、权限、隐私、删除、同步、上线前检查这类高影响场景，可以让两个模型独立阅读同一组资料。

规则：

- 两个模型都必须引用文件路径和版本。
- 任一模型发现 `CONFLICT` 或高影响 `UNKNOWN`，进入人工处理。
- 两个模型结论一致，只表示本次读取一致，不等于业务批准。
- 禁止用“多个模型都这么理解”替代负责人确认。

### 让机器检查可检查部分

| 要求类型 | 推荐证据 |
| --- | --- |
| REST API 字段、错误码、兼容性 | OpenAPI + integration test |
| 服务间交互 | Pact 或同类 contract test |
| 前端流程 | Gherkin 场景 + E2E 或人工验收步骤 |
| 权限和数据隔离 | 授权测试、负向测试 |
| 数据迁移、导入导出、备份恢复 | 固定样本和往返验证记录 |
| 长期技术选择 | ADR |
| 商业策略和不可观察规则 | 负责人批准的规格 |

## Spec Kit 是否继续使用

建议继续使用，但要按项目类型区分。

| 项目情况 | 建议 |
| --- | --- |
| 已经有 Spec Kit 文件 | 继续用；增加来源状态、未知项、evidence、handover、PR 审阅 |
| 新项目或重大功能 | 用 Spec Kit 的完整流程，保留 `clarify`、`checklist`、`analyze` |
| 历史项目资料很少 | 用 OpenSpec 或本仓库 `project-facts/` 从当前改动开始建立事实 |
| 团队成员工具不统一 | 不要求统一 IDE；统一仓库文件、AGENTS.md、Skill 和 PR 规则 |
| 高影响业务没有负责人 | 不开始改业务规则，只能整理 `OBSERVED` 和 `UNKNOWN` |

Spec Kit 的价值在于把需求、设计、任务结构化。它不能单独保证需求不被误读。你们真正需要的是：每个项目都有一份可追溯的事实资料，AI 只能引用和更新这些资料，不能自行批准产品含义。

## 三种可选推进方案

### A. 轻量试行，适合当前团队

两周内选择两个项目，每个项目新增或整理：

- `AGENTS.md`
- `project-facts/project.md`
- `project-facts/glossary.md`
- 一个高风险或正在迭代功能的 `spec.md`
- 一次真实变更的 `changes/<date>-<change>/`
- `handover/current.md`

优点：成本低，能马上改善接手质量。
缺点：只能覆盖被整理过的业务域。

### B. Spec Kit 增强版，适合重大新能力

保留 Spec Kit 流程，并把本报告的要求加入模板：

- 每条需求有 `REQ-ID`
- 每条需求有 `状态 / 来源 / 负责人 / 验收`
- `/speckit.clarify` 的输出进入 `unknowns.md`
- `/speckit.checklist` 的结果进入 PR
- `/speckit.analyze` 用于合并前一致性检查
- 实现后写 `evidence.md`

优点：结构完整，适合大功能。
缺点：对小改动和历史项目会增加维护成本。

### C. 平台化治理，适合团队规模继续扩大

在项目仓库制度之外，建设团队资料库：

- 团队 playbook
- 团队 Skill
- 项目索引
- 未知项看板
- 验收证据索引
- PR 状态聚合

优点：跨项目查找更方便。
缺点：不能替代项目仓库本身，仍要依赖 PR 和负责人审阅。

建议顺序：先执行 A，在重大功能中使用 B；当两个以上项目试行有效后，再考虑 C。

## 试行验收指标

试行 6 周后看这些指标：

| 指标 | 目标 |
| --- | --- |
| 纳入规则的变更是否引用受影响 REQ | 100% |
| 高影响未知项合并时仍为 Open | 0 |
| 需求变化是否更新 evidence | 100% |
| 新接手者定位关键依据所需时间 | 比试行前下降 |
| 两个不同 AI 对同一项目读取结果差异 | 差异被记录并处理 |
| PR 是否绕过规格和证据审阅 | 0 |

## 可直接采用的团队规则草案

```markdown
# AI 开发项目需求连续性规则 v0.1

1. 每个在维护项目必须声明负责人、规格目录、验证命令和交接文件位置。
2. AI 会话、memory、聊天记录和个人 Skill 不是正式业务需求来源。
3. 影响用户行为、数据、接口、权限或发布的改动必须包含变更资料：
   - 目的与非目标；
   - 受影响 REQ；
   - 未知项；
   - 验收证据。
4. 没有批准规格的旧功能可以记录为 OBSERVED；没有责任人确认，不得写成 APPROVED。
5. 高影响未知项未处理时，不合并会改变相关业务行为的修改。
6. 所有 Agent 接手报告必须引用文件路径与版本，并区分 APPROVED、OBSERVED、UNKNOWN、CONFLICT。
7. 产品要求变化由 domain owner 审阅；自动测试通过不能替代业务批准。
8. AGENTS.md 与 Skill 规定工作步骤；正式规格和证据保存在项目仓库。
9. 团队资料库可以分发模板、流程与索引；不得宣传为未经实现的审批或审计系统。
10. 每月检查一次规格与实现是否仍一致，并记录未验证内容。
```

## 参考资料

- GitHub Spec Kit repository: <https://github.com/github/spec-kit>
- GitHub Spec Kit latest release checked on 2026-05-25: <https://github.com/github/spec-kit/releases/tag/v0.8.13>
- GitHub Spec Kit documentation: <https://github.github.com/spec-kit/>
- OpenSpec repository: <https://github.com/Fission-AI/OpenSpec>
- OpenSpec latest release checked on 2026-05-25: <https://github.com/Fission-AI/OpenSpec/releases/tag/v1.3.1>
- Kiro Specs documentation: <https://kiro.dev/docs/specs/>
- AGENTS.md open format: <https://agents.md/>
- Agent Skills Specification: <https://agentskills.io/specification>
- EARS official guide: <https://alistairmavin.com/ears/>
- Cucumber Gherkin Reference: <https://cucumber.io/docs/gherkin/reference/>
- OpenAPI Specification: <https://spec.openapis.org/oas/latest.html>
- Pact documentation: <https://docs.pact.io/>
- GitHub protected branches: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>
- Thoughtworks Technology Radar, spec-driven development: <https://www.thoughtworks.com/radar/techniques/spec-driven-development>
- ISO/IEC/IEEE 29148:2018 Requirements engineering: <https://www.iso.org/standard/72089.html>

## 已验证与未验证

已验证：

- 通过 GitHub release API 核实 Spec Kit `v0.8.13` 发布于 2026-05-21。
- 通过 GitHub release API 核实 OpenSpec `v1.3.1` 发布于 2026-04-21。
- 阅读了 Spec Kit、OpenSpec、Kiro Specs、AGENTS.md、Agent Skills、Gherkin、OpenAPI、Pact、GitHub protected branches、Thoughtworks Radar 的公开资料。
- 阅读了本仓库已有 `README.md`、`docs/project-facts-governance.zh-CN.md`、`docs/adoption-guide.zh-CN.md`、模板和 Skill。

未验证：

- 未在真实业务项目中安装或执行 Spec Kit / OpenSpec / Kiro。
- 未创建 CI、CODEOWNERS 或 GitHub ruleset。
- 未用两个实际 Agent 对同一项目执行接手评测。
- 未证明任何团队资料库已经具备项目需求审批和审计能力。
