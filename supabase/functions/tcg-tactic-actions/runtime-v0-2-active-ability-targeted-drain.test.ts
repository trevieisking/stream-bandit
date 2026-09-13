import {
  runtimeV02BeginActiveAbilityTargetedDrain,
  runtimeV02ResolveActiveAbilityTargetedDrain,
  structuredRuntimeActiveAbilityTargetedDrainDescriptor,
} from "../_shared/tcg-match-active-ability-targeted-drain-v0-2.ts";
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
    if (!message.includes(expected)) {
      throw new Error(`expected ${expected}, got ${message}`);
    }
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

type Inst = { uid: string; card_id: string };

const SOURCE_ID = "underworld-targeted-drain-proof";
const SOURCE_UID = "underworld-targeted-drain-proof:uid";
const OPP_VANGUARD_ID = "opposing-vanguard-proof";
const OPP_VANGUARD_UID = "opposing-vanguard-proof:uid";
const OPP_RESERVE_ID = "opposing-reserve-proof";
const OPP_RESERVE_UID = "opposing-reserve-proof:uid";
const ABILITY_ID = "pain-for-vitality-proof";

function targetedDrainAbility(options: { controller?: string; costAmount?: number } = {}) {
  return {
    id: ABILITY_ID,
    name: "Pain for Vitality Proof",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [],
    costs: [{
      kind: "damage",
      target: "$source_creature",
      amount: options.costAmount ?? 20,
    }],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: options.controller ?? "opponent",
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

function state(options: {
  sourceDamage?: number;
  targetShield?: number;
  includeTargets?: boolean;
  ability?: Record<string, unknown>;
} = {}) {
  const includeTargets = options.includeTargets !== false;
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
        rewards: [] as Inst[],
        vanguard: creature(SOURCE_UID, SOURCE_ID, options.sourceDamage ?? 30),
        reserve: [null, null, null, null],
      },
      "2": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: includeTargets
          ? creature(OPP_VANGUARD_UID, OPP_VANGUARD_ID, 0, options.targetShield ?? 0)
          : null,
        reserve: includeTargets
          ? [null, creature(OPP_RESERVE_UID, OPP_RESERVE_ID, 10), null, null]
          : [null, null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(
        SOURCE_ID,
        "Underworld",
        290,
        options.ability ?? targetedDrainAbility(),
      ),
      [OPP_VANGUARD_ID]: definition(OPP_VANGUARD_ID, "Stone", 200),
      [OPP_RESERVE_ID]: definition(OPP_RESERVE_ID, "Gale", 160),
    },
  };
}

function defeatDescribe(cr: { stack: Inst[] }) {
  const id = cr.stack[cr.stack.length - 1].card_id;
  const maxHp = id === SOURCE_ID ? 290 : id === OPP_VANGUARD_ID ? 200 : 160;
  return { max_hp: maxHp, reward_value: 1, label: id };
}

function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: { uid: SOURCE_UID, card_id: SOURCE_ID },
  };
}

Deno.test("targeted-drain descriptor recognizes required self-damage cost and selected opposing Creature generically", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityTargetedDrainDescriptor(s, source().instance);
  if (!descriptor) throw new Error("targeted drain descriptor required");
  assertEquals(descriptor.ability_id, ABILITY_ID);
  assertEquals(descriptor.cost.amount, 20);
  assertEquals(descriptor.select.controller, "opponent");
  assertEquals(descriptor.select.zone, "field");
  assertEquals(descriptor.select.count, 1);
  assertEquals(descriptor.select.as, "drain_target");
  assertEquals(descriptor.drain.target, "$drain_target");
  assertEquals(descriptor.drain.amount, 40);
  assertEquals(descriptor.drain.heal_cap, 40);
});

Deno.test("targeted-drain begin pays source damage before recording use and then exposes opposing field choice", () => {
  const s = state();
  const begun = runtimeV02BeginActiveAbilityTargetedDrain(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-choice-1",
  );
  if (!begun) throw new Error("targeted drain begin required");
  assertEquals(begun.status, "target_choice_required");
  assertEquals(begun.activation_permit.cost_permit.additional_cost_count, 1);
  assertEquals(begun.activation_permit.turn_limit_recorded, true);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 50);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 1);
  assertEquals(begun.pending_choice.options.length, 2);
  assertEquals(s.effect_events.filter((event) => event.event === "card_cost_paid").length, 1);
});

Deno.test("targeted-drain target resolution drains selected opposing Reserve and heals only actual vitality", () => {
  const s = state();
  const begun = runtimeV02BeginActiveAbilityTargetedDrain(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-choice-2",
  );
  if (!begun) throw new Error("targeted drain begin required");
  const reserve = begun.pending_choice.options.find((option) => option.anchor_uid === OPP_RESERVE_UID);
  if (!reserve) throw new Error("opposing Reserve option required");

  const resolved = runtimeV02ResolveActiveAbilityTargetedDrain(
    s as never,
    begun.pending_choice,
    1,
    begun.pending_choice.id,
    [reserve.id],
    defeatDescribe,
  );
  assertEquals(resolved.kind, "selected_opponent_drain_vitality");
  assertEquals(resolved.target_creature_uid, OPP_RESERVE_UID);
  assertEquals(resolved.target_controller_seat, 2);
  assertEquals(resolved.actual_vitality_drained, 40);
  assertEquals(resolved.actual_heal, 40);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 10);
  assertEquals((s.players["2"].reserve[1] as { damage: number }).damage, 50);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 1);
  assertEquals(resolved.emitted_packet_ids.length, 1);
  assertEquals(
    s.effect_events.map((event) => event.event).join(","),
    "card_cost_paid,effect_damage_dealt,after_heal_packet,vitality_drained",
  );
});

Deno.test("targeted-drain Shield prevention reduces both vitality drained and source healing", () => {
  const s = state({ targetShield: 25 });
  const begun = runtimeV02BeginActiveAbilityTargetedDrain(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-choice-3",
  );
  if (!begun) throw new Error("targeted drain begin required");
  const vanguard = begun.pending_choice.options.find((option) => option.anchor_uid === OPP_VANGUARD_UID);
  if (!vanguard) throw new Error("opposing Vanguard option required");

  const resolved = runtimeV02ResolveActiveAbilityTargetedDrain(
    s as never,
    begun.pending_choice,
    1,
    begun.pending_choice.id,
    [vanguard.id],
    defeatDescribe,
  );
  assertEquals(resolved.actual_vitality_drained, 15);
  assertEquals(resolved.actual_heal, 15);
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 35);
  assertEquals((s.players["2"].vanguard as { damage: number }).damage, 15);
  assertEquals((s.players["2"].vanguard as { shield: number }).shield, 0);
});

Deno.test("targeted-drain full preflight prevents real cost/use mutation when no opposing target exists", () => {
  const s = state({ includeTargets: false });
  assertThrows(
    () => runtimeV02BeginActiveAbilityTargetedDrain(
      s as never,
      1,
      source(),
      defeatDescribe,
      "targeted-choice-4",
    ),
    "target_unavailable",
  );
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 30);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 0);
  assertEquals(s.effect_events.length, 0);
});

Deno.test("targeted-drain full preflight prevents partial Payment when source damage cost removes required heal source", () => {
  const s = state({ sourceDamage: 275 });
  assertThrows(
    () => runtimeV02BeginActiveAbilityTargetedDrain(
      s as never,
      1,
      source(),
      defeatDescribe,
      "targeted-choice-5",
    ),
    "source",
  );
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 275);
  assertEquals(runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, ABILITY_ID), 0);
  assertEquals(s.effect_events.length, 0);
  assertEquals(s.pending_resolutions.length, 0);
});

Deno.test("targeted-drain once-per-turn receipt blocks a second activation before another cost is paid", () => {
  const s = state();
  const first = runtimeV02BeginActiveAbilityTargetedDrain(
    s as never,
    1,
    source(),
    defeatDescribe,
    "targeted-choice-6",
  );
  if (!first) throw new Error("first targeted drain begin required");
  assertThrows(
    () => runtimeV02BeginActiveAbilityTargetedDrain(
      s as never,
      1,
      source(),
      defeatDescribe,
      "targeted-choice-7",
    ),
    "turn_limit_reached",
  );
  assertEquals((s.players["1"].vanguard as { damage: number }).damage, 50);
  assertEquals(s.effect_events.filter((event) => event.event === "card_cost_paid").length, 1);
});

Deno.test("targeted-drain descriptor fails closed on non-opponent target selector", () => {
  const s = state({ ability: targetedDrainAbility({ controller: "self" }) });
  assertThrows(
    () => structuredRuntimeActiveAbilityTargetedDrainDescriptor(s, source().instance),
    "select_unsupported",
  );
});
