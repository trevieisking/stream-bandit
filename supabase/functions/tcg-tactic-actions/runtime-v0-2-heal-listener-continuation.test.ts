import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { applyRuntimeV02HealPacket } from "../_shared/tcg-match-heal-packet-v0-2.ts";
import { continueRuntimeV02AfterHealPackets } from "../_shared/tcg-match-heal-listener-continuation-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
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

type Inst = { uid: string; card_id: string; effect_flags?: Record<string, unknown> };
const inst = (uid: string, card_id: string): Inst => ({ uid, card_id });
const creature = (top: Inst, damage: number, essence: Inst[] = []) => ({
  stack: [top],
  essence,
  relic: null,
  damage,
  shield: 0,
  conditions: { scorched: false, venomed: 0, control: null, modifier: null },
  flags: {},
});
function card(id: string, body: Record<string, unknown>) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    traits: [],
    pack_only: false,
    deck_limit: { scope: "identity", max: 4 },
    prestige: { starbound: { enabled: false } },
    ...body,
  };
}

function state(withOptionalRealm = false) {
  const source = inst("source-uid", "test-source");
  const reciprocal = inst("reciprocal-uid", "test-reciprocal");
  const targetA = inst("target-a-uid", "test-target-a");
  const targetB = inst("target-b-uid", "test-target-b");
  const realm = inst("realm-uid", "test-optional-realm");
  const definitions: Record<string, unknown> = {
    "test-source": card("test-source", {
      card_family: "Creature",
      element: "Grove",
      creature: {
        stage: "Teen",
        ability: {
          id: "nested-self-shield",
          name: "Nested Self Shield",
          mode: "triggered",
          event: "after_heal_packet",
          timing: "own_turn",
          limit: { scope: "turn", count: 1, owner: "card_instance" },
          requirements: {
            all: [
              { predicate: "heal_packet_target_is_self" },
              { predicate: "heal_source_is_card_effect" },
              { predicate: "heal_actual_amount_at_least", value: 1 },
            ],
          },
          costs: [],
          steps: [{ op: "ADD_SHIELD", target: "$source_creature", amount: 10 }],
        },
        attacks: [],
      },
      essence: null,
      tactic: null,
    }),
    "test-reciprocal": card("test-reciprocal", {
      card_family: "Essence",
      element: "Grove",
      creature: null,
      essence: {
        subtype: "Special",
        provides: [{ element: "Grove", amount: 1 }],
        attach_requirements: [],
        on_attach: [],
        continuous: [],
        lifecycle: null,
        listeners: [{
          id: "reciprocal-heal",
          event: "after_heal_packet",
          requirements: {
            all: [
              { predicate: "heal_packet_source_is_attached_creature" },
              { predicate: "heal_packet_target_controller_is_self" },
              { predicate: "heal_packet_target_is_not_source" },
              { predicate: "heal_packet_source_action_kind_is", action_kind: "attack" },
              { predicate: "target_stage_in", target: "$attached_creature", stages: ["Teen", "Adult"] },
              { predicate: "target_element_is", target: "$attached_creature", element: "Grove" },
            ],
          },
          limit: { scope: "turn", count: 1, owner: "attachment" },
          steps: [{ op: "HEAL", target: "$attached_creature", amount: 10 }],
        }],
      },
      tactic: null,
    }),
    "test-target-a": card("test-target-a", {
      card_family: "Creature",
      element: "Tide",
      creature: { stage: "Baby", ability: null, attacks: [] },
      essence: null,
      tactic: null,
    }),
    "test-target-b": card("test-target-b", {
      card_family: "Creature",
      element: "Tide",
      creature: { stage: "Baby", ability: null, attacks: [] },
      essence: null,
      tactic: null,
    }),
    "test-optional-realm": card("test-optional-realm", {
      card_family: "Tactic",
      element: "Tide",
      creature: null,
      essence: null,
      tactic: {
        subtype: "Realm",
        program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: false, steps: [] },
        continuous: [],
        listeners: [{
          id: "optional-tide-filter",
          event: "after_heal_packet",
          controller_scope: "any",
          requirements: {
            all: [
              { predicate: "heal_actual_amount_at_least", value: 1 },
              { predicate: "heal_target_element_is", element: "Tide" },
              { predicate: "heal_controller_is_active_seat" },
              { predicate: "heal_source_is_card_effect" },
            ],
          },
          limit: { scope: "turn", count: 1, owner: "event_controller" },
          steps: [{
            op: "OPTIONAL",
            player: "$event_controller",
            steps: [
              { op: "DRAW", player: "$event_controller", count: 1 },
              { op: "CHOOSE_HAND_TO_DISCARD", player: "$event_controller", count: 1 },
            ],
          }],
        }],
      },
    }),
  };
  const s = {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 21,
    active_seat: 1,
    effect_events: [],
    card_index: Object.fromEntries(Object.entries(definitions).map(([cardId, definition]) => [cardId, {
      card_id: cardId,
      definition_v0_2: definition,
      definition_v0_2_rules_version: "sb-tcg-card-v0.2",
    }])),
    players: {
      "1": {
        vanguard: creature(source, 20, [reciprocal]),
        reserve: [creature(targetA, 20), creature(targetB, 20), null, null],
      },
      "2": { vanguard: null, reserve: [null, null, null, null] },
    },
    realm: withOptionalRealm ? { card: realm, owner_seat: 1, played_turn: 20 } : null,
  } as Record<string, unknown>;
  return { s, source, reciprocal, targetA, targetB, realm };
}

function attackHeal(
  s: Record<string, unknown>,
  reserveIndex: number,
) {
  const player = (s.players as any)["1"];
  const source = player.vanguard;
  const target = player.reserve[reserveIndex];
  return applyRuntimeV02HealPacket(s, target, 10, {
    source: {
      controller_seat: 1,
      action_kind: "attack",
      action_id: "test-attack",
      card_effect: true,
      card_uid: source.stack[0].uid,
      card_id: source.stack[0].card_id,
      creature_uid: source.stack[0].uid,
    },
    target: {
      controller_seat: 1,
      creature_uid: target.stack[0].uid,
      card_uid: target.stack[0].uid,
      card_id: target.stack[0].card_id,
      element: "Tide",
      where: "reserve",
      index: reserveIndex,
    },
  }).packet!;
}

Deno.test("continuation processes reversed roots and nested heal packets in canonical sequence", () => {
  const { s } = state(false);
  const first = attackHeal(s, 0);
  const second = attackHeal(s, 1);
  const result = continueRuntimeV02AfterHealPackets(s, [second.id, first.id])!;
  const player = (s.players as any)["1"];

  assertEquals(result.status, "complete");
  assertEquals(result.initial_packet_ids, ["heal:21:1", "heal:21:2"]);
  assertEquals(result.processed_packet_ids, ["heal:21:1", "heal:21:2", "heal:21:3"]);
  assertEquals(result.emitted_packet_ids, ["heal:21:3"]);
  assertEquals(result.remaining_packet_ids, []);
  assertEquals(result.dispatches.map((entry) => entry.sequence), [1, 2, 3]);
  assertEquals(player.vanguard.damage, 10, "reciprocal listener must heal once");
  assertEquals(player.vanguard.shield, 10, "nested packet must reach the source Ability exactly once");
  assertEquals((s.effect_events as any[]).map((event) => event.id), ["heal:21:1", "heal:21:2", "heal:21:3"]);
});

Deno.test("OPTIONAL deferral pauses after the current packet and preserves the nested continuation queue", () => {
  const { s, realm } = state(true);
  const root = attackHeal(s, 0);
  const paused = continueRuntimeV02AfterHealPackets(s, [root.id])!;
  const player = (s.players as any)["1"];

  assertEquals(paused.status, "player_choice_required");
  assertEquals(paused.processed_packet_ids, ["heal:21:1"]);
  assertEquals(paused.emitted_packet_ids, ["heal:21:2"]);
  assertEquals(paused.remaining_packet_ids, ["heal:21:2"]);
  assertEquals(paused.blocked_packet_id, "heal:21:1");
  assertEquals((paused.deferred[0] as any).listener_id, "optional-tide-filter");
  assertEquals(player.vanguard.damage, 10, "non-choice parent listener must resolve before the pause");
  assertEquals(player.vanguard.shield, 0, "nested packet must not run past an unresolved player choice");
  assertEquals(realm.effect_flags, undefined, "deferral must not consume the optional listener limit");

  s.realm = null;
  const resumed = continueRuntimeV02AfterHealPackets(s, paused.remaining_packet_ids)!;
  assertEquals(resumed.status, "complete");
  assertEquals(resumed.processed_packet_ids, ["heal:21:2"]);
  assertEquals(player.vanguard.shield, 10, "preserved nested packet must resume exactly once");
});

Deno.test("duplicate root packet ids fail before any listener mutation", () => {
  const { s } = state(false);
  const root = attackHeal(s, 0);
  const player = (s.players as any)["1"];
  assertThrows(
    () => continueRuntimeV02AfterHealPackets(s, [root.id, root.id]),
    "duplicate_root_packet_id",
  );
  assertEquals(player.vanguard.damage, 20);
  assertEquals(player.vanguard.shield, 0);
  assertEquals((s.effect_events as any[]).map((event) => event.id), ["heal:21:1"]);
});

Deno.test("unknown packet ids fail before any listener mutation", () => {
  const { s } = state(false);
  const player = (s.players as any)["1"];
  assertThrows(
    () => continueRuntimeV02AfterHealPackets(s, ["heal:21:999"]),
    "packet_not_found:heal:21:999",
  );
  assertEquals(player.vanguard.damage, 20);
  assertEquals(player.vanguard.shield, 0);
  assertEquals(s.effect_events, []);
});

Deno.test("legacy states remain outside continuation authority", () => {
  const { s } = state(false);
  const root = attackHeal(s, 0);
  delete s.runtime_registry_v0_2;
  const player = (s.players as any)["1"];
  assertEquals(continueRuntimeV02AfterHealPackets(s, [root.id]), null);
  assertEquals(player.vanguard.damage, 20);
  assertEquals(player.vanguard.shield, 0);
});
