export type RuntimeV02PaymentInstance = {
  uid: string;
  [key: string]: unknown;
};

export type RuntimeV02AttachedEssencePaymentPlan<T extends RuntimeV02PaymentInstance> = {
  amount: number;
  essence_uids: string[];
  essence: T[];
};

export type RuntimeV02AttachedEssencePaymentResult<T extends RuntimeV02PaymentInstance> =
  RuntimeV02AttachedEssencePaymentPlan<T>;

function requiredPaymentAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_payment_amount_invalid");
  }
  return value;
}

function normalizedPaymentUids(values: readonly unknown[]): string[] {
  if (!Array.isArray(values)) throw new Error("tcg_v0_2_payment_uids_invalid");
  return values.map((value) => String(value));
}

function instanceUid(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const uid = (value as Record<string, unknown>).uid;
  return typeof uid === "string" && uid.length > 0 ? uid : null;
}

/**
 * Canonical v0.2 owner for exact attached-Essence cost payment.
 *
 * This preflight performs every validation before mutation so orchestrators can
 * prove payment legality alongside other operation-specific preconditions.
 */
export function runtimeV02ValidateAttachedEssencePayment<T extends RuntimeV02PaymentInstance>(
  sourceEssence: T[],
  discard: T[],
  paymentUidsRaw: readonly unknown[],
  requiredAmountRaw: unknown,
): RuntimeV02AttachedEssencePaymentPlan<T> {
  if (!Array.isArray(sourceEssence) || !Array.isArray(discard)) {
    throw new Error("tcg_v0_2_payment_zones_invalid");
  }
  if (sourceEssence === discard) throw new Error("tcg_v0_2_payment_same_zone");

  const amount = requiredPaymentAmount(requiredAmountRaw);
  const essenceUids = normalizedPaymentUids(paymentUidsRaw);
  if (essenceUids.length !== amount || new Set(essenceUids).size !== amount) {
    throw new Error("tcg_v0_2_payment_exact_amount_required");
  }

  const selected: T[] = [];
  for (const uid of essenceUids) {
    const sourceMatches = sourceEssence.filter((entry) => instanceUid(entry) === uid);
    if (sourceMatches.length === 0) throw new Error(`tcg_v0_2_payment_source_missing:${uid}`);
    if (sourceMatches.length !== 1) throw new Error(`tcg_v0_2_payment_source_duplicate:${uid}`);
    if (discard.some((entry) => instanceUid(entry) === uid)) {
      throw new Error(`tcg_v0_2_payment_destination_duplicate:${uid}`);
    }
    selected.push(sourceMatches[0]);
  }

  return {
    amount,
    essence_uids: [...essenceUids],
    essence: selected,
  };
}

/**
 * Atomically consumes the exact selected attached Essence into discard.
 * All validation completes before the first source/destination mutation.
 */
export function runtimeV02ApplyAttachedEssencePayment<T extends RuntimeV02PaymentInstance>(
  sourceEssence: T[],
  discard: T[],
  paymentUidsRaw: readonly unknown[],
  requiredAmountRaw: unknown,
): RuntimeV02AttachedEssencePaymentResult<T> {
  const plan = runtimeV02ValidateAttachedEssencePayment(
    sourceEssence,
    discard,
    paymentUidsRaw,
    requiredAmountRaw,
  );

  const paid: T[] = [];
  for (const uid of plan.essence_uids) {
    const index = sourceEssence.findIndex((entry) => instanceUid(entry) === uid);
    if (index < 0) throw new Error(`tcg_v0_2_payment_source_changed:${uid}`);
    const [essence] = sourceEssence.splice(index, 1);
    discard.push(essence);
    paid.push(essence);
  }

  return {
    amount: plan.amount,
    essence_uids: [...plan.essence_uids],
    essence: paid,
  };
}
