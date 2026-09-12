import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityRewardChoice,
  runtimeV02CurrentTurnActiveAbilityUseCount,
  runtimeV02PendingActiveAbilityChoiceView,
  runtimeV02ResolveActiveAbilityRewardChoice,
  structuredRuntimeActiveAbilityRewardInspection,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CurrentTurnRewardInspections,
  runtimeV02PrivateRewardInspectionView,
} from "../_shared/tcg-match-reward-inspection-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function envelope(id: string, name: string, cardFamily = "Tactic") {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: cardFamily,
  };
}

function rewardInspectionAbility() {
  return {
    id: "memory-glimpse",
    name: "Memory Glimpse",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [{
      op: "INSPECT_ZONE",
      player: "self",
      zone: "rewards",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "controller_private",
      return_policy: "same_position",
      as: "inspected_reward",
    }],
  };
}

function stateWith(
  ability: Record<string, unknown> = rewardInspectionAbility(),
  rewards = [card("reward-a", "alpha"), card("reward-b", "beta")],
) {
  const sourceId = "test-active-inspector";
  const sourceDefinition = {
    ...envelope(sourceId, "Test Active Inspector", "Creature"),
    creature: { stage: "Adult", ability, attacks: [] },
  };
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 11,
    active_seat: 1,
    players: {
      "1": {
        vanguard: { stack: [card("source-1", sourceId)], essence: [], relic: null, damage: 0, shield: 0 },
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        rewards: structuredClone(rewards),
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        rewards: [],
      },
    },
    card_index: {
      [sourceId]: { card_id: sourceId, definition_v0_2: sourceDefinition },
      alpha: { card_id: "alpha", definition_v0_2: envelope("alpha", "Alpha") },
      beta: { card_id: "beta", definition_v0_2: envelope("beta", "Beta") },
    },
  } as Record<string, unknown>;
}

Deno.test("active own-turn one-Reward inspection descriptor is registry-driven and exact", () => {
  const state = stateWith();
  assertEquals(
    structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" }),
    {
      ability_id: "memory-glimpse",
      timing: "own_turn",
      limit: { scope: "turn", count: 1, owner: "controller" },
      rewards: { min: 1, max: 1, visibility: "controller_private", return_policy: "same_position" },
    },
  );

  const other = rewardInspectionAbility() as any;
  other.steps = [
    { op: "DRAW", player: "self", count: 1 },
    ...other.steps,
  ];
  assertEquals(structuredRuntimeActiveAbilityRewardInspection(stateWith(other), { card_id: "test-active-inspector" }), null);
});

Deno.test("activation creates a reconnect-stable private Reward choice and consumes the controller turn limit", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" })!;
  const pending = runtimeV02CreateActiveAbilityRewardChoice(
    state,
    1,
    descriptor,
    { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
    "ability-choice-1",
  );
  const player = (state.players as any)["1"];
  assertEquals(player.rewards.map((item: any) => item.uid), ["reward-a", "reward-b"]);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "memory-glimpse"), 1);
  assertEquals(runtimeV02CurrentTurnRewardInspections(state, 1), []);
  assertEquals(runtimeV02PendingActiveAbilityChoiceView(pending, 2), {
    id: "ability-choice-1",
    seat: 1,
    kind: "inspect_one_reward",
    waiting: true,
  });
  assertEquals(runtimeV02PendingActiveAbilityChoiceView(pending, 1), {
    id: "ability-choice-1",
    seat: 1,
    kind: "inspect_one_reward",
    prompt: "Choose one Reward to inspect",
    min: 1,
    max: 1,
    options: [
      { id: "reward:0", label: "Reward 1" },
      { id: "reward:1", label: "Reward 2" },
    ],
  });
});

Deno.test("resolution inspects exactly one anchored Reward in place and cannot spend the Ability twice", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" })!;
  const pending = runtimeV02CreateActiveAbilityRewardChoice(
    state,
    1,
    descriptor,
    { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
    "ability-choice-1",
  );
  assertEquals(
    runtimeV02ResolveActiveAbilityRewardChoice(pending, 1, "ability-choice-1", ["reward:1"], state),
    { ability_id: "memory-glimpse", choice_id: "ability-choice-1", reward_inspected_count: 1 },
  );
  assertEquals((state.players as any)["1"].rewards.map((item: any) => item.uid), ["reward-a", "reward-b"]);
  assertEquals(runtimeV02CurrentTurnRewardInspections(state, 1), [{ turn_seq: 11, controller_seat: 1 }]);
  assertEquals(runtimeV02PrivateRewardInspectionView(state, 1), {
    turn_seq: 11,
    controller_seat: 1,
    cards: [{ position: 1, uid: "reward-b", card_id: "beta" }],
  });
  assertEquals(runtimeV02PrivateRewardInspectionView(state, 2), null);
  assertThrows(
    () => runtimeV02CreateActiveAbilityRewardChoice(
      state,
      1,
      descriptor,
      { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
      "ability-choice-2",
    ),
    "turn_limit_reached",
  );
});

Deno.test("choice is seat, turn, source, location, Reward-set and limit-receipt bound", () => {
  const base = () => {
    const state = stateWith();
    const descriptor = structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" })!;
    const pending = runtimeV02CreateActiveAbilityRewardChoice(
      state,
      1,
      descriptor,
      { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
      "ability-choice-1",
    );
    return { state, pending };
  };

  let pair = base();
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 2, "ability-choice-1", ["reward:0"], pair.state), "not_yours");
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 1, "stale", ["reward:0"], pair.state), "stale_id");
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 1, "ability-choice-1", ["missing"], pair.state), "unknown_option");

  pair = base();
  pair.state.turn_seq = 12;
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 1, "ability-choice-1", ["reward:0"], pair.state), "turn_changed");

  pair = base();
  (pair.state.players as any)["1"].vanguard.stack[0] = card("source-2", "test-active-inspector");
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 1, "ability-choice-1", ["reward:0"], pair.state), "source_changed");

  pair = base();
  [(pair.state.players as any)["1"].rewards[0], (pair.state.players as any)["1"].rewards[1]] = [
    (pair.state.players as any)["1"].rewards[1],
    (pair.state.players as any)["1"].rewards[0],
  ];
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 1, "ability-choice-1", ["reward:0"], pair.state), "reward_set_changed");

  pair = base();
  delete (pair.state as any).runtime_active_ability_limits_v0_2;
  assertThrows(() => runtimeV02ResolveActiveAbilityRewardChoice(pair.pending, 1, "ability-choice-1", ["reward:0"], pair.state), "limit_receipt_missing");
});

Deno.test("source binding supports a Reserve top-card without inventing a separate Ability owner", () => {
  const state = stateWith();
  const player = (state.players as any)["1"];
  player.reserve[2] = player.vanguard;
  player.vanguard = null;
  const descriptor = structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" })!;
  const pending = runtimeV02CreateActiveAbilityRewardChoice(
    state,
    1,
    descriptor,
    { where: "reserve", index: 2, instance: card("source-1", "test-active-inspector") },
    "ability-choice-reserve",
  );
  assertEquals(pending.source_where, "reserve");
  assertEquals(pending.source_index, 2);
  runtimeV02ResolveActiveAbilityRewardChoice(pending, 1, "ability-choice-reserve", ["reward:0"], state);
});

Deno.test("missing Reward fails before the turn limit is consumed and a new turn logically resets the limit", () => {
  let state = stateWith(rewardInspectionAbility(), []);
  let descriptor = structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" })!;
  assertThrows(
    () => runtimeV02CreateActiveAbilityRewardChoice(
      state,
      1,
      descriptor,
      { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
      "empty-choice",
    ),
    "reward_unavailable",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "memory-glimpse"), 0);

  state = stateWith();
  descriptor = structuredRuntimeActiveAbilityRewardInspection(state, { card_id: "test-active-inspector" })!;
  runtimeV02CreateActiveAbilityRewardChoice(
    state,
    1,
    descriptor,
    { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
    "turn-11",
  );
  state.turn_seq = 12;
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "memory-glimpse"), 0);
  runtimeV02CreateActiveAbilityRewardChoice(
    state,
    1,
    descriptor,
    { where: "vanguard", index: null, instance: card("source-1", "test-active-inspector") },
    "turn-12",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "memory-glimpse"), 1);
});

Deno.test("malformed matching active Ability fails closed while unrelated active and legacy definitions stay outside this owner", () => {
  const wrongVisibility = rewardInspectionAbility() as any;
  wrongVisibility.steps[0].visibility = "server_only";
  assertThrows(
    () => structuredRuntimeActiveAbilityRewardInspection(stateWith(wrongVisibility), { card_id: "test-active-inspector" }),
    "step_shape_unsupported",
  );

  const wrongLimit = rewardInspectionAbility() as any;
  wrongLimit.limit.owner = "card_instance";
  assertThrows(
    () => structuredRuntimeActiveAbilityRewardInspection(stateWith(wrongLimit), { card_id: "test-active-inspector" }),
    "limit_unsupported",
  );

  const unrelated = rewardInspectionAbility() as any;
  unrelated.steps = [{ op: "HEAL", target: "$source_creature", amount: 20 }];
  assertEquals(structuredRuntimeActiveAbilityRewardInspection(stateWith(unrelated), { card_id: "test-active-inspector" }), null);

  const legacy = stateWith();
  delete legacy.runtime_registry_v0_2;
  assertEquals(structuredRuntimeActiveAbilityRewardInspection(legacy, { card_id: "test-active-inspector" }), null);
});
