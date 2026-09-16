import {
  runtimeV02BeginTargetedDrainActiveAbilityLiveRoute,
  runtimeV02PendingTargetedDrainActiveAbilityChoiceView,
  runtimeV02ResolveTargetedDrainActiveAbilityLiveRoute,
} from "../_shared/tcg-match-active-ability-targeted-drain-live-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

type Inst = { uid: string; card_id: string };

const SOURCE_ID = "underworld-targeted-drain-live-proof";
const SOURCE_UID = `${SOURCE_ID}:uid`;
const TARGET_ID = "targeted-drain-live-target";
const TARGET_UID = `${TARGET_ID}:uid`;
const ABILITY_ID = "targeted-drain-live-ability";

function targetedDrainAbility() {
  return {
    id: ABILITY_ID,
    name: "Targeted Drain Live Proof",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [{ kind: "damage", target: "$source_creature", amount: 20 }],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "opponent",
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

function state(options: { targetDamage?: number; unsupportedAbility?: boolean } = {}) {
  const ability = options.unsupportedAbility
    ? {
      id: ABILITY_ID,
      name: "Unsupported Proof",
      mode: "active",
      event: null,
      timing: "own_turn",
      limit: { scope: "turn", count: 1, owner: "controller" },
      requirements: [],
      costs: [],
      steps: [{ op: "DRAW", count: 1 }],
    }
    : targetedDrainAbility();
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 21,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [{ uid: "reward-1", card_id: "reward-card" }] as Inst[],
        vanguard: creature(SOURCE_UID, SOURCE_ID, 30),
        reserve: [null, null, null, null],
      },
      "2": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: null,
        reserve: [creature(TARGET_UID, TARGET_ID, options.targetDamage ?? 10), null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(SOURCE_ID, "Underworld", 290, ability),
      [TARGET_ID]: definition(TARGET_ID, "Stone", 160),
      "reward-card": definition("reward-card", "Stone", 70),
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
  const maxHp = id === SOURCE_ID ? 290 : id === TARGET_ID ? 160 : 70;
  return { max_hp: maxHp, reward_value: 1, label: id };
}

Deno.test("targeted-drain live begin pays once then exposes one private opposing-Creature choice", () => {
  const s = state();
  const begun = runtimeV02BeginTargetedDrainActiveAbilityLiveRoute(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-live-choice-1",
  );
  if (!begun) throw new Error("targeted-drain live begin required");
  assertEquals(begun.kind, "targeted_drain_choice");
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 50);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 1);
  assertEquals(begun.pending_choice.options.length, 1);

  const ownView = runtimeV02PendingTargetedDrainActiveAbilityChoiceView(
    begun.pending_choice,
    1,
  ) as { options?: unknown[] } | null;
  const opponentView = runtimeV02PendingTargetedDrainActiveAbilityChoiceView(
    begun.pending_choice,
    2,
  ) as { waiting?: boolean; options?: unknown[] } | null;
  assertEquals(ownView?.options?.length, 1);
  assertEquals(opponentView?.waiting, true);
  assertEquals(opponentView?.options, undefined);
});

Deno.test("targeted-drain live resolution returns to play when the selected target survives", () => {
  const s = state();
  const begun = runtimeV02BeginTargetedDrainActiveAbilityLiveRoute(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-live-choice-2",
  );
  if (!begun) throw new Error("targeted-drain live begin required");
  const option = begun.pending_choice.options[0];
  const resolved = runtimeV02ResolveTargetedDrainActiveAbilityLiveRoute(
    s as never,
    begun.pending_choice,
    1,
    begun.pending_choice.id,
    [option.id],
    defeatDescribe,
  );

  assertEquals(resolved.kind, "targeted_drain_resolved");
  assertEquals(resolved.resolution.actual_vitality_drained, 40);
  assertEquals(resolved.resolution.actual_heal, 40);
  assertEquals(resolved.resolution_queue_required, false);
  assertEquals(resolved.resume_kind, "return_to_play");
  assertEquals(resolved.heal_listener.status, "complete");
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 10);
  assertEquals((s.players["2"].reserve[0] as { damage: number }).damage, 50);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 1);
});

Deno.test("targeted-drain live resolution preserves Defeat queue authority before heal-listener resume", () => {
  const s = state({ targetDamage: 130 });
  const begun = runtimeV02BeginTargetedDrainActiveAbilityLiveRoute(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-live-choice-3",
  );
  if (!begun) throw new Error("targeted-drain live begin required");
  const option = begun.pending_choice.options[0];
  const resolved = runtimeV02ResolveTargetedDrainActiveAbilityLiveRoute(
    s as never,
    begun.pending_choice,
    1,
    begun.pending_choice.id,
    [option.id],
    defeatDescribe,
  );

  assertEquals(resolved.resolution.damage_result.defeat.defeated_count, 1);
  assertEquals(resolved.resolution_queue_required, true);
  assertEquals(resolved.resume_kind, "resume_resolution_queue");
  assertEquals(resolved.heal_listener.status, "complete");
  assertEquals(s.players["2"].reserve[0], null);
  assertEquals(s.players["2"].discard.some((card) => card.uid === TARGET_UID), true);
  assertEquals(s.pending_resolutions.length > 0, true);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 1);
});

Deno.test("targeted-drain live facade leaves unrelated active Ability families untouched", () => {
  const s = state({ unsupportedAbility: true });
  const begun = runtimeV02BeginTargetedDrainActiveAbilityLiveRoute(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-live-choice-4",
  );
  assertEquals(begun, null);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 30);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 0);
  assertEquals(s.effect_events.length, 0);
  assertEquals(s.pending_resolutions.length, 0);
});
