import {
  runtimeV02ApplyAtomicSwitch,
  runtimeV02CurrentTurnSwitchContexts,
  runtimeV02CurrentTurnSwitchEvents,
  runtimeV02SwitchContextById,
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

function card(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function creature(uid: string, cardId: string, control: string | null = null) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    condition: control,
    conditions: { scorched: true, venomed: 20, control, modifier: "Silenced" },
    flags: {},
    became_vanguard_turn: -1,
  };
}

function state() {
  return {
    turn_seq: 12,
    players: {
      "1": {
        vanguard: creature("outgoing-1", "creature-a", "Dazed"),
        reserve: [
          creature("incoming-1", "creature-b", "Rooted"),
          creature("reserve-2", "creature-c"),
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

function player(s: Record<string, unknown>, seat: 1 | 2) {
  return (s.players as any)[String(seat)];
}

Deno.test("atomic switch validates first, swaps once and records the Amendment H paired movement events", () => {
  const s = state();
  const result = runtimeV02ApplyAtomicSwitch(s, 1, 0, {
    action_kind: "attack",
    source_action_id: "test-switch-attack",
    source_card_uid: "outgoing-1",
  });

  assertEquals(result.context, {
    switch_id: "switch:12:1",
    controller_seat: 1,
    outgoing_vanguard_uid: "outgoing-1",
    incoming_vanguard_uid: "incoming-1",
    reserve_index: 0,
    source_action_id: "test-switch-attack",
    source_card_uid: "outgoing-1",
    action_kind: "attack",
    turn_seq: 12,
  });
  assertEquals(result.events, [
    {
      event: "moved_to_reserve",
      subject_uid: "outgoing-1",
      controller_seat: 1,
      origin_zone: "vanguard",
      destination_zone: "reserve",
      reserve_index: 0,
      switch_id: "switch:12:1",
      source_action_id: "test-switch-attack",
      source_card_uid: "outgoing-1",
      action_kind: "attack",
      turn_seq: 12,
    },
    {
      event: "became_vanguard",
      subject_uid: "incoming-1",
      controller_seat: 1,
      origin_zone: "reserve",
      destination_zone: "vanguard",
      reserve_index: 0,
      switch_id: "switch:12:1",
      source_action_id: "test-switch-attack",
      source_card_uid: "outgoing-1",
      action_kind: "attack",
      turn_seq: 12,
    },
  ]);

  assertEquals(player(s, 1).vanguard.stack[0].uid, "incoming-1");
  assertEquals(player(s, 1).reserve[0].stack[0].uid, "outgoing-1");
  assertEquals(player(s, 1).vanguard.became_vanguard_turn, 12);
  assertEquals(player(s, 1).vanguard.conditions, { scorched: false, venomed: 0, control: null, modifier: null });
  assertEquals(player(s, 1).reserve[0].conditions, { scorched: false, venomed: 0, control: null, modifier: null });
  assertEquals(player(s, 1).vanguard.condition, null);
  assertEquals(player(s, 1).reserve[0].condition, null);
});

Deno.test("one private ledger preserves switch pairing and deterministic sequence within the current turn", () => {
  const s = state();
  runtimeV02ApplyAtomicSwitch(s, 1, 0, {
    action_kind: "effect_switch",
    source_action_id: "effect-one",
    source_card_uid: null,
  });
  runtimeV02ApplyAtomicSwitch(s, 1, 1, {
    action_kind: "voluntary_withdrawal",
    source_action_id: "withdraw-two",
  });

  const contexts = runtimeV02CurrentTurnSwitchContexts(s, 1);
  assertEquals(contexts.map((entry) => entry.switch_id), ["switch:12:1", "switch:12:2"]);
  assertEquals(contexts.map((entry) => entry.action_kind), ["effect_switch", "voluntary_withdrawal"]);
  const events = runtimeV02CurrentTurnSwitchEvents(s, 1);
  assertEquals(events.map((entry) => `${entry.switch_id}:${entry.event}`), [
    "switch:12:1:moved_to_reserve",
    "switch:12:1:became_vanguard",
    "switch:12:2:moved_to_reserve",
    "switch:12:2:became_vanguard",
  ]);
  assertEquals(runtimeV02SwitchContextById(s, "switch:12:2")?.source_action_id, "withdraw-two");
});

Deno.test("switch ledger is turn-scoped and resets deterministically instead of leaking prior-turn movement truth", () => {
  const s = state();
  runtimeV02ApplyAtomicSwitch(s, 1, 0, {
    action_kind: "attack",
    source_action_id: "turn-twelve",
  });
  s.turn_seq = 13;
  assertEquals(runtimeV02CurrentTurnSwitchContexts(s), []);
  assertEquals(runtimeV02CurrentTurnSwitchEvents(s), []);
  assertEquals(runtimeV02SwitchContextById(s, "switch:12:1"), null);

  const next = runtimeV02ApplyAtomicSwitch(s, 1, 1, {
    action_kind: "effect_switch",
    source_action_id: "turn-thirteen",
  });
  assertEquals(next.context.switch_id, "switch:13:1");
  assertEquals(runtimeV02CurrentTurnSwitchContexts(s).map((entry) => entry.switch_id), ["switch:13:1"]);
});

Deno.test("controller filtering never mixes another seat's current-turn switch events", () => {
  const s = state();
  player(s, 2).reserve[0] = creature("opp-incoming", "creature-y");
  runtimeV02ApplyAtomicSwitch(s, 1, 0, {
    action_kind: "attack",
    source_action_id: "seat-one",
  });
  runtimeV02ApplyAtomicSwitch(s, 2, 0, {
    action_kind: "effect_switch",
    source_action_id: "seat-two",
  });
  assertEquals(runtimeV02CurrentTurnSwitchContexts(s, 1).length, 1);
  assertEquals(runtimeV02CurrentTurnSwitchContexts(s, 2).length, 1);
  assertEquals(runtimeV02CurrentTurnSwitchEvents(s, 1).every((entry) => entry.controller_seat === 1), true);
  assertEquals(runtimeV02CurrentTurnSwitchEvents(s, 2).every((entry) => entry.controller_seat === 2), true);
});

Deno.test("invalid switch inputs fail before battlefield or private-ledger mutation", () => {
  const cases: Array<[string, (s: Record<string, unknown>) => void]> = [
    ["tcg_v0_2_switch_controller_seat_invalid", (s) => runtimeV02ApplyAtomicSwitch(s, 3, 0, { action_kind: "attack", source_action_id: "x" })],
    ["tcg_v0_2_switch_reserve_index_invalid", (s) => runtimeV02ApplyAtomicSwitch(s, 1, 4, { action_kind: "attack", source_action_id: "x" })],
    ["tcg_v0_2_switch_action_kind_invalid", (s) => runtimeV02ApplyAtomicSwitch(s, 1, 0, { action_kind: "invalid" as any, source_action_id: "x" })],
    ["tcg_v0_2_switch_source_action_id_required", (s) => runtimeV02ApplyAtomicSwitch(s, 1, 0, { action_kind: "attack", source_action_id: "" })],
    ["tcg_v0_2_switch_source_card_uid_invalid", (s) => runtimeV02ApplyAtomicSwitch(s, 1, 0, { action_kind: "attack", source_action_id: "x", source_card_uid: "" })],
    ["tcg_v0_2_switch_incoming_reserve_missing", (s) => runtimeV02ApplyAtomicSwitch(s, 1, 3, { action_kind: "attack", source_action_id: "x" })],
  ];

  for (const [fragment, run] of cases) {
    const s = state();
    const before = JSON.stringify(s);
    assertThrows(() => run(s), fragment);
    assertEquals(JSON.stringify(s), before, `state mutated before failing ${fragment}`);
  }
});

Deno.test("missing outgoing or top-card anchors fail closed before ledger creation", () => {
  let s = state();
  player(s, 1).vanguard = null;
  const beforeMissing = JSON.stringify(s);
  assertThrows(
    () => runtimeV02ApplyAtomicSwitch(s, 1, 0, { action_kind: "attack", source_action_id: "x" }),
    "tcg_v0_2_switch_outgoing_vanguard_missing",
  );
  assertEquals(JSON.stringify(s), beforeMissing);

  s = state();
  player(s, 1).reserve[0].stack = [{ uid: "", card_id: "creature-b" }];
  const beforeAnchor = JSON.stringify(s);
  assertThrows(
    () => runtimeV02ApplyAtomicSwitch(s, 1, 0, { action_kind: "attack", source_action_id: "x" }),
    "tcg_v0_2_switch_incoming_anchor_missing",
  );
  assertEquals(JSON.stringify(s), beforeAnchor);
});

Deno.test("switch query results are detached copies and the private ledger stores instance identity, not card-definition identity", () => {
  const s = state();
  runtimeV02ApplyAtomicSwitch(s, 1, 0, {
    action_kind: "attack",
    source_action_id: "privacy-check",
    source_card_uid: "outgoing-1",
  });

  const contexts = runtimeV02CurrentTurnSwitchContexts(s);
  const events = runtimeV02CurrentTurnSwitchEvents(s);
  contexts[0].source_action_id = "tampered";
  events[0].subject_uid = "tampered";

  assertEquals(runtimeV02CurrentTurnSwitchContexts(s)[0].source_action_id, "privacy-check");
  assertEquals(runtimeV02CurrentTurnSwitchEvents(s)[0].subject_uid, "outgoing-1");
  const ledger = JSON.stringify((s as any).runtime_v0_2_switch_ledger);
  assertEquals(ledger.includes("creature-a"), false, "outgoing card-definition id leaked into switch ledger");
  assertEquals(ledger.includes("creature-b"), false, "incoming card-definition id leaked into switch ledger");
  assertEquals(ledger.includes("card_id"), false, "switch ledger must not store card-definition fields");
});
