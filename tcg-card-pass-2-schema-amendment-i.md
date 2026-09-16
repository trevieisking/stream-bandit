# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment I

**Status:** Binding additive amendment to the Card Pass 2 v0.2 schema. Design/schema only. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic public-zone selection, healing packets/modifiers, multi-target aura selectors and damage-source bindings exposed by the complete Grove structure mapping. These are shared engine capabilities, not Grove-specific runtime owners.

## Authority rule

This file extends `tcg-card-pass-2-schema.md` and Amendments A–H within the same canonical:

- `sb-tcg-card-v0.2`
- `sb-tcg-effects-v0.2`

No card-name/card-id runtime branch is introduced here. Before runtime promotion, the base schema and reviewed amendments must be consolidated into one machine-readable validator/specification.

---

# CP2-03I-01 — Public-zone card selection

Add generic operation:

```json
{
  "op":"SELECT_CARDS",
  "player":"self",
  "zone":"discard",
  "selection":{
    "min":0,
    "max":2,
    "filters":{"card_family":"Tactic","tactic_subtype":"Device"},
    "distinct_identity":false
  },
  "as":"chosen"
}
```

Initial v0.2 public source zones:

- `discard`
- public field subsets already exposed by the ordinary selector model

Rules:

1. options are generated server-authoritatively from the named legally visible zone;
2. `min`/`max` are explicit and must be satisfiable under the card wording;
3. `distinct_identity:true` forbids choosing two cards with the same gameplay identity in that one selection;
4. selection never grants access to a hidden zone; hidden deck/hand/reward choices continue to use their dedicated search/inspection operations;
5. the result is a stable card-instance set variable and may be passed to `MOVE_CARDS`;
6. if `min:0`, zero selections are legal even when matching cards exist;
7. no runtime card-name matching is permitted.

This is the canonical basis for discard recycling and other visible-zone choices.

---

# CP2-03I-02 — Move selected public cards to deck bottom

Existing `MOVE_CARDS` may consume a stable selected-card variable and use:

```json
{
  "op":"MOVE_CARDS",
  "player":"self",
  "cards":"$chosen",
  "to":"deck_bottom",
  "order":"player_choice"
}
```

Rules:

- zero selected cards is a no-op;
- when two or more cards move to the bottom and wording permits an order choice, the player chooses their relative order through the normal pending-choice engine;
- the movement is public by count and by any card identities already public in the source zone;
- moving a card to deck bottom does not shuffle the deck unless a separate instruction says to shuffle.

---

# CP2-03I-03 — Hidden-search distinct-identity constraint

Extend hidden-zone search selection with:

```json
{
  "selection":{
    "min":0,
    "max":2,
    "filters":{},
    "distinct_identity":true
  }
}
```

Semantics:

- all returned cards must satisfy the ordinary search filters;
- when `distinct_identity:true`, chosen cards must have different canonical gameplay ids;
- hidden-search failure semantics from Amendment C remain unchanged;
- a relationship filter such as `must_evolve_from_in_play:true` is evaluated against authoritative public board state and does not reveal unrelated deck contents.

---

# CP2-03I-04 — Healing packet

Healing must be modifiable without rewriting card text or applying a second independent heal.

Every heal application is represented internally as a healing packet with minimum payload:

```json
{
  "heal_id":"heal-seq-id",
  "amount":20,
  "target_uid":"creature-instance-uid",
  "source_card_uid":"source-instance-uid",
  "source_action_id":"action-id",
  "source_controller_seat":1,
  "source_action_kind":"ability | attack | tactic | essence | realm | rule",
  "preventable":false
}
```

Add canonical events:

- `before_heal_packet`
- `after_heal_packet`

`before_heal_packet` occurs after base healing amount/target/source are known but before healing is applied.

`after_heal_packet` records:

- requested amount after legal modifiers;
- actual damage removed, clamped by the target's current damage;
- target/source identity references safe for the current viewer.

A zero actual-heal result is valid when the target no longer has damage at resolution time.

---

# CP2-03I-05 — Modify current heal

Add operation:

```json
{
  "op":"MODIFY_CURRENT_HEAL",
  "delta":10,
  "minimum":0
}
```

Semantics:

1. legal only during `before_heal_packet`;
2. modifies only that healing packet;
3. cannot change source or target;
4. packet amount cannot fall below `minimum`;
5. multiple modifiers apply in deterministic listener/source order;
6. source attribution and pre/post amount are recorded;
7. actual damage removed remains capped by damage currently present on the target.

This is the generic basis for “the first time this creature would be healed by a card effect each turn, increase that healing by 10.”

---

# CP2-03I-06 — Healing-packet predicates and bindings

Add predicates:

- `heal_packet_target_is_self`
- `heal_packet_target_is_attached_creature`
- `heal_packet_target_controller_is_self`
- `heal_packet_source_is_self`
- `heal_packet_source_is_attached_creature`
- `heal_packet_source_controller_is_self`
- `heal_packet_source_action_kind_is`
- `heal_packet_target_is_not_source`
- `heal_packet_amount_at_least`

During a valid healing-packet event expose:

```text
$heal_packet_target
$heal_packet_source_creature
```

`$heal_packet_source_creature` exists only when the source action is owned by a Creature instance. It fails closed if no Creature source exists.

This supports reciprocal-healing listeners without identifying a card by name.

---

# CP2-03I-07 — Multi-target continuous aura selector

Continuous modifiers may target a deterministic public set rather than one bound creature.

Add:

```json
{
  "target_selector":{
    "controller":"self",
    "zone":"reserve",
    "filters":{
      "card_family":"Creature",
      "element":"Grove",
      "exclude_source":true
    }
  }
}
```

Rules:

1. `target` and `target_selector` are mutually exclusive;
2. the selector is reevaluated from authoritative state whenever the relevant rule value is needed;
3. it creates no stored duplicate modifier per target;
4. creatures entering or leaving the selector set gain/lose the aura contribution immediately;
5. `exclude_source:true` excludes the source card/creature instance even if it otherwise matches;
6. hidden zones are forbidden for continuous aura selectors;
7. separate legal source instances may stack unless another rule says otherwise.

Example:

```json
{
  "id":"example-reserve-guard",
  "kind":"incoming_attack_damage",
  "target_selector":{
    "controller":"self",
    "zone":"reserve",
    "filters":{"card_family":"Creature","element":"Grove","exclude_source":true}
  },
  "when":null,
  "amount":-10,
  "filters":{"source_controller":"opponent"}
}
```

---

# CP2-03I-08 — Conditional continuous withdrawal set-value

For continuous `kind = withdrawal`, permit explicit mode:

```json
{
  "kind":"withdrawal",
  "target":"$source_creature",
  "mode":"set",
  "amount":0,
  "minimum":0,
  "when":{"predicate":"reserve_count_at_least","controller":"self","count":2}
}
```

`mode` is:

- `delta` — add `amount` to the current cost build;
- `set` — set the current cost to `amount` before later modifiers continue in deterministic order.

This is evaluated through Amendment H's `before_voluntary_withdrawal_cost` owner and never affects effect switches.

---

# CP2-03I-09 — Damage packet source creature binding

Amendment D damage packets already carry source card/action/attack metadata. When an attack/recoil/effect packet has a resolvable Creature source, expose:

```text
$damage_packet_source_creature
```

Add predicates:

- `damage_packet_source_is_attached_creature`
- `damage_packet_source_is_opponent_vanguard`
- `damage_packet_target_zone_is`
- `damage_packet_source_zone_is`

Rules:

1. the binding refers to the exact source Creature instance for that packet;
2. it never resolves by printed card name;
3. if the source has left play before a later listener resolves, operations requiring an in-play target fail closed;
4. a listener may use it as the target of ordinary `DIRECT_DAMAGE`;
5. reflected/direct damage produced from such a listener is a new `damage_class = effect` packet and does not recursively count as attack damage.

This is the generic basis for post-attack reflection effects.

---

# CP2-03I-10 — Generic condition-presence predicates

Add leaf predicates:

- `target_has_any_condition`
- `source_has_any_condition`
- `control_condition_slot_empty`

The first two inspect the registered condition tracks/slots and return true if at least one condition is present.

`control_condition_slot_empty` tests only the shared control-condition slot used by conditions such as Rooted where the global rules define that slot. It does not inspect unrelated condition tracks such as Venomed.

This permits target legality and ordered multi-condition application without card-name code.

---

# CP2-03I-11 — Healing source/event semantics

When a Creature Ability or attack produces one or more heal packets, those packets retain the Creature source uid and the action kind.

A listener may therefore express:

```json
{
  "event":"after_heal_packet",
  "requirements":{
    "all":[
      {"predicate":"heal_packet_source_is_attached_creature"},
      {"predicate":"heal_packet_target_controller_is_self"},
      {"predicate":"heal_packet_target_is_not_source"},
      {"any":[
        {"predicate":"heal_packet_source_action_kind_is","action_kind":"ability"},
        {"predicate":"heal_packet_source_action_kind_is","action_kind":"attack"}
      ]}
    ]
  },
  "limit":{"scope":"turn","count":1,"owner":"attachment"},
  "steps":[{"op":"HEAL","target":"$attached_creature","amount":10}]
}
```

A multi-target heal generates one packet per healed target, but the listener's ordinary limit prevents one source from receiving multiple reciprocal triggers from one multi-target action when the card says “the first time during each turn.”

---

# CP2-03I-12 — Validation additions

A v0.2 validator must additionally reject:

1. `SELECT_CARDS` against a hidden zone;
2. a public-zone selection whose `min` exceeds the number of legal visible options when the action has already committed to resolution;
3. hidden search with `distinct_identity:true` that returns duplicate gameplay ids;
4. `MODIFY_CURRENT_HEAL` outside `before_heal_packet`;
5. healing-packet predicates/bindings outside a valid healing context;
6. `target` and `target_selector` on the same continuous modifier;
7. a continuous aura selector aimed at a hidden zone;
8. a withdrawal continuous modifier without explicit `mode` where set-vs-delta would be ambiguous;
9. `$damage_packet_source_creature` when the packet has no Creature source;
10. reflected effect damage being reclassified as attack damage;
11. a condition-presence predicate referencing an unregistered condition slot/track;
12. any ordinary Set One Creature definition that stores a routine per-card `weakness` object instead of using the global matchup snapshot. The only exception is a future explicitly registered matchup override shape, which must use `matchup_override`, not the retired `weakness` field.

---

## Amendment I conclusion

The v0.2 grammar now has shared deterministic semantics for:

- choosing and recycling cards from public discard;
- distinct-identity multi-card searches;
- modifying a heal before it is applied;
- reacting to which Creature/action caused healing;
- applying one continuous aura across a public target set;
- set-vs-delta withdrawal modifiers;
- referencing the exact Creature that caused an attack-damage packet;
- condition-presence and control-slot legality;
- rejecting the stale per-card Weakness model that was superseded by `cp2-matchups-v0.1`.
