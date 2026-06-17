#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
required_files=(
  "README.md"
  "AGENTS.md"
  "package.json"
  "docs/project-facts-governance.zh-CN.md"
  "docs/adoption-guide.zh-CN.md"
  "docs/project-facts-kit-update-commands.zh-CN.md"
  "docs/docker-shared-host-release-pattern.zh-CN.md"
  "docs/codex-low-token-tooling-research.zh-CN.md"
  "docs/ai-agent-carrier-roadmap.zh-CN.md"
  "docs/ai-context-kit-operating-workflow.zh-CN.md"
  "docs/ai-context-kit-real-task-ab-template.zh-CN.md"
  "docs/ai-context-kit-real-task-ab-audit.md"
  "docs/skill-feedback/README.md"
  "docs/skill-feedback/_template.md"
  "docs/skill-carrier-assessment.zh-CN.md"
  "docs/skill-feedback-automation-runbook.zh-CN.md"
  "docs/research/skill-carrier-source-notes-2026-06-17.zh-CN.md"
  "docs/codex-mem-mcp-codex-config.zh-CN.md"
  "template/AGENTS.project-facts.fragment.md"
  "template/project-facts/README.md"
  "template/project-facts/project.md"
  "template/project-facts/glossary.md"
  "template/project-facts/runtime.md"
  "template/project-facts/iteration-plan.md"
  "template/project-facts/skill-feedback/_template.md"
  "template/project-facts/specs/_template/spec.md"
  "template/project-facts/changes/_template/proposal.md"
  "template/project-facts/changes/_template/requirements.md"
  "template/project-facts/changes/_template/design.md"
  "template/project-facts/changes/_template/tasks.md"
  "template/project-facts/changes/_template/unknowns.md"
  "template/project-facts/changes/_template/evidence.md"
  "template/project-facts/decisions/ADR-0000-template.md"
  "template/project-facts/handover/current.md"
  "template/project-facts/handover/for-next-maintainer.md"
  "docs/team-training-iteration-runbook.zh-CN.md"
  "scripts/generate-repo-map.sh"
  "scripts/setup-local-kit.sh"
  "scripts/sync-skills.sh"
  "skills/project-facts-maintainer/SKILL.md"
  "skills/project-facts-maintainer/agents/openai.yaml"
  "skills/project-facts-maintainer/references/runtime-release-facts.md"
  "skills/project-facts-maintainer/references/domain-index-template.md"
  "skills/project-facts-maintainer/references/business-domain-report-template.md"
  "skills/low-token-context-maintainer/SKILL.md"
  "skills/low-token-context-maintainer/agents/openai.yaml"
  "plugins/project-facts-kit-codex/.codex-plugin/plugin.json"
  "plugins/project-facts-kit-codex/skills/project-facts-maintainer/SKILL.md"
  "plugins/project-facts-kit-codex/skills/low-token-context-maintainer/SKILL.md"
  "packages/ai-context-kit/package.json"
  "packages/ai-context-kit/README.md"
  "packages/ai-context-kit/bin/ai-context-kit.mjs"
)

for path in "${required_files[@]}"; do
  if [[ ! -s "$repo_root/$path" ]]; then
    printf 'Missing required file: %s\n' "$path" >&2
    exit 1
  fi
done

if command -v rg >/dev/null 2>&1 && rg -n '\[TODO:' "$repo_root/skills/project-facts-maintainer" "$repo_root/skills/low-token-context-maintainer"; then
  printf 'Skill still contains scaffold TODO markers.\n' >&2
  exit 1
fi

if command -v rg >/dev/null 2>&1 && rg -n 'Workspace \| `<absolute path>`|仓库：<absolute or remote path>|<repository path or name>' "$repo_root/template" "$repo_root/skills"; then
  printf 'Template or skill reference still encourages committing a local absolute workspace path.\n' >&2
  exit 1
fi

grep -Fq 'APPROVED / OBSERVED / UNKNOWN / CONFLICT' "$repo_root/template/project-facts/changes/_template/requirements.md"
grep -Fq 'Skill` 提升接手效率和执行下限' "$repo_root/docs/project-facts-governance.zh-CN.md"
grep -Fq 'PR 审阅保证经验不会未经确认变成团队规则' "$repo_root/docs/project-facts-governance.zh-CN.md"
grep -Fq '业务项目生成候选' "$repo_root/docs/skill-feedback-automation-runbook.zh-CN.md"
grep -Fq 'Skill 仓库评审候选' "$repo_root/docs/skill-feedback-automation-runbook.zh-CN.md"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/target" "$tmp/skills"

"$repo_root/scripts/install-project-facts.sh" "$tmp/target" --skill-dir "$tmp/skills" >/dev/null
test -s "$tmp/target/project-facts/project.md"
test -s "$tmp/target/project-facts/runtime.md"
test -s "$tmp/target/project-facts/iteration-plan.md"
test -s "$tmp/target/project-facts/skill-feedback/_template.md"
test -s "$tmp/target/project-facts/handover/for-next-maintainer.md"
test -s "$tmp/target/project-facts/integration/github/pull_request_template.project-facts.md"
test -s "$tmp/skills/project-facts-maintainer/SKILL.md"
test -s "$tmp/skills/project-facts-maintainer/references/runtime-release-facts.md"
test -s "$tmp/skills/project-facts-maintainer/references/domain-index-template.md"
test -s "$tmp/skills/project-facts-maintainer/references/business-domain-report-template.md"
test -s "$tmp/skills/low-token-context-maintainer/SKILL.md"
test -x "$tmp/target/scripts/generate-repo-map.sh"
test -x "$tmp/target/scripts/sync-skills.sh"

mkdir -p "$tmp/local-kit-home"
CODEX_HOME="$tmp/local-kit-home/codex" "$repo_root/scripts/setup-local-kit.sh" --skip-npm-link >/dev/null
test -L "$tmp/local-kit-home/codex/skills/project-facts-maintainer"
test -L "$tmp/local-kit-home/codex/skills/low-token-context-maintainer"
test -s "$tmp/local-kit-home/codex/skills/project-facts-maintainer/SKILL.md"
test -s "$tmp/local-kit-home/codex/skills/low-token-context-maintainer/SKILL.md"
CODEX_HOME="$tmp/local-kit-home/codex" "$repo_root/scripts/setup-local-kit.sh" --skip-npm-link --copy-skills >/dev/null
find "$tmp/local-kit-home/codex/skills" -maxdepth 1 -type l -name 'project-facts-maintainer.backup-*' | grep -q .
test -d "$tmp/local-kit-home/codex/skills/project-facts-maintainer"
test -s "$tmp/local-kit-home/codex/skills/project-facts-maintainer/SKILL.md"
mkdir -p "$tmp/local-kit-home/no-npm-bin"
node_path="$(command -v node)"
ln -s "$node_path" "$tmp/local-kit-home/no-npm-bin/node"
env -i HOME="$tmp/local-kit-home/no-npm-home" PATH="$tmp/local-kit-home/no-npm-bin:/usr/bin:/bin" "$repo_root/scripts/setup-local-kit.sh" --no-skills >/dev/null
test -x "$tmp/local-kit-home/no-npm-home/.local/bin/ai-context-kit"
"$tmp/local-kit-home/no-npm-home/.local/bin/ai-context-kit" --version | grep -Fq 'ai-context-kit'
grep -Fq 'project-facts-kit PATH' "$tmp/local-kit-home/no-npm-home/.zshrc"
env -i HOME="$tmp/local-kit-home/no-npm-home" SHELL="/bin/zsh" PATH="/usr/bin:/bin" zsh -lc 'command -v ai-context-kit >/dev/null'

if "$repo_root/scripts/install-project-facts.sh" "$tmp/target" >/dev/null 2>&1; then
  printf 'Installer unexpectedly overwrote an existing project-facts directory.\n' >&2
  exit 1
fi

mkdir -p "$tmp/helper-conflict/scripts"
printf 'existing helper\n' > "$tmp/helper-conflict/scripts/generate-repo-map.sh"
if "$repo_root/scripts/install-project-facts.sh" "$tmp/helper-conflict" >/dev/null 2>&1; then
  printf 'Installer unexpectedly overwrote an existing helper script.\n' >&2
  exit 1
fi

mkdir -p "$tmp/skill-conflict" "$tmp/skill-conflict-dest/low-token-context-maintainer"
if "$repo_root/scripts/install-project-facts.sh" "$tmp/skill-conflict" --skill-dir "$tmp/skill-conflict-dest" >/dev/null 2>&1; then
  printf 'Installer unexpectedly overwrote an existing skill directory.\n' >&2
  exit 1
fi

mkdir -p "$tmp/upgrade-target/project-facts" "$tmp/upgrade-target/scripts" "$tmp/upgrade-skills/project-facts-maintainer"
printf 'existing project facts\n' > "$tmp/upgrade-target/project-facts/project.md"
printf 'old fragment\n' > "$tmp/upgrade-target/project-facts/AGENTS.fragment.md"
printf 'existing helper\n' > "$tmp/upgrade-target/scripts/generate-repo-map.sh"
printf 'old skill\n' > "$tmp/upgrade-skills/project-facts-maintainer/SKILL.md"
"$repo_root/scripts/install-project-facts.sh" "$tmp/upgrade-target" --upgrade-existing --skill-dir "$tmp/upgrade-skills" >/dev/null
grep -Fxq 'existing project facts' "$tmp/upgrade-target/project-facts/project.md"
grep -Fxq 'existing helper' "$tmp/upgrade-target/scripts/generate-repo-map.sh"
grep -Fxq 'old skill' "$tmp/upgrade-skills/project-facts-maintainer/SKILL.md"
test -s "$tmp/upgrade-target/project-facts/skill-feedback/_template.md"
test -s "$tmp/upgrade-target/project-facts/AGENTS.fragment.latest.md"
test -x "$tmp/upgrade-target/scripts/sync-skills.sh"
test -s "$tmp/upgrade-skills/low-token-context-maintainer/SKILL.md"
"$repo_root/scripts/install-project-facts.sh" "$tmp/upgrade-target" --upgrade-existing --skill-dir "$tmp/upgrade-skills" --refresh-skills >/dev/null
test -s "$tmp/upgrade-skills/project-facts-maintainer/SKILL.md"
test -s "$tmp/upgrade-skills/low-token-context-maintainer/SKILL.md"
find "$tmp/upgrade-skills" -maxdepth 1 -type d -name 'project-facts-maintainer.backup-*' | grep -q .
find "$tmp/upgrade-skills" -maxdepth 1 -type d -name 'low-token-context-maintainer.backup-*' | grep -q .
if ! grep -R -Fxq 'old skill' "$tmp/upgrade-skills"/project-facts-maintainer.backup-*/SKILL.md; then
  printf 'Upgrade mode did not keep a backup of the old project-facts skill.\n' >&2
  exit 1
fi
grep -Fxq 'existing project facts' "$tmp/upgrade-target/project-facts/project.md"

mkdir -p "$tmp/lite-target"
"$repo_root/scripts/install-project-facts.sh" "$tmp/lite-target" --lite >/dev/null
test -s "$tmp/lite-target/project-facts/project.md"
test -s "$tmp/lite-target/project-facts/glossary.md"
test -s "$tmp/lite-target/project-facts/runtime.md"
test -s "$tmp/lite-target/project-facts/iteration-plan.md"
test -s "$tmp/lite-target/project-facts/skill-feedback/_template.md"
test -s "$tmp/lite-target/project-facts/handover/current.md"
test -s "$tmp/lite-target/project-facts/handover/for-next-maintainer.md"
test -s "$tmp/lite-target/project-facts/specs/_template/spec.md"
test -s "$tmp/lite-target/project-facts/AGENTS.fragment.md"
if [[ -e "$tmp/lite-target/project-facts/changes/_template/proposal.md" ]]; then
  printf 'Lite install unexpectedly included change templates.\n' >&2
  exit 1
fi
if [[ -e "$tmp/lite-target/project-facts/integration/github" ]]; then
  printf 'Lite install unexpectedly included GitHub integration files.\n' >&2
  exit 1
fi

mkdir -p "$tmp/redact"
fake_openai_key="sk-$(printf 'test1234567890abcdef')"
fake_masked_key="sk-$(printf 'Bc')$(printf 'Ssy')***********************qKKZ"
fake_bearer="$(printf 'abcdefghijklmnopqrstuvwxyz')123456"
fake_session="$(printf 'abcdef')123456"
fake_password="super-$(printf 'sec')$(printf 'ret')-value"
fake_email="admin$(printf '@')example$(printf '.')com"
fake_phone="138$(printf '001')$(printf '38000')"
fake_home="/Users/$(printf 'ali')$(printf 'ce')"
fake_url_password="pass$(printf 'w')$(printf '0rd')"
printf '%s\n' \
  "OPENAI_API_KEY=${fake_openai_key}" \
  "masked_openai_key=${fake_masked_key}" \
  "Authorization: Bearer ${fake_bearer}" \
  "Cookie: sessionid=${fake_session}; theme=dark" \
  "{\"password\":\"${fake_password}\",\"tokenEstimate\":123}" \
  "contact ${fake_email} phone ${fake_phone} path ${fake_home}/project" \
  "database_url=https://user:${fake_url_password}@example.com/db" \
  > "$tmp/redact/input.txt"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" redact --input "$tmp/redact/input.txt" --output "$tmp/redact/output.txt" >/dev/null
grep -Fq '***REDACTED***' "$tmp/redact/output.txt"
grep -Fq '<redacted-email>' "$tmp/redact/output.txt"
grep -Fq '<redacted-phone>' "$tmp/redact/output.txt"
grep -Fq '/Users/<user>/project' "$tmp/redact/output.txt"
grep -Fq 'tokenEstimate' "$tmp/redact/output.txt"
for leaked in "$fake_openai_key" "$fake_masked_key" "$fake_bearer" "$fake_session" "$fake_password" "$fake_email" "$fake_phone" "$fake_home" "$fake_url_password"; do
  if grep -Fq "$leaked" "$tmp/redact/output.txt"; then
    printf 'redact left a sensitive test value in output.\n' >&2
    exit 1
  fi
done
printf 'password=stdin-secret-value\n' | "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" redact --input - | grep -Fq 'password=***REDACTED***'

mkdir -p "$tmp/sync-target/project-facts/skills/demo-skill" "$tmp/sync-target/.codex/skills/demo-skill"
printf 'custom AGENTS rules\n' > "$tmp/sync-target/AGENTS.md"
printf '# Project Facts fragment\n\nUse project-facts/.\n' > "$tmp/sync-target/project-facts/AGENTS.fragment.md"
printf 'demo skill\n' > "$tmp/sync-target/project-facts/skills/demo-skill/SKILL.md"
printf 'existing skill\n' > "$tmp/sync-target/.codex/skills/demo-skill/SKILL.md"
"$repo_root/scripts/sync-skills.sh" "$tmp/sync-target" >/dev/null
if [[ "$(cat "$tmp/sync-target/AGENTS.md")" != "custom AGENTS rules" ]]; then
  printf 'sync-skills unexpectedly modified an existing AGENTS.md.\n' >&2
  exit 1
fi
if ! grep -Fxq 'existing skill' "$tmp/sync-target/.codex/skills/demo-skill/SKILL.md"; then
  printf 'sync-skills unexpectedly overwrote an existing skill.\n' >&2
  exit 1
fi

mkdir -p "$tmp/map-target/project-facts" "$tmp/map-target/src/main/resources/cert" "$tmp/map-target/src/main/resources" "$tmp/map-target/src/app"
printf 'spring:\n  datasource: secret\n' > "$tmp/map-target/src/main/resources/application-prod.yml"
printf 'const app = true;\n' > "$tmp/map-target/src/app/index.js"
"$repo_root/scripts/generate-repo-map.sh" "$tmp/map-target" >/dev/null
test -s "$tmp/map-target/project-facts/repo_map.txt"
if grep -Fq "$tmp" "$tmp/map-target/project-facts/repo_map.txt"; then
  printf 'repo_map.txt unexpectedly contains a temporary absolute path.\n' >&2
  exit 1
fi
if grep -Eq 'application-prod\.yml|src/main/resources/cert' "$tmp/map-target/project-facts/repo_map.txt"; then
  printf 'repo_map.txt unexpectedly listed sensitive config paths.\n' >&2
  exit 1
fi

mkdir -p "$tmp/missing-workflow/web-app/project-facts" "$tmp/missing-workflow/api-service/src/main/java/com/example/demo/controller" "$tmp/missing-workflow/go-service/core" "$tmp/missing-workflow/admin-console-ui/src/views"
git -C "$tmp/missing-workflow/web-app" init >/dev/null 2>&1
git -C "$tmp/missing-workflow/api-service" init >/dev/null 2>&1
git -C "$tmp/missing-workflow/go-service" init >/dev/null 2>&1
git -C "$tmp/missing-workflow/admin-console-ui" init >/dev/null 2>&1
printf '{"name":"web-app","scripts":{"build":"vite build"}}\n' > "$tmp/missing-workflow/web-app/package.json"
printf '{"pages":[{"path":"pages/order/detail"}]}\n' > "$tmp/missing-workflow/web-app/pages.json"
printf 'manual project facts\n' > "$tmp/missing-workflow/web-app/project-facts/project.md"
printf '<project><artifactId>api-service</artifactId></project>\n' > "$tmp/missing-workflow/api-service/pom.xml"
printf 'module example.com/go-service\n\ngo 1.22\n' > "$tmp/missing-workflow/go-service/go.mod"
printf 'package core\n\nfunc Add(a, b int) int { return a + b }\n' > "$tmp/missing-workflow/go-service/core/add.go"
printf '{"name":"admin-console-ui","scripts":{"build":"vue-cli-service build"}}\n' > "$tmp/missing-workflow/admin-console-ui/package.json"
printf '<template><div>ui</div></template>\n' > "$tmp/missing-workflow/admin-console-ui/src/views/index.vue"
printf '%s\n' \
  'package com.example.demo.controller;' \
  '' \
  'import org.springframework.web.bind.annotation.GetMapping;' \
  'import org.springframework.web.bind.annotation.RequestMapping;' \
  'import org.springframework.web.bind.annotation.RestController;' \
  '' \
  '@RestController' \
  '@RequestMapping("/api/orders")' \
  'public class OrderController {' \
  '  @GetMapping("/{id}")' \
  '  public String detail() { return "ok"; }' \
  '}' \
  > "$tmp/missing-workflow/api-service/src/main/java/com/example/demo/controller/OrderController.java"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" doctor --workspace "$tmp/missing-workflow" > "$tmp/missing-workflow-doctor.md"
grep -Fq 'missing docs/ai-context-workspace-map.md' "$tmp/missing-workflow-doctor.md"
grep -Fq 'missing .codex-mem/index.jsonl' "$tmp/missing-workflow-doctor.md"
grep -Fq 'tech: go' "$tmp/missing-workflow-doctor.md"
grep -Fq 'capability status:' "$tmp/missing-workflow-doctor.md"
grep -Fq 'low-token artifacts: missing' "$tmp/missing-workflow-doctor.md"
grep -Fq 'contract index: missing' "$tmp/missing-workflow-doctor.md"
grep -Fq 'CodeGraph: missing_cli' "$tmp/missing-workflow-doctor.md"
grep -Fq 'static token report: not_run' "$tmp/missing-workflow-doctor.md"
grep -Fq 'observe hooks: not_enabled' "$tmp/missing-workflow-doctor.md"
grep -Fq 'agents --workspace <path>' "$tmp/missing-workflow-doctor.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" onboard --workspace "$tmp/missing-workflow" > "$tmp/missing-workflow-onboard.md"
grep -Fq '# ai-context-kit onboard' "$tmp/missing-workflow-onboard.md"
grep -Fq '# ai-context-kit doctor' "$tmp/missing-workflow-onboard.md"
grep -Fq '# token status' "$tmp/missing-workflow-onboard.md"
grep -Fq '# capability actions' "$tmp/missing-workflow-onboard.md"
grep -Fq 'CodeGraph:' "$tmp/missing-workflow-onboard.md"
grep -Fq 'Token visibility:' "$tmp/missing-workflow-onboard.md"
grep -Fq 'Report requirement:' "$tmp/missing-workflow-onboard.md"
test -s "$tmp/missing-workflow/AGENTS.md"
test -s "$tmp/missing-workflow/docs/ai-context-workspace-map.md"
test -s "$tmp/missing-workflow/docs/ai-context-api-contract-map.md"
test -s "$tmp/missing-workflow/docs/ai-context-scope-report.md"
test -s "$tmp/missing-workflow/.codex-mem/index.jsonl"
test -s "$tmp/missing-workflow/web-app/AGENTS.md"
test -s "$tmp/missing-workflow/web-app/project-facts/verification.md"
test -s "$tmp/missing-workflow/api-service/AGENTS.md"
test -s "$tmp/missing-workflow/api-service/project-facts/backend-route-controller-map.md"
test -s "$tmp/missing-workflow/go-service/AGENTS.md"
test -s "$tmp/missing-workflow/go-service/project-facts/verification.md"
test -s "$tmp/missing-workflow/admin-console-ui/AGENTS.md"
test -s "$tmp/missing-workflow/admin-console-ui/project-facts/api-endpoints.md"
grep -Fq '多仓库工作区' "$tmp/missing-workflow/AGENTS.md"
grep -Fq 'ai-context-kit contracts' "$tmp/missing-workflow/AGENTS.md"
grep -Fq '不要整段读取契约索引' "$tmp/missing-workflow/AGENTS.md"
grep -Fq '管理控制台前端' "$tmp/missing-workflow/AGENTS.md"
if grep -Fq '`admin-console-ui` | 业务 Java 后端' "$tmp/missing-workflow/AGENTS.md"; then
  printf 'admin-console-ui was incorrectly classified as a Java backend.\n' >&2
  exit 1
fi
grep -Fq 'pages.json' "$tmp/missing-workflow/web-app/AGENTS.md"
grep -Fq 'Controller' "$tmp/missing-workflow/api-service/AGENTS.md"
grep -Fq 'Go 后端服务' "$tmp/missing-workflow/go-service/AGENTS.md"
grep -Fq '管理控制台前端' "$tmp/missing-workflow/admin-console-ui/AGENTS.md"
grep -Fq 'src/views 下相关页面' "$tmp/missing-workflow/admin-console-ui/AGENTS.md"
grep -Fq '小程序 API endpoint 索引' "$tmp/missing-workflow/web-app/project-facts/api-endpoints.md"
grep -Fq '前端 API endpoint 索引' "$tmp/missing-workflow/admin-console-ui/project-facts/api-endpoints.md"
grep -Fq '前端页面与 API 文件映射' "$tmp/missing-workflow/admin-console-ui/project-facts/applet-route-api-map.md"
grep -Fq 'go test ./...' "$tmp/missing-workflow/go-service/project-facts/verification.md"
grep -Fq '/api/orders/{id}' "$tmp/missing-workflow/api-service/project-facts/backend-route-controller-map.md"
grep -Fq 'api-service' "$tmp/missing-workflow/.codex-mem/index.jsonl"
if ! grep -Fxq 'manual project facts' "$tmp/missing-workflow/web-app/project-facts/project.md"; then
  printf 'agents unexpectedly modified manual project facts.\n' >&2
  exit 1
fi
if grep -R -F "$tmp/missing-workflow" \
  "$tmp/missing-workflow/AGENTS.md" \
  "$tmp/missing-workflow/docs" \
  "$tmp/missing-workflow/.codex-mem" \
  "$tmp/missing-workflow/web-app/AGENTS.md" \
  "$tmp/missing-workflow/web-app/project-facts" \
  "$tmp/missing-workflow/api-service/AGENTS.md" \
  "$tmp/missing-workflow/api-service/project-facts" \
  "$tmp/missing-workflow/go-service/AGENTS.md" \
  "$tmp/missing-workflow/go-service/project-facts" \
  "$tmp/missing-workflow/admin-console-ui/AGENTS.md" \
  "$tmp/missing-workflow/admin-console-ui/project-facts" >/dev/null; then
  printf 'agents generated files unexpectedly contain a temporary absolute path.\n' >&2
  exit 1
fi
workspace_map_before="$(shasum -a 256 "$tmp/missing-workflow/docs/ai-context-workspace-map.md" | awk '{print $1}')"
rm "$tmp/missing-workflow/AGENTS.md" "$tmp/missing-workflow/web-app/AGENTS.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" agents --workspace "$tmp/missing-workflow" >/dev/null
test -s "$tmp/missing-workflow/AGENTS.md"
test -s "$tmp/missing-workflow/web-app/AGENTS.md"
workspace_map_after="$(shasum -a 256 "$tmp/missing-workflow/docs/ai-context-workspace-map.md" | awk '{print $1}')"
if [[ "$workspace_map_before" != "$workspace_map_after" ]]; then
  printf 'agents rewrote an existing workspace map while only AGENTS.md was missing.\n' >&2
  exit 1
fi
grep -Fq '"path":"AGENTS.md"' "$tmp/missing-workflow/.codex-mem/index.jsonl"

root_agents_existing="$(shasum -a 256 "$tmp/missing-workflow/AGENTS.md" | awk '{print $1}')"
web_agents_existing="$(shasum -a 256 "$tmp/missing-workflow/web-app/AGENTS.md" | awk '{print $1}')"
api_agents_existing="$(shasum -a 256 "$tmp/missing-workflow/api-service/AGENTS.md" | awk '{print $1}')"
go_agents_existing="$(shasum -a 256 "$tmp/missing-workflow/go-service/AGENTS.md" | awk '{print $1}')"
rm "$tmp/missing-workflow/docs/ai-context-workspace-map.md" \
  "$tmp/missing-workflow/docs/ai-context-api-contract-map.md" \
  "$tmp/missing-workflow/docs/ai-context-scope-report.md" \
  "$tmp/missing-workflow/.codex-mem/index.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" agents --workspace "$tmp/missing-workflow" >/dev/null
test -s "$tmp/missing-workflow/docs/ai-context-workspace-map.md"
test -s "$tmp/missing-workflow/docs/ai-context-api-contract-map.md"
test -s "$tmp/missing-workflow/docs/ai-context-scope-report.md"
test -s "$tmp/missing-workflow/.codex-mem/index.jsonl"
if [[ "$root_agents_existing" != "$(shasum -a 256 "$tmp/missing-workflow/AGENTS.md" | awk '{print $1}')" ]]; then
  printf 'agents rewrote an existing workspace AGENTS.md while other workflow artifacts were missing.\n' >&2
  exit 1
fi
if [[ "$web_agents_existing" != "$(shasum -a 256 "$tmp/missing-workflow/web-app/AGENTS.md" | awk '{print $1}')" ]]; then
  printf 'agents rewrote an existing web-app AGENTS.md while other workflow artifacts were missing.\n' >&2
  exit 1
fi
if [[ "$api_agents_existing" != "$(shasum -a 256 "$tmp/missing-workflow/api-service/AGENTS.md" | awk '{print $1}')" ]]; then
  printf 'agents rewrote an existing api-service AGENTS.md while other workflow artifacts were missing.\n' >&2
  exit 1
fi
if [[ "$go_agents_existing" != "$(shasum -a 256 "$tmp/missing-workflow/go-service/AGENTS.md" | awk '{print $1}')" ]]; then
  printf 'agents rewrote an existing go-service AGENTS.md while other workflow artifacts were missing.\n' >&2
  exit 1
fi
grep -Fq '"path":"docs/ai-context-workspace-map.md"' "$tmp/missing-workflow/.codex-mem/index.jsonl"

printf '%s\n' \
  '# 跨端 API 契约索引' \
  '' \
  '| Frontend repo | Endpoint | Symbol | Frontend file | Backend repo | Handler | Request DTO fields | Response type |' \
  '|---|---|---|---|---|---|---|---|' \
  '| `web-app` | `/api/orders/{id}` | `getOrder` | `api/order.ts:1` | `api-service` | `GET /api/orders/{id} OrderController.getOrder` | - | `String` |' \
  > "$tmp/missing-workflow/docs/ai-context-api-contract-map.md"
printf '%s\n' \
  '{"id":"api-contract:old:getOrder","type":"api-contract","repo":"web-app","path":"docs/ai-context-api-contract-map.md:5","title":"getOrder /api/orders/{id}","summary":"frontend=web-app; endpoint=/api/orders/{id}; backend=api-service","contract":{"frontendRepo":"web-app","endpoint":"/api/orders/{id}","backendRepo":"api-service"}}' \
  > "$tmp/missing-workflow/.codex-mem/index.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" doctor --workspace "$tmp/missing-workflow" > "$tmp/missing-workflow-stale-doctor.md"
grep -Fq 'stale docs/ai-context-api-contract-map.md' "$tmp/missing-workflow-stale-doctor.md"
grep -Fq 'missing columns: Frontend payload fields, Field check' "$tmp/missing-workflow-stale-doctor.md"
grep -Fq 'stale .codex-mem/index.jsonl' "$tmp/missing-workflow-stale-doctor.md"
grep -Fq 'api-contract entries missing fields: Frontend payload fields, Field check' "$tmp/missing-workflow-stale-doctor.md"
grep -Fq 'init --workspace <path>' "$tmp/missing-workflow-stale-doctor.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/missing-workflow" --query getOrder > "$tmp/missing-workflow-stale-contracts.md"
grep -Fq '## Warnings' "$tmp/missing-workflow-stale-contracts.md"
grep -Fq 'docs/ai-context-api-contract-map.md: missing columns: Frontend payload fields, Field check' "$tmp/missing-workflow-stale-contracts.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/missing-workflow" --query getOrder > "$tmp/missing-workflow-stale-search.md"
grep -Fq 'Warnings:' "$tmp/missing-workflow-stale-search.md"
grep -Fq '.codex-mem/index.jsonl: api-contract entries missing fields: Frontend payload fields, Field check' "$tmp/missing-workflow-stale-search.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem route --workspace "$tmp/missing-workflow" --query getOrder > "$tmp/missing-workflow-stale-route.md"
grep -Fq 'Warnings:' "$tmp/missing-workflow-stale-route.md"
grep -Fq '.codex-mem/index.jsonl: api-contract entries missing fields: Frontend payload fields, Field check' "$tmp/missing-workflow-stale-route.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" agents --workspace "$tmp/missing-workflow" > "$tmp/missing-workflow-stale-agents.log"
grep -Fq 'generated workflow artifacts need init refresh' "$tmp/missing-workflow-stale-agents.log"
if grep -Fq 'Field check' "$tmp/missing-workflow/docs/ai-context-api-contract-map.md"; then
  printf 'agents unexpectedly refreshed a stale contract map.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" upgrade --workspace "$tmp/missing-workflow" > "$tmp/missing-workflow-upgrade.md"
grep -Fq '# ai-context-kit upgrade' "$tmp/missing-workflow-upgrade.md"
grep -Fq '# ai-context-kit doctor' "$tmp/missing-workflow-upgrade.md"
grep -Fq '# token status' "$tmp/missing-workflow-upgrade.md"
grep -Fq '# capability actions' "$tmp/missing-workflow-upgrade.md"
grep -Fq 'CodeGraph:' "$tmp/missing-workflow-upgrade.md"
grep -Fq 'Token visibility:' "$tmp/missing-workflow-upgrade.md"
grep -Fq 'Report requirement:' "$tmp/missing-workflow-upgrade.md"
grep -Fq 'Frontend payload fields' "$tmp/missing-workflow/docs/ai-context-api-contract-map.md"
grep -Fq 'Field check' "$tmp/missing-workflow/docs/ai-context-api-contract-map.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" doctor --workspace "$tmp/missing-workflow" > "$tmp/missing-workflow-refreshed-doctor.md"
grep -Fq 'ok docs/ai-context-api-contract-map.md' "$tmp/missing-workflow-refreshed-doctor.md"
grep -Fq 'ok .codex-mem/index.jsonl' "$tmp/missing-workflow-refreshed-doctor.md"

mkdir -p "$tmp/context-workspace/app/api" "$tmp/context-workspace/app/services" "$tmp/context-workspace/app/pages/user" "$tmp/context-workspace/app/app/user" "$tmp/context-workspace/app/project-facts"
mkdir -p "$tmp/context-workspace/spring-service/src/main/java/com/example/demo/controller"
mkdir -p "$tmp/context-workspace/spring-service/src/main/java/com/example/demo/dto"
git -C "$tmp/context-workspace/app" init >/dev/null 2>&1
git -C "$tmp/context-workspace/spring-service" init >/dev/null 2>&1
printf '{"scripts":{"check":"node --version"}}\n' > "$tmp/context-workspace/app/package.json"
printf '{"pages":[{"path":"pages/user/detail"}]}\n' > "$tmp/context-workspace/app/pages.json"
printf '%s\n' \
  "export const saveUser = '/api/users'" \
  "export const getUser = '/api/users/{id}'" \
  > "$tmp/context-workspace/app/api/user.js"
printf '%s\n' \
  "export const cancelUser = (id) => request({ url: '/api/users/cancel', method: 'post', data: { id } });" \
  "export const updateAssetStatus = (id, status) => request({ url: '/api/assets/updateAssetStatus', method: 'post', data: { id, status } });" \
  "export const finalizeDemoOrder = (id) => request({ url: '/api/demo-orders/finalize', method: 'post', data: { id } });" \
  "export const startDemoPayment = (id) => request({ url: '/api/demo-payments/start', method: 'post', data: { id } });" \
  "export const prepareDemoInventory = (id) => request({ url: '/api/demo-inventory/prepare', method: 'post', data: { id, demoStartDate: '2026-06-06' } });" \
  "export async function archiveUser(id) {" \
  "  return fetch('/api/users/archive', { method: 'POST', body: JSON.stringify({ id }) });" \
  "}" \
  "export default { cancelUser, updateAssetStatus, finalizeDemoOrder, startDemoPayment, prepareDemoInventory, archiveUser };" \
  > "$tmp/context-workspace/app/services/order.ts"
printf '%s\n' \
  "const RUNTIME_BASE = '/api/runtimeOrder';" \
  "const RUNTIME_DETAIL = \`\${RUNTIME_BASE}/detail\`;" \
  "const RUNTIME_CANCEL = RUNTIME_BASE + '/cancel';" \
  "export const runtimeOrderDetail = (id) => request({ url: RUNTIME_DETAIL, method: 'get', params: { id } });" \
  "export const runtimeOrderCancel = (id) => request({ url: RUNTIME_CANCEL, method: 'post', data: { id } });" \
  "export async function runtimeOrderArchive(id) {" \
  "  return axios.post(\`\${RUNTIME_BASE}/archive\`, { id });" \
  "}" \
  "export const runtimeOrderFetch = (id) => fetch(RUNTIME_BASE + '/fetch', { method: 'GET' });" \
  > "$tmp/context-workspace/app/services/runtime.ts"
printf '%s\n' \
  "const API_BASE_URL = '/api';" \
  "const httpClient = axios.create({ baseURL: API_BASE_URL });" \
  "export const relativeUserDetail = (id) => httpClient.get('/users/relative', { params: { id } });" \
  > "$tmp/context-workspace/app/services/relative.ts"
printf '%s\n' \
  "'use server';" \
  "const USER_ACTION_PATH = '/api/users/{id}';" \
  "const gql = (strings) => strings[0];" \
  "const graphqlClient = { request: (...args) => args };" \
  "const openapiClient = { PATCH: (...args) => args };" \
  "export async function updateUserAction(id) {" \
  "  return openapiClient.PATCH(USER_ACTION_PATH, { body: { id } });" \
  "}" \
  "export async function loadUserGraphql(id) {" \
  "  return graphqlClient.request(gql\`query LoadUser { user { id name } }\`, { id });" \
  "}" \
  > "$tmp/context-workspace/app/app/actions.ts"
printf '%s\n' \
  "import { updateUserAction, loadUserGraphql } from '../actions';" \
  "export function UserPage() {" \
  "  updateUserAction('1');" \
  "  loadUserGraphql('1');" \
  "  return null;" \
  "}" \
  > "$tmp/context-workspace/app/app/user/page.tsx"
printf '%s\n' \
  '<script>' \
  "import * as userApi from '@/api/user.js';" \
  "import orderApi from '@/services/order';" \
  'export default {' \
  '  methods: {' \
  '    loadUser() { return this.$http("get", userApi.getUser); },' \
  '    createUser() { return this.$http("post", userApi.saveUser, { displayName: "Ada" }); },' \
  '    cancelUser() { return orderApi.cancelUser(1); },' \
  '    updateAssetStatus() { return orderApi.updateAssetStatus(1, "idle"); },' \
  '    finalizeDemoOrder() { return orderApi.finalizeDemoOrder(1); },' \
  '    startDemoPayment() { return orderApi.startDemoPayment(1); },' \
  '    prepareDemoInventory() { return orderApi.prepareDemoInventory(1); },' \
  '    archiveUser() { return orderApi.archiveUser(1); }' \
  '  }' \
  '}' \
  '</script>' \
  > "$tmp/context-workspace/app/pages/user/detail.vue"
printf 'manual project facts\n' > "$tmp/context-workspace/app/project-facts/project.md"
printf '<project><modelVersion>4.0.0</modelVersion></project>\n' > "$tmp/context-workspace/spring-service/pom.xml"
printf '%s\n' \
  'package com.example.demo.controller;' \
  '' \
  'import com.example.demo.dto.CreateUserReq;' \
  'import com.example.demo.dto.UserResponse;' \
  'import org.springframework.web.bind.annotation.GetMapping;' \
  'import org.springframework.web.bind.annotation.PatchMapping;' \
  'import org.springframework.web.bind.annotation.PostMapping;' \
  'import org.springframework.web.bind.annotation.RequestMapping;' \
  'import org.springframework.web.bind.annotation.RequestBody;' \
  'import org.springframework.web.bind.annotation.RestController;' \
  '' \
  '@RestController' \
  '@RequestMapping("/api/users")' \
  'public class UserController {' \
  '  @GetMapping("/{id}")' \
  '  public String getUser() { return "ok"; }' \
  '' \
  '  @PostMapping' \
  '  public UserResponse createUser(@RequestBody CreateUserReq req) { return new UserResponse(); }' \
  '' \
  '  @GetMapping("/relative")' \
  '  public String relativeUser() { return "ok"; }' \
  '' \
  '  @PatchMapping("/{id}")' \
  '  public UserResponse updateUser(@RequestBody CreateUserReq req) { return new UserResponse(); }' \
  '}' \
  > "$tmp/context-workspace/spring-service/src/main/java/com/example/demo/controller/UserController.java"
printf '%s\n' \
  'package com.example.demo.controller;' \
  '' \
  'import org.springframework.web.bind.annotation.GetMapping;' \
  'import org.springframework.web.bind.annotation.PostMapping;' \
  'import org.springframework.web.bind.annotation.RequestMapping;' \
  'import org.springframework.web.bind.annotation.RestController;' \
  '' \
  '@RestController' \
  '@RequestMapping("/api/runtimeOrder")' \
  'public class RuntimeOrderController {' \
  '  @GetMapping("/detail")' \
  '  public String detail() { return "ok"; }' \
  '' \
  '  @PostMapping("/cancel")' \
  '  public String cancel() { return "ok"; }' \
  '' \
  '  @PostMapping("/archive")' \
  '  public String archive() { return "ok"; }' \
  '' \
  '  @GetMapping("/fetch")' \
  '  public String fetch() { return "ok"; }' \
  '}' \
  > "$tmp/context-workspace/spring-service/src/main/java/com/example/demo/controller/RuntimeOrderController.java"
printf '%s\n' \
  'package com.example.demo.dto;' \
  '' \
  'import jakarta.validation.constraints.NotBlank;' \
  '' \
  'public class CreateUserReq {' \
  '  @NotBlank' \
  '  private String name;' \
  '  private Integer age;' \
  '}' \
  > "$tmp/context-workspace/spring-service/src/main/java/com/example/demo/dto/CreateUserReq.java"
printf '%s\n' \
  'package com.example.demo.dto;' \
  '' \
  'public class UserResponse {' \
  '  private Long id;' \
  '  private String name;' \
  '}' \
  > "$tmp/context-workspace/spring-service/src/main/java/com/example/demo/dto/UserResponse.java"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" init --workspace "$tmp/context-workspace" --force >/dev/null
grep -Fq '字段契约' "$tmp/context-workspace/AGENTS.md"
grep -Fq '新旧接口路径' "$tmp/context-workspace/AGENTS.md"
grep -Fq 'ai-context-kit contracts' "$tmp/context-workspace/AGENTS.md"
grep -Fq '同页面相关接口' "$tmp/context-workspace/AGENTS.md"
if rg -n '再读完整索引|再读取完整索引' "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" >/dev/null; then
  printf 'ai-context-kit CLI still suggests reading the full contract index.\n' >&2
  exit 1
fi
grep -Fq 'DTO copy/mapper' "$tmp/context-workspace/spring-service/AGENTS.md"
grep -Fq '同页面相关接口' "$tmp/context-workspace/spring-service/AGENTS.md"
grep -Fq '支付通道' "$tmp/context-workspace/spring-service/AGENTS.md"
test -s "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
test -s "$tmp/context-workspace/spring-service/project-facts/api-contract-map.md"
grep -Fq 'Frontend payload fields' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'Field check' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'CreateUserReq' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '`name*`' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'required-missing: `name`' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'payload-only: `displayName`' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'pages/user/detail.vue' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'services/order.ts' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'cancelUser' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/users/cancel' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'updateAssetStatus' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'finalizeDemoOrder' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'startDemoPayment' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'prepareDemoInventory' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'archiveUser' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/users/archive' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'app/actions.ts' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'updateUserAction' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'loadUserGraphql' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'graphql:LoadUser' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'runtimeOrderDetail' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/runtimeOrder/detail' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'runtimeOrderCancel' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/runtimeOrder/cancel' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'runtimeOrderArchive' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/runtimeOrder/archive' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'runtimeOrderFetch' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/runtimeOrder/fetch' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'relativeUserDetail' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq '/api/users/relative' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'UserController.relativeUser' "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
grep -Fq 'UserResponse' "$tmp/context-workspace/spring-service/project-facts/api-contract-map.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" graph --workspace "$tmp/context-workspace" --output "$tmp/context-graph.json" >/dev/null
grep -Fq '"generatedBy": "ai-context-kit 0.3.55"' "$tmp/context-graph.json"
grep -Fq '"type": "frontend-api"' "$tmp/context-graph.json"
grep -Fq 'runtimeOrderCancel' "$tmp/context-graph.json"
grep -Fq 'endpoint:/api/runtimeOrder/cancel' "$tmp/context-graph.json"
grep -Fq 'RuntimeOrderController.cancel' "$tmp/context-graph.json"
grep -Fq '"type": "request-dto"' "$tmp/context-graph.json"
grep -Fq 'CreateUserReq' "$tmp/context-graph.json"
mkdir -p "$tmp/ab-audit/docs/real-task-ab"
printf '%s\n' \
  '# Backend bug A/B' \
  '' \
  '| 字段 | 内容 |' \
  '| --- | --- |' \
  '| Record ID | 2026-06-08-backend |' \
  '| Task type | backend-bug |' \
  '' \
  '| Question | Answer |' \
  '| --- | --- |' \
  '| 是否计入三类真实任务验证 | yes |' \
  '| 计入哪一类 | backend-bug |' \
  '| B 相比 A 是否减少漏项 | yes |' \
  '| B 相比 A 是否减少 token | no |' \
  '| 质量是否下降 | no |' \
  '| 漏项 | B 读了 `.codex-mem/index.jsonl`，仍扩展到核销服务，并有一次宽 DTO 搜索 |' \
  '| 后续验证 | go test ./core passed |' \
  > "$tmp/ab-audit/docs/real-task-ab/2026-06-08-backend.md"
printf '%s\n' \
  '# Cross-end field partial' \
  '' \
  '| Question | Answer |' \
  '| --- | --- |' \
  '| 是否计入三类完整真实任务 A/B | no |' \
  '| 计入哪一类 | cross-end-field |' \
  '| B 相比 A 是否减少漏项 | mixed |' \
  '| B 相比 A 是否减少 token | yes |' \
  '| 质量是否下降 | unknown |' \
  '| 后续验证 | Not run |' \
  > "$tmp/ab-audit/docs/real-task-ab/2026-06-08-cross-partial.md"
printf 'supporting exec-events summary\n' > "$tmp/ab-audit/docs/real-task-ab/supporting-exec-events.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" real-task-audit --workspace "$tmp/ab-audit" --output "$tmp/ab-audit/docs/audit.md" >/dev/null
grep -Fq '| candidate records | 2 |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| supporting files | 1 |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| counted records | 1 |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| missing categories | `miniapp-integration`, `cross-end-field` |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| process warnings | 3 |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| `backend-bug` | 后端 bug | done |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| `miniapp-integration` | 小程序联调 | missing | - |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| `cross-end-field` | 跨端字段问题 | missing | - |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| `docs/real-task-ab/2026-06-08-backend.md` | 2026-06-08-backend | yes | backend-bug | counted | yes | no | no | go test ./core passed |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| `docs/real-task-ab/2026-06-08-cross-partial.md` | 2026-06-08-cross-partial | no | cross-end-field | not counted: partial evidence | mixed | yes | unknown | Not run |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '| `docs/real-task-ab/supporting-exec-events.md` | missing conclusion |' "$tmp/ab-audit/docs/audit.md"
grep -Fq '后端单接口记录显示读取了 `.codex-mem/index.jsonl`' "$tmp/ab-audit/docs/audit.md"
grep -Fq '后端单接口记录显示有宽 DTO 搜索' "$tmp/ab-audit/docs/audit.md"
grep -Fq '后端单接口记录显示扩展到核销或异步后续链路' "$tmp/ab-audit/docs/audit.md"
if ! grep -Fxq 'manual project facts' "$tmp/context-workspace/app/project-facts/project.md"; then
  printf 'ai-context-kit unexpectedly overwrote non-generated project facts.\n' >&2
  exit 1
fi
if ! grep -Fq 'GET | `/api/users/{id}`' "$tmp/context-workspace/spring-service/project-facts/backend-route-controller-map.md"; then
  printf 'ai-context-kit did not generate the expected Spring GET route.\n' >&2
  exit 1
fi
if grep -Fq '/api/users/api/users' "$tmp/context-workspace/spring-service/project-facts/backend-route-controller-map.md"; then
  printf 'ai-context-kit treated a class-level Spring mapping as a method route.\n' >&2
  exit 1
fi
if grep -R -F "$tmp/context-workspace" \
  "$tmp/context-workspace/AGENTS.md" \
  "$tmp/context-workspace/docs" \
  "$tmp/context-workspace/app/AGENTS.md" \
  "$tmp/context-workspace/app/project-facts" \
  "$tmp/context-workspace/spring-service/AGENTS.md" \
  "$tmp/context-workspace/spring-service/project-facts" >/dev/null; then
  printf 'ai-context-kit generated files unexpectedly contain a temporary absolute path.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "/api/users" --limit 5 > "$tmp/context-contracts.md"
grep -Fq 'API 契约精确筛选' "$tmp/context-contracts.md"
grep -Fq 'CreateUserReq' "$tmp/context-contracts.md"
grep -Fq '建议读取顺序' "$tmp/context-contracts.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --limit 5 > "$tmp/context-contracts-related.md"
grep -Fq '同页面相关接口' "$tmp/context-contracts-related.md"
grep -Fq 'pages/user/detail.vue' "$tmp/context-contracts-related.md"
grep -Fq 'saveUser' "$tmp/context-contracts-related.md"
grep -Fq 'cancelUser' "$tmp/context-contracts-related.md"
grep -Fq 'services/order.ts' "$tmp/context-workspace/app/project-facts/applet-route-api-map.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --frontend-repo app --backend-repo spring-service --limit 5 > "$tmp/context-contracts-filtered.md"
grep -Fq 'frontend=`app`' "$tmp/context-contracts-filtered.md"
grep -Fq 'backend=`spring-service`' "$tmp/context-contracts-filtered.md"
grep -Fq 'saveUser' "$tmp/context-contracts-filtered.md"
if grep -Fq 'cancelUser' "$tmp/context-contracts-filtered.md"; then
  printf 'contracts backend filter unexpectedly kept an unmatched frontend service endpoint.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --frontend-repo app --related cancel --limit 5 > "$tmp/context-contracts-related-cancel.md"
grep -Fq 'related=`cancel`' "$tmp/context-contracts-related-cancel.md"
grep -Fq 'cancelUser' "$tmp/context-contracts-related-cancel.md"
if grep -Fq 'archiveUser' "$tmp/context-contracts-related-cancel.md"; then
  printf 'contracts related cancel filter unexpectedly kept archiveUser.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --frontend-repo app --related device --limit 5 > "$tmp/context-contracts-related-device.md"
grep -Fq 'related=`device`' "$tmp/context-contracts-related-device.md"
grep -Fq 'updateAssetStatus' "$tmp/context-contracts-related-device.md"
if grep -Eq 'finalizeDemoOrder|prepareDemoInventory|startDemoPayment' "$tmp/context-contracts-related-device.md"; then
  printf 'contracts related device filter kept another related type.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --frontend-repo app --related settlement --limit 5 > "$tmp/context-contracts-related-settlement.md"
grep -Fq 'related=`settlement`' "$tmp/context-contracts-related-settlement.md"
grep -Fq 'finalizeDemoOrder' "$tmp/context-contracts-related-settlement.md"
if grep -Eq 'updateAssetStatus|prepareDemoInventory|startDemoPayment' "$tmp/context-contracts-related-settlement.md"; then
  printf 'contracts related settlement filter kept another related type.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --frontend-repo app --related payment --limit 5 > "$tmp/context-contracts-related-payment.md"
grep -Fq 'related=`payment`' "$tmp/context-contracts-related-payment.md"
grep -Fq 'startDemoPayment' "$tmp/context-contracts-related-payment.md"
if grep -Eq 'updateAssetStatus|finalizeDemoOrder|prepareDemoInventory' "$tmp/context-contracts-related-payment.md"; then
  printf 'contracts related payment filter kept another related type.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "getUser" --frontend-repo app --related inventory --limit 5 > "$tmp/context-contracts-related-inventory.md"
grep -Fq 'related=`inventory`' "$tmp/context-contracts-related-inventory.md"
grep -Fq 'prepareDemoInventory' "$tmp/context-contracts-related-inventory.md"
if grep -Eq 'updateAssetStatus|finalizeDemoOrder|startDemoPayment' "$tmp/context-contracts-related-inventory.md"; then
  printf 'contracts related inventory filter kept another related type.\n' >&2
  exit 1
fi
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "runtimeOrderCancel" --frontend-repo app --backend-repo spring-service --limit 5 > "$tmp/context-contracts-runtime.md"
grep -Fq 'runtimeOrderCancel' "$tmp/context-contracts-runtime.md"
grep -Fq '/api/runtimeOrder/cancel' "$tmp/context-contracts-runtime.md"
grep -Fq 'RuntimeOrderController.cancel' "$tmp/context-contracts-runtime.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "relativeUserDetail" --frontend-repo app --backend-repo spring-service --limit 5 > "$tmp/context-contracts-relative.md"
grep -Fq '/api/users/relative' "$tmp/context-contracts-relative.md"
grep -Fq 'UserController.relativeUser' "$tmp/context-contracts-relative.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" contracts --workspace "$tmp/context-workspace" --query "loadUserGraphql" --frontend-repo app --limit 5 > "$tmp/context-contracts-graphql.md"
grep -Fq 'graphql:LoadUser' "$tmp/context-contracts-graphql.md"
grep -Fq 'updateUserAction' "$tmp/context-contracts-graphql.md"
grep -Fq 'app/app/user/page.tsx' "$tmp/context-contracts-graphql.md"
printf '%s\n' '| `app` | `/api/assets/updateAssetStatus` | `updateAssetStatus` | `api/orderApi.js:10` | `spring-service` | `POST /api/assets/updateAssetStatus AssetController.updateAssetStatus` | `AssetStatusUpdateReq`: `id`, `status` | `R<Boolean>` |' >> "$tmp/context-workspace/docs/ai-context-api-contract-map.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem init --workspace "$tmp/context-workspace" >/dev/null
test -s "$tmp/context-workspace/.codex-mem/index.jsonl"
grep -Fq '"frontendPayloadFields"' "$tmp/context-workspace/.codex-mem/index.jsonl"
grep -Fq '"fieldCheck"' "$tmp/context-workspace/.codex-mem/index.jsonl"
grep -Fq '"backendRepo":"spring-service"' "$tmp/context-workspace/.codex-mem/index.jsonl"
grep -Fq '"relatedRepos":["app","spring-service"]' "$tmp/context-workspace/.codex-mem/index.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query users >/dev/null
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query saveUser > "$tmp/codex-mem-contract-search.md"
grep -Fq 'api-contract' "$tmp/codex-mem-contract-search.md"
grep -Fq '/api/users' "$tmp/codex-mem-contract-search.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query "relativeUserDetail" --limit 1 > "$tmp/codex-mem-weighted-search.md"
grep -Fq 'api-contract' "$tmp/codex-mem-weighted-search.md"
grep -Fq '/api/users/relative' "$tmp/codex-mem-weighted-search.md"
cp "$tmp/context-workspace/.codex-mem/index.jsonl" "$tmp/codex-mem-index-small.jsonl"
node -e 'const fs=require("fs"); const file=process.argv[1]; fs.appendFileSync(file, JSON.stringify({id:"large-index-smoke",type:"observation",repo:"app",path:"large-index-smoke.md",title:"large index smoke",summary:"commission-large-index-marker "+"x".repeat(1100000),tokenEstimate:275000})+"\n");' "$tmp/context-workspace/.codex-mem/index.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query "commission-large-index-marker" --limit 1 > "$tmp/codex-mem-large-index-search.md"
grep -Fq 'large-index-smoke.md' "$tmp/codex-mem-large-index-search.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem route --workspace "$tmp/context-workspace" --query "commission-large-index-marker" --limit 3 > "$tmp/codex-mem-large-index-route.md"
grep -Fq 'app: score=' "$tmp/codex-mem-large-index-route.md"
mv "$tmp/codex-mem-index-small.jsonl" "$tmp/context-workspace/.codex-mem/index.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem route --workspace "$tmp/context-workspace" --query "saveUser users detail page" --limit 5 > "$tmp/codex-mem-route.md"
grep -Fq 'codex_mem_route' "$tmp/codex-mem-route.md"
grep -Fq 'app: score=' "$tmp/codex-mem-route.md"
grep -Fq 'spring-service: score=' "$tmp/codex-mem-route.md"
grep -Fq 'saveUser' "$tmp/codex-mem-route.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query "资产 流程 完成" > "$tmp/codex-mem-alias-search.md"
grep -Fq 'api-contract' "$tmp/codex-mem-alias-search.md"
grep -Fq 'updateAssetStatus' "$tmp/codex-mem-alias-search.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem install-hooks --workspace "$tmp/context-workspace" --mode observe >/dev/null
test -s "$tmp/context-workspace/.codex/hooks.json"
test -s "$tmp/context-workspace/.codex/hooks/codex-mem-hook.mjs"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem install-user-hooks --workspace "$tmp/context-workspace" --mode observe --codex-home "$tmp/codex-home" >/dev/null
test -s "$tmp/codex-home/hooks.json"
grep -Fq -- "--scope" "$tmp/codex-home/hooks.json"
grep -Fq "$tmp/context-workspace" "$tmp/codex-home/hooks.json"
session_start_output="$(printf '{"hook_event_name":"SessionStart"}\n' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event SessionStart --mode observe))"
printf '%s\n' "$session_start_output" | grep -Fq 'codex-mem search/route'
if printf '%s\n' "$session_start_output" | grep -Fq 'Use .codex-mem/index.jsonl'; then
  printf 'codex-mem SessionStart still recommends opening .codex-mem/index.jsonl directly.\n' >&2
  exit 1
fi
printf '{"hook_event_name":"PostToolUse","tool_name":"Bash","tool_response":"%s"}\n' "$(printf 'x%.0s' {1..1200})" | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event PostToolUse --mode observe) >/dev/null
stop_output="$(printf '{"hook_event_name":"Stop"}\n' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event Stop --mode observe))"
printf '%s\n' "$stop_output" | grep -Fq 'codex-mem token snapshot'
printf '%s\n' "$stop_output" | grep -Fq 'observed tool output tokens'
cat > "$tmp/context-workspace/docs/ai-context-token-savings-measurement.md" <<'EOF'
# AI 上下文 token 测量报告

生成时间：2026-06-08T00:00:00.000Z

## 父目录全量基线

| 指标 | 数值 |
|---|---:|
| tokens | 10,000 |

## 使用方案后的上下文

| 指标 | 数值 |
|---|---:|
| tokens | 100 |

| 目标仓库 | 单仓基线 tokens | 完整索引 tokens | 相比父目录全量变化 | 相比单仓基线变化 | 轻量模式 tokens | 相比父目录全量变化 | 相比单仓基线变化 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `app` | 5,000 | 500 | 节省 95.00% | 节省 90.00% | 50 | 节省 99.50% | 节省 99.00% |
EOF
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" dashboard --workspace "$tmp/context-workspace" >/dev/null
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" token-status --workspace "$tmp/context-workspace" > "$tmp/token-status.md"
grep -Fq 'routing context: 100 tokens (节省 99.00%)' "$tmp/token-status.md"
grep -Fq 'current session tool output estimate: 300 tokens' "$tmp/token-status.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" token-status --workspace "$tmp/context-workspace" --json --output "$tmp/context-workspace/docs/ai-context-token-status.json" >/dev/null
node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if(data.generatedBy!=="ai-context-kit 0.3.55") process.exit(1); if(data.workspace!==".") process.exit(1); if(data.staticContext.routingTokens!==100) process.exit(1); if(data.hookObserve.currentSession.outputTokens!==300) process.exit(1); if(!data.reports.staticDashboard.exists) process.exit(1); if(data.reports.staticDashboard.path!=="docs/ai-context-token-dashboard.md") process.exit(1);' "$tmp/context-workspace/docs/ai-context-token-status.json"
(cd "$tmp" && "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" token-status --workspace "$tmp/context-workspace" --json --output docs/ai-context-token-status-relative.json >/dev/null)
test -s "$tmp/context-workspace/docs/ai-context-token-status-relative.json"
test ! -e "$tmp/docs/ai-context-token-status-relative.json"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" automation-prompt --workspace "$tmp/context-workspace" --type skill-feedback-candidate > "$tmp/automation-candidate-prompt.txt"
grep -Fq '自动定位候选应该属于哪个业务仓库' "$tmp/automation-candidate-prompt.txt"
grep -Fq 'project-facts/skill-feedback/' "$tmp/automation-candidate-prompt.txt"
grep -Fq '归属冲突' "$tmp/automation-candidate-prompt.txt"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" automation-prompt --workspace "$tmp/context-workspace" --type skill-feedback-review > "$tmp/automation-review-prompt.txt"
grep -Fq '共享 Skill 仓库' "$tmp/automation-review-prompt.txt"
grep -Fq 'Tool/library owner' "$tmp/automation-review-prompt.txt"
mkdir -p "$tmp/context-workspace/.vscode"
printf '%s\n' '{"version":"2.0.0","tasks":[{"label":"existing task","type":"shell","command":"echo ok","problemMatcher":[]}]}' > "$tmp/context-workspace/.vscode/tasks.json"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" editor-tasks --workspace "$tmp/context-workspace" >/dev/null
node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); const labels=data.tasks.map((task)=>task.label); if(!labels.includes("existing task")) process.exit(1); if(!labels.includes("ai-context: onboard workspace")) process.exit(1); if(!labels.includes("ai-context: upgrade workspace context")) process.exit(1); if(!labels.includes("ai-context: token status")) process.exit(1); if(!labels.includes("ai-context: write token status json")) process.exit(1); if(labels.filter((label)=>label==="ai-context: token status").length!==1) process.exit(1); if(labels.filter((label)=>label==="ai-context: write token status json").length!==1) process.exit(1);' "$tmp/context-workspace/.vscode/tasks.json"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" editor-tasks --workspace "$tmp/context-workspace" >/dev/null
node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); const labels=data.tasks.map((task)=>task.label); if(labels.filter((label)=>label==="ai-context: onboard workspace").length!==1) process.exit(1); if(labels.filter((label)=>label==="ai-context: upgrade workspace context").length!==1) process.exit(1); if(labels.filter((label)=>label==="ai-context: token status").length!==1) process.exit(1); if(labels.filter((label)=>label==="ai-context: write token status json").length!==1) process.exit(1);' "$tmp/context-workspace/.vscode/tasks.json"
printf '%s\n' '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":"sed -n '\''1,260p'\'' docs/ai-context-api-contract-map.md"}' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event PreToolUse --mode observe) | grep -Fq 'contracts --workspace'
printf '%s\n' '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":"sed -n '\''1,260p'\'' .codex-mem/index.jsonl"}' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event PreToolUse --mode observe) | grep -Fq 'codex-mem-index-direct-read'
printf '%s\n' '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":"rg NhmInfo utils/plugins/monitor/yk/addElePoint.js"}' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event PreToolUse --mode observe) | grep -Fq 'high-volume-path'
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem install-hooks --workspace "$tmp/context-workspace" --mode compress --threshold 100 >/dev/null
long_tool_output="$(printf '%s\n' \
  'demo-large-output-marker head' \
  'src/orderFlow/order.ts:42: ERROR demo payment failed after createOrder' \
  'example-backend/src/main/java/demo/OrderService.java:88: warning demo status mismatch' \
  "$(printf 'noise line %.0s' {1..140})" \
  'demo-large-output-marker tail')"
compress_response="$(LONG_TOOL_OUTPUT="$long_tool_output" node -e 'const payload={hook_event_name:"PostToolUse",tool_name:"Bash",tool_input:"rg demo-flow src",tool_response:process.env.LONG_TOOL_OUTPUT}; process.stdout.write(JSON.stringify(payload)+"\n");' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event PostToolUse))"
printf '%s\n' "$compress_response" | grep -Fq '"decision":"block"'
printf '%s\n' "$compress_response" | grep -Fq 'codex-mem compressed tool output'
printf '%s\n' "$compress_response" | grep -Fq 'sha256:'
printf '%s\n' "$compress_response" | grep -Fq 'summary:'
printf '%s\n' "$compress_response" | grep -Fq 'ERROR demo payment failed'
printf '%s\n' "$compress_response" | grep -Fq 'src/orderFlow/order.ts:42'
ref_path="$(node -e 'const fs=require("fs"); const file=process.argv[1]; const events=fs.readFileSync(file,"utf8").trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); const event=[...events].reverse().find((item)=>item.compressed&&item.refPath); if(!event) process.exit(1); console.log(event.refPath);' "$tmp/context-workspace/.codex-mem/ledger.jsonl")"
ref_file="$tmp/context-workspace/$ref_path"
test -s "$ref_file"
grep -Fq '# codex-mem tool output ref' "$ref_file"
grep -Fq '## Summary' "$ref_file"
grep -Fq '"outputHash": "sha256:' "$ref_file"
grep -Fq '"outputSummary"' "$ref_file"
grep -Fq 'demo-large-output-marker' "$ref_file"
grep -Fq 'demo-large-output-marker tail' "$ref_file"
grep -Fq '"compressed":true' "$tmp/context-workspace/.codex-mem/ledger.jsonl"
grep -Fq '"outputSummary"' "$tmp/context-workspace/.codex-mem/ledger.jsonl"
ref_hash="$(node -e 'const fs=require("fs"); const file=process.argv[1]; const events=fs.readFileSync(file,"utf8").trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); const event=[...events].reverse().find((item)=>item.compressed&&item.outputHash); if(!event) process.exit(1); console.log(String(event.outputHash).replace(/^sha256:/,""));' "$tmp/context-workspace/.codex-mem/ledger.jsonl")"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem get --workspace "$tmp/context-workspace" --ref "$ref_path" > "$tmp/ref-by-path.md"
grep -Fq 'demo-large-output-marker' "$tmp/ref-by-path.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem get --workspace "$tmp/context-workspace" --hash "$ref_hash" --output "$tmp/ref-by-hash.md" >/dev/null
grep -Fq 'demo-large-output-marker' "$tmp/ref-by-hash.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem timeline --workspace "$tmp/context-workspace" --limit 5 > "$tmp/codex-mem-timeline.md"
grep -Fq 'PostToolUse Bash' "$tmp/codex-mem-timeline.md"
grep -Fq "ref=$ref_path" "$tmp/codex-mem-timeline.md"
grep -Fq 'hash=sha256:' "$tmp/codex-mem-timeline.md"
grep -Fq 'ERROR demo payment failed' "$tmp/codex-mem-timeline.md"
mcp_response="$(printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"check-kit","version":"1"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"codex_mem_search","arguments":{"query":"users","limit":2}}}' \
  '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"codex_mem_get","arguments":{"ref":"'"$ref_hash"'","maxChars":6000}}}' \
  '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"codex_mem_record","arguments":{"title":"Demo flow MCP observation","summary":"MCP record smoke test","repo":"workspace","tags":["smoke"]}}}' \
  '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"codex_mem_timeline","arguments":{"limit":5}}}' \
  '{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"codex_mem_route","arguments":{"prompt":"users detail page","limit":3}}}' \
  '{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"codex_mem_search","arguments":{"query":"saveUser","limit":5}}}' \
  | "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem mcp --workspace "$tmp/context-workspace")"
printf '%s\n' "$mcp_response" | grep -Fq '"protocolVersion":"2025-06-18"'
printf '%s\n' "$mcp_response" | grep -Fq 'codex_mem_search'
printf '%s\n' "$mcp_response" | grep -Fq 'codex_mem_get'
printf '%s\n' "$mcp_response" | grep -Fq 'demo-large-output-marker'
printf '%s\n' "$mcp_response" | grep -Fq 'Recorded observation'
printf '%s\n' "$mcp_response" | grep -Fq 'Demo flow MCP observation'
printf '%s\n' "$mcp_response" | grep -Fq 'spring-service: score='
printf '%s\n' "$mcp_response" | grep -Fq 'related repos: app, spring-service'
test -s "$tmp/context-workspace/.codex-mem/observations.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query "MCP record smoke" | grep -Fq 'Demo flow MCP observation'
cli_record_response="$("$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem record --workspace "$tmp/context-workspace" --title "CLI observation" --summary "CLI record smoke test" --repo app --path services/runtime.ts --tag smoke --tag cli)"
printf '%s\n' "$cli_record_response" | grep -Fq 'Recorded observation: CLI observation'
grep -Fq '"title":"CLI observation"' "$tmp/context-workspace/.codex-mem/observations.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem search --workspace "$tmp/context-workspace" --query "CLI record smoke" | grep -Fq 'CLI observation'
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem timeline --workspace "$tmp/context-workspace" --limit 5 | grep -Fq 'CLI observation'
mcp_header_response="$(node -e 'const msg=JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list",params:{}}); process.stdout.write(`Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`);' | "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem mcp --workspace "$tmp/context-workspace")"
printf '%s\n' "$mcp_header_response" | grep -Fq 'Content-Length:'
printf '%s\n' "$mcp_header_response" | grep -Fq 'codex_mem_search'
mkdir -p "$tmp/no-index-workspace"
no_index_mcp_response="$(printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"codex_mem_search","arguments":{"query":"missing-index","limit":2}}}' | "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem mcp --workspace "$tmp/no-index-workspace")"
printf '%s\n' "$no_index_mcp_response" | grep -Fq 'No codex-mem matches.'
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem config --workspace "$tmp/context-workspace" --name codexMem --output "$tmp/codex-mem-mcp.toml" >/dev/null
grep -Fq '[mcp_servers.codexMem]' "$tmp/codex-mem-mcp.toml"
grep -Fq 'codex-mem", "mcp", "--workspace"' "$tmp/codex-mem-mcp.toml"
grep -Fq 'codex_mem_search' "$tmp/codex-mem-mcp.toml"
grep -Fq 'approval_mode = "approve"' "$tmp/codex-mem-mcp.toml"
grep -Fq 'approval_mode = "prompt"' "$tmp/codex-mem-mcp.toml"
if command -v codex >/dev/null 2>&1 && codex mcp --help >/dev/null 2>&1; then
  tmp_codex_home="$tmp/codex-home-mcp"
  mkdir -p "$tmp_codex_home"
  CODEX_HOME="$tmp_codex_home" codex mcp add codexMem -- "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem mcp --workspace "$tmp/context-workspace" >/dev/null
  CODEX_HOME="$tmp_codex_home" codex mcp list --json > "$tmp/codex-mcp-list.json"
  CODEX_HOME="$tmp_codex_home" codex mcp get codexMem --json > "$tmp/codex-mcp-get.json"
  grep -Fq '"name": "codexMem"' "$tmp/codex-mcp-list.json"
  grep -Fq '"type": "stdio"' "$tmp/codex-mcp-get.json"
  grep -Fq 'ai-context-kit.mjs' "$tmp/codex-mcp-get.json"
fi
refs_before_sensitive="$(find "$tmp/context-workspace/.codex-mem/refs" -type f -name '*.md' | wc -l | tr -d ' ')"
sensitive_response="$(LONG_TOOL_OUTPUT="$long_tool_output" node -e 'const payload={hook_event_name:"PostToolUse",tool_name:"Bash",tool_input:"cat .env",tool_response:process.env.LONG_TOOL_OUTPUT}; process.stdout.write(JSON.stringify(payload)+"\n");' | (cd "$tmp/context-workspace" && node .codex/hooks/codex-mem-hook.mjs --event PostToolUse --mode compress --threshold 100))"
printf '%s\n' "$sensitive_response" | grep -Fq 'sensitive-path'
refs_after_sensitive="$(find "$tmp/context-workspace/.codex-mem/refs" -type f -name '*.md' | wc -l | tr -d ' ')"
test "$refs_before_sensitive" = "$refs_after_sensitive"
node -e 'const fs=require("fs"); const file=process.argv[1]; const events=fs.readFileSync(file,"utf8").trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); if(!events.some((item)=>item.refSkipped==="sensitive-path")) process.exit(1);' "$tmp/context-workspace/.codex-mem/ledger.jsonl"
test -s "$tmp/context-workspace/.codex-mem/ledger.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem dashboard --workspace "$tmp/context-workspace" >/dev/null
test -s "$tmp/context-workspace/docs/codex-mem-dashboard.md"
grep -Fq '已写入 refs 的事件' "$tmp/context-workspace/docs/codex-mem-dashboard.md"
mkdir -p "$tmp/codex-home/sessions/2026/06/06"
printf '%s\n' \
  '{"timestamp":"2026-06-06T00:00:00.000Z","type":"session_meta","payload":{"id":"019e-test-session","cwd":"'"$tmp/context-workspace"'","source":"exec","model_provider":"test"}}' \
  '{"timestamp":"2026-06-06T00:00:01.000Z","type":"event_msg","payload":{"type":"user_message","message":"users test read '"$tmp/context-workspace"'/AGENTS.md and /private/tmp/session-output.md"}}' \
  '{"timestamp":"2026-06-06T00:00:02.000Z","type":"response_item","payload":{"type":"function_call","name":"exec_command"}}' \
  '{"timestamp":"2026-06-06T00:00:03.000Z","type":"event_msg","payload":{"type":"token_count","info":{"total_token_usage":{"input_tokens":1000,"cached_input_tokens":200,"output_tokens":34,"reasoning_output_tokens":5,"total_tokens":1034}}}}' \
  '{"timestamp":"2026-06-06T00:00:04.000Z","type":"event_msg","payload":{"type":"task_complete","duration_ms":4000}}' \
  > "$tmp/codex-home/sessions/2026/06/06/rollout-2026-06-06T00-00-00-019e-test-session.jsonl"
printf '%s\n' \
  '{"timestamp":"2026-06-06T00:10:00.000Z","type":"session_meta","payload":{"id":"019e-test-session-b","cwd":"'"$tmp/context-workspace"'","source":"exec","model_provider":"test"}}' \
  '{"timestamp":"2026-06-06T00:10:01.000Z","type":"event_msg","payload":{"type":"user_message","message":"users test b"}}' \
  '{"timestamp":"2026-06-06T00:10:02.000Z","type":"response_item","payload":{"type":"function_call","name":"exec_command"}}' \
  '{"timestamp":"2026-06-06T00:10:03.000Z","type":"response_item","payload":{"type":"function_call","name":"exec_command"}}' \
  '{"timestamp":"2026-06-06T00:10:04.000Z","type":"event_msg","payload":{"type":"token_count","info":{"total_token_usage":{"input_tokens":1800,"cached_input_tokens":400,"output_tokens":200,"reasoning_output_tokens":80,"total_tokens":2000}}}}' \
  '{"timestamp":"2026-06-06T00:10:05.000Z","type":"event_msg","payload":{"type":"task_complete","duration_ms":6000}}' \
  > "$tmp/codex-home/sessions/2026/06/06/rollout-2026-06-06T00-10-00-019e-test-session-b.jsonl"
printf '%s\n' \
  '{"timestamp":"2026-06-06T00:20:00.000Z","type":"session_meta","payload":{"id":"019e-test-session-failed","cwd":"'"$tmp/context-workspace"'","source":"exec","model_provider":"test"}}' \
  '{"timestamp":"2026-06-06T00:20:01.000Z","type":"event_msg","payload":{"type":"user_message","message":"users test failed"}}' \
  '{"timestamp":"2026-06-06T00:20:02.000Z","type":"error","message":"Your workspace is out of credits. Ask your workspace owner to refill in order to continue."}' \
  '{"timestamp":"2026-06-06T00:20:03.000Z","type":"turn.failed","error":{"message":"Your workspace is out of credits. Ask your workspace owner to refill in order to continue."}}' \
  > "$tmp/codex-home/sessions/2026/06/06/rollout-2026-06-06T00-20-00-019e-test-session-failed.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem sessions --workspace "$tmp/context-workspace" --codex-home "$tmp/codex-home" --days 365 --output "$tmp/context-workspace/docs/codex-session-usage.md" >/dev/null
grep -Fq '1,034' "$tmp/context-workspace/docs/codex-session-usage.md"
grep -Fq '019e-test-session' "$tmp/context-workspace/docs/codex-session-usage.md"
grep -Fq '<tmp>/' "$tmp/context-workspace/docs/codex-session-usage.md"
if grep -Fq "$tmp" "$tmp/context-workspace/docs/codex-session-usage.md" \
  || grep -Eq '/private/tmp|/tmp/session-output|/var/folders' "$tmp/context-workspace/docs/codex-session-usage.md"; then
  printf 'codex session report left a local absolute path in output.\n' >&2
  exit 1
fi
grep -Fq '| failed sessions | 1 |' "$tmp/context-workspace/docs/codex-session-usage.md"
grep -Fq '| 2026-06-06 00:20:00Z | `019e-test-session-failed` | exec | failed | 0 | 0 | 0 | 0 | 0 | 0 | - | Your workspace is out of credits. Ask your workspace owner to refill in order to continue. | users test failed |' "$tmp/context-workspace/docs/codex-session-usage.md"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem sessions --workspace "$tmp/context-workspace" --codex-home "$tmp/codex-home" --days 365 --session 019e-test-session --session 019e-test-session-b --output "$tmp/context-workspace/docs/codex-session-ab.md" >/dev/null
grep -Fq '筛选 session：`019e-test-session`, `019e-test-session-b`' "$tmp/context-workspace/docs/codex-session-ab.md"
grep -Fq '## 选中会话对比' "$tmp/context-workspace/docs/codex-session-ab.md"
grep -Fq '| `019e-test-session-b` | 2,000 | +966 (+93.4%) | +800 (+80.0%) | +200 (+100.0%) | +166 (+488.2%) | +75 (+1500.0%) | +1 (+100.0%) | +2.0s (+50.0%) |' "$tmp/context-workspace/docs/codex-session-ab.md"
printf '%s\n' \
  '{"type":"thread.started","thread_id":"019e-exec-success"}' \
  '{"type":"turn.started"}' \
  '{"type":"item.started","item":{"id":"item_0","type":"mcp_tool_call","server":"codexMem","tool":"codex_mem_route","status":"in_progress"}}' \
  '{"type":"item.completed","item":{"id":"item_0","type":"mcp_tool_call","server":"codexMem","tool":"codex_mem_route","status":"completed","result":{"content":[{"type":"text","text":"ok"}]}}}' \
  '{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"/bin/zsh -lc pwd","aggregated_output":"","exit_code":null,"status":"in_progress"}}' \
  '{"type":"item.completed","item":{"id":"item_1","type":"command_execution","command":"/bin/zsh -lc pwd","aggregated_output":"/tmp/example\n","exit_code":0,"status":"completed"}}' \
  '{"type":"item.completed","item":{"id":"item_1","type":"agent_message","text":"done"}}' \
  '{"type":"turn.completed","usage":{"input_tokens":1200,"cached_input_tokens":500,"output_tokens":120,"reasoning_output_tokens":30}}' \
  > "$tmp/exec-success-events.jsonl"
printf '%s\n' \
  '{"type":"thread.started","thread_id":"019e-exec-failed"}' \
  '{"type":"turn.started"}' \
  '{"type":"error","message":"Reconnecting... 2/5 (request timed out)"}' \
  '{"type":"error","message":"unexpected status 401 Unauthorized: Incorrect API key provided: '"$fake_openai_key"'"}' \
  '{"type":"turn.failed","error":{"message":"unexpected status 401 Unauthorized: Incorrect API key provided: '"$fake_openai_key"'"}}' \
  > "$tmp/exec-failed-events.jsonl"
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" codex-mem exec-events --workspace "$tmp/context-workspace" --events "$tmp/exec-success-events.jsonl" --events "$tmp/exec-failed-events.jsonl" --output "$tmp/context-workspace/docs/codex-exec-events.md" >/dev/null
grep -Fq '| succeeded files | 1 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '| failed files | 1 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '| MCP calls | 1 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '| tool calls | 1 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '| total tokens | 1,320 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '| `codex_mem_route` | 1 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '| `command_execution: pwd` | 1 |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '## 事件文件对比' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '基准文件：`' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq 'exec-success-events.jsonl' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq 'exec-failed-events.jsonl' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '<tmp>/' "$tmp/context-workspace/docs/codex-exec-events.md"
if grep -Fq "$tmp" "$tmp/context-workspace/docs/codex-exec-events.md" \
  || grep -Eq '/private/tmp|/tmp/exec|/var/folders' "$tmp/context-workspace/docs/codex-exec-events.md"; then
  printf 'exec-events report left a local absolute path in output.\n' >&2
  exit 1
fi
grep -Fq '| failed | 0 | -1,320 (-100.0%) | -1,200 (-100.0%) | -120 (-100.0%) | -30 (-100.0%) | -1 (-100.0%) | -1 (-100.0%) | -3 (-37.5%) |' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '019e-exec-success' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq '019e-exec-failed' "$tmp/context-workspace/docs/codex-exec-events.md"
grep -Fq 'sk-***REDACTED***' "$tmp/context-workspace/docs/codex-exec-events.md"
if grep -Fq "$fake_openai_key" "$tmp/context-workspace/docs/codex-exec-events.md"; then
  printf 'exec-events report left a sensitive test value in output.\n' >&2
  exit 1
fi

node --check "$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" >/dev/null
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" doctor --workspace "$tmp/target" >/dev/null
"$repo_root/packages/ai-context-kit/bin/ai-context-kit.mjs" context doctor --workspace "$tmp/target" >/dev/null

printf 'Project Facts Kit checks passed.\n'
