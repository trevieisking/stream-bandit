# Stream Bandit TCG — Video Interaction Comparison V1

Recorded: 20 September 2026
Master-plan binding: V2.4.60
Scope: Release 1 Battle presentation / interaction grammar only

## Evidence set

This comparison consolidates the most recent video evidence already reviewed in the TCG workstream:

1. `WhatsApp Video 2026-09-20 at 17.52.36(1).mp4` — external TCG/Pokémon interaction/layout reference.
2. `Video Project 5.mp4` — external TCG/Pokémon interaction/layout reference.
3. `Desktop 2026.09.20 - 18.22.38.08.mp4` — Trevor desktop Stream Bandit Battle.
4. `WhatsApp Video 2026-09-20 at 18.30.29.mp4` — Kay phone Stream Bandit Battle.
5. `Screen_Recording_20260920_193339_Chrome.mp4` — later Kay phone Battle evidence retained for the next cross-device acceptance pass.

The existing interaction contract also retains `Dar match up test deck(1).mp4` as earlier choreography evidence.

The external footage is used only to study interaction grammar. Stream Bandit keeps its own artwork, card frames, terminology, rules, elements, card identities, mechanics and server authority.

## What the Pokémon/external TCG interaction grammar gets right

### 1. The board remains understandable while actions happen
The entire tabletop remains spatially stable. Cards do not jump away from their zones merely because the player inspects or acts on them. Full card readability is supplied by inspection rather than permanently oversized field cards.

**Stream Bandit direction:** keep Vanguard, Reserve, Realm, Deck, Discard, Rewards and hand spatially anchored. Inspection is a separate readable face.

### 2. Cards behave like physical objects
Drawn cards visibly travel from Deck to hand. Played cards travel from hand to board. Discards travel to Discard. Search results appear as selectable cards. Shuffles visibly affect the face-down Deck object.

**Stream Bandit direction:** important server-owned zone transitions must be represented as card motion rather than silently appearing after refresh.

### 3. Choices are surfaced as focused overlays
When the player must choose cards or targets, the client clearly separates the choice from the normal tabletop, shows the eligible objects, indicates the required count, and returns to the board after resolution.

**Stream Bandit direction:** use large canonical choice overlays/grids for Reward selection, deck searches, hidden/private samples, optional effects and any future N-of-M selection.

### 4. Legal targets are visually obvious
The player does not need to infer where a card can go. Legal destinations glow/highlight while illegal destinations stay inert.

**Stream Bandit direction:** every drag/tap/choice target highlight must come from authoritative projected legality, never browser reconstruction.

### 5. Resolution has visible causal order
An Attack or Ability reads as a sequence: source activates, target is identified, effect travels/lands, state changes become visible, secondary effects trigger, then control returns.

**Stream Bandit direction:** present one ordered authoritative resolution chain rather than instantly replacing the board with the final numbers.

### 6. Hidden information still has physical presence
Face-down hands, decks and prize/reward zones are visually present without exposing identities.

**Stream Bandit direction:** opponent hand, Deck and unrevealed Rewards use card backs/counts and viewer-specific visibility.

### 7. The hand feels like a hand
Cards remain large enough to recognize and browse, but do not consume the whole viewport.

**Stream Bandit direction:** retain the accepted bottom-edge peek/fan rail, horizontal scroll/swipe and lift/focus on selection.

### 8. Mobile and desktop share the same game semantics
Touch changes the gesture, not the rules.

**Stream Bandit direction:** desktop drag/drop and phone hold-drag/tap fallback must submit the same server actions and consume the same projected legality.

## What Trevor and Kay's recordings say Stream Bandit still needs

### Already moving in the right direction
- whole-board composition at normal zoom;
- bounded field cards;
- shared full-card inspection;
- bottom peek/fan hand;
- attached Essence orb rail;
- server-projected Attack and active Ability controls;
- touch-safe drag plus tap fallback;
- visible Realm presentation;
- Withdraw projection;
- Reward/promotion continuation repair;
- player-friendly legality messages instead of raw machine codes.

### Remaining presentation gaps exposed by the recent Battles
- Decks need stronger physical presence and authoritative shuffle animation.
- Draw/deal should visibly originate at Deck and arrive in hand/Reward.
- Opponent hand should visibly exist as face-down cards/count.
- Discard must be visibly populated and inspectable where public.
- Reward selection must feel like a real card choice, not merely a state change.
- Attacks need wind-up/impact/damage/Shield/heal/Condition/Defeat/Reward choreography.
- Active Abilities and triggered listeners need visible source/target/result feedback.
- Conditions need visible apply/clear/replace/prevention feedback.
- Search effects need a private selection surface, selected-count display and visible return/shuffle sequence.
- Essence/Relic attach/remove/payment should visibly travel between source/target/zone.
- Evolution, Vanguard/Reserve switch and forced promotion should visibly move/stack cards.
- Turn handoff should be visually obvious without covering the board.
- Error feedback should explain why an action cannot happen before or instead of sending a doomed mutation.
- Presentation must not become a second game-state owner.

## V2.4.60 architecture — Battle Presentation / Choreography Engine

Create one reusable presentation engine that consumes authoritative event/state/choice/result envelopes and produces ordered, disposable visual cues.

It is **not** a gameplay engine. It never decides legality, targets, random outcomes, damage, healing, payment, visibility or final state.

### A. Zone Motion system
Reusable motions for:
- Deck -> hand draw;
- opening deal;
- hand -> field play;
- field/hand -> Discard;
- return to Deck;
- Reward -> hand;
- evolve/stack;
- Vanguard <-> Reserve switch;
- forced promotion;
- Essence/Relic attach/remove/payment.

### B. Choice Overlay system
One generic N-of-M interaction surface driven by authoritative options:
- Reward selection;
- search Deck;
- choose discard;
- choose target;
- optional effects;
- hidden/private sample where permitted;
- future multi-card abilities.

The overlay receives:
- viewer-authorized card identities;
- exact minimum/maximum/required count;
- legal target anchors;
- confirm/cancel/optional semantics;
- continuation identity.

### C. Combat / Ability FX system
Reusable effect families:
- source activation;
- target focus;
- payment/cost;
- projectile/travel/wind-up;
- impact;
- damage;
- Shield delta;
- healing;
- Condition application/clear;
- listener/trigger pulse;
- defeat;
- Reward follow-up;
- turn continuation.

Element-specific art treatment may vary visually, but the data contract is generic and not card-ID-specific.

### D. Deck / hidden-zone presentation system
- face-down Deck object + count;
- authoritative shuffle effect;
- opponent face-down hand representation;
- face-down Reward representation;
- public Discard pile;
- viewer-specific reveal rules from Hidden Information.

### E. Stable inspector / action context
The source card stays anchored. Inspection renders a canonical readable copy. Only server-projected live actions are interactive.

### F. Pacing and interruption
Visual cues are ordered but disposable. If the authoritative snapshot advances, reconnect occurs, or reduced-motion mode is enabled, presentation may shorten/skip animation and immediately converge on the latest server state.

## Canonical example — search 3 Essence and attach

For an Ability whose structured effect says to search the Deck for 3 eligible Essence cards, attach them to legal Adult Creature targets, return the rest, then shuffle:

1. source Ability visibly activates;
2. private search overlay opens from the Deck;
3. only viewer-authorized eligible cards are shown;
4. authoritative counter displays 0/3 -> 3/3;
5. selected cards lift/focus;
6. server-projected legal Adult Creature targets glow;
7. each selected Essence is assigned to a legal target;
8. server commits the effect;
9. chosen Essence cards visibly travel to the relevant Creature/Essence rails;
10. unchosen inspected cards return to the face-down Deck representation;
11. authoritative shuffle effect plays;
12. latest authoritative snapshot becomes the final rendered truth.

The number 3 is data for this effect, not a global UI constant.

## Acceptance standard

A Release 1 mechanic is not player-facing complete merely because the server state is correct. The player must be able to understand the important cause and result of that mechanic from the board presentation.

The acceptance gate therefore checks:
- clarity of source and target;
- visible card movement where a physical card changes zones;
- visible state delta for damage/Shield/heal/Condition/attachments;
- private/public information boundaries;
- desktop/phone semantic parity;
- refresh/reconnect recovery;
- reduced-motion equivalence;
- zero duplicated gameplay authority.

