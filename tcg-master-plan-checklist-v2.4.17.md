# Stream Bandit TCG — Master Plan Checklist V2.4.17

**Plan:** `tcg-master-plan-progress-v2.4.17.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.17.md`  
**Continuity parent:** `a46749873304a8a4e2eff4bb02862aeeae3a595f`

## A. Tactic server seam

- [x] **TACTIC-SRV-01** `play_tactic_legality` is read-only.
- [x] **TACTIC-SRV-02** projection and real play call the same `tacticPlayability` evaluator.
- [x] **TACTIC-SRV-03** active-turn and pending-effect fences remain server-owned.
- [x] **TACTIC-SRV-04** structured Tactic/engine schema identity remains server-owned.
- [x] **TACTIC-SRV-05** Ally first-turn restriction remains server-owned.
- [x] **TACTIC-SRV-06** play requirements, required target/resource and unsupported-op checks remain server-owned.
- [x] **TACTIC-SRV-07** real hand removal/effect creation occurs only after shared playability succeeds.
- [x] **TACTIC-SRV-08** no browser Tactic transport is added.

## B. Regression / architecture

- [x] **TACTIC-REG-01** existing effect interpreter and `resolve_choice` flow are unchanged.
- [x] **TACTIC-REG-02** no new gameplay owner.
- [x] **TACTIC-REG-03** no schema/database migration.
- [x] **TACTIC-REG-04** no card-data rewrite.
- [x] **TACTIC-REG-05** `tcg-tactic-actions` release-control closure remains 36 files and exact.

## C. Exact-head acceptance

- [x] **V2417-CI-01** TCG Card Pass 2 Validation succeeds — #691 at accepted runtime head `bd806873ddb053510d9a7bd3061c6b512e89583c`.
- [x] **V2417-CI-02** Migration Replay succeeds from zero — #861.
- [x] **V2417-CI-03** Functional Smoke succeeds — #887.
- [x] **V2417-REVIEW-01** review threads remain zero / material findings resolved.
- [x] **V2417-DIFF-01** diff stays bounded to Tactic owner/test/release-control/V2.4.17 controls; one runtime file only.
- [x] **V2417-DEPLOY-01** accepted exact Tactic runtime delta is promoted in place as `tcg-tactic-actions` v3 with JWT verification preserved.
- [x] **V2417-DEPLOY-02** deployed Tactic entrypoint matches accepted GitHub bytes byte-for-byte.

## D. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [x] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic — server playability seam accepted/live; browser half remains the next target.

**Decision:** V2.4.17 server seam ACCEPTED ✅ at `bd806873ddb053510d9a7bd3061c6b512e89583c`. Supabase `tcg-tactic-actions` v3 is ACTIVE with JWT verification preserved. INTERACT-06 remains open only for the browser interaction/choice surface. Merge / `main` / public / full-live remain HOLD 🔒.
