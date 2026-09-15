import {
  runtimeV02ScanAndQueueDefeats,
  type RuntimeV02DefeatPlayerState,
  type RuntimeV02DefeatState,
} from "../_shared/tcg-match-defeat-engine-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertSame(actual: unknown, expected: unknown, message = "instances differ") {
  if (!Object.is(actual, expected)) throw new Error(message);
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

function card(uid: string, cardId = uid): RuntimeV02CardZoneInstance {
  return { uid, card_id: cardId };
}

function creature(uid: string, damage: number) {
  return { stack: [card(uid)], essence: [], relic: null, damage };
}

function player(
  vanguard: ReturnType<typeof creature> | null,
  reserve: Array<ReturnType<typeof creature> | null> = [null, null, null, null],
  rewardCount = 6,
): RuntimeV02DefeatPlayerState<RuntimeV02CardZoneInstance> {
  return {
    vanguard,
    reserve,
    discard: [],
    rewards: Array.from({ length: rewardCount }, (_, index) => card(`reward-${index}`)),
  };
}

function state(
  one: RuntimeV02DefeatPlayerState<RuntimeV02CardZoneInstance>,
  two: RuntimeV02DefeatPlayerState<RuntimeV02CardZoneInstance>,
): RuntimeV02DefeatState<RuntimeV02CardZoneInstance> {
  return { players: { "1": one, "2": two }, pending_resolutions: [] };
}

function describe(cr: any) {
  const id = String(cr.stack?.[cr.stack.length - 1]?.card_id || "");
  const mythic = id.includes("mythic");
  return {
    max_hp: 100,
    reward_value: mythic ? 2 : 1,
    label: id || "Creature",
  };
}

Deno.test("Defeat Engine resolves Vanguard defeat and queues Reward then promotion", () => {
  const defeated = creature("mythic-vanguard", 100);
  const reserve = creature("reserve", 0);
  const p1 = player(defeated, [reserve, null, null, null]);
  const p2 = player(creature("opponent", 0), [null, null, null, null], 3);
  const s = state(p1, p2);

  const result = runtimeV02ScanAndQueueDefeats(s, describe);

  assertEquals(result.defeated_count, 1);
  assertEquals(result.defeated, [{
    owner_seat: 1,
    where: "vanguard",
    index: null,
    max_hp: 100,
    reward_value: 2,
    label: "mythic-vanguard",
  }]);
  assertEquals(result.queued_resolutions, [
    { kind: "take_reward", seat: 2, count: 2, source: "mythic-vanguard" },
    { kind: "promote", seat: 1 },
  ]);
  assertEquals(s.pending_resolutions, result.queued_resolutions);
  assertEquals(p1.vanguard, null);
  assertSame(p1.reserve[0], reserve);
  assertEquals(p1.discard.map((entry) => entry.uid), ["mythic-vanguard"]);
});

Deno.test("Defeat Engine preserves stable simultaneous scan and Reward queue order", () => {
  const p1Vanguard = creature("seat1-vanguard", 100);
  const p2Reserve = creature("seat2-reserve", 100);
  const p1 = player(p1Vanguard, [null, null, null, null], 4);
  const p2 = player(creature("seat2-vanguard", 0), [null, p2Reserve, null, null], 4);
  const s = state(p1, p2);

  const result = runtimeV02ScanAndQueueDefeats(s, describe);

  assertEquals(result.defeated.map((entry) => `${entry.owner_seat}:${entry.where}:${entry.index}`), [
    "1:vanguard:null",
    "2:reserve:1",
  ]);
  assertEquals(result.queued_resolutions, [
    { kind: "take_reward", seat: 2, count: 1, source: "seat1-vanguard" },
    { kind: "take_reward", seat: 1, count: 1, source: "seat2-reserve" },
  ]);
  assertEquals(p1.vanguard, null);
  assertEquals(p2.reserve[1], null);
});

Deno.test("Defeat Engine caps Reward taking at available Reward cards", () => {
  const p1 = player(creature("mythic-vanguard", 100));
  const p2 = player(creature("opponent", 0), [null, null, null, null], 1);
  const s = state(p1, p2);

  const result = runtimeV02ScanAndQueueDefeats(s, describe);
  assertEquals(result.queued_resolutions[0], {
    kind: "take_reward",
    seat: 2,
    count: 1,
    source: "mythic-vanguard",
  });
});

Deno.test("Defeat Engine leaves battlefield untouched when nobody is defeated", () => {
  const one = creature("one", 90);
  const two = creature("two", 0);
  const p1 = player(one);
  const p2 = player(two);
  const s = state(p1, p2);

  const result = runtimeV02ScanAndQueueDefeats(s, describe);
  assertEquals(result.defeated_count, 0);
  assertEquals(result.defeat_receipts, []);
  assertEquals(result.queued_resolutions, []);
  assertSame(p1.vanguard, one);
  assertSame(p2.vanguard, two);
});

Deno.test("Defeat Engine validates every description before physical mutation", () => {
  const defeated = creature("defeated", 100);
  const p1 = player(defeated);
  const p2 = player(creature("other", 0));
  const s = state(p1, p2);

  assertThrows(
    () => runtimeV02ScanAndQueueDefeats(s, (cr, seat) => {
      if (seat === 2) return { max_hp: 0, reward_value: 1, label: "bad" };
      return describe(cr);
    }),
    "tcg_v0_2_defeat_max_hp_invalid",
  );

  assertSame(p1.vanguard, defeated);
  assertEquals(p1.discard, []);
  assertEquals(s.pending_resolutions, []);
});
