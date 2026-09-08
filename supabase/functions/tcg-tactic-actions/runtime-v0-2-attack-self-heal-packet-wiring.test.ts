import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { runtimeV02CurrentTurnHealPackets } from "../_shared/tcg-match-heal-packet-v0-2.ts";
import { structuredRuntimeAfterDamageSelfHealEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function sourceCreature(cardId: string, uid: string, damage = 0, shield = 0) {
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

function stateWith(
  afterDamage: unknown[],
  attackId: string,
  source: ReturnType<typeof sourceCreature>,
) {
  const cardId = source.stack[0].card_id;
  return {
    active_seat: 1,
    turn_seq: 21,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": {
        vanguard: source,
        reserve: [null, null, null, null],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: {
          id: cardId,
          name: "Packet Wiring Creature",
          kind: "Creature",
          element: "Tide",
          attack_1: "2 Tide — Packet Wiring — 60; heal",
        },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Packet Wiring Creature",
          card_family: "Creature",
          element: "Tide",
          creature: {
            attacks: [{
              id: attackId,
              name: "Packet Wiring Attack",
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
}

Deno.test("real Rushing Wake-style self-heal emits exactly one canonical packet without double healing", () => {
  const source = sourceCreature("test-rushing-wake-creature", "creature-rushing-1", 30, 0);
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }], "rushing-wake", source);

  const result = structuredRuntimeAfterDamageSelfHealEffects(state, source.stack[0], 1, source);
  assertEquals(result?.effects[0].actual_heal, 10);
  assertEquals(source.damage, 20, "packet recording must not heal a second time");
  assertEquals(result?.emitted_packet_ids.length, 1);

  const packets = runtimeV02CurrentTurnHealPackets(state);
  assertEquals(packets.length, 1);
  assertEquals(packets[0].id, result?.emitted_packet_ids[0]);
  assertEquals(packets[0].requested_amount, 10);
  assertEquals(packets[0].actual_amount, 10);
  assertEquals(packets[0].source.action_kind, "attack");
  assertEquals(packets[0].source.action_id, "rushing-wake");
  assertEquals(packets[0].source.card_uid, "creature-rushing-1");
  assertEquals(packets[0].target.creature_uid, "creature-rushing-1");
  assertEquals(packets[0].target.where, "vanguard");
  assertEquals(packets[0].target.index, null);
  assertEquals(packets[0].target.element, "Tide");
});

Deno.test("real Guarded Surge-style self-heal preserves exact attack identity in its packet", () => {
  const source = sourceCreature("test-guarded-surge-creature", "creature-guarded-1", 35, 10);
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_has_shield_at_least", value: 1 },
    then: [{ op: "HEAL", target: "$source_creature", amount: 20 }],
  }], "guarded-surge", source);

  const result = structuredRuntimeAfterDamageSelfHealEffects(state, source.stack[0], 1, source);
  assertEquals(result?.effects[0].actual_heal, 20);
  assertEquals(source.damage, 15);
  assertEquals(result?.emitted_packet_ids.length, 1);

  const packets = runtimeV02CurrentTurnHealPackets(state);
  assertEquals(packets.length, 1);
  assertEquals(packets[0].source.action_id, "guarded-surge");
  assertEquals(packets[0].requested_amount, 20);
  assertEquals(packets[0].actual_amount, 20);
});

Deno.test("false structured self-heal predicate owns the effect but emits no zero-heal packet", () => {
  const source = sourceCreature("test-no-heal-creature", "creature-no-heal-1", 0, 0);
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }], "rushing-wake", source);

  const result = structuredRuntimeAfterDamageSelfHealEffects(state, source.stack[0], 1, source);
  assertEquals(result?.effects[0].condition_met, false);
  assertEquals(result?.effects[0].actual_heal, 0);
  assertEquals(source.damage, 0);
  assertEquals(result?.emitted_packet_ids.length, 0);
  assertEquals(runtimeV02CurrentTurnHealPackets(state).length, 0);
});
