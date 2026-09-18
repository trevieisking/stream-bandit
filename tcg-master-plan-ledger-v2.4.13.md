# Stream Bandit TCG — Master Plan V2.4.13 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.13.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.13.md`  
**Continuity parent:** `ded077d7d835f37b88046e6bba7065510bebaef6`.

## V2.4.13-001 — target selected

**State:** ✅

Canonical V2.4.1 direct-interaction order makes Essence the next unfinished card family after accepted Evolution.

## V2.4.13-002 — owner audit

**State:** ✅

Existing Essence Attachment engine owns exact mutation/lifecycle/event semantics. The manual dispatcher still duplicated the thin once-per-turn/source-family/target declaration checks and had no read-only target projection.

## V2.4.13-003 — legality seam

**State:** ✅ SOURCE CANDIDATE

The existing Attachment owner now provides one read-only manual target projection and one final declaration validator. Structured `attach_essence` revalidates there before entering the existing external Attachment route.

## V2.4.13-004 — compatibility

**State:** ✅ SOURCE CANDIDATE

Legacy/unmarked Essence behavior is preserved exactly as a fallback. No browser, database, schema, card definition or new gameplay owner is added.

## V2.4.13-005 — release-control fence

**State:** ✅ SOURCE CANDIDATE

The `tcg-match-actions` source closure remains 85 files. Entry/Essence-owner blob fingerprints and closure SHA-256 are regenerated for the candidate.

## V2.4.13-006 — validation/deployment

**State:** 🔄

Hold branch acceptance and Supabase promotion until fresh exact-head CI, review/status and bounded-diff gates pass.

## Checkpoint

Supabase `tcg-match-actions` v3 remains deployed and unchanged. PR merge/main/public/full-live remain HOLD.


## V2.4.13-007 — first exact-head integration repair

**State:** ✅ DETACHED REPAIR CANDIDATE

TCG #674 proved the new Essence legality itself type-checks and deterministic runtime passes, but two source-control contracts needed synchronization:

1. the shared Essence Attachment engine also belongs to the `tcg-tactic-actions` dependency closure, so both affected release-control closure digests must be refreshed;
2. accepted ownership tests preserve the explicit `targetInst.uid` handoff into the external Attachment Route. The structured branch now names the already server-validated anchor as `targetInst.uid` before routing, without reintroducing target legality.

No Essence rule, mutation, listener, browser, database or legacy fallback behavior changes in this repair.


## V2.4.13-008 — final route-shape compatibility repair

**State:** ✅ DETACHED REPAIR CANDIDATE

TCG #675 showed one remaining historical ownership assertion: the structured external Attachment Route must retain the explicit option shape `destination_index:where==="reserve"?idx:null`.

The declaration has already been validated by the shared Essence legality owner, so preserving this expression does not return legality to the dispatcher; it only keeps the accepted route contract visible. The match-actions release fingerprint is refreshed for the resulting entrypoint byte change.

No Essence owner, rule, mutation, listener, legacy fallback, browser, database or card-data behavior changes.


## V2.4.13-009 — stale Surge ownership guard repair

**State:** ✅ REPAIR CANDIDATE

TCG #676 passed all 428 Node regression tests and the deterministic v0.2 runtime core, then failed only the historical Runtime Pass B Surge source-shape guard with `match_actions_attachment_engine_boundary_missing`.

The guard still required the pre-V2.4.13 inline sequence where `td=top(cr,s)` appeared immediately before the structured Attachment branch. V2.4.13 intentionally moved final manual Essence declaration legality into the existing Essence Attachment owner before entering that route, so the old exact-string boundary was stale.

The guard now verifies the current canonical chain instead: structured branch → shared manual Essence legality delegate → validated target UID anchor → existing external Attachment Route → Attachment Engine → Surge lifecycle owner. Existing checks that forbid Match Actions from regaining attachment lifecycle authority remain unchanged.

No gameplay rule, card data, browser behavior, database/schema, Edge deployment or legacy fallback behavior changes in this repair.
