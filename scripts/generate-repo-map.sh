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
  if command -v tree >/dev/null 2>&1; then
    (cd "$TARGET_DIR" && tree -d -L 3 -I 'node_modules|.git|dist|build|coverage|.gemini|cert' .)
  else
    find "$TARGET_DIR" -maxdepth 3 -type d \
      ! -path '*/.*' \
      ! -path '*node_modules*' \
      ! -path '*dist*' \
      ! -path '*build*' \
      ! -path '*coverage*' \
      ! -path '*cert*' \
      | sed "s|$TARGET_DIR|.|"
  fi

  printf '\n## Key Code Symbols\n'

  # 优先采用 ctags 提取符号大纲
  if command -v ctags >/dev/null 2>&1; then
    printf '# Using ctags to extract key symbols...\n'
    # 查找主要的代码文件
    find "$TARGET_DIR" -type f \
      \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.cpp" -o -name "*.h" -o -name "*.c" \) \
      ! -path '*/node_modules/*' \
      ! -path '*/.*' \
      ! -path '*/dist/*' \
      ! -path '*/build/*' \
      ! -path '*/cert/*' \
      ! -path '*/coverage/*' \
      | xargs ctags -f - --fields=+n --excmd=number 2>/dev/null \
      | awk '{print $1 " (" $4 ":" $3 ")"}' \
      || printf 'Ctags extraction completed with warnings.\n'
  else
    printf '# [Notice] ctags not found on system. Falling back to key files list.\n'
    printf "# To get rich symbol indexes, please install universal-ctags (e.g. 'brew install universal-ctags').\n\n"
    # 列出关键代码文件
    find "$TARGET_DIR" -type f \
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
      | sed "s|$TARGET_DIR/||" \
      | sort \
      | sed 's/^/- /'
  fi
} > "$OUTPUT_FILE"

printf 'Repo Map successfully generated at: %s\n' "$OUTPUT_FILE"
