import type { RuntimeV02ConditionCreature } from "./tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02EvaluatePredicateTree,
  type RuntimeV02PredicateLeaf,
} from "./tcg-match-predicate-tree-v0-2.ts";

export type RuntimeV02ActiveAbilityIfContext = {
  sets: Record<string, unknown[]>;
  creatures: Record<string, RuntimeV02ConditionCreature>;
  essence_moves: Record<string, unknown[]>;
};

function key(raw: unknown, code: string): string {
  const text = typeof raw === "string" ? raw.trim().replace(/^\$/, "") : "";
  if (!text) throw new Error(code);
  return text;
}

function nonNegativeInteger(value: unknown, code: string): number {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0) throw new Error(code);
  return count;
}

function only(
  value: RuntimeV02PredicateLeaf,
  allowed: string[],
  code: string,
): void {
  const set = new Set(allowed);
  const extra = Object.keys(value).find((field) => !set.has(field));
  if (extra) throw new Error(`${code}:${extra}`);
}

function leaf(
  value: RuntimeV02PredicateLeaf,
  context: RuntimeV02ActiveAbilityIfContext,
): boolean {
  switch (value.predicate) {
    case "selected_count_at_least": {
      only(
        value,
        ["predicate", "set", "count"],
        "tcg_v0_2_active_ability_if_selected_count_field_unsupported",
      );
      const setKey = key(
        value.set,
        "tcg_v0_2_active_ability_if_selected_count_set_required",
      );
      const selected = context.sets[setKey];
      if (!Array.isArray(selected)) {
        throw new Error(
          `tcg_v0_2_active_ability_if_selected_set_missing:${setKey}`,
        );
      }
      return selected.length >= nonNegativeInteger(
        value.count,
        "tcg_v0_2_active_ability_if_selected_count_invalid",
      );
    }

    case "target_damaged": {
      only(
        value,
        ["predicate", "target"],
        "tcg_v0_2_active_ability_if_target_damaged_field_unsupported",
      );
      const targetKey = key(
        value.target,
        "tcg_v0_2_active_ability_if_target_required",
      );
      const target = context.creatures[targetKey];
      if (!target) {
        throw new Error(
          `tcg_v0_2_active_ability_if_target_missing:${targetKey}`,
        );
      }
      const damage = Number(target.damage || 0);
      if (!Number.isFinite(damage) || damage < 0) {
        throw new Error("tcg_v0_2_active_ability_if_target_damage_invalid");
      }
      return damage > 0;
    }

    case "essence_move_count_at_least": {
      only(
        value,
        ["predicate", "moves", "count"],
        "tcg_v0_2_active_ability_if_essence_move_count_field_unsupported",
      );
      const movesKey = key(
        value.moves,
        "tcg_v0_2_active_ability_if_essence_moves_required",
      );
      const moves = context.essence_moves[movesKey];
      if (!Array.isArray(moves)) {
        throw new Error(
          `tcg_v0_2_active_ability_if_essence_moves_missing:${movesKey}`,
        );
      }
      return moves.length >= nonNegativeInteger(
        value.count,
        "tcg_v0_2_active_ability_if_essence_move_count_invalid",
      );
    }

    default:
      throw new Error(
        `tcg_v0_2_active_ability_if_predicate_unsupported:${value.predicate}`,
      );
  }
}

export function runtimeV02EvaluateActiveAbilityIf(
  raw: unknown,
  context: RuntimeV02ActiveAbilityIfContext,
): boolean {
  return runtimeV02EvaluatePredicateTree(raw, context, leaf);
}
