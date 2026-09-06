# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment L

**Status:** Binding additive amendment to Card Pass 2 v0.2. Design/schema only. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic Shield transfer, multi-Essence movement, movement-history bindings, grouped hidden searches, actual-heal listeners and source-capped temporary withdrawal modifiers exposed by the complete Tide structure mapping.

## Authority rule

This file extends the base schema and Amendments A–K inside the same `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` rules system. No Tide-specific runtime owner is introduced.

---

# CP2-03L-01 — Move attached Essence between creatures

Normalize `MOVE_ATTACHED_ESSENCE` as:

```json
{
  "op":"MOVE_ATTACHED_ESSENCE",
  "controller":"self",
  "element":"Tide",
  "count":{"min":0,"max":1},
  "source_selector":{"zone":"field","filters":{"card_family":"Creature"}},
  "destination_selector":{"zone":"field","filters":{"card_family":"Creature"}},
  "require_destination_different_creature":true,
  "as":"essence_moves"
}
```

Rules:

1. each moved Essence is an existing attached card instance, never a generated resource token;
2. source and destination are stable creature instance uids;
3. `require_destination_different_creature:true` forbids moving an Essence away and back to the same creature as one move;
4. attachment state/lifecycle moves with the card unless a rule explicitly changes it;
5. normal destination attachment legality applies;
6. moving Essence does not consume the normal manual attachment allowance;
7. each move emits `essence_moved` with source/destination creature uid, Essence uid/element and source action id.

---

# CP2-03L-02 — Multi-Essence movement

The same operation may use `count.max > 1`.

For each individual move:

- choose an eligible attached Essence;
- choose a different legal destination creature;
- apply the move atomically;
- update legal options before the next move;
- stop early when the player chooses to stop if `min` has been satisfied.

The result variable records the ordered movement set:

```json
[
  {"essence_uid":"...","source_creature_uid":"...","destination_creature_uid":"..."}
]
```

No one Essence may be moved twice by the same multi-move operation unless an explicit future mechanic allows it.

---

# CP2-03L-03 — Movement participation selector

A later step in the same action may select creatures that participated in one or more recorded moves:

```json
{
  "op":"SELECT_CREATURE",
  "controller":"self",
  "zone":"field",
  "count":{"min":0,"max":2},
  "filters":{"element":"Tide","damaged":true,"participated_in_moves":"$essence_moves"},
  "as":"heal_targets"
}
```

`participated_in_moves` means the creature uid appeared as a source or destination in that movement set.

---

# CP2-03L-04 — Essence-movement event predicates

Add predicates:

- `essence_move_source_is_self`
- `essence_move_destination_is_self`
- `essence_move_source_is_attached_creature`
- `essence_move_destination_is_attached_creature`
- `essence_move_element_is`
- `essence_move_controller_is_self`
- `essence_move_count_at_least`

`event_occurred(event = essence_moved)` may filter by source/destination creature and element.

This is the canonical basis for current-turn “you moved Tide Essence” payoffs.

---

# CP2-03L-05 — Shield transfer

Add operation:

```json
{
  "op":"TRANSFER_SHIELD",
  "from":"$source_creature",
  "to":"$target_creature",
  "amount":{"min":0,"max":20}
}
```

Semantics:

1. transfer cannot exceed Shield currently present on `from`;
2. transfer cannot cause the recipient to exceed the universal Shield cap;
3. actual transferred amount is the minimum of chosen amount, available source Shield and recipient cap room;
4. source loses exactly the actual transferred amount;
5. recipient gains exactly the actual transferred amount;
6. zero transfer is legal only when the card wording permits “up to”; otherwise a positive amount is required;
7. transfer is not treated as fresh Shield creation for effects that specifically require Shield gained from a card effect unless their predicate explicitly includes transferred Shield;
8. emit `shield_transferred` with actual amount and both creature uids.

---

# CP2-03L-06 — Actual-heal event filters

Amendment I's `after_heal_packet` exposes actual damage removed.

Add predicates:

- `heal_actual_amount_at_least`
- `heal_target_element_is`
- `heal_controller_is_active_seat`
- `heal_source_is_card_effect`

A listener that says “first time this player actually heals at least 1 damage during their own turn” must filter `actual_amount >= 1`; a zero-point heal does not consume its use.

---

# CP2-03L-07 — Grouped hidden-deck search

Add operation:

```json
{
  "op":"SEARCH_DECK_GROUP",
  "player":"self",
  "groups":[
    {"id":"creature","selection":{"min":0,"max":1,"filters":{"element":"Tide","card_family":"Creature"}}},
    {"id":"basic_essence","selection":{"min":0,"max":1,"filters":{"element":"Tide","card_family":"Essence","essence_subtype":"Basic"}}}
  ],
  "reveal":"public",
  "destination":"hand",
  "hidden_fail_allowed":true
}
```

Each group is independently optional/required according to its own `min/max`. A card may satisfy only one group unless explicitly allowed otherwise.

---

# CP2-03L-08 — Source-capped temporary withdrawal increase

Extend temporary withdrawal modifiers with:

```json
{
  "op":"SET_WITHDRAWAL_MODIFIER",
  "target":"$target",
  "mode":"delta",
  "amount":2,
  "minimum":0,
  "maximum_after_this_source":4,
  "duration":{"expires_on":["target_controller_aftermath_started"],"max_uses":null},
  "source_category":"self_card_effect"
}
```

`maximum_after_this_source` caps only this source's resulting contribution stage. Later legal global/shared modifiers still follow universal ordering unless their own rules say otherwise.

---

# CP2-03L-09 — Single-use prevention Relic shorthand semantics

Amendment K's prevention record + deferred source discard supports:

- incoming attack reduction;
- consume only on actual prevention >=1;
- discard source at `after_attack_finished`.

A Relic need not maintain an explicit counter when its maximum successful-prevention uses is one. It may use a match/attachment limit of one plus `SCHEDULE_SOURCE_DISCARD` on successful prevention.

---

# CP2-03L-10 — Condition-dependent branch heal

Normal `IF` may branch healing values from public condition state. Clearing a condition before healing changes the state as written, but the branch decision is snapshotted when `IF` begins.

Example: if Drenched at resolution start, clear Drenched then heal 20; otherwise heal 40.

---

# CP2-03L-11 — Validation additions

A v0.2 validator must reject:

1. multi-Essence movement that moves a card to the same creature when different destination is required;
2. moving one Essence twice in the same movement set without explicit permission;
3. movement-participation filters referencing an unknown movement variable;
4. Shield transfer that creates Shield from nothing or exceeds the global cap;
5. an “actual heal” trigger consumed by zero damage removed;
6. grouped hidden search whose card can satisfy multiple groups without a declared policy;
7. temporary withdrawal caps without deterministic source ordering;
8. Tide-specific runtime branching when the generic structures above suffice.

---

## Amendment L conclusion

The v0.2 grammar now supports Tide's current/resource-flow identity generically: multi-Essence redistribution, movement participation, Shield transfer, real-heal triggers, grouped searches and capped temporary movement tax.
