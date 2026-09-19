# Stream Bandit TCG — Canonical Master Plan V2.3.1

**Plan date:** 2026-09-17  
**Status:** canonical post-test consistency layer over V2.3 plus living cross-era mechanic-harvest authority  
**Inherits:** `tcg-master-plan-progress-v2.3.md` in full except where this file explicitly corrects card-header presentation, reconciles matchup/affinity ownership, locks original Stream Bandit special-mechanic names, adds interactive damage-counter choreography and binds the living generic mechanic harvest  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.1.md`  
**Card visual contract:** `tcg-card-visual-printing-v1.1.json`  
**Evergreen/extensibility contract:** `tcg-evergreen-extensibility-v1.1.json`  
**Mechanic harvest index:** `tcg-mechanic-harvest-index-v1.md`  
**Generic mechanic capability catalog:** `tcg-generic-mechanic-capabilities-v1.json`  
**Special mechanic matrix:** `tcg-special-mechanic-rule-matrix-v1.1.md`  
**Special mechanic names:** `tcg-special-mechanic-names-v1.json`  
**Damage counter interaction:** `tcg-damage-counter-interaction-v1.json`  
**Card action controller:** `tcg-v2-card-action-controller-v1.json`  
**Previous canonical main checkpoint:** `59ab7857522373a53de7d551c66f12c2e514e934`

---

## 0. Purpose

This layer closes the consistency gaps found by auditing every decision made after the real private-alpha game test and the approved ten showcase images, and adds a living cross-era mechanic library so future cards/series can reuse generic mechanics without invalidating old collections or adding one-off runtime helpers.

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

`tcg-v2-card-action-controller-v1.json` points to the corrected self-contained visual contract so the control and rendering authority graph cannot drift back to the superseded header.

The accepted Fairy and Underworld design candidate files remain **content/mechanic sources only**. Their historical nested visual-contract metadata is not renderer authority; all current visual resolution goes through `tcg-card-visual-printing-v1.1.json`.

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
| generic multi-being identity | **Bonded Creature** | multiple beings represented by one Creature identity; no special Reward/Power implied by the name alone |
| TAG TEAM GX style | **Bonded Sigilborn** | bonded identity; normally 3 Rewards; may carry a Signature Power and optional extra-cost bonus |
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

The shared once-per-match special action remains **Signature Power**. Machine action kinds remain the ordinary stable identifiers `attack` and `ability`; the player-facing labels are **Signature Attack** and **Signature Ability**.

These are presentation/family labels, **not separate engines**. Machine definitions must compose exact capability IDs from `tcg-generic-mechanic-capabilities-v1.json`, such as `reward.value_override`, `tag.special_class`, `evolution.special_parent`, `signature.once_per_match_power`, `assembly.multi_component_creature`, `deck.shared_group_limit`, `zone.replacement` and the ordinary Attack/Ability/effect grammar. Descriptive family traits are not a second capability-ID vocabulary.

---

## 5. Damage counters — interactive board object and timing contract

Damage counters are part of the physical-card interaction model, not merely hidden arithmetic.

### 5.1 Counter unit and amount precision

- base damage-counter unit = **10 damage**;
- visible counter choices use **10-point increments**;
- total/maximum comes from the exact resolving card/effect/Condition property;
- browser never invents amount or legal targets;
- a **fixed amount** must be applied in full when the operation is legal;
- a smaller amount is selectable only when card/effect data explicitly says **up to N** or otherwise declares partial movement/placement, such as `allow_partial:true`;
- the counter tray must visually distinguish a mandatory exact total from an optional/up-to maximum.

### 5.2 Placing damage counters

When a card/Ability/Attack says to place damage counters:

1. resolving card lifts/hovers/focuses;
2. battlefield remains visible;
3. legal Creature targets highlight;
4. damage-counter tray appears;
5. counters begin at 10 and progress in 10-point increments subject to the effect's fixed/up-to amount mode;
6. player drags counters to legal targets, or uses tap/select accessibility equivalent;
7. selected distribution and remaining required/optional amount stay visible;
8. change/cancel is allowed before authoritative commit where practical;
9. server validates and commits the exact legal distribution;
10. counters visibly land on target cards;
11. **the destination defeat check runs immediately after the committed placement operation before later listeners, follow-up target selection or effects may act on that destination.**

### 5.2a Grouped multi-target placement

For canonical grouped placement such as `PLACE_DAMAGE_MULTI`:

1. validate the complete target set, distinct-target rule and amounts as one effect;
2. commit all validated placements as **one atomic grouped operation**;
3. do not run listeners or allow follow-up targeting between individual target placements;
4. immediately run a **batch defeat scan across every affected destination** after the grouped placements commit;
5. remove/process every Creature made lethal by the grouped operation before any later listener, follow-up target selection or effect resumes;
6. then continue Reward/forced-promotion/resume processing in canonical order.

This keeps one multi-target effect coherent without allowing later logic to act on a Creature the grouped operation has already defeated.

### 5.3 Moving existing damage counters

When an effect says to move damage counters:

1. resolving/source card lifts/hovers;
2. movable existing damage on the source is visualized;
3. legal destinations highlight;
4. player drags 10-point values from source to destination(s);
5. source damage decreases by the exact moved amount;
6. destination damage increases by the exact moved amount;
7. move cannot exceed available source damage or the effect's declared amount/maximum;
8. fixed-amount movement requires the full legal fixed amount; smaller voluntary movement is legal only for explicit `up to`/partial semantics;
9. source/destination changes commit atomically on the server;
10. **the destination defeat check runs immediately after that atomic placement before later listeners/effects can treat the defeated Creature as still in play.**

This is movement of existing damage, not newly dealt attack damage.

### 5.4 During attack resolution

If an Attack requires counter placement/movement, that interaction resolves **before the turn hands over**, but every damage-counter operation still obeys its immediate defeat boundary:

1. validate/pay Attack;
2. resolve ordinary printed Attack effects and ordinary damage using their canonical operation boundaries;
3. resolve each required damage-counter placement/movement choice with its exact fixed/up-to amount semantics;
4. commit either the single-target counter operation or complete grouped placement operation atomically;
5. run the single-destination or grouped batch defeat boundary **immediately** after that operation;
6. only then resolve later listeners, Conditions, follow-up targets or effects that remain legal after defeated objects have left play;
7. resolve remaining Reward, forced-promotion and Aftermath consequences in the canonical resume order;
8. enter the turn-transition checkpoint;
9. begin the next player's ordinary play.

The rule that **attacking ends the turn** remains unchanged; all attack-generated counter choices and their defeat consequences are part of completing the Attack before handoff.

### 5.5 Turn-based Conditions

A Condition may declare damage-counter ticks at the canonical turn-switch/checkup checkpoint.

- Condition badge/source pulses;
- configured 10-point counters animate onto the affected Creature;
- amount comes from the Condition property;
- the immediate defeat boundary runs after counter application;
- Reward/promotion consequences resolve before next-player ordinary actions;
- not every Condition must deal damage.

### 5.6 Semantic separation

The engine distinguishes:

- ordinary Attack/effect damage;
- place damage counters;
- grouped multi-target placement;
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
- immediate defeat boundary after each committed single-target damage-counter operation;
- atomic grouped placement followed by immediate batch defeat boundary;
- fixed vs up-to counter precision semantics;
- turn-transition Condition damage counters;
- search/private-choice overlays preserving board context;
- Reward / defeat / promotion / victory presentation;
- Collection / Deck Builder / Packs / Practice / Card Viewer / Season product areas;
- prototype usability regression forbidden;
- primary all-cards Evergreen format with no age-based rotation;
- ownership/printing history preserved across future series;
- future cards, attacks, Abilities, special forms/classes, elements, series, decks, booster packs, rarities, printings, alternate art, collectible coins/accessories and event formats remain data-driven;
- researched external special-card families use original Stream Bandit working names including the generic Bonded Creature and narrower Bonded Sigilborn families;
- stable machine action-kind identifiers remain separate from player-facing special-action labels;
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
4. Prove V2-G1E evergreen/extensibility schema support, including original special-family labels, canonical matchup ownership, exceptional affinity metadata, damage-counter placement/movement metadata and the generic mechanic capability catalog.
5. Build the premium full-card renderer from the corrected schema-honest visual contract.
6. Restore the one-screen playable Battle Client, including interactive damage-counter trays/dragging and turn-transition Condition counter animation.
7. Run real two-user end-to-end.

---

## 8. Living Mechanic Harvest — future-card authority

The master plan delegates future cross-era mechanic research to:

- `tcg-mechanic-harvest-index-v1.md` — human research/coverage index;
- `tcg-generic-mechanic-capabilities-v1.json` — machine-readable generic capability vocabulary.

### 8.1 Why this exists

The external set catalogue spans 174 English releases and the historical card corpus contains thousands of unique attacks/Abilities/effect combinations. Stream Bandit must learn from that design history **without** building one engine per external era or one helper per card.

The target is a stable vocabulary of generic capabilities that future Stream Bandit cards can compose.

Example capability recipe:

`trigger.turn_start + search.deck + essence.attach_from_deck + condition.apply + limit.once_per_turn`

A card using all five should be structured data composing those capabilities, not five one-off helpers.

### 8.2 Coverage rule

The set index is a research checklist, not a copied card catalogue.

Current baseline research has harvested:

- major historical special-card mechanic families;
- 54 broad effect categories;
- active/passive/triggered Ability heritage;
- Ability suppression/interruption and use receipts;
- persistent attachment/field/support-card rules;
- support-card per-turn limits;
- temporary/granted attacks;
- Special Essence and modal card/resource rules;
- zone-dependent card characteristics and special setup eligibility;
- multiple/dynamic element forms;
- attachment eligibility/expiry/multiple-attachment overrides;
- draw prevention/modification and multi-outcome/simultaneous choices;
- Condition checkup/recovery modification;
- reward-risk classes;
- once-per-match powers;
- singleton/shared-group limits;
- multi-card assembly;
- inherited actions/properties;
- alternate forms/types;
- faction/strategy tags;
- direct defeat / extra turn / end-turn / first-turn exceptions;
- damage-counter movement;
- resource acceleration/denial/recovery;
- search/draw/reveal/mill/reorder;
- attack copying/granting/locking;
- condition application/cleanse/immunity/ticks;
- special zone replacement;
- Realm/Relic/Tactic/Essence analogues;
- printing/rarity/product variants.

Individual-card text harvesting remains ongoing and may add a capability only when a genuinely new reusable rule primitive is proven.

### 8.3 Indexed vs implemented

**Indexed does not mean implemented.**

V2-G1E must, for every capability ID:

1. define exact parameters/timing/targets/costs/zones;
2. map it to the existing 40 owners/effect opcodes where possible;
3. prove deterministic tests for timing/payment/zone semantics;
4. add one generic schema/dispatcher extension only if current owners cannot express the rule;
5. forbid card-name and series-name runtime branches;
6. preserve backward compatibility for older cards.

### 8.4 Future-series acceptance test

The extensibility architecture is not considered complete until a sample future series can add new cards, attacks, Abilities, tags, special classes, decks and booster recipes by composing catalogued capabilities **without** rewriting older card data or adding series-specific runtime branches.

This is the mechanism that protects the Evergreen/no-age-rotation philosophy: new content grows the library instead of replacing it.

### 8.5 Research stays live

The research index is intentionally appendable. As individual cards from Base through current/future sets reveal a rule idea that is not already representable, the smallest reusable capability is added to the index first. Runtime work follows only after V2-G1E proves owner/schema need.

This allows Stream Bandit to keep learning from future card design without destabilising the core rules or making old cards obsolete.

**Checkpoint:** post-test master-plan consistency audit ✅ complete | living mechanic harvest ✅ bound to plan | individual-card deep research 🔎 ongoing | V2-G1E runtime proof ☐.