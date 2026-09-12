# Stream Bandit TCG — Future Elements Plan — Fairy + Underworld

**Status:** Living expansion design plan. Branch-only. Does not change Set One's locked 193 identities, eight current starters, production registry, migrations or deployed gameplay.

**Purpose:** Complete the second global matchup chain by designing Fairy and Underworld as full future elements using the same disciplined element-package model used for the first eight current elements.

---

# 1. Matchup chain

The second global matchup chain remains:

`Astral → Martial → Shade → Fairy → Underworld → Astral`

Arrow meaning: the left side attacks the right side for Weakness.

Therefore:

- Astral is strong into Martial.
- Martial is strong into Shade.
- Shade is strong into Fairy.
- Fairy is strong into Underworld.
- Underworld is strong into Astral.

`Martial` remains a **Creature Type**, not an Essence element.

`Fairy` and `Underworld` become future **full elements** with their own Essence, creatures, Tactics, starters and pack-only identities.

Weakness is still owned by the global matchup table, never duplicated as routine per-card `weakness` data.

---

# 2. Expansion package shape

Each new element should be built with the same package discipline as the current eight:

- **24 gameplay identities**
- **11 Creatures**
- **4 Essence**
- **9 Tactics**
- **3 pack-only identities**
- **1 exact 60-card starter** using **21 identities**
- **2 complete Baby → Teen → Adult evolution lines**
- **4 Standalone starting creatures**, including the element's Mythic/Starbound creature after stage normalization
- exactly **1 Mythic + Starbound identity** for the initial element package unless a later expansion rule deliberately changes that pattern
- ordinary identity deck limit 4; Mythic identity limit 1; Essence follows the global Essence allowance
- printed HP still 40–390
- all gameplay expressed through the shared deterministic effect grammar
- no card-name runtime branches

This creates **48 future gameplay identities** across Fairy + Underworld while leaving Set One's 193 unchanged.

---

# 3. Fairy identity

## Core fantasy

Fairy is **magical, enchanted, graceful, clever and protective**, but it must be competitively serious rather than a cosmetic/cute-only element.

## Mechanical identity

Primary Fairy mechanics:

1. **protective redistribution** — move existing damage away from a critical creature onto another legal friendly creature;
2. **selective reversal** — in rarer cases redirect or transfer a bounded amount of existing damage onto an opposing creature;
3. **cleansing** — remove conditions, especially control/modifier conditions, without making Fairy universally immune;
4. **healing amplification** — turn precise healing into Shield, temporary attack bonuses or movement advantages;
5. **enchantment** — temporary buffs, condition protection and elegant transformation/repositioning;
6. **graceful movement** — effect switches and withdrawal support rather than Gale's pure positional tempo;
7. **conditional vitality drain** — lower-to-mid drain values used as magical siphoning/recovery, generally smaller than Underworld's drain ceiling.

## Intended condition relationship

Fairy should have strong tools against hostile control but should not simply nullify Shade. Shade remains strong into Fairy through the global matchup chain, so Fairy's defensive tools require timing/resources rather than blanket immunity.

## Damage movement identity

Fairy is the cleanest home for **friendly damage redistribution**:

- move 10–30 damage from one friendly creature to another;
- move damage from a key Vanguard onto a sturdier Reserve creature;
- rare effects may move 10–40 existing damage from one of your creatures onto an opposing creature, using Amendment N's explicit hostile-transfer gate.

Fairy should rarely use raw large direct-damage placement. Its identity is manipulation/protection, not sniping.

## Vitality drain bands

Likely Fairy use:

- 10 — common/light magical siphon;
- 20 — normal once-per-turn enchanted drain;
- 40 — rare gated Ability/attack payoff;
- 60 — exceptional Mythic/Starbound or severe setup only.

---

# 4. Underworld identity

## Core fantasy

Underworld is **high-cost, high-risk, high-reward**, built around pain, debt, sacrifice, wounds and power gained by surviving or redirecting consequences.

It must remain distinct from Shade:

- **Shade** = information warfare, mind/control conditions, prediction and disruption.
- **Underworld** = vitality drain, wound conversion, expensive commitments, defeat-linked value and dangerous payoffs.

## Mechanical identity

Primary Underworld mechanics:

1. **vitality drain / health stealing** — the strongest natural home for `DRAIN_VITALITY`;
2. **wound transfer** — move damage off your creatures and onto opponents in carefully bounded amounts;
3. **pain as cost** — place damage on your own creature to enable stronger effects;
4. **defeat-linked value** — bonuses after a friendly creature is defeated, without turning every defeat into free advantage;
5. **discard/resource sacrifice** — discard cards, attached Essence or other legal resources to fuel high-impact actions;
6. **revenge / debt markers** — future structured counters may track a bounded obligation or payoff;
7. **dangerous persistence** — effects that continue turn-by-turn while the source remains in play and can be removed/countered by normal gameplay.

## Vitality drain bands

Underworld gets the broadest access to the four planned drain bands:

- **10** — common recurring chip drain;
- **20** — standard once-per-turn drain;
- **40** — strong gated drain requiring cost/condition;
- **60** — apex recurring or once-per-match drain with major cost/Starbound-level gate.

No passive drain may recursively retrigger itself from the healing it creates.

## Hostile damage transfer

Underworld is the primary home for moving existing damage from your creature to an opponent:

- normal range: **10–60**;
- source must actually contain enough damage to move;
- Shield does not block moved damage because it is placement of existing wounds, not damage dealt;
- Weakness does not multiply it;
- a creature can be defeated by transferred damage and ordinary defeat/Reward processing then occurs.

Large transfers above 60 should be rare and require explicit high-tier gates.

---

# 5. Tide ranged / sniper expansion mechanic

Tide remains the best home for rare **ranged water-pressure damage placement**.

This is not ordinary attack targeting and does not change Set One Skyrend/Gale rules.

Future Tide cards may include a dedicated ranged/marksman family whose Abilities/Starbound effects can target opposing Reserve creatures through explicit selectors.

## Ordinary ranged bands

Planned ranged effect-damage/placement bands:

- 10 — chip pressure / setup;
- 20 — light Reserve pressure;
- 40 — meaningful ranged hit;
- 60 — strong once-per-turn or gated hit.

## Rare apex effect

A future high-tier Tide card may use:

> Choose up to 2 different opposing creatures. Place 120 damage on each chosen creature.

Engine representation: Amendment N `PLACE_DAMAGE_MULTI`, two distinct opponent field targets, 120 each.

This **must** have a major gate such as:

- Starbound once-per-match;
- once-per-match Ability;
- very high Tide Essence requirement;
- severe discard/board requirement;
- or equivalent high-tier restriction.

It cannot be a routine once-per-turn Ability.

Because it is **damage placement**, Shield and Weakness do not alter the 120. This distinction must be explicit to players in card text/UI.

---

# 6. Four recurring Ability bands

The requested four recurring power bands are planned as a reusable design ladder for vitality/ranged effects:

| Band | Amount | Typical use |
|---|---:|---|
| I | 10 | easy/light trigger, low impact |
| II | 20 | ordinary once-per-turn Ability |
| III | 40 | meaningful setup/cost required |
| IV | 60 | severe gate / rare / Mythic-adjacent |

These are not four mandatory Abilities on every card. They are **four reusable balance bands** for designing drain/ranged effects across future sets.

The 120 × 2 effect sits above Band IV and is treated as an apex exception with explicit high-tier gating.

---

# 7. Required engine support before expansion registry freeze

The engine must support, through generic metadata:

- `DRAIN_VITALITY`
- `MOVE_DAMAGE`
- `PLACE_DAMAGE`
- `PLACE_DAMAGE_MULTI`
- opponent/friendly field target selectors
- distinct multi-target choice
- actual HP damage capture after Shield/prevention
- actual damage moved/placed events
- turn-based listener limits
- once-per-match gates
- hostile transfer opt-in
- recursion/idempotency protection
- deterministic defeat processing after moved/placed damage

All of this is now planned in Schema Amendment N.

---

# 8. Build order

The two elements are not to be improvised directly into production.

Build them using the same staged process as the first eight:

1. lock Fairy element identity and 24-name inventory;
2. design Fairy two evolution families + four Standalones + Mythic/Starbound;
3. design Fairy four Essence + nine Tactics;
4. build exact Fairy 60-card starter;
5. run complete Fairy current-rules audit;
6. map Fairy to deterministic Card Pass schema;
7. repeat the same six steps for Underworld;
8. test Fairy ↔ Underworld ↔ Astral/ Shade/ Martial matchup behavior through the global chain;
9. run deterministic simulation and human balance before freezing the expansion registry.

No per-card Weakness fields are introduced during this process.

---

# 9. Current naming/state

Names for the two future starters and the 48 card identities are intentionally **not frozen by this planning file**. They should be created through the same full-element design pass used for the first eight so creature families, pack-only cards, Essence and Tactics form coherent packages instead of isolated names.

---

## Expansion-plan conclusion

Fairy + Underworld are now planned as the two full future elements that complete the second matchup chain.

The shared future engine also explicitly plans:

- health stealing / vitality drain at 10, 20, 40 and 60 power bands;
- turn-based drain Abilities;
- moving existing damage among friendly creatures;
- rare hostile wound transfer;
- Tide ranged/Reserve pressure;
- an apex future `120 damage × 2 opposing creatures` placement effect behind a severe gate.

Set One remains unchanged while this expansion design proceeds.