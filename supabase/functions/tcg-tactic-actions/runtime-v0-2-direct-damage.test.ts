import {
  runtimeV02ApplyDirectDamage,
  runtimeV02NormalizeDirectDamageStep,
} from "../_shared/tcg-match-direct-damage-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function creature(uid = "target", cardId = "target-card") {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 5,
    shield: 30,
    flags: {},
  } as any;
}
function entry(id: string, element = "Ember") {
  return {
    card_id: id,
    definition: { id },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Creature",
      element,
      creature: { stage: "Standalone", hp: 100, withdrawal: 1, attacks: [], ability: null },
      essence: null,
      tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function state(target: any) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 12,
    active_seat: 1,
    effect_events: [],
    players: {
      "1": { vanguard: target, reserve: [null, null, null, null] },
      "2": { vanguard: creature("opp", "opp-card"), reserve: [null, null, null, null] },
    },
    card_index: {
      "target-card": entry("target-card"),
      "opp-card": entry("opp-card", "Stone"),
      "source-card": entry("source-card"),
    },
  } as Record<string, any>;
}
function context(damageClass: "effect" | "recoil") {
  return {
    packet_id: `packet-${damageClass}`,
    damage_class: damageClass,
    source_controller_seat: 1 as const,
    source_kind: "ability" as const,
    source_action_id: "source-action",
    source_card_uid: "source-uid",
    source_card_id: "source-card",
    source_creature_uid: "source-uid",
    target_controller_seat: 1 as const,
    target_creature_uid: "target",
    target_zone: "vanguard" as const,
    target_index: null,
  };
}

Deno.test("DIRECT_DAMAGE effect delegates to packet owner and consumes Shield", () => {
  const target = creature();
  const s = state(target);
  const result = runtimeV02ApplyDirectDamage(
    s,
    target,
    { op: "DIRECT_DAMAGE", target: "$target", amount: 20, damage_class: "effect" },
    context("effect"),
    "$target",
    null,
  );
  equal(result.packet.final_amount, 20);
  equal((result.packet as any).receipt, {
    kind: "effect_damage",
    requested_amount: 20,
    shield_prevented: 20,
    actual_hp_damage: 0,
  });
  equal(target.damage, 5);
  equal(target.shield, 10);
  equal(result.after_damage_event.event, "after_damage_packet");
  equal(result.after_damage_event.subject_uid, "target");
  equal(result.after_damage_event.controller_seat, 1);
  equal(result.after_damage_event.final_packet_amount, 20);
});

Deno.test("DIRECT_DAMAGE recoil delegates through packet protection but preserves Shield", () => {
  const target = creature();
  const s = state(target);
  const result = runtimeV02ApplyDirectDamage(
    s,
    target,
    {
      op: "DIRECT_DAMAGE",
      target: "$source_creature",
      amount: 10,
      damage_class: "recoil",
      source_attack_id: "reckless-rush",
    },
    { ...context("recoil"), source_kind: "attack", source_action_id: "attack-action" },
    "$source_creature",
    "reckless-rush",
  );
  equal((result.packet as any).receipt, {
    kind: "damage_placement",
    requested_amount: 10,
    actual_damage_placed: 10,
  });
  equal(target.damage, 15);
  equal(target.shield, 30);
  equal(result.after_damage_event.damage_class, "recoil");
  equal(result.after_damage_event.shield_prevented, 0);
  equal(result.after_damage_event.actual_hp_damage, 10);
});

Deno.test("DIRECT_DAMAGE grammar fails closed outside frozen effect/recoil family", () => {
  throws(
    () => runtimeV02NormalizeDirectDamageStep({
      op: "DIRECT_DAMAGE",
      target: "$x",
      amount: 10,
      damage_class: "condition",
    }),
    "class_unsupported:condition",
  );
  throws(
    () => runtimeV02NormalizeDirectDamageStep({
      op: "DIRECT_DAMAGE",
      target: "$x",
      amount: 10,
      damage_class: "recoil",
    }),
    "recoil_attack_id_required",
  );
  throws(
    () => runtimeV02NormalizeDirectDamageStep({
      op: "DIRECT_DAMAGE",
      target: "$x",
      amount: 10,
      damage_class: "effect",
      source_attack_id: "nope",
    }),
    "effect_attack_id_unsupported",
  );
});

Deno.test("DIRECT_DAMAGE verifies producer target and recoil attack binding before mutation", () => {
  const target = creature();
  const s = state(target);
  throws(
    () => runtimeV02ApplyDirectDamage(
      s,
      target,
      { op: "DIRECT_DAMAGE", target: "$actual", amount: 10, damage_class: "effect" },
      context("effect"),
      "$expected",
      null,
    ),
    "target_binding_mismatch",
  );
  equal(target.damage, 5);
  equal(target.shield, 30);

  throws(
    () => runtimeV02ApplyDirectDamage(
      s,
      target,
      {
        op: "DIRECT_DAMAGE",
        target: "$source_creature",
        amount: 10,
        damage_class: "recoil",
        source_attack_id: "wrong",
      },
      { ...context("recoil"), packet_id: "packet-recoil-2", source_kind: "attack" },
      "$source_creature",
      "reckless-rush",
    ),
    "source_attack_mismatch",
  );
  equal(target.damage, 5);
  equal(target.shield, 30);
});
