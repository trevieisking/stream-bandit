import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { applyRuntimeV02HealPacket } from "../_shared/tcg-match-heal-packet-v0-2.ts";
import { dispatchRuntimeV02AfterHealPacket } from "../_shared/tcg-match-heal-listener-dispatch-v0-2.ts";
import { continueRuntimeV02AfterHealPackets } from "../_shared/tcg-match-heal-listener-continuation-v0-2.ts";
import {
  runtimeV02InstallHealListenerChoice,
  runtimeV02PendingHealListenerChoiceView,
  runtimeV02ResolveHealListenerChoice,
} from "../_shared/tcg-match-heal-listener-choice-v0-2.ts";

function assert(condition: unknown, message = "assertion failed") {
  if (!condition) throw new Error(message);
}
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

function makeState() {
  const source = inst("source-uid", "test-source");
  const reciprocal = inst("reciprocal-uid", "test-reciprocal");
  const targetA = inst("target-a-uid", "test-target-a");
  const targetB = inst("target-b-uid", "test-target-b");
  const realm = inst("realm-uid", "test-optional-realm");
  const handA = inst("hand-a-uid", "test-hand-a");
  const drawn = inst("drawn-uid", "test-drawn");
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
    "test-hand-a": card("test-hand-a", { card_family: "Tactic", element: "Grove", creature: null, essence: null, tactic: { subtype: "Device", program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: true, steps: [] }, listeners: [], continuous: [] } }),
    "test-drawn": card("test-drawn", { card_family: "Tactic", element: "Tide", creature: null, essence: null, tactic: { subtype: "Device", program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: true, steps: [] }, listeners: [], continuous: [] } }),
  };
  const s = {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 31,
    active_seat: 1,
    effect_events: [],
    card_index: Object.fromEntries(Object.entries(definitions).map(([cardId, definition]) => [cardId, {
      card_id: cardId,
      definition_v0_2: definition,
      definition_v0_2_rules_version: "sb-tcg-card-v0.2",
    }])),
    players: {
      "1": {
        hand: [handA],
        deck: [drawn],
        discard: [],
        vanguard: creature(source, 20, [reciprocal]),
        reserve: [creature(targetA, 20), creature(targetB, 20), null, null],
      },
      "2": { hand: [], deck: [], discard: [], vanguard: null, reserve: [null, null, null, null] },
    },
    realm: { card: realm, owner_seat: 1, played_turn: 30 },
  } as Record<string, unknown>;
  return { s, realm, source, targetA, targetB, handA, drawn };
}

function attackHeal(s: Record<string, unknown>, reserveIndex: number) {
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

function installFromRoot(s: Record<string, unknown>, reserveIndex = 0) {
  const root = attackHeal(s, reserveIndex);
  const continuation = continueRuntimeV02AfterHealPackets(s, [root.id])!;
  assertEquals(continuation.status, "player_choice_required");
  const pending = runtimeV02InstallHealListenerChoice(s, continuation);
  return { root, continuation, pending };
}

Deno.test("private optional decision is reconnect-stable and opponent sees waiting only", () => {
  const { s, realm } = makeState();
  const { pending } = installFromRoot(s);
  const chooser = runtimeV02PendingHealListenerChoiceView(pending, 1)! as any;
  const opponent = runtimeV02PendingHealListenerChoiceView(pending, 2)! as any;

  assertEquals(chooser.id, pending.id);
  assertEquals(chooser.stage, "optional_decision");
  assertEquals(chooser.options.map((option: any) => option.id), ["decline", "accept"]);
  assertEquals(runtimeV02PendingHealListenerChoiceView((s as any).pending_heal_listener_choice, 1), chooser, "reconnect view must preserve the same choice id and options");
  assertEquals(opponent, { id: pending.id, seat: 1, kind: "after_heal_optional", stage: "optional_decision", waiting: true });
  assertEquals(realm.effect_flags, undefined, "offering the choice must not consume receipt or limit");
});

Deno.test("accept draws exactly once then creates a new private discard choice", () => {
  const { s, realm } = makeState();
  const { pending } = installFromRoot(s);
  const beforeId = pending.id;
  const accepted = runtimeV02ResolveHealListenerChoice(s, 1, beforeId, ["accept"]);
  const player = (s.players as any)["1"];
  const next = accepted.pending_choice!;

  assertEquals(accepted.accepted, true);
  assertEquals(accepted.drawn, 1);
  assertEquals(next.stage, "discard_from_hand");
  assert(next.id !== beforeId, "discard stage requires a fresh stale-choice fence");
  assertEquals(player.deck.length, 0);
  assertEquals(player.hand.map((card: any) => card.uid), ["hand-a-uid", "drawn-uid"]);
  assertEquals((runtimeV02PendingHealListenerChoiceView(next, 1) as any).options.map((option: any) => option.id), ["card:hand-a-uid", "card:drawn-uid"]);
  assertEquals(runtimeV02PendingHealListenerChoiceView(next, 2), { id: next.id, seat: 1, kind: "after_heal_optional", stage: "discard_from_hand", waiting: true });
  assertEquals(realm.effect_flags, undefined, "accept alone must not consume the turn limit before discard completion");

  assertThrows(() => runtimeV02ResolveHealListenerChoice(s, 1, beforeId, ["accept"]), "stale_id");
  assertEquals(player.hand.map((card: any) => card.uid), ["hand-a-uid", "drawn-uid"], "stale replay must not draw again");
});

Deno.test("accepted discard commits receipt and turn limit exactly once then resumes nested packets", () => {
  const { s, realm } = makeState();
  const { root, pending } = installFromRoot(s);
  const accepted = runtimeV02ResolveHealListenerChoice(s, 1, pending.id, ["accept"]);
  const discardChoice = accepted.pending_choice!;
  const resolved = runtimeV02ResolveHealListenerChoice(s, 1, discardChoice.id, ["card:drawn-uid"]);
  const player = (s.players as any)["1"];

  assertEquals(resolved.accepted, true);
  assertEquals(resolved.discarded_uid, "drawn-uid");
  assertEquals(resolved.pending_choice, null);
  assertEquals(player.hand.map((card: any) => card.uid), ["hand-a-uid"]);
  assertEquals(player.discard.map((card: any) => card.uid), ["drawn-uid"]);
  assertEquals(player.vanguard.shield, 10, "preserved nested heal packet must resume after the private discard");

  const receipts = (realm.effect_flags as any).runtime_v0_2_listener_receipts;
  const limits = (realm.effect_flags as any).runtime_v0_2_listener_limits;
  assertEquals(receipts["optional-tide-filter:" + root.id], { packet_id: root.id, listener_id: "optional-tide-filter", turn_seq: 31 });
  const limit = Object.values(limits)[0] as any;
  assertEquals(limit.count, 1);
  assertEquals(limit.owner, "event_controller");

  const replay = dispatchRuntimeV02AfterHealPacket(s, root.id)!;
  assertEquals(replay.deferred.length, 0, "resolved optional listener must not be offered twice for the same packet");
  assert((replay.already_resolved as any[]).some((item) => item.listener_id === "optional-tide-filter"), "dispatcher must observe the shared receipt");
});

Deno.test("decline handles this packet without consuming the once-per-turn use", () => {
  const { s, realm } = makeState();
  const { root, pending } = installFromRoot(s);
  const declined = runtimeV02ResolveHealListenerChoice(s, 1, pending.id, ["decline"]);
  const player = (s.players as any)["1"];

  assertEquals(declined.accepted, false);
  assertEquals(declined.pending_choice, null);
  assertEquals(player.vanguard.shield, 10, "decline must still resume the preserved nested packet queue");
  const receipts = (realm.effect_flags as any).runtime_v0_2_listener_receipts;
  assertEquals(receipts["optional-tide-filter:" + root.id].packet_id, root.id);
  assertEquals((realm.effect_flags as any).runtime_v0_2_listener_limits, undefined, "decline must not spend the once-per-turn use");

  const second = attackHeal(s, 1);
  const secondContinuation = continueRuntimeV02AfterHealPackets(s, [second.id])!;
  assertEquals(secondContinuation.status, "player_choice_required", "a later heal this turn may offer the optional effect again after decline");
  const secondPending = runtimeV02InstallHealListenerChoice(s, secondContinuation);
  assert(secondPending.id !== pending.id, "new heal event requires a fresh choice identity");
});

Deno.test("accept is unavailable when draw plus existing hand cannot satisfy the mandatory discard", () => {
  const { s, realm } = makeState();
  const player = (s.players as any)["1"];
  player.hand = [];
  player.deck = [];
  const { pending } = installFromRoot(s);

  assertEquals(pending.options.map((option) => option.id), ["decline"]);
  assertThrows(() => runtimeV02ResolveHealListenerChoice(s, 1, pending.id, ["accept"]), "unknown_option");
  assertEquals(player.hand, []);
  assertEquals(player.deck, []);
  assertEquals(realm.effect_flags, undefined);
});

Deno.test("wrong seat, stale choice and missing hand card all fail before permanent resolution", () => {
  const { s, realm } = makeState();
  const { pending } = installFromRoot(s);
  assertThrows(() => runtimeV02ResolveHealListenerChoice(s, 2, pending.id, ["accept"]), "not_yours");
  assertEquals(realm.effect_flags, undefined);

  const accepted = runtimeV02ResolveHealListenerChoice(s, 1, pending.id, ["accept"]);
  const discardChoice = accepted.pending_choice!;
  const player = (s.players as any)["1"];
  player.hand = player.hand.filter((card: any) => card.uid !== "drawn-uid");
  assertThrows(() => runtimeV02ResolveHealListenerChoice(s, 1, discardChoice.id, ["card:drawn-uid"]), "selected_hand_card_missing");
  assertEquals(player.discard, []);
  assertEquals(realm.effect_flags, undefined, "failed discard revalidation must not mark receipt or limit");
});

Deno.test("only exact OPTIONAL DRAW 1 then CHOOSE_HAND_TO_DISCARD 1 shape is owned", () => {
  const { s } = makeState();
  const root = attackHeal(s, 0);
  const continuation = continueRuntimeV02AfterHealPackets(s, [root.id])!;
  const realmDef = (s.card_index as any)["test-optional-realm"].definition_v0_2;
  realmDef.tactic.listeners[0].steps[0].steps[0].count = 2;
  assertThrows(() => runtimeV02InstallHealListenerChoice(s, continuation), "program_unsupported");
  assertEquals((s as any).pending_heal_listener_choice, undefined);
});
