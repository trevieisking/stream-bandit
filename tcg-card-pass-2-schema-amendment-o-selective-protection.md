# Stream Bandit TCG — Card Pass 2 — Schema Amendment O — Selective Protection / Utility Walls

**Status:** Binding additive future-capability amendment. Branch design only. No production registry, migration, deployed engine or Set One card is changed by this file.

**Purpose:** Add a deterministic shared model for low-HP utility creatures that can completely prevent attack damage from clearly defined attacker categories while remaining answerable through other legal game routes. This is inspired by the useful TCG design pattern where a small creature can wall a powerful class of attacker; Stream Bandit uses its own traits/classes/rules and does not copy another game's card identity.

---

## O-01 — Protection is not untargetability

Selective protection means:

- the protected creature may still be chosen as a legal attack target;
- the attack still declares and pays its normal cost;
- attack effects that are not damage resolve unless separately prevented;
- the matching attack's **damage packet** is reduced/prevented according to the protection effect;
- the protection does not automatically stop conditions, switching, hand/deck effects, direct effect damage, damage placement or damage movement.

A card that cannot be targeted at all requires a different explicit rule and is not implied by this amendment.

---

## O-02 — Generic attacker-filtered protection

Add continuous protection metadata:

```json
{
  "kind":"incoming_attack_damage_protection",
  "target":"$source_creature",
  "attacker_filter":{
    "traits_any":["Mythic"],
    "starbound_enabled":null,
    "stages":[],
    "elements":[],
    "creature_types":[]
  },
  "mode":"prevent_all"
}
```

Supported filter axes are explicit and additive:

- `traits_any` / `traits_all`
- `starbound_enabled`
- `stages`
- `elements`
- `creature_types`
- future explicit registry tags approved by the rules

No protection may infer a category from card name, artwork, rarity text or printed prose.

---

## O-03 — Partial and complete prevention

The same owner supports:

```json
{"mode":"prevent_all"}
```

or

```json
{"mode":"reduce","amount":30}
```

`prevent_all` sets the current matching **attack-damage packet** to zero at the prevention stage.

`reduce` subtracts the stated amount, minimum zero.

This is prevention, so it emits the ordinary `damage_prevented` event with source attribution.

---

## O-04 — Damage pipeline placement

Selective protection resolves after attack base damage, attack bonuses and Weakness are known, but before Shield is consumed and HP damage is applied.

Canonical order remains:

1. build attack damage;
2. apply attack/global matchup rules including Weakness once maximum;
3. apply explicit Resistance;
4. apply attacker/defender reductions and prevention, including selective protection;
5. apply Shield;
6. apply remaining HP damage;
7. resolve after-damage effects, defeats, Rewards and win timing.

If `prevent_all` reduces attack damage to zero, Shield is not consumed by that damage packet.

---

## O-05 — What selective protection does NOT stop

Unless the same card has an additional explicit effect, attacker-class protection does **not** prevent:

- `DEAL_EFFECT_DAMAGE`;
- `PLACE_DAMAGE`;
- `PLACE_DAMAGE_MULTI`;
- `MOVE_DAMAGE` hostile transfer;
- recoil/self-damage;
- Scorched/Venomed/other condition damage;
- application/replacement of conditions from an attack or Ability when the condition effect is legally separate from the prevented damage;
- switches/movement;
- discard/deck/hand manipulation;
- Realm/Tactic/Essence effects.

This distinction is mandatory so a utility wall remains interactive.

---

## O-06 — Low-HP utility wall design profile

A future card using `prevent_all` against a broad powerful attacker class should normally follow a utility-wall profile:

- printed HP generally in the **40–120** range;
- ordinary one-Reward Creature unless a reviewed design deliberately says otherwise;
- modest attack damage/output;
- its strategic value comes from matchup utility rather than raw stats;
- it must not simultaneously possess broad full-damage immunity plus high HP plus premium offensive output without a severe gate.

The HP range is design guidance, not a new global HP rule; the existing printed 40–390 rule remains authoritative.

---

## O-07 — Required counterplay

Before a broad `prevent_all` utility wall is accepted into a card set, the design audit must identify at least **two practical counter routes** available in the environment, such as:

1. attack with a Creature that does not match the protected attacker filter;
2. use effect damage;
3. use damage placement or hostile damage movement;
4. apply relevant conditions;
5. force/reward switching or positional play;
6. remove/disable the protection through an explicit legal effect;
7. use another planned mechanic that legally bypasses attack-damage prevention.

A card is rejected at design audit if its protection creates a routine board state that the opposing deck cannot reasonably answer.

---

## O-08 — Protection examples for Stream Bandit

The grammar can support future designs such as:

### Prestige ward

```json
{
  "kind":"incoming_attack_damage_protection",
  "target":"$source_creature",
  "attacker_filter":{"traits_any":["Mythic"]},
  "mode":"prevent_all"
}
```

A low-HP utility creature could wall Mythic attack damage while remaining vulnerable to ordinary creatures and non-attack effects.

### Starbound ward

```json
{
  "kind":"incoming_attack_damage_protection",
  "target":"$source_creature",
  "attacker_filter":{"starbound_enabled":true},
  "mode":"prevent_all"
}
```

This matches any attacking creature carrying Starbound prestige metadata; it does not consume or disable the attacker's Starbound marker.

### Type ward

```json
{
  "kind":"incoming_attack_damage_protection",
  "target":"$source_creature",
  "attacker_filter":{"creature_types":["Martial"]},
  "mode":"prevent_all"
}
```

Useful for future second-chain matchup cards without inventing new Weakness data.

These are examples of the grammar only; no Set One or expansion identity receives them automatically.

---

## O-09 — Protection from effects is a separate capability

If a future card should also prevent Ability/Tactic effect damage or direct placement, that must be encoded separately, for example:

```json
{
  "kind":"effect_damage_protection",
  "source_filter":{"controller":"opponent"},
  "mode":"prevent_all"
}
```

Direct damage placement immunity would require its own explicit `damage_placement_protection` capability.

The default selective-protection pattern remains **attack damage only**.

---

## O-10 — Temporary protection

Protection may be temporary by using the existing lifecycle grammar:

```json
{
  "kind":"incoming_attack_damage_protection",
  "attacker_filter":{"traits_any":["Mythic"]},
  "mode":"prevent_all",
  "duration":{
    "expires_on":["end_of_opponent_next_turn"],
    "max_uses":1,
    "consume_on":"matching_attack_damage_prevented"
  }
}
```

Temporary protection must state both duration and use consumption when relevant.

---

## O-11 — Events and predicates

Add/normalize:

- `matching_attack_damage_prevented`
- `attacker_matches_filter`
- `attack_damage_fully_prevented`
- `$attacking_creature`
- `$protection_source`

These events carry action/turn ids so command retries cannot consume or re-trigger protection twice.

---

## O-12 — Validation guards

The consolidated validator must reject:

1. attacker protection keyed to card names/ids rather than declared registry traits/classes;
2. `prevent_all` without an explicit attacker filter unless a separate reviewed global-immunity mechanic exists;
3. protection that silently blocks non-damage attack effects;
4. protection that consumes Shield before setting matching attack damage to zero;
5. a broad permanent utility wall whose design audit documents no practical counter routes;
6. a low-HP wall being made effectively invulnerable by stacking multiple overlapping `prevent_all` filters without explicit balance approval;
7. using selective protection as a disguised per-card Weakness/Resistance system.

---

## O-13 — Element placement guidance

Selective protection is a shared engine mechanic, not element-exclusive.

Natural early homes include:

- **Fairy:** wards, enchantments and clever low-stat defensive utility;
- **Astral:** prediction/foresight-based temporary protection;
- **Stone:** narrower reduction/armour versions rather than broad magical immunity;
- future neutral/Prismatic utility cards.

Underworld may instead be more likely to bypass or convert protection through pain/damage-placement mechanics rather than owning broad wards itself.

---

## Amendment O conclusion

The living rules now explicitly support the useful **small utility wall** pattern:

- low HP can coexist with high strategic value;
- attack damage can be prevented from a defined attacker class such as Mythic/Starbound/Martial;
- the card remains targetable and interactive;
- effect damage, conditions, damage placement/movement and unmatched attackers remain valid counterplay unless separately protected;
- the mechanic is data-driven and cannot become another card-name runtime exception.
