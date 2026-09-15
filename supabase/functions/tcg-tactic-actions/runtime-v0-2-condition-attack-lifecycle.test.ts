import {
  runtimeConditions,
  type RuntimeV02ConditionCreature,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02ResolveAttackControlCondition,
  type RuntimeV02AttackConditionDamageRequest,
} from "../_shared/tcg-match-condition-lifecycle-v0-2.ts";
import { placeRuntimeDamage } from "./runtime-v0-2-core.ts";

function equal(actual: unknown, expected: unknown, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function creature(control: string | null): RuntimeV02ConditionCreature {
  return {
    damage: 5,
    shield: 50,
    condition: control,
    conditions: {
      scorched: false,
      venomed: 0,
      control,
      modifier: null,
    },
    flags: {},
  };
}

function damageSink(
  requests: RuntimeV02AttackConditionDamageRequest[],
) {
  return (
    target: RuntimeV02ConditionCreature,
    request: RuntimeV02AttackConditionDamageRequest,
  ) => {
    requests.push(request);
    placeRuntimeDamage(target, request.amount);
  };
}

Deno.test("Stunned attack-time control semantics are owned without clearing or rolling", () => {
  const target = creature("Stunned");
  let rolls = 0;
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => {
      rolls += 1;
      return "heads";
    },
    damageSink(requests),
  );

  equal(result.status, "blocked", "Stunned must block the declaration");
  equal(result.reason, "Stunned", "Stunned must identify the blocking condition");
  equal(result.target_mode, "declared", "Stunned must not alter targeting");
  equal(runtimeConditions(target).control, "Stunned", "Stunned must persist until its normal expiry");
  equal(requests.length, 0, "Stunned must request no damage");
  equal(rolls, 0, "Stunned must not consume randomness");
});

Deno.test("Mindbound heads clears Mindbound and allows the attack to continue", () => {
  const target = creature("Mindbound");
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => "heads",
    damageSink(requests),
  );

  equal(result.status, "continue", "Mindbound heads must continue the attack");
  equal(result.reason, null, "continued attack must have no failure reason");
  equal(result.random_results.length, 1, "Mindbound must record one coin result");
  equal(result.random_results[0].condition, "Mindbound", "Mindbound audit must retain condition identity");
  equal(result.random_results[0].result, "heads", "Mindbound audit must retain the coin result");
  equal(runtimeConditions(target).control, null, "Mindbound heads must clear the condition");
  equal(target.condition, null, "compatibility scalar must clear with canonical state");
  equal(requests.length, 0, "Mindbound heads must request no damage");
});

Deno.test("Mindbound tails fails the attack and delegates 60 Shield-bypassing damage", () => {
  const target = creature("Mindbound");
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => "tails",
    damageSink(requests),
  );

  equal(result.status, "failed", "Mindbound tails must end the attack");
  equal(result.reason, "Mindbound", "Mindbound must own the failure reason");
  equal(requests.length, 1, "Mindbound tails must request exactly one damage packet");
  equal(requests[0].amount, 60, "Mindbound self-damage must remain 60");
  equal(requests[0].damage_class, "condition", "Mindbound damage must stay classified as condition damage");
  equal(requests[0].timing, "attack_declaration", "Mindbound damage timing must be explicit");
  equal(target.damage, 65, "canonical damage placement must add 60 damage");
  equal(target.shield, 50, "Mindbound condition damage must preserve Shield-bypass semantics");
  equal(runtimeConditions(target).control, "Mindbound", "Mindbound tails must leave the condition active");
});

Deno.test("Dazed heads clears Dazed and continues without damage", () => {
  const target = creature("Dazed");
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => "heads",
    damageSink(requests),
  );

  equal(result.status, "continue", "Dazed heads must continue the attack");
  equal(result.random_results.length, 1, "Dazed must record one coin result");
  equal(result.random_results[0].result, "heads", "Dazed audit must retain heads");
  equal(runtimeConditions(target).control, null, "Dazed must clear after its attack check");
  equal(requests.length, 0, "Dazed heads must request no damage");
});

Deno.test("Dazed tails clears Dazed, fails the attack and delegates 30 damage", () => {
  const target = creature("Dazed");
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => "tails",
    damageSink(requests),
  );

  equal(result.status, "failed", "Dazed tails must end the attack");
  equal(result.reason, "Dazed", "Dazed must own the failure reason");
  equal(runtimeConditions(target).control, null, "Dazed tails must still clear Dazed");
  equal(requests.length, 1, "Dazed tails must request exactly one damage packet");
  equal(requests[0].amount, 30, "Dazed self-damage must remain 30");
  equal(target.damage, 35, "canonical damage placement must add 30 damage");
  equal(target.shield, 50, "Dazed condition damage must preserve Shield-bypass semantics");
});

Deno.test("Blinded delegates random-target selection to Attack while owning its own consumption", () => {
  const target = creature("Blinded");
  let rolls = 0;
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => {
      rolls += 1;
      return "heads";
    },
    damageSink(requests),
  );

  equal(result.status, "continue", "Blinded must not cancel the attack");
  equal(result.target_mode, "random_all_creatures", "Blinded must request Attack-owned random targeting");
  equal(runtimeConditions(target).control, null, "Blinded must be consumed for the attack");
  equal(result.random_results.length, 0, "Condition owner must not select a target or invent a target roll");
  equal(requests.length, 0, "Blinded must request no damage");
  equal(rolls, 0, "Blinded target randomness belongs to the Attack System, not Condition Lifecycle");
});

Deno.test("non-attack control conditions remain untouched by the attack-condition owner", () => {
  const target = creature("Rooted");
  const requests: RuntimeV02AttackConditionDamageRequest[] = [];
  const result = runtimeV02ResolveAttackControlCondition(
    target,
    () => {
      throw new Error("Rooted must not roll at attack declaration");
    },
    damageSink(requests),
  );

  equal(result.status, "continue", "Rooted does not block attacks");
  equal(result.target_mode, "declared", "Rooted must not alter attack targeting");
  equal(runtimeConditions(target).control, "Rooted", "Rooted attack-time state must remain untouched");
  equal(requests.length, 0, "Rooted must request no attack-time damage");
});
