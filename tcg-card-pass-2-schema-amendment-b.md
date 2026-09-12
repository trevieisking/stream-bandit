# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment B

**Status:** Binding additive/superseding amendment to `tcg-card-pass-2-schema.md` and `tcg-card-pass-2-schema-amendment-astral.md`. Design/schema only. No production registry, migration, battle engine, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic trigger-context, deck-position movement and prestige ownership rules discovered before the first CP2-04 card batch could be represented without exceptions.

## Authority rule

- `tcg-card-pass-2-schema.md` remains the base v0.2 schema authority.
- `tcg-card-pass-2-schema-amendment-astral.md` remains binding for hidden-zone inspection, inspection/reorder events, whole-hand shuffle-back, card-variable predicates, source-scoped Shield caps and listener source matching.
- This file is additive except where it explicitly **moves Starbound prestige ownership from the nested Creature object to the top-level card envelope**. That location change supersedes the base example so there remains exactly one prestige owner.

Before runtime promotion, the base schema and all reviewed amendments must be consolidated into one machine-readable validator/specification.

---

# CP2-03B-01 — Event context is structured data

Triggered cards must not infer event context from card names or prose.

Every emitted event may carry a canonical context object when relevant:

```json
{
  "event": "creature_entered_play",
  "controller_seat": 1,
  "source_card_uid": "instance-uid",
  "source_action_id": "action-id",
  "origin_zone": "hand",
  "destination_zone": "reserve",
  "phase": "build",
  "turn_seq": 3,
  "action_kind": "play_creature"
}
```

Not every event needs every field. Fields that do not apply are absent rather than guessed.

Canonical event-context fields include at minimum:

- `origin_zone`
- `destination_zone`
- `phase`
- `turn_seq`
- `active_seat`
- `action_kind`
- `source_card_uid`
- `source_action_id`
- `controller_seat`
- `attachment_kind` when an attachment is normal/temporary/borrowed
- `manual_attachment` boolean when an Essence attachment is a normal manual attachment

This context is server-authoritative and may contain only structural information safe for the viewer unless the event itself legally exposes hidden card identities.

---

# CP2-03B-02 — Generic event-context predicates

Add the following generic listener/requirement predicates:

- `event_origin_zone_is`
- `event_destination_zone_is`
- `event_phase_is`
- `event_action_kind_is`
- `event_attachment_kind_is`
- `event_is_manual_attachment`
- `event_controller_is_self`
- `event_controller_is_opponent`
- `event_active_seat_is_controller`

Example:

```json
{
  "all": [
    {"predicate": "source_is_self"},
    {"predicate": "event_origin_zone_is", "zone": "hand"},
    {"predicate": "event_destination_zone_is", "zone": "reserve"},
    {"predicate": "event_phase_is", "phase": "build"}
  ]
}
```

This is the generic trigger contract for accepted effects such as a Baby Creature played from hand into an empty Reserve during Build.

For an Essence that triggers only when attached from hand, use the same event-origin predicate on `essence_attached`; do not inspect the Essence card id in runtime code.

---

# CP2-03B-03 — Non-inspecting deck-position movement

Some effects move the current top card of a deck after an earlier inspection. Re-inspecting that card merely to move it would incorrectly emit another inspection event and could trigger loops.

Add generic operation:

```json
{
  "op": "MOVE_ZONE_POSITION",
  "player": "self",
  "zone": "deck",
  "from": "top",
  "to": "bottom",
  "count": 1,
  "visibility": "no_additional_reveal"
}
```

Initial v0.2 semantics:

- supported zone: `deck`;
- supported positions: `top` and `bottom`;
- `count` must be a positive integer permitted by the effect;
- the operation moves cards without granting a new inspection;
- it emits a movement event but **not** `deck_inspected`, `hidden_information_viewed` or `deck_reordered` unless the operation itself was preceded by a separate legal inspection/reorder effect;
- identities remain hidden to any viewer who was not already entitled to them.

This operation is the correct basis for effects such as “put the current top card on the bottom” after a prior top-deck look.

---

# CP2-03B-04 — Starbound prestige belongs to the card envelope

The base schema nested `prestige` inside the Creature object. That is too narrow for the locked rule that **every Set One card receives an explicit Starbound yes/no decision** and that Starbound is a card prestige mechanic independent from Mythic, rarity and evolution stage.

## Canonical single owner

Move `prestige` to the top-level card definition envelope:

```json
{
  "schema": "sb-tcg-card-v0.2",
  "effect_schema": "sb-tcg-effects-v0.2",
  "id": "card-id",
  "name": "Card Name",
  "card_family": "Creature",
  "element": "Astral",
  "traits": [],
  "pack_only": false,
  "deck_limit": null,
  "prestige": {
    "starbound": {
      "enabled": false
    }
  },
  "creature": {},
  "essence": null,
  "tactic": null
}
```

The nested `creature.prestige` field is retired as v0.2 gameplay authority.

## Explicit non-Starbound form

Every current SB1 identity not designated Starbound stores:

```json
{
  "prestige": {
    "starbound": {
      "enabled": false
    }
  }
}
```

This includes Creatures, Essence and Tactics.

## Explicit Starbound form

A Starbound identity stores:

```json
{
  "prestige": {
    "starbound": {
      "enabled": true,
      "action_kind": "attack | ability",
      "action_id": "action-id",
      "shared_usage_key": "starbound",
      "consume": "legal_declaration_or_activation"
    }
  }
}
```

Exactly one action may be referenced by a Set One Starbound identity.

The global one-use-per-player-per-match rule remains unchanged.

---

# CP2-03B-05 — Deck-limit delegation for Essence

The accepted deck-construction authority distinguishes ordinary gameplay identities, Mythic identities and the separate high Essence allowance.

The current branch migration still contains prototype copy-limit logic and is not authoritative for the final rules.

Until the global Essence allowance is given one exact numeric ruleset value, an Essence definition may use explicit delegation rather than inventing a number:

```json
{
  "deck_limit": {
    "scope": "global_essence_allowance",
    "max": null
  }
}
```

Meaning:

- this card does not use the ordinary four-copy identity limit;
- the authoritative global Essence rule supplies the allowed maximum;
- `null` does **not** mean unlimited; it means delegated to the one global Essence allowance owner.

For current non-Essence cards:

- ordinary identity: `{"scope":"identity","max":4}`;
- Mythic identity: `{"scope":"identity","max":1}`.

A production validator must reject `max:null` delegation if the referenced global ruleset allowance has not itself been resolved to an exact value before live deck validation.

---

# CP2-03B-06 — Listener timing and trigger snapshot

When an event occurs, the engine snapshots all listeners that are legal for that event **before** resolving any of those listeners. A listener created as a result of resolving that same event does not retroactively join the original trigger snapshot.

Each triggered item records:

- event sequence id;
- source card uid;
- listener id;
- controller seat;
- source creation/attachment sequence when relevant;
- structured requirements already satisfied at trigger creation.

This prevents a newly created listener from recursively claiming an event that happened before it existed.

The exact cross-card ordering of multiple simultaneous triggered items remains a global battle-engine policy and must be deterministic before runtime promotion. Card definitions may not hardcode ordering by card name.

---

# CP2-03B-07 — Validation additions

A v0.2 validator must additionally reject:

1. an event-context predicate when the referenced event cannot carry that field;
2. entry/attachment triggers that rely on prose instead of structured origin/destination/phase context;
3. `MOVE_ZONE_POSITION` on an unsupported zone/position or with hidden-card identity leakage;
4. any v0.2 definition that retains both top-level `prestige` and nested `creature.prestige` as competing owners;
5. a current SB1 identity without explicit `prestige.starbound.enabled` true/false;
6. a Starbound identity with more than one referenced Starbound action;
7. a non-Starbound identity that nevertheless marks an action as consuming the shared Starbound key;
8. an Essence delegated to `global_essence_allowance` at production time when the global allowance has no exact resolved value;
9. a listener created during event resolution that attempts to join the already-snapshotted original event.

---

# CP2-03B completion state

**EVENT CONTEXT, NON-INSPECTING DECK MOVEMENT AND SINGLE CARD-LEVEL STARBOUND OWNERSHIP ARE NOW DEFINED FOR v0.2.**

No card design is changed by this amendment.

## Next bounded action

After this exact-head amendment passes CI:

**CP2-04A — structure all 24 accepted Astral identities** against:

1. `tcg-set-one-audit.md` Astral design authority;
2. `tcg-card-pass-2-weakness-resistance.md` corrected ×2 weakness assignments and `resistance: null`;
3. `tcg-card-pass-2-schema.md`;
4. `tcg-card-pass-2-schema-amendment-astral.md`;
5. this amendment;
6. fresh active SB1 Astral registry ids/source data.

If the complete 24-card batch still exposes a genuinely generic schema gap, fix the shared schema before promoting the Astral card ledger. Do not add an Astral-specific runtime exception.