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
