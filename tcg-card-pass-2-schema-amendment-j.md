# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment J

**Status:** Binding additive amendment to the Card Pass 2 v0.2 schema. Design/schema only. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic hidden-opponent sampling, delayed lifecycle actions, deck-top discard/reorder and control-condition replacement exposed by the complete Shade structure mapping. These are shared engine capabilities, not Shade-specific runtime owners.

## Authority rule

This file extends `tcg-card-pass-2-schema.md` and Amendments A–I within the same canonical `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` system.

No card-name/card-id runtime branch is introduced here.

---

# CP2-03J-01 — Server-random hidden-zone sampling

Add operation:

```json
{
  "op":"RANDOM_SAMPLE_HIDDEN_ZONE",
  "player":"opponent",
  "zone":"hand",
  "count":{"min":1,"max":2},
  "rng_owner":"match",
  "visibility":"controller_private",
  "as":"sampled"
}
```

Semantics:

1. only the server/match RNG selects cards;
2. the acting player cannot influence which cards are sampled;
3. selection is reproducible from the authoritative match RNG stream;
4. sampled identities are exposed only to the viewer legally entitled by `visibility`;
5. cards remain in their source zone unless a later operation moves them;
6. if fewer cards exist than `max`, sample as many as legally available down to `min`;
7. if `min` cannot be met, the enclosing effect follows its explicit legality/optional rules;
8. public logs reveal only permitted structural facts such as count.

This is the generic basis for random opponent-hand inspection and random discard effects.

---

# CP2-03J-02 — Random hidden-card movement

A sampled hidden-zone set may be moved through ordinary `MOVE_CARDS`.

Example:

```json
{
  "op":"MOVE_CARDS",
  "player":"opponent",
  "cards":"$sampled",
  "to":"discard",
  "visibility":"public_on_destination"
}
```

When a hidden hand card moves to public discard, its identity becomes public only because of the destination's visibility rule.

---

# CP2-03J-03 — Opponent deck inspection

`INSPECT_ZONE` and `LOOK_TOP` may specify `player = opponent` when the card explicitly authorizes opponent-deck information.

Example:

```json
{
  "op":"INSPECT_ZONE",
  "player":"opponent",
  "zone":"deck_top",
  "selection":{"min":1,"max":2,"filters":{}},
  "visibility":"controller_private",
  "return_policy":"same_position",
  "as":"looked"
}
```

Only the acting controller sees those identities. The opponent receives no private identity leak merely because their deck was inspected.

---

# CP2-03J-04 — Deck-top reorder for another player

Existing top-deck ordering operations may target `player = opponent` when the card explicitly authorizes it.

Example:

```json
{
  "op":"RETURN_SET_TO_DECK_TOP",
  "player":"opponent",
  "cards":"$looked",
  "order":"controller_choice"
}
```

`controller_choice` means the resolving effect's controller chooses the order, not the deck owner.

---

# CP2-03J-05 — Discard top cards of a deck

Add operation:

```json
{
  "op":"DISCARD_DECK_TOP",
  "player":"opponent",
  "count":2,
  "reveal":"public"
}
```

Semantics:

- move up to `count` cards from the top of the named deck to that player's discard;
- cards become public in discard;
- no hidden inspection is granted before movement unless a separate effect already inspected them;
- emit a normal card-movement/deck-discard event with source attribution;
- after the enclosing action finishes, apply ordinary deck-depletion rules only at the timing defined by the global game rules.

Add event:

```text
deck_cards_discarded
```

with controller/source/count context.

---

# CP2-03J-06 — Delayed lifecycle action

Add operation:

```json
{
  "op":"SCHEDULE_ACTION",
  "owner":"self",
  "trigger":"controller_aftermath_finished",
  "match_must_be_active":true,
  "steps":[{"op":"DRAW_FIXED","player":"opponent","count":1,"deckout_on_incomplete":true}]
}
```

Semantics:

1. records a deterministic pending lifecycle item with source action/card attribution;
2. the item is not an immediate pending player choice;
3. it fires at the named lifecycle event only if its match/activity requirements remain true;
4. it is consumed once fired or cancelled by an explicit expiry condition;
5. delayed items are ordered by creation sequence/source order under the global deterministic lifecycle policy;
6. hidden information is not preserved inside the delayed item unless the rules explicitly bind a stable card variable that is still legal to retain.

Initial trigger vocabulary includes:

- `controller_aftermath_finished`
- `opponent_aftermath_finished`
- `end_of_turn`
- `start_of_next_controller_turn`
- `start_of_next_opponent_turn`

---

# CP2-03J-07 — Control-condition replacement

Add operation:

```json
{
  "op":"REPLACE_CONTROL_CONDITION",
  "target":"$target",
  "condition":"Mindbound",
  "allow_if_empty":true,
  "replace_existing":true
}
```

Semantics:

1. operates only on the registered shared control-condition slot;
2. when `allow_if_empty:true`, an empty slot receives the new condition;
3. when occupied and `replace_existing:true`, the prior control condition is cleared and the new one is applied atomically;
4. replacement emits condition-cleared and condition-applied/replaced events with one source action id;
5. unrelated tracks such as Venomed are untouched;
6. ordinary cards cannot replace a control condition unless their structured definition explicitly uses this operation.

Add predicate:

```text
control_condition_present
```

and optional filter `exclude_condition`.

---

# CP2-03J-08 — Condition application/replacement event semantics

Add event:

```text
condition_changed
```

with context:

- target uid/controller;
- old condition or null;
- new condition or null;
- condition slot/track;
- change kind `apply | clear | replace`;
- source card/action;
- acting controller.

This allows listeners to react to a successful application or replacement without inspecting card names.

---

# CP2-03J-09 — Current/opposing hand-size predicates

Add predicates:

- `hand_count_at_least`
- `hand_count_at_most`

with explicit player scope `self | opponent`.

These inspect count only and never expose identities.

---

# CP2-03J-10 — Conditioned attacker/target continuous filters

Continuous attack/incoming-attack modifiers may use public condition-state filters:

```json
{
  "filters":{"attacker_has_any_condition":true}
}
```

or

```json
{
  "filters":{"target_has_any_condition":true}
}
```

They may also use `attacker_element` / `target_element` where public card identity permits it.

This supplies generic support for Realm/Relic effects that reduce attack damage from conditioned creatures or conditioned Vanguards while exempting a named element through structured filters such as `exclude_attacker_element: Shade`.

---

# CP2-03J-11 — Validation additions

A v0.2 validator must reject:

1. client-selected outcomes for `RANDOM_SAMPLE_HIDDEN_ZONE`;
2. hidden sampled identities serialized to an unauthorized viewer;
3. opponent-deck inspection/reorder without explicit card authorization;
4. `DISCARD_DECK_TOP` with a negative/non-integer count;
5. a delayed lifecycle item with an undeclared trigger;
6. a delayed item that survives after match completion when `match_must_be_active:true`;
7. `REPLACE_CONTROL_CONDITION` applied to a non-control track;
8. condition replacement that silently removes Venomed/other unrelated tracks;
9. hand-size predicates that expose anything beyond count;
10. conditioned continuous filters applied using hidden information;
11. Shade-specific runtime branches where the generic operations above are sufficient.

---

## Amendment J conclusion

The v0.2 grammar now has reusable deterministic semantics for Shade's information/control mechanics without a separate Shade engine: random hidden sampling, opponent-deck inspection/reorder, deck-top discard, delayed lifecycle compensation, control-condition replacement and condition-change listeners.
