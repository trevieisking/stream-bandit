# Stream Bandit TCG — Master Plan Checklist V2.4.9

**Canonical plan:** `tcg-master-plan-progress-v2.4.9.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.9.md`  
**Accepted functional parent:** V2.4.8 @ `d218c946daf7fa1971f32589ca0a7dd5c7a655a1`  
**Continuity parent:** `1896dae20805cb700051eadbab301b844650f7a5`  
**Release state:** 🔒 HOLD PR merge / `main` / public / live / production release.

## A. Parent acceptance and continuity

- [x] **V249-PARENT-01** V2.4.8 accepted exact head is `d218c946daf7fa1971f32589ca0a7dd5c7a655a1`.
- [x] **V249-PARENT-02** TCG #659, Migration #829 and Functional #855 succeeded at that functional head.
- [x] **V249-PARENT-03** PR comment #5727014949 records immutable V2.4.8 acceptance.
- [x] **V249-PARENT-04** Continuity head `1896dae2...` changed only V2.4.8 Plan/Checklist/Ledger acceptance records.
- [x] **V249-PARENT-05** Continuity TCG #660, Migration #830 and Functional #856 all succeeded.
- [x] **V249-PARENT-06** Continuity review threads were zero and legacy combined statuses had no entries.

## B. Direct hand → Realm transport source

- [x] **INTERACT-05-SRC-01** Selected hand state exposes the shared Realm slot as a keyboard/click destination.
- [x] **INTERACT-05-SRC-02** Browser sends existing envelope + `card_uid` only.
- [x] **INTERACT-05-SRC-03** Success clears consumed hand selection and refreshes authoritative match state.
- [x] **INTERACT-05-SRC-04** Rejection refreshes authoritative match state and surfaces the server reason.
- [x] **INTERACT-05-SRC-05** Existing Reserve placement remains available and unchanged.
- [x] **INTERACT-05-SRC-06** CSS/controller cache keys and tabletop marker advance to current bytes.

## C. Authority fence

- [x] **V249-AUTH-01** Browser does not decide Tactic/Realm family legality.
- [x] **V249-AUTH-02** Browser does not decide once-per-turn Realm timing.
- [x] **V249-AUTH-03** Browser does not decide same-name/replacement legality.
- [x] **V249-AUTH-04** Server `play_realm` retains placement/replacement and event/movement/heal/defeat continuation.
- [x] **V249-AUTH-05** No new gameplay owner, Edge Function, migration, card definition or card-specific branch.
- [x] **V249-AUTH-06** Existing Attack and V2.4.8 Reserve transports remain unchanged.

## D. Wider interaction family remains open

- [ ] **INTERACT-01** Complete Creature-from-hand interaction family, including any remaining Vanguard/setup path.
- [ ] **INTERACT-02** Evolution → legal stack.
- [ ] **INTERACT-03** Essence → legal Creature.
- [ ] **INTERACT-04** Relic → legal host.
- [ ] **INTERACT-05** Realm → Realm slot accepted end-to-end.
- [ ] **INTERACT-06** Tactic → structured board target/choice flow.
- [ ] **INTERACT-07** Complete selection cancellation across all rule choice families.
- [ ] **INTERACT-09** Full Vanguard Ability/Attack/Withdraw card-context action family.

## E. Exact-head V2.4.9 gates

- [ ] **V249-CI-01** TCG Card Pass 2 Validation succeeds at final exact head.
- [ ] **V249-CI-02** Code Labs Migration Replay succeeds from zero at final exact head.
- [ ] **V249-CI-03** Code Labs V50 Functional Smoke succeeds at final exact head.
- [ ] **V249-REVIEW-01** Review threads remain zero / all material findings resolved.
- [ ] **V249-DIFF-01** Final V2.4.9 diff from `1896dae2...` is limited to Realm presentation/transport, cache integrity, regression test and synchronized V2.4.9 controls.

**Current decision:** V2.4.9 is a branch candidate until E passes. PR merge, `main`, public/live and production remain HOLD.
