import {
  runtimeV02BeginActionCostGate,
  runtimeV02ResumeActionCostGate,
  type RuntimeV02ActionCostGateRequest,
  type RuntimeV02ActionCostPermit,
  type RuntimeV02ActionCostState,
} from "./tcg-match-action-cost-gate-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
  runtimeV02RecordActiveAbilityUse,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import type { RuntimeV02PendingCardCostChoice } from "./tcg-match-card-cost-choice-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";

export type RuntimeV02ActiveAbilityActivationCostRequest<T extends RuntimeV02CardZoneInstance> = {
  cost_gate: Omit<RuntimeV02ActionCostGateRequest<T>, "action_kind"> & { action_kind: "ability" };
  turn_limit: 1 | null;
};

export type RuntimeV02ActiveAbilityActivationCostPermit<T extends RuntimeV02CardZoneInstance> = {
  schema: "sb-tcg-active-ability-activation-cost-permit-v0.2";
  cost_permit: RuntimeV02ActionCostPermit<T>;
  turn_limit_recorded: boolean;
};

export type RuntimeV02ActiveAbilityActivationCostResult<T extends RuntimeV02CardZoneInstance> =
  | {
    status: "player_choice_required";
    pending_choice: RuntimeV02PendingCardCostChoice;
    permit: null;
  }
  | {
    status: "activation_permitted";
    pending_choice: null;
    permit: RuntimeV02ActiveAbilityActivationCostPermit<T>;
  };

function normalizedRequest<T extends RuntimeV02CardZoneInstance>(
  raw: RuntimeV02ActiveAbilityActivationCostRequest<T>,
): RuntimeV02ActiveAbilityActivationCostRequest<T> {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_active_ability_activation_cost_request_required");
  if (!raw.cost_gate || raw.cost_gate.action_kind !== "ability") {
    throw new Error("tcg_v0_2_active_ability_activation_cost_ability_gate_required");
  }
  if (raw.turn_limit !== 1 && raw.turn_limit !== null) {
    throw new Error("tcg_v0_2_active_ability_activation_cost_turn_limit_unsupported");
  }
  return { ...raw, cost_gate: { ...raw.cost_gate, action_kind: "ability" } };
}

function preflightTurnLimit<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  request: RuntimeV02ActiveAbilityActivationCostRequest<T>,
): void {
  if (request.turn_limit === null) return;
  const count = runtimeV02CurrentTurnActiveAbilityUseCount(
    state,
    request.cost_gate.controller_seat,
    request.cost_gate.action_id,
  );
  if (count !== 0) throw new Error("tcg_v0_2_active_ability_activation_cost_turn_limit_reached");
}

function finish<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  request: RuntimeV02ActiveAbilityActivationCostRequest<T>,
  gate: ReturnType<typeof runtimeV02BeginActionCostGate<T>>,
): RuntimeV02ActiveAbilityActivationCostResult<T> {
  if (gate.status === "player_choice_required") {
    return { status: gate.status, pending_choice: gate.pending_choice, permit: null };
  }
  let recorded = false;
  if (request.turn_limit === 1) {
    runtimeV02RecordActiveAbilityUse(
      state,
      request.cost_gate.controller_seat,
      request.cost_gate.action_id,
    );
    recorded = true;
  }
  return {
    status: "activation_permitted",
    pending_choice: null,
    permit: {
      schema: "sb-tcg-active-ability-activation-cost-permit-v0.2",
      cost_permit: gate.permit,
      turn_limit_recorded: recorded,
    },
  };
}

/**
 * Active Ability caller boundary. The current turn-limit is preflighted before
 * any optional/private cost choice can mutate state. The cost program is then
 * fully resolved and paid. Only after Payment returns an execution permit is the
 * once-per-turn Ability-use receipt recorded. Effect execution must start from
 * activation_permitted and later effect choices must not replay this function.
 */
export function runtimeV02BeginActiveAbilityActivationCost<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  rawRequest: RuntimeV02ActiveAbilityActivationCostRequest<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02ActiveAbilityActivationCostResult<T> {
  const request = normalizedRequest(rawRequest);
  preflightTurnLimit(state, request);
  const gate = runtimeV02BeginActionCostGate(state, request.cost_gate, choiceId);
  return finish(state, request, gate);
}

/** Revalidates the turn limit before resuming so a newly consumed limit blocks Payment before mutation. */
export function runtimeV02ResumeActiveAbilityActivationCost<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  rawRequest: RuntimeV02ActiveAbilityActivationCostRequest<T>,
  pending: RuntimeV02PendingCardCostChoice,
  choiceId: string,
  choiceIds: readonly string[],
  nextChoiceId: string = crypto.randomUUID(),
): RuntimeV02ActiveAbilityActivationCostResult<T> {
  const request = normalizedRequest(rawRequest);
  preflightTurnLimit(state, request);
  const gate = runtimeV02ResumeActionCostGate(
    state,
    request.cost_gate,
    pending,
    choiceId,
    [...choiceIds],
    nextChoiceId,
  );
  return finish(state, request, gate as ReturnType<typeof runtimeV02BeginActionCostGate<T>>);
}
