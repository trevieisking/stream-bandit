# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Accepted source baseline

- G0R-11 COMPLETE — PR #565; Validation #571; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.
- G0R-07 COMPLETE — PR #566; Validation #574 / Replay #799 / Smoke #825; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`.
- G0R-08 COMPLETE — PR #567; Validation #586 / Replay #800 / Smoke #826; merge/current main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- Accepted G0R source repairs: **3/11**.
- G0R-10 remains PROVEN / QUEUED and is not dropped.

## V2.3.4-008 — G0R-09 defect proven

Exact source `supabase/migrations/20260903225626_tcg_private_room_lobby.sql` at main `042559e252cfa49ad425d9f57fa01a678b2a3fe9` defines `tcg_server_set_room_ready` with this sequence:
1. member check;
2. deck validation;
3. update this member's `ready` row;
4. aggregate `member_count` and `ready_count`;
5. return `all_ready=(v_count=2 and v_ready_count=2)`.

There is no per-room lock around steps 3-4. Two simultaneous transactions can each update a different row and then count before the other uncommitted Ready row is visible, allowing both responses to report `all_ready=false`.

The private-alpha API only calls `initialize(room)` when the Ready RPC response has `r?.all_ready`, so both false responses can leave an otherwise fully-ready room requiring another manual Ready action.

**Owner decision:** fix concurrency in the authoritative room Ready function, not in browser retry logic.

## V2.3.4-009 — G0R-09 bounded implementation

Created branch `fix/tcg-g0r-09-ready-concurrency` from exact main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.

Migration commit `4c08c8528677aef8a58955a91e1a05f7227f5854` adds `20260917144500_tcg_private_room_ready_concurrency.sql`:
- additive `CREATE OR REPLACE` only;
- retains member and deck-validation fences;
- acquires a room-scoped transaction advisory lock immediately before Ready mutation + aggregate count;
- lock key derives from `p_room_id::text || ':ready'`, so unrelated rooms do not share one global mutex;
- preserves exact two-members/two-ready `all_ready` rule;
- rewrites no existing data by itself.

Focused test/head commit `cc46b1fda04361105bc390c9efeddc8c475c6571` adds `tcg/tests/card-pass-2-g0r-09-private-room-ready-concurrency.test.mjs` and locks the mutation/count ordering, room-scoped transaction lock, preserved validation fences and private-alpha `r?.all_ready -> initialize(room)` dependency.

Exact diff from base:
- 2 commits;
- 2 files;
- +105 / -0.

Draft PR #568 opened at exact head `cc46b1fda04361105bc390c9efeddc8c475c6571`.

## Promotion state

- G0R-09 branch implementation: **PROMOTE ✅**
- PR #568 merge: **HOLD 🔒** pending exact-head workflows/reviews
- main remains accepted at `042559e252cfa49ad425d9f57fa01a678b2a3fe9`
- Supabase/runtime/live/production: HOLD / unchanged
- Code Labs Writer / CG Repair Lab / Code God: not invoked

## Exact next operation

Refresh PR #568 exact-head workflow runs and review threads. Require TCG Validation, Migration Replay and Functional Smoke green. If any fails, repair only the bounded branch. If all succeed and the exact diff/head/main remain stable, make the source merge promotion decision and update plan/checklist/ledger before reporting acceptance.
