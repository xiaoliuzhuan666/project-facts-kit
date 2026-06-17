# project-facts-kit-codex

Codex plugin package for sharing the project facts and low-token context skills.

Contains:

- `skills/project-facts-maintainer`
- `skills/low-token-context-maintainer`

If the plugin is installed from a local checkout, first clone or update the kit
and run local setup:

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

After installing the plugin or running local setup, use one of these three
prompts in a project workspace:

```text
帮我做项目事实 kit 首次接入。
帮我做项目事实 kit 已接入升级，不覆盖已有事实。
帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。
```

For the full update command list, see
`docs/project-facts-kit-update-commands.zh-CN.md` in the repository root.

The plugin does not create automations by itself. It gives Codex the skills and
workflow rules needed to set them up. When Codex app automation tools are
available, the user can ask:

```text
帮我开启每日 Skill 反哺候选总结，从当前 workspace 自动识别业务仓库。
```

The automation entry can be a business repository, a business parent folder, or
multiple parent folders through `cwds`. The prompt routes candidates to child
repositories from evidence and leaves ambiguous ownership for confirmation.
Shared Skill review remains a separate automation in the Skill repository.
