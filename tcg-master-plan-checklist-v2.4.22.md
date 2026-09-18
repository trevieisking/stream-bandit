# Stream Bandit TCG — Master Plan Checklist V2.4.22

**Plan:** `tcg-master-plan-progress-v2.4.22.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.22.md`  
**Continuity parent:** `b7581be870e5afe521494531f3c7eaa9383a51e8`

## A. Read-only field action projection

- [x] **FIELD-ACT-01** `field_actions` performs no commit.
- [x] **FIELD-ACT-02** Ability eligibility executes only on cloned state.
- [x] **FIELD-ACT-03** Ability projection returns source coordinate + anchor UID only.
- [x] **FIELD-ACT-04** Withdrawal projection returns current eligibility/cost.
- [x] **FIELD-ACT-05** Withdrawal projection returns occupied legal Reserve anchors.
- [x] **FIELD-ACT-06** Withdrawal projection returns attached Essence payment options.

## B. Shared server authority

- [x] **FIELD-ACT-REG-01** projection + `use_ability` share canonical Ability live-route helper.
- [x] **FIELD-ACT-REG-02** projection + `withdraw` share declaration planner.
- [x] **FIELD-ACT-REG-03** real Withdrawal still delegates payment/switch to canonical transaction owner.
- [x] **FIELD-ACT-REG-04** Attack path is unchanged.
- [x] **FIELD-ACT-REG-05** no browser Ability/Withdraw transport yet.
- [x] **FIELD-ACT-REG-06** no schema/migration/card-data change.
- [x] **FIELD-ACT-REG-07** Match release-control closure remains 85 files and exact.

## C. Exact-head acceptance

- [ ] **V2422-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2422-CI-02** Migration Replay succeeds from zero.
- [ ] **V2422-CI-03** Functional Smoke succeeds.
- [ ] **V2422-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2422-DIFF-01** diff stays bounded to Match owner/test/release-control/V2.4.22 controls.
- [ ] **V2422-DEPLOY-01** accepted Match entrypoint promoted in place with JWT verification preserved.
- [ ] **V2422-DEPLOY-02** deployed Match entrypoint matches accepted GitHub bytes.

## D. Master-plan interaction state

- [x] **INTERACT-01…08** accepted.
- [ ] **INTERACT-09** Vanguard Ability/Attack/Withdraw — Attack card-owned; server projection candidate for Ability/Withdraw; browser half remains.

**Decision:** source candidate only until C passes. Current Match v5 / main/public/full-live remain unchanged.
