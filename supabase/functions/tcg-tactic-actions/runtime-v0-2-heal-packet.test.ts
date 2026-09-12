import {
  applyRuntimeV02HealPacket,
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

function state(turn = 8) {
  return {
    turn_seq: turn,
    active_seat: 1,
    effect_events: [{ event: "damage_prevented", turn_seq: turn }],
  } as Record<string, unknown>;
}

function creature(damage = 0) {
  return {
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function context(overrides: Partial<RuntimeV02HealPacketContext> = {}): RuntimeV02HealPacketContext {
  return {
    source: {
      controller_seat: 1,
      action_kind: "attack",
      action_id: "deep-current",
      card_effect: true,
      card_uid: "source-top-uid",
      card_id: "tide-tideroar",
      creature_uid: "source-top-uid",
    },
    target: {
      controller_seat: 1,
      creature_uid: "target-top-uid",
      card_uid: "target-top-uid",
      card_id: "tide-shellip",
      element: "Tide",
      where: "reserve",
      index: 0,
    },
    ...overrides,
  };
}

Deno.test("heal packet clamps through the shared primitive and records actual healing only", () => {
  const s = state();
  const target = creature(12);
  const result = applyRuntimeV02HealPacket(s, target, 30, context());
  assertEquals(target.damage, 0);
  assertEquals(result.actual_heal, 12);
  assertEquals(result.packet?.requested_amount, 30);
  assertEquals(result.packet?.actual_amount, 12);
  assertEquals(result.packet?.id, "heal:8:1");
  assertEquals(result.packet?.source.action_kind, "attack");
  assertEquals(result.packet?.source.creature_uid, "source-top-uid");
  assertEquals(result.packet?.target.creature_uid, "target-top-uid");
  assertEquals((s.effect_events as unknown[]).length, 2);
});

Deno.test("zero-point healing does not create after_heal_packet authority", () => {
  const s = state();
  const target = creature(0);
  const result = applyRuntimeV02HealPacket(s, target, 30, context());
  assertEquals(result.actual_heal, 0);
  assertEquals(result.packet, null);
  assertEquals(s.runtime_v0_2_event_seq, undefined);
  assertEquals((s.effect_events as unknown[]).length, 1);
});

Deno.test("heal packet sequence is persisted and current-turn query excludes older packets", () => {
  const s = state(9);
  applyRuntimeV02HealPacket(s, creature(10), 5, context());
  applyRuntimeV02HealPacket(s, creature(10), 5, context({
    target: { ...context().target, creature_uid: "target-2", card_uid: "target-2", index: 1 },
  }));
  (s.effect_events as any[]).push({
    ...(runtimeV02CurrentTurnHealPackets(s)[0] as any),
    id: "heal:8:99",
    sequence: 99,
    turn_seq: 8,
  });
  assertEquals(s.runtime_v0_2_event_seq, 2);
  assertEquals(runtimeV02CurrentTurnHealPackets(s).map((packet) => packet.id), ["heal:9:1", "heal:9:2"]);
});

Deno.test("packet captures card-effect and active-seat facts needed by frozen listeners", () => {
  const result = applyRuntimeV02HealPacket(state(), creature(20), 10, context()).packet!;
  assertEquals(result.active_seat, 1);
  assertEquals(result.controller_seat, 1);
  assertEquals(result.source.card_effect, true);
  assertEquals(result.target.controller_seat, 1);
  assertEquals(result.target.element, "Tide");
});

Deno.test("malformed source, target, amount and event state fail closed before healing", () => {
  const badSource = context();
  badSource.source = { ...badSource.source, action_kind: "attack", creature_uid: null };
  const sourceTarget = creature(20);
  assertThrows(() => applyRuntimeV02HealPacket(state(), sourceTarget, 10, badSource), "creature_source_identity_required");
  assertEquals(sourceTarget.damage, 20);

  const badTarget = context();
  badTarget.target = { ...badTarget.target, where: "reserve", index: null } as any;
  const targetTarget = creature(20);
  assertThrows(() => applyRuntimeV02HealPacket(state(), targetTarget, 10, badTarget), "reserve_index_invalid");
  assertEquals(targetTarget.damage, 20);

  assertThrows(() => applyRuntimeV02HealPacket(state(), creature(20), -1, context()), "amount_invalid");

  const badState = state();
  badState.effect_events = {};
  const eventTarget = creature(20);
  assertThrows(() => applyRuntimeV02HealPacket(badState, eventTarget, 10, context()), "event_stream_invalid");
  assertEquals(eventTarget.damage, 20);
});

Deno.test("system heals remain representable without pretending they are card effects", () => {
  const systemContext = context();
  systemContext.source = {
    controller_seat: 1,
    action_kind: "system",
    action_id: "system-recovery",
    card_effect: false,
    card_uid: null,
    card_id: null,
    creature_uid: null,
  };
  const packet = applyRuntimeV02HealPacket(state(), creature(10), 5, systemContext).packet!;
  assertEquals(packet.source.card_effect, false);
  assertEquals(packet.source.action_kind, "system");
});
