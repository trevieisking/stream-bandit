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
