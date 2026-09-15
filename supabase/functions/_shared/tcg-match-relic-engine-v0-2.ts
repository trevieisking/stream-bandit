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

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
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
