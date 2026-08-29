#!/usr/bin/env bash
# generate-repo-map.sh
# 作用：自动为 AI 提取项目的轻量级文件大纲与符号索引，生成 project-facts/repo_map.txt，帮助模型在不撑爆上下文的前提下定位文件。

set -euo pipefail

# 确定 target 目录
TARGET_DIR="${1:-.}"
if [[ ! -d "$TARGET_DIR" ]]; then
  printf 'Error: Target directory %s does not exist.\n' "$TARGET_DIR" >&2
  exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"
OUTPUT_FILE="$TARGET_DIR/project-facts/repo_map.txt"

# 确保 project-facts 目录存在
mkdir -p "$(dirname "$OUTPUT_FILE")"

printf '=== Generating Repo Map for %s ===\n' "$TARGET_DIR"
{
  printf '# Repository Map & Code Index\n'
  printf '# Generated at: %s\n' "$(date)"
  printf '# Use this map to locate files and symbols before reading code full-texts.\n\n'
  printf '## Directory Outline\n'

  # 获取仓库结构，过滤掉无关目录
  # 如果支持 tree，用 tree；否则用 find 模拟
  # 统一先 cd 进目标目录用相对路径输出，避免把 $TARGET_DIR 内插进 sed 表达式
  #（路径含 | [ \ * 等 sed 元字符时会破坏表达式）。
  if command -v tree >/dev/null 2>&1; then
    (cd "$TARGET_DIR" && tree -d -L 3 -I 'node_modules|.git|dist|build|coverage|.gemini|cert' .)
  else
    (cd "$TARGET_DIR" && find . -maxdepth 3 -type d \
      ! -path '*/.*' \
      ! -path '*node_modules*' \
      ! -path '*dist*' \
      ! -path '*build*' \
      ! -path '*coverage*' \
      ! -path '*cert*')
  fi

  printf '\n## Key Code Symbols\n'

  # 探测 ctags 是否为 Universal Ctags：macOS 自带的 /usr/bin/ctags 是 BSD 版，
  # 不支持 --fields=+n --excmd=number 等长选项，走 ctags 分支只会产出空符号节。
  ctags_supports_required_options() {
    command -v ctags >/dev/null 2>&1 || return 1
    ctags --version 2>/dev/null | grep -qi 'Universal Ctags'
  }

  # 优先采用 ctags 提取符号大纲
  if ctags_supports_required_options; then
    printf '# Using ctags to extract key symbols...\n'
    # 查找主要的代码文件。-print0/-0 防止路径含空格时 xargs 拆词；
    # ctags 输出为 Tab 分隔：name<TAB>file<TAB>line;"<TAB>kind<TAB>...，
    # 按 Tab 分列取“符号 (文件:行号)”。
    (cd "$TARGET_DIR" && find . -type f \
      \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.cpp" -o -name "*.h" -o -name "*.c" \) \
      ! -path '*/node_modules/*' \
      ! -path '*/.*' \
      ! -path '*/dist/*' \
      ! -path '*/build/*' \
      ! -path '*/cert/*' \
      ! -path '*/coverage/*' \
      -print0 \
      | xargs -0 ctags -f - --fields=+n --excmd=number 2>/dev/null \
      | awk -F'\t' '!/^!/ {line=$3; sub(/;".*$/, "", line); print $1 " (" $2 ":" line ")"}') \
      || printf 'Ctags extraction completed with warnings.\n'
  else
    printf '# [Notice] Universal Ctags not found on system. Falling back to key files list.\n'
    printf "# To get rich symbol indexes, please install universal-ctags (e.g. 'brew install universal-ctags').\n\n"
    # 列出关键代码文件
    (cd "$TARGET_DIR" && find . -type f \
      \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.cpp" -o -name "*.h" -o -name "*.c" -o -name "*.md" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" \) \
      ! -path '*/node_modules/*' \
      ! -path '*/.*' \
      ! -path '*/dist/*' \
      ! -path '*/build/*' \
      ! -path '*/cert/*' \
      ! -path '*/coverage/*' \
      ! -name 'application*.yml' \
      ! -name 'application*.yaml' \
      ! -iname '*secret*' \
      ! -iname '*credential*' \
      ! -iname '*token*' \
      | sed 's|^\./||' \
      | sort \
      | sed 's/^/- /')
  fi
} > "$OUTPUT_FILE"

printf 'Repo Map successfully generated at: %s\n' "$OUTPUT_FILE"
