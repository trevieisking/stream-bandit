# Stream Bandit TCG — Canonical Master Plan V2.2

**Plan date:** 2026-09-17  
**Status:** canonical prototype-restoration / usability authority layered on V2.1  
**Inherits:** `tcg-master-plan-progress-v2.1.md` in full except where this file explicitly supersedes presentation/usability wording  
**Execution ledger:** `tcg-master-plan-ledger-v2.2.md`  
**Historical V2.1 checkpoint:** `77dc14a5af4101bfd06941243d142ce3f16cc120`  
**Historical private-alpha baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23` / PR #549  
**Battle interaction contract:** `tcg-battle-client-interaction-v1.json`  
**Card-controller contract:** `tcg-v2-card-action-controller-v1.json`  
**Card visual/printing contract:** `tcg-card-visual-printing-v1.json`

---

## 0. Why V2.2 exists — RESTORE, DO NOT REDESIGN

V2.2 corrects a project-drift problem.

The original playable Stream Bandit TCG prototype and early master-plan work already established the intended player experience:

- a one-screen battlefield rather than a debug form;
- physical cards as the objects the player touches, drags, inspects and acts through;
- a premium live card renderer driven from authoritative registry data;
- a board that remains the centre of play;
- Collection and Deck Builder as first-class player tools;
- fullscreen/desktop presentation with mobile/touch support;
- a clear instruction in the 4 September 2026 continuity record that the project should **not redesign the board**, and later continuity that **the board stays**.

Therefore the video-style tabletop/direct-manipulation plan is **not a new direction**. It is restoration of the original playable prototype intent, updated to the current 10-element / 241-identity V2 rules and visual system.

### Prototype-restoration rule

If later implementation becomes harder to understand or less enjoyable than the approved playable prototype without a rules/safety reason, that is a **UX regression**, not progress.

The target feeling is:

> Pick up a card, see where it can go, play it, see what happened, and keep playing.

Do not replace this with forms, detached command strips, browser prompts, or multi-step developer controls.

---

## 1. Authority order and conflict resolution

When UX sources differ, use this order:

1. Trev's latest explicit correction/decision.
2. Current structured card/rules data for exact gameplay legality/numbers.
3. The approved playable Stream Bandit prototype/workspace visual direction and one-screen-board intent.
4. The approved uploaded match video for interaction choreography.
5. The ten approved Stream Bandit showcase image families for card/product visual language.
6. Current Pokémon TCG / Pokémon TCG Live research and historical Pokémon TCG Online research as **interaction-category references only**.
7. Older Stream Bandit planning where not superseded.

### Important supersession example

The older controlled-design pack said every Creature should carry an Ability. That is superseded by the current locked V2 card rule:

- **Ability + Attack 1**, OR
- **Attack 1 + Attack 2**.

The old board/direct-manipulation intent was **not** superseded and is restored as active authority.

---

## 2. Pokémon research synthesis — interaction patterns only

Stream Bandit does not copy Pokémon names, art, frames, card text, sounds, branded UI, animations or assets. Research is used only to identify proven interaction patterns for a digital creature-card game.

### 2.1 Physical board readability

The Pokémon TCG rules reinforce a spatial tabletop mental model:

- one active battler in front;
- a row of benched creatures;
- Prize/Reward-style face-down cards;
- visible Deck and Discard;
- hand as the player's private play source;
- attached resource cards remain visibly associated with creatures;
- Stadium/Realm-like shared board effects persist in play.

Stream Bandit maps this to:

- **Vanguard** instead of Active;
- **4 Reserve** slots instead of Bench;
- **6 Reward Cards**;
- **Essence** instead of Energy;
- **Realm** instead of Stadium;
- Stream Bandit's own cards, names, rules and art.

### 2.2 Current Pokémon TCG Live lessons worth keeping

Useful interaction lessons from current Live include:

- landscape/full-board presentation on desktop/tablet;
- strong active-turn visual feedback;
- cards facing the viewer clearly enough to inspect;
- full-card presentation instead of over-condensed battlefield proxies;
- attack/KO animation feedback;
- enlarged card inspection;
- deck validation visible while editing;
- card variant/rarity browsing under one gameplay identity;
- collection/card gallery support;
- test-deck/practice play before matchmaking.

### 2.3 Older Pokémon TCG Online lessons worth bringing back

Historical TCG Online is useful as a product/UX reference for:

- a more conventional tabletop/card-game feel;
- Collection + Deck Manager as obvious separate destinations;
- Trainer Challenge / practice-style play;
- Events/tournament-style modes;
- strong deck/accessory/collection identity;
- player-facing systems that made the client feel like a complete card-game home rather than only a battle screen.

Stream Bandit may recover equivalent usefulness under its own systems and terminology, including its existing Collection, Deck Builder, Trade Token, Shop Coin, pack, season and future event plans.

### 2.4 Rules interaction lesson

The core category flow remains intuitive:

- attach one normal resource per turn unless an effect says otherwise;
- play/evolve creatures directly on the field;
- use abilities from the creature/card context;
- withdraw/retreat by paying the printed resource cost;
- **attacking ends the turn**.

These patterns align with Stream Bandit's already locked V2 interaction model.

### Research references

- Pokémon TCG rulebook: https://assets.pokemon.com/assets/cms2-en-uk/pdf/trading-card-game/rulebook/svi_rulebook_en.pdf
- Pokémon TCG Live: https://www.pokemon.com/uk/pokemon-video-games/pokemon-trading-card-game-live
- Pokémon TCG Live landscape/deck-editor update, 21 Apr 2026: https://www.pokemon.com/uk/pokemon-news/pokemon-tcg-live-landscape-layout-and-deck-editor-updates
- Pokémon Support card variants: https://support.pokemon.com/hc/en-us/articles/45762566240788-How-to-View-Card-Variants-in-Pok%C3%A9mon-TCG-Live
- Historical interaction comparison: Bulbapedia Pokémon TCG Live / Pokémon TCG Online articles, research use only.

---

## 3. Fun-first usability contract

The Battle Client must be easier to play than the current lab/debug surface.

### 3.1 One-screen battle first

During ordinary play, the player should see the meaningful match state without navigating away:

- opponent upper half;
- own lower half;
- 1 Vanguard + 4 Reserve each;
- Reward positions;
- Deck + Discard;
- hand along the bottom edge;
- Realm presence;
- attached Essence/Relic state;
- turn/phase/choice status.

Choices may overlay the board, but ordinary gameplay must not turn into a vertical form page.

### 3.2 Physical-card metaphor

The normal question should be **"where do I put this card?"**, not **"which debug action do I call?"**

Cards played from hand use direct manipulation:

- Creature → legal Vanguard/Reserve slot;
- Evolution → legal Creature stack;
- Essence → legal Creature;
- Tactic → legal target/choice flow;
- Relic → legal Creature;
- Realm → Realm slot;
- future card families → their legal destination through the same generic target model.

Desktop priority: drag/drop.  
Touch/accessibility equivalent: tap/select → legal destination.

### 3.3 Pick-up highlighting

When a card is picked up/selected:

- legal destinations glow;
- illegal destinations remain inactive;
- the player can cancel before server commit;
- the client explains why a tempting target is illegal when useful;
- only authoritative server legality decides what may actually be committed.

Evolution is specifically locked to **green highlighting** for every Creature that can legally receive that Evolution card.

### 3.4 Keep the board visible during decisions

Deck search, card selection, discard recovery, Reward choice and similar actions open a carousel/grid/overlay while preserving battlefield context whenever practical.

Avoid replacing the match with a separate developer-style form unless a full-screen accessibility mode explicitly requires it.

### 3.5 Misclick recovery before commit

Where a choice has not yet been submitted to the authoritative server, the player should be able to change/cancel the selection. This reduces accidental irreversible taps/drags on desktop and mobile.

Once a server-committed action has legally resolved, the client must not locally undo it.

---

## 4. Creature card is the battle controller

The accepted PR #560 contract remains authoritative.

Selecting/hovering/tapping a Creature enlarges/focuses its real rendered card and exposes legal contextual actions from that card.

### Exactly two action slots

Every Creature uses exactly one of:

1. **Ability + Attack 1**
2. **Attack 1 + Attack 2**

Never Ability + Attack 1 + Attack 2 together.

### Active Ability

- manually activated Abilities are normally **once during your turn**;
- structured card rules may explicitly state another timing/limit;
- triggered/passive/continuous Abilities remain visible but fire through their event rules rather than fake manual buttons;
- after use, the card visibly shows the Ability as spent/locked for the relevant duration when appropriate.

### Attack

- attacks are chosen directly from the Vanguard card;
- Attack Cost and Damage are clearly labelled;
- server validates payment/targets/legality;
- effects/damage/listeners/defeat/Rewards/promotion/Aftermath resolve;
- **the attacker's turn then ends automatically**.

No generic global Attack buttons as the primary attack UI.

### Withdraw

- choose Vanguard card → Withdraw;
- show Withdraw Cost;
- highlight legal Reserve replacements;
- choose exact Essence payment when required;
- animate Vanguard/Reserve exchange;
- server Switch/Cost/Payment owners remain authoritative.

---

## 5. Card and board visual contract

The ten approved showcase families remain the visual authority.

### Creature face

- **HP** top-left;
- **Type / Element** top-right;
- name + stage/classification header;
- large dedicated artwork;
- exactly two action slots below art;
- every number has its property name;
- **Withdraw Cost** bottom-right;
- rarity/printing/set treatment in frame/footer.

Examples of named numbers:

- HP 150
- Cost 3
- Attack Cost 2 Fairy
- Damage 60
- Withdraw Cost 2
- Shield 40
- Heal 20

### Full card visibility

Cards remain recognisably full cards on the battlefield. They may scale smaller, but important identity information is not replaced by anonymous rectangles or condensed debug boxes.

Hover/tap/hold provides an enlarged readable card.

### Printing/finish system

Gameplay rarity:

- Basic
- Rare
- Extra Rare
- Mythic

Cosmetic printings/finishes:

- Standard
- Shine
- Holo
- Full-Art Shine
- Alt-Art
- Signature Mythic

Different finishes never alter gameplay power.

---

## 6. Persistent board objects and direct play

### Essence

- dragged/selected onto the intended friendly Creature;
- legal Creature targets highlight;
- attachment visibly stacks/associates with that Creature;
- server attachment/cost rules remain authoritative.

### Relic

- dragged/selected onto a legal Creature;
- remains visibly attached until rules remove it.

### Realm

- dragged/selected into the Realm slot;
- **persists across turns**;
- remains until another legal Realm replaces it or a card/effect explicitly removes/discards it;
- does not disappear merely because the turn ends.

### Tactic

- played from the physical card in hand;
- legal targets/highlights/choices appear on the board;
- private selections use visual overlays instead of browser prompts;
- resolved Tactic moves to its canonical destination.

---

## 7. Full battle choreography checklist

The release Battle Client must prove all of the following in one coherent player experience:

### Opening/setup

- toss/opening choice;
- opening hand;
- mulligan flow;
- drag/place Vanguard;
- drag/place optional Reserve Creatures;
- ready/confirm;
- six Rewards installed;
- normal board appears without switching to a debug form.

### Turn/build

- draw animation/state update;
- Creature play;
- Evolution with green targets;
- Essence attachment;
- Tactic play;
- Relic attachment;
- Realm play/persistence;
- active Ability use;
- Withdraw/switch;
- visible legal/illegal feedback.

### Search/choice

- keep board context;
- show eligible cards visually;
- selected-count/requirement visible;
- allow change/cancel before commit;
- preserve hidden-information boundaries.

### Clash/attack

- Vanguard card enlargement;
- choose printed Attack 1/2;
- show cost/legality;
- animate attack;
- damage + HP delta;
- Shield changes;
- Condition feedback;
- triggered/listener notices where player-visible;
- defeat/KO animation;
- Reward/promotion flow;
- Aftermath;
- automatic turn handoff.

### End state

- victory/defeat presentation;
- match rewards exactly once;
- rematch/exit controls;
- completed match remains immutable.

---

## 8. Complete-client product experience

The project should recover the useful "complete card game" feeling that older and current digital TCG clients provide, without copying proprietary presentation.

### Required player destinations

- **TCG Home** — Play, current set/season, progression summary.
- **Learn / Tutorial** — interactive rules and guided practice.
- **Collection / Card Dex equivalent** — owned cards, families, printings/variants, rarity/finish tracking.
- **Deck Builder** — create/edit/validate/import/export/duplicate decks; show owned/in-deck/available counts and legality directly.
- **Packs** — earned packs, pack family, odds/history, opening presentation.
- **Play** — Practice/Test Deck, private room, Casual; Ranked/events when their gates are ready.
- **Season / Battle Pass** — Stream Bandit's own progression/rewards.
- **Card Viewer** — full card, art, rulings, printing variants and evolution family.

Historical/legacy inspiration can inform future events/tournaments and collection richness, but does not override current Stream Bandit economy/safety decisions.

---

## 9. Complexity brake

The private-alpha backend successfully proved many rules, but player usability must not be sacrificed to expose those systems.

From V2.2 onward:

- do not add a new UI action when the physical-card interaction can express it;
- do not add another owner/helper merely to make the client easier to wire;
- do not expose raw server/debug state to ordinary players;
- do not require the player to understand engine/owner terminology;
- do not add more battle-client complexity before proving the current interaction can stay simple;
- preserve one canonical server rule path and one clear player interaction path.

After V2-G1 structured data is complete, **playable prototype restoration is the next product priority** before unrelated economy/event expansion.

---

## 10. Architecture invariants

The existing 40 gameplay owner families remain authoritative.

Client behaviours are projections of those owners, not new rules engines:

- Attack #14 owns attacks;
- Active Ability #15 owns active Ability timing/activation;
- Tactic #16;
- Relic #17;
- Realm #18;
- Essence Attachment #22;
- Cost #25;
- Payment #26;
- Switch/Position #27;
- Movement Listener #29;
- Card-Zone #30;
- Reward Cards #32;
- Hidden Information #33;
- Card Printing / Art Metadata #3;
- Pack #37.

No owner #41 merely for UX.

---

## 11. V2.2 gate interpretation

### V2-G0 — COMPLETE ✅

Scope, ten families, visual direction, prototype-restoration authority and interaction principles are accepted.

### V2-G1 — IN PROGRESS 🔎

Complete all 241 canonical structured identities and ten exact starters, including Fairy + Underworld schema translation and only proven generic dispatcher gaps.

### V2-G2 — Reusable full-card renderer

Pass only when structured cards render as the approved premium Stream Bandit cards, including named numbers, artwork, rarity and printing variants.

### V2-G3 — Playable prototype restoration / Battle Client

Pass only when a real player can complete the principal video/prototype choreography through the board itself:

- drag/play cards;
- green Evolution targets;
- attach Essence;
- use Ability/Attack/Withdraw from cards;
- persistent Realm;
- searches/choices without debug prompts;
- attack auto-turn-end;
- Rewards/defeat/promotion;
- desktop + touch-friendly interaction.

**Usability acceptance:** the new client must be at least as immediately playable as the earlier prototype. Passing backend tests is not enough.

### V2-G4 — Engine integration

Pass when the restored client delegates all legal state changes to canonical server owners with no browser rules duplication.

### V2-G5 — Collection / Deck / Printing UX

Pass when collection, variants, card viewer and deck validation are coherent and useful.

### V2-G6 — Real two-user end-to-end

Two authenticated users complete a real match using the restored Battle Client rather than the lab/debug form.

### V2-G7 — public promotion

HOLD until all preceding gates pass.

---

## 12. Locked implementation order from this checkpoint

1. Finish Fairy + Underworld `sb-tcg-card-v0.2` translation.
2. Validate all 241 identities and ten exact 60-card starters.
3. Repair only proven generic dispatcher gaps while preserving the 40 owners.
4. Build the reusable premium full-card renderer.
5. Restore the one-screen playable battlefield shell before adding unrelated product complexity.
6. Wire direct drag/drop/tap card play from authoritative legal-target projections.
7. Wire green Evolution highlighting.
8. Wire Essence/Relic/Realm/Tactic direct manipulation.
9. Wire card-context Ability / Attack / Withdraw.
10. Wire search/choice overlays, Rewards, defeat, promotion and terminal presentation.
11. Prove automatic turn completion after attacks.
12. Run desktop/mobile/accessibility usability pass against the prototype/video checklist.
13. Run genuine two-user end-to-end.
14. Then continue Collection/Deck/Packs/Season/event expansion according to their own gates.

---

## 13. Current progress

- Historical private-alpha backend: ✅ 8 / 193 / 8
- V2 target: ✅ 10 families / 241 identities / 10 starters
- Underworld design: ✅
- Fairy design: ✅
- Creature card-controller: ✅
- Original prototype intent recovered as current UX authority: ✅
- Approved video choreography: ✅
- Ten showcase visual families: ✅
- Pokémon Live/Online interaction research synthesis: ✅
- Universal playable-card drag/drop: ✅ LOCKED
- Green legal-Evolution glow: ✅ LOCKED
- Persistent Realm: ✅ LOCKED
- Active Ability normally once/turn unless stated otherwise: ✅ LOCKED
- Attack ends turn automatically: ✅ LOCKED
- One-screen board / no debug-form regression rule: ✅ LOCKED
- V2-G1 structured 241-card authority: 🔎 IN PROGRESS
- Full-card renderer: ☐
- Playable prototype restoration: ☐
- Two-user restored-client match: ☐
- Public V2: 🔒 HOLD
