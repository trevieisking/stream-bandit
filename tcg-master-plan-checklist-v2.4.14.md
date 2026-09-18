# Stream Bandit TCG — Master Plan Checklist V2.4.14

**Plan:** `tcg-master-plan-progress-v2.4.14.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.14.md`  
**Continuity parent:** `1e136bfbe4aa5804a2699bbbab6a1a20a9bde57d`

## A. Browser transport

- [x] **ESSENCE-UI-01** selected hand card requests `attach_essence_targets(card_uid)` from the authoritative server.
- [x] **ESSENCE-UI-02** browser stores only returned eligibility and legal coordinates.
- [x] **ESSENCE-UI-03** only returned Vanguard/Reserve coordinates receive Essence target controls.
- [x] **ESSENCE-UI-04** pointer and keyboard activation use existing `attach_essence`.
- [x] **ESSENCE-UI-05** successful commit clears local projection and refreshes authoritative match state.

## B. Ownership / regression

- [x] **ESSENCE-UI-REG-01** browser contains no manual Essence turn-use rule.
- [x] **ESSENCE-UI-REG-02** browser contains no Essence card-family legality branch.
- [x] **ESSENCE-UI-REG-03** Evolution projection keeps precedence.
- [x] **ESSENCE-UI-REG-04** generic Creature Reserve and Realm transports remain fallback.
- [x] **ESSENCE-UI-REG-05** setup / Attack / renderer authority remains unchanged.
- [x] **ESSENCE-UI-REG-06** no Supabase runtime, schema, migration, card data or gameplay-owner change.

## C. Exact-head acceptance

- [ ] **V2414-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2414-CI-02** Migration Replay succeeds from zero.
- [ ] **V2414-CI-03** Functional Smoke succeeds.
- [ ] **V2414-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2414-DIFF-01** diff stays bounded to battle browser/CSS/cache/test/V2.4.14 controls.

## D. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [ ] **INTERACT-03** Essence — browser candidate implemented; close only after C passes.
- [ ] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.

**Decision:** source candidate only until C passes. Supabase v4 remains the accepted server seam; merge / `main` / public / full-live remain HOLD.
