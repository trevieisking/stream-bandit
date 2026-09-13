import {
  runtimeV02BeginCardCostChoice,
  runtimeV02PendingCardCostChoiceView,
  runtimeV02ResumeCardCostChoice,
} from "./tcg-match-card-cost-choice-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
function throws(fn: () => unknown, contains: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(contains)) throw error;
    return;
  }
  throw new Error(`expected ${contains}`);
}
const binding = {
  controller_seat: 1 as const,
  action_kind: "ability" as const,
  source_action_id: "ability:test",
  source_card_uid: "source",
  source_card_id: "source-card",
  source_creature_uid: "source",
};
function state() {
  return {
    turn_seq: 4,
    players: {
      "1": { hand: [{ uid: "h1", card_id: "one" }, { uid: "h2", card_id: "two" }, { uid: "h3", card_id: "three" }] },
      "2": { hand: [{ uid: "x1", card_id: "hidden" }] },
    },
  } as any;
}

Deno.test("card-cost choice returns deterministic damage cost immediately", () => {
  const result = runtimeV02BeginCardCostChoice(state(), binding, [
    { kind: "damage", target: "$source_creature", amount: 20 },
  ], "c0");
  if (result.status !== "ready") throw new Error("expected ready");
  equal(result.costs, [{ kind: "damage", target: "$source_creature", amount: 20, source_path: "cost/0", cost_index: 0 }]);
  equal(result.variables, {});
});

Deno.test("optional hand-discard uses private composition then exact hand-card selection", () => {
  const s = state();
  const costs = [{ kind: "optional", as: "toll_paid", costs: [{ kind: "hand_discard", player: "self", count: 1 }] }];
  const first = runtimeV02BeginCardCostChoice(s, binding, costs, "c1");
  if (first.status !== "player_choice_required") throw new Error("expected composition choice");
  equal(runtimeV02PendingCardCostChoiceView(first.pending_choice, 2), { id: "c1", seat: 1, kind: "card_cost_composition", waiting: true });
  equal(runtimeV02PendingCardCostChoiceView(first.pending_choice, 1)?.options, [
    { id: "skip", label: "Do not pay optional cost" },
    { id: "pay", label: "Pay optional cost" },
  ]);
  const second = runtimeV02ResumeCardCostChoice(s, binding, costs, first.pending_choice, "c1", ["pay"], "c2");
  if (second.status !== "player_choice_required") throw new Error("expected hand choice");
  equal([second.pending_choice.kind, second.pending_choice.min, second.pending_choice.max], ["card_cost_hand_selection", 1, 1]);
  const done = runtimeV02ResumeCardCostChoice(s, binding, costs, second.pending_choice, "c2", ["hand:h2"], "c3");
  if (done.status !== "ready") throw new Error("expected ready");
  equal(done.variables, { toll_paid: true });
  equal(done.costs[0], { kind: "hand_discard", player: "self", count: 1, source_path: "cost/0/optional/0", cost_index: 0, card_uids: ["h2"] });
  equal(s.players[1].hand.map((card: any) => card.uid), ["h1", "h2", "h3"], "choice layer must not mutate hand");
});

Deno.test("Thanavor-shaped discard-or-damage choice stays generic", () => {
  const s = state();
  const costs = [{ kind: "choice", options: [
    [{ kind: "hand_discard", player: "self", count: 2 }],
    [{ kind: "damage", target: "$source_creature", amount: 40 }],
  ] }];
  const first = runtimeV02BeginCardCostChoice(s, binding, costs, "t1");
  if (first.status !== "player_choice_required") throw new Error("expected modal choice");
  const discardBranch = runtimeV02ResumeCardCostChoice(s, binding, costs, first.pending_choice, "t1", ["option:0"], "t2");
  if (discardBranch.status !== "player_choice_required") throw new Error("expected hand selection");
  equal([discardBranch.pending_choice.min, discardBranch.pending_choice.max], [2, 2]);
  const done = runtimeV02ResumeCardCostChoice(s, binding, costs, discardBranch.pending_choice, "t2", ["hand:h1", "hand:h3"], "t3");
  if (done.status !== "ready") throw new Error("expected ready");
  equal(done.costs[0], { kind: "hand_discard", player: "self", count: 2, source_path: "cost/0/choice:0/0", cost_index: 0, card_uids: ["h1", "h3"] });

  const firstDamage = runtimeV02BeginCardCostChoice(s, binding, costs, "d1");
  if (firstDamage.status !== "player_choice_required") throw new Error("expected modal choice");
  const damageBranch = runtimeV02ResumeCardCostChoice(s, binding, costs, firstDamage.pending_choice, "d1", ["option:1"], "d2");
  if (damageBranch.status !== "ready") throw new Error("expected damage ready");
  equal(damageBranch.costs[0], { kind: "damage", target: "$source_creature", amount: 40, source_path: "cost/0/choice:1/0", cost_index: 0 });
});

Deno.test("multiple discard leaves cannot select the same hidden hand instance twice", () => {
  const s = state();
  const costs = [
    { kind: "hand_discard", player: "self", count: 1 },
    { kind: "hand_discard", player: "self", count: 1 },
  ];
  const first = runtimeV02BeginCardCostChoice(s, binding, costs, "m1");
  if (first.status !== "player_choice_required") throw new Error("expected first hand choice");
  const second = runtimeV02ResumeCardCostChoice(s, binding, costs, first.pending_choice, "m1", ["hand:h1"], "m2");
  if (second.status !== "player_choice_required") throw new Error("expected second hand choice");
  equal(runtimeV02PendingCardCostChoiceView(second.pending_choice, 1)?.options, [
    { id: "hand:h2", label: "two" }, { id: "hand:h3", label: "three" },
  ]);
  throws(() => runtimeV02ResumeCardCostChoice(s, binding, costs, second.pending_choice, "m2", ["hand:h1"], "m3"), "hand_option_invalid");
});

Deno.test("resume is bound to exact turn, action identity and cost snapshot", () => {
  const s = state();
  const costs = [{ kind: "optional", as: "paid", costs: [{ kind: "damage", target: "$source_creature", amount: 10 }] }];
  const first = runtimeV02BeginCardCostChoice(s, binding, costs, "s1");
  if (first.status !== "player_choice_required") throw new Error("expected pending");
  throws(() => runtimeV02ResumeCardCostChoice({ ...s, turn_seq: 5 }, binding, costs, first.pending_choice, "s1", ["pay"]), "turn_stale");
  throws(() => runtimeV02ResumeCardCostChoice(s, { ...binding, source_action_id: "ability:other" }, costs, first.pending_choice, "s1", ["pay"]), "binding_stale");
  throws(() => runtimeV02ResumeCardCostChoice(s, binding, [{ kind: "optional", as: "paid", costs: [{ kind: "damage", target: "$source_creature", amount: 20 }] }], first.pending_choice, "s1", ["pay"]), "costs_stale");
});

Deno.test("non-empty discard filters fail closed until a filter owner is wired", () => {
  throws(() => runtimeV02BeginCardCostChoice(state(), binding, [
    { kind: "hand_discard", player: "self", count: 1, filters: { element: "Underworld" } },
  ], "f1"), "hand_filters_unsupported");
});
