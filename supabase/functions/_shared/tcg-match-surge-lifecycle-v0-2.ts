import { runtimeV02InstallAttackDamageModifier } from "./tcg-match-attack-modifier-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeLifecycleInstance = {
  uid: string;
  card_id: string;
  attached_turn?: number;
  effect_flags?: Record<string, unknown>;
};

export type RuntimeLifecycleCreature = {
  stack?: RuntimeLifecycleInstance[];
  essence?: RuntimeLifecycleInstance[];
  flags?: Record<string, unknown>;
};


function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function structuredProbe(state: Record<string, unknown>): Record<string, unknown> | null {
  const cardIndex = objectRecord(state.card_index);
  if (!cardIndex) return null;
  const first = Object.keys(cardIndex)[0];
  return first ? runtimeV02Definition(state, first) : null;
}

function listenerRequirementsMatch(requirements: unknown, targetElement: string, originZone: string): boolean {
  if (requirements == null) return true;
  const root = objectRecord(requirements);
  if (!root) return false;
  const all = Array.isArray(root.all) ? root.all : [];
  for (const raw of all) {
    const predicate = objectRecord(raw);
    if (!predicate) return false;
    const kind = String(predicate.predicate || "");
    if (kind === "source_is_self") continue;
    if (kind === "event_origin_zone_is") {
      if (String(predicate.zone || "") !== originZone) return false;
      continue;
    }
    if (kind === "target_element_is") {
      if (predicate.target != null && String(predicate.target) !== "$attached_creature") return false;
      if (String(predicate.element || "") !== targetElement) return false;
      continue;
    }
    return false;
  }
  return true;
}

export function applyRuntimeV02AttachmentAttackDamageModifier(
  state: Record<string, unknown>,
  creature: RuntimeLifecycleCreature,
  sourceUidRaw: unknown,
  sourceActionIdRaw: unknown,
  targetUidRaw: unknown,
  amountRaw: unknown,
  turnSeqRaw: unknown,
  durationRaw: unknown,
): number | null {
  const installed = runtimeV02InstallAttackDamageModifier(state, creature, {
    source_uid: sourceUidRaw,
    source_action_id: sourceActionIdRaw,
    target_uid: targetUidRaw,
    amount: amountRaw,
    turn_seq: turnSeqRaw,
    duration: durationRaw,
  });
  return installed?.amount ?? null;
}

/**
 * Registers only the attachment lifecycle state owned by the Essence definition.
 * Triggered `essence_attached` listener steps are deliberately excluded so the
 * generic Runtime Pass E continuation remains their sole semantic owner.
 */
export function registerStructuredRuntimeEssenceAttachmentLifecycleState(
  state: Record<string, unknown>,
  attached: RuntimeLifecycleInstance,
  turnSeq: number,
): boolean | null {
  const definition = runtimeV02Definition(state, attached);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Essence") {
    throw new Error("tcg_v0_2_attachment_definition_not_essence");
  }
  const essence = objectRecord(definition.essence);
  if (!essence) throw new Error("tcg_v0_2_attachment_essence_payload_required");
  const lifecycle = objectRecord(essence.lifecycle);
  const onAttach = objectRecord(lifecycle?.on_attach_set_state);
  if (!onAttach) return false;
  const kind = String(onAttach.kind || "");
  const expires = String(onAttach.expires || "");
  const destination = String(onAttach.destination_on_expire || "");
  if (kind !== "temporary" || expires !== "controller_aftermath" || destination !== "discard") {
    throw new Error("tcg_v0_2_attachment_lifecycle_unsupported");
  }
  attached.effect_flags ||= {};
  attached.effect_flags.runtime_v0_2_attachment_lifecycle = {
    source_uid: attached.uid,
    kind,
    expires,
    destination_on_expire: destination,
    attached_turn: turnSeq,
  };
  return true;
}

export function applyStructuredRuntimeEssenceAttachmentLifecycle(
  state: Record<string, unknown>,
  creature: RuntimeLifecycleCreature,
  attached: RuntimeLifecycleInstance,
  targetElement: string,
  originZone: string,
  turnSeq: number,
): { attack_bonus: number; lifecycle_registered: boolean } | null {
  const definition = runtimeV02Definition(state, attached);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Essence") throw new Error("tcg_v0_2_attachment_definition_not_essence");
  const essence = objectRecord(definition.essence);
  if (!essence) throw new Error("tcg_v0_2_attachment_essence_payload_required");

  const targetUid = creature.stack?.length
    ? String(creature.stack[creature.stack.length - 1]?.uid || "").trim()
    : "";
  if (!targetUid) throw new Error("tcg_v0_2_attachment_listener_target_uid_required");

  let attackBonus = 0;
  const listeners = Array.isArray(essence.listeners) ? essence.listeners : [];
  for (const rawListener of listeners) {
    const listener = objectRecord(rawListener);
    if (!listener || String(listener.event || "") !== "essence_attached") continue;
    if (!listenerRequirementsMatch(listener.requirements, targetElement, originZone)) continue;
    const steps = Array.isArray(listener.steps) ? listener.steps : [];
    for (const rawStep of steps) {
      const step = objectRecord(rawStep);
      if (!step || String(step.op || "") !== "ADD_ATTACK_DAMAGE_MODIFIER") {
        throw new Error("tcg_v0_2_attachment_listener_step_unsupported");
      }
      if (String(step.target || "") !== "$attached_creature") throw new Error("tcg_v0_2_attachment_listener_target_unsupported");
      attackBonus += applyRuntimeV02AttachmentAttackDamageModifier(
        state,
        creature,
        attached.uid,
        String(listener.id || ""),
        targetUid,
        step.amount,
        turnSeq,
        step.duration,
      ) ?? 0;
    }
  }

  const lifecycleRegistered = registerStructuredRuntimeEssenceAttachmentLifecycleState(
    state,
    attached,
    turnSeq,
  ) ?? false;

  return { attack_bonus: attackBonus, lifecycle_registered: lifecycleRegistered };
}

export function structuredRuntimeAttachmentAttackBonus(
  state: Record<string, unknown>,
  creature: RuntimeLifecycleCreature,
  turnSeq: number,
): number | null {
  if (!structuredProbe(state)) return null;
  const raw = creature.flags?.runtime_v0_2_attack_modifiers;
  if (raw == null) return 0;
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_attack_modifiers_invalid");
  let total = 0;
  for (const rawItem of raw) {
    const item = objectRecord(rawItem);
    if (!item) throw new Error("tcg_v0_2_attack_modifier_record_invalid");
    // Canonical Attack #14 records are consumed at legal declaration. This
    // compatibility reader is legacy-only and must never apply them twice.
    if (item.schema === "sb-tcg-attack-damage-modifier-v0.2") continue;
    if (Number(item.turn_seq) !== turnSeq) continue;
    if (!Array.isArray(item.expires_on) || !item.expires_on.includes("end_of_turn")) continue;
    const amount = Number(item.amount);
    if (!Number.isFinite(amount)) throw new Error("tcg_v0_2_attack_modifier_amount_invalid");
    total += amount;
  }
  return total;
}

export function clearStructuredRuntimeAttachmentAttackBonusesAtAftermath(
  state: Record<string, unknown>,
  creature: RuntimeLifecycleCreature,
  turnSeq: number,
): boolean | null {
  if (!structuredProbe(state)) return null;
  const raw = creature.flags?.runtime_v0_2_attack_modifiers;
  if (raw == null) return false;
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_attack_modifiers_invalid");
  let removed = false;
  const kept = raw.filter((rawItem) => {
    const item = objectRecord(rawItem);
    if (!item) throw new Error("tcg_v0_2_attack_modifier_record_invalid");
    // Canonical records expire in Attack #14, not in this compatibility facade.
    if (item.schema === "sb-tcg-attack-damage-modifier-v0.2") return true;
    const shouldRemove = Number(item.turn_seq) === turnSeq &&
      Array.isArray(item.expires_on) && item.expires_on.includes("end_of_turn");
    if (shouldRemove) removed = true;
    return !shouldRemove;
  });
  (creature.flags as Record<string, unknown>).runtime_v0_2_attack_modifiers = kept;
  return removed;
}

export function structuredRuntimeAftermathEssenceDisposition(
  state: Record<string, unknown>,
  instance: RuntimeLifecycleInstance,
  turnSeq: number,
): "discard" | "keep" | null {
  const definition = runtimeV02Definition(state, instance);
  if (!definition) return null;
  const essence = objectRecord(definition.essence);
  if (!essence) return "keep";
  const lifecycle = objectRecord(essence.lifecycle);
  const onAttach = objectRecord(lifecycle?.on_attach_set_state);
  if (!onAttach) return "keep";
  const marker = objectRecord(instance.effect_flags?.runtime_v0_2_attachment_lifecycle);
  if (!marker) throw new Error(`tcg_v0_2_attachment_lifecycle_state_missing:${instance.uid}`);
  if (String(marker.source_uid || "") !== instance.uid) throw new Error(`tcg_v0_2_attachment_lifecycle_source_mismatch:${instance.uid}`);
  if (String(marker.kind || "") !== String(onAttach.kind || "")) throw new Error(`tcg_v0_2_attachment_lifecycle_kind_mismatch:${instance.uid}`);
  if (String(marker.expires || "") !== String(onAttach.expires || "")) throw new Error(`tcg_v0_2_attachment_lifecycle_expiry_mismatch:${instance.uid}`);
  if (String(marker.destination_on_expire || "") !== String(onAttach.destination_on_expire || "")) throw new Error(`tcg_v0_2_attachment_lifecycle_destination_mismatch:${instance.uid}`);
  if (String(marker.expires || "") !== "controller_aftermath") return "keep";
  if (String(marker.destination_on_expire || "") !== "discard") return "keep";
  return Number(marker.attached_turn) === turnSeq ? "discard" : "keep";
}
