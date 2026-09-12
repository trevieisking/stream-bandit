# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment K

**Status:** Binding additive amendment to Card Pass 2 v0.2. Design/schema only. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic prevention attribution, threshold attack reduction, prevention counters, Shield-source events and source-aware withdrawal-tax immunity exposed by the complete Stone structure mapping. These are shared defensive engine capabilities, not Stone-specific runtime owners.

## Authority rule

This file extends `tcg-card-pass-2-schema.md` and Amendments A–J within the same canonical `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` system.

No card-name/card-id runtime branch is introduced here.

---

# CP2-03K-01 — Prevention record

Whenever attack damage is reduced or prevented before final damage placement, record a prevention contribution:

```json
{
  "prevention_id":"prevent-seq-id",
  "attack_action_id":"attack-action-id",
  "target_uid":"creature-instance-uid",
  "source_card_uid":"source-instance-uid",
  "source_effect_id":"effect-id",
  "amount_prevented":20,
  "prevention_kind":"ability | relic | essence | realm | shield | temporary_modifier",
  "turn_seq":8
}
```

Rules:

1. `amount_prevented` is the actual amount this source removed from the current attack damage, never the printed maximum reduction.
2. A contribution with actual prevented amount 0 does not count as a successful prevention use.
3. Multiple sources produce separate deterministic prevention records in resolution order.
4. Shield consumption is recorded as its own prevention contribution.
5. Public logs expose only public source/state data; hidden source details are never leaked.

---

# CP2-03K-02 — Prevention event

The existing `damage_prevented` event carries at minimum:

- target uid/controller;
- attack action id;
- source card/effect uid;
- prevention kind;
- actual amount prevented;
- turn sequence;
- attack source creature uid/controller;
- whether the source remains in play after resolution.

Add predicates:

- `prevention_target_is_self`
- `prevention_target_is_attached_creature`
- `prevention_source_is_self`
- `prevention_source_is_attached_card`
- `prevention_amount_at_least`
- `prevention_kind_is`
- `prevention_attack_source_controller_is_opponent`

`event_occurred(event = damage_prevented, window = current_turn)` may filter by target uid/source uid/prevention kind.

---

# CP2-03K-03 — Current attack damage threshold predicate

During `before_attack_damage` / attack-build context add:

```json
{
  "predicate":"current_attack_damage_at_least",
  "value":100,
  "stage":"before_shield"
}
```

Supported initial `stage` values:

- `attacker_side_pre_weakness`
- `post_weakness_pre_resistance`
- `post_resistance_pre_defender_reduction`
- `before_shield`

A card must specify the stage matching its accepted wording. “Would deal 100 or more before Shield” uses `before_shield`.

---

# CP2-03K-04 — Threshold incoming attack modifier

A triggered/continuous incoming-attack modifier may require a current attack threshold and a usage limit:

```json
{
  "id":"example-threshold-guard",
  "kind":"incoming_attack_damage",
  "target":"$source_creature",
  "when":{"predicate":"current_attack_damage_at_least","value":100,"stage":"before_shield"},
  "amount":-20,
  "filters":{"source_controller":"opponent"},
  "limit":{"scope":"turn","count":1,"owner":"card_instance"},
  "consume_when":"prevention_amount_at_least_1"
}
```

Rules:

1. the limit is consumed only when this source actually prevents at least 1 damage if `consume_when = prevention_amount_at_least_1`;
2. an attack below the threshold does not consume the use;
3. if another earlier source reduces the packet below the threshold before this source's deterministic evaluation point, the threshold is evaluated at the declared `stage` snapshot, not guessed from later values;
4. card instance/source attribution is preserved.

---

# CP2-03K-05 — Match-lifetime prevention limit

The ordinary `limit` object supports:

```json
{"scope":"match","count":1,"owner":"card_instance"}
```

for effects that are spent once for that card instance during a match.

When paired with `consume_when = prevention_amount_at_least_1`, the match use is consumed only on successful prevention.

This is reusable for one-shot anti-burst armour.

---

# CP2-03K-06 — Temporary protected-target prevention modifier

Add generic operation:

```json
{
  "op":"ADD_INCOMING_ATTACK_DAMAGE_MODIFIER",
  "target":"$chosen_creature",
  "amount":-40,
  "filters":{"source_controller":"opponent"},
  "duration":{"expires_on":["opponent_next_turn_end"],"max_uses":1,"consume_on":"successful_prevention"},
  "minimum_prevention_to_consume":1
}
```

Rules:

1. the modifier can survive the rest of the controller turn and the opponent's next turn;
2. it is consumed only if it actually reduces at least the configured minimum damage;
3. an attack that would deal 0 before this modifier does not consume it;
4. if no qualifying attack arrives before expiry, it expires unused;
5. it remains bound to the chosen stable creature instance and never retargets.

---

# CP2-03K-07 — Source instance counters

Persistent cards/effects may maintain explicit deterministic counters:

```json
{
  "counter":{
    "id":"prevention_uses",
    "initial":0,
    "max":3,
    "owner":"card_instance"
  }
}
```

Add operation:

```json
{"op":"INCREMENT_SOURCE_COUNTER","counter_id":"prevention_uses","amount":1}
```

and predicate:

```json
{"predicate":"source_counter_at_least","counter_id":"prevention_uses","value":3}
```

Counters are part of canonical state, carry source instance identity and are replay-safe.

---

# CP2-03K-08 — Deferred source self-discard after attack

A prevention listener may schedule source cleanup at the current attack completion boundary:

```json
{
  "op":"SCHEDULE_SOURCE_DISCARD",
  "timing":"after_attack_finished",
  "source":"$listener_source"
}
```

Semantics:

1. the current attack completes its normal damage/effects/defeat boundary first;
2. if the source Relic remains attached at completion, move it to its owner's discard;
3. do not retarget/recreate it if already removed;
4. cleanup is idempotent for replay.

This supplies reusable “break after N successful preventions” armour behavior.

---

# CP2-03K-09 — Shield gained event context

The existing `shield_gained` event carries:

- target uid/controller;
- requested Shield amount;
- actual Shield gained after the universal cap;
- source card/action uid;
- source action kind `ability | attack | tactic | essence | realm | rule`;
- whether the Shield came from a card effect;
- turn sequence.

Add predicates:

- `shield_target_is_self`
- `shield_target_is_attached_creature`
- `shield_source_is_card_effect`
- `shield_actual_gain_at_least`

A listener may react to the first successful card-effect Shield gain during a turn without triggering from its own added Shield recursively by excluding its own source action id.

---

# CP2-03K-10 — Attack actual-damage result predicates

`after_attack_damage` / attack completion context exposes:

- bound attack target uid;
- final attack damage actually placed after reductions and Shield;
- whether target remains in play at the relevant listener timing.

Add predicates:

- `attack_actual_damage_at_least`
- `attack_target_is_opponent_vanguard`
- `attack_source_is_attached_creature`

This is the generic basis for effects that trigger only after an attack actually dealt at least N damage.

---

# CP2-03K-11 — Source-aware withdrawal increase immunity

Add continuous rule kind:

```json
{
  "kind":"withdrawal_increase_immunity",
  "target":"$attached_creature",
  "when":{"predicate":"target_element_is","target":"$attached_creature","element":"Stone"},
  "filters":{
    "blocked_sources":["opponent_card_effect","opponent_condition"]
  }
}
```

Semantics:

1. applies only to withdrawal **increases**, not decreases or set-to-lower effects;
2. blocks contributions whose authoritative source category matches `blocked_sources`;
3. does not block self-controlled card effects unless explicitly listed;
4. does not block shared Realm contributions unless `shared_realm` is explicitly listed;
5. global base withdrawal remains unchanged;
6. ignored blocked contributions are logged with source attribution for deterministic replay/debugging.

This avoids hard-coding immunity to one specific condition such as Crushed.

---

# CP2-03K-12 — Withdrawal modifier source categories

Every withdrawal modifier contribution exposes one source category:

- `base_rule`
- `self_card_effect`
- `opponent_card_effect`
- `self_condition`
- `opponent_condition`
- `shared_realm`
- `global_rule`

This category is determined by authoritative controller/source data, not by card names.

---

# CP2-03K-13 — Validation additions

A v0.2 validator must reject:

1. a prevention effect that consumes a successful-prevention use when actual prevented amount is 0;
2. an unsupported attack-damage threshold stage;
3. a match-lifetime counter/limit without card-instance identity;
4. a deferred source discard that targets a different card instance than the listener source;
5. recursive Shield-gain loops that do not fence source action/limit semantics;
6. an actual-damage threshold evaluated from printed/base damage instead of final placed attack damage;
7. withdrawal increase immunity without explicit source categories;
8. a source category inferred from printed card name;
9. a temporary first-hit prevention effect that retargets after its original target leaves play;
10. Stone-specific runtime branching where the generic structures above are sufficient.

---

## Amendment K conclusion

The shared v0.2 grammar now supports Stone's defensive identity without a separate Stone engine: threshold guards, successful-prevention attribution, match/turn prevention uses, breakable armour counters, Shield-triggered effects, actual-damage thresholds and source-aware withdrawal-tax immunity.
