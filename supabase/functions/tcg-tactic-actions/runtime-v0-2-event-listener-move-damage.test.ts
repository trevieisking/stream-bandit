import type { RuntimeV02CardZoneInstance } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";
import type {
  RuntimeV02DamageProgramCreatureRef,
  RuntimeV02DamageProgramState,
} from "../_shared/tcg-match-damage-program-v0-2.ts";
import {
  runtimeV02ApplyEventListenerMoveDamage,
  type RuntimeV02EventListenerMoveDamageSource,
} from "../_shared/tcg-match-event-listener-move-damage-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

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

function creature(uid: string, cardId: string, damage = 0) {
  return {
    stack: [card(uid, cardId)],
    essence: [],
    relic: null,
    damage,
    shield: 0,
  };
}

function definition(
  id: string,
  name: string,
  hp: number,
  element = "Underworld",
  rewardValue = 1,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element,
    creature: {
      stage: "Baby",
      hp,
      withdrawal: 0,
      reward_value: rewardValue,
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function state(
  sourceDamage = 20,
  cryptmiteDamage = 0,
  opposingDamage = 0,
): RuntimeV02DamageProgramState<RuntimeV02CardZoneInstance> {
  const definitions = [
    definition("underworld-wounded-ally", "Wounded Ally", 120),
    definition("underworld-cryptmite", "Cryptmite", 60),
    definition("test-opposing-vanguard", "Opposing Vanguard", 100, "Stone"),
    definition("test-opposing-backup", "Opposing Backup", 100, "Stone"),
  ];
  return {
    turn_seq: 7,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: Object.fromEntries(definitions.map((entry) => [
      entry.id,
      { definition_v0_2: entry },
    ])),
    players: {
      "1": {
        vanguard: creature(
          "wounded-ally-uid",
          "underworld-wounded-ally",
          sourceDamage,
        ),
        reserve: [
          creature("cryptmite-uid", "underworld-cryptmite", cryptmiteDamage),
          null,
          null,
          null,
        ],
        discard: [],
        rewards: [card("p1-reward-1"), card("p1-reward-2")],
      },
      "2": {
        vanguard: creature(
          "opposing-vanguard-uid",
          "test-opposing-vanguard",
          opposingDamage,
        ),
        reserve: [
          creature("opposing-backup-uid", "test-opposing-backup", 0),
          null,
          null,
          null,
        ],
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

const source: RuntimeV02EventListenerMoveDamageSource = {
  event_id: "creature-entered-play:7:cryptmite-uid",
  listener_id: "grave-nibble",
  step_index: 2,
  kind: "ability",
  controller_seat: 1,
  source_card_uid: "cryptmite-uid",
  source_card_id: "underworld-cryptmite",
  source_creature_uid: "cryptmite-uid",
};

const friendlySource = ref(
  1,
  "vanguard",
  null,
  "wounded-ally-uid",
  "underworld-wounded-ally",
  "Underworld",
);
const cryptmite = ref(
  1,
  "reserve",
  0,
  "cryptmite-uid",
  "underworld-cryptmite",
  "Underworld",
);
const opposingVanguard = ref(
  2,
  "vanguard",
  null,
  "opposing-vanguard-uid",
  "test-opposing-vanguard",
  "Stone",
);

Deno.test("Event Listener MOVE_DAMAGE bridge delegates an exact friendly 10-damage transfer to Damage and Defeat owners", () => {
  const s = state(20, 0, 0);
  const result = runtimeV02ApplyEventListenerMoveDamage(s, {
    source,
    step: {
      op: "MOVE_DAMAGE",
      from: "$selected_friendly_creature",
      to: "$source_creature",
      amount: 10,
      as: "moved_damage",
    },
    from: friendlySource,
    to: cryptmite,
  });

  assertEquals(result.damage.receipt.actual_damage_moved, 10);
  assertEquals((s.players["1"].vanguard as any).damage, 10);
  assertEquals((s.players["1"].reserve[0] as any).damage, 10);
  assertEquals(result.damage.defeat.defeated_count, 0);
  assertEquals(result.result_variable, "moved_damage");
  assertEquals((s.effect_events as any[]).map((event) => event.event), [
    "damage_moved",
  ]);
});

Deno.test("Event Listener MOVE_DAMAGE exact transfer fails closed when the source carries fewer than 10 damage", () => {
  const s = state(9, 0, 0);
  assertThrows(
    () => runtimeV02ApplyEventListenerMoveDamage(s, {
      source,
      step: {
        op: "MOVE_DAMAGE",
        from: "$selected_friendly_creature",
        to: "$source_creature",
        amount: 10,
      },
      from: friendlySource,
      to: cryptmite,
    }),
    "tcg_v0_2_damage_move_full_amount_unavailable",
  );

  assertEquals((s.players["1"].vanguard as any).damage, 9);
  assertEquals((s.players["1"].reserve[0] as any).damage, 0);
  assertEquals(s.pending_resolutions, []);
  assertEquals(s.effect_events, []);
});

Deno.test("Event Listener MOVE_DAMAGE bridge preserves generic partial-transfer semantics for future up-to effects", () => {
  const s = state(9, 0, 0);
  const result = runtimeV02ApplyEventListenerMoveDamage(s, {
    source,
    step: {
      op: "MOVE_DAMAGE",
      from: "$selected_friendly_creature",
      to: "$source_creature",
      amount: 20,
      allow_partial: true,
      minimum_moved: 1,
    },
    from: friendlySource,
    to: cryptmite,
  });

  assertEquals(result.damage.receipt.actual_damage_moved, 9);
  assertEquals((s.players["1"].vanguard as any).damage, 0);
  assertEquals((s.players["1"].reserve[0] as any).damage, 9);
});

Deno.test("Event Listener MOVE_DAMAGE bridge requires explicit hostile opt-in", () => {
  const s = state(20, 0, 0);
  assertThrows(
    () => runtimeV02ApplyEventListenerMoveDamage(s, {
      source,
      step: {
        op: "MOVE_DAMAGE",
        from: "$selected_friendly_creature",
        to: "$current_opponent_vanguard",
        amount: 10,
      },
      from: friendlySource,
      to: opposingVanguard,
    }),
    "tcg_v0_2_damage_move_opposing_destination_forbidden",
  );

  assertEquals((s.players["1"].vanguard as any).damage, 20);
  assertEquals((s.players["2"].vanguard as any).damage, 0);
  assertEquals(s.effect_events, []);
});

Deno.test("Event Listener MOVE_DAMAGE bridge routes a hostile transfer KO through registry-backed Defeat lifecycle", () => {
  const s = state(20, 0, 95);
  const result = runtimeV02ApplyEventListenerMoveDamage(s, {
    source,
    step: {
      op: "MOVE_DAMAGE",
      from: "$selected_friendly_creature",
      to: "$current_opponent_vanguard",
      amount: 10,
      allow_opposing_destination: true,
    },
    from: friendlySource,
    to: opposingVanguard,
  });

  assertEquals(result.damage.receipt.actual_damage_moved, 10);
  assertEquals(result.damage.defeat.defeated_count, 1);
  assertEquals(result.damage.defeat.defeat_events.length, 1);
  assertEquals(s.players["2"].vanguard, null);
  assertEquals(s.players["2"].discard.map((entry) => entry.uid), [
    "opposing-vanguard-uid",
  ]);
  assertEquals(s.pending_resolutions, [
    { kind: "take_reward", seat: 1, count: 1, source: "Opposing Vanguard" },
    { kind: "promote", seat: 2 },
  ]);
  assertEquals((s.effect_events as any[]).map((event) => event.event), [
    "creature_defeated",
    "damage_moved",
  ]);
});

Deno.test("Event Listener MOVE_DAMAGE bridge rejects unsupported step fields before mutation", () => {
  const s = state(20, 0, 0);
  assertThrows(
    () => runtimeV02ApplyEventListenerMoveDamage(s, {
      source,
      step: {
        op: "MOVE_DAMAGE",
        from: "$selected_friendly_creature",
        to: "$source_creature",
        amount: 10,
        card_name: "Cryptmite",
      },
      from: friendlySource,
      to: cryptmite,
    }),
    "tcg_v0_2_event_listener_move_damage_step_field_unsupported:card_name",
  );

  assertEquals((s.players["1"].vanguard as any).damage, 20);
  assertEquals((s.players["1"].reserve[0] as any).damage, 0);
  assertEquals(s.effect_events, []);
});
