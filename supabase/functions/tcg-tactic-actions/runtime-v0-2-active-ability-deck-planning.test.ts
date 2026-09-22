import {
  runtimeV02CreateActiveAbilityDeckPlanningChoice,
  runtimeV02PendingActiveAbilityDeckPlanningChoiceView,
  runtimeV02ResolveActiveAbilityDeckPlanningChoice,
  structuredRuntimeActiveAbilityDeckPlanning,
} from "../_shared/tcg-match-active-ability-deck-planning-v0-2.ts";
import {
  runtimeV02RecordActiveAbilityUse,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function inst(uid: string, card_id: string) { return { uid, card_id }; }
function creature(uid: string, card_id: string) {
  return { stack: [inst(uid, card_id)], essence: [], relic: null, damage: 0, shield: 0 };
}
function def(id: string, element: string, ability: unknown = null) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Creature",
      element,
      creature: {
        stage: "Standalone",
        hp: 100,
        withdrawal: 1,
        reward_value: 1,
        ability,
        attacks: [],
      },
      essence: null,
      tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function ability() {
  return {
    id: "deck-planner",
    name: "Deck Planner",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [
      { op: "LOOK_TOP", player: "self", count: 4, as: "looked" },
      { op: "CHOOSE_FROM_SET", source: "$looked", min: 0, max: 1, as: "bottom" },
      { op: "MOVE_CARDS", player: "self", cards: "$bottom", to: "deck_bottom" },
      {
        op: "RETURN_REMAINDER_TO_DECK_TOP",
        player: "self",
        source: "$looked",
        except: "$bottom",
        order: "player_choice",
      },
    ],
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 14,
    active_seat: 1,
    players: {
      "1": {
        vanguard: creature("src", "planner"),
        reserve: [null, null, null, null],
        deck: [
          inst("a", "a"),
          inst("b", "b"),
          inst("c", "c"),
          inst("d", "d"),
          inst("e", "e"),
        ],
        hand: [], discard: [], rewards: [],
      },
      "2": {
        vanguard: creature("opp", "opp"),
        reserve: [null, null, null, null],
        deck: [], hand: [], discard: [], rewards: [],
      },
    },
    card_index: {
      planner: def("planner", "Astral", ability()),
      opp: def("opp", "Stone"),
      a: def("a", "Astral"),
      b: def("b", "Astral"),
      c: def("c", "Astral"),
      d: def("d", "Astral"),
      e: def("e", "Astral"),
    },
  } as Record<string, any>;
}
function source() {
  return { where: "vanguard" as const, index: null, instance: inst("src", "planner") };
}

Deno.test("generic active deck-planning recognizer claims only the frozen four-step shape", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDeckPlanning(
    s,
    { card_id: "planner" },
  );
  equal(descriptor, {
    ability_id: "deck-planner",
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    look: { player: "self", count: 4, as: "looked" },
    choose: {
      source_token: "looked",
      min: 0,
      max: 1,
      filters: {},
      as: "bottom",
      grammar: "source_range",
    },
    move: { player: "self", cards: "$bottom", to: "deck_bottom" },
    remainder: {
      player: "self",
      source: "$looked",
      except: "$bottom",
      order: "player_choice",
    },
  });
});

Deno.test("first deck-planning choice binds top four without detaching them and stays private", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDeckPlanning(s, { card_id: "planner" })!;
  const before = structuredClone(s.players["1"].deck);
  const pending = runtimeV02CreateActiveAbilityDeckPlanningChoice(
    s, 1, descriptor, source(), "planning-1",
  );
  equal(s.players["1"].deck, before);
  equal(pending.options.map((x) => x.ref.uid), ["a", "b", "c", "d"]);
  equal(runtimeV02PendingActiveAbilityDeckPlanningChoiceView(pending, 2), {
    id: "planning-1",
    seat: 1,
    kind: "plan_own_deck_top",
    waiting: true,
  });
});

Deno.test("selecting one card moves it to deck bottom and advances with a fresh order choice", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDeckPlanning(s, { card_id: "planner" })!;
  const pending = runtimeV02CreateActiveAbilityDeckPlanningChoice(
    s, 1, descriptor, source(), "planning-1",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const first = runtimeV02ResolveActiveAbilityDeckPlanningChoice(
    pending, 1, "planning-1", ["card:b"], s,
  );
  if (first.stage !== "order_required") throw new Error("order stage required");
  equal(s.players["1"].deck.map((x:any) => x.uid), ["a", "c", "d", "e", "b"]);
  equal(first.selected_count, 1);
  equal(first.pending_choice.stage, "order_remainder");
  if (first.pending_choice.id === pending.id) throw new Error("fresh stage choice id required");
  equal(first.pending_choice.options.map((x) => x.ref.uid), ["a", "c", "d"]);
});

Deno.test("remainder order choice rebinds live top window and commits through Card-Zone", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDeckPlanning(s, { card_id: "planner" })!;
  const pending = runtimeV02CreateActiveAbilityDeckPlanningChoice(
    s, 1, descriptor, source(), "planning-1",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const first = runtimeV02ResolveActiveAbilityDeckPlanningChoice(
    pending, 1, "planning-1", ["card:b"], s,
  );
  if (first.stage !== "order_required") throw new Error("order stage required");
  const second = runtimeV02ResolveActiveAbilityDeckPlanningChoice(
    first.pending_choice,
    1,
    first.pending_choice.id,
    ["card:d", "card:a", "card:c"],
    s,
  );
  if (second.stage !== "complete") throw new Error("complete stage required");
  equal(s.players["1"].deck.map((x:any) => x.uid), ["d", "a", "c", "e", "b"]);
  equal(second.selected_count, 1);
  equal(second.moved_to_deck_bottom_count, 1);
  equal(second.reordered_remainder_count, 3);
});

Deno.test("optional zero selection preserves all top cards for the order stage", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDeckPlanning(s, { card_id: "planner" })!;
  const pending = runtimeV02CreateActiveAbilityDeckPlanningChoice(
    s, 1, descriptor, source(), "planning-1",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const first = runtimeV02ResolveActiveAbilityDeckPlanningChoice(
    pending, 1, "planning-1", [], s,
  );
  if (first.stage !== "order_required") throw new Error("order stage required");
  equal(first.pending_choice.options.map((x) => x.ref.uid), ["a", "b", "c", "d"]);
  equal(s.players["1"].deck.map((x:any) => x.uid), ["a", "b", "c", "d", "e"]);
});

Deno.test("deck drift between private stages fails closed before reorder mutation", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDeckPlanning(s, { card_id: "planner" })!;
  const pending = runtimeV02CreateActiveAbilityDeckPlanningChoice(
    s, 1, descriptor, source(), "planning-1",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const first = runtimeV02ResolveActiveAbilityDeckPlanningChoice(
    pending, 1, "planning-1", ["card:b"], s,
  );
  if (first.stage !== "order_required") throw new Error("order stage required");
  [s.players["1"].deck[0], s.players["1"].deck[1]] =
    [s.players["1"].deck[1], s.players["1"].deck[0]];
  const before = structuredClone(s.players["1"].deck);
  throws(
    () => runtimeV02ResolveActiveAbilityDeckPlanningChoice(
      first.pending_choice,
      1,
      first.pending_choice.id,
      ["card:d", "card:a", "card:c"],
      s,
    ),
    "deck_top_changed",
  );
  equal(s.players["1"].deck, before);
});
