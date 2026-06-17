# Docker 共享服务器发布模式

本文记录适合共享服务器的 Docker 发布方式。它面向中小项目、内部工具、客户演示环境和同一台主机承载多个服务的场景。宝塔只是其中一种公网入口实现；没有宝塔时，可由原生 Nginx、Caddy、Traefik、云负载均衡或云托管平台承担同样职责。

## 适用场景

| 场景 | 建议 |
| --- | --- |
| 服务器同时承载多个项目 | 使用本模式，端口、目录、Compose project 和资源限制必须明确 |
| CI/CD 平台可构建镜像 | 服务器只拉镜像和重启服务，不在服务器构建 |
| 已有公网入口服务 | 由宝塔、原生 Nginx、Caddy、Traefik、云负载均衡或平台入口管理 80/443、证书、反向代理和静态前端 |
| 需要 Postgres、MySQL、Redis、Milvus 等中间件 | 可以容器化，但数据目录必须映射到项目专属宿主目录 |
| 需要多节点、滚动发布或自动扩缩容 | 本模式只能作为单机基础，后续应迁移到编排平台或云托管服务 |

## 角色边界

| 层级 | 负责内容 | 不负责内容 |
| --- | --- | --- |
| CI/CD | 构建镜像、生成静态包、推送镜像仓库、记录 commit 和 tag | 直接修改生产数据 |
| 镜像仓库 | 保存应用镜像、依赖基础镜像和运行时镜像 | 保存密钥 |
| Docker Compose | 运行应用进程和必要中间件、定义健康检查、资源限制、日志策略和数据挂载 | 默认接管公网 80/443、HTTPS 证书和统一域名入口 |
| 公网入口层 | 管理 80/443、HTTPS、反向代理、静态前端和入口日志 | 在容器内保存业务持久化数据 |
| 项目事实 | 记录运行边界、发布证据、未知项、验证结果和回滚方式 | 批准业务意图 |

## 公网入口兼容

发布前先识别公网入口层，而不是假设服务器一定安装宝塔。

| 入口模式 | 适用情况 | 静态前端建议 | 证书建议 | 验证重点 |
| --- | --- | --- | --- | --- |
| 宝塔 + Nginx | 服务器已有宝塔站点管理 | 发布到 `/www/wwwroot/<site>` 或站点配置中的真实目录 | 宝塔 ACME 或已有证书 | 宝塔站点、Nginx 配置、文件权限、HTTPS |
| 原生 Nginx | 服务器只有系统 Nginx | 发布到 `/var/www/<site>`、`/srv/<site>` 或团队指定目录 | `certbot`、`acme.sh` 或已有证书 | `/etc/nginx/conf.d`、`sites-enabled`、`nginx -t` |
| Caddy | 希望自动 HTTPS 且配置简单 | 发布到 `/srv/<site>` 或由应用服务静态资源 | Caddy 自动证书 | `Caddyfile`、自动证书状态、反代路径 |
| Traefik | 已有 Docker label 或动态路由体系 | 通常由独立静态服务、对象存储或应用自身提供 | Traefik resolver | router/service/middleware、dashboard 或日志 |
| 云负载均衡或云托管入口 | 入口在云平台，不在服务器本机 | 对象存储/CDN、平台静态站点或应用服务 | 云平台证书 | 健康检查、转发规则、证书绑定 |
| 无入口服务 | 裸机只有 Docker | 先安装宿主入口服务，或临时使用受限入口容器 | `certbot`、Caddy 或云平台证书 | 80/443 归属、重启策略、日志和回滚 |

团队默认建议：共享服务器上的 80/443 由一个明确的公网入口层统一管理。应用容器继续绑定 `127.0.0.1:<project-port>`。只有没有宿主入口服务、没有云入口、且项目负责人接受运维方式时，才把入口容器作为正式方案。

## 推荐流程

1. 在 Codeup、GitHub Actions、云效 Flow 或同类 CI 中构建镜像。
2. 将镜像推送到团队可访问的镜像仓库，例如 ACR。
3. 服务器通过固定 env 文件读取镜像 tag、端口、数据目录和密钥引用。
4. 服务器执行 `docker compose config` 检查配置。
5. 服务器执行 `docker compose pull` 和 `docker compose up -d`。
6. 静态前端发布到公网入口层认可的站点目录、对象存储/CDN 或平台静态站点；使用干净 tar 包传输时修正目录和文件权限。
7. 公网入口层代理到 `127.0.0.1:<project-port>`，数据库和中间件不暴露公网端口。
8. 发布后验证本机 health、公网 HTTPS、浏览器页面、浏览器 console、旧服务健康、磁盘和内存。

## Compose 规则

共享服务器上的 Compose 文件应至少包含：

- `image` 使用完整仓库地址和不可变 tag，生产机不使用 `build`。
- 每个长期运行服务设置 `restart: unless-stopped` 或团队认可的重启策略。
- 应用、数据库和中间件都设置 `healthcheck`。
- 依赖数据库或中间件的服务使用 `depends_on` 的 `condition: service_healthy`。
- 设置日志大小限制，例如 `json-file` 的 `max-size` 和 `max-file`。
- 设置内存、CPU 和 pids 限制。共享服务器不能让容器默认无限制占用宿主资源。
- 只把 HTTP API 绑定到 `127.0.0.1:<port>`，不要把数据库、Redis、Milvus 端口暴露到公网。
- 数据目录使用项目专属路径，例如 `/data/<project>/postgres`、`/data/<project>/milvus`、`/data/<project>/uploads`。
- 不在 Compose 文件中写明文密钥。密钥放到服务器 env、公网入口层环境或云平台密钥配置。

## 数据持久化

Docker 官方将 volume 作为容器持久化数据的常规机制，并说明 volume 比直接写容器可写层更适合持久化和性能场景。共享服务器如果需要让宿主入口服务、备份脚本或人工维护者直接看到数据目录，可以使用 bind mount，但要接受它与宿主目录结构绑定的事实。

团队建议：

- Postgres/MySQL/Redis/Milvus 的数据目录必须映射到宿主项目目录。
- 目录在启动前由部署脚本创建，并限制在 `/data/<project>` 或团队批准的等价路径下。
- 部署脚本拒绝空目录、根目录、`/tmp`、`/var/lib/docker` 等危险路径。
- 备份脚本只面向宿主数据目录或数据库 dump，不依赖容器层。
- bind mount 默认可写，挂载配置和静态配置文件时优先使用只读挂载。
- 第一次挂载前确认容器内路径没有必须保留的预置数据；bind mount 会遮挡容器内已有目录内容。

## 内存和容量规则

容器默认没有内存和 CPU 限制。共享服务器发版前要看宿主机现状，发版后要复查。

建议起始值：

| 服务类型 | 起始内存限制 | 说明 |
| --- | --- | --- |
| 轻量后端 API | `512m` 到 `1g` | 根据并发、OCR、导入任务、LLM 调用等上调 |
| 前端静态服务 | 优先交给公网入口层或对象存储/CDN | 如果必须容器化，通常 `128m` 到 `256m`，并只绑定本机或入口网络 |
| Postgres/MySQL | `512m` 到 `1g` | 小项目起步值，导入或报表型项目需压测后调整 |
| Redis | `256m` 到 `512m` | 必须设置淘汰策略或容量预期 |
| Milvus 单机 | `2g` 到 `4g` | 向量数量、索引类型和导入任务会明显影响内存 |

发布记录里要写明实际值、服务器总内存、发布后可用内存和是否发生 OOM。

## DNS 和证书

- 域名记录要说明管理平台、记录类型、主机记录、目标 IP 和验证时间。
- 涉及 MFA 或扫码确认时，发布记录写明等待人工确认，不记录一次性码。
- HTTPS 申请成功后验证证书域名、到期时间、入口层配置和公网访问。
- 本机代理可能返回 fake IP，DNS 验证优先使用可信 DoH、权威 DNS 或线上机器查询。

## 发布证据

一次生产或演示环境发布至少记录：

- 代码 revision、CI 任务链接、镜像 tag 或静态包名称。
- `docker compose config` 结果。
- `docker compose ps` 或等价容器健康状态。
- 本机 `curl http://127.0.0.1:<port>/health` 或项目真实 health endpoint。
- 公网 `https://<domain>/` 和 API health 检查。
- 浏览器页面标题、关键页面是否渲染、console 是否有阻断错误。
- 共享主机旧服务健康检查。
- 磁盘、内存、关键容器资源使用。
- 回滚方式：改回上一个镜像 tag 或恢复上一个静态前端备份，并重新执行部署脚本。

## 参考资料

- Docker Build best practices: <https://docs.docker.com/build/building/best-practices/>
- Docker multi-stage builds: <https://docs.docker.com/build/building/multi-stage/>
- Docker volumes: <https://docs.docker.com/engine/storage/volumes/>
- Docker bind mounts: <https://docs.docker.com/engine/storage/bind-mounts/>
- Docker resource constraints: <https://docs.docker.com/engine/containers/resource_constraints/>
- Compose services reference: <https://docs.docker.com/reference/compose-file/services/>
- Compose deploy specification: <https://docs.docker.com/reference/compose-file/deploy/>
