import {
  runtimeV02ApplyEffectDamagePacket,
  runtimeV02ResolveBeforeDamagePacket,
  type RuntimeV02DamagePacketContext,
} from "../_shared/tcg-match-damage-packet-v0-2.ts";

type AnyRecord = Record<string, any>;

function equal(actual: unknown, expected: unknown, message = "values differ") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}: expected ${e}, got ${a}`);
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

function instance(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function creature(uid: string, cardId: string, options: AnyRecord = {}) {
  return {
    stack: [instance(uid, cardId)],
    essence: [],
    relic: options.relic ?? null,
    damage: options.damage ?? 0,
    shield: options.shield ?? 0,
    flags: {},
  };
}

const prismRibbonListener = {
  id: "prism-ribbon-effect-reduction",
  event: "before_damage_packet",
  requirements: {
    all: [
      { predicate: "damage_packet_target_is_attached_creature" },
      { predicate: "damage_packet_class_is", damage_class: "effect" },
      { predicate: "damage_packet_source_controller_is_opponent" },
    ],
  },
  limit: { scope: "turn", count: 1, owner: "attachment" },
  steps: [{ op: "MODIFY_CURRENT_DAMAGE_PACKET", delta: -20, minimum: 0 }],
};

function fixture(listener: AnyRecord = prismRibbonListener, turnSeq = 5) {
  const relic = instance("ribbon-uid", "fairy-prism-ribbon");
  const target = creature("target-uid", "fairy-target", {
    relic,
    damage: 10,
    shield: 10,
  });
  const source = creature("source-uid", "underworld-source");
  const definitions: Record<string, AnyRecord> = {
    "fairy-target": {
      id: "fairy-target",
      card_family: "Creature",
      element: "Fairy",
      creature: { ability: null },
    },
    "underworld-source": {
      id: "underworld-source",
      card_family: "Creature",
      element: "Underworld",
      creature: { ability: null },
    },
    "fairy-prism-ribbon": {
      id: "fairy-prism-ribbon",
      card_family: "Tactic",
      element: "Fairy",
      tactic: { subtype: "Relic", listeners: [listener] },
    },
  };
  const state = {
    turn_seq: turnSeq,
    players: {
      "1": { vanguard: target, reserve: [null, null, null, null] },
      "2": { vanguard: source, reserve: [null, null, null, null] },
    },
    effect_events: [],
  } as Record<string, unknown>;
  const lookup = (_state: Record<string, unknown>, value: any) =>
    definitions[typeof value === "string" ? value : String(value?.card_id || "")] || null;
  return { state, target, source, relic, lookup };
}

function effectContext(
  packetId: string,
  sourceSeat: 1 | 2 | null = 2,
): RuntimeV02DamagePacketContext {
  return {
    packet_id: packetId,
    damage_class: "effect",
    condition: null,
    source_controller_seat: sourceSeat,
    source_kind: "ability",
    source_action_id: "test-effect",
    source_card_uid: "source-uid",
    source_card_id: "underworld-source",
    source_creature_uid: "source-uid",
    target_controller_seat: 1,
    target_creature_uid: "target-uid",
    target_zone: "vanguard",
    target_index: null,
  };
}

Deno.test("Damage #20 before-damage packet reduces effect damage before Shield and records packet events", () => {
  const { state, target, relic, lookup } = fixture();
  const result = runtimeV02ApplyEffectDamagePacket(
    state,
    target,
    30,
    effectContext("packet-1"),
    lookup,
  );

  equal(result.final_amount, 10);
  equal(result.receipt.shield_prevented, 10);
  equal(result.receipt.actual_hp_damage, 0);
  equal(target.damage, 10);
  equal(target.shield, 0);
  equal(
    (state.effect_events as AnyRecord[]).map((event) => event.event),
    ["before_damage_packet", "after_damage_packet"],
  );
  if (!(relic as AnyRecord).effect_flags?.runtime_v0_2_damage_packet_limits) {
    throw new Error("attachment limit was not persisted on the authoritative Relic instance");
  }
});

Deno.test("Damage #20 attachment packet modifier consumes once per turn", () => {
  const { state, target, lookup } = fixture();
  runtimeV02ApplyEffectDamagePacket(state, target, 30, effectContext("packet-1"), lookup);
  const second = runtimeV02ApplyEffectDamagePacket(
    state,
    target,
    30,
    effectContext("packet-2"),
    lookup,
  );

  equal(second.final_amount, 30);
  equal(second.limited.length, 1);
  equal(target.damage, 40);
});

Deno.test("Damage #20 opponent-source predicate does not reduce friendly effect damage", () => {
  const { state, target, lookup } = fixture(prismRibbonListener, 6);
  const result = runtimeV02ApplyEffectDamagePacket(
    state,
    target,
    30,
    effectContext("friendly-packet", 1),
    lookup,
  );
  equal(result.final_amount, 30);
});

Deno.test("Damage #20 malformed before-damage program fails before HP Shield events or receipts mutate", () => {
  const bad = {
    ...prismRibbonListener,
    id: "bad-listener",
    steps: [{ op: "HEAL", target: "$attached_creature", amount: 10 }],
  };
  const { state, target, relic, lookup } = fixture(bad);

  assertThrows(
    () => runtimeV02ApplyEffectDamagePacket(
      state,
      target,
      30,
      effectContext("bad-packet"),
      lookup,
    ),
    "step_unsupported",
  );
  equal(target.damage, 10);
  equal(target.shield, 10);
  equal(state.effect_events, []);
  equal((relic as AnyRecord).effect_flags, undefined);
});

Deno.test("Damage #20 generic packet owner also satisfies existing Heatguard recoil contract", () => {
  const heatguard = {
    id: "heatguard-first-risk-reduction",
    event: "before_damage_packet",
    requirements: {
      all: [
        { predicate: "damage_packet_target_is_attached_creature" },
        { predicate: "damage_packet_class_is", damage_class: "recoil" },
      ],
    },
    limit: { scope: "turn", count: 1, owner: "attachment" },
    steps: [{ op: "MODIFY_CURRENT_DAMAGE_PACKET", delta: -10, minimum: 0 }],
  };
  const { state, lookup } = fixture(heatguard);
  const context: RuntimeV02DamagePacketContext = {
    ...effectContext("recoil-packet", 1),
    damage_class: "recoil",
    source_kind: "attack",
  };
  const result = runtimeV02ResolveBeforeDamagePacket(state, 15, context, lookup);
  equal(result.final_amount, 5);
});
