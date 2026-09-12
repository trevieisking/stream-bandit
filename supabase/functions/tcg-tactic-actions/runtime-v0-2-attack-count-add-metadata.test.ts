import { structuredRuntimeCountAddFormulaMetadata } from "../_shared/tcg-match-attack-formula-v0-2.ts";

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

Deno.test("non-counted formulas remain outside the count_add metadata owner", () => {
  assertEquals(structuredRuntimeCountAddFormulaMetadata(null, "fixed-attack"), null);
  assertEquals(structuredRuntimeCountAddFormulaMetadata({
    base: 60,
    terms: [{ kind: "conditional_add", amount: 20, when: { predicate: "hand_count_at_least", player: "opponent", count: 5 } }],
  }, "conditional-attack"), null);
});

Deno.test("Ashen Stampede normalizes the frozen public damaged-Creature count", () => {
  const result = structuredRuntimeCountAddFormulaMetadata({
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
  }, "ashen-stampede");

  assertJsonEquals(result, {
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
  });
});

Deno.test("Total Convergence normalizes the frozen distinct attached-Essence count and defaults its snapshot", () => {
  const allowed = ["Astral", "Ember", "Gale", "Grove", "Shade", "Stone", "Tide", "Volt"];
  const formula = {
    base: 120,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "distinct_attached_essence_elements",
        target: "$source_creature",
        allowed_elements: allowed,
      },
      amount_per: 20,
      max_count: 8,
    }],
  };
  const result = structuredRuntimeCountAddFormulaMetadata(formula, "total-convergence");

  assertJsonEquals(result, {
    snapshot: "legal_declaration",
    terms: [{
      kind: "count_add",
      counter: {
        kind: "distinct_attached_essence_elements",
        target: "$source_creature",
        allowed_elements: allowed,
      },
      amount_per: 20,
      max_count: 8,
    }],
  });

  allowed[0] = "Mutated";
  assertEquals(
    result?.terms[0].counter.kind === "distinct_attached_essence_elements"
      ? result.terms[0].counter.allowed_elements[0]
      : null,
    "Astral",
    "normalized metadata must own its allowed-element copy",
  );
});

Deno.test("count_add rejects unsupported formula snapshot timing", () => {
  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 100,
    snapshot: "after_damage",
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
  }, "bad-snapshot"), "tcg_v0_2_attack_count_add_snapshot_unsupported:bad-snapshot:after_damage");
});

Deno.test("count_add rejects unsupported counter kinds instead of inventing future behavior", () => {
  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 100,
    terms: [{
      kind: "count_add",
      counter: { kind: "opponent_rewards_claimed" },
      amount_per: 20,
      max_count: 6,
    }],
  }, "future-counter"), "tcg_v0_2_attack_count_add_counter_kind_unsupported:future-counter:0:opponent_rewards_claimed");
});

Deno.test("count_cards is restricted to the current frozen public field query", () => {
  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 100,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "count_cards",
        controller: "opponent",
        zone: "field",
        filters: { card_family: "Creature", damaged: true },
      },
      amount_per: 10,
      max_count: 4,
    }],
  }, "bad-controller"), "tcg_v0_2_attack_count_add_count_cards_controller_invalid:bad-controller:0");

  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 100,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "count_cards",
        controller: "self",
        zone: "field",
        filters: { card_family: "Creature", damaged: true, element: "Ember" },
      },
      amount_per: 10,
      max_count: 4,
    }],
  }, "future-filter"), "tcg_v0_2_attack_count_add_count_cards_filter_unsupported:future-filter:0:element");
});

Deno.test("distinct attached-Essence count rejects malformed or duplicate element authority", () => {
  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 120,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "distinct_attached_essence_elements",
        target: "$target",
        allowed_elements: ["Astral", "Ember"],
      },
      amount_per: 20,
      max_count: 8,
    }],
  }, "bad-target"), "tcg_v0_2_attack_count_add_distinct_target_invalid:bad-target:0");

  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 120,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "distinct_attached_essence_elements",
        target: "$source_creature",
        allowed_elements: ["Astral", "Astral"],
      },
      amount_per: 20,
      max_count: 8,
    }],
  }, "duplicate-elements"), "tcg_v0_2_attack_count_add_distinct_allowed_elements_duplicate:duplicate-elements:0");
});

Deno.test("count_add requires positive amount and cap values", () => {
  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 120,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "count_cards",
        controller: "self",
        zone: "field",
        filters: { card_family: "Creature", damaged: true },
      },
      amount_per: 0,
      max_count: 4,
    }],
  }, "zero-amount"), "tcg_v0_2_attack_count_add_amount_per_invalid:zero-amount:0");

  assertThrows(() => structuredRuntimeCountAddFormulaMetadata({
    base: 120,
    terms: [{
      kind: "count_add",
      counter: {
        kind: "count_cards",
        controller: "self",
        zone: "field",
        filters: { card_family: "Creature", damaged: true },
      },
      amount_per: 10,
      max_count: -1,
    }],
  }, "bad-cap"), "tcg_v0_2_attack_count_add_max_count_invalid:bad-cap:0");
});
