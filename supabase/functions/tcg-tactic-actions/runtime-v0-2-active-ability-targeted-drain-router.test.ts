import {
  runtimeV02BeginActiveAbilityLiveRoute,
} from "../_shared/tcg-match-active-ability-live-route-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
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

const SOURCE_ID = "targeted-router-source";
const SOURCE_UID = `${SOURCE_ID}:uid`;
const TARGET_ID = "targeted-router-target";
const TARGET_UID = `${TARGET_ID}:uid`;
const ABILITY_ID = "targeted-router-drain";

function targetedDrainAbility(controller = "opponent") {
  return {
    id: ABILITY_ID,
    name: "Targeted Router Drain",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [{ kind: "damage", target: "$source_creature", amount: 20 }],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller,
        zone: "field",
        count: 1,
        filters: {},
        as: "drain_target",
      },
      {
        op: "DRAIN_VITALITY",
        target: "$drain_target",
        amount: 40,
        heal_target: "$source_creature",
        heal_cap: 40,
      },
    ],
  };
}

function definition(
  cardId: string,
  element: string,
  hp: number,
  ability: Record<string, unknown> | null = null,
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
        ability,
        attacks: [],
      },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function creature(uid: string, cardId: string, damage = 0) {
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

function state(controller = "opponent") {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 31,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(SOURCE_UID, SOURCE_ID, 30),
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
      [SOURCE_ID]: definition(SOURCE_ID, "Underworld", 290, targetedDrainAbility(controller)),
      [TARGET_ID]: definition(TARGET_ID, "Stone", 160),
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
  return { max_hp: cardId === SOURCE_ID ? 290 : 160, reward_value: 1, label: cardId };
}

Deno.test("single active Ability live router selects targeted-drain choice without falling into legacy private choice", () => {
  const s = state();
  const route = runtimeV02BeginActiveAbilityLiveRoute(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-router-choice-1",
  );
  if (!route || route.kind !== "targeted_drain_choice") {
    throw new Error("targeted-drain live route required");
  }

  assertEquals(route.targeted_drain.pending_choice.kind, "select_one_opposing_creature");
  assertEquals(route.targeted_drain.pending_choice.options.length, 1);
  assertEquals(route.targeted_drain.pending_choice.options[0].anchor_uid, TARGET_UID);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 50);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 1);
  assertEquals(s.effect_events.filter((event) => event.event === "card_cost_paid").length, 1);
  assertEquals((s as Record<string, unknown>).pending_ability_choice, undefined);
});

Deno.test("recognized malformed targeted-drain family fails closed instead of falling through to another Ability route", () => {
  const s = state("self");
  assertThrows(
    () => runtimeV02BeginActiveAbilityLiveRoute(
      s as never,
      1,
      source(),
      defeatDescribe,
      "targeted-router-choice-2",
    ),
    "tcg_v0_2_active_ability_targeted_drain_select_unsupported",
  );

  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 30);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 0);
  assertEquals(s.effect_events.length, 0);
});
