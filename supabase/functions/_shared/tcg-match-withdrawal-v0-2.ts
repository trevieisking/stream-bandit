import {
  applyRuntimeContinuousNumericModifiers,
  runtimeConditions,
  runtimeContinuousBlocksSource,
  type RuntimeCardInstance,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import {
  runtimeV02ConsumeWithdrawalModifiers,
  runtimeV02ResolveWithdrawalModifierCost,
} from "./tcg-match-withdrawal-modifier-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeWithdrawalCreature = {
  essence?: RuntimeCardInstance[];
};

function withdrawalWhenMatches(when: unknown, targetElement: string): boolean {
  if (when == null) return true;
  if (!when || typeof when !== "object" || Array.isArray(when)) return false;
  const predicate = when as Record<string, unknown>;
  if (String(predicate.predicate || "") !== "target_element_is") return false;
  if (predicate.target != null && String(predicate.target) !== "$attached_creature") return false;
  return String(predicate.element || "") === targetElement;
}

export function structuredRuntimeWithdrawalBaseCost(
  state: Record<string, unknown>,
  creature: RuntimeWithdrawalCreature,
  baseValue: number,
  targetElement: string,
  crushed: boolean,
): number | null {
  const attachments = Array.isArray(creature.essence) ? creature.essence : [];
  const probe = attachments[0];
  const structuredProbe = probe ? runtimeV02Definition(state, probe) : (() => {
    const cardIndex = state.card_index;
    if (!cardIndex || typeof cardIndex !== "object" || Array.isArray(cardIndex)) return null;
    const first = Object.keys(cardIndex as Record<string, unknown>)[0];
    return first ? runtimeV02Definition(state, first) : null;
  })();
  if (!structuredProbe) return null;

  const definitionLookup = (instance: RuntimeCardInstance) => runtimeV02Definition(state, instance);
  const context = {
    action_kind: "voluntary_withdrawal",
    target_element: targetElement,
    evaluate_when: (when: unknown) => withdrawalWhenMatches(when, targetElement),
  };

  let value = applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "withdrawal",
    context,
    0,
  );

  if (crushed) {
    const blocked = runtimeContinuousBlocksSource(
      attachments,
      definitionLookup,
      "withdrawal_increase_immunity",
      "opponent_condition",
      context,
    );
    if (!blocked) value += 1;
  }

  return Math.max(0, value);
}


export type RuntimeV02VoluntaryWithdrawalCostListenerResolver = (
  state: Record<string, unknown>,
  input: {
    controller_seat: 1 | 2;
    source_creature_uid: string;
    base_cost: number;
    action_id?: string;
  },
) => { cost: number } | null;

export type RuntimeV02VoluntaryWithdrawalQuoteInput = {
  controller_seat: 1 | 2;
  reserve_index?: number | null;
  incoming_target_uid?: string | null;
  require_target?: boolean;
  consume_cost_listeners?: boolean;
  action_id?: string;
  resolve_cost_listeners: RuntimeV02VoluntaryWithdrawalCostListenerResolver;
};

export type RuntimeV02VoluntaryWithdrawalQuote = {
  ok: boolean;
  error: string | null;
  cost: number | null;
  legal_targets: Array<{ reserve_index: number; anchor_uid: string }>;
  payment_options: Array<{ uid: string; card_id: string; label: string }>;
  reserve_index: number | null;
};

type RuntimeV02WithdrawalQuoteCreature = RuntimeWithdrawalCreature & {
  stack?: RuntimeCardInstance[];
  flags?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  condition?: string | null;
};

function quoteObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function quoteTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_withdrawal_quote_turn_invalid");
  }
  return value;
}

function quotePlayer(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Record<string, unknown> {
  const value = quoteObject(quoteObject(state.players)?.[String(seat)]);
  if (!value || !Array.isArray(value.reserve)) {
    throw new Error("tcg_v0_2_withdrawal_quote_player_invalid");
  }
  return value;
}

function quoteCreature(raw: unknown): RuntimeV02WithdrawalQuoteCreature | null {
  const value = quoteObject(raw) as RuntimeV02WithdrawalQuoteCreature | null;
  if (!value || !Array.isArray(value.stack) || value.stack.length === 0 ||
    !Array.isArray(value.essence)) return null;
  const top = value.stack[value.stack.length - 1];
  if (!top?.uid || !top.card_id) return null;
  return value;
}

function quoteTop(
  creature: RuntimeV02WithdrawalQuoteCreature,
): RuntimeCardInstance {
  const stack = creature.stack as RuntimeCardInstance[];
  const top = stack[stack.length - 1];
  if (!top?.uid || !top.card_id) {
    throw new Error("tcg_v0_2_withdrawal_quote_top_invalid");
  }
  return top;
}

function quotePrintedWithdrawal(definition: Record<string, unknown>): number {
  const creature = quoteObject(definition.creature);
  const value = Number(
    creature?.withdrawal ?? definition.withdrawal ?? definition.withdraw ?? 0,
  );
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_withdrawal_quote_printed_cost_invalid");
  }
  return value;
}

function quoteFailure(
  error: string,
  cost: number | null = null,
  legalTargets: Array<{ reserve_index: number; anchor_uid: string }> = [],
  paymentOptions: Array<{ uid: string; card_id: string; label: string }> = [],
): RuntimeV02VoluntaryWithdrawalQuote {
  return {
    ok: false,
    error,
    cost,
    legal_targets: legalTargets,
    payment_options: paymentOptions,
    reserve_index: null,
  };
}

/**
 * Canonical structured quote for every voluntary Withdrawal declaration.
 *
 * This is the single legality/cost quote used by the normal Match action and
 * effect-driven voluntary Withdrawal. It delegates mutation ownership:
 * continuous/base cost -> Withdrawal Engine, lifecycle modifiers -> Withdrawal
 * Modifier owner, synchronous cost listeners -> injected Event Listener owner,
 * payment -> Payment owner, battlefield swap -> Atomic Switch owner.
 */
export function runtimeV02QuoteVoluntaryWithdrawal(
  state: Record<string, unknown>,
  input: RuntimeV02VoluntaryWithdrawalQuoteInput,
): RuntimeV02VoluntaryWithdrawalQuote {
  if (!input || typeof input !== "object") {
    throw new Error("tcg_v0_2_withdrawal_quote_input_required");
  }
  const seat = input.controller_seat;
  if (seat !== 1 && seat !== 2) {
    throw new Error("tcg_v0_2_withdrawal_quote_controller_invalid");
  }
  if (typeof input.resolve_cost_listeners !== "function") {
    throw new Error("tcg_v0_2_withdrawal_quote_cost_listener_owner_required");
  }
  if (Number(state.active_seat) !== seat) {
    return quoteFailure("not_active_player");
  }

  const turn = quoteTurn(state);
  const owner = quotePlayer(state, seat);
  const turnFlags = quoteObject(quoteObject(state.turn_flags)?.[String(seat)]);
  if (Number(turnFlags?.withdraw_turn ?? -1) === turn) {
    return quoteFailure("withdrawal_already_used_this_turn");
  }

  const vanguard = quoteCreature(owner.vanguard);
  if (!vanguard) return quoteFailure("vanguard_required");
  const conditions = runtimeConditions(vanguard as any);
  if (conditions.control === "Stunned" || conditions.control === "Rooted") {
    return quoteFailure("condition_prevents_withdrawal");
  }

  const reserve = owner.reserve as unknown[];
  const legalTargets: Array<{ reserve_index: number; anchor_uid: string }> = [];
  for (let index = 0; index < 4; index++) {
    const target = quoteCreature(reserve[index]);
    if (!target) continue;
    const top = quoteTop(target);
    legalTargets.push({ reserve_index: index, anchor_uid: String(top.uid) });
  }
  if (!legalTargets.length) return quoteFailure("legal_reserve_required");

  const source = quoteTop(vanguard);
  const definition = runtimeV02Definition(state, source);
  if (!definition) {
    throw new Error("tcg_v0_2_withdrawal_quote_vanguard_definition_missing");
  }
  const element = String(definition.element || "").trim();

  const printed = quotePrintedWithdrawal(definition);
  let cost = structuredRuntimeWithdrawalBaseCost(
    state,
    vanguard,
    printed,
    element,
    conditions.modifier === "Crushed",
  );
  if (cost == null) {
    throw new Error("tcg_v0_2_withdrawal_quote_structured_cost_required");
  }

  const flags = quoteObject(vanguard.flags) || {};
  if (Number.isFinite(Number(flags.withdrawal_cost_override))) {
    cost = Math.max(0, Number(flags.withdrawal_cost_override));
  }
  const lifecycle = quoteObject(flags.lifecycle_withdrawal_cost);
  if (
    lifecycle && Number(lifecycle.turn_seq) === turn &&
    Number.isFinite(Number(lifecycle.value))
  ) {
    cost = Math.max(0, Number(lifecycle.value));
  }

  let modifierIds: string[] = [];
  if (flags.runtime_v0_2_withdrawal_modifier_state != null) {
    const resolved = runtimeV02ResolveWithdrawalModifierCost(
      state,
      vanguard as any,
      seat,
      element,
      cost,
    );
    cost = resolved.cost;
    modifierIds = [...resolved.consumable_modifier_ids];
  }

  const consume = input.consume_cost_listeners === true;
  const listenerState = consume ? state : structuredClone(state);
  const listener = input.resolve_cost_listeners(listenerState, {
    controller_seat: seat,
    source_creature_uid: String(source.uid),
    base_cost: cost,
    action_id: input.action_id == null ? "withdraw" : String(input.action_id),
  });
  if (listener) {
    const next = Number(listener.cost);
    if (!Number.isInteger(next) || next < 0) {
      throw new Error("tcg_v0_2_withdrawal_quote_listener_cost_invalid");
    }
    cost = next;
  }

  const paymentOptions = (vanguard.essence || []).map((entry) => {
    const uid = String(entry.uid || "").trim();
    const cardId = String(entry.card_id || "").trim();
    if (!uid || !cardId) {
      throw new Error("tcg_v0_2_withdrawal_quote_payment_instance_invalid");
    }
    const card = runtimeV02Definition(state, entry);
    return {
      uid,
      card_id: cardId,
      label: String(card?.name || cardId),
    };
  });

  if (cost > paymentOptions.length) {
    return quoteFailure(
      "exact_withdrawal_essence_payment_required",
      cost,
      legalTargets,
      paymentOptions,
    );
  }

  let reserveIndex: number | null = null;
  if (input.require_target === true || input.reserve_index != null ||
    input.incoming_target_uid != null) {
    const index = Number(input.reserve_index);
    const target = legalTargets.find((item) => item.reserve_index === index);
    if (!Number.isInteger(index) || !target) {
      return quoteFailure(
        "legal_reserve_required",
        cost,
        legalTargets,
        paymentOptions,
      );
    }
    const expected = input.incoming_target_uid == null
      ? null
      : String(input.incoming_target_uid).trim();
    if (expected && target.anchor_uid !== expected) {
      return quoteFailure(
        "legal_reserve_required",
        cost,
        legalTargets,
        paymentOptions,
      );
    }
    reserveIndex = index;
  }

  if (consume && modifierIds.length) {
    runtimeV02ConsumeWithdrawalModifiers(
      vanguard as any,
      modifierIds,
      "legal_voluntary_withdrawal_declared",
    );
  }

  return {
    ok: true,
    error: null,
    cost,
    legal_targets: legalTargets,
    payment_options: paymentOptions,
    reserve_index: reserveIndex,
  };
}
