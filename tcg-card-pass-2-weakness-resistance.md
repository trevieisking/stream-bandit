# Stream Bandit TCG — Card Pass 2 — Weakness / Resistance Matrix

**Status:** Card Pass 2 design authority only. No production card registry, starter deck, migration, engine or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

## Authority boundary

The current-rules design decisions for all 193 Set One identities remain owned by the completed element audit ledgers plus `tcg-card-pass-2-founder.md`. This file adds the explicit **weakness/resistance layer for all 89 Set One creatures** and does not change their names, HP, attacks, Abilities, Starbound decisions, starter counts or other previously audited text.

Fresh Supabase inventory confirms the Set One creature population is:

- **88 elemental creatures** = 11 creatures × 8 current SB1 elements
- **1 Prismatic Founder**
- **89 creatures total**

This file supersedes the rejected first CP2-02 draft that incorrectly treated resistance as a routine counterpart to weakness and used fixed ±20 matchup modifiers.

---

# CP2-02 — corrected global weakness / resistance rule

## 1. Weakness is one-way

A creature's weakness says only that **attacks from the listed attacking-creature element exploit that creature's weakness**.

It does **not** say anything about the reverse matchup.

Example principle:

- if Creature B is weak to Element A, an Element A attack exploits B's weakness;
- Creature A does **not** automatically resist Element B;
- Element B does **not** automatically become weak to Element A's defensive identity;
- strengths and weaknesses are therefore directional rather than paired opposites.

This rule is deliberately closer to a card-game type chart than to a symmetric rock-paper-scissors wheel.

## 2. Set One weakness multiplier

When an opposing attack hits a creature whose listed weakness matches the attacking creature's attack element:

**that attack's damage is doubled (×2).**

Weakness modifies attack damage only. It does not double:

- Scorched or Venomed Aftermath damage;
- Mindbound/Dazed self-damage;
- recoil/self-damage;
- direct damage placed by an Ability, Device, Relic, Realm or other effect;
- healing;
- Shield amounts;
- Reward values.

`None` remains a legal weakness value for future cards, even though the initial SB1 matrix below gives each current creature one explicit weakness for deterministic testing.

## 3. Resistance is a rare independent property

**Resistance is not the reverse of weakness and is not inferred from element strength.**

Resistance is reserved for a deliberately designed exceptional card/form whose identity justifies it, such as a future:

- dual-element / dual-type-like creature;
- Prismatic/Tera-like special form;
- unusually resistant armour/form;
- prestige card explicitly designed with a resistance;
- other rare card-specific exception.

A resistance, when a future card has one, must be structured explicitly as its own metadata, including its reduction amount. There is **no global automatic resistance amount**.

### SB1 resistance decision

For the current Set One Card Pass 2 baseline:

**all 89 current SB1 creatures have Resistance: None.**

This is intentional. No Set One creature receives resistance merely because its element is strong against another element. A later reviewed card-design decision may add a rare resistance to a specific card, but no such exception is being invented during this matrix pass.

## 4. Deterministic attack-damage ordering

For Card Pass 2 structure, attack damage ordering is:

1. establish printed/base attack damage;
2. apply attacker-side conditional bonuses/reductions;
3. determine the attack's damage element;
4. if the defender is weak to that element, multiply the current attack damage by **2**;
5. if a future card has an explicit resistance matching that element, apply that card's explicit resistance reduction;
6. apply defender-side attack-damage prevention/reduction from Abilities, Essence, Relics, Realms and temporary effects;
7. apply Shield;
8. place remaining attack damage;
9. continue post-damage effects, defeat scan, Rewards and win checks.

Attack damage cannot fall below 0.

## 5. Attack element source

Unless a future structured attack explicitly overrides its damage element, an attack uses the **attacking creature's printed element** for weakness.

Therefore:

- an Astral creature normally deals Astral attack damage;
- a Tide creature normally deals Tide attack damage;
- **Stream Bandit — Prismatic Founder normally deals Prismatic attack damage**, even when different Essence colours pay the attack cost;
- paying an attack with a particular Essence colour does not change the attack's element by itself.

A future explicit `damage_element_override` may support special attacks, but SB1 does not need one for the current audited designs.

---

# Matrix safeguards

1. **No resistance wheel.** Weakness never creates an automatic reverse resistance.
2. **Per-creature weakness.** The listed weakness belongs to that creature identity, not to a universal rule that every card of its element must share.
3. **Evolution coherence where useful.** Evolution families generally preserve one weakness across Baby → Teen → Adult so deck knowledge remains learnable.
4. **Standalones can differ.** Standalone species may cover different weaknesses inside the same element.
5. **Mythic/Starbound creatures still have weaknesses.** Prestige does not remove normal counterplay.
6. **Pack-only creatures are included.** They remain part of the 89-card creature registry.
7. **Resistance remains null across SB1.** Any future resistance requires a separate explicit design decision.
8. **Double weakness is a major modifier.** Deterministic AI Test Match must measure whether any specific weakness assignment creates an unhealthy starter matchup before live promotion.
9. **No automatic reciprocal weakness either.** If two opposing families happen to be weak to each other's elements, that must be justified independently rather than generated from a rule.

---

# ASTRAL — 11 creatures

Astral vulnerabilities are deliberately split across multiple threats rather than giving every Astral creature one universal counter.

| Card ID | Creature | Weakness |
|---|---|---|
| `astral-stardot` | Stardot | Shade |
| `astral-orbitail` | Orbitail | Shade |
| `astral-cosmarch` | Cosmarch | Shade |
| `astral-moonbit` | Moonbit | Volt |
| `astral-comettail` | Comettail | Volt |
| `astral-nebulynx` | Nebulynx | Volt |
| `astral-cometmanta` | Cometmanta | Volt |
| `astral-orbitortoise` | Orbitortoise | Tide |
| `astral-prismowl` | Prismowl | Shade |
| `astral-starwhale` | Starwhale | Volt |
| `astral-celestyr-dream-cartographer` | Celestyr — Dream Cartographer | Shade |

**Resistance for every Astral creature above: None.**

---

# EMBER — 11 creatures

Ember is commonly vulnerable to Tide, while some flying/burrowing/hardened species have different creature-specific weaknesses.

| Card ID | Creature | Weakness |
|---|---|---|
| `ember-glowcub` | Glowcub | Tide |
| `ember-bristleflare` | Bristleflare | Tide |
| `ember-furnacefang` | Furnacefang | Tide |
| `ember-coalfinch` | Coalfinch | Stone |
| `ember-sootwing` | Sootwing | Stone |
| `ember-cindercrest` | Cindercrest | Stone |
| `ember-ashcobra` | Ashcobra | Tide |
| `ember-kilnback` | Kilnback | Tide |
| `ember-magmagecko` | Magmagecko | Stone |
| `ember-cinderburrow` | Cinderburrow | Grove |
| `ember-pyrohorn-ash-crown` | Pyrohorn — Ash Crown | Tide |

**Resistance for every Ember creature above: None.**

---

# GALE — 11 creatures

Gale's families split between electrical and grounding/rock vulnerabilities. This is a weakness decision only; Gale does not receive reverse resistance to Grove, Tide or any other element.

| Card ID | Creature | Weakness |
|---|---|---|
| `gale-driftlet` | Driftlet | Volt |
| `gale-skyweaver` | Skyweaver | Volt |
| `gale-tempestalon` | Tempestalon | Volt |
| `gale-whiffin` | Whiffin | Stone |
| `gale-slipwing` | Slipwing | Stone |
| `gale-skyrend` | Skyrend | Stone |
| `gale-cloudray` | Cloudray | Volt |
| `gale-gustfox` | Gustfox | Stone |
| `gale-pinionserpent` | Pinionserpent | Volt |
| `gale-zephyrhare` | Zephyrhare | Stone |
| `gale-aeralith-storm-shepherd` | Aeralith — Storm Shepherd | Volt |

**Resistance for every Gale creature above: None.**

---

# GROVE — 11 creatures

Grove is not given one universal fire weakness. Woody/leafy bodies often fear Ember, while spore/fungal/delicate growth can be vulnerable to Gale.

| Card ID | Creature | Weakness |
|---|---|---|
| `grove-budburrow` | Budburrow | Ember |
| `grove-briarback` | Briarback | Ember |
| `grove-verdantusk` | Verdantusk | Ember |
| `grove-sporeling` | Sporeling | Gale |
| `grove-capscout` | Capscout | Gale |
| `grove-myceliarch` | Myceliarch | Gale |
| `grove-thornmantis` | Thornmantis | Ember |
| `grove-mossram` | Mossram | Ember |
| `grove-vinecoil` | Vinecoil | Ember |
| `grove-bloomhare` | Bloomhare | Gale |
| `grove-elderbloom-first-canopy` | Elderbloom — First Canopy | Ember |

**Resistance for every Grove creature above: None.**

---

# SHADE — 11 creatures

Shade's control power does not grant defensive resistance. Individual Shade creatures are vulnerable primarily to Astral revelation/foresight pressure or Ember light/heat pressure.

| Card ID | Creature | Weakness |
|---|---|---|
| `shade-gloamkin` | Gloamkin | Astral |
| `shade-duskstalker` | Duskstalker | Astral |
| `shade-noctivane` | Noctivane | Astral |
| `shade-murkmite` | Murkmite | Ember |
| `shade-veiljaw` | Veiljaw | Ember |
| `shade-hollowcrown` | Hollowcrown | Ember |
| `shade-wispbat` | Wispbat | Astral |
| `shade-umbraspider` | Umbraspider | Ember |
| `shade-nightmaw` | Nightmaw | Astral |
| `shade-graveglider` | Graveglider | Ember |
| `shade-umbravale-thought-hunter` | Umbravale — Thought Hunter | Astral |

**Resistance for every Shade creature above: None.**

---

# STONE — 11 creatures

Stone's creature-specific weaknesses split across Tide erosion, Grove growth/root pressure and one Volt-sensitive crystalline body. Stone's armour and Shield identity already provide defence; it does not need an automatic resistance layer.

| Card ID | Creature | Weakness |
|---|---|---|
| `stone-gravibble` | Gravibble | Tide |
| `stone-cragroller` | Cragroller | Tide |
| `stone-monolithorn` | Monolithorn | Tide |
| `stone-flintkin` | Flintkin | Grove |
| `stone-rampartusk` | Rampartusk | Grove |
| `stone-citadelhorn` | Citadelhorn | Grove |
| `stone-shalejaw` | Shalejaw | Tide |
| `stone-boulderbug` | Boulderbug | Grove |
| `stone-quartzram` | Quartzram | Volt |
| `stone-obsidianox` | Obsidianox | Tide |
| `stone-crowncrag-mountain-warden` | Crowncrag — Mountain Warden | Grove |

**Resistance for every Stone creature above: None.**

---

# TIDE — 11 creatures

Tide keeps its intentionally high late-game ceiling, while its weaknesses provide one-way counterplay through Volt, Grove and selected Gale pressure. Tide does not automatically resist Ember just because water-like creatures can pressure fire-like creatures.

| Card ID | Creature | Weakness |
|---|---|---|
| `tide-puddlepip` | Puddlepip | Volt |
| `tide-rillrunner` | Rillrunner | Volt |
| `tide-tideroar` | Tideroar | Volt |
| `tide-shellip` | Shellip | Grove |
| `tide-reefback` | Reefback | Grove |
| `tide-abyssalume` | Abyssalume | Grove |
| `tide-reefshell` | Reefshell | Grove |
| `tide-mistmarten` | Mistmarten | Gale |
| `tide-surgefin` | Surgefin | Volt |
| `tide-lanternsquid` | Lanternsquid | Grove |
| `tide-marevault-heart-of-tides` | Marevault — Heart of Tides | Volt |

**Resistance for every Tide creature above: None.**

---

# VOLT — 11 creatures

Volt's current weaknesses split between Stone grounding and Tide overload/short-circuit pressure. This does not make Volt resistant to Gale or any other type in return.

| Card ID | Creature | Weakness |
|---|---|---|
| `volt-staticub` | Staticub | Stone |
| `volt-arcprowler` | Arcprowler | Stone |
| `volt-stormmane` | Stormmane | Stone |
| `volt-tinkit` | Tinkit | Tide |
| `volt-coilclank` | Coilclank | Tide |
| `volt-dynamozer` | Dynamozer | Tide |
| `volt-boltfang` | Boltfang | Stone |
| `volt-sparkmoth` | Sparkmoth | Tide |
| `volt-railhorn` | Railhorn | Stone |
| `volt-copperkite` | Copperkite | Tide |
| `volt-stormcoil-living-circuit` | Stormcoil — Living Circuit | Stone |

**Resistance for every Volt creature above: None.**

---

# PRISMATIC — 1 creature

Founder remains a powerful two-Reward multi-element build-around and therefore keeps a meaningful one-way weakness rather than receiving a free Prismatic resistance package.

| Card ID | Creature | Weakness |
|---|---|---|
| `prismatic-stream-bandit-prismatic-founder` | Stream Bandit — Prismatic Founder | Shade |

**Resistance: None.**

---

# Matrix-level consequences

## Weakness is deliberately dangerous

Because weakness is **×2 attack damage**, this is a much more meaningful matchup rule than the rejected +20 draft.

That means deterministic testing must specifically inspect:

- early one-hit/turn acceleration created by weakness;
- whether any starter's legal openers are too concentrated into one enemy element;
- evolved-creature survival thresholds;
- Mythic two-Reward risk under weakness;
- Tide's strong late game versus Volt/Grove weakness pressure;
- Volt's explosive tempo versus Stone/Tide weakness pressure;
- any reciprocal weaknesses that happen to exist for independent design reasons.

If a particular card becomes too fragile, the first question is whether **that creature's weakness assignment** is wrong, not whether the whole game should receive routine resistances to compensate.

## Resistance stays exceptional

SB1 intentionally starts with **0 / 89 creatures carrying resistance**.

This does not remove resistance from the game system. It keeps resistance available as a rare explicit future property instead of making it a hidden second type chart.

A future resistance entry must specify at least:

- the resistant attack element;
- the reduction amount;
- whether it modifies only normal attack damage;
- the card/form identity that grants it;
- any duration or activation condition if not permanent.

## No automatic strength-to-defence conversion

If Tide attacks exploit an Ember creature's weakness, that does not make Tide resistant to Ember.

If Volt attacks exploit a Gale or Tide creature's weakness, that does not make Volt resistant to those elements.

If Astral attacks exploit a Shade creature's weakness, that does not make Astral resistant to Shade.

This directional rule is now binding for Card Pass 2.

---

# Card Pass 2 completion state

**CP2-02 weakness assignment: COMPLETE FOR 89 / 89 SET ONE CREATURES.**

**CP2-02 resistance assignment: NONE FOR ALL 89 CURRENT SB1 CREATURES; MECHANIC RESERVED FOR RARE EXPLICIT FUTURE CARD DESIGNS.**

This file freezes design metadata only. `tcg_card_definitions` still contains prototype definitions and is not changed by this commit.

No database write, migration, engine patch, starter recipe change or live deployment is authorized by this matrix correction.

---

# Next bounded Card Pass 2 stage

## CP2-03 — shared deterministic card schema freeze

Define one structured grammar that can represent every accepted Set One design without card-name special cases or printed-English parsing.

At minimum the schema must cover:

1. creature identity, stage, evolution, HP, withdrawal, traits and Reward value;
2. explicit weakness metadata with **×2 attack damage** semantics;
3. optional rare resistance metadata that is `null` for all current SB1 creatures and carries its own explicit reduction amount when later used;
4. ordinary Abilities and attacks;
5. Starbound Ability/Power metadata and the one shared player marker;
6. typed/any Essence costs and attached-Essence predicates;
7. temporary/borrowed Essence lifecycle;
8. Shield, healing and incoming attack-damage modifiers;
9. all condition slots, application, replacement, prevention and recovery;
10. switching, voluntary withdrawal and movement-generated flags;
11. hidden/public deck, hand and Reward searches/looks;
12. optional `0..N` choices and deterministic pending-choice state;
13. Relic/Realm/Device/Ally lifecycle and listeners;
14. turn/match counters, first-per-turn and once-per-match markers;
15. defeat/Reward/win sequencing;
16. dynamic damage formulas such as Prismatic Total Convergence;
17. explicit attack damage element with the attacking creature element as default;
18. deterministic seeded randomness interfaces needed by the future AI Test Deck Battle.

Only after CP2-03 is frozen should the 193 corrected identities be converted into structured registry-ready definitions.