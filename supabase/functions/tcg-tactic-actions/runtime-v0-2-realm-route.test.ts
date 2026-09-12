import {
  runtimeV02BeginRealmPlayRoute,
} from "../_shared/tcg-match-realm-route-v0-2.ts";

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

function runtimeMarker() {
  return {
    registry_id: "SB1-set-one-v0.2",
    set_code: "SB1",
    card_schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    card_count: 193,
    registry_sha256: "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
    runtime_authority: false,
  };
}

function realmDefinition(id: string, listeners: Record<string, unknown>[] = []) {
  return {
    id,
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    kind: "Tactic",
    family: "Realm",
    tactic: { listeners },
  };
}

function state(options: {
  p1Hand?: Inst[];
  p1Discard?: Inst[];
  p2Hand?: Inst[];
  p2Discard?: Inst[];
  realm?: { card: Inst; owner_seat: 1 | 2; played_turn: number } | null;
  definitions?: string[];
} = {}) {
  const cardIndex: Record<string, Record<string, unknown>> = {};
  for (const id of options.definitions ?? []) {
    cardIndex[id] = { definition_v0_2: realmDefinition(id) };
  }
  return {
    turn_seq: 12,
    turn_flags: { "1": {}, "2": {} },
    realm: options.realm ?? null,
    players: {
      "1": {
        hand: options.p1Hand ?? [],
        discard: options.p1Discard ?? [],
        vanguard: null,
        reserve: [],
      },
      "2": {
        hand: options.p2Hand ?? [],
        discard: options.p2Discard ?? [],
        vanguard: null,
        reserve: [],
      },
    },
    runtime_registry_v0_2: runtimeMarker(),
    card_index: cardIndex,
  } as Record<string, unknown>;
}

Deno.test("Realm Route first placement delegates to Realm Engine without manufacturing a replacement event", () => {
  const incoming = card("realm-new", "test-realm-new");
  const current = state({
    p1Hand: [incoming],
    definitions: [incoming.card_id],
  });

  const result = runtimeV02BeginRealmPlayRoute<Inst>(
    current,
    1,
    incoming,
    "play_realm",
  );

  equal((current.players as any)["1"].hand.length, 0);
  equal((current.realm as any).card, incoming);
  equal(result.realm.card, incoming);
  equal(result.replaced_realm, null);
  equal(result.replacement_event, null);
  equal(result.flow.status, "complete");
  equal(result.flow.processed_listener_keys.length, 0);
  equal(result.flow.emitted_heal_packet_ids.length, 0);
  equal(result.flow.emitted_movement_events.length, 0);
  equal(result.flow.pending_choice, null);
  equal(Array.isArray(current.effect_events), false);
});

Deno.test("Realm Route replacement sequences Realm Engine then canonical replacement event then Event Listener", () => {
  const previous = card("realm-old", "test-realm-old");
  const incoming = card("realm-new", "test-realm-new");
  const current = state({
    p2Hand: [incoming],
    p1Discard: [],
    realm: { card: previous, owner_seat: 1, played_turn: 8 },
    definitions: [previous.card_id, incoming.card_id],
  });

  const result = runtimeV02BeginRealmPlayRoute<Inst>(
    current,
    2,
    incoming,
    "play_realm",
    { phase: "play", action_kind: "realm" },
  );

  equal((current.players as any)["2"].hand.length, 0);
  equal((current.players as any)["1"].discard[0], previous);
  equal((current.realm as any).card, incoming);
  equal(result.replaced_realm?.card, previous);
  assert(result.replacement_event, "replacement event required");
  equal(result.replacement_event.event, "realm_replaced");
  equal(result.replacement_event.previous_card_uid, previous.uid);
  equal(result.replacement_event.incoming_card_uid, incoming.uid);
  equal(result.replacement_event.previous_controller_seat, 1);
  equal(result.replacement_event.incoming_controller_seat, 2);
  equal(result.replacement_event.source_action_id, "play_realm");
  equal(result.flow.status, "complete");
  equal(result.flow.pending_choice, null);
  equal((current.effect_events as any[]).length, 1);
  equal((current.effect_events as any[])[0].event_id, result.replacement_event.event_id);
});

Deno.test("Realm Route validates routing metadata before Realm Engine mutation", () => {
  const incoming = card("realm-new", "test-realm-new");
  const current = state({
    p1Hand: [incoming],
    definitions: [incoming.card_id],
  });

  throws(
    () => runtimeV02BeginRealmPlayRoute<Inst>(
      current,
      1,
      incoming,
      "play_realm",
      { phase: "   ", action_kind: "realm" },
    ),
    "tcg_v0_2_realm_route_phase_required",
  );

  equal((current.players as any)["1"].hand[0], incoming);
  equal(current.realm, null);
  equal((current.turn_flags as any)["1"].realm_turn, undefined);
});

Deno.test("Realm Route propagates Realm Engine legality failures without partial orchestration", () => {
  const previous = card("realm-old", "same-realm");
  const incoming = card("realm-new", "same-realm");
  const current = state({
    p2Hand: [incoming],
    realm: { card: previous, owner_seat: 1, played_turn: 8 },
    definitions: [previous.card_id],
  });

  throws(
    () => runtimeV02BeginRealmPlayRoute<Inst>(
      current,
      2,
      incoming,
      "play_realm",
    ),
    "tcg_v0_2_realm_same_named_replacement_forbidden",
  );

  equal((current.players as any)["2"].hand[0], incoming);
  equal((current.players as any)["1"].discard.length, 0);
  equal((current.realm as any).card, previous);
  equal(Array.isArray(current.effect_events), false);
});
