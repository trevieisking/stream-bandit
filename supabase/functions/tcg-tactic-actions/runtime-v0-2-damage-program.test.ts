import {
  runtimeV02ApplyDrainVitalityProgram,
  runtimeV02ApplyMoveDamageProgram,
  type RuntimeV02DamageProgramCreatureRef,
  type RuntimeV02DamageProgramState,
} from "../_shared/tcg-match-damage-program-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";

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

function card(uid: string, cardId = uid): RuntimeV02CardZoneInstance {
  return { uid, card_id: cardId };
}

function creature(uid: string, cardId: string, damage = 0, shield = 0) {
  return { stack: [card(uid, cardId)], essence: [], relic: null, damage, shield };
}

function state(): RuntimeV02DamageProgramState<RuntimeV02CardZoneInstance> {
  return {
    turn_seq: 7,
    active_seat: 1,
    players: {
      "1": {
        vanguard: creature("p1-v", "underworld-source", 50, 0),
        reserve: [creature("p1-r", "fairy-reserve", 20, 0), null, null, null],
        discard: [],
        rewards: [card("p1-reward-1"), card("p1-reward-2")],
      },
      "2": {
        vanguard: creature("p2-v", "target-creature", 80, 10),
        reserve: [creature("p2-r", "backup-creature", 0, 0), null, null, null],
        discard: [],
        rewards: [card("p2-reward-1"), card("p2-reward-2")],
      },
    },
    pending_resolutions: [],
    effect_events: [],
  };
}

function ref(
  controllerSeat: 1 | 2,
  where: "vanguard" | "reserve",
  index: number | null,
  anchorUid: string,
  cardId: string,
  element: string,
): RuntimeV02DamageProgramCreatureRef {
  return {
    controller_seat: controllerSeat,
    where,
    index,
    anchor_uid: anchorUid,
    card_id: cardId,
    element,
  };
}

const describe = (cr: any) => ({
  max_hp: 100,
  reward_value: String(cr.stack?.[cr.stack.length - 1]?.card_id || "").includes("mythic") ? 2 : 1,
  label: String(cr.stack?.[cr.stack.length - 1]?.card_id || "Creature"),
});

const tacticIdentity = {
  source_action_id: "tactic:damage-program-test",
  source_step_index: 3,
  source_card_uid: "tactic-uid",
  source_card_id: "underworld-test-tactic",
  source_creature_uid: null,
  action_kind: "tactic" as const,
  controller_seat: 1 as const,
};

Deno.test("Damage Program MOVE_DAMAGE uses owner #20 then owner #34 and emits canonical movement event", () => {
  const s = state();
  const result = runtimeV02ApplyMoveDamageProgram(s, {
    identity: tacticIdentity,
    from: ref(1, "vanguard", null, "p1-v", "underworld-source", "Underworld"),
    to: ref(1, "reserve", 0, "p1-r", "fairy-reserve", "Fairy"),
    amount: 30,
    allow_partial: true,
    defeat_describe: describe,
  });

  assertEquals(result.receipt.actual_damage_moved, 30);
  assertEquals((s.players["1"].vanguard as any).damage, 20);
  assertEquals((s.players["1"].reserve[0] as any).damage, 50);
  assertEquals(result.defeat.defeated_count, 0);
  assertEquals((s.effect_events as any[]).map((event) => event.event), ["damage_moved"]);
});

Deno.test("Damage Program MOVE_DAMAGE requires explicit hostile opt-in before mutation", () => {
  const s = state();
  assertThrows(
    () => runtimeV02ApplyMoveDamageProgram(s, {
      identity: tacticIdentity,
      from: ref(1, "vanguard", null, "p1-v", "underworld-source", "Underworld"),
      to: ref(2, "vanguard", null, "p2-v", "target-creature", "Stone"),
      amount: 20,
      allow_partial: true,
      defeat_describe: describe,
    }),
    "tcg_v0_2_damage_move_opposing_destination_forbidden",
  );
  assertEquals((s.players["1"].vanguard as any).damage, 50);
  assertEquals((s.players["2"].vanguard as any).damage, 80);
  assertEquals(s.pending_resolutions, []);
});

Deno.test("Damage Program DRAIN_VITALITY uses Shield, defeats target, queues Reward/promotion, then heals only actual HP damage", () => {
  const s = state();
  const result = runtimeV02ApplyDrainVitalityProgram(s, {
    identity: tacticIdentity,
    target: ref(2, "vanguard", null, "p2-v", "target-creature", "Stone"),
    heal_target: ref(1, "vanguard", null, "p1-v", "underworld-source", "Underworld"),
    amount: 30,
    heal_cap: 30,
    defeat_describe: describe,
  });

  assertEquals(result.damage.shield_prevented, 10);
  assertEquals(result.actual_vitality_drained, 20);
  assertEquals(result.actual_heal, 20);
  assertEquals((s.players["1"].vanguard as any).damage, 30);
  assertEquals(s.players["2"].vanguard, null);
  assertEquals(s.players["2"].discard.map((entry) => entry.uid), ["p2-v"]);
  assertEquals(s.pending_resolutions, [
    { kind: "take_reward", seat: 1, count: 1, source: "target-creature" },
    { kind: "promote", seat: 2 },
  ]);
  assertEquals((s.effect_events as any[]).map((event) => event.event), [
    "creature_defeated",
    "effect_damage_dealt",
    "after_heal_packet",
    "vitality_drained",
  ]);
});

Deno.test("Damage Program prospective-KO simulation blocks a discard collision before real HP mutation", () => {
  const s = state();
  s.players["2"].discard.push(card("p2-v", "collision-card"));
  assertThrows(
    () => runtimeV02ApplyDrainVitalityProgram(s, {
      identity: tacticIdentity,
      target: ref(2, "vanguard", null, "p2-v", "target-creature", "Stone"),
      heal_target: ref(1, "vanguard", null, "p1-v", "underworld-source", "Underworld"),
      amount: 30,
      heal_cap: 30,
      defeat_describe: describe,
    }),
    "tcg_v0_2_card_zone_destination_uid_collision",
  );
  assertEquals((s.players["2"].vanguard as any).damage, 80);
  assertEquals((s.players["2"].vanguard as any).shield, 10);
  assertEquals((s.players["1"].vanguard as any).damage, 50);
  assertEquals(s.pending_resolutions, []);
  assertEquals(s.effect_events, []);
});

Deno.test("Damage Program deterministic event id prevents duplicate step replay before mutation", () => {
  const s = state();
  const request = {
    identity: tacticIdentity,
    from: ref(1, "vanguard", null, "p1-v", "underworld-source", "Underworld"),
    to: ref(1, "reserve", 0, "p1-r", "fairy-reserve", "Fairy"),
    amount: 10,
    allow_partial: true,
    defeat_describe: describe,
  };
  runtimeV02ApplyMoveDamageProgram(s, request);
  const afterFirst = {
    source: (s.players["1"].vanguard as any).damage,
    destination: (s.players["1"].reserve[0] as any).damage,
  };
  assertThrows(
    () => runtimeV02ApplyMoveDamageProgram(s, request),
    "tcg_v0_2_damage_program_event_duplicate",
  );
  assertEquals({
    source: (s.players["1"].vanguard as any).damage,
    destination: (s.players["1"].reserve[0] as any).damage,
  }, afterFirst);
});

Deno.test("Damage Program attack/Ability identity requires exact source creature attribution", () => {
  const s = state();
  assertThrows(
    () => runtimeV02ApplyDrainVitalityProgram(s, {
      identity: { ...tacticIdentity, action_kind: "ability", source_creature_uid: null },
      target: ref(2, "vanguard", null, "p2-v", "target-creature", "Stone"),
      heal_target: ref(1, "vanguard", null, "p1-v", "underworld-source", "Underworld"),
      amount: 10,
      heal_cap: 10,
      defeat_describe: describe,
    }),
    "tcg_v0_2_damage_program_source_creature_uid_required",
  );
  assertEquals((s.players["2"].vanguard as any).damage, 80);
});
