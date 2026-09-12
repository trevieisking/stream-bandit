import {
  runtimeV02CreateRealmReplacedEvent,
  type RuntimeV02RealmReplacedEvent,
} from "../_shared/tcg-match-realm-replaced-event-v0-2.ts";
import type { RuntimeV02RealmPlayReceipt } from "../_shared/tcg-match-realm-engine-v0-2.ts";

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

function inst(uid: string, cardId: string): Inst {
  return { uid, card_id: cardId };
}

function receipt(overrides: Partial<RuntimeV02RealmPlayReceipt> = {}): RuntimeV02RealmPlayReceipt {
  return {
    schema: "sb-tcg-realm-transaction-v0.2",
    controller_seat: 1,
    turn_seq: 8,
    source_action_id: "play_realm",
    incoming_card_uid: "realm-new-uid",
    incoming_card_id: "test-new-realm",
    previous_controller_seat: 2,
    previous_card_uid: "realm-old-uid",
    previous_card_id: "test-old-realm",
    event_name: "realm_replaced",
    ...overrides,
  };
}

function state() {
  const oldRealm = inst("realm-old-uid", "test-old-realm");
  const newRealm = inst("realm-new-uid", "test-new-realm");
  return {
    turn_seq: 8,
    realm: {
      card: newRealm,
      owner_seat: 1,
      played_turn: 8,
    },
    players: {
      "1": { discard: [] as Inst[] },
      "2": { discard: [oldRealm] as Inst[] },
    },
    effect_events: [] as Record<string, unknown>[],
    oldRealm,
    newRealm,
  } as Record<string, unknown> & {
    oldRealm: Inst;
    newRealm: Inst;
  };
}

function create(current: Record<string, unknown>, currentReceipt = receipt()): RuntimeV02RealmReplacedEvent {
  return runtimeV02CreateRealmReplacedEvent(current, currentReceipt, {
    phase: "build",
    action_kind: "play_realm",
  });
}

Deno.test("Realm replacement event records authoritative old/new identity after the transaction", () => {
  const current = state();
  const event = create(current);

  equal(event.event, "realm_replaced");
  equal(event.subject_uid, "realm-new-uid");
  equal(event.subject_card_id, "test-new-realm");
  equal(event.controller_seat, 1);
  equal(event.source_controller_seat, 1);
  equal(event.previous_controller_seat, 2);
  equal(event.previous_card_uid, "realm-old-uid");
  equal(event.previous_card_id, "test-old-realm");
  equal(event.incoming_controller_seat, 1);
  equal(event.incoming_card_uid, "realm-new-uid");
  equal(event.incoming_card_id, "test-new-realm");
  equal(event.origin_zone, "realm");
  equal(event.destination_zone, "realm");
  equal(event.phase, "build");
  equal(event.action_kind, "play_realm");
  equal(event.source_action_id, "play_realm");
  equal(event.source_card_uid, "realm-new-uid");
  equal(event.turn_seq, 8);
  equal(event.event_count, 1);
  equal(event.event_id, "realm-replaced:8:1:2:play_realm:play_realm:realm-old-uid:realm-new-uid");

  const events = current.effect_events as Record<string, unknown>[];
  equal(events.length, 1);
  equal(events[0].event_id, event.event_id);
  equal(events[0].previous_card_uid, "realm-old-uid");
  equal(events[0].incoming_card_uid, "realm-new-uid");

  // Recorded context is immutable relative to the returned clone.
  event.previous_card_uid = "mutated-return-value";
  equal(events[0].previous_card_uid, "realm-old-uid");
});

Deno.test("Realm replacement event recording is deterministic and idempotent", () => {
  const current = state();
  const first = create(current);
  const second = create(current);
  equal(first.event_id, second.event_id);
  equal((current.effect_events as unknown[]).length, 1);
});

Deno.test("first Realm placement cannot manufacture a realm_replaced event", () => {
  const current = state();
  throws(
    () => create(current, receipt({
      previous_controller_seat: null,
      previous_card_uid: null,
      previous_card_id: null,
      event_name: null,
    })),
    "tcg_v0_2_realm_replaced_event_replacement_required",
  );
  equal((current.effect_events as unknown[]).length, 0);
});

Deno.test("Realm replacement event fails when the receipt turn is stale", () => {
  const current = state();
  throws(
    () => create(current, receipt({ turn_seq: 7 })),
    "tcg_v0_2_realm_replaced_event_receipt_turn_mismatch",
  );
  equal((current.effect_events as unknown[]).length, 0);
});

Deno.test("Realm replacement event requires the incoming Realm to already be authoritative", () => {
  const current = state();
  (current.realm as any).card = inst("other-new", "other-realm");
  throws(
    () => create(current),
    "tcg_v0_2_realm_replaced_event_active_identity_mismatch",
  );
  equal((current.effect_events as unknown[]).length, 0);
});

Deno.test("Realm replacement event requires the previous Realm to already be discarded", () => {
  const current = state();
  (current.players as any)["2"].discard = [];
  throws(
    () => create(current),
    "tcg_v0_2_realm_replaced_event_previous_not_discarded",
  );
  equal((current.effect_events as unknown[]).length, 0);
});

Deno.test("Realm replacement event rejects stale previous-Realm identity", () => {
  const current = state();
  (current.players as any)["2"].discard[0] = inst("realm-old-uid", "changed-old-realm");
  throws(
    () => create(current),
    "tcg_v0_2_realm_replaced_event_previous_identity_mismatch",
  );
  equal((current.effect_events as unknown[]).length, 0);
});
