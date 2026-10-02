import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  evaluateRuntimeV02LegalCardAvailableRequirement,
  evaluateRuntimeV02SourceInPlayRequirement,
  normalizeRuntimeV02LegalCardAvailableRequirement,
  normalizeRuntimeV02SourceInPlayRequirement,
  type RuntimeV02LegalCardAvailableRequirement,
  type RuntimeV02SourceInPlayRequirement,
} from "./tcg-match-requirement-evaluator-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02ApplyAtomicSwitch,
  runtimeV02SwitchContextById,
  type RuntimeV02SwitchMovementEvent,
} from "./tcg-match-switch-context-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Record<string, unknown>;
  top: Inst;
  element: string;
};

export type RuntimeV02ActiveAbilitySwitchDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  source_requirement: RuntimeV02SourceInPlayRequirement;
  target_requirement: RuntimeV02LegalCardAvailableRequirement;
  select: {
    controller: "self";
    zone: "reserve";
    count: 1;
    element: string;
    variable: string;
  };
  step: {
    op: "SWITCH_WITH_VANGUARD";
    player: "self";
    target_variable: string;
    action_kind: "effect_switch";
  };
};

export type RuntimeV02ActiveAbilitySwitchOption = {
  id: string;
  label: string;
  reserve_index: number;
  anchor_uid: string;
  anchor_card_id: string;
};

export type RuntimeV02PendingActiveAbilitySwitchChoice = {
  id: string;
  seat: Seat;
  kind: "switch_with_vanguard";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02ActiveAbilitySwitchDescriptor;
  options: RuntimeV02ActiveAbilitySwitchOption[];
};

export type RuntimeV02ActiveAbilitySwitchResume = {
  kind: "switch_after_movement";
  turn_seq: number;
  seat: Seat;
  ability_id: string;
  switch_id: string;
  target_reserve_index: number;
};

export type RuntimeV02ActiveAbilitySwitchResolution = {
  kind: "switch_with_vanguard";
  ability_id: string;
  switch_id: string;
  target_reserve_index: number;
  movement_events: [RuntimeV02SwitchMovementEvent, RuntimeV02SwitchMovementEvent];
  resume: RuntimeV02ActiveAbilitySwitchResume;
};

export type RuntimeV02ActiveAbilitySwitchResumeResolution = {
  kind: "switch_after_movement";
  ability_id: string;
  switch_id: string;
  target_reserve_index: number;
};

function obj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function req(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}

function reject(row: Record<string, unknown>, allowed: string[], code: string): void {
  const set = new Set(allowed);
  const extra = Object.keys(row).find((key) => !set.has(key));
  if (extra) throw new Error(`${code}:${extra}`);
}

function currentTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_active_ability_switch_turn_invalid");
  }
  return value;
}

function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = obj(state.players);
  const own = players ? obj(players[String(seat)]) : null;
  if (!own || !Array.isArray(own.reserve)) {
    throw new Error("tcg_v0_2_active_ability_switch_player_invalid");
  }
  return own;
}

function inst(value: unknown, code: string): Inst {
  const row = obj(value);
  if (!row) throw new Error(code);
  return {
    uid: req(row.uid, `${code}:uid`),
    card_id: req(row.card_id, `${code}:card_id`),
  };
}

function fields(state: Record<string, unknown>, seat: Seat): Field[] {
  const own = player(state, seat);
  const rows: Array<[FieldWhere, number | null, unknown]> = [
    ["vanguard", null, own.vanguard],
    ...[0, 1, 2, 3].map((index) =>
      ["reserve", index, (own.reserve as unknown[])[index]] as [FieldWhere, number, unknown]
    ),
  ];
  const out: Field[] = [];
  for (const [where, index, raw] of rows) {
    const creature = obj(raw);
    if (!creature) continue;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_active_ability_switch_field_invalid");
    }
    const top = inst(
      creature.stack[creature.stack.length - 1],
      "tcg_v0_2_active_ability_switch_top_invalid",
    );
    const definition = runtimeV02Definition(state, top);
    if (!definition) {
      throw new Error("tcg_v0_2_active_ability_switch_definition_missing");
    }
    const element = req(
      definition.element,
      "tcg_v0_2_active_ability_switch_element_missing",
    );
    out.push({ where, index, creature, top, element });
  }
  return out;
}

function sourceField(
  state: Record<string, unknown>,
  seat: Seat,
  where: FieldWhere,
  index: number | null,
): Field {
  const found = fields(state, seat).find((field) =>
    field.where === where && field.index === index
  );
  if (!found) throw new Error("tcg_v0_2_active_ability_switch_source_missing");
  return found;
}

function sameSource(actual: Field, choice: {
  source_uid: string;
  source_card_id: string;
}): void {
  if (
    actual.top.uid !== choice.source_uid ||
    actual.top.card_id !== choice.source_card_id
  ) {
    throw new Error("tcg_v0_2_active_ability_switch_source_changed");
  }
}

function reserveOptions(
  state: Record<string, unknown>,
  seat: Seat,
  descriptor: RuntimeV02ActiveAbilitySwitchDescriptor,
): RuntimeV02ActiveAbilitySwitchOption[] {
  return fields(state, seat)
    .filter((field) =>
      field.where === "reserve" &&
      field.index != null &&
      field.element === descriptor.select.element
    )
    .map((field) => ({
      id: `creature:reserve:${field.index}:${field.top.uid}`,
      label: `Reserve ${Number(field.index) + 1}`,
      reserve_index: Number(field.index),
      anchor_uid: field.top.uid,
      anchor_card_id: field.top.card_id,
    }));
}

function exactLimit(
  raw: unknown,
  abilityId: string,
): RuntimeV02ActiveAbilitySwitchDescriptor["limit"] {
  const limit = obj(raw);
  if (!limit) {
    throw new Error(`tcg_v0_2_active_ability_switch_limit_required:${abilityId}`);
  }
  reject(
    limit,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_ability_switch_limit_field_unsupported:${abilityId}`,
  );
  if (
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) {
    throw new Error(`tcg_v0_2_active_ability_switch_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

export function structuredRuntimeActiveAbilitySwitch(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilitySwitchDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") {
    return null;
  }
  const creature = obj(definition.creature);
  const ability = obj(creature?.ability);
  if (
    !ability ||
    ability.mode !== "active" ||
    ability.event !== null ||
    ability.timing !== "own_turn"
  ) return null;

  const steps = Array.isArray(ability.steps) ? ability.steps : null;
  if (!steps || steps.length !== 2) return null;
  const select = obj(steps[0]);
  const step = obj(steps[1]);
  if (
    !select ||
    !step ||
    select.op !== "SELECT_CREATURE" ||
    step.op !== "SWITCH_WITH_VANGUARD"
  ) return null;

  const abilityId = req(
    ability.id,
    "tcg_v0_2_active_ability_switch_ability_id_required",
  );
  reject(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_switch_ability_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_switch_costs_unsupported:${abilityId}`);
  }
  const limit = exactLimit(ability.limit, abilityId);

  const requirements = obj(ability.requirements);
  if (!requirements) {
    throw new Error(`tcg_v0_2_active_ability_switch_requirements_required:${abilityId}`);
  }
  reject(
    requirements,
    ["all"],
    `tcg_v0_2_active_ability_switch_requirements_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(requirements.all) || requirements.all.length !== 2) {
    throw new Error(`tcg_v0_2_active_ability_switch_requirements_shape_unsupported:${abilityId}`);
  }
  const sourceRaw = requirements.all.find((raw) => obj(raw)?.predicate === "source_in_play");
  const legalRaw = requirements.all.find((raw) => obj(raw)?.predicate === "legal_card_available");
  if (!sourceRaw || !legalRaw) {
    throw new Error(`tcg_v0_2_active_ability_switch_requirements_unsupported:${abilityId}`);
  }
  const sourceRequirement = normalizeRuntimeV02SourceInPlayRequirement(sourceRaw);
  const legalRequirement = normalizeRuntimeV02LegalCardAvailableRequirement(legalRaw);

  reject(
    legalRequirement.filters,
    ["card_family", "element"],
    `tcg_v0_2_active_ability_switch_legal_filters_field_unsupported:${abilityId}`,
  );
  const legalElement = req(
    legalRequirement.filters.element,
    `tcg_v0_2_active_ability_switch_legal_element_required:${abilityId}`,
  );
  if (
    legalRequirement.controller !== "self" ||
    legalRequirement.zone !== "reserve" ||
    legalRequirement.filters.card_family !== "Creature"
  ) {
    throw new Error(`tcg_v0_2_active_ability_switch_legal_requirement_unsupported:${abilityId}`);
  }

  reject(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_active_ability_switch_select_field_unsupported:${abilityId}`,
  );
  const filters = obj(select.filters);
  if (!filters) {
    throw new Error(`tcg_v0_2_active_ability_switch_select_filters_required:${abilityId}`);
  }
  reject(
    filters,
    ["element"],
    `tcg_v0_2_active_ability_switch_select_filters_field_unsupported:${abilityId}`,
  );
  const selectElement = req(
    filters.element,
    `tcg_v0_2_active_ability_switch_select_element_required:${abilityId}`,
  );
  const variable = req(
    select.as,
    `tcg_v0_2_active_ability_switch_variable_required:${abilityId}`,
  );
  if (
    select.controller !== "self" ||
    select.zone !== "reserve" ||
    Number(select.count) !== 1 ||
    selectElement !== legalElement
  ) {
    throw new Error(`tcg_v0_2_active_ability_switch_select_unsupported:${abilityId}`);
  }

  reject(
    step,
    ["op", "player", "target", "action_kind"],
    `tcg_v0_2_active_ability_switch_step_field_unsupported:${abilityId}`,
  );
  if (
    step.player !== "self" ||
    step.target !== `$${variable}` ||
    step.action_kind !== "effect_switch"
  ) {
    throw new Error(`tcg_v0_2_active_ability_switch_step_unsupported:${abilityId}`);
  }

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    source_requirement: sourceRequirement,
    target_requirement: legalRequirement,
    select: {
      controller: "self",
      zone: "reserve",
      count: 1,
      element: selectElement,
      variable,
    },
    step: {
      op: "SWITCH_WITH_VANGUARD",
      player: "self",
      target_variable: variable,
      action_kind: "effect_switch",
    },
  };
}

export function runtimeV02CreateActiveAbilitySwitchChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilitySwitchDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilitySwitchChoice {
  if (!choiceId) {
    throw new Error("tcg_v0_2_active_ability_switch_choice_id_required");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_switch_not_active_seat");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) !== 0
  ) {
    throw new Error("tcg_v0_2_active_ability_switch_limit_reached");
  }
  const sourceIdentity = inst(
    source.instance,
    "tcg_v0_2_active_ability_switch_source_invalid",
  );
  const actualSource = sourceField(
    state,
    controllerSeat,
    source.where,
    source.index,
  );
  sameSource(actualSource, {
    source_uid: sourceIdentity.uid,
    source_card_id: sourceIdentity.card_id,
  });
  const sourceEvaluation = evaluateRuntimeV02SourceInPlayRequirement(
    actualSource.creature,
    descriptor.source_requirement,
  );
  if (!sourceEvaluation.matched) {
    throw new Error("tcg_v0_2_active_ability_switch_source_not_in_play");
  }

  const options = reserveOptions(state, controllerSeat, descriptor);
  const availability = evaluateRuntimeV02LegalCardAvailableRequirement(
    options.length,
    descriptor.target_requirement,
  );
  if (!availability.matched) {
    throw new Error("tcg_v0_2_active_ability_switch_target_unavailable");
  }

  return {
    id: choiceId,
    seat: controllerSeat,
    kind: "switch_with_vanguard",
    ability_id: descriptor.ability_id,
    prompt: `Choose one friendly ${descriptor.select.element} Reserve Creature`,
    min: 1,
    max: 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceIdentity.uid,
    source_card_id: sourceIdentity.card_id,
    descriptor: structuredClone(descriptor),
    options,
  };
}

export function runtimeV02PendingActiveAbilitySwitchChoiceView(
  choice: RuntimeV02PendingActiveAbilitySwitchChoice | null | undefined,
  viewerSeat: Seat,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return {
      id: choice.id,
      seat: choice.seat,
      kind: choice.kind,
      waiting: true,
    };
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

export function runtimeV02ResolveActiveAbilitySwitchChoice(
  choice: RuntimeV02PendingActiveAbilitySwitchChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilitySwitchResolution {
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_switch_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_switch_choice_stale_id");
  }
  if (
    !Array.isArray(choiceIds) ||
    choiceIds.length !== 1 ||
    new Set(choiceIds).size !== 1
  ) {
    throw new Error("tcg_v0_2_active_ability_switch_exactly_one_required");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_switch_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_switch_active_seat_changed");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      choice.ability_id,
    ) !== 1
  ) {
    throw new Error("tcg_v0_2_active_ability_switch_limit_receipt_missing");
  }

  const source = sourceField(
    state,
    controllerSeat,
    choice.source_where,
    choice.source_index,
  );
  sameSource(source, choice);
  const sourceEvaluation = evaluateRuntimeV02SourceInPlayRequirement(
    source.creature,
    choice.descriptor.source_requirement,
  );
  if (!sourceEvaluation.matched) {
    throw new Error("tcg_v0_2_active_ability_switch_source_not_in_play");
  }

  const currentOptions = reserveOptions(state, controllerSeat, choice.descriptor);
  const selected = currentOptions.find((option) => option.id === choiceIds[0]);
  const original = choice.options.find((option) => option.id === choiceIds[0]);
  if (
    !selected ||
    !original ||
    selected.anchor_uid !== original.anchor_uid ||
    selected.anchor_card_id !== original.anchor_card_id ||
    selected.reserve_index !== original.reserve_index
  ) {
    throw new Error("tcg_v0_2_active_ability_switch_target_changed");
  }

  const switched = runtimeV02ApplyAtomicSwitch(
    state,
    controllerSeat,
    selected.reserve_index,
    {
      action_kind: choice.descriptor.step.action_kind,
      source_action_id: choice.ability_id,
      source_card_uid: source.top.uid,
    },
  );

  return {
    kind: "switch_with_vanguard",
    ability_id: choice.ability_id,
    switch_id: switched.context.switch_id,
    target_reserve_index: selected.reserve_index,
    movement_events: switched.events,
    resume: {
      kind: "switch_after_movement",
      turn_seq: choice.turn_seq,
      seat: controllerSeat,
      ability_id: choice.ability_id,
      switch_id: switched.context.switch_id,
      target_reserve_index: selected.reserve_index,
    },
  };
}

export function runtimeV02ResumeActiveAbilitySwitch(
  state: Record<string, unknown>,
  resume: RuntimeV02ActiveAbilitySwitchResume,
): RuntimeV02ActiveAbilitySwitchResumeResolution {
  if (resume.kind !== "switch_after_movement") {
    throw new Error("tcg_v0_2_active_ability_switch_resume_kind_invalid");
  }
  if (currentTurn(state) !== resume.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_switch_resume_turn_stale");
  }
  if (resume.seat !== 1 && resume.seat !== 2) {
    throw new Error("tcg_v0_2_active_ability_switch_resume_seat_invalid");
  }
  const context = runtimeV02SwitchContextById(state, resume.switch_id);
  if (
    !context ||
    context.controller_seat !== resume.seat ||
    context.source_action_id !== resume.ability_id ||
    context.action_kind !== "effect_switch" ||
    context.reserve_index !== resume.target_reserve_index
  ) {
    throw new Error("tcg_v0_2_active_ability_switch_resume_context_changed");
  }
  return {
    kind: "switch_after_movement",
    ability_id: resume.ability_id,
    switch_id: resume.switch_id,
    target_reserve_index: resume.target_reserve_index,
  };
}
