import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageSelfHealEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import { recordRuntimeV02AttackSelfHealPackets } from "../_shared/tcg-match-attack-heal-packet-v0-2.ts";

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

function creature(damage = 0, shield = 0, uid = "source-top-uid", cardId = "test-self-heal-creature") {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function fixture(
  damage: number,
  afterDamage: unknown[],
  attackId = "rushing-wake",
  shield = 0,
) {
  const cardId = "test-self-heal-creature";
  const source = creature(damage, shield, "source-top-uid", cardId);
  const state = {
    turn_seq: 23,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": { vanguard: source, reserve: [null, null, null, null] },
      "2": { vanguard: null, reserve: [null, null, null, null] },
    },
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: {
          id: cardId,
          name: "Self Heal Creature",
          kind: "Creature",
          stage: "Standalone",
          element: "Tide",
          attack_1: "2 Tide — Self Heal — 60; heal",
        },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Self Heal Creature",
          card_family: "Creature",
          element: "Tide",
          creature: {
            attacks: [{
              id: attackId,
              name: "Self Heal Attack",
              cost: [{ element: "Tide", amount: 2 }],
              base_damage: 60,
              damage_formula: null,
              requirements: [],
              on_declare: [],
              before_damage: [],
              after_damage: afterDamage,
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
  return { state, source, cardId };
}

function context(source: any, cardId: string) {
  return {
    controller_seat: 1 as const,
    source_instance: { uid: "source-top-uid", card_id: cardId },
    source_creature: source,
    source_where: "vanguard" as const,
    source_index: null,
  };
}

Deno.test("Rushing Wake-style self-heal records one canonical packet without healing twice", () => {
  const { state, source, cardId } = fixture(30, [{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source)!;
  assertEquals(source.damage, 20, "structured owner should perform the heal exactly once");

  const packets = recordRuntimeV02AttackSelfHealPackets(state, result, context(source, cardId));
  assertEquals(source.damage, 20, "packet adapter must not heal the Creature again");
  assertEquals(packets.length, 1);
  assertEquals(packets[0].id, "heal:23:1");
  assertEquals(packets[0].requested_amount, 10);
  assertEquals(packets[0].actual_amount, 10);
  assertEquals(packets[0].source.action_kind, "attack");
  assertEquals(packets[0].source.action_id, "rushing-wake");
  assertEquals(packets[0].source.card_uid, "source-top-uid");
  assertEquals(packets[0].target.creature_uid, "source-top-uid");
  assertEquals(packets[0].target.element, "Tide");
  assertEquals(packets[0].target.where, "vanguard");
  assertEquals(packets[0].target.index, null);
  assertEquals((state.effect_events as unknown[]).length, 1);
  assertEquals(state.runtime_v0_2_event_seq, 1);
});

Deno.test("partial structured healing records the actual damage removed", () => {
  const { state, source, cardId } = fixture(5, [{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source)!;
  const packets = recordRuntimeV02AttackSelfHealPackets(state, result, context(source, cardId));
  assertEquals(source.damage, 0);
  assertEquals(packets[0].requested_amount, 10);
  assertEquals(packets[0].actual_amount, 5);
});

Deno.test("false self-heal predicate emits no after_heal_packet authority", () => {
  const { state, source, cardId } = fixture(0, [{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source)!;
  const packets = recordRuntimeV02AttackSelfHealPackets(state, result, context(source, cardId));
  assertEquals(result.effects[0].actual_heal, 0);
  assertEquals(packets, []);
  assertEquals(state.runtime_v0_2_event_seq, undefined);
  assertEquals(state.effect_events, []);
});

Deno.test("Guarded Surge-style self-heal preserves attack and element identity", () => {
  const { state, source, cardId } = fixture(35, [{
    op: "IF",
    when: { predicate: "source_has_shield_at_least", value: 1 },
    then: [{ op: "HEAL", target: "$source_creature", amount: 20 }],
  }], "guarded-surge", 10);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source)!;
  const packets = recordRuntimeV02AttackSelfHealPackets(state, result, context(source, cardId));
  assertEquals(source.damage, 15);
  assertEquals(packets[0].source.action_id, "guarded-surge");
  assertEquals(packets[0].actual_amount, 20);
  assertEquals(packets[0].target.element, "Tide");
});

Deno.test("adapter fails closed when supplied source identity is not the canonical field top", () => {
  const { state, source, cardId } = fixture(30, [{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source)!;
  assertThrows(
    () => recordRuntimeV02AttackSelfHealPackets(state, result, {
      ...context(source, cardId),
      source_instance: { uid: "wrong-uid", card_id: cardId },
    }),
    "tcg_v0_2_attack_heal_packet_source_identity_mismatch",
  );
  assertEquals(state.runtime_v0_2_event_seq, undefined);
});

Deno.test("adapter rejects a Creature object that is not bound to the declared canonical slot", () => {
  const { state, source, cardId } = fixture(30, [{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source)!;
  assertThrows(
    () => recordRuntimeV02AttackSelfHealPackets(state, result, {
      ...context(source, cardId),
      source_creature: creature(20, 0, "source-top-uid", cardId),
    }),
    "tcg_v0_2_attack_heal_packet_source_creature_binding_mismatch",
  );
  assertEquals(state.runtime_v0_2_event_seq, undefined);
});

Deno.test("legacy or mixed self-heal ownership can return null without creating packet state", () => {
  const { state, source, cardId } = fixture(30, [
    {
      op: "IF",
      when: { predicate: "source_damaged" },
      then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
    },
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
  ]);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: cardId }, 1, source);
  assertEquals(result, null);
  assertEquals(recordRuntimeV02AttackSelfHealPackets(state, result, context(source, cardId)), []);
  assertEquals(state.effect_events, undefined);
});
