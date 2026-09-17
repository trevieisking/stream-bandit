# Stream Bandit TCG — Canonical Master Plan V2.3

**Plan date:** 2026-09-17  
**Status:** canonical evergreen/extensibility authority layered on V2.2  
**Inherits:** `tcg-master-plan-progress-v2.2.md` in full except where this file adds or supersedes format/extensibility policy  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.md`  
**Mechanic research:** `tcg-mechanic-heritage-research-v1.md`  
**Machine-readable evergreen contract:** `tcg-evergreen-extensibility-v1.json`  
**Previous canonical main checkpoint:** `5a5609a7fa93b365eeaa7fb8da6a9ade6322944b`  
**Historical private-alpha baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23` / PR #549

---

## 0. Core philosophy — BUILD FOR FOREVER

Stream Bandit TCG is designed as an **evergreen, additive card game**.

The game must stay open to future:

- cards;
- attacks;
- Abilities;
- special Creature forms/classes;
- elements/types;
- series/sets;
- starter decks;
- constructed decks;
- booster packs;
- pack odds/slot structures;
- rarities and printings;
- alternate art;
- Realms, Relics, Tactics and Essence;
- collectible coins, sleeves, deck boxes and other cosmetics;
- event formats;
- new generic rule capabilities not known today.

The architecture must not assume the current 241-card V2 target is the final size of the game.

### Player promise

> A card a player legitimately acquires should not become unusable in the main all-cards game merely because a newer series releases.

New content **adds** to the game. Age alone does not remove old cards from the primary format.

---

## 1. Evergreen legality / ownership policy — LOCKED

### 1.1 Primary all-cards format

The primary Stream Bandit format is **Evergreen**:

- no age-based set rotation;
- released gameplay cards remain legal by age;
- old series remain supported by the rules engine;
- new series do not automatically invalidate old decks;
- collection ownership never disappears because of a format update;
- alternate art / Shine / Holo / Full-Art / Signature printings stay tied to the owned gameplay identity.

Player-facing name may later be changed from `Evergreen`, but the no-age-rotation policy remains unless Trev explicitly changes it.

### 1.2 Optional formats do not erase ownership

The game may later offer optional formats such as:

- current-series challenge;
- limited/draft;
- singleton;
- element-only;
- beginner/starter;
- event/campaign;
- no-special-class;
- custom private rules.

These are additional queues/events. They do not delete or age-rotate the player's main collection.

### 1.3 Balance safety valve

Evergreen does not mean balance can never be corrected.

Preferred order:

1. repair an implementation defect;
2. issue rules errata only when genuinely necessary;
3. add healthy counterplay through future content;
4. use copy limits / restricted controls where appropriate;
5. competitive suspension/ban only as a last resort for severe loops, exploits or format-breaking imbalance.

When a competitive restriction is unavoidable, preserve ownership and keep the card playable in suitable Private / Practice / Open play whenever technically and safely possible.

---

## 2. Research conclusion — COPY CAPABILITIES, NOT POKÉMON BRANDING

Research covered major historical/current Pokémon TCG mechanic families, including:

- original Pokémon-ex;
- Pokémon-EX;
- old Mega Evolution Pokémon-EX;
- Pokémon-GX;
- TAG TEAM Pokémon-GX;
- Pokémon V;
- Pokémon VMAX;
- Pokémon VSTAR;
- Pokémon V-UNION;
- Radiant / Pokémon Star-style singleton cards;
- ACE SPEC;
- Prism Star;
- Pokémon LV.X;
- BREAK Evolution;
- Tera Pokémon ex;
- current Mega Evolution Pokémon ex;
- faction/style/tag systems.

The rule patterns are documented in `tcg-mechanic-heritage-research-v1.md`.

### Originality boundary

Stream Bandit may implement equivalent **general mechanics**, but must use:

- original Stream Bandit mechanic names;
- original Creature/card names;
- original card text;
- original artwork;
- original frames and rarity treatments;
- original sounds/animations/UI;
- Stream Bandit terminology and lore.

Do not reproduce proprietary Pokémon card wording or assets.

---

## 3. Stream Bandit special-mechanic vocabulary — WORKING CANON

The following original names define reusable capability bundles. Player-facing names can later be refined without changing the engine contract.

### Ascendant Creature

High-stakes Creature normally worth **2 Rewards** when defeated.

Use cases inspired by the general risk/reward pattern of historical EX/V/ex cards.

### Colossus Creature

Extreme high-stakes Creature normally worth **3 Rewards** when defeated.

Can be an advanced form or an ordinary-stage Creature depending on series design.

### Signature Power

One shared **once-per-match** special action for a player.

A Signature Power may be:

- Signature Attack; or
- Signature Ability.

The once-per-match receipt is player/match state, not per-card state.

### Bonded Creature

Multiple beings represented by one Creature gameplay identity.

Can use higher Reward value, extra-cost bonus effects or other ordinary capability composition.

### Convergence Creature

Creature assembled from multiple component cards according to a recipe.

Supports:

- component identities;
- required source zones;
- assembly into one battlefield position;
- per-name/per-match assembly limits;
- separate semantics while components are not assembled.

### Gleam Creature

Powerful special Creature with a **one-per-deck** group restriction.

### Prime Card

One card total from a shared powerful support group per deck.

Prime can later be applied to Tactic, Relic, Realm or Essence if design approves.

### Voidmarked Card

Special card whose normal discard movement may be replaced by movement to an out-of-play **Void** zone.

### Overform

Upgrade/evolution capable of inheriting selected lower-card properties, including:

- attacks;
- Abilities;
- attachment state;
- damage state;
- selected type/element properties.

### Aspect Creature

Alternate form/element identity capable of carrying positional or form-specific rules such as Reserve protection.

### Ascension Evolution

Special evolution procedure capable of imposing extra timing consequences, including an optional immediate end-turn after evolution.

---

## 4. Mechanic composition rule — CRITICAL

Do **not** build one engine per special label.

A special future Creature should be assembled from generic properties such as:

- stage / evolution parent;
- `reward_value`;
- `rule_tags`;
- `counts_as` tags;
- attacks[];
- Ability;
- Signature Power membership;
- deck-group limit;
- identity copy limit;
- assembly recipe;
- inheritance rules;
- zone replacement;
- position-based prevention;
- timing/usage receipts;
- existing effect opcodes.

Example:

A future card could be:

- Colossus;
- Bonded;
- worth 3 Rewards;
- carry a once-per-match Signature Attack;
- gain a bonus if extra Essence is paid;

without requiring a unique hard-coded engine for that specific card.

---

## 5. Required extensible rule capabilities

The long-term engine must be able to express, through shared owners/opcodes, at least:

1. Reward values beyond the ordinary 1-Reward Creature.
2. Shared once-per-match Attack/Ability receipts.
3. Per-turn, per-card, per-name and per-controller limits.
4. Special evolution prerequisites.
5. Ordinary-stage special classes.
6. Optional evolve-and-end-turn timing.
7. `counts_as` / rule-class inheritance.
8. Multi-character card identities.
9. Extra-cost bonus effects.
10. Multi-card assembly.
11. Once-per-match assembly limits.
12. Component vs assembled-object semantics.
13. Shared deck-group copy limits.
14. Singleton identity limits.
15. no-evolution special Creatures.
16. overlay upgrades preserving attachments/damage.
17. inherited attacks.
18. inherited Abilities.
19. selective stat/element/property overrides.
20. cleanse/reset effects on transformation.
21. movement destination replacement.
22. out-of-play/Void zone support.
23. position-based prevention.
24. effects targeting special rule tags/classes.
25. dynamic Reserve size limits.
26. attack cooldowns such as next-turn lock or until-leaves-Vanguard reset.
27. Ability usage receipts.
28. attack copying.
29. Reward-state comeback/scaling effects.
30. scaling from hand/Reserve/Discard/attachments or other match state.
31. Reserve splash damage.
32. damage-counter placement distinct from ordinary attack damage.
33. conditional damage prevention/reduction.
34. Essence move/attach/discard/recover effects.
35. search-and-attach from Deck or Discard.
36. both-player switch effects.
37. Realm-dependent bonuses/discards.
38. Condition immunity and cleanse.
39. faction/trait synergies.
40. multiple printings for one gameplay identity.

This is a capability target, not a claim that all 40 are currently implemented.

---

## 6. Content must be data-driven, not series-coded

### 6.1 Series / sets

New series must be addable through data records containing at least:

- stable series/set id;
- display name;
- release metadata;
- element/theme tags;
- card identity membership;
- pack recipes;
- rarity/printing distributions;
- starter/preconstructed deck recipes when applicable;
- art/product metadata;
- optional event/story tags.

Never hard-code `if series == X` into ordinary runtime rules.

### 6.2 Cards

New cards should enter through the content registry and shared effect grammar.

Card data must be capable of introducing:

- new attacks;
- new Abilities;
- new trait combinations;
- new special mechanic capability bundles;
- new printings;
- new art;
- new evolution/assembly relationships.

### 6.3 Decks

Deck recipes remain data, not engine code.

Support:

- starter decks;
- theme decks;
- player-built decks;
- future event decks;
- import/export/share recipes;
- validation against selected format.

### 6.4 Booster packs

Pack owner #37 must eventually consume versioned pack recipes containing:

- set/pack id;
- card pool;
- slot count;
- rarity weighting;
- guaranteed slots;
- special/alternate-art slots;
- duplicate handling;
- reveal/opening presentation metadata.

Adding a booster pack must not require a new Edge Function.

### 6.5 Coins / accessories

Collectible coins, deck boxes, sleeves and future cosmetics are content records, not gameplay engines.

A cosmetic coin is distinct from a gameplay random coin flip:

- collectible coin/accessory → Collection/cosmetic metadata;
- random heads/tails mechanic → existing Randomization owner.

---

## 7. Backward compatibility contract

Every future expansion must pass a compatibility gate.

### Required guarantee

- existing released card identities remain parseable;
- existing printings remain attached to their gameplay identities;
- existing deck recipes remain loadable or receive an explicit versioned migration;
- older effect opcodes keep their meaning;
- new fields are additive/default-safe where possible;
- rules changes use explicit versioning/errata rather than silently changing old card behaviour;
- replay/test fixtures for older series remain runnable.

### Printing identity rule

Gameplay identity and printing identity remain separate.

One gameplay identity may have:

- Standard;
- Shine;
- Holo;
- Full-Art Shine;
- Alt-Art;
- Signature Mythic;
- future finish types.

A printing never becomes stronger merely because it is rarer or shinier.

---

## 8. Architecture ownership

The 40-owner architecture remains the starting authority.

Special mechanics should normally compose existing owners:

- Content Registry #1 — identity / class / series metadata;
- Card Printing / Art Metadata #3 — printings/variants;
- Collection #4 — owned identities/printings/cosmetics;
- Deck Builder / Legality #6 — copy/group/format limits;
- Creature/Evolution #13 — evolution/overlay/assembly orchestration where appropriate;
- Attack #14 — attack selection/resolution;
- Active Ability #15 — active Ability usage;
- Tactic #16;
- Relic #17;
- Realm #18;
- Essence Attachment #22;
- Cost #25 / Payment #26;
- Atomic Switch #27;
- Movement Listener #29;
- Card-Zone #30 — movement, discard, future Void/out-of-play movement;
- Reward Cards #32 — Reward value/payout;
- Hidden Information #33;
- Economy #35;
- Pack #37.

No owner #41 simply because a historical research mechanic has a new player-facing name.

A new owner is justified only if a genuinely new state transition has no correct existing owner.

---

## 9. UX continuity remains unchanged

V2.2 prototype-restoration rules remain fully active:

- one-screen board-first battle;
- physical card direct manipulation;
- drag/drop desktop + tap/select touch equivalent;
- green legal-Evolution highlighting;
- Essence-to-Creature play;
- persistent Realm;
- Creature card as Ability/Attack/Withdraw control;
- active Ability normally once per turn unless card says otherwise;
- attack automatically ends turn after full resolution/Aftermath;
- searches/choices keep board context;
- premium full-card rendering;
- debug forms/browser prompts forbidden as release gameplay.

New special mechanics must fit this interaction language rather than create a second debug UI.

---

## 10. Gate additions

### V2-G1 — current 241-card canonical baseline

Still the active engineering lane.

Finish:

- Fairy canonical translation;
- Underworld canonical translation;
- exact ten starter validation;
- only proven generic dispatcher gaps.

### V2-G1E — Evergreen/extensibility schema proof — NEW

Pass before calling the content architecture expansion-ready.

Must prove the schema can represent without element/card-name branching:

- Reward value override;
- shared once-per-match action;
- special rule tags/classes;
- group/identity singleton limits;
- inheritance/overlay metadata;
- assembly metadata;
- zone replacement metadata;
- series/set references;
- pack/deck recipe references;
- printing identity separation.

This gate can initially be schema/validator proof; not every special mechanic must ship in Set One.

### V2-G2 — premium reusable card renderer

Must render current Set One and future special capability tags without bespoke card HTML per series.

### V2-G3 — playable prototype restoration

Same V2.2 acceptance.

### V2-G5 — Collection / Deck / Printing UX

Adds explicit evergreen requirements:

- collection can show every owned series;
- deck builder selects format without deleting cards;
- legality reasons are visible;
- alternate printings remain grouped under gameplay identity;
- future series do not require a replacement collection schema.

### Future pack/economy gate

Before pack opening becomes production-authoritative, prove data-driven pack recipes and collection writes with no per-pack backend function.

---

## 11. Locked implementation order

1. Finish V2-G1 Fairy + Underworld canonical translation.
2. Validate all 241 V2 identities + ten starters.
3. Close only proven generic dispatcher gaps.
4. Add V2-G1E schema/validator support for evergreen special-mechanic metadata, without forcing unused mechanics into Set One.
5. Build premium full-card renderer from generic structured data.
6. Restore the one-screen playable Battle Client.
7. Run real two-user V2 match.
8. Expand Collection/Deck Builder for evergreen format + printing variants.
9. Implement Pack #37 through data-driven recipes.
10. Add later special mechanic series one capability slice at a time, each with deterministic tests and backward-compatibility proof.

---

## 12. Current progress

- Private-alpha 8 / 193 / 8: ✅ historical/runtime baseline
- V2 target 10 / 241 / 10: ✅
- Prototype-restoration UX: ✅ canonical V2.2
- Evergreen no-age-rotation philosophy: ✅ LOCKED
- Old-card ownership/usefulness preservation: ✅ LOCKED
- Pokémon EX/GX/V/VMAX/VSTAR/ex/Mega-era mechanics researched: ✅
- Additional V-UNION/Radiant/ACE SPEC/Prism/LV.X/BREAK/Tera capability research: ✅
- Original Stream Bandit mechanic vocabulary: ✅ working canon
- Generic extensibility contract: ✅
- 40-owner architecture retained: ✅
- V2-G1 current 241-card schema: 🔎 IN PROGRESS
- V2-G1E evergreen schema proof: ☐
- Premium renderer: ☐
- Restored playable board: ☐
- Evergreen Collection/Deck UX: ☐
- Data-driven Pack #37 runtime: ☐
- Future special-mechanic series: ☐ planned/open-ended
- Public V2: 🔒 HOLD
