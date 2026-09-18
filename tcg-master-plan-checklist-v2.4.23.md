# Stream Bandit TCG — Master Plan Checklist V2.4.23

**Plan:** `tcg-master-plan-progress-v2.4.23.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.23.md`  
**Continuity parent:** `3216cb5638bc85267d87b8e7eb23d0ba356d450c`

## A. Field action projection transport

- [x] **FIELD-UI-01** browser requests `field_actions` only on the active play seat.
- [x] **FIELD-UI-02** projection is revision-bound and fail-closed when stale/unavailable.
- [x] **FIELD-UI-03** browser stores only projected Ability coordinates/anchors and Withdrawal cost/targets/payment options.
- [x] **FIELD-UI-04** browser contains no Ability live-route or Withdrawal legality/cost engine.

## B. Card-context actions

- [x] **FIELD-UI-05** exact projected Ability sources expose **Use Ability** on their physical card.
- [x] **FIELD-UI-06** Ability commit reuses `use_ability(where,index)`.
- [x] **FIELD-UI-07** eligible Vanguard exposes **Withdraw** on its physical card.
- [x] **FIELD-UI-08** only projected Reserve anchors become Withdrawal targets.
- [x] **FIELD-UI-09** only projected attached Essence UIDs can be chosen for payment.
- [x] **FIELD-UI-10** Withdrawal selection is cancellable before commit.
- [x] **FIELD-UI-11** Withdrawal commit reuses `withdraw(reserve_index, discard_essence_uids)`.
- [x] **FIELD-UI-12** Attack card action remains unchanged.

## C. Authoritative continuations

- [x] **FIELD-UI-13** generic choice panel routes `pending_ability_choice` to Match `resolve_ability_choice`.
- [x] **FIELD-UI-14** normal movement/heal listener continuations route to Match owner.
- [x] **FIELD-UI-15** Tactic effect-resolution movement/heal and generic choices remain Tactic-owned.
- [x] **FIELD-UI-16** server choice schema remains id/kind/waiting/prompt/min/max/mode/options only.
- [x] **FIELD-UI-17** no card-ID/listener-ID/effect-opcode routing is added.

## D. Exact-head acceptance

- [ ] **V2423-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2423-CI-02** Migration Replay succeeds from zero.
- [ ] **V2423-CI-03** Functional Smoke succeeds.
- [ ] **V2423-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2423-DIFF-01** diff stays bounded to battle browser/CSS/cache/tests/V2.4.23 controls.

## E. Master-plan interaction state

- [x] **INTERACT-01…08** accepted.
- [ ] **INTERACT-09** Vanguard Ability/Attack/Withdraw — source candidate complete; close after D passes.

**Decision:** source candidate only until D passes. Supabase Match v6 / Tactic v4 / merge / `main` / public / full-live remain unchanged.
