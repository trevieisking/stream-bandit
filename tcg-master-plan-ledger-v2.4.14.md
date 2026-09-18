# Stream Bandit TCG — Master Plan V2.4.14 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.14.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.14.md`  
**Continuity parent:** `1e136bfbe4aa5804a2699bbbab6a1a20a9bde57d`.

## V2.4.14-001 — target selected

**State:** ✅

V2.4.13 accepted and deployed the server half of INTERACT-03. The next locked target is the browser transport only.

## V2.4.14-002 — owner reuse

**State:** ✅ SOURCE CANDIDATE

The browser asks both existing server projections for a selected play-phase hand card. It does not inspect card family or rebuild rules. Evolution retains precedence; Essence becomes active only from the server's `eligible` result.

## V2.4.14-003 — physical Essence interaction

**State:** ✅ SOURCE CANDIDATE

Server-returned friendly Creature coordinates become accessible green targets. Pointer or keyboard activation sends the existing `attach_essence` action with card UID and coordinate, then refreshes authoritative state.

## V2.4.14-004 — compatibility

**State:** ✅ SOURCE CANDIDATE

Creature Reserve, Realm, setup, Evolution and Attack transports are preserved. No Supabase runtime, database/schema, card registry or new gameplay owner changes.

## V2.4.14-005 — validation

**State:** 🔄

Hold acceptance until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.


## V2.4.14-006 — historical regression contract rollover

**State:** ✅ REPAIR CANDIDATE

TCG #679 showed three historical browser assertions that intentionally froze earlier delivery states: V2.4.13 required no Essence browser transport, V2.4.12 required an exact cache marker, and V2.4.9 required the pre-Essence Realm fallback expression.

Those tests now retain their original ownership/transport guarantees while allowing the later V2.4.14 interaction layer: Essence legality is still forbidden from the browser, Evolution must not regress below V2.4.12, and Realm remains the generic fallback only after both server-projected Evolution and Essence modes decline the selected card.

No production source, game rule, server runtime, card data or Supabase state changes in this repair.


## V2.4.14-007 — exact-head gate concurrency retry

**State:** 🔄 CONTROL-ONLY RETRY

TCG #680 passed at the repaired candidate head. Migration #850 was cancelled before any job started because prior-head Migration #849 still occupied the serialized replay lane; #849 then completed successfully. GitHub does not permit retrying a run that never started.

This control-only checkpoint retriggers all exact-head gates after the replay lane is clear. No browser implementation, gameplay rule, server runtime, database/schema, card data or Supabase deployment changes.


## V2.4.14-008 — exact-head acceptance

**State:** ✅ ACCEPTED

Accepted browser head: `6a1dda89ede7bc4519f19f52d3bf9ce56b7ebf94`.

Exact gates all passed:
- TCG Card Pass 2 Validation #681 ✅
- Migration Replay #851 ✅
- Functional Smoke #877 ✅
- review threads: 0 ✅
- legacy combined statuses: 0 ✅
- bounded diff: browser controller/CSS/cache marker/tests/V2.4.14 controls only ✅

Supabase remained unchanged at the already-accepted `tcg-match-actions` **v4 / ACTIVE / verify_jwt=true** because this slice contains no server runtime change.

INTERACT-03 Essence is now complete end-to-end: server owns family/timing/once-per-turn/target legality; browser asks for legal target coordinates, renders only those targets, then commits through the existing `attach_essence` action.

PR merge, `main`, public Pages and full-live release remain HOLD pending the inherited release/E2E gates.
