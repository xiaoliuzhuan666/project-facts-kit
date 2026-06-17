#!/usr/bin/env bash
# sync-skills.sh
# 作用：同步团队共享的 Skill，并自动将 AI 开发规则应用（软链接）到本地 VS Code 和 Codex 可识别的配置文件中。

set -euo pipefail

TARGET_DIR="${1:-.}"
if [[ ! -d "$TARGET_DIR" ]]; then
  printf 'Error: Target directory %s does not exist.\n' "$TARGET_DIR" >&2
  exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"
FACT_DIR="$TARGET_DIR/project-facts"

if [[ ! -d "$FACT_DIR" ]]; then
  printf 'Error: project-facts directory not found in %s. Please run install script first.\n' "$TARGET_DIR" >&2
  exit 1
fi

printf '=== Syncing Skills & AI Configuration for %s ===\n' "$TARGET_DIR"

# 1. 确保根目录下的 AGENTS.md 包含 project-facts 规则
AGENTS_FILE="$TARGET_DIR/AGENTS.md"
FRAGMENT_FILE="$FACT_DIR/AGENTS.fragment.md"

if [[ -f "$FRAGMENT_FILE" ]]; then
  if [[ ! -f "$AGENTS_FILE" ]]; then
    printf 'Creating root AGENTS.md from fragment...\n'
    cp "$FRAGMENT_FILE" "$AGENTS_FILE"
  else
    # 检查是否已包含
    if ! grep -q "project-facts/" "$AGENTS_FILE"; then
      printf 'Existing AGENTS.md does not include project-facts rules. Not modifying it automatically; review %s and merge manually.\n' "$FRAGMENT_FILE"
    else
      printf 'Root AGENTS.md already contains project-facts rules. Skipping merge.\n'
    fi
  fi
fi

# 2. 为 VS Code 相关的 AI 插件创建本地规则软链接
# 针对 GitHub Copilot (.copilotinstructions), Cursor (.cursorrules), Roo-Cline (.clinerules)
RULES_TO_LINK=(
  ".copilotinstructions"
  ".cursorrules"
  ".clinerules"
)

# 在 $TARGET_DIR 下创建指向 AGENTS.md 的软链接
for rule_file in "${RULES_TO_LINK[@]}"; do
  dest_path="$TARGET_DIR/$rule_file"
  if [[ -L "$dest_path" ]]; then
    printf 'Symlink %s already exists. Skipping.\n' "$rule_file"
  elif [[ -f "$dest_path" ]]; then
    printf 'Warning: A regular file %s already exists. Not overwriting it.\n' "$rule_file"
  else
    printf 'Creating symlink %s -> AGENTS.md...\n' "$rule_file"
    ln -s "AGENTS.md" "$dest_path"
  fi
done

# 3. 为 Codex 等工具同步本地的 Skill
# 假设本地团队的 Skill 保存在 project-facts/skills/
# 需要同步到本地的根目录 .codex/skills/ 目录下
LOCAL_SKILL_SRC="$FACT_DIR/skills"
CODEX_SKILL_DEST="$TARGET_DIR/.codex/skills"

if [[ -d "$LOCAL_SKILL_SRC" ]]; then
  # 确保目标路径存在
  mkdir -p "$CODEX_SKILL_DEST"
  printf 'Syncing shared skills to .codex/skills/...\n'

  # 遍历本地的技能
  for skill_dir in "$LOCAL_SKILL_SRC"/*; do
    if [[ -d "$skill_dir" ]]; then
      skill_name="$(basename "$skill_dir")"
      target_skill_path="$CODEX_SKILL_DEST/$skill_name"

      if [[ -e "$target_skill_path" ]]; then
        printf 'Skill %s already exists in .codex/skills/. Not overwriting it.\n' "$skill_name"
        continue
      fi

      # 创建相对路径软链接
      printf ' Linking skill: %s\n' "$skill_name"
      ln -s "../../project-facts/skills/$skill_name" "$target_skill_path"
    fi
  done
else
  printf 'No shared skills found in project-facts/skills/. Skipping Skill sync.\n'
fi

printf '=== Sync Completed Successfully! ===\n'
