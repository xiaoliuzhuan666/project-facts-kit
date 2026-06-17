#!/usr/bin/env bash
set -euo pipefail

if command -v ai-context-kit >/dev/null 2>&1; then
  exec ai-context-kit "$@"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

candidates=()
if [[ -n "${PROJECT_FACTS_KIT:-}" ]]; then
  candidates+=("$PROJECT_FACTS_KIT/packages/ai-context-kit/bin/ai-context-kit.mjs")
fi
candidates+=(
  "$project_root/tooling/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs"
  "$project_root/vendor/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs"
  "$project_root/project-facts-kit/packages/ai-context-kit/bin/ai-context-kit.mjs"
  "$project_root/packages/ai-context-kit/bin/ai-context-kit.mjs"
)

for candidate in "${candidates[@]}"; do
  if [[ -f "$candidate" ]]; then
    exec node "$candidate" "$@"
  fi
done

if command -v npx >/dev/null 2>&1; then
  exec npx -y ai-context-kit@latest "$@"
fi

cat >&2 <<'EOF'
ai-context-kit was not found.

Choose one setup method:
1. In the project-facts-kit repository, run: npm link
2. Set PROJECT_FACTS_KIT=/absolute/path/to/project-facts-kit
3. Put project-facts-kit under tooling/project-facts-kit in this repository
4. Publish/install ai-context-kit so npx can resolve ai-context-kit@latest
EOF
exit 1
