# Stream Bandit TCG — Card Pass 2 — Schema Amendment P — Layered Protection, Passive Placement & Realm Counterplay

**Status:** Binding additive future-capability amendment. Branch design only. No production registry, migration, deployed engine or Set One card is changed by this file.

**Purpose:** Formalize layered defensive interaction so attack-damage protection, condition immunity, damage-placement protection, switching protection and Realm ownership remain independent. Also add a generic passive periodic damage-placement aura that can defeat low-HP utility walls once their separate placement protection is removed.

---

## P-01 — Protection layers are independent

The engine must never collapse these into one `immune` flag:

1. **attack-damage protection** — prevents/reduces matching attack damage only;
2. **effect-damage protection** — prevents/reduces explicit effect-damage packets;
3. **condition immunity** — prevents selected conditions from being newly applied/replaced;
4. **damage-placement protection** — prevents `PLACE_DAMAGE` / `PLACE_DAMAGE_MULTI` or reduces placed amount;
5. **damage-movement protection** — prevents hostile `MOVE_DAMAGE` destination or limits moved amount;
6. **switch/movement protection** — prevents or restricts specified forced/effect movement;
7. **targeting protection** — separate capability; never implied by any of the above.

A Creature may legally have more than one layer from its own Ability, attached Relic/tool, Realm or another friendly source. Each layer is evaluated independently.

---

## P-02 — Stacked defence remains answerable

A low-HP utility wall can become difficult to remove when multiple layers are assembled, for example:

- its Ability prevents attack damage from a powerful attacker class;
- an attached Relic prevents selected conditions;
- the active Realm prevents opposing damage placement.

That board state is legal, but the design audit must identify practical ways to dismantle at least one layer. Common answers include:

- replace the active Realm;
- remove/discard the Relic;
- switch/force the Creature out if legal;
- attack with an unmatched attacker class;
- use effect damage if not separately protected;
- use a passive placement aura after placement protection is removed;
- disable/suppress an Ability through an explicit legal effect.

No one protection source may silently inherit the protections of another.

---

## P-03 — Realm replacement is a first-class counterplay action

Stream Bandit retains one shared active Realm slot.

When a new Realm legally enters that slot:

1. the previous Realm stops being active before the new Realm's continuous effects become authoritative;
2. previous-Realm continuous protections no longer apply to later events;
3. any already-placed damage/conditions remain unless the new Realm explicitly changes them;
4. event listeners from the replaced Realm cannot trigger on future events;
5. the replacement itself emits `realm_replaced` with old/new source ids and controller/action ids.

This makes Realm replacement a deliberate method of dismantling board protection rather than merely changing scenery.

---

## P-04 — Damage-placement protection

Add/normalize:

```json
{
  "kind":"damage_placement_protection",
  "target_scope":"friendly_field",
  "source_filter":{"controller":"opponent"},
  "mode":"prevent_all"
}
```

Supported target scopes include:

- `friendly_vanguard`
- `friendly_reserve`
- `friendly_field`
- `$source_creature`
- explicit selector sets

Supported modes:

- `prevent_all`
- `reduce` with amount, minimum zero

This protection affects `PLACE_DAMAGE` / `PLACE_DAMAGE_MULTI` only. It does not stop attack damage, effect damage, conditions, healing reduction, or damage movement unless separately stated.

---

## P-05 — Damage-movement protection

Add/normalize:

```json
{
  "kind":"hostile_damage_movement_protection",
  "target_scope":"friendly_field",
  "mode":"prevent_all"
}
```

This rejects hostile `MOVE_DAMAGE` into the protected destination but does not prevent the controller from moving damage among their own creatures unless the source explicitly says so.

---

## P-06 — Condition immunity from attached Relics/tools

Condition protection may be attached-source continuous metadata:

```json
{
  "kind":"condition_immunity",
  "target":"$attached_creature",
  "conditions":["Scorched","Venomed","Blinded"],
  "source_controller":"self"
}
```

Rules:

- only listed conditions are blocked;
- existing conditions are not automatically cleared;
- the Relic being removed immediately removes future immunity;
- condition immunity does not stop damage placement/counters;
- a card may protect all conditions only if the design audit justifies the breadth and counterplay.

---

## P-07 — Passive periodic damage placement aura

Add a generic listener shape for a Froslass-style design pattern without copying another game's card identity:

```json
{
  "event":"aftermath_started",
  "controller_scope":"any",
  "limit":{"scope":"aftermath","count":1,"owner":"source_instance"},
  "requirements":[{"predicate":"source_in_play"}],
  "steps":[{
    "op":"PLACE_DAMAGE_MULTI",
    "selector":{
      "controller":"any",
      "zone":"field",
      "filters":{"ability_class":"defined_filter"},
      "exclude_source_family":true
    },
    "amount_each":10
  }]
}
```

Key rules:

1. this is **damage placement**, not attack damage and not effect damage;
2. Weakness/Resistance never modify it;
3. Shield does not stop it;
4. attack-damage protection does not stop it;
5. condition immunity does not stop it;
6. damage-placement protection can stop/reduce it;
7. every affected Creature receives an independent placement event and immediate defeat check;
8. source exclusions and target filters must be explicit and registry-driven;
9. the client never chooses targets for an automatic aura unless the card explicitly requires player choice.

Because every current Stream Bandit Creature normally has one named Ability, future cards should **not** use a naive `has_ability=true` filter across the whole game. They should use a deliberate registry class/trait/filter such as active Ability class, prestige class, marked trait, damaged state, condition state, or another reviewed selector.

---

## P-08 — Timing owner

Stream Bandit does not add a separate global Pokémon-style checkpoint phase merely for this mechanic.

Periodic automatic placement should normally bind to an existing authoritative timing point, preferably:

- `aftermath_started`, or
- `aftermath_finished`

The card definition must choose one. The same event id cannot resolve twice on reconnect/retry.

This preserves the existing turn model while supporting recurring board auras.

---

## P-09 — Simultaneous multi-target placement

When an automatic aura places damage on multiple creatures:

1. determine the full legal target set from the same pre-resolution snapshot;
2. apply each placement packet deterministically;
3. record all resulting defeats;
4. process defeat/Reward/win consequences through the shared defeat owner;
5. do not let an earlier target's defeat retroactively remove another target from the already-snapshotted aura unless the source itself leaves play and the rules explicitly require immediate source-presence revalidation.

The consolidated validator must choose and enforce one source-presence policy for each listener; default is snapshot-on-trigger.

---

## P-10 — Layer interaction example

A legal future board state may contain:

- **Utility Wall Ability:** prevent all attack damage from Mythic attackers;
- **Attached Ward Relic:** cannot newly receive selected conditions;
- **Active Sanctuary Realm:** opponent cannot place damage on friendly field creatures.

Result:

- matching Mythic attack damage fails;
- listed conditions fail;
- hostile direct damage placement fails while Sanctuary is active;
- unmatched attackers/effect damage remain legal unless another layer protects them.

If the opponent legally replaces Sanctuary with another Realm, the placement protection ends. A passive periodic placement aura can then place damage on the utility wall at the next legal timing window, even though its attack-damage wall and condition ward remain intact.

This is the intended layered-counterplay pattern.

---

## P-11 — Suppression / source removal

Future effects may disable a protection source through explicit operations such as:

```json
{"op":"SUPPRESS_ABILITY","target":"$target_creature","duration":{"expires_on":["end_of_turn"]}}
```

or Relic/Realm removal/replacement.

Suppression must identify exactly what is disabled:

- Creature Ability only;
- attached Relic continuous effect only;
- Realm continuous/listener effects only;
- a specific named structured modifier.

No generic `disable_everything` operation is allowed without an exceptional reviewed rule.

---

## P-12 — Events / predicates

Add/normalize:

- `realm_replaced`
- `damage_placement_prevented`
- `hostile_damage_movement_prevented`
- `condition_application_prevented`
- `protection_layer_removed`
- `ability_suppressed`
- `source_in_play`
- `source_family_matches`
- `target_has_protection_kind`

All carry authoritative action/turn/event ids.

---

## P-13 — Validator guards

Reject:

1. a single ambiguous `immune` field that conflates protection layers;
2. attack-damage protection that also blocks conditions/placement without explicit additional metadata;
3. condition immunity that clears existing conditions unless a separate clear operation exists;
4. Realm protection that continues after the Realm is legally replaced;
5. periodic automatic placement without a deterministic timing owner;
6. a naive `has_ability` global selector when all ordinary Stream Bandit creatures satisfy it;
7. client-side target enumeration for automatic passive auras;
8. protection stacks that create no practical counter route in the relevant environment;
9. periodic damage placement being multiplied by Weakness or absorbed by Shield;
10. source-name/card-id runtime branches instead of registry filters.

---

## Amendment P conclusion

The living rules now support the deeper utility-wall metagame:

- selective attack walls can be reinforced by separate Relic and Realm protections;
- each layer remains mechanically distinct;
- Realm replacement can deliberately strip a placement-protection layer;
- passive periodic damage placement can then defeat a wall without using direct attack damage;
- the engine retains clear counters rather than allowing a single all-purpose immunity flag.
