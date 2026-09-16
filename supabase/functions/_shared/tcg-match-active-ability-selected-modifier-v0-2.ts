import { runtimeV02CurrentTurnActiveAbilityUseCount } from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02InstallAttackDamageModifier,
  type RuntimeV02AttackModifierOnConsume,
} from "./tcg-match-attack-modifier-v0-2.ts";
import { runtimeV02InstallDamageProtection } from "./tcg-match-damage-protection-v0-2.ts";
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

type RuntimeV02ActiveAbilitySelectedModifierTarget = {
  controller: "self";
  zone: "field";
  count: 1;
  card_family: "Creature";
  element: string;
  damaged: true | null;
  exclude_source: boolean;
};

type RuntimeV02ActiveAbilityOutgoingModifier = {
  kind: "attack_damage";
  amount: number;
  duration: {
    expires_on: ["end_of_turn"];
    max_uses: 1;
    consume_on: "legal_attack_declared";
  };
  on_consume: RuntimeV02AttackModifierOnConsume | null;
};

type RuntimeV02ActiveAbilityIncomingModifier = {
  kind: "incoming_attack_damage";
  reduce_amount: number;
  source_controller: "opponent";
  duration: {
    expires_on: ["opponent_next_turn_end"];
    max_uses: 1;
    consume_on: "successful_prevention";
  };
  minimum_prevention_to_consume: 1;
};

export type RuntimeV02ActiveAbilitySelectedModifierDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  target: RuntimeV02ActiveAbilitySelectedModifierTarget;
  modifier: RuntimeV02ActiveAbilityOutgoingModifier | RuntimeV02ActiveAbilityIncomingModifier;
};

export type RuntimeV02ActiveAbilitySelectedModifierOption = {
  id: string;
  label: string;
  where: RuntimeFieldWhere;
  index: number | null;
  anchor_uid: string;
  anchor_card_id: string;
  element: string;
};

export type RuntimeV02PendingActiveAbilitySelectedModifierChoice = {
  id: string;
  seat: 1 | 2;
  kind: "modify_one_friendly_creature";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: RuntimeFieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  target_element: string;
  target_damaged: true | null;
  exclude_source: boolean;
  modifier: RuntimeV02ActiveAbilitySelectedModifierDescriptor["modifier"];
  options: RuntimeV02ActiveAbilitySelectedModifierOption[];
};

export type RuntimeV02ActiveAbilitySelectedModifierResolution = {
  kind: "modify_one_friendly_creature";
  ability_id: string;
  choice_id: string;
  modifier_kind: "attack_damage" | "incoming_attack_damage";
  target_creature_uid: string;
  installed: boolean;
  effect_id: string;
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

function positiveInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(error);
  return number;
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
  if (value !== 1 && value !== 2) throw new Error("tcg_v0_2_active_ability_modifier_seat_invalid");
  return value;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_ability_modifier_turn_seq_invalid");
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
  if (!player) throw new Error("tcg_v0_2_active_ability_modifier_player_missing");
  if (!Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_active_ability_modifier_player_zones_invalid");
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
    if (index !== null) throw new Error("tcg_v0_2_active_ability_modifier_vanguard_index_invalid");
    creature = objectRecord(player.vanguard);
  } else {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_active_ability_modifier_reserve_index_invalid");
    }
    creature = objectRecord((player.reserve as unknown[])[Number(index)]);
  }
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_active_ability_modifier_source_missing");
  }
  return runtimeInst(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_active_ability_modifier_source_top_invalid",
  );
}

function definitionElement(state: Record<string, unknown>, instance: RuntimeInst): string {
  const definition = runtimeV02Definition(state, instance);
  if (!definition) throw new Error("tcg_v0_2_active_ability_modifier_target_definition_missing");
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_active_ability_modifier_target_family_invalid");
  }
  return requiredString(definition.element, "tcg_v0_2_active_ability_modifier_target_element_missing");
}

function targetEntries(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilitySelectedModifierDescriptor,
  sourceUid: string,
): RuntimeFieldTarget[] {
  const player = playerForSeat(state, controllerSeat);
  const out: RuntimeFieldTarget[] = [];
  const inspect = (raw: unknown, where: RuntimeFieldWhere, index: number | null) => {
    const creature = objectRecord(raw);
    if (!creature) return;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_active_ability_modifier_target_stack_invalid");
    }
    const damage = Number(creature.damage ?? 0);
    if (!Number.isFinite(damage) || damage < 0) {
      throw new Error("tcg_v0_2_active_ability_modifier_target_damage_invalid");
    }
    const top = runtimeInst(
      creature.stack[creature.stack.length - 1],
      "tcg_v0_2_active_ability_modifier_target_top_invalid",
    );
    const element = definitionElement(state, top);
    if (element !== descriptor.target.element) return;
    if (descriptor.target.damaged === true && damage <= 0) return;
    if (descriptor.target.exclude_source && top.uid === sourceUid) return;
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

function targetOptions(targets: RuntimeFieldTarget[]): RuntimeV02ActiveAbilitySelectedModifierOption[] {
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
  expected: RuntimeV02ActiveAbilitySelectedModifierOption[],
  actual: RuntimeV02ActiveAbilitySelectedModifierOption[],
): boolean {
  return JSON.stringify(expected) === JSON.stringify(actual);
}

function exactLimit(raw: unknown, abilityId: string): { scope: "turn"; count: 1; owner: "controller" } {
  const limit = objectRecord(raw);
  if (!limit) throw new Error(`tcg_v0_2_active_ability_modifier_limit_required:${abilityId}`);
  rejectUnsupportedFields(
    limit,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_ability_modifier_limit_field_unsupported:${abilityId}`,
  );
  if (limit.scope !== "turn" || Number(limit.count) !== 1 || limit.owner !== "controller") {
    throw new Error(`tcg_v0_2_active_ability_modifier_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

function exactTarget(
  select: Record<string, unknown>,
  abilityId: string,
): { variable: string; target: RuntimeV02ActiveAbilitySelectedModifierTarget } {
  rejectUnsupportedFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_active_ability_modifier_select_field_unsupported:${abilityId}`,
  );
  if (select.controller !== "self" || select.zone !== "field" || Number(select.count) !== 1) {
    throw new Error(`tcg_v0_2_active_ability_modifier_select_shape_unsupported:${abilityId}`);
  }
  const variable = requiredString(
    select.as,
    `tcg_v0_2_active_ability_modifier_select_variable_required:${abilityId}`,
  );
  const filters = objectRecord(select.filters);
  if (!filters) throw new Error(`tcg_v0_2_active_ability_modifier_select_filters_invalid:${abilityId}`);
  rejectUnsupportedFields(
    filters,
    ["element", "damaged", "exclude_source"],
    `tcg_v0_2_active_ability_modifier_select_filters_field_unsupported:${abilityId}`,
  );
  const element = requiredString(
    filters.element,
    `tcg_v0_2_active_ability_modifier_select_element_required:${abilityId}`,
  );
  const damaged = Object.hasOwn(filters, "damaged")
    ? filters.damaged === true
      ? true
      : (() => { throw new Error(`tcg_v0_2_active_ability_modifier_select_damaged_unsupported:${abilityId}`); })()
    : null;
  const excludeSource = Object.hasOwn(filters, "exclude_source")
    ? filters.exclude_source === true
      ? true
      : (() => { throw new Error(`tcg_v0_2_active_ability_modifier_select_exclude_source_unsupported:${abilityId}`); })()
    : false;
  return {
    variable,
    target: {
      controller: "self",
      zone: "field",
      count: 1,
      card_family: "Creature",
      element,
      damaged,
      exclude_source: excludeSource,
    },
  };
}

function exactRequirements(
  raw: unknown,
  abilityId: string,
  target: RuntimeV02ActiveAbilitySelectedModifierTarget,
): void {
  const requirements = objectRecord(raw);
  if (!requirements) throw new Error(`tcg_v0_2_active_ability_modifier_requirements_invalid:${abilityId}`);
  rejectUnsupportedFields(
    requirements,
    ["all"],
    `tcg_v0_2_active_ability_modifier_requirements_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(requirements.all) || requirements.all.length !== 1) {
    throw new Error(`tcg_v0_2_active_ability_modifier_requirements_shape_unsupported:${abilityId}`);
  }
  const legal = objectRecord(requirements.all[0]);
  if (!legal || legal.predicate !== "legal_card_available") {
    throw new Error(`tcg_v0_2_active_ability_modifier_requirements_shape_unsupported:${abilityId}`);
  }
  rejectUnsupportedFields(
    legal,
    ["predicate", "controller", "zone", "filters"],
    `tcg_v0_2_active_ability_modifier_requirement_field_unsupported:${abilityId}`,
  );
  if (legal.controller !== "self" || legal.zone !== "field") {
    throw new Error(`tcg_v0_2_active_ability_modifier_requirement_unsupported:${abilityId}`);
  }
  const filters = objectRecord(legal.filters);
  if (!filters) throw new Error(`tcg_v0_2_active_ability_modifier_requirement_filters_invalid:${abilityId}`);
  rejectUnsupportedFields(
    filters,
    ["card_family", "element", "damaged", "exclude_source"],
    `tcg_v0_2_active_ability_modifier_requirement_filters_field_unsupported:${abilityId}`,
  );
  if (filters.card_family !== "Creature" || filters.element !== target.element) {
    throw new Error(`tcg_v0_2_active_ability_modifier_requirement_filters_unsupported:${abilityId}`);
  }
  const damaged = Object.hasOwn(filters, "damaged") ? filters.damaged : null;
  const excludeSource = Object.hasOwn(filters, "exclude_source") ? filters.exclude_source : false;
  if (damaged !== target.damaged || excludeSource !== target.exclude_source) {
    throw new Error(`tcg_v0_2_active_ability_modifier_requirement_filters_mismatch:${abilityId}`);
  }
}

function exactOutgoingModifier(
  step: Record<string, unknown>,
  abilityId: string,
  variable: string,
): RuntimeV02ActiveAbilityOutgoingModifier {
  rejectUnsupportedFields(
    step,
    ["op", "target", "amount", "duration", "on_consume"],
    `tcg_v0_2_active_ability_modifier_outgoing_field_unsupported:${abilityId}`,
  );
  if (step.target !== `$${variable}`) {
    throw new Error(`tcg_v0_2_active_ability_modifier_target_variable_mismatch:${abilityId}`);
  }
  const amount = positiveInteger(step.amount, `tcg_v0_2_active_ability_modifier_amount_invalid:${abilityId}`);
  const duration = objectRecord(step.duration);
  if (!duration) throw new Error(`tcg_v0_2_active_ability_modifier_duration_invalid:${abilityId}`);
  rejectUnsupportedFields(
    duration,
    ["expires_on", "max_uses", "consume_on"],
    `tcg_v0_2_active_ability_modifier_duration_field_unsupported:${abilityId}`,
  );
  if (
    !Array.isArray(duration.expires_on) || duration.expires_on.length !== 1 ||
    duration.expires_on[0] !== "end_of_turn" || Number(duration.max_uses) !== 1 ||
    duration.consume_on !== "legal_attack_declared"
  ) {
    throw new Error(`tcg_v0_2_active_ability_modifier_duration_unsupported:${abilityId}`);
  }
  let onConsume: RuntimeV02AttackModifierOnConsume | null = null;
  if (step.on_consume != null) {
    const rider = objectRecord(step.on_consume);
    if (!rider) throw new Error(`tcg_v0_2_active_ability_modifier_rider_invalid:${abilityId}`);
    rejectUnsupportedFields(
      rider,
      ["bind_to_consuming_action", "timing", "steps"],
      `tcg_v0_2_active_ability_modifier_rider_field_unsupported:${abilityId}`,
    );
    if (
      rider.bind_to_consuming_action !== true ||
      rider.timing !== "after_attack_effects_before_defeat_scan" ||
      !Array.isArray(rider.steps) || rider.steps.length < 1 ||
      rider.steps.some((value) => !objectRecord(value))
    ) {
      throw new Error(`tcg_v0_2_active_ability_modifier_rider_unsupported:${abilityId}`);
    }
    onConsume = {
      bind_to_consuming_action: true,
      timing: "after_attack_effects_before_defeat_scan",
      steps: structuredClone(rider.steps as Record<string, unknown>[]),
    };
  }
  return {
    kind: "attack_damage",
    amount,
    duration: {
      expires_on: ["end_of_turn"],
      max_uses: 1,
      consume_on: "legal_attack_declared",
    },
    on_consume: onConsume,
  };
}

function exactIncomingModifier(
  step: Record<string, unknown>,
  abilityId: string,
  variable: string,
): RuntimeV02ActiveAbilityIncomingModifier {
  rejectUnsupportedFields(
    step,
    ["op", "target", "amount", "filters", "duration", "minimum_prevention_to_consume"],
    `tcg_v0_2_active_ability_modifier_incoming_field_unsupported:${abilityId}`,
  );
  if (step.target !== `$${variable}`) {
    throw new Error(`tcg_v0_2_active_ability_modifier_target_variable_mismatch:${abilityId}`);
  }
  const rawAmount = Number(step.amount);
  if (!Number.isInteger(rawAmount) || rawAmount >= 0) {
    throw new Error(`tcg_v0_2_active_ability_modifier_incoming_amount_invalid:${abilityId}`);
  }
  const filters = objectRecord(step.filters);
  if (!filters) throw new Error(`tcg_v0_2_active_ability_modifier_incoming_filters_invalid:${abilityId}`);
  rejectUnsupportedFields(
    filters,
    ["source_controller"],
    `tcg_v0_2_active_ability_modifier_incoming_filters_field_unsupported:${abilityId}`,
  );
  if (filters.source_controller !== "opponent") {
    throw new Error(`tcg_v0_2_active_ability_modifier_incoming_filters_unsupported:${abilityId}`);
  }
  const duration = objectRecord(step.duration);
  if (!duration) throw new Error(`tcg_v0_2_active_ability_modifier_incoming_duration_invalid:${abilityId}`);
  rejectUnsupportedFields(
    duration,
    ["expires_on", "max_uses", "consume_on"],
    `tcg_v0_2_active_ability_modifier_incoming_duration_field_unsupported:${abilityId}`,
  );
  if (
    !Array.isArray(duration.expires_on) || duration.expires_on.length !== 1 ||
    duration.expires_on[0] !== "opponent_next_turn_end" || Number(duration.max_uses) !== 1 ||
    duration.consume_on !== "successful_prevention" || Number(step.minimum_prevention_to_consume) !== 1
  ) {
    throw new Error(`tcg_v0_2_active_ability_modifier_incoming_duration_unsupported:${abilityId}`);
  }
  return {
    kind: "incoming_attack_damage",
    reduce_amount: Math.abs(rawAmount),
    source_controller: "opponent",
    duration: {
      expires_on: ["opponent_next_turn_end"],
      max_uses: 1,
      consume_on: "successful_prevention",
    },
    minimum_prevention_to_consume: 1,
  };
}

/**
 * Recognizes the Release 1 selected-modifier active-Ability family without card
 * identity checks. The Ability layer owns selection and activation limits only;
 * the selected effect remains owned by Attack #14 or Damage/Protection #20.
 */
export function structuredRuntimeActiveAbilitySelectedModifier(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilitySelectedModifierDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = creature ? objectRecord(creature.ability) : null;
  if (!ability || ability.mode !== "active") return null;
  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!steps || steps.length !== 2) return null;
  const select = objectRecord(steps[0]);
  const modifierStep = objectRecord(steps[1]);
  if (!select || !modifierStep || select.op !== "SELECT_CREATURE") return null;
  if (!["ADD_ATTACK_DAMAGE_MODIFIER", "ADD_INCOMING_ATTACK_DAMAGE_MODIFIER"].includes(String(modifierStep.op || ""))) {
    return null;
  }

  const abilityId = requiredString(ability.id, "tcg_v0_2_active_ability_modifier_ability_id_required");
  rejectUnsupportedFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_modifier_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null || ability.timing !== "own_turn") {
    throw new Error(`tcg_v0_2_active_ability_modifier_timing_unsupported:${abilityId}`);
  }
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_modifier_costs_unsupported:${abilityId}`);
  }
  const limit = exactLimit(ability.limit, abilityId);
  const { variable, target } = exactTarget(select, abilityId);
  exactRequirements(ability.requirements, abilityId, target);
  const modifier = modifierStep.op === "ADD_ATTACK_DAMAGE_MODIFIER"
    ? exactOutgoingModifier(modifierStep, abilityId, variable)
    : exactIncomingModifier(modifierStep, abilityId, variable);
  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    target,
    modifier,
  };
}

/** Pure preflight: validates source/target anchors without consuming the receipt. */
export function runtimeV02BuildActiveAbilitySelectedModifierChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  descriptor: RuntimeV02ActiveAbilitySelectedModifierDescriptor,
  source: { where: RuntimeFieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilitySelectedModifierChoice {
  const controller = seat(controllerSeat);
  if (!choiceId) throw new Error("tcg_v0_2_active_ability_modifier_choice_id_required");
  if (state.active_seat !== controller) throw new Error("tcg_v0_2_active_ability_modifier_not_active_seat");
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, descriptor.ability_id) !== 0) {
    throw new Error("tcg_v0_2_active_ability_modifier_turn_limit_reached");
  }
  const instance = runtimeInst(source.instance, "tcg_v0_2_active_ability_modifier_source_identity_invalid");
  const actualSource = sourceTop(state, controller, source.where, source.index);
  if (actualSource.uid !== instance.uid || actualSource.card_id !== instance.card_id) {
    throw new Error("tcg_v0_2_active_ability_modifier_source_changed");
  }
  const options = targetOptions(targetEntries(state, controller, descriptor, instance.uid));
  if (options.length < 1) throw new Error("tcg_v0_2_active_ability_modifier_target_unavailable");
  return {
    id: choiceId,
    seat: controller,
    kind: "modify_one_friendly_creature",
    ability_id: descriptor.ability_id,
    prompt: `Choose one ${descriptor.target.element} Creature`,
    min: 1,
    max: 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: instance.uid,
    source_card_id: instance.card_id,
    target_element: descriptor.target.element,
    target_damaged: descriptor.target.damaged,
    exclude_source: descriptor.target.exclude_source,
    modifier: structuredClone(descriptor.modifier),
    options,
  };
}

export function runtimeV02PendingActiveAbilitySelectedModifierChoiceView(
  choice: RuntimeV02PendingActiveAbilitySelectedModifierChoice | null | undefined,
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

function descriptorFromChoice(
  choice: RuntimeV02PendingActiveAbilitySelectedModifierChoice,
): RuntimeV02ActiveAbilitySelectedModifierDescriptor {
  return {
    ability_id: choice.ability_id,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    target: {
      controller: "self",
      zone: "field",
      count: 1,
      card_family: "Creature",
      element: choice.target_element,
      damaged: choice.target_damaged,
      exclude_source: choice.exclude_source,
    },
    modifier: structuredClone(choice.modifier),
  };
}

export function runtimeV02ResolveActiveAbilitySelectedModifierChoice(
  choice: RuntimeV02PendingActiveAbilitySelectedModifierChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  selectedIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilitySelectedModifierResolution {
  const controller = seat(controllerSeat);
  if (choice.seat !== controller) throw new Error("tcg_v0_2_active_ability_modifier_choice_not_yours");
  if (!choiceId) throw new Error("tcg_v0_2_active_ability_modifier_choice_id_required");
  if (choice.id !== choiceId) throw new Error("tcg_v0_2_active_ability_modifier_choice_stale_id");
  if (!Array.isArray(selectedIds) || selectedIds.length !== 1) {
    throw new Error("tcg_v0_2_active_ability_modifier_exactly_one_option_required");
  }
  if (currentTurn(state) !== choice.turn_seq) throw new Error("tcg_v0_2_active_ability_modifier_turn_changed");
  if (state.active_seat !== controller) throw new Error("tcg_v0_2_active_ability_modifier_active_seat_changed");
  const source = sourceTop(state, controller, choice.source_where, choice.source_index);
  if (source.uid !== choice.source_uid || source.card_id !== choice.source_card_id) {
    throw new Error("tcg_v0_2_active_ability_modifier_source_changed");
  }
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, choice.ability_id) !== 1) {
    throw new Error("tcg_v0_2_active_ability_modifier_limit_receipt_missing");
  }
  const descriptor = descriptorFromChoice(choice);
  const currentTargets = targetEntries(state, controller, descriptor, source.uid);
  const currentOptions = targetOptions(currentTargets);
  if (!sameOptionSet(choice.options, currentOptions)) {
    throw new Error("tcg_v0_2_active_ability_modifier_target_set_changed");
  }
  const selected = choice.options.find((option) => option.id === selectedIds[0]);
  if (!selected) throw new Error("tcg_v0_2_active_ability_modifier_unknown_option");
  const target = currentTargets.find((entry) => optionId(entry) === selected.id);
  if (!target) throw new Error("tcg_v0_2_active_ability_modifier_target_changed");

  if (choice.modifier.kind === "attack_damage") {
    const installed = runtimeV02InstallAttackDamageModifier(
      state,
      target.creature,
      {
        source_uid: source.uid,
        source_action_id: choice.ability_id,
        target_uid: target.top.uid,
        amount: choice.modifier.amount,
        turn_seq: choice.turn_seq,
        duration: choice.modifier.duration,
        on_consume: choice.modifier.on_consume,
      },
    );
    if (!installed) throw new Error("tcg_v0_2_active_ability_modifier_runtime_snapshot_required");
    return {
      kind: choice.kind,
      ability_id: choice.ability_id,
      choice_id: choice.id,
      modifier_kind: choice.modifier.kind,
      target_creature_uid: target.top.uid,
      installed: true,
      effect_id: installed.id,
    };
  }

  const protectionId = `active-ability-protection:${choice.turn_seq}:${choice.ability_id}:${source.uid}:${target.top.uid}`;
  const installed = runtimeV02InstallDamageProtection(target.creature, {
    protection_id: protectionId,
    source_action_id: choice.ability_id,
    source_uid: source.uid,
    source_card_id: source.card_id,
    source_kind: "ability",
    source_controller_seat: controller,
    target_controller_seat: controller,
    target_creature_uid: target.top.uid,
    installed_turn_seq: choice.turn_seq,
    damage_classes: ["attack"],
    source_controller: choice.modifier.source_controller,
    reduce_amount: choice.modifier.reduce_amount,
    minimum: 0,
    max_uses: choice.modifier.duration.max_uses,
    // "opponent_next_turn_end" is equivalent to expiring when the target
    // controller's next turn begins for a modifier activated on their own turn.
    expires_on: "start_of_controller_next_turn",
  });
  return {
    kind: choice.kind,
    ability_id: choice.ability_id,
    choice_id: choice.id,
    modifier_kind: choice.modifier.kind,
    target_creature_uid: target.top.uid,
    installed: installed.installed,
    effect_id: installed.protection_id,
  };
}
