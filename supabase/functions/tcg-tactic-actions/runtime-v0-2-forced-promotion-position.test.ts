import {
  runtimeV02ApplyAtomicSwitch,
  runtimeV02ApplyForcedPromotion,
  runtimeV02BattlefieldPositionContextById,
  runtimeV02CurrentTurnBattlefieldPositionContexts,
  runtimeV02CurrentTurnBattlefieldPositionEvents,
  runtimeV02CurrentTurnSwitchContexts,
  runtimeV02CurrentTurnSwitchEvents,
  runtimeV02PreflightForcedPromotion,
} from "../_shared/tcg-match-switch-context-v0-2.ts";

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

function creature(uid: string, cardId: string) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield: 20,
    condition: "Dazed",
    conditions: { scorched: true, venomed: 20, control: "Dazed", modifier: "Silenced" },
    flags: {},
    became_vanguard_turn: -1,
  };
}

function promotionState() {
  return {
    turn_seq: 18,
    players: {
      "1": {
        vanguard: null,
        reserve: [
          creature("incoming-1", "creature-a"),
          creature("reserve-2", "creature-b"),
          null,
          null,
        ],
      },
      "2": {
        vanguard: creature("opponent-1", "creature-z"),
        reserve: [null, null, null, null],
      },
    },
  } as Record<string, unknown>;
}

function player(state: Record<string, unknown>, seat: 1 | 2) {
  return (state.players as any)[String(seat)];
}

Deno.test("forced promotion preflight requires an empty Vanguard and never mutates battlefield or ledger", () => {
  const state = promotionState();
  const before = JSON.stringify(state);
  const preflight = runtimeV02PreflightForcedPromotion(state, 1, 0, {
    source_action_id: "defeat_promotion",
  });

  assertEquals(preflight, {
    controller_seat: 1,
    outgoing_vanguard_uid: null,
    incoming_vanguard_uid: "incoming-1",
    reserve_index: 0,
    source_action_id: "defeat_promotion",
    source_card_uid: null,
    action_kind: "forced_promotion",
    turn_seq: 18,
    next_sequence: 1,
    switch_id: "switch:18:1",
  });
  assertEquals(JSON.stringify(state), before);
  assertEquals((state as any).runtime_v0_2_switch_ledger, undefined);
});

Deno.test("forced promotion moves only Reserve to empty Vanguard and emits one canonical became_vanguard event", () => {
  const state = promotionState();
  const result = runtimeV02ApplyForcedPromotion(state, 1, 0, {
    source_action_id: "defeat_promotion",
  });

  assertEquals(result.context, {
    switch_id: "switch:18:1",
    controller_seat: 1,
    outgoing_vanguard_uid: null,
    incoming_vanguard_uid: "incoming-1",
    reserve_index: 0,
    source_action_id: "defeat_promotion",
    source_card_uid: null,
    action_kind: "forced_promotion",
    turn_seq: 18,
  });
  assertEquals(result.events, [{
    event: "became_vanguard",
    subject_uid: "incoming-1",
    controller_seat: 1,
    origin_zone: "reserve",
    destination_zone: "vanguard",
    reserve_index: 0,
    switch_id: "switch:18:1",
    source_action_id: "defeat_promotion",
    source_card_uid: null,
    action_kind: "forced_promotion",
    turn_seq: 18,
  }]);

  assertEquals(player(state, 1).vanguard.stack[0].uid, "incoming-1");
  assertEquals(player(state, 1).reserve[0], null);
  assertEquals(player(state, 1).vanguard.became_vanguard_turn, 18);
  assertEquals(player(state, 1).vanguard.condition, null);
  assertEquals(player(state, 1).vanguard.conditions, {
    scorched: false,
    venomed: 0,
    control: null,
    modifier: null,
  });
  assertEquals(player(state, 1).vanguard.shield, 20, "promotion must preserve Shield");
});

Deno.test("forced promotion shares deterministic position ledger without polluting true switch-only queries", () => {
  const state = promotionState();
  runtimeV02ApplyForcedPromotion(state, 1, 0, { source_action_id: "defeat_promotion" });

  assertEquals(runtimeV02CurrentTurnSwitchContexts(state), []);
  assertEquals(runtimeV02CurrentTurnSwitchEvents(state), []);
  assertEquals(runtimeV02CurrentTurnBattlefieldPositionContexts(state).map((entry) => entry.action_kind), ["forced_promotion"]);
  assertEquals(runtimeV02CurrentTurnBattlefieldPositionEvents(state).map((entry) => entry.event), ["became_vanguard"]);
  assertEquals(runtimeV02BattlefieldPositionContextById(state, "switch:18:1")?.outgoing_vanguard_uid, null);

  const switched = runtimeV02ApplyAtomicSwitch(state, 1, 1, {
    action_kind: "effect_switch",
    source_action_id: "followup-switch",
  });
  assertEquals(switched.context.switch_id, "switch:18:2");
  assertEquals(runtimeV02CurrentTurnSwitchContexts(state).map((entry) => entry.switch_id), ["switch:18:2"]);
  assertEquals(runtimeV02CurrentTurnSwitchEvents(state).map((entry) => entry.event), ["moved_to_reserve", "became_vanguard"]);
  assertEquals(runtimeV02CurrentTurnBattlefieldPositionContexts(state).map((entry) => entry.switch_id), ["switch:18:1", "switch:18:2"]);
  assertEquals(runtimeV02CurrentTurnBattlefieldPositionEvents(state).map((entry) => `${entry.switch_id}:${entry.event}`), [
    "switch:18:1:became_vanguard",
    "switch:18:2:moved_to_reserve",
    "switch:18:2:became_vanguard",
  ]);
});

Deno.test("forced promotion rejects occupied Vanguard, missing Reserve and invalid index before any mutation", () => {
  const cases: Array<[string, (state: Record<string, unknown>) => void]> = [
    ["tcg_v0_2_forced_promotion_vanguard_occupied", (state) => {
      player(state, 1).vanguard = creature("occupied", "creature-c");
      runtimeV02ApplyForcedPromotion(state, 1, 0, { source_action_id: "defeat_promotion" });
    }],
    ["tcg_v0_2_switch_incoming_reserve_missing", (state) => {
      runtimeV02ApplyForcedPromotion(state, 1, 3, { source_action_id: "defeat_promotion" });
    }],
    ["tcg_v0_2_switch_reserve_index_invalid", (state) => {
      runtimeV02ApplyForcedPromotion(state, 1, 4, { source_action_id: "defeat_promotion" });
    }],
  ];

  for (const [fragment, run] of cases) {
    const state = promotionState();
    const setup = fragment === "tcg_v0_2_forced_promotion_vanguard_occupied";
    if (setup) player(state, 1).vanguard = creature("occupied", "creature-c");
    const before = JSON.stringify(state);
    assertThrows(() => {
      if (setup) runtimeV02ApplyForcedPromotion(state, 1, 0, { source_action_id: "defeat_promotion" });
      else run(state);
    }, fragment);
    assertEquals(JSON.stringify(state), before, `failed forced promotion mutated state for ${fragment}`);
  }
});
