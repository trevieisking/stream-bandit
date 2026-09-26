import {
  structuredRuntimeIncomingAttackDamageDetailed,
  type RuntimeAttackDamageContext,
} from "../_shared/tcg-match-attack-damage-v0-2.ts";
import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateDamagePreventedEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02DiscardAttachedRelic } from "../_shared/tcg-match-relic-engine-v0-2.ts";
import {
  runtimeV02ResolveAfterAttackFinishedScheduledActions,
  runtimeV02ScheduledActions,
} from "../_shared/tcg-match-scheduled-action-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function same(actual: unknown, expected: unknown, label = "identity mismatch") {
  if (!Object.is(actual, expected)) throw new Error(label);
}

type Inst = { uid: string; card_id: string; effect_flags?: Record<string, unknown> };

function creatureDefinition(id: string, element: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    traits: [],
    prestige: { starbound: { enabled: false } },
    creature: { stage: "Teen", hp: 180, withdrawal: 1, ability: null, attacks: [] },
    essence: null,
    tactic: null,
  };
}

function relicDefinition(
  id: string,
  element: string,
  continuous: Record<string, unknown>[],
  listeners: Record<string, unknown>[],
  counters: Record<string, unknown>[] = [],
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Tactic",
    element,
    traits: [],
    prestige: { starbound: { enabled: false } },
    creature: null,
    essence: null,
    tactic: {
      subtype: "Relic",
      play_requirements: [],
      program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: false, steps: [] },
      counters,
      continuous,
      listeners,
    },
  };
}

function field(top: Inst, relic: Inst | null = null) {
  return {
    stack: [top],
    essence: [],
    relic,
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

const commonRequirements = {
  all: [
    { predicate: "prevention_target_is_attached_creature" },
    { predicate: "prevention_source_is_attached_card" },
    { predicate: "prevention_amount_at_least", value: 1 },
  ],
};

function bastionDefinition() {
  return relicDefinition(
    "test-bastion",
    "Stone",
    [{
      id: "bastion-reduction",
      kind: "incoming_attack_damage",
      target: "$attached_creature",
      when: null,
      amount: -20,
      filters: { source_controller: "opponent" },
    }],
    [{
      id: "bastion-use",
      event: "damage_prevented",
      requirements: commonRequirements,
      limit: null,
      steps: [
        { op: "INCREMENT_SOURCE_COUNTER", counter_id: "prevention_uses", amount: 1 },
        {
          op: "IF",
          when: { predicate: "source_counter_at_least", counter_id: "prevention_uses", value: 3 },
          then: [{ op: "SCHEDULE_SOURCE_DISCARD", timing: "after_attack_finished", source: "$listener_source" }],
        },
      ],
    }],
    [{ id: "prevention_uses", initial: 0, max: 3, owner: "card_instance" }],
  );
}

function shellguardDefinition() {
  return relicDefinition(
    "test-shellguard",
    "Tide",
    [{
      id: "shellguard-reduction",
      kind: "incoming_attack_damage",
      target: "$attached_creature",
      when: null,
      amount: -20,
      filters: { source_controller: "opponent" },
      limit: { scope: "attachment", count: 1, owner: "attachment" },
      consume_when: "prevention_amount_at_least_1",
    }],
    [{
      id: "shellguard-break",
      event: "damage_prevented",
      requirements: commonRequirements,
      limit: { scope: "attachment", count: 1, owner: "attachment" },
      steps: [{ op: "SCHEDULE_SOURCE_DISCARD", timing: "after_attack_finished", source: "$listener_source" }],
    }],
  );
}

function gloomDefinition() {
  return relicDefinition(
    "test-gloom",
    "Shade",
    [{
      id: "gloom-reduction",
      kind: "incoming_attack_damage",
      target: "$attached_creature",
      when: null,
      amount: -10,
      filters: {
        source_controller: "opponent",
        attacker_has_any_condition: true,
        target_element: "Shade",
      },
    }],
    [],
  );
}

function fixture(relic: Inst, definition: Record<string, unknown>, targetElement = "Stone") {
  const target = { uid: "target-uid", card_id: "test-target" };
  const attacker = { uid: "attacker-uid", card_id: "test-attacker" };
  const targetField = field(target, relic);
  const attackerField = field(attacker);
  const state: any = {
    turn_seq: 7,
    active_seat: 2,
    personal_turns: { "1": 3, "2": 4 },
    phase: "play",
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    effect_events: [],
    turn_flags: {},
    realm: null,
    card_index: {
      "test-target": { definition_v0_2: creatureDefinition("test-target", targetElement) },
      "test-attacker": { definition_v0_2: creatureDefinition("test-attacker", "Ember") },
      [relic.card_id]: { definition_v0_2: definition },
    },
    players: {
      "1": {
        vanguard: targetField,
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: attackerField,
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
  return { state, targetField, attackerField, relic };
}

function context(packetId: string, targetElement = "Stone", attackerHasCondition = false): RuntimeAttackDamageContext {
  return {
    target_zone: "vanguard",
    target_controller: "opponent",
    source_controller: "opponent",
    target_has_any_condition: false,
    attacker_has_any_condition: attackerHasCondition,
    target_element: targetElement,
    source_controller_seat: 2,
    target_controller_seat: 1,
    target_creature_uid: "target-uid",
    packet_id: packetId,
    attack_id: "test-attack",
  };
}

function resolvePreventionEvent(state: any, detail: any, packetId: string) {
  const event = runtimeV02CreateDamagePreventedEvent({
    turn_seq: state.turn_seq,
    action_id: "attack-action",
    packet_id: detail.packet_id || packetId,
    prevention_kind: detail.prevention_kind,
    amount: detail.amount,
    source_uid: detail.source_uid,
    source_controller_seat: detail.source_controller_seat,
    target_creature_uid: detail.target_creature_uid,
    target_controller_seat: detail.target_controller_seat,
  });
  const flow = runtimeV02BeginEventListenerContinuation(state, [event]);
  equal(flow.status, "complete", "damage-prevented listener must complete without choice");
  equal(flow.emitted_heal_packet_ids, [], "frozen Relic prevention must not emit heal packets");
  equal(flow.emitted_movement_events, [], "frozen Relic prevention must not emit movement events");
  return flow;
}

Deno.test("Bastion-shaped Relic prevents 20 three times, counts on exact Relic instance, then schedules discard", () => {
  const relic: Inst = { uid: "bastion-uid", card_id: "test-bastion" };
  const { state, targetField } = fixture(relic, bastionDefinition());

  for (let hit = 1; hit <= 3; hit++) {
    const packetId = `attack:hit:${hit}`;
    const result = structuredRuntimeIncomingAttackDamageDetailed(
      state,
      (state.players as any)["2"].vanguard,
      targetField,
      100,
      context(packetId),
    );
    if (!result) throw new Error("structured attack damage result required");
    equal(result.amount, 80, `Bastion hit ${hit} damage mismatch`);
    equal(result.preventions.length, 1, `Bastion hit ${hit} prevention count mismatch`);
    equal(result.preventions[0].prevention_kind, "relic");
    equal(result.preventions[0].source_uid, relic.uid);
    equal(result.preventions[0].amount, 20);
    resolvePreventionEvent(state, result.preventions[0], packetId);
    equal(runtimeV02ScheduledActions(state).length, hit === 3 ? 1 : 0, `Bastion scheduling mismatch after hit ${hit}`);
  }

  equal((relic.effect_flags as any)?.runtime_v0_2_card_instance_counters?.prevention_uses, 3);
  const due = runtimeV02ResolveAfterAttackFinishedScheduledActions(state);
  equal(due.length, 1);
  equal(due[0].source_discards, [{
    controller_seat: 1,
    source_card_uid: relic.uid,
    source_zone: "attached_relic",
  }]);

  const discarded = runtimeV02DiscardAttachedRelic(
    (state.players as any)["1"],
    1,
    due[0].source_discards[0].source_card_uid,
  );
  same(discarded.discarded_card, relic, "Bastion discard must preserve exact instance identity");
  equal(targetField.relic, null);
  same((state.players as any)["1"].discard[0], relic);
});

Deno.test("Shellguard-shaped attachment limit prevents exactly once and schedules exactly one source discard", () => {
  const relic: Inst = { uid: "shellguard-uid", card_id: "test-shellguard" };
  const { state, targetField } = fixture(relic, shellguardDefinition(), "Tide");

  const first = structuredRuntimeIncomingAttackDamageDetailed(
    state,
    (state.players as any)["2"].vanguard,
    targetField,
    100,
    context("attack:shell:1", "Tide"),
  );
  if (!first) throw new Error("structured attack damage result required");
  equal(first.amount, 80);
  equal(first.preventions.length, 1);
  resolvePreventionEvent(state, first.preventions[0], "attack:shell:1");
  equal(runtimeV02ScheduledActions(state).length, 1);

  const second = structuredRuntimeIncomingAttackDamageDetailed(
    state,
    (state.players as any)["2"].vanguard,
    targetField,
    100,
    context("attack:shell:2", "Tide"),
  );
  if (!second) throw new Error("structured attack damage result required");
  equal(second.amount, 100, "Shellguard attachment effect must be consumed after first actual prevention");
  equal(second.preventions, [], "Shellguard must not emit a second prevention");
  equal(runtimeV02ScheduledActions(state).length, 1, "Shellguard must not duplicate the scheduled discard");
});

Deno.test("Gloom-shaped incoming Relic filter is generic and condition-sensitive", () => {
  const relic: Inst = { uid: "gloom-uid", card_id: "test-gloom" };
  const { state, targetField } = fixture(relic, gloomDefinition(), "Shade");

  const inactive = structuredRuntimeIncomingAttackDamageDetailed(
    state,
    (state.players as any)["2"].vanguard,
    targetField,
    100,
    context("attack:gloom:1", "Shade", false),
  );
  if (!inactive) throw new Error("structured attack damage result required");
  equal(inactive.amount, 100);
  equal(inactive.preventions, []);

  const active = structuredRuntimeIncomingAttackDamageDetailed(
    state,
    (state.players as any)["2"].vanguard,
    targetField,
    100,
    context("attack:gloom:2", "Shade", true),
  );
  if (!active) throw new Error("structured attack damage result required");
  equal(active.amount, 90);
  equal(active.preventions.length, 1);
  equal(active.preventions[0].source_uid, relic.uid);
  equal(active.preventions[0].amount, 10);
});
