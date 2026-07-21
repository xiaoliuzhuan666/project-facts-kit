#!/usr/bin/env bash
# ai-context-kit.sh
# 注意：禁止通过 npx 回退到 ai-context-kit@latest——npm 上的 ai-context-kit 包名
# 被与本项目无关的第三方占用，本项目 CLI（packages/ai-context-kit）从未发布到 npm，
# 从 npm 拉取的同名包不是本项目的代码。
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

cat >&2 <<'EOF'
ai-context-kit was not found.

Do NOT install it from npm: the ai-context-kit package name on npm is owned by an
unrelated third party, and this project's CLI has never been published there.

Choose one setup method:
1. Run this repository's setup script: scripts/setup-local-kit.sh
2. Clone the kit to ~/.cache/project-facts-kit (see README.md) and run its scripts/setup-local-kit.sh
3. In the project-facts-kit repository, run: npm link
4. Set PROJECT_FACTS_KIT=/absolute/path/to/project-facts-kit
5. Put project-facts-kit under tooling/project-facts-kit in this repository
EOF
exit 1
