import {
  runtimeV02PreflightDefeatScan,
  runtimeV02ScanAndQueueDefeats,
} from "../_shared/tcg-match-defeat-engine-v0-2.ts";

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

function card(uid: string, cardId = uid) {
  return { uid, card_id: cardId };
}

function creature(uid: string, damage: number) {
  return { stack: [card(uid, `card-${uid}`)], essence: [], relic: null, damage };
}

function player(vanguard: any, rewards = [card("reward")]) {
  return { vanguard, reserve: [null, null, null, null], discard: [], rewards };
}

const describe = (_creature: any, ownerSeat: 1 | 2) => ({
  max_hp: 100,
  reward_value: ownerSeat === 2 ? 1 : 2,
  label: ownerSeat === 2 ? "Opponent Creature" : "Friendly Creature",
});

Deno.test("Defeat owner records canonical structured defeat history with exact source attribution", () => {
  const state: any = {
    turn_seq: 7,
    active_seat: 1,
    runtime_v0_2_event_seq: 4,
    effect_events: [{ event: "existing", id: "existing" }],
    players: {
      "1": player(creature("p1", 0), [card("r1")]),
      "2": player(creature("p2", 100), [card("r2"), card("r3")]),
    },
  };

  const result = runtimeV02ScanAndQueueDefeats(state, describe, {
    action_kind: "attack",
    source_action_id: "attack:test",
    source_controller_seat: 1,
    source_card_uid: "p1",
  });

  assertEquals(result.defeated_count, 1);
  assertEquals(state.players["2"].vanguard, null);
  assertEquals(result.defeat_events.length, 1);
  assertEquals(result.defeat_events[0], {
    event_id: "creature-defeated:7:5:2:p2",
    event: "creature_defeated",
    sequence: 5,
    turn_seq: 7,
    active_seat: 1,
    owner_seat: 2,
    opponent_seat: 1,
    where: "vanguard",
    index: null,
    creature_uid: "p2",
    card_id: "card-p2",
    reward_value: 1,
    action_kind: "attack",
    source_action_id: "attack:test",
    source_controller_seat: 1,
    source_card_uid: "p1",
  });
  assertEquals(state.runtime_v0_2_event_seq, 5);
  assertEquals(state.effect_events.length, 2);
  assertEquals(result.queued_resolutions[0], { kind: "take_reward", seat: 1, count: 1, source: "Opponent Creature" });
});

Deno.test("Defeat event history cannot replay after the defeated creature has left play", () => {
  const state: any = {
    turn_seq: 2,
    active_seat: 1,
    effect_events: [],
    players: {
      "1": player(creature("p1", 0)),
      "2": player(creature("p2", 100)),
    },
  };
  const first = runtimeV02ScanAndQueueDefeats(state, describe);
  const second = runtimeV02ScanAndQueueDefeats(state, describe);
  assertEquals(first.defeat_events.length, 1);
  assertEquals(second.defeated_count, 0);
  assertEquals(second.defeat_events.length, 0);
  assertEquals(state.effect_events.length, 1);
});

Deno.test("Defeat preflight validates structured event state before physical mutation", () => {
  const defeated = creature("p2", 100);
  const state: any = {
    turn_seq: 3,
    active_seat: 1,
    effect_events: {} as any,
    players: {
      "1": player(creature("p1", 0)),
      "2": player(defeated),
    },
  };

  assertThrows(() => runtimeV02PreflightDefeatScan(state, describe), "tcg_v0_2_defeat_event_stream_invalid");
  assertEquals(state.players["2"].vanguard, defeated);
  assertEquals(state.players["2"].discard, []);
});

Deno.test("Legacy/minimal defeat state remains valid without invented event history", () => {
  const state: any = {
    players: {
      "1": player(creature("p1", 0)),
      "2": player(creature("p2", 100)),
    },
  };
  const result = runtimeV02ScanAndQueueDefeats(state, describe);
  assertEquals(result.defeated_count, 1);
  assertEquals(result.defeat_events, []);
  assertEquals(state.effect_events, undefined);
  assertEquals(state.runtime_v0_2_event_seq, undefined);
});
