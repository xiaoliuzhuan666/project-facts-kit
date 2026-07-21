# Skill Feedback Candidate

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260717-evidence-first-cross-runtime-ui-debugging` |
| Status | `proposed` |
| Created at | `2026-07-17` |
| Source project | `ns-travel-lite-applet` |
| Skill | `project-facts-maintainer` |
| Target section | `Lightweight Change Evidence`；建议新增跨运行时 UI 数据检查点 |

## Evidence

| Item | Value |
| --- | --- |
| Source task | 一体化首页进入尼山首页后，商品先显示旧数据，随后在清空数组方案中变为空白。任务经历 v1 watcher、v2 `key`、v3 清空重赋、v4 响应式字段处理。 |
| Evidence paths | `<workspace>/ns-travel-lite-applet/project-facts/verification.md`；`<workspace>/ns-travel-lite-applet/project-facts/skill-feedback/2026-07-17-evidence-first-cross-runtime-ui-debugging.md`；`<workspace>/ns-travel-lite-applet/docs/home-decoration-pending-fixes.md`；`<workspace>/ns-travel-lite-applet/pages/home/components/product.vue` |
| Verification run | v1、v2、v3 用户验证失败；v4 修改前开发者工具记录父组件 7 条、四个子组件均为 0 条；`git diff --check` PASS；生成 JS 检查 PASS；v4 最终页面验证因 API 限流为 `Partial`。 |
| Reviewer | User requested upstream candidate creation；Tool/library owner review pending |
| Reviewer decision | `Pending` |

## Observed Behavior

- Helpful: 现有项目事实流程要求记录失败验证、源码路径和未执行项，使多次判断过程可以追溯。
- Missing: 现有 Skill 没有要求在第二次代码修改前记录配置、请求、响应、父组件、子组件、适配层和视图的数据检查点。
- Misleading: 只记录文件变化和静态检查，仍可能让维护者把父组件有数据误当成页面已经具备更新条件。
- Tool conflict: Vue 源码的 `key` 没有成为对应的微信小程序 `wx:key`；Vue 2 已观察对象上的动态字段没有向子组件更新；重复调用真实 API 触发限流。

## Why It Should Move Upstream

这类问题不限于当前业务。任何经过状态管理、父子组件、框架适配或编译转换的 UI，都可能出现“数据源正确、最终视图错误”。共享 Skill 可以要求维护者先找到第一处数据不一致，再修改对应层，并把修改前后同位置的证据写入 `evidence.md` 或 `verification.md`。

## Why It Should Stay Local

“游园体验”、板块 ID、商品记录、Vue 2 的具体字段名以及微信小程序页面路径属于当前项目。共享规则只保留数据检查次序、编译产物检查、一次假设对应一次修改、API 调试次数限制和验证状态要求。

## Proposed Skill Change

在 `project-facts-maintainer` 的 `Lightweight Change Evidence` 后增加跨运行时 UI 调试规则：

1. 当 UI 数据问题已经出现一次失败修改，下一次修改前记录数据链检查点。
2. 检查次序为：输入或配置、请求参数、响应、父状态、子 props、适配层内部状态、视图。
3. 只修改第一处数据不一致的层；失败方案需要记录为 `CONFLICT` 并撤回代码。
4. 涉及代码生成或跨运行时语义时，记录源码与生成文件的对应关系。
5. 真实 API 调试设置请求次数上限；达到限流或外部异常后停止页面验证，状态写为 `Partial` 或 `Not run`。
6. 验证记录必须对比修改前后同一检查点，不能只记录 build、lint 或 diff。

## Suggested Evals

1. uni-app 页面 API 返回正确、父组件数组有数据、子组件 props 为空；期望 Skill 要求先记录各层数量，再提出响应式处理。
2. Vue 源码增加 `key` 但目标平台生成文件没有对应 key；期望 Skill 要求检查生成文件并把源码假设标为失败。
3. 调试真实 API 时连续请求触发限流；期望 Skill 停止重复请求，保存已有状态快照，并把最终页面验证写成 `Partial`。

## Next Action

保持 `proposed`。由 Tool/library owner 判断是否具有足够跨项目证据；通过评审后再修改共享 Skill，并使用上述 eval 检查新旧版本差异。
