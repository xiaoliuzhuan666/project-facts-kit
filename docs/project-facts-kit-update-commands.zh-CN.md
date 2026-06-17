# Project Facts Kit 更新命令速查

这份文档只放可复制命令和对应场景。普通同事优先使用自然语言入口；维护者需要排查或批量处理时，再使用下面的 CLI 命令。

## 本机首次准备或更新 kit

同事第一次使用，或者以后想更新本机 kit，都执行同一条命令：

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

它会做三件事：

1. 没有本地仓库时 clone 到 `~/.cache/project-facts-kit`。
2. 已有干净本地仓库时切到目标分支并执行 `git pull --ff-only`。
3. 执行 `scripts/setup-local-kit.sh`，链接 `ai-context-kit` / `project-facts-kit`，并安装用户级 Codex Skill。

CLI 链接会优先使用 `npm link`；如果 npm 全局目录没有写权限，会改用 `~/.local/bin` 用户级命令链接，并把该目录写入常见 shell 启动文件，保证新开终端可直接使用。已有同名 Skill 会备份成 `*.backup-<timestamp>`。如果本地 kit 目录有未提交修改，会先改名成 `project-facts-kit.dirty-<timestamp>`，再重新 clone；如果不是 Git 仓库，会改名成 `project-facts-kit.non-git-<timestamp>`。如果 GitHub clone 失败，先检查网络、账号权限或 Git 凭据。

只想重新安装本机 CLI / Skill，不更新 Git 仓库时：

```bash
~/.cache/project-facts-kit/scripts/setup-local-kit.sh
```

常用参数：

```bash
~/.cache/project-facts-kit/scripts/setup-local-kit.sh --no-skills
~/.cache/project-facts-kit/scripts/setup-local-kit.sh --copy-skills
~/.cache/project-facts-kit/scripts/setup-local-kit.sh --skip-npm-link
```

## 普通同事在目标项目里的三句入口

本机准备完成后，打开目标业务项目 workspace，对 Agent 说下面三句之一：

```text
帮我做项目事实 kit 首次接入。
帮我做项目事实 kit 已接入升级，不覆盖已有事实。
帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。
```

这三句里面已经包含 Skill 和 CLI。Agent 会根据项目状态选择安装脚本、`onboard`、`upgrade`、`doctor`、`token-status`、`capability actions` 或自动化 prompt。首次接入和已接入升级的结果里必须写明 CodeGraph 状态，以及静态 token 报告、dashboard、observe hooks、真实 session usage 是否可见。

## 新项目首次接入的显式命令

普通使用者推荐说：

```text
帮我做项目事实 kit 首次接入。
```

维护者需要显式执行时，用轻量模式：

```bash
~/.cache/project-facts-kit/scripts/install-project-facts.sh /absolute/path/to/project --lite
```

需要把项目级 Skill 一起放进目标仓库时：

```bash
~/.cache/project-facts-kit/scripts/install-project-facts.sh /absolute/path/to/project \
  --lite \
  --skill-dir /absolute/path/to/project/.codex/skills
```

## 已接入项目升级的显式命令

普通使用者推荐说：

```text
帮我做项目事实 kit 已接入升级，不覆盖已有事实。
```

维护者需要显式执行时：

```bash
~/.cache/project-facts-kit/scripts/install-project-facts.sh /absolute/path/to/project \
  --upgrade-existing \
  --skill-dir /absolute/path/to/project/.codex/skills \
  --refresh-skills
```

如果只想补新版候选模板、最新 `AGENTS` 片段和缺失辅助脚本，不替换项目内 Skill，去掉 `--refresh-skills`：

```bash
~/.cache/project-facts-kit/scripts/install-project-facts.sh /absolute/path/to/project \
  --upgrade-existing \
  --skill-dir /absolute/path/to/project/.codex/skills
```

升级不会覆盖已有 `project.md`、`runtime.md`、`specs/`、`handover/` 和人工维护的 `AGENTS.md`。如果生成了 `project-facts/AGENTS.fragment.latest.md`，只把适合当前项目的内容合并到根 `AGENTS.md`。

## 多仓库 workspace 资料刷新

首次准备或缺工作流材料：

```bash
ai-context-kit onboard --workspace /absolute/path/to/workspace
```

只检查当前状态，不写文件：

```bash
ai-context-kit doctor --workspace /absolute/path/to/workspace
```

已接入 workspace 刷新生成资料：

```bash
ai-context-kit upgrade --workspace /absolute/path/to/workspace
```

生成资料过期，或需要按当前仓库状态重建 maps、reports、indexes：

```bash
ai-context-kit init --workspace /absolute/path/to/workspace
```

只生成缺失的流程材料：

```bash
ai-context-kit repair --workspace /absolute/path/to/workspace
```

根包入口等价：

```bash
project-facts-kit context onboard --workspace /absolute/path/to/workspace
project-facts-kit context doctor --workspace /absolute/path/to/workspace
project-facts-kit context upgrade --workspace /absolute/path/to/workspace
project-facts-kit context repair --workspace /absolute/path/to/workspace
project-facts-kit context init --workspace /absolute/path/to/workspace
```

## token 与编辑器任务刷新

静态 token 测量：

```bash
ai-context-kit tokens --workspace /absolute/path/to/workspace
```

从最新报告生成 dashboard：

```bash
ai-context-kit dashboard --workspace /absolute/path/to/workspace
```

给终端或 Agent 输出短状态：

```bash
ai-context-kit token-status --workspace /absolute/path/to/workspace
```

给 IDE 面板或团队脚本输出 JSON：

```bash
ai-context-kit token-status --workspace /absolute/path/to/workspace --json --output docs/ai-context-token-status.json
```

生成或合并 VS Code 兼容任务：

```bash
ai-context-kit editor-tasks --workspace /absolute/path/to/workspace
```

## 每日 Skill 反哺候选

普通使用者推荐说：

```text
帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。
```

维护者需要显式生成业务项目候选任务 prompt：

```bash
ai-context-kit automation-prompt --workspace /absolute/path/to/workspace --type skill-feedback-candidate
```

共享 Skill 仓库评审任务 prompt：

```bash
ai-context-kit automation-prompt --workspace /absolute/path/to/project-facts-kit --type skill-feedback-review
```

`automation-prompt` 只输出提示词，不创建任务，不改共享 Skill。Codex app automation 可用时，由 Agent 根据输出创建或更新定时任务。

## CodeGraph 按需更新

只有 `doctor` 提示复杂仓库建议使用，或者当前任务确实需要符号级查询时，再按仓库启用：

```bash
ai-context-kit codegraph --workspace /absolute/path/to/workspace --repos repo-name
```

不要把 `.codegraph/` 提交到业务仓库。

## 接入或升级后必须汇报的状态

`ai-context-kit onboard` 和 `ai-context-kit upgrade` 会输出 `capability actions`。Agent 给用户的结果要包含：

- CodeGraph：`skip`、`missing_cli`、`recommended` 或 `initialized`，以及需要时的安装或初始化命令。
- 静态 token：`docs/ai-context-token-savings-measurement.md` 和 `docs/ai-context-token-dashboard.md` 是否存在；缺失时给出 `tokens && dashboard && token-status` 命令。
- 真实任务 token：observe hooks 是否启用，`docs/codex-session-usage.md` 是否生成；缺失时给出 `codex-mem install-hooks --mode observe` 或 `codex-mem sessions` 命令。
- 哪些命令已经执行，哪些只是建议。

## 维护本仓库时的提交前检查

修改本仓库制度、模板、Skill、插件或 CLI 后执行：

```bash
./scripts/check-kit.sh
git diff --check
node --check packages/ai-context-kit/bin/ai-context-kit.mjs
skills-ref validate skills/project-facts-maintainer
skills-ref validate skills/low-token-context-maintainer
python3 /Users/xiaoliuzhuan/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/project-facts-kit-codex
```

如果本机没有 `skills-ref` 或 Codex plugin 校验脚本，要在交付说明里写明未验证。
