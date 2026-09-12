export type RuntimeV02ConditionState = {
  scorched: boolean;
  venomed: number;
  control: string | null;
  modifier: string | null;
};

export type RuntimeV02ConditionCreature = {
  damage: number;
  shield: number;
  conditions?: RuntimeV02ConditionState | Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
};

export type RuntimeV02ConditionName =
  | "Scorched"
  | "Venomed"
  | "Blinded"
  | "Mindbound"
  | "Dazed"
  | "Stunned"
  | "Rooted"
  | "Silenced"
  | "Crushed"
  | "Drenched";

export type ApplyConditionMode =
  | "apply"
  | "apply_if_empty"
  | "apply_if_empty_or_same"
  | "replace";

export const runtimeV02ConditionNames = [
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
] as const satisfies readonly RuntimeV02ConditionName[];

const CONDITION_NAMES = new Set<string>(runtimeV02ConditionNames);
const CONTROL_CONDITIONS = new Set<string>([
  "Stunned",
  "Dazed",
  "Rooted",
  "Blinded",
  "Mindbound",
]);
const MODIFIER_CONDITIONS = new Set<string>([
  "Silenced",
  "Drenched",
  "Crushed",
]);

/**
 * Canonical condition-state normalizer. This deliberately preserves the
 * current v0.2 slot model: Scorched and Venomed persist independently while
 * control and modifier conditions each occupy one slot. Lifecycle behaviour
 * lives in tcg-match-condition-lifecycle-v0-2.ts.
 */
export function runtimeConditions(
  creature: RuntimeV02ConditionCreature,
): RuntimeV02ConditionState {
  const current = creature.conditions as
    | Partial<RuntimeV02ConditionState>
    | undefined;
  const normalized: RuntimeV02ConditionState = {
    scorched: Boolean(current?.scorched),
    venomed: Math.max(0, Number(current?.venomed || 0)),
    control: current?.control ? String(current.control) : null,
    modifier: current?.modifier ? String(current.modifier) : null,
  };
  creature.conditions = normalized;
  return normalized;
}

export function activeRuntimeConditions(
  creature: RuntimeV02ConditionCreature,
): RuntimeV02ConditionName[] {
  const current = runtimeConditions(creature);
  const out: RuntimeV02ConditionName[] = [];
  if (current.scorched) out.push("Scorched");
  if (current.venomed > 0) out.push("Venomed");
  if (current.control && CONDITION_NAMES.has(current.control)) {
    out.push(current.control as RuntimeV02ConditionName);
  }
  if (current.modifier && CONDITION_NAMES.has(current.modifier)) {
    out.push(current.modifier as RuntimeV02ConditionName);
  }
  return out;
}

export function hasRuntimeCondition(
  creature: RuntimeV02ConditionCreature,
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
  creature: RuntimeV02ConditionCreature,
  condition: string,
): boolean {
  const current = runtimeConditions(creature);
  let cleared = false;
  if (condition === "Scorched" && current.scorched) {
    current.scorched = false;
    cleared = true;
  } else if (condition === "Venomed" && current.venomed > 0) {
    current.venomed = 0;
    cleared = true;
  } else if (current.control === condition) {
    current.control = null;
    cleared = true;
  } else if (current.modifier === condition) {
    current.modifier = null;
    cleared = true;
  }
  if (cleared) {
    // Compatibility shadow only. Canonical condition state is `conditions`,
    // but older match snapshots can still carry the former scalar field.
    creature.condition = null;
  }
  return cleared;
}

/**
 * Canonical whole-condition reset used only when a game rule says every
 * ordinary condition leaves a Creature at once (for example evolution).
 * The caller owns when that rule applies; Condition owns the state mutation.
 */
export function clearAllRuntimeConditions(
  creature: RuntimeV02ConditionCreature,
): boolean {
  const current = runtimeConditions(creature);
  const cleared = current.scorched || current.venomed > 0 ||
    Boolean(current.control) || Boolean(current.modifier) ||
    creature.condition != null;
  current.scorched = false;
  current.venomed = 0;
  current.control = null;
  current.modifier = null;
  creature.condition = null;
  return cleared;
}

function activeConditionImmunity(
  creature: RuntimeV02ConditionCreature,
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
  creature: RuntimeV02ConditionCreature,
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
