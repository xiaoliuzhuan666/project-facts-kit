# Runtime And Release Facts Reference

Use this reference when a task touches deployment, Docker, CI/CD, data persistence, reverse proxy, production configuration, or release verification.

## Records To Maintain

Prefer an existing project structure. If the project uses this kit, keep runtime facts in `project-facts/runtime.md` and release evidence in the related `project-facts/changes/<date>-<change>/evidence.md`.

Runtime facts should record:

- Runtime owner and release owner.
- Host, platform, domain, DNS owner and public gateway owner.
- CI/CD pipeline, image registry, artifact names and tag rules.
- Services, ports, internal bindings and health checks.
- Data persistence paths, managed storage resources, backup method and restore notes.
- Environment variable names, secret storage location and rotation owner, without secret values.
- Resource limits for memory, CPU and pids, plus last observed usage when available.
- Rollback command or documented manual rollback path.
- Open runtime unknowns with owner and needed evidence.

Release evidence should record:

- Source revision and dirty or clean state.
- CI/build job result and artifact or image tag.
- Registry or artifact existence check.
- Remote config render, such as `docker compose config`.
- Data persistence check.
- Resource limit check.
- Local health check.
- Public endpoint, DNS and certificate check.
- Browser page and console check.
- Shared-host isolation check when other services run on the same host.
- Rollback command or rehearsal status.

Mark unexecuted checks as `Not run` and state why.

## Shared Host Docker Pattern

For a shared host with a public gateway:

1. Build in CI/CD and push to a registry. Do not build production images on the shared host.
2. Run backend services and required middleware with Docker Compose.
3. Let one public gateway layer own 80/443, HTTPS certificates, public reverse proxy and static frontend sites. This can be Baota, native Nginx, Caddy, Traefik, a cloud load balancer or a platform gateway.
4. Bind application ports to `127.0.0.1:<port>` unless the project has an approved public-port reason.
5. Keep database, Redis, Milvus and similar ports private.
6. Map persistent data to an explicit project directory such as `/data/<project>`.
7. Set memory, CPU, pids and log-size limits for every long-running service.
8. Use health checks and wait for dependencies marked healthy before starting dependent services.
9. Store secrets outside the repository and avoid printing secret values in scripts or evidence.
10. Verify existing co-hosted services after release.

## Docker Evidence Notes

- Docker containers have no resource limits by default; shared hosts need explicit limits.
- Docker volumes are the usual Docker-managed persistence mechanism.
- Bind mounts are appropriate when the host must directly manage data, backups or static artifacts, but they are tied to the host directory layout.
- Bind mounts can obscure existing container directory contents and are writable by default.
- Multi-stage builds help keep final images smaller by copying only needed artifacts into the runtime stage.
- Compose can wait for dependencies marked with `condition: service_healthy` when health checks are defined.

## Safety Rules

- Do not commit real `.env`, credentials, tokens, cookies, certificate private keys, database dumps or runtime uploads.
- Do not record a domain, image tag or service state as verified unless a command, CI record or browser/API check was actually performed.
- Do not infer intended runtime behavior from a working container alone. Use `OBSERVED` until a responsible owner or reviewed document confirms the expected behavior.
