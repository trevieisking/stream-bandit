# Stream Bandit TCG — Event Subject Semantics

Schema: `sb-tcg-card-v0.2`
Effect schema: `sb-tcg-effects-v0.2`

## Event subject

Events that are caused by a specific card or creature expose that game object as the event subject.

Example:

```json
{
  "event": "became_vanguard",
  "controller_seat": 1,
  "subject_uid": "creature-instance-uid",
  "origin_zone": "reserve",
  "destination_zone": "vanguard",
  "action_kind": "effect_switch",
  "turn_seq": 4
}
```

The subject is the creature/card whose game-state transition produced the event. It is separate from the persistent card that is listening to the event.

Examples:

- `became_vanguard`: subject = creature that became Vanguard
- `moved_to_reserve`: subject = creature that moved to Reserve
- `creature_entered_play`: subject = creature that entered play
- `creature_evolved`: subject = resulting evolved creature stack
- `essence_attached`: subject = attached Essence card; attachment target remains available separately
- `relic_attached`: subject = attached Relic card; attachment target remains available separately

Events with no meaningful card/creature subject may omit `subject_uid`.

## Event subject binding

During listener resolution, an event with a resolvable subject exposes:

```text
$event_subject
```

`$event_subject` is a stable runtime reference to that exact current game object.

If the object left the required zone before the triggered item resolves, operations that require it to remain in that zone fail closed rather than retargeting another card.

The binding never resolves by card name.

## Event subject filters

Add generic predicate:

```json
{
  "predicate": "event_subject_matches",
  "filters": {
    "card_family": "Creature",
    "element": "Ember"
  }
}
```

The filter set uses the normal public card/creature filter grammar, including where applicable:

- card family
- element
- creature stage
- Creature Type
- traits
- damaged state
- condition state
- printed HP range
- current zone

Negation uses the existing predicate composition:

```json
{
  "not": {
    "predicate": "event_subject_matches",
    "filters": {
      "element": "Ember"
    }
  }
}
```

## Event subject identity predicates

Also support:

- `event_subject_is_source`
- `event_subject_is_attached_creature`
- `event_subject_controller_is_self`
- `event_subject_controller_is_opponent`

These compare stable runtime identity/controller data; they do not compare printed names.

## Action kind

The existing event `action_kind` field identifies the action that produced the transition.

For normal voluntary withdrawal, the movement events use:

```text
voluntary_withdrawal
```

For an effect-driven switch, use:

```text
effect_switch
```

For movement performed by an attack instruction, use:

```text
attack
```

This allows a listener to distinguish voluntary withdrawal from a forced/effect switch without identifying a particular card.

## Direct effect on event subject

Normal operations may target `$event_subject`.

Example:

```json
{
  "op": "DIRECT_DAMAGE",
  "target": "$event_subject",
  "amount": 10,
  "damage_class": "effect"
}
```

The normal target-presence check still applies at resolution time.

## Realm listener examples

### Active player's first Ember Vanguard entry

```json
{
  "event": "became_vanguard",
  "controller_scope": "any",
  "requirements": {
    "all": [
      {"predicate": "event_controller_is_active_seat"},
      {"predicate": "event_subject_matches", "filters": {"card_family": "Creature", "element": "Ember"}}
    ]
  },
  "limit": {"scope": "turn", "count": 1, "owner": "event_controller"},
  "steps": [
    {
      "op": "ADD_ATTACK_DAMAGE_MODIFIER",
      "target": "$event_subject",
      "amount": 10,
      "duration": {
        "expires_on": ["end_of_turn"],
        "max_uses": 1,
        "consume_on": "legal_attack_declared"
      }
    }
  ]
}
```

### Non-Ember voluntary withdrawal

```json
{
  "event": "moved_to_reserve",
  "controller_scope": "any",
  "requirements": {
    "all": [
      {"predicate": "event_action_kind_is", "action_kind": "voluntary_withdrawal"},
      {"not": {"predicate": "event_subject_matches", "filters": {"element": "Ember"}}}
    ]
  },
  "limit": null,
  "steps": [
    {"op": "DIRECT_DAMAGE", "target": "$event_subject", "amount": 10, "damage_class": "effect"}
  ]
}
```

These examples are generic event semantics. They do not create a card-name-specific rule owner.

## Visibility

An event subject may be exposed only to the degree that the subject is legally visible in the current game state.

A listener may use server-authoritative hidden subject properties only when the card effect legally permits that information. Public logs and opponent views must not reveal hidden identities merely because a listener evaluated `event_subject_matches`.

## Validation

A v0.2 validator rejects:

1. `$event_subject` when the event cannot produce a subject;
2. `event_subject_matches` with an unsupported filter;
3. a target operation on `$event_subject` when the operation requires a zone the subject no longer occupies;
4. an undeclared `action_kind` value;
5. a listener that tries to resolve an event subject by printed card name;
6. hidden subject data leaked into a view or public event log.
