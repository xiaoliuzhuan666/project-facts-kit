# 跨端字段问题阅读清单

适用任务：页面提交字段、接口请求 DTO、响应字段、前后端字段名或嵌套结构不一致。

## 目标

用契约索引缩小范围，再用源码确认字段来源、转换和实际提交结构。

## 读取顺序

1. 父目录或目标仓库 `AGENTS.md`。
2. `docs/ai-context-api-contract-map.md` 的精确命中，优先用 `ai-context-kit contracts`。
3. 前端页面或组件入口。
4. 前端 API wrapper、request/client 封装和 base URL 配置。
5. 实际调用处的 payload 构造代码。
6. 后端 route、Controller 或 handler。
7. 请求 DTO/schema/model。
8. 响应 DTO/schema/model。
9. DTO copy、mapper、serializer、transformer 或手写 setter。
10. 同页面相关接口：创建、保存、详情、支付发起、取消、失败路径。
11. 相关测试、mock、接口联调记录。

## 字段检查表

| 项目 | 结果 |
| --- | --- |
| 前端顶层字段 | checked / not checked |
| 前端嵌套对象字段 | checked / not checked |
| 前端列表字段 | checked / not checked |
| 后端请求字段 | checked / not checked |
| 后端响应字段 | checked / not checked |
| copy/mapper/serializer | checked / not checked |
| 新旧接口路径 | checked / not checked |
| 同页面相关接口 | checked / not checked |

## 不默认读取

- 完整契约表。
- 所有页面目录。
- 所有 DTO 或 schema。
- 与当前字段无关的订单、支付、库存全链路。

## 推荐命令

```bash
ai-context-kit contracts --workspace <path> --query "<field-or-endpoint>"
ai-context-kit contracts --workspace <path> --query "<endpoint>" --frontend-repo <frontend> --backend-repo <backend>
rg -n "<fieldName|endpoint|DtoName>" <known-files-or-package>
```
