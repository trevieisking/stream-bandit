import {
  runtimeV02ApplyCardZoneTransfer,
  runtimeV02PreflightCardZoneTransfer,
  type RuntimeV02CardZoneEndpoint,
  type RuntimeV02CardZoneInstance,
  type RuntimeV02CardZoneTransferRequest,
} from "../_shared/tcg-match-card-zone-engine-v0-2.ts";

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

function endpoint(zone: RuntimeV02CardZoneEndpoint["zone"], ownerCardUid: string | null = null): RuntimeV02CardZoneEndpoint {
  return { controller_seat: 1, zone, owner_card_uid: ownerCardUid };
}

function request(
  cardUids: string[],
  destinationPosition: "top" | "bottom" = "bottom",
): RuntimeV02CardZoneTransferRequest {
  return {
    cause: "effect",
    action_kind: "attack",
    source_action_id: "attack-2",
    source_card_uid: "source-creature-1",
    source: endpoint("attached_essence", "source-creature-1"),
    destination: endpoint("discard"),
    card_uids: cardUids,
    destination_position: destinationPosition,
  };
}

Deno.test("Card-Zone Engine transfers supplied cards atomically and preserves exact instance identity", () => {
  const first = card("essence-1", "gale-breeze-essence");
  const kept = card("essence-2", "stone-anchor-essence");
  const second = card("essence-3", "volt-charge-essence");
  const existing = card("discard-1", "grove-seed-essence");
  const source = [first, kept, second];
  const discard = [existing];

  const result = runtimeV02ApplyCardZoneTransfer(source, discard, request([second.uid, first.uid]));

  assertEquals(source.map((entry) => entry.uid), [kept.uid]);
  assertEquals(discard.map((entry) => entry.uid), [existing.uid, second.uid, first.uid]);
  assertSame(discard[1], second, "first moved card lost exact instance identity");
  assertSame(discard[2], first, "second moved card lost exact instance identity");
  assertSame(result.cards[0], second, "transaction result cloned the first moved card");
  assertSame(result.cards[1], first, "transaction result cloned the second moved card");
  assertEquals(result.receipt, {
    schema: "sb-tcg-card-zone-transfer-v0.2",
    cause: "effect",
    action_kind: "attack",
    source_action_id: "attack-2",
    source_card_uid: "source-creature-1",
    source: endpoint("attached_essence", "source-creature-1"),
    destination: endpoint("discard"),
    card_uids: [second.uid, first.uid],
    destination_position: "bottom",
    count: 2,
  });
});

Deno.test("Card-Zone Engine applies explicit top ordering without reversing supplied order", () => {
  const first = card("card-1", "card-a");
  const second = card("card-2", "card-b");
  const existing = card("card-3", "card-c");
  const source = [first, second];
  const destination = [existing];

  runtimeV02ApplyCardZoneTransfer(source, destination, request([second.uid, first.uid], "top"));

  assertEquals(destination.map((entry) => entry.uid), [second.uid, first.uid, existing.uid]);
  assertSame(destination[0], second);
  assertSame(destination[1], first);
});

Deno.test("Card-Zone preflight rejects a missing selected UID before either zone mutates", () => {
  const selected = card("essence-1", "gale-breeze-essence");
  const source = [selected];
  const discard: RuntimeV02CardZoneInstance[] = [];

  assertThrows(
    () => runtimeV02PreflightCardZoneTransfer(source, discard, request(["missing-uid"])),
    "tcg_v0_2_card_zone_selected_card_missing",
  );

  assertEquals(source, [selected]);
  assertEquals(discard, []);
});

Deno.test("Card-Zone preflight rejects duplicate selection UIDs before either zone mutates", () => {
  const selected = card("essence-1", "gale-breeze-essence");
  const source = [selected];
  const discard: RuntimeV02CardZoneInstance[] = [];

  assertThrows(
    () => runtimeV02ApplyCardZoneTransfer(source, discard, request([selected.uid, selected.uid])),
    "tcg_v0_2_card_zone_card_uid_duplicate",
  );

  assertEquals(source, [selected]);
  assertEquals(discard, []);
});

Deno.test("Card-Zone preflight rejects destination UID collisions before either zone mutates", () => {
  const selected = card("essence-1", "gale-breeze-essence");
  const collision = card("essence-1", "stone-anchor-essence");
  const source = [selected];
  const discard = [collision];

  assertThrows(
    () => runtimeV02ApplyCardZoneTransfer(source, discard, request([selected.uid])),
    "tcg_v0_2_card_zone_destination_uid_collision",
  );

  assertSame(source[0], selected);
  assertSame(discard[0], collision);
});

Deno.test("Card-Zone Engine cannot take over specialist attachment destinations", () => {
  const selected = card("essence-1", "gale-breeze-essence");
  const source = [selected];
  const destination: RuntimeV02CardZoneInstance[] = [];
  const invalid = {
    ...request([selected.uid]),
    destination: endpoint("attached_essence", "target-creature-1"),
  };

  assertThrows(
    () => runtimeV02ApplyCardZoneTransfer(source, destination, invalid),
    "tcg_v0_2_card_zone_specialist_destination_owned",
  );

  assertEquals(source, [selected]);
  assertEquals(destination, []);
});
