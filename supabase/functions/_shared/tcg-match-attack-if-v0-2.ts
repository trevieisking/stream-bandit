import {
  runtimeV02EvaluatePredicateTree,
  type RuntimeV02PredicateLeaf,
} from "./tcg-match-predicate-tree-v0-2.ts";
import {
  evaluateRuntimeV02ReserveCountAtLeastRequirement,
  evaluateRuntimeV02SourceDamagedRequirement,
  evaluateRuntimeV02SourceHasShieldAtLeastRequirement,
} from "./tcg-match-requirement-evaluator-v0-2.ts";
import {
  activeRuntimeConditions,
  runtimeConditions,
  type RuntimeV02ConditionCreature,
} from "./tcg-match-condition-engine-v0-2.ts";

export type RuntimeV02AttackIfCardMatcher = (
  card: unknown,
  filters: Record<string, unknown>,
) => boolean;

export type RuntimeV02AttackIfContext = {
  source_creature: unknown;
  attack_target: RuntimeV02ConditionCreature;
  self_reserve: unknown[];
  opponent_reserve: unknown[];
  variables?: Record<string, unknown>;
  current_action_events?: Record<string, number>;
  target_remains_in_play_after_damage: boolean;
  card_matches: RuntimeV02AttackIfCardMatcher;
};

function objectRecord(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function positiveInteger(value: unknown, code: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error(code);
  return number;
}

function resolveVariable(
  variables: Record<string, unknown> | undefined,
  token: unknown,
): unknown {
  const key = String(token || "").trim();
  if (!key.startsWith("$")) throw new Error("tcg_v0_2_attack_if_card_variable_required");
  const value = variables?.[key.slice(1)];
  if (Array.isArray(value)) {
    if (value.length !== 1) throw new Error("tcg_v0_2_attack_if_card_variable_cardinality_invalid");
    return value[0];
  }
  if (value == null) throw new Error("tcg_v0_2_attack_if_card_variable_missing");
  return value;
}

function eventCount(
  context: RuntimeV02AttackIfContext,
  event: string,
): number {
  const raw = context.current_action_events?.[event] ?? 0;
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_attack_if_event_count_invalid");
  }
  return count;
}

export function runtimeV02EvaluateAttackIfLeaf(
  leaf: RuntimeV02PredicateLeaf,
  context: RuntimeV02AttackIfContext,
): boolean {
  const predicate = String(leaf.predicate || "");

  if (predicate === "source_damaged") {
    return evaluateRuntimeV02SourceDamagedRequirement(
      context.source_creature,
      { predicate: "source_damaged" },
    ).matched;
  }

  if (predicate === "source_has_shield_at_least") {
    return evaluateRuntimeV02SourceHasShieldAtLeastRequirement(
      context.source_creature,
      {
        predicate: "source_has_shield_at_least",
        value: Number(leaf.value),
      },
    ).matched;
  }

  if (predicate === "reserve_count_at_least") {
    const controller = String(leaf.controller || "");
    if (controller !== "self" && controller !== "opponent") {
      throw new Error("tcg_v0_2_attack_if_reserve_controller_unsupported");
    }
    return evaluateRuntimeV02ReserveCountAtLeastRequirement(
      controller === "self" ? context.self_reserve : context.opponent_reserve,
      {
        predicate: "reserve_count_at_least",
        controller,
        count: positiveInteger(
          leaf.count,
          "tcg_v0_2_attack_if_reserve_count_invalid",
        ),
      },
    ).matched;
  }

  if (predicate === "target_remains_in_play_after_damage") {
    return context.target_remains_in_play_after_damage === true;
  }

  if (predicate === "control_condition_slot_empty") {
    const target = String(leaf.target || "");
    if (target !== "$attack_target") {
      throw new Error("tcg_v0_2_attack_if_control_slot_target_unsupported");
    }
    return runtimeConditions(context.attack_target).control == null;
  }

  if (predicate === "target_has_any_condition") {
    return activeRuntimeConditions(context.attack_target).length > 0;
  }

  if (predicate === "event_occurred") {
    if (String(leaf.controller || "") !== "self") {
      throw new Error("tcg_v0_2_attack_if_event_controller_unsupported");
    }
    if (String(leaf.window || "") !== "current_action") {
      throw new Error("tcg_v0_2_attack_if_event_window_unsupported");
    }
    const event = String(leaf.event || "").trim();
    if (!event) throw new Error("tcg_v0_2_attack_if_event_required");
    const minimum = positiveInteger(
      leaf.min_count,
      "tcg_v0_2_attack_if_event_min_count_invalid",
    );
    return eventCount(context, event) >= minimum;
  }

  if (predicate === "card_matches") {
    const card = resolveVariable(context.variables, leaf.card);
    const filters = objectRecord(
      leaf.filters,
      "tcg_v0_2_attack_if_card_filters_invalid",
    );
    return context.card_matches(card, filters);
  }

  throw new Error(`tcg_v0_2_attack_if_predicate_unsupported:${predicate}`);
}

export function runtimeV02EvaluateAttackIf(
  tree: unknown,
  context: RuntimeV02AttackIfContext,
): boolean {
  if (!context || typeof context !== "object") {
    throw new Error("tcg_v0_2_attack_if_context_invalid");
  }
  if (typeof context.card_matches !== "function") {
    throw new Error("tcg_v0_2_attack_if_card_matcher_required");
  }
  return runtimeV02EvaluatePredicateTree(
    tree,
    context,
    runtimeV02EvaluateAttackIfLeaf,
  );
}
