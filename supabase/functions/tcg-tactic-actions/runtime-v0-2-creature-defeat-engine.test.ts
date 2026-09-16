import {
  runtimeV02ResolveDefeatedCreatures,
  type RuntimeV02CreaturePlayerState,
  type RuntimeV02CreatureState,
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

function card(uid: string, cardId = uid): RuntimeV02CardZoneInstance {
  return { uid, card_id: cardId };
}

function creature(
  stack: RuntimeV02CardZoneInstance[],
  essence: RuntimeV02CardZoneInstance[] = [],
  relic: RuntimeV02CardZoneInstance | null = null,
  damage = 100,
): RuntimeV02CreatureState<RuntimeV02CardZoneInstance> {
  return { stack, essence, relic, damage };
}

function player(
  vanguard: RuntimeV02CreatureState<RuntimeV02CardZoneInstance> | null,
  reserve: Array<RuntimeV02CreatureState<RuntimeV02CardZoneInstance> | null> = [null, null, null, null],
  discard: RuntimeV02CardZoneInstance[] = [],
): RuntimeV02CreaturePlayerState<RuntimeV02CardZoneInstance> {
  return { vanguard, reserve, discard };
}

Deno.test("Creature Engine resolves a defeated Vanguard through one ordered Card-Zone batch", () => {
  const existing = card("discard-existing");
  const baby = card("baby");
  const adult = card("adult");
  const firstEssence = card("essence-1");
  const secondEssence = card("essence-2");
  const relic = card("relic-1");
  const defeated = creature([baby, adult], [firstEssence, secondEssence], relic);
  const owner = player(defeated, [null, null, null, null], [existing]);

  const result = runtimeV02ResolveDefeatedCreatures([{
    owner_seat: 1,
    player: owner,
    where: "vanguard",
    index: null,
    creature: defeated,
    max_hp: 100,
  }]);

  assertEquals(owner.vanguard, null);
  assertEquals(defeated.stack, []);
  assertEquals(defeated.essence, []);
  assertEquals(defeated.relic, null);
  assertEquals(owner.discard.map((entry) => entry.uid), [
    existing.uid,
    baby.uid,
    adult.uid,
    firstEssence.uid,
    secondEssence.uid,
    relic.uid,
  ]);
  assertSame(owner.discard[1], baby);
  assertSame(owner.discard[2], adult);
  assertSame(owner.discard[3], firstEssence);
  assertSame(owner.discard[4], secondEssence);
  assertSame(owner.discard[5], relic, "singleton Relic lost exact instance identity");
  assertEquals(result.defeats, [{
    owner_seat: 1,
    where: "vanguard",
    index: null,
    anchor_uid: adult.uid,
    discarded_card_uids: [baby.uid, adult.uid, firstEssence.uid, secondEssence.uid, relic.uid],
  }]);
  assertEquals(result.card_zone_batch.count, 5);
  assertEquals(result.card_zone_batch.transfers.map((entry) => entry.source.zone), [
    "creature_stack",
    "attached_essence",
    "attached_relic",
  ]);
});

Deno.test("Creature Engine resolves simultaneous defeated creatures in stable scan order", () => {
  const first = creature([card("seat-1-vanguard")]);
  const second = creature([card("seat-2-reserve")], [card("seat-2-essence")]);
  const playerOne = player(first);
  const playerTwo = player(null, [null, second, null, null]);

  const result = runtimeV02ResolveDefeatedCreatures([
    { owner_seat: 1, player: playerOne, where: "vanguard", index: null, creature: first, max_hp: 100 },
    { owner_seat: 2, player: playerTwo, where: "reserve", index: 1, creature: second, max_hp: 100 },
  ]);

  assertEquals(playerOne.vanguard, null);
  assertEquals(playerTwo.reserve[1], null);
  assertEquals(playerOne.discard.map((entry) => entry.uid), ["seat-1-vanguard"]);
  assertEquals(playerTwo.discard.map((entry) => entry.uid), ["seat-2-reserve", "seat-2-essence"]);
  assertEquals(result.defeats.map((entry) => `${entry.owner_seat}:${entry.where}:${entry.index}`), [
    "1:vanguard:null",
    "2:reserve:1",
  ]);
});

Deno.test("Creature Engine rejects stale battlefield identity before any card moves", () => {
  const defeatedCard = card("creature");
  const defeated = creature([defeatedCard]);
  const replacement = creature([card("replacement")], [], null, 0);
  const owner = player(replacement);

  assertThrows(
    () => runtimeV02ResolveDefeatedCreatures([{
      owner_seat: 1,
      player: owner,
      where: "vanguard",
      index: null,
      creature: defeated,
      max_hp: 100,
    }]),
    "tcg_v0_2_creature_defeat_position_changed",
  );

  assertSame(owner.vanguard, replacement);
  assertSame(defeated.stack[0], defeatedCard);
  assertEquals(owner.discard, []);
});

Deno.test("Creature/Card-Zone transaction rolls back all candidates when a later destination collides", () => {
  const firstCard = card("first");
  const secondCard = card("second");
  const first = creature([firstCard]);
  const second = creature([secondCard]);
  const playerOne = player(first);
  const collision = card(secondCard.uid, "different-card");
  const playerTwo = player(second, [null, null, null, null], [collision]);

  assertThrows(
    () => runtimeV02ResolveDefeatedCreatures([
      { owner_seat: 1, player: playerOne, where: "vanguard", index: null, creature: first, max_hp: 100 },
      { owner_seat: 2, player: playerTwo, where: "vanguard", index: null, creature: second, max_hp: 100 },
    ]),
    "tcg_v0_2_card_zone_destination_uid_collision",
  );

  assertSame(playerOne.vanguard, first);
  assertSame(playerTwo.vanguard, second);
  assertSame(first.stack[0], firstCard);
  assertSame(second.stack[0], secondCard);
  assertEquals(playerOne.discard, []);
  assertSame(playerTwo.discard[0], collision);
  assertEquals(playerTwo.discard.length, 1);
});

Deno.test("Creature Engine rejects a non-defeated creature without mutation", () => {
  const active = creature([card("active")], [], null, 90);
  const owner = player(active);

  assertThrows(
    () => runtimeV02ResolveDefeatedCreatures([{
      owner_seat: 1,
      player: owner,
      where: "vanguard",
      index: null,
      creature: active,
      max_hp: 100,
    }]),
    "tcg_v0_2_creature_not_defeated",
  );

  assertSame(owner.vanguard, active);
  assertEquals(owner.discard, []);
});
