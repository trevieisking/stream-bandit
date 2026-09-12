import {
  structuredRuntimeDistinctAttachedEssenceElements,
  structuredRuntimeEssenceProvidedElements,
} from "../_shared/tcg-match-essence-query-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertJsonEquals(actual: unknown, expected: unknown, message = "JSON values differ") {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}: expected ${right}, got ${left}`);
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

function cardEntry(cardId: string, definitionV02: Record<string, unknown>) {
  return {
    card_id: cardId,
    definition: { id: cardId },
    definition_v0_2: definitionV02,
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function essenceDefinition(cardId: string, provides: unknown) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: cardId,
    name: cardId,
    card_family: "Essence",
    essence: { subtype: "Basic", provides },
  };
}

function stateWithEssences(definitions: Record<string, unknown>) {
  const cardIndex: Record<string, unknown> = {};
  for (const [cardId, provides] of Object.entries(definitions)) {
    cardIndex[cardId] = cardEntry(cardId, essenceDefinition(cardId, provides));
  }
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: cardIndex,
  } as Record<string, unknown>;
}

function attached(cardId: string, extra: Record<string, unknown> = {}) {
  return { uid: `${cardId}-uid`, card_id: cardId, ...extra };
}

Deno.test("shared Essence query exposes structured simultaneous supplied elements", () => {
  const state = stateWithEssences({
    "essence-dual": [{ element: "Astral", amount: 1 }, { element: "Ember", amount: 1 }],
  });
  assertJsonEquals(
    structuredRuntimeEssenceProvidedElements(state, attached("essence-dual"), "tcg_v0_2_test"),
    ["Astral", "Ember"],
  );
});

Deno.test("shared distinct attached-Essence query deduplicates, filters and preserves allowed-element order", () => {
  const state = stateWithEssences({
    "essence-astral-a": [{ element: "Astral", amount: 1 }],
    "essence-astral-b": [{ element: "Astral", amount: 1 }],
    "essence-dual": [{ element: "Gale", amount: 1 }, { element: "Ember", amount: 1 }],
    "essence-fairy": [{ element: "Fairy", amount: 1 }],
  });
  const result = structuredRuntimeDistinctAttachedEssenceElements(
    state,
    {
      essence: [
        attached("essence-astral-a"),
        attached("essence-astral-b", { attachment_state: { kind: "borrowed" } }),
        attached("essence-dual", { attachment_state: { kind: "temporary" } }),
        attached("essence-fairy"),
      ],
    },
    ["Astral", "Ember", "Gale", "Grove"],
    "tcg_v0_2_test",
  );
  assertJsonEquals(result, ["Astral", "Ember", "Gale"]);
});

Deno.test("shared query preserves caller-owned fail-closed error namespace", () => {
  const state = stateWithEssences({ "essence-bad": null });
  assertThrows(
    () => structuredRuntimeDistinctAttachedEssenceElements(
      state,
      { essence: [attached("essence-bad")] },
      ["Astral"],
      "tcg_v0_2_attack_requirement",
    ),
    "tcg_v0_2_attack_requirement_essence_provides_required:essence-bad",
  );

  assertThrows(
    () => structuredRuntimeDistinctAttachedEssenceElements(
      state,
      {},
      ["Astral"],
      "tcg_v0_2_attack_count_add",
    ),
    "tcg_v0_2_attack_count_add_source_essence_required",
  );
});
