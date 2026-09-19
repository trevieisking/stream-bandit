import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02RelicInstance = {
  uid: string;
  card_id: string;
};

export type RuntimeV02RelicCreature<T extends RuntimeV02RelicInstance = RuntimeV02RelicInstance> = {
  stack: T[];
  relic: T | null;
};

export type RuntimeV02RelicPlayerState<T extends RuntimeV02RelicInstance = RuntimeV02RelicInstance> = {
  hand: T[];
  vanguard: RuntimeV02RelicCreature<T> | null;
  reserve: Array<RuntimeV02RelicCreature<T> | null>;
};

export type RuntimeV02RelicAttachmentReceipt = {
  schema: "sb-tcg-relic-attachment-v0.2";
  event_name: "relic_attached";
  controller_seat: 1 | 2;
  target_creature_uid: string;
  source_card_uid: string;
  source_card_id: string;
  origin_zone: "hand";
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02RelicAttachmentResult<T extends RuntimeV02RelicInstance = RuntimeV02RelicInstance> = {
  attached_card: T;
  creature: RuntimeV02RelicCreature<T>;
  receipt: RuntimeV02RelicAttachmentReceipt;
};

export type RuntimeV02ManualRelicAttachmentTarget = {
  where: "vanguard" | "reserve";
  index: number | null;
  anchor_uid: string;
};

export type RuntimeV02ManualRelicAttachmentTargetListResult =
  | {
      ok: true;
      eligible: true;
      card_uid: string;
      legal_targets: RuntimeV02ManualRelicAttachmentTarget[];
    }
  | {
      ok: true;
      eligible: false;
      card_uid: string;
      legal_targets: [];
      reason: "relic_card_required";
    };

export type RuntimeV02ManualRelicAttachmentDeclarationResult =
  | {
      ok: true;
      card_uid: string;
      target_creature_uid: string;
      where: "vanguard" | "reserve";
      index: number | null;
    }
  | {
      ok: false;
      error: "target_creature_not_found" | "creature_already_has_relic" | "relic_card_required";
    };

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function controllerSeat(value: unknown): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error("tcg_v0_2_manual_relic_controller_seat_invalid");
}

function structuredPlayer(
  state: Record<string, unknown>,
  seat: 1 | 2,
): RuntimeV02RelicPlayerState<RuntimeV02RelicInstance> {
  const players = objectRecord(state.players);
  const raw = players ? objectRecord(players[String(seat)]) : null;
  if (!raw || !Array.isArray(raw.hand) || !Array.isArray(raw.reserve) || raw.reserve.length < 4) {
    throw new Error("tcg_v0_2_manual_relic_player_invalid");
  }
  return raw as unknown as RuntimeV02RelicPlayerState<RuntimeV02RelicInstance>;
}

function manualRelicSource(
  state: Record<string, unknown>,
  seat: 1 | 2,
  sourceCardUid: string,
): RuntimeV02RelicInstance | null {
  const player = structuredPlayer(state, seat);
  const uid = typeof sourceCardUid === "string" ? sourceCardUid.trim() : "";
  if (!uid) return null;
  const source = player.hand.find((item) => item?.uid === uid) ?? null;
  if (!source?.card_id) return null;
  const definition = runtimeV02Definition(state, source);
  const tactic = objectRecord(definition?.tactic);
  if (!definition || String(definition.card_family || "") !== "Tactic" || String(tactic?.subtype || "") !== "Relic") {
    return null;
  }
  return source;
}

function manualRelicTargets(
  state: Record<string, unknown>,
  seat: 1 | 2,
): Array<RuntimeV02ManualRelicAttachmentTarget & { creature: RuntimeV02RelicCreature<RuntimeV02RelicInstance> }> {
  const player = structuredPlayer(state, seat);
  const candidates: Array<["vanguard" | "reserve", number | null, RuntimeV02RelicCreature<RuntimeV02RelicInstance> | null | undefined]> = [
    ["vanguard", null, player.vanguard],
    ...[0, 1, 2, 3].map((index) => ["reserve", index, player.reserve[index]] as ["reserve", number, RuntimeV02RelicCreature<RuntimeV02RelicInstance> | null | undefined]),
  ];
  const out: Array<RuntimeV02ManualRelicAttachmentTarget & { creature: RuntimeV02RelicCreature<RuntimeV02RelicInstance> }> = [];
  for (const [where, index, creature] of candidates) {
    if (creature == null) continue;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_manual_relic_target_creature_stack_required");
    }
    const top = creature.stack[creature.stack.length - 1];
    if (!top?.uid || !top.card_id) throw new Error("tcg_v0_2_manual_relic_target_anchor_required");
    out.push({ where, index, anchor_uid: top.uid, creature });
  }
  return out;
}

/**
 * Read-only Relic target projection for the current controller.
 *
 * Relic card identity and the one-Relic-per-Creature destination rule stay in the
 * canonical Relic owner. The browser receives only legal coordinates plus public
 * anchor identity and never needs to inspect Tactic/Relic registry fields.
 */
export function runtimeV02ListManualRelicAttachmentTargets(
  state: Record<string, unknown>,
  seatValue: 1 | 2,
  sourceCardUid: string,
): RuntimeV02ManualRelicAttachmentTargetListResult {
  const seat = controllerSeat(seatValue);
  const uid = typeof sourceCardUid === "string" ? sourceCardUid.trim() : "";
  if (!manualRelicSource(state, seat, uid)) {
    return { ok: true, eligible: false, card_uid: uid, legal_targets: [], reason: "relic_card_required" };
  }
  return {
    ok: true,
    eligible: true,
    card_uid: uid,
    legal_targets: manualRelicTargets(state, seat)
      .filter(({ creature }) => creature.relic == null)
      .map(({ where, index, anchor_uid }) => ({ where, index, anchor_uid })),
  };
}

/**
 * Final structured manual Relic declaration validation.
 *
 * Error precedence preserves the public dispatcher contract:
 * target existence -> occupied Relic slot -> Relic source identity.
 * runtimeV02AttachRelicFromHand revalidates exact hand and target identity before
 * mutating either canonical zone.
 */
export function runtimeV02ValidateManualRelicAttachmentDeclaration(
  state: Record<string, unknown>,
  seatValue: 1 | 2,
  sourceCardUid: string,
  whereValue: string,
  indexValue: number | null,
): RuntimeV02ManualRelicAttachmentDeclarationResult {
  const seat = controllerSeat(seatValue);
  const where = whereValue === "vanguard" ? "vanguard" : whereValue === "reserve" ? "reserve" : null;
  const index = indexValue == null ? null : Number(indexValue);
  const found = where == null
    ? null
    : manualRelicTargets(state, seat).find((candidate) =>
        candidate.where === where && (where === "vanguard" ? index === null : candidate.index === index)
      ) ?? null;
  if (!found) return { ok: false, error: "target_creature_not_found" };
  if (found.creature.relic != null) return { ok: false, error: "creature_already_has_relic" };

  const uid = typeof sourceCardUid === "string" ? sourceCardUid.trim() : "";
  if (!manualRelicSource(state, seat, uid)) return { ok: false, error: "relic_card_required" };
  return {
    ok: true,
    card_uid: uid,
    target_creature_uid: found.anchor_uid,
    where: found.where,
    index: found.index,
  };
}

function targetCreature<T extends RuntimeV02RelicInstance>(
  player: RuntimeV02RelicPlayerState<T>,
  targetCreatureUid: string,
): { creature: RuntimeV02RelicCreature<T>; where: "vanguard" | "reserve"; index: number | null } {
  const targetUid = requiredString(targetCreatureUid, "tcg_v0_2_relic_attachment_target_required");
  const matches: Array<{ creature: RuntimeV02RelicCreature<T>; where: "vanguard" | "reserve"; index: number | null }> = [];
  const candidates: Array<["vanguard" | "reserve", number | null, RuntimeV02RelicCreature<T> | null | undefined]> = [
    ["vanguard", null, player.vanguard],
    ...[0, 1, 2, 3].map((index) => ["reserve", index, player.reserve[index]] as ["reserve", number, RuntimeV02RelicCreature<T> | null | undefined]),
  ];
  for (const [where, index, creature] of candidates) {
    if (creature == null) continue;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_relic_attachment_creature_stack_required");
    }
    const top = creature.stack[creature.stack.length - 1];
    const uid = requiredString(top?.uid, "tcg_v0_2_relic_attachment_creature_anchor_required");
    requiredString(top?.card_id, "tcg_v0_2_relic_attachment_creature_card_id_required");
    if (uid === targetUid) matches.push({ creature, where, index });
  }
  if (matches.length < 1) throw new Error("tcg_v0_2_relic_attachment_target_missing");
  if (matches.length > 1) throw new Error("tcg_v0_2_relic_attachment_target_ambiguous");
  return matches[0];
}

/**
 * Canonical Relic attachment mutation owner.
 *
 * Callers own phase, card-family/subtype legality and target selection. Relic owns
 * exact hand identity, the one-Relic-per-Creature constraint, and the specialist
 * hand -> attached_relic mutation. Card-Zone intentionally rejects attached_relic
 * as a destination, so this transaction must remain here rather than in Card-Zone.
 */
export function runtimeV02AttachRelicFromHand<T extends RuntimeV02RelicInstance>(
  player: RuntimeV02RelicPlayerState<T>,
  controllerSeat: 1 | 2,
  targetCreatureUid: string,
  sourceCardUid: string,
): RuntimeV02RelicAttachmentResult<T> {
  if (!player || !Array.isArray(player.hand) || !Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_relic_attachment_player_invalid");
  }
  if (player.reserve.length < 4) {
    throw new Error("tcg_v0_2_relic_attachment_reserve_invalid");
  }
  if (controllerSeat !== 1 && controllerSeat !== 2) {
    throw new Error("tcg_v0_2_relic_attachment_controller_invalid");
  }

  const sourceUid = requiredString(sourceCardUid, "tcg_v0_2_relic_attachment_source_uid_required");
  const sourceIndex = player.hand.findIndex((card) => card?.uid === sourceUid);
  if (sourceIndex < 0) throw new Error("tcg_v0_2_relic_attachment_source_missing");
  const source = player.hand[sourceIndex];
  const sourceCardId = requiredString(source?.card_id, "tcg_v0_2_relic_attachment_source_card_id_required");
  const target = targetCreature(player, targetCreatureUid);
  if (target.creature.relic != null) {
    throw new Error("tcg_v0_2_relic_attachment_destination_occupied");
  }

  // Every identity/destination check above completes before canonical zones mutate.
  const attached = player.hand.splice(sourceIndex, 1)[0];
  target.creature.relic = attached;

  return {
    attached_card: attached,
    creature: target.creature,
    receipt: {
      schema: "sb-tcg-relic-attachment-v0.2",
      event_name: "relic_attached",
      controller_seat: controllerSeat,
      target_creature_uid: requiredString(targetCreatureUid, "tcg_v0_2_relic_attachment_target_required"),
      source_card_uid: sourceUid,
      source_card_id: sourceCardId,
      origin_zone: "hand",
      where: target.where,
      index: target.index,
    },
  };
}
