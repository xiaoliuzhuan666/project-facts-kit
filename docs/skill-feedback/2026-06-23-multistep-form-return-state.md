# Skill Feedback Candidate: Multistep Form Return State

## Snapshot

| Field | Value |
| --- | --- |
| Candidate ID | `SFC-20260623-multistep-form-return-state` |
| Status | `proposed` |
| Created at | `2026-06-23` |
| Source project | `崆峒` parent workspace, `kt-travel-lite-web` |
| Skill | `project-facts-maintainer`, `low-token-context-maintainer` |
| Target section | `Lightweight Change Evidence`, `Fast Cross-Repository Fix Mode`, `Frontend Flow Records` |

## Evidence

| Item | Value |
| --- | --- |
| Source task | User reported that returning from Web order confirmation `/spu/step-two` to `/spu/step-one?advancePreDays=1` lost previously selected time and entered fields, then asked which lessons should feed back into `project-facts-kit-skill-optimization`. |
| Evidence paths | `<workspace>/kt-travel-lite-web/src/views/spu/step-one.vue`; `<workspace>/kt-travel-lite-web/src/views/spu/step-two.vue`; `<workspace>/kt-travel-lite-web/src/components/PresaleReservationSelector/PresaleReservationSelector.vue`; `<workspace>/kt-travel-lite-web/project-facts/verification.md` |
| Verification run | `git diff --check -- src/views/spu/step-one.vue src/views/spu/step-two.vue src/components/PresaleReservationSelector/PresaleReservationSelector.vue project-facts/verification.md`; `npm run build:dev`; in-app browser opened `http://localhost:8080/spu/step-one?advancePreDays=1`; targeted lint was run and failed on existing `step-one.vue` lint debt. |
| Reviewer | Pending Tool/library owner |
| Reviewer decision | `Pending` |

## Observed Behavior

- Helpful: Existing low-token routing correctly kept the investigation in `kt-travel-lite-web` and first-read files were the page pair, shared reservation selector, route, store and verification facts.
- Helpful: Existing project-facts guidance made the final record distinguish build success, partial browser route check, lint failure and missing real order click-through.
- Missing: The skills do not explicitly call out multi-step frontend flows as state contracts. For return/back bugs, the agent should inspect the route transition, button implementation, Vuex or persisted draft source, query parameters, async child component rehydration and form/input fields together.
- Missing: When a user reports "return lost selected time or form values", the first pass should include both parent page restore code and child component saved-state watchers, especially when options are loaded asynchronously after the parent state is restored.
- Misleading: None observed in current skill wording. The gap is that frontend state restoration can look like a single-page bug, but the evidence is usually spread across route guards, store persistence, child component props and navigation query preservation.
- Tool conflict: Targeted lint exposed historical lint debt in `step-one.vue` unrelated to the new fix. Build still passed. The evidence record needed to separate "lint failed" from "feature build verified".

## Why It Should Move Upstream

This pattern is reusable across Vue, React, uni-app and admin-console tasks. Multi-step form return bugs often recur in checkout, reservation, appointment, refund, booking and insurance flows. A shared workflow hint would reduce misses by requiring agents to check:

- navigation method: `router.back()` versus explicit route with a restore marker;
- persistence source: Vuex/store/session/localStorage draft versus route query;
- query parameters that affect validation rules, such as `advancePreDays`;
- parent restore timing, including `beforeRouteEnter`, route update and direct reload paths;
- child component rehydration after async option loading;
- verification split between build, route-level browser check, authenticated data check and lint debt.

## Why It Should Stay Local

The exact route names, fields and `advancePreDays` rule are project-specific. Only the investigation checklist and evidence discipline should move upstream.

## Next Action

Keep as candidate. If accepted, update `project-facts-maintainer` with a lightweight "Frontend Multi-Step State Records" note and update `low-token-context-maintainer` frontend-flow guidance to include return/back state restoration checks.
