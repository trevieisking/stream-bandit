import {
  runtimeV02ApplyDrainVitalityProgram,
  type RuntimeV02DamageProgramCreatureRef,
  type RuntimeV02DamageProgramState,
} from "../_shared/tcg-match-damage-program-v0-2.ts";
import {
  applyRuntimeV02HealPacket,
  type RuntimeV02HealPacketContext,
} from "../_shared/tcg-match-heal-packet-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function card(uid: string, cardId = uid): RuntimeV02CardZoneInstance {
  return { uid, card_id: cardId };
}

function creatureDefinition(id: string, element: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Creature",
    element,
    creature: {
      stage: "Standalone",
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function relicDefinition(limit: Record<string, unknown> | null = {
  scope: "turn",
  count: 1,
  owner: "attachment",
}) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "test-heal-amplifier",
    name: "Test Heal Amplifier",
    card_family: "Tactic",
    element: "Fairy",
    creature: null,
    essence: null,
    tactic: {
      subtype: "Relic",
      listeners: [{
        id: "test-before-heal",
        event: "before_heal_packet",
        requirements: {
          all: [
            { predicate: "heal_packet_target_is_attached_creature" },
            {
              not: {
                predicate: "heal_packet_source_action_kind_is",
                action_kind: "rule",
              },
            },
          ],
        },
        limit,
        steps: [{ op: "MODIFY_CURRENT_HEAL", delta: 10, minimum: 0 }],
      }],
    },
  };
}

function field(
  instance: RuntimeV02CardZoneInstance,
  damage = 0,
  shield = 0,
  relic: RuntimeV02CardZoneInstance | null = null,
) {
  return {
    stack: [instance],
    essence: [],
    relic,
    damage,
    shield,
    conditions: {},
    flags: {},
  };
}

function definitionIndex(definitions: Record<string, unknown>[]) {
  return Object.fromEntries(definitions.map((definition: any) => [
    definition.id,
    { definition_v0_2: definition },
  ]));
}

function state(
  limit: Record<string, unknown> | null = {
    scope: "turn",
    count: 1,
    owner: "attachment",
  },
): RuntimeV02DamageProgramState<RuntimeV02CardZoneInstance> {
  const source = card("source-uid", "underworld-source");
  const target = card("target-uid", "target-creature");
  const relic = card("relic-uid", "test-heal-amplifier");
  const definitions = [
    creatureDefinition("underworld-source", "Underworld"),
    creatureDefinition("target-creature", "Stone"),
    relicDefinition(limit),
  ];
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: definitionIndex(definitions),
    players: {
      "1": {
        vanguard: field(source, 50, 0, relic),
        reserve: [null, null, null, null],
        discard: [],
        rewards: [card("p1-reward")],
      },
      "2": {
        vanguard: field(target, 40, 0),
        reserve: [null, null, null, null],
        discard: [],
        rewards: [card("p2-reward")],
      },
    },
    pending_resolutions: [],
    effect_events: [],
  } as RuntimeV02DamageProgramState<RuntimeV02CardZoneInstance>;
}

function healContext(): RuntimeV02HealPacketContext {
  return {
    source: {
      controller_seat: 1,
      action_kind: "tactic",
      action_id: "test-heal",
      card_effect: true,
      card_uid: "healer-uid",
      card_id: "healer-card",
      creature_uid: null,
    },
    target: {
      controller_seat: 1,
      creature_uid: "source-uid",
      card_uid: "source-uid",
      card_id: "underworld-source",
      element: "Underworld",
      where: "vanguard",
      index: null,
    },
  };
}

function ref(
  controllerSeat: 1 | 2,
  anchorUid: string,
  cardId: string,
  element: string,
): RuntimeV02DamageProgramCreatureRef {
  return {
    controller_seat: controllerSeat,
    where: "vanguard",
    index: null,
    anchor_uid: anchorUid,
    card_id: cardId,
    element,
  };
}

const describe = (_creature: unknown) => ({
  max_hp: 100,
  reward_value: 1,
  label: "Creature",
});

Deno.test("Heal #21 applies before-heal modifier before HP mutation and records modified requested amount", () => {
  const s = state();
  const target = s.players["1"].vanguard as any;
  const first = applyRuntimeV02HealPacket(s, target, 20, healContext());
  equal(first.requested_amount, 30);
  equal(first.actual_heal, 30);
  equal(target.damage, 20);
  equal(first.packet?.requested_amount, 30);

  const second = applyRuntimeV02HealPacket(s, target, 20, healContext());
  equal(second.requested_amount, 20);
  equal(second.actual_heal, 20);
  equal(target.damage, 0);
});

Deno.test("DRAIN_VITALITY preflights malformed before-heal program before effect damage mutation", () => {
  const s = state(null);
  const beforeTargetDamage = (s.players["2"].vanguard as any).damage;
  const beforeSourceDamage = (s.players["1"].vanguard as any).damage;

  throws(
    () => runtimeV02ApplyDrainVitalityProgram(s, {
      identity: {
        source_action_id: "test-drain",
        source_step_index: 0,
        source_card_uid: "source-uid",
        source_card_id: "underworld-source",
        source_creature_uid: "source-uid",
        action_kind: "ability",
        controller_seat: 1,
      },
      target: ref(2, "target-uid", "target-creature", "Stone"),
      heal_target: ref(1, "source-uid", "underworld-source", "Underworld"),
      amount: 20,
      heal_cap: 20,
      defeat_describe: describe,
    }),
    "tcg_v0_2_before_heal_limit_required",
  );

  equal((s.players["2"].vanguard as any).damage, beforeTargetDamage);
  equal((s.players["1"].vanguard as any).damage, beforeSourceDamage);
  equal(s.effect_events, []);
  equal(s.pending_resolutions, []);
});
