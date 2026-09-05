# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment C

**Status:** Binding additive amendment to the Card Pass 2 v0.2 schema. Design/schema only. No production registry, migration, battle engine, starter recipe or deployed gameplay is changed by this file.

**Scope:** Final generic semantics required by the complete read-only Astral 24 conversion attempt: server-only hidden checks, event-history predicates, optional action choice, filtered player choice and temporary-modifier duration/consumption.

## Authority rule

This file extends:

1. `tcg-card-pass-2-schema.md`;
2. `tcg-card-pass-2-schema-amendment-astral.md`;
3. `tcg-card-pass-2-schema-amendment-b.md`.

All remain one `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` rules system. No card-specific runtime branch is introduced here.

Before runtime promotion these reviewed schema documents must be consolidated into one machine-readable validator/specification so there is one final runtime schema owner.

---

# CP2-03C-01 — Server-only hidden inspection

Some accepted effects must test a hidden card without revealing a failed match to the player. Example class: “after damage, if the top card is Astral, put it into your hand.”

Extend `INSPECT_ZONE.visibility` with:

- `controller_private`
- `chosen_player_private`
- `server_only`

Example:

```json
{
  "op": "INSPECT_ZONE",
  "player": "self",
  "zone": "deck_top",
  "selection": {"min": 1, "max": 1, "filters": {}},
  "visibility": "server_only",
  "return_policy": "same_position",
  "as": "top_card"
}
```

`server_only` semantics:

1. the canonical resolver may evaluate the selected card through generic predicates;
2. the card identity is not exposed to either player merely because the inspection occurred;
3. if a later legal operation moves/reveals the card into a visible zone, normal visibility rules then apply;
4. public/private logs expose only information authorized by the later outcome;
5. `server_only` inspection does not emit a player-facing `hidden_information_viewed` event, because no player gained hidden information;
6. it may emit a server-internal inspection record for replay/debug evidence, but that record is never serialized into a seat view.

This prevents a failed hidden predicate from leaking the identity of a non-matching top card.

---

# CP2-03C-02 — Generic event-history predicate

Current-turn and match-history conditions must be data-driven rather than separate flags such as `looked_at_deck_turn`.

Add canonical predicate:

```json
{
  "predicate": "event_occurred",
  "event": "deck_inspected",
  "controller": "self",
  "window": "current_turn",
  "min_count": 1
}
```

Supported `window` values in v0.2:

- `current_turn`
- `current_player_turn`
- `previous_opponent_turn`
- `match`
- `attachment_lifetime`
- `since_source_entered_play`

Optional filters may restrict by:

- source card uid / source action id;
- event origin/destination zone;
- event controller;
- event payload count;
- event condition id;
- attachment kind;
- whether the event involved the listener's attached creature.

This predicate is the canonical basis for accepted conditions such as:

- “if you looked at one or more cards in your deck through an effect this turn”;
- “if you looked at one or more Reward Cards through an effect this turn”;
- “if an attached Essence moved this turn”;
- “if a Device was played this turn.”

The engine may index event history for performance, but the semantic owner remains this generic event record/predicate rather than card-specific booleans.

---

# CP2-03C-03 — Generic optional action

Some effects present a yes/no action rather than choosing a card from an already exposed set.

Add operation:

```json
{
  "op": "OPTIONAL",
  "player": "self",
  "steps": [
    {"op": "MOVE_ZONE_POSITION", "player": "self", "zone": "deck", "from": "top", "to": "bottom", "count": 1, "visibility": "no_additional_reveal"}
  ]
}
```

Semantics:

1. if the nested action is legally possible, create a deterministic yes/no pending choice for the specified player;
2. choosing no resolves the optional block with no nested steps;
3. choosing yes resolves the nested steps in order;
4. the choice exposes no hidden identity beyond what the player was already entitled to know;
5. if the nested action has become illegal before resolution, fail closed and resolve the optional block with no effect;
6. `OPTIONAL` is not a second timing system: it runs inside the same resolving action/event stack.

This is the generic basis for optional non-card-set actions such as a Realm allowing the current player to move the top card of their deck to the bottom after a prior inspection.

---

# CP2-03C-04 — Filtered player choice

`CHOOSE_PLAYER` must support legality filters so a player who cannot perform the resulting action is not offered as an option.

Extend it with `where`:

```json
{
  "op": "CHOOSE_PLAYER",
  "allowed": ["self", "opponent"],
  "where": {
    "predicate": "reserve_count_at_least",
    "count": 1
  },
  "as": "chosen_player"
}
```

Semantics:

- candidate players are generated server-authoritatively;
- only candidates satisfying `where` are exposed;
- the source action is unplayable if its rules require one candidate and none exist;
- hidden information must never be used as a player-choice filter unless the acting player is legally entitled to that information;
- a later nested prompt may use `$chosen_player` so the affected player, rather than the caster, makes their own Reserve selection.

---

# CP2-03C-05 — Temporary modifier duration and consumption

Turn-scoped “next attack” or “until end of turn” effects need one common lifecycle contract.

Any temporary modifier operation may carry:

```json
{
  "duration": {
    "expires_on": ["end_of_turn"],
    "max_uses": 1,
    "consume_on": "legal_attack_declared"
  }
}
```

Canonical rules:

- `expires_on` is a list; the modifier expires at the first listed matching lifecycle event;
- `max_uses: null` means the modifier persists until expiry rather than being use-limited;
- `consume_on` is optional and names the event that spends one use;
- when `max_uses` reaches zero, remove the modifier immediately;
- `legal_attack_declared` consumes a “next attack” modifier once the attack declaration is legal, even if the attack is later prevented or its damage becomes zero;
- a modifier with both `max_uses: 1` and `expires_on: ["end_of_turn"]` therefore means exactly “the next legal attack this turn”; if no attack is declared, it simply expires at turn end;
- creation sequence/source action id remains attached to the modifier for deterministic cleanup and replay.

This structure applies generically to attack-damage bonuses, withdrawal changes, attack-cost changes and comparable temporary effects.

Example:

```json
{
  "op": "ADD_ATTACK_DAMAGE_MODIFIER",
  "target": "$attached_creature",
  "amount": 20,
  "duration": {
    "expires_on": ["end_of_turn"],
    "max_uses": 1,
    "consume_on": "legal_attack_declared"
  }
}
```

---

# CP2-03C-06 — Limit owner extensions

The generic limit object may use these owners:

- `controller`
- `event_controller`
- `card_instance`
- `attachment`

Examples:

```json
{"scope":"turn","count":1,"owner":"controller"}
```

means once per controller turn for that source/listener.

```json
{"scope":"turn","count":1,"owner":"event_controller"}
```

means once for each player during that player's own turn, suitable for symmetric Realm listeners.

```json
{"scope":"attachment","count":1,"owner":"attachment"}
```

means once during that continuous attachment lifetime.

Limit identity always includes the source card/listener id so unrelated copies do not share a usage marker unless a separate global rule explicitly says they do.

---

# CP2-03C-07 — Hidden search normalization

A deck is a hidden zone even when the server knows its contents. A search effect must not leak hidden-deck composition through action availability unless the card explicitly makes that information knowable.

For a normal “search your deck for 1 qualifying card” instruction, v0.2 may encode:

```json
{
  "selection": {
    "min": 0,
    "max": 1,
    "filters": {}
  },
  "declared_target_count": 1,
  "hidden_fail_allowed": true
}
```

Meaning:

- the player may fail to find a qualifying hidden card;
- if they choose one, it must satisfy the filter and normal reveal/destination rules;
- the public log does not reveal whether no qualifying card existed or the player chose not to find one;
- this does not change effects whose accepted text explicitly says “up to 1”; those already use ordinary `min:0,max:1` semantics.

This prevents a hidden-zone search from becoming an unintended deck-content oracle.

---

# CP2-03C-08 — Validation additions

A v0.2 validator must additionally reject:

1. `server_only` hidden data serialized into a player view or public log;
2. an `event_occurred` predicate referencing an undeclared event/window;
3. `OPTIONAL` without an identified decision-making player;
4. `OPTIONAL` nested steps that themselves require an unresolved second player choice without producing the normal pending-choice continuation;
5. filtered `CHOOSE_PLAYER` whose filter depends on hidden information unavailable to the acting player;
6. a temporary modifier with contradictory duration/use semantics;
7. a use-limited modifier without a deterministic `consume_on` event;
8. an unsupported limit owner;
9. hidden-deck search behavior that exposes whether a qualifying card exists when `hidden_fail_allowed` is true.

---

# CP2-03C completion state

**THE COMPLETE READ-ONLY ASTRAL 24 MAPPING NOW HAS A GENERIC v0.2 REPRESENTATION PATH WITHOUT ASTRAL-SPECIFIC RUNTIME EXCEPTIONS.**

No Astral definition is promoted by this amendment itself.

## Next bounded action

After this exact-head amendment passes CI:

**CP2-04A — create the complete 24-identity Astral v0.2 candidate ledger** using:

- accepted Astral card designs from `tcg-set-one-audit.md`;
- corrected Astral weakness assignments from `tcg-card-pass-2-weakness-resistance.md`;
- `resistance: null` for all current SB1 Astral creatures;
- explicit top-level Starbound true/false for every identity;
- the base v0.2 schema plus amendments A, B and C;
- the fresh active SB1 Astral ids and exact `Second Sky` 60-card recipe as source evidence.

The Astral candidate remains branch-only design data. It must pass deterministic schema/reference validation and exact-head CI before the next element, Ember, begins.