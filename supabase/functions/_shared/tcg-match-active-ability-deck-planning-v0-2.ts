import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  type RuntimeV02CardZoneInstance,
} from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02ApplyDeckReorderWithOccurrence,
} from "./tcg-match-deck-reorder-event-v0-2.ts";
import {
  runtimeV02BindDeckTopSet,
  runtimeV02BoundDeckSetAfterRemoval,
  runtimeV02BoundSetChoiceOptions,
  runtimeV02NormalizeChooseFromSetStep,
  runtimeV02RebindBoundDeckSet,
  runtimeV02ResolveBoundSetChoice,
  type RuntimeV02BoundDeckSetProvenance,
  type RuntimeV02BoundSetChoiceOption,
  type RuntimeV02ChooseFromSetDescriptor,
} from "./tcg-match-bound-set-choice-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = RuntimeV02CardZoneInstance;

export type RuntimeV02ActiveAbilityDeckPlanningDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  look: { player: "self"; count: 4; as: string };
  choose: RuntimeV02ChooseFromSetDescriptor & {
    min: 0;
    max: 1;
    grammar: "source_range";
  };
  move: {
    player: "self";
    cards: string;
    to: "deck_bottom";
  };
  remainder: {
    player: "self";
    source: string;
    except: string;
    order: "player_choice";
  };
};

export type RuntimeV02PendingActiveAbilityDeckPlanningChoice = {
  id: string;
  seat: Seat;
  kind: "plan_own_deck_top";
  stage: "choose_bottom" | "order_remainder";
  ability_id: string;
  prompt: string;
  min: number;
  max: number;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  descriptor: RuntimeV02ActiveAbilityDeckPlanningDescriptor;
  provenance: RuntimeV02BoundDeckSetProvenance;
  selected_bottom_count: number;
  options: RuntimeV02BoundSetChoiceOption[];
};

export type RuntimeV02ActiveAbilityDeckPlanningResolution =
  | {
      kind: "plan_own_deck_top";
      stage: "order_required";
      ability_id: string;
      selected_count: number;
      moved_to_deck_bottom_count: number;
      reordered_remainder_count: 0;
      pending_choice: RuntimeV02PendingActiveAbilityDeckPlanningChoice;
      emitted_packet_ids: [];
    }
  | {
      kind: "plan_own_deck_top";
      stage: "complete";
      ability_id: string;
      selected_count: number;
      moved_to_deck_bottom_count: number;
      reordered_remainder_count: number;
      emitted_packet_ids: [];
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

function currentTurn(state: Record<string, unknown>): number {
  const value = Number(state.turn_seq);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_turn_invalid");
  }
  return value;
}

function rejectFields(
  row: Record<string, unknown>,
  allowed: string[],
  code: string,
): void {
  const unsupported = Object.keys(row).find((key) => !allowed.includes(key));
  if (unsupported) throw new Error(`${code}:${unsupported}`);
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
      `tcg_v0_2_active_ability_deck_planning_limit_unsupported:${abilityId}`,
    );
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

function player(
  state: Record<string, unknown>,
  controllerSeat: Seat,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!row || !Array.isArray(row.deck) || !Array.isArray(row.reserve)) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_player_invalid");
  }
  return row;
}

function inst(value: unknown, code: string): Inst {
  const row = objectRecord(value);
  if (!row) throw new Error(code);
  return {
    ...(row as Inst),
    uid: requiredString(row.uid, `${code}:uid`),
    card_id: requiredString(row.card_id, `${code}:card_id`),
  };
}

function sourceTop(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  where: FieldWhere,
  index: number | null,
): Inst {
  const own = player(state, controllerSeat);
  const rawCreature = where === "vanguard"
    ? own.vanguard
    : (own.reserve as unknown[])[Number(index)];
  const creature = objectRecord(rawCreature);
  if (!creature || !Array.isArray(creature.stack) || !creature.stack.length) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_source_missing");
  }
  return inst(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_active_ability_deck_planning_source_top_invalid",
  );
}

function sameSource(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  where: FieldWhere,
  index: number | null,
  uid: string,
  cardId: string,
): void {
  const current = sourceTop(state, controllerSeat, where, index);
  if (current.uid !== uid || current.card_id !== cardId) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_source_changed");
  }
}

function orderDescriptor(
  sourceToken: string,
  count: number,
): RuntimeV02ChooseFromSetDescriptor {
  return {
    source_token: sourceToken,
    min: count,
    max: count,
    filters: {},
    as: "ordered_remainder",
    grammar: "source_range",
  };
}

function validateCommon(
  choice: RuntimeV02PendingActiveAbilityDeckPlanningChoice,
  controllerSeat: Seat,
  choiceId: string,
  state: Record<string, unknown>,
): void {
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_choice_stale_id");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error(
      "tcg_v0_2_active_ability_deck_planning_active_seat_changed",
    );
  }
  sameSource(
    state,
    controllerSeat,
    choice.source_where,
    choice.source_index,
    choice.source_uid,
    choice.source_card_id,
  );
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      choice.ability_id,
    ) !== 1
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_deck_planning_limit_receipt_missing",
    );
  }
}

export function structuredRuntimeActiveAbilityDeckPlanning(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityDeckPlanningDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") {
    return null;
  }
  const creature = objectRecord(definition.creature);
  const ability = objectRecord(creature?.ability);
  if (!ability || ability.mode !== "active" || ability.timing !== "own_turn") {
    return null;
  }
  if (
    ability.event !== null ||
    !Array.isArray(ability.requirements) ||
    ability.requirements.length !== 0 ||
    !Array.isArray(ability.costs) ||
    ability.costs.length !== 0
  ) return null;
  const steps = Array.isArray(ability.steps)
    ? ability.steps.map(objectRecord)
    : [];
  if (steps.length !== 4 || steps.some((step) => !step)) return null;

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_ability_deck_planning_id_required",
  );
  const look = steps[0]!;
  const chooseRaw = steps[1]!;
  const move = steps[2]!;
  const remainder = steps[3]!;

  if (
    look.op !== "LOOK_TOP" ||
    look.player !== "self" ||
    Number(look.count) !== 4
  ) return null;
  rejectFields(
    look,
    ["op", "player", "count", "as"],
    `tcg_v0_2_active_ability_deck_planning_look_field_unsupported:${abilityId}`,
  );
  const lookedAs = requiredString(
    look.as,
    `tcg_v0_2_active_ability_deck_planning_look_var_required:${abilityId}`,
  );

  let choose: RuntimeV02ChooseFromSetDescriptor;
  try {
    choose = runtimeV02NormalizeChooseFromSetStep(chooseRaw);
  } catch {
    return null;
  }
  if (
    choose.grammar !== "source_range" ||
    choose.source_token !== lookedAs ||
    choose.min !== 0 ||
    choose.max !== 1 ||
    Object.keys(choose.filters).length !== 0
  ) return null;

  if (
    move.op !== "MOVE_CARDS" ||
    move.player !== "self" ||
    move.cards !== "$" + choose.as ||
    move.to !== "deck_bottom"
  ) return null;
  rejectFields(
    move,
    ["op", "player", "cards", "to"],
    `tcg_v0_2_active_ability_deck_planning_move_field_unsupported:${abilityId}`,
  );

  if (
    remainder.op !== "RETURN_REMAINDER_TO_DECK_TOP" ||
    remainder.player !== "self" ||
    remainder.source !== "$" + lookedAs ||
    remainder.except !== "$" + choose.as ||
    remainder.order !== "player_choice"
  ) return null;
  rejectFields(
    remainder,
    ["op", "player", "source", "except", "order"],
    `tcg_v0_2_active_ability_deck_planning_remainder_field_unsupported:${abilityId}`,
  );

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit: exactLimit(ability.limit, abilityId),
    look: { player: "self", count: 4, as: lookedAs },
    choose: choose as RuntimeV02ActiveAbilityDeckPlanningDescriptor["choose"],
    move: {
      player: "self",
      cards: `$${choose.as}`,
      to: "deck_bottom",
    },
    remainder: {
      player: "self",
      source: `$${lookedAs}`,
      except: `$${choose.as}`,
      order: "player_choice",
    },
  };
}

export function runtimeV02CreateActiveAbilityDeckPlanningChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilityDeckPlanningDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityDeckPlanningChoice {
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_not_active_seat");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) >= descriptor.limit.count
  ) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_limit_reached");
  }
  const sourceInstance = inst(
    source.instance,
    "tcg_v0_2_active_ability_deck_planning_source_invalid",
  );
  const currentSource = sourceTop(
    state,
    controllerSeat,
    source.where,
    source.index,
  );
  if (
    currentSource.uid !== sourceInstance.uid ||
    currentSource.card_id !== sourceInstance.card_id
  ) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_source_changed");
  }
  const bound = runtimeV02BindDeckTopSet(
    state,
    controllerSeat,
    controllerSeat,
    descriptor.look.count,
    {
      action_kind: "ability",
      source_controller_seat: controllerSeat,
      source_action_id: descriptor.ability_id,
      source_card_uid: sourceInstance.uid,
      source_creature_uid: sourceInstance.uid,
      phase: String(state.phase || "play"),
    },
  );
  const options = runtimeV02BoundSetChoiceOptions(
    state,
    descriptor.choose,
    bound.cards,
  );
  return {
    id: requiredString(
      choiceId,
      "tcg_v0_2_active_ability_deck_planning_choice_id_required",
    ),
    seat: controllerSeat,
    kind: "plan_own_deck_top",
    stage: "choose_bottom",
    ability_id: descriptor.ability_id,
    prompt: "Choose up to one inspected card for the bottom of your deck",
    min: descriptor.choose.min,
    max: Math.min(descriptor.choose.max, options.length),
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceInstance.uid,
    source_card_id: sourceInstance.card_id,
    descriptor: structuredClone(descriptor),
    provenance: structuredClone(bound.provenance),
    selected_bottom_count: 0,
    options,
  };
}

export function runtimeV02PendingActiveAbilityDeckPlanningChoiceView(
  choice: RuntimeV02PendingActiveAbilityDeckPlanningChoice | null | undefined,
  viewerSeat: Seat,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    stage: choice.stage,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
      card_id: option.ref.card_id,
    })),
  };
}

export function runtimeV02ResolveActiveAbilityDeckPlanningChoice(
  choice: RuntimeV02PendingActiveAbilityDeckPlanningChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityDeckPlanningResolution {
  validateCommon(choice, controllerSeat, choiceId, state);
  if (
    !Array.isArray(choiceIds) ||
    new Set(choiceIds).size !== choiceIds.length ||
    choiceIds.length < choice.min ||
    choiceIds.length > choice.max
  ) {
    throw new Error(
      "tcg_v0_2_active_ability_deck_planning_choice_shape_invalid",
    );
  }

  if (choice.stage === "choose_bottom") {
    const current = runtimeV02RebindBoundDeckSet(state, choice.provenance);
    const options = runtimeV02BoundSetChoiceOptions(
      state,
      choice.descriptor.choose,
      current,
    );
    const selected = choiceIds.map((id) => {
      const option = options.find((candidate) => candidate.id === id);
      if (!option) {
        throw new Error(
          "tcg_v0_2_active_ability_deck_planning_selected_changed",
        );
      }
      return option.ref;
    });
    const resolved = runtimeV02ResolveBoundSetChoice(
      state,
      choice.descriptor.choose,
      current,
      selected,
    );
    const own = player(state, controllerSeat);
    if (resolved.length) {
      runtimeV02ApplyDeckReorderWithOccurrence(
        state,
        own.deck as Inst[],
        {
          cause: "effect",
          action_kind: "ability",
          source_action_id: choice.ability_id,
          source_card_uid: choice.source_uid,
          zone: {
            controller_seat: controllerSeat,
            zone: "deck",
            owner_card_uid: null,
          },
          card_uids: resolved.map((card) => card.uid),
          destination_position: "bottom",
        },
        {
          source_controller_seat: controllerSeat,
          phase: String(state.phase || "ability_effect_resolution"),
        },
      );
    }
    const nextProvenance = runtimeV02BoundDeckSetAfterRemoval(
      choice.provenance,
      resolved.map((card) => card.uid),
    );
    const remainder = runtimeV02RebindBoundDeckSet(state, nextProvenance);
    if (remainder.length <= 1) {
      return {
        kind: choice.kind,
        stage: "complete",
        ability_id: choice.ability_id,
        selected_count: resolved.length,
        moved_to_deck_bottom_count: resolved.length,
        reordered_remainder_count: 0,
        emitted_packet_ids: [],
      };
    }
    const order = orderDescriptor(
      choice.descriptor.look.as,
      remainder.length,
    );
    return {
      kind: choice.kind,
      stage: "order_required",
      ability_id: choice.ability_id,
      selected_count: resolved.length,
      moved_to_deck_bottom_count: resolved.length,
      reordered_remainder_count: 0,
      pending_choice: {
        ...choice,
        id: crypto.randomUUID(),
        stage: "order_remainder",
        prompt: "Choose the order of the remaining inspected cards",
        min: remainder.length,
        max: remainder.length,
        provenance: structuredClone(nextProvenance),
        selected_bottom_count: resolved.length,
        options: runtimeV02BoundSetChoiceOptions(state, order, remainder),
      },
      emitted_packet_ids: [],
    };
  }

  if (choice.stage !== "order_remainder") {
    throw new Error(
      "tcg_v0_2_active_ability_deck_planning_stage_invalid",
    );
  }
  const current = runtimeV02RebindBoundDeckSet(state, choice.provenance);
  const order = orderDescriptor(
    choice.descriptor.look.as,
    current.length,
  );
  const options = runtimeV02BoundSetChoiceOptions(state, order, current);
  const selected = choiceIds.map((id) => {
    const option = options.find((candidate) => candidate.id === id);
    if (!option) {
      throw new Error(
        "tcg_v0_2_active_ability_deck_planning_remainder_changed",
      );
    }
    return option.ref;
  });
  const ordered = runtimeV02ResolveBoundSetChoice(
    state,
    order,
    current,
    selected,
  );
  runtimeV02ApplyDeckReorderWithOccurrence(
    state,
    player(state, controllerSeat).deck as Inst[],
    {
      cause: "effect",
      action_kind: "ability",
      source_action_id: choice.ability_id,
      source_card_uid: choice.source_uid,
      zone: {
        controller_seat: controllerSeat,
        zone: "deck",
        owner_card_uid: null,
      },
      card_uids: ordered.map((card) => card.uid),
      destination_position: "top",
    },
    {
      source_controller_seat: controllerSeat,
      phase: String(state.phase || "ability_effect_resolution"),
    },
  );
  return {
    kind: choice.kind,
    stage: "complete",
    ability_id: choice.ability_id,
    selected_count: choice.selected_bottom_count,
    moved_to_deck_bottom_count: choice.selected_bottom_count,
    reordered_remainder_count: ordered.length,
    emitted_packet_ids: [],
  };
}

export type RuntimeV02ActiveAbilityDeckPlanningEventResume = {
  kind: "deck_planning_after_reorder_event";
  turn_seq: number;
  seat: Seat;
  ability_id: string;
  selected_count: number;
  moved_to_deck_bottom_count: number;
  reordered_remainder_count: number;
  pending_choice: RuntimeV02PendingActiveAbilityDeckPlanningChoice | null;
};

export type RuntimeV02ActiveAbilityDeckPlanningEventResumeResolution = {
  kind: "deck_planning_after_reorder_event";
  ability_id: string;
  selected_count: number;
  moved_to_deck_bottom_count: number;
  reordered_remainder_count: number;
  pending_choice: RuntimeV02PendingActiveAbilityDeckPlanningChoice | null;
};

export function runtimeV02ResumeActiveAbilityDeckPlanningEvent(
  state: Record<string, unknown>,
  resume: RuntimeV02ActiveAbilityDeckPlanningEventResume,
): RuntimeV02ActiveAbilityDeckPlanningEventResumeResolution {
  if (currentTurn(state) !== resume.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_resume_turn_stale");
  }
  if (resume.seat !== 1 && resume.seat !== 2) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_resume_seat_invalid");
  }
  if (Number(state.active_seat) !== resume.seat) {
    throw new Error("tcg_v0_2_active_ability_deck_planning_resume_active_seat_changed");
  }
  if (resume.pending_choice) {
    if (
      resume.pending_choice.seat !== resume.seat ||
      resume.pending_choice.turn_seq !== resume.turn_seq ||
      resume.pending_choice.ability_id !== resume.ability_id
    ) {
      throw new Error("tcg_v0_2_active_ability_deck_planning_resume_choice_changed");
    }
  }
  return {
    kind: resume.kind,
    ability_id: resume.ability_id,
    selected_count: resume.selected_count,
    moved_to_deck_bottom_count: resume.moved_to_deck_bottom_count,
    reordered_remainder_count: resume.reordered_remainder_count,
    pending_choice: resume.pending_choice
      ? structuredClone(resume.pending_choice)
      : null,
  };
}
