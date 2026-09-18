# Stream Bandit TCG — Master Plan Checklist V2.4.13

**Plan:** `tcg-master-plan-progress-v2.4.13.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.13.md`  
**Continuity parent:** `ded077d7d835f37b88046e6bba7065510bebaef6`

## A. Existing-owner architecture

- [x] **ESSENCE-OWNER-01** manual legality is added to the existing Essence Attachment family.
- [x] **ESSENCE-OWNER-02** no gameplay owner #41 is introduced.
- [x] **ESSENCE-OWNER-03** canonical Attachment transaction still owns source removal + attachment mutation + lifecycle/event identity.
- [x] **ESSENCE-OWNER-04** legacy/unmarked fallback remains intact.

## B. Server legal-target seam

- [x] **ESSENCE-TARGET-01** read-only `attach_essence_targets(card_uid)` exists.
- [x] **ESSENCE-TARGET-02** once-per-turn manual use is server-owned.
- [x] **ESSENCE-TARGET-03** source Essence-card identity is server-owned.
- [x] **ESSENCE-TARGET-04** occupied friendly Vanguard/Reserve target projection is server-owned.
- [x] **ESSENCE-TARGET-05** projection performs no card/Creature mutation.
- [x] **ESSENCE-TARGET-06** final structured `attach_essence` declaration revalidates through the same owner before mutation.
- [x] **ESSENCE-TARGET-07** current public errors remain `manual_essence_already_used_this_turn`, `target_creature_not_found`, `essence_card_required`.

## C. Regression / extensibility

- [x] **ESSENCE-REG-01** listener/movement/heal continuation path is retained.
- [x] **ESSENCE-REG-02** old card-specific compatibility effects remain legacy-only.
- [x] **ESSENCE-REG-03** no browser Essence targeting logic is added.
- [x] **ESSENCE-REG-04** no DB/schema/card-data change is introduced.
- [x] **ESSENCE-REG-05** release-control closure remains exact and at 85 source files.

## D. Exact-head / deployment gates

- [ ] **V2413-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2413-CI-02** Migration Replay succeeds from zero.
- [ ] **V2413-CI-03** Functional Smoke succeeds.
- [ ] **V2413-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2413-DIFF-01** diff stays bounded to Essence owner/dispatcher/tests/release-control/V2.4.13 controls.
- [ ] **V2413-DEPLOY-01** accepted exact `tcg-match-actions` source is promoted in place with JWT verification preserved.
- [ ] **V2413-DEPLOY-02** deployed entrypoint + Essence owner are re-read and match accepted GitHub source.

## E. Master-plan state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [ ] **INTERACT-03** Essence — server seam candidate complete here; browser interaction remains V2.4.14.
- [ ] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic.

**Decision:** candidate source only until D passes. Current Supabase v3 / merge / main / public / full-live remain unchanged.
