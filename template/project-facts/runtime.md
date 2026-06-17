# Runtime And Release Facts

这个文件记录项目如何运行、如何发布、数据在哪里、谁负责验证。它描述已观察或已确认的运行事实，不批准业务目标。

## Status Legend

| Status | Meaning |
| --- | --- |
| `APPROVED` | 责任人或已审阅资料明确确认的运行要求 |
| `OBSERVED` | 从配置、脚本、服务器检查、CI 记录或发布验证观察到的现状 |
| `UNKNOWN` | 资料不足，尚不能判断 |
| `CONFLICT` | 配置、文档、脚本或运行结果之间不一致 |
| `DEPRECATED` | 已被正式替代，仅为追溯保留 |

## Runtime Identity

| Field | Value | Status | Source |
| --- | --- | --- | --- |
| Environment | `<dev / staging / production / demo>` | `UNKNOWN` | `<path or record>` |
| Runtime owner | `<role or name>` | `UNKNOWN` | `<path or record>` |
| Release owner | `<role or name>` | `UNKNOWN` | `<path or record>` |
| Primary host or platform | `<host alias, cloud resource, or platform name>` | `UNKNOWN` | `<path or record>` |
| Public entry | `<domain or internal URL>` | `UNKNOWN` | `<path or record>` |
| Release workflow | `<CI/CD, manual script, platform deploy>` | `UNKNOWN` | `<path or record>` |

## Services

| Service | Runtime | Image or artifact | Internal port | Host binding | Health check | Status | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<api>` | `<Docker Compose / systemd / platform>` | `<image tag or artifact>` | `<port>` | `<127.0.0.1:port / none>` | `<command or URL>` | `UNKNOWN` | `<path>` |
| `<database>` | `<Docker Compose / managed service / host service>` | `<image tag / version>` | `<port>` | `<none / private>` | `<command>` | `UNKNOWN` | `<path>` |

## Persistence

| Data | Owner service | Host location or managed storage | Container path | Backup method | Restore note | Status | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<database data>` | `<service>` | `<project data directory or managed resource>` | `<container path or n/a>` | `<dump / snapshot / volume backup>` | `<restore command or doc>` | `UNKNOWN` | `<path>` |
| `<uploads / files>` | `<service>` | `<project data directory or object storage>` | `<container path or n/a>` | `<method>` | `<note>` | `UNKNOWN` | `<path>` |

## Network And Reverse Proxy

| Item | Value | Status | Source |
| --- | --- | --- | --- |
| Public domain | `<domain>` | `UNKNOWN` | `<DNS record or doc>` |
| DNS owner/platform | `<provider>` | `UNKNOWN` | `<record>` |
| Public gateway owner | `<Baota / native Nginx / Caddy / Traefik / cloud load balancer / platform>` | `UNKNOWN` | `<config path or doc>` |
| HTTPS certificate | `<issuer, domains, expiry>` | `UNKNOWN` | `<check output or doc>` |
| Public API path | `<path>` | `UNKNOWN` | `<config or test>` |
| Static frontend path | `<host directory / object storage / CDN / platform artifact / container service>` | `UNKNOWN` | `<script or doc>` |

## Runtime Configuration

| Key or group | Where configured | Secret? | Rotation owner | Status | Source |
| --- | --- | --- | --- | --- | --- |
| `<DATABASE_URL or DB group>` | `<server env / platform secret>` | `Yes` | `<role>` | `UNKNOWN` | `<path without value>` |
| `<APP_CONFIG>` | `<env file / platform config>` | `No` | `<role>` | `UNKNOWN` | `<path>` |

不要把真实密钥、token、cookie、证书私钥或数据库密码写入本文件。只记录变量名、保存位置和负责人。

## Resource Limits

| Service | Memory limit | Memory reservation | CPU limit | Pids limit | Last observed usage | Status | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `<service>` | `<value>` | `<value or n/a>` | `<value>` | `<value>` | `<date and value / Not run>` | `UNKNOWN` | `<compose path or command>` |

## Release Evidence Index

| Release | Revision | Artifact or image tag | Evidence file | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| `<YYYY-MM-DD release>` | `<commit>` | `<tag or artifact>` | `<changes/.../evidence.md>` | `Pass / Fail / Partial / Not run` | `<fill>` |

## Rollback

| Scenario | Rollback method | Data impact | Required verification | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| `<bad backend image>` | `<set previous image tag and rerun deploy script>` | `<none / migration risk>` | `<health/browser checks>` | `<role>` | `UNKNOWN` |
| `<bad static frontend>` | `<restore previous static backup>` | `<none>` | `<browser checks>` | `<role>` | `UNKNOWN` |

## Open Runtime Unknowns

| ID | Question | Impact | Owner | Needed evidence |
| --- | --- | --- | --- | --- |
| `RUN-001` | `<fill>` | `Blocker / High / Medium / Low` | `<role>` | `<command, record, or decision needed>` |
