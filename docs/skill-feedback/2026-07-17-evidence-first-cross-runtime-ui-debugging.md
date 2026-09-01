# SFC-20260717 evidence-first cross-runtime UI debugging

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260717-evidence-first-cross-runtime-ui-debugging` |
| Status | `applied` |
| Created at | `2026-07-17` |
| Applied at | `2026-09-01` |
| Source project | 编译型前端工作区（已脱敏） |
| Skill | `project-facts-maintainer` |
| Target section | `Cross-Runtime UI Evidence` |

## Evidence

| Item | Value |
| --- | --- |
| Source task | UI 先显示旧数据或空白；多次改代码仍不对。父状态有数据，子组件为空。 |
| Evidence paths | 业务仓库 `verification.md` 与运行时检查记录（具体页面和字段已脱敏） |
| Verification run | 前几轮页面验证失败；修改前记录父/子数据量不一致；`git diff --check` PASS；生成文件检查 PASS；真实接口限流后最终页面验证为 `Partial` |
| Reviewer | 用户要求从业务仓库反哺并推远端 |
| Reviewer decision | Accepted and applied |

## Observed Behavior

- Helpful: 失败验证、源码路径和未执行项可追溯。
- Missing: 第二次改代码前，没有强制记录配置、请求、响应、父状态、子 props、适配层和视图。
- Misleading: 只记文件变化和静态检查，会把“父组件有数据”当成页面已更新。
- Tool conflict: 源码属性与生成文件属性不一致；重复打真实接口会限流。

## Why It Should Move Upstream

任何经过状态管理、父子组件或编译转换的 UI，都可能“数据源正确、最终视图错误”。共享规则只保留检查次序、生成文件核对、一次假设一次修改、接口调试上限。

## Why It Should Stay Local

具体板块、商品字段、页面路径和业务文案留在业务仓库。

## Applied Change

已写入 `project-facts-maintainer` 的 `Cross-Runtime UI Evidence`。
