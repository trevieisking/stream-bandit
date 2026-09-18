# Stream Bandit TCG — Master Plan Checklist V2.4.18

**Plan:** `tcg-master-plan-progress-v2.4.18.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.18.md`  
**Continuity parent:** `ad8cf902c0900f6d7573c45ab024778ee0c4d3d1`

## A. Dedicated-owner fence

- [x] **TACTIC-OWN-01** generic Tactic route accepts Ally.
- [x] **TACTIC-OWN-02** generic Tactic route accepts Device.
- [x] **TACTIC-OWN-03** Realm is rejected from generic Tactic route.
- [x] **TACTIC-OWN-04** Relic is rejected from generic Tactic route.
- [x] **TACTIC-OWN-05** projection and real play share the same owner fence.
- [x] **TACTIC-OWN-06** owner fence executes before mutation/effect legality work.

## B. Regression / architecture

- [x] **TACTIC-OWN-REG-01** Realm owner/action remains unchanged.
- [x] **TACTIC-OWN-REG-02** Relic owner/action remains unchanged.
- [x] **TACTIC-OWN-REG-03** Tactic effect interpreter / resolve_choice remain unchanged.
- [x] **TACTIC-OWN-REG-04** no browser Tactic transport yet.
- [x] **TACTIC-OWN-REG-05** no schema/migration/card-data change.
- [x] **TACTIC-OWN-REG-06** Tactic release-control closure remains 36 files and exact.

## C. Exact-head acceptance

- [x] **V2418-CI-01** TCG Card Pass 2 Validation succeeds — #693 at accepted runtime head `2b7325c677cdc66cb6ab485fbf031d90190c78b0`.
- [x] **V2418-CI-02** Migration Replay succeeds from zero — #863.
- [x] **V2418-CI-03** Functional Smoke succeeds — #889.
- [x] **V2418-REVIEW-01** review threads remain zero / material findings resolved.
- [x] **V2418-DIFF-01** diff stays bounded to Tactic owner/test/release-control/V2.4.18 controls; runtime delta is +8 lines in one file.
- [x] **V2418-DEPLOY-01** accepted Tactic entrypoint promoted in place as `tcg-tactic-actions` v4 with JWT verification preserved.
- [x] **V2418-DEPLOY-02** deployed Tactic entrypoint matches accepted GitHub bytes byte-for-byte.

## D. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [x] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic — server playability + dedicated-owner fence accepted/live; browser half remains.

**Decision:** V2.4.18 ACCEPTED ✅ at `2b7325c677cdc66cb6ab485fbf031d90190c78b0`. Supabase `tcg-tactic-actions` v4 is ACTIVE with JWT verification preserved. Generic Tactic now owns Ally/Device only; Realm/Relic remain on dedicated owners. Merge / `main` / public / full-live remain HOLD 🔒.
