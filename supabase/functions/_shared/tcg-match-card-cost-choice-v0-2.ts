import {
  runtimeV02PlanCardCosts,
  type RuntimeV02CardCostChoice,
  type RuntimeV02CardCostDecision,
  type RuntimeV02PlannedCardCost,
  type RuntimeV02PlannedHandDiscardCost,
} from "./tcg-match-payment-plan-v0-2.ts";
import { runtimeV02CardMatchesSelectionFilters } from "./tcg-match-card-selection-v0-2.ts";

export type RuntimeV02CardCostChoiceBinding = {
  controller_seat: 1 | 2;
  action_kind: "attack" | "ability" | "tactic" | "essence" | "relic" | "realm";
  source_action_id: string;
  source_card_uid: string;
  source_card_id: string;
  source_creature_uid: string | null;
};

export type RuntimeV02CardCostHandInstance = {
  uid: string;
  card_id: string;
};

export type RuntimeV02CardCostChoiceState = Record<string, unknown> & {
  turn_seq: number;
  players: Record<string, { hand?: RuntimeV02CardCostHandInstance[] } & Record<string, unknown>>;
};

type InternalChoiceOption = {
  id: string;
  label: string;
  selection?: "pay" | "skip" | number;
  card_uid?: string;
  card_id?: string;
};

export type RuntimeV02PendingCardCostChoice = {
  id: string;
  seat: 1 | 2;
  kind: "card_cost_composition" | "card_cost_hand_selection";
  turn_seq: number;
  action_kind: RuntimeV02CardCostChoiceBinding["action_kind"];
  source_action_id: string;
  source_card_uid: string;
  source_card_id: string;
  source_creature_uid: string | null;
  cost_snapshot: string;
  decisions: RuntimeV02CardCostDecision[];
  selected_hand_card_uids: Record<string, string[]>;
  prompt: string;
  min: number;
  max: number;
  options: InternalChoiceOption[];
  composition_path: string | null;
  hand_cost_index: number | null;
};

export type RuntimeV02ResolvedHandDiscardCost = RuntimeV02PlannedHandDiscardCost & {
  card_uids: string[];
};

export type RuntimeV02ResolvedCardCost =
  | Exclude<RuntimeV02PlannedCardCost, RuntimeV02PlannedHandDiscardCost>
  | RuntimeV02ResolvedHandDiscardCost;

export type RuntimeV02CardCostChoiceFlow =
  | {
    status: "player_choice_required";
    pending_choice: RuntimeV02PendingCardCostChoice;
  }
  | {
    status: "ready";
    costs: RuntimeV02ResolvedCardCost[];
    decisions: RuntimeV02CardCostDecision[];
    variables: Record<string, boolean>;
    pending_choice: null;
  };

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function turn(state: RuntimeV02CardCostChoiceState): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) throw new Error("tcg_v0_2_card_cost_choice_turn_invalid");
  return value;
}

function normalizedBinding(raw: RuntimeV02CardCostChoiceBinding): RuntimeV02CardCostChoiceBinding {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_card_cost_choice_binding_required");
  const actionKind = String(raw.action_kind || "") as RuntimeV02CardCostChoiceBinding["action_kind"];
  if (!["attack", "ability", "tactic", "essence", "relic", "realm"].includes(actionKind)) {
    throw new Error("tcg_v0_2_card_cost_choice_action_kind_invalid");
  }
  const sourceCreatureUid = raw.source_creature_uid == null
    ? null
    : requiredString(raw.source_creature_uid, "tcg_v0_2_card_cost_choice_source_creature_uid_invalid");
  if ((actionKind === "attack" || actionKind === "ability") && !sourceCreatureUid) {
    throw new Error("tcg_v0_2_card_cost_choice_source_creature_uid_required");
  }
  return {
    controller_seat: seat(raw.controller_seat, "tcg_v0_2_card_cost_choice_controller_invalid"),
    action_kind: actionKind,
    source_action_id: requiredString(raw.source_action_id, "tcg_v0_2_card_cost_choice_action_id_required"),
    source_card_uid: requiredString(raw.source_card_uid, "tcg_v0_2_card_cost_choice_source_card_uid_required"),
    source_card_id: requiredString(raw.source_card_id, "tcg_v0_2_card_cost_choice_source_card_id_required"),
    source_creature_uid: sourceCreatureUid,
  };
}

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const raw = value as Record<string, unknown>;
  return `{${Object.keys(raw).sort().map((key) => `${JSON.stringify(key)}:${stable(raw[key])}`).join(",")}}`;
}

function snapshot(rawCosts: unknown): string {
  if (!Array.isArray(rawCosts)) throw new Error("tcg_v0_2_card_cost_choice_costs_invalid");
  return stable(rawCosts);
}

function hand(state: RuntimeV02CardCostChoiceState, controllerSeat: 1 | 2): RuntimeV02CardCostHandInstance[] {
  const player = state.players?.[String(controllerSeat)];
  if (!player || !Array.isArray(player.hand)) throw new Error("tcg_v0_2_card_cost_choice_hand_missing");
  const seen = new Set<string>();
  return player.hand.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`tcg_v0_2_card_cost_choice_hand_card_invalid:${index}`);
    const uid = requiredString(raw.uid, `tcg_v0_2_card_cost_choice_hand_uid_invalid:${index}`);
    const cardId = requiredString(raw.card_id, `tcg_v0_2_card_cost_choice_hand_card_id_invalid:${index}`);
    if (seen.has(uid)) throw new Error(`tcg_v0_2_card_cost_choice_hand_uid_duplicate:${uid}`);
    seen.add(uid);
    return { uid, card_id: cardId };
  });
}

function pendingBase(
  id: string,
  state: RuntimeV02CardCostChoiceState,
  binding: RuntimeV02CardCostChoiceBinding,
  costSnapshot: string,
  decisions: RuntimeV02CardCostDecision[],
  selected: Record<string, string[]>,
) {
  return {
    id: requiredString(id, "tcg_v0_2_card_cost_choice_id_required"),
    seat: binding.controller_seat,
    turn_seq: turn(state),
    action_kind: binding.action_kind,
    source_action_id: binding.source_action_id,
    source_card_uid: binding.source_card_uid,
    source_card_id: binding.source_card_id,
    source_creature_uid: binding.source_creature_uid,
    cost_snapshot: costSnapshot,
    decisions: decisions.map((entry) => ({ ...entry })),
    selected_hand_card_uids: Object.fromEntries(
      Object.entries(selected).map(([key, value]) => [key, [...value]]),
    ),
  };
}

function compositionPending(
  id: string,
  state: RuntimeV02CardCostChoiceState,
  binding: RuntimeV02CardCostChoiceBinding,
  costSnapshot: string,
  decisions: RuntimeV02CardCostDecision[],
  selected: Record<string, string[]>,
  choice: RuntimeV02CardCostChoice,
): RuntimeV02PendingCardCostChoice {
  return {
    ...pendingBase(id, state, binding, costSnapshot, decisions, selected),
    kind: "card_cost_composition",
    prompt: choice.kind === "optional" ? "Choose whether to pay the optional cost" : "Choose a cost option",
    min: 1,
    max: 1,
    options: choice.options.map((option) => ({ ...option })),
    composition_path: choice.path,
    hand_cost_index: null,
  };
}

function nextUnselectedHandCost(
  costs: readonly RuntimeV02PlannedCardCost[],
  selected: Record<string, string[]>,
): RuntimeV02PlannedHandDiscardCost | null {
  for (const cost of costs) {
    if (cost.kind !== "hand_discard") continue;
    if (selected[String(cost.cost_index)] == null) return cost;
  }
  return null;
}

function handPending(
  id: string,
  state: RuntimeV02CardCostChoiceState,
  binding: RuntimeV02CardCostChoiceBinding,
  costSnapshot: string,
  decisions: RuntimeV02CardCostDecision[],
  selected: Record<string, string[]>,
  cost: RuntimeV02PlannedHandDiscardCost,
): RuntimeV02PendingCardCostChoice {
  const filters = cost.filters || {};
  const used = new Set(Object.values(selected).flat());
  const hasFilters = Object.keys(filters).length > 0;
  const options = hand(state, binding.controller_seat)
    .filter((card) => !used.has(card.uid))
    .filter((card) =>
      !hasFilters ||
      runtimeV02CardMatchesSelectionFilters(
        state,
        card,
        filters,
      )
    )
    .map((card) => ({
      id: `hand:${card.uid}`,
      label: card.card_id,
      card_uid: card.uid,
      card_id: card.card_id,
    }));
  if (options.length < cost.count) {
    throw new Error(`tcg_v0_2_card_cost_choice_hand_insufficient:${cost.cost_index}`);
  }
  return {
    ...pendingBase(id, state, binding, costSnapshot, decisions, selected),
    kind: "card_cost_hand_selection",
    prompt: cost.count === 1 ? "Choose 1 card from your hand to discard" : `Choose ${cost.count} cards from your hand to discard`,
    min: cost.count,
    max: cost.count,
    options,
    composition_path: null,
    hand_cost_index: cost.cost_index,
  };
}

function resolvedCosts(
  costs: readonly RuntimeV02PlannedCardCost[],
  selected: Record<string, string[]>,
): RuntimeV02ResolvedCardCost[] {
  return costs.map((cost) => {
    if (cost.kind !== "hand_discard") return { ...cost };
    const cardUids = selected[String(cost.cost_index)];
    if (!cardUids || cardUids.length !== cost.count) {
      throw new Error(`tcg_v0_2_card_cost_choice_hand_selection_missing:${cost.cost_index}`);
    }
    return { ...cost, card_uids: [...cardUids] };
  });
}

function advance(
  id: string,
  state: RuntimeV02CardCostChoiceState,
  binding: RuntimeV02CardCostChoiceBinding,
  rawCosts: unknown,
  decisions: RuntimeV02CardCostDecision[],
  selected: Record<string, string[]>,
): RuntimeV02CardCostChoiceFlow {
  const costSnapshot = snapshot(rawCosts);
  const plan = runtimeV02PlanCardCosts(rawCosts, decisions);
  if (plan.status === "choice_required") {
    return {
      status: "player_choice_required",
      pending_choice: compositionPending(id, state, binding, costSnapshot, decisions, selected, plan.choice),
    };
  }
  const handCost = nextUnselectedHandCost(plan.costs, selected);
  if (handCost) {
    return {
      status: "player_choice_required",
      pending_choice: handPending(id, state, binding, costSnapshot, decisions, selected, handCost),
    };
  }
  return {
    status: "ready",
    costs: resolvedCosts(plan.costs, selected),
    decisions: decisions.map((entry) => ({ ...entry })),
    variables: { ...plan.variables },
    pending_choice: null,
  };
}

function assertBinding(
  pending: RuntimeV02PendingCardCostChoice,
  state: RuntimeV02CardCostChoiceState,
  bindingRaw: RuntimeV02CardCostChoiceBinding,
  rawCosts: unknown,
): RuntimeV02CardCostChoiceBinding {
  const binding = normalizedBinding(bindingRaw);
  if (pending.turn_seq !== turn(state)) throw new Error("tcg_v0_2_card_cost_choice_turn_stale");
  if (
    pending.seat !== binding.controller_seat ||
    pending.action_kind !== binding.action_kind ||
    pending.source_action_id !== binding.source_action_id ||
    pending.source_card_uid !== binding.source_card_uid ||
    pending.source_card_id !== binding.source_card_id ||
    pending.source_creature_uid !== binding.source_creature_uid
  ) throw new Error("tcg_v0_2_card_cost_choice_binding_stale");
  if (pending.cost_snapshot !== snapshot(rawCosts)) throw new Error("tcg_v0_2_card_cost_choice_costs_stale");
  return binding;
}

export function runtimeV02BeginCardCostChoice(
  state: RuntimeV02CardCostChoiceState,
  bindingRaw: RuntimeV02CardCostChoiceBinding,
  rawCosts: unknown,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02CardCostChoiceFlow {
  const binding = normalizedBinding(bindingRaw);
  return advance(choiceId, state, binding, rawCosts, [], {});
}

export function runtimeV02ResumeCardCostChoice(
  state: RuntimeV02CardCostChoiceState,
  bindingRaw: RuntimeV02CardCostChoiceBinding,
  rawCosts: unknown,
  pending: RuntimeV02PendingCardCostChoice,
  choiceId: string,
  choiceIds: readonly string[],
  nextChoiceId: string = crypto.randomUUID(),
): RuntimeV02CardCostChoiceFlow {
  if (!pending || typeof pending !== "object") throw new Error("tcg_v0_2_card_cost_choice_pending_required");
  if (!choiceId || pending.id !== choiceId) throw new Error("tcg_v0_2_card_cost_choice_stale_id");
  const binding = assertBinding(pending, state, bindingRaw, rawCosts);
  if (!Array.isArray(choiceIds)) throw new Error("tcg_v0_2_card_cost_choice_ids_invalid");
  if (new Set(choiceIds).size !== choiceIds.length) throw new Error("tcg_v0_2_card_cost_choice_ids_duplicate");

  const decisions = pending.decisions.map((entry) => ({ ...entry }));
  const selected = Object.fromEntries(
    Object.entries(pending.selected_hand_card_uids).map(([key, value]) => [key, [...value]]),
  );

  if (pending.kind === "card_cost_composition") {
    if (choiceIds.length !== 1) throw new Error("tcg_v0_2_card_cost_choice_exactly_one_required");
    const option = pending.options.find((candidate) => candidate.id === choiceIds[0]);
    if (!option || option.selection == null || !pending.composition_path) {
      throw new Error("tcg_v0_2_card_cost_choice_option_invalid");
    }
    decisions.push({ path: pending.composition_path, selection: option.selection });
    return advance(nextChoiceId, state, binding, rawCosts, decisions, selected);
  }

  if (pending.kind === "card_cost_hand_selection") {
    if (pending.hand_cost_index == null) throw new Error("tcg_v0_2_card_cost_choice_hand_index_missing");
    if (choiceIds.length !== pending.min || pending.min !== pending.max) {
      throw new Error("tcg_v0_2_card_cost_choice_hand_exact_count_required");
    }
    const selectedOptions = choiceIds.map((id) => pending.options.find((candidate) => candidate.id === id));
    if (selectedOptions.some((option) => !option?.card_uid)) throw new Error("tcg_v0_2_card_cost_choice_hand_option_invalid");
    selected[String(pending.hand_cost_index)] = selectedOptions.map((option) => option!.card_uid!);
    return advance(nextChoiceId, state, binding, rawCosts, decisions, selected);
  }

  throw new Error("tcg_v0_2_card_cost_choice_kind_unsupported");
}

export function runtimeV02PendingCardCostChoiceView(
  pending: RuntimeV02PendingCardCostChoice | null | undefined,
  viewerSeatRaw: number,
): Record<string, unknown> | null {
  if (!pending) return null;
  const viewerSeat = seat(viewerSeatRaw, "tcg_v0_2_card_cost_choice_viewer_invalid");
  if (viewerSeat !== pending.seat) {
    return { id: pending.id, seat: pending.seat, kind: pending.kind, waiting: true };
  }
  return {
    id: pending.id,
    seat: pending.seat,
    kind: pending.kind,
    prompt: pending.prompt,
    min: pending.min,
    max: pending.max,
    options: pending.options.map((option) => ({ id: option.id, label: option.label })),
  };
}
