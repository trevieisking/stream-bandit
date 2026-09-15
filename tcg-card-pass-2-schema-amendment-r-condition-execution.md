# Stream Bandit TCG — Card Pass 2 — Schema Amendment R — Condition Execution

**Status:** Binding additive future-capability amendment. Branch design only. No production registry, migration, deployed engine or Set One card is changed by this file.

**Purpose:** Separate condition-based execution from exact-damage execution. These are related control-finisher patterns but they are not the same mechanic and must remain independently expressible in the shared engine.

---

## R-01 — Two distinct execution families

The engine distinguishes:

1. **Precision execution** — Amendment Q; the target must satisfy an exact or explicit damage threshold such as exactly 60 accumulated damage.
2. **Condition execution** — this amendment; the target must be affected by one or more declared conditions at the required timing.

A deck may contain both and use the same setup package to enable either route, but one must never be silently interpreted as the other.

---

## R-02 — Generic condition execution predicate

Add/normalize:

```json
{
  "predicate":"target_has_any_condition",
  "target":"$attack_target",
  "condition_classes":["modifier","control"]
}
```

Named-condition form:

```json
{
  "predicate":"target_has_condition",
  "target":"$attack_target",
  "condition":"Venomed"
}
```

Multiple-condition form:

```json
{
  "predicate":"target_has_any_named_condition",
  "target":"$attack_target",
  "conditions":["Venomed","Scorched","Blinded","Dazed","Stunned"]
}
```

The accepted condition list comes from the current Stream Bandit condition registry. Card text may choose all conditions, one class, or a named subset.

---

## R-03 — Condition execute operation

Use the shared defeat owner:

```json
{
  "op":"DEFEAT_TARGET_IF",
  "target":"$attack_target",
  "when":{
    "predicate":"target_has_any_condition",
    "target":"$attack_target"
  },
  "reason":"condition_execution"
}
```

Rules:

- this is a defeat effect, not attack damage;
- Weakness/Resistance do not modify it;
- Shield does not prevent the defeat effect itself;
- selective attack-damage protection does not prevent it unless the protecting effect explicitly prevents the whole attack/effect rather than only its damage packet;
- the target must still be legal and in play at resolution;
- defeat, Reward and winner processing remain owned by the shared defeat pipeline.

---

## R-04 — Timing checks

Default condition-execution timing:

1. check the declared condition requirement when the action becomes legal;
2. check it again immediately before the defeat effect resolves.

If the target has the condition cleared before resolution in a future response-capable timing window, the execution fails unless the card explicitly says declaration-only.

The engine records both checks for deterministic replay.

---

## R-05 — Conditions are real setup, not labels

A condition-execution card must read the same canonical condition state used by all ordinary condition rules.

Reject:

- card-name flags such as `target_marked_for_execution` when the actual requirement is a condition;
- client-provided condition state;
- a hidden duplicate condition state maintained only for one finisher.

If the target is Venomed, Blinded, Dazed, Stunned, etc., that state must come from the normal condition owner and be removable by normal legal condition-clearing effects.

---

## R-06 — Setup sources

Condition execution may be enabled by any legal, schema-driven source such as:

- an attack that applies a condition;
- a Device that applies a condition;
- a Realm that modifies condition pressure;
- a passive listener;
- hostile condition transfer/replacement if a future rule supports it;
- forced switching that exposes an already-conditioned target.

The execution card does not care which legal source created the condition unless it explicitly adds a source restriction.

---

## R-07 — Hybrid execution

High-tier future cards may require both a condition and a damage state:

```json
{
  "all":[
    {"predicate":"target_has_any_condition","target":"$attack_target"},
    {"predicate":"target_damage_equals","target":"$attack_target","amount":60}
  ]
}
```

Hybrid execution is deliberately harder to set up and may justify a stronger payoff, but it is not the default condition-execution pattern.

---

## R-08 — Counterplay

Condition execution remains answerable through:

- clear the relevant condition;
- evolve/transform if a future rule clears conditions;
- switch to an unconditioned Creature;
- prevent the condition from being applied with a Relic/Ability;
- suppress/remove the condition-setting source;
- replace a Realm that is enabling the condition engine;
- remove/disable the execution Creature before it acts;
- use other legal state-reset effects.

The opponent must have practical interaction windows in the relevant format.

---

## R-09 — Design identity

Condition execution naturally supports:

- **Underworld:** high-risk finishers that capitalize on suffering/conditions;
- **Shade:** setup/control and condition creation;
- **Fairy:** counters and cleansing;
- future mixed-element toolbox decks.

No element owns condition execution exclusively.

---

## R-10 — Validation guards

Reject:

1. condition execution encoded as ordinary attack damage;
2. condition execution that ignores the shared condition state;
3. execution that bypasses the shared defeat/Reward/win owner;
4. a card-name-specific condition check;
5. declaration-only condition checking unless explicitly approved;
6. broad condition execute effects with no practical condition-clearing or positional counterplay in the environment;
7. silent conversion of `has a condition` into an exact-damage requirement or vice versa.

---

## Amendment R conclusion

The shared engine now distinguishes two control-finisher routes cleanly:

- **Condition execution:** the target is defeated because it is currently affected by the required condition state.
- **Precision execution:** the target is defeated because it satisfies an exact/explicit damage threshold.

A toolbox deck may run both routes and pivot according to draw and board state, but the validator/runtime must keep them separate.