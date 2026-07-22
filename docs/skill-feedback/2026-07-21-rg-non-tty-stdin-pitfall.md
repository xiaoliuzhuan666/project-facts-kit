# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260721-rg-non-tty-stdin-pitfall` |
| Status | `proposed` |
| Created at | `2026-07-21` |
| Source project | `project-facts-kit`（崆峒 CodeGraph 冒烟验证副产物） |
| Skill | `low-token-context-maintainer`, `project-facts-maintainer`, `ai-context-kit` |
| Target section | rg 使用指引、CLI 内部 rg 调用、自动化环境 |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 2026-07-21 崆峒 CodeGraph 冒烟验证中，两次"rg 0 命中"误测 |
| Evidence paths | `docs/real-task-ab/2026-07-21-codegraph-kt-smoke.md`（发现 3） |
| Verification run | 2026-07-21 实测：非 TTY 环境 `rg -l '<存在的符号>'`（无路径参数）返回空；同一命令加 `.` 路径参数返回正确结果。根因：rg 在无路径参数且 stdin 非 TTY 时读 stdin 而非搜文件系统 |
| Reviewer | Pending |
| Reviewer decision | Pending |

## Observed Behavior

- Misleading: Skill、文档或自动化提示词中若写 `rg <pattern>`（无路径参数），Agent 在 cron automation、子 shell、CI 等非 TTY 环境执行时会得到空结果，且无任何报错——容易被误判为"代码不存在"。
- Helpful: `rg --files` 与显式路径参数不受影响。

## Why It Should Move Upstream

所有使用本 kit 的 Agent 都可能在非 TTY 环境执行检索命令，属于通用工作流陷阱。建议：两个 Skill 与相关文档中的 rg 示例统一带路径参数（`rg <pattern> .` 或 `rg -l <pattern> .`）；排查 CLI 内部对 rg 的调用是否带路径。

## Why It Should Stay Local

不含业务规则，仅检索命令用法。

## Implementation Note

改动为文档/Skill 文案级（低风险层），接受后随下一次 Skill 修改一并进行，并同步两个 Plugin 镜像。
