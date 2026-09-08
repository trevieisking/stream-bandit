import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageSelectedHealChoice } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import {
  runtimeV02CreateSelectedHealChoice,
  runtimeV02ResolveSelectedHealChoice,
  type RuntimeV02FriendlyFieldEntry,
} from "../_shared/tcg-match-attack-choice-v0-2.ts";
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

function deepCurrentProgram() {
  return [
    {
      op: "SELECT_CREATURE",
      controller: "self",
      zone: "field",
      count: 1,
      filters: { damaged: true },
      as: "heal_target",
    },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ];
}

function fixture(targetDamage = 45) {
  const sourceCardId = "test-selected-heal-source";
  const targetCardId = "test-selected-heal-target";
  const source = creature("source-top-uid", sourceCardId, 0);
  const target = creature("target-top-uid", targetCardId, targetDamage);
  const reserve = [null, target, null, null] as any[];
  const state = {
    turn_seq: 41,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    players: {
      "1": { vanguard: source, reserve },
      "2": { vanguard: null, reserve: [null, null, null, null] },
    },
    card_index: {
      [sourceCardId]: {
        card_id: sourceCardId,
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: sourceCardId,
          name: "Selected Heal Source",
          card_family: "Creature",
          element: "Tide",
          creature: {
            attacks: [{
              id: "deep-current",
              name: "Deep Current",
              cost: [{ element: "Tide", amount: 3 }],
              base_damage: 110,
              damage_formula: null,
              requirements: [],
              on_declare: [],
              before_damage: [],
              after_damage: deepCurrentProgram(),
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
      [targetCardId]: {
        card_id: targetCardId,
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: targetCardId,
          name: "Selected Heal Target",
          card_family: "Creature",
          element: "Grove",
          creature: { attacks: [] },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
  const entries: RuntimeV02FriendlyFieldEntry[] = [
    {
      where: "vanguard",
      index: null,
      creature: source,
      anchor_uid: "source-top-uid",
      label: "Selected Heal Source",
    },
    {
      where: "reserve",
      index: 1,
      creature: target,
      anchor_uid: "target-top-uid",
      label: "Selected Heal Target",
    },
  ];
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(
    state,
    source.stack[0],
    1,
  )!;
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  return { state, source, target, entries, choice };
}

Deno.test("Deep Current-style selected heal emits exactly one canonical packet after one heal", () => {
  const { state, target, entries, choice } = fixture(45);
  const result = runtimeV02ResolveSelectedHealChoice(
    choice,
    1,
    "choice-1",
    ["creature:1:target-top-uid"],
    entries,
    state,
  );

  assertEquals(result.actual_heal, 30);
  assertEquals(target.damage, 15);
  assertEquals(result.emitted_packet_ids, ["heal:41:1"]);
  assertEquals(state.runtime_v0_2_event_seq, 1);

  const packets = runtimeV02CurrentTurnHealPackets(state);
  assertEquals(packets.length, 1);
  assertEquals(packets[0].id, "heal:41:1");
  assertEquals(packets[0].requested_amount, 30);
  assertEquals(packets[0].actual_amount, 30);
  assertEquals(packets[0].source.action_kind, "attack");
  assertEquals(packets[0].source.action_id, "deep-current");
  assertEquals(packets[0].source.card_uid, "source-top-uid");
  assertEquals(packets[0].source.card_id, "test-selected-heal-source");
  assertEquals(packets[0].target.creature_uid, "target-top-uid");
  assertEquals(packets[0].target.card_id, "test-selected-heal-target");
  assertEquals(packets[0].target.element, "Grove");
  assertEquals(packets[0].target.where, "reserve");
  assertEquals(packets[0].target.index, 1);
});

Deno.test("selected heal packet records actual healing when damage is below requested amount", () => {
  const { state, target, entries, choice } = fixture(12);
  const result = runtimeV02ResolveSelectedHealChoice(
    choice,
    1,
    "choice-1",
    ["creature:1:target-top-uid"],
    entries,
    state,
  );
  assertEquals(result.actual_heal, 12);
  assertEquals(target.damage, 0);
  assertEquals(result.emitted_packet_ids, ["heal:41:1"]);
  const packets = runtimeV02CurrentTurnHealPackets(state);
  assertEquals(packets.map((packet) => packet.actual_amount), [12]);
});

Deno.test("detached selected target fails canonical binding before healing or packet mutation", () => {
  const { state, target, entries, choice } = fixture(45);
  const detached = creature("target-top-uid", "test-selected-heal-target", 45);
  const detachedEntries: RuntimeV02FriendlyFieldEntry[] = [
    entries[0],
    {
      where: "reserve",
      index: 1,
      creature: detached,
      anchor_uid: "target-top-uid",
      label: "Detached Target",
    },
  ];
  assertThrows(
    () => runtimeV02ResolveSelectedHealChoice(
      choice,
      1,
      "choice-1",
      ["creature:1:target-top-uid"],
      detachedEntries,
      state,
    ),
    "tcg_v0_2_attack_selected_heal_packet_target_binding_mismatch",
  );
  assertEquals(target.damage, 45);
  assertEquals(detached.damage, 45);
  assertEquals(state.effect_events, undefined);
  assertEquals(state.runtime_v0_2_event_seq, undefined);
});

Deno.test("selected heal fails source attack binding before healing", () => {
  const { state, target, entries, choice } = fixture(45);
  const wrongAttackChoice = { ...choice, attack_id: "not-source-owned" };
  assertThrows(
    () => runtimeV02ResolveSelectedHealChoice(
      wrongAttackChoice,
      1,
      "choice-1",
      ["creature:1:target-top-uid"],
      entries,
      state,
    ),
    "tcg_v0_2_attack_selected_heal_packet_source_attack_mismatch",
  );
  assertEquals(target.damage, 45);
  assertEquals(state.effect_events, undefined);
});

Deno.test("metadata-only selected-heal resolver stays packet-free", () => {
  const { target, entries, choice } = fixture(45);
  const result = runtimeV02ResolveSelectedHealChoice(
    choice,
    1,
    "choice-1",
    ["creature:1:target-top-uid"],
    entries,
  );
  assertEquals(result.actual_heal, 30);
  assertEquals(target.damage, 15);
  assertEquals(result.emitted_packet_ids, []);
});
