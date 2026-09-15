import {
  runtimeV02ApplyCardZoneTransferBatch,
  runtimeV02ApplyCardZonePartitionTransfer,
  runtimeV02ApplyCardZoneTransfer,
  runtimeV02CommitCardZoneTransfer,
  runtimeV02PreflightCardZoneTransfer,
  type RuntimeV02CardZoneEndpoint,
  type RuntimeV02CardZoneInstance,
  type RuntimeV02CardZonePartitionTransferRequest,
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

function partitionRequest(
  windowCardUids: string[],
  destinationCardUids: string[],
): RuntimeV02CardZonePartitionTransferRequest {
  return {
    cause: "effect",
    action_kind: "attack",
    source_action_id: "look-attack",
    source_card_uid: "source-creature-1",
    source: endpoint("deck"),
    destination: endpoint("hand"),
    source_window: { position: "top", card_uids: windowCardUids },
    destination_card_uids: destinationCardUids,
    source_remainder_position: "bottom",
    destination_position: "bottom",
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

Deno.test("Card-Zone commit rejects stale exact-object snapshots before either zone mutates", () => {
  const selected = card("essence-1", "gale-breeze-essence");
  const source = [selected];
  const discard: RuntimeV02CardZoneInstance[] = [];
  const preflight = runtimeV02PreflightCardZoneTransfer(source, discard, request([selected.uid]));
  const replacement = card(selected.uid, selected.card_id);
  source[0] = replacement;

  assertThrows(
    () => runtimeV02CommitCardZoneTransfer(source, discard, preflight),
    "tcg_v0_2_card_zone_preflight_stale",
  );

  assertSame(source[0], replacement);
  assertEquals(discard, []);
});

Deno.test("Card-Zone batch preserves operation order and exact identities across multiple source zones", () => {
  const baby = card("baby-1", "baby");
  const adult = card("adult-1", "adult");
  const essence = card("essence-1", "essence");
  const relic = card("relic-1", "relic");
  const existing = card("discard-1", "existing");
  const stack = [baby, adult];
  const attachedEssence = [essence];
  const attachedRelic = [relic];
  const discard = [existing];
  const owner = adult.uid;

  const result = runtimeV02ApplyCardZoneTransferBatch([
    {
      source_zone: stack,
      destination_zone: discard,
      request: { ...request([baby.uid, adult.uid]), action_kind: "defeat", source_action_id: "defeated_creature", source: endpoint("creature_stack", owner) },
    },
    {
      source_zone: attachedEssence,
      destination_zone: discard,
      request: { ...request([essence.uid]), action_kind: "defeat", source_action_id: "defeated_creature", source: endpoint("attached_essence", owner) },
    },
    {
      source_zone: attachedRelic,
      destination_zone: discard,
      request: { ...request([relic.uid]), action_kind: "defeat", source_action_id: "defeated_creature", source: endpoint("attached_relic", owner) },
    },
  ]);

  assertEquals(stack, []);
  assertEquals(attachedEssence, []);
  assertEquals(attachedRelic, []);
  assertEquals(discard.map((entry) => entry.uid), [existing.uid, baby.uid, adult.uid, essence.uid, relic.uid]);
  assertSame(discard[1], baby);
  assertSame(discard[2], adult);
  assertSame(discard[3], essence);
  assertSame(discard[4], relic);
  assertEquals(result.receipt.schema, "sb-tcg-card-zone-transfer-batch-v0.2");
  assertEquals(result.receipt.card_uids, [baby.uid, adult.uid, essence.uid, relic.uid]);
  assertEquals(result.receipt.count, 4);
  assertEquals(result.receipt.transfers.length, 3);
});

Deno.test("Card-Zone batch rolls back every real zone when a later operation fails", () => {
  const creature = card("creature-1", "creature");
  const essence = card("essence-1", "essence");
  const existing = card("discard-1", "existing");
  const stack = [creature];
  const attachedEssence = [essence];
  const discard = [existing];

  assertThrows(
    () => runtimeV02ApplyCardZoneTransferBatch([
      {
        source_zone: stack,
        destination_zone: discard,
        request: { ...request([creature.uid]), action_kind: "defeat", source_action_id: "defeated_creature", source: endpoint("creature_stack", creature.uid) },
      },
      {
        source_zone: attachedEssence,
        destination_zone: discard,
        request: { ...request(["missing-essence"]), action_kind: "defeat", source_action_id: "defeated_creature", source: endpoint("attached_essence", creature.uid) },
      },
    ]),
    "tcg_v0_2_card_zone_selected_card_missing",
  );

  assertSame(stack[0], creature);
  assertSame(attachedEssence[0], essence);
  assertSame(discard[0], existing);
  assertEquals(stack.length, 1);
  assertEquals(attachedEssence.length, 1);
  assertEquals(discard.length, 1);
});

Deno.test("Card-Zone partition atomically moves a chosen top-window card and preserves remainder order at source bottom", () => {
  const first = card("alpha-1", "alpha");
  const chosen = card("beta-1", "beta");
  const outside = card("gamma-1", "gamma");
  const existingHand = card("hand-1", "existing");
  const deck = [first, chosen, outside];
  const hand = [existingHand];

  const result = runtimeV02ApplyCardZonePartitionTransfer(
    deck,
    hand,
    partitionRequest([first.uid, chosen.uid], [chosen.uid]),
  );

  assertEquals(deck.map((entry) => entry.uid), [outside.uid, first.uid]);
  assertEquals(hand.map((entry) => entry.uid), [existingHand.uid, chosen.uid]);
  assertSame(deck[1], first, "partition remainder lost exact instance identity");
  assertSame(hand[1], chosen, "partition destination card lost exact instance identity");
  assertSame(result.cards[0], chosen, "partition result cloned chosen card");
  assertSame(result.remainder[0], first, "partition result cloned remainder card");
  assertEquals(result.receipt, {
    schema: "sb-tcg-card-zone-partition-transfer-v0.2",
    cause: "effect",
    action_kind: "attack",
    source_action_id: "look-attack",
    source_card_uid: "source-creature-1",
    source: endpoint("deck"),
    destination: endpoint("hand"),
    source_window_position: "top",
    source_window_card_uids: [first.uid, chosen.uid],
    destination_card_uids: [chosen.uid],
    source_remainder_card_uids: [first.uid],
    source_remainder_position: "bottom",
    destination_position: "bottom",
    moved_count: 1,
    remainder_count: 1,
  });
});

Deno.test("Card-Zone partition rejects source-window drift before either zone mutates", () => {
  const first = card("alpha-1", "alpha");
  const second = card("beta-1", "beta");
  const outside = card("gamma-1", "gamma");
  const deck = [second, first, outside];
  const hand: RuntimeV02CardZoneInstance[] = [];

  assertThrows(
    () => runtimeV02ApplyCardZonePartitionTransfer(
      deck,
      hand,
      partitionRequest([first.uid, second.uid], [second.uid]),
    ),
    "tcg_v0_2_card_zone_partition_window_changed",
  );

  assertEquals(deck.map((entry) => entry.uid), [second.uid, first.uid, outside.uid]);
  assertEquals(hand, []);
});

Deno.test("Card-Zone partition rejects a destination selection outside the frozen source window before mutation", () => {
  const first = card("alpha-1", "alpha");
  const second = card("beta-1", "beta");
  const outside = card("gamma-1", "gamma");
  const deck = [first, second, outside];
  const hand: RuntimeV02CardZoneInstance[] = [];

  assertThrows(
    () => runtimeV02ApplyCardZonePartitionTransfer(
      deck,
      hand,
      partitionRequest([first.uid, second.uid], [outside.uid]),
    ),
    "tcg_v0_2_card_zone_partition_destination_outside_window",
  );

  assertEquals(deck.map((entry) => entry.uid), [first.uid, second.uid, outside.uid]);
  assertEquals(hand, []);
});

Deno.test("Card-Zone partition rejects destination UID collisions before source or destination mutates", () => {
  const first = card("alpha-1", "alpha");
  const chosen = card("beta-1", "beta");
  const outside = card("gamma-1", "gamma");
  const collision = card(chosen.uid, "different-card-id");
  const deck = [first, chosen, outside];
  const hand = [collision];

  assertThrows(
    () => runtimeV02ApplyCardZonePartitionTransfer(
      deck,
      hand,
      partitionRequest([first.uid, chosen.uid], [chosen.uid]),
    ),
    "tcg_v0_2_card_zone_destination_uid_collision",
  );

  assertEquals(deck.map((entry) => entry.uid), [first.uid, chosen.uid, outside.uid]);
  assertSame(hand[0], collision);
});

Deno.test("Card-Zone partition supports a bottom source window without changing generic ownership semantics", () => {
  const outside = card("alpha-1", "alpha");
  const chosen = card("beta-1", "beta");
  const remainder = card("gamma-1", "gamma");
  const source = [outside, chosen, remainder];
  const destination: RuntimeV02CardZoneInstance[] = [];
  const requestFromBottom = partitionRequest([chosen.uid, remainder.uid], [chosen.uid]);
  requestFromBottom.source_window.position = "bottom";
  requestFromBottom.source_remainder_position = "top";

  runtimeV02ApplyCardZonePartitionTransfer(source, destination, requestFromBottom);

  assertEquals(source.map((entry) => entry.uid), [remainder.uid, outside.uid]);
  assertEquals(destination.map((entry) => entry.uid), [chosen.uid]);
  assertSame(source[0], remainder);
  assertSame(destination[0], chosen);
});
