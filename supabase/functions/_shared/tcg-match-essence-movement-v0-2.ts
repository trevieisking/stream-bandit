import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02EssenceMovement = {
  turn_seq: number;
  controller_seat: 1 | 2;
  source_creature_uid: string;
  destination_creature_uid: string;
  essence_uid: string;
  element: string;
  source_action_id: string;
};

export type RuntimeV02EssenceTransferResult<T> = {
  essence: T;
  movement: RuntimeV02EssenceMovement;
};

const LEDGER_KEY = "runtime_essence_movements_v0_2";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function turnSeq(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_essence_movement_turn_seq_invalid");
  }
  return value;
}

function seat(value: unknown): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new Error("tcg_v0_2_essence_movement_controller_seat_invalid");
  }
  return value;
}

function nonEmpty(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function legacyDefinition(state: Record<string, unknown>, cardId: string): Record<string, unknown> | null {
  const cardIndex = objectRecord(state.card_index);
  const entry = objectRecord(cardIndex?.[cardId]);
  return objectRecord(entry?.definition) || entry;
}

function essenceElement(
  state: Record<string, unknown>,
  rawInstance: unknown,
): string {
  const instance = objectRecord(rawInstance);
  const cardId = nonEmpty(instance?.card_id, "tcg_v0_2_essence_movement_essence_card_id_required");
  const definition = runtimeV02Definition(state, { card_id: cardId }) || legacyDefinition(state, cardId);
  if (!definition) throw new Error(`tcg_v0_2_essence_movement_essence_definition_required:${cardId}`);
  const family = String(definition.card_family || definition.kind || "");
  if (family !== "Essence") throw new Error(`tcg_v0_2_essence_movement_attachment_not_essence:${cardId}`);
  return nonEmpty(definition.element, `tcg_v0_2_essence_movement_element_required:${cardId}`);
}

function normalizeEntry(raw: unknown, index: number): RuntimeV02EssenceMovement {
  const value = objectRecord(raw);
  if (!value) throw new Error(`tcg_v0_2_essence_movement_entry_invalid:${index}`);
  const allowedKeys = new Set([
    "turn_seq",
    "controller_seat",
    "source_creature_uid",
    "destination_creature_uid",
    "essence_uid",
    "element",
    "source_action_id",
  ]);
  const unsupportedKey = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupportedKey) {
    throw new Error(`tcg_v0_2_essence_movement_entry_field_unsupported:${index}:${unsupportedKey}`);
  }
  const entryTurn = value.turn_seq;
  if (typeof entryTurn !== "number" || !Number.isInteger(entryTurn) || entryTurn < 0) {
    throw new Error(`tcg_v0_2_essence_movement_entry_turn_invalid:${index}`);
  }
  const source = nonEmpty(value.source_creature_uid, `tcg_v0_2_essence_movement_entry_source_invalid:${index}`);
  const destination = nonEmpty(value.destination_creature_uid, `tcg_v0_2_essence_movement_entry_destination_invalid:${index}`);
  if (source === destination) throw new Error(`tcg_v0_2_essence_movement_entry_same_creature:${index}`);
  return {
    turn_seq: entryTurn,
    controller_seat: seat(value.controller_seat),
    source_creature_uid: source,
    destination_creature_uid: destination,
    essence_uid: nonEmpty(value.essence_uid, `tcg_v0_2_essence_movement_entry_essence_invalid:${index}`),
    element: nonEmpty(value.element, `tcg_v0_2_essence_movement_entry_element_invalid:${index}`),
    source_action_id: nonEmpty(value.source_action_id, `tcg_v0_2_essence_movement_entry_action_invalid:${index}`),
  };
}

function ledger(state: Record<string, unknown>): RuntimeV02EssenceMovement[] {
  const raw = state[LEDGER_KEY];
  if (raw === null || raw === undefined) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_essence_movement_ledger_invalid");
  return raw.map((entry, index) => normalizeEntry(entry, index));
}

export function recordRuntimeV02EssenceMovement(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  sourceCreatureUid: string,
  destinationCreatureUid: string,
  rawEssence: unknown,
  sourceActionId: string,
): RuntimeV02EssenceMovement[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  const source = nonEmpty(sourceCreatureUid, "tcg_v0_2_essence_movement_source_required");
  const destination = nonEmpty(destinationCreatureUid, "tcg_v0_2_essence_movement_destination_required");
  if (source === destination) throw new Error("tcg_v0_2_essence_movement_same_creature");
  const instance = objectRecord(rawEssence);
  const essenceUid = nonEmpty(instance?.uid, "tcg_v0_2_essence_movement_essence_uid_required");
  const element = essenceElement(state, rawEssence);
  const action = nonEmpty(sourceActionId, "tcg_v0_2_essence_movement_source_action_required");
  const current = ledger(state).filter((entry) => entry.turn_seq === currentTurn);
  if (!current.some((entry) =>
    entry.controller_seat === controller &&
    entry.source_creature_uid === source &&
    entry.destination_creature_uid === destination &&
    entry.essence_uid === essenceUid &&
    entry.source_action_id === action
  )) {
    current.push({
      turn_seq: currentTurn,
      controller_seat: controller,
      source_creature_uid: source,
      destination_creature_uid: destination,
      essence_uid: essenceUid,
      element,
      source_action_id: action,
    });
  }
  state[LEDGER_KEY] = current.map((entry) => ({ ...entry }));
  return current.map((entry) => ({ ...entry }));
}

export function applyRuntimeV02EssenceTransfer<T extends { uid: string; card_id: string }>(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  sourceCreatureUid: string,
  destinationCreatureUid: string,
  sourceEssenceZone: T[],
  destinationEssenceZone: T[],
  essenceUid: string,
  sourceActionId: string,
): RuntimeV02EssenceTransferResult<T> {
  if (!Array.isArray(sourceEssenceZone) || !Array.isArray(destinationEssenceZone)) {
    throw new Error("tcg_v0_2_essence_transfer_zones_invalid");
  }
  if (sourceEssenceZone === destinationEssenceZone) {
    throw new Error("tcg_v0_2_essence_transfer_same_zone");
  }

  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  const source = nonEmpty(sourceCreatureUid, "tcg_v0_2_essence_movement_source_required");
  const destination = nonEmpty(destinationCreatureUid, "tcg_v0_2_essence_movement_destination_required");
  if (source === destination) throw new Error("tcg_v0_2_essence_movement_same_creature");
  const requestedUid = nonEmpty(essenceUid, "tcg_v0_2_essence_transfer_essence_uid_required");
  const action = nonEmpty(sourceActionId, "tcg_v0_2_essence_movement_source_action_required");

  const sourceIndexes = sourceEssenceZone.reduce<number[]>((out, item, index) => {
    if (item?.uid === requestedUid) out.push(index);
    return out;
  }, []);
  if (sourceIndexes.length === 0) throw new Error("tcg_v0_2_essence_transfer_source_missing");
  if (sourceIndexes.length > 1) throw new Error("tcg_v0_2_essence_transfer_source_ambiguous");
  if (destinationEssenceZone.some((item) => item?.uid === requestedUid)) {
    throw new Error("tcg_v0_2_essence_transfer_destination_duplicate");
  }

  const sourceIndex = sourceIndexes[0];
  const essence = sourceEssenceZone[sourceIndex];
  const instance = objectRecord(essence);
  const actualUid = nonEmpty(instance?.uid, "tcg_v0_2_essence_movement_essence_uid_required");
  if (actualUid !== requestedUid) throw new Error("tcg_v0_2_essence_transfer_source_identity_changed");

  // Validate the complete receipt against an isolated ledger before mutating either attachment array.
  // This keeps malformed state, missing definitions and replayed receipts fail-closed with zero movement.
  const currentLedger = ledger(state);
  if (currentLedger.some((entry) =>
    entry.turn_seq === currentTurn &&
    entry.controller_seat === controller &&
    entry.source_creature_uid === source &&
    entry.destination_creature_uid === destination &&
    entry.essence_uid === requestedUid &&
    entry.source_action_id === action
  )) {
    throw new Error("tcg_v0_2_essence_transfer_receipt_already_exists");
  }
  const validationState: Record<string, unknown> = {
    ...state,
    [LEDGER_KEY]: currentLedger.map((entry) => ({ ...entry })),
  };
  const validated = recordRuntimeV02EssenceMovement(
    validationState,
    controller,
    source,
    destination,
    essence,
    action,
  );
  const movement = validated.find((entry) =>
    entry.controller_seat === controller &&
    entry.source_creature_uid === source &&
    entry.destination_creature_uid === destination &&
    entry.essence_uid === requestedUid &&
    entry.source_action_id === action
  );
  if (!movement) throw new Error("tcg_v0_2_essence_transfer_receipt_missing");
  const validatedLedger = validationState[LEDGER_KEY];
  if (!Array.isArray(validatedLedger)) throw new Error("tcg_v0_2_essence_transfer_ledger_missing");

  const moved = sourceEssenceZone.splice(sourceIndex, 1)[0];
  if (moved !== essence) throw new Error("tcg_v0_2_essence_transfer_source_identity_changed");
  destinationEssenceZone.push(moved);
  state[LEDGER_KEY] = validatedLedger.map((entry) => ({ ...(entry as Record<string, unknown>) }));

  return { essence: moved, movement: { ...movement } };
}

export function runtimeV02CurrentTurnEssenceMovements(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02EssenceMovement[] {
  const currentTurn = turnSeq(state);
  const controller = seat(controllerSeat);
  return ledger(state)
    .filter((entry) => entry.turn_seq === currentTurn && entry.controller_seat === controller)
    .map((entry) => ({ ...entry }));
}
