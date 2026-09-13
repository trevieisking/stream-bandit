export type RuntimeV02DamageCost = {
  kind: "damage";
  target: string;
  amount: number;
};

export type RuntimeV02HandDiscardCost = {
  kind: "hand_discard";
  player: "self";
  count: number;
  filters?: Record<string, unknown>;
};

export type RuntimeV02OptionalCost = {
  kind: "optional";
  as: string;
  costs: RuntimeV02CardCostNode[];
};

export type RuntimeV02ChoiceCost = {
  kind: "choice";
  options: RuntimeV02CardCostNode[][];
};

export type RuntimeV02CardCostNode =
  | RuntimeV02DamageCost
  | RuntimeV02HandDiscardCost
  | RuntimeV02OptionalCost
  | RuntimeV02ChoiceCost;

export type RuntimeV02CardCostDecision = {
  path: string;
  selection: "pay" | "skip" | number;
};

export type RuntimeV02CardCostChoice = {
  path: string;
  kind: "optional" | "choice";
  options: Array<{
    id: string;
    label: string;
    selection: "pay" | "skip" | number;
  }>;
};

export type RuntimeV02PlannedDamageCost = RuntimeV02DamageCost & {
  cost_index: number;
  source_path: string;
};

export type RuntimeV02PlannedHandDiscardCost = RuntimeV02HandDiscardCost & {
  cost_index: number;
  source_path: string;
};

export type RuntimeV02PlannedCardCost =
  | RuntimeV02PlannedDamageCost
  | RuntimeV02PlannedHandDiscardCost;

export type RuntimeV02CardCostPlanResult =
  | {
    status: "choice_required";
    choice: RuntimeV02CardCostChoice;
    variables: Record<string, boolean>;
  }
  | {
    status: "ready";
    costs: RuntimeV02PlannedCardCost[];
    variables: Record<string, boolean>;
  };

type NormalizedNode = RuntimeV02CardCostNode;

type WalkResult =
  | { status: "choice_required"; choice: RuntimeV02CardCostChoice }
  | { status: "complete" };

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function positiveInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(error);
  return number;
}

function positiveAmount(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(error);
  return number;
}

function rejectExtraFields(raw: Record<string, unknown>, allowed: readonly string[], error: string): void {
  const keys = new Set(allowed);
  const extra = Object.keys(raw).find((key) => !keys.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function normalizeFilters(raw: unknown): Record<string, unknown> | undefined {
  if (raw == null) return undefined;
  const value = objectRecord(raw);
  if (!value) throw new Error("tcg_v0_2_card_cost_plan_filters_invalid");
  return structuredClone(value);
}

function normalizeSequence(raw: unknown, path: string): NormalizedNode[] {
  if (!Array.isArray(raw)) throw new Error(`tcg_v0_2_card_cost_plan_sequence_invalid:${path}`);
  return raw.map((node, index) => normalizeNode(node, `${path}/${index}`));
}

function normalizeNode(rawValue: unknown, path: string): NormalizedNode {
  const raw = objectRecord(rawValue);
  if (!raw) throw new Error(`tcg_v0_2_card_cost_plan_node_invalid:${path}`);
  const kind = requiredString(raw.kind, `tcg_v0_2_card_cost_plan_kind_required:${path}`);

  if (kind === "damage") {
    rejectExtraFields(raw, ["kind", "target", "amount"], `tcg_v0_2_card_cost_plan_damage_field_unsupported:${path}`);
    return {
      kind,
      target: requiredString(raw.target, `tcg_v0_2_card_cost_plan_damage_target_required:${path}`),
      amount: positiveAmount(raw.amount, `tcg_v0_2_card_cost_plan_damage_amount_invalid:${path}`),
    };
  }

  if (kind === "hand_discard") {
    rejectExtraFields(raw, ["kind", "player", "count", "filters"], `tcg_v0_2_card_cost_plan_discard_field_unsupported:${path}`);
    if (raw.player !== "self") throw new Error(`tcg_v0_2_card_cost_plan_discard_player_unsupported:${path}`);
    const filters = normalizeFilters(raw.filters);
    return {
      kind,
      player: "self",
      count: positiveInteger(raw.count, `tcg_v0_2_card_cost_plan_discard_count_invalid:${path}`),
      ...(filters == null ? {} : { filters }),
    };
  }

  if (kind === "optional") {
    rejectExtraFields(raw, ["kind", "costs", "as"], `tcg_v0_2_card_cost_plan_optional_field_unsupported:${path}`);
    const costs = normalizeSequence(raw.costs, `${path}/optional`);
    if (!costs.length) throw new Error(`tcg_v0_2_card_cost_plan_optional_empty:${path}`);
    return {
      kind,
      as: requiredString(raw.as, `tcg_v0_2_card_cost_plan_optional_as_required:${path}`),
      costs,
    };
  }

  if (kind === "choice") {
    rejectExtraFields(raw, ["kind", "options"], `tcg_v0_2_card_cost_plan_choice_field_unsupported:${path}`);
    if (!Array.isArray(raw.options) || raw.options.length < 2) {
      throw new Error(`tcg_v0_2_card_cost_plan_choice_options_invalid:${path}`);
    }
    const options = raw.options.map((option, index) => {
      const sequence = normalizeSequence(option, `${path}/choice:${index}`);
      if (!sequence.length) throw new Error(`tcg_v0_2_card_cost_plan_choice_option_empty:${path}:${index}`);
      return sequence;
    });
    return { kind, options };
  }

  throw new Error(`tcg_v0_2_card_cost_plan_kind_unsupported:${path}:${kind}`);
}

function normalizedDecisions(raw: readonly RuntimeV02CardCostDecision[]): Map<string, RuntimeV02CardCostDecision["selection"]> {
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_card_cost_plan_decisions_invalid");
  const out = new Map<string, RuntimeV02CardCostDecision["selection"]>();
  for (let index = 0; index < raw.length; index += 1) {
    const decision = raw[index];
    if (!decision || typeof decision !== "object") throw new Error(`tcg_v0_2_card_cost_plan_decision_invalid:${index}`);
    const path = requiredString(decision.path, `tcg_v0_2_card_cost_plan_decision_path_required:${index}`);
    if (out.has(path)) throw new Error(`tcg_v0_2_card_cost_plan_decision_duplicate:${path}`);
    out.set(path, decision.selection);
  }
  return out;
}

function walkSequence(
  sequence: readonly NormalizedNode[],
  path: string,
  decisions: Map<string, RuntimeV02CardCostDecision["selection"]>,
  leaves: Array<Omit<RuntimeV02PlannedCardCost, "cost_index">>,
  variables: Record<string, boolean>,
  variableOwners: Map<string, string>,
): WalkResult {
  for (let index = 0; index < sequence.length; index += 1) {
    const node = sequence[index];
    const nodePath = `${path}/${index}`;

    if (node.kind === "damage" || node.kind === "hand_discard") {
      leaves.push({ ...node, source_path: nodePath });
      continue;
    }

    if (node.kind === "optional") {
      const existingOwner = variableOwners.get(node.as);
      if (existingOwner && existingOwner !== nodePath) {
        throw new Error(`tcg_v0_2_card_cost_plan_variable_duplicate:${node.as}`);
      }
      variableOwners.set(node.as, nodePath);
      const selection = decisions.get(nodePath);
      if (selection == null) {
        return {
          status: "choice_required",
          choice: {
            path: nodePath,
            kind: "optional",
            options: [
              { id: "skip", label: "Do not pay optional cost", selection: "skip" },
              { id: "pay", label: "Pay optional cost", selection: "pay" },
            ],
          },
        };
      }
      if (selection !== "pay" && selection !== "skip") {
        throw new Error(`tcg_v0_2_card_cost_plan_optional_selection_invalid:${nodePath}`);
      }
      variables[node.as] = selection === "pay";
      if (selection === "pay") {
        const nested = walkSequence(
          node.costs,
          `${nodePath}/optional`,
          decisions,
          leaves,
          variables,
          variableOwners,
        );
        if (nested.status === "choice_required") return nested;
      }
      continue;
    }

    const selection = decisions.get(nodePath);
    if (selection == null) {
      return {
        status: "choice_required",
        choice: {
          path: nodePath,
          kind: "choice",
          options: node.options.map((_, optionIndex) => ({
            id: `option:${optionIndex}`,
            label: `Cost option ${optionIndex + 1}`,
            selection: optionIndex,
          })),
        },
      };
    }
    if (!Number.isInteger(selection) || Number(selection) < 0 || Number(selection) >= node.options.length) {
      throw new Error(`tcg_v0_2_card_cost_plan_choice_selection_invalid:${nodePath}`);
    }
    const optionIndex = Number(selection);
    const nested = walkSequence(
      node.options[optionIndex],
      `${nodePath}/choice:${optionIndex}`,
      decisions,
      leaves,
      variables,
      variableOwners,
    );
    if (nested.status === "choice_required") return nested;
  }
  return { status: "complete" };
}

/**
 * Pure Payment-owner composition planner for structured card costs.
 *
 * The action owner supplies only modal/optional decisions. This planner never
 * mutates match state, never selects hidden hand cards and never pays a cost.
 * Once composition is fully resolved it returns ordered leaf costs with stable
 * indices; the action owner may collect exact hand-card UIDs, then delegate each
 * leaf mutation to the canonical Payment transaction owner.
 */
export function runtimeV02PlanCardCosts(
  rawCosts: unknown,
  rawDecisions: readonly RuntimeV02CardCostDecision[] = [],
): RuntimeV02CardCostPlanResult {
  const costs = normalizeSequence(rawCosts, "cost");
  const decisions = normalizedDecisions(rawDecisions);
  const leaves: Array<Omit<RuntimeV02PlannedCardCost, "cost_index">> = [];
  const variables: Record<string, boolean> = {};
  const variableOwners = new Map<string, string>();
  const result = walkSequence(costs, "cost", decisions, leaves, variables, variableOwners);
  if (result.status === "choice_required") {
    return { status: result.status, choice: result.choice, variables: { ...variables } };
  }
  return {
    status: "ready",
    costs: leaves.map((cost, cost_index) => ({ ...cost, cost_index } as RuntimeV02PlannedCardCost)),
    variables: { ...variables },
  };
}
