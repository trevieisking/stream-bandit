import {
  runtimeV02ApplyResolvedCardCostRoute,
  runtimeV02BuildResolvedCardCostOperations,
} from "../_shared/tcg-match-payment-route-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

declare const Deno: { test(name: string, fn: () => void): void };

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  }
}

function throws(fn: () => unknown, part: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(part)) throw error;
    return;
  }
  throw new Error(`expected ${part}`);
}

function card(uid: string, card_id: string) {
  return { uid, card_id };
}

function creature(uid = "source-uid", cardId = "underworld-source", damage = 0) {
  return { stack: [card(uid, cardId)], essence: [], relic: null, damage, shield: 0, flags: {} };
}

function state() {
  return {
    turn_seq: 7,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    players: {
      "1": {
        vanguard: creature(),
        reserve: [null, null, null, null],
        hand: [card("hand-a", "underworld-a"), card("hand-b", "underworld-b")],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: creature("enemy-uid", "enemy-card"),
        reserve: [null, null, null, null],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
  } as any;
}

const binding = {
  controller_seat: 1 as const,
  action_kind: "ability" as const,
  source_action_id: "ability:blood-price",
  source_card_uid: "source-uid",
  source_card_id: "underworld-source",
  source_creature_uid: "source-uid",
};
const sourceLocation = { where: "vanguard" as const, index: null };
const describe = () => ({ max_hp: 200, reward_value: 1, label: "Source" });

function tacticDefinition(id: string, subtype: string) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Tactic",
      element: "Volt",
      creature: null,
      essence: null,
      tactic: { subtype, requirements: null, program: [], listeners: [], continuous: [] },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function filteredState() {
  const match = state();
  match.runtime_registry_v0_2 = runtimeV02SnapshotMarker();
  match.card_index = {
    "underworld-a": tacticDefinition("underworld-a", "Ally"),
    "underworld-b": tacticDefinition("underworld-b", "Device"),
  };
  return match;
}

Deno.test("Payment route maps $source_creature damage to the exact anchored source", () => {
  const match = state();
  const result = runtimeV02ApplyResolvedCardCostRoute(match, binding, sourceLocation, [{
    kind: "damage",
    target: "$source_creature",
    amount: 20,
    cost_index: 0,
    source_path: "cost/0",
  }], describe);
  equal(result.operations[0].kind, "damage");
  equal((result.operations[0] as any).target.anchor_uid, "source-uid");
  equal(match.players["1"].vanguard.damage, 20);
});

Deno.test("Payment route preserves exact private hand selection", () => {
  const match = state();
  runtimeV02ApplyResolvedCardCostRoute(match, binding, sourceLocation, [{
    kind: "hand_discard",
    player: "self",
    count: 1,
    cost_index: 0,
    source_path: "cost/0",
    card_uids: ["hand-b"],
  }], describe);
  equal(match.players["1"].hand.map((entry: any) => entry.uid), ["hand-a"]);
  equal(match.players["1"].discard.map((entry: any) => entry.uid), ["hand-b"]);
});

Deno.test("Payment route revalidates filtered exact hand selection before canonical payment", () => {
  const match = filteredState();
  runtimeV02ApplyResolvedCardCostRoute(match, binding, sourceLocation, [{
    kind: "hand_discard",
    player: "self",
    count: 1,
    filters: { card_family: "Tactic", tactic_subtype: "Device" },
    cost_index: 0,
    source_path: "cost/0",
    card_uids: ["hand-b"],
  }], describe);
  equal(match.players["1"].hand.map((entry: any) => entry.uid), ["hand-a"]);
  equal(match.players["1"].discard.map((entry: any) => entry.uid), ["hand-b"]);
});

Deno.test("Payment route rejects filtered selection drift before any mutation", () => {
  const match = filteredState();
  const before = structuredClone(match);
  throws(() => runtimeV02ApplyResolvedCardCostRoute(match, binding, sourceLocation, [{
    kind: "hand_discard",
    player: "self",
    count: 1,
    filters: { card_family: "Tactic", tactic_subtype: "Device" },
    cost_index: 0,
    source_path: "cost/0",
    card_uids: ["hand-a"],
  }], describe), "discard_filter_changed");
  equal(match.players["1"].hand, before.players["1"].hand);
  equal(match.players["1"].discard, before.players["1"].discard);
  equal(match.effect_events, before.effect_events);
});

Deno.test("Payment route keeps mixed costs atomic when a later exact discard is stale", () => {
  const match = state();
  throws(() => runtimeV02ApplyResolvedCardCostRoute(match, binding, sourceLocation, [
    { kind: "damage", target: "$source_creature", amount: 30, cost_index: 0, source_path: "cost/0" },
    { kind: "hand_discard", player: "self", count: 1, cost_index: 1, source_path: "cost/1", card_uids: ["missing"] },
  ], describe), "missing");
  equal(match.players["1"].vanguard.damage, 0);
  equal(match.players["1"].hand.map((entry: any) => entry.uid), ["hand-a", "hand-b"]);
});

Deno.test("Payment route rejects a stale source identity before payment", () => {
  const match = state();
  match.players["1"].vanguard.stack[0] = card("changed-uid", "underworld-source");
  throws(() => runtimeV02ApplyResolvedCardCostRoute(match, binding, sourceLocation, [{
    kind: "hand_discard",
    player: "self",
    count: 1,
    cost_index: 0,
    source_path: "cost/0",
    card_uids: ["hand-a"],
  }], describe), "source_identity_changed");
  equal(match.players["1"].hand.length, 2);
});

Deno.test("Payment route fails closed on unsupported damage selectors", () => {
  const match = state();
  throws(() => runtimeV02BuildResolvedCardCostOperations(match, binding, sourceLocation, [{
    kind: "damage",
    target: "$chosen_creature",
    amount: 20,
    cost_index: 0,
    source_path: "cost/0",
  }], describe), "damage_target_unsupported");
  equal(match.players["1"].vanguard.damage, 0);
});
