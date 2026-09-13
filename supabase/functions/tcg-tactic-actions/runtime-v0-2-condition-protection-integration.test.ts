import {
  applyRuntimeCondition,
  applyRuntimeConditionWithContext,
  hasRuntimeCondition,
} from "./tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02ConditionProtectionCount,
  runtimeV02InstallConditionProtection,
} from "./tcg-match-condition-protection-v0-2.ts";

function equal(actual: unknown, expected: unknown, label = "mismatch") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function target() { return { damage: 0, shield: 0, flags: {} as Record<string, unknown> }; }
function install(cr: ReturnType<typeof target>) {
  runtimeV02InstallConditionProtection(cr, {
    protection_id: "condition-protection:test",
    source_action_id: "evolve:test",
    source_uid: "source-uid",
    source_card_id: "source-card",
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
    active_seat: 2 as const,
    source_controller_seat: 2 as const,
    target_controller_seat: 1 as const,
    card_effect: true,
    source_action_id: "opponent-card-effect",
    ...overrides,
  } as any;
}

Deno.test("Condition #19 structured application consumes matching protection before mutation", () => {
  const cr = target(); install(cr);
  const blocked = applyRuntimeConditionWithContext(cr, "Silenced", 6, "apply", context());
  equal(blocked.prevented, true);
  equal(blocked.reason, "condition_protection");
  equal(hasRuntimeCondition(cr, "Silenced"), false);
  equal(runtimeV02ConditionProtectionCount(cr), 0);
  const applied = applyRuntimeConditionWithContext(cr, "Silenced", 6, "apply", context({ source_action_id: "opponent-card-effect-2" }));
  equal(applied.applied, true);
  equal(hasRuntimeCondition(cr, "Silenced"), true);
});

Deno.test("Condition #19 does not consume temporary protection when ordinary slot legality already rejects application", () => {
  const cr = target();
  applyRuntimeCondition(cr, "Drenched", 5, "apply");
  install(cr);
  const result = applyRuntimeConditionWithContext(cr, "Silenced", 6, "apply_if_empty", context());
  equal(result.applied, false);
  equal(result.reason, "slot_occupied");
  equal(runtimeV02ConditionProtectionCount(cr), 1);
});

Deno.test("Condition #19 legacy applyRuntimeCondition callers remain unchanged", () => {
  const cr = target(); install(cr);
  const result = applyRuntimeCondition(cr, "Silenced", 6, "apply");
  equal(result.applied, true);
  equal(result.prevented, false);
  equal(runtimeV02ConditionProtectionCount(cr), 1);
});
