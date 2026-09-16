import {
  runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration,
  runtimeV02ExpireAttackDamageModifiersAtEndOfTurn,
  runtimeV02InstallAttackDamageModifier,
  type RuntimeV02AttackDamageModifierRequest,
  type RuntimeV02AttackModifierCreature,
} from "../_shared/tcg-match-attack-modifier-v0-2.ts";
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

function markedState(): Record<string, unknown> {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      "test-creature": {
        card_id: "test-creature",
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: "test-creature",
          name: "Test Creature",
          card_family: "Creature",
          creature: { attacks: [] },
        },
      },
    },
  };
}

function request(
  sourceUid: string,
  sourceActionId: string,
  amount: number,
  maxUses: number | null,
): RuntimeV02AttackDamageModifierRequest {
  return {
    source_uid: sourceUid,
    source_action_id: sourceActionId,
    target_uid: "target-creature-uid",
    amount,
    turn_seq: 7,
    duration: maxUses == null
      ? { expires_on: ["end_of_turn"], max_uses: null }
      : {
        expires_on: ["end_of_turn"],
        max_uses: maxUses,
        consume_on: "legal_attack_declared",
      },
  };
}

function modifiers(creature: RuntimeV02AttackModifierCreature): Record<string, unknown>[] {
  const records = creature.flags?.runtime_v0_2_attack_modifiers;
  if (!Array.isArray(records)) throw new Error("modifier ledger missing");
  return records as Record<string, unknown>[];
}

Deno.test("Attack Modifier Engine preserves finite versus full-turn semantics in deterministic creation order", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  const finite = runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("finite-source", "finite-listener", 10, 1),
  );
  const unlimited = runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("unlimited-source", "unlimited-listener", 20, null),
  );

  assertEquals(finite?.creation_seq, 1);
  assertEquals(unlimited?.creation_seq, 2);
  const first = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "attack-action-1",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 40,
    },
  );
  assertEquals(first?.bonus_damage, 30);
  assertEquals(first?.damage, 70);
  assertEquals(first?.applied_modifiers.map((record) => record.source_uid), [
    "finite-source",
    "unlimited-source",
  ]);
  assertEquals(first?.applied_modifiers.map((record) => record.consumed_use), [true, false]);
  assertEquals(modifiers(creature).map((record) => record.source_uid), ["unlimited-source"]);

  const second = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "attack-action-2",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 40,
    },
  );
  assertEquals(second?.bonus_damage, 20);
  assertEquals(second?.damage, 60);
  assertEquals(modifiers(creature).map((record) => record.source_uid), ["unlimited-source"]);
});

Deno.test("a finite modifier is spent by legal declaration even when later damage can be zero", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("next-attack-source", "next-attack-listener", 0, 1),
  );

  const result = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "zero-damage-attack",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 0,
    },
  );

  assertEquals(result?.damage, 0);
  assertEquals(result?.applied_modifiers[0].consumed_use, true);
  assertEquals(modifiers(creature), []);
});

Deno.test("install replay is idempotent and cannot reset or change an existing source action", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  const original = request("source-1", "listener-1", 10, 2);
  const first = runtimeV02InstallAttackDamageModifier(state, creature, original);
  const replay = runtimeV02InstallAttackDamageModifier(state, creature, original);

  assertEquals(replay, first);
  assertEquals(modifiers(creature).length, 1);
  assertEquals(state.runtime_v0_2_attack_modifier_sequence, 1);
  assertThrows(
    () => runtimeV02InstallAttackDamageModifier(
      state,
      creature,
      { ...original, amount: 20 },
    ),
    "tcg_v0_2_attack_modifier_replay_conflict",
  );
  assertEquals(modifiers(creature).length, 1);
  assertEquals(modifiers(creature)[0].amount, 10);
});

Deno.test("multi-use modifiers decrement atomically and disappear immediately at zero", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("two-use-source", "two-use-action", 15, 2),
  );

  const first = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "attack-1",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 30,
    },
  );
  assertEquals(first?.applied_modifiers[0].remaining_uses, 1);
  assertEquals(modifiers(creature)[0].remaining_uses, 1);

  const second = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "attack-2",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 30,
    },
  );
  assertEquals(second?.applied_modifiers[0].remaining_uses, 0);
  assertEquals(modifiers(creature), []);
});

Deno.test("completion rider binds exact modifier target and consuming attack action", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  runtimeV02InstallAttackDamageModifier(state, creature, {
    ...request("ash-crown-source", "ash-crown", 30, 1),
    on_consume: {
      bind_to_consuming_action: true,
      timing: "after_attack_effects_before_defeat_scan",
      steps: [{
        op: "DIRECT_DAMAGE",
        target: "$modifier_target",
        amount: 20,
        damage_class: "effect",
      }],
    },
  });

  const result = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "exact-attack-command",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 50,
    },
  );

  assertEquals(result?.bound_riders, [{
    schema: "sb-tcg-bound-attack-modifier-rider-v0.2",
    id: "attack-modifier-rider:attack-modifier:7:1:exact-attack-command",
    modifier_id: "attack-modifier:7:1",
    source_uid: "ash-crown-source",
    source_action_id: "ash-crown",
    modifier_target_uid: "target-creature-uid",
    consuming_action_id: "exact-attack-command",
    turn_seq: 7,
    timing: "after_attack_effects_before_defeat_scan",
    steps: [{
      op: "DIRECT_DAMAGE",
      target: "$modifier_target",
      amount: 20,
      damage_class: "effect",
    }],
  }]);
  assertEquals(modifiers(creature), []);
});

Deno.test("target and turn mismatches do not consume another Creature's modifier", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("source-1", "listener-1", 10, 1),
  );

  const result = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "attack-action",
      target_uid: "different-creature-uid",
      turn_seq: 7,
      base_damage: 40,
    },
  );
  assertEquals(result?.bonus_damage, 0);
  assertEquals(modifiers(creature).length, 1);

  const later = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "later-attack-action",
      target_uid: "target-creature-uid",
      turn_seq: 8,
      base_damage: 40,
    },
  );
  assertEquals(later?.bonus_damage, 0);
  assertEquals(modifiers(creature).length, 1);
});

Deno.test("end-turn expiry removes unused finite and reusable modifiers together", () => {
  const state = markedState();
  const creature: RuntimeV02AttackModifierCreature = {};
  runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("finite-source", "finite-listener", 10, 1),
  );
  runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("unlimited-source", "unlimited-listener", 20, null),
  );

  const result = runtimeV02ExpireAttackDamageModifiersAtEndOfTurn(state, creature, 7);
  assertEquals(result?.removed_count, 2);
  assertEquals(result?.removed_modifier_ids, ["attack-modifier:7:1", "attack-modifier:7:2"]);
  assertEquals(modifiers(creature), []);
});

Deno.test("legacy matches remain untouched until the structured runtime owner is present", () => {
  const state = { card_index: {} } as Record<string, unknown>;
  const creature: RuntimeV02AttackModifierCreature = {};
  const installed = runtimeV02InstallAttackDamageModifier(
    state,
    creature,
    request("source", "action", 10, 1),
  );
  const consumed = runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
    state,
    creature,
    {
      consuming_action_id: "attack",
      target_uid: "target-creature-uid",
      turn_seq: 7,
      base_damage: 30,
    },
  );

  assertEquals(installed, null);
  assertEquals(consumed, null);
  assertEquals(creature, {});
  assertEquals(state, { card_index: {} });
});

