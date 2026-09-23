import {
  runtimeV02BeginActiveAbilityActivationCost,
  runtimeV02ResumeActiveAbilityActivationCost,
} from "./tcg-match-active-ability-activation-cost-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import type {
  RuntimeV02ActiveAbilityProgramSource,
  RuntimeV02ActiveAbilityProgramState,
} from "./tcg-match-active-ability-program-v0-2.ts";
import {
  runtimeV02PendingCardCostChoiceView,
  type RuntimeV02PendingCardCostChoice,
} from "./tcg-match-card-cost-choice-v0-2.ts";
import {
  runtimeV02CardMatchesSelectionFilters,
} from "./tcg-match-card-selection-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import {
  runtimeV02BeginExternalEssenceAttachmentRoute,
} from "./tcg-match-essence-attachment-route-v0-2.ts";
import {
  runtimeV02NormalizeEffectAttachmentState,
  type RuntimeV02EffectAttachmentState,
} from "./tcg-match-essence-attachment-state-v0-2.ts";
import type { RuntimeV02EventListenerFlow } from "./tcg-match-event-listener-v0-2.ts";
import type { RuntimeV02ActiveAbilitySupplyAttachmentResume } from "./tcg-match-active-ability-supply-attachment-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

export type RuntimeV02PaidSelfAttachmentDescriptor = {
  ability_id: string;
  limit: { scope: "turn"; count: 1; owner: "controller" };
  cost_filters: Record<string, unknown>;
  essence_filters: Record<string, unknown>;
  attachment_state: RuntimeV02EffectAttachmentState | null;
};

export type RuntimeV02PaidSelfAttachmentOption = {
  id: string;
  label: string;
  uid: string;
  card_id: string;
};

export type RuntimeV02PendingPaidSelfAttachmentChoice = {
  id: string;
  seat: Seat;
  kind: "paid_self_attachment";
  stage: "activation_cost" | "essence";
  ability_id: string;
  prompt: string;
  min: number;
  max: number;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  cost_filters: Record<string, unknown>;
  essence_filters: Record<string, unknown>;
  attachment_state: RuntimeV02EffectAttachmentState | null;
  cost_choice: RuntimeV02PendingCardCostChoice | null;
  options: RuntimeV02PaidSelfAttachmentOption[];
};

export type RuntimeV02PaidSelfAttachmentResolution = {
  kind: "paid_self_attachment";
  stage: "attachment_resolved";
  ability_id: string;
  selected_essence_count: 1;
  target_where: FieldWhere;
  target_index: number | null;
  target_anchor_uid: string;
  attachment_flow: RuntimeV02EventListenerFlow;
  resume: RuntimeV02ActiveAbilitySupplyAttachmentResume;
};

export type RuntimeV02PaidSelfAttachmentLiveResult =
  | {
      status: "player_choice_required";
      pending_choice: RuntimeV02PendingPaidSelfAttachmentChoice;
      resolution: null;
    }
  | {
      status: "attachment_resolved";
      pending_choice: null;
      resolution: RuntimeV02PaidSelfAttachmentResolution;
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
function turn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_paid_attachment_turn_invalid");
  }
  return value;
}
function rejectFields(
  row: Record<string, unknown>,
  allowed: string[],
  code: string,
): void {
  const extra = Object.keys(row).find((key) => !allowed.includes(key));
  if (extra) throw new Error(`${code}:${extra}`);
}
function filters(raw: unknown, code: string): Record<string, unknown> {
  const row = obj(raw);
  if (!row) throw new Error(code);
  const allowed = ["card_family", "tactic_subtype", "essence_subtype", "element"];
  const extra = Object.keys(row).find((key) => !allowed.includes(key));
  if (extra) throw new Error(`${code}:unsupported:${extra}`);
  return structuredClone(row);
}
function sameFilters(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  return keysA.length === keysB.length &&
    keysA.every((key, index) =>
      key === keysB[index] && JSON.stringify(a[key]) === JSON.stringify(b[key])
    );
}
function limit(raw: unknown, abilityId: string) {
  const row = obj(raw);
  if (!row) throw new Error(`tcg_v0_2_paid_attachment_limit_required:${abilityId}`);
  rejectFields(
    row,
    ["scope", "count", "owner"],
    `tcg_v0_2_paid_attachment_limit_field_unsupported:${abilityId}`,
  );
  if (row.scope !== "turn" || Number(row.count) !== 1 || row.owner !== "controller") {
    throw new Error(`tcg_v0_2_paid_attachment_limit_unsupported:${abilityId}`);
  }
  return { scope: "turn" as const, count: 1 as const, owner: "controller" as const };
}
function instance(raw: unknown, code: string): Inst {
  const row = obj(raw);
  if (!row) throw new Error(code);
  return { uid: req(row.uid, `${code}:uid`), card_id: req(row.card_id, `${code}:card_id`) };
}
function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = obj(state.players);
  const row = players ? obj(players[String(seat)]) : null;
  if (!row || !Array.isArray(row.reserve) || !Array.isArray(row.hand) || !Array.isArray(row.discard)) {
    throw new Error("tcg_v0_2_paid_attachment_player_invalid");
  }
  return row;
}
function sourceTop(
  state: Record<string, unknown>,
  seat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const own = player(state, seat);
  const raw = where === "vanguard"
    ? own.vanguard
    : (own.reserve as unknown[])[Number(index)];
  const creature = obj(raw);
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_paid_attachment_source_missing");
  }
  return instance(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_paid_attachment_source_top_invalid",
  );
}
function sameSource(actual: Inst, expected: Inst): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error("tcg_v0_2_paid_attachment_source_changed");
  }
}
function definition(state: Record<string, unknown>, card: Inst): Record<string, unknown> {
  const def = runtimeV02Definition(state, card);
  if (!def) throw new Error("tcg_v0_2_paid_attachment_definition_missing");
  return def;
}
function essenceOptions(
  state: Record<string, unknown>,
  seat: Seat,
  selectionFilters: Record<string, unknown>,
): RuntimeV02PaidSelfAttachmentOption[] {
  return (player(state, seat).discard as unknown[])
    .map((raw, index) =>
      instance(raw, `tcg_v0_2_paid_attachment_discard_card_invalid:${index}`)
    )
    .filter((card) =>
      runtimeV02CardMatchesSelectionFilters(state, card, selectionFilters)
    )
    .map((card) => ({
      id: `essence:${card.uid}`,
      label: String(definition(state, card).name || card.card_id),
      uid: card.uid,
      card_id: card.card_id,
    }));
}
function abilityDefinition(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): Record<string, unknown> | null {
  const def = runtimeV02Definition(state, instanceOrId);
  if (!def || String(def.card_family || "") !== "Creature") return null;
  const creature = obj(def.creature);
  const ability = obj(creature?.ability);
  return ability || null;
}

export function structuredRuntimePaidSelfAttachmentActiveAbility(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02PaidSelfAttachmentDescriptor | null {
  const ability = abilityDefinition(state, instanceOrId);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") {
    return null;
  }
  const abilityId = req(
    ability.id,
    "tcg_v0_2_paid_attachment_ability_id_required",
  );
  rejectFields(
    ability,
    ["id", "name", "mode", "event", "timing", "limit", "requirements", "costs", "steps"],
    `tcg_v0_2_paid_attachment_ability_field_unsupported:${abilityId}`,
  );
  if (ability.event !== null) return null;
  const exactLimit = limit(ability.limit, abilityId);

  const requirements = obj(ability.requirements);
  if (!requirements) return null;
  rejectFields(
    requirements,
    ["all"],
    `tcg_v0_2_paid_attachment_requirements_field_unsupported:${abilityId}`,
  );
  if (!Array.isArray(requirements.all) || requirements.all.length !== 2) {
    return null;
  }
  const reqs = requirements.all.map(obj);
  if (reqs.some((row) => !row)) return null;
  const handReq = reqs.find((row) => row?.predicate === "hand_contains");
  const discardReq = reqs.find((row) =>
    row?.predicate === "legal_card_available" &&
    row.controller === "self" &&
    row.zone === "discard"
  );
  if (!handReq || !discardReq) return null;
  rejectFields(
    handReq,
    ["predicate", "filters"],
    `tcg_v0_2_paid_attachment_hand_requirement_field_unsupported:${abilityId}`,
  );
  rejectFields(
    discardReq,
    ["predicate", "controller", "zone", "filters"],
    `tcg_v0_2_paid_attachment_discard_requirement_field_unsupported:${abilityId}`,
  );
  const handFilters = filters(
    handReq.filters,
    `tcg_v0_2_paid_attachment_hand_filters_invalid:${abilityId}`,
  );
  const discardFilters = filters(
    discardReq.filters,
    `tcg_v0_2_paid_attachment_discard_filters_invalid:${abilityId}`,
  );

  if (!Array.isArray(ability.costs) || ability.costs.length !== 1) return null;
  const cost = obj(ability.costs[0]);
  if (!cost || cost.op !== "CHOOSE_HAND_TO_DISCARD") return null;
  rejectFields(
    cost,
    ["op", "player", "count", "filters"],
    `tcg_v0_2_paid_attachment_cost_field_unsupported:${abilityId}`,
  );
  if (cost.player !== "self" || Number(cost.count) !== 1) return null;
  const costFilters = filters(
    cost.filters,
    `tcg_v0_2_paid_attachment_cost_filters_invalid:${abilityId}`,
  );
  if (!sameFilters(handFilters, costFilters)) {
    throw new Error(`tcg_v0_2_paid_attachment_cost_requirement_mismatch:${abilityId}`);
  }

  if (!Array.isArray(ability.steps) || ability.steps.length !== 1) return null;
  const attach = obj(ability.steps[0]);
  if (!attach || attach.op !== "ATTACH_ESSENCE_FROM_ZONE") return null;
  rejectFields(
    attach,
    ["op", "player", "zone", "selection", "target", "manual_attachment", "attachment_state"],
    `tcg_v0_2_paid_attachment_step_field_unsupported:${abilityId}`,
  );
  if (
    attach.player !== "self" ||
    attach.zone !== "discard" ||
    attach.target !== "$source_creature" ||
    attach.manual_attachment !== false
  ) return null;
  const selection = obj(attach.selection);
  if (!selection) return null;
  rejectFields(
    selection,
    ["min", "max", "filters"],
    `tcg_v0_2_paid_attachment_selection_field_unsupported:${abilityId}`,
  );
  if (Number(selection.min) !== 1 || Number(selection.max) !== 1) return null;
  const essenceFilters = filters(
    selection.filters,
    `tcg_v0_2_paid_attachment_essence_filters_invalid:${abilityId}`,
  );
  if (!sameFilters(discardFilters, essenceFilters)) {
    throw new Error(`tcg_v0_2_paid_attachment_discard_requirement_mismatch:${abilityId}`);
  }
  const attachment = runtimeV02NormalizeEffectAttachmentState(
    attach.attachment_state,
  );
  return {
    ability_id: abilityId,
    limit: exactLimit,
    cost_filters: costFilters,
    essence_filters: essenceFilters,
    attachment_state: attachment.state,
  };
}

function activationRequest<T extends RuntimeV02CardZoneInstance>(
  controllerSeat: Seat,
  source: RuntimeV02ActiveAbilityProgramSource,
  descriptor: RuntimeV02PaidSelfAttachmentDescriptor,
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

function costPending(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  source: RuntimeV02ActiveAbilityProgramSource,
  descriptor: RuntimeV02PaidSelfAttachmentDescriptor,
  pending: RuntimeV02PendingCardCostChoice,
): RuntimeV02PendingPaidSelfAttachmentChoice {
  return {
    id: pending.id,
    seat: controllerSeat,
    kind: "paid_self_attachment",
    stage: "activation_cost",
    ability_id: descriptor.ability_id,
    prompt: pending.prompt,
    min: pending.min,
    max: pending.max,
    turn_seq: turn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: source.instance.uid,
    source_card_id: source.instance.card_id,
    cost_filters: structuredClone(descriptor.cost_filters),
    essence_filters: structuredClone(descriptor.essence_filters),
    attachment_state: descriptor.attachment_state
      ? structuredClone(descriptor.attachment_state)
      : null,
    cost_choice: structuredClone(pending),
    options: [],
  };
}

function essencePending(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  source: RuntimeV02ActiveAbilityProgramSource,
  descriptor: RuntimeV02PaidSelfAttachmentDescriptor,
  choiceId: string,
): RuntimeV02PendingPaidSelfAttachmentChoice {
  const options = essenceOptions(state, controllerSeat, descriptor.essence_filters);
  if (!options.length) {
    throw new Error("tcg_v0_2_paid_attachment_eligible_essence_required");
  }
  return {
    id: req(choiceId, "tcg_v0_2_paid_attachment_choice_id_required"),
    seat: controllerSeat,
    kind: "paid_self_attachment",
    stage: "essence",
    ability_id: descriptor.ability_id,
    prompt: "Choose one eligible Essence from your discard",
    min: 1,
    max: 1,
    turn_seq: turn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: source.instance.uid,
    source_card_id: source.instance.card_id,
    cost_filters: structuredClone(descriptor.cost_filters),
    essence_filters: structuredClone(descriptor.essence_filters),
    attachment_state: descriptor.attachment_state
      ? structuredClone(descriptor.attachment_state)
      : null,
    cost_choice: null,
    options,
  };
}

function sourceFromChoice(
  choice: RuntimeV02PendingPaidSelfAttachmentChoice,
): RuntimeV02ActiveAbilityProgramSource {
  return {
    where: choice.source_where,
    index: choice.source_index,
    instance: {
      uid: choice.source_uid,
      card_id: choice.source_card_id,
    },
  };
}

function descriptorFromChoice(
  choice: RuntimeV02PendingPaidSelfAttachmentChoice,
): RuntimeV02PaidSelfAttachmentDescriptor {
  return {
    ability_id: choice.ability_id,
    limit: { scope: "turn", count: 1, owner: "controller" },
    cost_filters: structuredClone(choice.cost_filters),
    essence_filters: structuredClone(choice.essence_filters),
    attachment_state: choice.attachment_state
      ? structuredClone(choice.attachment_state)
      : null,
  };
}

function validatePending(
  state: Record<string, unknown>,
  choice: RuntimeV02PendingPaidSelfAttachmentChoice,
  controllerSeat: Seat,
  choiceId: string,
): RuntimeV02ActiveAbilityProgramSource {
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_paid_attachment_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_paid_attachment_choice_stale_id");
  }
  if (turn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_paid_attachment_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_paid_attachment_active_seat_changed");
  }
  const source = sourceFromChoice(choice);
  sameSource(
    sourceTop(state, controllerSeat, source.where, source.index),
    source.instance,
  );
  return source;
}

export function runtimeV02BeginPaidSelfAttachmentActiveAbilityLiveRoute<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityProgramState<T>,
  controllerSeat: Seat,
  source: RuntimeV02ActiveAbilityProgramSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PaidSelfAttachmentLiveResult | null {
  const descriptor = structuredRuntimePaidSelfAttachmentActiveAbility(
    state as Record<string, unknown>,
    source.instance,
  );
  if (!descriptor) return null;
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_paid_attachment_not_active_seat");
  }
  sameSource(
    sourceTop(state as Record<string, unknown>, controllerSeat, source.where, source.index),
    source.instance,
  );
  // Preflight effect availability before any cost can mutate.
  if (!essenceOptions(
    state as Record<string, unknown>,
    controllerSeat,
    descriptor.essence_filters,
  ).length) {
    throw new Error("tcg_v0_2_paid_attachment_eligible_essence_required");
  }

  const activation = runtimeV02BeginActiveAbilityActivationCost(
    state,
    activationRequest(controllerSeat, source, descriptor, defeatDescribe),
    choiceId,
  );
  if (activation.status === "player_choice_required") {
    return {
      status: "player_choice_required",
      pending_choice: costPending(
        state as Record<string, unknown>,
        controllerSeat,
        source,
        descriptor,
        activation.pending_choice,
      ),
      resolution: null,
    };
  }
  return {
    status: "player_choice_required",
    pending_choice: essencePending(
      state as Record<string, unknown>,
      controllerSeat,
      source,
      descriptor,
      choiceId,
    ),
    resolution: null,
  };
}

export function runtimeV02PendingPaidSelfAttachmentChoiceView(
  choice: RuntimeV02PendingPaidSelfAttachmentChoice | null | undefined,
  viewerSeat: Seat,
): Record<string, unknown> | null {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  if (choice.stage === "activation_cost") {
    const inner = runtimeV02PendingCardCostChoiceView(
      choice.cost_choice,
      viewerSeat,
    );
    if (!inner) throw new Error("tcg_v0_2_paid_attachment_cost_choice_missing");
    return {
      id: choice.id,
      seat: choice.seat,
      kind: choice.kind,
      stage: choice.stage,
      prompt: inner.prompt,
      min: inner.min,
      max: inner.max,
      options: inner.options,
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

export function runtimeV02ResolvePaidSelfAttachmentActiveAbilityLiveRoute<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityProgramState<T>,
  choice: RuntimeV02PendingPaidSelfAttachmentChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
  nextChoiceId: string = crypto.randomUUID(),
): RuntimeV02PaidSelfAttachmentLiveResult {
  const source = validatePending(
    state as Record<string, unknown>,
    choice,
    controllerSeat,
    choiceId,
  );
  const descriptor = descriptorFromChoice(choice);
  const currentDescriptor = structuredRuntimePaidSelfAttachmentActiveAbility(
    state as Record<string, unknown>,
    source.instance,
  );
  if (
    !currentDescriptor ||
    currentDescriptor.ability_id !== descriptor.ability_id ||
    !sameFilters(currentDescriptor.cost_filters, descriptor.cost_filters) ||
    !sameFilters(currentDescriptor.essence_filters, descriptor.essence_filters) ||
    JSON.stringify(currentDescriptor.attachment_state) !==
      JSON.stringify(descriptor.attachment_state)
  ) {
    throw new Error("tcg_v0_2_paid_attachment_definition_changed");
  }

  if (choice.stage === "activation_cost") {
    if (!choice.cost_choice) {
      throw new Error("tcg_v0_2_paid_attachment_cost_choice_missing");
    }
    const activation = runtimeV02ResumeActiveAbilityActivationCost(
      state,
      activationRequest(controllerSeat, source, descriptor, defeatDescribe),
      choice.cost_choice,
      choiceId,
      choiceIds,
      nextChoiceId,
    );
    if (activation.status === "player_choice_required") {
      return {
        status: "player_choice_required",
        pending_choice: costPending(
          state as Record<string, unknown>,
          controllerSeat,
          source,
          descriptor,
          activation.pending_choice,
        ),
        resolution: null,
      };
    }
    return {
      status: "player_choice_required",
      pending_choice: essencePending(
        state as Record<string, unknown>,
        controllerSeat,
        source,
        descriptor,
        nextChoiceId,
      ),
      resolution: null,
    };
  }

  if (
    !Array.isArray(choiceIds) ||
    choiceIds.length !== 1 ||
    new Set(choiceIds).size !== 1
  ) {
    throw new Error("tcg_v0_2_paid_attachment_essence_choice_count_invalid");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) !== 1
  ) {
    throw new Error("tcg_v0_2_paid_attachment_limit_receipt_missing");
  }
  const selected = choice.options.find((option) => option.id === choiceIds[0]);
  if (!selected) {
    throw new Error("tcg_v0_2_paid_attachment_essence_option_invalid");
  }
  const current = essenceOptions(
    state as Record<string, unknown>,
    controllerSeat,
    descriptor.essence_filters,
  ).find((option) =>
    option.uid === selected.uid &&
    option.card_id === selected.card_id
  );
  if (!current) {
    throw new Error("tcg_v0_2_paid_attachment_essence_changed");
  }

  const attachment = runtimeV02NormalizeEffectAttachmentState(
    descriptor.attachment_state,
  );
  const routed = runtimeV02BeginExternalEssenceAttachmentRoute(
    state as Record<string, unknown>,
    controllerSeat,
    source.instance.uid,
    current.uid,
    "discard",
    descriptor.ability_id,
    {
      ...attachment.transaction,
      phase: "play",
      action_kind: "ability",
      destination_index: source.where === "reserve" ? source.index : null,
      source_owner_seat: controllerSeat,
      source_card_id: current.card_id,
    },
  );
  return {
    status: "attachment_resolved",
    pending_choice: null,
    resolution: {
      kind: "paid_self_attachment",
      stage: "attachment_resolved",
      ability_id: descriptor.ability_id,
      selected_essence_count: 1,
      target_where: source.where,
      target_index: source.where === "reserve" ? source.index : null,
      target_anchor_uid: source.instance.uid,
      attachment_flow: routed.flow,
      resume: {
        kind: "effect_attachment_after_attachment",
        seat: controllerSeat,
        turn_seq: choice.turn_seq,
        ability_id: descriptor.ability_id,
        attached_essence_count: 1,
      },
    },
  };
}
