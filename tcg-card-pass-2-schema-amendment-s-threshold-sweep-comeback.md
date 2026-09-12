# Stream Bandit TCG — Card Pass 2 — Schema Amendment S — Remaining-HP Sweeps & Reward-Progress Comeback Scaling

**Status:** Binding additive future-capability amendment. Branch design only. No production registry, migration, deployed engine or Set One card is changed by this file.

**Purpose:** Formalize two additional finisher patterns used by hard control/toolbox decks: (1) defeating opposing Creatures that have been reduced to a low remaining-HP threshold, including rare board-wide cleanup, and (2) attacks whose damage increases according to how many Reward Cards the opponent has already claimed.

---

## S-01 — Remaining-HP threshold is different from accumulated-damage threshold

The engine must distinguish:

- `target_damage_equals / at_least / at_most` — accumulated damage on the target;
- `target_remaining_hp_at_most / at_least / equals` — effective current HP remaining after accumulated damage and current continuous HP modifiers.

Example:

```json
{"predicate":"target_remaining_hp_at_most","target":"$target_creature","amount":50}
```

A 300 HP Creature with 250 damage has 50 HP remaining and satisfies this predicate. A 100 HP Creature with 40 damage has 60 HP remaining and does not.

The check always uses authoritative current state, never client arithmetic.

---

## S-02 — Single-target threshold execution

The existing shared execute operation may use remaining HP:

```json
{
  "op":"DEFEAT_TARGET_IF",
  "target":"$target_creature",
  "when":{"predicate":"target_remaining_hp_at_most","target":"$target_creature","amount":50},
  "reason":"remaining_hp_execution"
}
```

Rules:

- this is a defeat effect, not damage;
- Weakness/Resistance do not modify it;
- Shield does not prevent the defeat effect itself;
- the threshold is checked from canonical current remaining HP;
- the shared defeat/Reward/win owner handles the result.

---

## S-03 — Rare board-wide low-HP cleanup

Add/normalize a grouped execution operation:

```json
{
  "op":"DEFEAT_EACH_MATCHING",
  "selector":{"controller":"opponent","zone":"field"},
  "when":{"predicate":"target_remaining_hp_at_most","amount":50},
  "reason":"remaining_hp_sweep"
}
```

Semantics:

1. snapshot all legal opposing field Creatures at resolution;
2. calculate current remaining HP independently for each;
3. include each Creature at **50 HP or less remaining**;
4. defeat all included Creatures through the shared defeat owner;
5. process all resulting Reward/win consequences deterministically.

This is deliberately a rare/high-tier finisher because it can convert distributed chip damage across Vanguard + Reserve into multiple defeats.

A future card may use a different threshold, but every threshold is explicit structured data. There is no global automatic 50-HP knockout rule.

---

## S-04 — Sweep timing / source survival

Unless a card explicitly says otherwise, `DEFEAT_EACH_MATCHING` resolves from one resolution snapshot.

The source must be legal and in play when the effect begins resolving if the action requires an in-play source. Once the eligible target set is snapshotted, one target's defeat does not remove another already-eligible target from the same sweep.

If simultaneous defeats decide the match, the shared winner owner resolves all required Reward/win state in deterministic order.

---

## S-05 — Counterplay to low-HP sweeps

Healthy counters include:

- heal one or more prepared Creatures above the threshold;
- move damage away before the execution window;
- switch/withdraw a prepared target if the finisher only reaches Vanguard;
- prevent/reduce the setup damage before threshold is reached;
- defeat/suppress the sweep finisher before it acts;
- use HP-increase effects where legal;
- avoid spreading damage too thinly when the opponent's sweep threat is visible.

The setup should create strategic tension: spreading 20–40 damage across several opposing Creatures is valuable only if the finisher can later cash that board state in.

---

## S-06 — Opponent Reward progress as a public scalar

Add/normalize count source:

```json
{
  "kind":"count_state",
  "state":"opponent_rewards_claimed"
}
```

Definition:

`opponent_rewards_claimed` = number of Reward Cards the opposing player has already taken/claimed from their six-card Reward map during this match.

This is public canonical match state. It never comes from the client and never counts unrevealed Reward identities.

---

## S-07 — Comeback attack damage formula

Support attack damage formulas such as:

```json
{
  "base":0,
  "terms":[{
    "kind":"multiply_count",
    "count":{"state":"opponent_rewards_claimed"},
    "amount_per":60
  }]
}
```

This produces:

- opponent has claimed 0 Rewards → 0 formula damage before other legal modifiers;
- 1 Reward → 60;
- 2 Rewards → 120;
- 3 Rewards → 180;
- 4 Rewards → 240;
- 5 Rewards → 300.

If six Rewards have already been claimed, the match should normally already be over through the shared win owner, so the attack is not expected to resolve in ordinary play.

The exact `60` value is a future design example/capability, not automatically assigned to any Set One card.

---

## S-08 — Comeback scaling is ordinary attack damage

Unlike execution effects, Reward-progress scaling produces **ordinary attack damage**.

Therefore the canonical attack pipeline still applies:

1. calculate formula damage from authoritative Reward progress;
2. add other legal attack bonuses/modifiers;
3. apply global Weakness once maximum;
4. apply explicit Resistance;
5. apply reductions/prevention;
6. apply Shield;
7. apply HP damage;
8. resolve after-damage effects/defeats/Rewards/win.

This distinction is mandatory: a 60-per-Reward comeback attack can still be prevented/reduced like any other attack.

---

## S-09 — Why this is a comeback finisher

Reward-progress scaling intentionally becomes stronger as the opponent approaches victory.

A control/toolbox deck may spend early turns:

- establishing conditions;
- walling/selectively protecting;
- moving damage;
- forcing switches;
- assembling tools/Realms;
- allowing the opponent to claim some Rewards.

The comeback finisher then converts the opponent's progress into attack power, giving the deck a legitimate closing line if its precision/condition execution plan is disrupted.

This is strategic redundancy, not random power: the same deck can pivot between multiple visible win conditions depending on draw and board state.

---

## S-10 — Multi-route finisher identity

The control/toolbox archetype may therefore contain three distinct finisher families:

1. **Condition execution** — Amendment R; defeat a target because it is currently condition-affected.
2. **Precision execution** — Amendment Q; defeat a target because an exact/explicit damage threshold is satisfied.
3. **Comeback damage finisher** — this amendment; deal scaling attack damage based on opponent Reward progress.

A fourth rare board-control payoff is:

4. **Remaining-HP sweep** — defeat each/specified opposing Creature at or below a remaining-HP threshold such as 50.

These mechanics may coexist in one future deck, but each keeps separate structured rules and counterplay.

---

## S-11 — Events / predicates

Add/normalize:

- `target_remaining_hp_equals`
- `target_remaining_hp_at_most`
- `target_remaining_hp_at_least`
- `DEFEAT_EACH_MATCHING`
- `opponent_rewards_claimed`
- `reward_progress_scaled_attack_declared`
- `remaining_hp_sweep_resolved`
- `$eligible_sweep_targets`
- `$opponent_rewards_claimed`

All state and events are server-authoritative and replay-safe.

---

## S-12 — Validator guards

Reject:

1. remaining-HP thresholds calculated from printed HP only while ignoring current effective HP modifiers;
2. client-supplied Reward progress;
3. a sweep that mutates Rewards/winner state directly rather than using the shared defeat owner;
4. Weakness or Shield being applied to an execute/sweep defeat effect itself;
5. Reward-progress scaling being treated as a defeat effect instead of ordinary attack damage;
6. a board-wide low-HP sweep without a high-tier cost/gate or meaningful counterplay;
7. silent conversion of `50 HP or less remaining` into `50 accumulated damage`;
8. counting the controller's own claimed Rewards when the card explicitly scales from the opponent's progress;
9. executing an ordinary attack after the match has already ended because the opponent claimed all six Rewards.

---

## Amendment S conclusion

The shared design language now captures two additional hard-control finishers:

- **distributed setup → reduce one or several opposing Creatures to 50-or-less remaining HP → threshold knockout/sweep**;
- **fall behind on Rewards → convert the opponent's claimed Reward count into a large scaling attack, e.g. 60 damage per Reward claimed.**

These sit alongside condition execution and exact-damage execution as separate, deterministic win routes.