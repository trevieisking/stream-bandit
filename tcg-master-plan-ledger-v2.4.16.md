# Stream Bandit TCG — Master Plan V2.4.16 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.16.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.16.md`  
**Continuity parent:** `2eda2ddd6f8d342abe4775f1a3071c93b6525a6f`.

## V2.4.16-001 — target selected

**State:** ✅

V2.4.15 accepted and deployed the server half of INTERACT-04. The synchronized Master Plan locks the Relic browser interaction as the next target.

## V2.4.16-002 — owner reuse

**State:** ✅ SOURCE CANDIDATE

The browser asks the deployed Relic projection for the selected play-phase hand card. It does not inspect Tactic/Relic subtype fields or Creature Relic occupancy.

## V2.4.16-003 — direct physical interaction

**State:** ✅ SOURCE CANDIDATE

Only server-returned friendly Creature coordinates become accessible green Relic targets. Pointer or keyboard activation sends the existing `attach_relic` action with card UID and coordinate, then refreshes authoritative state.

## V2.4.16-004 — compatibility

**State:** ✅ SOURCE CANDIDATE

Evolution → Essence → Relic projections precede generic Creature/Realm fallback. Existing setup, Attack, Ability and renderer paths remain unchanged. Supabase remains v5 with no runtime change in this slice.

## V2.4.16-005 — historical contracts

**State:** ✅ SOURCE CANDIDATE

V2.4.15 Relic server-seam, V2.4.14 Essence and V2.4.9 Realm regression tests are rolled forward so they preserve ownership and transport guarantees without freezing an earlier interaction/cache shape.

## V2.4.16-006 — validation

**State:** 🔄

Hold INTERACT-04 acceptance until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.


## V2.4.16-007 — exact-head acceptance

**State:** ✅ ACCEPTED

Accepted browser head: `ff2f42507e0ad104bc63aa2a227fbacd7e0949f2`.

Exact gates all passed:
- TCG Card Pass 2 Validation #688 ✅
- Migration Replay #858 attempt 2 ✅
- Functional Smoke #884 ✅
- review threads: 0 ✅
- legacy combined statuses: 0 ✅
- bounded diff: battle browser/CSS/cache/tests/V2.4.16 controls only ✅

Migration #858 attempt 1 failed before source replay because `supabase/setup-cli@v1` could not resolve the latest CLI release due to an upstream rate limit. Retrying the same exact-head job succeeded through CLI install, source replay, disposable database startup and zero-to-current replay; no workflow or product source repair was required.

Supabase remains unchanged at the already-accepted `tcg-match-actions` **v5 / ACTIVE / verify_jwt=true** because V2.4.16 contains no server runtime bytes.

INTERACT-04 Relic is now complete end-to-end: the Relic owner remains the sole legality authority; the battlefield asks for legal target coordinates, renders only those targets and commits through the existing `attach_relic` action.

PR merge, `main`, public Pages and full-live release remain HOLD pending inherited E2E/release gates.
