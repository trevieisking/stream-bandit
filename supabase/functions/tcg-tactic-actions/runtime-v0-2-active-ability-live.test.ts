import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
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

function rewardAbility() {
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
  return { stack: [card(uid, cardId)], essence: [], relic: null, damage, shield: 0 };
}

function rewardState() {
  const sourceId = "test-active-inspector";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 11,
    active_seat: 1,
    players: {
      "1": {
        vanguard: creature("source-reward", sourceId),
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        rewards: [card("reward-a", "alpha"), card("reward-b", "beta")],
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
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: {
          ...envelope(sourceId, "Test Active Inspector", "Creature", "Astral"),
          creature: { stage: "Adult", ability: rewardAbility(), attacks: [] },
        },
      },
      alpha: { card_id: "alpha", definition_v0_2: envelope("alpha", "Alpha") },
      beta: { card_id: "beta", definition_v0_2: envelope("beta", "Beta") },
    },
  } as Record<string, unknown>;
}

function selectedHealState(options: { deviceTurn?: number; targetDamage?: number } = {}) {
  const sourceId = "test-active-growth-source";
  const targetId = "test-grove-target";
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
        vanguard: creature("source-growth", sourceId),
        reserve: [creature("target-growth", targetId, options.targetDamage ?? 15), null, null, null],
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
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: {
          ...envelope(sourceId, "Test Growth Source", "Creature", "Grove"),
          creature: { stage: "Adult", ability: selectedHealAbility(), attacks: [] },
        },
      },
      [targetId]: {
        card_id: targetId,
        definition_v0_2: {
          ...envelope(targetId, "Test Grove Target", "Creature", "Grove"),
          creature: { stage: "Standalone", ability: null, attacks: [] },
        },
      },
    },
  } as Record<string, unknown>;
}

Deno.test("live active-Ability facade preserves the existing Reward family and its private viewer", () => {
  const state = rewardState();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    state,
    1,
    { where: "vanguard", index: null, instance: card("source-reward", "test-active-inspector") },
    "live-reward-choice",
  )!;
  assertEquals(pending.kind, "inspect_one_reward");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "memory-glimpse"), 1);
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 2), {
    id: "live-reward-choice",
    seat: 1,
    kind: "inspect_one_reward",
    waiting: true,
  });
  assertEquals(
    runtimeV02ResolveActiveAbilityLiveChoice(
      pending,
      1,
      "live-reward-choice",
      ["reward:1"],
      state,
    ),
    {
      kind: "inspect_one_reward",
      ability_id: "memory-glimpse",
      reward_inspected_count: 1,
      emitted_packet_ids: [],
    },
  );
});

Deno.test("live active-Ability facade activates selected healing through the same limit owner and canonical heal packet", () => {
  const state = selectedHealState({ targetDamage: 15 });
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    state,
    1,
    { where: "vanguard", index: null, instance: card("source-growth", "test-active-growth-source") },
    "live-growth-choice",
  )!;
  assertEquals(pending.kind, "heal_one_damaged_friendly_creature");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "growth-link"), 1);
  assertEquals(runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1), {
    id: "live-growth-choice",
    seat: 1,
    kind: "heal_one_damaged_friendly_creature",
    prompt: "Choose one damaged Grove Creature to heal",
    min: 1,
    max: 1,
    options: [{ id: "creature:reserve:0:target-growth", label: "Reserve 1" }],
  });
  assertEquals(
    runtimeV02ResolveActiveAbilityLiveChoice(
      pending,
      1,
      "live-growth-choice",
      ["creature:reserve:0:target-growth"],
      state,
    ),
    {
      kind: "heal_one_damaged_friendly_creature",
      ability_id: "growth-link",
      requested_heal: 20,
      actual_heal: 15,
      emitted_packet_ids: ["heal:11:1"],
    },
  );
  assertEquals((state.players as any)["1"].reserve[0].damage, 0);
  assertEquals((state.effect_events as any[]).map((event) => ({
    event: event.event,
    action_kind: event.source?.action_kind,
    action_id: event.source?.action_id,
    actual_amount: event.actual_amount,
  })), [{
    event: "after_heal_packet",
    action_kind: "ability",
    action_id: "growth-link",
    actual_amount: 15,
  }]);
});

Deno.test("selected-heal preflight failures cannot consume the canonical active-Ability receipt", () => {
  let state = selectedHealState({ deviceTurn: 10 });
  assertThrows(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      state,
      1,
      { where: "vanguard", index: null, instance: card("source-growth", "test-active-growth-source") },
      "no-device",
    ),
    "device_not_resolved_this_turn",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "growth-link"), 0);

  state = selectedHealState({ targetDamage: 0 });
  assertThrows(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      state,
      1,
      { where: "vanguard", index: null, instance: card("source-growth", "test-active-growth-source") },
      "no-target",
    ),
    "target_unavailable",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "growth-link"), 0);
});

Deno.test("live active-Ability facade fails closed on unowned active shapes without inventing a receipt", () => {
  const state = rewardState();
  const source = ((state.card_index as any)["test-active-inspector"].definition_v0_2.creature);
  source.ability = {
    id: "unsupported-active",
    name: "Unsupported Active",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [{ op: "DRAW", player: "self", count: 1 }],
  };
  assertEquals(
    runtimeV02CreateActiveAbilityLiveChoice(
      state,
      1,
      { where: "vanguard", index: null, instance: card("source-reward", "test-active-inspector") },
      "unsupported-choice",
    ),
    null,
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(state, 1, "unsupported-active"), 0);
});
