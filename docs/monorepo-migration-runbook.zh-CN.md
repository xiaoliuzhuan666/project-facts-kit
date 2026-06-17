# 多仓库迁移为 monorepo 实操 runbook

整理日期：2026-06-12

## 目的

这份 runbook 用于把同一业务平台下的多个独立 Git 仓库迁移为一个父级 monorepo，并同步更新项目事实、Agent 指令和上下文索引。

它适合放在 `project-facts-kit`，因为它不是某个项目的业务规则，而是一套可复用的工程操作流程：从是否该迁、迁移前保护、迁移执行、文档同步到验证证据，都可以被下一个项目照着检查。

## 适用场景

适合迁移为 monorepo 的情况：

- 后端、后台、小程序、H5、部署脚本和跨端文档属于同一业务系统。
- 一个功能经常同时修改多个端。
- 父目录已经沉淀了接口契约、排查文档、发布脚本或 Agent 指令。
- 团队希望 clone 一个仓库就能拿到完整业务平台。
- 新远端仓库语义是平台级，例如 `shop-platform.git`。

不适合迁移的情况：

- 各仓库由不同团队独立维护，权限必须隔离。
- 某个子项目不能被同一批成员看到。
- 发布、审计、合规要求必须保持独立仓库。
- 仍需要长期把子项目独立推送到不同远端。
- 当前工作区存在未处理的敏感文件，且无法判断是否可以进入新仓库。

## 方案判断

| 方案 | 适合情况 | 注意点 |
| --- | --- | --- |
| monorepo | 多端属于同一业务平台，跨端改动频繁 | 需要统一 `.gitignore`、CI/CD 和文档 |
| 多仓库 | 团队、权限、发布完全独立 | 跨端历史分散，父目录资料容易游离于 Git 外 |
| 父仓库 + submodule | 父仓库只记录各子仓库组合版本 | 日常操作复杂，需要维护 submodule 指针 |
| subtree | 想把外部仓库并入父仓库，并保留同步能力 | 同步命令复杂，历史体积会变大 |
| worktree | 同一仓库多个分支并行工作 | 不是项目组织方案，不能替代 monorepo |

## 迁移原则

- 先保护旧仓库，再移动 `.git`。
- 旧远端不作为日常 push/pull 目标，只作为归档参考。
- 父目录文档必须同步改成 monorepo 视角。
- 本地备份、构建产物、依赖目录、下载包、运行配置和密钥默认不进新仓库。
- 旧仓库已跟踪但疑似敏感的文件必须人工判定，不能因为历史上已跟踪就自动继续提交。
- 报告完成前必须验证本地分支、远端分支、关键文件和忽略规则。

## 迁移前检查

确认当前位置：

```bash
pwd
find . -maxdepth 3 \( -name .git -o -name .gitmodules -o -name .gitignore \) -print
```

检查每个旧子仓库的 remote、分支和工作区状态：

```bash
for d in <child-a> <child-b> <child-c>; do
  if [ -d "$d/.git" ]; then
    printf '\n[%s]\n' "$d"
    git -C "$d" remote -v
    git -C "$d" branch --show-current
    git -C "$d" status --short
  fi
done
```

检查新远端是否为空或已有内容：

```bash
git ls-remote --heads --tags <new-platform-repo-url>
```

如果远端已有分支，先判断是空初始化、历史仓库，还是他人已在使用。不要直接覆盖。

## 敏感文件和产物检查

迁移前先查出可能不该进仓库的文件：

```bash
find . \
  \( -path '*/.git' -o -path '*/node_modules' -o -path '*/target' -o -path '*/dist' -o -path '*/unpackage' \) -prune -o \
  -type f \
  \( -name '.env*' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.jks' -o -name '*secret*' -o -name '*credential*' -o -name '*token*' -o -name '*password*' \) \
  -print
```

常见处理方式：

- 明确是源码、DTO、OAuth token 类名等正常文件：可以提交。
- 明确是运行配置、证书、私钥、下载备份、客户配置：不要提交。
- 旧仓库已跟踪但可能含环境参数：先人工读内容或交给负责人确认。
- 需要保留结构但不能保留真实值：改为模板文件，例如 `.env.example`、`application-example.yaml`。

## 备份旧仓库历史

先生成 Git bundle，并验证可用：

```bash
ts=$(date +%Y%m%d-%H%M%S)
backup_dir=".git-subrepo-backups/$ts"
mkdir -p "$backup_dir"

for d in <child-a> <child-b> <child-c>; do
  git -C "$d" bundle create "../$backup_dir/$d.bundle" --all
  git -C "$d" bundle verify "../$backup_dir/$d.bundle"
done
```

bundle 用于恢复旧 Git 历史。需要保留旧 `.git/config`、remote 和本地分支时，再移动整个 `.git` 目录：

```bash
for d in <child-a> <child-b> <child-c>; do
  mv "$d/.git" "$backup_dir/$d.gitdir"
done
```

此处是移动，不是删除。确认迁移和新仓库都可用后，再由负责人决定备份保留多久。

## 建立父级仓库

在父目录创建统一 `.gitignore`。至少包含：

```gitignore
.DS_Store
.idea/
.vscode/
*.log

node_modules/
target/
dist/
dist-prod/
unpackage/
.gradle/

.env
.env.*
*.pem
*.key
*.p12
*.jks
**/src/main/resources/cert/

.git-subrepo-backups/
.codex-mem/
.codex-upstream-sync/
.playwright-mcp/
downloads/
```

不要写过宽规则，例如直接忽略 `*token*`、`*password*`。这会误伤正常源码，例如 OAuth token 类、Password 组件、Token API。

初始化父级仓库并关联新远端：

```bash
git init -b master
git remote add origin <new-platform-repo-url>
git remote -v
```

## 暂存与提交

先加入文件，再检查暂存区：

```bash
git add .
git status --short --ignored=matching --untracked-files=all
git diff --cached --name-only | wc -l
```

重点查不该进入仓库的内容：

```bash
git diff --cached --name-only | rg '(^|/)(\.git|node_modules|target|dist|dist-prod|unpackage|downloads|\.git-subrepo-backups)|\.pem$|\.key$|\.p12$|\.jks$|secret|credential|password'
```

如果某些旧仓库已跟踪的配置文件需要保留，先确认内容，再用 `git add -f <path>` 单独加入。不要批量强制加入所有忽略文件。

提交：

```bash
git commit -m "Initialize platform monorepo"
```

推送：

```bash
git push -u origin master
```

## 文档同步

迁移后必须更新父目录文档，否则后续 Agent 和维护者会继续按旧多仓库方式操作。

建议更新：

- `AGENTS.md`
- `docs/ai-context-workspace-map.md`
- `docs/ai-context-scope-report.md`
- monorepo 方案说明文档
- 相关 `project-facts/project.md`、`verification.md` 或交接文件

文档应写清楚：

- 父目录现在是唯一 Git 仓库。
- 日常 remote 是新的平台仓库。
- 原来的子仓库目录现在是普通子项目目录。
- 旧仓库地址只作为归档参考，不作为日常 push/pull 目标。
- 本地旧 `.git` 备份目录在哪里，是否进入 Git。
- CodeGraph、上下文索引和任务路由仍按子项目目录选择，不对父目录全量初始化。

## 验证清单

迁移完成前至少执行：

```bash
git status --short --branch
git rev-parse HEAD
git ls-remote --heads origin master
find . -maxdepth 3 \( -name .git -o -name '*.gitdir' \) -print | sort
```

检查关键文件是否被父仓库管理：

```bash
for p in AGENTS.md <child-a>/package.json <child-b>/pom.xml <child-c>/package.json; do
  git ls-files --error-unmatch "$p" >/dev/null && echo "tracked $p"
done
```

检查敏感和产物是否仍被忽略：

```bash
for p in .git-subrepo-backups downloads .env node_modules target dist unpackage; do
  git check-ignore -v "$p" || true
done
```

可选但推荐的验证：

- 新目录临时 clone 一次，确认目录结构完整。
- 按项目类型执行构建或测试。
- 如果迁移影响发布脚本，执行一次 dry-run 或等价检查。
- 如果 CI/CD 已存在，确认路径触发规则已经改为 monorepo 目录规则。

没有执行的检查必须写为 `Not run`。

## 回退方式

如果还没有推送，通常可以删除父级 `.git`，再把备份的旧 `.git` 放回子目录：

```bash
rm -rf .git
for d in <child-a> <child-b> <child-c>; do
  mv ".git-subrepo-backups/<timestamp>/$d.gitdir" "$d/.git"
done
```

如果已经推送到新远端，不要直接改远端历史。先保留新仓库现状，通知团队暂停基于新仓库的提交，再决定是新建修正提交、重建远端，还是继续使用旧多仓库。

如果只需要查旧历史，可以从 bundle 临时 clone：

```bash
git clone .git-subrepo-backups/<timestamp>/<child>.bundle /tmp/<child>-restore
```

## 常见问题

### 能不能把三个旧仓库的 origin 都改成同一个新地址？

不建议。这样会让三个互不相干的 Git 历史共用一个远端，分支和根目录容易混乱，父目录文档和脚本仍无法被统一管理。

### worktree 能替代 monorepo 吗？

不能。worktree 解决的是同一个仓库多分支并行工作，不是多个项目统一管理。monorepo 建好后，worktree 可以作为多分支工作方式使用。

### 旧仓库远端要不要删除？

不要马上删除。推荐先改成归档或只读，保留一段时间用于查历史和恢复。日常开发只使用新父仓库 remote。

### 旧仓库历史要不要导入 monorepo？

有审计或追溯要求时，可以考虑用 subtree、filter-repo 等工具导入历史。多数业务项目若只需要当前状态，先以当前工作区作为 monorepo 初始提交更简单。无论哪种方式，都要保留 bundle 备份和迁移记录。

## 项目事实记录建议

这类迁移不是业务功能变化，但会影响维护方式、发布路径和团队协作。建议在目标项目记录：

| 记录 | 建议内容 |
| --- | --- |
| `project-facts/project.md` | 仓库结构、唯一 remote、子项目目录 |
| `project-facts/iteration-plan.md` | 当前迁移任务、负责人、状态 |
| `project-facts/handover/current.md` | 新工作入口、旧仓库归档位置、未执行验证 |
| `docs/` | monorepo 方案说明、迁移验证结果 |
| `AGENTS.md` | 任务路由、禁读路径、CodeGraph 使用规则 |

如果迁移同时改变 CI/CD、部署脚本、权限或发布流程，需要新增变更记录，并写明实际验证结果。
