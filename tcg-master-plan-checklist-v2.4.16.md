# Stream Bandit TCG — Master Plan Checklist V2.4.16

**Plan:** `tcg-master-plan-progress-v2.4.16.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.16.md`  
**Continuity parent:** `2eda2ddd6f8d342abe4775f1a3071c93b6525a6f`

## A. Browser transport

- [x] **RELIC-UI-01** selected hand card requests `attach_relic_targets(card_uid)` from the authoritative server.
- [x] **RELIC-UI-02** browser stores only returned eligibility and legal coordinates.
- [x] **RELIC-UI-03** only returned Vanguard/Reserve coordinates receive Relic target controls.
- [x] **RELIC-UI-04** pointer and keyboard activation use existing `attach_relic`.
- [x] **RELIC-UI-05** successful commit clears local projections and refreshes authoritative match state.

## B. Ownership / regression

- [x] **RELIC-UI-REG-01** browser contains no Tactic/Relic subtype legality branch.
- [x] **RELIC-UI-REG-02** browser contains no one-Relic-per-Creature legality rule or server error constants.
- [x] **RELIC-UI-REG-03** Evolution and Essence projection precedence remains intact.
- [x] **RELIC-UI-REG-04** generic Creature Reserve and Realm transports remain fallback after all three projections decline.
- [x] **RELIC-UI-REG-05** setup / Attack / Ability / renderer authority remains unchanged.
- [x] **RELIC-UI-REG-06** no Supabase runtime, schema, migration, card data or gameplay-owner change.

## C. Exact-head acceptance

- [x] **V2416-CI-01** TCG Card Pass 2 Validation succeeds — #688 at accepted browser head `ff2f42507e0ad104bc63aa2a227fbacd7e0949f2`.
- [x] **V2416-CI-02** Migration Replay succeeds from zero — #858 retry after transient Supabase CLI release-rate-limit failure.
- [x] **V2416-CI-03** Functional Smoke succeeds — #884.
- [x] **V2416-REVIEW-01** review threads remain zero / material findings resolved.
- [x] **V2416-DIFF-01** diff stays bounded to battle browser/CSS/cache/tests/V2.4.16 controls; no Supabase runtime/schema/migration/card-data change.

## D. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [x] **INTERACT-04** Relic — server legality/projection + direct browser interaction accepted.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.

**Decision:** V2.4.16 ACCEPTED ✅ at `ff2f42507e0ad104bc63aa2a227fbacd7e0949f2`. INTERACT-04 Relic is complete. Supabase v5 remains ACTIVE with no browser-slice redeploy required. Merge / `main` / public / full-live remain HOLD 🔒.
