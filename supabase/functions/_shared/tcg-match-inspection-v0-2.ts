import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import {
  runtimeV02InspectRewardPositions,
  type RuntimeV02PrivateRewardInspectionView,
} from "./tcg-match-reward-inspection-v0-2.ts";

type Seat = 1 | 2;
type Inst = { uid: string; card_id: string };

export type RuntimeV02InspectZoneDescriptor =
  | {
      player: "self";
      zone: "rewards";
      min: 1;
      max: 1;
      visibility: "controller_private";
      return_policy: "same_position";
      as: string;
    }
  | {
      player: "opponent";
      zone: "deck_top";
      min: number;
      max: number;
      visibility: "controller_private";
      return_policy: "effect_owned_set";
      as: string;
    };

export type RuntimeV02RewardInspectionChoiceOption = {
  id: string;
  label: string;
  position: number;
  anchor_uid: string;
  anchor_card_id: string;
};

export type RuntimeV02InspectionProvenance = {
  controller_seat: Seat;
  zone_owner_seat: Seat;
  zone: "deck_top";
  return_policy: "effect_owned_set";
  cards: Inst[];
  removed_uids: string[];
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(code);
  return text;
}

function seat(value: unknown, code: string): Seat {
  if (value === 1 || value === 2) return value;
  throw new Error(code);
}

function runtimeInst(value: unknown, code: string): Inst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function player(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!row || !Array.isArray(row.deck) || !Array.isArray(row.rewards)) {
    throw new Error("tcg_v0_2_inspection_player_invalid");
  }
  return row;
}

function selection(raw: unknown): { min: number; max: number } {
  const row = objectRecord(raw);
  if (!row) throw new Error("tcg_v0_2_inspection_selection_required");
  const unsupported = Object.keys(row).find((key) =>
    !["min", "max", "filters"].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_inspection_selection_field_unsupported:${unsupported}`,
    );
  }
  const filters = objectRecord(row.filters);
  if (!filters || Object.keys(filters).length !== 0) {
    throw new Error("tcg_v0_2_inspection_filters_unsupported");
  }
  const min = Number(row.min);
  const max = Number(row.max);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min
  ) throw new Error("tcg_v0_2_inspection_count_invalid");
  return { min, max };
}

export function runtimeV02NormalizeInspectZoneStep(
  raw: unknown,
): RuntimeV02InspectZoneDescriptor {
  const step = objectRecord(raw);
  if (!step || step.op !== "INSPECT_ZONE") {
    throw new Error("tcg_v0_2_inspection_step_required");
  }
  const unsupported = Object.keys(step).find((key) =>
    !["op", "player", "zone", "selection", "visibility", "return_policy", "as"]
      .includes(key)
  );
  if (unsupported) {
    throw new Error(`tcg_v0_2_inspection_step_field_unsupported:${unsupported}`);
  }
  const range = selection(step.selection);
  const variable = requiredString(
    step.as,
    "tcg_v0_2_inspection_variable_required",
  );

  if (
    step.player === "self" &&
    step.zone === "rewards" &&
    step.visibility === "controller_private" &&
    step.return_policy === "same_position" &&
    range.min === 1 &&
    range.max === 1
  ) {
    return {
      player: "self",
      zone: "rewards",
      min: 1,
      max: 1,
      visibility: "controller_private",
      return_policy: "same_position",
      as: variable,
    };
  }

  if (
    step.player === "opponent" &&
    step.zone === "deck_top" &&
    step.visibility === "controller_private" &&
    step.return_policy === "effect_owned_set" &&
    range.min === range.max &&
    range.min > 0
  ) {
    return {
      player: "opponent",
      zone: "deck_top",
      min: range.min,
      max: range.max,
      visibility: "controller_private",
      return_policy: "effect_owned_set",
      as: variable,
    };
  }

  throw new Error("tcg_v0_2_inspection_shape_unsupported");
}

export function runtimeV02RewardInspectionChoiceOptions(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  zoneOwnerSeatRaw: number,
  descriptor: RuntimeV02InspectZoneDescriptor,
): RuntimeV02RewardInspectionChoiceOption[] {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_inspection_controller_invalid",
  );
  const zoneOwnerSeat = seat(
    zoneOwnerSeatRaw,
    "tcg_v0_2_inspection_zone_owner_invalid",
  );
  if (
    descriptor.zone !== "rewards" ||
    descriptor.player !== "self" ||
    descriptor.return_policy !== "same_position" ||
    controllerSeat !== zoneOwnerSeat
  ) throw new Error("tcg_v0_2_inspection_reward_shape_unsupported");

  const rewards = player(state, zoneOwnerSeat).rewards as unknown[];
  if (rewards.length < descriptor.min) {
    throw new Error("tcg_v0_2_inspection_reward_unavailable");
  }
  return rewards.map((raw, position) => {
    const card = runtimeInst(
      raw,
      `tcg_v0_2_inspection_reward_invalid:${position}`,
    );
    return {
      id: `reward:${position}`,
      label: `Reward ${position + 1}`,
      position,
      anchor_uid: card.uid,
      anchor_card_id: card.card_id,
    };
  });
}

export function runtimeV02ResolveRewardInspectionChoice(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  zoneOwnerSeatRaw: number,
  descriptor: RuntimeV02InspectZoneDescriptor,
  option: RuntimeV02RewardInspectionChoiceOption,
): RuntimeV02PrivateRewardInspectionView {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_inspection_controller_invalid",
  );
  const zoneOwnerSeat = seat(
    zoneOwnerSeatRaw,
    "tcg_v0_2_inspection_zone_owner_invalid",
  );
  if (
    descriptor.zone !== "rewards" ||
    controllerSeat !== zoneOwnerSeat
  ) throw new Error("tcg_v0_2_inspection_reward_shape_unsupported");
  const rewards = player(state, zoneOwnerSeat).rewards as unknown[];
  if (
    !Number.isInteger(option.position) ||
    option.position < 0 ||
    option.position >= rewards.length
  ) throw new Error("tcg_v0_2_inspection_reward_position_changed");
  const current = runtimeInst(
    rewards[option.position],
    "tcg_v0_2_inspection_reward_current_invalid",
  );
  if (
    current.uid !== option.anchor_uid ||
    current.card_id !== option.anchor_card_id
  ) throw new Error("tcg_v0_2_inspection_reward_changed");

  const inspected = runtimeV02InspectRewardPositions(
    state,
    controllerSeat,
    [option.position],
  );
  if (
    inspected.cards.length !== 1 ||
    inspected.cards[0].uid !== option.anchor_uid ||
    inspected.cards[0].card_id !== option.anchor_card_id
  ) throw new Error("tcg_v0_2_inspection_reward_resolution_changed");
  return inspected;
}

export function runtimeV02InspectDeckTopEffectOwnedSet(
  state: Record<string, unknown>,
  controllerSeatRaw: number,
  zoneOwnerSeatRaw: number,
  descriptor: RuntimeV02InspectZoneDescriptor,
): { cards: Inst[]; provenance: RuntimeV02InspectionProvenance } {
  const controllerSeat = seat(
    controllerSeatRaw,
    "tcg_v0_2_inspection_controller_invalid",
  );
  const zoneOwnerSeat = seat(
    zoneOwnerSeatRaw,
    "tcg_v0_2_inspection_zone_owner_invalid",
  );
  if (
    descriptor.zone !== "deck_top" ||
    descriptor.player !== "opponent" ||
    descriptor.return_policy !== "effect_owned_set" ||
    controllerSeat === zoneOwnerSeat ||
    descriptor.min !== descriptor.max
  ) throw new Error("tcg_v0_2_inspection_deck_shape_unsupported");

  const deck = player(state, zoneOwnerSeat).deck as unknown[];
  if (deck.length < descriptor.min) {
    throw new Error("tcg_v0_2_inspection_deck_top_unavailable");
  }
  const cards = deck.slice(0, descriptor.max).map((raw, index) =>
    runtimeInst(raw, `tcg_v0_2_inspection_deck_top_invalid:${index}`)
  );
  if (new Set(cards.map((card) => card.uid)).size !== cards.length) {
    throw new Error("tcg_v0_2_inspection_deck_top_uid_duplicate");
  }
  recordRuntimeV02HiddenInformationView(state, controllerSeat, "deck_top");
  return {
    cards: cards.map((card) => ({ ...card })),
    provenance: {
      controller_seat: controllerSeat,
      zone_owner_seat: zoneOwnerSeat,
      zone: "deck_top",
      return_policy: "effect_owned_set",
      cards: cards.map((card) => ({ ...card })),
      removed_uids: [],
    },
  };
}

export function runtimeV02NormalizeInspectionProvenance(
  raw: unknown,
): RuntimeV02InspectionProvenance {
  const row = objectRecord(raw);
  if (!row) throw new Error("tcg_v0_2_inspection_provenance_invalid");
  const unsupported = Object.keys(row).find((key) =>
    ![
      "controller_seat",
      "zone_owner_seat",
      "zone",
      "return_policy",
      "cards",
      "removed_uids",
    ].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_inspection_provenance_field_unsupported:${unsupported}`,
    );
  }
  const controller = seat(
    row.controller_seat,
    "tcg_v0_2_inspection_provenance_controller_invalid",
  );
  const owner = seat(
    row.zone_owner_seat,
    "tcg_v0_2_inspection_provenance_owner_invalid",
  );
  if (
    row.zone !== "deck_top" ||
    row.return_policy !== "effect_owned_set" ||
    controller === owner ||
    !Array.isArray(row.cards) ||
    !Array.isArray(row.removed_uids)
  ) throw new Error("tcg_v0_2_inspection_provenance_shape_invalid");
  const cards = row.cards.map((value, index) =>
    runtimeInst(value, `tcg_v0_2_inspection_provenance_card_invalid:${index}`)
  );
  const removed = row.removed_uids.map((value, index) =>
    requiredString(
      value,
      `tcg_v0_2_inspection_provenance_removed_uid_invalid:${index}`,
    )
  );
  if (
    new Set(cards.map((card) => card.uid)).size !== cards.length ||
    new Set(removed).size !== removed.length ||
    removed.some((uid) => !cards.some((card) => card.uid === uid))
  ) throw new Error("tcg_v0_2_inspection_provenance_identity_invalid");
  return {
    controller_seat: controller,
    zone_owner_seat: owner,
    zone: "deck_top",
    return_policy: "effect_owned_set",
    cards: cards.map((card) => ({ ...card })),
    removed_uids: [...removed],
  };
}

export function runtimeV02RebindInspectionRemainder(
  state: Record<string, unknown>,
  rawProvenance: unknown,
): Inst[] {
  const provenance = runtimeV02NormalizeInspectionProvenance(rawProvenance);
  const removed = new Set(provenance.removed_uids);
  const expected = provenance.cards.filter((card) => !removed.has(card.uid));
  const deck = player(state, provenance.zone_owner_seat).deck as unknown[];
  if (deck.length < expected.length) {
    throw new Error("tcg_v0_2_inspection_deck_top_changed");
  }
  const current = deck.slice(0, expected.length).map((raw, index) =>
    runtimeInst(raw, `tcg_v0_2_inspection_current_deck_top_invalid:${index}`)
  );
  for (let index = 0; index < expected.length; index += 1) {
    if (
      current[index].uid !== expected[index].uid ||
      current[index].card_id !== expected[index].card_id
    ) throw new Error("tcg_v0_2_inspection_deck_top_changed");
  }
  return current.map((card) => ({ ...card }));
}

export function runtimeV02InspectionProvenanceAfterRemoval(
  rawProvenance: unknown,
  removedUids: string[],
): RuntimeV02InspectionProvenance {
  const provenance = runtimeV02NormalizeInspectionProvenance(rawProvenance);
  if (!Array.isArray(removedUids)) {
    throw new Error("tcg_v0_2_inspection_removed_uids_invalid");
  }
  const next = [...provenance.removed_uids];
  for (const raw of removedUids) {
    const uid = requiredString(raw, "tcg_v0_2_inspection_removed_uid_invalid");
    if (!provenance.cards.some((card) => card.uid === uid)) {
      throw new Error("tcg_v0_2_inspection_removed_uid_outside_set");
    }
    if (!next.includes(uid)) next.push(uid);
  }
  return { ...provenance, removed_uids: next };
}
