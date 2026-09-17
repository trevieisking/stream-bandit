# Stream Bandit TCG — Canonical Master Plan V2.3.1

**Plan date:** 2026-09-17  
**Status:** canonical post-test consistency layer over V2.3  
**Inherits:** `tcg-master-plan-progress-v2.3.md` in full except where this file explicitly corrects card-header presentation, adds generic damage-affinity modifiers, locks original Stream Bandit special-mechanic names, and adds interactive damage-counter choreography  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.1.md`  
**Card visual contract:** `tcg-card-visual-printing-v1.1.json`  
**Evergreen/extensibility contract:** `tcg-evergreen-extensibility-v1.1.json`  
**Special mechanic matrix:** `tcg-special-mechanic-rule-matrix-v1.1.md`  
**Special mechanic names:** `tcg-special-mechanic-names-v1.json`  
**Damage counter interaction:** `tcg-damage-counter-interaction-v1.json`  
**Previous canonical main checkpoint:** `59ab7857522373a53de7d551c66f12c2e514e934`

---

## 0. Purpose

This layer closes the consistency gaps found by auditing every decision made after the real private-alpha game test and the approved ten showcase images.

Everything else from V2.3 remains unchanged and active.

---

## 1. Approved showcase card header — corrected visual authority

The final approved ten showcase families are the visual reference.

For ordinary Creature cards, the premium renderer must use this header logic:

- **Cost + value** in the top-left cost badge when that Creature identity has a structured play/evolution cost;
- **Element / type badge** top-right;
- **card name + stage/classification** in the identity band;
- **HP + value** clearly labelled in the upper identity/header area beneath or adjacent to the name;
- large dedicated artwork below the header;
- exactly two action slots below the art;
- **Withdraw Cost + value** bottom-right;
- rarity / printing finish / set markers in the frame/footer.

No visible gameplay number may float without a property label.

If a future card family does not use a generic play/evolution Cost, the renderer must omit that value cleanly rather than invent one. Structured data remains the rules authority; showcase concept numbers are not authoritative gameplay values.

This supersedes the older wording that required `HP` itself to occupy the top-left corner.

---

## 2. Creature action rule remains unchanged

Every ordinary Creature still uses exactly one of:

1. **Ability + Attack 1**
2. **Attack 1 + Attack 2**

Never Ability + Attack 1 + Attack 2 together.

Future reviewed special families may request a different generic action renderer only through an explicit shared contract; never as a one-card exception.

---

## 3. Generic Vulnerability / Resistance capability — added

The supplied historical/current special-card examples expose a rule class that was not explicitly reserved in V2.3: type/element-based damage amplification and reduction.

Stream Bandit must therefore support generic **damage-affinity modifiers** through structured data.

Working player-facing terminology:

- **Vulnerability** — configured incoming damage is increased/multiplied when the source matches specified element/type/tag conditions;
- **Resistance** — configured incoming damage is reduced/prevented when the source matches specified element/type/tag conditions.

The exact public terminology may later change, but the capability is locked.

Required properties:

- zero, one or multiple configured affinity rules per Creature gameplay identity where rules allow;
- source matching by element/type/rule tag rather than card name;
- additive, subtractive, multiplicative or prevention-style modifier modes only when explicitly declared by the rules schema;
- deterministic ordering relative to attack damage, Shield, prevention, Conditions and other damage modifiers;
- visible labels/icons on the card when the rule applies;
- accessible text equivalent for icons;
- server-authoritative calculation through the existing Damage/rules owners where possible;
- no browser-only damage arithmetic;
- no assumption that rarity, special class or printing finish creates Vulnerability/Resistance automatically.

Set One does not gain new Vulnerability/Resistance values merely because this capability is now reserved. Current card behaviour changes only through explicit structured card data and reviewed balance work.

---

## 4. Original Stream Bandit names for researched special families — LOCKED WORKING CANON

External labels such as EX, GX, TAG TEAM, V, VMAX, VSTAR, V-UNION, Radiant, ACE SPEC, Prism Star, LV.X, BREAK, Tera or Mega-ex remain **research provenance only**. They are not Stream Bandit player-facing mechanic names.

The working Stream Bandit names are:

| Research family | Stream Bandit working name | Primary rule identity |
|---|---|---|
| historical EX / current ex style | **Ascendant Creature** | normally 2 Rewards; special rule class |
| GX style | **Sigilborn Creature** | normally 2 Rewards; may carry a Signature Power |
| TAG TEAM GX style | **Bonded Sigilborn** | bonded identity; normally 3 Rewards; optional extra-cost bonus |
| V style | **Exalted Creature** | normally 2 Rewards; special rule class |
| VMAX style | **Colossus Creature** | special evolution; normally 3 Rewards |
| VSTAR style | **Starforged Creature** | special evolution; normally 2 Rewards; may carry a Signature Power |
| V-UNION style | **Convergence Creature** | assembled from multiple component cards |
| Radiant style | **Gleam Creature** | powerful special Creature with one-per-deck group restriction |
| ACE SPEC style | **Prime Card** | one powerful support card total from its shared deck group |
| Prism Star style | **Riftmarked Card** | singleton/group restriction with optional Void destination replacement |
| LV.X style | **Overform** | overlay upgrade inheriting configured lower-card actions/properties |
| BREAK style | **Ascension Form** | overlay upgrade with inherited lower-card properties and selective overrides |
| Tera style | **Aspect Creature** | alternate form/element with optional position/form rules |
| current Mega-ex style | **Apex Ascendant** | high-stakes special evolution; normally 3 Rewards |
| historical Mega EX evolve/end-turn pattern | **Ascension Evolution** | special evolution with optional immediate end-turn flag |

The shared once-per-match special action remains **Signature Power**, expressed as either:

- **Signature Attack**, or
- **Signature Ability**.

### Naming architecture rule

These are presentation/family labels, **not separate engines**.

The runtime continues to compose generic capabilities such as:

- `reward_value`;
- rule tags / `counts_as` tags;
- evolution parent;
- shared match receipts;
- assembly recipe;
- inheritance configuration;
- deck group limits;
- zone replacement;
- position protection;
- ordinary Attack/Ability/effect opcodes.

A future series may rename or theme a player-facing family without changing the underlying generic capability contract.

---

## 5. Damage counters — interactive board object and timing contract

Damage counters are part of the physical-card interaction model, not merely hidden arithmetic.

### 5.1 Counter unit

- the base damage-counter unit is **10 damage**;
- visible counter choices use **10-point increments**;
- the available total/maximum comes from the exact resolving card/effect/Condition property;
- the browser must never invent the amount or legal targets.

Examples:

- an effect that places 30 damage allows an exact total of 30 in 10-point increments;
- an effect that moves up to 50 existing damage cannot move more than the declared limit or available source damage;
- a Condition that places 10 damage at each turn transition adds one 10-point counter per eligible checkpoint.

### 5.2 Placing damage counters

When a card/Ability/Attack says to **place damage counters**:

1. the resolving card lifts/hovers/focuses;
2. the battlefield remains visible;
3. legal Creature targets highlight;
4. a damage-counter tray appears;
5. counters begin at 10 and progress in 10-point increments up to the exact permitted amount;
6. the player drags counters to legal targets, or uses the tap/select accessibility equivalent;
7. the UI shows the selected distribution and remaining amount;
8. the player may change/cancel before authoritative commit where practical;
9. the server validates and commits the exact legal distribution;
10. the counters visibly land on the target cards.

### 5.3 Moving existing damage counters

When an effect says to **move damage counters**:

1. the resolving/source card lifts/hovers;
2. movable existing damage on the source Creature is made visually available;
3. legal destination Creatures highlight;
4. the player drags 10-point counter values from source to destination(s);
5. source damage decreases by the exact moved amount;
6. destination damage increases by the exact moved amount;
7. the move cannot exceed the effect's limit or the source's available movable damage;
8. source and destination changes commit atomically on the server.

This is a movement of existing damage, not newly dealt attack damage.

### 5.4 Damage counters during attack resolution

If an Attack or its resulting effect requires counter placement/movement, the entire counter choice resolves **before the turn hands over**.

Canonical attack sequence:

1. validate/pay Attack;
2. resolve ordinary printed Attack effects and damage;
3. resolve required damage-counter placement/movement choices;
4. resolve resulting Conditions/listeners;
5. run defeat scan;
6. resolve Reward and forced-promotion consequences;
7. finish Aftermath;
8. enter the turn-transition checkpoint;
9. only then pass ordinary play to the next player.

The existing rule that **attacking ends the turn** remains unchanged; the counter interaction is part of completing that Attack before the handoff.

### 5.5 Turn-based Conditions use damage counters

A Condition may declare a damage-counter tick at the canonical turn-switch/checkup checkpoint.

When such a Condition ticks:

- the Condition badge/source visibly pulses;
- the configured number of 10-point counters animate onto the affected Creature;
- the exact amount comes from the Condition property, not a global fixed value;
- the same counter visual system is reused;
- defeat scan runs after the counters are applied;
- Reward/promotion consequences caused by the Condition resolve before the next player's normal actions;
- not every Condition is required to deal damage.

This gives Conditions a consistent visual language: a rule can say, for example, `place 10 damage at each turn switch`, `place 20`, or another explicit amount without creating a new interaction system.

### 5.6 Damage vs damage-counter placement

The engine must preserve semantic separation:

- ordinary Attack/effect **damage**;
- **place damage counters**;
- **move damage counters**;
- turn-transition **Condition counter placement**.

Vulnerability, Resistance, Shield and ordinary damage modifiers do **not** automatically alter placed/moved damage counters unless an explicit structured rule says they do.

The client only renders/selects the operation. Server Damage/Condition/Defeat/Reward owners remain authoritative.

---

## 6. Post-test master-plan audit — COMPLETE

The canonical inheritance chain now explicitly covers every accepted decision made after the real-game test:

- one-screen playable prototype restoration;
- uploaded-video interaction choreography;
- ten approved visual deck families;
- 10 elements / 241 current V2 identity target / 10 exact starter targets;
- Fairy / Glimmerwish and Underworld / Grave Pact accepted design packages;
- artwork target on every printable gameplay card;
- Basic / Rare / Extra Rare / Mythic rarity tiers;
- Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic printings;
- card-controlled Ability / Attack / Withdraw;
- exactly two ordinary Creature action slots;
- named numeric properties;
- corrected showcase header placement;
- drag/drop desktop + tap/select touch/accessibility equivalent;
- green legal-Evolution highlighting;
- Essence dragged/selected onto Creature;
- Relic attachment;
- persistent Realm until replacement or explicit effect removal/discard;
- Tactic board/overlay targeting;
- active Ability normally once during your turn unless structured data says otherwise;
- attack resolves fully then automatically ends turn;
- interactive damage-counter placement/movement before attack handoff;
- turn-transition Condition damage counters;
- search/private-choice overlays preserving board context;
- Reward / defeat / promotion / victory presentation;
- Collection / Deck Builder / Packs / Practice / Card Viewer / Season product areas;
- prototype usability regression forbidden;
- primary all-cards Evergreen format with no age-based rotation;
- ownership/printing history preserved across future series;
- future cards, attacks, Abilities, special forms/classes, elements, series, decks, booster packs, rarities, printings, alternate art, collectible coins/accessories and event formats remain addable through data-driven systems;
- researched external special-card families now have original Stream Bandit working names;
- special rules split between visible card-facing data and global server-enforced family rules;
- generic Vulnerability/Resistance capability reserved;
- 40-owner architecture remains the starting authority;
- no owner #41 merely for a new mechanic name;
- future schema changes require backward compatibility.

With these corrections, no additional post-test planning omission is currently known.

---

## 7. Locked next operation

No implementation order changes.

1. Finish Fairy + Underworld exact `sb-tcg-card-v0.2` translation.
2. Validate deterministic 241-identity / ten-starter authority.
3. Repair only proven generic dispatcher gaps.
4. Prove V2-G1E evergreen/extensibility schema support, including original special-family labels, damage-affinity metadata and damage-counter placement/movement metadata.
5. Build the premium full-card renderer from the corrected visual contract.
6. Restore the one-screen playable Battle Client, including interactive damage-counter trays/dragging and turn-transition Condition counter animation.
7. Run real two-user end-to-end.

**Checkpoint:** post-test master-plan consistency audit ✅ complete.