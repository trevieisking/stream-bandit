# Stream Bandit TCG — Card Pass 2 — Schema Amendment Q — Precision Condition Execution

**Status:** Binding additive future-capability amendment. Branch design only. No production registry, migration, deployed engine or Set One card is changed by this file.

**Purpose:** Formalize the control archetype where the player deliberately engineers a target to an exact damage total, often through conditions plus damage placement/movement, then converts that exact board state into a defeat effect. This is a first-class Stream Bandit mechanic, not ordinary damage racing.

---

## Q-01 — Precision execution identity

The intended play pattern is:

1. apply one or more Control/Modifier conditions;
2. allow scheduled condition damage or other legal effects to create some damage;
3. use damage placement/movement or small attacks to fine-tune the target's current damage total;
4. deliberately stop at the required threshold rather than maximizing damage;
5. pivot to an execution Creature/attack;
6. if the target still satisfies the exact threshold at the required timing, defeat it through the shared defeat owner.

The strategic skill is **damage arithmetic and timing**. Overshooting the threshold can make the execution fail.

---

## Q-02 — Exact damage predicates

Add/normalize:

```json
{"predicate":"target_damage_equals","target":"$attack_target","amount":60}
```

Also support:

```json
{"predicate":"target_damage_at_least","target":"$attack_target","amount":60}
{"predicate":"target_damage_at_most","target":"$attack_target","amount":60}
{"predicate":"target_remaining_hp_at_most","target":"$attack_target","amount":60}
```

`target_damage_equals` reads the authoritative accumulated damage on the Creature at the exact evaluation point. It does not estimate from printed HP or client state.

All current design values are expressed in Stream Bandit HP units; multiples of 10 are preferred.

---

## Q-03 — Execute operation

Add:

```json
{
  "op":"DEFEAT_TARGET_IF",
  "target":"$attack_target",
  "when":{"predicate":"target_damage_equals","target":"$attack_target","amount":60},
  "reason":"precision_execution"
}
```

Rules:

- this is not attack damage;
- Weakness/Resistance do not modify it;
- Shield does not stop it;
- attack-damage prevention does not stop it unless the card explicitly says the whole attack/effect is prevented rather than just damage;
- the target must still be a legal in-play target at resolution;
- defeat, Reward and win processing use the normal shared owner;
- the operation must never directly mutate Rewards or winner state itself.

---

## Q-04 — Declaration vs resolution checks

A precision execution effect must state whether its gate is checked:

- at legal declaration only;
- at resolution only; or
- at both declaration and resolution.

**Default for exact-damage executions:** check at declaration **and** again immediately before the defeat effect resolves.

This means the opponent may be able to change the state between those windows when a future response mechanic allows it; the execution is not guaranteed merely because the declaration was legal.

---

## Q-05 — Condition-assisted setup

Precision execution is intentionally compatible with conditions.

A future deck may:

- Venom a target;
- Confuse/Daze/Stun it for tempo;
- let scheduled Venom/condition damage create a predictable increment;
- use direct placement or moved damage for smaller corrections;
- force-switch the prepared target Vanguard when needed;
- execute at the exact total.

No condition automatically grants execution. The execution card must contain the explicit threshold predicate.

---

## Q-06 — Condition + exact threshold hybrid

Future high-tier effects may require both:

```json
{
  "all":[
    {"predicate":"target_damage_equals","target":"$attack_target","amount":60},
    {"predicate":"target_has_any_condition","target":"$attack_target"}
  ]
}
```

or a named condition:

```json
{
  "all":[
    {"predicate":"target_damage_equals","target":"$attack_target","amount":60},
    {"predicate":"target_has_condition","target":"$attack_target","condition":"Venomed"}
  ]
}
```

These hybrids should be rarer/stronger because they require two independently interactable setup dimensions.

---

## Q-07 — Fine-control damage sources

The engine must preserve multiple legal ways to reach the exact total:

- scheduled condition damage;
- `PLACE_DAMAGE` in small increments;
- `MOVE_DAMAGE` from a friendly Creature;
- low-damage attacks;
- small triggered effect-damage packets;
- Realm-amplified condition increments;
- future card-specific but schema-driven modifiers.

Players must be allowed to choose a smaller legal amount when a card says **up to N damage** or **move up to N damage**, enabling precision rather than forcing maximum transfer.

If a card says a fixed amount, the fixed amount must be applied; the player cannot reduce it merely to hit an execution threshold.

---

## Q-08 — Overshoot is meaningful

If an execution requires exactly 60 damage and the target has 70 damage, the exact-60 execution is **not legal/successful**.

This is deliberate. The control player must plan arithmetic and timing instead of simply stacking maximum damage.

A different card may use `at_least` or remaining-HP thresholds, but that is a different mechanic and must be encoded explicitly.

---

## Q-09 — Forced switching and target preservation

Precision-control decks may use switching to preserve or expose the prepared target.

The engine must distinguish:

- current opposing Vanguard;
- specific Creature uid that was prepared;
- target that moved to Reserve;
- target that returned to Vanguard later.

Damage and conditions stay on the same Creature unless another rule removes them.

A precision-execution attack normally checks its current legal attack target. A future ranged execute may explicitly target Reserve but must opt into alternate targeting through Amendment G.

---

## Q-10 — Counterplay

Healthy counters include:

- clear the condition before its next tick;
- heal or move damage off the prepared target;
- intentionally move the target away from the required zone;
- replace the Realm that is amplifying the condition;
- prevent future placement/movement with a separate protection layer;
- defeat/suppress the execution Creature before the pivot turn;
- force the damage total past an exact threshold when legal;
- use Shield against ordinary setup damage even though Shield does not stop the eventual execute operation itself.

The design goal is a threatening setup puzzle, not an unavoidable instant defeat.

---

## Q-11 — Search/toolbox synergy

Precision-execution decks should be allowed to run situational one-of pieces when their search package supports broad roles such as:

- condition setter;
- damage mover;
- damage placer;
- pivot/switch tool;
- execution Creature;
- condition-protection Relic;
- Realm amplifier.

Search remains registry-filtered and may never identify a target by display name in engine code.

---

## Q-12 — Event model

Add/normalize:

- `precision_execution_declared`
- `precision_execution_resolved`
- `precision_execution_failed_threshold`
- `$target_damage_before_execution`
- `$execution_threshold`
- `$execution_target`

These carry action, turn, source and target ids for deterministic replay.

---

## Q-13 — Validator guards

Reject:

1. exact-damage execution keyed to card name/id instead of structured predicate;
2. execute effects that bypass the shared defeat/Reward/win owner;
3. client-supplied current damage as authority;
4. silent conversion of `equals 60` to `at least 60`;
5. optional `up to N` movement being forced to maximum;
6. fixed-amount placement being reduced without explicit permission;
7. Weakness/Resistance multiplying a defeat operation;
8. Shield incorrectly preventing the defeat operation itself;
9. exact-threshold cards with no practical state-changing counterplay in the environment;
10. execution effects being common enough to make ordinary combat irrelevant.

---

## Q-14 — Balance guidance

Precision execute is powerful and should normally require several turns/cards of setup.

Recommended levers:

- exact threshold rather than `at least`;
- expensive attack/activation cost;
- Vanguard-only targeting;
- once-per-turn or once-per-match limit where appropriate;
- fragile execution Creature;
- requirement for a condition as well as exact damage;
- visible setup so the opponent can respond.

The archetype should win through **precision and sequencing**, not through a cheap universal instant-KO button.

---

## Amendment Q conclusion

Stream Bandit now has a planned deterministic home for the exact play pattern Trev uses competitively:

**apply conditions → generate predictable damage increments → move/place counters precisely → stop at the exact threshold → pivot to the execution card → defeat the prepared target.**

This makes precise damage arithmetic a legitimate control win condition alongside ordinary attack damage.