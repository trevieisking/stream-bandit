import {
  runtimeV02ApplyConditionProtectionProgram,
} from "../_shared/tcg-match-condition-protection-program-v0-2.ts";
import {
  runtimeV02ConditionProtectionCount,
  runtimeV02ConsumeConditionProtection,
} from "../_shared/tcg-match-condition-protection-v0-2.ts";

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
function fixture() {
  const creature: any = { damage: 0, shield: 0, flags: {} };
  const state = { turn_seq: 5 } as Record<string, unknown>;
  const source = {
    controller_seat: 1 as const,
    action_id: "listener:halo-step",
    card_uid: "source-uid",
    card_id: "generic-source-card",
  };
  const target = {
    controller_seat: 1 as const,
    creature_uid: "target-uid",
    creature,
  };
  const step = {
    op: "ADD_CONDITION_PROTECTION",
    target: "$protected_creature",
    condition_slot: "modifier",
    source_controller: "opponent",
    card_effect_only: true,
    duration: {
      expires_on: ["start_of_controller_next_turn"],
      max_uses: 1,
      consume_on: "matching_condition_application_prevented",
    },
  };
  return { state, source, target, step, creature };
}

Deno.test("Condition #19 program adapter installs generic Halo-Step-shaped protection", () => {
  const { state, source, target, step, creature } = fixture();
  const receipt = runtimeV02ApplyConditionProtectionProgram(state, source, target, step);
  equal(receipt.installed, true);
  equal(receipt.condition_slot, "modifier");
  equal(receipt.max_uses, 1);
  equal(runtimeV02ConditionProtectionCount(creature), 1);
  const consumed = runtimeV02ConsumeConditionProtection(creature, {
    turn_seq: 6,
    active_seat: 2,
    source_controller_seat: 2,
    target_controller_seat: 1,
    card_effect: true,
    new_application: true,
    condition: "Silenced",
    condition_slot: "modifier",
    source_action_id: "opposing-card",
  });
  equal(consumed.prevented, true);
});

Deno.test("Condition #19 program adapter is retry-idempotent for the same source action and target", () => {
  const { state, source, target, step, creature } = fixture();
  equal(runtimeV02ApplyConditionProtectionProgram(state, source, target, step).installed, true);
  equal(runtimeV02ApplyConditionProtectionProgram(state, source, target, step).installed, false);
  equal(runtimeV02ConditionProtectionCount(creature), 1);
});

Deno.test("Condition #19 program adapter rejects ambiguous or over-broad shapes", () => {
  const { state, source, target, step } = fixture();
  throws(() => runtimeV02ApplyConditionProtectionProgram(state, source, target, {
    ...step,
    condition_slot: undefined,
    conditions: undefined,
  }), "filter_required");
  throws(() => runtimeV02ApplyConditionProtectionProgram(state, source, target, {
    ...step,
    duration: { expires_on: ["end_of_turn"], max_uses: 1 },
  }), "expiry_unsupported");
  throws(() => runtimeV02ApplyConditionProtectionProgram(state, source, target, {
    ...step,
    mystery: true,
  }), "field_unsupported:mystery");
});