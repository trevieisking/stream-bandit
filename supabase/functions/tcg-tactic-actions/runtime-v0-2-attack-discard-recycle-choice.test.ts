import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02CreateAttackDiscardRecycleChoice,
  runtimeV02ResolveAttackDiscardRecycleChoice,
  structuredRuntimeAfterDamageDiscardRecycleChoice,
} from "../_shared/tcg-match-attack-discard-recycle-choice-v0-2.ts";
import { runtimeV02PendingAttackChoiceView } from "../_shared/tcg-match-attack-choice-v0-2.ts";

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

function mycelialBloomProgram(): unknown[] {
  return [
    {
      op: "SELECT_CARDS",
      player: "self",
      zone: "discard",
      selection: { min: 0, max: 1, filters: { card_family: "Tactic", tactic_subtype: "Device" } },
      as: "recycled",
    },
    { op: "MOVE_CARDS", player: "self", cards: "$recycled", to: "deck_bottom", order: "preserve" },
  ];
}

function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function definition(id: string, name: string, cardFamily: string, extra: Record<string, unknown> = {}) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: cardFamily,
    ...extra,
  };
}

function snapshotRow(value: Record<string, unknown>) {
  return {
    card_id: value.id,
    definition_v0_2: value,
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function sourceDefinition(afterDamage: unknown[]) {
  return definition("test-mycelial-creature", "Test Mycelial Creature", "Creature", {
    creature: {
      attacks: [
        {
          id: "plain-hit",
          name: "Plain Hit",
          cost: [{ element: "Grove", amount: 1 }],
          base_damage: 20,
          damage_formula: null,
          requirements: [],
          on_declare: [],
          before_damage: [],
          after_damage: [],
        },
        {
          id: "mycelial-bloom-test",
          name: "Mycelial Bloom Test",
          cost: [{ element: "Grove", amount: 3 }],
          base_damage: 110,
          damage_formula: null,
          requirements: [],
          on_declare: [],
          before_damage: [],
          after_damage: afterDamage,
        },
      ],
      ability: {
        id: "same-shape-ability",
        name: "Same Shape Ability",
        mode: "active",
        steps: mycelialBloomProgram(),
      },
    },
  });
}

function stateWith(
  afterDamage: unknown[] = mycelialBloomProgram(),
  discard = [
    card("device-a-1", "device-a"),
    card("ally-a-1", "ally-a"),
    card("device-b-1", "device-b"),
  ],
) {
  const sourceCardId = "test-mycelial-creature";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    active_seat: 1,
    players: {
      "1": {
        vanguard: { stack: [card("source-1", sourceCardId)], essence: [], relic: null, damage: 0, shield: 0 },
        reserve: [null, null, null, null],
        discard: structuredClone(discard),
        deck: [card("deck-1", "creature-a")],
        hand: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        discard: [],
        deck: [],
        hand: [],
      },
    },
    card_index: {
      [sourceCardId]: snapshotRow(sourceDefinition(afterDamage)),
      "device-a": snapshotRow(definition("device-a", "Rootway Map", "Tactic", { tactic: { subtype: "Device" } })),
      "device-b": snapshotRow(definition("device-b", "Seed Satchel", "Tactic", { tactic: { subtype: "Device" } })),
      "ally-a": snapshotRow(definition("ally-a", "Forager Nia", "Tactic", { tactic: { subtype: "Ally" } })),
      "creature-a": snapshotRow(definition("creature-a", "Budburrow", "Creature", { creature: { attacks: [] } })),
    },
  } as Record<string, unknown>;
}

Deno.test("discard recycle descriptor is registry-driven, exact, attack-only and optional", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageDiscardRecycleChoice(state, { card_id: "test-mycelial-creature" }, 2);
  assertEquals(descriptor, {
    attack_id: "mycelial-bloom-test",
    phase: "after_damage",
    selection: {
      min: 0,
      max: 1,
      zone: "discard",
      filters: { card_family: "Tactic", tactic_subtype: "Device" },
    },
    destination: "deck_bottom",
    order: "preserve",
  });
  assertEquals(structuredRuntimeAfterDamageDiscardRecycleChoice(state, { card_id: "test-mycelial-creature" }, 1), null);
});

Deno.test("pending discard recycle choice is private, filters Device Tactics and does not mutate discard", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageDiscardRecycleChoice(state, { card_id: "test-mycelial-creature" }, 2)!;
  const choice = runtimeV02CreateAttackDiscardRecycleChoice(state, 1, descriptor, card("source-1", "test-mycelial-creature"), "choice-1")!;
  const player = (state.players as any)["1"];
  assertEquals(player.discard.map((item: any) => item.uid), ["device-a-1", "ally-a-1", "device-b-1"]);
  assertEquals(choice.options.map((option) => [option.id, option.label]), [
    ["card:device-a-1", "Rootway Map"],
    ["card:device-b-1", "Seed Satchel"],
  ]);
  assertEquals(runtimeV02PendingAttackChoiceView(choice, 2), {
    id: "choice-1",
    seat: 1,
    kind: "select_discard_device_to_deck_bottom",
    waiting: true,
  });
  assertEquals((runtimeV02PendingAttackChoiceView(choice, 1) as any).options, [
    { id: "card:device-a-1", label: "Rootway Map" },
    { id: "card:device-b-1", label: "Seed Satchel" },
  ]);
});

Deno.test("resolving one choice moves exactly that Device from discard to deck bottom", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageDiscardRecycleChoice(state, { card_id: "test-mycelial-creature" }, 2)!;
  const choice = runtimeV02CreateAttackDiscardRecycleChoice(state, 1, descriptor, card("source-1", "test-mycelial-creature"), "choice-1")!;
  const result = runtimeV02ResolveAttackDiscardRecycleChoice(choice, 1, "choice-1", ["card:device-b-1"], state);
  const player = (state.players as any)["1"];
  assertEquals(result, { attack_id: "mycelial-bloom-test", choice_id: "choice-1", selected_count: 1, moved_count: 1 });
  assertEquals(player.discard.map((item: any) => item.uid), ["device-a-1", "ally-a-1"]);
  assertEquals(player.deck.map((item: any) => item.uid), ["deck-1", "device-b-1"]);
});

Deno.test("optional skip moves nothing and no legal Device produces no pending choice", () => {
  const state = stateWith();
  const descriptor = structuredRuntimeAfterDamageDiscardRecycleChoice(state, { card_id: "test-mycelial-creature" }, 2)!;
  const choice = runtimeV02CreateAttackDiscardRecycleChoice(state, 1, descriptor, card("source-1", "test-mycelial-creature"), "choice-1")!;
  const result = runtimeV02ResolveAttackDiscardRecycleChoice(choice, 1, "choice-1", [], state);
  assertEquals(result, { attack_id: "mycelial-bloom-test", choice_id: "choice-1", selected_count: 0, moved_count: 0 });
  assertEquals((state.players as any)["1"].discard.map((item: any) => item.uid), ["device-a-1", "ally-a-1", "device-b-1"]);
  assertEquals((state.players as any)["1"].deck.map((item: any) => item.uid), ["deck-1"]);

  const noDevice = stateWith(mycelialBloomProgram(), [card("ally-a-1", "ally-a")]);
  const noDeviceDescriptor = structuredRuntimeAfterDamageDiscardRecycleChoice(noDevice, { card_id: "test-mycelial-creature" }, 2)!;
  assertEquals(runtimeV02CreateAttackDiscardRecycleChoice(noDevice, 1, noDeviceDescriptor, card("source-1", "test-mycelial-creature"), "choice-2"), null);
});

Deno.test("discard recycle choice rejects wrong seat, stale id, oversized choice, unknown option, turn/source and legal-set drift", () => {
  const base = () => {
    const state = stateWith();
    const descriptor = structuredRuntimeAfterDamageDiscardRecycleChoice(state, { card_id: "test-mycelial-creature" }, 2)!;
    const choice = runtimeV02CreateAttackDiscardRecycleChoice(state, 1, descriptor, card("source-1", "test-mycelial-creature"), "choice-1")!;
    return { state, choice };
  };

  let pair = base();
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 2, "choice-1", [], pair.state), "not_yours");
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 1, "old-choice", [], pair.state), "stale_id");
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 1, "choice-1", ["card:device-a-1", "card:device-b-1"], pair.state), "zero_or_one_required");
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 1, "choice-1", ["card:missing"], pair.state), "unknown_option");

  pair = base();
  pair.state.turn_seq = 8;
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 1, "choice-1", [], pair.state), "turn_changed");

  pair = base();
  (pair.state.players as any)["1"].vanguard.stack[0] = card("different-source", "test-mycelial-creature");
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 1, "choice-1", [], pair.state), "source_vanguard_changed");

  pair = base();
  (pair.state.players as any)["1"].discard.push(card("device-c-1", "device-a"));
  assertThrows(() => runtimeV02ResolveAttackDiscardRecycleChoice(pair.choice, 1, "choice-1", [], pair.state), "discard_set_changed");
});

Deno.test("matching malformed metadata fails closed while same-shape abilities and legacy-only matches stay outside the owner", () => {
  const wrongBounds = mycelialBloomProgram() as any[];
  wrongBounds[0].selection.min = 1;
  assertThrows(
    () => structuredRuntimeAfterDamageDiscardRecycleChoice(stateWith(wrongBounds), { card_id: "test-mycelial-creature" }, 2),
    "bounds_unsupported",
  );

  const wrongFilter = mycelialBloomProgram() as any[];
  wrongFilter[0].selection.filters.tactic_subtype = "Ally";
  assertThrows(
    () => structuredRuntimeAfterDamageDiscardRecycleChoice(stateWith(wrongFilter), { card_id: "test-mycelial-creature" }, 2),
    "filters_unsupported",
  );

  const wrongOrder = mycelialBloomProgram() as any[];
  wrongOrder[1].order = "player_choice";
  assertThrows(
    () => structuredRuntimeAfterDamageDiscardRecycleChoice(stateWith(wrongOrder), { card_id: "test-mycelial-creature" }, 2),
    "move_binding_unsupported",
  );

  const mixed = [...mycelialBloomProgram(), { op: "DRAW", player: "self", count: 1 }];
  assertEquals(structuredRuntimeAfterDamageDiscardRecycleChoice(stateWith(mixed), { card_id: "test-mycelial-creature" }, 2), null);

  const legacy = stateWith();
  delete legacy.runtime_registry_v0_2;
  assertEquals(structuredRuntimeAfterDamageDiscardRecycleChoice(legacy, { card_id: "test-mycelial-creature" }, 2), null);
});
