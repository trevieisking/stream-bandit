import {
  preflightRuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
} from "../_shared/tcg-match-heal-packet-v0-2.ts";
import {
  runtimeV02PreflightDefeatScan,
  type RuntimeV02DefeatState,
} from "../_shared/tcg-match-defeat-engine-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";

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

function healContext(): RuntimeV02HealPacketContext {
  return {
    source: {
      controller_seat: 1,
      action_kind: "tactic",
      action_id: "effect-1",
      card_effect: true,
      card_uid: "tactic-uid",
      card_id: "underworld-test-tactic",
      creature_uid: null,
    },
    target: {
      controller_seat: 1,
      creature_uid: "creature-uid",
      card_uid: "creature-uid",
      card_id: "underworld-test-creature",
      element: "Underworld",
      where: "vanguard",
      index: null,
    },
  };
}

Deno.test("Heal preflight validates packet authority without creating event state", () => {
  const state: Record<string, unknown> = { turn_seq: 4, active_seat: 1 };
  preflightRuntimeV02HealPacket(state, 40, healContext());
  assertEquals(state, { turn_seq: 4, active_seat: 1 });
});

Deno.test("Heal preflight rejects malformed target without mutation", () => {
  const state: Record<string, unknown> = { turn_seq: 4, active_seat: 1 };
  const context = healContext();
  context.target.where = "reserve";
  context.target.index = null;
  assertThrows(
    () => preflightRuntimeV02HealPacket(state, 40, context),
    "tcg_v0_2_heal_packet_reserve_index_invalid",
  );
  assertEquals(state, { turn_seq: 4, active_seat: 1 });
});

function card(uid: string): RuntimeV02CardZoneInstance {
  return { uid, card_id: uid };
}

Deno.test("Defeat preflight validates lifecycle input without moving cards or queueing resolutions", () => {
  const creature = { stack: [card("creature")], essence: [], relic: null, damage: 100 };
  const state: RuntimeV02DefeatState<RuntimeV02CardZoneInstance> = {
    players: {
      "1": { vanguard: creature, reserve: [null, null, null, null], discard: [], rewards: [card("r1")] },
      "2": { vanguard: null, reserve: [null, null, null, null], discard: [], rewards: [card("r2")] },
    },
    pending_resolutions: [],
  };

  const result = runtimeV02PreflightDefeatScan(state, () => ({
    max_hp: 100,
    reward_value: 1,
    label: "Creature",
  }));

  assertEquals(result.defeated_count, 1);
  assertEquals(state.players["1"].vanguard, creature);
  assertEquals(state.players["1"].discard, []);
  assertEquals(state.pending_resolutions, []);
});

Deno.test("Defeat scan rejects invalid resolution queue before physical defeat mutation", () => {
  const creature = { stack: [card("creature")], essence: [], relic: null, damage: 100 };
  const state = {
    players: {
      "1": { vanguard: creature, reserve: [null, null, null, null], discard: [], rewards: [card("r1")] },
      "2": { vanguard: null, reserve: [null, null, null, null], discard: [], rewards: [card("r2")] },
    },
    pending_resolutions: {} as unknown,
  } as RuntimeV02DefeatState<RuntimeV02CardZoneInstance>;

  assertThrows(
    () => runtimeV02PreflightDefeatScan(state, () => ({ max_hp: 100, reward_value: 1, label: "Creature" })),
    "tcg_v0_2_defeat_resolution_queue_invalid",
  );
  assertEquals(state.players["1"].vanguard, creature);
  assertEquals(state.players["1"].discard, []);
});
