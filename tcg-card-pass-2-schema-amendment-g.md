# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment G

**Status:** Binding additive amendment to the Card Pass 2 v0.2 schema. Design/schema only. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic attack-target permissions and target-zone-aware current-attack context, required first by the accepted Gale/Skyrend design. This amendment removes the need for card-name/card-id attack-target exceptions.

## Authority rule

This file extends the same canonical rules system defined by:

1. `tcg-card-pass-2-schema.md`;
2. `tcg-card-pass-2-schema-amendment-astral.md`;
3. `tcg-card-pass-2-schema-amendment-b.md`;
4. `tcg-card-pass-2-schema-amendment-c.md`;
5. `tcg-card-pass-2-schema-amendment-d.md`;
6. `tcg-card-pass-2-schema-amendment-e.md`;
7. `tcg-card-pass-2-schema-amendment-f.md`.

Canonical versions remain:

- `sb-tcg-card-v0.2`
- `sb-tcg-effects-v0.2`

No Gale-specific runtime owner is introduced. Before runtime promotion, the base schema and reviewed amendments must be consolidated into one machine-readable validator/specification.

---

# CP2-03G-01 — Default attack target remains opposing Vanguard

Unless structured card data or an active structured effect grants an additional target permission, a normal attack has exactly the current core target:

```json
{
  "controller": "opponent",
  "zone": "vanguard",
  "card_family": "Creature"
}
```

An alternate permission is **additive**. It does not remove the ordinary opposing-Vanguard target unless a future explicit rule uses a separate replacement/prohibition primitive.

This preserves the normal battle rule while allowing specific attacks or effects to widen the legal target set in a deterministic way.

---

# CP2-03G-02 — Attack-level additional target permissions

Extend a structured attack with optional `target_permissions`:

```json
{
  "id": "sky-rend",
  "name": "Sky Rend",
  "cost": [{"element":"Gale","amount":3}],
  "damage_element": "source_creature",
  "base_damage": 110,
  "target_permissions": [
    {
      "controller": "opponent",
      "zone": "reserve",
      "card_family": "Creature",
      "selection": "one"
    }
  ],
  "requirements": [],
  "on_declare": [],
  "before_damage": [],
  "after_damage": []
}
```

Semantics:

1. the ordinary opposing Vanguard remains legal;
2. each permission adds a precisely described legal target class;
3. permissions use structured controller/zone/family/type/trait filters only;
4. a permission never resolves a target by card name;
5. selecting an alternate target is part of the legal attack declaration, before `attack_declared` listeners resolve;
6. the selected target is snapshotted into the current attack action by stable creature instance uid and zone;
7. if the selected creature is no longer a legal target before the attack action commits, the declaration fails closed rather than silently retargeting;
8. this primitive selects one attack target. Multi-target attacks require a separate explicit multi-target rule and are not implied by multiple matching permissions.

`target_permissions` is absent or empty for an ordinary Vanguard-only attack.

---

# CP2-03G-03 — Temporary/additive target permission operation

Add generic operation:

```json
{
  "op": "ADD_ATTACK_TARGET_PERMISSION",
  "target": "$source_creature",
  "attack_id": "attack-id-or-null",
  "permission": {
    "controller": "opponent",
    "zone": "reserve",
    "card_family": "Creature",
    "selection": "one"
  },
  "duration": {
    "expires_on": ["end_of_turn"],
    "max_uses": 1,
    "consume_on": "legal_attack_declared_using_permission"
  }
}
```

Semantics:

1. the operation adds a legal target class; it does not replace the normal Vanguard target;
2. `attack_id = null` means the permission applies to all otherwise-legal attacks by the target creature during the duration; a concrete `attack_id` scopes it to one attack definition;
3. duration/expiry/max-use rules use the existing shared lifecycle grammar from prior amendments;
4. the permission is consumed only when the legal declaration actually relies on that added permission when `consume_on` is `legal_attack_declared_using_permission`;
5. choosing the normal Vanguard does not consume a Reserve-only permission;
6. separate legal sources remain independently attributable and deterministic;
7. no effect may add access to hidden/private card identities through this primitive.

This operation exists for future temporary rules. A card whose own printed attack permanently allows an alternate target should encode that permission directly on the attack definition instead of installing a redundant temporary effect.

---

# CP2-03G-04 — Current attack target-zone context

Extend the canonical `attack_declared` context from Amendment D so the selected target location is explicit:

```json
{
  "event": "attack_declared",
  "attack_id": "attack-id",
  "source_creature_uid": "source-instance-uid",
  "source_controller_seat": 1,
  "source_zone": "vanguard",
  "target_creature_uid": "target-instance-uid",
  "target_controller_seat": 2,
  "target_zone": "vanguard | reserve",
  "turn_seq": 4
}
```

The target uid and target zone are taken from the already-validated attack declaration. They are not inferred later from printed wording or from a card-name exception.

If a future rule allows another public combat zone, that zone must be added explicitly to the validator before card data can reference it.

---

# CP2-03G-05 — Target-zone and controller predicates

Add current-attack predicates:

- `event_attack_target_zone_is`
- `event_attack_target_controller_is_self`
- `event_attack_target_controller_is_opponent`
- `event_attack_source_zone_is`

Examples:

```json
{"predicate":"event_attack_target_zone_is","zone":"reserve"}
```

```json
{
  "all": [
    {"predicate":"event_attack_target_zone_is","zone":"reserve"},
    {"predicate":"event_attack_target_controller_is_opponent"}
  ]
}
```

These predicates inspect only the server-authoritative current attack context. They do not query card names.

---

# CP2-03G-06 — Conditional current-attack damage by selected target zone

Amendment D's existing `MODIFY_CURRENT_ATTACK_DAMAGE` operation is the canonical primitive for target-zone damage adjustments.

Example:

```json
{
  "event": "attack_declared",
  "requirements": {
    "all": [
      {"predicate":"event_attack_id_is","attack_id":"sky-rend"},
      {"predicate":"event_attack_target_zone_is","zone":"reserve"},
      {"predicate":"event_attack_target_controller_is_opponent"}
    ]
  },
  "limit": null,
  "steps": [
    {"op":"MODIFY_CURRENT_ATTACK_DAMAGE","delta":-20}
  ]
}
```

Semantics remain those of Amendment D:

1. the modification belongs only to the current attack action;
2. it enters the attacker-side damage stage before Weakness;
3. it does not alter printed/base card data;
4. the event log records the modifier source and pre/post attacker-side amount;
5. attacker-side damage cannot resolve below zero after legal modifiers are combined.

The condition is based on the selected target's structured zone/controller relation, not on the identity of the defending card.

---

# CP2-03G-07 — Skyrend STRUCTURE mapping

This section encodes the already accepted Gale audit design; it does not redesign the card.

**Accepted design:**

- `Sky Rend`: 3 Gale, 110 base damage.
- Normal opposing Vanguard remains a legal target.
- Sky Rend may instead target one opposing Reserve creature.
- If the chosen target is an opposing Reserve creature, the attack deals 20 less damage.
- Skyrend does not gain blanket Reserve targeting for all of its attacks.

Required v0.2 structure:

1. only the `sky-rend` attack contains the additional opposing-Reserve `target_permissions` entry;
2. an `attack_declared` listener scoped to `sky-rend` checks `target_zone = reserve` and opponent controller;
3. that listener applies `MODIFY_CURRENT_ATTACK_DAMAGE` with `delta = -20`;
4. Razorwind retains the default Vanguard-only target set;
5. no runtime branch may test `card_id`, card name, attack display text or the phrase “Reserve creature” to produce this behaviour.

This means choosing Vanguard produces the full 110 base damage before other modifiers, while choosing an opposing Reserve produces 90 before other attacker-side modifiers/Weakness handling.

---

# CP2-03G-08 — Interaction with Weakness, Shield and damage order

Target permissions change **who may be attacked**, not the global damage pipeline.

For a legal Reserve-target attack:

1. validate the selected target through default + additional target permissions;
2. create the current attack context including `target_zone`;
3. apply base/formula damage;
4. apply current attacker-side modifiers, including target-zone adjustments such as `-20`;
5. apply the global Weakness chain at most once when a legal matchup exists;
6. apply explicit rare Resistance when present;
7. apply defender-side attack reductions/prevention;
8. apply Shield;
9. place remaining attack damage;
10. resolve attack effects, defeat, Reward and win timing normally.

The existence of a Reserve target does not create a separate Weakness rule, bypass Shield or change Reward value.

---

# CP2-03G-09 — Visibility and hidden-information safety

Attack-target permissions may inspect only information the rules are allowed to use for legality.

For the current battlefield, Vanguard/Reserve creature identity and public state are visible, so an opposing Reserve target is safe to enumerate.

A validator/runtime must reject target permissions that would expose or directly select hidden hand, deck or face-down Reward identities unless a separate explicit rules primitive authorizes the information flow and player-private view.

---

# CP2-03G-10 — Validation additions

A v0.2 validator must additionally reject:

1. an unknown `target_permissions` controller, zone, family, selection mode or filter;
2. an alternate permission that silently removes the default opposing Vanguard target;
3. an attack declaration whose chosen target matches neither the default target nor an active additional permission;
4. `ADD_ATTACK_TARGET_PERMISSION` with an unsupported duration/consume event;
5. a scoped `attack_id` that does not exist on the target creature definition;
6. `event_attack_target_zone_is` outside a valid current-attack context;
7. an undeclared combat target zone;
8. a target permission that selects hidden identities without an explicit hidden-information rule;
9. card-name/card-id/display-text matching used to decide attack target legality;
10. a target-zone damage modifier evaluated before the selected target has been validated and bound to the current attack action.

---

# CP2-03G-11 — Engine implementation consequence

When this schema reaches the battle engine, the existing Skyrend-specific runtime branch must be removed.

The engine should instead:

1. build the legal target set from the ordinary opposing Vanguard plus structured active target permissions;
2. validate the client-selected stable target uid against that set;
3. bind target uid/controller/zone into current attack context;
4. resolve generic `attack_declared` listeners and `MODIFY_CURRENT_ATTACK_DAMAGE`;
5. continue through the ordinary unified attack pipeline.

This is a shared rules-engine capability. Gale is merely the first Set One element that proves the need for it.

---

## Amendment G conclusion

Card Pass 2 now has a generic representation for an attack that may legally widen its target set and then alter current-attack damage according to the target zone. Skyrend's accepted Reserve-hunting design can therefore be represented without any Skyrend/card-name special case, while ordinary attacks remain opposing-Vanguard-only by default.
