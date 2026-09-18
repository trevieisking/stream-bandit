# Stream Bandit TCG — Master Plan V2.4.17 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.17.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.17.md`  
**Continuity parent:** `a46749873304a8a4e2eff4bb02862aeeae3a595f`.

## V2.4.17-001 — target selected

**State:** ✅

After INTERACT-04 Relic acceptance, the synchronized Master Plan leaves INTERACT-06 Tactic as the remaining direct card-family interaction.

## V2.4.17-002 — owner diagnosis

**State:** ✅

The live `tcg-tactic-actions` owner already performs complete Tactic declaration legality before removing a card from hand, but the browser has no read-only way to ask whether a selected hand card is playable. Re-implementing those rules in the browser would create duplicate authority.

## V2.4.17-003 — choice contract proof

**State:** ✅

The Tactic owner already persists generic `pending_choice`, Tactic heal-listener choices and Tactic movement-listener choices into authoritative player views. Each exposes choice id, prompt, min/max, mode and labelled option ids for the acting seat.

## V2.4.17-004 — server seam candidate

**State:** ✅ SOURCE CANDIDATE

A single `tacticPlayability` evaluator now supplies both `play_tactic_legality` and real `play_tactic`. Public reason/status precedence is preserved and actual hand mutation begins only after the shared evaluator succeeds.

No effect interpreter, choice resolver, browser, database, schema or card-data change is included.

## V2.4.17-005 — validation

**State:** 🔄

Hold Edge promotion and browser Tactic work until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status, bounded-diff and release-control gates pass.

## V2.4.17-006 — Arcade Lab action-contract rollover

**State:** ✅ REPAIR CANDIDATE

TCG #690 completed the full deterministic runtime/type-check lane successfully. The Set One Node lane failed only because `card-pass-2-arcade-lab-client-contract.test.mjs` froze the prior two-action Tactic whitelist.

The historical contract now recognizes the same single `tcg-tactic-actions` owner with the additive read-only `play_tactic_legality` action while preserving `play_tactic` and `resolve_choice`. No runtime, browser, effect, schema or card-data source changes are part of this repair.


## V2.4.17-007 — exact-head acceptance and in-place Tactic promotion

**State:** ✅ ACCEPTED / EDGE PROMOTED

Accepted runtime head: `bd806873ddb053510d9a7bd3061c6b512e89583c`.

Exact gates all passed:
- TCG Card Pass 2 Validation #691 ✅
- Migration Replay #861 ✅
- Functional Smoke #887 ✅
- review threads: 0 ✅
- legacy combined statuses: 0 ✅
- bounded V2.4.17 delta: 7 files, one runtime file ✅
- release-control closure: 36 files, exact Tactic entrypoint blob ✅

Supabase project `xzxqfrvqdgkzwujbkdbk` promoted the existing `tcg-tactic-actions` function in place from v2 to **v3 / ACTIVE**, with `verify_jwt=true` preserved.

Deployment retained the accepted 36-file bundle and replaced exactly `functions/tcg-tactic-actions/index.ts`. Post-deploy read-back matched the accepted GitHub entrypoint byte-for-byte and confirmed both `play_tactic_legality` and the shared `tacticPlayability` evaluator are live.

No new Supabase project, branch, function, schema, migration, card-data rewrite or effect interpreter was created.

V2.4.17 therefore closes the server playability half of INTERACT-06. Browser card-owned Tactic play plus generic authoritative choice resolution is the next target. PR merge, `main`, Pages/public and full-live remain HOLD.
