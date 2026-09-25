import {
  runtimeV02BeginActiveAbilityActivationCost,
  type RuntimeV02ActiveAbilityActivationCostPermit,
} from "./tcg-match-active-ability-activation-cost-v0-2.ts";
import type { RuntimeV02ActionCostState } from "./tcg-match-action-cost-gate-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  applyRuntimeConditionWithContext,
  runtimeConditions,
  runtimeV02ConditionSlot,
  type RuntimeV02ConditionApplyWithContextResult,
  type RuntimeV02ConditionCreature,
  type RuntimeV02ConditionName,
} from "./tcg-match-condition-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

export type RuntimeV02ActiveAbilityConditionReplacementState<
  T extends RuntimeV02CardZoneInstance,
> = RuntimeV02ActionCostState<T> & Record<string, unknown>;

export type RuntimeV02ActiveAbilityConditionReplacementSource = {
  where: FieldWhere;
  index: number | null;
  instance: Inst;
};

export type RuntimeV02ActiveAbilityConditionReplacementDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  requirement: {
    predicate: "control_condition_present";
    target: "$current_opponent_vanguard";
    exclude_condition: RuntimeV02ConditionName;
  };
  step: {
    op: "REPLACE_CONTROL_CONDITION";
    target: "$current_opponent_vanguard";
    condition: RuntimeV02ConditionName;
    allow_if_empty: false;
    replace_existing: true;
  };
};

export type RuntimeV02ActiveAbilityConditionReplacementResolution<
  T extends RuntimeV02CardZoneInstance,
> = {
  kind: "replace_opponent_vanguard_control_condition";
  ability_id: string;
  activation_permit: RuntimeV02ActiveAbilityActivationCostPermit<T>;
  source_creature_uid: string;
  source_card_id: string;
  target_controller_seat: Seat;
  target_creature_uid: string;
  previous_condition: string;
  requested_condition: RuntimeV02ConditionName;
  resulting_condition: string | null;
  applied: boolean;
  prevented: boolean;
  reason: string | null;
  protection_id: string | null;
  condition_slot: "scorched" | "venomed" | "control" | "modifier";
  change_kind: "apply" | "replace" | null;
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

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const keys = new Set(allowed);
  const extra = Object.keys(value).find((key) => !keys.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_condition_replacement_turn_invalid");
  }
  return turn;
}

function activeSeat(state: Record<string, unknown>): Seat {
  if (state.active_seat !== 1 && state.active_seat !== 2) {
    throw new Error("tcg_v0_2_active_condition_replacement_active_seat_invalid");
  }
  return state.active_seat;
}

function player(
  state: Record<string, unknown>,
  seat: Seat,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(seat)]) : null;
  if (!row || !Array.isArray(row.reserve)) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_player_invalid:${seat}`,
    );
  }
  return row;
}

function creature(
  value: unknown,
  error: string,
): Record<string, unknown> & RuntimeV02ConditionCreature {
  const row = objectRecord(value);
  if (
    !row ||
    !Array.isArray(row.stack) ||
    row.stack.length < 1 ||
    !Array.isArray(row.essence)
  ) {
    throw new Error(error);
  }
  const damage = Number(row.damage ?? 0);
  const shield = Number(row.shield ?? 0);
  if (!Number.isFinite(damage) || damage < 0 || !Number.isFinite(shield) || shield < 0) {
    throw new Error(`${error}:state`);
  }
  return row as Record<string, unknown> & RuntimeV02ConditionCreature;
}

function topInstance(
  value: Record<string, unknown>,
  error: string,
): Inst {
  const stack = value.stack as unknown[];
  const top = objectRecord(stack[stack.length - 1]);
  if (!top) throw new Error(error);
  return {
    uid: requiredString(top.uid, `${error}:uid`),
    card_id: requiredString(top.card_id, `${error}:card_id`),
  };
}

function fieldCreature(
  state: Record<string, unknown>,
  seat: Seat,
  where: FieldWhere,
  index: number | null,
): Record<string, unknown> & RuntimeV02ConditionCreature {
  const owner = player(state, seat);
  if (where === "vanguard") {
    if (index !== null) {
      throw new Error(
        "tcg_v0_2_active_condition_replacement_vanguard_index_invalid",
      );
    }
    return creature(
      owner.vanguard,
      `tcg_v0_2_active_condition_replacement_vanguard_missing:${seat}`,
    );
  }
  if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
    throw new Error(
      "tcg_v0_2_active_condition_replacement_reserve_index_invalid",
    );
  }
  return creature(
    (owner.reserve as unknown[])[Number(index)],
    `tcg_v0_2_active_condition_replacement_reserve_missing:${seat}:${index}`,
  );
}

function bindSource(
  state: Record<string, unknown>,
  seat: Seat,
  source: RuntimeV02ActiveAbilityConditionReplacementSource,
): {
  creature: Record<string, unknown> & RuntimeV02ConditionCreature;
  instance: Inst;
} {
  const bound = fieldCreature(state, seat, source.where, source.index);
  const instance = topInstance(
    bound,
    "tcg_v0_2_active_condition_replacement_source_top_invalid",
  );
  if (
    instance.uid !== source.instance.uid ||
    instance.card_id !== source.instance.card_id
  ) {
    throw new Error("tcg_v0_2_active_condition_replacement_source_changed");
  }
  return { creature: bound, instance };
}

function exactLimit(
  raw: unknown,
  abilityId: string,
): { scope: "turn"; count: 1; owner: "controller" } {
  const value = objectRecord(raw);
  if (!value) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_limit_required:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    value,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_condition_replacement_limit_field_unsupported:${abilityId}`,
  );
  if (
    value.scope !== "turn" ||
    Number(value.count) !== 1 ||
    value.owner !== "controller"
  ) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_limit_unsupported:${abilityId}`,
    );
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

function exactRequirement(
  raw: unknown,
  abilityId: string,
): RuntimeV02ActiveAbilityConditionReplacementDescriptor["requirement"] {
  const root = objectRecord(raw);
  if (!root) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_requirements_required:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    root,
    ["all"],
    `tcg_v0_2_active_condition_replacement_requirements_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(root.all) || root.all.length !== 1) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_requirements_shape_unsupported:${abilityId}`,
    );
  }
  const value = objectRecord(root.all[0]);
  if (!value) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_requirement_invalid:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    value,
    ["predicate", "target", "exclude_condition"],
    `tcg_v0_2_active_condition_replacement_requirement_field_unsupported:${abilityId}`,
  );
  if (value.predicate !== "control_condition_present") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_requirement_predicate_unsupported:${abilityId}`,
    );
  }
  if (value.target !== "$current_opponent_vanguard") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_requirement_target_unsupported:${abilityId}`,
    );
  }
  const excluded = requiredString(
    value.exclude_condition,
    `tcg_v0_2_active_condition_replacement_requirement_exclude_required:${abilityId}`,
  );
  if (runtimeV02ConditionSlot(excluded) !== "control") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_requirement_exclude_not_control:${abilityId}`,
    );
  }
  return {
    predicate: "control_condition_present",
    target: "$current_opponent_vanguard",
    exclude_condition: excluded as RuntimeV02ConditionName,
  };
}

function exactStep(
  raw: Record<string, unknown>,
  abilityId: string,
): RuntimeV02ActiveAbilityConditionReplacementDescriptor["step"] {
  rejectUnsupportedFields(
    raw,
    [
      "op",
      "target",
      "condition",
      "allow_if_empty",
      "replace_existing",
    ],
    `tcg_v0_2_active_condition_replacement_step_field_unsupported:${abilityId}`,
  );
  if (raw.op !== "REPLACE_CONTROL_CONDITION") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_step_op_unsupported:${abilityId}`,
    );
  }
  if (raw.target !== "$current_opponent_vanguard") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_step_target_unsupported:${abilityId}`,
    );
  }
  if (raw.allow_if_empty !== false || raw.replace_existing !== true) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_step_mode_unsupported:${abilityId}`,
    );
  }
  const condition = requiredString(
    raw.condition,
    `tcg_v0_2_active_condition_replacement_condition_required:${abilityId}`,
  );
  if (runtimeV02ConditionSlot(condition) !== "control") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_condition_not_control:${abilityId}`,
    );
  }
  return {
    op: "REPLACE_CONTROL_CONDITION",
    target: "$current_opponent_vanguard",
    condition: condition as RuntimeV02ConditionName,
    allow_if_empty: false,
    replace_existing: true,
  };
}

export function structuredRuntimeActiveAbilityConditionReplacement(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityConditionReplacementDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") {
    return null;
  }
  const creatureDef = objectRecord(definition.creature);
  const ability = objectRecord(creatureDef?.ability);
  if (!ability || ability.mode !== "active") return null;

  const steps = Array.isArray(ability.steps)
    ? ability.steps.map((entry) => objectRecord(entry))
    : null;
  const claimsFamily = Boolean(
    steps?.some((entry) => entry?.op === "REPLACE_CONTROL_CONDITION"),
  );
  if (!claimsFamily) return null;
  if (!steps || steps.length !== 1 || !steps[0]) {
    throw new Error(
      "tcg_v0_2_active_condition_replacement_steps_shape_unsupported",
    );
  }

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_condition_replacement_ability_id_required",
  );
  rejectUnsupportedFields(
    ability,
    [
      "id",
      "name",
      "mode",
      "event",
      "timing",
      "limit",
      "requirements",
      "costs",
      "steps",
    ],
    `tcg_v0_2_active_condition_replacement_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || ability.timing !== "own_turn") {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_timing_unsupported:${abilityId}`,
    );
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_costs_unsupported:${abilityId}`,
    );
  }

  const requirement = exactRequirement(ability.requirements, abilityId);
  const step = exactStep(steps[0], abilityId);
  if (requirement.exclude_condition !== step.condition) {
    throw new Error(
      `tcg_v0_2_active_condition_replacement_exclusion_mismatch:${abilityId}`,
    );
  }

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit: exactLimit(ability.limit, abilityId),
    requirement,
    step,
  };
}

function requirementTarget(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilityConditionReplacementDescriptor,
): {
  seat: Seat;
  creature: Record<string, unknown> & RuntimeV02ConditionCreature;
  current_condition: string;
} {
  const opponentSeat: Seat = controllerSeat === 1 ? 2 : 1;
  const opponent = fieldCreature(state, opponentSeat, "vanguard", null);
  const current = runtimeConditions(opponent).control;
  if (!current) {
    throw new Error(
      "tcg_v0_2_active_condition_replacement_requirements_not_met:control_condition_missing",
    );
  }
  if (current === descriptor.requirement.exclude_condition) {
    throw new Error(
      "tcg_v0_2_active_condition_replacement_requirements_not_met:excluded_condition",
    );
  }
  return { seat: opponentSeat, creature: opponent, current_condition: current };
}

function executeOnce<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActiveAbilityConditionReplacementState<T>,
  controllerSeat: Seat,
  source: RuntimeV02ActiveAbilityConditionReplacementSource,
  descriptor: RuntimeV02ActiveAbilityConditionReplacementDescriptor,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ActiveAbilityConditionReplacementResolution<T> {
  const rawState = state as Record<string, unknown>;
  if (activeSeat(rawState) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_condition_replacement_not_active_seat");
  }
  const boundSource = bindSource(rawState, controllerSeat, source);
  requirementTarget(rawState, controllerSeat, descriptor);

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
    turn_limit: descriptor.limit.count,
  });
  if (activation.status !== "activation_permitted") {
    throw new Error(
      "tcg_v0_2_active_condition_replacement_cost_choice_unsupported",
    );
  }

  bindSource(rawState, controllerSeat, source);
  const target = requirementTarget(rawState, controllerSeat, descriptor);
  const turn = currentTurn(rawState);
  const result: RuntimeV02ConditionApplyWithContextResult =
    applyRuntimeConditionWithContext(
      target.creature,
      descriptor.step.condition,
      turn,
      "replace",
      {
        turn_seq: turn,
        active_seat: activeSeat(rawState),
        source_controller_seat: controllerSeat,
        target_controller_seat: target.seat,
        card_effect: true,
        source_action_id: descriptor.ability_id,
      },
    );
  const resulting = runtimeConditions(target.creature).control;

  const targetTop = topInstance(
    target.creature,
    "tcg_v0_2_active_condition_replacement_target_top_invalid",
  );
  return {
    kind: "replace_opponent_vanguard_control_condition",
    ability_id: descriptor.ability_id,
    activation_permit: activation.permit,
    source_creature_uid: boundSource.instance.uid,
    source_card_id: boundSource.instance.card_id,
    target_controller_seat: target.seat,
    target_creature_uid: targetTop.uid,
    previous_condition: target.current_condition,
    requested_condition: descriptor.step.condition,
    resulting_condition: resulting,
    applied: result.applied,
    prevented: result.prevented,
    reason: result.reason || null,
    protection_id: result.protection?.protection_id || null,
    condition_slot: result.condition_slot,
    change_kind: result.change_kind,
  };
}

/**
 * Executes the generic own-turn active Ability family that replaces an existing
 * opposing Vanguard control condition with another control condition.
 *
 * Ability owns recognition, requirement and activation orchestration only.
 * Payment/turn-limit remain with the Active Ability activation-cost owner and
 * condition mutation, immunity and temporary protection remain with Condition.
 * A full cloned preflight runs before the real once-per-turn receipt is written.
 */
export function runtimeV02ExecuteActiveAbilityConditionReplacement<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityConditionReplacementState<T>,
  controllerSeat: Seat,
  source: RuntimeV02ActiveAbilityConditionReplacementSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ActiveAbilityConditionReplacementResolution<T> | null {
  const descriptor = structuredRuntimeActiveAbilityConditionReplacement(
    state as Record<string, unknown>,
    source.instance,
  );
  if (!descriptor) return null;

  const simulation = structuredClone(
    state,
  ) as RuntimeV02ActiveAbilityConditionReplacementState<T>;
  executeOnce(simulation, controllerSeat, source, descriptor, defeatDescribe);
  return executeOnce(state, controllerSeat, source, descriptor, defeatDescribe);
}
