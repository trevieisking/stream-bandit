import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02BeginCardCostChoice,
  runtimeV02ResumeCardCostChoice,
  type RuntimeV02CardCostChoiceBinding,
  type RuntimeV02CardCostChoiceFlow,
  type RuntimeV02CardCostChoiceState,
  type RuntimeV02PendingCardCostChoice,
} from "./tcg-match-card-cost-choice-v0-2.ts";
import {
  runtimeV02ApplyResolvedCardCostRoute,
  type RuntimeV02CardCostSourceLocation,
  type RuntimeV02ResolvedCardCostPaymentResult,
} from "./tcg-match-payment-route-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import type { RuntimeV02CardCostState } from "./tcg-match-payment-cost-v0-2.ts";

export type RuntimeV02ActionCostKind = "ability" | "attack";

export type RuntimeV02ActionCostSource = {
  location: RuntimeV02CardCostSourceLocation;
  instance: { uid: string; card_id: string };
};

export type RuntimeV02ActionCostState<T extends RuntimeV02CardZoneInstance> =
  RuntimeV02CardCostState<T> & RuntimeV02CardCostChoiceState;

export type RuntimeV02ActionCostPermit<T extends RuntimeV02CardZoneInstance> = {
  schema: "sb-tcg-action-cost-permit-v0.2";
  turn_seq: number;
  controller_seat: 1 | 2;
  action_kind: RuntimeV02ActionCostKind;
  action_id: string;
  source_card_uid: string;
  source_card_id: string;
  source_location: RuntimeV02CardCostSourceLocation;
  additional_cost_count: number;
  variables: Record<string, boolean>;
  payment: RuntimeV02ResolvedCardCostPaymentResult<T> | null;
};

export type RuntimeV02ActionCostGateResult<T extends RuntimeV02CardZoneInstance> =
  | {
    status: "player_choice_required";
    pending_choice: RuntimeV02PendingCardCostChoice;
    permit: null;
  }
  | {
    status: "execution_permitted";
    pending_choice: null;
    permit: RuntimeV02ActionCostPermit<T>;
  };

export type RuntimeV02ActionCostGateRequest<T extends RuntimeV02CardZoneInstance> = {
  controller_seat: 1 | 2;
  action_kind: RuntimeV02ActionCostKind;
  action_id: string;
  source: RuntimeV02ActionCostSource;
  defeat_describe: RuntimeV02DefeatDescribe<T>;
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

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) throw new Error("tcg_v0_2_action_cost_turn_invalid");
  return turn;
}

function normalizedSource(raw: RuntimeV02ActionCostSource): RuntimeV02ActionCostSource {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_action_cost_source_required");
  const instance = objectRecord(raw.instance);
  if (!instance) throw new Error("tcg_v0_2_action_cost_source_instance_required");
  const where = raw.location?.where;
  const index = raw.location?.index;
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_action_cost_vanguard_index_invalid");
  } else if (where === "reserve") {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_action_cost_reserve_index_invalid");
    }
  } else {
    throw new Error("tcg_v0_2_action_cost_source_location_invalid");
  }
  return {
    location: { where, index: where === "vanguard" ? null : Number(index) },
    instance: {
      uid: requiredString(instance.uid, "tcg_v0_2_action_cost_source_uid_required"),
      card_id: requiredString(instance.card_id, "tcg_v0_2_action_cost_source_card_id_required"),
    },
  };
}

function normalizedRequest<T extends RuntimeV02CardZoneInstance>(
  raw: RuntimeV02ActionCostGateRequest<T>,
): RuntimeV02ActionCostGateRequest<T> {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_action_cost_request_required");
  if (raw.controller_seat !== 1 && raw.controller_seat !== 2) {
    throw new Error("tcg_v0_2_action_cost_controller_invalid");
  }
  if (raw.action_kind !== "ability" && raw.action_kind !== "attack") {
    throw new Error("tcg_v0_2_action_cost_kind_invalid");
  }
  if (typeof raw.defeat_describe !== "function") {
    throw new Error("tcg_v0_2_action_cost_defeat_describe_required");
  }
  return {
    controller_seat: raw.controller_seat,
    action_kind: raw.action_kind,
    action_id: requiredString(raw.action_id, "tcg_v0_2_action_cost_action_id_required"),
    source: normalizedSource(raw.source),
    defeat_describe: raw.defeat_describe,
  };
}

/**
 * Read-only structured metadata boundary for additional card costs.
 * Ability.costs is already canonical. Attack.cost remains attached-Essence
 * payment; attack.costs is the separate additive declaration-cost program.
 */
export function runtimeV02StructuredActionAdditionalCosts(
  state: Record<string, unknown>,
  sourceInstance: { uid: string; card_id: string },
  actionKind: RuntimeV02ActionCostKind,
  actionId: string,
): unknown[] | null {
  const definition = runtimeV02Definition(state, sourceInstance);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_action_cost_requires_creature");
  }
  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_action_cost_creature_definition_required");
  const id = requiredString(actionId, "tcg_v0_2_action_cost_action_id_required");

  if (actionKind === "ability") {
    const ability = objectRecord(creature.ability);
    if (!ability || requiredString(ability.id, "tcg_v0_2_action_cost_ability_id_required") !== id) {
      throw new Error(`tcg_v0_2_action_cost_ability_missing:${id}`);
    }
    if (!Array.isArray(ability.costs)) {
      throw new Error(`tcg_v0_2_action_cost_ability_costs_required:${id}`);
    }
    return structuredClone(ability.costs);
  }

  const attacks = Array.isArray(creature.attacks) ? creature.attacks : null;
  if (!attacks) throw new Error("tcg_v0_2_action_cost_attack_list_required");
  const attack = attacks
    .map((entry) => objectRecord(entry))
    .find((entry) => entry && String(entry.id || "").trim() === id);
  if (!attack) throw new Error(`tcg_v0_2_action_cost_attack_missing:${id}`);
  if (attack.costs == null) return [];
  if (!Array.isArray(attack.costs)) {
    throw new Error(`tcg_v0_2_action_cost_attack_costs_invalid:${id}`);
  }
  return structuredClone(attack.costs);
}

function binding<T extends RuntimeV02CardZoneInstance>(
  request: RuntimeV02ActionCostGateRequest<T>,
): RuntimeV02CardCostChoiceBinding {
  return {
    controller_seat: request.controller_seat,
    action_kind: request.action_kind,
    source_action_id: request.action_id,
    source_card_uid: request.source.instance.uid,
    source_card_id: request.source.instance.card_id,
    source_creature_uid: request.source.instance.uid,
  };
}

function executionPermit<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  request: RuntimeV02ActionCostGateRequest<T>,
  additionalCostCount: number,
  variables: Record<string, boolean>,
  payment: RuntimeV02ResolvedCardCostPaymentResult<T> | null,
): RuntimeV02ActionCostPermit<T> {
  return {
    schema: "sb-tcg-action-cost-permit-v0.2",
    turn_seq: currentTurn(state),
    controller_seat: request.controller_seat,
    action_kind: request.action_kind,
    action_id: request.action_id,
    source_card_uid: request.source.instance.uid,
    source_card_id: request.source.instance.card_id,
    source_location: { ...request.source.location },
    additional_cost_count: additionalCostCount,
    variables: { ...variables },
    payment,
  };
}

function finishFlow<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  request: RuntimeV02ActionCostGateRequest<T>,
  rawCosts: unknown[],
  flow: RuntimeV02CardCostChoiceFlow,
): RuntimeV02ActionCostGateResult<T> {
  if (flow.status === "player_choice_required") {
    return { status: flow.status, pending_choice: flow.pending_choice, permit: null };
  }
  const payment = rawCosts.length === 0
    ? null
    : runtimeV02ApplyResolvedCardCostRoute(
      state,
      binding(request),
      request.source.location,
      flow.costs,
      request.defeat_describe,
    );
  return {
    status: "execution_permitted",
    pending_choice: null,
    permit: executionPermit(state, request, rawCosts.length, flow.variables, payment),
  };
}

/**
 * Starts the shared additional-cost gate. The caller must not record an Ability
 * use, consume Starbound, or execute an Ability/Attack until this returns
 * execution_permitted. Empty additional-cost programs pass through without
 * touching Payment; normal attack Essence payment stays owned by Attack.
 */
export function runtimeV02BeginActionCostGate<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  rawRequest: RuntimeV02ActionCostGateRequest<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02ActionCostGateResult<T> {
  const request = normalizedRequest(rawRequest);
  const rawCosts = runtimeV02StructuredActionAdditionalCosts(
    state,
    request.source.instance,
    request.action_kind,
    request.action_id,
  );
  if (rawCosts == null || rawCosts.length === 0) {
    return {
      status: "execution_permitted",
      pending_choice: null,
      permit: executionPermit(state, request, 0, {}, null),
    };
  }
  const flow = runtimeV02BeginCardCostChoice(state, binding(request), rawCosts, choiceId);
  return finishFlow(state, request, rawCosts, flow);
}

/**
 * Resumes only the frozen additional-cost choice. The underlying choice owner
 * rejects stale turn/action/cost snapshots; Payment then revalidates the current
 * source identity before atomically mutating any cost state.
 */
export function runtimeV02ResumeActionCostGate<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  rawRequest: RuntimeV02ActionCostGateRequest<T>,
  pending: RuntimeV02PendingCardCostChoice,
  choiceId: string,
  choiceIds: readonly string[],
  nextChoiceId: string = crypto.randomUUID(),
): RuntimeV02ActionCostGateResult<T> {
  const request = normalizedRequest(rawRequest);
  const rawCosts = runtimeV02StructuredActionAdditionalCosts(
    state,
    request.source.instance,
    request.action_kind,
    request.action_id,
  );
  if (rawCosts == null || rawCosts.length === 0) {
    throw new Error("tcg_v0_2_action_cost_resume_without_costs");
  }
  const flow = runtimeV02ResumeCardCostChoice(
    state,
    binding(request),
    rawCosts,
    pending,
    choiceId,
    [...choiceIds],
    nextChoiceId,
  );
  return finishFlow(state, request, rawCosts, flow);
}
