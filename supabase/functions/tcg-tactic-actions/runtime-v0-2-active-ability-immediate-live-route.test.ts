import {
  runtimeV02BeginImmediateActiveAbilityLiveRoute,
} from "../_shared/tcg-match-active-ability-immediate-live-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

type Inst = { uid: string; card_id: string };

const SOURCE_ID = "underworld-immediate-source";
const SOURCE_UID = "underworld-immediate-source:uid";
const TARGET_ID = "immediate-target";
const TARGET_UID = "immediate-target:uid";
const REWARD_ID = "reward-proof";
const REWARD_UID = "reward-proof:uid";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function drainAbility() {
  return {
    id: "immediate-drain-proof",
    name: "Immediate Drain Proof",
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

function unsupportedAbility() {
  return {
    id: "unsupported-live-family",
    name: "Unsupported Live Family",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: { all: [] },
    costs: [],
    steps: [{ op: "DRAW", amount: 1 }],
  };
}

function definition(
  cardId: string,
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

function state(options: {
  sourceDamage?: number;
  targetDamage?: number;
  targetShield?: number;
  sourceAbility?: Record<string, unknown> | null;
  playerOneRewards?: Inst[];
} = {}) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 11,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: options.playerOneRewards ?? [],
        vanguard: creature(SOURCE_UID, SOURCE_ID, options.sourceDamage ?? 20),
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
          options.targetDamage ?? 0,
          options.targetShield ?? 0,
        ),
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(
        SOURCE_ID,
        70,
        options.sourceAbility === undefined ? drainAbility() : options.sourceAbility,
      ),
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
  const id = cr.stack[cr.stack.length - 1].card_id;
  return {
    max_hp: id === SOURCE_ID ? 70 : 100,
    reward_value: 1,
    label: id,
  };
}

Deno.test("immediate active Ability live route returns directly to play when drain causes no defeat", () => {
  const s = state();
  const routed = runtimeV02BeginImmediateActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
  );
  if (!routed) throw new Error("immediate active Ability route required");

  assertEquals(routed.kind, "immediate_active_ability");
  assertEquals(routed.resume_kind, "return_to_play");
  assertEquals(routed.resolution_queue_required, false);
  assertEquals(routed.heal_listener.status, "complete");
  assertEquals(routed.resolution.actual_vitality_drained, 10);
  assertEquals(routed.resolution.actual_heal, 10);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 10);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 10);
  assertEquals(s.pending_resolutions.length, 0);
  assertEquals((s as Record<string, unknown>).pending_ability_choice, undefined);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "immediate-drain-proof"), 1);
});

Deno.test("defeating drain preserves canonical Defeat queue and uses resolution-queue heal resume", () => {
  const s = state({
    targetDamage: 90,
    sourceDamage: 20,
    playerOneRewards: [{ uid: REWARD_UID, card_id: REWARD_ID }],
  });
  const routed = runtimeV02BeginImmediateActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
  );
  if (!routed) throw new Error("immediate active Ability route required");

  assertEquals(routed.resume_kind, "resume_resolution_queue");
  assertEquals(routed.resolution_queue_required, true);
  assertEquals(routed.resolution.damage_result.defeat.defeated_count, 1);
  assertEquals(routed.resolution.damage_result.defeat.queued_resolutions.length, 1);
  assertEquals(s.pending_resolutions.length, 1);
  assertEquals(s.pending_resolutions[0].kind, "take_reward");
  assertEquals(s.pending_resolutions[0].seat, 1);
  assertEquals(s.players["2"].vanguard, null);
  assertEquals(s.players["2"].discard.length, 1);
  assertEquals(s.players["2"].discard[0].uid, TARGET_UID);
  assertEquals(routed.heal_listener.status, "complete");
  assertEquals((s as Record<string, unknown>).pending_ability_choice, undefined);
});

Deno.test("defeat with no queued choice still selects resolution resume so match-end logic can run", () => {
  const s = state({ targetDamage: 90, sourceDamage: 20 });
  const routed = runtimeV02BeginImmediateActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
  );
  if (!routed) throw new Error("immediate active Ability route required");

  assertEquals(routed.resolution.damage_result.defeat.defeated_count, 1);
  assertEquals(routed.resolution.damage_result.defeat.queued_resolutions.length, 0);
  assertEquals(routed.resolution_queue_required, true);
  assertEquals(routed.resume_kind, "resume_resolution_queue");
});

Deno.test("unsupported active Ability family returns null without consuming a use or mutating battlefield", () => {
  const s = state({ sourceAbility: unsupportedAbility() });
  const before = structuredClone(s);
  const routed = runtimeV02BeginImmediateActiveAbilityLiveRoute(
    s,
    1,
    source(),
    defeatDescribe,
  );

  assertEquals(routed, null);
  assertEquals(JSON.stringify(s), JSON.stringify(before));
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "unsupported-live-family"), 0);
});
