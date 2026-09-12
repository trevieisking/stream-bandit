import {
  evaluateStructuredRuntimeConditionalAddFormula,
  type RuntimeV02ConditionalAddEvaluationContext,
} from "../_shared/tcg-match-attack-conditional-add-evaluator-v0-2.ts";
import type {
  RuntimeV02ConditionalAddFormulaMetadata,
  RuntimeV02ConditionalAddWhen,
} from "../_shared/tcg-match-attack-formula-v0-2.ts";

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

function context(
  overrides: Partial<RuntimeV02ConditionalAddEvaluationContext> = {},
): RuntimeV02ConditionalAddEvaluationContext {
  return {
    source_conditions: [],
    target_conditions: [],
    source_became_vanguard_this_turn: false,
    self_reserve_count: 0,
    opponent_hand_count: 0,
    source_has_relic: false,
    current_turn_events: [],
    previous_opponent_turn_events: [],
    source_attached_essence_kinds: [],
    ...overrides,
  };
}

function formula(
  when: RuntimeV02ConditionalAddWhen,
  amount = 20,
): RuntimeV02ConditionalAddFormulaMetadata {
  return {
    snapshot: "legal_declaration",
    terms: [{ kind: "conditional_add", amount, when }],
  };
}

Deno.test("conditional_add evaluates every frozen direct state predicate", () => {
  const cases: Array<{
    id: string;
    when: RuntimeV02ConditionalAddWhen;
    ctx: Partial<RuntimeV02ConditionalAddEvaluationContext>;
    amount?: number;
  }> = [
    {
      id: "burrow-burst",
      when: { predicate: "source_has_condition", condition: "Scorched" },
      ctx: { source_conditions: ["Scorched"] },
    },
    {
      id: "cinder-spiral",
      when: { predicate: "target_has_condition", condition: "Scorched" },
      ctx: { target_conditions: ["Scorched"] },
      amount: 30,
    },
    {
      id: "fungal-burst",
      when: { predicate: "target_has_condition", condition: "Venomed" },
      ctx: { target_conditions: ["Venomed"] },
    },
    {
      id: "crowned-nightmare",
      when: { predicate: "target_has_condition", condition: "Mindbound" },
      ctx: { target_conditions: ["Mindbound"] },
      amount: 30,
    },
    {
      id: "thought-rend",
      when: { predicate: "target_has_any_condition" },
      ctx: { target_conditions: ["Dazed"] },
    },
    {
      id: "tailwind-strike",
      when: { predicate: "source_became_vanguard_this_turn" },
      ctx: { source_became_vanguard_this_turn: true },
    },
    {
      id: "thorn-rush",
      when: { predicate: "reserve_count_at_least", controller: "self", count: 3 },
      ctx: { self_reserve_count: 3 },
    },
    {
      id: "hidden-step",
      when: { predicate: "hand_count_at_least", player: "opponent", count: 5 },
      ctx: { opponent_hand_count: 5 },
    },
    {
      id: "wall-break",
      when: { predicate: "source_has_relic" },
      ctx: { source_has_relic: true },
    },
    {
      id: "temporary-gridbreaker",
      when: { predicate: "event_attack_source_has_attached_essence_kind", kind: "temporary" },
      ctx: { source_attached_essence_kinds: ["temporary"] },
    },
    {
      id: "borrowed-gridbreaker",
      when: { predicate: "event_attack_source_has_attached_essence_kind", kind: "borrowed" },
      ctx: { source_attached_essence_kinds: ["borrowed"] },
    },
  ];

  for (const item of cases) {
    const amount = item.amount ?? 20;
    const result = evaluateStructuredRuntimeConditionalAddFormula(
      60,
      formula(item.when, amount),
      context(item.ctx),
      item.id,
    );
    assertEquals(result.damage, 60 + amount, `${item.id} damage`);
    assertJsonEquals(result.terms[0], {
      kind: "conditional_add",
      amount,
      matched: true,
      matched_predicate_count: 1,
      contribution: amount,
    }, `${item.id} term`);
  }
});

Deno.test("conditional_add direct state predicates contribute zero when their threshold is not met", () => {
  const cases: Array<[string, RuntimeV02ConditionalAddWhen, Partial<RuntimeV02ConditionalAddEvaluationContext>]> = [
    ["source-condition", { predicate: "source_has_condition", condition: "Scorched" }, { source_conditions: ["Venomed"] }],
    ["target-condition", { predicate: "target_has_condition", condition: "Mindbound" }, { target_conditions: ["Dazed"] }],
    ["target-any", { predicate: "target_has_any_condition" }, { target_conditions: [] }],
    ["vanguard-turn", { predicate: "source_became_vanguard_this_turn" }, { source_became_vanguard_this_turn: false }],
    ["reserve", { predicate: "reserve_count_at_least", controller: "self", count: 3 }, { self_reserve_count: 2 }],
    ["hand", { predicate: "hand_count_at_least", player: "opponent", count: 5 }, { opponent_hand_count: 4 }],
    ["relic", { predicate: "source_has_relic" }, { source_has_relic: false }],
    ["attachment-kind", { predicate: "event_attack_source_has_attached_essence_kind", kind: "borrowed" }, { source_attached_essence_kinds: ["temporary"] }],
  ];

  for (const [id, when, patch] of cases) {
    const result = evaluateStructuredRuntimeConditionalAddFormula(80, formula(when), context(patch), id);
    assertEquals(result.damage, 80, `${id} damage`);
    assertEquals(result.terms[0].matched, false, `${id} matched`);
    assertEquals(result.terms[0].contribution, 0, `${id} contribution`);
  }
});

Deno.test("conditional_add evaluates exact current-turn event predicates and filters", () => {
  const cases: Array<{
    id: string;
    when: RuntimeV02ConditionalAddWhen;
    events: RuntimeV02ConditionalAddEvaluationContext["current_turn_events"];
  }> = [
    {
      id: "reward-arc",
      when: { predicate: "event_occurred", event: "reward_inspected", controller: "self", window: "current_turn", min_count: 1 },
      events: [{ event: "reward_inspected", controller: "self" }],
    },
    {
      id: "predicted-hit-deck-top",
      when: { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck_top" } },
      events: [{ event: "hidden_information_viewed", controller: "self", zone: "deck_top" }],
    },
    {
      id: "predicted-hit-deck",
      when: { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck" } },
      events: [{ event: "hidden_information_viewed", controller: "self", zone: "deck" }],
    },
    {
      id: "deep-current",
      when: { predicate: "event_occurred", event: "essence_moved", controller: "self", window: "current_turn", min_count: 1, filters: { element: "Tide" } },
      events: [{ event: "essence_moved", controller: "self", element: "Tide" }],
    },
    {
      id: "relay-strike",
      when: { predicate: "event_occurred", event: "device_resolved", controller: "self", window: "current_turn", min_count: 1 },
      events: [{ event: "device_resolved", controller: "self" }],
    },
  ];

  for (const item of cases) {
    const result = evaluateStructuredRuntimeConditionalAddFormula(
      70,
      formula(item.when),
      context({ current_turn_events: item.events }),
      item.id,
    );
    assertEquals(result.damage, 90, `${item.id} damage`);
    assertEquals(result.terms[0].matched, true, `${item.id} matched`);
  }
});

Deno.test("conditional_add keeps previous-opponent prevention isolated from current-turn events", () => {
  const prevention: RuntimeV02ConditionalAddWhen = {
    predicate: "event_occurred",
    event: "damage_prevented",
    window: "previous_opponent_turn",
    min_count: 1,
    filters: { target: "source_creature", prevention_kind_any: ["ability", "relic", "shield"] },
  };
  const signal = { event: "damage_prevented" as const, target: "source_creature" as const, prevention_kind: "shield" as const };
  assertEquals(evaluateStructuredRuntimeConditionalAddFormula(80, formula(prevention), context({ previous_opponent_turn_events: [signal] }), "previous-opponent").damage, 100);
  assertEquals(evaluateStructuredRuntimeConditionalAddFormula(80, formula(prevention), context({ current_turn_events: [signal] }), "current-only").damage, 80);
});

Deno.test("conditional_add event predicates reject nonmatching event details", () => {
  const prevention: RuntimeV02ConditionalAddWhen = {
    predicate: "event_occurred",
    event: "damage_prevented",
    window: "current_turn",
    min_count: 1,
    filters: { target: "source_creature", prevention_kind_any: ["ability", "relic", "shield"] },
  };
  const tideMove: RuntimeV02ConditionalAddWhen = {
    predicate: "event_occurred",
    event: "essence_moved",
    controller: "self",
    window: "current_turn",
    min_count: 1,
    filters: { element: "Tide" },
  };

  assertEquals(
    evaluateStructuredRuntimeConditionalAddFormula(
      80,
      formula(prevention),
      context({ current_turn_events: [{ event: "device_resolved", controller: "self" }] }),
      "wrong-event",
    ).damage,
    80,
  );
  assertEquals(
    evaluateStructuredRuntimeConditionalAddFormula(
      80,
      formula(tideMove),
      context({ current_turn_events: [{ event: "essence_moved", controller: "self", element: "Volt" }] }),
      "wrong-element",
    ).damage,
    80,
  );
});

Deno.test("conditional_add any composition contributes once even when both frozen branches match", () => {
  const hiddenAny: RuntimeV02ConditionalAddWhen = {
    any: [
      { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck_top" } },
      { predicate: "event_occurred", event: "hidden_information_viewed", controller: "self", window: "current_turn", min_count: 1, filters: { zone: "deck" } },
    ],
  };
  const result = evaluateStructuredRuntimeConditionalAddFormula(
    60,
    formula(hiddenAny),
    context({
      current_turn_events: [
        { event: "hidden_information_viewed", controller: "self", zone: "deck_top" },
        { event: "hidden_information_viewed", controller: "self", zone: "deck" },
      ],
    }),
    "predicted-hit",
  );
  assertEquals(result.damage, 80);
  assertEquals(result.terms[0].matched_predicate_count, 2);
  assertEquals(result.terms[0].contribution, 20);
});

Deno.test("conditional_add multiple terms stack once each and preserve audit output", () => {
  const multi: RuntimeV02ConditionalAddFormulaMetadata = {
    snapshot: "legal_declaration",
    terms: [
      { kind: "conditional_add", amount: 20, when: { predicate: "source_has_relic" } },
      { kind: "conditional_add", amount: 30, when: { predicate: "target_has_condition", condition: "Mindbound" } },
      { kind: "conditional_add", amount: 20, when: { predicate: "reserve_count_at_least", controller: "self", count: 3 } },
    ],
  };
  const result = evaluateStructuredRuntimeConditionalAddFormula(
    100,
    multi,
    context({ source_has_relic: true, target_conditions: ["Mindbound"], self_reserve_count: 2 }),
    "multi",
  );
  assertEquals(result.damage, 150);
  assertJsonEquals(result.terms.map((term) => term.contribution), [20, 30, 0]);
});

Deno.test("conditional_add evaluation fails closed on malformed declaration context", () => {
  assertThrows(
    () => evaluateStructuredRuntimeConditionalAddFormula(
      60,
      formula({ predicate: "source_has_relic" }),
      context({ self_reserve_count: -1 }),
      "bad-reserve",
    ),
    "tcg_v0_2_attack_conditional_add_context_reserve_count_invalid:bad-reserve",
  );
  assertThrows(
    () => evaluateStructuredRuntimeConditionalAddFormula(
      60,
      formula({ predicate: "source_has_relic" }),
      context({ source_attached_essence_kinds: ["permanent" as "temporary"] }),
      "bad-attachment",
    ),
    "tcg_v0_2_attack_conditional_add_context_attachment_kind_invalid:bad-attachment:0:permanent",
  );
  assertThrows(
    () => evaluateStructuredRuntimeConditionalAddFormula(
      60,
      formula({ predicate: "source_has_relic" }),
      context({ current_turn_events: [{ event: "essence_moved", controller: "self", element: "" }] }),
      "bad-event",
    ),
    "tcg_v0_2_attack_conditional_add_context_event_invalid:bad-event:0:element",
  );
  assertThrows(
    () => evaluateStructuredRuntimeConditionalAddFormula(
      -10,
      formula({ predicate: "source_has_relic" }),
      context(),
      "bad-base",
    ),
    "tcg_v0_2_attack_conditional_add_base_damage_invalid:bad-base",
  );
});
