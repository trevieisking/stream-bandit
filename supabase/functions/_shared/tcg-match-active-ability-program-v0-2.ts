import {
  runtimeV02BeginActiveAbilityActivationCost,
  type RuntimeV02ActiveAbilityActivationCostPermit,
} from "./tcg-match-active-ability-activation-cost-v0-2.ts";
import type { RuntimeV02ActionCostState } from "./tcg-match-action-cost-gate-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02ApplyDrainVitalityProgram,
  type RuntimeV02DamageProgramCreatureRef,
  type RuntimeV02DamageProgramState,
  type RuntimeV02DrainVitalityProgramResult,
} from "./tcg-match-damage-program-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import {
  evaluateRuntimeV02SourceDamagedRequirement,
  normalizeRuntimeV02SourceDamagedRequirement,
  type RuntimeV02SourceDamagedRequirement,
} from "./tcg-match-requirement-evaluator-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02ActiveAbilityProgramState<T extends RuntimeV02CardZoneInstance> =
  RuntimeV02ActionCostState<T> & RuntimeV02DamageProgramState<T>;

export type RuntimeV02ActiveAbilityProgramSource = {
  where: "vanguard" | "reserve";
  index: number | null;
  instance: { uid: string; card_id: string };
};

export type RuntimeV02ActiveAbilityDrainDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  requirement: RuntimeV02SourceDamagedRequirement;
  step: {
    op: "DRAIN_VITALITY";
    target: "$current_opponent_vanguard";
    amount: number;
    heal_target: "$source_creature";
    heal_cap: number;
    as: string | null;
  };
};

export type RuntimeV02ActiveAbilityDrainResolution<T extends RuntimeV02CardZoneInstance> = {
  kind: "drain_vitality";
  ability_id: string;
  activation_permit: RuntimeV02ActiveAbilityActivationCostPermit<T>;
  actual_vitality_drained: number;
  actual_heal: number;
  emitted_packet_ids: string[];
  damage_result: RuntimeV02DrainVitalityProgramResult;
};

type BoundFieldCreature = {
  creature: Record<string, unknown>;
  instance: { uid: string; card_id: string };
  ref: RuntimeV02DamageProgramCreatureRef;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function positiveAmount(value: unknown, error: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(error);
  return amount;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const set = new Set(allowed);
  const extra = Object.keys(value).find((key) => !set.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function exactLimit(raw: unknown, abilityId: string) {
  const limit = objectRecord(raw);
  if (!limit) throw new Error(`tcg_v0_2_active_ability_program_limit_required:${abilityId}`);
  rejectUnsupportedFields(
    limit,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_ability_program_limit_field_unsupported:${abilityId}`,
  );
  if (limit.scope !== "turn" || Number(limit.count) !== 1 || limit.owner !== "controller") {
    throw new Error(`tcg_v0_2_active_ability_program_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}

function exactSourceDamagedRequirement(raw: unknown, abilityId: string): RuntimeV02SourceDamagedRequirement {
  const requirements = objectRecord(raw);
  if (!requirements) throw new Error(`tcg_v0_2_active_ability_program_requirements_invalid:${abilityId}`);
  rejectUnsupportedFields(
    requirements,
    ["all"],
    `tcg_v0_2_active_ability_program_requirements_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(requirements.all) || requirements.all.length !== 1) {
    throw new Error(`tcg_v0_2_active_ability_program_requirements_shape_unsupported:${abilityId}`);
  }
  return normalizeRuntimeV02SourceDamagedRequirement(requirements.all[0]);
}

export function structuredRuntimeActiveAbilityDrainDescriptor(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityDrainDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = creature ? objectRecord(creature.ability) : null;
  if (!ability || String(ability.mode || "") !== "active") return null;
  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!steps || steps.length !== 1) return null;
  const step = objectRecord(steps[0]);
  if (!step || step.op !== "DRAIN_VITALITY") return null;

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_ability_program_ability_id_required",
  );
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_program_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || ability.timing !== "own_turn") {
    throw new Error(`tcg_v0_2_active_ability_program_timing_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_program_costs_unsupported:${abilityId}`);
  }
  const limit = exactLimit(ability.limit, abilityId);
  const requirement = exactSourceDamagedRequirement(ability.requirements, abilityId);

  rejectUnsupportedFields(
    step,
    ["op", "target", "amount", "heal_target", "heal_cap", "as"],
    `tcg_v0_2_active_ability_program_step_field_unsupported:${abilityId}`,
  );
  if (step.target !== "$current_opponent_vanguard") {
    throw new Error(`tcg_v0_2_active_ability_program_target_unsupported:${abilityId}`);
  }
  if (step.heal_target !== "$source_creature") {
    throw new Error(`tcg_v0_2_active_ability_program_heal_target_unsupported:${abilityId}`);
  }
  const as = step.as == null
    ? null
    : requiredString(step.as, `tcg_v0_2_active_ability_program_variable_invalid:${abilityId}`);

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    requirement,
    step: {
      op: "DRAIN_VITALITY",
      target: "$current_opponent_vanguard",
      amount: positiveAmount(step.amount, `tcg_v0_2_active_ability_program_amount_invalid:${abilityId}`),
      heal_target: "$source_creature",
      heal_cap: positiveAmount(step.heal_cap, `tcg_v0_2_active_ability_program_heal_cap_invalid:${abilityId}`),
      as,
    },
  };
}

function playerRecord(state: Record<string, unknown>, seat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(seat)]) : null;
  if (!player || !Array.isArray(player.reserve)) {
    throw new Error(`tcg_v0_2_active_ability_program_player_invalid:${seat}`);
  }
  return player;
}

function fieldCreature(
  state: Record<string, unknown>,
  seat: 1 | 2,
  where: "vanguard" | "reserve",
  index: number | null,
): Record<string, unknown> {
  const player = playerRecord(state, seat);
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_active_ability_program_vanguard_index_invalid");
    const creature = objectRecord(player.vanguard);
    if (!creature) throw new Error(`tcg_v0_2_active_ability_program_vanguard_missing:${seat}`);
    return creature;
  }
  if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
    throw new Error("tcg_v0_2_active_ability_program_reserve_index_invalid");
  }
  const creature = objectRecord((player.reserve as unknown[])[Number(index)]);
  if (!creature) throw new Error(`tcg_v0_2_active_ability_program_reserve_missing:${seat}:${index}`);
  return creature;
}

function topInstance(creature: Record<string, unknown>, error: string): { uid: string; card_id: string } {
  if (!Array.isArray(creature.stack) || creature.stack.length < 1) throw new Error(error);
  const top = objectRecord(creature.stack[creature.stack.length - 1]);
  if (!top) throw new Error(error);
  return {
    uid: requiredString(top.uid, `${error}:uid`),
    card_id: requiredString(top.card_id, `${error}:card_id`),
  };
}

function definitionElement(
  state: Record<string, unknown>,
  instance: { uid: string; card_id: string },
  error: string,
): string {
  const definition = runtimeV02Definition(state, instance);
  if (!definition) throw new Error(error);
  return requiredString(definition.element, error);
}

function bindFieldCreature(
  state: Record<string, unknown>,
  seat: 1 | 2,
  where: "vanguard" | "reserve",
  index: number | null,
  expected?: { uid: string; card_id: string },
): BoundFieldCreature {
  const creature = fieldCreature(state, seat, where, index);
  const instance = topInstance(creature, "tcg_v0_2_active_ability_program_source_top_invalid");
  if (expected && (instance.uid !== expected.uid || instance.card_id !== expected.card_id)) {
    throw new Error("tcg_v0_2_active_ability_program_source_changed");
  }
  return {
    creature,
    instance,
    ref: {
      controller_seat: seat,
      where,
      index,
      anchor_uid: instance.uid,
      card_id: instance.card_id,
      element: definitionElement(
        state,
        instance,
        "tcg_v0_2_active_ability_program_element_missing",
      ),
    },
  };
}

function activeSeat(state: Record<string, unknown>): 1 | 2 {
  if (state.active_seat !== 1 && state.active_seat !== 2) {
    throw new Error("tcg_v0_2_active_ability_program_active_seat_invalid");
  }
  return state.active_seat;
}

function executeOnce<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActiveAbilityProgramState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityProgramSource,
  descriptor: RuntimeV02ActiveAbilityDrainDescriptor,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ActiveAbilityDrainResolution<T> {
  if (activeSeat(state as Record<string, unknown>) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_program_not_active_seat");
  }
  const boundSource = bindFieldCreature(
    state as Record<string, unknown>,
    controllerSeat,
    source.where,
    source.index,
    source.instance,
  );
  const requirement = evaluateRuntimeV02SourceDamagedRequirement(
    boundSource.creature,
    descriptor.requirement,
  );
  if (!requirement.matched) {
    throw new Error("tcg_v0_2_active_ability_program_requirements_not_met:source_damaged");
  }

  const activation = runtimeV02BeginActiveAbilityActivationCost(state, {
    cost_gate: {
      controller_seat: controllerSeat,
      action_kind: "ability",
      action_id: descriptor.ability_id,
      source: {
        location: { where: source.where, index: source.index },
        instance: { ...boundSource.instance },
      },
      defeat_describe: defeatDescribe,
    },
    turn_limit: 1,
  });
  if (activation.status !== "activation_permitted") {
    throw new Error("tcg_v0_2_active_ability_program_cost_choice_unsupported");
  }

  const reboundSource = bindFieldCreature(
    state as Record<string, unknown>,
    controllerSeat,
    source.where,
    source.index,
    source.instance,
  );
  const opponentSeat = controllerSeat === 1 ? 2 : 1;
  const opponent = bindFieldCreature(
    state as Record<string, unknown>,
    opponentSeat,
    "vanguard",
    null,
  );
  const damageResult = runtimeV02ApplyDrainVitalityProgram(state, {
    identity: {
      source_action_id: descriptor.ability_id,
      source_step_index: 0,
      source_card_uid: reboundSource.instance.uid,
      source_card_id: reboundSource.instance.card_id,
      source_creature_uid: reboundSource.instance.uid,
      action_kind: "ability",
      controller_seat: controllerSeat,
    },
    target: opponent.ref,
    heal_target: reboundSource.ref,
    amount: descriptor.step.amount,
    heal_cap: descriptor.step.heal_cap,
    defeat_describe: defeatDescribe,
  });

  return {
    kind: "drain_vitality",
    ability_id: descriptor.ability_id,
    activation_permit: activation.permit,
    actual_vitality_drained: damageResult.actual_vitality_drained,
    actual_heal: damageResult.actual_heal,
    emitted_packet_ids: damageResult.heal_packet ? [damageResult.heal_packet.id] : [],
    damage_result: damageResult,
  };
}

/**
 * Executes the generic own-turn active Ability family whose sole effect is
 * DRAIN_VITALITY from the opposing Vanguard into its damaged source Creature.
 *
 * Ability owns activation/limit/requirement orchestration only. Payment, Damage,
 * Heal and Defeat remain delegated to their canonical engines. A cloned preflight
 * proves the complete transaction before the real once-per-turn receipt is written.
 */
export function runtimeV02ExecuteActiveAbilityDrainProgram<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActiveAbilityProgramState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityProgramSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ActiveAbilityDrainResolution<T> | null {
  const descriptor = structuredRuntimeActiveAbilityDrainDescriptor(
    state as Record<string, unknown>,
    source.instance,
  );
  if (!descriptor) return null;

  const simulation = structuredClone(state) as RuntimeV02ActiveAbilityProgramState<T>;
  executeOnce(simulation, controllerSeat, source, descriptor, defeatDescribe);
  return executeOnce(state, controllerSeat, source, descriptor, defeatDescribe);
}
