# Stream Bandit TCG — Card Pass 2 — Schema Amendment V — Additional Card Costs

**Status:** Binding additive Card Pass 2 capability design for the current Fairy/Underworld completion path.

## Purpose

Card Pass 2 already gives Creature Abilities a structured `costs` array. Underworld also requires explicit non-Essence costs when an Attack is declared. Those declaration costs must use the same Payment owner without replacing or overloading the existing Attack Essence requirement.

## Canonical ownership

- `creature.ability.costs` remains the structured additional cost program for Ability activation.
- `creature.attacks[].cost` remains the attached-Essence requirement for the Attack and is not a discard/payment mutation.
- `creature.attacks[].costs` is the new additive structured additional declaration-cost program.
- Payment owns additional card-cost planning and atomic payment.
- Damage / Shield owns damage placed as a cost.
- Card-Zone owns cards discarded from hand as a cost.
- Defeat owns any defeat created by a damage cost.
- Ability and Attack callers own declaration/activation legality and may execute only after Payment returns an execution permit.

## Current leaf costs

```json
{"kind":"damage","target":"$source_creature","amount":20}
```

```json
{"kind":"hand_discard","player":"self","count":1}
```

The existing `optional` and `choice` cost nodes compose those leaves. Unsupported selectors or cost kinds fail closed.

## Required ordering

For a structured Ability activation or Attack declaration with additional costs:

1. validate the source/action identity and ordinary timing/target/requirement rules;
2. validate ordinary Attack attached-Essence requirements where applicable;
3. resolve optional/modal additional-cost decisions and any private hand-card selection;
4. atomically pay the complete selected additional-cost sequence;
5. only after successful payment, record the legal Ability use / Starbound declaration or other caller-owned declaration receipt;
6. execute the Ability or Attack;
7. resume later effect choices from the existing continuation without replaying the paid costs.

If additional-cost payment fails, the declaration/activation is not legal and no caller-owned use/Starbound receipt is consumed.

## Current Underworld bindings

This generic contract is sufficient for the accepted current-rules designs including:

- Bloodbasilisk — Paid in Blood: Ability damage cost to `$source_creature`;
- Hollowram — Toll Charge: optional Attack hand-discard declaration cost;
- Thanavor — Final Collection: required Attack choice between hand discard and source-creature damage.

These names are design bindings only. Runtime dispatch remains action-data-driven and must not branch on card ID or card name.
