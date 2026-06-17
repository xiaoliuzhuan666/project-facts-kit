# ai-context-kit 真实任务 A/B 记录：Vola Skill 与 MCP 管理审查

整理日期：2026-06-15

## 记录表

| 字段 | 内容 |
| --- | --- |
| Record ID | `2026-06-15-vola-skill-mcp-management-audit` |
| Task type | `tooling-analysis / skill-mcp-management` |
| Workspace | `<workspace:Vola>` |
| Repos involved | `Vola` |
| Revision checked | `6fd35a4`, branch `codex/xlzdrive-desktop-app`, dirty worktree present before the task |
| ai-context-kit version | `ai-context-kit 0.3.56` |
| Prompt | 检查 Vola 项目中个人 Skill、MCP 管理、不同 Agent/编辑器一致理解是否还有优化点 |
| Expected task output | 优化建议、证据路径、读取文件、未验证项 |
| Index status | `doctor` found one repo and missing `AGENTS.md`, `project-facts/project.md`, `project-facts/context-boundary.md`, `project-facts/verification.md`, `docs/ai-context-scope-report.md`, `.codex-mem/index.jsonl`; no `agents` / `repair` / `init` was run |
| Non-goals | 不修改 Vola 文件；不读取 `.env`、`neudrive.env`、`vola.env`、证书、密钥、构建产物 |

Raw `codex exec --json` event files were kept under local `/tmp` only because they contain machine paths and plugin/MCP startup warnings. They are not committed.

## 分组结果

| Group | Context tools used | Files read | Contract coverage | Verification | Tokens | Tool calls | Duration | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | Ordinary read-only Codex flow; no ai-context-kit | README/docs; platform, Skill, MCP, system skill and UI files | Not applicable; this task is product/tooling analysis, not endpoint contract work | No tests inside A | input `2,841,347`, cached input `2,637,824`, output `9,530`, reasoning `2,212` | 67 command executions | about 6m20s | Found 7 useful issues, stronger on code-level duplication and config-writing risks |
| B | `ai-context-kit doctor`, then read-only low-token routing with precise docs/source windows | README/docs/systemskills and targeted scripts; no generated ai-context artifacts | Not applicable | No tests inside B | input `1,692,009`, cached input `1,518,976`, output `13,124`, reasoning `5,127` | 52 command executions | about 6m35s | Found 8 useful issues, stronger on missing repository instructions, status drift and onboarding gaps |
| Local review | Main thread source review plus targeted tests | `team_mcp.go`, `TeamLibraryPage.tsx`, `platforms.go`, `local_skill_sync.go`, `skill_quality_gate.go`, MCP health and docs | Not applicable | Relevant Go tests passed | Not measured as separate Codex exec group | Not measured | Not measured | Added one higher-confidence finding: team MCP `tags` are sent by frontend and consumed by platform injection, but not persisted by backend |

## 质量判定

| 检查项 | A | B | Local review | Notes |
| --- | --- | --- | --- | --- |
| 选对仓库 | yes | yes | yes | Vola is a single repo; doctor confirmed one repo |
| 选对入口文件 | yes | yes | yes | Both groups found README/docs and Skill/MCP source areas |
| 前端当前路径已核对 | partial | partial | yes | Local review checked `web/src/pages/TeamLibraryPage.tsx` and `web/src/api.ts` for team MCP fields |
| 后端 Controller 路径已核对 | partial | partial | yes | Local review checked `internal/api/team_mcp.go`, `local_skill_sync.go`, `mcp_client_registry.go` |
| 请求 DTO 字段已核对 | partial | partial | yes | Local review found frontend `tags` has no backend `teamMcpSaveRequest` field |
| 响应 DTO 字段已核对 | partial | partial | yes | Local review checked `TeamMcpAsset` and `teamMcpAsset` shape |
| 同页面相关接口已查看 | no | partial | yes | Local review checked team MCP save/list and platform consumption |
| 状态、支付、失败或取消路径已查看 | na | na | na | Not an order/payment/state task |
| 修改或建议可复用到通用项目 | yes | yes | yes | Missing instructions, capability matrix and schema drift checks apply to other agent-data tools |
| 漏项 | Missed missing ai-context workflow artifacts and team MCP `tags` persistence | Missed some code-level risks found by A, especially Claude Desktop direct token/config write | Not a full independent agent group | Combined result is stronger than either group alone |

## Vola 优化建议

| Priority | Finding | Evidence | Suggested action |
| --- | --- | --- | --- |
| P1 | Team MCP `tags` likely do not persist. Frontend sends `tags`, platform injection filters by `Tags`, but backend team MCP asset/request structs do not include `tags`. | `<workspace:Vola>/web/src/pages/TeamLibraryPage.tsx:695`, `<workspace:Vola>/web/src/api.ts:868`, `<workspace:Vola>/web/src/api.ts:905`, `<workspace:Vola>/internal/api/team_mcp.go:22`, `<workspace:Vola>/internal/api/team_mcp.go:58`, `<workspace:Vola>/internal/platforms/platforms.go:937`, `<workspace:Vola>/internal/platforms/platforms.go:1119` | Add `Tags []string` to backend request/asset, normalize and render it, and add a test that saves a tagged MCP then verifies platform injection filters by `.volarc`/connection tags. |
| P1 | Vola itself lacks root Agent onboarding files. | `ai-context-kit doctor --workspace <workspace:Vola>` reported missing `AGENTS.md`, `project-facts/*`, `docs/ai-context-scope-report.md`, `.codex-mem/index.jsonl`; `<workspace:Vola>/docs/ai-multi-project-requirements-continuity-research.zh-CN.md:172` and `:323` describe the desired read order. | Add a root `AGENTS.md` and lightweight project facts for Vola, especially sensitive files, generated dist policy, Skill/MCP verification commands and current handover. |
| P1 | Claude Desktop one-click MCP registration uses direct `--token` and `os.WriteFile`, while platform adapters already have safer config update logic. | `<workspace:Vola>/internal/api/mcp_client_registry.go:126`, `:143`, `<workspace:Vola>/internal/platforms/platforms.go:1036` | Reuse `safeUpdateMcpConfig` style locking/backup/atomic write and prefer token-env or scoped token handling that avoids static token values in config. |
| P2 | Codex Skill directory semantics differ across docs and code. | `<workspace:Vola>/docs/agent-skill-targets.zh-CN.md:24`, `<workspace:Vola>/docs/platform-coverage-matrix.md:42`, `<workspace:Vola>/internal/systemskills/resources/vola/references/platforms/codex.md:35`, `<workspace:Vola>/internal/platforms/platforms.go:31` | Decide whether Vola-managed Codex skills belong in `~/.codex/skills` or `~/.agents/skills`, then update docs, UI and adapter constants together. |
| P2 | Agent target capability matrix is duplicated across backend, frontend and docs. | A group cited `<workspace:Vola>/internal/api/skill_assignments.go`, `<workspace:Vola>/web/src/pages/CodexConsolePage.tsx`, `<workspace:Vola>/web/src/pages/data/DataSkillsPage.tsx`; docs at `<workspace:Vola>/docs/agent-skill-targets.zh-CN.md:7`. | Let the backend expose the authoritative target matrix and make UI/docs derive labels/status where practical. |
| P2 | Local MCP Hub and Team MCP use different schema surfaces. | `<workspace:Vola>/web/src/pages/McpHubPage.tsx:13`, `<workspace:Vola>/web/src/pages/McpHubPage.tsx:396`, `<workspace:Vola>/internal/api/team_mcp.go:27`. | Move local MCP Hub toward the same `stdio/http/url/headers/tags/owner/security` schema as Team MCP. |
| P2 | Cursor/Gemini Skill handling is export-only, but there is leftover Cursor `.mdc` conversion code behind a non-applicable path. | `<workspace:Vola>/docs/agent-skill-targets.zh-CN.md:28`, `<workspace:Vola>/internal/api/local_skill_sync.go:438`, Cursor conversion branch cited by A group in the same file. | Either remove the unreachable conversion path or expose it as a Cursor export/preview transform. |
| P2 | Platform-specific portability manuals are incomplete for Cursor/Gemini/Windsurf compared with setup docs. | `<workspace:Vola>/docs/setup.zh-CN.md:36`; A group found system skills for `general`, `claude`, `chatgpt`, `codex`. | Add read-only portability manuals for Cursor, Gemini CLI and Windsurf so MCP clients see the same migration instructions. |
| P3 | MCP diagnostic Skill/script does not cover all documented client config variants. | B group cited `<workspace:Vola>/docs/setup.zh-CN.md:57`, `:65`, and `docs/skills/local-mcp-management-robustness/diagnose-mcp.sh`. | Parse JSON instead of grep, support `url` and `serverUrl`, and split read-only diagnosis from repair commands. |

## Token 与证据来源

| Source | Path or command | Notes |
| --- | --- | --- |
| Group A session usage | `codex exec --json` event file under local `/tmp` | Not committed; final usage: input `2,841,347`, cached input `2,637,824`, output `9,530`, reasoning `2,212` |
| Group B session usage | `codex exec --json` event file under local `/tmp` | Not committed; final usage: input `1,692,009`, cached input `1,518,976`, output `13,124`, reasoning `5,127` |
| Doctor | `node <project-facts-kit>/packages/ai-context-kit/bin/ai-context-kit.mjs doctor --workspace <workspace:Vola>` | Found one repo and missing workflow artifacts; no files generated |
| Targeted tests | `go test ./internal/platforms -run 'Test(CursorMcpTeamInjectionAndCleanup|VolarcPathSandboxing)'` | Pass |
| Targeted tests | `go test ./internal/api -run 'Test(SQLiteSharedServerSkillAssignments|SQLiteSharedServerLocalSkillSync|McpHealth)'` | Pass |
| Targeted tests | `go test ./internal/services -run 'TestSkillLearningQualityGateDetectsRuntimeConfigs'` | Pass |

CLI startup emitted plugin/MCP warnings for both groups: remote plugin catalog unauthorized warning and a local MCP connection failure to `127.0.0.1:50501`. The agents still completed source analysis; the warnings should not be treated as Vola code findings.

## 结论

| Question | Answer |
| --- | --- |
| 是否计入三类真实任务验证 | no |
| 计入哪一类 | Not one of `backend-bug / miniapp-integration / cross-end-field`; keep as additional tooling-analysis evidence |
| B 相比 A 是否减少漏项 | mixed |
| B 相比 A 是否减少 token | yes for input tokens and command executions; no for output/reasoning tokens |
| 质量是否下降 | mixed |
| 需要修改工具吗 | no immediate ai-context-kit change required |
| 如果修改，属于通用规则还是项目专用 | Vola findings are project-specific; A/B record structure is reusable |
| 后续验证 | Fix Team MCP tags, then add endpoint and disposable adapter injection tests. Add Vola AGENTS.md before more low-token samples. |
