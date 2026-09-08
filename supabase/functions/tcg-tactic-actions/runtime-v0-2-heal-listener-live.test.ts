import { applyRuntimeV02HealPacket } from "../_shared/tcg-match-heal-packet-v0-2.ts";
import {
  runtimeV02BeginAttackHealListenerContinuation,
  runtimeV02PendingHealListenerChoiceView,
  runtimeV02ResolveAttackHealListenerChoice,
  type RuntimeV02PendingHealListenerChoice,
} from "../_shared/tcg-match-heal-listener-live-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
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
const creature = (top: Inst, damage = 0) => ({
  stack: [top],
  essence: [],
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
  const targetA = inst("target-a-uid", "test-target-a");
  const targetB = inst("target-b-uid", "test-target-b");
  const realm = inst("realm-uid", "test-optional-realm");
  const definitions: Record<string, unknown> = {
    "test-source": card("test-source", {
      card_family: "Creature",
      element: "Tide",
      creature: { stage: "Teen", ability: null, attacks: [] },
      essence: null,
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
    turn_seq: 33,
    active_seat: 1,
    effect_events: [],
    card_index: Object.fromEntries(Object.entries(definitions).map(([cardId, definition]) => [cardId, {
      card_id: cardId,
      definition_v0_2: definition,
      definition_v0_2_rules_version: "sb-tcg-card-v0.2",
    }])),
    players: {
      "1": {
        vanguard: creature(source),
        reserve: [creature(targetA, 20), creature(targetB, 20), null, null],
        hand: [inst("hand-uid", "test-hand-card")],
        deck: [inst("drawn-uid", "test-drawn-card")],
        discard: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
      },
    },
    realm: { card: realm, owner_seat: 1, played_turn: 32 },
  } as Record<string, unknown>;
  return { s, source, realm };
}

function attackHeal(state: Record<string, unknown>, reserveIndex: number) {
  const player = (state.players as any)["1"];
  const source = player.vanguard;
  const target = player.reserve[reserveIndex];
  return applyRuntimeV02HealPacket(state, target, 10, {
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

function pending(state: Record<string, unknown>) {
  return state.pending_heal_listener_choice as RuntimeV02PendingHealListenerChoice;
}

Deno.test("live handoff installs one private choice and preserves post-attack resume authority", () => {
  const { s } = makeState();
  const first = attackHeal(s, 0);
  const second = attackHeal(s, 1);
  const flow = runtimeV02BeginAttackHealListenerContinuation(s, [second.id, first.id], 1);

  assertEquals(flow.status, "player_choice_required");
  assertEquals(pending(s).packet_id, first.id);
  assertEquals(pending(s).remaining_packet_ids, [second.id]);
  assertEquals(s.pending_heal_listener_resume, {
    kind: "scan_defeats_then_aftermath",
    seat: 1,
    turn_seq: 33,
  });

  const ownerView = runtimeV02PendingHealListenerChoiceView(pending(s), 1) as any;
  const opponentView = runtimeV02PendingHealListenerChoiceView(pending(s), 2) as any;
  assertEquals(ownerView.options.map((option: any) => option.id), ["decline", "accept"]);
  assertEquals(opponentView.waiting, true);
  assertEquals("options" in opponentView, false, "opponent must never receive private choice options");
});

Deno.test("declining one heal keeps resume state while a later canonical heal can offer again", () => {
  const { s, realm } = makeState();
  const first = attackHeal(s, 0);
  const second = attackHeal(s, 1);
  runtimeV02BeginAttackHealListenerContinuation(s, [first.id, second.id], 1);

  const firstChoice = pending(s);
  const firstResolution = runtimeV02ResolveAttackHealListenerChoice(
    s,
    1,
    firstChoice.id,
    ["decline"],
  );
  assertEquals(firstResolution.accepted, false);
  assertEquals(firstResolution.resume_ready, false);
  assertEquals(firstResolution.resume_seat, null);
  assertEquals(pending(s).packet_id, second.id);
  assert(s.pending_heal_listener_resume != null, "resume metadata must survive while another choice is pending");

  const secondChoice = pending(s);
  const secondResolution = runtimeV02ResolveAttackHealListenerChoice(
    s,
    1,
    secondChoice.id,
    ["decline"],
  );
  assertEquals(secondResolution.resume_ready, true);
  assertEquals(secondResolution.resume_seat, 1);
  assertEquals(s.pending_heal_listener_choice, undefined);
  assertEquals(s.pending_heal_listener_resume, undefined);
  assertEquals((realm.effect_flags as any)?.runtime_v0_2_listener_limits, undefined, "decline must not consume turn limit");
});

Deno.test("accept draw discard consumes the limit once then resumes past later heal packets", () => {
  const { s, realm } = makeState();
  const first = attackHeal(s, 0);
  const second = attackHeal(s, 1);
  runtimeV02BeginAttackHealListenerContinuation(s, [first.id, second.id], 1);

  const decision = pending(s);
  const accepted = runtimeV02ResolveAttackHealListenerChoice(s, 1, decision.id, ["accept"]);
  assertEquals(accepted.accepted, true);
  assertEquals(accepted.drawn, 1);
  assertEquals(accepted.resume_ready, false);
  assertEquals(pending(s).stage, "discard_from_hand");
  assert(decision.id !== pending(s).id, "discard stage must have a fresh reconnect-safe choice id");
  assertEquals(((s.players as any)["1"].hand as Inst[]).map((item) => item.uid), ["hand-uid", "drawn-uid"]);

  const discardChoice = pending(s);
  const drawnOption = discardChoice.options.find((option) => option.id === "card:drawn-uid");
  assert(drawnOption, "drawn card must be selectable from the current private hand");
  const finished = runtimeV02ResolveAttackHealListenerChoice(
    s,
    1,
    discardChoice.id,
    [drawnOption!.id],
  );
  assertEquals(finished.discarded_uid, "drawn-uid");
  assertEquals(finished.resume_ready, true);
  assertEquals(finished.resume_seat, 1);
  assertEquals(finished.pending_choice, null);
  assertEquals(s.pending_heal_listener_choice, undefined);
  assertEquals(s.pending_heal_listener_resume, undefined);
  assertEquals(((s.players as any)["1"].discard as Inst[]).map((item) => item.uid), ["drawn-uid"]);

  const limits = (realm.effect_flags as any)?.runtime_v0_2_listener_limits || {};
  const counters = Object.values(limits) as any[];
  assertEquals(counters.length, 1);
  assertEquals(counters[0].count, 1);
  assertEquals(counters[0].turn_seq, 33);
});

Deno.test("wrong seat stale choice and stale resume turn fail before private choice mutation", () => {
  const { s, realm } = makeState();
  const root = attackHeal(s, 0);
  runtimeV02BeginAttackHealListenerContinuation(s, [root.id], 1);
  const choice = pending(s);

  assertThrows(
    () => runtimeV02ResolveAttackHealListenerChoice(s, 2, choice.id, ["decline"]),
    "heal_choice_not_yours",
  );
  assertEquals(pending(s).id, choice.id);
  assertEquals(realm.effect_flags, undefined);

  assertThrows(
    () => runtimeV02ResolveAttackHealListenerChoice(s, 1, "stale-choice", ["decline"]),
    "heal_choice_stale_id",
  );
  assertEquals(pending(s).id, choice.id);
  assertEquals(realm.effect_flags, undefined);

  s.turn_seq = 34;
  assertThrows(
    () => runtimeV02ResolveAttackHealListenerChoice(s, 1, choice.id, ["decline"]),
    "heal_live_resume_turn_stale",
  );
  assertEquals(pending(s).id, choice.id);
  assertEquals(realm.effect_flags, undefined);
});

Deno.test("empty packet set completes without creating private resume state", () => {
  const { s } = makeState();
  const result = runtimeV02BeginAttackHealListenerContinuation(s, [], 1);
  assertEquals(result, { status: "complete", continuation: null, pending_choice: null });
  assertEquals(s.pending_heal_listener_choice, undefined);
  assertEquals(s.pending_heal_listener_resume, undefined);
});
