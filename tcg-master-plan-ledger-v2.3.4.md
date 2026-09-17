# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Accepted source baseline

- G0R-11 COMPLETE — PR #565; Validation #571; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.
- G0R-07 COMPLETE — PR #566; Validation #574 / Replay #799 / Smoke #825; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`.
- G0R-08 COMPLETE — PR #567; Validation #586 / Replay #800 / Smoke #826; merge checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- G0R-09 COMPLETE — PR #568; Validation #597 / Replay #801 / Smoke #827; merge/current main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`.
- Accepted G0R source repairs: **4/11**.
- G0R-10 remains PROVEN / QUEUED and is not dropped.

## V2.3.4-008 — G0R-09 defect proven

Exact source `supabase/migrations/20260903225626_tcg_private_room_lobby.sql` at main `042559e252cfa49ad425d9f57fa01a678b2a3fe9` defined `tcg_server_set_room_ready` with member check, deck validation, Ready row update, aggregate count, then `all_ready=(v_count=2 and v_ready_count=2)` with no per-room serialization. Two simultaneous transactions could each count before the other Ready write committed. The private-alpha API initializes only when a Ready response returns `r?.all_ready`.

**Owner decision:** repair concurrency in the authoritative room Ready function, not browser retry logic.

## V2.3.4-009 — G0R-09 bounded implementation

Created branch `fix/tcg-g0r-09-ready-concurrency` from exact main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.

Migration commit `4c08c8528677aef8a58955a91e1a05f7227f5854` added `20260917144500_tcg_private_room_ready_concurrency.sql`:
- additive `CREATE OR REPLACE` only;
- preserved member and deck-validation fences;
- acquired a room-scoped transaction advisory lock immediately before Ready mutation + aggregate count;
- key derives from `p_room_id::text || ':ready'`, so unrelated rooms do not share one global mutex;
- preserved exact two-members/two-ready `all_ready` rule;
- rewrote no existing data.

Focused test/head commit `cc46b1fda04361105bc390c9efeddc8c475c6571` added `tcg/tests/card-pass-2-g0r-09-private-room-ready-concurrency.test.mjs` and locked the mutation/count ordering, room-scoped transaction lock, preserved validation fences and private-alpha `r?.all_ready -> initialize(room)` dependency.

Opening/final reviewed diff:
- 2 commits;
- 2 files;
- +105 / -0.

## V2.3.4-010 — G0R-09 acceptance

Exact reviewed head: `cc46b1fda04361105bc390c9efeddc8c475c6571`.

Acceptance evidence:
- TCG Card Pass 2 Validation #597 / run `35235272269` — SUCCESS;
- Code Labs Migration Replay #801 / run `35235272316` — SUCCESS;
- Code Labs V50 Functional Smoke #827 / run `35235272663` — SUCCESS;
- review threads — 0;
- combined legacy commit statuses — none found;
- exact changed-file list remained the additive migration + focused test only;
- main remained `042559e252cfa49ad425d9f57fa01a678b2a3fe9` immediately before merge.

Promotion decision: **PROMOTE ✅ source merge**.

PR #568 was marked ready and merged from the expected head. Merge/current-main checkpoint: `2bc55ecd6d626a465cd483ee2e889ceb6177c280`.

Supabase/runtime/live/production were not deployed or mutated by this source merge and remain HOLD.

## Promotion state

- G0R-09 source merge: **PROMOTE COMPLETE ✅**
- accepted source main: `2bc55ecd6d626a465cd483ee2e889ceb6177c280`
- accepted G0R source repairs: **4/11**
- Supabase/runtime/live/production: **HOLD / unchanged**
- Code Labs Writer / CG Repair Lab / Code God: **not invoked**

## Exact next operation

Refresh exact main `2bc55ecd6d626a465cd483ee2e889ceb6177c280` and prove the next safest remaining V2-G0R defect from current source. Prefer an additive/replay-safe repair. G0R-10 remains explicitly queued until a safe bounded runtime mutation path is available.
