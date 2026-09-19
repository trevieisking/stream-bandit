# Stream Bandit TCG — Master Plan Checklist V2.4.7

**Canonical plan:** `tcg-master-plan-progress-v2.4.7.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.7.md`  
**Inherits:** V2.4.6 and V2.4.1 in full  
**Accepted parent:** PR #576 @ `bd2f5b30109f0927a23f4c8e380548d447cf7678`  
**Release state:** 🔒 HOLD PR merge / `main` / public / live / production release.

## A. Parent acceptance

- [x] **V247-PARENT-01** V2.4.6 exact head is `bd2f5b30109f0927a23f4c8e380548d447cf7678`.
- [x] **V247-PARENT-02** TCG Validation #645 succeeded.
- [x] **V247-PARENT-03** Migration Replay #815 attempt 2 succeeded from zero.
- [x] **V247-PARENT-04** Functional Smoke #841 succeeded.
- [x] **V247-PARENT-05** Review threads were zero and legacy combined statuses had no entries.

## B. Reusable renderer source

- [x] **CARD-IMPL-01-SOURCE** One reusable battle card renderer consumes current authoritative card/structured metadata.
- [x] **CARD-IMPL-02-SOURCE** Creature presentation reads name, element, stage, HP/damage, Shield, Withdraw Cost, Ability metadata, conditions and Attack presentation generically.
- [x] **CARD-IMPL-03-SOURCE** The same renderer accepts non-Creature known cards without a separate page-specific renderer.
- [ ] **CARD-IMPL-04** Desktop/touch inspector/zoom passes release review.
- [x] **CARD-IMPL-05-SOURCE** No card-id/name branch is required for future cards/elements.
- [x] **CARD-AUTH-01** Renderer contains no network, database, RPC, Edge, randomization or gameplay-rule authority.
- [x] **CARD-AUTH-02** Existing Attack request remains server-owned by `tcg-match-actions` with match/revision/nonce/slot fencing.

## C. Artwork pipeline truth

- [x] **ART-EVIDENCE-01** Accepted structured gameplay definitions explicitly keep display/card-art data outside gameplay authority.
- [x] **ART-SOURCE-01** Renderer distinguishes `approved`, `placeholder` and `missing` presentation states.
- [x] **ART-SOURCE-02** Current controller supplies no invented approved art mapping; missing art is labelled as pending.
- [ ] **ART-IMPL-01** Complete current art/image asset inventory.
- [ ] **ART-IMPL-02** Canonical art asset reference and printing mapping.
- [ ] **ART-IMPL-03** Approved art wired into renderer.
- [ ] **ART-IMPL-04** Release-visible missing/placeholder art cleared.
- [ ] **ART-IMPL-05** Printing/rarity/set treatment fully connected.
- [ ] **ART-IMPL-06** Eight launch element treatments and future elements pass visual review.

## D. Tabletop source skeleton

- [x] **BOARD-IMPL-01-SOURCE** Battle scaffold is replaced by a landscape tabletop source composition.
- [x] **BOARD-IMPL-02-SOURCE** Both Vanguard positions and both four-Reserve rows are present.
- [x] **BOARD-IMPL-03-SOURCE** Both six-slot Reward areas are present and count-driven.
- [x] **BOARD-IMPL-04-SOURCE** Both Deck and Discard areas/counts are present.
- [x] **BOARD-IMPL-05-SOURCE** Shared Realm slot is persistent at table centre.
- [x] **BOARD-IMPL-06-SOURCE** Local hand rail renders authoritative known hand cards.
- [x] **BOARD-IMPL-07-SOURCE** Attached Essence/Relic state is presented spatially on the owning Creature card.
- [ ] **BOARD-IMPL-08** Desktop/tablet full-board visual acceptance.
- [ ] **BOARD-IMPL-09** Mobile/touch equivalent tabletop mental-model acceptance.

## E. Hidden-information safety

- [x] **TABLE-PRIV-01** Opponent hand uses `hand_count` only.
- [x] **TABLE-PRIV-02** Opponent Deck uses `deck_count` only.
- [x] **TABLE-PRIV-03** Opponent Rewards use `rewards_count` only and always render hidden backs/claimed slots.
- [x] **TABLE-PRIV-04** Opponent Discard uses `discard_count` only in this slice.
- [x] **TABLE-PRIV-05** Browser does not infer or request hidden identities for presentation.

## F. Board-visible state advanced by source

- [x] **STATE-VIS-01-SOURCE** Current HP and damage are rendered from authoritative Creature state + definition HP.
- [x] **STATE-VIS-02-SOURCE** Shield is rendered.
- [x] **STATE-VIS-03-SOURCE** Conditions are rendered generically.
- [ ] **STATE-VIS-04** Ability spent/locked state complete.
- [ ] **STATE-VIS-05** Legal-target highlighting complete.
- [ ] **STATE-VIS-06** Evolution legal-target green glow complete.
- [x] **STATE-VIS-07-SOURCE** Reward remaining/claimed state is visible by count.
- [x] **STATE-VIS-08-SOURCE** Deck/Discard counts are visible.
- [x] **STATE-VIS-09-SOURCE** Active turn/phase remains visible.
- [ ] **STATE-VIS-10** Complete pending-choice/search/listener UI.
- [ ] **STATE-VIS-11** KO/mandatory promotion visual expression.
- [ ] **STATE-VIS-12** Victory/defeat/result presentation.

## G. Direct interactions deliberately still gated

- [ ] **INTERACT-01** Creature from hand → legal Vanguard/Reserve.
- [ ] **INTERACT-02** Evolution → legal stack.
- [ ] **INTERACT-03** Essence → legal Creature.
- [ ] **INTERACT-04** Relic → legal host.
- [ ] **INTERACT-05** Realm → Realm slot.
- [ ] **INTERACT-06** Tactic → structured board target/choice flow.
- [ ] **INTERACT-07** Selection cancellation where rules permit.
- [x] **INTERACT-08-SOURCE** Existing Attack remains server-authoritative; renderer adds no legality engine.
- [ ] **INTERACT-09** Full Vanguard Ability/Attack/Withdraw card-context action family.

V2.4.7 intentionally does not manufacture Ability/Withdraw/play/evolve/attach/tactic buttons before their exact browser-to-owner contracts are wired.

## H. Exact-head gates for V2.4.7

- [x] **V247-CI-01** TCG Card Pass 2 Validation #655 succeeded at accepted exact head `0e8887730a4af6c47d69f7089644e977bc3036fb`.
- [x] **V247-CI-02** Code Labs Migration Replay #825 succeeded from zero at accepted exact head `0e8887730a4af6c47d69f7089644e977bc3036fb`.
- [x] **V247-CI-03** Code Labs V50 Functional Smoke #851 succeeded at accepted exact head `0e8887730a4af6c47d69f7089644e977bc3036fb`.
- [x] **V247-REVIEW-01** Review threads were zero at accepted exact head `0e8887730a4af6c47d69f7089644e977bc3036fb`.
- [x] **V247-DIFF-01** Final diff against `bd2f5b30109f0927a23f4c8e380548d447cf7678` contained exactly the intended V2.4.7 renderer/tabletop/tests/continuity scope.

### H.1 Proven pre-final candidate evidence

Head `5955165017094b8df972a87c63440304410a2c9f` proved the V2.4.7 source behavior before this continuity-only synchronization commit:

- TCG Card Pass 2 Validation #654 — SUCCESS, including Set One/card grammar and deterministic runtime-core lanes;
- Code Labs V50 Functional Smoke #850 — SUCCESS, including Node source contracts, Deno engine/connector contracts and its zero-to-current PostgreSQL replay lane;
- standalone Code Labs Migration Replay #824 — CANCELLED before any job existed because earlier sequential-commit workflow runs still occupied the queue, therefore not accepted as evidence;
- bounded delta from accepted V2.4.6 parent: nine intended V2.4.7 files, nine commits ahead / zero behind;
- no gameplay engine, Edge Function, migration, card definition, starter recipe or production Supabase byte changed.

This checklist edit changes continuity text only. It deliberately creates one clean synchronization event after the obsolete workflow queue drained. **All three final gates remain unchecked until they pass together at the new exact head.**

## I. Inherited release gates remain open

- [ ] Fresh real two-user **V2-ATTACK-01** on the release-shaped board.
- [ ] **MATCH-01…MATCH-25** production-shaped matrix.
- [ ] approved visual/art acceptance.
- [ ] release shell journey.
- [ ] public/live deployment evidence and rollback point.

**Current decision:** V2.4.7 source implementation was accepted at exact head `0e8887730a4af6c47d69f7089644e977bc3036fb`. This checklist synchronization is continuity-only. PR merge, `main`, public/live and production remain HOLD.
