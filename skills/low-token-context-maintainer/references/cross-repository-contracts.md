# Cross-Repository Contracts

Read this reference only for client/server boundaries, endpoint or field mapping, order-like state paths, or conflicting generated indexes.

## Route the First Read

1. Select the failing client or reported service as the main repository.
2. When exact target and sibling paths are already known, open them before generated maps.
3. Otherwise query the endpoint or symbol with `ai-context-kit contracts --workspace <parent-or-repo> --query "<endpoint-or-symbol>"` when a contract map exists.
4. Narrow noisy workspaces with `--frontend-repo`, `--backend-repo`, or `--related <payment|refund|cancel|device|settlement|booking|inventory|insurance|order>`.
5. If `contracts` returns no match, run a precise `rg -n "<endpoint|symbol|page|DTO>" docs/ai-context-api-contract-map.md` before concluding that the route is absent.
6. Read source to confirm every generated-map claim. Use a matching checklist under `docs/task-read-checklists/` when available.

## Field and State Checks

- Compare frontend payload fields with the backend request DTO, response DTO, and copy or mapping logic. Check top-level fields separately from nested objects and lists.
- Compare the active frontend URL with the backend route and any legacy or replacement endpoint.
- For order, payment, booking, inventory, rental, settlement, refund, or insurance work, keep a small scenario table covering: page or entry, API wrapper, endpoint, Controller or handler, request DTO, response fields, mapper or copy method, core service, relevant state transition, provider route, and failure or cancellation side effects.
- Include same-page related endpoints returned by `contracts` when they affect create, payment start, device state, cancellation, or failure behavior.
- Treat `required-missing`, `payload-only`, and similar field checks as prioritization hints rather than runtime proof.

## Backend-Only Scope

When the endpoint and method are known:

1. Read the repository `AGENTS.md`, route or contract hit, Controller or handler, request DTO, directly called Service or ServiceImpl, necessary Mapper, and response or status DTO.
2. Read one adjacent state, payment, or device method only when it proves the reported behavior.
3. Do not read `.codex-mem/index.jsonl` or scan an entire DTO package for generic field names.
4. Stop at the first method that proves the immediate contract unless the user requests the full asynchronous lifecycle.

## Frontend Scope

Check the target page and direct API wrapper for missing exports or imports, empty-data rendering, runtime-only branches, and hard-coded environment or payment configuration. Verify framework-specific wrappers with source even when the contract index recognizes the call pattern.

## Fast Cross-Repository Fix

When the user already names the repository, page, route, screenshot, endpoint, or file:

1. Keep the first source pass to the target page or component, direct API wrapper, direct Controller or DTO/service adapter, and one sibling implementation only when it provides relevant parity evidence.
2. Compare only the changed request, response, state, or UI branch.
3. Patch only the failing client unless backend behavior is also disputed.
4. Avoid tracing unrelated payment, booking, notification, scheduler, or callback paths.
5. Run the fastest meaningful verification and mark unavailable live checks `Not run`.

## Tool Conflicts

- When `doctor` reports a stale map after regeneration, inspect the map header once. If required columns are present, record the conflict and continue with precise source searches.
- When a map row exists but `contracts` misses it, use exact `rg` to route source reads and record the mismatch.
- Do not repeat initialization or full scans after a short source check resolves the route.

## Delivery Check

For a cross-repository interface or order-flow result, state:

- Whether the DTO field contract was checked and which files decided it.
- Whether active and legacy endpoint paths were compared.
- Which runtime, authenticated, payment, or device checks were not run.
