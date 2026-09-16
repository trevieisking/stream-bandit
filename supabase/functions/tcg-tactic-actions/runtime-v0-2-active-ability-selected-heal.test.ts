import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02BuildActiveAbilitySelectedHealChoice,
  runtimeV02PendingActiveAbilitySelectedHealChoiceView,
  runtimeV02ResolveActiveAbilitySelectedHealChoice,
  structuredRuntimeActiveAbilitySelectedHeal,
} from "../_shared/tcg-match-active-ability-selected-heal-v0-2.ts";

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

function envelope(id: string, name: string, cardFamily = "Tactic", element: string | null = null) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: cardFamily,
    ...(element ? { element } : {}),
  };
}

function selectedHealAbility() {
  return {
    id: "growth-link",
    name: "Growth Link",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [
        {
          predicate: "event_occurred",
          event: "device_resolved",
          controller: "self",
          window: "current_turn",
          min_count: 1,
        },
        {
          predicate: "legal_card_available",
          controller: "self",
          zone: "field",
          filters: { card_family: "Creature", element: "Grove", damaged: true },
        },
      ],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: 1,
        filters: { element: "Grove", damaged: true },
        as: "growth_target",
      },
      { op: "HEAL", target: "$growth_target", amount: 20 },
    ],
  };
}

function creature(uid: string, cardId: string, damage = 0) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
    relic: null,
    damage,
    shield: 0,
  };
}

function stateWith(
  ability: Record<string, unknown> = selectedHealAbility(),
  options: { deviceTurn?: number; targetDamage?: number; secondGroveDamage?: number } = {},
) {
  const sourceId = "test-active-growth-source";
  const targetId = "test-grove-target";
  const secondGroveId = "test-grove-target-two";
  const tideId = "test-tide-target";
  const sourceDefinition = {
    ...envelope(sourceId, "Test Growth Source", "Creature", "Grove"),
    creature: { stage: "Adult", ability, attacks: [] },
  };
  const targetDefinition = {
    ...envelope(targetId, "Test Grove Target", "Creature", "Grove"),
    creature: { stage: "Standalone", ability: null, attacks: [] },
  };
  const secondGroveDefinition = {
    ...envelope(secondGroveId, "Test Grove Target Two", "Creature", "Grove"),
    creature: { stage: "Standalone", ability: null, attacks: [] },
  };
  const tideDefinition = {
    ...envelope(tideId, "Test Tide Target", "Creature", "Tide"),
    creature: { stage: "Standalone", ability: null, attacks: [] },
  };
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 11,
    active_seat: 1,
    turn_flags: {
      "1": { device_turn: options.deviceTurn ?? 11 },
      "2": {},
    },
    players: {
      "1": {
        vanguard: creature("source-1", sourceId, 0),
        reserve: [
          creature("target-1", targetId, options.targetDamage ?? 30),
          creature("target-2", secondGroveId, options.secondGroveDamage ?? 0),
          creature("target-3", tideId, 40),
          null,
        ],
        deck: [],
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
      [targetId]: { card_id: targetId, definition_v0_2: targetDefinition },
      [secondGroveId]: { card_id: secondGroveId, definition_v0_2: secondGroveDefinition },
      [tideId]: { card_id: tideId, definition_v0_2: tideDefinition },
    },
  } as Record<string, unknown>;
}

function sourceRef() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-1", "test-active-growth-source"),
  };
}

function seedLimitReceipt(state: Record<string, unknown>, turn = 11) {
  state.runtime_active_ability_limits_v0_2 = [
    { turn_seq: turn, controller_seat: 1, ability_id: "growth-link", count: 1 },
  ];
}

function prepared() {
  const state = stateWith();
  const descriptor = structuredRuntimeActiveAbilitySelectedHeal(
    state,
    { card_id: "test-active-growth-source" },
  )!;
  const choice = runtimeV02BuildActiveAbilitySelectedHealChoice(
    state,
    1,
    descriptor,
    sourceRef(),
    "growth-choice-1",
  );
  return { state, descriptor, choice };
}

Deno.test("active selected-heal descriptor is exact, registry-driven and parameterized", () => {
  const state = stateWith();
  assertEquals(
    structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" }),
    {
      ability_id: "growth-link",
      timing: "own_turn",
      limit: { scope: "turn", count: 1, owner: "controller" },
      required_event: {
        event: "device_resolved",
        controller: "self",
        window: "current_turn",
        min_count: 1,
      },
      target: {
        controller: "self",
        zone: "field",
        count: 1,
        card_family: "Creature",
        element: "Grove",
        damaged: true,
      },
      heal_amount: 20,
    },
  );

  const unrelated = selectedHealAbility() as any;
  unrelated.steps = [{ op: "DRAW", player: "self", count: 1 }];
  assertEquals(
    structuredRuntimeActiveAbilitySelectedHeal(stateWith(unrelated), { card_id: "test-active-growth-source" }),
    null,
  );

  const legacy = stateWith();
  delete legacy.runtime_registry_v0_2;
  assertEquals(
    structuredRuntimeActiveAbilitySelectedHeal(legacy, { card_id: "test-active-growth-source" }),
    null,
  );
});

Deno.test("preflight requires a resolved Device this turn and a damaged matching friendly Creature", () => {
  let state = stateWith(selectedHealAbility(), { deviceTurn: 10 });
  let descriptor = structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" })!;
  assertThrows(
    () => runtimeV02BuildActiveAbilitySelectedHealChoice(state, 1, descriptor, sourceRef(), "growth-choice"),
    "device_not_resolved_this_turn",
  );

  state = stateWith(selectedHealAbility(), { targetDamage: 0, secondGroveDamage: 0 });
  descriptor = structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" })!;
  assertThrows(
    () => runtimeV02BuildActiveAbilitySelectedHealChoice(state, 1, descriptor, sourceRef(), "growth-choice"),
    "target_unavailable",
  );

  state = stateWith();
  descriptor = structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" })!;
  const choice = runtimeV02BuildActiveAbilitySelectedHealChoice(state, 1, descriptor, sourceRef(), "growth-choice");
  assertEquals(choice.options.map((option) => ({ id: option.id, label: option.label })), [
    { id: "creature:reserve:0:target-1", label: "Reserve 1" },
  ]);
});

Deno.test("selected-heal choice is reconnect-stable and private without exposing anchored identities to the opponent", () => {
  const { choice } = prepared();
  assertEquals(runtimeV02PendingActiveAbilitySelectedHealChoiceView(choice, 2), {
    id: "growth-choice-1",
    seat: 1,
    kind: "heal_one_damaged_friendly_creature",
    waiting: true,
  });
  assertEquals(runtimeV02PendingActiveAbilitySelectedHealChoiceView(choice, 1), {
    id: "growth-choice-1",
    seat: 1,
    kind: "heal_one_damaged_friendly_creature",
    prompt: "Choose one damaged Grove Creature to heal",
    min: 1,
    max: 1,
    options: [{ id: "creature:reserve:0:target-1", label: "Reserve 1" }],
  });
});

Deno.test("resolution is seat, choice, turn, source, Device-event and full target-set bound", () => {
  let pair = prepared();
  seedLimitReceipt(pair.state);
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 2, "growth-choice-1", ["creature:reserve:0:target-1"], pair.state),
    "not_yours",
  );
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 1, "stale", ["creature:reserve:0:target-1"], pair.state),
    "stale_id",
  );
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 1, "growth-choice-1", ["missing"], pair.state),
    "unknown_option",
  );

  pair = prepared();
  seedLimitReceipt(pair.state);
  pair.state.turn_seq = 12;
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 1, "growth-choice-1", ["creature:reserve:0:target-1"], pair.state),
    "turn_changed",
  );

  pair = prepared();
  seedLimitReceipt(pair.state);
  (pair.state.turn_flags as any)["1"].device_turn = 10;
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 1, "growth-choice-1", ["creature:reserve:0:target-1"], pair.state),
    "device_event_changed",
  );

  pair = prepared();
  seedLimitReceipt(pair.state);
  (pair.state.players as any)["1"].vanguard.stack[0] = card("source-2", "test-active-growth-source");
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 1, "growth-choice-1", ["creature:reserve:0:target-1"], pair.state),
    "source_changed",
  );

  pair = prepared();
  seedLimitReceipt(pair.state);
  (pair.state.players as any)["1"].reserve[1].damage = 10;
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(pair.choice, 1, "growth-choice-1", ["creature:reserve:0:target-1"], pair.state),
    "target_set_changed",
  );
});

Deno.test("resolution requires the existing canonical active-Ability limit receipt before any healing", () => {
  const { state, choice } = prepared();
  const target = (state.players as any)["1"].reserve[0];
  const before = target.damage;
  assertThrows(
    () => runtimeV02ResolveActiveAbilitySelectedHealChoice(
      choice,
      1,
      "growth-choice-1",
      ["creature:reserve:0:target-1"],
      state,
    ),
    "limit_receipt_missing",
  );
  assertEquals(target.damage, before);
  assertEquals(state.effect_events, undefined);
});

Deno.test("selected active-Ability healing uses the canonical ability heal packet without double healing", () => {
  const state = stateWith(selectedHealAbility(), { targetDamage: 15 });
  const descriptor = structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" })!;
  const choice = runtimeV02BuildActiveAbilitySelectedHealChoice(
    state,
    1,
    descriptor,
    sourceRef(),
    "growth-choice-1",
  );
  seedLimitReceipt(state);
  const resolved = runtimeV02ResolveActiveAbilitySelectedHealChoice(
    choice,
    1,
    "growth-choice-1",
    ["creature:reserve:0:target-1"],
    state,
  );
  assertEquals(resolved, {
    ability_id: "growth-link",
    choice_id: "growth-choice-1",
    requested_heal: 20,
    actual_heal: 15,
    emitted_packet_ids: ["heal:11:1"],
  });
  assertEquals((state.players as any)["1"].reserve[0].damage, 0);
  assertEquals(state.runtime_v0_2_event_seq, 1);
  assertEquals((state.effect_events as any[]).map((event) => ({
    event: event.event,
    id: event.id,
    requested_amount: event.requested_amount,
    actual_amount: event.actual_amount,
    action_kind: event.source?.action_kind,
    action_id: event.source?.action_id,
    source_card_id: event.source?.card_id,
    target_card_id: event.target?.card_id,
    target_element: event.target?.element,
    target_where: event.target?.where,
    target_index: event.target?.index,
  })), [{
    event: "after_heal_packet",
    id: "heal:11:1",
    requested_amount: 20,
    actual_amount: 15,
    action_kind: "ability",
    action_id: "growth-link",
    source_card_id: "test-active-growth-source",
    target_card_id: "test-grove-target",
    target_element: "Grove",
    target_where: "reserve",
    target_index: 0,
  }]);
});

Deno.test("malformed matching programs fail closed and the preflight never becomes a second once-per-turn owner", () => {
  const wrongEvent = selectedHealAbility() as any;
  wrongEvent.requirements.all[0].event = "attack_declared";
  assertThrows(
    () => structuredRuntimeActiveAbilitySelectedHeal(stateWith(wrongEvent), { card_id: "test-active-growth-source" }),
    "event_requirement_unsupported",
  );

  const wrongTarget = selectedHealAbility() as any;
  wrongTarget.steps[1].target = "$different";
  assertThrows(
    () => structuredRuntimeActiveAbilitySelectedHeal(stateWith(wrongTarget), { card_id: "test-active-growth-source" }),
    "target_variable_mismatch",
  );

  const wrongFilter = selectedHealAbility() as any;
  wrongFilter.requirements.all[1].filters.element = "Tide";
  assertThrows(
    () => structuredRuntimeActiveAbilitySelectedHeal(stateWith(wrongFilter), { card_id: "test-active-growth-source" }),
    "legal_filters_unsupported",
  );

  let state = stateWith();
  let descriptor = structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" })!;
  seedLimitReceipt(state);
  assertThrows(
    () => runtimeV02BuildActiveAbilitySelectedHealChoice(state, 1, descriptor, sourceRef(), "growth-choice"),
    "turn_limit_reached",
  );

  state = stateWith();
  descriptor = structuredRuntimeActiveAbilitySelectedHeal(state, { card_id: "test-active-growth-source" })!;
  state.runtime_active_ability_limits_v0_2 = [
    { turn_seq: 10, controller_seat: 1, ability_id: "growth-link", count: 1 },
  ];
  (state.turn_flags as any)["1"].device_turn = 12;
  state.turn_seq = 12;
  const nextTurn = runtimeV02BuildActiveAbilitySelectedHealChoice(state, 1, descriptor, sourceRef(), "growth-choice-next");
  assertEquals(nextTurn.turn_seq, 12);
  assertEquals((state.runtime_active_ability_limits_v0_2 as any[]).length, 1, "preflight must not write the limit ledger");
});
