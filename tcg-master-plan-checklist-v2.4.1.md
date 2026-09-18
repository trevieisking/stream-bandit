# Stream Bandit TCG — Master Plan Checklist V2.4.1

**Canonical plan:** `tcg-master-plan-progress-v2.4.1.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.1.md`  
**Inherits:** `tcg-master-plan-checklist-v2.4.md` in full except where V2.4.1 changes immediate work priority and visual acceptance wording  
**Exact source base:** `main` @ `27d8f2ec6ec50d5766b79f9c90b6597517302023`  
**Checklist date:** 2026-09-17  
**Release state:** 🔒 HOLD public/live/production.

## Status meanings

- `[x]` = planning/evidence accepted at the stated checkpoint.
- `[ ]` = implementation or release evidence still required.
- A visual contract can be accepted while the implementation remains open.
- A source/server capability can exist while end-to-end release behavior remains unproven.
- Master Plan, Ledger and Checklist must agree at the same accepted SHA.

---

## A. V2.4.1 visual rebaseline

- [x] **VIS-PLAN-01** Current `tcg-battle-v2.html` reviewed against inherited V2.2 visual/prototype authority.
- [x] **VIS-PLAN-02** Current V2 battle page classified as development scaffold, not release visual target.
- [x] **VIS-PLAN-03** Confirm V2.2 remains active authority for RESTORE, DO NOT REDESIGN, one-screen battlefield and physical-card interaction.
- [x] **VIS-PLAN-04** Confirm latest Trev visual correction supersedes V2.4 wording that made another Attack attempt the only immediate work priority.
- [x] **VIS-PLAN-05** V2-ATTACK-01 remains mandatory for release; visual-first work does not falsely close it.
- [x] **VIS-PLAN-06** No runtime/Supabase/game-rule change is part of this control checkpoint.

---

## B. V2-VISUAL-01 — battlefield layout contract

- [x] **BOARD-PLAN-01** Landscape/full-board presentation remains primary desktop/tablet composition.
- [x] **BOARD-PLAN-02** Opponent occupies upper half; local player occupies lower half.
- [x] **BOARD-PLAN-03** One Vanguard per side sits nearest the centre line.
- [x] **BOARD-PLAN-04** Four Reserve slots per side sit behind the Vanguard toward that player's edge.
- [x] **BOARD-PLAN-05** Six Reward Cards per player are visibly represented.
- [x] **BOARD-PLAN-06** Deck and Discard zones are visible for both players.
- [x] **BOARD-PLAN-07** One persistent shared Realm slot remains visible at the centre/midline.
- [x] **BOARD-PLAN-08** Player hand remains a private fan/rail along the lower edge.
- [x] **BOARD-PLAN-09** Opponent private hand content remains hidden; only permitted public count/back presentation is shown.
- [x] **BOARD-PLAN-10** Attached Essence/Relic state stays spatially associated with the owning Creature.
- [x] **BOARD-PLAN-11** Active match remains board-only with no normal website header/footer/navigation.
- [x] **BOARD-PLAN-12** Mobile/touch preserves the same tabletop mental model rather than becoming a vertical debug form.

### Implementation

- [ ] **BOARD-IMPL-01** Replace current panel/scaffold geometry with the accepted landscape tabletop composition.
- [ ] **BOARD-IMPL-02** Render both four-Reserve rows and both Vanguard positions using full-card presentation.
- [ ] **BOARD-IMPL-03** Render both six-Reward areas.
- [ ] **BOARD-IMPL-04** Render both Deck and Discard rails/counts.
- [ ] **BOARD-IMPL-05** Render persistent Realm slot.
- [ ] **BOARD-IMPL-06** Render player hand fan/rail with inspect behavior.
- [ ] **BOARD-IMPL-07** Render Essence/Relic attachments in spatial relation to their Creature.
- [ ] **BOARD-IMPL-08** Desktop/tablet layout passes full-board visual review.
- [ ] **BOARD-IMPL-09** Mobile/touch layout passes equivalent mental-model review.

---

## C. V2-CARD-01 — premium reusable full-card renderer

- [x] **CARD-PLAN-01** One reusable renderer is required; no per-card HTML implementation path.
- [x] **CARD-PLAN-02** Creature visual contract keeps HP top-left, Type/Element top-right, name/stage header, large artwork, two structured action slots and Withdraw Cost bottom-right.
- [x] **CARD-PLAN-03** Rarity/printing/set treatment belongs to the card frame/footer presentation.
- [x] **CARD-PLAN-04** Battlefield cards remain recognisably full cards, not anonymous rectangles/debug widgets.
- [x] **CARD-PLAN-05** Hover/tap/hold inspection enlarges the actual rendered card while retaining board context.
- [x] **CARD-PLAN-06** Ability/Attack/Withdraw remain card-owned interactions.

### Implementation

- [ ] **CARD-IMPL-01** Canonical renderer reads current authoritative card/printing data.
- [ ] **CARD-IMPL-02** Current Creature data renders HP, element, stage/classification, artwork, action slots, Withdraw Cost and printing metadata correctly.
- [ ] **CARD-IMPL-03** Non-Creature card families render through the same reusable presentation architecture where applicable.
- [ ] **CARD-IMPL-04** Card inspector/zoom works on desktop and touch.
- [ ] **CARD-IMPL-05** Renderer remains extensible for future cards/elements/series/printings without card-name branches.

---

## D. V2-ART-01 — artwork / card-image pipeline

- [x] **ART-PLAN-01** Placeholder gradient/emoji art is development-only and does not pass release visual acceptance.
- [x] **ART-PLAN-02** Artwork resolves from structured printing/card metadata rather than a hard-coded page list.
- [x] **ART-PLAN-03** Art pipeline must support primary art, alternate art and approved cosmetic printing variants.
- [x] **ART-PLAN-04** Explicit art states are required: `approved`, `placeholder`, `missing`.
- [x] **ART-PLAN-05** Missing/placeholder art for a release-visible card is a visual gate failure.
- [x] **ART-PLAN-06** Stream Bandit uses original artwork, frames, iconography and finishes; Pokémon assets/trade dress are not copied.

### Implementation

- [ ] **ART-IMPL-01** Inventory current artwork/image assets and existing art metadata.
- [ ] **ART-IMPL-02** Define/confirm canonical art asset reference field(s) and printing mapping.
- [ ] **ART-IMPL-03** Wire approved art into the reusable renderer.
- [ ] **ART-IMPL-04** Provide explicit safe development fallback for placeholder/missing art.
- [ ] **ART-IMPL-05** Track release-visible cards with missing/placeholder art until cleared.
- [ ] **ART-IMPL-06** Element/family visual treatments work for Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt while remaining data-driven for future content.

---

## E. V2-VISUAL-02 — board-visible state

- [x] **STATE-VIS-01** Damage/current HP changes are visible.
- [x] **STATE-VIS-02** Shield state is visible.
- [x] **STATE-VIS-03** Conditions are visible.
- [x] **STATE-VIS-04** Ability spent/locked state is visible where applicable.
- [x] **STATE-VIS-05** Legal targets highlight; illegal targets remain inactive.
- [x] **STATE-VIS-06** Evolution legal targets glow green.
- [x] **STATE-VIS-07** Reward count/claim state is visible.
- [x] **STATE-VIS-08** Deck/Discard counts are visible.
- [x] **STATE-VIS-09** Active turn/phase is visible without dominating the table.
- [x] **STATE-VIS-10** Pending choice/search/listener state is visible while preserving battlefield context.
- [x] **STATE-VIS-11** Defeat/KO and mandatory promotion are visually expressed.
- [x] **STATE-VIS-12** Victory/defeat/result state is visually expressed.

---

## F. V2-INTERACT-01 — direct tabletop interaction

- [x] **INTERACT-01** Creature from hand can be dragged or tap-selected to legal Vanguard/Reserve destination.
- [x] **INTERACT-02** Evolution can be dragged/tap-selected to legal Creature stack with green highlighting.
- [x] **INTERACT-03** Essence can be dragged/tap-selected to legal Creature.
- [x] **INTERACT-04** Relic can be dragged/tap-selected to legal host.
- [x] **INTERACT-05** Realm can be dragged/tap-selected to Realm slot.
- [x] **INTERACT-06** Tactic launches structured board target/choice flow from the physical card.
- [x] **INTERACT-07** Misclick/selection can be cancelled before authoritative commit where rules permit.
- [x] **INTERACT-08** Server authority remains final legality authority for every interaction.
- [x] **INTERACT-09** Vanguard Ability/Attack/Withdraw remain card-context actions.

---

## G. V2-UX-ANIM-01 — game feel / animation / audio hooks

- [ ] **ANIM-01** Draw transition.
- [ ] **ANIM-02** Card play transition.
- [ ] **ANIM-03** Evolution stack transition.
- [ ] **ANIM-04** Essence/Relic attachment transition.
- [ ] **ANIM-05** Realm placement/replacement transition.
- [ ] **ANIM-06** Attack wind-up/hit feedback.
- [ ] **ANIM-07** Damage/HP and Shield feedback.
- [ ] **ANIM-08** Condition feedback.
- [ ] **ANIM-09** Defeat/KO transition.
- [ ] **ANIM-10** Reward claim and promotion transition.
- [ ] **ANIM-11** Turn handoff.
- [ ] **ANIM-12** Victory/defeat/result presentation.
- [ ] **V2-AUDIO-01** Background music/SFX/mute/volume lifecycle passes release review.

Animation must remain projection only; authoritative server state survives refresh/reconnect independently of animations.

---

## H. Release shell look/feel

### V2.4.28 approved TCG client visual authority
- [x] **SHELL-VIS-PLAN-03** TCG routes render no generic Stream Bandit website header/search/account/footer chrome; shared Stream Bandit config/auth functions may remain non-visual dependencies.
- [x] **SHELL-VIS-PLAN-04** Approved primary TCG client navigation is Battle · Decks · Collection · Battle Pass · Shop · Settings.
- [x] **SHELL-VIS-PLAN-05** The TCG viewport itself never scrolls; card/deck/collection/shop/pack/reward/social feeds scroll only inside bounded internal panels.
- [x] **SHELL-VIS-PLAN-06** Seven user-approved 1672×941 Play/Battle/Decks/Collection/Battle Pass/Shop/Settings references are immutable art-direction authority under `tcg-visual-authority-v2.4.28.md`.
- [x] **BATTLE-PASS-PLAN-01** Battle Pass is a required player-facing route.
- [ ] **BATTLE-PASS-IMPL-01** Define and prove the canonical progression/economy owner before XP, currencies, premium state, challenges or reward claims become authoritative.
- [ ] **BATTLE-PASS-IMPL-02** Bind Battle Pass feeds and claims to that owner with no browser-owned reward economy.


Inherited V2.4 route model remains:

`Landing / Sign In → Game Home → Play / Ranked → Matchmaking → Opponent Found → Board-only Match → Result`

Signed-in destinations remain:

`Account · TCG Players/Friends · Collection · Deck Builder · Packs · Learn · Progress · Settings`

- [x] **SHELL-VIS-PLAN-01** Active battle stays board-only.
- [x] **SHELL-VIS-PLAN-02** Outside-match screens use one coherent original Stream Bandit TCG visual system.
- [ ] **SHELL-VIS-01** Shared typography/control/panel/modal/navigation language implemented.
- [ ] **SHELL-VIS-02** Landing / Game Home / Ranked / Matchmaking / Opponent Found / Result screens visually aligned.
- [ ] **SHELL-VIS-03** Collection / Deck Builder / Packs / Learn / Progress / Settings visually aligned as their implementation gates progress.
- [ ] **SHELL-VIS-04** Loading/error/empty/reconnect states use the same design system.
- [x] **PLAY-AUTH-01** Play must not treat the Auth Gate's temporary first-load null decision as an approval failure; deck loading waits for the existing authoritative gate decision without duplicating approval rules.

### V2.4.30 approved-reference visual convergence
- [x] **SHELL-VIS-PLAN-07** TCG pages own a reusable cinematic realm backdrop, cyan/gold ornamental frame language and generic Stream Bandit card-back/art-pending asset; no card identity is falsely given finished artwork.
- [x] **SHELL-VIS-PLAN-08** TCG routes no longer load the global Stream Bandit theme projector; shared account/config/auth capability may remain without shared website visual authority.
- [x] **SHELL-VIS-PLAN-09** Play deck rows display factual RLS-projected deck-card quantity instead of a hard-coded 60-card visual claim; legality remains server-owned.
- [ ] **SHELL-VIS-HUMAN-01** Human visual acceptance confirms Play/Battle/Decks/Collection/Battle Pass/Shop/Settings converge acceptably on the seven locked V2.4.28 references at the target desktop viewport.
- [ ] **CARD-ART-IMPL-01** Bind real approved per-card/printing artwork when an authoritative art source exists; generic card-back remains the explicit fallback until then.

### V2.4.31 TCG shell isolation repair
- [x] **SHELL-ISOLATION-01** Human screenshot proved the legacy `stream-bandit-shell-v6-24.js` still booted generic Stream Bandit header/route infrastructure from inside TCG pages.
- [x] **SHELL-ISOLATION-02** Replace the legacy website shell dependency with a TCG config-only bridge exposing public Supabase client configuration and no website visuals/routes/helpers.
- [x] **SHELL-ISOLATION-03** Settings navigation remains `tcg-settings.html` and the TCG bridge exposes no platform settings route alias.
- [x] **SHELL-ISOLATION-04** Fixed TCG top bar removes the 1320px cap and includes low-browser-zoom viewport scaling while document/body scrolling remains forbidden.
- [ ] **SHELL-ISOLATION-CI-01** Exact-head validation, migration replay and functional smoke pass after the isolation repair.
- [ ] **SHELL-ISOLATION-HUMAN-01** Human test confirms generic Stream Bandit header is absent, Settings stays inside TCG and 100%/25% screenshots remain screen-filling.

---

## I. Corrected work order

- [x] **ORDER-01** V2.4.1 supersedes the V2.4 wording that made another Attack attempt the only immediate development operation.
- [ ] **ORDER-02** Complete renderer/art inventory and choose smallest reusable V2-CARD-01 foundation.
- [ ] **ORDER-03** Build correct tabletop zone skeleton.
- [ ] **ORDER-04** Wire full-card rendering/art into board zones.
- [x] **ORDER-05** Wire direct card interactions and board-visible state.
- [ ] **ORDER-06** Add animation/audio hooks and shell look/feel.
- [ ] **ORDER-07** Resume fresh two-user V2-ATTACK-01 on the restored release-shaped board.
- [ ] **ORDER-08** Execute inherited MATCH-01 through MATCH-25 release proof.

---

## J. Kay/Trev test classification

If the current scaffold is tested before visual restoration:

- [x] **TEST-CLASS-01** Treat it as diagnostic gameplay evidence only.
- [x] **TEST-CLASS-02** Do not treat the scaffold layout as approved visual acceptance.
- [x] **TEST-CLASS-03** Do not treat successful Attack transport on the scaffold as complete release UX acceptance.
- [x] **TEST-CLASS-04** Preserve exact request/response/revision evidence if the gameplay path succeeds or fails.

---

## K. Inherited release gates remain active

The V2.4 checklist remains inherited in full for gameplay, account, directory, friends, administration, shell security and deployment requirements.

In particular:

- [ ] **V2-ATTACK-01** Real two-user Attack resolves end to end.
- [ ] Full **MATCH-01…MATCH-25** production-shaped gameplay matrix passes.
- [ ] Release shell journey passes.
- [ ] Security/privacy boundaries pass for shipped account/social surfaces.
- [ ] Exact-head CI/checks pass.
- [ ] Required deployed Supabase state matches accepted release source.
- [ ] Rollback/recovery point recorded.

**Current decision:** 🔒 **HOLD public/live/production.**
