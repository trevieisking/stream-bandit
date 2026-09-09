import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";
import {
  runtimeV02ResolveAfterDamageServerTopDeckConditionalMove,
  structuredRuntimeAfterDamageServerTopDeckConditionalMove,
} from "../_shared/tcg-match-attack-server-top-deck-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

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

function envelope(id: string, element = "Neutral") {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: id === "test-server-inspector" ? "Creature" : "Tactic",
    element,
  };
}

function knownHorizonShape() {
  return [
    {
      op: "INSPECT_ZONE",
      player: "self",
      zone: "deck_top",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "server_only",
      return_policy: "same_position",
      as: "top_card",
    },
    {
      op: "IF",
      when: { predicate: "card_matches", card: "$top_card", filters: { element: "Astral" } },
      then: [{ op: "MOVE_CARDS", player: "self", cards: "$top_card", to: "hand" }],
    },
  ];
}

function stateWith(
  afterDamage: unknown[] = knownHorizonShape(),
  deck = [card("deck-a", "astral-top"), card("deck-b", "ember-top")],
) {
  const sourceId = "test-server-inspector";
  const sourceDefinition = {
    ...envelope(sourceId, "Astral"),
    creature: {
      stage: "Adult",
      attacks: [
        {
          id: "plain-claw",
          name: "Plain Claw",
          cost: [],
          base_damage: 70,
          damage_formula: null,
          requirements: [],
          on_declare: [],
          before_damage: [],
          after_damage: [],
        },
        {
          id: "server-horizon",
          name: "Server Horizon",
          cost: [],
          base_damage: 110,
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
    turn_seq: 9,
    active_seat: 1,
    players: {
      "1": {
        vanguard: { stack: [card("source-1", sourceId)], essence: [], relic: null, damage: 0, shield: 0 },
        reserve: [null, null, null, null],
        deck: structuredClone(deck),
        hand: [],
        rewards: [],
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
      "astral-top": { card_id: "astral-top", definition_v0_2: envelope("astral-top", "Astral") },
      "ember-top": { card_id: "ember-top", definition_v0_2: envelope("ember-top", "Ember") },
    },
  } as Record<string, unknown>;
}

Deno.test("server-only top-deck conditional move descriptor is registry-driven, exact and slot-scoped", () => {
  const state = stateWith();
  assertEquals(
    structuredRuntimeAfterDamageServerTopDeckConditionalMove(state, { card_id: "test-server-inspector" }, 1),
    null,
  );
  assertEquals(
    structuredRuntimeAfterDamageServerTopDeckConditionalMove(state, { card_id: "test-server-inspector" }, 2),
    {
      attack_id: "server-horizon",
      phase: "after_damage",
      inspect: {
        player: "self",
        zone: "deck_top",
        min: 1,
        max: 1,
        visibility: "server_only",
        return_policy: "same_position",
      },
      match_filters: { element: "Astral" },
      destination: "hand",
    },
  );
});

Deno.test("matching server-only top card moves to hand without creating a player hidden-information view", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageServerTopDeckConditionalMove(
    state,
    { card_id: "test-server-inspector" },
    2,
  )!;
  const resolved = runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
    state,
    1,
    descriptor,
    card("source-1", "test-server-inspector"),
  );
  assertEquals(resolved, { attack_id: "server-horizon", inspected_count: 1, matched: true, moved_count: 1 });
  const player = (state.players as any)["1"];
  assertEquals(player.deck.map((item: any) => item.uid), ["deck-b"]);
  assertEquals(player.hand.map((item: any) => item.uid), ["deck-a"]);
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1), []);
});

Deno.test("nonmatching server-only top card stays exactly in place and leaks no identity", () => {
  const state = stateWith(knownHorizonShape(), [card("deck-b", "ember-top"), card("deck-a", "astral-top")]);
  const descriptor = structuredRuntimeAfterDamageServerTopDeckConditionalMove(
    state,
    { card_id: "test-server-inspector" },
    2,
  )!;
  const resolved = runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
    state,
    1,
    descriptor,
    card("source-1", "test-server-inspector"),
  );
  assertEquals(resolved, { attack_id: "server-horizon", inspected_count: 1, matched: false, moved_count: 0 });
  const player = (state.players as any)["1"];
  assertEquals(player.deck.map((item: any) => item.uid), ["deck-b", "deck-a"]);
  assertEquals(player.hand, []);
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(state, 1), []);
});

Deno.test("server-only resolver rebinds active seat and current Vanguard source before mutation", () => {
  let state = stateWith();
  let descriptor = structuredRuntimeAfterDamageServerTopDeckConditionalMove(
    state,
    { card_id: "test-server-inspector" },
    2,
  )!;
  assertThrows(
    () => runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
      state,
      2,
      descriptor,
      card("source-1", "test-server-inspector"),
    ),
    "active_seat_mismatch",
  );

  state = stateWith();
  descriptor = structuredRuntimeAfterDamageServerTopDeckConditionalMove(
    state,
    { card_id: "test-server-inspector" },
    2,
  )!;
  (state.players as any)["1"].vanguard.stack[0] = card("source-2", "test-server-inspector");
  assertThrows(
    () => runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
      state,
      1,
      descriptor,
      card("source-1", "test-server-inspector"),
    ),
    "source_vanguard_changed",
  );
});

Deno.test("empty deck is a deterministic no-op while a missing structured top definition fails closed", () => {
  let state = stateWith(knownHorizonShape(), []);
  let descriptor = structuredRuntimeAfterDamageServerTopDeckConditionalMove(
    state,
    { card_id: "test-server-inspector" },
    2,
  )!;
  assertEquals(
    runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
      state,
      1,
      descriptor,
      card("source-1", "test-server-inspector"),
    ),
    { attack_id: "server-horizon", inspected_count: 0, matched: false, moved_count: 0 },
  );

  state = stateWith(knownHorizonShape(), [card("unknown", "missing-definition")]);
  descriptor = structuredRuntimeAfterDamageServerTopDeckConditionalMove(
    state,
    { card_id: "test-server-inspector" },
    2,
  )!;
  assertThrows(
    () => runtimeV02ResolveAfterDamageServerTopDeckConditionalMove(
      state,
      1,
      descriptor,
      card("source-1", "test-server-inspector"),
    ),
    "top_definition_required",
  );
});

Deno.test("malformed related server-only programs fail closed and unrelated programs stay outside the owner", () => {
  const wrongVisibility = knownHorizonShape() as any[];
  wrongVisibility[0].visibility = "controller_private";
  assertThrows(
    () => structuredRuntimeAfterDamageServerTopDeckConditionalMove(
      stateWith(wrongVisibility),
      { card_id: "test-server-inspector" },
      2,
    ),
    "inspect_shape_unsupported",
  );

  const extraFilter = knownHorizonShape() as any[];
  extraFilter[1].when.filters.card_family = "Creature";
  assertThrows(
    () => structuredRuntimeAfterDamageServerTopDeckConditionalMove(
      stateWith(extraFilter),
      { card_id: "test-server-inspector" },
      2,
    ),
    "match_filter_unsupported",
  );

  const wrongBinding = knownHorizonShape() as any[];
  wrongBinding[1].then[0].cards = "$something_else";
  assertThrows(
    () => structuredRuntimeAfterDamageServerTopDeckConditionalMove(
      stateWith(wrongBinding),
      { card_id: "test-server-inspector" },
      2,
    ),
    "move_shape_unsupported",
  );

  const unrelated = [{ op: "DRAW", player: "self", count: 1 }, { op: "HEAL", target: "$source_creature", amount: 10 }];
  assertEquals(
    structuredRuntimeAfterDamageServerTopDeckConditionalMove(
      stateWith(unrelated),
      { card_id: "test-server-inspector" },
      2,
    ),
    null,
  );

  const legacy = stateWith();
  delete legacy.runtime_registry_v0_2;
  assertEquals(
    structuredRuntimeAfterDamageServerTopDeckConditionalMove(
      legacy,
      { card_id: "test-server-inspector" },
      2,
    ),
    null,
  );
});
