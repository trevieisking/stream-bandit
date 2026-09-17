# Stream Bandit TCG — Special Mechanic Rule Matrix V1

**Date:** 2026-09-17  
**Purpose:** Convert the supplied historical/current special-card examples into generic Stream Bandit rule capabilities while separating what the player sees on the card from what the engine must enforce globally.

## Core finding

The supplied cards are valuable because they expose the visible rules of their special mechanic families. However, **the printed card alone is not always the complete rules source**.

A complete implementation needs both:

1. **card-facing rule text / badges / costs** — what the player reads and selects; and
2. **family/global rules** — deck-building, once-per-game receipts, evolution eligibility, assembly, inheritance, destination replacement, or special knockout value enforced by the engine.

Stream Bandit therefore stores both as structured data rather than relying on rendered text.

---

## Rule matrix

| Mechanic pattern visible in supplied examples | What must be visible on the Stream Bandit card | What the engine must enforce | Generic Stream Bandit capability |
|---|---|---|---|
| High-stakes 2-Reward Creature | special-class badge/rule marker and clear defeat value | opponent gains 2 Rewards on defeat | **Ascendant Creature** / `reward_value:2` |
| High-stakes 3-Reward Creature | special-class badge/rule marker and clear defeat value | opponent gains 3 Rewards on defeat | **Colossus Creature** / `reward_value:3` |
| Once-per-match special attack | clearly marked special attack | one shared use receipt across the controller's match | **Signature Power — Attack** |
| Once-per-match special Ability | clearly marked special Ability | one shared use receipt across the controller's match | **Signature Power — Ability** |
| Special evolution from a named/special predecessor | evolution parent shown on card | exact legal parent + ordinary evolution timing | special evolution prerequisite |
| Special evolution that immediately ends turn | timing/rule badge on the evolution | successful evolution triggers canonical end-turn | **Ascension Evolution** flag |
| Advanced form that still counts as prior special class | rule-class indicator | `counts_as` tag remains queryable by effects | inherited rule tags |
| Inherits prior attacks / Abilities | inherited-action indicator/renderer | lower-stack action list merged according to data | **Overform** inheritance |
| Upgrade keeps attachments and damage | overlay/evolution presentation | Card-Zone/Creature stack state preserved | overlay upgrade state retention |
| Multi-character special Creature | multiple beings in identity/art/name | ordinary Creature object with special tags/reward value | **Bonded Creature** |
| Multi-card assembled Creature | component/assembly indication | all required pieces + legal source zones + one battlefield object | **Convergence Creature** |
| One-per-deck special Creature | visible special-class marker | deck validator enforces shared/identity singleton limit | **Gleam Creature** |
| One powerful support card total from a group | group badge | deck validator enforces one card total from group | **Prime Card** |
| Card leaves discard path for special out-of-play zone | destination rule text | movement replacement sends card to Void instead of Discard | **Voidmarked Card** |
| Extra effect if extra resource is paid | attack shows base cost + bonus requirement | payment engine validates bonus threshold and effect branch | extra-cost bonus effect |
| Position-based protection | rule/Ability text on card | prevention checks current Vanguard/Reserve position | **Aspect Creature** / positional prevention |
| Alternate form/type | form/type marker | element/type metadata + effect targeting by current form | **Aspect Creature** |
| Special rule tags/factions | trait/tag printed on card | generic tag queries for cards/effects | `rule_tags[]` / `traits[]` |
| Multiple visual rarities of same card | finish/rarity treatment | same gameplay identity, different printing identity | Printing/Art Metadata #3 |

---

## Important family distinctions

### Old special evolution vs modern high-stakes form

A high-reward Creature class and an evolution timing rule are **separate capabilities**.

Example architecture:

- `reward_value:3`
- ordinary stage/evolution parent
- optional `on_evolve_end_turn:false`

versus another card using:

- `reward_value:2`
- exact special predecessor
- `on_evolve_end_turn:true`

Do not assume every visually similar advanced Creature shares the same evolution timing.

### Once-per-match special action vs ordinary Ability limit

These are also separate:

- ordinary active Ability: normally once during your turn unless the card says otherwise;
- Signature Power: once **for the whole match**, shared across all eligible Signature Power cards for that player.

The UI needs two different spent states and the server needs two different receipt scopes.

### Reward value is not rarity

`reward_value` is gameplay risk/reward.

Rarity remains:

- Basic
- Rare
- Extra Rare
- Mythic

A Mythic card does not automatically give extra Rewards, and a 2/3-Reward special Creature does not automatically have to be Mythic.

### Printing is not gameplay class

Shine / Holo / Full-Art / Alt-Art / Signature Mythic remain cosmetic printings and never alter rule class, attacks, HP, Ability, Reward value or legality.

---

## What the renderer must show

For future special cards, the premium renderer must be able to display, when applicable:

- special mechanic/class badge;
- Reward value/rule marker;
- evolution parent or assembly requirement;
- Signature Power marker and spent state;
- trait/rule tags;
- ordinary Ability / Attack action slots;
- extra-cost bonus requirement;
- position/form status;
- printing rarity/finish separately from gameplay class.

The existing ordinary Creature rule remains:

- **Ability + Attack 1**, or
- **Attack 1 + Attack 2**.

Only an explicitly defined future special family such as a Convergence Creature may request a different action renderer, and that requires its own reviewed generic contract rather than a one-card exception.

---

## Engine ownership mapping

No new owner is automatically required.

- special class / tags / series metadata → Content Registry #1
- printing/variant → Printing/Art Metadata #3
- singleton/group limits → Deck Builder/Legality #6
- evolution/overlay/assembly orchestration → Creature/Evolution #13 where appropriate
- attacks → Attack #14
- active/Signature Abilities → Active Ability #15 + shared usage receipt/timing owner
- cost/bonus payment → Cost #25 / Payment #26
- movement/assembly components/Void movement → Card-Zone #30
- defeat Reward value → Reward Cards #32

A new owner is only justified by a genuinely new state transition that cannot correctly belong to an existing owner.

---

## Acceptance conclusion

The supplied card examples support the V2.3 approach:

- do not recreate historical brand labels one-for-one;
- preserve the useful mechanics as composable Stream Bandit capabilities;
- keep visible rule information on the card;
- enforce hidden/global family rules in structured server-authoritative data;
- keep future series additive so old cards remain usable in the primary Evergreen format by age.
