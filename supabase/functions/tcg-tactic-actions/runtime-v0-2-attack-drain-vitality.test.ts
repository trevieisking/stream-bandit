import {
  runtimeV02ResolveAfterDamageDrainVitality,
  structuredRuntimeAfterDamageDrainVitalityDescriptor,
} from "../_shared/tcg-match-attack-drain-vitality-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
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

const SOURCE_ID = "underworld-scarjackal-proof";
const SOURCE_UID = `${SOURCE_ID}:uid`;
const TARGET_ID = "attack-drain-target";
const TARGET_UID = `${TARGET_ID}:uid`;

function siphonAttack(afterDamage: Record<string, unknown>[] = [
  {
    op: "IF",
    when: { predicate: "target_remains_in_play_after_damage" },
    then: [{
      op: "DRAIN_VITALITY",
      target: "$attack_target",
      amount: 20,
      heal_target: "$source_creature",
      heal_cap: 20,
    }],
  },
]) {
  return {
    id: "siphon-fang",
    name: "Siphon Fang",
    cost: [{ element: "Underworld", amount: 2 }, { element: "Any", amount: 1 }],
    damage_element: "source_creature",
    base_damage: 70,
    damage_formula: null,
    requirements: [],
    on_declare: [],
    before_damage: [],
    after_damage: afterDamage,
  };
}

function definition(
  cardId: string,
  element: string,
  hp: number,
  attacks: Record<string, unknown>[] = [],
) {
  return {
    card_id: cardId,
    definition: { id: cardId },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      element,
      creature: {
        stage: "Standalone",
        hp,
        reward_value: 1,
        ability: {
          id: "proof-ability",
          name: "Proof Ability",
          mode: "continuous",
          event: null,
          timing: "passive",
          limit: null,
          requirements: [],
          costs: [],
          steps: [],
          continuous: [],
        },
        attacks,
      },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function creature(uid: string, cardId: string, damage = 0, shield = 0) {
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

function state(options: {
  sourceDamage?: number;
  targetDamage?: number;
  targetShield?: number;
  afterDamage?: Record<string, unknown>[];
} = {}) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 44,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [{ uid: "reward-1", card_id: "reward-proof" }] as Inst[],
        vanguard: creature(SOURCE_UID, SOURCE_ID, options.sourceDamage ?? 30),
        reserve: [null, null, null, null],
      },
      "2": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(
          TARGET_UID,
          TARGET_ID,
          options.targetDamage ?? 50,
          options.targetShield ?? 0,
        ),
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(
        SOURCE_ID,
        "Underworld",
        150,
        [
          {
            id: "scar-bite",
            name: "Scar Bite",
            cost: [{ element: "Underworld", amount: 2 }],
            damage_element: "source_creature",
            base_damage: 50,
            damage_formula: null,
            requirements: [],
            on_declare: [],
            before_damage: [],
            after_damage: [],
          },
          siphonAttack(options.afterDamage),
        ],
      ),
      [TARGET_ID]: definition(TARGET_ID, "Stone", 160),
      "reward-proof": definition("reward-proof", "Stone", 70),
    },
  };
}

function source() {
  return {
    controller_seat: 1 as const,
    where: "vanguard" as const,
    index: null,
    instance: { uid: SOURCE_UID, card_id: SOURCE_ID },
  };
}

function target() {
  return {
    controller_seat: 2 as const,
    where: "vanguard" as const,
    index: null,
    instance: { uid: TARGET_UID, card_id: TARGET_ID },
  };
}

function defeatDescribe(cr: { stack: Inst[] }) {
  const id = cr.stack[cr.stack.length - 1].card_id;
  return { max_hp: id === SOURCE_ID ? 150 : id === TARGET_ID ? 160 : 70, reward_value: 1, label: id };
}

Deno.test("attack vitality-drain descriptor recognizes the generic target-remains Siphon Fang shape", () => {
  const s = state();
  const descriptor = structuredRuntimeAfterDamageDrainVitalityDescriptor(
    s,
    source().instance,
    2,
  );
  if (!descriptor) throw new Error("attack drain descriptor required");
  assertEquals(descriptor.attack_id, "siphon-fang");
  assertEquals(descriptor.require_target_remains, true);
  assertEquals(descriptor.amount, 20);
  assertEquals(descriptor.heal_cap, 20);
});

Deno.test("attack vitality drain delegates effect damage and heals source by actual HP damage drained", () => {
  const s = state();
  const result = runtimeV02ResolveAfterDamageDrainVitality(
    s as never,
    1,
    source(),
    2,
    target(),
    defeatDescribe,
  );
  if (!result) throw new Error("attack drain result required");
  assertEquals(result.executed, true);
  assertEquals(result.condition_met, true);
  assertEquals(result.actual_vitality_drained, 20);
  assertEquals(result.actual_heal, 20);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 10);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 70);
  assertEquals(result.emitted_packet_ids.length, 1);
  assertEquals(
    s.effect_events.map((event) => event.event).join(","),
    "effect_damage_dealt,after_heal_packet,vitality_drained",
  );
});

Deno.test("attack vitality drain uses actual post-Shield HP damage as the heal amount", () => {
  const s = state({ targetShield: 10 });
  const result = runtimeV02ResolveAfterDamageDrainVitality(
    s as never,
    1,
    source(),
    2,
    target(),
    defeatDescribe,
  );
  if (!result) throw new Error("attack drain result required");
  assertEquals(result.actual_vitality_drained, 10);
  assertEquals(result.actual_heal, 10);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 20);
  assertEquals((s.players["2"].vanguard as { shield: number }).shield, 0);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 60);
});

Deno.test("target-remains guard prevents drain when the attack target is already at lethal damage", () => {
  const s = state({ targetDamage: 160 });
  const result = runtimeV02ResolveAfterDamageDrainVitality(
    s as never,
    1,
    source(),
    2,
    target(),
    defeatDescribe,
  );
  if (!result) throw new Error("attack drain result required");
  assertEquals(result.condition_met, false);
  assertEquals(result.executed, false);
  assertEquals(result.actual_vitality_drained, 0);
  assertEquals(result.actual_heal, 0);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 30);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 160);
  assertEquals(s.effect_events.length, 0);
  assertEquals(s.pending_resolutions.length, 0);
});

Deno.test("drain itself can defeat the surviving target through canonical Defeat ownership", () => {
  const s = state({ targetDamage: 150 });
  const result = runtimeV02ResolveAfterDamageDrainVitality(
    s as never,
    1,
    source(),
    2,
    target(),
    defeatDescribe,
  );
  if (!result) throw new Error("attack drain result required");
  assertEquals(result.executed, true);
  assertEquals(result.damage_result?.defeat.defeated_count, 1);
  assertEquals(s.players["2"].vanguard, null);
  assertEquals(s.players["2"].discard.some((card) => card.uid === TARGET_UID), true);
  assertEquals(s.pending_resolutions.length > 0, true);
});

Deno.test("attack drain family fails closed on a different target selector", () => {
  const s = state({
    afterDamage: [{
      op: "DRAIN_VITALITY",
      target: "$current_opponent_vanguard",
      amount: 20,
      heal_target: "$source_creature",
      heal_cap: 20,
    }],
  });
  assertThrows(
    () => structuredRuntimeAfterDamageDrainVitalityDescriptor(s, source().instance, 2),
    "target_unsupported",
  );
});

Deno.test("unrelated after-damage programs remain outside the vitality-drain owner", () => {
  const s = state({
    afterDamage: [{
      op: "APPLY_CONDITION",
      target: "$attack_target",
      condition: "Crushed",
      mode: "apply_if_empty",
    }],
  });
  assertEquals(
    structuredRuntimeAfterDamageDrainVitalityDescriptor(s, source().instance, 2),
    null,
  );
});
