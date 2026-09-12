import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageHealEachEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import { runtimeV02CurrentTurnHealPackets } from "../_shared/tcg-match-heal-packet-v0-2.ts";

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

function creature(uid: string, cardId: string, damage: number) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function canopyProgram() {
  return [{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 4 },
    then: [{
      op: "HEAL_EACH",
      controller: "self",
      zone: "reserve",
      filters: { card_family: "Creature" },
      amount: 20,
    }],
  }];
}

function fixture(damages = [30, 10, 0, 25]) {
  const sourceCardId = "test-heal-each-source";
  const source = creature("source-top-uid", sourceCardId, 0);
  const targetIds = ["target-tide", "target-grove", "target-ember", "target-gale"];
  const elements = ["Tide", "Grove", "Ember", "Gale"];
  const reserve = targetIds.map((cardId, index) => creature(`target-${index}-uid`, cardId, damages[index]));
  const cardIndex: Record<string, unknown> = {
    [sourceCardId]: {
      card_id: sourceCardId,
      definition: { id: sourceCardId, attack_1: "4 Grove — Canopy Crash — 140; heal Reserve" },
      definition_v0_2: {
        schema: "sb-tcg-card-v0.2",
        effect_schema: "sb-tcg-effects-v0.2",
        id: sourceCardId,
        name: "Heal Each Source",
        card_family: "Creature",
        element: "Grove",
        creature: {
          attacks: [{
            id: "canopy-crash",
            name: "Canopy Crash",
            cost: [{ element: "Grove", amount: 4 }],
            base_damage: 140,
            damage_formula: null,
            requirements: [],
            on_declare: [],
            before_damage: [],
            after_damage: canopyProgram(),
          }],
        },
      },
      definition_v0_2_rules_version: "sb-tcg-card-v0.2",
    },
  };
  for (let index = 0; index < targetIds.length; index += 1) {
    const cardId = targetIds[index];
    cardIndex[cardId] = {
      card_id: cardId,
      definition: { id: cardId },
      definition_v0_2: {
        schema: "sb-tcg-card-v0.2",
        effect_schema: "sb-tcg-effects-v0.2",
        id: cardId,
        name: `Target ${index}`,
        card_family: "Creature",
        element: elements[index],
        creature: { attacks: [] },
      },
      definition_v0_2_rules_version: "sb-tcg-card-v0.2",
    };
  }
  const state = {
    turn_seq: 31,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": { vanguard: source, reserve },
      "2": { vanguard: null, reserve: [null, null, null, null] },
    },
    card_index: cardIndex,
  } as Record<string, unknown>;
  return { state, source, reserve, sourceCardId };
}

Deno.test("Canopy Crash-style HEAL_EACH emits one canonical packet per Creature that actually heals", () => {
  const { state, source, reserve } = fixture();
  const result = structuredRuntimeAfterDamageHealEachEffects(state, source.stack[0], 1, reserve)!;

  assertEquals(reserve.map((target) => target.damage), [10, 0, 0, 5]);
  assertEquals(result.effects[0].target_count, 4);
  assertEquals(result.effects[0].actual_heal_total, 50);
  assertEquals(result.effects[0].targets.map((target) => target.actual_heal), [20, 10, 0, 20]);
  assertEquals(result.emitted_packet_ids, ["heal:31:1", "heal:31:2", "heal:31:3"]);

  const packets = runtimeV02CurrentTurnHealPackets(state);
  assertEquals(packets.map((packet) => packet.id), result.emitted_packet_ids);
  assertEquals(packets.map((packet) => packet.actual_amount), [20, 10, 20]);
  assertEquals(packets.map((packet) => packet.target.index), [0, 1, 3]);
  assertEquals(packets.map((packet) => packet.target.creature_uid), ["target-0-uid", "target-1-uid", "target-3-uid"]);
  assertEquals(packets.map((packet) => packet.target.element), ["Tide", "Grove", "Gale"]);
  assertEquals(packets.map((packet) => packet.source.action_kind), ["attack", "attack", "attack"]);
  assertEquals(packets.map((packet) => packet.source.action_id), ["canopy-crash", "canopy-crash", "canopy-crash"]);
  assertEquals(packets.map((packet) => packet.source.card_uid), ["source-top-uid", "source-top-uid", "source-top-uid"]);
  assertEquals(state.runtime_v0_2_event_seq, 3);
});

Deno.test("HEAL_EACH does not create zero-heal packets", () => {
  const { state, source, reserve } = fixture([0, 0, 0, 0]);
  const result = structuredRuntimeAfterDamageHealEachEffects(state, source.stack[0], 1, reserve)!;
  assertEquals(result.effects[0].condition_met, true);
  assertEquals(result.effects[0].target_count, 4);
  assertEquals(result.effects[0].actual_heal_total, 0);
  assertEquals(result.emitted_packet_ids, []);
  assertEquals(state.runtime_v0_2_event_seq, undefined);
  assertEquals(state.effect_events, undefined);
});

Deno.test("false Reserve threshold creates neither healing nor packet authority", () => {
  const { state, source, reserve } = fixture([30, 10, 25, 0]);
  (state.players as any)["1"].reserve[3] = null;
  reserve[3] = null as any;
  const before = reserve.slice(0, 3).map((target) => target.damage);
  const result = structuredRuntimeAfterDamageHealEachEffects(state, source.stack[0], 1, reserve)!;
  assertEquals(result.effects[0].condition_met, false);
  assertEquals(result.effects[0].targets, []);
  assertEquals(result.emitted_packet_ids, []);
  assertEquals(reserve.slice(0, 3).map((target) => target.damage), before);
  assertEquals(state.effect_events, undefined);
});

Deno.test("non-canonical Reserve binding fails before any HEAL_EACH mutation", () => {
  const { state, source, reserve } = fixture();
  const detached = reserve.slice();
  const before = detached.map((target) => target.damage);
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(state, source.stack[0], 1, detached),
    "tcg_v0_2_attack_heal_each_packet_source_location_ambiguous",
  );
  assertEquals(detached.map((target) => target.damage), before);
  assertEquals(reserve.map((target) => target.damage), [30, 10, 0, 25]);
  assertEquals(state.effect_events, undefined);
});

Deno.test("metadata-only HEAL_EACH fixtures preserve deterministic healing without inventing packet identity", () => {
  const { state, reserve, sourceCardId } = fixture();
  delete state.players;
  delete state.active_seat;
  const result = structuredRuntimeAfterDamageHealEachEffects(state, { card_id: sourceCardId }, 1, reserve)!;
  assertEquals(reserve.map((target) => target.damage), [10, 0, 0, 5]);
  assertEquals(result.emitted_packet_ids, []);
  assertEquals(state.effect_events, undefined);
});
