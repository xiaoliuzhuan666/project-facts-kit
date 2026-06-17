# 支付状态问题阅读清单

适用任务：支付发起、支付回调、状态更新、取消、失败、退款或对账相关问题。

## 目标

支付问题通常跨页面、接口、状态机和第三方回调。读取范围要覆盖状态转换依据，同时避免从支付入口一路读完整系统。

## 读取顺序

1. 仓库 `AGENTS.md` 与 `project-facts/verification.md`。
2. 当前任务对应的页面、API wrapper、endpoint 或回调路径。
3. 支付发起 Controller/handler。
4. 支付请求 DTO/schema 与第三方参数组装。
5. 订单或业务单据状态枚举。
6. 支付回调 Controller/handler。
7. 回调验签、幂等键、支付单号/业务单号匹配逻辑。
8. 状态写入 Service/use case 与事务边界。
9. 失败、取消、超时、退款入口中与当前状态有关的第一层方法。
10. 通知、库存、权益、发货等后续副作用，只读取当前问题必须证明的部分。
11. 支付相关测试、回调样例、手工验证记录。

## 状态检查表

| 项目 | 结果 |
| --- | --- |
| 支付发起状态 | checked / not checked |
| 第三方请求参数 | checked / not checked |
| 回调验签 | checked / not checked |
| 幂等处理 | checked / not checked |
| 支付成功状态 | checked / not checked |
| 支付失败/取消状态 | checked / not checked |
| 退款或冲正路径 | checked / not applicable / not checked |
| 后续副作用 | checked / not applicable / not checked |
| 真实支付或沙箱验证 | Pass / Fail / Not run |

## 不默认读取

- 全部定时任务、队列消费者和通知模块。
- 所有财务、对账、发票、权益模块。
- 生产支付密钥、证书、`.env*` 或真实回调日志。

## 推荐命令

```bash
ai-context-kit contracts --workspace <path> --query "<pay-endpoint-or-callback>"
ai-context-kit contracts --workspace <path> --query "<order-or-payment-symbol>" --related payment
rg -n "<PaymentStatus|callback|tradeNo|orderNo>" <known-backend-package>
```
