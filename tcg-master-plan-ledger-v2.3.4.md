# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.3.md`

## V2.3.4-001 — G0R-11 accepted baseline

The implementation baseline for this revision is main `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`, produced by merged PR #565. G0R-11 validation workflow coverage is COMPLETE with TCG Validation run #571 / `35232546805` SUCCESS. Accepted G0R progress at this baseline: **1/11**.

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

Exact PR diff at opening head:
- 2 files;
- +258 / -0;
- `supabase/migrations/20260917142500_tcg_matchmaking_locked_room_lifetime.sql`;
- `tcg/tests/card-pass-2-g0r-07-matchmaking-room-lifetime.test.mjs`.

Opened draft PR #566, exact head `190c9c9e4bf07712571b978abbd3657f876febed`.

No existing room data is rewritten by the migration. No Supabase deployment, live change or production mutation occurred.

## V2.3.4-005 — G0R-07 acceptance fence triggered

Exact-head workflows automatically triggered:
- TCG Card Pass 2 Validation #574 / run `35233465142`;
- Code Labs Migration Replay #799 / run `35233465044`;
- Code Labs V50 Functional Smoke #825 / run `35233465614`.

At this checkpoint the lanes are pending/queued, so **G0R-07 remains HOLD for merge** and accepted G0R progress remains **1/11**.

## Promotion state

- G0R-07 branch implementation: **PROMOTE ✅**
- PR #566 merge: **HOLD 🔒**
- main beyond accepted G0R-11 baseline: **HOLD 🔒**
- Supabase/runtime/live/production: **HOLD 🔒 / unchanged**
- Code Labs Writer: **not invoked**
- CG Repair Lab / Code God: **not invoked**

## Exact next operation

Refresh all three PR #566 exact-head workflow conclusions. If any fails, repair the bounded branch. If all succeed, refresh review threads, PR metadata, diff and main, decide merge promotion, and then update the V2.3.4 plan/checklist/ledger before reporting acceptance.
