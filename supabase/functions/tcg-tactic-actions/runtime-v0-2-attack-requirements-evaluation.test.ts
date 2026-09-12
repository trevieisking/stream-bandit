import {
  evaluateStructuredRuntimeAttackRequirements,
  structuredRuntimeAttackMetadata,
} from "../_shared/tcg-match-attack-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

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

const REQUIREMENT = {
  predicate: "attached_essence_distinct_element_count_at_least",
  target: "$source_creature",
  count: 3,
  allowed_elements: ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"],
};

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
    element: "Prismatic",
    creature: null,
    essence: { subtype: "Basic", provides },
    tactic: null,
  };
}

function founderDefinition() {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "prismatic-founder",
    name: "Prismatic Founder",
    card_family: "Creature",
    prestige: { starbound: { enabled: false } },
    creature: {
      attacks: [{
        id: "total-convergence",
        name: "Total Convergence",
        cost: [{ element: "Any", amount: 3 }],
        base_damage: null,
        damage_formula: { base: 120, terms: [] },
        requirements: [REQUIREMENT],
      }],
    },
  };
}

function stateWithEssences(definitions: Record<string, unknown>) {
  const cardIndex: Record<string, Record<string, unknown>> = {
    "prismatic-founder": cardEntry("prismatic-founder", founderDefinition()),
  };
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

function normalizedRequirements(state: Record<string, unknown>) {
  const metadata = structuredRuntimeAttackMetadata(state, "prismatic-founder", 1);
  if (!metadata) throw new Error("structured attack metadata required");
  return metadata.requirements;
}

Deno.test("three distinct structured attached Essence elements satisfy Total Convergence", () => {
  const state = stateWithEssences({
    "essence-astral": [{ element: "Astral", amount: 1 }],
    "essence-ember": [{ element: "Ember", amount: 1 }],
    "essence-gale": [{ element: "Gale", amount: 1 }],
  });
  const result = evaluateStructuredRuntimeAttackRequirements(
    state,
    { essence: [attached("essence-astral"), attached("essence-ember"), attached("essence-gale")] },
    normalizedRequirements(state),
  );
  assertJsonEquals(result, { ok: true });
});

Deno.test("duplicate attached Essence elements count once and report the server-computed actual count", () => {
  const state = stateWithEssences({
    "essence-astral-a": [{ element: "Astral", amount: 1 }],
    "essence-astral-b": [{ element: "Astral", amount: 1 }],
    "essence-ember": [{ element: "Ember", amount: 1 }],
  });
  const result = evaluateStructuredRuntimeAttackRequirements(
    state,
    { essence: [attached("essence-astral-a"), attached("essence-astral-b"), attached("essence-ember")] },
    normalizedRequirements(state),
  );
  assertJsonEquals(result, {
    ok: false,
    requirement_index: 0,
    predicate: "attached_essence_distinct_element_count_at_least",
    required: 3,
    actual: 2,
    allowed_elements: REQUIREMENT.allowed_elements,
  });
});

Deno.test("a structured multi-supply Essence contributes each simultaneously supplied allowed element once", () => {
  const state = stateWithEssences({
    "essence-dual": [{ element: "Astral", amount: 1 }, { element: "Ember", amount: 1 }],
    "essence-gale": [{ element: "Gale", amount: 1 }],
  });
  const result = evaluateStructuredRuntimeAttackRequirements(
    state,
    { essence: [attached("essence-dual"), attached("essence-gale")] },
    normalizedRequirements(state),
  );
  assertJsonEquals(result, { ok: true });
});

Deno.test("temporary and borrowed Essence instances count while they remain legally attached", () => {
  const state = stateWithEssences({
    "essence-astral": [{ element: "Astral", amount: 1 }],
    "essence-ember": [{ element: "Ember", amount: 1 }],
    "essence-gale": [{ element: "Gale", amount: 1 }],
  });
  const result = evaluateStructuredRuntimeAttackRequirements(
    state,
    {
      essence: [
        attached("essence-astral", { attachment_state: { kind: "temporary" } }),
        attached("essence-ember", { attachment_state: { kind: "borrowed" } }),
        attached("essence-gale"),
      ],
    },
    normalizedRequirements(state),
  );
  assertJsonEquals(result, { ok: true });
});

Deno.test("structured supplies outside the requirement allowed-element set are ignored", () => {
  const state = stateWithEssences({
    "essence-astral": [{ element: "Astral", amount: 1 }],
    "essence-ember": [{ element: "Ember", amount: 1 }],
    "essence-fairy": [{ element: "Fairy", amount: 1 }],
  });
  const result = evaluateStructuredRuntimeAttackRequirements(
    state,
    { essence: [attached("essence-astral"), attached("essence-ember"), attached("essence-fairy")] },
    normalizedRequirements(state),
  );
  assertEquals(result.ok, false);
  if (result.ok) throw new Error("expected failed requirement");
  assertEquals(result.actual, 2);
});

Deno.test("malformed structured Essence provides metadata fails closed", () => {
  const state = stateWithEssences({
    "essence-bad": null,
  });
  assertThrows(
    () => evaluateStructuredRuntimeAttackRequirements(
      state,
      { essence: [attached("essence-bad")] },
      normalizedRequirements(state),
    ),
    "tcg_v0_2_attack_requirement_essence_provides_required:essence-bad",
  );
});

Deno.test("a non-Essence attachment in the Essence zone fails closed", () => {
  const state = stateWithEssences({
    "essence-astral": [{ element: "Astral", amount: 1 }],
  });
  const cardIndex = state.card_index as Record<string, Record<string, unknown>>;
  cardIndex["not-essence"] = cardEntry("not-essence", {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "not-essence",
    name: "Not Essence",
    card_family: "Creature",
    creature: { attacks: [] },
    essence: null,
    tactic: null,
  });
  assertThrows(
    () => evaluateStructuredRuntimeAttackRequirements(
      state,
      { essence: [attached("not-essence")] },
      normalizedRequirements(state),
    ),
    "tcg_v0_2_attack_requirement_attachment_not_essence:not-essence",
  );
});

Deno.test("nonempty structured requirements require server-owned attached Essence state", () => {
  const state = stateWithEssences({});
  assertThrows(
    () => evaluateStructuredRuntimeAttackRequirements(state, {}, normalizedRequirements(state)),
    "tcg_v0_2_attack_requirement_source_essence_required",
  );
});
