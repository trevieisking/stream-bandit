import {
  runtimeV02BeginActiveAbilityActivationCost,
  type RuntimeV02ActiveAbilityActivationCostPermit,
} from "./tcg-match-active-ability-activation-cost-v0-2.ts";
import type { RuntimeV02ActionCostState } from "./tcg-match-action-cost-gate-v0-2.ts";
import {
  runtimeV02BuildActiveAbilityOpponentCreatureChoice,
  runtimeV02ResolveActiveAbilityOpponentCreatureChoice,
  type RuntimeV02PendingActiveAbilityOpponentCreatureChoice,
} from "./tcg-match-active-ability-opponent-creature-choice-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02ApplyDrainVitalityProgram,
  type RuntimeV02DamageProgramCreatureRef,
  type RuntimeV02DamageProgramState,
  type RuntimeV02DrainVitalityProgramResult,
} from "./tcg-match-damage-program-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02ActiveAbilityTargetedDrainState<T extends RuntimeV02CardZoneInstance> =
  RuntimeV02ActionCostState<T> & RuntimeV02DamageProgramState<T>;

export type RuntimeV02ActiveAbilityTargetedDrainSource = {
  where: "vanguard" | "reserve";
  index: number | null;
  instance: { uid: string; card_id: string };
};

export type RuntimeV02ActiveAbilityTargetedDrainDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  cost: {
    kind: "damage";
    target: "$source_creature";
    amount: number;
  };
  select: {
    op: "SELECT_CREATURE";
    controller: "opponent";
    zone: "field";
    count: 1;
    filters: Record<string, never>;
    as: string;
  };
  drain: {
    op: "DRAIN_VITALITY";
    target: string;
    amount: number;
    heal_target: "$source_creature";
    heal_cap: number;
  };
};

export type RuntimeV02ActiveAbilityTargetedDrainBegin<T extends RuntimeV02CardZoneInstance> = {
  status: "target_choice_required";
  ability_id: string;
  activation_permit: RuntimeV02ActiveAbilityActivationCostPermit<T>;
  pending_choice: RuntimeV02PendingActiveAbilityOpponentCreatureChoice;
};

export type RuntimeV02ActiveAbilityTargetedDrainResolution = {
  kind: "selected_opponent_drain_vitality";
  ability_id: string;
  target_creature_uid: string;
  target_controller_seat: 1 | 2;
  actual_vitality_drained: number;
  actual_heal: number;
  emitted_packet_ids: string[];
  damage_result: RuntimeV02DrainVitalityProgramResult;
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
  const allowedSet = new Set(allowed);
  const unsupported = Object.keys(value).find((key) => !allowedSet.has(key));
  if (unsupported) throw new Error(`${error}:${unsupported}`);
}

function exactLimit(raw: unknown, abilityId: string) {
  const limit = objectRecord(raw);
  if (!limit) throw new Error(`tcg_v0_2_active_ability_targeted_drain_limit_required:${abilityId}`);
  rejectUnsupportedFields(
    limit,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_ability_targeted_drain_limit_field_unsupported:${abilityId}`,
  );
  if (limit.scope !== "turn" || Number(limit.count) !== 1 || limit.owner !== "controller") {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}

function exactNoRequirements(raw: unknown, abilityId: string): void {
  if (!Array.isArray(raw) || raw.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_requirements_unsupported:${abilityId}`);
  }
}

function exactDamageCost(raw: unknown, abilityId: string) {
  const cost = objectRecord(raw);
  if (!cost) throw new Error(`tcg_v0_2_active_ability_targeted_drain_cost_invalid:${abilityId}`);
  rejectUnsupportedFields(
    cost,
    ["kind", "target", "amount"],
    `tcg_v0_2_active_ability_targeted_drain_cost_field_unsupported:${abilityId}`,
  );
  if (cost.kind !== "damage" || cost.target !== "$source_creature") {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_cost_unsupported:${abilityId}`);
  }
  return {
    kind: "damage" as const,
    target: "$source_creature" as const,
    amount: positiveAmount(
      cost.amount,
      `tcg_v0_2_active_ability_targeted_drain_cost_amount_invalid:${abilityId}`,
    ),
  };
}

function exactSelection(raw: unknown, abilityId: string) {
  const step = objectRecord(raw);
  if (!step) throw new Error(`tcg_v0_2_active_ability_targeted_drain_select_invalid:${abilityId}`);
  rejectUnsupportedFields(
    step,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_active_ability_targeted_drain_select_field_unsupported:${abilityId}`,
  );
  const filters = objectRecord(step.filters);
  if (
    step.op !== "SELECT_CREATURE" ||
    step.controller !== "opponent" ||
    step.zone !== "field" ||
    Number(step.count) !== 1 ||
    !filters ||
    Object.keys(filters).length !== 0
  ) {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_select_unsupported:${abilityId}`);
  }
  return {
    op: "SELECT_CREATURE" as const,
    controller: "opponent" as const,
    zone: "field" as const,
    count: 1 as const,
    filters: {} as Record<string, never>,
    as: requiredString(
      step.as,
      `tcg_v0_2_active_ability_targeted_drain_select_variable_required:${abilityId}`,
    ),
  };
}

function exactDrain(raw: unknown, abilityId: string, selectionVariable: string) {
  const step = objectRecord(raw);
  if (!step) throw new Error(`tcg_v0_2_active_ability_targeted_drain_step_invalid:${abilityId}`);
  rejectUnsupportedFields(
    step,
    ["op", "target", "amount", "heal_target", "heal_cap"],
    `tcg_v0_2_active_ability_targeted_drain_step_field_unsupported:${abilityId}`,
  );
  if (step.op !== "DRAIN_VITALITY") {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_step_unsupported:${abilityId}`);
  }
  if (step.target !== `$${selectionVariable}`) {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_target_binding_invalid:${abilityId}`);
  }
  if (step.heal_target !== "$source_creature") {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_heal_target_unsupported:${abilityId}`);
  }
  return {
    op: "DRAIN_VITALITY" as const,
    target: String(step.target),
    amount: positiveAmount(
      step.amount,
      `tcg_v0_2_active_ability_targeted_drain_amount_invalid:${abilityId}`,
    ),
    heal_target: "$source_creature" as const,
    heal_cap: positiveAmount(
      step.heal_cap,
      `tcg_v0_2_active_ability_targeted_drain_heal_cap_invalid:${abilityId}`,
    ),
  };
}

/**
 * Recognizes the reusable active-Ability shape:
 * required source-damage activation cost -> choose one opposing field Creature ->
 * DRAIN_VITALITY into the still-live source Creature.
 *
 * This is action-data authority only. Payment, Damage, Heal and Defeat retain all
 * mutation ownership.
 */
export function structuredRuntimeActiveAbilityTargetedDrainDescriptor(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityTargetedDrainDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = creature ? objectRecord(creature.ability) : null;
  if (!ability || String(ability.mode || "") !== "active") return null;
  const costs = Array.isArray(ability.costs) ? ability.costs : null;
  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!costs || costs.length !== 1 || !steps || steps.length !== 2) return null;
  const firstStep = objectRecord(steps[0]);
  const secondStep = objectRecord(steps[1]);
  if (firstStep?.op !== "SELECT_CREATURE" || secondStep?.op !== "DRAIN_VITALITY") return null;

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_ability_targeted_drain_ability_id_required",
  );
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_targeted_drain_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || ability.timing !== "own_turn") {
    throw new Error(`tcg_v0_2_active_ability_targeted_drain_timing_unsupported:${abilityId}`);
  }
  exactNoRequirements(ability.requirements, abilityId);
  const limit = exactLimit(ability.limit, abilityId);
  const cost = exactDamageCost(costs[0], abilityId);
  const select = exactSelection(steps[0], abilityId);
  const drain = exactDrain(steps[1], abilityId, select.as);

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    cost,
    select,
    drain,
  };
}

function definitionElement(
  state: Record<string, unknown>,
  cardId: string,
): string {
  const definition = runtimeV02Definition(state, { card_id: cardId });
  const element = typeof definition?.element === "string" ? definition.element.trim() : "";
  if (!element) throw new Error(`tcg_v0_2_active_ability_targeted_drain_element_missing:${cardId}`);
  return element;
}

function sourceRef(
  state: Record<string, unknown>,
  pending: RuntimeV02PendingActiveAbilityOpponentCreatureChoice,
): RuntimeV02DamageProgramCreatureRef {
  return {
    controller_seat: pending.seat,
    where: pending.source_where,
    index: pending.source_index,
    anchor_uid: pending.source_uid,
    card_id: pending.source_card_id,
    element: definitionElement(state, pending.source_card_id),
  };
}

function activationRequest<T extends RuntimeV02CardZoneInstance>(
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilityTargetedDrainDescriptor,
  source: RuntimeV02ActiveAbilityTargetedDrainSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
) {
  return {
    cost_gate: {
      controller_seat: controllerSeat,
      action_kind: "ability" as const,
      action_id: descriptor.ability_id,
      source: {
        location: { where: source.where, index: source.index },
        instance: { ...source.instance },
      },
      defeat_describe: defeatDescribe,
    },
    turn_limit: 1 as const,
  };
}

function beginOnce<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActiveAbilityTargetedDrainState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityTargetedDrainSource,
  descriptor: RuntimeV02ActiveAbilityTargetedDrainDescriptor,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
  choiceId: string,
): RuntimeV02ActiveAbilityTargetedDrainBegin<T> {
  const activation = runtimeV02BeginActiveAbilityActivationCost(
    state,
    activationRequest(controllerSeat, descriptor, source, defeatDescribe),
    `${choiceId}:cost`,
  );
  if (activation.status !== "activation_permitted") {
    throw new Error("tcg_v0_2_active_ability_targeted_drain_cost_choice_unsupported");
  }
  const pending = runtimeV02BuildActiveAbilityOpponentCreatureChoice(
    state as Record<string, unknown>,
    controllerSeat,
    descriptor.ability_id,
    source,
    choiceId,
  );
  return {
    status: "target_choice_required",
    ability_id: descriptor.ability_id,
    activation_permit: activation.permit,
    pending_choice: pending,
  };
}

/**
 * Begins the targeted-drain Ability as one preflighted compound activation.
 * The complete cost is first paid on a clone and the post-cost target-choice
 * continuation must still be legal there. This prevents partial real Payment if
 * the required source-damage cost would remove the source that the remaining
 * DRAIN_VITALITY step explicitly needs as its heal target, or if no legal opposing
 * Creature exists. Only after that proof is the real Payment/use receipt committed.
 */
export function runtimeV02BeginActiveAbilityTargetedDrain<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActiveAbilityTargetedDrainState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityTargetedDrainSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02ActiveAbilityTargetedDrainBegin<T> | null {
  const descriptor = structuredRuntimeActiveAbilityTargetedDrainDescriptor(
    state as Record<string, unknown>,
    source.instance,
  );
  if (!descriptor) return null;

  const simulation = structuredClone(state) as RuntimeV02ActiveAbilityTargetedDrainState<T>;
  beginOnce(
    simulation,
    controllerSeat,
    source,
    descriptor,
    defeatDescribe,
    `${choiceId}:preflight`,
  );
  return beginOnce(
    state,
    controllerSeat,
    source,
    descriptor,
    defeatDescribe,
    choiceId,
  );
}

/** Resolves only the selected-target effect stage; activation cost/use are never replayed. */
export function runtimeV02ResolveActiveAbilityTargetedDrain<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActiveAbilityTargetedDrainState<T>,
  pending: RuntimeV02PendingActiveAbilityOpponentCreatureChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  selectedIds: string[],
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ActiveAbilityTargetedDrainResolution {
  const descriptor = structuredRuntimeActiveAbilityTargetedDrainDescriptor(
    state as Record<string, unknown>,
    { card_id: pending.source_card_id },
  );
  if (!descriptor || descriptor.ability_id !== pending.ability_id) {
    throw new Error("tcg_v0_2_active_ability_targeted_drain_descriptor_changed");
  }
  const selected = runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
    pending,
    controllerSeat,
    choiceId,
    selectedIds,
    state as Record<string, unknown>,
  );
  const healTarget = sourceRef(state as Record<string, unknown>, pending);
  const target: RuntimeV02DamageProgramCreatureRef = {
    controller_seat: selected.target.controller_seat,
    where: selected.target.where,
    index: selected.target.index,
    anchor_uid: selected.target.anchor_uid,
    card_id: selected.target.card_id,
    element: definitionElement(state as Record<string, unknown>, selected.target.card_id),
  };
  const damageResult = runtimeV02ApplyDrainVitalityProgram(state, {
    identity: {
      source_action_id: descriptor.ability_id,
      source_step_index: 1,
      source_card_uid: pending.source_uid,
      source_card_id: pending.source_card_id,
      source_creature_uid: pending.source_uid,
      action_kind: "ability",
      controller_seat: controllerSeat,
    },
    target,
    heal_target: healTarget,
    amount: descriptor.drain.amount,
    heal_cap: descriptor.drain.heal_cap,
    defeat_describe: defeatDescribe,
  });

  return {
    kind: "selected_opponent_drain_vitality",
    ability_id: descriptor.ability_id,
    target_creature_uid: target.anchor_uid,
    target_controller_seat: target.controller_seat,
    actual_vitality_drained: damageResult.actual_vitality_drained,
    actual_heal: damageResult.actual_heal,
    emitted_packet_ids: damageResult.heal_packet ? [damageResult.heal_packet.id] : [],
    damage_result: damageResult,
  };
}
