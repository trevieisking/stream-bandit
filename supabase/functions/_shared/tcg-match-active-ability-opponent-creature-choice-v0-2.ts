import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "./tcg-match-active-ability-choice-v0-2.ts";

export type RuntimeV02ActiveAbilityOpponentCreatureChoiceSource = {
  where: "vanguard" | "reserve";
  index: number | null;
  instance: { uid: string; card_id: string };
};

export type RuntimeV02ActiveAbilityOpponentCreatureOption = {
  id: string;
  label: string;
  where: "vanguard" | "reserve";
  index: number | null;
  anchor_uid: string;
  anchor_card_id: string;
};

export type RuntimeV02PendingActiveAbilityOpponentCreatureChoice = {
  id: string;
  seat: 1 | 2;
  kind: "select_one_opposing_creature";
  ability_id: string;
  prompt: string;
  min: 1;
  max: 1;
  turn_seq: number;
  source_where: "vanguard" | "reserve";
  source_index: number | null;
  source_uid: string;
  source_card_id: string;
  options: RuntimeV02ActiveAbilityOpponentCreatureOption[];
};

export type RuntimeV02ActiveAbilityOpponentCreatureChoiceResolution = {
  ability_id: string;
  choice_id: string;
  target: {
    controller_seat: 1 | 2;
    where: "vanguard" | "reserve";
    index: number | null;
    anchor_uid: string;
    card_id: string;
  };
};

type RuntimeInst = { uid: string; card_id: string };

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

function seat(value: unknown, error: string): 1 | 2 {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_turn_invalid");
  }
  return turn;
}

function runtimeInst(value: unknown, error: string): RuntimeInst {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return {
    uid: requiredString(raw.uid, `${error}:uid`),
    card_id: requiredString(raw.card_id, `${error}:card_id`),
  };
}

function playerForSeat(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): Record<string, unknown> {
  const players = objectRecord(state.players);
  const player = players ? objectRecord(players[String(controllerSeat)]) : null;
  if (!player || !Array.isArray(player.reserve)) {
    throw new Error(`tcg_v0_2_active_ability_opponent_choice_player_invalid:${controllerSeat}`);
  }
  return player;
}

function fieldTop(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  where: "vanguard" | "reserve",
  index: number | null,
): RuntimeInst {
  const player = playerForSeat(state, controllerSeat);
  let creature: Record<string, unknown> | null = null;
  if (where === "vanguard") {
    if (index !== null) {
      throw new Error("tcg_v0_2_active_ability_opponent_choice_vanguard_index_invalid");
    }
    creature = objectRecord(player.vanguard);
  } else {
    if (!Number.isInteger(index) || Number(index) < 0 || Number(index) > 3) {
      throw new Error("tcg_v0_2_active_ability_opponent_choice_reserve_index_invalid");
    }
    creature = objectRecord((player.reserve as unknown[])[Number(index)]);
  }
  if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_creature_missing");
  }
  return runtimeInst(
    creature.stack[creature.stack.length - 1],
    "tcg_v0_2_active_ability_opponent_choice_top_invalid",
  );
}

function assertSource(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityOpponentCreatureChoiceSource,
): RuntimeInst {
  const expected = runtimeInst(
    source.instance,
    "tcg_v0_2_active_ability_opponent_choice_source_identity_invalid",
  );
  const actual = fieldTop(
    state,
    controllerSeat,
    source.where,
    source.index,
  );
  if (actual.uid !== expected.uid || actual.card_id !== expected.card_id) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_source_changed");
  }
  return expected;
}

function opponentOptions(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
): RuntimeV02ActiveAbilityOpponentCreatureOption[] {
  const opponentSeat = controllerSeat === 1 ? 2 : 1;
  const opponent = playerForSeat(state, opponentSeat);
  const out: RuntimeV02ActiveAbilityOpponentCreatureOption[] = [];
  const append = (raw: unknown, where: "vanguard" | "reserve", index: number | null) => {
    const creature = objectRecord(raw);
    if (!creature) return;
    if (!Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_active_ability_opponent_choice_target_stack_invalid");
    }
    const top = runtimeInst(
      creature.stack[creature.stack.length - 1],
      "tcg_v0_2_active_ability_opponent_choice_target_top_invalid",
    );
    out.push({
      id: where === "vanguard"
        ? `opponent:vanguard:${top.uid}`
        : `opponent:reserve:${index}:${top.uid}`,
      label: where === "vanguard" ? "Opposing Vanguard" : `Opposing Reserve ${Number(index) + 1}`,
      where,
      index,
      anchor_uid: top.uid,
      anchor_card_id: top.card_id,
    });
  };
  append(opponent.vanguard, "vanguard", null);
  for (let index = 0; index < 4; index += 1) {
    append((opponent.reserve as unknown[])[index], "reserve", index);
  }
  return out;
}

function sameOptionSet(
  expected: RuntimeV02ActiveAbilityOpponentCreatureOption[],
  actual: RuntimeV02ActiveAbilityOpponentCreatureOption[],
): boolean {
  return JSON.stringify(expected) === JSON.stringify(actual);
}

/**
 * Ability-system private selection facade for the reusable
 * "choose exactly one opposing Creature" shape.
 *
 * It owns only the anchored choice snapshot/revalidation. The active-Ability
 * activation owner must already have completed Payment and recorded the current
 * once-per-turn use receipt. Damage, Heal and Defeat remain separate owners.
 */
export function runtimeV02BuildActiveAbilityOpponentCreatureChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  abilityIdRaw: string,
  source: RuntimeV02ActiveAbilityOpponentCreatureChoiceSource,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityOpponentCreatureChoice {
  const controller = seat(
    controllerSeat,
    "tcg_v0_2_active_ability_opponent_choice_controller_invalid",
  );
  const abilityId = requiredString(
    abilityIdRaw,
    "tcg_v0_2_active_ability_opponent_choice_ability_id_required",
  );
  if (!choiceId) throw new Error("tcg_v0_2_active_ability_opponent_choice_id_required");
  if (state.active_seat !== controller) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_not_active_seat");
  }
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, abilityId) !== 1) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_limit_receipt_missing");
  }
  const instance = assertSource(state, controller, source);
  const options = opponentOptions(state, controller);
  if (!options.length) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_target_unavailable");
  }
  return {
    id: choiceId,
    seat: controller,
    kind: "select_one_opposing_creature",
    ability_id: abilityId,
    prompt: "Choose one opposing Creature",
    min: 1,
    max: 1,
    turn_seq: currentTurn(state),
    source_where: source.where,
    source_index: source.index,
    source_uid: instance.uid,
    source_card_id: instance.card_id,
    options,
  };
}

export function runtimeV02PendingActiveAbilityOpponentCreatureChoiceView(
  choice: RuntimeV02PendingActiveAbilityOpponentCreatureChoice | null | undefined,
  viewerSeat: 1 | 2,
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
    options: choice.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

export function runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
  choice: RuntimeV02PendingActiveAbilityOpponentCreatureChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  selectedIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityOpponentCreatureChoiceResolution {
  const controller = seat(
    controllerSeat,
    "tcg_v0_2_active_ability_opponent_choice_controller_invalid",
  );
  if (choice.seat !== controller) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_not_yours");
  }
  if (!choiceId || choice.id !== choiceId) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_stale_id");
  }
  if (!Array.isArray(selectedIds) || selectedIds.length !== 1) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_exactly_one_required");
  }
  if (currentTurn(state) !== choice.turn_seq) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_turn_changed");
  }
  if (state.active_seat !== controller) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_active_seat_changed");
  }
  if (runtimeV02CurrentTurnActiveAbilityUseCount(state, controller, choice.ability_id) !== 1) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_limit_receipt_missing");
  }
  const source = fieldTop(state, controller, choice.source_where, choice.source_index);
  if (source.uid !== choice.source_uid || source.card_id !== choice.source_card_id) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_source_changed");
  }
  const currentOptions = opponentOptions(state, controller);
  if (!sameOptionSet(choice.options, currentOptions)) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_target_set_changed");
  }
  const selected = choice.options.find((option) => option.id === selectedIds[0]);
  if (!selected) {
    throw new Error("tcg_v0_2_active_ability_opponent_choice_unknown_option");
  }
  return {
    ability_id: choice.ability_id,
    choice_id: choice.id,
    target: {
      controller_seat: controller === 1 ? 2 : 1,
      where: selected.where,
      index: selected.index,
      anchor_uid: selected.anchor_uid,
      card_id: selected.anchor_card_id,
    },
  };
}
