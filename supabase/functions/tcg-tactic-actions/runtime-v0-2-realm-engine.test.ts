import {
  runtimeV02ApplyRealmPlayTransaction,
} from "../_shared/tcg-match-realm-engine-v0-2.ts";

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function throws(fn: () => unknown, expected: string): void {
  try {
    fn();
  } catch (error) {
    equal(error instanceof Error ? error.message : String(error), expected);
    return;
  }
  throw new Error(`expected error: ${expected}`);
}

type Inst = { uid: string; card_id: string };

function card(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function state(options: {
  p1Hand?: Inst[];
  p1Discard?: Inst[];
  p2Hand?: Inst[];
  p2Discard?: Inst[];
  realm?: { card: Inst; owner_seat: 1 | 2; played_turn: number } | null;
  p1RealmTurn?: number | null;
  p2RealmTurn?: number | null;
} = {}) {
  const turnFlags: Record<string, Record<string, unknown>> = {
    "1": {},
    "2": {},
  };
  if (options.p1RealmTurn != null) turnFlags["1"].realm_turn = options.p1RealmTurn;
  if (options.p2RealmTurn != null) turnFlags["2"].realm_turn = options.p2RealmTurn;
  return {
    turn_seq: 12,
    turn_flags: turnFlags,
    realm: options.realm ?? null,
    players: {
      "1": {
        hand: options.p1Hand ?? [],
        discard: options.p1Discard ?? [],
      },
      "2": {
        hand: options.p2Hand ?? [],
        discard: options.p2Discard ?? [],
      },
    },
  } as Record<string, unknown>;
}

Deno.test("Realm Engine places the exact hand instance into the empty shared Realm slot", () => {
  const incoming = card("realm-new", "test-realm-a");
  const current = state({ p1Hand: [incoming] });

  const result = runtimeV02ApplyRealmPlayTransaction<Inst>(
    current,
    1,
    incoming,
    "play_realm",
  );

  const p1 = (current.players as any)["1"];
  equal(p1.hand.length, 0);
  equal((current.realm as any).card, incoming);
  equal((current.realm as any).owner_seat, 1);
  equal((current.realm as any).played_turn, 12);
  equal((current.turn_flags as any)["1"].realm_turn, 12);
  equal(result.realm.card, incoming);
  equal(result.replaced_realm, null);
  equal(result.receipt.event_name, null);
  equal(result.receipt.incoming_card_uid, "realm-new");
});

Deno.test("Realm Engine replaces atomically, discards the prior exact object, and emits handoff metadata", () => {
  const previous = card("realm-old", "test-realm-old");
  const incoming = card("realm-new", "test-realm-new");
  const current = state({
    p2Hand: [incoming],
    p1Discard: [],
    realm: { card: previous, owner_seat: 1, played_turn: 8 },
  });

  const result = runtimeV02ApplyRealmPlayTransaction<Inst>(
    current,
    2,
    incoming,
    "play_realm",
  );

  const p1 = (current.players as any)["1"];
  const p2 = (current.players as any)["2"];
  equal(p2.hand.length, 0);
  equal(p1.discard.length, 1);
  equal(p1.discard[0], previous);
  equal((current.realm as any).card, incoming);
  equal((current.realm as any).owner_seat, 2);
  equal(result.replaced_realm?.card, previous);
  equal(result.receipt.previous_controller_seat, 1);
  equal(result.receipt.previous_card_uid, "realm-old");
  equal(result.receipt.previous_card_id, "test-realm-old");
  equal(result.receipt.event_name, "realm_replaced");
});

Deno.test("Realm Engine rejects same-named replacement without mutating hand, discard, slot, or flags", () => {
  const previous = card("realm-old", "same-realm");
  const incoming = card("realm-new", "same-realm");
  const current = state({
    p2Hand: [incoming],
    p1Discard: [],
    realm: { card: previous, owner_seat: 1, played_turn: 8 },
  });
  const originalRealm = current.realm;

  throws(
    () => runtimeV02ApplyRealmPlayTransaction<Inst>(current, 2, incoming, "play_realm"),
    "tcg_v0_2_realm_same_named_replacement_forbidden",
  );

  equal((current.players as any)["2"].hand[0], incoming);
  equal((current.players as any)["1"].discard.length, 0);
  equal(current.realm, originalRealm);
  equal((current.turn_flags as any)["2"].realm_turn, undefined);
});

Deno.test("Realm Engine enforces one Realm play per controller turn without mutation", () => {
  const incoming = card("realm-new", "test-realm-new");
  const current = state({ p1Hand: [incoming], p1RealmTurn: 12 });

  throws(
    () => runtimeV02ApplyRealmPlayTransaction<Inst>(current, 1, incoming, "play_realm"),
    "tcg_v0_2_realm_already_played_this_turn",
  );

  equal((current.players as any)["1"].hand[0], incoming);
  equal(current.realm, null);
  equal((current.turn_flags as any)["1"].realm_turn, 12);
});

Deno.test("Realm Engine rejects stale source identity before any slot mutation", () => {
  const actual = card("realm-new", "test-realm-new");
  const current = state({ p1Hand: [actual] });

  throws(
    () => runtimeV02ApplyRealmPlayTransaction<Inst>(
      current,
      1,
      { uid: "realm-new", card_id: "different-realm" },
      "play_realm",
    ),
    "tcg_v0_2_realm_source_identity_changed",
  );

  equal((current.players as any)["1"].hand[0], actual);
  equal(current.realm, null);
});

Deno.test("Realm Engine fails closed if the active Realm already collides with its owner discard", () => {
  const previous = card("realm-old", "test-realm-old");
  const duplicate = card("realm-old", "test-realm-old");
  const incoming = card("realm-new", "test-realm-new");
  const current = state({
    p2Hand: [incoming],
    p1Discard: [duplicate],
    realm: { card: previous, owner_seat: 1, played_turn: 8 },
  });

  throws(
    () => runtimeV02ApplyRealmPlayTransaction<Inst>(current, 2, incoming, "play_realm"),
    "tcg_v0_2_realm_discard_uid_collision:realm-old",
  );

  equal((current.players as any)["2"].hand[0], incoming);
  equal((current.players as any)["1"].discard.length, 1);
  equal((current.realm as any).card, previous);
});
