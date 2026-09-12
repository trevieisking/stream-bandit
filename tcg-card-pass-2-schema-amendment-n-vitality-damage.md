# Stream Bandit TCG — Card Pass 2 — Schema Amendment N — Vitality, Damage Movement & Ranged Placement

**Status:** Binding additive future-capability amendment for the living TCG rules/schema. Branch design only. No production registry, migration, deployed engine or Set One card definition is changed by this file.

**Purpose:** Add one deterministic shared grammar for health/vitality stealing, moving existing damage between creatures, turn-based drain effects and rare ranged multi-target damage placement. These mechanics are required for future Fairy/Underworld design and future Tide ranged cards, but are not retroactively granted to Set One cards.

---

## N-01 — Damage terms are distinct

The engine must distinguish four concepts:

1. **Attack damage** — damage produced by a declared attack. Normal Weakness/Resistance and attack modifiers may apply.
2. **Effect damage** — damage dealt by an Ability/Tactic/Essence/Realm effect. Weakness never multiplies it. Shield/prevention applies unless the effect explicitly uses damage-placement semantics instead.
3. **Damage placement** — direct placement of damage on a Creature rather than damage being dealt. It does not use Weakness/Resistance and does not consume Shield because Shield prevents damage dealt; it does not erase already-placed damage. This must always be explicit in card metadata/text.
4. **Damage movement** — remove existing damage from one Creature and place the same amount on another Creature. This is neither healing nor damage dealt. It does not use Weakness/Resistance and does not interact with Shield.

Amounts are expressed in normal Stream Bandit HP units and current card design should use multiples of 10.

---

## N-02 — Generic effect damage

Add/normalize:

```json
{
  "op":"DEAL_EFFECT_DAMAGE",
  "target":"$target_creature",
  "amount":20,
  "source":"$source_card",
  "damage_element":null
}
```

Rules:

- Weakness/Resistance do not modify this packet.
- Normal Shield/prevention applies.
- `actual_hp_damage` is the amount left after prevention/Shield and before defeat processing.
- defeat processing occurs through the ordinary shared defeat owner.
- a source cannot infer attack damage from this operation.

---

## N-03 — Vitality drain / health stealing

Add:

```json
{
  "op":"DRAIN_VITALITY",
  "target":"$opposing_creature",
  "amount":20,
  "heal_target":"$source_creature",
  "heal_cap":20
}
```

Semantics:

1. deal `amount` as effect damage;
2. resolve prevention and Shield normally;
3. record `actual_hp_damage` that reached the target;
4. heal `heal_target` by `min(actual_hp_damage, heal_cap, missing_hp)`;
5. if zero HP damage reached the target, zero vitality is stolen;
6. healing never exceeds printed/effective HP;
7. the drain and heal are one atomic effect for replay/event attribution, with defeat checks after the damage packet and before illegal follow-up targeting;
8. Weakness/Resistance never increase the stolen amount.

This is the canonical health-stealing mechanic.

---

## N-04 — Four ordinary recurring drain bands

Future cards may use four default recurring health-steal bands:

- **10** — light recurring drain; may be attached to an easy once-per-turn condition.
- **20** — normal recurring drain; requires a clear trigger/condition or activation.
- **40** — heavy drain; must be once per turn and require meaningful setup/cost/board state.
- **60** — apex recurring drain; requires a severe gate, major cost, once-per-match use, Starbound gate or equivalent high-rarity restriction.

These numbers are design bands, not automatic card effects. Cards must still contain explicit structured metadata and limits.

A normal passive listener may not drain repeatedly from the same event chain. The listener/event idempotency key must prevent recursive drain/heal loops.

---

## N-05 — Turn-based drain

Turn-based health stealing uses ordinary lifecycle events such as `turn_started`, `aftermath_started`, `aftermath_finished` or a once-per-turn active Ability.

Example:

```json
{
  "event":"turn_started",
  "controller_scope":"self",
  "limit":{"scope":"turn","count":1,"owner":"source_instance"},
  "requirements":[{"predicate":"source_in_play"}],
  "steps":[{"op":"DRAIN_VITALITY","target":"$opposing_vanguard","amount":20,"heal_target":"$source_creature","heal_cap":20}]
}
```

A turn-based drain must never trigger simply because the client remained connected or replayed a command; authoritative event ids + listener-use state own the trigger.

---

## N-06 — Move existing damage

Add:

```json
{
  "op":"MOVE_DAMAGE",
  "from":"$source_creature",
  "to":"$destination_creature",
  "amount":30,
  "allow_partial":true
}
```

Rules:

1. remove no more damage than currently exists on `from`;
2. place exactly the removed amount on `to`;
3. this does **not** emit an ordinary `healed` event;
4. this does **not** emit an ordinary damage-dealt event;
5. emit `damage_moved` with source, destination and actual amount;
6. Shield, Weakness and Resistance do not apply;
7. destination defeat checks occur immediately after placement;
8. movement cannot target a Creature already removed from play;
9. movement cannot create negative damage on the source;
10. optional movement that can move zero is treated as no action.

Friendly-to-friendly damage movement may be used as a normal tactical support mechanic.

---

## N-07 — Rare hostile damage transfer

Moving damage **from one of your creatures onto an opposing creature** is explicitly supported, but it is a rare/high-value effect and must opt in:

```json
{
  "op":"MOVE_DAMAGE",
  "from":"$friendly_creature",
  "to":"$opposing_creature",
  "amount":40,
  "allow_opposing_destination":true
}
```

Validation rules:

- ordinary hostile-transfer effects should normally remain within **10–60**;
- they require explicit target restrictions, usage limit and source attribution;
- they cannot be inferred from generic heal/damage wording;
- 120-point hostile placement/transfer belongs only to explicitly high-tier effects, never routine passive triggers.

This gives Underworld/Fairy and later cards a controlled way to redistribute wounds without inventing a second HP system.

---

## N-08 — Direct damage placement

Add:

```json
{
  "op":"PLACE_DAMAGE",
  "target":"$target_creature",
  "amount":40
}
```

`PLACE_DAMAGE` is intentionally stronger/different from `DEAL_EFFECT_DAMAGE`:

- no Weakness/Resistance;
- no Shield consumption/prevention;
- the amount is placed directly as damage;
- defeat checks run immediately after placement;
- card wording/UI must say **place damage**, not “deal damage”, so players can distinguish it.

Ordinary placement should be uncommon and carefully costed.

---

## N-09 — Ranged multi-target placement

Add grouped targeting:

```json
{
  "op":"PLACE_DAMAGE_MULTI",
  "controller":"opponent",
  "zone":"field",
  "count":{"min":1,"max":2},
  "distinct":true,
  "amount_each":120
}
```

This supports the future **Tide ranged/sniper** concept requested for rare cards: place up to **120 damage on each of two different opposing creatures**.

Because `120 × 2` direct placement is extremely high impact, the validator must reject this shape unless the source carries an explicit high-tier gate such as:

- Starbound / shared once-per-match marker;
- explicit once-per-match Ability;
- very high attached-Essence/board requirement;
- substantial discard/resource cost;
- or an equivalent future rarity/integrity gate approved by the current rules.

It is **not** part of Set One Marevault by default and is not silently added to an existing Tide card. It is reserved for a future Tide ranged/marksman identity or equivalent expansion card.

---

## N-10 — Targeting zones

Future ranged/damage-placement effects may explicitly target:

- opposing Vanguard;
- opposing Reserve;
- any opposing field Creature;
- up to N distinct opposing field Creatures.

Reserve access must always be explicit. Ordinary attacks still target Vanguard unless another accepted rule grants an alternate target.

---

## N-11 — Event model

Add events/bindings:

- `effect_damage_dealt`
- `vitality_drained`
- `damage_placed`
- `damage_moved`
- `$damage_source`
- `$damage_destination`
- `$actual_hp_damage`
- `$actual_damage_moved`
- `$actual_damage_placed`

These events carry source card/action, controller, target, amount and turn/action ids for deterministic replay.

---

## N-12 — Loop and integrity guards

Reject:

1. drain effects that heal from prevented/Shielded damage rather than actual HP damage;
2. damage movement that also triggers normal healing bonuses unless a card explicitly listens to `damage_moved`;
3. recursive drain → heal → drain loops from the same event chain;
4. moving more damage than exists on the source;
5. direct placement disguised as attack damage to obtain Weakness bonuses;
6. multi-target 120 placement without an explicit high-tier gate;
7. client-selected random/hidden targets where the server owns the choice;
8. hostile damage transfer without `allow_opposing_destination=true`;
9. non-distinct target duplication in a multi-target effect unless explicitly allowed by a future rule.

---

## N-13 — Element identity guidance

This grammar is shared by all future sets, but the first planned identities are:

- **Underworld:** strongest natural home for vitality drain, wound transfer to opponents, high-cost/high-reward pain conversion and defeat-linked value.
- **Fairy:** strongest natural home for protective redistribution, moving damage among friendly creatures, cleansing, clever healing and selective reversal/transfer effects.
- **Tide:** strongest natural home for rare ranged/multi-target damage placement through water-pressure/sniper-style effects.

No mechanic is permanently element-exclusive unless a later rule explicitly says so.

---

## Amendment N conclusion

The engine now has a planned deterministic home for:

- health stealing / vitality drain;
- four recurring drain power bands from 10 to 60;
- turn-based draining;
- moving existing damage between creatures;
- rare movement of friendly damage onto an opponent;
- direct damage placement;
- rare `120 × 2` ranged placement for future Tide design;
- exact Shield/Weakness/defeat behavior for each concept.

This is future-capability structure only. Set One remains unchanged unless a later reviewed balance pass explicitly chooses to retrofit a mechanic.