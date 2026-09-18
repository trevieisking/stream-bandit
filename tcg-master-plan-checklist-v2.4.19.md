# Stream Bandit TCG — Master Plan Checklist V2.4.19

**Plan:** `tcg-master-plan-progress-v2.4.19.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.19.md`  
**Continuity parent:** `72ad47d3c2fdd0f958d943e6571145bbc96a3662`

## A. Tactic card transport

- [x] **TACTIC-UI-01** selected play-phase hand card asks `play_tactic_legality(card_uid)`.
- [x] **TACTIC-UI-02** browser consumes only the server `eligible` result for Tactic card control.
- [x] **TACTIC-UI-03** Play Tactic appears as an action on the selected card only when server eligible.
- [x] **TACTIC-UI-04** card action commits through existing `play_tactic`.
- [x] **TACTIC-UI-05** success/rejection re-sync authoritative match state.
- [x] **TACTIC-UI-06** browser contains no Ally/Device/Realm/Relic subtype routing or Tactic legality error rules.

## B. Generic Tactic choice transport

- [x] **TACTIC-CHOICE-01** generic `pending_choice` is recognized as Tactic-owned.
- [x] **TACTIC-CHOICE-02** movement/heal listener choices route to Tactic only during `effect_resolution`.
- [x] **TACTIC-CHOICE-03** waiting choices render read-only waiting state.
- [x] **TACTIC-CHOICE-04** prompt/min/max/mode/options come from the server view.
- [x] **TACTIC-CHOICE-05** option IDs are submitted through existing `resolve_choice`.
- [x] **TACTIC-CHOICE-06** no card ID, effect opcode, listener ID or choice-kind-specific browser helper is added.

## C. Regression / architecture

- [x] **TACTIC-UI-REG-01** Evolution → Essence → Relic precedence remains intact.
- [x] **TACTIC-UI-REG-02** eligible Tactic precedes generic Creature/Realm fallback.
- [x] **TACTIC-UI-REG-03** generic fallback remains server-validated when Tactic projection is not eligible.
- [x] **TACTIC-UI-REG-04** existing card renderer is reused unchanged.
- [x] **TACTIC-UI-REG-05** no Supabase runtime/schema/migration/card-data change.
- [x] **TACTIC-UI-REG-06** Play Tactic remains card-owned; choice panel appears only for pending continuation.

## D. Exact-head acceptance

- [ ] **V2419-CI-01** TCG Card Pass 2 Validation succeeds.
- [ ] **V2419-CI-02** Migration Replay succeeds from zero.
- [ ] **V2419-CI-03** Functional Smoke succeeds.
- [ ] **V2419-REVIEW-01** review threads remain zero / material findings resolved.
- [ ] **V2419-DIFF-01** diff stays bounded to battle browser/CSS/cache/tests/V2.4.19 controls.

## E. Master-plan interaction state

- [x] **INTERACT-01** Creature placement.
- [x] **INTERACT-02** Evolution.
- [x] **INTERACT-03** Essence.
- [x] **INTERACT-04** Relic.
- [x] **INTERACT-05** Realm.
- [ ] **INTERACT-06** Tactic — browser candidate implemented; close only after D passes.

**Decision:** source candidate only until D passes. Supabase `tcg-tactic-actions` v4 remains the accepted/live server owner; merge / `main` / public / full-live remain HOLD.
