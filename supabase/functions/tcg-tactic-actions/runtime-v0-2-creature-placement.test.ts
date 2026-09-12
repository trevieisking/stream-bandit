import {
  runtimeV02PlaceCreatureFromHand,
  type RuntimeV02CreaturePlacementPlayerState,
} from "../_shared/tcg-match-creature-engine-v0-2.ts";
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

function card(uid: string, cardId: string): RuntimeV02CardZoneInstance {
  return { uid, card_id: cardId };
}

function player(hand: RuntimeV02CardZoneInstance[]): RuntimeV02CreaturePlacementPlayerState<RuntimeV02CardZoneInstance> {
  return { hand, vanguard: null, reserve: [null, null, null, null] };
}

Deno.test("Creature Engine owns exact hand-to-Reserve placement and preserves card identity", () => {
  const placed = card("creature-1", "gale-whiffin");
  const kept = card("hand-2", "gale-breeze-essence");
  const state = player([placed, kept]);

  const result = runtimeV02PlaceCreatureFromHand(state, 1, placed.uid, "reserve", 2);

  assertEquals(state.hand.map((entry) => entry.uid), [kept.uid]);
  assertSame(state.reserve[2], result.creature);
  assertSame(result.card, placed);
  assertSame(result.creature.stack[0], placed);
  assertEquals(result.creature, {
    stack: [placed],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    condition: null,
    flags: {},
  });
  assertEquals(result.receipt, {
    schema: "sb-tcg-creature-placement-v0.2",
    controller_seat: 1,
    where: "reserve",
    index: 2,
    card_uid: placed.uid,
  });
});

Deno.test("Creature Engine owns exact hand-to-Vanguard placement without Card-Zone specialist destination", () => {
  const placed = card("creature-1", "stone-pebblit");
  const state = player([placed]);

  const result = runtimeV02PlaceCreatureFromHand(state, 2, placed.uid, "vanguard", null);

  assertEquals(state.hand, []);
  assertSame(state.vanguard, result.creature);
  assertSame(state.vanguard?.stack[0], placed);
  assertEquals(result.receipt.where, "vanguard");
  assertEquals(result.receipt.index, null);
});

Deno.test("Creature placement rejects an occupied destination before hand mutation", () => {
  const existing = card("existing-1", "grove-spriglet");
  const incoming = card("incoming-1", "grove-bloomhare");
  const state = player([existing, incoming]);
  runtimeV02PlaceCreatureFromHand(state, 1, existing.uid, "reserve", 0);

  assertThrows(
    () => runtimeV02PlaceCreatureFromHand(state, 1, incoming.uid, "reserve", 0),
    "tcg_v0_2_creature_placement_destination_occupied",
  );

  assertSame(state.hand[0], incoming);
  assertSame(state.reserve[0]?.stack[0], existing);
});

Deno.test("Creature placement rejects stale hand identity before battlefield mutation", () => {
  const state = player([card("creature-1", "astral-stardot")]);

  assertThrows(
    () => runtimeV02PlaceCreatureFromHand(state, 1, "missing", "reserve", 1),
    "tcg_v0_2_creature_placement_card_missing",
  );

  assertEquals(state.hand.map((entry) => entry.uid), ["creature-1"]);
  assertEquals(state.reserve, [null, null, null, null]);
});
