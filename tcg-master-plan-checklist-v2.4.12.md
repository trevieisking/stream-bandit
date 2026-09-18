# Stream Bandit TCG — Master Plan Checklist V2.4.12

**Plan:** `tcg-master-plan-progress-v2.4.12.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.12.md`  
**Continuity parent:** `2d8b592c5d516ac4ac4bf3f7d1ee349b6c3fcdfc`

## A. Server authority reuse

- [x] **V2412-EVOLVE-01** selected hand card requests `evolve_targets(card_uid)`.
- [x] **V2412-EVOLVE-02** browser consumes only returned `eligible` + `legal_targets`.
- [x] **V2412-EVOLVE-03** browser does not classify stage, predecessor or turn legality.
- [x] **V2412-EVOLVE-04** final action is existing `evolve(card_uid, where, index)`.
- [x] **V2412-EVOLVE-05** server revalidation remains authoritative.

## B. Board presentation

- [x] **V2412-VIS-01** server-returned Vanguard target gains direct card-stack target control.
- [x] **V2412-VIS-02** server-returned Reserve targets gain direct stack target controls.
- [x] **V2412-VIS-03** legal Evolution targets use green visual treatment.
- [x] **V2412-VIS-04** reduced-motion mode removes pulse animation.
- [x] **V2412-VIS-05** Evolution mode suppresses generic Reserve/Realm destinations for the same selected card.

## C. Regression protection

- [x] **V2412-REG-01** play_creature transport remains present.
- [x] **V2412-REG-02** play_realm transport remains present.
- [x] **V2412-REG-03** Attack/card-context path is not modified.
- [x] **V2412-REG-04** renderer source is not modified.
- [x] **V2412-REG-05** no Supabase/database/schema source is modified.

## D. Exact-head gates

- [ ] **V2412-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2412-CI-02** Migration Replay succeeds from zero.
- [ ] **V2412-CI-03** Functional Smoke succeeds.
- [ ] **V2412-REVIEW-01** review threads remain zero / findings resolved.
- [ ] **V2412-DIFF-01** diff remains bounded to controller/CSS/page cache/test/V2.4.12 controls.

## E. Master-plan state

- [x] **INTERACT-01** Creature Vanguard/Reserve tap-select accepted.
- [ ] **INTERACT-02** Evolution — candidate complete; exact-head gate pending.
- [x] **STATE-VIS-05** legal-target highlight architecture now uses server-returned coordinates for Evolution.
- [ ] **STATE-VIS-06** green Evolution target highlighting — candidate complete; exact-head gate pending.
- [ ] **INTERACT-03** Essence.
- [ ] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.

**Decision:** candidate source only until D passes. Supabase v3 remains authoritative; merge/main/public/full-live HOLD.
