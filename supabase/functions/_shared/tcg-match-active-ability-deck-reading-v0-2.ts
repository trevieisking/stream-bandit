import { runtimeV02CurrentTurnActiveAbilityUseCount } from "./tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02EvaluateActiveAbilityIf } from "./tcg-match-active-ability-if-v0-2.ts";
import {
  type RuntimeV02CardZoneInstance,
} from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02ApplyDeckReorderWithOccurrence,
} from "./tcg-match-deck-reorder-event-v0-2.ts";
import { recordRuntimeV02HiddenInformationView } from "./tcg-match-hidden-information-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";
import {
  runtimeV02ScheduleAction,
  type RuntimeV02ScheduledDrawFixedStep,
} from "./tcg-match-scheduled-action-v0-2.ts";

type Seat = 1 | 2;
type FieldWhere = "vanguard" | "reserve";
type Inst = RuntimeV02CardZoneInstance;

export type RuntimeV02ActiveAbilityDeckReadingDescriptor = {
  ability_id: string;
  timing: "own_turn";
  limit: { scope: "turn"; count: 1; owner: "controller" };
  inspect: {
    player: "opponent";
    zone: "deck_top";
    min: 1;
    max: 1;
    visibility: "controller_private";
    return_policy: "same_position";
    as: string;
  };
  choose: {
    source: string;
    min: 0;
    max: 1;
    as: string;
  };
  move: {
    player: "opponent";
    cards: string;
    to: "deck_bottom";
  };
  when: {
    predicate: "selected_count_at_least";
    set: string;
    count: 1;
  };
  schedule: {
    owner: "self";
    trigger: "controller_aftermath_finished";
    match_must_be_active: true;
    steps: RuntimeV02ScheduledDrawFixedStep[];
  };
};

export type RuntimeV02ActiveAbilityDeckReadingOption = {
  id: string;
  label: string;
  uid: string;
  card_id: string;
};

export type RuntimeV02PendingActiveAbilityDeckReadingChoice = {
  id: string;
  seat: Seat;
  kind: "inspect_opponent_deck_top_then_optional_bottom";
  ability_id: string;
  prompt: string;
  min: 0;
  max: 1;
  turn_seq: number;
  source_where: FieldWhere;
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  opponent_seat: Seat;
  option: RuntimeV02ActiveAbilityDeckReadingOption;
  selected_var: string;
  when: RuntimeV02ActiveAbilityDeckReadingDescriptor["when"];
  schedule: RuntimeV02ActiveAbilityDeckReadingDescriptor["schedule"];
};

export type RuntimeV02ActiveAbilityDeckReadingResolution = {
  kind: "inspect_opponent_deck_top_then_optional_bottom";
  ability_id: string;
  choice_id: string;
  selected_count: 0 | 1;
  moved_to_deck_bottom_count: 0 | 1;
  scheduled_action_id: string | null;
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
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_turn_invalid");
  }
  return turn;
}

function player(state: Record<string, unknown>, seat: Seat): Record<string, unknown> {
  const players = objectRecord(state.players);
  const row = players ? objectRecord(players[String(seat)]) : null;
  if (
    !row ||
    !Array.isArray(row.reserve) ||
    !Array.isArray(row.deck) ||
    !Array.isArray(row.hand)
  ) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_player_invalid");
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
  const creature = where === "vanguard"
    ? objectRecord(own.vanguard)
    : Number.isInteger(index)
    ? objectRecord((own.reserve as unknown[])[Number(index)])
    : null;
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_source_missing");
  }
  return inst(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_active_ability_deck_reading_source_top_invalid",
  );
}

function sameInst(actual: Inst, expected: Inst, code: string): void {
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error(code);
  }
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
      `tcg_v0_2_active_ability_deck_reading_limit_unsupported:${abilityId}`,
    );
  }
  return { scope: "turn", count: 1, owner: "controller" };
}

function cardLabel(state: Record<string, unknown>, card: Inst): string {
  const definition = runtimeV02Definition(state, card);
  return String(definition?.name || card.card_id);
}

export function structuredRuntimeActiveAbilityDeckReading(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): RuntimeV02ActiveAbilityDeckReadingDescriptor | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition || String(definition.card_family || "") !== "Creature") return null;
  const creature = objectRecord(definition.creature);
  const ability = objectRecord(creature?.ability);
  if (!ability || ability.mode !== "active") return null;
  if (ability.timing !== "own_turn") return null;
  if (!Array.isArray(ability.requirements) || ability.requirements.length !== 0) return null;
  if (!Array.isArray(ability.costs) || ability.costs.length !== 0) return null;
  const steps = Array.isArray(ability.steps) ? ability.steps.map(objectRecord) : [];
  if (steps.length !== 4 || steps.some((step) => !step)) return null;

  const abilityId = requiredString(
    ability.id,
    "tcg_v0_2_active_ability_deck_reading_id_required",
  );
  const inspect = steps[0]!;
  const choose = steps[1]!;
  const move = steps[2]!;
  const conditional = steps[3]!;
  if (
    inspect.op !== "INSPECT_ZONE" ||
    inspect.player !== "opponent" ||
    inspect.zone !== "deck_top" ||
    inspect.visibility !== "controller_private" ||
    inspect.return_policy !== "same_position"
  ) return null;
  const selection = objectRecord(inspect.selection);
  if (
    !selection ||
    Number(selection.min) !== 1 ||
    Number(selection.max) !== 1 ||
    !objectRecord(selection.filters) ||
    Object.keys(objectRecord(selection.filters)!).length !== 0
  ) return null;
  const lookedAs = requiredString(
    inspect.as,
    `tcg_v0_2_active_ability_deck_reading_looked_var_required:${abilityId}`,
  );

  if (
    choose.op !== "CHOOSE_FROM_SET" ||
    String(choose.source || "") !== `$${lookedAs}` ||
    Number(choose.min) !== 0 ||
    Number(choose.max) !== 1
  ) return null;
  const bottomAs = requiredString(
    choose.as,
    `tcg_v0_2_active_ability_deck_reading_selected_var_required:${abilityId}`,
  );

  if (
    move.op !== "MOVE_CARDS" ||
    move.player !== "opponent" ||
    String(move.cards || "") !== `$${bottomAs}` ||
    move.to !== "deck_bottom"
  ) return null;

  if (conditional.op !== "IF" || conditional.else != null) return null;
  const when = objectRecord(conditional.when);
  const then = Array.isArray(conditional.then) ? conditional.then.map(objectRecord) : [];
  if (
    !when ||
    when.predicate !== "selected_count_at_least" ||
    String(when.set || "") !== `$${bottomAs}` ||
    Number(when.count) !== 1 ||
    then.length !== 1 ||
    !then[0]
  ) return null;
  const schedule = then[0]!;
  if (
    schedule.op !== "SCHEDULE_ACTION" ||
    schedule.owner !== "self" ||
    schedule.trigger !== "controller_aftermath_finished" ||
    schedule.match_must_be_active !== true ||
    !Array.isArray(schedule.steps) ||
    schedule.steps.length !== 1
  ) return null;
  const draw = objectRecord(schedule.steps[0]);
  if (
    !draw ||
    draw.op !== "DRAW_FIXED" ||
    draw.player !== "opponent" ||
    Number(draw.count) !== 1 ||
    draw.deckout_on_incomplete !== true
  ) return null;

  return {
    ability_id: abilityId,
    timing: "own_turn",
    limit: exactLimit(ability.limit, abilityId),
    inspect: {
      player: "opponent",
      zone: "deck_top",
      min: 1,
      max: 1,
      visibility: "controller_private",
      return_policy: "same_position",
      as: lookedAs,
    },
    choose: {
      source: `$${lookedAs}`,
      min: 0,
      max: 1,
      as: bottomAs,
    },
    move: {
      player: "opponent",
      cards: `$${bottomAs}`,
      to: "deck_bottom",
    },
    when: {
      predicate: "selected_count_at_least",
      set: `$${bottomAs}`,
      count: 1,
    },
    schedule: {
      owner: "self",
      trigger: "controller_aftermath_finished",
      match_must_be_active: true,
      steps: [{
        op: "DRAW_FIXED",
        player: "opponent",
        count: 1,
        deckout_on_incomplete: true,
      }],
    },
  };
}

export function runtimeV02CreateActiveAbilityDeckReadingChoice(
  state: Record<string, unknown>,
  controllerSeat: Seat,
  descriptor: RuntimeV02ActiveAbilityDeckReadingDescriptor,
  source: { where: FieldWhere; index: number | null; instance: unknown },
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityDeckReadingChoice {
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_not_active_seat");
  }
  if (
    runtimeV02CurrentTurnActiveAbilityUseCount(
      state,
      controllerSeat,
      descriptor.ability_id,
    ) >= descriptor.limit.count
  ) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_limit_reached");
  }
  const sourceInstance = inst(
    source.instance,
    "tcg_v0_2_active_ability_deck_reading_source_invalid",
  );
  sameInst(
    sourceTop(state, controllerSeat, source.where, source.index),
    sourceInstance,
    "tcg_v0_2_active_ability_deck_reading_source_changed",
  );

  const opponentSeat: Seat = controllerSeat === 1 ? 2 : 1;
  const opponent = player(state, opponentSeat);
  const deck = opponent.deck as Inst[];
  if (deck.length < 1) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_deck_top_unavailable");
  }
  const top = inst(deck[0], "tcg_v0_2_active_ability_deck_reading_top_invalid");
  recordRuntimeV02HiddenInformationView(state, controllerSeat, "deck_top", {
    action_kind: "ability",
    source_controller_seat: controllerSeat,
    source_action_id: descriptor.ability_id,
    source_card_uid: sourceInstance.uid,
    source_creature_uid: sourceInstance.uid,
    phase: String(state.phase || "play"),
  });

  return {
    id: requiredString(
      choiceId,
      "tcg_v0_2_active_ability_deck_reading_choice_id_required",
    ),
    seat: controllerSeat,
    kind: "inspect_opponent_deck_top_then_optional_bottom",
    ability_id: descriptor.ability_id,
    prompt: "Choose whether to move the inspected top card to the bottom",
    min: 0,
    max: 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: sourceInstance.uid,
    source_card_id: sourceInstance.card_id,
    opponent_seat: opponentSeat,
    option: {
      id: `card:${top.uid}`,
      label: cardLabel(state, top),
      uid: top.uid,
      card_id: top.card_id,
    },
    selected_var: descriptor.choose.as,
    when: structuredClone(descriptor.when),
    schedule: structuredClone(descriptor.schedule),
  };
}

export function runtimeV02PendingActiveAbilityDeckReadingChoiceView(
  choice: RuntimeV02PendingActiveAbilityDeckReadingChoice | null | undefined,
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
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: [{
      id: choice.option.id,
      label: choice.option.label,
      card_id: choice.option.card_id,
    }],
  };
}

export function runtimeV02ResolveActiveAbilityDeckReadingChoice(
  choice: RuntimeV02PendingActiveAbilityDeckReadingChoice,
  controllerSeat: Seat,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityDeckReadingResolution {
  if (choice.kind !== "inspect_opponent_deck_top_then_optional_bottom") {
    throw new Error("tcg_v0_2_active_ability_deck_reading_choice_kind_invalid");
  }
  if (choice.seat !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_choice_stale_id");
  }
  if (
    !Array.isArray(choiceIds) ||
    choiceIds.length > 1 ||
    new Set(choiceIds).size !== choiceIds.length
  ) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_choice_count_invalid");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_turn_changed");
  }
  if (Number(state.active_seat) !== controllerSeat) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_active_seat_changed");
  }
  sameInst(
    sourceTop(state, controllerSeat, choice.source_where, choice.source_index),
    { uid: choice.source_uid, card_id: choice.source_card_id },
    "tcg_v0_2_active_ability_deck_reading_source_changed",
  );

  const opponent = player(state, choice.opponent_seat);
  const deck = opponent.deck as Inst[];
  if (deck.length < 1) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_top_changed");
  }
  const top = inst(deck[0], "tcg_v0_2_active_ability_deck_reading_top_invalid");
  sameInst(
    top,
    { uid: choice.option.uid, card_id: choice.option.card_id },
    "tcg_v0_2_active_ability_deck_reading_top_changed",
  );

  const selected = choiceIds.length === 1;
  if (selected && choiceIds[0] !== choice.option.id) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_unknown_option");
  }
  const selectedSet = selected ? [top] : [];
  if (selected) {
    runtimeV02ApplyDeckReorderWithOccurrence(
      state,
      deck,
      {
        cause: "effect",
        action_kind: "ability",
        source_action_id: choice.ability_id,
        source_card_uid: choice.source_uid,
        zone: {
          controller_seat: choice.opponent_seat,
          zone: "deck",
          owner_card_uid: null,
        },
        card_uids: [top.uid],
        destination_position: "bottom",
      },
      {
        source_controller_seat: controllerSeat,
        phase: String(state.phase || "ability_effect_resolution"),
      },
    );
  }

  const ifMatched = runtimeV02EvaluateActiveAbilityIf(choice.when, {
    sets: { [choice.selected_var]: selectedSet },
    creatures: {},
    essence_moves: {},
  });
  let scheduledActionId: string | null = null;
  if (ifMatched) {
    const scheduled = runtimeV02ScheduleAction(
      state as any,
      {
        owner_seat: controllerSeat,
        source_action_id: choice.ability_id,
        source_card_uid: choice.source_uid,
        trigger: choice.schedule.trigger,
        match_must_be_active: choice.schedule.match_must_be_active,
        steps: choice.schedule.steps,
      },
    );
    scheduledActionId = scheduled.id;
  }

  return {
    kind: choice.kind,
    ability_id: choice.ability_id,
    choice_id: choice.id,
    selected_count: selected ? 1 : 0,
    moved_to_deck_bottom_count: selected ? 1 : 0,
    scheduled_action_id: scheduledActionId,
    emitted_packet_ids: [],
  };
}

export type RuntimeV02ActiveAbilityDeckReadingEventResume = {
  kind: "deck_reading_after_reorder_event";
  turn_seq: number;
  seat: Seat;
  ability_id: string;
  selected_count: 0 | 1;
  moved_to_deck_bottom_count: 0 | 1;
  scheduled_action_id: string | null;
};

export type RuntimeV02ActiveAbilityDeckReadingEventResumeResolution = {
  kind: "deck_reading_after_reorder_event";
  ability_id: string;
  selected_count: 0 | 1;
  moved_to_deck_bottom_count: 0 | 1;
  scheduled_action_id: string | null;
};

export function runtimeV02ResumeActiveAbilityDeckReadingEvent(
  state: Record<string, unknown>,
  resume: RuntimeV02ActiveAbilityDeckReadingEventResume,
): RuntimeV02ActiveAbilityDeckReadingEventResumeResolution {
  if (currentTurn(state) !== resume.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_resume_turn_stale");
  }
  if (resume.seat !== 1 && resume.seat !== 2) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_resume_seat_invalid");
  }
  if (Number(state.active_seat) !== resume.seat) {
    throw new Error("tcg_v0_2_active_ability_deck_reading_resume_active_seat_changed");
  }
  return {
    kind: resume.kind,
    ability_id: resume.ability_id,
    selected_count: resume.selected_count,
    moved_to_deck_bottom_count: resume.moved_to_deck_bottom_count,
    scheduled_action_id: resume.scheduled_action_id,
  };
}
