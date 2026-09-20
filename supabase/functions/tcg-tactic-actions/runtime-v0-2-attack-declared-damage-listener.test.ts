import {
  type RuntimeV02AttackDeclaredDamageInput,
  runtimeV02ResolveAttackDeclaredDamageListeners,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(
  actual: unknown,
  expected: unknown,
  message = "values differ",
) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) {
    throw new Error(`${message}: expected ${right}, got ${left}`);
  }
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) {
      throw new Error(`expected ${expected}, got ${message}`);
    }
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

type Inst = { uid: string; card_id: string };

const SOURCE_ID = "attack-declared-source";
const SOURCE_UID = `${SOURCE_ID}:uid`;
const RESERVE_ID = "attack-declared-reserve";
const RESERVE_UID = `${RESERVE_ID}:uid`;
const TARGET_ID = "attack-declared-target";
const TARGET_UID = `${TARGET_ID}:uid`;

const DAMAGE_HISTORY_REQUIREMENT = {
  predicate: "damage_history_count_at_least",
  target: "$source_creature",
  source_controller: "self",
  window: "current_turn",
  min_actual_damage: 10,
  card_effect_only: true,
  count: 1,
} as const;

function ability(steps: Record<string, unknown>[] = [{
  op: "MODIFY_CURRENT_ATTACK_DAMAGE",
  delta: 20,
}]): Record<string, unknown> {
  return {
    id: "blood-interest-shape",
    name: "Damage History Bonus",
    mode: "triggered",
    event: "attack_declared",
    timing: "attack",
    limit: { scope: "turn", count: 1, owner: "card_instance" },
    requirements: {
      all: [
        { predicate: "event_attack_source_is_self" },
        DAMAGE_HISTORY_REQUIREMENT,
      ],
    },
    costs: [],
    steps,
  };
}

function definition(
  cardId: string,
  cardAbility: Record<string, unknown> | null,
): Record<string, unknown> {
  return {
    card_id: cardId,
    definition: { id: cardId },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      element: "Underworld",
      creature: {
        stage: "Standalone",
        hp: 150,
        withdrawal: 1,
        reward_value: 1,
        ability: cardAbility,
        attacks: [],
      },
      essence: null,
      tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function creature(uid: string, cardId: string): Record<string, unknown> {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    condition: null,
    conditions: {
      scorched: false,
      venomed: 0,
      control: null,
      modifier: null,
    },
    flags: {},
  };
}

function damageEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: "after_damage_packet",
    event_id: "qualifying-self-damage",
    turn_seq: 7,
    source_controller_seat: 1,
    source_kind: "ability",
    source_action_id: "self-damage-source",
    source_card_uid: "effect-source:uid",
    source_card_id: "effect-source",
    source_creature_uid: SOURCE_UID,
    target_controller_seat: 1,
    target_creature_uid: SOURCE_UID,
    actual_hp_damage: 10,
    ...overrides,
  };
}

function state(options: {
  events?: Record<string, unknown>[];
  sourceSteps?: Record<string, unknown>[];
} = {}) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    active_seat: 1 as const,
    effect_events: options.events ?? [damageEvent()],
    card_index: {
      [SOURCE_ID]: definition(SOURCE_ID, ability(options.sourceSteps)),
      [RESERVE_ID]: definition(RESERVE_ID, ability()),
      [TARGET_ID]: definition(TARGET_ID, null),
    },
    realm: null,
    players: {
      "1": {
        vanguard: creature(SOURCE_UID, SOURCE_ID),
        reserve: [creature(RESERVE_UID, RESERVE_ID), null, null, null],
        hand: [] as Inst[],
        deck: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
      },
      "2": {
        vanguard: creature(TARGET_UID, TARGET_ID),
        reserve: [null, null, null, null],
        hand: [] as Inst[],
        deck: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
      },
    },
  };
}

function input(overrides: Partial<RuntimeV02AttackDeclaredDamageInput> = {}) {
  return {
    action_id: "attack-action-1",
    attack_id: "scar-bite",
    source_controller_seat: 1 as const,
    source_creature_uid: SOURCE_UID,
    target_controller_seat: 2 as const,
    target_creature_uid: TARGET_UID,
    target_zone: "vanguard" as const,
    base_damage: 50,
    ...overrides,
  };
}

Deno.test("qualifying current-turn self damage applies the generic current-attack delta once", () => {
  const match = state();
  const result = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!result) throw new Error("structured attack-declared result required");
  assertEquals(result.damage_delta, 20);
  assertEquals(result.damage, 70);
  assertEquals(result.applications, [{
    source_uid: SOURCE_UID,
    listener_id: "blood-interest-shape",
    delta: 20,
    limit_consumed: true,
    replayed: false,
  }]);
  assertEquals(
    match.effect_events.filter((event) => event.event === "attack_declared")
      .length,
    1,
  );
});

Deno.test("sub-threshold, prior-turn and opponent damage do not apply the listener", () => {
  const match = state({
    events: [
      damageEvent({ actual_hp_damage: 9 }),
      damageEvent({ event_id: "prior", turn_seq: 6, actual_hp_damage: 30 }),
      damageEvent({
        event_id: "opponent",
        source_controller_seat: 2,
        actual_hp_damage: 30,
      }),
    ],
  });
  const result = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!result) throw new Error("structured attack-declared result required");
  assertEquals(result.damage_delta, 0);
  assertEquals(result.damage, 50);
  assertEquals(result.applications, []);
});

Deno.test("source-is-self prevents another friendly Creature's listener from modifying the attack", () => {
  const match = state({
    events: [
      damageEvent(),
      damageEvent({
        event_id: "reserve-damage",
        source_creature_uid: RESERVE_UID,
        target_creature_uid: RESERVE_UID,
      }),
    ],
  });
  const result = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!result) throw new Error("structured attack-declared result required");
  assertEquals(result.damage_delta, 20);
  assertEquals(result.applications.length, 1);
  assertEquals(result.applications[0].source_uid, SOURCE_UID);
});

Deno.test("exact event replay is idempotent while a second attack event spends no extra use", () => {
  const match = state();
  const first = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  const replay = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  const second = runtimeV02ResolveAttackDeclaredDamageListeners(
    match,
    input({
      action_id: "attack-action-2",
      attack_id: "siphon-fang",
      base_damage: 70,
    }),
  );
  if (!first || !replay || !second) {
    throw new Error("structured attack-declared results required");
  }
  assertEquals(first.damage, 70);
  assertEquals(replay.damage, 70);
  assertEquals(replay.applications[0].replayed, true);
  assertEquals(replay.applications[0].limit_consumed, false);
  assertEquals(second.damage_delta, 0);
  assertEquals(second.damage, 70);
  const listenerState = (match as Record<string, unknown>)
    .runtime_v0_2_event_listener_state as Record<
      string,
      Record<string, Record<string, unknown>>
    >;
  assertEquals(
    Object.values(listenerState.limits)[0].count,
    1,
  );
});

Deno.test("the turn-scoped listener becomes available again only with new-turn damage evidence", () => {
  const match = state();
  runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  match.turn_seq = 8;
  match.effect_events.push(damageEvent({
    event_id: "next-turn-damage",
    turn_seq: 8,
  }));
  const next = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!next) throw new Error("structured attack-declared result required");
  assertEquals(next.damage_delta, 20);
  assertEquals(next.damage, 70);
});

Deno.test("triggered Ability IF source_damaged gates the current-attack modifier without spending the limit when false", () => {
  const match = state({
    sourceSteps: [{
      op: "IF",
      when: { predicate: "source_damaged" },
      then: [{ op: "MODIFY_CURRENT_ATTACK_DAMAGE", delta: 20 }],
    }],
  });
  const first = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!first) throw new Error("structured attack-declared result required");
  assertEquals(first.damage_delta, 0);
  assertEquals(first.applications, []);

  (match.players as any)["1"].vanguard.damage = 10;
  const second = runtimeV02ResolveAttackDeclaredDamageListeners(
    match,
    input({ action_id: "attack-action-2" }),
  );
  if (!second) throw new Error("structured attack-declared result required");
  assertEquals(second.damage_delta, 20);
  assertEquals(second.damage, 70);
  assertEquals(second.applications[0].limit_consumed, true);
});

Deno.test("triggered Ability IF can read authoritative attack-target damage", () => {
  const match = state({
    sourceSteps: [{
      op: "IF",
      when: { predicate: "event_attack_target_damaged" },
      then: [{ op: "MODIFY_CURRENT_ATTACK_DAMAGE", delta: 10 }],
    }],
  });
  (match.players as any)["2"].vanguard.damage = 30;
  const result = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!result) throw new Error("structured attack-declared result required");
  assertEquals(result.damage_delta, 10);
  assertEquals(result.damage, 60);
});

Deno.test("triggered Ability IF any-composition reads authoritative target Condition state", () => {
  const match = state({
    sourceSteps: [{
      op: "IF",
      when: {
        any: [
          { predicate: "event_attack_target_has_condition", condition: "Venomed" },
          { predicate: "event_attack_target_has_condition", condition: "Rooted" },
        ],
      },
      then: [{ op: "MODIFY_CURRENT_ATTACK_DAMAGE", delta: 10 }],
    }],
  });
  (match.players as any)["2"].vanguard.conditions.venomed = 10;
  const result = runtimeV02ResolveAttackDeclaredDamageListeners(match, input());
  if (!result) throw new Error("structured attack-declared result required");
  assertEquals(result.damage_delta, 10);
  assertEquals(result.damage, 60);
});

Deno.test("legacy snapshots remain outside the structured current-attack owner", () => {
  const match = state();
  delete (match as Record<string, unknown>).runtime_registry_v0_2;
  assertEquals(
    runtimeV02ResolveAttackDeclaredDamageListeners(match, input()),
    null,
  );
});
