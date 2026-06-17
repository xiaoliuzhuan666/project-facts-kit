# ai-context-kit 当前状态与待办

整理日期：2026-06-17

## 资料来源

- `docs/codex-low-token-tooling-research.zh-CN.md`
- `docs/codex-mem-adapter-design.zh-CN.md`
- `docs/codex-mem-mcp-codex-config.zh-CN.md`
- `docs/ai-context-kit-real-task-ab-template.zh-CN.md`
- `docs/ai-context-kit-real-task-ab-audit.md`
- `packages/ai-context-kit/bin/ai-context-kit.mjs`
- `scripts/check-kit.sh`
- `skills/low-token-context-maintainer/SKILL.md`

公开仓库不附带内部真实任务记录。需要评估任务质量时，在目标团队自己的私有工作区按模板记录 `docs/real-task-ab/*.md`，再运行 `ai-context-kit real-task-audit`。

## 原始目标

团队从多仓库父目录打开 Codex app 时，agent 应先选对仓库和轻量入口，再进入源码。目标是减少无关上下文、重复阅读和长工具输出，同时保留跨前后端问题分析质量。

第一阶段不替换 Codex app，不直接引入外部 memory 平台。主路径是：

- `AGENTS.md`
- `project-facts/`
- `ai-context-kit`
- CodeGraph 按需查询
- token/session 统计

## 已实现功能

### 项目事实与安装

- `scripts/install-project-facts.sh` 支持完整模板和 `--lite` 模式。
- 安装脚本不覆盖已有 `project-facts/`、已有 helper 脚本和已有 skill 目录。
- `scripts/sync-skills.sh` 支持同步项目内 skill，但不覆盖已有 `AGENTS.md` 和已有 skill。
- 模板包含项目摘要、术语、当前计划、规格、变更、决策、交接和 GitHub 规则片段。

### 多仓库上下文生成

- `doctor` 检查 workflow artifacts 和 capability status。
- `onboard` 生成缺失的工作流材料，再输出 `doctor`、`token-status` 和 capability actions。
- `upgrade` 刷新生成资料，再输出同样状态。
- `init` 生成父目录 `AGENTS.md`、workspace map、API contract map、scope report 和 `.codex-mem/index.jsonl`。
- `agents` / `repair` 按缺失项生成材料；只有 `AGENTS.md` 缺失时只写 `AGENTS.md`。
- 生成文件默认不覆盖非 generated 项目事实。

### API 契约索引

- Java/Spring 后端生成 route/controller 和 API contract maps。
- Go 仓库可识别并提示 `go test ./...` 验证入口。
- uni-app/Vue 前端生成 page/API maps。
- 父目录契约表关联前端 endpoint、API wrapper、页面 payload 字段、后端 Controller、请求 DTO、字段差异提示和响应类型。
- `contracts --query` 可按 endpoint、symbol、DTO、handler、页面或 API wrapper 精确筛选契约索引。
- `--frontend-repo`、`--backend-repo`、`--related` 可限制多前端、多后端或同页面相关接口范围。

### Token 与本地记录

- `measure`、`tokens`、`summary`、`dashboard` 生成静态 token 报告和看板。
- `token-status --json --output` 可写结构化状态，方便编辑器任务或后续插件读取。
- `editor-tasks` 生成 VS Code 兼容 tasks，并保留已有任务。
- `codex-mem install-hooks --mode observe` 记录本地工具输出 token 估算。
- `codex-mem sessions` 摘要 Codex session usage，支持指定 session 对比。
- `codex-mem exec-events` 摘要 `codex exec --json` 事件文件，支持多文件对比并脱敏错误消息。
- `redact` 规则版覆盖常见 API key、Authorization/Cookie、secret-like 字段、邮箱、手机号、本机用户路径和 URL 密码。

### codex-mem MCP

- `codex-mem mcp` 提供本地 stdio MCP server。
- 工具有 `codex_mem_search`、`codex_mem_get`、`codex_mem_route`、`codex_mem_timeline`、`codex_mem_record`。
- `codex-mem config` 生成 Codex MCP `config.toml` 片段。
- `check-kit.sh` 会在本机存在 `codex mcp` 时用临时 `CODEX_HOME` 注册并检查 stdio server 配置。

### 实验能力

- `compress` hook 可把长输出写入 `.codex-mem/refs/` 并返回结构化摘要。
- 命中 `.env`、`application*.yml`、`*.pem`、`*.key`、secret/credential/token 等敏感路径时，不写 ref，只记录跳过原因。
- `compress` 仍需要真实任务 A/B 证明质量不下降，不能默认启用。

## 已验证命令

- `node --check packages/ai-context-kit/bin/ai-context-kit.mjs`
- `bash -n scripts/check-kit.sh`
- `./scripts/check-kit.sh`
- `git diff --check`
- `packages/ai-context-kit/bin/ai-context-kit.mjs --version` 返回 `ai-context-kit 0.3.55`

`check-kit.sh` 的临时项目覆盖：

- Go 仓库识别和验证建议
- TS service、default import、namespace import、CommonJS require 和动态 import
- 局部路径常量、字符串拼接、简单模板字符串
- SDK-style REST client、GraphQL operation、Next/React-style `actions.ts`
- `baseURL` / API prefix 相对路径匹配
- 页面调用 payload 字段提取和必填 DTO 字段差异提示
- stale 契约表和 stale `.codex-mem` 索引提示
- `--frontend-repo`、`--backend-repo`、`--related`
- `graph --output`
- `real-task-audit`
- observe hook、compress ref、refs 回读、timeline、record、sessions、exec-events、redact

## 待办

- 用公开安全的样例或团队私有记录补齐三类真实任务 A/B：`backend-bug`、`miniapp-integration`、`cross-end-field`。
- `compress` 模式需要真实任务 A/B 验证后再作为团队默认能力。
- MCP 检索需要更多完整源码分析任务验证，不能只依赖 smoke test。
- API 契约索引还不能完整表达运行时状态条件、权限判断、配置来源、回调路径和异步副作用。
- session token 统计需要继续校验不同 Codex 版本 JSONL 格式。
- CodeGraph 当前是可选初始化，后续可把查询结果接入 `ai-context-kit` 报告。
- `privacy-filter` / `opf` 可作为共享资料发布前的增强脱敏试点。

## 当前判断

第一阶段的核心能力已经可用：多仓库路由、项目事实索引、跨端契约查询、token 测量、Codex hook observe 和 A/B 记录模板都已实现，并通过本地脚本验证。

下一阶段重点不是继续增加能力，而是用真实任务记录证明质量不下降。没有 A/B 证据前，`compress`、强制拦截和更重的 memory 能力都不应作为默认流程。
