export type RuntimeV02EvolutionInstance = {
  uid: string;
  card_id: string;
};

export type RuntimeV02EvolutionCreature<T extends RuntimeV02EvolutionInstance> = {
  stack: T[];
  essence: T[];
  relic: T | null;
  damage: number;
  shield: number;
  condition?: string | null;
  conditions?: Record<string, unknown>;
  flags?: Record<string, unknown>;
  entered_turn?: unknown;
  evolved_turn?: unknown;
  became_vanguard_turn?: unknown;
};

export type RuntimeV02EvolutionPlayer<T extends RuntimeV02EvolutionInstance> = {
  hand: T[];
  vanguard: RuntimeV02EvolutionCreature<T> | null;
  reserve: Array<RuntimeV02EvolutionCreature<T> | null>;
};

export type RuntimeV02EvolutionDefinition = Record<string, unknown> & {
  id?: unknown;
  kind?: unknown;
  stage?: unknown;
  evolves_from_id?: unknown;
  name?: unknown;
};

export type RuntimeV02EvolutionDefinitionResolver<T extends RuntimeV02EvolutionInstance> = (
  instance: T,
) => RuntimeV02EvolutionDefinition | null;

export type RuntimeV02EvolutionWhere = "vanguard" | "reserve";

export type RuntimeV02EvolutionLegalityError =
  | "evolution_locked_on_first_personal_turn"
  | "target_creature_not_found"
  | "teen_or_adult_required"
  | "evolution_predecessor_mismatch"
  | "stack_entered_or_evolved_this_turn"
  | "one_evolution_per_stack_per_turn";

export type RuntimeV02EvolutionTarget = {
  where: RuntimeV02EvolutionWhere;
  index: number | null;
  anchor_uid: string;
};

export type RuntimeV02EvolutionTargetListResult =
  | {
    ok: true;
    eligible: true;
    card_uid: string;
    legal_targets: RuntimeV02EvolutionTarget[];
  }
  | {
    ok: true;
    eligible: false;
    card_uid: string;
    legal_targets: [];
    reason: "evolution_locked_on_first_personal_turn" | "teen_or_adult_required";
  };

export type RuntimeV02EvolutionDeclarationResult<T extends RuntimeV02EvolutionInstance> =
  | {
    ok: true;
    card: T;
    definition: RuntimeV02EvolutionDefinition;
    previous_definition: RuntimeV02EvolutionDefinition;
    creature: RuntimeV02EvolutionCreature<T>;
    where: RuntimeV02EvolutionWhere;
    index: number | null;
  }
  | {
    ok: false;
    error: RuntimeV02EvolutionLegalityError;
  };

function cardUid(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function turnNumber(value: unknown): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}

function personalTurnNumber(value: unknown): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}

function handCard<T extends RuntimeV02EvolutionInstance>(
  player: RuntimeV02EvolutionPlayer<T>,
  uid: string,
): T | null {
  return Array.isArray(player?.hand)
    ? player.hand.find((card) => card?.uid === uid) ?? null
    : null;
}

function targetCreature<T extends RuntimeV02EvolutionInstance>(
  player: RuntimeV02EvolutionPlayer<T>,
  where: RuntimeV02EvolutionWhere,
  index: number | null,
): RuntimeV02EvolutionCreature<T> | null {
  if (where === "vanguard") return index === null ? player.vanguard ?? null : null;
  if (
    where === "reserve" &&
    Number.isInteger(index) &&
    Number(index) >= 0 &&
    Number(index) < 4 &&
    Array.isArray(player?.reserve)
  ) {
    return player.reserve[Number(index)] ?? null;
  }
  return null;
}

function topCard<T extends RuntimeV02EvolutionInstance>(
  creature: RuntimeV02EvolutionCreature<T> | null,
): T | null {
  return creature && Array.isArray(creature.stack) && creature.stack.length
    ? creature.stack[creature.stack.length - 1]
    : null;
}

function evolutionCard<T extends RuntimeV02EvolutionInstance>(
  player: RuntimeV02EvolutionPlayer<T>,
  uid: string,
  definitionOf: RuntimeV02EvolutionDefinitionResolver<T>,
): { card: T; definition: RuntimeV02EvolutionDefinition } | null {
  const card = handCard(player, uid);
  if (!card) return null;
  const definition = definitionOf(card);
  if (
    !definition ||
    String(definition.kind || "") !== "Creature" ||
    !["Teen", "Adult"].includes(String(definition.stage || ""))
  ) {
    return null;
  }
  return { card, definition };
}

function targetError<T extends RuntimeV02EvolutionInstance>(
  creature: RuntimeV02EvolutionCreature<T>,
  evolutionDefinition: RuntimeV02EvolutionDefinition,
  turnSeq: number,
  definitionOf: RuntimeV02EvolutionDefinitionResolver<T>,
): Exclude<
  RuntimeV02EvolutionLegalityError,
  "evolution_locked_on_first_personal_turn" | "target_creature_not_found" | "teen_or_adult_required"
> | null {
  const previous = topCard(creature);
  const previousDefinition = previous ? definitionOf(previous) : null;
  if (
    !previous ||
    !previousDefinition ||
    String(evolutionDefinition.evolves_from_id || "") !== String(previousDefinition.id || "")
  ) {
    return "evolution_predecessor_mismatch";
  }
  if (Number(creature.entered_turn ?? 0) >= turnSeq) {
    return "stack_entered_or_evolved_this_turn";
  }
  if (Number(creature.evolved_turn ?? -1) === turnSeq) {
    return "one_evolution_per_stack_per_turn";
  }
  return null;
}

/**
 * Creature/Evolution owner for read-only Evolution target projection.
 *
 * This function owns no mutation. It projects exactly the current server legality
 * required to present legal Evolution destinations without teaching the browser the
 * rules. The authoritative evolve command must still validate again before mutation.
 */
export function runtimeV02ListLegalEvolutionTargets<T extends RuntimeV02EvolutionInstance>(
  player: RuntimeV02EvolutionPlayer<T>,
  cardUidValue: string,
  turnSeqValue: number,
  personalTurnValue: number,
  definitionOf: RuntimeV02EvolutionDefinitionResolver<T>,
): RuntimeV02EvolutionTargetListResult {
  const uid = cardUid(cardUidValue);
  if (personalTurnNumber(personalTurnValue) <= 1) {
    return {
      ok: true,
      eligible: false,
      card_uid: uid,
      legal_targets: [],
      reason: "evolution_locked_on_first_personal_turn",
    };
  }
  const prepared = evolutionCard(player, uid, definitionOf);
  if (!prepared) {
    return {
      ok: true,
      eligible: false,
      card_uid: uid,
      legal_targets: [],
      reason: "teen_or_adult_required",
    };
  }

  const turnSeq = turnNumber(turnSeqValue);
  const candidates: Array<{
    where: RuntimeV02EvolutionWhere;
    index: number | null;
    creature: RuntimeV02EvolutionCreature<T> | null;
  }> = [
    { where: "vanguard", index: null, creature: player.vanguard ?? null },
    ...[0, 1, 2, 3].map((index) => ({
      where: "reserve" as const,
      index,
      creature: Array.isArray(player.reserve) ? player.reserve[index] ?? null : null,
    })),
  ];

  const legalTargets: RuntimeV02EvolutionTarget[] = [];
  for (const candidate of candidates) {
    if (!candidate.creature) continue;
    if (targetError(candidate.creature, prepared.definition, turnSeq, definitionOf)) continue;
    const anchor = topCard(candidate.creature);
    const anchorUid = cardUid(anchor?.uid);
    if (!anchorUid) continue;
    legalTargets.push({
      where: candidate.where,
      index: candidate.index,
      anchor_uid: anchorUid,
    });
  }

  return {
    ok: true,
    eligible: true,
    card_uid: uid,
    legal_targets: legalTargets,
  };
}

/**
 * Creature/Evolution owner for final Evolution declaration legality.
 *
 * Error names intentionally preserve the existing public dispatcher contract.
 * The caller retains mutation/listener orchestration, but it no longer duplicates
 * stage, predecessor or per-turn stack legality.
 */
export function runtimeV02ValidateEvolutionDeclaration<T extends RuntimeV02EvolutionInstance>(
  player: RuntimeV02EvolutionPlayer<T>,
  cardUidValue: string,
  where: RuntimeV02EvolutionWhere,
  index: number | null,
  turnSeqValue: number,
  personalTurnValue: number,
  definitionOf: RuntimeV02EvolutionDefinitionResolver<T>,
): RuntimeV02EvolutionDeclarationResult<T> {
  if (personalTurnNumber(personalTurnValue) <= 1) {
    return { ok: false, error: "evolution_locked_on_first_personal_turn" };
  }

  const creature = targetCreature(player, where, index);
  if (!creature) return { ok: false, error: "target_creature_not_found" };

  const uid = cardUid(cardUidValue);
  const prepared = evolutionCard(player, uid, definitionOf);
  if (!prepared) return { ok: false, error: "teen_or_adult_required" };

  const turnSeq = turnNumber(turnSeqValue);
  const error = targetError(creature, prepared.definition, turnSeq, definitionOf);
  if (error) return { ok: false, error };

  const previous = topCard(creature)!;
  const previousDefinition = definitionOf(previous)!;
  return {
    ok: true,
    card: prepared.card,
    definition: prepared.definition,
    previous_definition: previousDefinition,
    creature,
    where,
    index: where === "reserve" ? Number(index) : null,
  };
}
