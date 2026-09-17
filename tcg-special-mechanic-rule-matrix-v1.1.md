# Stream Bandit TCG — Special Mechanic Rule Matrix V1.1

**Date:** 2026-09-17  
**Purpose:** Self-contained rule matrix converting researched historical/current special-card examples into generic Stream Bandit capabilities while preserving card-facing information, server-enforced global rules, existing owner mappings, matchup ownership and original Stream Bandit names.

## Core rule

A complete special mechanic has two layers:

1. **card-facing information** — what the player sees, understands and selects; and
2. **global/family rules** — deck limits, shared usage receipts, evolution eligibility, assembly, inheritance, zone replacement, matchup ownership or special Reward value enforced by the server.

Rendered card text is never the sole engine authority. Both layers are structured data.

---

## Complete rule matrix

| Researched mechanic pattern | What the Stream Bandit card must show | What the server must enforce | Generic Stream Bandit capability / owner path |
|---|---|---|---|
| high-stakes 2-Reward Creature | special-class marker + clear Reward consequence | opponent gains 2 Rewards on defeat | `reward_value:2`; Content Registry #1 + Reward Cards #32 |
| high-stakes 3-Reward Creature | special-class marker + clear Reward consequence | opponent gains 3 Rewards on defeat | `reward_value:3`; Content Registry #1 + Reward Cards #32 |
| once-per-match special Attack | **Signature Attack** presentation + spent state | one controller-match receipt shared by all eligible cards | machine `action_kind:"attack"`; Attack #14 + shared receipt/timing |
| once-per-match special Ability | **Signature Ability** presentation + spent state | one controller-match receipt shared by all eligible cards | machine `action_kind:"ability"`; Active Ability #15 + shared receipt/timing |
| special evolution from exact predecessor | evolution parent/class displayed | exact legal parent + canonical timing | Creature/Evolution #13 + structured parent/tag |
| special evolution that ends turn | explicit timing/rule marker | successful evolution invokes canonical end-turn | **Ascension Evolution** / `on_evolve_end_turn:true` |
| advanced form that still counts as prior class | rule-class marker | `counts_as` / inherited rule tags remain queryable | Content Registry #1 / generic tags |
| inherits prior Attacks | inherited-action presentation | merge lower-stack Attack list from structured inheritance rules | **Overform / Ascension Form** + Attack #14 |
| inherits prior Abilities | inherited-action presentation | merge lower-stack Ability list from structured inheritance rules | **Overform / Ascension Form** + Ability #15 |
| overlay retains attachments/damage | overlay/evolution presentation | damage, Essence, Relic and stack history preserved | Creature/Evolution #13 + Card-Zone #30 |
| bonded/multi-being Creature | multiple beings represented as one identity | one Creature object with tags/reward value | **Bonded Creature / Bonded Sigilborn** |
| multi-card assembled Creature | assembly/component marker | required components + legal source zone + atomic one-object assembly | **Convergence Creature**; #13 + #30 |
| component has restricted characteristics outside play | component/assembly rule marker where needed | only declared characteristics are queryable by zone | `zone.characteristics_by_zone`; Content Registry #1 + Card-Zone #30 |
| one-per-deck special Creature | special-class marker | deck validator enforces identity/shared-group singleton | **Gleam Creature**; Deck Builder/Legality #6 |
| one powerful support card from group | shared-group marker | one card total from group | **Prime Card**; Deck Builder/Legality #6 |
| singleton card replaces Discard with special zone | destination rule marker | movement replacement sends card to Void rather than Discard | **Riftmarked Card**; Card-Zone #30 |
| extra effect for extra payment | base requirement + bonus requirement | Payment validates optional extra cost then branches effect | Cost #25 + Payment #26 |
| position-based protection | clear position/form rule | prevention evaluates current Vanguard/Reserve position | **Aspect Creature** + Damage/position owners |
| alternate element/form | form/element marker | current element/type metadata affects legal queries/matchup | **Aspect Creature** + Registry/rules resolver |
| multiple element/type Creature | all current elements/types visible | queries/matchups use the declared multi-element model | generic `form.multi_element` |
| temporary/dynamic element change | current transformed element visible | structured state updates and matchup/query resolution | generic `form.dynamic_element_change` |
| faction/strategy/special rule tag | visible tag/badge where player relevant | generic tag queries across creatures/support/resources | `rule_tags[]` / `traits[]`; Registry #1 |
| active vs passive vs triggered Ability | correct card label and timing text | activation/event dispatcher uses structured Ability timing kind | Active Ability #15 + listener/timing owners |
| Ability blocked after declaration | visible failed/resolved feedback | costs/use receipt remain spent only when the rule says so | Payment/timing + Ability #15 |
| support-card per-turn play group | card subtype/group marker | shared controller-turn receipt | Deck/rules/timing owners; generic group limit |
| attachment grants Attack | granted Attack visible in card context | attached card contributes Attack while legal | Relic #17 + Attack #14 |
| temporary attack-granting attachment | granted Attack + expiry cue | attachment/Attack expires at configured timing | Relic #17 + Card-Zone #30 + timing |
| modal card identity | mode information where needed | card characteristics depend on zone/mode; only legal mode can be played | `card.modal_type` + `zone.characteristics_by_zone` |
| special Essence / multi-element resource | provided Essence types/effects | Payment sees declared resource characteristics; extra effect follows rules | Essence #22 + Payment #26 |
| multiple cosmetic printings | rarity/finish treatment | same gameplay identity, separate printing identity | Printing/Art Metadata #3 |

---

## Matchup / damage-affinity ownership

### Ordinary Vulnerability

Ordinary Set One-style weakness is **global**, not duplicated on every card.

- canonical source: versioned matchup snapshot, currently `cp2-matchups-v0.1`;
- ordinary Creature definitions do not carry per-card `weakness` objects;
- attacking and defending element/type keys are evaluated by the rules resolver;
- the current ordinary multiplier is 2x and applies at most once per attack;
- non-attack damage does not automatically use the ordinary multiplier.

The player-facing label may be **Vulnerability** while engine ownership remains global.

### Exceptional Resistance / override

A future card may explicitly define:

- **Resistance** against configured element/type/tag conditions;
- an explicit matchup override;
- another reviewed card-specific affinity modifier.

These are exceptional structured card rules and do not replace the global matchup table.

### Separation

Affinity is independent from rarity, printing finish, Reward value, special class, Shield, Conditions and position protection unless a rule explicitly composes them.

Placed/moved damage counters do not automatically use Vulnerability, Resistance or Shield.

---

## Family distinctions that must remain separate

### Reward value vs evolution timing

A high Reward value and a special evolution timing rule are independent capabilities.

A card may have:

- `reward_value:3`
- normal evolution timing
- `on_evolve_end_turn:false`

while another may have:

- `reward_value:2`
- special predecessor
- `on_evolve_end_turn:true`.

Never infer one from the other.

### Ordinary Ability limit vs Signature Power

- ordinary active Ability: normally once during your turn unless card data says otherwise;
- **Signature Power:** once for the entire match at controller scope across eligible cards.

Machine identifiers remain stable:

- `attack`
- `ability`

Player-facing labels are:

- **Signature Attack**
- **Signature Ability**.

### Reward value vs rarity

Reward value is gameplay risk/reward. Rarity remains Basic / Rare / Extra Rare / Mythic. Neither implies the other.

### Printing vs gameplay class

Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic are cosmetic printings and never alter HP, actions, Reward value, rule class or legality.

### Ordinary damage vs counters

The engine keeps separate semantics for:

- ordinary attack/effect damage;
- `PLACE_DAMAGE`;
- `MOVE_DAMAGE`;
- turn-transition Condition counter placement.

Counter operations follow their own defeat boundary and precision rules.

---

## Card-header consistency

The ten approved showcase families remain the visual composition reference, but concept-art numbers do not create gameplay properties.

Current ordinary `sb-tcg-card-v0.2` Creatures do not define a generic play/evolution Cost.

`tcg-card-visual-printing-v1.1.json` therefore requires:

- top-left badge slot may show a real structured header property or nonnumeric class/stage/special-rule badge;
- numeric Cost only when the schema truly defines one;
- Element/type top-right;
- name/stage plus clearly labelled HP in the upper identity/header area;
- large art;
- exactly two ordinary Creature action slots;
- Withdraw Cost bottom-right.

---

## Renderer requirements for future special cards

When applicable, the premium renderer must support:

- special mechanic/class badge;
- Reward value/rule marker;
- exact evolution parent or assembly requirement;
- Signature Power marker and spent state;
- trait/rule/faction tags;
- ordinary Ability/Attack action slots;
- extra-cost bonus requirement;
- current position/form/element state;
- inherited-action indication;
- multi-component/assembly state;
- printing rarity/finish separately from gameplay class.

The ordinary Creature action rule remains:

- **Ability + Attack 1**, or
- **Attack 1 + Attack 2**.

Only a reviewed generic special-family contract may define a different renderer shape; never a one-card exception.

---

## Engine ownership mapping

No new owner is automatically required.

- card identity / special class / tags / series metadata → Content Registry #1
- printing/variant → Printing/Art Metadata #3
- singleton/group/format limits → Deck Builder/Legality #6
- evolution/overlay/assembly → Creature/Evolution #13 where appropriate
- Attacks / inherited/granted Attacks → Attack #14
- active/Signature Abilities → Active Ability #15 + shared usage/timing receipt
- Tactics/support play → Tactic #16 where applicable
- attached granted rules/Attacks → Relic #17 where applicable
- persistent field/form interactions → Realm #18 where applicable
- Essence characteristics/attachment → Essence Attachment #22
- costs/bonus payment → Cost #25 / Payment #26
- movement/components/Void/zone-characteristic handling → Card-Zone #30
- defeat Reward value → Reward Cards #32
- hidden/private queries → Hidden Information #33

A new owner is justified only by a genuinely new state transition that cannot correctly belong to an existing owner.

---

## Acceptance conclusion

V1.1 is **self-contained** and preserves the full V1 rule matrix plus the post-test corrections:

- original Stream Bandit names rather than external brand labels;
- complete capability/family distinctions;
- complete renderer requirements;
- complete owner mappings;
- global ordinary Vulnerability ownership;
- exceptional Resistance/override support;
- schema-honest card headers;
- damage-counter semantic separation;
- generic, additive future-series architecture;
- Evergreen age compatibility for older cards.
