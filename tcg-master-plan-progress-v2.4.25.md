# Stream Bandit TCG — Master Plan Progress V2.4.25

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `d1fe2fb8c5a2dd942c4a87e88a8d07edc1aa35c0`  
**Master-plan target:** Stage 3 board-visible state reconciliation + Ability availability + terminal result  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Proven existing state

Accepted source already renders authoritative:
- current HP / damage;
- Shield;
- active Conditions;
- Deck and Discard counts;
- turn / phase;
- generic pending Attack / Ability / Event / Movement / Heal / Tactic choices;
- Evolution legal-target glow;
- Reward claim and mandatory promotion resolution.

V2.4.25 does not rebuild those systems. It adds a regression contract that binds them to the canonical V2-VISUAL-02 checklist.

## 2. Ability availability presentation

The existing Match v6 `field_actions` projection is the only legality authority used by the browser.

For a local Creature with printed structured `mode: active` Ability, while the field-action projection is current:
- exact projected source => card-context `Ability ready`;
- active Ability absent from the exact projection => card-context `Ability locked`.

The browser does not inspect once-per-turn ledgers, requirements, costs or condition rules and does not guess a lock reason.

## 3. Terminal result presentation

Match v6 already persists and publishes authoritative `result`.

The board presents:
- `Victory` when `result.winner_seat` equals the local seat;
- `Defeat` when it equals the opposing seat;
- server-provided result reasons as presentation text only;
- an explicit overtime-pending state when the server reports `phase === 'overtime_pending'`.

The browser does not calculate win conditions.

## 4. Scope

Browser controller + reusable renderer presentation + battle CSS/cache + regression tests + V2.4.25 controls only.

No Match/Tactic/Setup runtime, database schema, migration, card-data or gameplay-rule source change.

## 5. Acceptance

Fresh exact-head:
1. TCG Card Pass 2 Validation;
2. Migration Replay from zero;
3. Functional Smoke;
4. zero unresolved material review threads;
5. bounded diff review.

After acceptance the canonical checklist may close:
- STATE-VIS-01 current HP/damage;
- STATE-VIS-02 Shield;
- STATE-VIS-03 Conditions;
- STATE-VIS-04 Ability ready/locked presentation;
- STATE-VIS-06 Evolution glow;
- STATE-VIS-08 Deck/Discard counts;
- STATE-VIS-09 turn/phase;
- STATE-VIS-10 pending-choice/search/listener state;
- STATE-VIS-12 Victory/defeat/result state.

STATE-VIS-05 remains open until ordinary Creature/Realm target highlighting is fully server-projected. ORDER-05 therefore remains open at this slice.


## 6. Accepted checkpoint

**Accepted head:** `1e9f5355ef2db4cbcc3b74836100df451fbede54`

- TCG Card Pass 2 Validation #723 ✅
- Migration Replay #893 ✅
- Functional Smoke #919 ✅
- review threads 0 ✅
- legacy combined statuses 0 ✅
- 7-file bounded browser/cache/test/control delta; no server/runtime/schema/migration/card-data change ✅

Canonical state after acceptance: V2-VISUAL-02 is 11/12; only STATE-VIS-05 ordinary Creature/Realm legal-target projection remains open.
