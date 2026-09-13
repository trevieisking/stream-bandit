import {
  runtimeV02ConditionProtectionCount,
  runtimeV02ConsumeConditionProtection,
  runtimeV02InstallConditionProtection,
} from "./tcg-match-condition-protection-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, part: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(part)) throw error;
    return;
  }
  throw new Error(`expected error containing ${part}`);
}
function install(target: Record<string, unknown>) {
  return runtimeV02InstallConditionProtection(target, {
    protection_id: "protect:action-7:target-1",
    source_action_id: "action-7",
    source_uid: "source-1",
    source_card_id: "test-protector",
    source_controller_seat: 1,
    target_controller_seat: 1,
    installed_turn_seq: 5,
    condition_names: [],
    condition_slot: "modifier",
    source_controller: "opponent",
    card_effect_only: true,
    max_uses: 1,
    expires_on: "start_of_controller_next_turn",
  });
}
function context(overrides: Record<string, unknown> = {}) {
  return {
    turn_seq: 6,
    active_seat: 2,
    source_controller_seat: 2,
    target_controller_seat: 1,
    card_effect: true,
    new_application: true,
    condition: "Silenced",
    condition_slot: "modifier" as const,
    source_action_id: "opp-card-effect",
    ...overrides,
  } as any;
}

Deno.test("Condition #19 temporary protection blocks one matching opposing modifier application", () => {
  const target: any = {};
  equal(install(target).installed, true);
  const first = runtimeV02ConsumeConditionProtection(target, context());
  equal(first.prevented, true);
  equal(first.remaining_uses, 0);
  equal(runtimeV02ConditionProtectionCount(target), 0);
  equal(runtimeV02ConsumeConditionProtection(target, context({ source_action_id: "opp-card-effect-2" })).prevented, false);
});

Deno.test("Condition #19 protection ignores friendly, non-card and non-modifier applications", () => {
  for (const overrides of [
    { source_controller_seat: 1 },
    { card_effect: false },
    { condition: "Stunned", condition_slot: "control" },
    { new_application: false },
  ]) {
    const target: any = {};
    install(target);
    equal(runtimeV02ConsumeConditionProtection(target, context(overrides)).prevented, false);
    equal(runtimeV02ConditionProtectionCount(target), 1);
  }
});

Deno.test("Condition #19 protection expires at the start of the target controller next turn", () => {
  const target: any = {};
  install(target);
  const expired = runtimeV02ConsumeConditionProtection(target, context({ turn_seq: 7, active_seat: 1 }));
  equal(expired.prevented, false);
  equal(runtimeV02ConditionProtectionCount(target), 0);
});

Deno.test("Condition #19 install is retry-idempotent and conflicts fail closed", () => {
  const target: any = {};
  equal(install(target).installed, true);
  equal(install(target).installed, false);
  equal(runtimeV02ConditionProtectionCount(target), 1);
  throws(() => runtimeV02InstallConditionProtection(target, {
    protection_id: "protect:action-7:target-1",
    source_action_id: "action-7",
    source_uid: "different-source",
    source_card_id: "test-protector",
    source_controller_seat: 1,
    target_controller_seat: 1,
    installed_turn_seq: 5,
    condition_names: [],
    condition_slot: "modifier",
    source_controller: "opponent",
    card_effect_only: true,
    max_uses: 1,
    expires_on: "start_of_controller_next_turn",
  }), "id_conflict");
});
