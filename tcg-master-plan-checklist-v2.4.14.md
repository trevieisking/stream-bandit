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

- [x] **V2414-CI-01** TCG Card Pass 2 Validation succeeds — #681 at accepted browser head `6a1dda89ede7bc4519f19f52d3bf9ce56b7ebf94`.
- [x] **V2414-CI-02** Migration Replay succeeds from zero — #851.
- [x] **V2414-CI-03** Functional Smoke succeeds — #877.
- [x] **V2414-REVIEW-01** review threads remain zero / material findings resolved.
- [x] **V2414-DIFF-01** diff stays bounded to battle browser/CSS/cache/tests/V2.4.14 controls; no Supabase runtime, migration, schema or card-data files.

## D. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence — server legality + direct browser interaction accepted.
- [ ] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.

**Decision:** V2.4.14 ACCEPTED ✅ at `6a1dda89ede7bc4519f19f52d3bf9ce56b7ebf94`. INTERACT-03 Essence is complete. Supabase v4 remains the accepted/live server seam with no browser-slice redeploy required. Merge / `main` / public / full-live remain HOLD 🔒.
