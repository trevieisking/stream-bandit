import {
  runtimeV02ExecuteActiveAbilityDrainProgram,
  structuredRuntimeActiveAbilityDrainDescriptor,
} from "../_shared/tcg-match-active-ability-program-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

type Inst = { uid: string; card_id: string };

const SOURCE_ID = "underworld-drain-source";
const SOURCE_UID = "underworld-drain-source:uid";
const TARGET_ID = "target-creature";
const TARGET_UID = "target-creature:uid";

function definition(cardId: string, hp: number, ability: Record<string, unknown> | null = null) {
  return {
    card_id: cardId,
    definition: { id: cardId },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      element: cardId === SOURCE_ID ? "Underworld" : "Stone",
      creature: {
        stage: "Baby",
        hp,
        reward_value: 1,
        ability,
        attacks: [],
      },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function drainAbility(costs: unknown[] = []) {
  return {
    id: "little-siphon-proof",
    name: "Little Siphon Proof",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: { all: [{ predicate: "source_damaged" }] },
    costs,
    steps: [{
      op: "DRAIN_VITALITY",
      target: "$current_opponent_vanguard",
      amount: 10,
      heal_target: "$source_creature",
      heal_cap: 10,
    }],
  };
}

function creature(uid: string, cardId: string, damage: number, shield = 0) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage,
    shield,
    condition: null,
    flags: {},
  };
}

function state(options: { sourceDamage?: number; targetDamage?: number; targetShield?: number; costs?: unknown[] } = {}) {
  const sourceDamage = options.sourceDamage ?? 20;
  const targetDamage = options.targetDamage ?? 0;
  const targetShield = options.targetShield ?? 0;
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 9,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(SOURCE_UID, SOURCE_ID, sourceDamage),
        reserve: [null, null, null, null],
      },
      "2": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(TARGET_UID, TARGET_ID, targetDamage, targetShield),
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(SOURCE_ID, 70, drainAbility(options.costs ?? [])),
      [TARGET_ID]: definition(TARGET_ID, 100),
    },
  };
}

function defeatDescribe(cr: { stack: Inst[] }, _seat: 1 | 2) {
  const id = cr.stack[cr.stack.length - 1].card_id;
  return {
    max_hp: id === SOURCE_ID ? 70 : 100,
    reward_value: 1,
    label: id,
  };
}

function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: { uid: SOURCE_UID, card_id: SOURCE_ID },
  };
}

Deno.test("generic active Ability drain delegates activation, Damage, Heal and Defeat without card identity dispatch", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityDrainDescriptor(s, source().instance);
  if (!descriptor) throw new Error("drain descriptor required");
  assertEquals(descriptor.ability_id, "little-siphon-proof");
  assertEquals(descriptor.requirement.predicate, "source_damaged");

  const result = runtimeV02ExecuteActiveAbilityDrainProgram(s, 1, source(), defeatDescribe);
  if (!result) throw new Error("drain result required");
  assertEquals(result.kind, "drain_vitality");
  assertEquals(result.actual_vitality_drained, 10);
  assertEquals(result.actual_heal, 10);
  assertEquals(result.activation_permit.cost_permit.additional_cost_count, 0);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 10);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 10);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "little-siphon-proof"), 1);
  assertEquals(result.emitted_packet_ids.length, 1);
  assertEquals(s.effect_events.map((event) => event.event).join(","), "effect_damage_dealt,after_heal_packet,vitality_drained");
});

Deno.test("Shield prevents vitality theft because drain heals only from actual HP damage", () => {
  const s = state({ targetShield: 10 });
  const result = runtimeV02ExecuteActiveAbilityDrainProgram(s, 1, source(), defeatDescribe);
  if (!result) throw new Error("drain result required");
  assertEquals(result.actual_vitality_drained, 0);
  assertEquals(result.actual_heal, 0);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 20);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 0);
  assertEquals((s.players["2"].vanguard as { shield: number }).shield, 0);
  assertEquals(result.emitted_packet_ids.length, 0);
});

Deno.test("source_damaged requirement fails before Ability use receipt or damage mutation", () => {
  const s = state({ sourceDamage: 0 });
  assertThrows(
    () => runtimeV02ExecuteActiveAbilityDrainProgram(s, 1, source(), defeatDescribe),
    "tcg_v0_2_active_ability_program_requirements_not_met:source_damaged",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "little-siphon-proof"), 0);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 0);
  assertEquals(s.effect_events.length, 0);
});

Deno.test("once-per-turn activation is owned by the shared Active Ability activation-cost boundary", () => {
  const s = state({ sourceDamage: 30 });
  const first = runtimeV02ExecuteActiveAbilityDrainProgram(s, 1, source(), defeatDescribe);
  if (!first) throw new Error("first drain result required");
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 20);
  assertThrows(
    () => runtimeV02ExecuteActiveAbilityDrainProgram(s, 1, source(), defeatDescribe),
    "tcg_v0_2_active_ability_activation_cost_turn_limit_reached",
  );
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 10);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "little-siphon-proof"), 1);
});

Deno.test("direct drain family fails closed on additional costs until a cost-choice live route is wired", () => {
  const s = state({ costs: [{ kind: "damage", target: "$source_creature", amount: 20 }] });
  assertThrows(
    () => structuredRuntimeActiveAbilityDrainDescriptor(s, source().instance),
    "tcg_v0_2_active_ability_program_costs_unsupported:little-siphon-proof",
  );
});
