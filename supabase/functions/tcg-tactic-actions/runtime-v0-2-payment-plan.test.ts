import { runtimeV02PlanCardCosts } from "../_shared/tcg-match-payment-plan-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  }
}
function throws(fn: () => unknown, contains: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(contains)) throw error;
    return;
  }
  throw new Error(`expected ${contains}`);
}

Deno.test("Payment planner returns deterministic damage leaf without mutation choice", () => {
  const result = runtimeV02PlanCardCosts([
    { kind: "damage", target: "$source_creature", amount: 20 },
  ]);
  equal(result, {
    status: "ready",
    costs: [{ kind: "damage", target: "$source_creature", amount: 20, source_path: "cost/0", cost_index: 0 }],
    variables: {},
  });
});

Deno.test("Payment planner resolves optional hand-discard cost and binds result variable", () => {
  const costs = [{
    kind: "optional", as: "toll_paid", costs: [
      { kind: "hand_discard", player: "self", count: 1 },
    ],
  }];
  equal(runtimeV02PlanCardCosts(costs), {
    status: "choice_required",
    choice: {
      path: "cost/0",
      kind: "optional",
      options: [
        { id: "skip", label: "Do not pay optional cost", selection: "skip" },
        { id: "pay", label: "Pay optional cost", selection: "pay" },
      ],
    },
    variables: {},
  });
  equal(runtimeV02PlanCardCosts(costs, [{ path: "cost/0", selection: "pay" }]), {
    status: "ready",
    costs: [{ kind: "hand_discard", player: "self", count: 1, source_path: "cost/0/optional/0", cost_index: 0 }],
    variables: { toll_paid: true },
  });
  equal(runtimeV02PlanCardCosts(costs, [{ path: "cost/0", selection: "skip" }]), {
    status: "ready",
    costs: [],
    variables: { toll_paid: false },
  });
});

Deno.test("Payment planner resolves Thanavor-shaped discard-or-damage choice generically", () => {
  const costs = [{ kind: "choice", options: [
    [{ kind: "hand_discard", player: "self", count: 2 }],
    [{ kind: "damage", target: "$source_creature", amount: 40 }],
  ] }];
  const pending = runtimeV02PlanCardCosts(costs);
  if (pending.status !== "choice_required") throw new Error("expected choice");
  equal(pending.choice.kind, "choice");
  equal(pending.choice.options.map((option) => option.selection), [0, 1]);

  const discard = runtimeV02PlanCardCosts(costs, [{ path: "cost/0", selection: 0 }]);
  if (discard.status !== "ready") throw new Error("expected discard plan");
  equal(discard.costs[0], {
    kind: "hand_discard", player: "self", count: 2, source_path: "cost/0/choice:0/0", cost_index: 0,
  });

  const damage = runtimeV02PlanCardCosts(costs, [{ path: "cost/0", selection: 1 }]);
  if (damage.status !== "ready") throw new Error("expected damage plan");
  equal(damage.costs[0], {
    kind: "damage", target: "$source_creature", amount: 40, source_path: "cost/0/choice:1/0", cost_index: 0,
  });
});

Deno.test("Payment planner advances nested decisions deterministically", () => {
  const costs = [{ kind: "optional", as: "paid", costs: [
    { kind: "choice", options: [
      [{ kind: "damage", target: "$source_creature", amount: 10 }],
      [{ kind: "hand_discard", player: "self", count: 1 }],
    ] },
  ] }];
  const afterOptional = runtimeV02PlanCardCosts(costs, [{ path: "cost/0", selection: "pay" }]);
  if (afterOptional.status !== "choice_required") throw new Error("expected nested choice");
  equal(afterOptional.choice.path, "cost/0/optional/0");
  equal(afterOptional.variables, { paid: true });
  const ready = runtimeV02PlanCardCosts(costs, [
    { path: "cost/0", selection: "pay" },
    { path: "cost/0/optional/0", selection: 1 },
  ]);
  if (ready.status !== "ready") throw new Error("expected ready");
  equal(ready.costs[0].cost_index, 0);
  equal(ready.variables, { paid: true });
});

Deno.test("Payment planner fails closed on unsupported or ambiguous cost shapes", () => {
  throws(() => runtimeV02PlanCardCosts([{ kind: "damage", target: "$source_creature", amount: 0 }]), "damage_amount_invalid");
  throws(() => runtimeV02PlanCardCosts([{ kind: "hand_discard", player: "opponent", count: 1 }]), "discard_player_unsupported");
  throws(() => runtimeV02PlanCardCosts([{ kind: "choice", options: [[{ kind: "damage", target: "$source_creature", amount: 10 }]] }]), "choice_options_invalid");
  throws(() => runtimeV02PlanCardCosts([{ kind: "optional", as: "x", costs: [] }]), "optional_empty");
  throws(() => runtimeV02PlanCardCosts([{ kind: "optional", as: "x", costs: [{ kind: "damage", target: "$source_creature", amount: 10 }] }], [{ path: "cost/0", selection: 0 }]), "optional_selection_invalid");
});