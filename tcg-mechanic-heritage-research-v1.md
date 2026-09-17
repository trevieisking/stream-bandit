# Stream Bandit TCG — Mechanic Heritage Research V1

**Date:** 2026-09-17  
**Purpose:** Research mechanic families from historical/current Pokémon TCG eras so Stream Bandit can support equivalent categories with original names, rules text, visuals and data structures.  
**Copyright/originality boundary:** this document records general game mechanics and rule patterns only. Do not copy Pokémon card names, attack/Ability text, card frames, art, branded terms, sound, animation or UI assets into Stream Bandit.

---

## 1. Why this research exists

The goal is not to make a fixed clone of one Pokémon era.

The goal is to make Stream Bandit extensible enough that future series can introduce the kinds of mechanical ideas seen across multiple major Pokémon TCG generations without requiring a new hard-coded engine for each named mechanic.

A future Stream Bandit series must be able to add:

- new Creatures;
- new attacks;
- new Abilities;
- new special Creature classes/forms;
- new Tactics, Relics, Realms and Essence;
- new series/sets;
- new starter decks;
- new booster packs;
- new rarity/printing treatments;
- new collectible coins/accessories;
- new tags/factions/traits;
- new rule combinations built from shared capability primitives.

---

## 2. Research findings by Pokémon mechanic family

### 2.1 Original Pokémon-ex / modern Pokémon ex

Observed rule family:

- high-powered Creature variant;
- gives the opponent 2 Prize cards when Knocked Out;
- modern ex can be Basic or evolve through ordinary stages;
- modern ex commonly combines ordinary attacks with active/passive Abilities;
- high power is balanced by higher knockout value.

Stream Bandit capability required:

- per-Creature `reward_value` override;
- special-class/rule tags independent of rarity;
- ordinary Basic/Baby/Teen/Adult evolution compatibility;
- ordinary Ability/Attack grammar remains usable on the special class;
- effects may target or exclude the special class generically.

Working Stream Bandit vocabulary:

- **Ascendant Creature** — high-stakes Creature normally worth 2 Rewards when defeated.

The exact player-facing series name may vary later, but the engine capability is generic.

### 2.2 Pokémon-EX (Black & White / XY)

Observed rule family:

- high-HP/high-damage special Creature;
- knockout gives 2 Prizes;
- EX is a distinct named form;
- many were Basic cards;
- multiple printings could represent the same gameplay identity.

Stream Bandit capability required:

- `reward_value:2`;
- special gameplay class separate from printing rarity;
- `counts_as` / `rule_tags` metadata;
- multiple printings mapped to one gameplay identity.

Stream Bandit maps this to the same **Ascendant** capability rather than a second engine.

### 2.3 Old Mega Evolution Pokémon-EX

Observed rule family:

- special evolution from a specific EX predecessor;
- still carries the EX two-Prize risk;
- playing/evolving into the Mega form ends the player's turn under the original Mega rule;
- ordinary evolution timing still matters.

Stream Bandit capability required:

- special evolution prerequisite by exact class/identity;
- optional `on_evolve_end_turn` rule;
- inherited/overridden reward value;
- reusable turn-lifecycle event after evolution;
- no per-card hard-coded Mega branches.

Working Stream Bandit vocabulary:

- **Ascension Evolution** — special evolution rule package that may optionally end the turn when played.

### 2.4 Pokémon-GX

Observed rule family:

- high-powered Creature normally worth 2 Prizes;
- one special GX attack per game across the entire player's game state;
- GX Pokémon otherwise use normal evolution stages;
- one-use marker/receipt prevents a second use.

Stream Bandit capability required:

- game-global once-per-match action receipt;
- once-per-match action may be an attack;
- shared limit applies across all eligible cards, not per-card instance;
- UI visibly shows whether the once-per-match resource has been spent;
- knockout Reward override independent of once-per-match power.

Working Stream Bandit vocabulary:

- **Signature Power** — one shared once-per-match special action.
- A Signature Power can be a **Signature Attack** or, for later families, a **Signature Ability**.

### 2.5 TAG TEAM Pokémon-GX

Observed rule family:

- paired/multiple characters represented by one Creature card;
- very high power/HP;
- knockout gives 3 Prizes;
- GX-style once-per-game special action remains;
- some special attacks gain an extra effect if an additional resource requirement is met.

Stream Bandit capability required:

- multi-character identity on one card;
- `reward_value:3`;
- shared once-per-match Signature Power;
- optional bonus effect unlocked by extra Essence/cost threshold;
- generic `extra_cost_bonus` step rather than card-name logic.

Working Stream Bandit vocabulary:

- **Bonded Creature** — two or more beings represented by one Creature identity.

### 2.6 Pokémon V

Observed rule family:

- powerful Basic Creature;
- 2-Prize knockout value;
- acts as the base for later VMAX/VSTAR branches.

Stream Bandit capability required:

- Basic/Baby special class with `reward_value:2`;
- branchable evolution parent;
- `counts_as` tag so descendants can still be targeted by effects that refer to the parent class.

Stream Bandit maps this to **Ascendant Creature** + lineage metadata.

### 2.7 Pokémon VMAX

Observed rule family:

- evolves specifically from Pokémon V;
- very large HP/attack profile;
- knockout gives 3 Prizes;
- still counts as Pokémon V for effects that care about Pokémon V.

Stream Bandit capability required:

- special descendant class with exact parent requirement;
- `reward_value:3`;
- `counts_as:[parent_special_class]` metadata;
- ordinary evolution timing and stack ownership;
- effect targeting by inherited rule tags.

Working Stream Bandit vocabulary:

- **Colossus Creature** — high-risk 3-Reward advanced form.

### 2.8 Pokémon VSTAR

Observed rule family:

- evolves specifically from Pokémon V;
- knockout gives 2 Prizes;
- carries one VSTAR Power that may be either an Ability or an attack;
- only one VSTAR Power may be used during the entire game;
- still counts as Pokémon V.

Stream Bandit capability required:

- descendant class with exact parent requirement;
- `reward_value:2`;
- shared once-per-match Signature Power may be attack **or Ability**;
- `counts_as` parent class;
- global spent marker/receipt.

Working Stream Bandit mapping:

- **Ascendant Creature + Signature Power**.

This proves the engine must compose capabilities rather than equating one player-facing label to one hard-coded engine.

### 2.9 Pokémon V-UNION

Observed rule family:

- four separate cards combine into one Creature;
- all parts must reach the discard pile before assembly;
- all four are played together into one Bench slot;
- same named V-UNION may only be assembled once per game;
- combined Creature can expose several attacks/Abilities;
- knockout gives 3 Prizes;
- pieces behave differently from the assembled object for card-property queries.

Stream Bandit capability required:

- multi-card assembly recipe;
- component identity + assembled identity;
- source-zone requirement;
- assembled object occupies one battlefield slot;
- once-per-match-per-assembled-identity receipt;
- assembled object can expose more than the normal two-slot Creature UI **only if a future explicit card-family rule authorises a different renderer**;
- ordinary V2 Creatures remain locked to two action slots.

Working Stream Bandit vocabulary:

- **Convergence Creature** — a special assembled Creature created from multiple component cards.

### 2.10 Radiant Pokémon / Pokémon Star style singleton Creature

Observed rule family:

- very powerful special Basic Creature;
- strict deck-building singleton restriction;
- distinct identity from the ordinary version;
- Radiant cards do not evolve into/from other cards.

Stream Bandit capability required:

- per-class or per-family singleton deck limit;
- identity distinction from ordinary Creature with similar lore/name;
- optional no-evolution flag;
- printing treatment independent from gameplay class.

Working Stream Bandit vocabulary:

- **Gleam Creature** — one-per-deck special Creature class.

### 2.11 ACE SPEC

Observed rule family:

- extremely strong Trainer/support card;
- only one ACE SPEC card total may be included in the deck, not one of each.

Stream Bandit capability required:

- shared deck-building group limit across multiple card identities/families;
- group limit independent from ordinary 4-copy identity rule.

Working Stream Bandit vocabulary:

- **Prime Card** — one card total from the Prime group per deck.

Prime may later include Tactic, Relic, Realm or Special Essence identities if design approves.

### 2.12 Prism Star

Observed rule family:

- powerful singleton by exact card name;
- multiple differently named Prism Star cards may coexist;
- if the card would go to discard, it goes to the Lost Zone instead.

Stream Bandit capability required:

- per-identity singleton deck limit;
- zone-replacement rule;
- unrecoverable/out-of-play zone owned by generic Card-Zone movement rather than card helpers.

Working Stream Bandit vocabulary:

- **Voidmarked Card**;
- **Void** as the provisional generic out-of-play zone name.

Player-facing name can be revised later; the capability is what matters.

### 2.13 Pokémon LV.X

Observed rule family:

- placed on top of the same Pokémon after normal timing requirements;
- keeps attached cards and damage;
- keeps earlier attacks/powers/bodies;
- removes Special Conditions/effects when level-up occurs;
- does not become a normal higher evolution stage.

Stream Bandit capability required:

- overlay upgrade on the same Creature identity/line;
- retain stack attachments/damage;
- inherit attacks/Abilities from a lower card;
- optionally cleanse conditions/effects when overlayed;
- preserve logical stage separately from displayed overlay form.

Working Stream Bandit vocabulary:

- **Overform** — an overlay upgrade that can inherit earlier actions/properties.

### 2.14 BREAK Evolution

Observed rule family:

- special Evolution stage;
- retains attacks, Abilities, Weakness, Resistance and Retreat Cost of previous evolution;
- can gain new attacks/Abilities, HP and even change type.

Stream Bandit capability required:

- action/property inheritance from lower stack card;
- selective override/merge of HP, element/type and action set;
- special evolution-stage metadata.

Stream Bandit maps this to the same generic **Overform** inheritance engine with configurable inherited fields.

### 2.15 Tera Pokémon ex

Observed rule family:

- Pokémon ex reward rule remains;
- Tera rule protects the card from attack damage while it is on the Bench;
- Tera cards may express alternate type/form identities.

Stream Bandit capability required:

- Reserve/Bench-position conditional prevention effect;
- alternate Aspect/type metadata;
- ordinary high-stakes Reward rules remain composable.

Working Stream Bandit vocabulary:

- **Aspect Creature** — alternate elemental/form state that may carry position-based protection.

### 2.16 Current Mega Evolution Pokémon ex

Observed rule family in the 2025+ Mega Evolution Series:

- modern Mega Evolution Pokémon ex can be Basic, Stage 1 or Stage 2 and follow ordinary evolution chains;
- their power/HP is higher than ordinary ex;
- when Knocked Out, opponent takes 3 Prizes;
- this is mechanically distinct from the older Mega Pokémon-EX rule that ended the turn on Mega Evolution.

Stream Bandit capability required:

- 3-Reward high-stakes Creature class not tied to one special evolution method;
- ordinary Baby/Teen/Adult lineage support;
- optional enhanced-stat design class;
- do **not** automatically inherit `on_evolve_end_turn`; that is a separate capability flag.

Stream Bandit maps this to **Colossus Creature** without requiring Ascension Evolution.

### 2.17 Battle-style / faction / era tags

Observed pattern:

- cards can carry mechanical labels such as Single Strike / Rapid Strike / Fusion Strike, Ancient / Future, Team/faction identity, etc.;
- support cards and resources can reference the same label.

Stream Bandit capability required:

- extensible `traits` / `rule_tags` array on every card family;
- queries may target those tags generically;
- adding a new trait does not require a new owner engine.

Potential Stream Bandit uses:

- faction sets;
- realm schools;
- creature clans;
- event/series tags;
- story-season tags;
- mechanic keywords.

---

## 3. Distinct mechanical capabilities the engine must be able to express

The research should become **capabilities**, not Pokémon-branded classes.

Required generic capabilities include:

1. Reward value override: 1 / 2 / 3 or future value.
2. Game-global once-per-match action receipt.
3. Once-per-match action may be an Attack or Ability.
4. Once-per-turn/per-card/per-name/per-controller limits.
5. Exact-parent special evolution.
6. Ordinary-stage special class evolution.
7. Optional evolution immediately ends turn.
8. `counts_as` inheritance for rule targeting.
9. Multi-character identity on one card.
10. Extra-cost bonus effect threshold.
11. Multi-card assembly from specified zones.
12. Assembly once per game per identity/name.
13. Component-vs-assembled property semantics.
14. Shared deck-group singleton restriction.
15. Per-identity singleton restriction.
16. No-evolution special Creature flag.
17. Overlay upgrade retaining damage/attachments.
18. Inherit previous attacks and/or Abilities.
19. Selective stat/type/property inheritance/override.
20. Condition/effect cleanse on transform/overlay.
21. Zone-replacement movement.
22. Out-of-play/Void zone.
23. Position-based damage prevention.
24. Rule tags / special-class tags targetable by other effects.
25. Dynamic bench/reserve size limits.
26. Attack cooldown: cannot use again next turn or until leaving Vanguard.
27. Ability cooldown/usage receipts.
28. Attack copying from another Creature/source.
29. Damage scaling from Rewards taken/remaining.
30. Damage scaling from attachments, Reserve count, hand count, discard count or other state.
31. Bench/Reserve splash damage.
32. Damage-counter placement distinct from ordinary attack damage.
33. Damage prevention/reduction by class, type, source or position.
34. Move/attach/discard/recover Essence as attack or Ability effects.
35. Search and attach directly from Deck/Discard.
36. Switch both players' Vanguard/Reserve state.
37. Stadium/Realm dependent bonuses or discard effects.
38. Special Conditions plus immunity/cleanse.
39. Faction/trait synergies.
40. Multiple printings/rarities for one gameplay identity.

This list is an extensibility acceptance target, not a claim that all 40 capabilities are already live.

---

## 4. Working Stream Bandit original mechanic vocabulary

These are original working terms for capability bundles. They can be renamed later without changing the engine contract.

| Working name | Mechanical purpose |
|---|---|
| **Ascendant Creature** | High-stakes Creature, normally 2 Rewards when defeated |
| **Colossus Creature** | Extreme high-stakes Creature, normally 3 Rewards when defeated |
| **Signature Power** | One shared once-per-match Attack or Ability |
| **Bonded Creature** | Multiple beings represented by one Creature identity |
| **Convergence Creature** | Creature assembled from multiple card components |
| **Gleam Creature** | Powerful one-per-deck special Creature |
| **Prime Card** | One card total from a shared powerful support group per deck |
| **Voidmarked Card** | Special singleton whose discard movement can be replaced by movement to the Void |
| **Overform** | Upgrade/evolution that inherits selected attacks/Abilities/properties from the lower card |
| **Aspect Creature** | Alternate form/type with optional position/form rules |
| **Ascension Evolution** | Special evolution procedure which may impose an immediate turn-ending rule |

Rarity remains separate:

- Basic
- Rare
- Extra Rare
- Mythic

A Mythic card is not automatically an Ascendant/Colossus/Signature card, and a special mechanic card is not automatically Mythic.

---

## 5. Evergreen ownership / legality conclusion

Pokémon's 2026 Standard format rotates older regulation marks, while Expanded retains a much larger pool (Black & White onward) with a ban list. Pokémon TCG Live was still rolling out full Expanded compatibility in phases in 2026.

Stream Bandit will **not** use age-based rotation as the default way to keep the game playable.

### Stream Bandit primary policy

- A legitimately released gameplay card does **not** become illegal in the primary all-cards format merely because a newer series launches.
- New series add options; they do not invalidate old purchases by age.
- Ownership, artwork/printing history and collection records persist permanently.
- Reprints/alternate art remain linked to gameplay identity when rules are identical.
- Older cards must remain representable by the current rules engine through versioned compatibility.

### Balance safety valve

No-rotation does not mean no balance controls.

Order of preference:

1. repair an implementation bug;
2. publish clear errata when wording/rules are genuinely defective;
3. add healthy counterplay in future content;
4. use copy-limit/restricted controls if necessary;
5. use competitive suspension/ban only as a last resort for severe loops, exploits or format-breaking balance.

If a card must be restricted from a competitive queue, the product should preserve ownership and keep it usable in suitable Private/Practice/Open modes whenever technically and safely possible.

Optional events may use curated pools, singleton rules, draft/limited rules or other restrictions, but those are **additional formats**, not deletion of the player's collection.

---

## 6. Research sources

Primary/official sources used:

- 2026 Pokémon TCG Standard Rotation announcement: https://www.pokemon.com/uk/pokemon-news/2026-pokemon-tcg-standard-format-rotation-announcement
- Competitive rules/formats: https://play.pokemon.com/en-gb/resources/rules/
- Pokémon TCG Live: https://www.pokemon.com/uk/pokemon-video-games/pokemon-trading-card-game-live
- Scarlet & Violet era rulebook: https://assets.pokemon.com/assets/cms2-en-uk/pdf/trading-card-game/rulebook/svi_rulebook_en.pdf
- Sun & Moon GX rulebook example: https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/sm5_rulebook_en.pdf
- Sword & Shield V/VSTAR/V-UNION/Radiant rulebooks: official assets.pokemon.com rulebooks
- V-UNION introduction: https://www.pokemon.com/us/news/pokemon-v-union-arrive-in-the-pokemon-tcg
- Current Mega Evolution Series announcement: https://www.pokemon.com/uk/news/the-pokemon-tcg-mega-evolution-series-begins
- Pokémon TCG Online / Live migration support: https://support.pokemon.com/hc/en-us/articles/6489934466708-Pok%C3%A9mon-TCG-Live-Migration-FAQ-from-the-Pok%C3%A9mon-TCG-Online
- Official Pokémon card database examples for ex / GX / VMAX / VSTAR / Tera / Radiant mechanics.

Secondary historical source used only where official archival summaries were easier to corroborate:

- Bulbapedia mechanic-history pages for original Pokémon-ex naming/history.

---

## 7. Implementation conclusion

Do not implement one engine named after every historical inspiration.

Implement a composable Stream Bandit rules model where special future card classes are combinations of:

- reward value;
- evolution/assembly rules;
- action inheritance;
- global/per-turn receipts;
- deck-building limits;
- tags;
- movement replacement;
- state/position protection;
- printing metadata;
- existing generic effect opcodes.

The current 40-owner architecture remains the starting authority. A new owner family is added only if a genuinely new state transition cannot cleanly belong to an existing owner.
