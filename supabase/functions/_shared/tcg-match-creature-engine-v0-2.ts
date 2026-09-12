import {
  runtimeV02ApplyCardZoneTransferBatch,
  type RuntimeV02CardZoneInstance,
  type RuntimeV02CardZoneTransferBatchOperation,
  type RuntimeV02CardZoneTransferBatchReceipt,
} from "./tcg-match-card-zone-engine-v0-2.ts";

export type RuntimeV02CreatureState<T extends RuntimeV02CardZoneInstance> = {
  stack: T[];
  essence: T[];
  relic: T | null;
  damage: number;
};

export type RuntimeV02PlacedCreatureState<T extends RuntimeV02CardZoneInstance> = RuntimeV02CreatureState<T> & {
  shield: number;
  condition: string | null;
  flags: Record<string, unknown>;
};

export type RuntimeV02CreaturePlayerState<T extends RuntimeV02CardZoneInstance> = {
  vanguard: RuntimeV02CreatureState<T> | null;
  reserve: Array<RuntimeV02CreatureState<T> | null>;
  discard: T[];
};

export type RuntimeV02CreaturePlacementPlayerState<T extends RuntimeV02CardZoneInstance> = {
  hand: T[];
  vanguard: RuntimeV02CreatureState<T> | null;
  reserve: Array<RuntimeV02CreatureState<T> | null>;
};

export type RuntimeV02CreaturePlacementReceipt = {
  schema: "sb-tcg-creature-placement-v0.2";
  controller_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  card_uid: string;
};

export type RuntimeV02CreaturePlacementResult<T extends RuntimeV02CardZoneInstance> = {
  card: T;
  creature: RuntimeV02PlacedCreatureState<T>;
  receipt: RuntimeV02CreaturePlacementReceipt;
};

export type RuntimeV02DefeatedCreatureCandidate<T extends RuntimeV02CardZoneInstance> = {
  owner_seat: 1 | 2;
  player: RuntimeV02CreaturePlayerState<T>;
  where: "vanguard" | "reserve";
  index: number | null;
  creature: RuntimeV02CreatureState<T>;
  max_hp: number;
};

export type RuntimeV02DefeatedCreatureReceipt = {
  owner_seat: 1 | 2;
  where: "vanguard" | "reserve";
  index: number | null;
  anchor_uid: string;
  discarded_card_uids: string[];
};

export type RuntimeV02DefeatedCreaturesResult<T extends RuntimeV02CardZoneInstance> = {
  cards: T[];
  defeats: RuntimeV02DefeatedCreatureReceipt[];
  card_zone_batch: RuntimeV02CardZoneTransferBatchReceipt;
};

function requiredUid(value: unknown, error: string): string {
  const uid = typeof value === "string" ? value.trim() : "";
  if (!uid) throw new Error(error);
  return uid;
}

/**
 * Creature/Evolution owner for specialist hand-to-battlefield placement.
 * The caller owns phase, card legality and destination choice; this owner validates
 * the exact source/destination identity and performs the physical Creature mutation.
 * Card-Zone is intentionally not used because creature_stack is a specialist destination.
 */
export function runtimeV02PlaceCreatureFromHand<T extends RuntimeV02CardZoneInstance>(
  player: RuntimeV02CreaturePlacementPlayerState<T>,
  controllerSeat: 1 | 2,
  cardUid: string,
  where: "vanguard" | "reserve",
  index: number | null,
): RuntimeV02CreaturePlacementResult<T> {
  if (!player || !Array.isArray(player.hand) || !Array.isArray(player.reserve)) {
    throw new Error("tcg_v0_2_creature_placement_player_invalid");
  }
  if (controllerSeat !== 1 && controllerSeat !== 2) {
    throw new Error("tcg_v0_2_creature_placement_controller_invalid");
  }
  const uid = requiredUid(cardUid, "tcg_v0_2_creature_placement_card_uid_required");
  const handIndex = player.hand.findIndex((card) => card?.uid === uid);
  if (handIndex < 0) throw new Error("tcg_v0_2_creature_placement_card_missing");

  let destinationIndex: number | null = null;
  if (where === "vanguard") {
    if (index !== null) throw new Error("tcg_v0_2_creature_placement_vanguard_index_invalid");
    if (player.vanguard) throw new Error("tcg_v0_2_creature_placement_destination_occupied");
  } else if (where === "reserve") {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_creature_placement_reserve_index_invalid");
    }
    destinationIndex = Number(index);
    if (player.reserve[destinationIndex]) throw new Error("tcg_v0_2_creature_placement_destination_occupied");
  } else {
    throw new Error("tcg_v0_2_creature_placement_destination_invalid");
  }

  const card = player.hand[handIndex];
  const creature: RuntimeV02PlacedCreatureState<T> = {
    stack: [card],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    condition: null,
    flags: {},
  };

  player.hand.splice(handIndex, 1);
  if (where === "vanguard") player.vanguard = creature;
  else player.reserve[destinationIndex!] = creature;

  return {
    card,
    creature,
    receipt: {
      schema: "sb-tcg-creature-placement-v0.2",
      controller_seat: controllerSeat,
      where,
      index: destinationIndex,
      card_uid: uid,
    },
  };
}

function validateCandidate<T extends RuntimeV02CardZoneInstance>(
  candidate: RuntimeV02DefeatedCreatureCandidate<T>,
  candidateIndex: number,
): { anchor_uid: string; relic_zone: T[]; discarded_card_uids: string[] } {
  if (!candidate || typeof candidate !== "object") {
    throw new Error(`tcg_v0_2_creature_defeat_candidate_invalid:${candidateIndex}`);
  }
  if (candidate.owner_seat !== 1 && candidate.owner_seat !== 2) {
    throw new Error(`tcg_v0_2_creature_defeat_owner_invalid:${candidateIndex}`);
  }
  if (!candidate.player || !Array.isArray(candidate.player.reserve) || !Array.isArray(candidate.player.discard)) {
    throw new Error(`tcg_v0_2_creature_defeat_player_invalid:${candidateIndex}`);
  }
  if (!candidate.creature || !Array.isArray(candidate.creature.stack) || !Array.isArray(candidate.creature.essence)) {
    throw new Error(`tcg_v0_2_creature_defeat_state_invalid:${candidateIndex}`);
  }
  if (!Number.isFinite(candidate.max_hp) || candidate.max_hp <= 0) {
    throw new Error(`tcg_v0_2_creature_defeat_max_hp_invalid:${candidateIndex}`);
  }
  if (!Number.isFinite(Number(candidate.creature.damage)) || Number(candidate.creature.damage) < candidate.max_hp) {
    throw new Error(`tcg_v0_2_creature_not_defeated:${candidateIndex}`);
  }

  if (candidate.where === "vanguard") {
    if (candidate.index !== null || !Object.is(candidate.player.vanguard, candidate.creature)) {
      throw new Error(`tcg_v0_2_creature_defeat_position_changed:${candidateIndex}`);
    }
  } else if (candidate.where === "reserve") {
    if (
      !Number.isInteger(candidate.index) ||
      Number(candidate.index) < 0 ||
      Number(candidate.index) > 3 ||
      !Object.is(candidate.player.reserve[Number(candidate.index)], candidate.creature)
    ) {
      throw new Error(`tcg_v0_2_creature_defeat_position_changed:${candidateIndex}`);
    }
  } else {
    throw new Error(`tcg_v0_2_creature_defeat_position_invalid:${candidateIndex}`);
  }

  if (candidate.creature.stack.length < 1) {
    throw new Error(`tcg_v0_2_creature_defeat_stack_required:${candidateIndex}`);
  }
  const anchor = candidate.creature.stack[candidate.creature.stack.length - 1];
  const anchorUid = requiredUid(anchor?.uid, `tcg_v0_2_creature_defeat_anchor_required:${candidateIndex}`);
  const relicZone = candidate.creature.relic == null ? [] : [candidate.creature.relic];
  const discardedCardUids = [
    ...candidate.creature.stack.map((card, index) =>
      requiredUid(card?.uid, `tcg_v0_2_creature_defeat_stack_uid_invalid:${candidateIndex}:${index}`)
    ),
    ...candidate.creature.essence.map((card, index) =>
      requiredUid(card?.uid, `tcg_v0_2_creature_defeat_essence_uid_invalid:${candidateIndex}:${index}`)
    ),
    ...relicZone.map((card) =>
      requiredUid(card?.uid, `tcg_v0_2_creature_defeat_relic_uid_invalid:${candidateIndex}`)
    ),
  ];
  return { anchor_uid: anchorUid, relic_zone: relicZone, discarded_card_uids: discardedCardUids };
}

/**
 * Creature/Evolution owner for simultaneous defeated-creature lifecycle.
 * It validates every battlefield identity before delegating the complete ordered
 * stack/Essence/optional-Relic movement to Card-Zone as one atomic batch.
 */
export function runtimeV02ResolveDefeatedCreatures<T extends RuntimeV02CardZoneInstance>(
  candidates: readonly RuntimeV02DefeatedCreatureCandidate<T>[],
): RuntimeV02DefeatedCreaturesResult<T> {
  if (!Array.isArray(candidates)) {
    throw new Error("tcg_v0_2_creature_defeat_candidates_required");
  }
  const defeatCandidates: readonly RuntimeV02DefeatedCreatureCandidate<T>[] = candidates;
  if (defeatCandidates.length < 1) throw new Error("tcg_v0_2_creature_defeat_candidates_required");

  const occupiedPositions = new Set<string>();
  const occupiedCreatures = new Set<RuntimeV02CreatureState<T>>();
  const validated = defeatCandidates.map((candidate, index) => {
    const details = validateCandidate(candidate, index);
    const positionKey = `${candidate.owner_seat}:${candidate.where}:${candidate.index ?? "vanguard"}`;
    if (occupiedPositions.has(positionKey) || occupiedCreatures.has(candidate.creature)) {
      throw new Error(`tcg_v0_2_creature_defeat_candidate_duplicate:${index}`);
    }
    occupiedPositions.add(positionKey);
    occupiedCreatures.add(candidate.creature);
    return details;
  });

  const operations: RuntimeV02CardZoneTransferBatchOperation<T>[] = [];
  const addTransfer = (
    candidate: RuntimeV02DefeatedCreatureCandidate<T>,
    sourceZone: T[],
    sourceKind: "creature_stack" | "attached_essence" | "attached_relic",
    cardUids: string[],
    anchorUid: string,
  ) => {
    if (cardUids.length < 1) return;
    operations.push({
      source_zone: sourceZone,
      destination_zone: candidate.player.discard,
      request: {
        cause: "rule",
        action_kind: "defeat",
        source_action_id: "defeated_creature",
        source_card_uid: anchorUid,
        source: { controller_seat: candidate.owner_seat, zone: sourceKind, owner_card_uid: anchorUid },
        destination: { controller_seat: candidate.owner_seat, zone: "discard", owner_card_uid: null },
        card_uids: cardUids,
        destination_position: "bottom",
      },
    });
  };

  defeatCandidates.forEach((candidate, index) => {
    const details = validated[index];
    const stackUids = candidate.creature.stack.map((card) => card.uid);
    const essenceUids = candidate.creature.essence.map((card) => card.uid);
    const relicUids = details.relic_zone.map((card) => card.uid);
    addTransfer(candidate, candidate.creature.stack, "creature_stack", stackUids, details.anchor_uid);
    addTransfer(candidate, candidate.creature.essence, "attached_essence", essenceUids, details.anchor_uid);
    addTransfer(candidate, details.relic_zone, "attached_relic", relicUids, details.anchor_uid);
  });

  const batch = runtimeV02ApplyCardZoneTransferBatch(operations);
  defeatCandidates.forEach((candidate) => {
    candidate.creature.relic = null;
    if (candidate.where === "vanguard") candidate.player.vanguard = null;
    else candidate.player.reserve[Number(candidate.index)] = null;
  });

  return {
    cards: batch.cards,
    defeats: defeatCandidates.map((candidate, index) => ({
      owner_seat: candidate.owner_seat,
      where: candidate.where,
      index: candidate.index,
      anchor_uid: validated[index].anchor_uid,
      discarded_card_uids: validated[index].discarded_card_uids,
    })),
    card_zone_batch: batch.receipt,
  };
}
