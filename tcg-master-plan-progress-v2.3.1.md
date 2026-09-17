# Stream Bandit TCG — Canonical Master Plan V2.3.1

**Plan date:** 2026-09-17  
**Status:** canonical post-test consistency layer over V2.3  
**Inherits:** `tcg-master-plan-progress-v2.3.md` in full except where this file explicitly corrects card-header presentation, reconciles matchup/affinity ownership, locks original Stream Bandit special-mechanic names, and adds interactive damage-counter choreography  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.1.md`  
**Card visual contract:** `tcg-card-visual-printing-v1.1.json`  
**Evergreen/extensibility contract:** `tcg-evergreen-extensibility-v1.1.json`  
**Special mechanic matrix:** `tcg-special-mechanic-rule-matrix-v1.1.md`  
**Special mechanic names:** `tcg-special-mechanic-names-v1.json`  
**Damage counter interaction:** `tcg-damage-counter-interaction-v1.json`  
**Card action controller:** `tcg-v2-card-action-controller-v1.json`  
**Previous canonical main checkpoint:** `59ab7857522373a53de7d551c66f12c2e514e934`

---

## 0. Purpose

This layer closes the consistency gaps found by auditing every decision made after the real private-alpha game test and the approved ten showcase images.

Everything else from V2.3 remains unchanged and active.

---

## 1. Approved showcase card header — corrected visual authority without invented rules

The final approved ten showcase families are the visual reference for composition, framing, art scale, rarity finish and information hierarchy.

Current `sb-tcg-card-v0.2` ordinary Creatures do **not** have a generic play/evolution Cost field. Therefore the renderer must not invent one merely because a showcase concept image used a numbered Cost badge.

For ordinary Creature cards, the premium renderer must use this header logic:

- reserve the **top-left badge slot** for a real structured header property or a nonnumeric stage/class/special-rule badge;
- show a numeric **Cost + value** there only if a future/current structured card family explicitly defines that Cost;
- for current ordinary Creatures, do **not** manufacture a play/evolution Cost;
- **Element / type badge** remains top-right;
- **card name + stage/classification + clearly labelled HP** occupy the upper identity/header area;
- large dedicated artwork appears below the header;
- exactly two action slots appear below the art;
- **Withdraw Cost + value** appears bottom-right;
- rarity / printing finish / set markers remain in the frame/footer.

No visible gameplay number may float without a property label, and no numeric property may be invented to satisfy concept-art layout.

This supersedes both the older `HP top-left` wording and the temporary assumption that current Creatures possess a generic Cost.

---

## 2. Creature action rule remains unchanged

Every ordinary Creature still uses exactly one of:

1. **Ability + Attack 1**
2. **Attack 1 + Attack 2**

Never Ability + Attack 1 + Attack 2 together.

`tcg-v2-card-action-controller-v1.json` now points to the corrected self-contained visual contract so the control and rendering authority graph cannot drift back to the superseded header.

Future reviewed special families may request a different generic action renderer only through an explicit shared contract; never as a one-card exception.

---

## 3. Vulnerability / Resistance — preserve global matchup ownership

The supplied historical/current special-card examples expose weakness/resistance-style damage rules, but Stream Bandit's existing canonical schema already separates ordinary global matchups from exceptional card-specific modifiers.

### 3.1 Ordinary Vulnerability

For ordinary Set One-style elemental/type matchups:

- the canonical source is the versioned match rules snapshot and matchup table, currently `cp2-matchups-v0.1`;
- ordinary Creature definitions must **not** duplicate this with per-card `weakness` objects;
- the attacking and defending element/type keys are evaluated by the rules resolver;
- the current ordinary match uses the canonical `2x` weakness multiplier at most once per attack;
- the player-facing renderer may use **Vulnerability** as a Stream Bandit presentation label for this global matchup rule, but the server/global matchup snapshot remains the authority.

### 3.2 Exceptional Resistance / matchup overrides

A specific future card may explicitly carry structured exceptional data such as:

- **Resistance** against a configured element/type/tag;
- an explicit matchup override;
- another reviewed card-specific damage-affinity rule.

Those exceptional fields are card data. They do not replace the global matchup table for ordinary weakness.

### 3.3 Separation rules

- rarity does not imply Vulnerability/Resistance;
- printing finish does not imply Vulnerability/Resistance;
- special Creature class does not imply Vulnerability/Resistance;
- non-attack damage does not automatically use ordinary Weakness/Vulnerability;
- damage-counter placement/movement does not automatically use Weakness/Vulnerability, Resistance or Shield;
- all damage math remains server-authoritative.

This planning update changes **no existing Set One matchup values**.

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

These are presentation/family labels, **not separate engines**. Runtime continues to compose generic capabilities such as `reward_value`, rule tags, evolution parent, shared match receipts, assembly recipe, inheritance, deck-group limits, zone replacement, position rules and ordinary Attack/Ability/effect opcodes.

---

## 5. Damage counters — interactive board object and timing contract

Damage counters are part of the physical-card interaction model, not merely hidden arithmetic.

### 5.1 Counter unit

- base damage-counter unit = **10 damage**;
- visible counter choices use **10-point increments**;
- total/maximum comes from the exact resolving card/effect/Condition property;
- browser never invents amount or legal targets.

### 5.2 Placing damage counters

When a card/Ability/Attack says to place damage counters:

1. resolving card lifts/hovers/focuses;
2. battlefield remains visible;
3. legal Creature targets highlight;
4. damage-counter tray appears;
5. counters begin at 10 and progress in 10-point increments up to the permitted amount;
6. player drags counters to legal targets, or uses tap/select accessibility equivalent;
7. selected distribution and remaining amount stay visible;
8. change/cancel is allowed before authoritative commit where practical;
9. server validates and commits the exact legal distribution;
10. counters visibly land on target cards.

### 5.3 Moving existing damage counters

When an effect says to move damage counters:

1. resolving/source card lifts/hovers;
2. movable existing damage on the source is visualized;
3. legal destinations highlight;
4. player drags 10-point values from source to destination(s);
5. source damage decreases by the exact moved amount;
6. destination damage increases by the exact moved amount;
7. move cannot exceed the effect limit or available source damage;
8. source/destination changes commit atomically on the server.

This is movement of existing damage, not newly dealt attack damage.

### 5.4 During attack resolution

If an Attack requires counter placement/movement, that interaction resolves **before the turn hands over**:

1. validate/pay Attack;
2. resolve ordinary printed Attack effects and damage;
3. resolve required counter placement/movement choices;
4. resolve resulting Conditions/listeners;
5. defeat scan;
6. Reward/forced-promotion consequences;
7. Aftermath;
8. turn-transition checkpoint;
9. next player's ordinary play.

The rule that **attacking ends the turn** remains unchanged; damage-counter allocation is part of completing the Attack first.

### 5.5 Turn-based Conditions

A Condition may declare damage-counter ticks at the canonical turn-switch/checkup checkpoint.

- Condition badge/source pulses;
- configured 10-point counters animate onto the affected Creature;
- amount comes from the Condition property;
- defeat scan follows counter application;
- Reward/promotion consequences resolve before next-player ordinary actions;
- not every Condition must deal damage.

### 5.6 Semantic separation

The engine distinguishes:

- ordinary Attack/effect damage;
- place damage counters;
- move damage counters;
- turn-transition Condition counter placement.

Ordinary Weakness/Vulnerability, Resistance, Shield and attack-damage modifiers do **not** automatically alter placed/moved damage counters unless an explicit structured rule says so.

Server Damage/Condition/Defeat/Reward owners remain authoritative; the client is presentation/input only.

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
- schema-honest showcase header composition with no invented Cost;
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
- future cards, attacks, Abilities, special forms/classes, elements, series, decks, booster packs, rarities, printings, alternate art, collectible coins/accessories and event formats remain data-driven;
- researched external special-card families use original Stream Bandit working names;
- global ordinary Vulnerability remains owned by the matchup snapshot; exceptional Resistance/overrides remain explicit structured data;
- special rules split between visible card-facing data and global server-enforced family rules;
- 40-owner architecture remains the starting authority;
- no owner #41 merely for a new mechanic name;
- future schema changes require backward compatibility.

With these corrections, no additional post-test planning omission is currently known.

---

## 7. Locked next operation

1. Finish Fairy + Underworld exact `sb-tcg-card-v0.2` translation.
2. Validate deterministic 241-identity / ten-starter authority.
3. Repair only proven generic dispatcher gaps.
4. Prove V2-G1E evergreen/extensibility schema support, including original special-family labels, canonical matchup ownership, exceptional affinity metadata and damage-counter placement/movement metadata.
5. Build the premium full-card renderer from the corrected schema-honest visual contract.
6. Restore the one-screen playable Battle Client, including interactive damage-counter trays/dragging and turn-transition Condition counter animation.
7. Run real two-user end-to-end.

**Checkpoint:** post-test master-plan consistency audit ✅ complete.