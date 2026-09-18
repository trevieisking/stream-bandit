# Stream Bandit TCG — Master Plan Checklist V2.4.15

**Plan:** `tcg-master-plan-progress-v2.4.15.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.15.md`  
**Continuity parent:** `3fb28d827f396021e3c480346b91da5ed4b66550`

## A. Relic server seam

- [x] **RELIC-SRV-01** existing Relic owner classifies structured Tactic/Relic source identity.
- [x] **RELIC-SRV-02** read-only projection returns only friendly occupied Creature coordinates with empty Relic slots.
- [x] **RELIC-SRV-03** final declaration preserves target → occupied slot → source-card public error precedence.
- [x] **RELIC-SRV-04** exact target anchor is passed to existing atomic Relic mutation.
- [x] **RELIC-SRV-05** legacy fallback remains unchanged.
- [x] **RELIC-SRV-06** Stone Flintkin compatibility remains unchanged.
- [x] **RELIC-SRV-07** no browser Relic transport is added.

## B. Regression / architecture

- [x] **RELIC-REG-01** no new gameplay owner.
- [x] **RELIC-REG-02** no schema/database migration.
- [x] **RELIC-REG-03** no card-data rewrite.
- [x] **RELIC-REG-04** 16 Set One Relics have zero attachment-time play requirements.
- [x] **RELIC-REG-05** release-control dependency closure remains exact.

## C. Exact-head acceptance

- [x] **V2415-CI-01** TCG Card Pass 2 Validation succeeds — #686 at accepted runtime head `8303184c11518696ac9bcbdbf00b30d958f5e2df`.
- [x] **V2415-CI-02** Migration Replay succeeds from zero — #856.
- [x] **V2415-CI-03** Functional Smoke succeeds — #882.
- [x] **V2415-REVIEW-01** review threads remain zero / material findings resolved.
- [x] **V2415-DIFF-01** diff stays bounded to Relic owner/dispatcher/tests/release-control/V2.4.15 controls.
- [x] **V2415-DEPLOY-01** accepted exact runtime delta is promoted in place as Supabase `tcg-match-actions` v5 with JWT verification preserved.
- [x] **V2415-DEPLOY-02** deployed entrypoint + Relic owner match accepted GitHub bytes byte-for-byte.

## D. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [ ] **INTERACT-04** Relic — server seam accepted/live; browser half remains the next target.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.

**Decision:** V2.4.15 server seam ACCEPTED ✅ at `8303184c11518696ac9bcbdbf00b30d958f5e2df`. Supabase `tcg-match-actions` v5 is ACTIVE with JWT verification preserved. INTERACT-04 remains open only for the V2.4.16 browser interaction. Merge / `main` / public / full-live remain HOLD 🔒.
