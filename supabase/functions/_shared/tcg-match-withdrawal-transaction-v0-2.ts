import {
  runtimeV02ApplyAttachedEssencePayment,
  runtimeV02ValidateAttachedEssencePayment,
  type RuntimeV02AttachedEssencePaymentResult,
  type RuntimeV02PaymentInstance,
} from "./tcg-match-payment-v0-2.ts";
import {
  runtimeV02ApplyAtomicSwitch,
  runtimeV02PreflightAtomicSwitch,
  type RuntimeV02AtomicSwitchPreflight,
  type RuntimeV02AtomicSwitchResult,
} from "./tcg-match-switch-context-v0-2.ts";

export type RuntimeV02WithdrawalTransactionResult<T extends RuntimeV02PaymentInstance> = {
  payment: RuntimeV02AttachedEssencePaymentResult<T>;
  switch_preflight: RuntimeV02AtomicSwitchPreflight;
  switched: RuntimeV02AtomicSwitchResult;
};

const WITHDRAWAL_SWITCH_INPUT = {
  action_kind: "voluntary_withdrawal" as const,
  source_action_id: "withdraw",
  source_card_uid: null,
};

/**
 * Thin Withdrawal orchestration submodule.
 *
 * This is not another Payment, Cost or Switch owner. It exists only to enforce
 * the transaction order required by voluntary Withdrawal:
 *   1. prove the requested Atomic Switch can complete;
 *   2. prove the exact attached-Essence payment can complete;
 *   3. commit payment through Payment Engine;
 *   4. commit the battlefield swap through Atomic Switch.
 *
 * No state is mutated until both canonical owner preflights have succeeded.
 */
export function runtimeV02ApplyWithdrawalPaymentAndSwitch<T extends RuntimeV02PaymentInstance>(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  reserveIndex: number,
  sourceEssence: T[],
  discard: T[],
  paymentUids: readonly unknown[],
  requiredAmount: number,
): RuntimeV02WithdrawalTransactionResult<T> {
  const switchPreflight = runtimeV02PreflightAtomicSwitch(
    state,
    controllerSeat,
    reserveIndex,
    WITHDRAWAL_SWITCH_INPUT,
  );

  runtimeV02ValidateAttachedEssencePayment(
    sourceEssence,
    discard,
    paymentUids,
    requiredAmount,
  );

  const payment = runtimeV02ApplyAttachedEssencePayment(
    sourceEssence,
    discard,
    paymentUids,
    requiredAmount,
  );

  const switched = runtimeV02ApplyAtomicSwitch(
    state,
    controllerSeat,
    reserveIndex,
    WITHDRAWAL_SWITCH_INPUT,
  );

  return {
    payment,
    switch_preflight: switchPreflight,
    switched,
  };
}
