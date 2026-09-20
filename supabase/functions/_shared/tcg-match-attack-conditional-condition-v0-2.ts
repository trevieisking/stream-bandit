import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  applyRuntimeConditionWithContext,
  runtimeV02ConditionSlot,
  type ApplyConditionMode,
  type RuntimeV02ConditionApplyWithContextResult,
  type RuntimeV02ConditionCreature,
} from "./tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02EvaluateAttackIf,
  type RuntimeV02AttackIfContext,
} from "./tcg-match-attack-if-v0-2.ts";

export type RuntimeV02AttackConditionalConditionReceipt = {
  op: "APPLY_CONDITION" | "REPLACE_CONTROL_CONDITION";
  condition: string;
  mode: ApplyConditionMode;
  applied: boolean;
  prevented: boolean;
  reason: string | null;
};

export type RuntimeV02AttackConditionalConditionContext = {
  if_context: RuntimeV02AttackIfContext;
  target_creature: RuntimeV02ConditionCreature;
  source_controller_seat: 1 | 2;
  target_controller_seat: 1 | 2;
  active_seat: 1 | 2;
  turn_seq: number;
  source_action_id: string;
};

function record(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, code: string): string {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(code);
  return text;
}

function conditionMode(value: unknown): ApplyConditionMode {
  const mode = String(value || "apply") as ApplyConditionMode;
  if (!["apply", "apply_if_empty", "apply_if_empty_or_same", "replace"].includes(mode)) {
    throw new Error("tcg_v0_2_attack_conditional_condition_mode_unsupported");
  }
  return mode;
}

function operationShape(
  steps: unknown,
): { supported: boolean; has_if: boolean } {
  if (!Array.isArray(steps)) return { supported: false, has_if: false };
  let hasIf = false;
  for (const raw of steps) {
    const step = raw && typeof raw === "object" && !Array.isArray(raw)
      ? raw as Record<string, unknown>
      : null;
    if (!step) return { supported: false, has_if: hasIf };
    const op = String(step.op || "");
    if (op === "IF") {
      hasIf = true;
      const thenShape = operationShape(step.then);
      if (!thenShape.supported) return { supported: false, has_if: true };
      hasIf = hasIf || thenShape.has_if;
      if (step.else != null) {
        const elseShape = operationShape(step.else);
        if (!elseShape.supported) return { supported: false, has_if: true };
        hasIf = hasIf || elseShape.has_if;
      }
      continue;
    }
    if (op !== "APPLY_CONDITION" && op !== "REPLACE_CONTROL_CONDITION") {
      return { supported: false, has_if: hasIf };
    }
  }
  return { supported: true, has_if: hasIf };
}

export function runtimeV02AttackConditionalConditionProgramIsSupported(
  steps: unknown,
): boolean {
  const shape = operationShape(steps);
  return shape.supported && shape.has_if;
}

function applyConditionStep(
  step: Record<string, unknown>,
  context: RuntimeV02AttackConditionalConditionContext,
): RuntimeV02AttackConditionalConditionReceipt {
  if (String(step.target || "") !== "$attack_target") {
    throw new Error("tcg_v0_2_attack_conditional_condition_target_unsupported");
  }
  const condition = requiredString(
    step.condition,
    "tcg_v0_2_attack_conditional_condition_required",
  );

  let mode: ApplyConditionMode;
  const op = String(step.op || "") as "APPLY_CONDITION" | "REPLACE_CONTROL_CONDITION";
  if (op === "REPLACE_CONTROL_CONDITION") {
    if (step.allow_if_empty !== true || step.replace_existing !== true) {
      throw new Error("tcg_v0_2_attack_replace_control_shape_unsupported");
    }
    if (runtimeV02ConditionSlot(condition) !== "control") {
      throw new Error("tcg_v0_2_attack_replace_control_condition_required");
    }
    mode = "replace";
  } else {
    mode = conditionMode(step.mode);
  }

  const result: RuntimeV02ConditionApplyWithContextResult =
    applyRuntimeConditionWithContext(
      context.target_creature,
      condition,
      context.turn_seq,
      mode,
      {
        turn_seq: context.turn_seq,
        active_seat: context.active_seat,
        source_controller_seat: context.source_controller_seat,
        target_controller_seat: context.target_controller_seat,
        card_effect: true,
        source_action_id: context.source_action_id,
      },
    );

  return {
    op,
    condition,
    mode,
    applied: result.applied,
    prevented: result.prevented,
    reason: result.reason || null,
  };
}

export function runtimeV02ExecuteAttackConditionalConditionSteps(
  steps: unknown[],
  context: RuntimeV02AttackConditionalConditionContext,
): RuntimeV02AttackConditionalConditionReceipt[] {
  const receipts: RuntimeV02AttackConditionalConditionReceipt[] = [];
  for (let index = 0; index < steps.length; index += 1) {
    const step = record(
      steps[index],
      `tcg_v0_2_attack_conditional_condition_step_invalid:${index}`,
    );
    const op = String(step.op || "");

    if (op === "IF") {
      if (runtimeV02EvaluateAttackIf(step.when, context.if_context)) {
        const nested = Array.isArray(step.then) ? step.then : [];
        receipts.push(...runtimeV02ExecuteAttackConditionalConditionSteps(nested, context));
      } else if (step.else != null) {
        if (!Array.isArray(step.else)) {
          throw new Error("tcg_v0_2_attack_conditional_condition_else_invalid");
        }
        receipts.push(...runtimeV02ExecuteAttackConditionalConditionSteps(step.else, context));
      }
      continue;
    }

    if (op === "APPLY_CONDITION" || op === "REPLACE_CONTROL_CONDITION") {
      receipts.push(applyConditionStep(step, context));
      continue;
    }

    throw new Error(`tcg_v0_2_attack_conditional_condition_op_unsupported:${op}`);
  }
  return receipts;
}

export function structuredRuntimeAfterDamageConditionalConditionEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  context: RuntimeV02AttackConditionalConditionContext,
): RuntimeV02AttackConditionalConditionReceipt[] | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_conditional_condition_requires_creature");
  }
  const creature = record(
    definition.creature,
    "tcg_v0_2_attack_conditional_condition_creature_required",
  );
  if (!Array.isArray(creature.attacks)) {
    throw new Error("tcg_v0_2_attack_conditional_condition_attacks_required");
  }
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > creature.attacks.length) {
    throw new Error("tcg_v0_2_attack_conditional_condition_slot_invalid");
  }
  const attack = record(
    creature.attacks[attackSlot - 1],
    "tcg_v0_2_attack_conditional_condition_attack_invalid",
  );
  const afterDamage = attack.after_damage;
  if (!runtimeV02AttackConditionalConditionProgramIsSupported(afterDamage)) return null;
  return runtimeV02ExecuteAttackConditionalConditionSteps(
    afterDamage as unknown[],
    context,
  );
}
