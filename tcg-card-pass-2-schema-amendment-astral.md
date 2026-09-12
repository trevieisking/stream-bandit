# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment A

**Status:** Binding additive amendment to `tcg-card-pass-2-schema.md`. Design/schema only. No production registry, migration, battle engine, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic primitives discovered while attempting the first full CP2-04 conversion batch, Astral. These additions remain part of the same canonical `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` system; they do not create a second effect language.

## Authority rule

`tcg-card-pass-2-schema.md` remains the base v0.2 schema authority. This file is an **additive CP2-03A amendment** and supersedes only any omission where the base file did not explicitly define the generic primitives below. No accepted card design is changed here.

Before registry/runtime promotion, the base schema and its reviewed amendments should be consolidated into one machine-readable validator/specification so there is still one runtime schema owner.

---

# CP2-03A-01 — Generic hidden-zone inspection

Astral requires legal private inspection of Reward Cards as well as ordinary top-deck inspection. This must be generic and zone-aware rather than encoded by card name.

Add effect operation:

```json
{
  "op": "INSPECT_ZONE",
  "player": "self",
  "zone": "rewards",
  "selection": {
    "min": 1,
    "max": 1,
    "filters": {}
  },
  "visibility": "controller_private",
  "return_policy": "same_position",
  "as": "inspected"
}
```

Supported v0.2 inspection zones are limited to zones a card explicitly authorizes, including:

- `deck_top`
- `rewards`
- `hand` when an effect legally permits it
- another explicit hidden set already created by a resolving effect

`INSPECT_ZONE` does not move cards unless a separate operation says to move them.

For Rewards, `return_policy: same_position` preserves the selected face-down Reward position.

Opponent match views and public logs receive only the fact/count of a legal inspection, never the inspected card identity unless a separate effect explicitly reveals it.

`LOOK_TOP` remains a valid optimized top-deck primitive. Both `LOOK_TOP` and `INSPECT_ZONE` emit the same canonical inspection events described below.

---

# CP2-03A-02 — Inspection and reorder events

The base event model is extended with these generic events:

- `zone_inspected`
- `deck_inspected`
- `reward_inspected`
- `hidden_information_viewed`
- `deck_reordered`
- `attack_finished`

## Event payload

Inspection/reorder event payloads include only server-safe structural facts unless the current viewer is entitled to the hidden identities:

```json
{
  "event": "deck_inspected",
  "controller_seat": 1,
  "source_action_id": "action-id",
  "source_card_uid": "instance-uid",
  "zone": "deck_top",
  "count": 3,
  "private": true
}
```

`deck_reordered` additionally records the number of inspected cards whose relative/top placement was deliberately ordered by the resolving player.

`hidden_information_viewed` is a generic umbrella event emitted when an effect legally exposes hidden information to a player. It carries the source action/card reference so attached-source listeners such as a Relic can require that the attached Creature itself caused the inspection.

`attack_finished` occurs only after attack declaration, attack-condition resolution, damage, after-damage card instructions and the immediate defeat/win-resolution boundary belonging to that attack are complete. A match that has ended does not continue optional post-attack actions.

These events replace card-specific flags such as “looked at deck this turn” once v0.2 becomes runtime authority.

---

# CP2-03A-03 — Whole-zone return/shuffle operation

Archivist Sol requires returning an entire hand to its owner's deck without revealing it, then shuffling. Do not model this as public discard.

Add effect operation:

```json
{
  "op": "SHUFFLE_ZONE_INTO_DECK",
  "player": "self",
  "zone": "hand",
  "visibility": "owner_private"
}
```

Semantics:

1. take every current card in the named legal source zone;
2. move those cards into that same player's deck without revealing identities unless an effect explicitly requires reveal;
3. shuffle through the centralized deterministic RNG owner;
4. emit public count-only movement/shuffle events and private identities only to an entitled viewer.

The initial v0.2 allowed source for this operation is `hand`. Future zones require an explicit schema extension rather than silently broadening the operation.

---

# CP2-03A-04 — Generic card-variable predicate

Post-inspection effects need to test the properties of a card stored in an effect variable without revealing a failed match publicly.

Extend `IF` predicates with:

```json
{
  "predicate": "card_matches",
  "card": "$looked_card",
  "filters": {
    "element": "Astral"
  }
}
```

`card_matches` accepts the ordinary card filters from the target/filter model, including element, family, subtype, stage, trait and card id where a design explicitly needs one identity.

Using a card id as a filter inside an accepted card effect is different from a runtime **card-name special case**: the operation remains generic and the rule is data-driven.

When the tested card is hidden from the opponent, only the branch's public outcome may be exposed; the engine must not leak the private card identity merely because a predicate was evaluated.

---

# CP2-03A-05 — Source-scoped Shield contribution cap

Some accepted cards grant Shield repeatedly but cap how much **that source** may contribute at one time. This is not the same as the universal total Shield cap.

Extend `ADD_SHIELD` with optional source-cap metadata:

```json
{
  "op": "ADD_SHIELD",
  "target": "$source_creature",
  "amount": 10,
  "source_contribution_cap": 20,
  "source_key": "ability:forecast-shell"
}
```

The engine tracks the current Shield contribution still attributable to that source key. The operation adds no more than the amount that would keep that source's surviving contribution at or below the cap, and the universal Shield cap still applies afterward.

When Shield is consumed, source-attributed contribution is reduced deterministically. A fixed ordering for consuming mixed-source Shield must be defined by the engine/validator before runtime promotion; the recommended baseline is oldest Shield contribution first, with creation sequence as the stable tie-breaker.

This mechanism is generic and may later support other source-limited Shield effects without card-specific code.

---

# CP2-03A-06 — Optional top-card destination using existing primitives

No new operation is needed for “look at the top card; leave it or put it on the bottom.” v0.2 encodes it through the existing generic set primitives:

1. `LOOK_TOP` into a private set variable;
2. `CHOOSE_FROM_SET` with `min: 0, max: 1` to choose the card to bottom;
3. `MOVE_CARDS` chosen cards to `deck_bottom`;
4. `RETURN_REMAINDER_TO_DECK_TOP` for the remainder.

This pattern is binding for simple optional top-to-bottom foresight effects unless a later validator introduces an equivalent normalized shorthand.

---

# CP2-03A-07 — Listener source matching

Persistent listeners may require an event to have originated from the card or attached Creature that owns the listener.

Add generic listener source predicates:

- `source_is_self`
- `source_is_attached_creature`
- `source_controller_is_self`
- `event_zone_is`
- `event_count_at_least`

Example conceptual listener:

```json
{
  "event": "hidden_information_viewed",
  "when": {
    "all": [
      {"predicate": "source_is_attached_creature"},
      {"predicate": "source_controller_is_self"}
    ]
  },
  "limit": {"scope": "turn", "count": 1, "owner": "controller"},
  "steps": [
    {"op": "HEAL", "target": "$attached_creature", "amount": 10}
  ]
}
```

This is the generic basis for attached-source effects such as Dreamglass and prevents unrelated Tactics from triggering a Creature/Relic listener.

---

# CP2-03A-08 — Validation additions

A v0.2 validator must additionally reject:

1. hidden-zone inspection without an explicit legal zone and visibility;
2. Reward inspection that does not preserve the selected position when the effect says to return it there;
3. public serialization of private inspected identities;
4. a listener referencing an event not declared by v0.2;
5. `SHUFFLE_ZONE_INTO_DECK` from a source zone not explicitly allowed by the schema;
6. source-scoped Shield caps without stable `source_key` identity;
7. `card_matches` filters that cannot be evaluated server-authoritatively;
8. `attack_finished` listeners that resolve after the match has already ended.

---

# CP2-03A completion state

**ASTRAL-DISCOVERED GENERIC SCHEMA GAPS: RESOLVED AT v0.2 DESIGN LEVEL.**

This amendment does not structure any Astral card by itself. It makes the shared schema complete enough to attempt the 24-card Astral batch without inventing card-name special cases.

## Next bounded action

After this exact-head amendment passes CI:

**CP2-04A — structure all 24 accepted Astral identities** against `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2`, using:

- the accepted Astral audit as card-design authority;
- the corrected per-creature weakness matrix (`×2`, no SB1 resistance);
- the base CP2-03 schema plus this additive amendment;
- fresh active SB1 Astral registry/source IDs as identity evidence.

If Astral reveals another genuinely generic schema gap, record it explicitly and fix the shared schema rather than adding an Astral-specific runtime branch.