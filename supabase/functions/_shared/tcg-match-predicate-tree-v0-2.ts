export type RuntimeV02PredicateLeaf = Record<string, unknown> & {
  predicate: string;
};

export type RuntimeV02PredicateLeafEvaluator<Context> = (
  leaf: RuntimeV02PredicateLeaf,
  context: Context,
) => boolean;

const MAX_DEPTH = 64;

function objectRecord(value: unknown, error: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(error);
  return value as Record<string, unknown>;
}

function list(value: unknown, error: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(error);
  return value;
}

function evaluateNode<Context>(
  raw: unknown,
  context: Context,
  evaluateLeaf: RuntimeV02PredicateLeafEvaluator<Context>,
  depth: number,
): boolean {
  if (depth > MAX_DEPTH) throw new Error("tcg_v0_2_predicate_tree_depth_exceeded");
  const value = objectRecord(raw, "tcg_v0_2_predicate_tree_node_invalid");

  if (Object.hasOwn(value, "all")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_predicate_tree_all_shape_invalid");
    }
    return list(value.all, "tcg_v0_2_predicate_tree_all_invalid")
      .every((item) => evaluateNode(item, context, evaluateLeaf, depth + 1));
  }

  if (Object.hasOwn(value, "any")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_predicate_tree_any_shape_invalid");
    }
    const items = list(value.any, "tcg_v0_2_predicate_tree_any_invalid");
    if (items.length < 1) throw new Error("tcg_v0_2_predicate_tree_any_empty");
    return items.some((item) => evaluateNode(item, context, evaluateLeaf, depth + 1));
  }

  if (Object.hasOwn(value, "not")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_predicate_tree_not_shape_invalid");
    }
    return !evaluateNode(value.not, context, evaluateLeaf, depth + 1);
  }

  const predicate = typeof value.predicate === "string" ? value.predicate.trim() : "";
  if (!predicate) throw new Error("tcg_v0_2_predicate_tree_leaf_predicate_required");
  const result = evaluateLeaf({ ...value, predicate }, context);
  if (typeof result !== "boolean") {
    throw new Error("tcg_v0_2_predicate_tree_leaf_result_invalid");
  }
  return result;
}

/**
 * Shared v0.2 boolean predicate-tree owner.
 *
 * This module owns only deterministic boolean composition. It deliberately does
 * not know gameplay semantics for leaf predicates. Attack, Ability, Tactic,
 * listener and other rightful mechanic owners supply a leaf evaluator bound to
 * their authoritative context.
 *
 * Supported structure:
 * - { all: [...] }
 * - { any: [...] }
 * - { not: {...} }
 * - { predicate: "...", ...leaf fields }
 *
 * Unknown/malformed tree shapes fail closed. Leaf evaluators must return a
 * boolean and remain responsible for validating the exact fields/semantics of
 * each predicate they own.
 */
export function runtimeV02EvaluatePredicateTree<Context>(
  raw: unknown,
  context: Context,
  evaluateLeaf: RuntimeV02PredicateLeafEvaluator<Context>,
): boolean {
  if (typeof evaluateLeaf !== "function") {
    throw new Error("tcg_v0_2_predicate_tree_leaf_evaluator_required");
  }
  return evaluateNode(raw, context, evaluateLeaf, 0);
}

export const runtimeV02PredicateTreeMaxDepth = MAX_DEPTH;
