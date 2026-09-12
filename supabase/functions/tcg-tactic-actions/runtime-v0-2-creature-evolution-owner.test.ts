import {
  runtimeV02EvolveCreatureFromHand,
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

Deno.test("in-play Creature placement owns canonical entry timestamps and empty condition state", () => {
  const baby = card("baby-1", "gale-whiffin");
  const state = player([baby]);

  const result = runtimeV02PlaceCreatureFromHand(state, 1, baby.uid, "reserve", 1, { turn_seq: 7 });

  assertSame(state.reserve[1], result.creature);
  assertEquals(result.creature.entered_turn, 7);
  assertEquals(result.creature.evolved_turn, -1);
  assertEquals(result.creature.conditions, {
    scorched: false,
    venomed: 0,
    control: null,
    modifier: null,
  });
  assertEquals(result.creature.condition, null);
});

Deno.test("Creature Evolution owns hand-to-stack mutation and delegates whole-condition reset to Condition", () => {
  const baby = card("baby-1", "gale-whiffin");
  const teen = card("teen-1", "gale-skyweaver");
  const state = player([baby, teen]);
  const placed = runtimeV02PlaceCreatureFromHand(state, 1, baby.uid, "reserve", 0, { turn_seq: 3 });
  placed.creature.conditions = {
    scorched: true,
    venomed: 20,
    control: "Dazed",
    modifier: "Crushed",
  };
  placed.creature.condition = "Dazed";

  const result = runtimeV02EvolveCreatureFromHand(state, 1, placed.creature, teen.uid, 8);

  assertEquals(state.hand, []);
  assertSame(result.card, teen);
  assertSame(result.creature.stack[0], baby);
  assertSame(result.creature.stack[1], teen);
  assertEquals(result.creature.entered_turn, 8);
  assertEquals(result.creature.evolved_turn, 8);
  assertEquals(result.creature.conditions, {
    scorched: false,
    venomed: 0,
    control: null,
    modifier: null,
  });
  assertEquals(result.creature.condition, null);
  assertEquals(result.receipt, {
    schema: "sb-tcg-creature-evolution-v0.2",
    controller_seat: 1,
    card_uid: teen.uid,
    turn_seq: 8,
    conditions_cleared: true,
  });
});

Deno.test("Creature Evolution rejects stale hand identity before stack or condition mutation", () => {
  const baby = card("baby-1", "tide-shellip");
  const state = player([baby]);
  const placed = runtimeV02PlaceCreatureFromHand(state, 2, baby.uid, "vanguard", null, { turn_seq: 2 });
  placed.creature.conditions = {
    scorched: true,
    venomed: 0,
    control: null,
    modifier: null,
  };

  assertThrows(
    () => runtimeV02EvolveCreatureFromHand(state, 2, placed.creature, "missing", 4),
    "tcg_v0_2_creature_evolution_card_missing",
  );

  assertEquals(placed.creature.stack.map((entry) => entry.uid), [baby.uid]);
  assertEquals(placed.creature.conditions?.scorched, true);
  assertEquals(placed.creature.entered_turn, 2);
  assertEquals(placed.creature.evolved_turn, -1);
});

Deno.test("Creature placement and evolution reject invalid turn context before physical mutation", () => {
  const baby = card("baby-1", "stone-pebblit");
  const teen = card("teen-1", "stone-cragroller");
  const state = player([baby, teen]);

  assertThrows(
    () => runtimeV02PlaceCreatureFromHand(state, 1, baby.uid, "reserve", 0, { turn_seq: -1 }),
    "tcg_v0_2_creature_placement_turn_invalid",
  );
  assertEquals(state.hand.map((entry) => entry.uid), [baby.uid, teen.uid]);
  assertEquals(state.reserve, [null, null, null, null]);

  const placed = runtimeV02PlaceCreatureFromHand(state, 1, baby.uid, "reserve", 0, { turn_seq: 1 });
  assertThrows(
    () => runtimeV02EvolveCreatureFromHand(state, 1, placed.creature, teen.uid, -1),
    "tcg_v0_2_creature_evolution_turn_invalid",
  );
  assertEquals(state.hand.map((entry) => entry.uid), [teen.uid]);
  assertEquals(placed.creature.stack.map((entry) => entry.uid), [baby.uid]);
});
