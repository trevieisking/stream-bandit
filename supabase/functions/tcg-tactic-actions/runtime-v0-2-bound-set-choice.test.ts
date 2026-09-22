import {
  runtimeV02BindDeckTopSet,
  runtimeV02BoundDeckSetAfterRemoval,
  runtimeV02BoundSetChoiceOptions,
  runtimeV02NormalizeChooseFromSetStep,
  runtimeV02RebindBoundDeckSet,
  runtimeV02ResolveBoundSetChoice,
} from "../_shared/tcg-match-bound-set-choice-v0-2.ts";
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
function def(
  id: string,
  family: string,
  element: string,
  subtype: string | null = null,
) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: family,
      element,
      creature: family === "Creature"
        ? { stage: "Standalone", hp: 100, withdrawal: 1, reward_value: 1, ability: null, attacks: [] }
        : null,
      tactic: family === "Tactic"
        ? { subtype, program: null, listeners: [], continuous: [] }
        : null,
      essence: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": {
        deck: [
          { uid: "g1", card_id: "gale-creature" },
          { uid: "v1", card_id: "volt-creature" },
          { uid: "d1", card_id: "device" },
          { uid: "a1", card_id: "ally" },
          { uid: "g2", card_id: "gale-creature-2" },
        ],
        hand: [], discard: [], rewards: [],
      },
      "2": { deck: [], hand: [], discard: [], rewards: [] },
    },
    card_index: {
      "gale-creature": def("gale-creature", "Creature", "Gale"),
      "gale-creature-2": def("gale-creature-2", "Creature", "Gale"),
      "volt-creature": def("volt-creature", "Creature", "Volt"),
      "device": def("device", "Tactic", "Volt", "Device"),
      "ally": def("ally", "Tactic", "Gale", "Ally"),
    },
  } as Record<string, any>;
}

Deno.test("CHOOSE_FROM_SET owner normalizes both frozen grammar families", () => {
  equal(runtimeV02NormalizeChooseFromSetStep({
    op: "CHOOSE_FROM_SET",
    source: "$looked",
    min: 0,
    max: 1,
    as: "chosen",
  }), {
    source_token: "looked",
    min: 0,
    max: 1,
    filters: {},
    as: "chosen",
    grammar: "source_range",
  });
  equal(runtimeV02NormalizeChooseFromSetStep({
    op: "CHOOSE_FROM_SET",
    player: "self",
    set: "$looked",
    selection: {
      min: 0,
      max: 2,
      filters: { card_family: "Creature", element: "Gale" },
    },
    as: "chosen",
  }), {
    source_token: "looked",
    min: 0,
    max: 2,
    filters: { card_family: "Creature", element: "Gale" },
    as: "chosen",
    grammar: "set_selection",
  });
});

Deno.test("owner supports frozen filters.any Creature-or-Device grammar", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeChooseFromSetStep({
    op: "CHOOSE_FROM_SET",
    source: "$looked",
    min: 0,
    max: 1,
    filters: {
      any: [
        { element: "Volt", card_family: "Creature" },
        { card_family: "Tactic", tactic_subtype: "Device" },
      ],
    },
    as: "chosen",
  });
  const bound = runtimeV02BindDeckTopSet(s, 1, 1, 5);
  equal(
    runtimeV02BoundSetChoiceOptions(s, descriptor, bound.cards).map((x) => x.ref.uid),
    ["v1", "d1"],
  );
});

Deno.test("bound deck set inspection never detaches cards and rebinding fails closed on deck drift", () => {
  const s = state();
  const before = structuredClone((s.players as any)["1"].deck);
  const bound = runtimeV02BindDeckTopSet(s, 1, 1, 3);
  equal(bound.cards.map((x) => x.uid), ["g1", "v1", "d1"]);
  equal((s.players as any)["1"].deck, before);

  equal(runtimeV02RebindBoundDeckSet(s, bound.provenance), bound.cards);
  [(s.players as any)["1"].deck[0], (s.players as any)["1"].deck[1]] =
    [(s.players as any)["1"].deck[1], (s.players as any)["1"].deck[0]];
  throws(
    () => runtimeV02RebindBoundDeckSet(s, bound.provenance),
    "deck_top_changed",
  );
});

Deno.test("choice resolution enforces membership, filters and optional zero selection", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeChooseFromSetStep({
    op: "CHOOSE_FROM_SET",
    player: "self",
    set: "$looked",
    selection: {
      min: 0,
      max: 2,
      filters: { card_family: "Creature", element: "Gale" },
    },
    as: "chosen",
  });
  const bound = runtimeV02BindDeckTopSet(s, 1, 1, 5);
  equal(runtimeV02ResolveBoundSetChoice(s, descriptor, bound.cards, []), []);
  equal(
    runtimeV02ResolveBoundSetChoice(
      s,
      descriptor,
      bound.cards,
      [{ uid: "g1", card_id: "gale-creature" }, { uid: "g2", card_id: "gale-creature-2" }],
    ).map((x) => x.uid),
    ["g1", "g2"],
  );
  throws(
    () => runtimeV02ResolveBoundSetChoice(
      s,
      descriptor,
      bound.cards,
      [{ uid: "d1", card_id: "device" }],
    ),
    "selected_filter_stale",
  );
});

Deno.test("provenance records removed cards while preserving exact live remainder order", () => {
  const s = state();
  const bound = runtimeV02BindDeckTopSet(s, 1, 1, 3);
  (s.players as any)["1"].deck.splice(1, 1);
  const next = runtimeV02BoundDeckSetAfterRemoval(bound.provenance, ["v1"]);
  equal(runtimeV02RebindBoundDeckSet(s, next).map((x) => x.uid), ["g1", "d1"]);
});

Deno.test("CHOOSE_FROM_SET grammar fails closed outside the frozen two-family contract", () => {
  throws(
    () => runtimeV02NormalizeChooseFromSetStep({
      op: "CHOOSE_FROM_SET",
      source: "$looked",
      min: 0,
      max: 1,
      filters: { mystery: true },
      as: "chosen",
    }),
    "filter_unsupported",
  );
  throws(
    () => runtimeV02NormalizeChooseFromSetStep({
      op: "CHOOSE_FROM_SET",
      player: "opponent",
      set: "$looked",
      selection: { min: 0, max: 1, filters: {} },
      as: "chosen",
    }),
    "player_unsupported",
  );
});
