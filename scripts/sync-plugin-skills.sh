#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
mode="${1:-sync}"
plugins=(
  "plugins/project-facts-kit"
  "plugins/project-facts-kit-codex"
)
skills=(
  "project-facts-maintainer"
  "low-token-context-maintainer"
)

if [[ "$mode" != "sync" && "$mode" != "--check" ]]; then
  printf 'Usage: %s [--check]\n' "$0" >&2
  exit 2
fi

for plugin in "${plugins[@]}"; do
  for skill in "${skills[@]}"; do
    source_dir="$repo_root/skills/$skill"
    destination_dir="$repo_root/$plugin/skills/$skill"
    if [[ "$mode" == "--check" ]]; then
      if ! diff -qr "$source_dir" "$destination_dir" >/dev/null; then
        printf 'Plugin Skill differs from canonical source: %s\n' "$destination_dir" >&2
        diff -ru "$source_dir" "$destination_dir" >&2 || true
        exit 1
      fi
      continue
    fi
    # Plugin Skill directories are generated mirrors; rebuilding removes stale files.
    rm -rf "$destination_dir"
    mkdir -p "$(dirname "$destination_dir")"
    cp -R "$source_dir" "$destination_dir"
    printf 'Synced %s -> %s\n' "$source_dir" "$destination_dir"
  done
done
