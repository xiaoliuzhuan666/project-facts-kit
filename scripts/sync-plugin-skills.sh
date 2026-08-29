#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
mode="${1:-sync}"
plugins=(
  "plugins/project-facts-kit"
  "plugins/project-facts-kit-codex"
)
# 动态枚举 skills/ 下的全部 Skill 目录：硬编码列表会在新增 Skill 时静默漏同步、漏检查。
skills=()
for skill_dir in "$repo_root/skills"/*/; do
  [[ -d "$skill_dir" ]] || continue
  skills+=("$(basename "$skill_dir")")
done
if [[ "${#skills[@]}" -eq 0 ]]; then
  printf 'No skill directories found under %s\n' "$repo_root/skills" >&2
  exit 1
fi

if [[ "$mode" != "sync" && "$mode" != "--check" ]]; then
  printf 'Usage: %s [--check]\n' "$0" >&2
  exit 2
fi

for plugin in "${plugins[@]}"; do
  for skill in "${skills[@]}"; do
    source_dir="$repo_root/skills/$skill"
    destination_dir="$repo_root/$plugin/skills/$skill"
    if [[ ! -d "$source_dir" ]]; then
      printf 'Canonical skill source missing: %s\n' "$source_dir" >&2
      exit 1
    fi
    if [[ "$mode" == "--check" ]]; then
      if ! diff -qr "$source_dir" "$destination_dir" >/dev/null; then
        printf 'Plugin Skill differs from canonical source: %s\n' "$destination_dir" >&2
        diff -ru "$source_dir" "$destination_dir" >&2 || true
        exit 1
      fi
      continue
    fi
    # Plugin Skill directories are generated mirrors; rebuild atomically so an
    # interrupted copy never leaves a half-deleted mirror behind.
    staging_dir="$(mktemp -d "$repo_root/$plugin/skills/.sync-$skill.XXXXXX")"
    cp -R "$source_dir/." "$staging_dir/"
    rm -rf "$destination_dir"
    mv "$staging_dir" "$destination_dir"
    printf 'Synced %s -> %s\n' "$source_dir" "$destination_dir"
  done
done
