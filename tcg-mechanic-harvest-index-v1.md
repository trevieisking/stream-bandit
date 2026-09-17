# Stream Bandit TCG — Mechanic Harvest Index V1

**Recorded:** 2026-09-17  
**Purpose:** living cross-era research index so future Stream Bandit cards can reuse proven generic mechanics without one-off runtime code or forced card rotation.  
**Machine-readable companion:** `tcg-generic-mechanic-capabilities-v1.json`  
**Master-plan authority:** `tcg-master-plan-progress-v2.3.1.md`

---

## 0. Core rule

This index exists to learn from three decades of creature-card-game design while keeping Stream Bandit original.

- Research external cards/mechanics for **rule ideas and interaction categories**.
- Do not copy external names, art, card text, frames, audio or branded UI.
- Convert useful ideas into **generic Stream Bandit capability IDs**.
- A future Stream Bandit card should compose capability IDs + structured parameters.
- Do not write a card-name helper or series-name runtime branch when generic capabilities can express the mechanic.
- **Indexed does not mean implemented.** Capability runtime support is proven separately under V2-G1E.
- Old Stream Bandit cards remain supported by age in the primary Evergreen format; new series add capability combinations rather than invalidating prior collections.

---

## 1. Research catalogue coverage

### Primary set index

Pokector's English catalogue currently indexes **174 sets** from Base Set through the 2026 Mega Evolution era.

Source: https://pokector.com/pokemon-sets

Era coverage used by this research index:

| Era | Pokector set count | Mechanic-family scan | Individual card-text deep harvest |
|---|---:|---|---|
| Base | 6 | ✅ indexed | 🔎 ongoing |
| Gym | 2 | ✅ indexed | 🔎 ongoing |
| Neo | 4 | ✅ indexed | 🔎 ongoing |
| e-Card | 3 | ✅ indexed | 🔎 ongoing |
| EX | 20 | ✅ indexed | 🔎 ongoing |
| Diamond & Pearl | 8 | ✅ indexed | 🔎 ongoing |
| Platinum | 4 | ✅ indexed | 🔎 ongoing |
| HeartGold & SoulSilver | 6 | ✅ indexed | 🔎 ongoing |
| Black & White | 13 | ✅ indexed | 🔎 ongoing |
| XY | 16 | ✅ indexed | 🔎 ongoing |
| Sun & Moon | 18 | ✅ indexed | 🔎 ongoing |
| Sword & Shield | 25 | ✅ indexed | 🔎 ongoing |
| Scarlet & Violet | 18 | ✅ indexed | 🔎 ongoing |
| Mega Evolution | 6 | ✅ indexed | 🔎 ongoing |
| Other / promos / special products | 15 | ✅ indexed | 🔎 ongoing |

The set catalogue is used as a **coverage checklist**, not copied into Stream Bandit content.

### Effect-taxonomy sources

Research also uses:

- Bulbapedia `Category:Cards by effect` — 54 broad TCG effect categories.
- Bulbapedia card/Ability/attack category indexes for deeper card-text harvesting.
- official Pokémon rulebooks/current product pages for current rule confirmation.
- historical mechanic pages for retired mechanics whose ideas remain useful.

Key source URLs:

- https://bulbapedia.bulbagarden.net/wiki/Category:Cards_by_effect
- https://bulbapedia.bulbagarden.net/wiki/Category:Cards_by_Ability
- https://bulbapedia.bulbagarden.net/wiki/Category:Pokemon_Trading_Card_Game_mechanics
- https://bulbapedia.bulbagarden.net/wiki/Rule_Box_(TCG)
- https://www.pokemon.com/us/pokemon-tcg/mega-evolution

---

## 2. Historical mechanic families harvested

This table records the useful **rule idea**, not a plan to ship external branding.

| Research-era concept | Generic lesson harvested for Stream Bandit |
|---|---|
| Baby Pokémon | special setup/evolution-stage rules, protection, zero-cost actions, evolution healing/timing variants |
| Pokémon Powers / Poké-Powers / Poké-Bodies | active vs passive vs triggered abilities; disabled/suppressed abilities; use receipts even when effect is blocked |
| Owner's / Trainer's Pokémon | identity-owner/faction tags and card support that targets those tags |
| Dark / Light Pokémon | alternate family tags with themed card support without changing base identity |
| Shining / Pokémon Star | singleton/group deck limits and prestige gameplay variants independent of printing finish |
| Pokémon Tool | persistent creature attachment with lifecycle/removal rules |
| Stadium | one persistent shared field card replaced by another or explicitly discarded — already analogous to Realm |
| Supporter | powerful action-card subtype with per-turn play limit |
| Technical Machine | attachment/card that grants an attack temporarily or while attached |
| Crystal / dynamic-type concepts | temporary or conditional element/type change |
| Pokémon-ex / EX / ex | high-power creature class with reward-value override |
| Delta Species | alternate element/type while preserving evolution/name identity and support tags |
| Holon's Pokémon | modal card identity that can be played as a different functional card type/resource |
| Pokémon LV.X | overlay upgrade that inherits lower-form attacks/abilities/properties |
| Pokémon SP / team/faction cards | stage override + faction/rule tags + tag-targeted support |
| Pokémon LEGEND | multi-card creature assembled and played as one object |
| Pokémon Prime | prestige/power styling with no mandatory separate rules engine |
| Mega evolution / Primal Reversion | special evolution parent + optional evolution-end-turn timing |
| Ancient Traits | persistent non-Ability trait/rule text distinct from normal Ability suppression |
| BREAK | overlay upgrade with inherited lower-card attacks/abilities/retreat/affinity properties |
| Pokémon-GX | reward override + shared once-per-match special action receipt |
| TAG TEAM | bonded/multi-being identity, higher reward value, conditional extra-cost bonus |
| Prism Star | singleton/name limit + alternate zone replacement instead of Discard |
| Ultra Beast | rule tag that attacks/abilities/support cards can reference; state/reward-sensitive synergies |
| Pokémon V | high-risk class / reward override |
| VMAX | special evolution + three-reward risk |
| VSTAR | evolution + shared once-per-match Attack/Ability receipt |
| V-UNION | multi-component assembly from a zone into one in-play creature |
| Radiant | mutually exclusive shared deck-group singleton |
| Amazing Rare | collectability/printing treatment without requiring a gameplay engine |
| Single Strike / Rapid Strike / Fusion Strike | strategy/archetype rule tags shared across creatures/support/resources |
| Tera | alternate form/element + optional position-based protection |
| Ancient / Future | cross-card strategy tags carried by creatures and support cards |
| ACE SPEC | one card total from a shared powerful support-card group |
| current Mega Evolution ex | high-stakes special evolution with higher reward value independent from old evolve-end-turn rule |
| alternate art / full art / shiny treatments | multiple cosmetic printings under one gameplay identity |

### Stream Bandit working names already locked

External labels remain research-only. Current working Stream Bandit presentation names are maintained in `tcg-special-mechanic-names-v1.json`, including Ascendant Creature, Sigilborn Creature, Bonded Sigilborn, Exalted Creature, Colossus Creature, Starforged Creature, Convergence Creature, Gleam Creature, Prime Card, Riftmarked Card, Overform, Ascension Form, Aspect Creature, Apex Ascendant, Ascension Evolution and Signature Power.

---

## 3. Generic mechanic families — design library

The machine-readable authority is `tcg-generic-mechanic-capabilities-v1.json`. This section is the human index.

### A. Timing / trigger

Capabilities must support effects that occur:

- when played;
- when evolved;
- when moved to Vanguard/Reserve;
- when leaving play;
- at start/end of turn;
- at turn switch/checkup;
- before/after an attack;
- before/after damage;
- after healing;
- after Essence attachment/discard;
- after card movement between zones;
- after defeat;
- after a Reward is taken/revealed;
- when a Realm enters/leaves/replaces;
- once per turn / once per card / once per name / once per controller / once per match;
- on a cooldown or only if unused since a specified event.

### B. Costs / payment

Reusable costs include:

- Essence payment;
- discard card from hand;
- discard attached Essence;
- self-damage / place self-counters;
- sacrifice/defeat own Creature;
- return own card to hand/deck;
- reveal a card/tag;
- exhaust/mark Ability as used;
- extra optional payment that unlocks a bonus effect;
- alternative costs / cost reduction / cost increase;
- Withdraw Cost modification.

### C. Card flow / hidden information

- draw;
- search Deck/Discard/Hand/Rewards by type/tag/property;
- reveal cards/hand/top cards/Rewards;
- reorder top/bottom of Deck;
- shuffle;
- mill/discard from Deck;
- discard from Hand;
- recover to Hand;
- return to Deck;
- put on top/bottom of Deck;
- private choose-one / choose-N;
- opponent chooses from a legal set;
- preserve hidden information and viewer-specific visibility.

### D. Zones / movement

- Deck ↔ Hand;
- Deck/Hand/Discard ↔ Battlefield;
- Battlefield ↔ Hand/Deck/Discard;
- Discard ↔ Hand/Deck/Battlefield;
- Reward ↔ Hand/other legal destination;
- normal Discard replacement with Void/other special zone;
- zone replacement rules;
- move attached cards with parent or split them according to explicit rule;
- atomic multi-card movement.

### E. Damage / HP / healing / shield

- deal fixed damage;
- damage multiple targets;
- Reserve splash damage;
- self-damage;
- damage scaling by Essence/Reserve/Rewards/damage/Conditions/cards in zone/tags/coin results;
- damage caps/floors;
- direct defeat/knockout effect;
- prevent/reduce damage;
- ignore prevention/Shield/Vulnerability/Resistance when explicitly stated;
- global matchup Vulnerability;
- exceptional Resistance/affinity override;
- heal fixed/all damage;
- move/redistribute damage;
- place/move damage counters in 10-point units;
- Shield gain/loss/consumption;
- damage redirection/substitution.

### F. Conditions / status

- inflict one or multiple Conditions;
- cleanse/remove Conditions;
- Condition immunity;
- effects that scale while Conditioned;
- effects that work despite a Condition;
- turn-transition Condition ticks;
- prevent attacking / prevent Withdraw / lock specific action;
- timed Conditions / duration counters;
- state replacement or transformation.

### G. Creature position / switching

- voluntary Withdraw;
- forced switch opponent/self;
- choose replacement;
- switch both players;
- move Vanguard to Reserve / Reserve to Vanguard atomically;
- position-specific protection/effects;
- Reserve size modification;
- cannot-switch/cannot-withdraw state;
- movement-trigger listeners.

### H. Essence / resource manipulation

- attach normal Essence;
- attach extra Essence by effect;
- attach from Deck/Discard/Hand;
- move Essence between Creatures;
- discard opponent/self Essence;
- return Essence to Deck/Hand;
- recover Essence;
- Special Essence with additional rule text;
- multi-element/wild Essence;
- resource-type conversion;
- card that may be played as Essence instead of its ordinary identity.

### I. Evolution / form / assembly

- ordinary Baby → Teen → Adult evolution;
- Standalone/Mythic/special stages;
- special parent requirement;
- evolve during normally forbidden timing when explicitly allowed;
- devolution;
- overlay upgrade retaining damage/attachments/history;
- inherit attacks/Abilities/other properties;
- selective property override;
- alternate form/element while preserving identity/evolution lineage;
- multi-component assembly into one Creature;
- component semantics when outside play;
- no-evolution flag;
- special evolution that ends the turn.

### J. Attacks / abilities / traits

- active Ability;
- passive/continuous Ability;
- triggered Ability;
- Ability suppression/negation;
- Ability cost still paid/use receipt still spent when blocked where rule says so;
- copy an Attack;
- grant a temporary/permanent Attack;
- disable a named/selected Attack;
- cannot Attack next turn;
- attack while normally prevented by a Condition when explicit;
- attack cooldown;
- attack with no ordinary damage but effect-only resolution;
- persistent Trait distinct from Ability;
- shared once-per-match Signature Power.

### K. Rewards / match state

- normal Reward value;
- 2/3+ Reward override;
- take extra/fewer Rewards;
- reveal/manipulate Reward cards;
- scale effect by Rewards remaining/taken;
- alternate victory/defeat condition;
- direct defeat effect;
- extra turn;
- immediate end-turn effect;
- first-turn exceptions;
- once-per-match controller receipt.

### L. Deck construction / card classification

- per-name copy limit;
- one-per-deck identity;
- one-per-deck shared group;
- rule tags / `counts_as` tags;
- faction/strategy tags;
- owner/trainer/character tags;
- class-targeted support/protection;
- stage override;
- modal card type;
- special card family marker;
- data-driven format legality;
- Evergreen age eligibility independent of curated event formats.

### M. Tactic / Relic / Realm / support-card rules

- normal one-shot Tactic;
- powerful Tactic subtype with per-turn limit;
- Tactic playable only under a condition (empty hand, state threshold, etc.);
- Tactic returns to hand instead of Discard;
- Relic attachment;
- Relic replacement/removal;
- multiple Relics when explicit rule permits;
- Relic that grants an Attack;
- temporary attack-granting Relic that expires at turn end;
- Realm persistent field rule;
- Realm replacement;
- Realm discard/removal by effect;
- Realm-dependent card bonus.

### N. Random / choice

- coin flip / random binary result;
- multiple random trials;
- random legal target/card;
- player choice;
- opponent choice;
- simultaneous/secret choice when future rules require it;
- deterministic seeded randomness for test/replay safety.

### O. Printing / collection / product

- one gameplay identity → multiple printings;
- Standard/Shine/Holo/Full-Art/Alt-Art/Signature finishes;
- rarity independent of gameplay power;
- set/series membership;
- booster slot/odds recipes;
- starter/constructed deck recipes;
- collectible coins/deck boxes/sleeves as collection/cosmetic data;
- printing ownership persists even if competitive restrictions change.

---

## 4. Effect-category coverage from historical cards

The current harvest explicitly covers the broad effect categories surfaced by the historical card catalogue, including:

- attach resources;
- change attack/withdraw costs;
- reorder deck;
- discard resources/cards/tools/realms;
- draw;
- evolve/devolve;
- finish turn;
- finish game;
- heal damage/Conditions;
- inflict Conditions;
- Void/Lost-style zone interaction;
- move cards between Deck/Hand/Discard/Battlefield;
- move damage counters;
- force/switch battlefield positions;
- prevent Withdraw;
- reveal hands/Rewards;
- attack while Conditioned;
- multiple attachments;
- type/element change;
- copy attacks;
- Reserve splash damage;
- self-damage;
- state-scaled damage;
- ignore affinity modifiers;
- extra turns;
- direct defeat;
- prevention;
- draw denial;
- attack lock;
- self-defeating Ability;
- unusual first-turn play exceptions;
- conditional Tactic/support play;
- support cards that return to hand.

This coverage is a **mechanic vocabulary baseline**, not a claim that every historical card text has been manually read yet.

---

## 5. Future card-design rule

When designing a future Stream Bandit card:

1. choose existing capability IDs from `tcg-generic-mechanic-capabilities-v1.json`;
2. declare parameters, timing, targets, costs and zone destinations;
3. map capability IDs to current 40 owners/effect opcodes;
4. if runtime coverage is absent, add one **generic** schema/dispatcher implementation for the capability;
5. never add a card-name branch merely because one card uses a new combination;
6. add a new capability ID only if the effect cannot honestly be composed from existing capabilities;
7. preserve backward compatibility so old cards remain valid data.

Example future card recipe:

`trigger.turn_start + search.deck + attach.essence + condition.apply + limit.once_per_turn`

That should be one data recipe composed from generic capabilities, not five card-specific helpers.

---

## 6. Research queue / progress

### Completed baseline research

- ✅ all 174 English set names/eras indexed through Pokector as coverage source;
- ✅ major historical special-card mechanic families harvested;
- ✅ 54 broad card-effect categories harvested into generic families;
- ✅ active/passive/triggered Ability heritage harvested;
- ✅ card-type heritage: attachment, persistent field, powerful per-turn support, granted attacks, Special Essence analogues;
- ✅ high-risk Reward classes / singleton / assembly / inheritance / form / tag mechanics harvested;
- ✅ original Stream Bandit working names separated from research provenance.

### Ongoing deep harvest

- 🔎 individual card-text scan by era/set for genuinely new effect combinations;
- 🔎 map every harvested capability against current Stream Bandit owner/opcode support;
- 🔎 identify minimal generic schema/dispatcher gaps;
- 🔎 add new capability IDs only when a historical/new card proves a genuinely distinct reusable rule primitive.

### Completion definition

The mechanic harvest is not considered runtime-complete until V2-G1E proves:

- every capability ID has a canonical parameter schema;
- every capability maps to existing owners/opcodes or one justified generic extension;
- deterministic tests cover timing/zone/payment semantics;
- a sample future series can be added without card-name or series-name runtime branching.
