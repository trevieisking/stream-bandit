import {
  runtimeV02ApplyDamageCardCost,
  runtimeV02ApplyHandDiscardCardCost,
  type RuntimeV02CardCostCreatureRef,
  type RuntimeV02CardCostIdentity,
  type RuntimeV02CardCostState,
  type RuntimeV02DamageCardCostResult,
  type RuntimeV02HandDiscardCardCostResult,
} from "./tcg-match-payment-cost-v0-2.ts";
import type {
  RuntimeV02CardZoneInstance,
} from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";

export type RuntimeV02CardCostSequenceIdentity = Omit<
  RuntimeV02CardCostIdentity,
  "source_step_index"
>;

export type RuntimeV02DamageCardCostSequenceOperation<T extends RuntimeV02CardZoneInstance> = {
  kind: "damage";
  cost_index: number;
  target: RuntimeV02CardCostCreatureRef;
  amount: number;
  defeat_describe: RuntimeV02DefeatDescribe<T>;
};

export type RuntimeV02HandDiscardCardCostSequenceOperation = {
  kind: "hand_discard";
  cost_index: number;
  expected_count: number;
  card_uids: readonly unknown[];
};

export type RuntimeV02CardCostSequenceOperation<T extends RuntimeV02CardZoneInstance> =
  | RuntimeV02DamageCardCostSequenceOperation<T>
  | RuntimeV02HandDiscardCardCostSequenceOperation;

export type RuntimeV02CardCostSequenceResult<T extends RuntimeV02CardZoneInstance> =
  | {
    kind: "damage";
    cost_index: number;
    result: RuntimeV02DamageCardCostResult;
  }
  | {
    kind: "hand_discard";
    cost_index: number;
    result: RuntimeV02HandDiscardCardCostResult<T>;
  };

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function positiveInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(error);
  return number;
}

function validateOperations<T extends RuntimeV02CardZoneInstance>(
  operations: readonly RuntimeV02CardCostSequenceOperation<T>[],
): RuntimeV02CardCostSequenceOperation<T>[] {
  if (!Array.isArray(operations)) throw new Error("tcg_v0_2_card_cost_sequence_operations_invalid");
  return operations.map((operation, index) => {
    if (!operation || typeof operation !== "object") {
      throw new Error(`tcg_v0_2_card_cost_sequence_operation_invalid:${index}`);
    }
    const costIndex = nonNegativeInteger(
      operation.cost_index,
      `tcg_v0_2_card_cost_sequence_index_invalid:${index}`,
    );
    if (costIndex !== index) {
      throw new Error(`tcg_v0_2_card_cost_sequence_index_noncanonical:${index}:${costIndex}`);
    }
    if (operation.kind === "damage") return operation;
    if (operation.kind === "hand_discard") {
      const count = positiveInteger(
        operation.expected_count,
        `tcg_v0_2_card_cost_sequence_discard_count_invalid:${index}`,
      );
      if (!Array.isArray(operation.card_uids) || operation.card_uids.length !== count) {
        throw new Error(`tcg_v0_2_card_cost_sequence_discard_exact_count_required:${index}`);
      }
      return operation;
    }
    throw new Error(`tcg_v0_2_card_cost_sequence_kind_unsupported:${index}`);
  });
}

function leafIdentity(
  base: RuntimeV02CardCostSequenceIdentity,
  costIndex: number,
): RuntimeV02CardCostIdentity {
  return { ...base, source_step_index: costIndex };
}

function applyOperation<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  identity: RuntimeV02CardCostSequenceIdentity,
  operation: RuntimeV02CardCostSequenceOperation<T>,
): RuntimeV02CardCostSequenceResult<T> {
  const id = leafIdentity(identity, operation.cost_index);
  if (operation.kind === "damage") {
    return {
      kind: operation.kind,
      cost_index: operation.cost_index,
      result: runtimeV02ApplyDamageCardCost(state, {
        identity: id,
        target: operation.target,
        amount: operation.amount,
        defeat_describe: operation.defeat_describe,
      }),
    };
  }
  return {
    kind: operation.kind,
    cost_index: operation.cost_index,
    result: runtimeV02ApplyHandDiscardCardCost(state, {
      identity: id,
      card_uids: operation.card_uids,
    }),
  };
}

/**
 * Canonical Payment-owner transaction for an already-resolved ordered card-cost
 * plan. The whole sequence is first executed against a structured clone. If any
 * later leaf is illegal, the real match state is untouched. Only after the full
 * simulated sequence succeeds are the same canonical leaf transactions applied
 * to the real state in the same stable cost-index order.
 *
 * Choice prompting, hidden hand-card selection and variable binding stay with the
 * action owner / Payment planner. Damage, Card-Zone and Defeat remain the physical
 * mutation owners used by the existing leaf Payment transactions.
 */
export function runtimeV02ApplyCardCostSequence<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  identity: RuntimeV02CardCostSequenceIdentity,
  rawOperations: readonly RuntimeV02CardCostSequenceOperation<T>[],
): RuntimeV02CardCostSequenceResult<T>[] {
  const operations = validateOperations(rawOperations);
  if (!operations.length) return [];

  const simulated = structuredClone(state) as RuntimeV02CardCostState<T>;
  for (const operation of operations) {
    applyOperation(simulated, identity, operation);
  }

  return operations.map((operation) => applyOperation(state, identity, operation));
}
