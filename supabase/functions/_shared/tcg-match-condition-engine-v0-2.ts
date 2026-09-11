import type {
  RuntimeConditions,
  RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";

const CONTROL_CONDITIONS = new Set([
  "Stunned",
  "Dazed",
  "Rooted",
  "Blinded",
  "Mindbound",
]);
const MODIFIER_CONDITIONS = new Set([
  "Silenced",
  "Drenched",
  "Crushed",
]);
const CONDITION_NAMES = new Set([
  "Scorched",
  "Venomed",
  "Blinded",
  "Mindbound",
  "Dazed",
  "Stunned",
  "Rooted",
  "Silenced",
  "Crushed",
  "Drenched",
]);

export type ApplyConditionMode =
  | "apply"
  | "apply_if_empty"
  | "apply_if_empty_or_same"
  | "replace";

export function runtimeConditions(
  creature: RuntimeCreature,
): RuntimeConditions {
  const current = creature.conditions as Partial<RuntimeConditions> | undefined;
  const normalized: RuntimeConditions = {
    scorched: Boolean(current?.scorched),
    venomed: Math.max(0, Number(current?.venomed || 0)),
    control: current?.control ? String(current.control) : null,
    modifier: current?.modifier ? String(current.modifier) : null,
  };
  creature.conditions = normalized;
  return normalized;
}

export function hasRuntimeCondition(
  creature: RuntimeCreature,
  condition?: string,
): boolean {
  const current = runtimeConditions(creature);
  if (condition === "Scorched") return current.scorched;
  if (condition === "Venomed") return current.venomed > 0;
  if (condition) {
    return current.control === condition || current.modifier === condition;
  }
  return current.scorched || current.venomed > 0 ||
    Boolean(current.control) || Boolean(current.modifier);
}

export function clearRuntimeCondition(
  creature: RuntimeCreature,
  condition: string,
): boolean {
  const current = runtimeConditions(creature);
  if (condition === "Scorched" && current.scorched) {
    current.scorched = false;
    return true;
  }
  if (condition === "Venomed" && current.venomed > 0) {
    current.venomed = 0;
    return true;
  }
  if (current.control === condition) {
    current.control = null;
    return true;
  }
  if (current.modifier === condition) {
    current.modifier = null;
    return true;
  }
  return false;
}

function activeConditionImmunity(
  creature: RuntimeCreature,
  condition: string,
  turnSeq: number,
): boolean {
  const immunity = (creature.flags as Record<string, unknown> | undefined)
    ?.lifecycle_condition_immunity as Record<string, unknown> | undefined;
  if (!immunity) return false;
  if (Number(immunity.turn_seq) !== Number(turnSeq)) return false;
  const listed = Array.isArray(immunity.conditions)
    ? immunity.conditions.map((value) => String(value))
    : immunity.condition != null
    ? [String(immunity.condition)]
    : [];
  return listed.includes(condition);
}

export function applyRuntimeCondition(
  creature: RuntimeCreature,
  condition: string,
  turnSeq: number,
  mode: ApplyConditionMode = "apply",
): { applied: boolean; prevented: boolean; reason?: string } {
  if (!CONDITION_NAMES.has(condition)) {
    throw new Error(`unknown_condition:${condition}`);
  }
  if (activeConditionImmunity(creature, condition, turnSeq)) {
    return {
      applied: false,
      prevented: true,
      reason: "condition_immunity",
    };
  }

  const current = runtimeConditions(creature);
  if (condition === "Scorched") {
    if (
      (mode === "apply_if_empty" || mode === "apply_if_empty_or_same") &&
      current.scorched
    ) {
      return mode === "apply_if_empty_or_same"
        ? { applied: true, prevented: false }
        : { applied: false, prevented: false, reason: "slot_occupied" };
    }
    current.scorched = true;
    return { applied: true, prevented: false };
  }
  if (condition === "Venomed") {
    if (mode === "apply_if_empty" && current.venomed > 0) {
      return {
        applied: false,
        prevented: false,
        reason: "slot_occupied",
      };
    }
    current.venomed = Math.max(10, current.venomed);
    return { applied: true, prevented: false };
  }

  const slot = CONTROL_CONDITIONS.has(condition)
    ? "control"
    : MODIFIER_CONDITIONS.has(condition)
    ? "modifier"
    : null;
  if (!slot) throw new Error(`condition_slot_missing:${condition}`);
  const previous = current[slot];
  if (mode === "apply_if_empty" && previous) {
    return {
      applied: false,
      prevented: false,
      reason: "slot_occupied",
    };
  }
  if (
    mode === "apply_if_empty_or_same" && previous && previous !== condition
  ) {
    return {
      applied: false,
      prevented: false,
      reason: "slot_occupied",
    };
  }
  if (
    mode !== "replace" && mode !== "apply" && previous &&
    previous !== condition
  ) {
    return {
      applied: false,
      prevented: false,
      reason: "slot_occupied",
    };
  }
  current[slot] = condition;
  return { applied: true, prevented: false };
}
