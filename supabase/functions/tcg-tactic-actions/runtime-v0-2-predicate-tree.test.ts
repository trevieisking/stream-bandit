import {
  runtimeV02EvaluatePredicateTree,
  runtimeV02PredicateTreeMaxDepth,
  type RuntimeV02PredicateLeaf,
} from "../_shared/tcg-match-predicate-tree-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  let error: unknown = null;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  assert(error instanceof Error, `expected error ${expected}`);
  assertEquals(error.message, expected, "unexpected error message");
}

Deno.test("predicate tree delegates leaf semantics without owning gameplay rules", () => {
  const seen: RuntimeV02PredicateLeaf[] = [];
  const context = { allowed: new Set(["alpha", "gamma"]) };
  const result = runtimeV02EvaluatePredicateTree(
    { predicate: "alpha", threshold: 2 },
    context,
    (leaf, ctx) => {
      seen.push(leaf);
      return ctx.allowed.has(leaf.predicate);
    },
  );
  assertEquals(result, true, "leaf result");
  assertEquals(seen.length, 1, "one leaf delegated");
  assertEquals(seen[0].predicate, "alpha", "leaf predicate preserved");
  assertEquals(Number(seen[0].threshold), 2, "leaf fields preserved");
});

Deno.test("predicate tree composes nested all any and not deterministically", () => {
  const calls: string[] = [];
  const tree = {
    all: [
      { predicate: "yes" },
      {
        any: [
          { predicate: "no" },
          { not: { predicate: "no" } },
        ],
      },
    ],
  };
  const result = runtimeV02EvaluatePredicateTree(tree, null, (leaf) => {
    calls.push(leaf.predicate);
    return leaf.predicate === "yes";
  });
  assertEquals(result, true, "nested tree result");
  assertEquals(calls.join(","), "yes,no,no", "deterministic traversal order");
});

Deno.test("all and any retain short-circuit behavior", () => {
  const allCalls: string[] = [];
  const allResult = runtimeV02EvaluatePredicateTree(
    { all: [{ predicate: "false" }, { predicate: "should-not-run" }] },
    null,
    (leaf) => {
      allCalls.push(leaf.predicate);
      return false;
    },
  );
  assertEquals(allResult, false, "all result");
  assertEquals(allCalls.join(","), "false", "all short circuits");

  const anyCalls: string[] = [];
  const anyResult = runtimeV02EvaluatePredicateTree(
    { any: [{ predicate: "true" }, { predicate: "should-not-run" }] },
    null,
    (leaf) => {
      anyCalls.push(leaf.predicate);
      return true;
    },
  );
  assertEquals(anyResult, true, "any result");
  assertEquals(anyCalls.join(","), "true", "any short circuits");
});

Deno.test("empty all is vacuously true while empty any fails closed", () => {
  assertEquals(
    runtimeV02EvaluatePredicateTree({ all: [] }, null, () => false),
    true,
    "empty all",
  );
  assertThrows(
    () => runtimeV02EvaluatePredicateTree({ any: [] }, null, () => false),
    "tcg_v0_2_predicate_tree_any_empty",
  );
});

Deno.test("predicate tree rejects mixed structural nodes and missing predicates", () => {
  assertThrows(
    () => runtimeV02EvaluatePredicateTree(
      { all: [{ predicate: "x" }], note: "mixed" },
      null,
      () => true,
    ),
    "tcg_v0_2_predicate_tree_all_shape_invalid",
  );
  assertThrows(
    () => runtimeV02EvaluatePredicateTree(
      { not: { predicate: "x" }, predicate: "y" },
      null,
      () => true,
    ),
    "tcg_v0_2_predicate_tree_not_shape_invalid",
  );
  assertThrows(
    () => runtimeV02EvaluatePredicateTree({}, null, () => true),
    "tcg_v0_2_predicate_tree_leaf_predicate_required",
  );
});

Deno.test("predicate tree enforces a bounded nesting depth", () => {
  let tree: unknown = { predicate: "leaf" };
  for (let index = 0; index <= runtimeV02PredicateTreeMaxDepth; index += 1) {
    tree = { not: tree };
  }
  assertThrows(
    () => runtimeV02EvaluatePredicateTree(tree, null, () => true),
    "tcg_v0_2_predicate_tree_depth_exceeded",
  );
});
