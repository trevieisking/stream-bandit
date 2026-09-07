import {
  evaluateRuntimeAttackCountAddFormula,
  resolveRuntimeAttackAuthority,
  type RuntimeAttackAuthority,
} from "../_shared/tcg-match-attack-authority-v0-2.ts";
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

function legacy() {
  return {
    name: "Legacy Attack",
    raw: "3 Any — Legacy Attack — 120",
    typed: {},
    any: 3,
    damage: 120,
    effect: "",
    starbound: false,
  };
}

function cardEntry(cardId: string, definitionV02: Record<string, unknown>) {
  return {
    card_id: cardId,
    definition: { id: cardId, attack_1: legacy().raw },
    definition_v0_2: definitionV02,
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function creatureDefinition(cardId: string, attack: Record<string, unknown>) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: cardId,
    name: cardId,
    card_family: "Creature",
    creature: { attacks: [attack] },
  };
}

function essenceDefinition(cardId: string, element: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: cardId,
    name: cardId,
    card_family: "Essence",
    essence: { subtype: "Basic", provides: [{ element, amount: 1 }] },
  };
}

function stateWithCreature(cardId: string, attack: Record<string, unknown>) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: cardEntry(cardId, creatureDefinition(cardId, attack)),
    },
  } as Record<string, unknown>;
}

function attached(cardId: string) {
  return { uid: `${cardId}-uid`, card_id: cardId };
}

Deno.test("legacy attack authority remains outside structured count_add evaluation", () => {
  const authority = resolveRuntimeAttackAuthority(
    { card_index: { legacy: { definition: { id: "legacy" } } } },
    "legacy",
    1,
    legacy(),
  );
  if (!authority) throw new Error("legacy authority required");
  assertEquals(evaluateRuntimeAttackCountAddFormula({}, {}, {}, authority), null);
});

Deno.test("structured fixed attacks remain outside count_add evaluation", () => {
  const state = stateWithCreature("fixed", {
    id: "fixed-hit",
    name: "Fixed Hit",
    cost: [{ element: "Ember", amount: 1 }],
    base_damage: 40,
    damage_formula: null,
  });
  const authority = resolveRuntimeAttackAuthority(state, "fixed", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  assertEquals(evaluateRuntimeAttackCountAddFormula(state, { damage: 0, essence: [] }, { vanguard: {}, reserve: [] }, authority), null);
});

Deno.test("authority bridge evaluates Ashen Stampede from its structured baseline and canonical player field", () => {
  const state = stateWithCreature("pyrohorn", {
    id: "ashen-stampede",
    name: "Ashen Stampede",
    cost: [{ element: "Ember", amount: 4 }],
    base_damage: null,
    damage_formula: {
      base: 160,
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
    },
  });
  const authority = resolveRuntimeAttackAuthority(state, "pyrohorn", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  const source = { damage: 10, essence: [] };
  const player = {
    vanguard: source,
    reserve: [{ damage: 10 }, { damage: 20 }, { damage: 0 }, null],
  };
  assertJsonEquals(
    evaluateRuntimeAttackCountAddFormula(state, source, player, authority),
    {
      snapshot: "legal_declaration",
      base_damage: 160,
      damage: 190,
      terms: [{
        kind: "count_add",
        counter_kind: "count_cards",
        observed_count: 3,
        applied_count: 3,
        amount_per: 10,
        max_count: 4,
        contribution: 30,
      }],
    },
  );
});

Deno.test("authority bridge evaluates Total Convergence from structured attached Essence state", () => {
  const elements = ["Astral", "Ember", "Gale"];
  const founderAttack = {
    id: "total-convergence",
    name: "Total Convergence",
    cost: [{ element: "Any", amount: 3 }],
    base_damage: null,
    damage_formula: {
      base: 120,
      terms: [{
        kind: "count_add",
        counter: {
          kind: "distinct_attached_essence_elements",
          target: "$source_creature",
          allowed_elements: ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"],
        },
        amount_per: 20,
        max_count: 8,
      }],
    },
  };
  const cardIndex: Record<string, unknown> = {
    founder: cardEntry("founder", creatureDefinition("founder", founderAttack)),
  };
  for (const element of elements) {
    const cardId = `essence-${element.toLowerCase()}`;
    cardIndex[cardId] = cardEntry(cardId, essenceDefinition(cardId, element));
  }
  const state = {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: cardIndex,
  } as Record<string, unknown>;
  const authority = resolveRuntimeAttackAuthority(state, "founder", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  const source = { damage: 0, essence: elements.map((element) => attached(`essence-${element.toLowerCase()}`)) };
  const player = { vanguard: source, reserve: [null, null, null, null] };
  const result = evaluateRuntimeAttackCountAddFormula(state, source, player, authority);
  assertEquals(result?.damage, 180);
  assertEquals(result?.terms[0].observed_count, 3);
});

Deno.test("authority bridge fails closed if count_add metadata is paired with a non-formula damage source", () => {
  const state = stateWithCreature("pyrohorn", {
    id: "ashen-stampede",
    name: "Ashen Stampede",
    cost: [{ element: "Ember", amount: 4 }],
    base_damage: null,
    damage_formula: {
      base: 160,
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
    },
  });
  const authority = resolveRuntimeAttackAuthority(state, "pyrohorn", 1, legacy());
  if (!authority) throw new Error("structured authority required");
  const invalid = { ...authority, damage_source: "base_damage" } as RuntimeAttackAuthority;
  assertThrows(
    () => evaluateRuntimeAttackCountAddFormula(
      state,
      { damage: 10, essence: [] },
      { vanguard: { damage: 10 }, reserve: [null, null, null, null] },
      invalid,
    ),
    "tcg_v0_2_attack_count_add_authority_damage_source_invalid:ashen-stampede:base_damage",
  );
});
