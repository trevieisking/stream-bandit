import {
  runtimeV02BeginActiveAbilityActivationCost,
  runtimeV02ResumeActiveAbilityActivationCost,
} from "../_shared/tcg-match-active-ability-activation-cost-v0-2.ts";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
  runtimeV02RecordActiveAbilityUse,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function card(uid: string, card_id: string) {
  return { uid, card_id };
}

function stateWithAbility(costs: unknown[]) {
  const source = card("creature-1", "underworld-source");
  const state = {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    active_seat: 1,
    card_index: {
      "underworld-source": {
        card_id: "underworld-source",
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: "underworld-source",
          name: "Underworld Source",
          card_family: "Creature",
          creature: {
            ability: {
              id: "ability-1",
              name: "Paid Ability",
              mode: "active",
              event: null,
              timing: "own_turn",
              limit: { scope: "turn", count: 1, owner: "controller" },
              requirements: [],
              costs,
              steps: [],
            },
            attacks: [],
          },
        },
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
  return { state, source };
}

function request(source: { uid: string; card_id: string }) {
  return {
    cost_gate: {
      controller_seat: 1 as const,
      action_kind: "ability" as const,
      action_id: "ability-1",
      source: {
        location: { where: "vanguard" as const, index: null },
        instance: source,
      },
      defeat_describe: () => ({ max_hp: 300, reward_value: 1, label: "Source" }),
    },
    turn_limit: 1 as const,
  };
}

Deno.test("Active Ability records once-per-turn use only after optional cost is fully paid", () => {
  const { state, source } = stateWithAbility([{
    kind: "optional",
    as: "$paid_cost",
    costs: [{ kind: "hand_discard", player: "self", count: 1 }],
  }]);
  const first = runtimeV02BeginActiveAbilityActivationCost(state as never, request(source), "choice-1");
  assert(first.status === "player_choice_required", "optional Ability cost did not pause");
  assert(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "ability-1") === 0, "Ability use recorded before optional decision");

  const second = runtimeV02ResumeActiveAbilityActivationCost(
    state as never,
    request(source),
    first.pending_choice,
    first.pending_choice.id,
    ["pay"],
    "choice-2",
  );
  assert(second.status === "player_choice_required", "private hand selection did not pause");
  assert(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "ability-1") === 0, "Ability use recorded before hand selection");

  const third = runtimeV02ResumeActiveAbilityActivationCost(
    state as never,
    request(source),
    second.pending_choice,
    second.pending_choice.id,
    ["hand:hand-1"],
    "choice-3",
  );
  assert(third.status === "activation_permitted", "paid Ability was not activation permitted");
  assert(third.permit.cost_permit.variables["$paid_cost"] === true, "optional cost variable lost");
  assert(third.permit.turn_limit_recorded === true, "turn-limit receipt not recorded");
  assert(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "ability-1") === 1, "Ability use receipt missing after payment");
  const player = (state.players as Record<string, any>)["1"];
  assert(player.hand.length === 0 && player.discard.length === 1, "Ability additional cost was not paid");
});

Deno.test("Ability turn limit consumed while cost choice is open blocks Payment before mutation", () => {
  const { state, source } = stateWithAbility([{
    kind: "optional",
    as: "$paid_cost",
    costs: [{ kind: "hand_discard", player: "self", count: 1 }],
  }]);
  const first = runtimeV02BeginActiveAbilityActivationCost(state as never, request(source), "choice-4");
  assert(first.status === "player_choice_required", "optional Ability cost did not pause");
  runtimeV02RecordActiveAbilityUse(state, 1, "ability-1");

  let failed = false;
  try {
    runtimeV02ResumeActiveAbilityActivationCost(
      state as never,
      request(source),
      first.pending_choice,
      first.pending_choice.id,
      ["pay"],
      "choice-5",
    );
  } catch (error) {
    failed = String(error).includes("turn_limit_reached");
  }
  assert(failed, "newly consumed Ability limit did not fail closed before Payment");
  const player = (state.players as Record<string, any>)["1"];
  assert(player.hand.length === 1 && player.discard.length === 0, "failed Ability limit check mutated Payment state");
});
