import {
  clearRuntimeCondition,
  runtimeConditions,
  type RuntimeV02ConditionCreature,
  type RuntimeV02ConditionName,
} from "./tcg-match-condition-engine-v0-2.ts";

export type RuntimeV02ConditionCoinResult = "heads" | "tails";

export type RuntimeV02ConditionDamageRequest = {
  condition: "Scorched" | "Venomed";
  amount: number;
  damage_class: "condition";
  timing: "aftermath";
};

export type RuntimeV02AttackConditionDamageRequest = {
  condition: "Mindbound" | "Dazed";
  amount: 60 | 30;
  damage_class: "condition";
  timing: "attack_declaration";
};

export type RuntimeV02ConditionAftermathResult = {
  damage_requests: RuntimeV02ConditionDamageRequest[];
  cleared_conditions: RuntimeV02ConditionName[];
  random_results: Array<{
    condition: "Scorched" | "Drenched";
    result: RuntimeV02ConditionCoinResult;
  }>;
  venomed_next: number | null;
};

export type RuntimeV02AttackControlConditionResult = {
  status: "continue" | "blocked" | "failed";
  reason: "Stunned" | "Mindbound" | "Dazed" | null;
  target_mode: "declared" | "random_all_creatures";
  damage_requests: RuntimeV02AttackConditionDamageRequest[];
  cleared_conditions: RuntimeV02ConditionName[];
  random_results: Array<{
    condition: "Mindbound" | "Dazed";
    result: RuntimeV02ConditionCoinResult;
  }>;
};

export type RuntimeV02ConditionDamageSink = (
  creature: RuntimeV02ConditionCreature,
  request: RuntimeV02ConditionDamageRequest,
) => void;

export type RuntimeV02AttackConditionDamageSink = (
  creature: RuntimeV02ConditionCreature,
  request: RuntimeV02AttackConditionDamageRequest,
) => void;

type RuntimeV02ConditionCoinOwner =
  | "Scorched"
  | "Drenched"
  | "Mindbound"
  | "Dazed";

function coin(
  randomCoin: () => RuntimeV02ConditionCoinResult,
  condition: RuntimeV02ConditionCoinOwner,
): RuntimeV02ConditionCoinResult {
  const result = randomCoin();
  if (result !== "heads" && result !== "tails") {
    throw new Error(
      `tcg_v0_2_condition_lifecycle_random_result_invalid:${condition}`,
    );
  }
  return result;
}

/**
 * Canonical attack-time owner for control-condition behaviour.
 *
 * This owner decides what Stunned, Mindbound, Dazed and Blinded mean at the
 * attack-declaration boundary. It does not own attack targeting or damage
 * placement. The Attack System consumes `target_mode`; the Damage System is
 * supplied through `applyDamage` for Mindbound/Dazed self-damage.
 */
export function runtimeV02ResolveAttackControlCondition(
  creature: RuntimeV02ConditionCreature,
  randomCoin: () => RuntimeV02ConditionCoinResult,
  applyDamage: RuntimeV02AttackConditionDamageSink,
): RuntimeV02AttackControlConditionResult {
  const conditions = runtimeConditions(creature);
  const damageRequests: RuntimeV02AttackConditionDamageRequest[] = [];
  const clearedConditions: RuntimeV02ConditionName[] = [];
  const randomResults: RuntimeV02AttackControlConditionResult["random_results"] = [];
  const control = conditions.control;

  if (control === "Stunned") {
    return {
      status: "blocked",
      reason: "Stunned",
      target_mode: "declared",
      damage_requests: damageRequests,
      cleared_conditions: clearedConditions,
      random_results: randomResults,
    };
  }

  if (control === "Mindbound") {
    const result = coin(randomCoin, "Mindbound");
    randomResults.push({ condition: "Mindbound", result });
    if (result === "heads") {
      if (clearRuntimeCondition(creature, "Mindbound")) {
        clearedConditions.push("Mindbound");
      }
      return {
        status: "continue",
        reason: null,
        target_mode: "declared",
        damage_requests: damageRequests,
        cleared_conditions: clearedConditions,
        random_results: randomResults,
      };
    }
    const request: RuntimeV02AttackConditionDamageRequest = {
      condition: "Mindbound",
      amount: 60,
      damage_class: "condition",
      timing: "attack_declaration",
    };
    damageRequests.push(request);
    applyDamage(creature, request);
    return {
      status: "failed",
      reason: "Mindbound",
      target_mode: "declared",
      damage_requests: damageRequests,
      cleared_conditions: clearedConditions,
      random_results: randomResults,
    };
  }

  if (control === "Dazed") {
    const result = coin(randomCoin, "Dazed");
    randomResults.push({ condition: "Dazed", result });
    if (clearRuntimeCondition(creature, "Dazed")) {
      clearedConditions.push("Dazed");
    }
    if (result === "tails") {
      const request: RuntimeV02AttackConditionDamageRequest = {
        condition: "Dazed",
        amount: 30,
        damage_class: "condition",
        timing: "attack_declaration",
      };
      damageRequests.push(request);
      applyDamage(creature, request);
      return {
        status: "failed",
        reason: "Dazed",
        target_mode: "declared",
        damage_requests: damageRequests,
        cleared_conditions: clearedConditions,
        random_results: randomResults,
      };
    }
    return {
      status: "continue",
      reason: null,
      target_mode: "declared",
      damage_requests: damageRequests,
      cleared_conditions: clearedConditions,
      random_results: randomResults,
    };
  }

  if (control === "Blinded") {
    if (clearRuntimeCondition(creature, "Blinded")) {
      clearedConditions.push("Blinded");
    }
    return {
      status: "continue",
      reason: null,
      target_mode: "random_all_creatures",
      damage_requests: damageRequests,
      cleared_conditions: clearedConditions,
      random_results: randomResults,
    };
  }

  return {
    status: "continue",
    reason: null,
    target_mode: "declared",
    damage_requests: damageRequests,
    cleared_conditions: clearedConditions,
    random_results: randomResults,
  };
}

/**
 * Canonical Aftermath owner for ordinary v0.2 conditions.
 *
 * This function owns condition timing, escalation and expiry. It deliberately
 * does not own damage placement: callers provide the canonical damage sink so
 * condition rules cannot grow a second damage engine.
 *
 * The caller decides which Creature is in the relevant Aftermath scope. The
 * current match rules invoke this for the active player's Vanguard only.
 */
export function runtimeV02ResolveConditionAftermath(
  creature: RuntimeV02ConditionCreature,
  randomCoin: () => RuntimeV02ConditionCoinResult,
  applyDamage: RuntimeV02ConditionDamageSink,
): RuntimeV02ConditionAftermathResult {
  let conditions = runtimeConditions(creature);
  const damageRequests: RuntimeV02ConditionDamageRequest[] = [];
  const clearedConditions: RuntimeV02ConditionName[] = [];
  const randomResults: RuntimeV02ConditionAftermathResult["random_results"] = [];
  let venomedNext: number | null = null;

  if (conditions.scorched) {
    const request: RuntimeV02ConditionDamageRequest = {
      condition: "Scorched",
      amount: 20,
      damage_class: "condition",
      timing: "aftermath",
    };
    damageRequests.push(request);
    applyDamage(creature, request);
    const result = coin(randomCoin, "Scorched");
    randomResults.push({ condition: "Scorched", result });
    if (result === "heads" && clearRuntimeCondition(creature, "Scorched")) {
      clearedConditions.push("Scorched");
      conditions = runtimeConditions(creature);
    }
  }

  if (conditions.venomed > 0) {
    const amount = Math.min(60, Math.max(10, Number(conditions.venomed)));
    const request: RuntimeV02ConditionDamageRequest = {
      condition: "Venomed",
      amount,
      damage_class: "condition",
      timing: "aftermath",
    };
    damageRequests.push(request);
    applyDamage(creature, request);
    conditions.venomed = Math.min(60, amount + 10);
    venomedNext = conditions.venomed;
  }

  const control = conditions.control;
  if (
    (control === "Stunned" || control === "Rooted") &&
    clearRuntimeCondition(creature, control)
  ) {
    clearedConditions.push(control);
    conditions = runtimeConditions(creature);
  }

  const modifier = conditions.modifier;
  if (
    (modifier === "Silenced" || modifier === "Crushed") &&
    clearRuntimeCondition(creature, modifier)
  ) {
    clearedConditions.push(modifier);
    conditions = runtimeConditions(creature);
  }

  if (conditions.modifier === "Drenched") {
    const result = coin(randomCoin, "Drenched");
    randomResults.push({ condition: "Drenched", result });
    if (result === "heads" && clearRuntimeCondition(creature, "Drenched")) {
      clearedConditions.push("Drenched");
    }
  }

  return {
    damage_requests: damageRequests,
    cleared_conditions: clearedConditions,
    random_results: randomResults,
    venomed_next: venomedNext,
  };
}
