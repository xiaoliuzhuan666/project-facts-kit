# ai-context-kit

`ai-context-kit` generates lightweight Codex app context files and token
measurement reports for multi-repo workspaces:

- parent-folder `AGENTS.md` for multi-repo routing
- child-repository `AGENTS.md`
- `project-facts/project.md`
- `project-facts/verification.md`
- `project-facts/context-boundary.md`
- Spring endpoint maps
- Go repository detection and `go test` verification hints
- uni-app page/API maps
- workspace and backend API contract maps
- workspace context-scope reports
- token measurement reports
- optional CodeGraph initialization
- codex-mem observe/compress hooks and local token ledger

It is designed for local repositories that should not be scanned from a large parent directory.

For teams that open a parent folder in Codex app, the generated parent `AGENTS.md`
turns that folder into a short routing layer. Codex should pick one main child
repository before reading source files.

Start from `docs/ai-context-kit-operating-workflow.zh-CN.md` when using this in
daily work. The workflow keeps the default path small: route first, query
contracts for cross-end tasks, read selected source files, then record evidence.
Use `docs/ai-context-kit-real-task-ab-template.zh-CN.md` when comparing real
tasks; smoke tests and single command hits are not enough to enable experimental
features by default. Store filled records under `docs/real-task-ab/`.

## Usage

For teammates using the shared kit from the public GitHub repository, prepare the
machine once:

```bash
bash -lc 'set -e; KIT="$HOME/.cache/project-facts-kit"; REPO="https://github.com/xiaoliuzhuan666/project-facts-kit.git"; BRANCH="${PROJECT_FACTS_KIT_BRANCH:-main}"; mkdir -p "$(dirname "$KIT")"; if [ -e "$KIT" ] && [ ! -d "$KIT/.git" ]; then BK="$KIT.non-git-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-git kit moved to $BK"; fi; if [ -d "$KIT/.git" ]; then if [ -n "$(git -C "$KIT" status --porcelain)" ]; then BK="$KIT.dirty-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing dirty kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; else git -C "$KIT" fetch origin "$BRANCH:refs/remotes/origin/$BRANCH"; git -C "$KIT" switch "$BRANCH" 2>/dev/null || git -C "$KIT" switch -c "$BRANCH" "origin/$BRANCH"; git -C "$KIT" pull --ff-only origin "$BRANCH" || { BK="$KIT.diverged-$(date +%Y%m%d%H%M%S)"; mv "$KIT" "$BK"; echo "Existing non-ff kit moved to $BK"; git clone --branch "$BRANCH" "$REPO" "$KIT"; }; fi; else git clone --branch "$BRANCH" "$REPO" "$KIT"; fi; "$KIT/scripts/setup-local-kit.sh"'
```

The setup script links `ai-context-kit` and `project-facts-kit` with `npm link`
and installs the shared Codex skills into the user skill directory. If the clone
fails for the GitHub repository, fix repository access before using the
project prompts.

For the full update command list, see
`docs/project-facts-kit-update-commands.zh-CN.md` in the repository root.

```bash
ai-context-kit doctor --workspace /path/to/workspace
ai-context-kit onboard --workspace /path/to/workspace
ai-context-kit upgrade --workspace /path/to/workspace
ai-context-kit init --workspace /path/to/workspace
ai-context-kit repair --workspace /path/to/workspace
ai-context-kit facts --workspace /path/to/workspace
ai-context-kit agents --workspace /path/to/workspace
ai-context-kit measure --workspace /path/to/workspace
ai-context-kit tokens --workspace /path/to/workspace
ai-context-kit summary --workspace /path/to/workspace
ai-context-kit dashboard --workspace /path/to/workspace
ai-context-kit token-status --workspace /path/to/workspace
ai-context-kit token-status --workspace /path/to/workspace --json --output docs/ai-context-token-status.json
ai-context-kit editor-tasks --workspace /path/to/workspace
ai-context-kit automation-prompt --workspace /path/to/workspace --type skill-feedback-candidate
ai-context-kit contracts --workspace /path/to/workspace --query "/api/orders"
ai-context-kit contracts --workspace /path/to/workspace --query "saveOrderInfo" --frontend-repo frontend-app
ai-context-kit contracts --workspace /path/to/workspace --query "saveOrderInfo" --backend-repo order-api
ai-context-kit contracts --workspace /path/to/workspace --query "saveOrderInfo" --related payment
ai-context-kit real-task-audit --workspace /path/to/workspace
ai-context-kit graph --workspace /path/to/workspace --output docs/ai-context-graph.json
ai-context-kit redact --input /tmp/codex-events.jsonl --output /tmp/codex-events.redacted.jsonl
ai-context-kit codegraph --workspace /path/to/workspace --repos frontend-app
ai-context-kit codex-mem init --workspace /path/to/workspace
ai-context-kit codex-mem route --workspace /path/to/workspace --query "order refund"
ai-context-kit codex-mem timeline --workspace /path/to/workspace --limit 20
ai-context-kit codex-mem get --workspace /path/to/workspace --ref .codex-mem/refs/2026-06-07/example.md
ai-context-kit codex-mem record --workspace /path/to/workspace --title "Finding" --summary "Short observation" --tag smoke
ai-context-kit codex-mem mcp --workspace /path/to/workspace
ai-context-kit codex-mem config --workspace /path/to/workspace --output codex-mem-mcp.toml
ai-context-kit codex-mem install-hooks --workspace /path/to/workspace --mode observe
ai-context-kit codex-mem install-hooks --workspace /path/to/workspace --mode compress --threshold 8000
ai-context-kit codex-mem install-user-hooks --workspace /path/to/workspace --mode observe
ai-context-kit codex-mem dashboard --workspace /path/to/workspace
ai-context-kit codex-mem sessions --workspace /path/to/workspace
ai-context-kit codex-mem sessions --workspace /path/to/workspace --session 019e-a --session 019e-b
ai-context-kit codex-mem exec-events --workspace /path/to/workspace --events /tmp/codex-events.jsonl
```

Run `onboard` for first intake when writing generated workflow files is
acceptable. It generates missing workflow artifacts only, then prints `doctor`
and `token-status` so an agent or editor task can show one status summary. Run
`upgrade` when an already-adopted workspace should refresh generated maps,
reports and indexes from the current repository state, then print the same
status summary. Run `doctor` first when you only want a read-only check. Use
`agents` or `repair` when the current project has gaps: they generate the
missing workflow artifacts only, such as AGENTS, ai-context docs, project-facts
skeletons, the scope report or the local `.codex-mem/index.jsonl` used by
`codex-mem route/search`. Use `init` when you want to regenerate generated maps,
reports and indexes from the current repository state. `doctor` reports
two groups: `workflow artifacts` for routing files and generated indexes, and
`capability status` for CodeGraph, contract index, static token reports, token
dashboard, observe hooks, session token usage, graph output, real-task A/B
evidence, and local redaction. These statuses are a health view only. They do
not initialize CodeGraph automatically, do not modify project facts, and do not
turn static token measurements into quality or billing claims. `doctor` also
reports existing generated contract maps as `stale` when they are missing the
current `Frontend payload fields` or `Field check` columns; refresh those with
`init`, not `agents`. `contracts` and `codex-mem search/route` also print a
warning when they read stale generated artifacts, so direct queries do not look
like fresh contract data.

By default, existing `AGENTS.md` and `project-facts/` files are not overwritten. Use `--force` only when you intentionally want to regenerate files that already contain the `generated-by: ai-context-kit` marker. Non-generated project facts are skipped even with `--force`.

CodeGraph is intentionally not initialized for every child repository at once.
Use `--repos <name>` to select a single repository.

`automation-prompt` prints Codex app automation prompts only. It does not create
or update automations. Use `--type skill-feedback-candidate` for a business
workspace or parent folder that should summarize daily shared-skill candidates,
and `--type skill-feedback-review` for the shared Skill repository review job.
The business prompt first asks for a per-repository inventory of today's
commits, uncommitted diffs, generated project-facts artifacts, remote sync
state, business changes, verification, and reusable skill/tooling candidates.
It then routes candidates to child repositories from today's evidence, so users
do not need to specify every child repository path.

## codex-mem observe mode and experimental compress mode

`codex-mem` is a lightweight Codex app adaptation of the `claude-mem` idea:
index first, retrieve details only when needed, and measure long tool outputs.

```bash
ai-context-kit codex-mem init --workspace /path/to/parent
ai-context-kit codex-mem search --workspace /path/to/parent --query "order refund"
ai-context-kit codex-mem route --workspace /path/to/parent --query "order refund"
ai-context-kit codex-mem timeline --workspace /path/to/parent --limit 20
ai-context-kit codex-mem get --workspace /path/to/parent --ref <ref-path-or-sha256>
ai-context-kit codex-mem record --workspace /path/to/parent --title "Finding" --summary "Short observation" --tag smoke
ai-context-kit codex-mem mcp --workspace /path/to/parent
ai-context-kit codex-mem config --workspace /path/to/parent --output codex-mem-mcp.toml
ai-context-kit codex-mem install-hooks --workspace /path/to/parent --mode observe
ai-context-kit codex-mem install-hooks --workspace /path/to/parent --mode compress --threshold 8000
ai-context-kit codex-mem install-user-hooks --workspace /path/to/parent --mode observe
ai-context-kit codex-mem dashboard --workspace /path/to/parent
ai-context-kit codex-mem sessions --workspace /path/to/parent
ai-context-kit codex-mem sessions --workspace /path/to/parent --session 019e-a --session 019e-b
ai-context-kit codex-mem exec-events --workspace /path/to/parent --events /tmp/codex-a-events.jsonl --events /tmp/codex-b-events.jsonl
```

`install-hooks` writes project-local files under `<workspace>/.codex/` and local
runtime data under `<workspace>/.codex-mem/`. In `observe` mode the hooks record
token estimates and give short hints, but they do not block or rewrite tool
calls. The hints prefer `codex-mem search/route` over opening
`.codex-mem/index.jsonl` directly, and warn when a command tries to read the
local index or a full contract map. Use the dashboard to decide whether compress
mode is worth testing. On `Stop`, the hook returns a local token snapshot with
the static dashboard path, observed tool input/output estimates, large-output
count, and compression projection. Treat this as visibility, not billing data
or a quality result.

Use `token-status` when an editor, terminal panel, or team script needs a short
read-only status view. Add `--json --output docs/ai-context-token-status.json`
when an IDE panel, plugin, or team script needs structured fields. Use
`editor-tasks` to add VS Code-compatible tasks for token status, token status
JSON, static token measurement, dashboard refresh, session usage, and Codex
observe hook installation. Existing unrelated tasks are preserved.

`compress` mode is experimental. For large non-sensitive `PostToolUse` outputs,
it writes the full output to `<workspace>/.codex-mem/refs/<date>/*.md` with
metadata, structured summary, SHA-256 hash and original output, then returns a
short ref message. The summary keeps output size, important error/warning lines,
file/path lines, and head/tail snippets. If the tool call matches sensitive paths such as `.env`,
`application*.yml`, `*.pem` or `*.key`, no ref file is written. Do not enable it
by default until real task A/B checks show that answer quality is unchanged.

Use `codex-mem get --ref <ref-path-or-sha256>` to read a stored ref by path or
SHA-256 hash. Add `--output <file>` when you want to save the ref content
instead of printing it to stdout.

Use `codex-mem timeline --limit 20` to inspect recent hook events and
observations. Timeline rows include ref paths, short hashes and the first useful
summary line, so long-output errors can be found before reading the full ref.

Use `codex-mem record --title ... --summary ...` to add a local observation
from a shell or script. Records are stored in `.codex-mem/observations.jsonl`
and are available through `codex-mem search`, `timeline`, and the MCP server.

`codex-mem mcp` starts a local stdio MCP server with these smoke-tested tools:
`codex_mem_search`, `codex_mem_get`, `codex_mem_route`,
`codex_mem_timeline`, and `codex_mem_record`. The server uses local
`.codex-mem/` files only; it does not call network services.

`codex-mem search` and `route` still use the local JSONL index, but API contract
entries are scored with structured field weights so exact endpoint, symbol,
handler and repository matches rank above generic summary text.

`codex-mem config` prints a Codex `config.toml` snippet for the local MCP
server. Review it before copying it into a user-level or trusted workspace
config. See `docs/codex-mem-mcp-codex-config.zh-CN.md` in this repository for
the current connection notes.

For a parent workspace that is not itself a Git repository, current Codex builds
may not load project-local hooks. `install-user-hooks` also writes a guarded
`$CODEX_HOME/hooks.json` entry that only records sessions whose cwd is inside
the selected workspace.

`sessions` scans `$CODEX_HOME/sessions/**/*.jsonl` and writes
`docs/codex-session-usage.md` with total/input/cached/output/reasoning tokens,
tool calls, duration, session status, failure messages and prompt snippets for
sessions under the workspace. Prompt snippets and failure messages are redacted
before they are written, including local user and temporary paths. Pass
`--session <id>` more than once to generate a focused A/B report; the first
selected session is used as the baseline for the comparison table.

`exec-events` summarizes raw `codex exec --json` event files. It records thread
id, status, errors, MCP/tool calls and usage when present, adds a baseline
comparison table when multiple event files are passed, and redacts common
secrets before writing `docs/codex-exec-events.md`. Event file paths outside the
workspace are rendered as `<tmp>/...`, `~/...`, or `<external>/...` instead of
local absolute paths.

`real-task-audit` reads `docs/real-task-ab/*.md`, counts only records whose
conclusion explicitly marks them as a valid real-task A/B sample, and writes
`docs/ai-context-kit-real-task-ab-audit.md`. Session reports, exec-event
reports and patches remain supporting evidence unless a task record points to
them and marks the task as counted. Backend single-endpoint records also get
process warnings when the record mentions direct local-index reads, wide DTO
searches, or deep write-off/async chains.

Do not commit `.codex-mem/ledger.jsonl` or `.codex-mem/refs/`. They may contain
local tool metadata or raw tool outputs.

The top-level `ai-context-kit init` command also writes the local
`.codex-mem/index.jsonl` so route/search works immediately after initialization.
It does not install hooks or enable compress mode.

Use `redact` before sharing Codex event logs, stderr logs, API responses or task
trace snippets:

```bash
ai-context-kit redact --input /tmp/codex-events.jsonl --output /tmp/codex-events.redacted.jsonl
```

The first version is rule-based. It masks common API keys, Authorization/Cookie
headers, secret-like fields, email addresses, phone numbers, user home paths and
URL passwords. It is not a compliance or anonymization guarantee; review the
output before sharing.

## Recommended team flow

```bash
ai-context-kit doctor --workspace /path/to/parent
ai-context-kit onboard --workspace /path/to/parent
ai-context-kit agents --workspace /path/to/parent
# or: ai-context-kit repair --workspace /path/to/parent
# use upgrade or init when doctor reports stale generated maps, or when regenerating
# generated maps/reports/indexes from the current repository state:
ai-context-kit upgrade --workspace /path/to/parent
ai-context-kit init --workspace /path/to/parent
ai-context-kit measure --workspace /path/to/parent
ai-context-kit tokens --workspace /path/to/parent
ai-context-kit dashboard --workspace /path/to/parent
ai-context-kit token-status --workspace /path/to/parent
ai-context-kit token-status --workspace /path/to/parent --json --output docs/ai-context-token-status.json
ai-context-kit editor-tasks --workspace /path/to/parent
```

When installed from the root `project-facts-kit` package, the same commands are
available through:

```bash
project-facts-kit context doctor --workspace /path/to/parent
project-facts-kit context onboard --workspace /path/to/parent
project-facts-kit context upgrade --workspace /path/to/parent
project-facts-kit context repair --workspace /path/to/parent
project-facts-kit context init --workspace /path/to/parent
project-facts-kit context measure --workspace /path/to/parent
project-facts-kit context tokens --workspace /path/to/parent
project-facts-kit context dashboard --workspace /path/to/parent
project-facts-kit context token-status --workspace /path/to/parent
project-facts-kit context editor-tasks --workspace /path/to/parent
```

Start with `onboard` before searching broadly from a parent folder when writing
generated workflow files is acceptable. Use `doctor` for a read-only check. Read
both `workflow artifacts` and `capability status`. Use `agents` or `repair` for
missing workflow artifacts, and use `upgrade` or `init` for stale generated maps
or an intentional regeneration pass. Treat CodeGraph and token reports as opt-in
capabilities: enable or refresh them only when the status and task justify it.

Cross-repository field and endpoint checks should start from
`docs/ai-context-api-contract-map.md` when it exists. Java repositories also get
`project-facts/api-contract-map.md` with Controller, request DTO field and
response type hints. The workspace map also includes frontend payload fields
from common page or component call sites, so DTO checks can compare the actual
request object with backend request fields. When validation annotations such as
`@NotNull`, `@NotBlank` or `@NotEmpty` are visible, the map adds conservative
field-check hints for missing required DTO fields and payload-only fields.

Use `contracts` to avoid reading a full contract map:

```bash
ai-context-kit contracts --workspace /path/to/parent --query "saveOrderInfo|/api/order/saveOrderInfo"
ai-context-kit contracts --workspace /path/to/parent --query "saveOrderInfo" --frontend-repo app
ai-context-kit contracts --workspace /path/to/parent --query "saveOrderInfo" --backend-repo backend
ai-context-kit contracts --workspace /path/to/parent --query "saveOrderInfo" --related payment
```

The command filters workspace and backend contract maps by endpoint, symbol,
DTO, handler, page or API wrapper text. It also inspects frontend imports around
matched API wrappers and lists same-page related endpoints, which helps catch
order creation, payment start, device state, cancel and failure paths without
reading a full contract map. The frontend endpoint scanner also handles local
path constants, string concatenation, simple template literals, common SDK
client calls such as `client.GET('/api/...')`, GraphQL `gql`/`graphql`
operations, Next/React-style `actions.ts` API wrappers, and common `baseURL` /
API prefix configuration for relative paths. It can also extract top-level
payload fields from common call shapes such as `$http(method, endpoint, data)`,
`request({ url, data })`, `axios.post(endpoint, data)` and
`client.PATCH(endpoint, { body })`. It is not tied to any one project.

Use `--frontend-repo` and `--backend-repo` when a parent workspace contains
multiple apps or services. Use `--related <payment|refund|cancel|device|settlement|booking|inventory|insurance|order>`
when the exact match is useful but the same-page related endpoint list is too
noisy.

Use `graph` to write a lightweight JSON graph of workspace repos, frontend API
wrappers, endpoints, backend handlers and DTO nodes. It is meant as a stable
input for future dashboards or impact analysis, not as a replacement for source
review.

Commit newly generated `AGENTS.md`, `docs/ai-context-*.md`, and missing
`project-facts/` index files only after review. Do not replace existing project
facts with generated output, and do not commit `.codegraph/` or temporary
Repomix outputs under `/tmp`. Generated Markdown should not contain local
absolute workspace paths; review repository remotes and any copied report before
committing.

The `tokens` command requires `npx` and runs `repomix@latest`; `ai-context-kit`
also checks common nvm locations when GUI app shells do not include `npx` on
`PATH`. `summary` prints a short savings summary from the latest token report.
`dashboard` writes `docs/ai-context-token-dashboard.md` from the latest token
report without rescanning source files. `token-status` reads the latest token
report plus `.codex-mem/ledger.jsonl`, and does not rescan source files. Its
JSON mode writes relative report paths and raw token numbers for editor panels
or downstream tooling.
For very small repositories, the measured context index can be larger than the
source baseline; use the report as a measurement, not as a guaranteed savings
claim.

## Notes

The generated guidance tells Codex not to read common sensitive or high-volume paths:

- `src/main/resources/application*.yml`
- `src/main/resources/application*.yaml`
- `src/main/resources/cert/**`
- `.env*`
- `*.pem`
- `*.key`
- `doc/sql/**`
- `**/*.min.js`
- `uview-ui/**`
- `utils/plugins/monitor/**`
- `src/main/resources/vm/**`
- `node_modules/**`
- `target/**`
- `dist/**`
- `unpackage/**`
- `.codegraph/**`

## External tool check

Checked on 2026-06-06:

- `repomix@latest` is used only by the `tokens` command through `npx`; `/usr/local/bin/npm view repomix` reported latest `1.14.1`, and `npx repomix@latest --help` confirmed `--stdin`, `--token-count-encoding`, `--top-files-len`, `--style` and `--no-security-check`.
- CodeGraph is optional. `/usr/local/bin/npm view @colbymchenry/codegraph` reported latest `0.9.9`, and `npx @colbymchenry/codegraph@0.9.9 --help` confirmed `init`, `status`, `query` and related commands.

Install CodeGraph separately only when a target repository needs symbol queries:

```bash
npm install -g @colbymchenry/codegraph@0.9.9
```
