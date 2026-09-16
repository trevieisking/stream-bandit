export type RuntimeV02DamageCreature = {
  damage?: number;
  shield?: number;
  [key: string]: unknown;
};

export type RuntimeV02DamageMoveOptions = {
  allow_partial?: boolean;
  minimum_moved?: number;
  source_controller_seat?: 1 | 2 | null;
  destination_controller_seat?: 1 | 2 | null;
  allow_opposing_destination?: boolean;
  destination_damage_cap?: number | null;
};

export type RuntimeV02EffectDamageReceipt = {
  kind: "effect_damage";
  requested_amount: number;
  shield_prevented: number;
  actual_hp_damage: number;
};

export type RuntimeV02DamagePlacementReceipt = {
  kind: "damage_placement";
  requested_amount: number;
  actual_damage_placed: number;
};

export type RuntimeV02DamageMoveReceipt = {
  kind: "damage_moved";
  requested_amount: number;
  actual_damage_moved: number;
  source_damage_before: number;
  source_damage_after: number;
  destination_damage_before: number;
  destination_damage_after: number;
};

export type RuntimeV02ShieldReceipt = {
  kind: "shield_gained";
  requested_amount: number;
  actual_shield_gained: number;
  shield_before: number;
  shield_after: number;
};

export type RuntimeV02ShieldTransferReceipt = {
  kind: "shield_transferred";
  requested_amount: number;
  actual_shield_transferred: number;
  source_shield_before: number;
  source_shield_after: number;
  destination_shield_before: number;
  destination_shield_after: number;
};

function finiteNonNegative(value: unknown, error: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error(error);
  return amount;
}

function currentDamage(creature: RuntimeV02DamageCreature): number {
  return finiteNonNegative(creature?.damage ?? 0, "tcg_v0_2_damage_state_invalid");
}

function currentShield(creature: RuntimeV02DamageCreature): number {
  return finiteNonNegative(creature?.shield ?? 0, "tcg_v0_2_shield_state_invalid");
}

function normalizedSeat(value: unknown): 1 | 2 | null {
  if (value == null) return null;
  if (value === 1 || value === 2) return value;
  throw new Error("tcg_v0_2_damage_controller_seat_invalid");
}

export function runtimeV02DealEffectDamage(
  creature: RuntimeV02DamageCreature,
  amount: number,
): RuntimeV02EffectDamageReceipt {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_effect_damage_target_required");
  const requested = finiteNonNegative(amount, "tcg_v0_2_effect_damage_amount_invalid");
  const shieldBefore = currentShield(creature);
  const damageBefore = currentDamage(creature);
  const shieldPrevented = Math.min(shieldBefore, requested);
  const actualHpDamage = requested - shieldPrevented;

  creature.shield = shieldBefore - shieldPrevented;
  creature.damage = damageBefore + actualHpDamage;

  return {
    kind: "effect_damage",
    requested_amount: requested,
    shield_prevented: shieldPrevented,
    actual_hp_damage: actualHpDamage,
  };
}

export function runtimeV02PlaceDamage(
  creature: RuntimeV02DamageCreature,
  amount: number,
): RuntimeV02DamagePlacementReceipt {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_damage_placement_target_required");
  const requested = finiteNonNegative(amount, "tcg_v0_2_damage_placement_amount_invalid");
  const damageBefore = currentDamage(creature);
  creature.damage = damageBefore + requested;
  return {
    kind: "damage_placement",
    requested_amount: requested,
    actual_damage_placed: requested,
  };
}

export function runtimeV02MoveDamage(
  source: RuntimeV02DamageCreature,
  destination: RuntimeV02DamageCreature,
  amount: number,
  options: RuntimeV02DamageMoveOptions = {},
): RuntimeV02DamageMoveReceipt {
  if (!source || typeof source !== "object") throw new Error("tcg_v0_2_damage_move_source_required");
  if (!destination || typeof destination !== "object") throw new Error("tcg_v0_2_damage_move_destination_required");
  if (source === destination) throw new Error("tcg_v0_2_damage_move_same_creature");

  const requested = finiteNonNegative(amount, "tcg_v0_2_damage_move_amount_invalid");
  const minimumMoved = finiteNonNegative(options.minimum_moved ?? 0, "tcg_v0_2_damage_move_minimum_invalid");
  if (minimumMoved > requested) throw new Error("tcg_v0_2_damage_move_minimum_exceeds_requested");

  const sourceSeat = normalizedSeat(options.source_controller_seat);
  const destinationSeat = normalizedSeat(options.destination_controller_seat);
  const hostile = sourceSeat != null && destinationSeat != null && sourceSeat !== destinationSeat;
  if (hostile && options.allow_opposing_destination !== true) {
    throw new Error("tcg_v0_2_damage_move_opposing_destination_forbidden");
  }

  const sourceBefore = currentDamage(source);
  const destinationBefore = currentDamage(destination);
  let movable = Math.min(sourceBefore, requested);

  if (options.destination_damage_cap != null) {
    const cap = finiteNonNegative(options.destination_damage_cap, "tcg_v0_2_damage_move_destination_cap_invalid");
    const capacity = Math.max(0, cap - destinationBefore);
    movable = Math.min(movable, capacity);
  }

  if (options.allow_partial !== true && movable !== requested) {
    throw new Error("tcg_v0_2_damage_move_full_amount_unavailable");
  }
  if (movable < minimumMoved) {
    throw new Error("tcg_v0_2_damage_move_minimum_unmet");
  }

  source.damage = sourceBefore - movable;
  destination.damage = destinationBefore + movable;

  return {
    kind: "damage_moved",
    requested_amount: requested,
    actual_damage_moved: movable,
    source_damage_before: sourceBefore,
    source_damage_after: sourceBefore - movable,
    destination_damage_before: destinationBefore,
    destination_damage_after: destinationBefore + movable,
  };
}

export function runtimeV02AddShield(
  creature: RuntimeV02DamageCreature,
  amount: number,
  shieldCap = 60,
): RuntimeV02ShieldReceipt {
  if (!creature || typeof creature !== "object") throw new Error("tcg_v0_2_shield_target_required");
  const requested = finiteNonNegative(amount, "tcg_v0_2_shield_amount_invalid");
  const cap = finiteNonNegative(shieldCap, "tcg_v0_2_shield_cap_invalid");
  const before = currentShield(creature);
  const after = Math.min(cap, before + requested);
  creature.shield = after;
  return {
    kind: "shield_gained",
    requested_amount: requested,
    actual_shield_gained: after - before,
    shield_before: before,
    shield_after: after,
  };
}

export function runtimeV02TransferShield(
  source: RuntimeV02DamageCreature,
  destination: RuntimeV02DamageCreature,
  amount: number,
  shieldCap = 60,
): RuntimeV02ShieldTransferReceipt {
  if (!source || typeof source !== "object") throw new Error("tcg_v0_2_shield_transfer_source_required");
  if (!destination || typeof destination !== "object") throw new Error("tcg_v0_2_shield_transfer_destination_required");
  if (source === destination) throw new Error("tcg_v0_2_shield_transfer_same_creature");

  const requested = finiteNonNegative(amount, "tcg_v0_2_shield_transfer_amount_invalid");
  const cap = finiteNonNegative(shieldCap, "tcg_v0_2_shield_cap_invalid");
  const sourceBefore = currentShield(source);
  const destinationBefore = currentShield(destination);
  const capacity = Math.max(0, cap - destinationBefore);
  const moved = Math.min(requested, sourceBefore, capacity);

  source.shield = sourceBefore - moved;
  destination.shield = destinationBefore + moved;

  return {
    kind: "shield_transferred",
    requested_amount: requested,
    actual_shield_transferred: moved,
    source_shield_before: sourceBefore,
    source_shield_after: sourceBefore - moved,
    destination_shield_before: destinationBefore,
    destination_shield_after: destinationBefore + moved,
  };
}
