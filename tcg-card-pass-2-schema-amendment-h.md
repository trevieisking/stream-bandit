# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment H

**Status:** Binding additive amendment to the Card Pass 2 v0.2 schema. Design/schema only. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic movement-pair bindings, voluntary-withdrawal execution/cost context and attack-completion steps exposed by the complete Gale structure mapping. These are shared engine capabilities, not Gale-specific runtime owners.

## Authority rule

This file extends `tcg-card-pass-2-schema.md` and Amendments A–G within the same canonical:

- `sb-tcg-card-v0.2`
- `sb-tcg-effects-v0.2`

No card-name/card-id branch is introduced by this amendment. Before runtime promotion, the base schema and reviewed amendments must be consolidated into one machine-readable validator/specification.

---

# CP2-03H-01 — One atomic switch, two movement events

A Vanguard/Reserve switch is one atomic movement action even though it produces two creature movement events.

Every legal switch records a stable switch context:

```json
{
  "switch_id":"switch-seq-id",
  "controller_seat":1,
  "outgoing_vanguard_uid":"old-vanguard-uid",
  "incoming_vanguard_uid":"reserve-creature-uid",
  "source_action_id":"action-id",
  "source_card_uid":"source-instance-uid-or-null",
  "action_kind":"voluntary_withdrawal | effect_switch | attack",
  "turn_seq":4
}
```

The normal movement events remain:

- `moved_to_reserve` — subject = outgoing Vanguard;
- `became_vanguard` — subject = incoming Vanguard.

Both events created by the same switch carry the same `switch_id`, source action and action kind.

---

# CP2-03H-02 — Switch counterpart bindings

During listener resolution for an event produced by a switch, expose stable bindings:

```text
$switch_outgoing_vanguard
$switch_incoming_vanguard
```

These bindings resolve to the exact two creature instances in that switch.

Rules:

1. they exist only for an event carrying valid switch context;
2. they never resolve by card name;
3. if a required creature has left the required zone before resolution, an operation targeting it fails closed rather than retargeting;
4. the bindings carry only public field identity/state allowed by the match view;
5. a listener may target the counterpart even when the event subject is the other creature.

Add predicates:

- `event_switch_outgoing_is_source`
- `event_switch_incoming_is_source`
- `event_switch_outgoing_controller_is_self`
- `event_switch_incoming_controller_is_self`

This permits rules such as “when this creature moves Vanguard → Reserve because of its attack, the creature that became Vanguard gets a withdrawal modifier” without inventing a Slipwing-specific handoff.

---

# CP2-03H-03 — Voluntary withdrawal cost-build event

Normal voluntary withdrawal remains a global action with its own once-per-turn allowance, global restrictions and Essence payment.

After the player selects a legal incoming Reserve creature, but before the withdrawal cost is paid, emit:

```text
before_voluntary_withdrawal_cost
```

Canonical context:

```json
{
  "event":"before_voluntary_withdrawal_cost",
  "controller_seat":1,
  "outgoing_vanguard_uid":"old-vanguard-uid",
  "incoming_vanguard_uid":"reserve-creature-uid",
  "base_cost":2,
  "current_cost":2,
  "turn_seq":4,
  "source_action_id":"withdrawal-action-id"
}
```

This context is created only after ordinary non-cost legality has passed, including turn ownership, once-per-turn availability, valid Reserve target and global restrictions such as conditions that prohibit withdrawal.

---

# CP2-03H-04 — Modify current voluntary-withdrawal cost

Add operation:

```json
{
  "op":"MODIFY_CURRENT_WITHDRAWAL_COST",
  "delta":-1,
  "minimum":0
}
```

Semantics:

1. legal only during `before_voluntary_withdrawal_cost`;
2. modifies only the current withdrawal action;
3. cannot change the selected outgoing/incoming creatures;
4. cost cannot fall below `minimum`, normally 0;
5. multiple legal modifiers apply in deterministic listener/source order;
6. the event log records source attribution and pre/post cost;
7. after all modifiers resolve, the final cost is paid through the global attached-Essence payment owner.

Also allow a fixed-value form when a card says the next withdrawal costs exactly 0:

```json
{
  "op":"MODIFY_CURRENT_WITHDRAWAL_COST",
  "set":0,
  "minimum":0
}
```

`delta` and `set` are mutually exclusive.

---

# CP2-03H-05 — Persistent/temporary withdrawal-cost modifiers

The existing v0.2 `SET_WITHDRAWAL_MODIFIER` primitive is normalized as:

```json
{
  "op":"SET_WITHDRAWAL_MODIFIER",
  "target":"$target_creature",
  "mode":"delta | set",
  "amount":-1,
  "minimum":0,
  "duration":{
    "expires_on":["end_of_turn"],
    "max_uses":1,
    "consume_on":"legal_voluntary_withdrawal_declared"
  }
}
```

Rules:

1. `mode = delta` contributes `amount` to a future matching voluntary-withdrawal cost build;
2. `mode = set` sets the cost to the stated non-negative value before later modifiers continue in deterministic order;
3. the modifier applies only when the targeted creature is the outgoing Vanguard for that voluntary withdrawal;
4. `legal_voluntary_withdrawal_declared` consumes one use only after the withdrawal is legal and the modifier actually participates in its cost build;
5. if the target never performs a legal voluntary withdrawal before expiry, the modifier expires unused;
6. effect switches never consume this modifier because they are not voluntary withdrawals.

Continuous attachments/Realms may instead contribute a `kind = withdrawal` continuous modifier evaluated during `before_voluntary_withdrawal_cost`. A once-per-turn Realm discount uses the ordinary listener-limit owner rather than card-name state.

---

# CP2-03H-06 — Execute the real voluntary-withdrawal action from a card effect

Add operation:

```json
{
  "op":"PERFORM_VOLUNTARY_WITHDRAWAL",
  "player":"self",
  "incoming_target":"$attached_creature"
}
```

This operation does **not** create an effect switch.

It asks the global voluntary-withdrawal owner to perform the same action the player could have chosen normally, with a card-provided incoming target.

Contract:

1. the player's normal voluntary-withdrawal allowance must still be unused;
2. the outgoing current Vanguard must satisfy every ordinary withdrawal restriction;
3. the supplied incoming target must be a legal friendly Reserve creature;
4. the normal withdrawal cost is built, modified and paid from the outgoing Vanguard's attached Essence;
5. if the withdrawal succeeds, the normal once-per-turn allowance is consumed;
6. the normal atomic switch/movement events are emitted with `action_kind = voluntary_withdrawal`;
7. if the action is not legal, an enclosing `OPTIONAL` choice is not offered or resolves with no action according to the ordinary optional-action contract;
8. the operation never grants a free switch merely because it originated from a card.

This is the canonical representation for effects such as an Essence attachment that immediately allows the player to take their normal withdrawal choosing that attached Reserve creature as the incoming Vanguard.

---

# CP2-03H-07 — Voluntary-withdrawal availability predicates

Add predicates:

- `voluntary_withdrawal_available`
- `voluntary_withdrawal_legal_with_incoming`

Example:

```json
{
  "predicate":"voluntary_withdrawal_legal_with_incoming",
  "player":"self",
  "incoming_target":"$attached_creature"
}
```

These predicates ask the same global legality owner used by `PERFORM_VOLUNTARY_WITHDRAWAL`. They must not reproduce withdrawal rules inside card data.

---

# CP2-03H-08 — Attack completion steps

Amendment A already defines `attack_finished` as occurring after attack declaration, attack-condition resolution, damage, after-damage instructions and the immediate defeat/win-resolution boundary belonging to that attack.

Extend a structured attack with optional:

```json
{
  "after_attack_finished": []
}
```

Semantics:

1. the steps are bound to the exact attack action that declared them;
2. they execute when that attack's `attack_finished` event is reached;
3. if the match ended during the attack's immediate defeat/win boundary, the steps do not run;
4. selectors such as `$current_opponent_vanguard` resolve from the post-defeat/post-promotion state at completion timing;
5. hidden information remains governed by normal selector/view rules;
6. the steps are still part of the one attack action for logging/replay, but they do not reopen already-completed damage;
7. no card-name-specific post-attack hook is permitted.

This supplies a deterministic home for effects that must affect the **current** opposing Vanguard after any defeat/promotion caused by the attack has finished resolving.

---

# CP2-03H-09 — Current Vanguard selectors

Add public field selectors:

```text
$current_friendly_vanguard
$current_opponent_vanguard
```

They resolve at the timing of the operation, not at declaration-time snapshot, unless a rule explicitly binds an earlier target variable.

Use cases include:

- applying a condition to the opposing Vanguard after an attack's defeat/promotion boundary;
- applying a modifier to the currently active friendly Vanguard after a multi-switch effect completes.

They may not be used to retarget ordinary attack damage after declaration; Amendment G's bound attack target remains authoritative for attack damage.

---

# CP2-03H-10 — Validation additions

A v0.2 validator must additionally reject:

1. switch counterpart bindings outside an event with valid `switch_id` context;
2. switch context whose outgoing/incoming uids are not the two creatures moved by the same atomic switch;
3. `MODIFY_CURRENT_WITHDRAWAL_COST` outside `before_voluntary_withdrawal_cost`;
4. a withdrawal cost below zero after all clamps;
5. `SET_WITHDRAWAL_MODIFIER` without deterministic duration/use semantics when it is temporary;
6. a voluntary-withdrawal modifier consumed by an effect switch;
7. `PERFORM_VOLUNTARY_WITHDRAWAL` that bypasses the player's normal allowance, restrictions or Essence payment;
8. `PERFORM_VOLUNTARY_WITHDRAWAL` targeting a non-Reserve/non-friendly creature;
9. `after_attack_finished` resolving after the match has already ended;
10. use of `$current_*_vanguard` to rewrite an already-bound ordinary attack target;
11. card-name/card-id runtime matching used to identify switch counterparts, withdrawal discounts or post-attack completion effects.

---

## Amendment H conclusion

The v0.2 grammar now has shared deterministic semantics for:

- identifying both creatures in one Vanguard/Reserve switch;
- rewarding the outgoing or incoming creature without card-name handoffs;
- modifying the cost of a real voluntary withdrawal;
- letting a card effect invoke the player's actual voluntary-withdrawal action rather than disguising it as a free effect switch;
- resolving completion effects against the post-defeat/post-promotion Vanguard state.

These capabilities are required by accepted Gale designs but are reusable across future elements and sets.
