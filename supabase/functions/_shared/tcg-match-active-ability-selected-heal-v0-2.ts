import { runtimeV02CurrentTurnActiveAbilityUseCount } from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  applyRuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
} from "./tcg-match-heal-packet-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import type { RuntimeCreature } from "../tcg-tactic-actions/runtime-v0-2-core.ts";

type RuntimeInst = { uid: string; card_id: string };
type RuntimeFieldWhere = "vanguard" | "reserve";

type RuntimeFieldTarget = {
  where: RuntimeFieldWhere;
  index: number | null;
  creature: RuntimeCreature & { stack?: unknown[] };
  top: RuntimeInst;
  element: string;
};

export type RuntimeV02ActiveAbilitySelectedHealDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  required_event: {
    event: "device_resolved";
    controller: "self";
    window: "current_turn";
    min_count: 1;
  };
  target: {
    controller: "self";
    zone: "field";
    count: 1;
    card_family: "Creature";
    element: string;
    damaged: true;
  };
  heal_amount: number;
};

export type RuntimeV02ActiveAbilitySelectedHealOption = {
  id: string;
  label: string;
  where: RuntimeFieldWhere;
  index: number | null;
  anchor_uid: string;
  anchor_card_id: string;
  element: string;
};

export type RuntimeV02PendingActiveAbilitySelectedHealChoice = {
  id: string;
  seat: 1 | 2;
  kind: "heal_one_damaged_friendly_creature";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: RuntimeFieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  heal_amount: number;
  target_element: string;
  options: RuntimeV02ActiveAbilitySelectedHealOption[];
};

export type RuntimeV02ActiveAbilitySelectedHealResolution = {
  ability_id: string;
  choice_id: string;
  requested_heal: number;
  actual_heal: number;
  emitted_packet_ids: string[];
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
  const set = new Set(allowed);
  const extra = Object.keys(value).find((key) => !set.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function seat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) throw new Error("tcg_v0_2_active_ability_heal_seat_invalid");
  return value;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_ability_heal_turn_seq_invalid");
  }
  return turn;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function playerForSeat(state: Record<string, unknown>, controllerSeat: 1 | 2): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!player) throw new Error("tcg_v0_2_active_ability_heal_player_missing");
  if (!Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_active_ability_heal_player_zones_invalid");
  }
  return player;
}

function sourceTop(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  where: RuntimeFieldWhere,
  index: number | null,
): RuntimeInst {
  const player = playerForSeat(state, controllerSeat);
  let creature: Record<string, unknown> | null = null;
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_active_ability_heal_vanguard_index_invalid");
    creature = objectRecord(player.vanguard);
  } else {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_active_ability_heal_reserve_index_invalid");
    }
    creature = objectRecord((player.reserve as unknown[])[Number(index)]);
  }
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_active_ability_heal_source_missing");
  }
  return runtimeInst(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_active_ability_heal_source_top_invalid",
  );
}

function sameInst(actual: RuntimeInst, expected: RuntimeInst): boolean {
  return actual.uid === expected.uid && actual.card_id === expected.card_id;
}

function deviceResolvedThisTurn(state: Record<string, unknown>, controllerSeat: 1 | 2): boolean {
  const flags = objectRecord(state.turn_flags);
  const own = flags ? objectRecord(flags[String(controllerSeat)]) : null;
  return Number(own?.device_turn ?? -1) === currentTurn(state);
}

function definitionElement(state: Record<string, unknown>, instance: RuntimeInst): string {
  const definition = runtimeV02Definition(state, instance);
  if (!definition) throw new Error("tcg_v0_2_active_ability_heal_target_definition_missing");
  return requiredString(definition.element, "tcg_v0_2_active_ability_heal_target_element_missing");
}

function targetEntries(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilitySelectedHealDescriptor,
): RuntimeFieldTarget[] {
  const player = playerForSeat(state, controllerSeat);
  const out: RuntimeFieldTarget[] = [];
  const inspect = (raw: unknown, where: RuntimeFieldWhere, index: number | null) => {
    const creature = objectRecord(raw);
    if (!creature) return;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_active_ability_heal_target_stack_invalid");
    }
    const damage = Number(creature.damage ?? 0);
    if (!Number.isFinite(damage) || damage < 0) {
      throw new Error("tcg_v0_2_active_ability_heal_target_damage_invalid");
    }
    const top = runtimeInst(
      creature.stack[creature.stack.length - 1],
      "tcg_v0_2_active_ability_heal_target_top_invalid",
    );
    const element = definitionElement(state, top);
    if (damage <= 0 || element !== descriptor.target.element) return;
    out.push({
      where,
      index,
      creature: creature as RuntimeCreature & { stack?: unknown[] },
      top,
      element,
    });
  };
  inspect(player.vanguard, "vanguard", null);
  for (let index = 0; index < 4; index += 1) {
    inspect((player.reserve as unknown[])[index], "reserve", index);
  }
  return out;
}

function optionId(target: RuntimeFieldTarget): string {
  return target.where === "vanguard"
    ? `creature:vanguard:${target.top.uid}`
    : `creature:reserve:${target.index}:${target.top.uid}`;
}

function targetOptions(targets: RuntimeFieldTarget[]): RuntimeV02ActiveAbilitySelectedHealOption[] {
  return targets.map((target) => ({
    id: optionId(target),
    label: target.where === "vanguard" ? "Vanguard" : `Reserve ${Number(target.index) + 1}`,
    where: target.where,
    index: target.index,
    anchor_uid: target.top.uid,
    anchor_card_id: target.top.card_id,
    element: target.element,
  }));
}

function sameOptionSet(
  expected: RuntimeV02ActiveAbilitySelectedHealOption[],
  actual: RuntimeV02ActiveAbilitySelectedHealOption[],
): boolean {
  return JSON.stringify(expected) === JSON.stringify(actual);
}

function exactLimit(raw: unknown, abilityId: string): { scope: "turn"; count: 1; owner: "controller" } {
  const limit = objectRecord(raw);
  if (!limit) throw new Error(`tcg_v0_2_active_ability_heal_limit_required:${abilityId}`);
  rejectUnsupportedFields(limit, ["scope", "count", "owner"], `tcg_v0_2_active_ability_heal_limit_field_unsupported:${abilityId}`);
  if (limit.scope !== "turn" || Number(limit.count) !== 1 || limit.owner !== "controller") {
    throw new Error(`tcg_v0_2_active_ability_heal_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

function exactRequirements(
  raw: unknown,
  abilityId: string,
  targetElement: string,
): RuntimeV02ActiveAbilitySelectedHealDescriptor["required_event"] {
  const requirements = objectRecord(raw);
  if (!requirements) throw new Error(`tcg_v0_2_active_ability_heal_requirements_invalid:${abilityId}`);
  rejectUnsupportedFields(requirements, ["all"], `tcg_v0_2_active_ability_heal_requirements_field_unsupported:${abilityId}`);
  if (!Array.isArray(requirements.all) || requirements.all.length !== 2) {
    throw new Error(`tcg_v0_2_active_ability_heal_requirements_shape_unsupported:${abilityId}`);
  }
  const branches = requirements.all.map((value, index) => {
    const branch = objectRecord(value);
    if (!branch) throw new Error(`tcg_v0_2_active_ability_heal_requirement_invalid:${abilityId}:${index}`);
    return branch;
  });
  const eventBranch = branches.find((branch) => branch.predicate === "event_occurred");
  const legalBranch = branches.find((branch) => branch.predicate === "legal_card_available");
  if (!eventBranch || !legalBranch) {
    throw new Error(`tcg_v0_2_active_ability_heal_requirements_shape_unsupported:${abilityId}`);
  }
  rejectUnsupportedFields(
    eventBranch,
    ["predicate", "event", "controller", "window", "min_count"],
    `tcg_v0_2_active_ability_heal_event_requirement_field_unsupported:${abilityId}`,
  );
  if (
    eventBranch.event !== "device_resolved" || eventBranch.controller !== "self" ||
    eventBranch.window !== "current_turn" || Number(eventBranch.min_count) !== 1
  ) {
    throw new Error(`tcg_v0_2_active_ability_heal_event_requirement_unsupported:${abilityId}`);
  }
  rejectUnsupportedFields(
    legalBranch,
    ["predicate", "controller", "zone", "filters"],
    `tcg_v0_2_active_ability_heal_legal_requirement_field_unsupported:${abilityId}`,
  );
  if (legalBranch.controller !== "self" || legalBranch.zone !== "field") {
    throw new Error(`tcg_v0_2_active_ability_heal_legal_requirement_unsupported:${abilityId}`);
  }
  const filters = objectRecord(legalBranch.filters);
  if (!filters) throw new Error(`tcg_v0_2_active_ability_heal_legal_filters_invalid:${abilityId}`);
  rejectUnsupportedFields(
    filters,
    ["card_family", "element", "damaged"],
    `tcg_v0_2_active_ability_heal_legal_filters_field_unsupported:${abilityId}`,
  );
  if (filters.card_family !== "Creature" || filters.element !== targetElement || filters.damaged !== true) {
    throw new Error(`tcg_v0_2_active_ability_heal_legal_filters_unsupported:${abilityId}`);
  }
  return { event: "device_resolved", controller: "self", window: "current_turn", min_count: 1 };
}

/**
 * Recognizes exactly the reusable active-Ability family used by Networked Growth:
 * own-turn, controller once-per-turn, Device-resolved current-turn requirement,
 * choose one damaged friendly Creature of one element, then heal it.
 *
 * The recognizer is card-id-free and parameterizes the target element and heal
 * amount from structured registry data. Other active Ability shapes remain out
 * of scope rather than being partially interpreted.
 */
export function structuredRuntimeActiveAbilitySelectedHeal(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilitySelectedHealDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = creature ? objectRecord(creature.ability) : null;
  if (!ability || String(ability.mode || "") !== "active") return null;
  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!steps || steps.length !== 2) return null;
  const select = objectRecord(steps[0]);
  const heal = objectRecord(steps[1]);
  if (!select || !heal || select.op !== "SELECT_CREATURE" || heal.op !== "HEAL") return null;

  const abilityId = requiredString(ability.id, "tcg_v0_2_active_ability_heal_ability_id_required");
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_heal_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || ability.timing !== "own_turn") {
    throw new Error(`tcg_v0_2_active_ability_heal_timing_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_heal_costs_unsupported:${abilityId}`);
  }
  const limit = exactLimit(ability.limit, abilityId);

  rejectUnsupportedFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_active_ability_heal_select_field_unsupported:${abilityId}`,
  );
  if (select.controller !== "self" || select.zone !== "field" || Number(select.count) !== 1) {
    throw new Error(`tcg_v0_2_active_ability_heal_select_shape_unsupported:${abilityId}`);
  }
  const targetVariable = requiredString(select.as, `tcg_v0_2_active_ability_heal_select_variable_required:${abilityId}`);
  const selectFilters = objectRecord(select.filters);
  if (!selectFilters) throw new Error(`tcg_v0_2_active_ability_heal_select_filters_invalid:${abilityId}`);
  rejectUnsupportedFields(
    selectFilters,
    ["element", "damaged"],
    `tcg_v0_2_active_ability_heal_select_filters_field_unsupported:${abilityId}`,
  );
  const targetElement = requiredString(
    selectFilters.element,
    `tcg_v0_2_active_ability_heal_select_element_required:${abilityId}`,
  );
  if (selectFilters.damaged !== true) {
    throw new Error(`tcg_v0_2_active_ability_heal_select_filters_unsupported:${abilityId}`);
  }

  rejectUnsupportedFields(
    heal,
    ["op", "target", "amount"],
    `tcg_v0_2_active_ability_heal_step_field_unsupported:${abilityId}`,
  );
  if (heal.target !== `$${targetVariable}`) {
    throw new Error(`tcg_v0_2_active_ability_heal_target_variable_mismatch:${abilityId}`);
  }
  const healAmount = Number(heal.amount);
  if (!Number.isFinite(healAmount) || healAmount <= 0) {
    throw new Error(`tcg_v0_2_active_ability_heal_amount_invalid:${abilityId}`);
  }

  const requiredEvent = exactRequirements(ability.requirements, abilityId, targetElement);
  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    required_event: requiredEvent,
    target: {
      controller: "self",
      zone: "field",
      count: 1,
      card_family: "Creature",
      element: targetElement,
      damaged: true,
    },
    heal_amount: healAmount,
  };
}

/**
 * Pure preflight for the selected-heal active Ability. It validates current
 * server state and returns a reconnect-stable anchored choice, but deliberately
 * does not consume the once-per-turn receipt. The live activation owner must do
 * that through the already-established active-Ability limit owner before it
 * persists this pending choice.
 */
export function runtimeV02BuildActiveAbilitySelectedHealChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilitySelectedHealDescriptor,
  source: { where: RuntimeFieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilitySelectedHealChoice {
  const controller = seat(controllerSeat);
  if (!choiceId) throw new Error("tcg_v0_2_active_ability_heal_choice_id_required");
  if (state.active_seat !== controller) throw new Error("tcg_v0_2_active_ability_heal_not_active_seat");
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, descriptor.ability_id) !== 0) {
    throw new Error("tcg_v0_2_active_ability_heal_turn_limit_reached");
  }
  if (!deviceResolvedThisTurn(state, controller)) {
    throw new Error("tcg_v0_2_active_ability_heal_device_not_resolved_this_turn");
  }
  const instance = runtimeInst(source.instance, "tcg_v0_2_active_ability_heal_source_identity_invalid");
  const actualSource = sourceTop(state, controller, source.where, source.index);
  if (!sameInst(actualSource, instance)) throw new Error("tcg_v0_2_active_ability_heal_source_changed");
  const options = targetOptions(targetEntries(state, controller, descriptor));
  if (options.length < 1) throw new Error("tcg_v0_2_active_ability_heal_target_unavailable");

  return {
    id: choiceId,
    seat: controller,
    kind: "heal_one_damaged_friendly_creature",
    ability_id: descriptor.ability_id,
    prompt: `Choose one damaged ${descriptor.target.element} Creature to heal`,
    min: 1,
    max: 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: instance.uid,
    source_card_id: instance.card_id,
    heal_amount: descriptor.heal_amount,
    target_element: descriptor.target.element,
    options,
  };
}

export function runtimeV02PendingActiveAbilitySelectedHealChoiceView(
  choice: RuntimeV02PendingActiveAbilitySelectedHealChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

/**
 * Applies the selected heal only after the canonical active-Ability limit owner
 * has persisted exactly one current-turn receipt. This function never writes
 * that ledger itself, so there remains one owner for once-per-turn Ability use.
 * Positive healing is emitted through the canonical after_heal_packet owner;
 * listener continuation is intentionally left to the live orchestration layer.
 */
export function runtimeV02ResolveActiveAbilitySelectedHealChoice(
  choice: RuntimeV02PendingActiveAbilitySelectedHealChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  selectedIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilitySelectedHealResolution {
  const controller = seat(controllerSeat);
  if (choice.seat !== controller) throw new Error("tcg_v0_2_active_ability_heal_choice_not_yours");
  if (!choiceId) throw new Error("tcg_v0_2_active_ability_heal_choice_id_required");
  if (choice.id !== choiceId) throw new Error("tcg_v0_2_active_ability_heal_choice_stale_id");
  if (!Array.isArray(selectedIds) || selectedIds.length !== 1) {
    throw new Error("tcg_v0_2_active_ability_heal_exactly_one_option_required");
  }
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_active_ability_heal_turn_changed");
  if (state.active_seat !== controller) throw new Error("tcg_v0_2_active_ability_heal_active_seat_changed");
  if (!deviceResolvedThisTurn(state, controller)) {
    throw new Error("tcg_v0_2_active_ability_heal_device_event_changed");
  }
  const source = sourceTop(state, controller, choice.source_where, choice.source_index);
  if (source.uid !== choice.source_uid || source.card_id !== choice.source_card_id) {
    throw new Error("tcg_v0_2_active_ability_heal_source_changed");
  }
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, choice.ability_id) !== 1) {
    throw new Error("tcg_v0_2_active_ability_heal_limit_receipt_missing");
  }

  const descriptor: RuntimeV02ActiveAbilitySelectedHealDescriptor = {
    ability_id: choice.ability_id,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    required_event: { event: "device_resolved", controller: "self", window: "current_turn", min_count: 1 },
    target: {
      controller: "self",
      zone: "field",
      count: 1,
      card_family: "Creature",
      element: choice.target_element,
      damaged: true,
    },
    heal_amount: choice.heal_amount,
  };
  const currentTargets = targetEntries(state, controller, descriptor);
  const currentOptions = targetOptions(currentTargets);
  if (!sameOptionSet(choice.options, currentOptions)) {
    throw new Error("tcg_v0_2_active_ability_heal_target_set_changed");
  }
  const selected = choice.options.find((option) => option.id === selectedIds[0]);
  if (!selected) throw new Error("tcg_v0_2_active_ability_heal_unknown_option");
  const target = currentTargets.find((entry) => optionId(entry) === selected.id);
  if (!target) throw new Error("tcg_v0_2_active_ability_heal_target_changed");

  const packetContext: RuntimeV02HealPacketContext = {
    source: {
      controller_seat: controller,
      action_kind: "ability",
      action_id: choice.ability_id,
      card_effect: true,
      card_uid: source.uid,
      card_id: source.card_id,
      creature_uid: source.uid,
    },
    target: {
      controller_seat: controller,
      creature_uid: target.top.uid,
      card_uid: target.top.uid,
      card_id: target.top.card_id,
      element: target.element,
      where: target.where,
      index: target.index,
    },
  };
  const resolved = applyRuntimeV02HealPacket(
    state,
    target.creature,
    choice.heal_amount,
    packetContext,
  );
  return {
    ability_id: choice.ability_id,
    choice_id: choice.id,
    requested_heal: resolved.requested_amount,
    actual_heal: resolved.actual_heal,
    emitted_packet_ids: resolved.packet ? [resolved.packet.id] : [],
  };
}


export type RuntimeV02ActiveAbilitySelectedHealEachDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  reserve_count_at_least: number;
  target: {
    controller: "self";
    zone: "field";
    min: number;
    max: number;
    damaged: true;
  };
  heal_amount: number;
};

export type RuntimeV02PendingActiveAbilitySelectedHealEachChoice = {
  id: string;
  seat: 1 | 2;
  kind: "heal_each_selected_damaged_friendly_creature";
  ability_id: string;
  prompt: string;
  min: number;
  max: number;
  declared_max: number;
  turn_seq: number;
  source_where: RuntimeFieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  reserve_count_at_least: number;
  heal_amount: number;
  options: RuntimeV02ActiveAbilitySelectedHealOption[];
};

export type RuntimeV02ActiveAbilitySelectedHealEachResolution = {
  kind: "heal_each_selected_damaged_friendly_creature";
  ability_id: string;
  choice_id: string;
  selected_count: number;
  requested_heal_each: number;
  actual_heal_total: number;
  actual_heals: Array<{
    target_uid: string;
    requested_heal: number;
    actual_heal: number;
  }>;
  emitted_packet_ids: string[];
};

function exactSelectionRange(
  raw: unknown,
  abilityId: string,
): { min: number; max: number } {
  const range = objectRecord(raw);
  if (!range) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_count_required:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    range,
    ["min", "max"],
    `tcg_v0_2_active_ability_heal_each_count_field_unsupported:${abilityId}`,
  );
  const min = Number(range.min);
  const max = Number(range.max);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min ||
    max < 1
  ) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_count_invalid:${abilityId}`,
    );
  }
  return { min, max };
}

function exactReserveCountRequirement(
  raw: unknown,
  abilityId: string,
): number {
  const requirements = objectRecord(raw);
  if (!requirements) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_requirements_invalid:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    requirements,
    ["all"],
    `tcg_v0_2_active_ability_heal_each_requirements_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(requirements.all) || requirements.all.length !== 1) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_requirements_shape_unsupported:${abilityId}`,
    );
  }
  const requirement = objectRecord(requirements.all[0]);
  if (!requirement) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_requirement_invalid:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    requirement,
    ["predicate", "controller", "count"],
    `tcg_v0_2_active_ability_heal_each_requirement_field_unsupported:${abilityId}`,
  );
  if (
    requirement.predicate !== "reserve_count_at_least" ||
    requirement.controller !== "self"
  ) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_requirement_unsupported:${abilityId}`,
    );
  }
  const count = Number(requirement.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_reserve_count_invalid:${abilityId}`,
    );
  }
  return count;
}

function currentFriendlyReserveCount(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): number {
  const player = playerForSeat(state, controllerSeat);
  return (player.reserve as unknown[]).filter((entry) => entry != null).length;
}

function healEachTargetEntries(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeFieldTarget[] {
  const player = playerForSeat(state, controllerSeat);
  const out: RuntimeFieldTarget[] = [];
  const inspect = (
    raw: unknown,
    where: RuntimeFieldWhere,
    index: number | null,
  ) => {
    const creature = objectRecord(raw);
    if (!creature) return;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error(
        "tcg_v0_2_active_ability_heal_each_target_stack_invalid",
      );
    }
    const damage = Number(creature.damage ?? 0);
    if (!Number.isFinite(damage) || damage < 0) {
      throw new Error(
        "tcg_v0_2_active_ability_heal_each_target_damage_invalid",
      );
    }
    if (damage <= 0) return;
    const top = runtimeInst(
      creature.stack[creature.stack.length - 1],
      "tcg_v0_2_active_ability_heal_each_target_top_invalid",
    );
    out.push({
      where,
      index,
      creature: creature as RuntimeCreature & { stack?: unknown[] },
      top,
      element: definitionElement(state, top),
    });
  };
  inspect(player.vanguard, "vanguard", null);
  for (let index = 0; index < 4; index += 1) {
    inspect((player.reserve as unknown[])[index], "reserve", index);
  }
  return out;
}

/**
 * Recognizes the bounded multi-target active-Ability heal family:
 * SELECT_CREATURE self field 0..N damaged -> HEAL_EACH selected.
 *
 * It is intentionally operation-shaped and card-id-free. The existing selected
 * heal owner remains the only active-Ability owner for the player choice,
 * once-per-turn receipt, canonical Heal Packet mutation and emitted heal packets.
 */
export function structuredRuntimeActiveAbilitySelectedHealEach(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilitySelectedHealEachDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = creature ? objectRecord(creature.ability) : null;
  if (!ability || String(ability.mode || "") !== "active") return null;
  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!steps || steps.length !== 2) return null;
  const select = objectRecord(steps[0]);
  const healEach = objectRecord(steps[1]);
  if (
    !select ||
    !healEach ||
    select.op !== "SELECT_CREATURE" ||
    healEach.op !== "HEAL_EACH"
  ) return null;

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_ability_heal_each_ability_id_required",
  );
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_heal_each_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || ability.timing !== "own_turn") {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_timing_unsupported:${abilityId}`,
    );
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_costs_unsupported:${abilityId}`,
    );
  }
  const limit = exactLimit(ability.limit, abilityId);
  const reserveCountAtLeast = exactReserveCountRequirement(
    ability.requirements,
    abilityId,
  );

  rejectUnsupportedFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_active_ability_heal_each_select_field_unsupported:${abilityId}`,
  );
  if (select.controller !== "self" || select.zone !== "field") {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_select_shape_unsupported:${abilityId}`,
    );
  }
  const range = exactSelectionRange(select.count, abilityId);
  const filters = objectRecord(select.filters);
  if (!filters) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_select_filters_invalid:${abilityId}`,
    );
  }
  rejectUnsupportedFields(
    filters,
    ["damaged"],
    `tcg_v0_2_active_ability_heal_each_select_filters_field_unsupported:${abilityId}`,
  );
  if (filters.damaged !== true) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_select_filters_unsupported:${abilityId}`,
    );
  }
  const variable = requiredString(
    select.as,
    `tcg_v0_2_active_ability_heal_each_select_variable_required:${abilityId}`,
  );

  rejectUnsupportedFields(
    healEach,
    ["op", "targets", "amount"],
    `tcg_v0_2_active_ability_heal_each_step_field_unsupported:${abilityId}`,
  );
  if (healEach.targets !== `$${variable}`) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_target_variable_mismatch:${abilityId}`,
    );
  }
  const healAmount = Number(healEach.amount);
  if (!Number.isFinite(healAmount) || healAmount <= 0) {
    throw new Error(
      `tcg_v0_2_active_ability_heal_each_amount_invalid:${abilityId}`,
    );
  }
  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    reserve_count_at_least: reserveCountAtLeast,
    target: {
      controller: "self",
      zone: "field",
      min: range.min,
      max: range.max,
      damaged: true,
    },
    heal_amount: healAmount,
  };
}

export function runtimeV02BuildActiveAbilitySelectedHealEachChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilitySelectedHealEachDescriptor,
  source: { where: RuntimeFieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilitySelectedHealEachChoice {
  const controller = seat(controllerSeat);
  if (!choiceId) {
    throw new Error("tcg_v0_2_active_ability_heal_each_choice_id_required");
  }
  if (state.active_seat !== controller) {
    throw new Error("tcg_v0_2_active_ability_heal_not_active_seat");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controller,
      descriptor.ability_id,
    ) !== 0
  ) {
    throw new Error("tcg_v0_2_active_ability_heal_turn_limit_reached");
  }
  if (
    currentFriendlyReserveCount(state, controller) <
      descriptor.reserve_count_at_least
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_heal_each_reserve_requirement_not_met",
    );
  }
  const instance = runtimeInst(
    source.instance,
    "tcg_v0_2_active_ability_heal_source_identity_invalid",
  );
  const actualSource = sourceTop(
    state,
    controller,
    source.where,
    source.index,
  );
  if (!sameInst(actualSource, instance)) {
    throw new Error("tcg_v0_2_active_ability_heal_source_changed");
  }
  const options = targetOptions(healEachTargetEntries(state, controller));
  if (options.length < descriptor.target.min) {
    throw new Error("tcg_v0_2_active_ability_heal_target_unavailable");
  }
  return {
    id: choiceId,
    seat: controller,
    kind: "heal_each_selected_damaged_friendly_creature",
    ability_id: descriptor.ability_id,
    prompt: `Choose up to ${descriptor.target.max} damaged friendly Creatures to heal`,
    min: descriptor.target.min,
    max: Math.min(descriptor.target.max, options.length),
    declared_max: descriptor.target.max,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: instance.uid,
    source_card_id: instance.card_id,
    reserve_count_at_least: descriptor.reserve_count_at_least,
    heal_amount: descriptor.heal_amount,
    options,
  };
}

export function runtimeV02PendingActiveAbilitySelectedHealEachChoiceView(
  choice: RuntimeV02PendingActiveAbilitySelectedHealEachChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
  };
}

export function runtimeV02ResolveActiveAbilitySelectedHealEachChoice(
  choice: RuntimeV02PendingActiveAbilitySelectedHealEachChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  selectedIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilitySelectedHealEachResolution {
  const controller = seat(controllerSeat);
  if (choice.seat !== controller) {
    throw new Error("tcg_v0_2_active_ability_heal_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_heal_choice_stale_id");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_heal_turn_changed");
  }
  if (state.active_seat !== controller) {
    throw new Error("tcg_v0_2_active_ability_heal_active_seat_changed");
  }
  if (
    currentFriendlyReserveCount(state, controller) <
      choice.reserve_count_at_least
  ) {
    throw new Error("tcg_v0_2_active_ability_heal_requirement_changed");
  }
  const source = sourceTop(
    state,
    controller,
    choice.source_where,
    choice.source_index,
  );
  if (
    source.uid !== choice.source_uid ||
    source.card_id !== choice.source_card_id
  ) {
    throw new Error("tcg_v0_2_active_ability_heal_source_changed");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controller,
      choice.ability_id,
    ) !== 1
  ) {
    throw new Error("tcg_v0_2_active_ability_heal_limit_receipt_missing");
  }

  if (!Array.isArray(selectedIds) || new Set(selectedIds).size !== selectedIds.length) {
    throw new Error("tcg_v0_2_active_ability_heal_each_selection_invalid");
  }
  if (selectedIds.length < choice.min || selectedIds.length > choice.max) {
    throw new Error(
      "tcg_v0_2_active_ability_heal_each_selection_count_invalid",
    );
  }

  const currentTargets = healEachTargetEntries(state, controller);
  const currentOptions = targetOptions(currentTargets);
  if (!sameOptionSet(choice.options, currentOptions)) {
    throw new Error("tcg_v0_2_active_ability_heal_target_set_changed");
  }

  // Rebind every selected target before any heal mutation.
  const selectedTargets = selectedIds.map((selectedId) => {
    const option = choice.options.find((candidate) => candidate.id === selectedId);
    if (!option) {
      throw new Error("tcg_v0_2_active_ability_heal_each_unknown_option");
    }
    const target = currentTargets.find((entry) => optionId(entry) === option.id);
    if (!target) throw new Error("tcg_v0_2_active_ability_heal_target_changed");
    return { option, target };
  });

  const actualHeals: RuntimeV02ActiveAbilitySelectedHealEachResolution["actual_heals"] = [];
  const emittedPacketIds: string[] = [];
  let actualHealTotal = 0;
  for (const { target } of selectedTargets) {
    const packetContext: RuntimeV02HealPacketContext = {
      source: {
        controller_seat: controller,
        action_kind: "ability",
        action_id: choice.ability_id,
        card_effect: true,
        card_uid: source.uid,
        card_id: source.card_id,
        creature_uid: source.uid,
      },
      target: {
        controller_seat: controller,
        creature_uid: target.top.uid,
        card_uid: target.top.uid,
        card_id: target.top.card_id,
        element: target.element,
        where: target.where,
        index: target.index,
      },
    };
    const resolved = applyRuntimeV02HealPacket(
      state,
      target.creature,
      choice.heal_amount,
      packetContext,
    );
    actualHealTotal += resolved.actual_heal;
    actualHeals.push({
      target_uid: target.top.uid,
      requested_heal: resolved.requested_amount,
      actual_heal: resolved.actual_heal,
    });
    if (resolved.packet) emittedPacketIds.push(resolved.packet.id);
  }

  return {
    kind: "heal_each_selected_damaged_friendly_creature",
    ability_id: choice.ability_id,
    choice_id: choice.id,
    selected_count: selectedTargets.length,
    requested_heal_each: choice.heal_amount,
    actual_heal_total: actualHealTotal,
    actual_heals: actualHeals,
    emitted_packet_ids: emittedPacketIds,
  };
}
