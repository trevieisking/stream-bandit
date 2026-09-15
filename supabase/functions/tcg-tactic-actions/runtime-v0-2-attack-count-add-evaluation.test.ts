import { evaluateStructuredRuntimeCountAddFormula } from "../_shared/tcg-match-attack-count-add-evaluator-v0-2.ts";
import type { RuntimeV02CountAddFormulaMetadata } from "../_shared/tcg-match-attack-formula-v0-2.ts";
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

const ASHEN_FORMULA: RuntimeV02CountAddFormulaMetadata = {
  snapshot: "legal_declaration",
  terms: [{
    kind: "count_add",
    counter: {
      kind: "count_cards",
      controller: "self",
      zone: "field",
      filters: { card_family: "Creature", damaged: true },
    },
    amount_per: 10,
    max_count: 4,
  }],
};

const ELEMENTS = ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"];
const FOUNDER_FORMULA: RuntimeV02CountAddFormulaMetadata = {
  snapshot: "legal_declaration",
  terms: [{
    kind: "count_add",
    counter: {
      kind: "distinct_attached_essence_elements",
      target: "$source_creature",
      allowed_elements: ELEMENTS,
    },
    amount_per: 20,
    max_count: 8,
  }],
};

Deno.test("Ashen Stampede counts canonical damaged friendly field Creatures and applies its cap", () => {
  const source = { damage: 10, essence: [] };
  const player = {
    vanguard: source,
    reserve: [{ damage: 10 }, { damage: 20 }, { damage: 30 }, { damage: 40 }],
  };
  assertJsonEquals(
    evaluateStructuredRuntimeCountAddFormula({}, source, player, 160, ASHEN_FORMULA, "ashen-stampede"),
    {
      snapshot: "legal_declaration",
      base_damage: 160,
      damage: 200,
      terms: [{
        kind: "count_add",
        counter_kind: "count_cards",
        observed_count: 5,
        applied_count: 4,
        amount_per: 10,
        max_count: 4,
        contribution: 40,
      }],
    },
  );
});

Deno.test("Ashen Stampede ignores undamaged field Creatures and empty Reserve slots", () => {
  const source = { damage: 0, essence: [] };
  const player = {
    vanguard: source,
    reserve: [{ damage: 10 }, null, { damage: 0 }, { damage: 20 }],
  };
  const result = evaluateStructuredRuntimeCountAddFormula({}, source, player, 160, ASHEN_FORMULA, "ashen-stampede");
  assertJsonEquals(result.terms[0], {
    kind: "count_add",
    counter_kind: "count_cards",
    observed_count: 2,
    applied_count: 2,
    amount_per: 10,
    max_count: 4,
    contribution: 20,
  });
  assertJsonEquals(result.damage, 180);
});

Deno.test("Total Convergence counts distinct current attached supplied elements through the shared server query", () => {
  const state = stateWithEssences({
    "essence-astral-a": [{ element: "Astral", amount: 1 }],
    "essence-astral-b": [{ element: "Astral", amount: 1 }],
    "essence-dual": [{ element: "Ember", amount: 1 }, { element: "Gale", amount: 1 }],
    "essence-fairy": [{ element: "Fairy", amount: 1 }],
  });
  const source = {
    damage: 0,
    essence: [
      attached("essence-astral-a"),
      attached("essence-astral-b", { attachment_state: { kind: "borrowed" } }),
      attached("essence-dual", { attachment_state: { kind: "temporary" } }),
      attached("essence-fairy"),
    ],
  };
  const player = { vanguard: source, reserve: [null, null, null, null] };
  assertJsonEquals(
    evaluateStructuredRuntimeCountAddFormula(state, source, player, 120, FOUNDER_FORMULA, "total-convergence"),
    {
      snapshot: "legal_declaration",
      base_damage: 120,
      damage: 180,
      terms: [{
        kind: "count_add",
        counter_kind: "distinct_attached_essence_elements",
        observed_count: 3,
        applied_count: 3,
        amount_per: 20,
        max_count: 8,
        contribution: 60,
      }],
    },
  );
});

Deno.test("Total Convergence reaches the frozen eight-element maximum of 280", () => {
  const definitions: Record<string, unknown> = {};
  const attachments: Record<string, unknown>[] = [];
  for (const element of ELEMENTS) {
    const cardId = `essence-${element.toLowerCase()}`;
    definitions[cardId] = [{ element, amount: 1 }];
    attachments.push(attached(cardId));
  }
  const state = stateWithEssences(definitions);
  const source = { damage: 0, essence: attachments };
  const player = { vanguard: source, reserve: [null, null, null, null] };
  const result = evaluateStructuredRuntimeCountAddFormula(state, source, player, 120, FOUNDER_FORMULA, "total-convergence");
  assertJsonEquals(result.damage, 280);
  assertJsonEquals(result.terms[0].observed_count, 8);
  assertJsonEquals(result.terms[0].applied_count, 8);
});

Deno.test("count_add evaluation fails closed on malformed canonical player state", () => {
  assertThrows(
    () => evaluateStructuredRuntimeCountAddFormula({}, { damage: 0, essence: [] }, {}, 160, ASHEN_FORMULA, "ashen-stampede"),
    "tcg_v0_2_attack_count_add_reserve_state_invalid:ashen-stampede",
  );
  assertThrows(
    () => evaluateStructuredRuntimeCountAddFormula(
      {},
      { damage: 0, essence: [] },
      { vanguard: { damage: "10" }, reserve: [null, null, null, null] },
      160,
      ASHEN_FORMULA,
      "ashen-stampede",
    ),
    "tcg_v0_2_attack_count_add_field_creature_damage_invalid:ashen-stampede:0",
  );
});

Deno.test("count_add distinct-Essence evaluation keeps its own fail-closed namespace", () => {
  const state = stateWithEssences({ "essence-bad": null });
  const source = { damage: 0, essence: [attached("essence-bad")] };
  const player = { vanguard: source, reserve: [null, null, null, null] };
  assertThrows(
    () => evaluateStructuredRuntimeCountAddFormula(state, source, player, 120, FOUNDER_FORMULA, "total-convergence"),
    "tcg_v0_2_attack_count_add_essence_provides_required:essence-bad",
  );
});
