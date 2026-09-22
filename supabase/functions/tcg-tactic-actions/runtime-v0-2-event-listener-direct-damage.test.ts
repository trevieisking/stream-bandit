import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateResolvedAttackDamageEvent,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function creature(uid: string, cardId: string, damage = 0, shield = 0, relic: any = null) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic,
    damage,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}
function creatureDef(id: string, element: string) {
  return {
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Creature",
      element,
      creature: { stage: "Standalone", hp: 100, withdrawal: 1, ability: null, attacks: [] },
      essence: null,
      tactic: null,
    },
  };
}
function thornDef() {
  return {
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: "test-thorn",
      name: "Test Thorn",
      card_family: "Tactic",
      element: "Grove",
      creature: null,
      essence: null,
      tactic: {
        subtype: "Relic",
        program: { steps: [] },
        continuous: [],
        listeners: [{
          id: "thorn-reflect",
          event: "after_damage_packet",
          requirements: { all: [
            { predicate: "damage_packet_class_is", damage_class: "attack" },
            { predicate: "damage_packet_target_is_attached_creature" },
            { predicate: "damage_packet_target_zone_is", zone: "vanguard" },
            { predicate: "damage_packet_source_controller_is_opponent" },
            { predicate: "damage_packet_amount_at_least", value: 1 },
          ] },
          limit: null,
          steps: [{
            op: "DIRECT_DAMAGE",
            target: "$damage_packet_source_creature",
            amount: 10,
            damage_class: "effect",
          }],
        }],
      },
    },
  };
}
function state() {
  const thorn = { uid: "thorn-uid", card_id: "test-thorn" };
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 3,
    active_seat: 1,
    effect_events: [],
    card_index: {
      attacker: creatureDef("attacker", "Ember"),
      defender: creatureDef("defender", "Grove"),
      "test-thorn": thornDef(),
    },
    realm: null,
    players: {
      "1": {
        vanguard: creature("attacker-uid", "attacker", 0, 5),
        reserve: [null, null, null, null],
        hand: [], deck: [], discard: [], rewards: [],
      },
      "2": {
        vanguard: creature("defender-uid", "defender", 20, 0, thorn),
        reserve: [null, null, null, null],
        hand: [], deck: [], discard: [], rewards: [],
      },
    },
  } as Record<string, any>;
}

Deno.test("attack after-damage packet predicates trigger Thorn-style reflect through DIRECT_DAMAGE owner", () => {
  const s = state();
  const event = runtimeV02CreateResolvedAttackDamageEvent(s, {
    action_id: "attack-action",
    packet_id: "attack-action",
    attack_id: "test-attack",
    source_controller_seat: 1,
    source_creature_uid: "attacker-uid",
    source_card_uid: "attacker-uid",
    source_card_id: "attacker",
    target_controller_seat: 2,
    target_creature_uid: "defender-uid",
    target_zone: "vanguard",
    target_index: null,
    requested_amount: 30,
    final_packet_amount: 30,
    shield_prevented: 0,
    actual_hp_damage: 30,
  });
  const flow = runtimeV02BeginEventListenerContinuation(s, [event]);
  equal(flow.status, "complete");
  equal(flow.processed_listener_keys.length, 1);
  equal((s.players as any)["1"].vanguard.shield, 0);
  equal((s.players as any)["1"].vanguard.damage, 5);
  const events = s.effect_events as any[];
  equal(events.filter((entry) => entry.event === "after_damage_packet").map((entry) => entry.damage_class), ["attack", "effect"]);
});

Deno.test("Thorn-style packet requirements ignore non-attack packets and non-vanguard targets", () => {
  const s = state();
  const event = runtimeV02CreateResolvedAttackDamageEvent(s, {
    action_id: "attack-action",
    packet_id: "attack-action",
    attack_id: "test-attack",
    source_controller_seat: 1,
    source_creature_uid: "attacker-uid",
    source_card_uid: "attacker-uid",
    source_card_id: "attacker",
    target_controller_seat: 2,
    target_creature_uid: "defender-uid",
    target_zone: "vanguard",
    target_index: null,
    requested_amount: 0,
    final_packet_amount: 0,
    shield_prevented: 0,
    actual_hp_damage: 0,
  });
  const flow = runtimeV02BeginEventListenerContinuation(s, [event]);
  equal(flow.status, "complete");
  equal(flow.processed_listener_keys.length, 0);
  equal((s.players as any)["1"].vanguard.damage, 0);
  equal((s.players as any)["1"].vanguard.shield, 5);
});
