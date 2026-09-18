# Stream Bandit TCG — Master Plan V2.4.22 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.22.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.22.md`  
**Continuity parent:** `b7581be870e5afe521494531f3c7eaa9383a51e8`.

## V2.4.22-001 — target diagnosis

**State:** ✅

Attack already satisfies card-context ownership in the V2 battlefield.

The old Arcade Lab is not reusable for Ability/Withdrawal: it infers active Ability from browser card metadata and asks the player to manually type a Withdrawal Essence cost. That duplicates server-owned legality and can drift from current modifiers/conditions.

## V2.4.22-002 — Ability projection

**State:** ✅ SOURCE CANDIDATE

`field_actions` simulates the canonical Active Ability live route on cloned state for each friendly field Creature and returns only legal source coordinates/anchors. Real `use_ability` reuses the same live-route helper against authoritative state.

## V2.4.22-003 — Withdrawal projection

**State:** ✅ SOURCE CANDIDATE

The shared declaration planner provides current Withdrawal availability, canonical cost, occupied Reserve targets and attached Essence options. Real `withdraw` uses the same plan, then the existing Withdrawal transaction owner proves and applies Payment + Atomic Switch.

## V2.4.22-004 — scope

**State:** ✅

One runtime file changes. No browser/renderer, database schema, migration or card-data source is changed.

## V2.4.22-005 — validation

**State:** 🔄

Hold Match Edge promotion and browser action work until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.


## V2.4.22-006 — historical Ability/Withdraw contract rollover

**State:** ✅ REPAIR CANDIDATE

TCG #702 completed the deterministic runtime and every Deno type-check successfully. Four Node assertions failed because historical tests froze the former inline placement of `runtimeV02BeginActiveAbilityLiveRoute` and Withdrawal declaration checks.

V2.4.22 intentionally centralizes those unchanged authorities so read-only projection and final commit share the same server path:
- Ability tests now verify the shared `beginActiveAbilityRoute` helper owns the canonical live-route call and real `use_ability` delegates to it.
- Withdrawal authority tests now verify `withdrawalDeclaration` owns once-per-turn, condition and cost legality while real `withdraw` delegates to it before the unchanged Payment + Atomic Switch transaction.

This repair changes tests/ledger only. The green Match runtime blob and release-control bytes remain unchanged.


## V2.4.22-007 — exact-head acceptance and Match promotion

**State:** ✅ ACCEPTED / EDGE PROMOTED

Accepted runtime head: `b8b8bc0634f170c9ebc28faeb1b2d69eac7db4b5`.

Exact gates:
- TCG Card Pass 2 Validation #703 ✅
- Migration Replay #873 ✅
- Functional Smoke #899 ✅
- review threads: 0 ✅
- legacy combined statuses: 0 ✅
- bounded V2.4.22 delta: one runtime file + tests/release-control/controls ✅

Supabase promoted the existing `tcg-match-actions` function in place from v5 to **v6 / ACTIVE**, preserving `verify_jwt=true`.

Deployment submitted the release-controlled Match packet with the accepted entrypoint and the historically tracked unreferenced damage-packet-context source. Supabase's deployed-file read-back still materializes 84 files and does not surface that unreferenced source; the accepted entrypoint itself matches GitHub byte-for-byte and contains `field_actions`, `beginActiveAbilityRoute` and `withdrawalDeclaration`.

No new function, project, schema, migration or card-data source was created.

INTERACT-09 now has its accepted/live server projection. Browser Ability/Withdraw card-context controls are the next target.
