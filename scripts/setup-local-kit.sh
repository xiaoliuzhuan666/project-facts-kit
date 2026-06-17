#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage: setup-local-kit.sh [--skill-dir <directory>] [--no-skills] [--copy-skills] [--skip-npm-link]

Prepare this machine to use Project Facts Kit from a cloned repository.

Options:
  --skill-dir <directory>  Codex skill directory. Default: $CODEX_HOME/skills or ~/.codex/skills.
  --no-skills             Do not install user-level Codex skills.
  --copy-skills           Copy skills instead of symlinking them to this repository.
  --skip-npm-link         Do not install ai-context-kit / project-facts-kit CLI links.
  -h, --help              Show this help.
USAGE
}

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
skill_dir="${CODEX_HOME:-$HOME/.codex}/skills"
install_skills=1
skill_mode="symlink"
run_npm_link=1
user_bin="${HOME:-}/.local/bin"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skill-dir)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        printf '%s\n' '--skill-dir requires a directory.' >&2
        exit 1
      fi
      skill_dir="$2"
      shift 2
      ;;
    --no-skills)
      install_skills=0
      shift
      ;;
    --copy-skills)
      skill_mode="copy"
      shift
      ;;
    --skip-npm-link)
      run_npm_link=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      usage
      exit 1
      ;;
  esac
done

skill_names=(
  "project-facts-maintainer"
  "low-token-context-maintainer"
)

timestamp="$(date +%Y%m%d%H%M%S)-$$"

install_skill() {
  local name="$1"
  local src="$repo_root/skills/$name"
  local dest="$skill_dir/$name"

  if [[ ! -s "$src/SKILL.md" ]]; then
    printf 'Missing source skill: %s\n' "$src" >&2
    exit 1
  fi

  if [[ -e "$dest" || -L "$dest" ]]; then
    if [[ "$skill_mode" == "symlink" && -L "$dest" && "$(readlink "$dest")" == "$src" ]]; then
      printf 'Skill already points to this kit: %s\n' "$dest"
      return
    fi

    local backup="$dest.backup-$timestamp"
    mv "$dest" "$backup"
    printf 'Backed up existing skill: %s -> %s\n' "$dest" "$backup"
  fi

  if [[ "$skill_mode" == "copy" ]]; then
    cp -R "$src" "$dest"
  else
    ln -s "$src" "$dest"
  fi

  printf 'Installed skill: %s\n' "$dest"
}

shell_path_files() {
  local files=()

  case "${SHELL:-}" in
    *zsh*)
      files+=("$HOME/.zshrc" "$HOME/.zprofile")
      ;;
    *bash*)
      files+=("$HOME/.bashrc" "$HOME/.bash_profile")
      ;;
  esac

  for file in "$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
    if [[ -e "$file" ]]; then
      files+=("$file")
    fi
  done

  if [[ "${#files[@]}" -eq 0 ]]; then
    case "$(uname -s 2>/dev/null || true)" in
      Darwin)
        files+=("$HOME/.zshrc" "$HOME/.zprofile")
        ;;
      *)
        files+=("$HOME/.profile")
        ;;
    esac
  fi

  local seen="|"
  for file in "${files[@]}"; do
    case "$seen" in
      *"|$file|"*) ;;
      *)
        printf '%s\n' "$file"
        seen="$seen$file|"
        ;;
    esac
  done
}

configure_user_path() {
  local wrote=0
  local configured=0
  local file

  while IFS= read -r file; do
    [[ -n "$file" ]] || continue
    mkdir -p "$(dirname "$file")"

    if [[ -e "$file" ]] && {
      grep -Fq '# >>> project-facts-kit PATH >>>' "$file" ||
      grep -Fq '$HOME/.local/bin' "$file" ||
      grep -Fq "$user_bin" "$file"
    }; then
      configured=1
      continue
    fi

    cat >> "$file" <<'EOF'

# >>> project-facts-kit PATH >>>
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) export PATH="$HOME/.local/bin:$PATH" ;;
esac
# <<< project-facts-kit PATH <<<
EOF
    printf 'Configured CLI PATH in shell startup file: %s\n' "$file"
    wrote=1
  done < <(shell_path_files)

  case ":$PATH:" in
    *":$user_bin:"*) ;;
    *) export PATH="$user_bin:$PATH" ;;
  esac

  if [[ "$wrote" -eq 0 && "$configured" -eq 1 ]]; then
    printf 'Shell startup files already include CLI PATH: %s\n' "$user_bin"
  fi
}

install_user_cli_links() {
  local bin="$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs"

  if [[ ! -x "$bin" ]]; then
    printf 'Missing executable CLI: %s\n' "$bin" >&2
    exit 1
  fi

  mkdir -p "$user_bin"
  ln -sfn "$bin" "$user_bin/ai-context-kit"
  ln -sfn "$bin" "$user_bin/project-facts-kit"
  printf 'Linked CLI in user bin: %s\n' "$user_bin"
  configure_user_path
}

printf 'Project Facts Kit source: %s\n' "$repo_root"

if [[ "$run_npm_link" -eq 1 ]]; then
  if command -v npm >/dev/null 2>&1; then
    npm_link_log="$(mktemp "${TMPDIR:-/tmp}/project-facts-kit-npm-link.XXXXXX")"
    if (
      cd "$repo_root"
      npm link >"$npm_link_log" 2>&1
    ); then
      printf 'Linked CLI with npm: ai-context-kit, project-facts-kit\n'
      rm -f "$npm_link_log"
    else
      if grep -Fq 'EACCES' "$npm_link_log"; then
        printf 'npm link is unavailable because the npm global directory is not writable; using user-level CLI links instead.\n' >&2
      else
        printf 'npm link failed; using user-level CLI links instead. npm log: %s\n' "$npm_link_log" >&2
      fi
      install_user_cli_links
    fi
    if command -v ai-context-kit >/dev/null 2>&1; then
      ai-context-kit --version
    elif [[ -x "$user_bin/ai-context-kit" ]]; then
      "$user_bin/ai-context-kit" --version
    fi
  else
    printf 'npm not found; using user-level CLI links instead.\n' >&2
    install_user_cli_links
    "$user_bin/ai-context-kit" --version
  fi
fi

if [[ "$install_skills" -eq 1 ]]; then
  mkdir -p "$skill_dir"
  for name in "${skill_names[@]}"; do
    install_skill "$name"
  done
fi

printf '%s\n' 'Project Facts Kit local setup completed.'
printf '%s\n' 'Open the target project workspace, then use one of:'
printf '%s\n' '帮我做项目事实 kit 首次接入。'
printf '%s\n' '帮我做项目事实 kit 已接入升级，不覆盖已有事实。'
printf '%s\n' '帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。'
