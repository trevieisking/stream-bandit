import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import { runtimeV02CardMatchesSelectionFilters } from "./tcg-match-card-selection-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import type { RuntimeV02CardCostState } from "./tcg-match-payment-cost-v0-2.ts";
import {
  runtimeV02ApplyCardCostSequence,
  type RuntimeV02CardCostSequenceOperation,
  type RuntimeV02CardCostSequenceResult,
} from "./tcg-match-payment-sequence-v0-2.ts";
import type {
  RuntimeV02CardCostChoiceBinding,
  RuntimeV02ResolvedCardCost,
} from "./tcg-match-card-cost-choice-v0-2.ts";

export type RuntimeV02CardCostSourceLocation = {
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02ResolvedCardCostPaymentResult<T extends RuntimeV02CardZoneInstance> = {
  operations: RuntimeV02CardCostSequenceOperation<T>[];
  payments: RuntimeV02CardCostSequenceResult<T>[];
};

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
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

function normalizedLocation(raw: RuntimeV02CardCostSourceLocation): RuntimeV02CardCostSourceLocation {
  if (!raw || typeof raw !== "object") throw new Error("tcg_v0_2_card_cost_route_source_location_required");
  if (raw.where === "vanguard") {
    if (raw.index !== null) throw new Error("tcg_v0_2_card_cost_route_vanguard_index_invalid");
    return { where: raw.where, index: null };
  }
  if (raw.where === "reserve") {
    const index = nonNegativeInteger(raw.index, "tcg_v0_2_card_cost_route_reserve_index_invalid");
    if (index > 3) throw new Error("tcg_v0_2_card_cost_route_reserve_index_invalid");
    return { where: raw.where, index };
  }
  throw new Error("tcg_v0_2_card_cost_route_source_location_invalid");
}

function currentSource<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  binding: RuntimeV02CardCostChoiceBinding,
  rawLocation: RuntimeV02CardCostSourceLocation,
) {
  if (binding.action_kind !== "attack" && binding.action_kind !== "ability") {
    throw new Error("tcg_v0_2_card_cost_route_action_kind_unsupported");
  }
  const sourceCreatureUid = requiredString(
    binding.source_creature_uid,
    "tcg_v0_2_card_cost_route_source_creature_uid_required",
  );
  const location = normalizedLocation(rawLocation);
  const player = state.players?.[String(binding.controller_seat)];
  if (!player || !Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_card_cost_route_source_player_invalid");
  }
  const creature = location.where === "vanguard"
    ? player.vanguard
    : player.reserve[Number(location.index)];
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_card_cost_route_source_creature_missing");
  }
  const top = creature.stack[creature.stack.length - 1];
  const topUid = requiredString(top?.uid, "tcg_v0_2_card_cost_route_source_uid_invalid");
  const topCardId = requiredString(top?.card_id, "tcg_v0_2_card_cost_route_source_card_id_invalid");
  if (
    topUid !== requiredString(binding.source_card_uid, "tcg_v0_2_card_cost_route_binding_uid_required") ||
    topCardId !== requiredString(binding.source_card_id, "tcg_v0_2_card_cost_route_binding_card_id_required") ||
    sourceCreatureUid !== topUid
  ) {
    throw new Error("tcg_v0_2_card_cost_route_source_identity_changed");
  }
  return {
    location,
    target: {
      controller_seat: binding.controller_seat,
      where: location.where,
      index: location.index,
      anchor_uid: topUid,
      card_id: topCardId,
    },
  };
}

export function runtimeV02BuildResolvedCardCostOperations<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  binding: RuntimeV02CardCostChoiceBinding,
  sourceLocation: RuntimeV02CardCostSourceLocation,
  rawCosts: readonly RuntimeV02ResolvedCardCost[],
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02CardCostSequenceOperation<T>[] {
  if (!Array.isArray(rawCosts)) throw new Error("tcg_v0_2_card_cost_route_costs_invalid");
  if (typeof defeatDescribe !== "function") throw new Error("tcg_v0_2_card_cost_route_defeat_describe_required");
  const source = currentSource(state, binding, sourceLocation);

  return rawCosts.map((cost, index) => {
    if (!cost || typeof cost !== "object") {
      throw new Error(`tcg_v0_2_card_cost_route_cost_invalid:${index}`);
    }
    const costIndex = nonNegativeInteger(
      cost.cost_index,
      `tcg_v0_2_card_cost_route_cost_index_invalid:${index}`,
    );
    if (costIndex !== index) {
      throw new Error(`tcg_v0_2_card_cost_route_cost_index_noncanonical:${index}:${costIndex}`);
    }

    if (cost.kind === "damage") {
      if (cost.target !== "$source_creature") {
        throw new Error(`tcg_v0_2_card_cost_route_damage_target_unsupported:${costIndex}`);
      }
      return {
        kind: "damage",
        cost_index: costIndex,
        target: { ...source.target },
        amount: positiveAmount(cost.amount, `tcg_v0_2_card_cost_route_damage_amount_invalid:${costIndex}`),
        defeat_describe: defeatDescribe,
      };
    }

    if (cost.kind === "hand_discard") {
      if (cost.player !== "self") {
        throw new Error(`tcg_v0_2_card_cost_route_discard_player_unsupported:${costIndex}`);
      }
      const filters = cost.filters && typeof cost.filters === "object" && !Array.isArray(cost.filters)
        ? cost.filters as Record<string, unknown>
        : {};
      if (cost.filters != null && (typeof cost.filters !== "object" || Array.isArray(cost.filters))) {
        throw new Error(`tcg_v0_2_card_cost_route_discard_filters_invalid:${costIndex}`);
      }
      const count = positiveInteger(
        cost.count,
        `tcg_v0_2_card_cost_route_discard_count_invalid:${costIndex}`,
      );
      if (!Array.isArray(cost.card_uids) || cost.card_uids.length !== count) {
        throw new Error(`tcg_v0_2_card_cost_route_discard_exact_count_required:${costIndex}`);
      }
      const cardUids = (cost.card_uids as readonly unknown[]).map((value: unknown, cardIndex: number) =>
        requiredString(value, `tcg_v0_2_card_cost_route_discard_uid_invalid:${costIndex}:${cardIndex}`)
      );
      if (new Set(cardUids).size !== cardUids.length) {
        throw new Error(`tcg_v0_2_card_cost_route_discard_uid_duplicate:${costIndex}`);
      }
      if (Object.keys(filters).length > 0) {
        const player = state.players?.[String(binding.controller_seat)];
        if (!player || !Array.isArray(player.hand)) {
          throw new Error(`tcg_v0_2_card_cost_route_discard_hand_invalid:${costIndex}`);
        }
        for (const uid of cardUids) {
          const matches = player.hand.filter((entry) => entry && entry.uid === uid);
          if (matches.length !== 1) {
            throw new Error(`tcg_v0_2_card_cost_route_discard_filter_card_missing:${costIndex}:${uid}`);
          }
          if (!runtimeV02CardMatchesSelectionFilters(state, matches[0], filters)) {
            throw new Error(`tcg_v0_2_card_cost_route_discard_filter_changed:${costIndex}:${uid}`);
          }
        }
      }
      return {
        kind: "hand_discard",
        cost_index: costIndex,
        expected_count: count,
        card_uids: cardUids,
      };
    }

    throw new Error(`tcg_v0_2_card_cost_route_kind_unsupported:${index}`);
  });
}

/**
 * Payment-owner route from a fully resolved private card-cost choice into the
 * canonical atomic Payment sequence. It supports only the current Ability/Attack
 * release scope: damage to $source_creature and exact self hand-discard costs.
 * Unsupported selectors fail closed instead of introducing a second targeting owner.
 */
export function runtimeV02ApplyResolvedCardCostRoute<T extends RuntimeV02CardZoneInstance>(
  state: RuntimeV02CardCostState<T>,
  binding: RuntimeV02CardCostChoiceBinding,
  sourceLocation: RuntimeV02CardCostSourceLocation,
  costs: readonly RuntimeV02ResolvedCardCost[],
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ResolvedCardCostPaymentResult<T> {
  const operations = runtimeV02BuildResolvedCardCostOperations(
    state,
    binding,
    sourceLocation,
    costs,
    defeatDescribe,
  );
  const payments = runtimeV02ApplyCardCostSequence(
    state,
    {
      controller_seat: binding.controller_seat,
      action_kind: binding.action_kind,
      source_action_id: binding.source_action_id,
      source_card_uid: binding.source_card_uid,
      source_card_id: binding.source_card_id,
      source_creature_uid: binding.source_creature_uid,
    },
    operations,
  );
  return { operations, payments };
}
