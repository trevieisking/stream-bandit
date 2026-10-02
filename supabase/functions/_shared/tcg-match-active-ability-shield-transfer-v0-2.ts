import { runtimeV02CurrentTurnActiveAbilityUseCount } from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02TransferShield,
  type RuntimeV02DamageCreature,
  type RuntimeV02ShieldTransferReceipt,
} from "./tcg-match-damage-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };
type Creature = RuntimeV02DamageCreature & { stack?: unknown[] };

type Field = {
  where: FieldWhere;
  index: number | null;
  creature: Creature;
  top: Inst;
  element: string;
};

export type RuntimeV02ActiveAbilityShieldTransferDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  source_min_shield: number;
  target: {
    controller: "self";
    zone: "field";
    count: 1;
    card_family: "Creature";
    element: string;
    exclude_source: true;
  };
  transfer: {
    from: "$source_creature";
    target_variable: string;
    min: number;
    max: number;
  };
};

export type RuntimeV02ActiveAbilityShieldTransferOption =
  | {
      id: string;
      kind: "target";
      label: string;
      where: FieldWhere;
      index: number | null;
      anchor_uid: string;
      anchor_card_id: string;
    }
  | {
      id: string;
      kind: "amount";
      label: string;
      amount: number;
    };

export type RuntimeV02PendingActiveAbilityShieldTransferChoice = {
  id: string;
  seat: Seat;
  kind: "transfer_shield_between_friendly_creatures";
  stage: "target" | "amount";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02ActiveAbilityShieldTransferDescriptor;
  target_anchor_uid: string | null;
  target_card_id: string | null;
  options: RuntimeV02ActiveAbilityShieldTransferOption[];
};

export type RuntimeV02ActiveAbilityShieldTransferResolution =
  | {
      kind: "transfer_shield_between_friendly_creatures";
      stage: "amount_choice_required";
      ability_id: string;
      pending_choice: RuntimeV02PendingActiveAbilityShieldTransferChoice;
    }
  | {
      kind: "transfer_shield_between_friendly_creatures";
      stage: "complete";
      ability_id: string;
      target_creature_uid: string;
      target_where: FieldWhere;
      target_index: number | null;
      receipt: RuntimeV02ShieldTransferReceipt;
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
  const extra = Object.keys(row).find((key) => !allowed.includes(key));
  if (extra) throw new Error(`${code}:${extra}`);
}

function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_turn_invalid");
  }
  return value;
}

function instance(value: unknown, code: string): Inst {
  const row = obj(value);
  if (!row) throw new Error(code);
  return {
    uid: req(row.uid, `${code}:uid`),
    card_id: req(row.card_id, `${code}:card_id`),
  };
}

function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = obj(state.players);
  const row = players ? obj(players[String(seat)]) : null;
  if (!row || !Array.isArray(row.reserve)) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_player_invalid");
  }
  return row;
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
      throw new Error("tcg_v0_2_active_ability_shield_transfer_field_invalid");
    }
    const top = instance(
      creature.stack[creature.stack.length - 1],
      "tcg_v0_2_active_ability_shield_transfer_top_invalid",
    );
    const definition = runtimeV02Definition(state, top);
    if (!definition) {
      throw new Error("tcg_v0_2_active_ability_shield_transfer_definition_missing");
    }
    const element = req(
      definition.element,
      "tcg_v0_2_active_ability_shield_transfer_element_missing",
    );
    const shield = Number(creature.shield ?? 0);
    if (!Number.isFinite(shield) || shield < 0) {
      throw new Error("tcg_v0_2_active_ability_shield_transfer_shield_invalid");
    }
    out.push({
      where,
      index,
      creature: creature as Creature,
      top,
      element,
    });
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
  if (!found) throw new Error("tcg_v0_2_active_ability_shield_transfer_source_missing");
  return found;
}

function fieldByAnchor(
  state: Record<string, unknown>,
  seat: Seat,
  uid: string,
): Field | null {
  return fields(state, seat).find((field) => field.top.uid === uid) ?? null;
}

function sameSource(actual: Field, choice: {
  source_uid: string;
  source_card_id: string;
}): void {
  if (
    actual.top.uid !== choice.source_uid ||
    actual.top.card_id !== choice.source_card_id
  ) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_source_changed");
  }
}

function targetOptions(
  state: Record<string, unknown>,
  seat: Seat,
  descriptor: RuntimeV02ActiveAbilityShieldTransferDescriptor,
  sourceUid: string,
): RuntimeV02ActiveAbilityShieldTransferOption[] {
  return fields(state, seat)
    .filter((field) =>
      field.top.uid !== sourceUid &&
      field.element === descriptor.target.element
    )
    .map((field) => ({
      id: field.where === "vanguard"
        ? `creature:vanguard:${field.top.uid}`
        : `creature:reserve:${field.index}:${field.top.uid}`,
      kind: "target" as const,
      label: field.where === "vanguard"
        ? "Vanguard"
        : `Reserve ${Number(field.index) + 1}`,
      where: field.where,
      index: field.index,
      anchor_uid: field.top.uid,
      anchor_card_id: field.top.card_id,
    }));
}

function shieldValue(field: Field): number {
  const shield = Number(field.creature.shield ?? 0);
  if (!Number.isInteger(shield) || shield < 0) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_shield_invalid");
  }
  return shield;
}

function amountOptions(
  source: Field,
  target: Field,
  descriptor: RuntimeV02ActiveAbilityShieldTransferDescriptor,
): RuntimeV02ActiveAbilityShieldTransferOption[] {
  const sourceShield = shieldValue(source);
  const targetShield = shieldValue(target);
  const canonicalCapacity = Math.max(0, 60 - targetShield);
  const legalMax = Math.min(
    descriptor.transfer.max,
    sourceShield,
    canonicalCapacity,
  );
  const out: RuntimeV02ActiveAbilityShieldTransferOption[] = [];
  for (
    let amount = descriptor.transfer.min;
    amount <= legalMax;
    amount += 1
  ) {
    out.push({
      id: `shield-amount:${amount}`,
      kind: "amount",
      label: `${amount} Shield`,
      amount,
    });
  }
  return out;
}

function exactLimit(
  raw: unknown,
  abilityId: string,
): RuntimeV02ActiveAbilityShieldTransferDescriptor["limit"] {
  const limit = obj(raw);
  if (!limit) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_limit_required:${abilityId}`);
  }
  reject(
    limit,
    ["scope", "count", "owner"],
    `tcg_v0_2_active_ability_shield_transfer_limit_field_unsupported:${abilityId}`,
  );
  if (
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

export function structuredRuntimeActiveAbilityShieldTransfer(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityShieldTransferDescriptor | null {
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
  const transfer = obj(steps[1]);
  if (
    !select ||
    !transfer ||
    select.op !== "SELECT_CREATURE" ||
    transfer.op !== "TRANSFER_SHIELD"
  ) return null;

  const abilityId = req(
    ability.id,
    "tcg_v0_2_active_ability_shield_transfer_ability_id_required",
  );
  reject(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_active_ability_shield_transfer_ability_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_costs_unsupported:${abilityId}`);
  }
  const limit = exactLimit(ability.limit, abilityId);

  reject(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_active_ability_shield_transfer_select_field_unsupported:${abilityId}`,
  );
  if (
    select.controller !== "self" ||
    select.zone !== "field" ||
    Number(select.count) !== 1
  ) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_select_unsupported:${abilityId}`);
  }
  const variable = req(
    select.as,
    `tcg_v0_2_active_ability_shield_transfer_variable_required:${abilityId}`,
  );
  const filters = obj(select.filters);
  if (!filters) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_filters_required:${abilityId}`);
  }
  reject(
    filters,
    ["element", "exclude_source"],
    `tcg_v0_2_active_ability_shield_transfer_filters_field_unsupported:${abilityId}`,
  );
  const element = req(
    filters.element,
    `tcg_v0_2_active_ability_shield_transfer_element_required:${abilityId}`,
  );
  if (filters.exclude_source !== true) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_exclude_source_required:${abilityId}`);
  }

  reject(
    transfer,
    ["op", "from", "to", "amount"],
    `tcg_v0_2_active_ability_shield_transfer_step_field_unsupported:${abilityId}`,
  );
  if (
    transfer.from !== "$source_creature" ||
    transfer.to !== `$${variable}`
  ) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_binding_unsupported:${abilityId}`);
  }
  const amount = obj(transfer.amount);
  if (!amount) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_amount_required:${abilityId}`);
  }
  reject(
    amount,
    ["min", "max"],
    `tcg_v0_2_active_ability_shield_transfer_amount_field_unsupported:${abilityId}`,
  );
  const min = Number(amount.min);
  const max = Number(amount.max);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min
  ) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_amount_invalid:${abilityId}`);
  }

  const requirements = obj(ability.requirements);
  const all = Array.isArray(requirements?.all)
    ? (requirements!.all as unknown[]).map(obj)
    : [];
  if (all.length !== 2 || all.some((branch) => !branch)) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_requirements_unsupported:${abilityId}`);
  }
  const shieldRequirement = all.find((branch) =>
    branch?.predicate === "source_has_shield_at_least"
  );
  const legalRequirement = all.find((branch) =>
    branch?.predicate === "legal_card_available"
  );
  if (!shieldRequirement || !legalRequirement) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_requirements_unsupported:${abilityId}`);
  }

  reject(
    shieldRequirement,
    ["predicate", "value"],
    `tcg_v0_2_active_ability_shield_transfer_source_requirement_field_unsupported:${abilityId}`,
  );
  const sourceMinShield = Number(shieldRequirement.value);
  if (!Number.isInteger(sourceMinShield) || sourceMinShield < 1) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_source_requirement_invalid:${abilityId}`);
  }

  reject(
    legalRequirement,
    ["predicate", "controller", "zone", "filters"],
    `tcg_v0_2_active_ability_shield_transfer_legal_requirement_field_unsupported:${abilityId}`,
  );
  if (
    legalRequirement.controller !== "self" ||
    legalRequirement.zone !== "field"
  ) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_legal_requirement_unsupported:${abilityId}`);
  }
  const legalFilters = obj(legalRequirement.filters);
  if (!legalFilters) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_legal_filters_required:${abilityId}`);
  }
  reject(
    legalFilters,
    ["card_family", "element", "exclude_source"],
    `tcg_v0_2_active_ability_shield_transfer_legal_filters_field_unsupported:${abilityId}`,
  );
  if (
    legalFilters.card_family !== "Creature" ||
    legalFilters.element !== element ||
    legalFilters.exclude_source !== true
  ) {
    throw new Error(`tcg_v0_2_active_ability_shield_transfer_legal_filters_unsupported:${abilityId}`);
  }

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit,
    source_min_shield: sourceMinShield,
    target: {
      controller: "self",
      zone: "field",
      count: 1,
      card_family: "Creature",
      element,
      exclude_source: true,
    },
    transfer: {
      from: "$source_creature",
      target_variable: variable,
      min,
      max,
    },
  };
}

export function runtimeV02CreateActiveAbilityShieldTransferChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilityShieldTransferDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityShieldTransferChoice {
  if (!choiceId) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_choice_id_required");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_not_active_seat");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) !== 0
  ) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_limit_reached");
  }
  const sourceIdentity = instance(
    source.instance,
    "tcg_v0_2_active_ability_shield_transfer_source_invalid",
  );
  const actualSource = sourceField(
    state,
    controllerSeat,
    source.where,
    source.index,
  );
  if (
    actualSource.top.uid !== sourceIdentity.uid ||
    actualSource.top.card_id !== sourceIdentity.card_id
  ) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_source_changed");
  }
  if (shieldValue(actualSource) < descriptor.source_min_shield) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_source_shield_insufficient");
  }
  const options = targetOptions(
    state,
    controllerSeat,
    descriptor,
    sourceIdentity.uid,
  );
  if (!options.length) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_target_unavailable");
  }
  return {
    id: choiceId,
    seat: controllerSeat,
    kind: "transfer_shield_between_friendly_creatures",
    stage: "target",
    ability_id: descriptor.ability_id,
    prompt: `Choose one friendly ${descriptor.target.element} Creature`,
    min: 1,
    max: 1,
    turn_seq: turn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceIdentity.uid,
    source_card_id: sourceIdentity.card_id,
    descriptor: structuredClone(descriptor),
    target_anchor_uid: null,
    target_card_id: null,
    options,
  };
}

export function runtimeV02PendingActiveAbilityShieldTransferChoiceView(
  choice: RuntimeV02PendingActiveAbilityShieldTransferChoice | null | undefined,
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
    stage: choice.stage,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
    })),
  };
}

export function runtimeV02ResolveActiveAbilityShieldTransferChoice(
  choice: RuntimeV02PendingActiveAbilityShieldTransferChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityShieldTransferResolution {
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_choice_stale_id");
  }
  if (
    !Array.isArray(choiceIds) ||
    choiceIds.length !== 1 ||
    new Set(choiceIds).size !== 1
  ) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_exactly_one_required");
  }
  if (turn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_active_seat_changed");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      choice.ability_id,
    ) !== 1
  ) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_limit_receipt_missing");
  }

  const source = sourceField(
    state,
    controllerSeat,
    choice.source_where,
    choice.source_index,
  );
  sameSource(source, choice);
  if (shieldValue(source) < choice.descriptor.source_min_shield) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_source_shield_changed");
  }

  const selectedId = choiceIds[0];
  if (choice.stage === "target") {
    const option = choice.options.find((candidate) =>
      candidate.kind === "target" && candidate.id === selectedId
    );
    if (!option || option.kind !== "target") {
      throw new Error("tcg_v0_2_active_ability_shield_transfer_target_option_invalid");
    }
    const target = fieldByAnchor(state, controllerSeat, option.anchor_uid);
    if (
      !target ||
      target.top.card_id !== option.anchor_card_id ||
      target.top.uid === source.top.uid ||
      target.element !== choice.descriptor.target.element
    ) {
      throw new Error("tcg_v0_2_active_ability_shield_transfer_target_changed");
    }
    const amounts = amountOptions(source, target, choice.descriptor);
    if (!amounts.length) {
      throw new Error("tcg_v0_2_active_ability_shield_transfer_amount_unavailable");
    }
    return {
      kind: "transfer_shield_between_friendly_creatures",
      stage: "amount_choice_required",
      ability_id: choice.ability_id,
      pending_choice: {
        ...structuredClone(choice),
        id: crypto.randomUUID(),
        stage: "amount",
        prompt: `Choose Shield to transfer to ${option.label}`,
        target_anchor_uid: target.top.uid,
        target_card_id: target.top.card_id,
        options: amounts,
      },
    };
  }

  if (choice.stage !== "amount") {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_stage_invalid");
  }
  if (!choice.target_anchor_uid || !choice.target_card_id) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_target_identity_required");
  }
  const target = fieldByAnchor(
    state,
    controllerSeat,
    choice.target_anchor_uid,
  );
  if (
    !target ||
    target.top.card_id !== choice.target_card_id ||
    target.top.uid === source.top.uid ||
    target.element !== choice.descriptor.target.element
  ) {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_target_changed");
  }
  const amounts = amountOptions(source, target, choice.descriptor);
  const amountOption = amounts.find((candidate) =>
    candidate.kind === "amount" && candidate.id === selectedId
  );
  if (!amountOption || amountOption.kind !== "amount") {
    throw new Error("tcg_v0_2_active_ability_shield_transfer_amount_changed");
  }
  const receipt = runtimeV02TransferShield(
    source.creature,
    target.creature,
    amountOption.amount,
  );
  return {
    kind: "transfer_shield_between_friendly_creatures",
    stage: "complete",
    ability_id: choice.ability_id,
    target_creature_uid: target.top.uid,
    target_where: target.where,
    target_index: target.index,
    receipt,
  };
}
