import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02CreateAttackInspectionChoice,
  runtimeV02ResolveAttackInspectionChoice,
  structuredRuntimeAfterDamageInspectionChoice,
} from "../_shared/tcg-match-attack-inspection-choice-v0-2.ts";
import { runtimeV02PendingAttackChoiceView } from "../_shared/tcg-match-attack-choice-v0-2.ts";
import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";
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

function inspectionProgram() {
  return [
    {
      op: "INSPECT_ZONE",
      player: "self",
      zone: "deck_top",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "controller_private",
      return_policy: "same_position",
      as: "inspected_top",
    },
    {
      op: "INSPECT_ZONE",
      player: "self",
      zone: "rewards",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "controller_private",
      return_policy: "same_position",
      as: "inspected_reward",
    },
  ];
}

function stateWith(
  afterDamage: unknown[] = inspectionProgram(),
  deck = [card("deck-a", "alpha"), card("deck-b", "beta")],
  rewards = [card("reward-a", "gamma"), card("reward-b", "delta")],
) {
  const sourceId = "test-inspection-creature";
  const sourceDefinition = {
    ...envelope(sourceId, "Test Inspector", "Creature"),
    creature: {
      stage: "Adult",
      attacks: [
        {
          id: "plain-claw",
          name: "Plain Claw",
          cost: [],
          base_damage: 20,
          damage_formula: null,
          requirements: [],
          on_declare: [],
          before_damage: [],
          after_damage: [],
        },
        {
          id: "inspection-path",
          name: "Inspection Path",
          cost: [],
          base_damage: 80,
          damage_formula: null,
          requirements: [],
          on_declare: [],
          before_damage: [],
          after_damage: afterDamage,
        },
      ],
    },
  };
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    active_seat: 1,
    players: {
      "1": {
        vanguard: { stack: [card("source-1", sourceId)], essence: [], relic: null, damage: 0, shield: 0 },
        reserve: [null, null, null, null],
        deck: structuredClone(deck),
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
      gamma: { card_id: "gamma", definition_v0_2: envelope("gamma", "Gamma") },
      delta: { card_id: "delta", definition_v0_2: envelope("delta", "Delta") },
    },
  } as Record<string, unknown>;
}

Deno.test("ordered deck-top then Reward inspection descriptor is registry-driven and narrow", () => {
  const state = stateWith();
  assertEquals(structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 1), null);
  assertEquals(
    structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 2),
    {
      attack_id: "inspection-path",
      phase: "after_damage",
      deck_top: { count: 1, visibility: "controller_private", return_policy: "same_position" },
      rewards: { min: 1, max: 1, visibility: "controller_private", return_policy: "same_position" },
    },
  );
});

Deno.test("pending inspection reveals top card only to chooser and does not move either zone", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 2)!;
  const pending = runtimeV02CreateAttackInspectionChoice(
    state,
    1,
    descriptor,
    card("source-1", "test-inspection-creature"),
    "choice-1",
  );
  const player = (state.players as any)["1"];
  assertEquals(player.deck.map((item: any) => item.uid), ["deck-a", "deck-b"]);
  assertEquals(player.rewards.map((item: any) => item.uid), ["reward-a", "reward-b"]);
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1), [
    { turn_seq: 7, controller_seat: 1, zone: "deck_top" },
  ]);
  assertEquals(runtimeV02CurrentTurnRewardInspections(state, 1), []);
  assertEquals(runtimeV02PendingAttackChoiceView(pending, 2), {
    id: "choice-1",
    seat: 1,
    kind: "inspect_deck_top_then_choose_reward",
    waiting: true,
  });
  assertEquals(runtimeV02PendingAttackChoiceView(pending, 1), {
    id: "choice-1",
    seat: 1,
    kind: "inspect_deck_top_then_choose_reward",
    prompt: "Top card: Alpha. Choose one Reward to inspect",
    min: 1,
    max: 1,
    options: [
      { id: "reward:0", label: "Reward 1" },
      { id: "reward:1", label: "Reward 2" },
    ],
  });
});

Deno.test("resolving inspects exactly one anchored Reward in place and persists chooser-private identity", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 2)!;
  const pending = runtimeV02CreateAttackInspectionChoice(
    state,
    1,
    descriptor,
    card("source-1", "test-inspection-creature"),
    "choice-1",
  );
  const resolved = runtimeV02ResolveAttackInspectionChoice(pending, 1, "choice-1", ["reward:1"], state);
  assertEquals(resolved, {
    attack_id: "inspection-path",
    choice_id: "choice-1",
    deck_top_inspected_count: 1,
    reward_inspected_count: 1,
    reward_position: 1,
  });
  const player = (state.players as any)["1"];
  assertEquals(player.deck.map((item: any) => item.uid), ["deck-a", "deck-b"]);
  assertEquals(player.rewards.map((item: any) => item.uid), ["reward-a", "reward-b"]);
  assertEquals(runtimeV02CurrentTurnRewardInspections(state, 1), [{ turn_seq: 7, controller_seat: 1 }]);
  assertEquals(runtimeV02PrivateRewardInspectionView(state, 1), {
    turn_seq: 7,
    controller_seat: 1,
    cards: [{ position: 1, uid: "reward-b", card_id: "delta" }],
  });
  assertEquals(runtimeV02PrivateRewardInspectionView(state, 2), null);
});

Deno.test("inspection choice rejects wrong seat, stale id, turn, source, deck-top and Reward drift", () => {
  const base = () => {
    const state = stateWith();
    const descriptor = structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 2)!;
    const pending = runtimeV02CreateAttackInspectionChoice(
      state,
      1,
      descriptor,
      card("source-1", "test-inspection-creature"),
      "choice-1",
    );
    return { state, pending };
  };

  let pair = base();
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 2, "choice-1", ["reward:0"], pair.state), "not_yours");
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 1, "old", ["reward:0"], pair.state), "stale_id");
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 1, "choice-1", ["reward:missing"], pair.state), "unknown_option");

  pair = base();
  pair.state.turn_seq = 8;
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 1, "choice-1", ["reward:0"], pair.state), "turn_changed");

  pair = base();
  (pair.state.players as any)["1"].vanguard.stack[0] = card("source-2", "test-inspection-creature");
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 1, "choice-1", ["reward:0"], pair.state), "source_vanguard_changed");

  pair = base();
  [(pair.state.players as any)["1"].deck[0], (pair.state.players as any)["1"].deck[1]] = [
    (pair.state.players as any)["1"].deck[1],
    (pair.state.players as any)["1"].deck[0],
  ];
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 1, "choice-1", ["reward:0"], pair.state), "deck_top_changed");

  pair = base();
  [(pair.state.players as any)["1"].rewards[0], (pair.state.players as any)["1"].rewards[1]] = [
    (pair.state.players as any)["1"].rewards[1],
    (pair.state.players as any)["1"].rewards[0],
  ];
  assertThrows(() => runtimeV02ResolveAttackInspectionChoice(pair.pending, 1, "choice-1", ["reward:0"], pair.state), "reward_set_changed");
});

Deno.test("required deck-top and Reward options fail closed before pending choice exists", () => {
  let state = stateWith(inspectionProgram(), [], [card("reward-a", "gamma")]);
  let descriptor = structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 2)!;
  assertThrows(
    () => runtimeV02CreateAttackInspectionChoice(state, 1, descriptor, card("source-1", "test-inspection-creature"), "choice-1"),
    "deck_top_unavailable",
  );

  state = stateWith(inspectionProgram(), [card("deck-a", "alpha")], []);
  descriptor = structuredRuntimeAfterDamageInspectionChoice(state, { card_id: "test-inspection-creature" }, 2)!;
  assertThrows(
    () => runtimeV02CreateAttackInspectionChoice(state, 1, descriptor, card("source-1", "test-inspection-creature"), "choice-2"),
    "reward_unavailable",
  );
});

Deno.test("malformed or different INSPECT_ZONE programs remain outside this owner and legacy stays compatible", () => {
  const reversed = [...inspectionProgram()].reverse();
  assertEquals(
    structuredRuntimeAfterDamageInspectionChoice(stateWith(reversed), { card_id: "test-inspection-creature" }, 2),
    null,
  );

  const wrongVisibility = inspectionProgram() as any[];
  wrongVisibility[1].visibility = "server_only";
  assertThrows(
    () => structuredRuntimeAfterDamageInspectionChoice(stateWith(wrongVisibility), { card_id: "test-inspection-creature" }, 2),
    "step_shape_unsupported",
  );

  const extra = inspectionProgram() as any[];
  extra[0].selection.distinct = true;
  assertThrows(
    () => structuredRuntimeAfterDamageInspectionChoice(stateWith(extra), { card_id: "test-inspection-creature" }, 2),
    "selection_field_unsupported",
  );

  const legacy = stateWith();
  delete legacy.runtime_registry_v0_2;
  assertEquals(
    structuredRuntimeAfterDamageInspectionChoice(legacy, { card_id: "test-inspection-creature" }, 2),
    null,
  );
});
