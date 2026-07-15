# 团队快速使用

本文对应 `ai-context-kit 0.3.60`。命令以 `ai-context-kit --help` 的实际输出为准，不把设计文档中的待实现命令当作现有能力。

## 1. 准备本机工具

团队统一从 kit 仓库安装 CLI 和用户级 Skill：

```bash
~/.cache/project-facts-kit/scripts/setup-local-kit.sh
ai-context-kit --version
```

没有本地 kit 时，按 [Project Facts Kit 更新命令速查](project-facts-kit-update-commands.zh-CN.md) 获取远端仓库。也可以在 kit 根目录运行 `npm link`。这些操作只准备本机工具，不修改业务项目。

日常项目操作只记两条：

```bash
# 未接入项目
~/.cache/project-facts-kit/scripts/install-project-facts.sh . --lite && ai-context-kit onboard -w .

# 已接入项目
ai-context-kit upgrade -w .
```

下面的 `inspect`、安装器和单项命令用于审查、定制或排查，不是每次接入与升级都要依次执行。

## 2. 零写入检查

接触新项目时，先确认仓库结构和已有规范：

```bash
ai-context-kit inspect --workspace /absolute/path/to/target-project
ai-context-kit inspect --workspace /absolute/path/to/target-project --json
```

`inspect` 只输出到 stdout，报告写入数固定为 `0`，并显示 `source scan: skipped`。它通过根级标记识别 Git 仓库和技术类型，不读取实现源码；同时识别已有的 `AGENTS.md`、`project-facts/`、OpenSpec、Spec Kit、MADR、Backstage、Continue rules 和 CODEOWNERS。需要保存结果时使用 shell 重定向，不使用 `--output`。

## 3. 安装项目事实模板

历史项目建议使用轻量模板：

```bash
/absolute/path/to/project-facts-kit/scripts/install-project-facts.sh \
  /absolute/path/to/target-project \
  --lite
```

默认只写 `project-facts/` 和 `project-facts/AGENTS.fragment.md`，不会修改根 `AGENTS.md`，也不会向目标仓库的 `scripts/` 写 helper。把片段中适合当前项目的规则人工合并到根 `AGENTS.md`。

需要随项目分发 Skill 时显式指定目录：

```bash
/absolute/path/to/project-facts-kit/scripts/install-project-facts.sh \
  /absolute/path/to/target-project \
  --lite \
  --skill-dir /absolute/path/to/target-project/.codex/skills
```

只有目标项目确实需要 `generate-repo-map.sh` 和 `sync-skills.sh` 时才启用：

```bash
/absolute/path/to/project-facts-kit/scripts/install-project-facts.sh \
  /absolute/path/to/target-project \
  --lite \
  --with-helper-scripts
```

持续维护变更、决策和 GitHub 审阅模板的项目可以去掉 `--lite`。安装器遇到已有 `project-facts/`、同名 Skill 或显式安装的同名 helper 时会拒绝覆盖。

## 4. 生成或刷新上下文资料

允许工具创建缺失资料后运行：

```bash
ai-context-kit onboard --workspace /absolute/path/to/workspace
```

`onboard` 只生成缺失的工作流资料，然后输出 `doctor`、`token-status` 和 `capability actions`。常用维护命令：

```bash
ai-context-kit doctor --workspace /absolute/path/to/workspace
ai-context-kit repair --workspace /absolute/path/to/workspace
ai-context-kit upgrade --workspace /absolute/path/to/workspace
ai-context-kit init --workspace /absolute/path/to/workspace
```

| 命令 | 写入行为 |
| --- | --- |
| `inspect` | 零写入，识别已有规范和仓库 |
| `doctor` | 零写入，报告资料和能力状态 |
| `repair` | 只创建缺失资料；`--force` 仅刷新工具拥有的文件 |
| `onboard` | 执行缺失资料生成并打印状态 |
| `upgrade` | 刷新带 ownership marker 的生成资料并打印状态 |
| `init` | 重新生成当前工具拥有的 maps、reports 和 indexes |

默认路径下的生成 Markdown 带 `<!-- generated-by: ai-context-kit -->`，JSON、JSONL、hook 脚本和 `.gitignore` 也有各自的归属标记。固定文件名且匹配严格历史签名的旧生成 Markdown 可在升级时补上 marker；其他同名文件即使使用 `--force` 也不会覆盖。显式 `--output` 表示调用者已经选择目标文件。

## 5. 日常查询与测量

```bash
ai-context-kit contracts --workspace /absolute/path/to/workspace --query "/api/orders"
ai-context-kit token-status --workspace /absolute/path/to/workspace
ai-context-kit real-task-audit --workspace /absolute/path/to/workspace
```

跨端任务从 `contracts` 命中的页面、API wrapper、Controller/handler、DTO、Service、Mapper 和验证命令继续读源码。生成索引是导航资料，不是业务批准来源。

静态 token 测量按需运行：

```bash
ai-context-kit tokens --workspace /absolute/path/to/workspace
ai-context-kit dashboard --workspace /absolute/path/to/workspace
ai-context-kit token-status --workspace /absolute/path/to/workspace --json \
  --output docs/ai-context-token-status.json
```

`tokens` 使用固定的 `repomix@1.16.1`，保留 Repomix 默认安全扫描。缺少 `npx` 或工具执行失败时记录 `Not run`，不要把未生成的数字写成测量结果。

## 6. Codex Plugin

Plugin 只分发两个 Skill，不会自动修改业务项目：

```bash
codex plugin marketplace add /absolute/path/to/project-facts-kit
codex plugin marketplace list
```

重启 Codex 后安装 `Project Facts Kit`。正式项目事实仍存放在目标项目，由 owner 和 PR reviewer 审阅。

## 7. 版本控制边界

审阅后可以提交：

- 人工维护的 `AGENTS.md` 和已填写的 `project-facts/`。
- 已检查的 `docs/ai-context-workspace-map.md`、契约索引和范围报告。
- 团队确实需要的 CI workflow 和 repo-scoped Skill。

不要提交：

- `.codex-mem/ledger.jsonl`、`.codex-mem/refs/` 和 `.codegraph/`。
- 临时 Repomix 输出、本机 usage 日志和个人绝对路径。
- `.env*`、私钥、token、密码或未经审阅的运行日志。

## 8. CI 报告

仓库提供 [ai-context-kit-context-check.yml](../template/github/workflows/ai-context-kit-context-check.yml)。复制前确认 CI 使用的 npm registry 已有 `ai-context-kit@0.3.60`，或把 `AI_CONTEXT_KIT_PACKAGE` 改为团队内部包名。

当前 workflow 执行 `inspect`、`doctor` 和 `token-status`，报告写到 runner 的 `/tmp` 后上传 artifact，不修改 checkout。它用于暴露状态，不提供 warning gate。

## 9. 当前未实现的命令

`0.3.60` 没有以下 CLI：

- `ai-context-kit install`
- `ai-context-kit quickstart`
- `ai-context-kit audit`
- `ai-context-kit status`

也没有 `--inject-package-scripts`、`--with-ci` 或 `--fail-on-warning`。模板安装使用 `scripts/install-project-facts.sh`，首次资料生成使用 `onboard`，状态使用 `doctor` 和 `token-status`，真实任务证据检查使用 `real-task-audit`。
