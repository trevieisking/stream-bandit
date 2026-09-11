import {
  runtimeV02ResolveAttackTarget,
  type RuntimeV02AttackBattlefieldTarget,
  type RuntimeV02AttackTargetPermission,
} from "../_shared/tcg-match-attack-v0-2.ts";
import {
  runtimeV02ResolveAttackControlCondition,
  type RuntimeV02AttackConditionDamageRequest,
} from "../_shared/tcg-match-condition-lifecycle-v0-2.ts";
import {
  runtimeConditions,
  type RuntimeV02ConditionCreature,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";
import { placeRuntimeDamage } from "./runtime-v0-2-core.ts";

function equal(actual: unknown, expected: unknown, message: string): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

type Creature = RuntimeV02ConditionCreature & { id: string };

function creature(id: string, control: string | null = null): Creature {
  return {
    id,
    damage: 0,
    shield: 0,
    condition: control,
    conditions: {
      scorched: false,
      venomed: 0,
      control,
      modifier: null,
    },
    flags: {},
  };
}

function battlefield(sourceControl: string | null = null): {
  source: Creature;
  fields: RuntimeV02AttackBattlefieldTarget<Creature>[];
} {
  const source = creature("p1-vanguard", sourceControl);
  return {
    source,
    // Deliberately unordered. Attack owns canonical field ordering before RNG.
    fields: [
      { seat: 2, where: "reserve", index: 1, creature: creature("p2-r2") },
      { seat: 1, where: "reserve", index: 0, creature: creature("p1-r1") },
      { seat: 2, where: "vanguard", index: null, creature: creature("p2-vanguard") },
      { seat: 1, where: "vanguard", index: null, creature: source },
      { seat: 2, where: "reserve", index: 0, creature: creature("p2-r1") },
    ],
  };
}

const reservePermission: RuntimeV02AttackTargetPermission = {
  controller: "opponent",
  zone: "reserve",
  card_family: "Creature",
  selection: "one",
};

Deno.test("Attack System owns the default opposing Vanguard target", () => {
  const { fields } = battlefield();
  const resolved = runtimeV02ResolveAttackTarget(
    1,
    [],
    fields,
    null,
    "declared",
  );
  equal(resolved.seat, 2, "default attack target must be the opponent");
  equal(resolved.where, "vanguard", "default attack target must be Vanguard");
  equal(resolved.index, null, "Vanguard has no reserve index");
  equal(resolved.creature.id, "p2-vanguard", "wrong opposing Vanguard selected");
  equal(resolved.randomized, false, "declared target must not consume target RNG");
});

Deno.test("Attack System enforces structured opposing Reserve target permission", () => {
  const { fields } = battlefield();
  const resolved = runtimeV02ResolveAttackTarget(
    1,
    [reservePermission],
    fields,
    1,
    "declared",
  );
  equal(resolved.seat, 2, "Reserve target must belong to opponent");
  equal(resolved.where, "reserve", "declared Reserve target must stay Reserve");
  equal(resolved.index, 1, "declared Reserve index must be preserved");
  equal(resolved.creature.id, "p2-r2", "wrong opposing Reserve selected");
});

Deno.test("Attack System fails closed when opposing Reserve permission is absent", () => {
  const { fields } = battlefield();
  let message = "";
  try {
    runtimeV02ResolveAttackTarget(1, [], fields, 0, "declared");
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  equal(
    message,
    "tcg_v0_2_attack_target_opponent_reserve_not_permitted",
    "Reserve declaration without structured permission must fail closed",
  );
});

Deno.test("Blinded condition requests random targeting but Attack System alone chooses the Creature", () => {
  const { source, fields } = battlefield("Blinded");
  const damageRequests: RuntimeV02AttackConditionDamageRequest[] = [];
  const condition = runtimeV02ResolveAttackControlCondition(
    source,
    () => {
      throw new Error("Blinded target selection must not consume Condition RNG");
    },
    (target, request) => {
      damageRequests.push(request);
      placeRuntimeDamage(target, request.amount);
    },
  );

  equal(condition.status, "continue", "Blinded must allow attack processing to continue");
  equal(
    condition.target_mode,
    "random_all_creatures",
    "Condition domain must request random-all-Creatures targeting",
  );
  equal(runtimeConditions(source).control, null, "Condition domain must consume Blinded");
  equal(damageRequests.length, 0, "Blinded must not request damage");

  let poolSize = 0;
  const resolved = runtimeV02ResolveAttackTarget(
    1,
    [],
    fields,
    null,
    condition.target_mode,
    (size) => {
      poolSize = size;
      return 1;
    },
  );

  equal(poolSize, 5, "Attack System must expose the complete battlefield to target RNG");
  // Canonical order is P1 Vanguard, P1 Reserves, P2 Vanguard, P2 Reserves.
  equal(resolved.creature.id, "p1-r1", "Attack-owned random index must resolve canonical field order");
  equal(resolved.seat, 1, "Blinded may redirect an attack to a friendly Creature");
  equal(resolved.randomized, true, "Blinded target must be marked randomized");
  equal(resolved.random_pool_index, 1, "target audit must retain selected pool index");
});

Deno.test("Attack System validates its own target RNG result", () => {
  const { fields } = battlefield();
  let message = "";
  try {
    runtimeV02ResolveAttackTarget(
      1,
      [],
      fields,
      null,
      "random_all_creatures",
      (size) => size,
    );
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  equal(
    message,
    "tcg_v0_2_attack_target_random_index_invalid",
    "out-of-range target RNG must fail closed",
  );
});

Deno.test("Attack System rejects duplicate battlefield slots before target selection", () => {
  const duplicate = creature("duplicate");
  const fields: RuntimeV02AttackBattlefieldTarget<Creature>[] = [
    { seat: 1, where: "vanguard", index: null, creature: creature("p1") },
    { seat: 2, where: "vanguard", index: null, creature: creature("p2") },
    { seat: 2, where: "reserve", index: 0, creature: duplicate },
    { seat: 2, where: "reserve", index: 0, creature: duplicate },
  ];
  let message = "";
  try {
    runtimeV02ResolveAttackTarget(1, [reservePermission], fields, 0, "declared");
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  equal(
    message,
    "tcg_v0_2_attack_target_battlefield_duplicate",
    "ambiguous battlefield ownership must fail closed",
  );
});

Deno.test("Condition-to-Attack handoff is data-only and preserves domain ownership", () => {
  const { source, fields } = battlefield("Mindbound");
  const damageRequests: RuntimeV02AttackConditionDamageRequest[] = [];
  const condition = runtimeV02ResolveAttackControlCondition(
    source,
    () => "heads",
    (target, request) => {
      damageRequests.push(request);
      placeRuntimeDamage(target, request.amount);
    },
  );
  assert(condition.status === "continue", "Mindbound heads must continue");
  equal(condition.target_mode, "declared", "Mindbound must not take over Attack targeting");
  equal(runtimeConditions(source).control, null, "Condition owner must clear Mindbound on heads");
  equal(damageRequests.length, 0, "Mindbound heads must not ask Damage to mutate state");

  const target = runtimeV02ResolveAttackTarget(
    1,
    [],
    fields,
    null,
    condition.target_mode,
  );
  equal(target.creature.id, "p2-vanguard", "Attack must still resolve its own declared target");
});
