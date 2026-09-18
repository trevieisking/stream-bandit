# Stream Bandit TCG — Master Plan Checklist V2.4.25

**Plan:** `tcg-master-plan-progress-v2.4.25.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.25.md`  
**Continuity parent:** `d1fe2fb8c5a2dd942c4a87e88a8d07edc1aa35c0`

## A. Existing authoritative presentation reconciliation

- [x] **STATE-REC-01** current HP/damage is rendered from authoritative Creature damage + definition HP.
- [x] **STATE-REC-02** Shield is rendered from authoritative Creature shield.
- [x] **STATE-REC-03** active Conditions are rendered generically.
- [x] **STATE-REC-06** server-projected Evolution targets have green glow.
- [x] **STATE-REC-08** Deck and Discard counts are visible for both players.
- [x] **STATE-REC-09** current turn and phase are visible.
- [x] **STATE-REC-10** pending Attack/Ability/Event/Movement/Heal/Tactic choices use the generic authoritative choice panel.

## B. Ability availability

- [x] **STATE-ABILITY-01** local printed active Ability receives a card-context ready/locked state only while `field_actions` is revision-current.
- [x] **STATE-ABILITY-02** ready derives only from exact `ability_sources` coordinate + anchor match.
- [x] **STATE-ABILITY-03** browser contains no once-per-turn ledger / requirements / cost / condition legality evaluator.
- [x] **STATE-ABILITY-04** existing card-owned Use Ability action remains available only for server-projected ready sources.

## C. Terminal result

- [x] **STATE-RESULT-01** complete match renders Victory/Defeat from authoritative `result.winner_seat` relative to local seat.
- [x] **STATE-RESULT-02** result reasons are presentation-only text.
- [x] **STATE-RESULT-03** overtime-pending result is explicitly visible without inventing a winner.
- [x] **STATE-RESULT-04** browser contains no reward/deckout/no-creature win-condition evaluator.

## D. Regression / scope

- [x] **V2425-REG-01** accepted Reward/promotion resolution remains intact.
- [x] **V2425-REG-02** accepted Attack/Ability/Withdraw/Tactic transports remain intact.
- [x] **V2425-REG-03** no Match/Tactic/Setup runtime, schema, migration or card-data change.
- [x] **V2425-REG-04** battle cache identity advances to V2.4.25.

## E. Exact-head acceptance

- [ ] **V2425-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2425-CI-02** Migration Replay succeeds from zero.
- [ ] **V2425-CI-03** Functional Smoke succeeds.
- [ ] **V2425-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2425-DIFF-01** diff stays bounded to browser/renderer/CSS/cache/tests/V2.4.25 controls.

## F. Canonical effect after E passes

- [ ] **STATE-VIS-01**
- [ ] **STATE-VIS-02**
- [ ] **STATE-VIS-03**
- [ ] **STATE-VIS-04**
- [ ] **STATE-VIS-06**
- [ ] **STATE-VIS-08**
- [ ] **STATE-VIS-09**
- [ ] **STATE-VIS-10**
- [ ] **STATE-VIS-12**

**Still open:** STATE-VIS-05 ordinary Creature/Realm legal-target projection. ORDER-05 remains open until that final Stage 3 state closes.
