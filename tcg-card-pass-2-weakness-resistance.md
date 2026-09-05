# Stream Bandit TCG — Card Pass 2 — Weakness / Resistance Matrix

**Status:** Card Pass 2 design authority only. No production card registry, starter deck, migration, engine or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

## Authority boundary

The current-rules design decisions for all 193 Set One identities remain owned by the completed element audit ledgers plus `tcg-card-pass-2-founder.md`. This file adds the explicit **weakness/resistance layer for all 89 Set One creatures** and does not change their names, HP, attacks, Abilities, Starbound decisions, starter counts or other previously audited text.

Fresh Supabase inventory confirms the Set One creature population is:

- **88 elemental creatures** = 11 creatures × 8 current SB1 elements
- **1 Prismatic Founder**
- **89 creatures total**

This corrects an earlier working-note slip that described the pool as 89 elemental creatures plus Founder. The authoritative database count is 88 + 1 = 89.

---

# CP2-02 — global weakness / resistance rule

Weakness and resistance are **per-creature metadata**, not a universal element wheel.

## Standard Set One magnitude

For the Card Pass 2 structured baseline:

- **Weakness:** attacks from the listed attacking-creature element deal **+20 attack damage** to this creature.
- **Resistance:** attacks from the listed attacking-creature element deal **−20 attack damage** to this creature.
- `None` is a valid weakness or resistance value.
- A creature has at most one weakness and at most one resistance in Set One.

These are intentionally modest fixed modifiers rather than damage doubling/halving. The purpose is to create matchup texture without making a starter pairing an automatic win or loss.

## Damage scope

Weakness/resistance modifies **opposing attack damage only**.

It does **not** change:

- Scorched or Venomed Aftermath damage;
- Mindbound/Dazed self-damage;
- recoil/self-damage;
- direct damage placed by an Ability, Device, Relic, Realm or other effect;
- healing;
- Shield amounts;
- Reward values.

## Deterministic ordering

For Card Pass 2 structure, attack damage ordering is:

1. establish the attack's printed/base damage;
2. apply attacker-side conditional bonuses/reductions;
3. apply this creature's **Weakness +20** or **Resistance −20** from the attacking creature's element;
4. apply defender-side attack-damage prevention/reduction from Abilities, Essence, Relics, Realms and temporary effects;
5. apply Shield;
6. place remaining attack damage;
7. continue post-damage effects, defeat scan, Rewards and win checks.

Attack damage cannot fall below 0.

## Attacking element source

Unless a future structured attack explicitly overrides its damage element, an attack uses the **attacking creature's printed element** for weakness/resistance.

Therefore:

- normal Astral creature attacks count as Astral;
- normal Tide creature attacks count as Tide;
- **Stream Bandit — Prismatic Founder attacks count as Prismatic**, even when different Essence colours pay the cost;
- no Set One creature currently has Prismatic as its weakness or resistance, so the Founder does not automatically exploit multiple elemental weaknesses through Total Convergence.

A future expansion may introduce an explicit structured `damage_element_override`, but Set One does not need one.

---

# Design safeguards used for the matrix

1. **No fixed wheel.** Element identity influenced decisions, but each creature/family was evaluated separately.
2. **Evolution coherence.** The two evolution families inside an element normally keep the same weakness across Baby → Teen → Adult so the creature identity remains legible.
3. **Resistance is earned.** Babies deliberately have no resistance in Set One; resistance commonly appears as a family matures or on a Standalone whose biology/design justifies it.
4. **Prestige does not grant free defence.** All eight elemental Mythics plus Prismatic Founder have **no resistance** in this initial matrix. Their HP, Abilities, Starbound access and Reward value already provide prestige power.
5. **No double-punishment requirement.** A matchup can contain weakness without the opposing element automatically receiving resistance in return.
6. **Defensive ecosystems matter.** Stone/Tide/Grove durability, Gale movement, Shade control, Volt tempo, Ember aggression and Astral information power were considered before adding matchup modifiers.
7. **Pack-only cards are included.** They are still Set One creatures and need deterministic metadata even though they are absent from the starter recipes.
8. **Testing can tune the global ±20 magnitude later**, but Card Pass 2 must not silently change individual creature assignments without a new reviewed balance decision.

---

# ASTRAL — 11 creatures

Astral splits its vulnerabilities between **Shade** (hidden/mind interference against foresight and starlight) and **Volt** (energetic interference against light, orbit and aerial cosmic bodies), with one heavy shell exception vulnerable to Tide. Selected mature/evasive Astral creatures resist Gale; the Mythic receives no resistance.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `astral-stardot` | Stardot | Shade | None |
| `astral-orbitail` | Orbitail | Shade | Gale |
| `astral-cosmarch` | Cosmarch | Shade | Gale |
| `astral-moonbit` | Moonbit | Volt | None |
| `astral-comettail` | Comettail | Volt | Gale |
| `astral-nebulynx` | Nebulynx | Volt | Shade |
| `astral-cometmanta` | Cometmanta | Volt | Gale |
| `astral-orbitortoise` | Orbitortoise | Tide | Stone |
| `astral-prismowl` | Prismowl | Shade | Gale |
| `astral-starwhale` | Starwhale | Volt | Tide |
| `astral-celestyr-dream-cartographer` | Celestyr — Dream Cartographer | Shade | None |

**Family coherence**

- Stardot → Orbitail → Cosmarch: **Shade weakness**, resistance develops into Gale.
- Moonbit → Comettail → Nebulynx: **Volt weakness**, mature forms gain selective resistance rather than copying the first family.

---

# EMBER — 11 creatures

Ember is commonly vulnerable to Tide but not universally. The airborne Coalfinch family is instead vulnerable to Stone, Magmagecko is vulnerable to Stone, and pack-only Cinderburrow is vulnerable to Grove because its burrow-based body can be bound/collapsed by aggressive growth. Resistance is distributed across Shade, Grove, Gale and Stone rather than giving Ember a blanket anti-Grove rule.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `ember-glowcub` | Glowcub | Tide | None |
| `ember-bristleflare` | Bristleflare | Tide | Shade |
| `ember-furnacefang` | Furnacefang | Tide | Shade |
| `ember-coalfinch` | Coalfinch | Stone | None |
| `ember-sootwing` | Sootwing | Stone | Grove |
| `ember-cindercrest` | Cindercrest | Stone | Gale |
| `ember-ashcobra` | Ashcobra | Tide | Shade |
| `ember-kilnback` | Kilnback | Tide | Stone |
| `ember-magmagecko` | Magmagecko | Stone | Shade |
| `ember-cinderburrow` | Cinderburrow | Grove | Stone |
| `ember-pyrohorn-ash-crown` | Pyrohorn — Ash Crown | Tide | None |

**Family coherence**

- Glowcub → Bristleflare → Furnacefang: **Tide weakness**; mature heat predators resist Shade.
- Coalfinch → Sootwing → Cindercrest: **Stone weakness**; the flying-fire family develops matchup-specific resistances rather than sharing the first family's defence.

---

# GALE — 11 creatures

Gale's two families deliberately split between **Volt** and **Stone** weakness. Airborne/light creatures are vulnerable to electrical pressure; lower/faster winged bodies are vulnerable to grounding/rock pressure. Mature movement specialists often resist Grove because Rooted-style board plans are easier for them to evade, but not every Gale card gets that protection.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `gale-driftlet` | Driftlet | Volt | None |
| `gale-skyweaver` | Skyweaver | Volt | Grove |
| `gale-tempestalon` | Tempestalon | Volt | Grove |
| `gale-whiffin` | Whiffin | Stone | None |
| `gale-slipwing` | Slipwing | Stone | Grove |
| `gale-skyrend` | Skyrend | Stone | Grove |
| `gale-cloudray` | Cloudray | Volt | Tide |
| `gale-gustfox` | Gustfox | Stone | Grove |
| `gale-pinionserpent` | Pinionserpent | Volt | None |
| `gale-zephyrhare` | Zephyrhare | Stone | Grove |
| `gale-aeralith-storm-shepherd` | Aeralith — Storm Shepherd | Volt | None |

**Family coherence**

- Driftlet → Skyweaver → Tempestalon: **Volt weakness**, mature forms resist Grove.
- Whiffin → Slipwing → Skyrend: **Stone weakness**, mature forms resist Grove.

---

# GROVE — 11 creatures

Grove is not assigned one universal fire weakness. The sturdy growth family and most woody/leafy Standalones are vulnerable to Ember, while the spore/fungal family and Bloomhare are vulnerable to Gale because strong airflow disrupts spores, caps and delicate growth. Mature Grove bodies often resist Tide because water supports rather than suppresses their growth engine.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `grove-budburrow` | Budburrow | Ember | None |
| `grove-briarback` | Briarback | Ember | Tide |
| `grove-verdantusk` | Verdantusk | Ember | Tide |
| `grove-sporeling` | Sporeling | Gale | None |
| `grove-capscout` | Capscout | Gale | Tide |
| `grove-myceliarch` | Myceliarch | Gale | Tide |
| `grove-thornmantis` | Thornmantis | Ember | Tide |
| `grove-mossram` | Mossram | Ember | Stone |
| `grove-vinecoil` | Vinecoil | Ember | Tide |
| `grove-bloomhare` | Bloomhare | Gale | None |
| `grove-elderbloom-first-canopy` | Elderbloom — First Canopy | Ember | None |

**Family coherence**

- Budburrow → Briarback → Verdantusk: **Ember weakness**, mature forms resist Tide.
- Sporeling → Capscout → Myceliarch: **Gale weakness**, mature forms resist Tide.

---

# SHADE — 11 creatures

Shade deliberately avoids a blanket defensive advantage because Mindbound, Dazed, Silenced and hidden-information control are already strong. Its two main weaknesses are **Astral** (prediction/revelation against concealment) and **Ember** (heat/light against shadowy bodies). Selected mobile Shade creatures resist Gale or Grove, while Umbravale receives no resistance.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `shade-gloamkin` | Gloamkin | Astral | None |
| `shade-duskstalker` | Duskstalker | Astral | Gale |
| `shade-noctivane` | Noctivane | Astral | Gale |
| `shade-murkmite` | Murkmite | Ember | None |
| `shade-veiljaw` | Veiljaw | Ember | Grove |
| `shade-hollowcrown` | Hollowcrown | Ember | Grove |
| `shade-wispbat` | Wispbat | Astral | Gale |
| `shade-umbraspider` | Umbraspider | Ember | Grove |
| `shade-nightmaw` | Nightmaw | Astral | None |
| `shade-graveglider` | Graveglider | Ember | Gale |
| `shade-umbravale-thought-hunter` | Umbravale — Thought Hunter | Astral | None |

**Family coherence**

- Gloamkin → Duskstalker → Noctivane: **Astral weakness**, mature forms resist Gale.
- Murkmite → Veiljaw → Hollowcrown: **Ember weakness**, mature forms resist Grove.

---

# STONE — 11 creatures

Stone's vulnerabilities are intentionally split between **Tide erosion**, **Grove root/growth pressure**, and one Volt-sensitive crystalline body. This prevents Tide from simply being the weakness of every Stone creature. Mature armour bodies commonly resist Ember attack damage, while the extremely durable Crowncrag receives no resistance.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `stone-gravibble` | Gravibble | Tide | None |
| `stone-cragroller` | Cragroller | Tide | Ember |
| `stone-monolithorn` | Monolithorn | Tide | Ember |
| `stone-flintkin` | Flintkin | Grove | None |
| `stone-rampartusk` | Rampartusk | Grove | Ember |
| `stone-citadelhorn` | Citadelhorn | Grove | Ember |
| `stone-shalejaw` | Shalejaw | Tide | Ember |
| `stone-boulderbug` | Boulderbug | Grove | Ember |
| `stone-quartzram` | Quartzram | Volt | Astral |
| `stone-obsidianox` | Obsidianox | Tide | Ember |
| `stone-crowncrag-mountain-warden` | Crowncrag — Mountain Warden | Grove | None |

**Family coherence**

- Gravibble → Cragroller → Monolithorn: **Tide weakness**, mature forms resist Ember.
- Flintkin → Rampartusk → Citadelhorn: **Grove weakness**, mature forms resist Ember.

---

# TIDE — 11 creatures

Tide remains the highest-ceiling fully developed elemental package, so this matrix deliberately gives opponents real interaction. The living-current family is vulnerable to Volt, the shell/reef family is vulnerable to Grove, and the Standalones split across Grove, Gale and Volt. Tide therefore has no blanket immunity despite its healing, Shield and Essence-movement strengths.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `tide-puddlepip` | Puddlepip | Volt | None |
| `tide-rillrunner` | Rillrunner | Volt | Ember |
| `tide-tideroar` | Tideroar | Volt | Ember |
| `tide-shellip` | Shellip | Grove | None |
| `tide-reefback` | Reefback | Grove | Ember |
| `tide-abyssalume` | Abyssalume | Grove | Ember |
| `tide-reefshell` | Reefshell | Grove | Ember |
| `tide-mistmarten` | Mistmarten | Gale | Ember |
| `tide-surgefin` | Surgefin | Volt | None |
| `tide-lanternsquid` | Lanternsquid | Grove | Shade |
| `tide-marevault-heart-of-tides` | Marevault — Heart of Tides | Volt | None |

**Family coherence**

- Puddlepip → Rillrunner → Tideroar: **Volt weakness**, mature forms resist Ember.
- Shellip → Reefback → Abyssalume: **Grove weakness**, mature forms resist Ember.

**Balance consequence:** Tide's raw late-game power is preserved, but Volt/Grove pressure can attack the setup before Marevault/Tideroar/Abyssalume fully take over a match.

---

# VOLT — 11 creatures

Volt's two families split cleanly between **Stone grounding** and **Tide short-circuit/overload pressure**. Mature electrical bodies often resist Gale because their storm/circuit identity dominates ordinary airflow, but Stormcoil receives no resistance to offset its Mythic/Starbound tempo ceiling.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `volt-staticub` | Staticub | Stone | None |
| `volt-arcprowler` | Arcprowler | Stone | Gale |
| `volt-stormmane` | Stormmane | Stone | Gale |
| `volt-tinkit` | Tinkit | Tide | None |
| `volt-coilclank` | Coilclank | Tide | Gale |
| `volt-dynamozer` | Dynamozer | Tide | Gale |
| `volt-boltfang` | Boltfang | Stone | Gale |
| `volt-sparkmoth` | Sparkmoth | Tide | None |
| `volt-railhorn` | Railhorn | Stone | None |
| `volt-copperkite` | Copperkite | Tide | Gale |
| `volt-stormcoil-living-circuit` | Stormcoil — Living Circuit | Stone | None |

**Family coherence**

- Staticub → Arcprowler → Stormmane: **Stone weakness**, mature forms resist Gale.
- Tinkit → Coilclank → Dynamozer: **Tide weakness**, mature forms resist Gale.

---

# PRISMATIC — 1 creature

Founder is intentionally not neutral-by-default. Its 360 HP, two-Reward Mythic status, extra Basic-Essence acceleration and Starbound ceiling justify a real vulnerability. It receives **no resistance**.

| Card ID | Creature | Weakness | Resistance |
|---|---|---|---|
| `prismatic-stream-bandit-prismatic-founder` | Stream Bandit — Prismatic Founder | Shade | None |

**Reason:** Shade's disruption/information-control identity is a meaningful counter to the Founder's need to assemble and protect a multi-element plan, without making one of the eight starter elements a universal hard counter to Prismatic decks.

---

# Matrix-level balance review

## Mythic / Starbound safeguard

The following prestige creatures all have **Resistance: None** in the initial Set One matrix:

- Celestyr — Dream Cartographer
- Pyrohorn — Ash Crown
- Aeralith — Storm Shepherd
- Elderbloom — First Canopy
- Umbravale — Thought Hunter
- Crowncrag — Mountain Warden
- Marevault — Heart of Tides
- Stormcoil — Living Circuit
- Stream Bandit — Prismatic Founder

This is deliberate. Their existing power budget comes from HP, Abilities, attacks, Starbound access and two-Reward risk; resistance is not an additional prestige reward.

## Baby safeguard

All 16 elemental Babies have **Resistance: None**. Their evolution families may gain resistance at Teen/Adult. This keeps early-game matchup modifiers readable and prevents a low-HP opener from receiving hidden defensive compression before it evolves.

## No automatic starter hard counter

No starter deck has all 14 of its legal opening creature copies sharing one weakness:

- each starter contains two differently assigned evolution families and multiple Standalones;
- the standard modifier is only ±20 attack damage;
- conditions, Shield, healing, movement and attack costs remain separate strategic axes;
- pack-only cards do not distort starter-opening math.

The deterministic AI Test Match must still measure actual matchup win rates before final live promotion.

## Tide power safeguard

Tide remains intentionally the strongest fully developed elemental board, but its matrix is not privileged:

- its living-current family is weak to Volt;
- its shell/reef family is weak to Grove;
- Mistmarten is weak to Gale;
- Marevault is weak to Volt and has no resistance.

If Tide later proves overpowered, tune setup speed/healing/movement consistency before deleting its identity-defining late-game payoff unless testing shows the payoff itself is the root cause.

---

# Card Pass 2 completion state

**CP2-02 weakness/resistance assignment: COMPLETE FOR 89 / 89 SET ONE CREATURES.**

This file freezes the **design matrix**, not production data. `tcg_card_definitions` still contains the old prototype definitions and currently has no authoritative structured weakness/resistance fields.

No database write, migration, engine patch, starter recipe change or live deployment is authorized by this matrix commit.

---

# Next bounded Card Pass 2 stage

## CP2-03 — shared deterministic card schema freeze

Define one structured grammar that can represent every accepted Set One design without card-name special cases or printed-English parsing.

At minimum the schema must cover:

1. creature identity, stage, evolution, HP, withdrawal, traits and Reward value;
2. explicit weakness and resistance metadata using this 89-creature matrix;
3. ordinary Abilities and attacks;
4. Starbound Ability/Power metadata and the one shared player marker;
5. typed/any Essence costs and attached-Essence predicates;
6. temporary/borrowed Essence lifecycle;
7. Shield, healing and incoming attack-damage modifiers;
8. all condition slots, application, replacement, prevention and recovery;
9. switching, voluntary withdrawal and movement-generated flags;
10. hidden/public deck, hand and Reward searches/looks;
11. optional `0..N` choices and deterministic pending-choice state;
12. Relic/Realm/Device/Ally lifecycle and listeners;
13. turn/match counters, first-per-turn and once-per-match markers;
14. defeat/Reward/win sequencing;
15. dynamic damage formulas such as Prismatic Total Convergence;
16. explicit attack damage element with the attacking creature element as default;
17. deterministic seeded randomness interfaces needed by the future AI Test Deck Battle.

Only after CP2-03 is frozen should the 193 corrected identities be converted into structured registry-ready definitions.