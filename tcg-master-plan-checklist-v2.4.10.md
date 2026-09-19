# Stream Bandit TCG — Master Plan Checklist V2.4.10

**Canonical authority:** `tcg-master-plan-progress-v2.4.1.md` + latest accepted interaction checkpoints  
**Execution plan:** `tcg-master-plan-progress-v2.4.10.md`  
**Ledger:** `tcg-master-plan-ledger-v2.4.10.md`  
**Continuity parent:** `b5baf1dde2d39fc45e93f41cd609d22af18808c2`  
**Release:** 🔒 HOLD merge / `main` / public / live / production.

## A. Parent fence

- [x] **V2410-PARENT-01** V2.4.9 gameplay accepted at `0df1e344...`.
- [x] **V2410-PARENT-02** V2.4.9 continuity head `b5baf1dd...` changes acceptance docs only.
- [x] **V2410-PARENT-03** Continuity TCG #663, Migration #833 and Functional #859 all succeeded.
- [x] **V2410-PARENT-04** Current review threads = 0; legacy combined statuses = none found.

## B. Setup lifecycle source

- [x] **INTERACT-01-SRC-01** Opening toss winner receives first/second lifecycle controls.
- [x] **INTERACT-01-SRC-02** Setup-turn hand selection exposes Vanguard and four Reserve destinations.
- [x] **INTERACT-01-SRC-03** Setup placement transport sends only envelope + `card_uid`, `where`, `index`.
- [x] **INTERACT-01-SRC-04** Setup Creature can return to hand through a card-context `setup_return` intent.
- [x] **INTERACT-01-SRC-05** Setup Ready sends only the authoritative setup-ready action envelope.
- [x] **INTERACT-01-SRC-06** All setup success/rejection paths re-sync authoritative state.
- [x] **INTERACT-01-SRC-07** Existing play-phase Reserve, Realm and Attack transports remain in source.

## C. Authority fence

- [x] **V2410-AUTH-01** Browser does not call/duplicate `starterLegal`.
- [x] **V2410-AUTH-02** Browser does not decide setup slot occupancy or starter stage/type legality.
- [x] **V2410-AUTH-03** Server `runtimeV02ApplyOpeningChoice` owns opening lifecycle.
- [x] **V2410-AUTH-04** Server `runtimeV02PlaceCreatureFromHand` owns setup placement.
- [x] **V2410-AUTH-05** Server `runtimeV02ReturnSetupCreatureToHand` owns setup return.
- [x] **V2410-AUTH-06** Server `runtimeV02ApplySetupReady` + Card-Zone batch own readiness/distribution.
- [x] **V2410-AUTH-07** No new gameplay owner, Edge Function, migration, card definition or card-specific branch.

## D. Reusable UI foundation

- [x] **V2410-UI-01** Reusable renderer remains pure and gains generic card-context intent markup.
- [x] **V2410-UI-02** Attack markup/payload ownership remains unchanged.
- [x] **V2410-UI-03** Setup return uses the generic card-context row, leaving the same route open for later Ability/Withdraw presentation.

## E. Exact-head gates

- [x] **V2410-CI-01** TCG Card Pass 2 Validation #665 succeeded at exact head `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`.
- [x] **V2410-CI-02** Migration Replay #835 succeeded from zero at exact head `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`.
- [x] **V2410-CI-03** Functional Smoke #861 succeeded at exact head `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`, including independent PostgreSQL replay.
- [x] **V2410-REVIEW-01** Review threads were zero; legacy combined statuses had no entries.
- [x] **V2410-DIFF-01** Final delta from `b5baf1dde2d39fc45e93f41cd609d22af18808c2` was 2 commits ahead / 0 behind and exactly 9 intended files.

## F. Master-plan interaction state

- [x] **INTERACT-01** Creature from hand → Vanguard/Reserve accepted end-to-end through tap/select path at `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`.
- [x] **INTERACT-05** Realm → Realm slot remains accepted from V2.4.9.
- [ ] **INTERACT-02** Evolution.
- [ ] **INTERACT-03** Essence.
- [ ] **INTERACT-04** Relic.
- [ ] **INTERACT-06** Tactic.
- [ ] **INTERACT-07** Full selection cancellation.
- [ ] **INTERACT-09** Full Vanguard Ability/Attack/Withdraw.

## G. Attack / Ability rule fence

- [x] **RULE-ACTION-01** Attack remains a Vanguard card-context action.
- [x] **RULE-ACTION-02** Legal Attack resolves damage/effects/choices/listeners/defeats first, then Aftermath and turn advance; special extra-turn effects may change the next active seat without making Attack non-terminal for the turn.
- [x] **RULE-ACTION-03** All 19 current Set One manual active Abilities are `own_turn` and once per controller turn.
- [x] **RULE-ACTION-04** Active Ability effect is card-defined; search/inspect/reorder, attach/move Essence, heal, switch, modifier, Shield and control effects are examples rather than universal choices.
- [x] **RULE-ACTION-05** Triggered/continuous Abilities remain separate event/passive systems.
- [x] **RULE-ACTION-06** GitHub match-action source matches deployed Supabase `tcg-match-actions` v2 byte-for-byte at acceptance.

**Current decision:** V2.4.10 source is ACCEPTED at exact head `f9f12f9d4960a9dbc403a3bb50e23a24ee85f81a`. This synchronization commit is historical continuity only; merge/main/public/live/production remain HOLD.
