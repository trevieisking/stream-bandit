import { assertRuntimeV02MatchSnapshot } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02AttackModifierCreature = {
  flags?: Record<string, unknown>;
};

export type RuntimeV02AttackModifierDuration = {
  expires_on: string[];
  max_uses: number | null;
  consume_on: "legal_attack_declared" | null;
};

export type RuntimeV02AttackModifierOnConsume = {
  bind_to_consuming_action: true;
  timing: "after_attack_effects_before_defeat_scan";
  steps: Record<string, unknown>[];
};

export type RuntimeV02AttackDamageModifier = {
  schema: "sb-tcg-attack-damage-modifier-v0.2";
  id: string;
  source_uid: string;
  source_action_id: string;
  target_uid: string;
  creation_seq: number;
  amount: number;
  turn_seq: number;
  expires_on: string[];
  max_uses: number | null;
  remaining_uses: number | null;
  consume_on: "legal_attack_declared" | null;
  on_consume: RuntimeV02AttackModifierOnConsume | null;
};

export type RuntimeV02AttackDamageModifierRequest = {
  source_uid: unknown;
  source_action_id: unknown;
  target_uid: unknown;
  amount: unknown;
  turn_seq: unknown;
  duration: unknown;
  on_consume?: unknown;
};

export type RuntimeV02AttackModifierApplication = {
  modifier_id: string;
  source_uid: string;
  source_action_id: string;
  amount: number;
  creation_seq: number;
  consumed_use: boolean;
  remaining_uses: number | null;
};

export type RuntimeV02BoundAttackModifierRider = {
  schema: "sb-tcg-bound-attack-modifier-rider-v0.2";
  id: string;
  modifier_id: string;
  source_uid: string;
  source_action_id: string;
  modifier_target_uid: string;
  consuming_action_id: string;
  turn_seq: number;
  timing: "after_attack_effects_before_defeat_scan";
  steps: Record<string, unknown>[];
};

export type RuntimeV02AttackModifierConsumption = {
  schema: "sb-tcg-attack-modifier-consumption-v0.2";
  consuming_action_id: string;
  target_uid: string;
  turn_seq: number;
  base_damage: number;
  bonus_damage: number;
  damage: number;
  applied_modifiers: RuntimeV02AttackModifierApplication[];
  bound_riders: RuntimeV02BoundAttackModifierRider[];
};

export type RuntimeV02AttackModifierExpiry = {
  removed_modifier_ids: string[];
  removed_count: number;
};

const MODIFIERS_KEY = "runtime_v0_2_attack_modifiers";
const SEQUENCE_KEY = "runtime_v0_2_attack_modifier_sequence";

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

function nonNegativeDamage(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function cloneSteps(steps: Record<string, unknown>[]): Record<string, unknown>[] {
  return structuredClone(steps);
}

function normalizeDuration(raw: unknown): RuntimeV02AttackModifierDuration {
  const duration = objectRecord(raw);
  if (!duration) throw new Error("tcg_v0_2_attack_modifier_duration_required");
  if (!Array.isArray(duration.expires_on) || duration.expires_on.length < 1) {
    throw new Error("tcg_v0_2_attack_modifier_expiry_required");
  }
  const expiresOn = duration.expires_on.map((value, index) =>
    requiredString(value, `tcg_v0_2_attack_modifier_expiry_invalid:${index}`)
  );
  if (new Set(expiresOn).size !== expiresOn.length) {
    throw new Error("tcg_v0_2_attack_modifier_expiry_duplicate");
  }
  if (!expiresOn.includes("end_of_turn")) {
    throw new Error("tcg_v0_2_attack_modifier_end_of_turn_expiry_required");
  }
  if (!Object.hasOwn(duration, "max_uses")) {
    throw new Error("tcg_v0_2_attack_modifier_max_uses_required");
  }
  const maxUses = duration.max_uses == null
    ? null
    : positiveInteger(duration.max_uses, "tcg_v0_2_attack_modifier_max_uses_invalid");
  const consumeOn = duration.consume_on == null
    ? null
    : requiredString(duration.consume_on, "tcg_v0_2_attack_modifier_consume_on_invalid");
  if (consumeOn !== null && consumeOn !== "legal_attack_declared") {
    throw new Error(`tcg_v0_2_attack_modifier_consume_on_unsupported:${consumeOn}`);
  }
  if (maxUses !== null && consumeOn !== "legal_attack_declared") {
    throw new Error("tcg_v0_2_attack_modifier_finite_consume_on_required");
  }
  if (maxUses === null && consumeOn !== null) {
    throw new Error("tcg_v0_2_attack_modifier_unlimited_consume_on_forbidden");
  }
  return { expires_on: expiresOn, max_uses: maxUses, consume_on: consumeOn };
}

function normalizeOnConsume(
  raw: unknown,
  duration: RuntimeV02AttackModifierDuration,
): RuntimeV02AttackModifierOnConsume | null {
  if (raw == null) return null;
  const rider = objectRecord(raw);
  if (!rider) throw new Error("tcg_v0_2_attack_modifier_on_consume_invalid");
  if (rider.bind_to_consuming_action !== true) {
    throw new Error("tcg_v0_2_attack_modifier_rider_action_binding_required");
  }
  if (String(rider.timing || "") !== "after_attack_effects_before_defeat_scan") {
    throw new Error("tcg_v0_2_attack_modifier_rider_timing_unsupported");
  }
  if (!Array.isArray(rider.steps) || rider.steps.length < 1) {
    throw new Error("tcg_v0_2_attack_modifier_rider_steps_required");
  }
  const steps = rider.steps.map((value, index) => {
    const step = objectRecord(value);
    if (!step) throw new Error(`tcg_v0_2_attack_modifier_rider_step_invalid:${index}`);
    return structuredClone(step);
  });
  if (duration.max_uses !== 1 || duration.consume_on !== "legal_attack_declared") {
    throw new Error("tcg_v0_2_attack_modifier_rider_requires_next_attack");
  }
  return {
    bind_to_consuming_action: true,
    timing: "after_attack_effects_before_defeat_scan",
    steps,
  };
}

function readSequence(state: Record<string, unknown>): number {
  if (state[SEQUENCE_KEY] == null) return 0;
  return nonNegativeInteger(
    state[SEQUENCE_KEY],
    "tcg_v0_2_attack_modifier_sequence_invalid",
  );
}

function modifierArray(
  creature: RuntimeV02AttackModifierCreature,
  create: boolean,
): unknown[] {
  const flags = objectRecord(creature.flags);
  const current = flags?.[MODIFIERS_KEY];
  if (current == null) {
    if (!create) return [];
    creature.flags ||= {};
    const fresh: RuntimeV02AttackDamageModifier[] = [];
    (creature.flags as Record<string, unknown>)[MODIFIERS_KEY] = fresh;
    return fresh;
  }
  if (!Array.isArray(current)) throw new Error("tcg_v0_2_attack_modifiers_invalid");
  return current;
}

function normalizeStoredModifier(raw: unknown, index: number): RuntimeV02AttackDamageModifier {
  const modifier = objectRecord(raw);
  if (!modifier) throw new Error(`tcg_v0_2_attack_modifier_record_invalid:${index}`);
  if (modifier.schema !== "sb-tcg-attack-damage-modifier-v0.2") {
    throw new Error(`tcg_v0_2_attack_modifier_schema_invalid:${index}`);
  }
  const duration = normalizeDuration({
    expires_on: modifier.expires_on,
    max_uses: modifier.max_uses,
    consume_on: modifier.consume_on,
  });
  const remainingUses = modifier.remaining_uses == null
    ? null
    : positiveInteger(
      modifier.remaining_uses,
      `tcg_v0_2_attack_modifier_remaining_uses_invalid:${index}`,
    );
  if (
    (duration.max_uses == null && remainingUses !== null) ||
    (duration.max_uses != null && (remainingUses == null || remainingUses > duration.max_uses))
  ) {
    throw new Error(`tcg_v0_2_attack_modifier_remaining_uses_mismatch:${index}`);
  }
  const onConsume = normalizeOnConsume(modifier.on_consume, duration);
  return {
    schema: "sb-tcg-attack-damage-modifier-v0.2",
    id: requiredString(modifier.id, `tcg_v0_2_attack_modifier_id_invalid:${index}`),
    source_uid: requiredString(
      modifier.source_uid,
      `tcg_v0_2_attack_modifier_source_uid_invalid:${index}`,
    ),
    source_action_id: requiredString(
      modifier.source_action_id,
      `tcg_v0_2_attack_modifier_source_action_id_invalid:${index}`,
    ),
    target_uid: requiredString(
      modifier.target_uid,
      `tcg_v0_2_attack_modifier_target_uid_invalid:${index}`,
    ),
    creation_seq: positiveInteger(
      modifier.creation_seq,
      `tcg_v0_2_attack_modifier_creation_seq_invalid:${index}`,
    ),
    amount: nonNegativeDamage(
      modifier.amount,
      `tcg_v0_2_attack_modifier_amount_invalid:${index}`,
    ),
    turn_seq: nonNegativeInteger(
      modifier.turn_seq,
      `tcg_v0_2_attack_modifier_turn_seq_invalid:${index}`,
    ),
    expires_on: duration.expires_on,
    max_uses: duration.max_uses,
    remaining_uses: remainingUses,
    consume_on: duration.consume_on,
    on_consume: onConsume,
  };
}

function normalizedModifiers(
  creature: RuntimeV02AttackModifierCreature,
): RuntimeV02AttackDamageModifier[] {
  const records = modifierArray(creature, false).map(normalizeStoredModifier);
  const ids = records.map((record) => record.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("tcg_v0_2_attack_modifier_id_duplicate");
  }
  const sequences = records.map((record) => record.creation_seq);
  if (new Set(sequences).size !== sequences.length) {
    throw new Error("tcg_v0_2_attack_modifier_creation_seq_duplicate");
  }
  return records;
}

function sameInstall(
  existing: RuntimeV02AttackDamageModifier,
  amount: number,
  duration: RuntimeV02AttackModifierDuration,
  onConsume: RuntimeV02AttackModifierOnConsume | null,
): boolean {
  return existing.amount === amount &&
    JSON.stringify(existing.expires_on) === JSON.stringify(duration.expires_on) &&
    existing.max_uses === duration.max_uses &&
    existing.consume_on === duration.consume_on &&
    JSON.stringify(existing.on_consume) === JSON.stringify(onConsume);
}

/**
 * Canonical Attack #14 temporary attack-damage modifier installer.
 *
 * The producer owns trigger/choice semantics. Attack owns the stored modifier,
 * deterministic source/action identity, use count, declaration consumption and
 * expiry. Replaying the same producer action cannot duplicate or reset a use.
 */
export function runtimeV02InstallAttackDamageModifier(
  state: Record<string, unknown>,
  creature: RuntimeV02AttackModifierCreature,
  request: RuntimeV02AttackDamageModifierRequest,
): RuntimeV02AttackDamageModifier | null {
  if (!assertRuntimeV02MatchSnapshot(state)) return null;
  if (!creature || typeof creature !== "object") {
    throw new Error("tcg_v0_2_attack_modifier_creature_required");
  }
  const sourceUid = requiredString(
    request.source_uid,
    "tcg_v0_2_attack_modifier_source_uid_required",
  );
  const sourceActionId = requiredString(
    request.source_action_id,
    "tcg_v0_2_attack_modifier_source_action_id_required",
  );
  const targetUid = requiredString(
    request.target_uid,
    "tcg_v0_2_attack_modifier_target_uid_required",
  );
  const amount = nonNegativeDamage(
    request.amount,
    "tcg_v0_2_attack_modifier_amount_invalid",
  );
  const turnSeq = nonNegativeInteger(
    request.turn_seq,
    "tcg_v0_2_attack_modifier_turn_seq_invalid",
  );
  const duration = normalizeDuration(request.duration);
  const onConsume = normalizeOnConsume(request.on_consume, duration);
  const existing = normalizedModifiers(creature);
  const prior = existing.find((record) =>
    record.source_uid === sourceUid &&
    record.source_action_id === sourceActionId &&
    record.target_uid === targetUid &&
    record.turn_seq === turnSeq
  );
  if (prior) {
    if (!sameInstall(prior, amount, duration, onConsume)) {
      throw new Error("tcg_v0_2_attack_modifier_replay_conflict");
    }
    return structuredClone(prior);
  }

  const creationSeq = Math.max(
    readSequence(state),
    ...existing.map((record) => record.creation_seq),
  ) + 1;
  const record: RuntimeV02AttackDamageModifier = {
    schema: "sb-tcg-attack-damage-modifier-v0.2",
    id: `attack-modifier:${turnSeq}:${creationSeq}`,
    source_uid: sourceUid,
    source_action_id: sourceActionId,
    target_uid: targetUid,
    creation_seq: creationSeq,
    amount,
    turn_seq: turnSeq,
    expires_on: [...duration.expires_on],
    max_uses: duration.max_uses,
    remaining_uses: duration.max_uses,
    consume_on: duration.consume_on,
    on_consume: onConsume,
  };
  const records = modifierArray(creature, true) as RuntimeV02AttackDamageModifier[];
  records.push(record);
  state[SEQUENCE_KEY] = creationSeq;
  return structuredClone(record);
}

/**
 * Canonical Attack #14 legal-declaration consumer.
 *
 * Every active source contributes in creation order. Finite modifiers spend one
 * use immediately, even if later attack damage is prevented or becomes zero;
 * unlimited modifiers remain until their expiry owner removes them. Optional
 * riders are returned already bound to this exact consuming action and target.
 */
export function runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration(
  state: Record<string, unknown>,
  creature: RuntimeV02AttackModifierCreature,
  input: {
    consuming_action_id: unknown;
    target_uid: unknown;
    turn_seq: unknown;
    base_damage: unknown;
  },
): RuntimeV02AttackModifierConsumption | null {
  if (!assertRuntimeV02MatchSnapshot(state)) return null;
  const consumingActionId = requiredString(
    input.consuming_action_id,
    "tcg_v0_2_attack_modifier_consuming_action_id_required",
  );
  const targetUid = requiredString(
    input.target_uid,
    "tcg_v0_2_attack_modifier_consuming_target_uid_required",
  );
  const turnSeq = nonNegativeInteger(
    input.turn_seq,
    "tcg_v0_2_attack_modifier_consuming_turn_seq_invalid",
  );
  const baseDamage = nonNegativeDamage(
    input.base_damage,
    "tcg_v0_2_attack_modifier_base_damage_invalid",
  );
  const existing = normalizedModifiers(creature);
  const active = existing
    .filter((record) => record.target_uid === targetUid && record.turn_seq === turnSeq)
    .sort((left, right) => left.creation_seq - right.creation_seq);

  let bonusDamage = 0;
  const appliedModifiers: RuntimeV02AttackModifierApplication[] = [];
  const boundRiders: RuntimeV02BoundAttackModifierRider[] = [];
  const nextById = new Map(existing.map((record) => [record.id, record] as const));
  for (const record of active) {
    bonusDamage += record.amount;
    const consumesUse = record.consume_on === "legal_attack_declared" &&
      record.remaining_uses !== null;
    let remainingUses = record.remaining_uses;
    if (consumesUse) {
      remainingUses = Number(record.remaining_uses) - 1;
      if (remainingUses === 0) nextById.delete(record.id);
      else nextById.set(record.id, { ...record, remaining_uses: remainingUses });
      if (record.on_consume) {
        boundRiders.push({
          schema: "sb-tcg-bound-attack-modifier-rider-v0.2",
          id: `attack-modifier-rider:${record.id}:${consumingActionId}`,
          modifier_id: record.id,
          source_uid: record.source_uid,
          source_action_id: record.source_action_id,
          modifier_target_uid: targetUid,
          consuming_action_id: consumingActionId,
          turn_seq: turnSeq,
          timing: record.on_consume.timing,
          steps: cloneSteps(record.on_consume.steps),
        });
      }
    }
    appliedModifiers.push({
      modifier_id: record.id,
      source_uid: record.source_uid,
      source_action_id: record.source_action_id,
      amount: record.amount,
      creation_seq: record.creation_seq,
      consumed_use: consumesUse,
      remaining_uses: remainingUses,
    });
  }

  const next = existing.filter((record) => nextById.has(record.id)).map((record) =>
    structuredClone(nextById.get(record.id)!)
  );
  if (existing.length > 0) {
    creature.flags ||= {};
    (creature.flags as Record<string, unknown>)[MODIFIERS_KEY] = next;
  }
  return {
    schema: "sb-tcg-attack-modifier-consumption-v0.2",
    consuming_action_id: consumingActionId,
    target_uid: targetUid,
    turn_seq: turnSeq,
    base_damage: baseDamage,
    bonus_damage: bonusDamage,
    damage: baseDamage + bonusDamage,
    applied_modifiers: appliedModifiers,
    bound_riders: boundRiders,
  };
}

/** Removes only modifiers whose declared lifecycle reaches this turn end. */
export function runtimeV02ExpireAttackDamageModifiersAtEndOfTurn(
  state: Record<string, unknown>,
  creature: RuntimeV02AttackModifierCreature,
  turnSeqRaw: unknown,
): RuntimeV02AttackModifierExpiry | null {
  if (!assertRuntimeV02MatchSnapshot(state)) return null;
  const turnSeq = nonNegativeInteger(
    turnSeqRaw,
    "tcg_v0_2_attack_modifier_expiry_turn_seq_invalid",
  );
  const existing = normalizedModifiers(creature);
  const removed = existing.filter((record) =>
    record.turn_seq === turnSeq && record.expires_on.includes("end_of_turn")
  );
  if (existing.length > 0) {
    creature.flags ||= {};
    (creature.flags as Record<string, unknown>)[MODIFIERS_KEY] = existing.filter((record) =>
      !removed.some((candidate) => candidate.id === record.id)
    );
  }
  return {
    removed_modifier_ids: removed
      .sort((left, right) => left.creation_seq - right.creation_seq)
      .map((record) => record.id),
    removed_count: removed.length,
  };
}

