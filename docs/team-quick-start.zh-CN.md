# 团队快速使用

这份文档面向普通项目成员：用最少命令把业务项目接入 `ai-context-kit`、项目事实模板和 Codex Skill。

## 1. 推荐路径：npm 已发布

```bash
npx -y ai-context-kit@latest install --workspace /absolute/path/to/target-project --lite --with-skill --inject-package-scripts --with-ci
npx -y ai-context-kit@latest quickstart --workspace /absolute/path/to/target-project --install-template --lite --with-skill --inject-package-scripts --with-ci
```

`install` 负责复制模板、helper 脚本、Skill、CI 示例和可选 `facts:*` 命令。`quickstart --install-template` 适合第一次接入时直接完成模板安装、上下文资料生成、audit/status JSON 写入。

从 `0.3.59` 开始，npm 包发布时会带上：

- `template/` 项目事实模板和 GitHub Actions 示例。
- `skills/` 下的 `project-facts-maintainer` 与 `low-token-context-maintainer`。
- `scripts/ai-context-kit.sh`、`generate-repo-map.sh`、`sync-skills.sh` 和传统安装脚本。
- 关键制度文档、status schema、状态样例和任务阅读清单。

## 2. 还没发布 npm：从远端仓库使用

```bash
git clone <project-facts-kit-remote-url>
cd project-facts-kit
npm link
ai-context-kit --version
```

业务项目也可以设置环境变量，让 helper 脚本找到工具仓库：

```bash
export PROJECT_FACTS_KIT=/absolute/path/to/project-facts-kit
```

## 3. 给业务项目接入模板

老项目建议先用轻量模式：

```bash
/absolute/path/to/project-facts-kit/scripts/install-project-facts.sh /absolute/path/to/target-project --lite --inject-package-scripts
```

Node 项目会得到这些短命令：

```bash
npm run facts:setup
npm run facts:status
npm run facts:audit
npm run facts:ci
```

其中 `facts:setup` 会执行 `ai-context-kit quickstart --workspace .`，完成首次检查、缺失资料生成、token status JSON、audit 报告和 workspace status JSON。

非 Node 项目也可以直接运行：

```bash
./scripts/ai-context-kit.sh quickstart --workspace .
./scripts/ai-context-kit.sh status --workspace .
./scripts/ai-context-kit.sh audit --workspace . --output docs/ai-context-audit-report.md --fail-on-warning
```

`scripts/ai-context-kit.sh` 的查找顺序：

1. 本机 PATH 里的 `ai-context-kit`。
2. `PROJECT_FACTS_KIT` 指向的工具仓库。
3. 业务项目内的 `tooling/project-facts-kit`、`vendor/project-facts-kit` 或 `project-facts-kit`。
4. `npx -y ai-context-kit@latest`。

## 4. Codex Plugin

Skill 负责让 Codex 按同一套流程工作；CLI 负责写文件和做检查。团队要在 Codex app / CLI / IDE extension 中统一分发 Skill，可以安装本仓库自带的 Plugin：

```bash
codex plugin marketplace add /absolute/path/to/project-facts-kit
codex plugin marketplace list
```

重启 Codex 后，在 Plugins 里安装 `Project Facts Kit`。这个插件只打包两个 Skill，不会自动修改业务项目，也不会替代 `project-facts/` 中的人审事实。

## 5. 远端仓库建议提交什么

业务项目接入后，建议通过 PR 审阅并提交：

- `AGENTS.md` 或需要人工合并的 `project-facts/AGENTS.fragment.md` 内容。
- `project-facts/` 中已经填写过的项目事实和交接文件。
- `docs/ai-context-workspace-map.md`、`docs/ai-context-api-contract-map.md`、`docs/ai-context-scope-report.md` 等生成资料。
- `docs/ai-context-audit-report.md`、`docs/ai-context-audit-state.json`、`docs/ai-context-workspace-status.json`。
- `.github/workflows/ai-context-kit-context-check.yml`，如果项目使用 GitHub Actions。

不建议提交：

- `.codex-mem/ledger.jsonl`、`.codex-mem/refs/`。
- `.codegraph/`。
- `/tmp/ai-context-kit-*.md` 或本机 usage 日志。
- 任何 `.env*`、`*.pem`、`*.key`、真实 token、真实密码。

## 6. 日常使用只记这几条

```bash
npm run facts:status
npm run facts:query -- "<endpoint-or-symbol>"
npm run facts:audit
npm run facts:ci
```

查接口、字段、跨端问题时先用：

```bash
npm run facts:query -- "/api/orders"
```

然后再读命中的页面、API wrapper、Controller/handler、DTO、Service、Mapper 和验证命令。不要把生成索引当成业务批准来源。

## 7. CI 接入

把模板复制到业务项目：

```bash
mkdir -p .github/workflows
cp /absolute/path/to/project-facts-kit/template/github/workflows/ai-context-kit-context-check.yml .github/workflows/ai-context-kit-context-check.yml
```

CI 主要做两件事：

```bash
ai-context-kit audit --workspace . --output docs/ai-context-audit-report.md --fail-on-warning
ai-context-kit status --workspace . --json --output docs/ai-context-workspace-status.json --fail-on-warning
```

本地同等检查：

```bash
npm run facts:ci
```

## 8. 什么时候用高级命令

- `ai-context-kit init --workspace .`：`doctor` 或 `quickstart` 提示生成资料 stale，且团队准备按当前仓库状态刷新生成资料。
- `ai-context-kit tokens --workspace . && ai-context-kit dashboard --workspace .`：需要静态 token 节省数字。
- `ai-context-kit codex-mem install-hooks --workspace . --mode observe`：需要 Codex 每轮结束时显示本地 token snapshot。
- `ai-context-kit real-task-audit --workspace .`：已经记录真实任务 A/B，需要检查能否支持“省 token 且质量未下降”的说法。
