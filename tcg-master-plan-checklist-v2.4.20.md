# Stream Bandit TCG — Master Plan Checklist V2.4.20

**Plan:** `tcg-master-plan-progress-v2.4.20.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.20.md`  
**Continuity parent:** `93a954ea6672d0a0b122a8ad97bbb20d9acbec6c`

## A. Selection cancellation

- [x] **CANCEL-01** selecting the same hand card again clears local hand selection.
- [x] **CANCEL-02** cancellation clears Evolution projection.
- [x] **CANCEL-03** cancellation clears Essence projection.
- [x] **CANCEL-04** cancellation clears Relic projection.
- [x] **CANCEL-05** cancellation clears Tactic projection.
- [x] **CANCEL-06** deselection skips new projection work.
- [x] **CANCEL-07** battlefield card anchor selection toggles off locally.
- [x] **CANCEL-08** pointer and Enter/Space share the same selection/cancel path.
- [x] **CANCEL-09** pre-commit select/deselect branch contains no authoritative mutation action.

## B. Architecture

- [x] **CANCEL-REG-01** actual gameplay commits remain in separate intent functions.
- [x] **CANCEL-REG-02** committed server pending choices are not locally cancellable unless their server contract permits it.
- [x] **CANCEL-REG-03** no product/controller/renderer/server/schema/card-data change.

## C. Exact-head acceptance

- [ ] **V2420-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2420-CI-02** Migration Replay succeeds from zero.
- [ ] **V2420-CI-03** Functional Smoke succeeds.
- [ ] **V2420-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2420-DIFF-01** diff is regression/evidence controls only.

## D. Master-plan interaction state

- [x] **INTERACT-01** Creature.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [x] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [x] **INTERACT-06** Tactic.
- [ ] **INTERACT-07** Selection cancellation — implementation proven; close only after C passes.
- [ ] **INTERACT-08** Server authority remains final legality authority.
- [ ] **INTERACT-09** Vanguard Ability/Attack/Withdraw remain card-context actions.

**Decision:** evidence candidate only until C passes. Main/public/full-live remain HOLD.
