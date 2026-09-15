import {
  runtimeV02BeginActionCostGate,
  runtimeV02ResumeActionCostGate,
  type RuntimeV02ActionCostGateRequest,
  type RuntimeV02ActionCostPermit,
  type RuntimeV02ActionCostState,
} from "./tcg-match-action-cost-gate-v0-2.ts";
import {
  runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration,
  type RuntimeV02AttackModifierConsumption,
  type RuntimeV02AttackModifierCreature,
} from "./tcg-match-attack-modifier-v0-2.ts";
import type { RuntimeV02PendingCardCostChoice } from "./tcg-match-card-cost-choice-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";

export type RuntimeV02AttackDeclarationCostRequest<T extends RuntimeV02CardZoneInstance> = {
  cost_gate: Omit<RuntimeV02ActionCostGateRequest<T>, "action_kind"> & { action_kind: "attack" };
  modifier_creature: RuntimeV02AttackModifierCreature;
  consuming_action_id: string;
  target_uid: string;
  turn_seq: number;
  base_damage: number;
};

export type RuntimeV02AttackDeclarationCostPermit<T extends RuntimeV02CardZoneInstance> = {
  schema: "sb-tcg-attack-declaration-cost-permit-v0.2";
  cost_permit: RuntimeV02ActionCostPermit<T>;
  modifier_consumption: RuntimeV02AttackModifierConsumption | null;
};

export type RuntimeV02AttackDeclarationCostResult<T extends RuntimeV02CardZoneInstance> =
  | {
    status: "player_choice_required";
    pending_choice: RuntimeV02PendingCardCostChoice;
    permit: null;
  }
  | {
    status: "declaration_permitted";
    pending_choice: null;
    permit: RuntimeV02AttackDeclarationCostPermit<T>;
  };

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function nonNegativeDamage(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function normalizedRequest<T extends RuntimeV02CardZoneInstance>(
  raw: RuntimeV02AttackDeclarationCostRequest<T>,
): RuntimeV02AttackDeclarationCostRequest<T> {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_attack_declaration_cost_request_required");
  if (!raw.cost_gate || raw.cost_gate.action_kind !== "attack") {
    throw new Error("tcg_v0_2_attack_declaration_cost_attack_gate_required");
  }
  if (!raw.modifier_creature || typeof raw.modifier_creature !== "object") {
    throw new Error("tcg_v0_2_attack_declaration_cost_modifier_creature_required");
  }
  return {
    ...raw,
    cost_gate: { ...raw.cost_gate, action_kind: "attack" },
    consuming_action_id: requiredString(
      raw.consuming_action_id,
      "tcg_v0_2_attack_declaration_cost_action_id_required",
    ),
    target_uid: requiredString(raw.target_uid, "tcg_v0_2_attack_declaration_cost_target_uid_required"),
    turn_seq: nonNegativeInteger(raw.turn_seq, "tcg_v0_2_attack_declaration_cost_turn_invalid"),
    base_damage: nonNegativeDamage(raw.base_damage, "tcg_v0_2_attack_declaration_cost_base_damage_invalid"),
  };
}

function finish<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  request: RuntimeV02AttackDeclarationCostRequest<T>,
  gate: ReturnType<typeof runtimeV02BeginActionCostGate<T>>,
): RuntimeV02AttackDeclarationCostResult<T> {
  if (gate.status === "player_choice_required") {
    return { status: gate.status, pending_choice: gate.pending_choice, permit: null };
  }
  const modifierConsumption = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    request.modifier_creature,
    {
      consuming_action_id: request.consuming_action_id,
      target_uid: request.target_uid,
      turn_seq: request.turn_seq,
      base_damage: request.base_damage,
    },
  );
  return {
    status: "declaration_permitted",
    pending_choice: null,
    permit: {
      schema: "sb-tcg-attack-declaration-cost-permit-v0.2",
      cost_permit: gate.permit,
      modifier_consumption: modifierConsumption,
    },
  };
}

/**
 * Attack caller boundary after ordinary declaration legality and attached-Essence
 * requirements have already passed. Additional card costs are resolved and paid
 * first. Only then does Attack #14 consume legal-declaration modifiers. Starbound
 * remains caller-owned and must be consumed only after declaration_permitted.
 */
export function runtimeV02BeginAttackDeclarationCost<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  rawRequest: RuntimeV02AttackDeclarationCostRequest<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02AttackDeclarationCostResult<T> {
  const request = normalizedRequest(rawRequest);
  const gate = runtimeV02BeginActionCostGate(state, request.cost_gate, choiceId);
  return finish(state, request, gate);
}

/**
 * Resumes only the frozen additional-cost choice. Payment revalidates source
 * identity. Modifier consumption happens exactly once, only after the final cost
 * choice reaches an execution permit; later attack effect choices must continue
 * from the returned declaration permit rather than replay this function.
 */
export function runtimeV02ResumeAttackDeclarationCost<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02ActionCostState<T>,
  rawRequest: RuntimeV02AttackDeclarationCostRequest<T>,
  pending: RuntimeV02PendingCardCostChoice,
  choiceId: string,
  choiceIds: readonly string[],
  nextChoiceId: string = crypto.randomUUID(),
): RuntimeV02AttackDeclarationCostResult<T> {
  const request = normalizedRequest(rawRequest);
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
