#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'Usage: %s <target-repository> [--lite] [--skill-dir <directory>] [--upgrade-existing] [--refresh-skills]\n' "$0" >&2
  exit 2
}

if [[ $# -lt 1 ]]; then
  usage
fi

target_input="$1"
shift
skill_dir=""
install_mode="full"
upgrade_existing="false"
refresh_skills="false"
helper_scripts=(
  "generate-repo-map.sh"
  "sync-skills.sh"
)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lite)
      install_mode="lite"
      shift
      ;;
    --skill-dir)
      [[ $# -ge 2 ]] || usage
      skill_dir="$2"
      shift 2
      ;;
    --upgrade-existing)
      upgrade_existing="true"
      shift
      ;;
    --refresh-skills)
      refresh_skills="true"
      shift
      ;;
    *)
      usage
      ;;
  esac
done

if [[ ! -d "$target_input" ]]; then
  printf 'Target directory does not exist: %s\n' "$target_input" >&2
  exit 1
fi

target="$(cd "$target_input" && pwd)"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
fact_destination="$target/project-facts"

if [[ "$refresh_skills" == "true" && -z "$skill_dir" ]]; then
  printf '%s\n' '--refresh-skills requires --skill-dir <directory>.' >&2
  exit 2
fi

if [[ "$refresh_skills" == "true" && "$upgrade_existing" != "true" ]]; then
  printf '%s\n' '--refresh-skills is only available with --upgrade-existing.' >&2
  exit 2
fi

if [[ -e "$fact_destination" && "$upgrade_existing" != "true" ]]; then
  printf 'Refusing to overwrite existing project facts directory: %s\n' "$fact_destination" >&2
  exit 1
fi

if [[ "$upgrade_existing" == "true" && ! -d "$fact_destination" ]]; then
  printf 'Upgrade mode requires an existing project-facts directory: %s\n' "$fact_destination" >&2
  exit 1
fi

if [[ "$upgrade_existing" != "true" ]]; then
  for helper_script in "${helper_scripts[@]}"; do
    helper_destination="$target/scripts/$helper_script"
    if [[ -e "$helper_destination" ]]; then
      printf 'Refusing to overwrite existing helper script: %s\n' "$helper_destination" >&2
      exit 1
    fi
  done
fi

if [[ -n "$skill_dir" ]]; then
  mkdir -p "$skill_dir"
  skill_dir="$(cd "$skill_dir" && pwd)"
  if [[ "$upgrade_existing" != "true" ]]; then
    for skill_name in project-facts-maintainer low-token-context-maintainer; do
      skill_destination="$skill_dir/$skill_name"
      if [[ -e "$skill_destination" ]]; then
        printf 'Refusing to overwrite existing skill directory: %s\n' "$skill_destination" >&2
        exit 1
      fi
    done
  fi
fi

copy_if_missing() {
  local source="$1"
  local destination="$2"
  local label="$3"
  if [[ -e "$destination" ]]; then
    printf 'Keeping existing %s: %s\n' "$label" "$destination"
    return
  fi
  mkdir -p "$(dirname "$destination")"
  cp "$source" "$destination"
  printf 'Installed %s: %s\n' "$label" "$destination"
}

install_agents_fragment_for_upgrade() {
  local source="$repo_root/template/AGENTS.project-facts.fragment.md"
  local destination="$fact_destination/AGENTS.fragment.md"
  local latest_destination="$fact_destination/AGENTS.fragment.latest.md"
  if [[ ! -e "$destination" ]]; then
    cp "$source" "$destination"
    printf 'Installed AGENTS fragment: %s\n' "$destination"
    return
  fi
  if cmp -s "$source" "$destination"; then
    printf 'Existing AGENTS fragment is already current: %s\n' "$destination"
    return
  fi
  cp "$source" "$latest_destination"
  printf 'Wrote latest AGENTS fragment for review: %s\n' "$latest_destination"
}

install_helper_scripts() {
  mkdir -p "$target/scripts"
  for helper_script in "${helper_scripts[@]}"; do
    local helper_destination="$target/scripts/$helper_script"
    if [[ -e "$helper_destination" ]]; then
      if [[ "$upgrade_existing" == "true" ]]; then
        printf 'Keeping existing helper script: %s\n' "$helper_destination"
        continue
      fi
      printf 'Refusing to overwrite existing helper script: %s\n' "$helper_destination" >&2
      exit 1
    fi
    cp "$repo_root/scripts/$helper_script" "$helper_destination"
    chmod +x "$helper_destination"
  done
}

install_skill() {
  local skill_name="$1"
  local skill_destination="$skill_dir/$skill_name"
  local backup_destination=""

  if [[ -e "$skill_destination" ]]; then
    if [[ "$refresh_skills" != "true" ]]; then
      printf 'Keeping existing skill directory: %s\n' "$skill_destination"
      return
    fi
    backup_destination="$skill_dir/${skill_name}.backup-$(date +%Y%m%d%H%M%S)"
    local suffix=1
    while [[ -e "$backup_destination" ]]; do
      backup_destination="$skill_dir/${skill_name}.backup-$(date +%Y%m%d%H%M%S)-$suffix"
      suffix=$((suffix + 1))
    done
    mv "$skill_destination" "$backup_destination"
    printf 'Backed up existing skill directory: %s\n' "$backup_destination"
  fi

  cp -R "$repo_root/skills/$skill_name" "$skill_destination"
  printf 'Installed skill: %s\n' "$skill_destination"
}

if [[ "$upgrade_existing" == "true" ]]; then
  copy_if_missing "$repo_root/template/project-facts/skill-feedback/_template.md" "$fact_destination/skill-feedback/_template.md" "skill feedback template"
  install_agents_fragment_for_upgrade
  install_helper_scripts
  if [[ -n "$skill_dir" ]]; then
    for skill_name in project-facts-maintainer low-token-context-maintainer; do
      install_skill "$skill_name"
    done
  fi
  printf 'Upgraded existing project facts kit files in %s\n' "$target"
  printf 'Existing project facts were preserved. Review project-facts/AGENTS.fragment.latest.md if it was created.\n'
  if [[ -n "$skill_dir" && "$refresh_skills" == "true" ]]; then
    printf 'Existing skills were backed up before refresh.\n'
  fi
  exit 0
fi

if [[ -n "$skill_dir" ]]; then
  for skill_name in project-facts-maintainer low-token-context-maintainer; do
    skill_destination="$skill_dir/$skill_name"
    if [[ -e "$skill_destination" ]]; then
      printf 'Refusing to overwrite existing skill directory: %s\n' "$skill_destination" >&2
      exit 1
    fi
  done
fi

for helper_script in "${helper_scripts[@]}"; do
  helper_destination="$target/scripts/$helper_script"
  if [[ -e "$helper_destination" ]]; then
    printf 'Refusing to overwrite existing helper script: %s\n' "$helper_destination" >&2
    exit 1
  fi
done

if [[ "$install_mode" == "lite" ]]; then
  mkdir -p "$fact_destination/handover" "$fact_destination/skill-feedback" "$fact_destination/specs/_template"
  cp "$repo_root/template/project-facts/README.md" "$fact_destination/"
  cp "$repo_root/template/project-facts/project.md" "$fact_destination/"
  cp "$repo_root/template/project-facts/glossary.md" "$fact_destination/"
  cp "$repo_root/template/project-facts/runtime.md" "$fact_destination/"
  cp "$repo_root/template/project-facts/iteration-plan.md" "$fact_destination/"
  cp "$repo_root/template/project-facts/handover/current.md" "$fact_destination/handover/"
  cp "$repo_root/template/project-facts/handover/for-next-maintainer.md" "$fact_destination/handover/"
  cp "$repo_root/template/project-facts/skill-feedback/_template.md" "$fact_destination/skill-feedback/"
  cp "$repo_root/template/project-facts/specs/_template/spec.md" "$fact_destination/specs/_template/"
else
  mkdir -p "$fact_destination/integration/github"
  cp -R "$repo_root/template/project-facts/." "$fact_destination/"
  cp "$repo_root/template/github/CODEOWNERS.project-facts.fragment" "$fact_destination/integration/github/"
  cp "$repo_root/template/github/pull_request_template.project-facts.md" "$fact_destination/integration/github/"
fi

cp "$repo_root/template/AGENTS.project-facts.fragment.md" "$fact_destination/AGENTS.fragment.md"

if [[ -n "$skill_dir" ]]; then
  for skill_name in project-facts-maintainer low-token-context-maintainer; do
    install_skill "$skill_name"
  done
fi

# 安装辅助自动化脚本
install_helper_scripts

printf 'Installed %s project facts templates into %s\n' "$install_mode" "$fact_destination"
printf 'Installed optional helper scripts to %s/scripts/\n' "$target"
printf 'Review project-facts/AGENTS.fragment.md and merge applicable rules into the target repository AGENTS.md.\n'
printf 'Optional next steps: run ./scripts/generate-repo-map.sh %s, and review ./scripts/sync-skills.sh before using it.\n' "$target"
if [[ "$install_mode" == "lite" ]]; then
  printf 'Lite mode installed project.md, glossary.md, runtime.md, iteration-plan.md, handover files, one skill feedback template, one spec template, and AGENTS.fragment.md only.\n'
fi
if [[ -n "$skill_dir" ]]; then
  printf 'Installed skills into %s\n' "$skill_dir"
fi
