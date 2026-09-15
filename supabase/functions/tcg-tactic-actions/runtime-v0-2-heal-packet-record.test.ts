import {
  applyRuntimeV02HealPacket,
  recordRuntimeV02HealPacket,
  runtimeV02CurrentTurnHealPackets,
  type RuntimeV02HealPacketContext,
} from "../_shared/tcg-match-heal-packet-v0-2.ts";

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

function state(turn = 21) {
  return { turn_seq: turn, active_seat: 1 } as Record<string, unknown>;
}

function creature(damage = 0) {
  return {
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function context(): RuntimeV02HealPacketContext {
  return {
    source: {
      controller_seat: 1,
      action_kind: "attack",
      action_id: "deep-current",
      card_effect: true,
      card_uid: "source-top-uid",
      card_id: "test-source-card",
      creature_uid: "source-top-uid",
    },
    target: {
      controller_seat: 1,
      creature_uid: "target-top-uid",
      card_uid: "target-top-uid",
      card_id: "test-target-card",
      element: "Tide",
      where: "reserve",
      index: 0,
    },
  };
}

Deno.test("record-only bridge persists verified healing without applying damage mutation twice", () => {
  const s = state();
  const target = creature(17);
  const packet = recordRuntimeV02HealPacket(s, 30, 12, context())!;

  assertEquals(target.damage, 17, "record-only bridge must not heal the Creature");
  assertEquals(packet.id, "heal:21:1");
  assertEquals(packet.requested_amount, 30);
  assertEquals(packet.actual_amount, 12);
  assertEquals(packet.source.action_kind, "attack");
  assertEquals(packet.target.creature_uid, "target-top-uid");
  assertEquals(s.runtime_v0_2_event_seq, 1);
  assertEquals((s.effect_events as unknown[]).length, 1);
});

Deno.test("record-only bridge rejects impossible actual healing before touching event state", () => {
  for (const actual of [31, -1, Number.NaN]) {
    const s = state();
    assertThrows(
      () => recordRuntimeV02HealPacket(s, 30, actual, context()),
      "tcg_v0_2_heal_packet_actual_amount_invalid",
    );
    assertEquals(s.effect_events, undefined);
    assertEquals(s.runtime_v0_2_event_seq, undefined);
  }
});

Deno.test("zero verified healing creates no packet and consumes no event sequence", () => {
  const s = state();
  const packet = recordRuntimeV02HealPacket(s, 30, 0, context());
  assertEquals(packet, null);
  assertEquals(s.runtime_v0_2_event_seq, undefined);
  assertEquals(s.effect_events, []);
});

Deno.test("apply and record-only paths share one canonical packet shape", () => {
  const appliedState = state();
  const applied = applyRuntimeV02HealPacket(appliedState, creature(12), 30, context());

  const recordedState = state();
  const recorded = recordRuntimeV02HealPacket(recordedState, 30, 12, context());

  assertEquals(applied.actual_heal, 12);
  assertEquals(recorded, applied.packet);
  assertEquals(recordedState.effect_events, appliedState.effect_events);
});

Deno.test("recorded packets participate in the canonical current-turn query", () => {
  const s = state(22);
  recordRuntimeV02HealPacket(s, 30, 10, context());
  recordRuntimeV02HealPacket(s, 20, 5, {
    ...context(),
    target: { ...context().target, creature_uid: "target-two", card_uid: "target-two", index: 1 },
  });
  (s.effect_events as any[]).push({
    ...(s.effect_events as any[])[0],
    id: "heal:21:99",
    sequence: 99,
    turn_seq: 21,
  });

  assertEquals(runtimeV02CurrentTurnHealPackets(s).map((packet) => packet.id), ["heal:22:1", "heal:22:2"]);
});
