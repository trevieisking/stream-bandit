import {
  runtimeV02BuildPresentationEnvelope,
  type RuntimeV02PresentationAnchor,
  type RuntimeV02PresentationCue,
  type RuntimeV02PresentationEnvelope,
  type RuntimeV02PresentationSeat,
} from "./tcg-match-presentation-envelope-v0-2.ts";

type RuntimeV02PresentationReceiptInput = {
  event_type: string;
  payload?: Record<string, unknown> | null;
  revision: number;
  state?: Record<string, unknown> | null;
};

function seat(value: unknown): RuntimeV02PresentationSeat | null {
  const number = Number(value);
  return number === 1 || number === 2 ? number as RuntimeV02PresentationSeat : null;
}

function finite(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function nonNegativeInt(value: unknown): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function anchor(
  controllerSeat: RuntimeV02PresentationSeat | null,
  zone: string,
  index?: unknown,
  cardId?: unknown,
): RuntimeV02PresentationAnchor {
  const out: RuntimeV02PresentationAnchor = { zone };
  if (controllerSeat) out.seat = controllerSeat;
  const normalizedIndex = nonNegativeInt(index);
  if (normalizedIndex != null) out.index = normalizedIndex;
  const normalizedCardId = text(cardId);
  if (normalizedCardId) out.card_id = normalizedCardId;
  return out;
}

function publicCue(
  id: string,
  order: number,
  family: RuntimeV02PresentationCue["family"],
  label: string,
  extra: Partial<RuntimeV02PresentationCue> = {},
): RuntimeV02PresentationCue {
  return {
    id,
    order,
    family,
    audience: { kind: "public" },
    intensity: "standard",
    label,
    ...extra,
  };
}

function privateChoiceCue(
  id: string,
  order: number,
  controllerSeat: RuntimeV02PresentationSeat,
  label: string,
  minimum: number,
  maximum: number,
): RuntimeV02PresentationCue {
  return {
    id,
    order,
    family: "choice",
    audience: { kind: "seat", seat: controllerSeat },
    intensity: "standard",
    label,
    choice: {
      choice_id: id,
      min: Math.max(0, Math.trunc(minimum)),
      max: Math.max(Math.max(0, Math.trunc(minimum)), Math.trunc(maximum)),
      selected_count: 0,
    },
  };
}

function addPendingResolutionCues(
  cues: RuntimeV02PresentationCue[],
  state: Record<string, unknown> | null | undefined,
  startOrder: number,
): number {
  const queue = Array.isArray(state?.pending_resolutions) ? state?.pending_resolutions as unknown[] : [];
  const pending = queue.length && queue[0] && typeof queue[0] === "object"
    ? queue[0] as Record<string, unknown>
    : null;
  if (!pending) return startOrder;
  const pendingSeat = seat(pending.seat);
  const kind = text(pending.kind);
  if (kind === "take_reward") {
    const count = nonNegativeInt(pending.count) ?? 0;
    cues.push(publicCue(
      "pending-reward",
      startOrder,
      "reward_followup",
      count === 1 ? "Reward choice required" : `Reward choice required ×${count}`,
      {
        intensity: "hero",
        target: anchor(pendingSeat, "rewards"),
        state_delta: { count },
      },
    ));
    return startOrder + 1;
  }
  if (kind === "promote") {
    cues.push(publicCue(
      "pending-promotion",
      startOrder,
      "defeat",
      "Choose a new Vanguard",
      {
        intensity: "hero",
        target: anchor(pendingSeat, "vanguard"),
      },
    ));
    return startOrder + 1;
  }
  return startOrder;
}

function addTerminalCue(
  cues: RuntimeV02PresentationCue[],
  state: Record<string, unknown> | null | undefined,
  order: number,
): number {
  if (text(state?.phase) !== "complete") return order;
  const result = state?.result && typeof state.result === "object"
    ? state.result as Record<string, unknown>
    : null;
  const winner = seat(result?.winner_seat);
  cues.push(publicCue(
    "match-complete",
    order,
    "notice",
    "Match complete",
    {
      intensity: "hero",
      target: anchor(winner, "player"),
    },
  ));
  return order + 1;
}

function addAttackCues(
  cues: RuntimeV02PresentationCue[],
  eventType: string,
  payload: Record<string, unknown>,
): number {
  const actor = seat(payload.seat);
  const targetSeat = seat(payload.target_seat);
  const targetWhere = text(payload.target_where) || "vanguard";
  const targetIndex = payload.target_index;
  const attackName = text(payload.attack_name || payload.attack) || "Attack";
  const source = anchor(actor, "vanguard");
  const target = anchor(targetSeat, targetWhere, targetIndex);
  let order = 0;

  cues.push(publicCue("attack-source", order++, "source_activation", attackName, {
    intensity: "standard",
    source,
  }));
  if (targetSeat) {
    cues.push(publicCue("attack-target", order++, "target_focus", "Target locked", {
      source,
      target,
    }));
  }
  cues.push(publicCue("attack-windup", order++, "attack_windup", attackName, {
    intensity: "standard",
    source,
    target: targetSeat ? target : null,
  }));

  const dealt = finite(payload.damage_dealt);
  const blocked = finite(payload.shield_prevented);
  if (dealt != null || blocked != null) {
    cues.push(publicCue("attack-impact", order++, "impact", "Impact", {
      intensity: "hero",
      source,
      target: targetSeat ? target : null,
    }));
  }
  if (dealt != null && dealt > 0) {
    cues.push(publicCue("attack-damage", order++, "damage", `${dealt} damage`, {
      intensity: dealt >= 100 ? "hero" : "standard",
      target: targetSeat ? target : null,
      state_delta: { damage: dealt },
    }));
  }
  if (blocked != null && blocked > 0) {
    cues.push(publicCue("attack-shield", order++, "shield_delta", `${blocked} Shield prevented`, {
      target: targetSeat ? target : null,
      state_delta: { shield: -blocked },
    }));
  }

  if (eventType.includes("pending") || payload.pending === true) {
    const chooser = actor;
    if (chooser) {
      const maximum =
        nonNegativeInt(payload.selection_max) ??
        nonNegativeInt(payload.selection_count) ??
        nonNegativeInt(payload.creature_selection_count) ??
        nonNegativeInt(payload.reward_selection_count) ??
        1;
      const minimum = nonNegativeInt(payload.selection_min) ?? Math.min(1, maximum);
      cues.push(publicCue("attack-choice-public", order++, "notice", "Attack effect choice in progress", {
        source,
      }));
      cues.push(privateChoiceCue("attack-choice-private", order++, chooser, "Choose the Attack effect result", minimum, maximum));
    }
  }

  return order;
}

function addAbilityCues(
  cues: RuntimeV02PresentationCue[],
  eventType: string,
  payload: Record<string, unknown>,
): number {
  const actor = seat(payload.seat);
  const targetSeat = seat(payload.target_controller_seat);
  const abilityId = text(payload.ability_id) || "Ability";
  const source = anchor(actor, "field");
  const target = targetSeat ? anchor(targetSeat, "field") : null;
  let order = 0;

  cues.push(publicCue("ability-source", order++, "ability", abilityId, {
    intensity: "standard",
    source,
    target,
  }));

  const drained = finite(payload.actual_vitality_drained);
  if (drained != null && drained > 0) {
    cues.push(publicCue("ability-damage", order++, "damage", `${drained} vitality`, {
      target,
      state_delta: { damage: drained },
    }));
  }
  const healed = finite(payload.actual_heal);
  if (healed != null && healed > 0) {
    cues.push(publicCue("ability-heal", order++, "heal", `${healed} healed`, {
      source,
      state_delta: { heal: healed },
    }));
  }
  const modifier = text(payload.modifier_kind);
  if (modifier) {
    cues.push(publicCue("ability-condition", order++, "condition", modifier, {
      target,
      state_delta: { condition: modifier },
    }));
  }

  if (eventType.includes("pending") || payload.pending === true || payload.pending_heal_listener_choice === true) {
    if (actor) {
      const count =
        nonNegativeInt(payload.creature_selection_count) ??
        nonNegativeInt(payload.reward_selection_count) ??
        1;
      cues.push(publicCue("ability-choice-public", order++, "notice", "Ability choice in progress", {
        source,
      }));
      cues.push(privateChoiceCue("ability-choice-private", order++, actor, "Choose the Ability result", Math.min(1, count), count));
    }
  }

  return order;
}

function addPlayOrMovementCues(
  cues: RuntimeV02PresentationCue[],
  eventType: string,
  payload: Record<string, unknown>,
): number {
  const actor = seat(payload.seat);
  let order = 0;

  if (eventType.startsWith("play_creature")) {
    const reserveIndex = nonNegativeInt(payload.reserve_index);
    cues.push(publicCue("play-creature", order++, "zone_move", "Creature played", {
      source: anchor(actor, "hand"),
      target: anchor(actor, "reserve", reserveIndex, payload.card_id),
      movement: {
        from: anchor(actor, "hand"),
        to: anchor(actor, "reserve", reserveIndex, payload.card_id),
        count: 1,
      },
    }));
  } else if (eventType.startsWith("evolve")) {
    const where = text(payload.where) || "field";
    cues.push(publicCue("evolve", order++, "zone_move", "Creature evolved", {
      intensity: "standard",
      source: anchor(actor, "hand", null, payload.to_card_id),
      target: anchor(actor, where, payload.index, payload.to_card_id),
      movement: {
        from: anchor(actor, "hand", null, payload.to_card_id),
        to: anchor(actor, where, payload.index, payload.to_card_id),
        count: 1,
      },
    }));
  } else if (eventType.startsWith("attach_essence")) {
    const where = text(payload.where) || "field";
    cues.push(publicCue("attach-essence", order++, "zone_move", "Essence attached", {
      intensity: "micro",
      source: anchor(actor, "hand", null, payload.card_id),
      target: anchor(actor, where, payload.index),
      movement: {
        from: anchor(actor, "hand", null, payload.card_id),
        to: anchor(actor, "attached_essence", payload.index, payload.card_id),
        count: 1,
      },
    }));
  } else if (eventType === "attach_relic") {
    const where = text(payload.where) || "field";
    cues.push(publicCue("attach-relic", order++, "zone_move", "Relic attached", {
      source: anchor(actor, "hand", null, payload.card_id),
      target: anchor(actor, where, payload.index),
      movement: {
        from: anchor(actor, "hand", null, payload.card_id),
        to: anchor(actor, "attached_relic", payload.index, payload.card_id),
        count: 1,
      },
    }));
  } else if (eventType.startsWith("play_realm")) {
    cues.push(publicCue("play-realm", order++, "zone_move", "Realm played", {
      source: anchor(actor, "hand", null, payload.card_id),
      target: anchor(actor, "realm", null, payload.card_id),
      movement: {
        from: anchor(actor, "hand", null, payload.card_id),
        to: anchor(actor, "realm", null, payload.card_id),
        count: 1,
      },
    }));
  } else if (eventType.startsWith("withdraw")) {
    const index = nonNegativeInt(payload.reserve_index);
    const cost = nonNegativeInt(payload.cost);
    if (cost != null && cost > 0) {
      cues.push(publicCue("withdraw-payment", order++, "payment", `Withdraw cost ${cost}`, {
        source: anchor(actor, "vanguard"),
        state_delta: { count: cost },
      }));
    }
    cues.push(publicCue("withdraw-vanguard", order++, "zone_move", "Vanguard withdrew", {
      source: anchor(actor, "vanguard"),
      target: anchor(actor, "reserve", index),
      movement: {
        from: anchor(actor, "vanguard"),
        to: anchor(actor, "reserve", index),
        count: 1,
      },
    }));
    cues.push(publicCue("withdraw-promote", order++, "zone_move", "Reserve became Vanguard", {
      source: anchor(actor, "reserve", index),
      target: anchor(actor, "vanguard"),
      movement: {
        from: anchor(actor, "reserve", index),
        to: anchor(actor, "vanguard"),
        count: 1,
      },
    }));
  } else if (eventType.startsWith("promote")) {
    const index = nonNegativeInt(payload.reserve_index);
    cues.push(publicCue("promote", order++, "zone_move", "Reserve promoted to Vanguard", {
      intensity: "hero",
      source: anchor(actor, "reserve", index),
      target: anchor(actor, "vanguard"),
      movement: {
        from: anchor(actor, "reserve", index),
        to: anchor(actor, "vanguard"),
        count: 1,
      },
    }));
  } else if (eventType === "take_reward") {
    const count = nonNegativeInt(payload.count) ?? 0;
    cues.push(publicCue("take-reward", order++, "zone_move", count === 1 ? "Reward taken" : `${count} Rewards taken`, {
      intensity: "hero",
      source: anchor(actor, "rewards"),
      target: anchor(actor, "hand"),
      movement: {
        from: anchor(actor, "rewards"),
        to: anchor(actor, "hand"),
        count,
      },
      state_delta: { count },
    }));
  }

  return order;
}

export function runtimeV02BuildMatchPresentationReceipt(
  input: RuntimeV02PresentationReceiptInput,
): RuntimeV02PresentationEnvelope {
  const eventType = text(input.event_type);
  if (!eventType) throw new Error("tcg_presentation_receipt_event_type_required");
  const revision = nonNegativeInt(input.revision);
  if (revision == null) throw new Error("tcg_presentation_receipt_revision_invalid");
  const payload = input.payload && typeof input.payload === "object" ? input.payload : {};
  const cues: RuntimeV02PresentationCue[] = [];
  let order = 0;

  if (eventType.startsWith("attack") || eventType === "resolve_attack_choice") {
    order = addAttackCues(cues, eventType, payload);
  } else if (
    eventType.startsWith("ability") ||
    eventType === "resolve_ability_choice"
  ) {
    order = addAbilityCues(cues, eventType, payload);
  } else if (
    eventType.startsWith("play_creature") ||
    eventType.startsWith("evolve") ||
    eventType.startsWith("attach_essence") ||
    eventType === "attach_relic" ||
    eventType.startsWith("play_realm") ||
    eventType.startsWith("withdraw") ||
    eventType.startsWith("promote") ||
    eventType === "take_reward"
  ) {
    order = addPlayOrMovementCues(cues, eventType, payload);
  } else if (eventType === "end_turn") {
    cues.push(publicCue("turn-continuation", order++, "turn_continuation", "Turn passed", {
      intensity: "micro",
      source: anchor(seat(payload.seat), "player"),
    }));
  } else if (eventType === "concede") {
    cues.push(publicCue("concede", order++, "notice", "Match conceded", {
      intensity: "hero",
      source: anchor(seat(payload.seat), "player"),
      target: anchor(seat(payload.winner_seat), "player"),
    }));
  }

  order = addPendingResolutionCues(cues, input.state, order);
  order = addTerminalCue(cues, input.state, order);

  const actor = seat(payload.seat);
  const state = input.state && typeof input.state === "object" ? input.state : {};
  const activeSeat = seat(state.active_seat);
  if (
    actor &&
    activeSeat &&
    actor !== activeSeat &&
    text(state.phase) === "play" &&
    !cues.some((cue) => cue.family === "turn_continuation")
  ) {
    cues.push(publicCue("turn-continuation", order++, "turn_continuation", "Turn continues", {
      intensity: "micro",
      target: anchor(activeSeat, "player"),
    }));
  }

  return runtimeV02BuildPresentationEnvelope({
    schema: "tcg-presentation-envelope-v1",
    receipt_id: `match:${revision}:${eventType}`,
    revision,
    action_kind: eventType,
    continuation_id: `${eventType.split("_pending_")[0]}:${revision}`,
    cues,
  });
}
