# Stream Bandit TCG — Master Plan Checklist V2.4.8

**Canonical plan:** `tcg-master-plan-progress-v2.4.8.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.8.md`  
**Accepted functional parent:** V2.4.7 @ `0e8887730a4af6c47d69f7089644e977bc3036fb`  
**Continuity parent:** `bc721a31ec1f5a48dd7910993177b402ab4d4fdf`  
**Release state:** 🔒 HOLD PR merge / `main` / public / live / production release.

## A. Parent acceptance

- [x] **V248-PARENT-01** V2.4.7 accepted exact head is `0e8887730a4af6c47d69f7089644e977bc3036fb`.
- [x] **V248-PARENT-02** TCG Validation #655 succeeded.
- [x] **V248-PARENT-03** Migration Replay #825 succeeded from zero.
- [x] **V248-PARENT-04** Functional Smoke #851 succeeded.
- [x] **V248-PARENT-05** Review threads were zero; legacy combined statuses had no entries.
- [x] **V248-PARENT-06** `bc721a31...` changed only V2.4.7 checklist continuity.

## B. Direct hand → Reserve transport source

- [x] **INTERACT-01-RESERVE-SRC-01** Known local hand cards can be selected on the release-shaped tabletop.
- [x] **INTERACT-01-RESERVE-SRC-02** Four local Reserve positions become explicit placement targets after hand selection.
- [x] **INTERACT-01-RESERVE-SRC-03** Browser sends existing envelope + `card_uid` + `reserve_index` only.
- [x] **INTERACT-01-RESERVE-SRC-04** Success refreshes authoritative match state and clears consumed hand selection.
- [x] **INTERACT-01-RESERVE-SRC-05** Rejection refreshes authoritative match state and surfaces the server reason.
- [x] **INTERACT-01-RESERVE-SRC-06** Same-card reselect cancels local selection; selection state is never persisted.

## C. Authority fence

- [x] **V248-AUTH-01** Browser does not call or reproduce `starterLegal`.
- [x] **V248-AUTH-02** Browser does not decide Baby / Standalone / Mythic legality.
- [x] **V248-AUTH-03** Browser does not decide empty-Reserve legality.
- [x] **V248-AUTH-04** Server `play_creature` retains Creature placement and event/movement/heal listener continuation.
- [x] **V248-AUTH-05** No new gameplay owner, Edge Function, migration, card definition or card-specific branch.
- [x] **V248-AUTH-06** Existing Attack transport remains unchanged.

## D. Wider interaction family remains open

- [ ] **INTERACT-01** Complete Creature-from-hand interaction family, including any remaining Vanguard/setup path.
- [ ] **INTERACT-02** Evolution → legal stack.
- [ ] **INTERACT-03** Essence → legal Creature.
- [ ] **INTERACT-04** Relic → legal host.
- [ ] **INTERACT-05** Realm → Realm slot.
- [ ] **INTERACT-06** Tactic → structured board target/choice flow.
- [ ] **INTERACT-07** Complete selection cancellation across all rule choice families.
- [ ] **INTERACT-09** Full Vanguard Ability/Attack/Withdraw card-context action family.

## D.1 Proven repaired-candidate evidence

Head `d14a1b46fe9b46b80106394a6b5f751ced900292` proved the repaired V2.4.8 implementation before this continuity-only synchronization commit:

- TCG Card Pass 2 Validation #658 — SUCCESS, including the dedicated V2.4.8 browser/server ownership contract and deterministic runtime/type-check lanes;
- Code Labs V50 Functional Smoke #854 — SUCCESS, including Node, Deno and zero-to-current PostgreSQL replay;
- standalone Code Labs Migration Replay #828 — CANCELLED before accepted execution because the pre-repair #827 replay still occupied the workflow queue; it is not counted as a pass;
- review threads: 0;
- legacy combined-status entries: none found;
- the repair from `d5c9afb3...` to `d14a1b46...` changed exactly one test file (+1/-1); V2.4.8 implementation bytes did not change.

This checklist edit is continuity-only and exists to create one queue-clear synchronization head. All three final gates below remain unchecked until they pass together at that new exact head.

## E. Exact-head V2.4.8 gates

- [ ] **V248-CI-01** TCG Card Pass 2 Validation succeeds at final exact head.
- [ ] **V248-CI-02** Code Labs Migration Replay succeeds from zero at final exact head.
- [ ] **V248-CI-03** Code Labs V50 Functional Smoke succeeds at final exact head.
- [ ] **V248-REVIEW-01** Review threads remain zero / all material findings resolved.
- [ ] **V248-DIFF-01** Final V2.4.8 diff is limited to direct-hand-placement presentation/transport, regression tests and continuity docs.

**Current decision:** V2.4.8 is a branch candidate until E passes. PR merge, `main`, public/live and production remain HOLD.
