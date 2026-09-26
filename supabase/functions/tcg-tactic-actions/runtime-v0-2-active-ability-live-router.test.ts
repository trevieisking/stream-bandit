import {
  runtimeV02BeginActiveAbilityLiveRoute,
} from "../_shared/tcg-match-active-ability-live-route-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

type Inst = { uid: string; card_id: string };

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

const SOURCE_ID = "ability-route-source";
const SOURCE_UID = "ability-route-source:uid";
const TARGET_ID = "ability-route-target";
const TARGET_UID = "ability-route-target:uid";
const REWARD_ID = "ability-route-reward";
const REWARD_UID = "ability-route-reward:uid";

function drainAbility() {
  return {
    id: "route-drain",
    name: "Route Drain",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: { all: [{ predicate: "source_damaged" }] },
    costs: [],
    steps: [{
      op: "DRAIN_VITALITY",
      target: "$current_opponent_vanguard",
      amount: 10,
      heal_target: "$source_creature",
      heal_cap: 10,
    }],
  };
}

function conditionReplacementAbility() {
  return {
    id: "route-condition-replacement",
    name: "Route Condition Replacement",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [{
        predicate: "control_condition_present",
        target: "$current_opponent_vanguard",
        exclude_condition: "Mindbound",
      }],
    },
    costs: [],
    steps: [{
      op: "REPLACE_CONTROL_CONDITION",
      target: "$current_opponent_vanguard",
      condition: "Mindbound",
      allow_if_empty: false,
      replace_existing: true,
    }],
  };
}

function rewardInspectionAbility() {
  return {
    id: "route-inspect-reward",
    name: "Route Inspect Reward",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [{
      op: "INSPECT_ZONE",
      player: "self",
      zone: "rewards",
      selection: { min: 1, max: 1, filters: {} },
      visibility: "controller_private",
      return_policy: "same_position",
      as: "$inspected_reward",
    }],
  };
}

function unsupportedAbility() {
  return {
    id: "route-unsupported",
    name: "Route Unsupported",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [],
    steps: [{ op: "DRAW", amount: 1 }],
  };
}

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

function creature(uid: string, cardId: string, damage: number) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage,
    shield: 0,
    condition: null,
    flags: {},
  };
}

function state(
  ability: Record<string, unknown>,
  options: { sourceDamage?: number; rewards?: Inst[] } = {},
) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 12,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: options.rewards ?? [],
        vanguard: creature(SOURCE_UID, SOURCE_ID, options.sourceDamage ?? 20),
        reserve: [null, null, null, null],
      },
      "2": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(TARGET_UID, TARGET_ID, 0),
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(SOURCE_ID, 70, ability),
      [TARGET_ID]: definition(TARGET_ID, 100),
    },
  };
}

function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: { uid: SOURCE_UID, card_id: SOURCE_ID },
  };
}

function defeatDescribe(cr: { stack: Inst[] }) {
  const cardId = cr.stack[cr.stack.length - 1].card_id;
  return { max_hp: cardId === SOURCE_ID ? 70 : 100, reward_value: 1, label: cardId };
}

Deno.test("single active Ability live router chooses immediate program without manufacturing a private choice", () => {
  const s = state(drainAbility());
  const route = runtimeV02BeginActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
    "unused-private-choice-id",
  );
  if (!route || route.kind !== "immediate") throw new Error("immediate live route required");

  assertEquals(route.immediate.resolution.actual_vitality_drained, 10);
  assertEquals(route.immediate.resolution.actual_heal, 10);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 10);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 10);
  assertEquals((s as Record<string, unknown>).pending_ability_choice, undefined);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "route-drain"), 1);
});

Deno.test("single active Ability live router selects generic condition replacement without using Drain immediate semantics", () => {
  const s = state(conditionReplacementAbility());
  (s.players["2"].vanguard as Record<string, unknown>).conditions = {
    scorched: false,
    venomed: 0,
    control: "Dazed",
    modifier: null,
  };
  const route = runtimeV02BeginActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
    "unused-condition-choice-id",
  );
  if (!route || route.kind !== "condition_replacement") {
    throw new Error("condition replacement route required");
  }

  assertEquals(
    route.condition_replacement.kind,
    "replace_opponent_vanguard_control_condition",
  );
  assertEquals(route.condition_replacement.previous_condition, "Dazed");
  assertEquals(route.condition_replacement.resulting_condition, "Mindbound");
  assertEquals(route.condition_replacement.applied, true);
  assertEquals((s as Record<string, unknown>).pending_ability_choice, undefined);
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(
      s,
      1,
      "route-condition-replacement",
    ),
    1,
  );
});

Deno.test("single active Ability live router preserves existing Reward-inspection private-choice family", () => {
  const s = state(rewardInspectionAbility(), {
    rewards: [{ uid: REWARD_UID, card_id: REWARD_ID }],
  });
  const route = runtimeV02BeginActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
    "reward-choice-proof",
  );
  if (!route || route.kind !== "private_choice") throw new Error("private choice route required");

  assertEquals(route.choice.kind, "inspect_one_reward");
  assertEquals(route.choice.id, "reward-choice-proof");
  assertEquals(route.choice.ability_id, "route-inspect-reward");
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "route-inspect-reward"), 1);
  assertEquals(s.effect_events.length, 0);
});

Deno.test("unsupported active Ability family returns null with no mutation", () => {
  const s = state(unsupportedAbility());
  const before = structuredClone(s);
  const route = runtimeV02BeginActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
    "unsupported-choice-id",
  );

  assertEquals(route, null);
  assertEquals(JSON.stringify(s), JSON.stringify(before));
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "route-unsupported"), 0);
});

Deno.test("recognized immediate family fails closed on its own requirement instead of falling through to private choice", () => {
  const s = state(drainAbility(), { sourceDamage: 0 });
  assertThrows(
    () => runtimeV02BeginActiveAbilityLiveRoute(
      s,
      1,
      source(),
      defeatDescribe,
      "must-not-be-used",
    ),
    "tcg_v0_2_active_ability_program_requirements_not_met:source_damaged",
  );
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "route-drain"), 0);
  assertEquals(s.effect_events.length, 0);
});
