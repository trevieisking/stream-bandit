import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02CreateTopDeckCardChoice,
  runtimeV02ResolveTopDeckCardChoice,
  structuredRuntimeAfterDamageTopDeckCardChoice,
} from "../_shared/tcg-match-attack-card-choice-v0-2.ts";
import { runtimeV02PendingAttackChoiceView } from "../_shared/tcg-match-attack-choice-v0-2.ts";
import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";

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

function dreamRayProgram() {
  return [
    { op: "LOOK_TOP", player: "self", count: 2, as: "looked" },
    { op: "CHOOSE_FROM_SET", source: "$looked", min: 1, max: 1, as: "chosen" },
    { op: "MOVE_CARDS", player: "self", cards: "$chosen", to: "hand" },
    { op: "PUT_REMAINDER_ON_DECK_BOTTOM", player: "self", source: "$looked", except: "$chosen", order: "preserve" },
  ];
}

function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function stateWith(afterDamage: unknown[], deck = [card("alpha-1", "alpha"), card("beta-1", "beta"), card("gamma-1", "gamma")]) {
  const sourceCardId = "test-dream-ray-creature";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 4,
    active_seat: 1,
    players: {
      "1": {
        vanguard: { stack: [card("source-1", sourceCardId)], essence: [], relic: null, damage: 0, shield: 0 },
        reserve: [null, null, null, null],
        deck: structuredClone(deck),
        hand: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
      },
    },
    card_index: {
      [sourceCardId]: {
        card_id: sourceCardId,
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: sourceCardId,
          name: "Test Dreamer",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: "dream-ray-test",
              name: "Dream Ray Test",
              cost: [{ element: "Astral", amount: 2 }],
              base_damage: 80,
              damage_formula: null,
              requirements: [],
              on_declare: [],
              before_damage: [],
              after_damage: afterDamage,
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
      alpha: { definition_v0_2: { id: "alpha", name: "Alpha", card_family: "Tactic" } },
      beta: { definition_v0_2: { id: "beta", name: "Beta", card_family: "Essence" } },
      gamma: { definition_v0_2: { id: "gamma", name: "Gamma", card_family: "Creature" } },
    },
  } as Record<string, unknown>;
}

Deno.test("top-deck attack card choice descriptor is registry-driven and exact", () => {
  const descriptor = structuredRuntimeAfterDamageTopDeckCardChoice(
    stateWith(dreamRayProgram()),
    { card_id: "test-dream-ray-creature" },
    1,
  );
  assertEquals(descriptor, {
    attack_id: "dream-ray-test",
    phase: "after_damage",
    look_count: 2,
    selection: { min: 1, max: 1 },
    chosen_destination: "hand",
    remainder_destination: "deck_bottom",
    remainder_order: "preserve",
  });
});

Deno.test("pending top-deck choice is private and does not remove cards merely to present options", () => {
  const state = stateWith(dreamRayProgram());
  const descriptor = structuredRuntimeAfterDamageTopDeckCardChoice(state, { card_id: "test-dream-ray-creature" }, 1)!;
  const choice = runtimeV02CreateTopDeckCardChoice(state, 1, descriptor, card("source-1", "test-dream-ray-creature"), "choice-1");
  const player = (state.players as any)["1"];
  assertEquals(player.deck.map((item: any) => item.uid), ["alpha-1", "beta-1", "gamma-1"]);
  assertEquals(choice.options.map((option) => [option.id, option.label]), [["card:alpha-1", "Alpha"], ["card:beta-1", "Beta"]]);
  assertEquals(runtimeV02PendingAttackChoiceView(choice, 2), {
    id: "choice-1",
    seat: 1,
    kind: "choose_from_looked_set",
    waiting: true,
  });
  assertEquals((runtimeV02PendingAttackChoiceView(choice, 1) as any).options, [
    { id: "card:alpha-1", label: "Alpha" },
    { id: "card:beta-1", label: "Beta" },
  ]);
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1), [{ turn_seq: 4, controller_seat: 1, zone: "deck_top" }]);
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 2), []);
});

Deno.test("resolving chooses exactly one current top card and preserves remainder order on deck bottom", () => {
  const state = stateWith(dreamRayProgram());
  const descriptor = structuredRuntimeAfterDamageTopDeckCardChoice(state, { card_id: "test-dream-ray-creature" }, 1)!;
  const choice = runtimeV02CreateTopDeckCardChoice(state, 1, descriptor, card("source-1", "test-dream-ray-creature"), "choice-1");
  const result = runtimeV02ResolveTopDeckCardChoice(choice, 1, "choice-1", ["card:beta-1"], state);
  const player = (state.players as any)["1"];
  assertEquals(result.looked_count, 2);
  assertEquals(result.chosen_count, 1);
  assertEquals(result.remainder_count, 1);
  assertEquals(player.hand.map((item: any) => item.uid), ["beta-1"]);
  assertEquals(player.deck.map((item: any) => item.uid), ["gamma-1", "alpha-1"]);
});

Deno.test("top-deck choice supports a one-card remainder edge and fails closed when no card exists", () => {
  const oneCardState = stateWith(dreamRayProgram(), [card("alpha-1", "alpha")]);
  const descriptor = structuredRuntimeAfterDamageTopDeckCardChoice(oneCardState, { card_id: "test-dream-ray-creature" }, 1)!;
  const choice = runtimeV02CreateTopDeckCardChoice(oneCardState, 1, descriptor, card("source-1", "test-dream-ray-creature"), "choice-1");
  runtimeV02ResolveTopDeckCardChoice(choice, 1, "choice-1", ["card:alpha-1"], oneCardState);
  assertEquals((oneCardState.players as any)["1"].deck, []);
  assertEquals((oneCardState.players as any)["1"].hand.map((item: any) => item.uid), ["alpha-1"]);

  const emptyState = stateWith(dreamRayProgram(), []);
  const emptyDescriptor = structuredRuntimeAfterDamageTopDeckCardChoice(emptyState, { card_id: "test-dream-ray-creature" }, 1)!;
  assertThrows(
    () => runtimeV02CreateTopDeckCardChoice(emptyState, 1, emptyDescriptor, card("source-1", "test-dream-ray-creature"), "choice-2"),
    "required_option_unavailable",
  );
});

Deno.test("top-deck choice rejects wrong seat, stale id, unknown option, turn drift, source drift and top-set drift", () => {
  const base = () => {
    const state = stateWith(dreamRayProgram());
    const descriptor = structuredRuntimeAfterDamageTopDeckCardChoice(state, { card_id: "test-dream-ray-creature" }, 1)!;
    const choice = runtimeV02CreateTopDeckCardChoice(state, 1, descriptor, card("source-1", "test-dream-ray-creature"), "choice-1");
    return { state, choice };
  };

  let pair = base();
  assertThrows(() => runtimeV02ResolveTopDeckCardChoice(pair.choice, 2, "choice-1", ["card:alpha-1"], pair.state), "not_yours");
  assertThrows(() => runtimeV02ResolveTopDeckCardChoice(pair.choice, 1, "old-choice", ["card:alpha-1"], pair.state), "stale_id");
  assertThrows(() => runtimeV02ResolveTopDeckCardChoice(pair.choice, 1, "choice-1", ["card:missing"], pair.state), "unknown_option");

  pair = base();
  pair.state.turn_seq = 5;
  assertThrows(() => runtimeV02ResolveTopDeckCardChoice(pair.choice, 1, "choice-1", ["card:alpha-1"], pair.state), "turn_changed");

  pair = base();
  (pair.state.players as any)["1"].vanguard.stack[0] = card("different-source", "test-dream-ray-creature");
  assertThrows(() => runtimeV02ResolveTopDeckCardChoice(pair.choice, 1, "choice-1", ["card:alpha-1"], pair.state), "source_vanguard_changed");

  pair = base();
  const deck = (pair.state.players as any)["1"].deck;
  [deck[0], deck[1]] = [deck[1], deck[0]];
  assertThrows(() => runtimeV02ResolveTopDeckCardChoice(pair.choice, 1, "choice-1", ["card:alpha-1"], pair.state), "top_set_changed");
});

Deno.test("matching malformed metadata fails closed while other programs remain outside this owner", () => {
  const wrongBounds = dreamRayProgram() as any[];
  wrongBounds[1].min = 0;
  assertThrows(
    () => structuredRuntimeAfterDamageTopDeckCardChoice(stateWith(wrongBounds), { card_id: "test-dream-ray-creature" }, 1),
    "choose_bounds_unsupported",
  );

  const wrongRemainder = dreamRayProgram() as any[];
  wrongRemainder[3].order = "player_choice";
  assertThrows(
    () => structuredRuntimeAfterDamageTopDeckCardChoice(stateWith(wrongRemainder), { card_id: "test-dream-ray-creature" }, 1),
    "remainder_binding_unsupported",
  );

  const mixed = [...dreamRayProgram(), { op: "ADD_SHIELD", target: "$source_creature", amount: 10 }];
  assertEquals(
    structuredRuntimeAfterDamageTopDeckCardChoice(stateWith(mixed), { card_id: "test-dream-ray-creature" }, 1),
    null,
  );
});

Deno.test("legacy-only match remains on compatibility authority", () => {
  const state = stateWith(dreamRayProgram());
  delete state.runtime_registry_v0_2;
  assertEquals(
    structuredRuntimeAfterDamageTopDeckCardChoice(state, { card_id: "test-dream-ray-creature" }, 1),
    null,
  );
});
