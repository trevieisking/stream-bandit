# Stream Bandit TCG — Canonical Master Plan V2.3.2

**Plan date:** 2026-09-17  
**Status:** canonical release-recovery + prototype-restoration control layer  
**Supersedes on conflict:** `tcg-master-plan-progress-v2.3.1.md`  
**Inherits:** all V2.3.1 rules not explicitly changed here  
**Execution checklist:** `tcg-master-plan-checklist-v2.3.2.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.2.md`  
**Machine release index:** `tcg-release-control-v2.1.json`  
**Battle interaction authority:** `tcg-battle-client-interaction-v1.json`  
**Mechanic harvest index:** `tcg-mechanic-harvest-index-v1.md`  
**Generic capability catalog:** `tcg-generic-mechanic-capabilities-v1.json`  
**Historical private-alpha merge baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23`  
**Previous canonical main checkpoint:** `59ab7857522373a53de7d551c66f12c2e514e934`

---

## 0. Non-negotiable continuity rule

The master plan and checklist are part of the implementation, not optional documentation.

Every material work slice is incomplete until the canonical checklist is updated with:

1. exact repository;
2. exact PR/branch;
3. exact reviewed head SHA;
4. checklist IDs touched;
5. files/systems changed;
6. evidence/tests obtained;
7. runtime/live impact or explicit statement of no runtime/live change;
8. accepted result: COMPLETE / HOLD / BLOCK / ROLLBACK;
9. exact next operation.

Before each user-facing work-result message, the checklist must reflect the latest accepted checkpoint. If a message delivery times out or a new chat begins, resume from the latest GitHub checklist/ledger checkpoint rather than reconstructing progress from memory.

No item is COMPLETE merely because code exists, a PR is mergeable, a function is deployed, or a JSON file says so. Completion requires the checklist's stated acceptance evidence.

---

## 1. Product north star — RESTORE, DO NOT REDESIGN

Stream Bandit TCG must play like the original playable prototype, upgraded for authenticated online multiplayer and backed by the canonical server-authoritative engines.

The target player feeling is:

> Pick up a card, see where it can go, play it, see what happened, and keep playing.

The online/backend architecture improves the prototype. It must not replace the prototype with forms, browser prompts, detached command strips, raw action names, array indexes, engine-owner terminology, or a developer console.

The release Battle Client must preserve the original prototype's one-screen, direct-card interaction model.

### Player-facing shape

- opponent at the top;
- player at the bottom;
- 1 Vanguard + 4 Reserve slots each;
- 6 visible face-down Reward positions each;
- Deck and Discard visible;
- hand along the bottom edge;
- Realm presence visible;
- attached Essence and Relic state visible;
- board remains visible during choices whenever practical;
- desktop: hover / click-select / drag-drop;
- touch/accessibility: tap-select / tap-destination / keyboard and text legality equivalents.

### Explicitly forbidden as the normal release battlefield

- debug-form layout;
- browser `prompt()` targeting;
- raw backend action controls as the main interaction;
- global Attack buttons as the primary attack interface;
- duplicate browser rules engine;
- hidden opponent-card leakage;
- replacing full card identity with anonymous rectangles when a real rendered card can be shown.

---

## 2. Release failure lessons now promoted into the plan

The failed release exposed three separate classes of failure. All three must be gated independently.

### 2.1 Release/process proof was mistaken for product proof

A successful merge/deploy/test baseline proves infrastructure and selected flows, not that the player experience is release-ready.

The PR #549 merge is treated as an **authenticated private-alpha test baseline**, not final public Release 1.

A future release cannot pass from CI/deployment evidence alone. It also requires a real player-visible Battle Client acceptance and two-user end-to-end proof.

### 2.2 The player experience regressed away from the prototype

The release surface did not adequately preserve the original drag/drop card-table experience. The recovery plan therefore treats prototype restoration as a first-class gate, not polish.

### 2.3 Post-merge runtime defects remained

The 11 post-merge findings from PR #549 are promoted into a dedicated stabilization gate and may not be silently skipped by later content/renderer work.

---

## 3. V2-G0R — Release Recovery & Runtime Stabilisation

**Purpose:** make the current online private-alpha baseline trustworthy before relying on it as the foundation for the restored Battle Client.

The existing working 193-card / 8-starter production baseline must be preserved while these defects are repaired owner-by-owner.

### Required repair register

- **G0R-01 — Reproducible registry/starter migration:** a clean repository migration/recovery path must populate or otherwise deterministically provide the runtime card-definition and starter-deck authority used by the live APIs. Do not overwrite healthy production data merely to prove this.
- **G0R-02 — Simultaneous-win/overtime lifecycle:** no reachable match state may enter an orphan phase with no legal transition.
- **G0R-03 — Stale revision propagation:** rejected authoritative commits must propagate as failed/retryable actions rather than being reported as successful completed actions.
- **G0R-04 — Element matchup damage:** the canonical global matchup multiplier must be applied exactly where the rules snapshot says ordinary attack damage uses it, once and only once.
- **G0R-05 — Concession/reward abuse:** pre-play or otherwise ineligible concessions must not award farmable Arcade/match rewards.
- **G0R-06 — Hidden-information isolation:** one player's private deck/card identity data must not leak into the opponent-visible match view before reveal rules allow it.
- **G0R-07 — Matchmaking room lifetime:** a room already locked/in-match must remain discoverable to the matched players even if its original queue expiry passes.
- **G0R-08 — Setup-legal deck validation:** a deck accepted for play must contain a legal initial placement recipe so the opening/mulligan/setup flow cannot dead-end immediately.
- **G0R-09 — Private-room Ready concurrency:** simultaneous Ready actions must deterministically initialize once without requiring a second manual Ready press.
- **G0R-10 — Tactic subtype boundary:** only card subtypes valid for the Tactic interpreter may enter that path; Realm/Relic/other card families must route through their canonical owners.
- **G0R-11 — Validation workflow coverage:** TCG validation triggers must cover the shared TCG modules and relevant migrations whose changes can affect runtime behavior.

### G0R acceptance

G0R passes only when all eleven checklist entries are repaired or disproved by current exact-source evidence, with deterministic tests/replay/smoke evidence bound to the exact reviewed head.

---

## 4. Card itself is the controller

The visible rendered card is the primary player control surface. Server owners remain authoritative.

### Creature card interaction

Selecting/hovering/tapping a Creature enlarges or focuses the real card and exposes only its legal contextual actions.

Every ordinary Creature uses exactly one action-slot shape:

1. **Ability + Attack 1**, or
2. **Attack 1 + Attack 2**.

Never show Ability + Attack 1 + Attack 2 together for an ordinary Creature.

- active Ability: invoked from the selected Creature card and normally once during the player's turn unless structured rules say otherwise;
- passive/triggered Ability: visible as card information but not presented as a fake manual button;
- Attack: invoked from the selected Vanguard card;
- Withdraw: invoked contextually from the selected Vanguard card.

Raw `attack`, `use_ability`, `withdraw`, indexes and owner names are implementation details, not the ordinary player interface.

---

## 5. Direct physical-card play contract

### Creature

Hand card -> pick/drag -> legal Vanguard/Reserve destinations highlight -> choose/drop -> server validates -> animate card onto the board.

### Evolution

Evolution card -> pick/drag -> every legal lower-stage target highlights **green** -> choose/drop -> server validates -> animate visible stack/evolution.

### Essence

Essence -> pick/drag -> legal friendly Creatures highlight -> choose/drop -> server validates -> visibly attach/stack with the Creature.

### Relic

Relic -> pick/drag -> legal Creature targets highlight -> server validates -> remains visibly attached until canonical rules remove it.

### Realm

Realm -> pick/drag -> Realm slot -> server validates -> persists across turns until legal replacement or explicit effect removal/discard.

### Tactic

Tactic is played from its actual hand card. Legal targets/choices appear on the board or in an overlay while the battlefield remains visible. No browser prompt flow. On resolution the card moves to its canonical destination.

### Pre-commit recovery

Where the authoritative action has not yet committed, the player may cancel/change a selection. After a legal server commit resolves, the client may not locally undo it.

---

## 6. Attack choreography

Select/enlarge the Vanguard card and choose its printed Attack 1/Attack 2.

The card/UI shows:

- Attack name;
- Attack Cost and Essence types/counts;
- Damage;
- relevant rules/effect text;
- legal/illegal state and useful reason when locked.

Canonical resolution remains server-authoritative and player-visible:

**payment -> attack -> damage -> Shield/protection -> Conditions/effects -> listeners -> defeat -> Rewards -> forced promotion -> Aftermath -> turn handoff**

Attacking ends the attacker's turn automatically after the complete canonical resolution. No separate developer-style End Turn step is required after a completed attack.

---

## 7. Withdraw and switch choreography

Select Vanguard -> Withdraw -> show Withdraw Cost -> highlight legal Reserve replacements -> select exact payment/replacement -> authoritative preflight/commit -> animate Vanguard to Reserve and Reserve to Vanguard -> emit/preserve canonical switch context.

Effect-driven switches reuse the same board movement language and canonical Switch/Position ownership rather than inventing another interaction system.

---

## 8. Damage, counters, defeat, Rewards and promotion must be visual

Players must see meaningful state changes rather than only numeric JSON updates:

- damage value and HP delta;
- Shield/protection delta;
- Condition badge/timer/state;
- attached Essence changes;
- defeat animation;
- Reward interaction;
- forced promotion;
- relevant player-visible trigger/listener notice.

Damage-counter interactions retain the V2.3.1 rules:

- base unit 10 damage;
- source/resolving card focuses/lifts;
- legal targets highlight;
- counter tray appears;
- drag counters or use tap/select equivalent;
- exact fixed/up-to amount comes from structured rules;
- server validates allocation;
- counters visually land/move;
- required immediate single-target or grouped defeat boundary runs before later effects act on a defeated destination.

Reward cards remain visible face-down board positions. Reward selection should interact with the Reward area, not raw array indexes.

On Vanguard defeat, legal Reserve promotion targets highlight and the chosen Reserve visibly moves to Vanguard before ordinary play resumes.

---

## 9. Search/private-choice interaction

Deck search, discard recovery, Reward selection and similar private choices preserve battlefield context whenever practical.

Use a visual card grid/carousel/overlay showing:

- eligible cards;
- requirement;
- selected count;
- confirm;
- cancel/change before commit;
- hidden-information boundaries.

Return directly to the same board after resolution.

---

## 10. Premium card renderer contract

The game must show recognisable full Stream Bandit cards on the battlefield and in hand/collection/deck views.

### Ordinary Creature layout correction

For current ordinary Creatures:

- **HP — top-left**;
- **Type / Element — top-right**;
- name + stage/classification in the upper header;
- large dedicated artwork below the header;
- exactly two action slots below art;
- Attack Cost and Damage are explicitly labelled;
- **Withdraw Cost — bottom-right**;
- rarity / printing finish / set marker in frame/footer.

Do **not** invent a generic Creature play/evolution Cost when the schema does not define one. HP top-left and "no invented Cost" are simultaneously required and do not conflict.

### Full-card visibility

Cards may scale to fit the board but remain visibly card-shaped and identifiable. Hover/tap/hold exposes a larger readable view.

### Artwork and printing

Every printable gameplay card is targeted to have proper artwork.

Gameplay rarity tiers:

- Basic
- Rare
- Extra Rare
- Mythic

Cosmetic printings/finishes may include:

- Standard
- Shine
- Holo
- Full-Art Shine
- Alt-Art
- Signature Mythic

Printing/finish never changes gameplay power.

---

## 11. Engines underneath — simple game on top

The player sees one coherent game. The reusable server-authoritative systems remain the implementation authority.

Existing owner/system families include Creature, Evolution, Attack, Ability, Essence, Tactic, Relic, Realm, Cost, Payment, Damage, Heal, Shield/protection, Conditions, Switch/Position, Card Zones, Draw, Shuffle, Search, Rewards, Hidden Information, Randomisation, Defeat, Match Flow, Printing/Art Metadata, Deck legality, Packs and economy/progression systems.

The established **40-owner baseline remains authoritative**. Do not create owner #41 for a UI convenience, a mechanic label, or one card. A new owner requires proof of a genuinely new reusable state-transition responsibility.

No duplicate browser rules engine. The browser projects authoritative legality and sends player intent.

---

## 12. Future cards/series — generic extensibility

Future content should be primarily structured data composed from reusable capability IDs + parameters.

Avoid card-name and series-name runtime branches whenever the generic capability catalog can express the rule.

The mechanic harvest remains a living research/index source, but:

> indexed does not mean implemented.

V2-G1E must map accepted capabilities to existing owners/opcodes or one justified generic extension, with deterministic tests and backward compatibility.

The system must remain extensible for future:

- cards;
- decks;
- elements;
- attacks;
- Abilities;
- special Creature forms/classes;
- card families;
- sets/series;
- packs;
- rarities/printings/alternate art;
- events/formats;
- collectible/accessory/economy content.

Existing old cards remain playable under the Evergreen/no-age-rotation direction unless a future explicit rules decision says otherwise.

---

## 13. Content authority target

Historical currently deployed private-alpha content remains the 8-element / 193-identity / 8-starter baseline until later content promotion is explicitly proven.

V2 target remains:

- 10 elements;
- 241 structured identities total;
- 10 exact 60-card starter decks;
- Fairy / Glimmerwish and Underworld / Grave Pact translated into canonical schema rather than special one-off runtime paths.

Content expansion must not hide or bypass V2-G0R runtime stabilization.

---

## 14. Full battle choreography gate

A release Battle Client must prove one coherent player journey through the board itself.

### Opening/setup

- authenticated match entry;
- toss/opening choice;
- opening hand;
- mulligan;
- place Vanguard;
- place optional Reserve Creatures;
- confirm/Ready;
- six Rewards installed;
- transition into the normal one-screen board without falling into a debug form.

### Turn/build

- draw;
- play Creature;
- Evolution with green legal targets;
- attach Essence;
- attach Relic;
- play/persist Realm;
- play Tactic;
- use active Ability;
- Withdraw/switch;
- visible legality feedback.

### Clash

- select Vanguard card;
- choose printed Attack;
- validate cost/target;
- animate payment/attack;
- show damage/HP/Shield/Condition/effect feedback;
- run listener/defeat consequences;
- Reward/promotion flow;
- Aftermath;
- automatic turn handoff.

### End state

- victory/defeat presentation;
- match rewards exactly once;
- completed match immutable;
- rematch/exit controls.

---

## 15. Complete-client player systems

The finished product is more than the battle screen. Player-facing destinations remain part of the master plan:

- TCG Home;
- Learn / Tutorial;
- Collection / Card Viewer;
- Deck Builder with ownership and legality clarity;
- Packs/opening/history;
- Practice / Test Deck;
- Private room;
- Casual matchmaking;
- Season / Battle Pass / progression;
- future Ranked/events only after their gates are safe.

These systems must reuse the same canonical card identity/printing/ownership/deck rules rather than build parallel versions.

---

## 16. Locked execution route

The project now follows this order unless new exact evidence proves a safer dependency order:

1. **V2-G0R — Release Recovery & Runtime Stabilisation** (11 defects).
2. **Synchronise plan + checklist + ledger + release-control checkpoint.**
3. **V2-G1 — Content authority:** Fairy schema -> Underworld schema -> deterministic 241 identities / 10 starters.
4. **V2-G1E — Generic extensibility proof:** capability-to-owner/opcode mapping and only proven reusable gaps.
5. **V2-G2 — Premium full-card renderer.**
6. **V2-G3 — Restore original playable prototype online.**
7. **V2-G4 — Full battle choreography acceptance.**
8. **V2-G5 — Real two-authenticated-user end-to-end with correct public/private views.**
9. **V2-G6 — Player systems integration: Collection / Deck Builder / Practice / Packs / progression.**
10. **V2-G7 — Release acceptance fence:** exact-head tests + migration replay + functional smoke + visible two-user gameplay + Supabase parity + checklist complete.
11. **LIVE.**

No later gate may be used to erase an earlier incomplete gate. Work may be prepared in parallel only when it cannot mask, overwrite or invalidate an earlier blocker.

---

## 17. Definition of LIVE

`LIVE` does not mean "PR merged" or "functions deployed".

LIVE means:

> A real authenticated player can open Stream Bandit, choose/play a legal deck, complete a normal online match against another authenticated player through the one-screen card-table interface, understand the game without backend/debug terminology, and receive the correct authoritative result without private-information leakage or known release-blocking runtime defects.

Release acceptance also requires the exact checklist and release-control record to identify the promoted source and production deployment.

---

## 18. Control-file acceptance for this V2.3.2 lock

This master-plan revision is documentation/control only. It does not itself repair runtime defects, alter production data, deploy Edge Functions, modify the live battle page, promote Fairy/Underworld, or declare any implementation gate complete.

Its purpose is to ensure the project cannot again lose the recovered intent, release lessons, small-but-important interaction details, or exact next step.
