# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.3.md`

## V2.3.4-001 — G0R-11 accepted baseline

The implementation baseline for this revision was main `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`, produced by merged PR #565. G0R-11 validation workflow coverage is COMPLETE with TCG Validation run #571 / `35232546805` SUCCESS. Accepted G0R progress at that baseline: **1/11**.

## V2.3.4-002 — G0R-10 remains proven, not silently skipped

Exact source proves `play_tactic` lacks the required one-shot subtype allow-list. The canonical boundary remains: Ally/Device may use one-shot `play_tactic`; Relic/Realm use dedicated owner routes. Because the available direct GitHub safe-write path would require a high-risk full replacement of the large dispatcher file, this defect stays explicitly queued rather than being forced through an unsafe mutation. No runtime change was made for G0R-10.

## V2.3.4-003 — G0R-07 defect proven

Source: `supabase/migrations/20260905110000_tcg_automatic_matchmaking.sql` on exact main `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.

The function correctly closes only expired `waiting` matchmaking rooms, but its idempotent retry/poll lookup then requires `expires_at > now()` across `waiting`, `locked`, and `in_match`. Therefore a matched player's room may disappear from polling after its original queue lifetime expires.

Correct owner rule:
- waiting rooms remain expiry-gated;
- expired waiting entries still close;
- opponent candidate selection remains waiting + unexpired;
- locked/in_match rooms are already match containers and remain discoverable independent of the old queue expiry.

## V2.3.4-004 — G0R-07 bounded implementation

Promotion decision for branch-only repair: **PROMOTE ✅**.

Created from exact main:
- branch `fix/tcg-g0r-07-matchmaking-room-lifetime`;
- base `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.

Commits:
1. `ab754ebcbf381d90197185e5209ae47ea1d500b3` — additive replacement migration;
2. `190c9c9e4bf07712571b978abbd3657f876febed` — focused expiry-boundary contract test.

Exact PR diff:
- 2 files;
- +258 / -0;
- `supabase/migrations/20260917142500_tcg_matchmaking_locked_room_lifetime.sql`;
- `tcg/tests/card-pass-2-g0r-07-matchmaking-room-lifetime.test.mjs`.

Opened PR #566, exact head `190c9c9e4bf07712571b978abbd3657f876febed`.

No existing room data is rewritten by the migration. No Supabase deployment, live change or production mutation occurred during branch/PR implementation.

## V2.3.4-005 — G0R-07 exact-head acceptance fence

All exact-head required workflows completed successfully:

- **TCG Card Pass 2 Validation #574 / `35233465142` — SUCCESS**;
- **Code Labs Migration Replay #799 / `35233465044` — SUCCESS**, including full disposable database reset/replay from zero;
- **Code Labs V50 Functional Smoke #825 / `35233465614` — SUCCESS**, including Node, Deno and PostgreSQL replay smoke lanes.

Additional final pre-merge evidence:
- PR #566 head remained `190c9c9e4bf07712571b978abbd3657f876febed`;
- PR mergeable = true;
- PR review threads = 0;
- exact diff remained 2 intended files / +258 / -0;
- main remained `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` immediately before merge;
- legacy combined statuses returned none found; GitHub Actions exact-head runs above are the active validation evidence.

## V2.3.4-006 — G0R-07 promoted to main

**Promotion decision:** **PROMOTE G0R-07 source repair to main ✅**.

PR #566 was marked ready and merged with expected exact head `190c9c9e4bf07712571b978abbd3657f876febed`.

- merge SHA: `fce98178f2234386da7be3aef02a8496fa24195a`;
- new/current main: `fce98178f2234386da7be3aef02a8496fa24195a`;
- merged PR: #566;
- source repair state: COMPLETE;
- accepted G0R source repairs: **2/11**.

The source now preserves queue expiry for waiting rooms while keeping already matched `locked`/`in_match` rooms discoverable after their original queue expiry.

**Important deployment boundary:** merging the migration to `main` does not itself apply it to the production Supabase database. Supabase/live remains unchanged and HOLD pending a separate deployment decision/evidence fence.

## Promotion state after G0R-07

- G0R-11 source repair: **COMPLETE ✅**
- G0R-07 source repair: **COMPLETE ✅**
- accepted G0R source repairs: **2/11**
- G0R-10: **PROVEN / QUEUED 🟡**
- Supabase/runtime/live/production promotion: **HOLD 🔒 / unchanged by this merge**
- Code Labs Writer: **not invoked**
- CG Repair Lab / Code God: **not invoked**

## Exact next operation

Refresh source from main `fce98178f2234386da7be3aef02a8496fa24195a` and implement exactly one next safe V2-G0R owner repair. Prefer an additive/replay-safe change that can be proven with current GitHub validation lanes over a risky full-file rewrite. Update plan/checklist/ledger before the next delivered work result.
