import { structuredRuntimeConditionalAddFormulaMetadata } from "../_shared/tcg-match-attack-formula-v0-2.ts";

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

function formula(when: unknown, amount = 20, snapshot?: string) {
  return {
    base: 60,
    ...(snapshot == null ? {} : { snapshot }),
    terms: [{ kind: "conditional_add", amount, when }],
  };
}

Deno.test("conditional_add metadata owner ignores formulas with no conditional_add term", () => {
  const result = structuredRuntimeConditionalAddFormulaMetadata({
    base: 120,
    terms: [{
      kind: "count_add",
      counter: { kind: "count_cards", controller: "self", zone: "field", filters: { card_family: "Creature", damaged: true } },
      amount_per: 10,
      max_count: 4,
    }],
  }, "count-only");
  assertEquals(result, null);
});

Deno.test("conditional_add metadata normalizes the exact frozen current-state predicates", () => {
  const cases = [
    { when: { predicate: "source_has_condition", condition: "Scorched" } },
    { when: { predicate: "target_has_condition", condition: "Scorched" } },
    { when: { predicate: "target_has_condition", condition: "Venomed" } },
    { when: { predicate: "target_has_condition", condition: "Mindbound" } },
    { when: { predicate: "target_has_any_condition" } },
    { when: { predicate: "source_became_vanguard_this_turn" } },
    { when: { predicate: "reserve_count_at_least", controller: "self", count: 3 } },
    { when: { predicate: "hand_count_at_least", player: "opponent", count: 5 } },
    { when: { predicate: "source_has_relic" } },
    { when: { predicate: "event_attack_source_has_attached_essence_kind", kind: "temporary" } },
    { when: { predicate: "event_attack_source_has_attached_essence_kind", kind: "borrowed" } },
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const result = structuredRuntimeConditionalAddFormulaMetadata(formula(cases[index].when), `state-${index}`);
    assertJsonEquals(result, {
      snapshot: "legal_declaration",
      terms: [{ kind: "conditional_add", amount: 20, when: cases[index].when }],
    });
  }
});

Deno.test("conditional_add metadata normalizes the exact frozen event predicates", () => {
  const cases = [
    { predicate: "event_occurred", event: "reward_inspected", controller: "self", window: "current_turn", min_count: 1 },
    { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck_top" } },
    { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck" } },
    {
      predicate: "event_occurred",
      event: "damage_prevented",
      window: "current_turn",
      min_count: 1,
      filters: { target: "source_creature", prevention_kind_any: ["ability", "relic", "shield"] },
    },
    { predicate: "event_occurred", event: "essence_moved", controller: "self", window: "current_turn", min_count: 1, filters: { element: "Tide" } },
    { predicate: "event_occurred", event: "device_resolved", controller: "self", window: "current_turn", min_count: 1 },
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const result = structuredRuntimeConditionalAddFormulaMetadata(formula(cases[index]), `event-${index}`);
    assertJsonEquals(result, {
      snapshot: "legal_declaration",
      terms: [{ kind: "conditional_add", amount: 20, when: cases[index] }],
    });
  }
});

Deno.test("conditional_add metadata normalizes the two frozen any-composition families", () => {
  const hiddenAny = {
    any: [
      { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck_top" } },
      { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck" } },
    ],
  };
  const attachmentAny = {
    any: [
      { predicate: "event_attack_source_has_attached_essence_kind", kind: "temporary" },
      { predicate: "event_attack_source_has_attached_essence_kind", kind: "borrowed" },
    ],
  };

  for (const [attackId, when] of [["predicted-hit", hiddenAny], ["gridbreaker", attachmentAny]] as const) {
    const result = structuredRuntimeConditionalAddFormulaMetadata(formula(when), attackId);
    assertJsonEquals(result, {
      snapshot: "legal_declaration",
      terms: [{ kind: "conditional_add", amount: 20, when }],
    });
  }
});

Deno.test("conditional_add metadata owns copies of nested event-filter arrays", () => {
  const preventionKinds = ["ability", "relic", "shield"];
  const raw = formula({
    predicate: "event_occurred",
    event: "damage_prevented",
    window: "current_turn",
    min_count: 1,
    filters: { target: "source_creature", prevention_kind_any: preventionKinds },
  });
  const result = structuredRuntimeConditionalAddFormulaMetadata(raw, "bastion-quake");
  preventionKinds[0] = "mutated";
  const when = result?.terms[0].when as { filters?: { prevention_kind_any?: string[] } };
  assertJsonEquals(when.filters?.prevention_kind_any, ["ability", "relic", "shield"]);
});

Deno.test("conditional_add metadata fails closed on future or malformed predicate shapes", () => {
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "source_has_shield_at_least", value: 1 }), "future"),
    "tcg_v0_2_attack_conditional_add_predicate:future:0:leaf_unsupported:source_has_shield_at_least",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ all: [{ predicate: "source_has_relic" }] }), "all-shape"),
    "tcg_v0_2_attack_conditional_add_composition_unsupported:all-shape:0",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "event_occurred", event: "attack_finished", controller: "self", window: "current_turn", min_count: 1 }), "future-event"),
    "event_unsupported:attack_finished",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "reserve_count_at_least", controller: "self", count: 4 }), "reserve-four"),
    "reserve-four:0:leaf_count_invalid",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "hand_count_at_least", player: "self", count: 5 }), "wrong-player"),
    "wrong-player:0:leaf_player_invalid",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "source_has_relic", future: true }), "extra-field"),
    "extra-field:0:leaf_field_unsupported:future",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "source_has_relic" }, 0), "zero-amount"),
    "tcg_v0_2_attack_conditional_add_amount_invalid:zero-amount:0",
  );
  assertThrows(
    () => structuredRuntimeConditionalAddFormulaMetadata(formula({ predicate: "source_has_relic" }, 20, "after_damage"), "wrong-snapshot"),
    "tcg_v0_2_attack_conditional_add_snapshot_unsupported:wrong-snapshot:after_damage",
  );
});
