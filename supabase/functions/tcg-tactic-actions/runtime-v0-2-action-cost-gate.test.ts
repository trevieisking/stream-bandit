import {
  runtimeV02BeginActionCostGate,
  runtimeV02ResumeActionCostGate,
  runtimeV02StructuredActionAdditionalCosts,
} from "../_shared/tcg-match-action-cost-gate-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function card(uid: string, card_id: string) {
  return { uid, card_id };
}

function baseState(definition: Record<string, unknown>) {
  const source = card("creature-1", "underworld-source");
  const definitionV02 = {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "underworld-source",
    name: "Underworld Source",
    ...definition,
  };
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      "underworld-source": {
        card_id: "underworld-source",
        definition_v0_2: definitionV02,
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
    players: {
      "1": {
        vanguard: { stack: [source], essence: [], relic: null, damage: 0, shield: 0 },
        reserve: [null, null, null, null],
        hand: [card("hand-1", "discard-me")],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
  } as Record<string, unknown>;
}

const describe = () => ({ max_hp: 300, reward_value: 1, label: "Source" });

Deno.test("action cost metadata keeps attack Essence cost separate from additional costs", () => {
  const definition = {
    card_family: "Creature",
    creature: {
      ability: { id: "ability-1", costs: [] },
      attacks: [{
        id: "attack-1",
        cost: [{ element: "Underworld", amount: 3 }],
        costs: [{ kind: "hand_discard", player: "self", count: 1 }],
      }],
    },
  };
  const state = baseState(definition);
  const costs = runtimeV02StructuredActionAdditionalCosts(
    state,
    card("creature-1", "underworld-source"),
    "attack",
    "attack-1",
  );
  assert(Array.isArray(costs) && costs.length === 1, "additional attack costs not extracted");
  assert((definition.creature.attacks[0].cost[0] as { amount: number }).amount === 3, "Essence cost was changed");
});

Deno.test("no-cost Ability is permitted without Payment mutation", () => {
  const state = baseState({
    card_family: "Creature",
    creature: { ability: { id: "ability-1", costs: [] }, attacks: [] },
  });
  const result = runtimeV02BeginActionCostGate(state as never, {
    controller_seat: 1,
    action_kind: "ability",
    action_id: "ability-1",
    source: { location: { where: "vanguard", index: null }, instance: card("creature-1", "underworld-source") },
    defeat_describe: describe as never,
  }, "choice-1");
  assert(result.status === "execution_permitted", "no-cost ability not permitted");
  assert(result.permit.additional_cost_count === 0, "unexpected additional cost count");
  assert(result.permit.payment === null, "no-cost ability invoked Payment");
});

Deno.test("immediate Ability damage cost is paid before execution permit", () => {
  const state = baseState({
    card_family: "Creature",
    creature: {
      ability: { id: "ability-1", costs: [{ kind: "damage", target: "$source_creature", amount: 20 }] },
      attacks: [],
    },
  });
  const result = runtimeV02BeginActionCostGate(state as never, {
    controller_seat: 1,
    action_kind: "ability",
    action_id: "ability-1",
    source: { location: { where: "vanguard", index: null }, instance: card("creature-1", "underworld-source") },
    defeat_describe: describe as never,
  }, "choice-2");
  assert(result.status === "execution_permitted", "damage-cost ability not permitted after payment");
  const source = ((state.players as Record<string, any>)["1"].vanguard);
  assert(source.damage === 20, "damage cost was not paid before permit");
  assert(result.permit.payment !== null, "payment receipt missing");
});

Deno.test("optional Attack discard pauses privately and pays before permit", () => {
  const state = baseState({
    card_family: "Creature",
    creature: {
      ability: { id: "ability-1", costs: [] },
      attacks: [{
        id: "attack-1",
        cost: [{ element: "Underworld", amount: 3 }],
        costs: [{
          kind: "optional",
          as: "$paid_toll",
          costs: [{ kind: "hand_discard", player: "self", count: 1 }],
        }],
      }],
    },
  });
  const request = {
    controller_seat: 1 as const,
    action_kind: "attack" as const,
    action_id: "attack-1",
    source: { location: { where: "vanguard" as const, index: null }, instance: card("creature-1", "underworld-source") },
    defeat_describe: describe as never,
  };
  const first = runtimeV02BeginActionCostGate(state as never, request, "choice-3");
  assert(first.status === "player_choice_required", "optional cost did not pause");
  const second = runtimeV02ResumeActionCostGate(
    state as never,
    request,
    first.pending_choice,
    first.pending_choice.id,
    ["pay"],
    "choice-4",
  );
  assert(second.status === "player_choice_required", "hand selection was not requested");
  const handOption = second.pending_choice.options.find((option) => option.id === "hand:hand-1");
  assert(handOption, "expected private hand option missing");
  const third = runtimeV02ResumeActionCostGate(
    state as never,
    request,
    second.pending_choice,
    second.pending_choice.id,
    [handOption.id],
    "choice-5",
  );
  assert(third.status === "execution_permitted", "paid optional attack cost did not permit execution");
  assert(third.permit.variables["$paid_toll"] === true, "optional cost variable not preserved");
  const player = (state.players as Record<string, any>)["1"];
  assert(player.hand.length === 0 && player.discard.length === 1, "selected discard cost not paid");
});

Deno.test("source identity change blocks final payment before execution permit", () => {
  const state = baseState({
    card_family: "Creature",
    creature: {
      ability: { id: "ability-1", costs: [] },
      attacks: [{
        id: "attack-1",
        cost: [{ element: "Underworld", amount: 3 }],
        costs: [{ kind: "optional", as: "$paid_toll", costs: [{ kind: "hand_discard", player: "self", count: 1 }] }],
      }],
    },
  });
  const request = {
    controller_seat: 1 as const,
    action_kind: "attack" as const,
    action_id: "attack-1",
    source: { location: { where: "vanguard" as const, index: null }, instance: card("creature-1", "underworld-source") },
    defeat_describe: describe as never,
  };
  const first = runtimeV02BeginActionCostGate(state as never, request, "choice-6");
  assert(first.status === "player_choice_required", "optional cost did not pause");
  const second = runtimeV02ResumeActionCostGate(state as never, request, first.pending_choice, first.pending_choice.id, ["pay"], "choice-7");
  assert(second.status === "player_choice_required", "hand selection was not requested");
  (state.players as Record<string, any>)["1"].vanguard.stack[0] = card("changed", "other-card");
  let failed = false;
  try {
    runtimeV02ResumeActionCostGate(
      state as never,
      request,
      second.pending_choice,
      second.pending_choice.id,
      ["hand:hand-1"],
      "choice-8",
    );
  } catch (error) {
    failed = String(error).includes("source_identity_changed");
  }
  assert(failed, "stale source identity did not fail closed");
  const player = (state.players as Record<string, any>)["1"];
  assert(player.hand.length === 1 && player.discard.length === 0, "failed payment mutated hand/discard");
});
