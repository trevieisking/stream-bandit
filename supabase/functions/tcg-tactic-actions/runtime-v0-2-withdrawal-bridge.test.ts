import { structuredRuntimeWithdrawalBaseCost } from "../_shared/tcg-match-withdrawal-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

function structuredEntry(cardId: string, definition: Record<string, unknown>) {
  return {
    card_id: cardId,
    definition: { id: cardId, recipe_type: "legacy" },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: definition.card_family || "Essence",
      ...definition,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function stateWith(entries: Record<string, Record<string, unknown>>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: entries,
  } as Record<string, unknown>;
}

function essence(cardId: string, continuous: Record<string, unknown>[]) {
  return structuredEntry(cardId, {
    card_family: "Essence",
    essence: { continuous },
  });
}

const breeze = essence("gale-breeze-essence", [{
  id: "breeze-withdrawal",
  kind: "withdrawal",
  target: "$attached_creature",
  when: null,
  amount: -1,
  minimum: 0,
  filters: { action_kind: "voluntary_withdrawal" },
}]);

const root = essence("grove-root-essence", [{
  id: "root-essence-withdrawal",
  kind: "withdrawal",
  target: "$attached_creature",
  mode: "delta",
  amount: -1,
  minimum: 0,
  when: null,
  filters: {},
}]);

const anchor = essence("stone-anchor-essence", [{
  id: "anchor-withdrawal",
  kind: "withdrawal",
  target: "$attached_creature",
  when: null,
  amount: 1,
  filters: {},
}]);

const granite = essence("stone-granite-essence", [{
  id: "granite-tax-immunity",
  kind: "withdrawal_increase_immunity",
  target: "$attached_creature",
  when: { predicate: "target_element_is", target: "$attached_creature", element: "Stone" },
  filters: { blocked_sources: ["opponent_card_effect", "opponent_condition"] },
}]);

const creatureEntry = structuredEntry("stone-test-creature", {
  card_family: "Creature",
  element: "Stone",
  creature: { withdrawal: 2 },
});

Deno.test("legacy-only match keeps withdrawal resolver on legacy fallback", () => {
  const state = {
    card_index: {
      "gale-breeze-essence": { card_id: "gale-breeze-essence", definition: { id: "gale-breeze-essence" } },
    },
  } as Record<string, unknown>;
  assertEquals(
    structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "e1", card_id: "gale-breeze-essence" }] }, 2, "Gale", false),
    null,
  );
});

Deno.test("structured Breeze and Root reductions preserve minimum zero", () => {
  const state = stateWith({
    "stone-test-creature": creatureEntry,
    "gale-breeze-essence": breeze,
    "grove-root-essence": root,
  });
  assertEquals(structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "b", card_id: "gale-breeze-essence" }] }, 2, "Gale", false), 1);
  assertEquals(structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "r", card_id: "grove-root-essence" }] }, 2, "Grove", false), 1);
  assertEquals(structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "b", card_id: "gale-breeze-essence" }] }, 0, "Gale", false), 0);
});

Deno.test("structured Anchor increases withdrawal and attachment order stays deterministic", () => {
  const state = stateWith({
    "stone-test-creature": creatureEntry,
    "gale-breeze-essence": breeze,
    "stone-anchor-essence": anchor,
  });
  assertEquals(structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "a", card_id: "stone-anchor-essence" }] }, 2, "Stone", false), 3);
  assertEquals(
    structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "b", card_id: "gale-breeze-essence" }, { uid: "a", card_id: "stone-anchor-essence" }] }, 2, "Stone", false),
    2,
  );
  assertEquals(
    structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "a", card_id: "stone-anchor-essence" }, { uid: "b", card_id: "gale-breeze-essence" }] }, 0, "Stone", false),
    0,
  );
});

Deno.test("structured Crushed increase is blocked by Granite only on a Stone target", () => {
  const state = stateWith({
    "stone-test-creature": creatureEntry,
    "stone-granite-essence": granite,
  });
  assertEquals(structuredRuntimeWithdrawalBaseCost(state, { essence: [] }, 2, "Stone", true), 3);
  assertEquals(
    structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "g", card_id: "stone-granite-essence" }] }, 2, "Stone", true),
    2,
  );
  assertEquals(
    structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "g", card_id: "stone-granite-essence" }] }, 2, "Gale", true),
    3,
    "Granite must not suppress Crushed for a non-Stone creature",
  );
});

Deno.test("marked mixed structured and legacy card indexes fail closed instead of mixing engines", () => {
  const state = stateWith({
    "stone-test-creature": creatureEntry,
    "gale-breeze-essence": {
      card_id: "gale-breeze-essence",
      definition: { id: "gale-breeze-essence" },
    },
  });
  assertThrows(
    () => structuredRuntimeWithdrawalBaseCost(state, { essence: [{ uid: "b", card_id: "gale-breeze-essence" }] }, 2, "Stone", false),
    "tcg_v0_2_snapshot_definition_missing:gale-breeze-essence",
  );
});
