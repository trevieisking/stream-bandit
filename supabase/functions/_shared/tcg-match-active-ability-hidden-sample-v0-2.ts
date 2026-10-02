import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
  runtimeV02RecordActiveAbilityUse,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeConditions } from "./tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02RandomSampleHiddenZone,
  type RuntimeV02HiddenZoneRandomIndex,
} from "./tcg-match-hidden-zone-sample-v0-2.ts";
import {
  runtimeV02EvaluatePredicateTree,
  type RuntimeV02PredicateLeaf,
} from "./tcg-match-predicate-tree-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = { uid: string; card_id: string };

type Creature = {
  stack: Inst[];
  essence: Inst[];
  damage: number;
  shield: number;
  conditions?: Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
};

export type RuntimeV02ActiveAbilityHiddenSampleDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  requirements: unknown;
  sample: {
    player: "opponent";
    zone: "hand";
    min: number;
    max: number;
    rng_owner: "match";
    visibility: "controller_private";
    as: string;
  };
};

export type RuntimeV02ActiveAbilityHiddenSampleResolution = {
  kind: "sample_opponent_hidden_hand";
  ability_id: string;
  sampled_count: number;
};

export type RuntimeV02PrivateActiveAbilityInspectionView = {
  turn_seq: number;
  controller_seat: Seat;
  zone_owner_seat: Seat;
  zone: "hand";
  cards: Array<{
    position: number;
    uid: string;
    card_id: string;
  }>;
};

const PRIVATE_KEY = "runtime_v0_2_private_active_ability_inspection";

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

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_hidden_sample_turn_invalid");
  }
  return turn;
}

function player(
  state: Record<string, unknown>,
  seat: Seat,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(seat)]) : null;
  if (
    !row ||
    !Array.isArray(row.reserve) ||
    !Array.isArray(row.hand)
  ) {
    throw new Error("tcg_v0_2_active_hidden_sample_player_invalid");
  }
  return row;
}

function inst(value: unknown, code: string): Inst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(code);
  return {
    uid: requiredString(raw.uid, `${code}:uid`),
    card_id: requiredString(raw.card_id, `${code}:card_id`),
  };
}

function creature(value: unknown, code: string): Creature {
  const raw = objectRecord(value);
  if (
    !raw ||
    !Array.isArray(raw.stack) ||
    raw.stack.length < 1 ||
    !Array.isArray(raw.essence)
  ) throw new Error(code);
  return raw as unknown as Creature;
}

function top(cr: Creature, code: string): Inst {
  return inst(cr.stack[cr.stack.length - 1], code);
}

function sourceTop(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const own = player(state, controllerSeat);
  const raw = where === "vanguard"
    ? own.vanguard
    : Number.isInteger(index)
    ? (own.reserve as unknown[])[Number(index)]
    : null;
  const cr = creature(
    raw,
    "tcg_v0_2_active_hidden_sample_source_missing",
  );
  return top(cr, "tcg_v0_2_active_hidden_sample_source_top_invalid");
}

function exactLimit(
  raw: unknown,
  abilityId: string,
): { scope: "turn"; count: 1; owner: "controller" } {
  const limit = objectRecord(raw);
  if (
    !limit ||
    limit.scope !== "turn" ||
    Number(limit.count) !== 1 ||
    limit.owner !== "controller"
  ) {
    throw new Error(
      `tcg_v0_2_active_hidden_sample_limit_unsupported:${abilityId}`,
    );
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

function countRange(
  raw: unknown,
): { min: number; max: number } {
  const value = objectRecord(raw);
  if (!value) {
    throw new Error("tcg_v0_2_active_hidden_sample_count_invalid");
  }
  const min = Number(value.min);
  const max = Number(value.max);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min
  ) {
    throw new Error("tcg_v0_2_active_hidden_sample_count_invalid");
  }
  return { min, max };
}

type RequirementContext = {
  state: Record<string, unknown>;
  controller_seat: Seat;
};

function requirementLeaf(
  value: RuntimeV02PredicateLeaf,
  context: RequirementContext,
): boolean {
  const predicate = requiredString(
    value.predicate,
    "tcg_v0_2_active_hidden_sample_requirement_predicate_required",
  );
  const ownSeat = context.controller_seat;
  const opponentSeat: Seat = ownSeat === 1 ? 2 : 1;

  if (predicate === "hand_count_at_least") {
    const extra = Object.keys(value).find((key) =>
      key !== "predicate" && key !== "player" && key !== "count"
    );
    if (extra) {
      throw new Error(
        `tcg_v0_2_active_hidden_sample_hand_requirement_field_unsupported:${extra}`,
      );
    }
    if (value.player !== "opponent") {
      throw new Error(
        "tcg_v0_2_active_hidden_sample_hand_requirement_player_unsupported",
      );
    }
    const count = Number(value.count);
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(
        "tcg_v0_2_active_hidden_sample_hand_requirement_count_invalid",
      );
    }
    return (player(context.state, opponentSeat).hand as unknown[]).length >= count;
  }

  if (predicate === "control_condition_present") {
    const extra = Object.keys(value).find((key) =>
      key !== "predicate" && key !== "target"
    );
    if (extra) {
      throw new Error(
        `tcg_v0_2_active_hidden_sample_control_requirement_field_unsupported:${extra}`,
      );
    }
    if (value.target !== "$current_opponent_vanguard") {
      throw new Error(
        "tcg_v0_2_active_hidden_sample_control_requirement_target_unsupported",
      );
    }
    const opponent = player(context.state, opponentSeat);
    const vanguard = creature(
      opponent.vanguard,
      "tcg_v0_2_active_hidden_sample_opponent_vanguard_missing",
    );
    return Boolean(runtimeConditions(vanguard).control);
  }

  throw new Error(
    `tcg_v0_2_active_hidden_sample_requirement_unsupported:${predicate}`,
  );
}

function requirementsMatch(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  raw: unknown,
): boolean {
  return runtimeV02EvaluatePredicateTree(
    raw,
    { state, controller_seat: controllerSeat },
    requirementLeaf,
  );
}

function privateRoot(
  state: Record<string, unknown>,
): Record<string, unknown> {
  const existing = objectRecord(state[PRIVATE_KEY]);
  if (existing) return existing;
  const root: Record<string, unknown> = {};
  state[PRIVATE_KEY] = root;
  return root;
}

function setPrivateView(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  zoneOwnerSeat: Seat,
  cards: Inst[],
): void {
  const root = privateRoot(state);
  root[String(controllerSeat)] = {
    turn_seq: currentTurn(state),
    controller_seat: controllerSeat,
    zone_owner_seat: zoneOwnerSeat,
    zone: "hand",
    cards: cards.map((card, position) => ({
      position,
      uid: card.uid,
      card_id: card.card_id,
    })),
  };
}

export function runtimeV02PrivateActiveAbilityInspectionView(
  state: Record<string, unknown>,
  viewerSeat: Seat,
): RuntimeV02PrivateActiveAbilityInspectionView | null {
  const root = objectRecord(state[PRIVATE_KEY]);
  const raw = root ? objectRecord(root[String(viewerSeat)]) : null;
  if (!raw || Number(raw.turn_seq) !== currentTurn(state)) return null;
  if (
    Number(raw.controller_seat) !== viewerSeat ||
    (raw.zone_owner_seat !== 1 && raw.zone_owner_seat !== 2) ||
    raw.zone !== "hand" ||
    !Array.isArray(raw.cards)
  ) return null;
  return {
    turn_seq: currentTurn(state),
    controller_seat: viewerSeat,
    zone_owner_seat: raw.zone_owner_seat,
    zone: "hand",
    cards: raw.cards.map((entry, index) => {
      const card = objectRecord(entry);
      if (!card) {
        throw new Error(
          `tcg_v0_2_active_hidden_sample_private_card_invalid:${index}`,
        );
      }
      return {
        position: Number(card.position),
        uid: requiredString(
          card.uid,
          `tcg_v0_2_active_hidden_sample_private_uid_invalid:${index}`,
        ),
        card_id: requiredString(
          card.card_id,
          `tcg_v0_2_active_hidden_sample_private_card_id_invalid:${index}`,
        ),
      };
    }),
  };
}

export function structuredRuntimeActiveAbilityHiddenSample(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityHiddenSampleDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") {
    return null;
  }
  const creatureDef = objectRecord(definition.creature);
  const ability = objectRecord(creatureDef?.ability);
  if (!ability || ability.mode !== "active") return null;
  if (ability.event !== null || ability.timing !== "own_turn") return null;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;
  const steps = Array.isArray(ability.steps) ? ability.steps.map(objectRecord) : [];
  if (steps.length !== 1 || !steps[0]) return null;
  const step = steps[0];
  if (
    step.op !== "RANDOM_SAMPLE_HIDDEN_ZONE" ||
    step.player !== "opponent" ||
    step.zone !== "hand" ||
    step.rng_owner !== "match" ||
    step.visibility !== "controller_private"
  ) return null;

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_hidden_sample_ability_id_required",
  );
  const range = countRange(step.count);
  const as = requiredString(
    step.as,
    "tcg_v0_2_active_hidden_sample_var_required",
  );

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit: exactLimit(ability.limit, abilityId),
    requirements: structuredClone(ability.requirements),
    sample: {
      player: "opponent",
      zone: "hand",
      min: range.min,
      max: range.max,
      rng_owner: "match",
      visibility: "controller_private",
      as,
    },
  };
}

export function runtimeV02ExecuteActiveAbilityHiddenSample(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  source: {
    where: FieldWhere;
    index: number | null;
    instance: unknown;
  },
  randomIndex?: RuntimeV02HiddenZoneRandomIndex,
): RuntimeV02ActiveAbilityHiddenSampleResolution | null {
  const sourceInst = inst(
    source.instance,
    "tcg_v0_2_active_hidden_sample_source_invalid",
  );
  const descriptor = structuredRuntimeActiveAbilityHiddenSample(
    state,
    sourceInst,
  );
  if (!descriptor) return null;

  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_hidden_sample_not_active_seat");
  }
  const currentSource = sourceTop(
    state,
    controllerSeat,
    source.where,
    source.index,
  );
  if (
    currentSource.uid !== sourceInst.uid ||
    currentSource.card_id !== sourceInst.card_id
  ) {
    throw new Error("tcg_v0_2_active_hidden_sample_source_changed");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) >= descriptor.limit.count
  ) {
    throw new Error("tcg_v0_2_active_hidden_sample_limit_reached");
  }
  if (!requirementsMatch(state, controllerSeat, descriptor.requirements)) {
    throw new Error("tcg_v0_2_active_hidden_sample_requirements_not_met");
  }

  const opponentSeat: Seat = controllerSeat === 1 ? 2 : 1;
  const opponentHand = player(state, opponentSeat).hand as Inst[];
  if (opponentHand.length < descriptor.sample.min) {
    throw new Error("tcg_v0_2_active_hidden_sample_cards_unavailable");
  }
  const count = Math.min(descriptor.sample.max, opponentHand.length);
  const sampled = runtimeV02RandomSampleHiddenZone(
    opponentHand,
    count,
    randomIndex,
  ).map((card, index) =>
    inst(card, `tcg_v0_2_active_hidden_sample_result_invalid:${index}`)
  );

  runtimeV02RecordActiveAbilityUse(
    state,
    controllerSeat,
    descriptor.ability_id,
  );
  setPrivateView(state, controllerSeat, opponentSeat, sampled);

  return {
    kind: "sample_opponent_hidden_hand",
    ability_id: descriptor.ability_id,
    sampled_count: sampled.length,
  };
}
