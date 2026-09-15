import {
  runtimeV02PlaceCreatureFromHand,
  runtimeV02ReturnSetupCreatureToHand,
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

Deno.test("Creature Engine owns setup Reserve return while Card-Zone owns creature-stack to hand transfer", () => {
  const placed = card("creature-1", "gale-whiffin");
  const kept = card("hand-2", "gale-breeze-essence");
  const state = player([placed, kept]);
  runtimeV02PlaceCreatureFromHand(state, 1, placed.uid, "reserve", 2);

  const result = runtimeV02ReturnSetupCreatureToHand(state, 1, "reserve", 2);

  assertSame(result.card, placed);
  assertEquals(state.hand.map((entry) => entry.uid), [kept.uid, placed.uid]);
  assertEquals(state.reserve[2], null);
  assertEquals(result.receipt, {
    schema: "sb-tcg-creature-setup-return-v0.2",
    controller_seat: 1,
    where: "reserve",
    index: 2,
    card_uid: placed.uid,
  });
  assertEquals(result.card_zone_batch.count, 1);
  assertEquals(result.card_zone_batch.transfers[0].source.zone, "creature_stack");
  assertEquals(result.card_zone_batch.transfers[0].destination.zone, "hand");
  assertEquals(result.card_zone_batch.transfers[0].source_action_id, "setup_return");
});

Deno.test("Creature Engine owns setup Vanguard return with the same specialist boundary", () => {
  const placed = card("creature-1", "stone-pebblit");
  const state = player([placed]);
  runtimeV02PlaceCreatureFromHand(state, 2, placed.uid, "vanguard", null);

  const result = runtimeV02ReturnSetupCreatureToHand(state, 2, "vanguard", null);

  assertSame(result.card, placed);
  assertEquals(state.hand.map((entry) => entry.uid), [placed.uid]);
  assertEquals(state.vanguard, null);
  assertEquals(result.receipt.where, "vanguard");
  assertEquals(result.receipt.index, null);
});

Deno.test("setup return fails closed before mutation when battlefield state is no longer pristine", () => {
  const placed = card("creature-1", "grove-spriglet");
  const attached = card("essence-1", "grove-growth-essence");
  const state = player([placed]);
  const placement = runtimeV02PlaceCreatureFromHand(state, 1, placed.uid, "reserve", 0);
  placement.creature.essence.push(attached);

  assertThrows(
    () => runtimeV02ReturnSetupCreatureToHand(state, 1, "reserve", 0),
    "tcg_v0_2_creature_setup_return_essence_present",
  );

  assertSame(state.reserve[0], placement.creature);
  assertEquals(state.hand, []);
  assertEquals(placement.creature.stack.map((entry) => entry.uid), [placed.uid]);
  assertEquals(placement.creature.essence.map((entry) => entry.uid), [attached.uid]);
});

Deno.test("setup return refuses a multi-card stack before Card-Zone or battlefield mutation", () => {
  const baby = card("baby-1", "gale-whiffin");
  const evolved = card("teen-1", "gale-skyweaver");
  const state = player([baby]);
  const placement = runtimeV02PlaceCreatureFromHand(state, 1, baby.uid, "reserve", 1);
  placement.creature.stack.push(evolved);

  assertThrows(
    () => runtimeV02ReturnSetupCreatureToHand(state, 1, "reserve", 1),
    "tcg_v0_2_creature_setup_return_stack_not_single",
  );

  assertSame(state.reserve[1], placement.creature);
  assertEquals(state.hand, []);
  assertEquals(placement.creature.stack.map((entry) => entry.uid), [baby.uid, evolved.uid]);
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
