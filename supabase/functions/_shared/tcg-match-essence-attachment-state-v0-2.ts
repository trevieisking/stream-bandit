export type RuntimeV02EffectAttachmentState = {
  kind: "temporary" | "borrowed";
  expires: "controller_aftermath";
  destination_on_expire: "discard";
};

export type RuntimeV02EffectAttachmentTransactionOptions = {
  attachment_kind: "normal" | "temporary" | "borrowed";
  effect_flags?: Record<string, unknown>;
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/**
 * Canonical operation-level attachment-state grammar.
 *
 * This deliberately owns only the temporary/borrowed disposition metadata
 * declared by an effect step. Physical attachment remains owned by the Essence
 * Attachment transaction and Aftermath remains the expiry/movement owner.
 */
export function runtimeV02NormalizeEffectAttachmentState(
  raw: unknown,
): {
  state: RuntimeV02EffectAttachmentState | null;
  transaction: RuntimeV02EffectAttachmentTransactionOptions;
} {
  if (raw == null) {
    return {
      state: null,
      transaction: { attachment_kind: "normal" },
    };
  }
  const state = objectRecord(raw);
  if (!state) {
    throw new Error("tcg_v0_2_effect_attachment_state_invalid");
  }
  const unsupported = Object.keys(state).find((key) =>
    !["kind", "expires", "destination_on_expire"].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_effect_attachment_state_field_unsupported:${unsupported}`,
    );
  }
  const kind = String(state.kind || "");
  const expires = String(state.expires || "");
  const destination = String(state.destination_on_expire || "");
  if (kind !== "temporary" && kind !== "borrowed") {
    throw new Error(
      `tcg_v0_2_effect_attachment_state_kind_unsupported:${kind}`,
    );
  }
  if (expires !== "controller_aftermath") {
    throw new Error(
      `tcg_v0_2_effect_attachment_state_expiry_unsupported:${expires}`,
    );
  }
  if (destination !== "discard") {
    throw new Error(
      `tcg_v0_2_effect_attachment_state_destination_unsupported:${destination}`,
    );
  }
  const normalized: RuntimeV02EffectAttachmentState = {
    kind,
    expires: "controller_aftermath",
    destination_on_expire: "discard",
  };
  return {
    state: normalized,
    transaction: {
      attachment_kind: kind,
      effect_flags: {
        discard_during_target_aftermath: true,
        runtime_v0_2_effect_attachment_state: structuredClone(normalized),
      },
    },
  };
}
