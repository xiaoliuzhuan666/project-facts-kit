# 后端接口 bug 阅读清单

适用任务：已知后端仓库、endpoint、Controller/handler 或方法名，需要定位单个接口问题。

## 目标

在不扫描整个后端项目的前提下，读取能证明接口行为的文件，并把未验证的后续链路写清楚。

## 读取顺序

1. 仓库 `AGENTS.md`。
2. `project-facts/project.md`、`project-facts/context-boundary.md`、`project-facts/verification.md`。
3. `ai-context-kit contracts --workspace <path> --query "<endpoint-or-method>"` 的命中行，或精确 `rg` 命中行。
4. Controller、handler 或 route 文件。
5. 请求 DTO、schema、Pydantic model、Go struct、TypeScript DTO 或 OpenAPI schema。
6. 直接调用的 Service/use case。
7. 必要 Mapper、repository 或 DAO。
8. 响应 DTO、response wrapper 或错误返回结构。
9. 相关测试文件。

## 不默认读取

- `.codex-mem/index.jsonl`。
- 全量 `dto/**`、`model/**`、`service/**`。
- 异步任务、通知、支付、核销等后续链路，除非当前接口结论依赖它。
- `.env*`、证书、密钥、生产配置。

## 报告检查

| 项目 | 结果 |
| --- | --- |
| endpoint / method 是否确认 | yes / no |
| 请求字段是否检查 | yes / no |
| 响应字段是否检查 | yes / no |
| 直接 Service 是否检查 | yes / no |
| 测试或构建是否执行 | Pass / Fail / Not run |
| 后续链路是否未验证 | none / list |

## 推荐命令

```bash
ai-context-kit contracts --workspace <path> --query "<endpoint-or-method>"
rg -n "<ControllerOrHandler|RequestDto|methodName>" <known-repo-or-package>
```
