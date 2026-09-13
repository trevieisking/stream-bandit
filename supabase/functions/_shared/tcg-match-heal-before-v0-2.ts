import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

type RuntimeV02BeforeHealSeat = 1 | 2;

type RuntimeV02BeforeHealInstance = {
  uid: string;
  card_id: string;
  effect_flags?: Record<string, unknown>;
};

type RuntimeV02BeforeHealCreature = {
  stack: RuntimeV02BeforeHealInstance[];
  essence?: RuntimeV02BeforeHealInstance[];
  relic?: RuntimeV02BeforeHealInstance | null;
  damage?: number;
};

type RuntimeV02BeforeHealField = {
  seat: RuntimeV02BeforeHealSeat;
  where: "vanguard" | "reserve";
  index: number | null;
  creature: RuntimeV02BeforeHealCreature;
  top: RuntimeV02BeforeHealInstance;
  definition: Record<string, unknown>;
};

type RuntimeV02BeforeHealCandidate = {
  kind: "ability" | "essence" | "relic" | "realm";
  source: RuntimeV02BeforeHealInstance;
  seat: RuntimeV02BeforeHealSeat;
  field: RuntimeV02BeforeHealField | null;
  listener: Record<string, unknown>;
};

export type RuntimeV02BeforeHealContext = {
  source: {
    controller_seat: RuntimeV02BeforeHealSeat;
    action_kind: string;
    action_id: string;
    card_effect: boolean;
    card_uid: string | null;
    card_id: string | null;
    creature_uid: string | null;
  };
  target: {
    controller_seat: RuntimeV02BeforeHealSeat;
    creature_uid: string;
    card_uid: string;
    card_id: string;
    element: string;
    where: "vanguard" | "reserve";
    index: number | null;
  };
};

export type RuntimeV02BeforeHealModifierResult = {
  requested_amount: number;
  modified_amount: number;
  applied: Array<{
    listener_id: string;
    source_uid: string;
    source_card_id: string;
    source_kind: RuntimeV02BeforeHealCandidate["kind"];
    before_amount: number;
    after_amount: number;
  }>;
};

type RuntimeV02BeforeHealLimit = {
  key: string;
  count: number;
  owner: string;
};

type RuntimeV02BeforeHealPlanItem = {
  candidate: RuntimeV02BeforeHealCandidate;
  limit: RuntimeV02BeforeHealLimit;
  steps: Record<string, unknown>[];
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(error);
}

function requiredSeat(value: unknown, error: string): RuntimeV02BeforeHealSeat {
  if (value === 1 || value === 2) return value;
  throw new Error(error);
}

function finiteAmount(value: unknown, error: string): number {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error(error);
  return amount;
}

function nonNegativeAmount(value: unknown, error: string): number {
  const amount = finiteAmount(value, error);
  if (amount < 0) throw new Error(error);
  return amount;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_before_heal_turn_invalid");
  }
  return turn;
}

function activeSeat(state: Record<string, unknown>): RuntimeV02BeforeHealSeat {
  return requiredSeat(
    state.active_seat,
    "tcg_v0_2_before_heal_active_seat_invalid",
  );
}

function instance(
  value: unknown,
  error: string,
): RuntimeV02BeforeHealInstance {
  const raw = objectRecord(value);
  if (!raw) throw new Error(error);
  return raw as RuntimeV02BeforeHealInstance & {
    uid: string;
    card_id: string;
  } satisfies RuntimeV02BeforeHealInstance;
}

function validatedInstance(
  value: unknown,
  error: string,
): RuntimeV02BeforeHealInstance {
  const raw = instance(value, error);
  requiredString(raw.uid, `${error}:uid`);
  requiredString(raw.card_id, `${error}:card_id`);
  return raw;
}

function definition(
  state: Record<string, unknown>,
  source: RuntimeV02BeforeHealInstance,
): Record<string, unknown> {
  const value = runtimeV02Definition(state, source);
  if (!value) {
    throw new Error(`tcg_v0_2_before_heal_definition_missing:${source.card_id}`);
  }
  return value;
}

function structuredEnabled(state: Record<string, unknown>): boolean {
  const index = objectRecord(state.card_index);
  if (!index) return false;
  const first = Object.keys(index)[0];
  return !!(first && runtimeV02Definition(state, first));
}

function fields(state: Record<string, unknown>): RuntimeV02BeforeHealField[] {
  const players = objectRecord(state.players);
  if (!players) throw new Error("tcg_v0_2_before_heal_players_required");
  const result: RuntimeV02BeforeHealField[] = [];
  for (const seat of [1, 2] as const) {
    const player = objectRecord(players[String(seat)]);
    if (!player) throw new Error(`tcg_v0_2_before_heal_player_required:${seat}`);
    const reserve = player.reserve;
    if (reserve != null && !Array.isArray(reserve)) {
      throw new Error(`tcg_v0_2_before_heal_reserve_invalid:${seat}`);
    }
    const slots: Array<{
      where: "vanguard" | "reserve";
      index: number | null;
      creature: unknown;
    }> = [
      { where: "vanguard", index: null, creature: player.vanguard },
      ...[0, 1, 2, 3].map((index) => ({
        where: "reserve" as const,
        index,
        creature: Array.isArray(reserve) ? reserve[index] : null,
      })),
    ];
    for (const slot of slots) {
      if (slot.creature == null) continue;
      const creature = objectRecord(slot.creature) as
        | RuntimeV02BeforeHealCreature
        | null;
      if (!creature || !Array.isArray(creature.stack) || !creature.stack.length) {
        throw new Error("tcg_v0_2_before_heal_creature_invalid");
      }
      const top = validatedInstance(
        creature.stack[creature.stack.length - 1],
        "tcg_v0_2_before_heal_top_invalid",
      );
      result.push({
        seat,
        where: slot.where,
        index: slot.index,
        creature,
        top,
        definition: definition(state, top),
      });
    }
  }
  return result;
}

function listenerId(candidate: RuntimeV02BeforeHealCandidate): string {
  return requiredString(
    candidate.listener.id,
    "tcg_v0_2_before_heal_listener_id_required",
  );
}

function addListeners(
  out: RuntimeV02BeforeHealCandidate[],
  kind: RuntimeV02BeforeHealCandidate["kind"],
  source: RuntimeV02BeforeHealInstance,
  seat: RuntimeV02BeforeHealSeat,
  field: RuntimeV02BeforeHealField | null,
  rawListeners: unknown,
): void {
  if (rawListeners == null) return;
  if (!Array.isArray(rawListeners)) {
    throw new Error("tcg_v0_2_before_heal_listener_list_invalid");
  }
  for (const raw of rawListeners) {
    const listener = objectRecord(raw);
    if (!listener) throw new Error("tcg_v0_2_before_heal_listener_invalid");
    if (String(listener.event || "") !== "before_heal_packet") continue;
    requiredString(listener.id, "tcg_v0_2_before_heal_listener_id_required");
    out.push({ kind, source, seat, field, listener });
  }
}

function collectCandidates(
  state: Record<string, unknown>,
): RuntimeV02BeforeHealCandidate[] {
  const out: RuntimeV02BeforeHealCandidate[] = [];
  for (const field of fields(state)) {
    const creature = objectRecord(field.definition.creature);
    const ability = objectRecord(creature?.ability);
    if (ability && String(ability.event || "") === "before_heal_packet") {
      if (String(ability.mode || "") !== "triggered") {
        throw new Error("tcg_v0_2_before_heal_ability_mode_unsupported");
      }
      out.push({
        kind: "ability",
        source: field.top,
        seat: field.seat,
        field,
        listener: ability,
      });
    }

    if (
      field.creature.essence != null &&
      !Array.isArray(field.creature.essence)
    ) {
      throw new Error("tcg_v0_2_before_heal_essence_zone_invalid");
    }
    for (const raw of field.creature.essence || []) {
      const source = validatedInstance(
        raw,
        "tcg_v0_2_before_heal_essence_invalid",
      );
      const card = definition(state, source);
      const essence = objectRecord(card.essence);
      if (String(card.card_family || "") !== "Essence" || !essence) {
        throw new Error("tcg_v0_2_before_heal_essence_definition_invalid");
      }
      addListeners(out, "essence", source, field.seat, field, essence.listeners);
    }

    if (field.creature.relic != null) {
      const source = validatedInstance(
        field.creature.relic,
        "tcg_v0_2_before_heal_relic_invalid",
      );
      const card = definition(state, source);
      const tactic = objectRecord(card.tactic);
      if (
        String(card.card_family || "") !== "Tactic" ||
        String(tactic?.subtype || "") !== "Relic"
      ) {
        throw new Error("tcg_v0_2_before_heal_relic_definition_invalid");
      }
      addListeners(out, "relic", source, field.seat, field, tactic?.listeners);
    }
  }

  const realm = objectRecord(state.realm);
  if (realm) {
    const source = validatedInstance(
      realm.card,
      "tcg_v0_2_before_heal_realm_invalid",
    );
    const card = definition(state, source);
    const tactic = objectRecord(card.tactic);
    if (
      String(card.card_family || "") !== "Tactic" ||
      String(tactic?.subtype || "") !== "Realm"
    ) {
      throw new Error("tcg_v0_2_before_heal_realm_definition_invalid");
    }
    addListeners(
      out,
      "realm",
      source,
      requiredSeat(
        realm.owner_seat,
        "tcg_v0_2_before_heal_realm_owner_invalid",
      ),
      null,
      tactic?.listeners,
    );
  }

  const seen = new Set<string>();
  for (const candidate of out) {
    const key = `${candidate.source.uid}:${listenerId(candidate)}`;
    if (seen.has(key)) {
      throw new Error("tcg_v0_2_before_heal_duplicate_source_listener");
    }
    seen.add(key);
  }
  return out;
}

function validateContext(
  state: Record<string, unknown>,
  context: RuntimeV02BeforeHealContext,
): RuntimeV02BeforeHealContext {
  const source = objectRecord(context?.source);
  const target = objectRecord(context?.target);
  if (!source || !target) {
    throw new Error("tcg_v0_2_before_heal_context_invalid");
  }
  requiredSeat(
    source.controller_seat,
    "tcg_v0_2_before_heal_source_seat_invalid",
  );
  requiredString(
    source.action_kind,
    "tcg_v0_2_before_heal_source_action_kind_required",
  );
  requiredString(
    source.action_id,
    "tcg_v0_2_before_heal_source_action_id_required",
  );
  if (typeof source.card_effect !== "boolean") {
    throw new Error("tcg_v0_2_before_heal_card_effect_required");
  }
  requiredSeat(
    target.controller_seat,
    "tcg_v0_2_before_heal_target_seat_invalid",
  );
  requiredString(
    target.creature_uid,
    "tcg_v0_2_before_heal_target_creature_uid_required",
  );
  requiredString(
    target.card_id,
    "tcg_v0_2_before_heal_target_card_id_required",
  );
  requiredString(
    target.element,
    "tcg_v0_2_before_heal_target_element_required",
  );
  currentTurn(state);
  activeSeat(state);
  return context;
}

function predicate(
  raw: unknown,
  context: RuntimeV02BeforeHealContext,
  candidate: RuntimeV02BeforeHealCandidate,
  state: Record<string, unknown>,
): boolean {
  const value = objectRecord(raw);
  if (!value) throw new Error("tcg_v0_2_before_heal_requirement_invalid");
  if (Object.hasOwn(value, "all")) {
    if (Object.keys(value).length !== 1 || !Array.isArray(value.all)) {
      throw new Error("tcg_v0_2_before_heal_all_invalid");
    }
    return value.all.every((item) => predicate(item, context, candidate, state));
  }
  if (Object.hasOwn(value, "any")) {
    if (
      Object.keys(value).length !== 1 ||
      !Array.isArray(value.any) ||
      value.any.length === 0
    ) {
      throw new Error("tcg_v0_2_before_heal_any_invalid");
    }
    return value.any.some((item) => predicate(item, context, candidate, state));
  }
  if (Object.hasOwn(value, "not")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_before_heal_not_invalid");
    }
    return !predicate(value.not, context, candidate, state);
  }

  const name = requiredString(
    value.predicate,
    "tcg_v0_2_before_heal_predicate_required",
  );
  const attachedUid = candidate.field?.top.uid || null;
  const attachedDefinition = candidate.field?.definition;
  const attachedCreature = objectRecord(attachedDefinition?.creature);
  switch (name) {
    case "heal_packet_target_is_attached_creature":
      return !!attachedUid && context.target.creature_uid === attachedUid;
    case "heal_packet_source_is_attached_creature":
      return !!attachedUid && context.source.creature_uid === attachedUid;
    case "heal_packet_source_action_kind_is":
      return context.source.action_kind === requiredString(
        value.action_kind,
        "tcg_v0_2_before_heal_action_kind_required",
      );
    case "heal_source_is_card_effect":
      return context.source.card_effect === true;
    case "heal_packet_target_controller_is_self":
      return context.target.controller_seat === candidate.seat;
    case "heal_packet_target_is_not_source":
      return context.target.creature_uid !== context.source.creature_uid;
    case "heal_target_element_is":
      return context.target.element === String(value.element || "");
    case "heal_controller_is_active_seat":
      return context.source.controller_seat === activeSeat(state);
    case "target_stage_in": {
      if (
        String(value.target || "") !== "$attached_creature" ||
        !Array.isArray(value.stages) ||
        value.stages.length === 0
      ) {
        throw new Error("tcg_v0_2_before_heal_stage_metadata_invalid");
      }
      return value.stages.map(String).includes(String(attachedCreature?.stage || ""));
    }
    case "target_element_is":
      if (String(value.target || "") !== "$attached_creature") {
        throw new Error("tcg_v0_2_before_heal_element_target_unsupported");
      }
      return String(attachedDefinition?.element || "") === String(value.element || "");
    default:
      throw new Error(`tcg_v0_2_before_heal_predicate_unsupported:${name}`);
  }
}

function matches(
  state: Record<string, unknown>,
  context: RuntimeV02BeforeHealContext,
  candidate: RuntimeV02BeforeHealCandidate,
): boolean {
  if (candidate.kind === "ability") {
    const timing = candidate.listener.timing == null
      ? "any"
      : String(candidate.listener.timing);
    if (timing === "own_turn" && candidate.seat !== activeSeat(state)) {
      return false;
    }
    if (!["own_turn", "any", "passive"].includes(timing)) {
      throw new Error(`tcg_v0_2_before_heal_timing_unsupported:${timing}`);
    }
  }
  const scope = candidate.listener.controller_scope;
  if (scope != null) {
    const value = String(scope);
    if (value === "self") {
      if (context.source.controller_seat !== candidate.seat) return false;
    } else if (value !== "any") {
      throw new Error("tcg_v0_2_before_heal_controller_scope_unsupported");
    }
  }
  return candidate.listener.requirements == null ||
    predicate(candidate.listener.requirements, context, candidate, state);
}

function limit(
  candidate: RuntimeV02BeforeHealCandidate,
): RuntimeV02BeforeHealLimit {
  const raw = objectRecord(candidate.listener.limit);
  if (!raw) {
    throw new Error("tcg_v0_2_before_heal_limit_required");
  }
  if (String(raw.scope || "") !== "turn") {
    throw new Error("tcg_v0_2_before_heal_limit_scope_unsupported");
  }
  const count = Number(raw.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("tcg_v0_2_before_heal_limit_count_invalid");
  }
  const owner = String(raw.owner || "");
  let ownerKey: string;
  if (owner === "card_instance") {
    ownerKey = `card:${candidate.source.uid}`;
  } else if (owner === "attachment") {
    if (candidate.kind !== "essence" && candidate.kind !== "relic") {
      throw new Error("tcg_v0_2_before_heal_attachment_owner_invalid");
    }
    ownerKey = `attachment:${candidate.source.uid}`;
  } else if (owner === "event_controller") {
    ownerKey = `event-controller:${candidate.seat}`;
  } else {
    throw new Error(`tcg_v0_2_before_heal_limit_owner_unsupported:${owner}`);
  }
  return {
    key: `${listenerId(candidate)}:${ownerKey}`,
    count,
    owner,
  };
}

function limitState(
  candidate: RuntimeV02BeforeHealCandidate,
  create = false,
): Record<string, unknown> | null {
  if (candidate.source.effect_flags == null) {
    if (!create) return null;
    candidate.source.effect_flags = {};
  }
  const flags = objectRecord(candidate.source.effect_flags);
  if (!flags) throw new Error("tcg_v0_2_before_heal_source_flags_invalid");
  if (flags.runtime_v0_2_before_heal_limits == null) {
    if (!create) return null;
    flags.runtime_v0_2_before_heal_limits = {};
  }
  const limits = objectRecord(flags.runtime_v0_2_before_heal_limits);
  if (!limits) throw new Error("tcg_v0_2_before_heal_limit_state_invalid");
  return limits;
}

function used(
  state: Record<string, unknown>,
  candidate: RuntimeV02BeforeHealCandidate,
  info: RuntimeV02BeforeHealLimit,
): number {
  const raw = objectRecord(limitState(candidate)?.[info.key]);
  if (!raw) return 0;
  const turn = Number(raw.turn_seq);
  const count = Number(raw.count);
  if (!Number.isInteger(turn) || !Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_before_heal_limit_counter_invalid");
  }
  return turn === currentTurn(state) ? count : 0;
}

function consume(
  state: Record<string, unknown>,
  candidate: RuntimeV02BeforeHealCandidate,
  info: RuntimeV02BeforeHealLimit,
): void {
  const count = used(state, candidate, info);
  if (count >= info.count) {
    throw new Error("tcg_v0_2_before_heal_limit_already_consumed");
  }
  limitState(candidate, true)![info.key] = {
    turn_seq: currentTurn(state),
    count: count + 1,
    owner: info.owner,
    listener_id: listenerId(candidate),
  };
}

function steps(candidate: RuntimeV02BeforeHealCandidate): Record<string, unknown>[] {
  if (!Array.isArray(candidate.listener.steps) || !candidate.listener.steps.length) {
    throw new Error("tcg_v0_2_before_heal_steps_required");
  }
  return candidate.listener.steps.map((raw, index) => {
    const step = objectRecord(raw);
    if (!step) throw new Error(`tcg_v0_2_before_heal_step_invalid:${index}`);
    if (String(step.op || "") !== "MODIFY_CURRENT_HEAL") {
      throw new Error(
        `tcg_v0_2_before_heal_step_unsupported:${String(step.op || "")}`,
      );
    }
    finiteAmount(step.delta, "tcg_v0_2_before_heal_delta_invalid");
    if (step.minimum != null) {
      nonNegativeAmount(step.minimum, "tcg_v0_2_before_heal_minimum_invalid");
    }
    if (step.maximum != null) {
      nonNegativeAmount(step.maximum, "tcg_v0_2_before_heal_maximum_invalid");
    }
    if (
      step.minimum != null && step.maximum != null &&
      Number(step.minimum) > Number(step.maximum)
    ) {
      throw new Error("tcg_v0_2_before_heal_bounds_invalid");
    }
    return step;
  });
}

function buildPlan(
  state: Record<string, unknown>,
  amount: number,
  targetDamageBefore: number,
  context: RuntimeV02BeforeHealContext,
): RuntimeV02BeforeHealPlanItem[] {
  nonNegativeAmount(amount, "tcg_v0_2_before_heal_amount_invalid");
  nonNegativeAmount(
    targetDamageBefore,
    "tcg_v0_2_before_heal_target_damage_invalid",
  );
  validateContext(state, context);
  if (!structuredEnabled(state) || amount <= 0 || targetDamageBefore <= 0) {
    return [];
  }
  const plan: RuntimeV02BeforeHealPlanItem[] = [];
  for (const candidate of collectCandidates(state)) {
    if (!matches(state, context, candidate)) continue;
    const info = limit(candidate);
    if (used(state, candidate, info) >= info.count) continue;
    plan.push({ candidate, limit: info, steps: steps(candidate) });
  }
  return plan;
}

function applyStep(amount: number, step: Record<string, unknown>): number {
  const delta = finiteAmount(step.delta, "tcg_v0_2_before_heal_delta_invalid");
  const minimum = step.minimum == null
    ? 0
    : nonNegativeAmount(step.minimum, "tcg_v0_2_before_heal_minimum_invalid");
  const maximum = step.maximum == null
    ? null
    : nonNegativeAmount(step.maximum, "tcg_v0_2_before_heal_maximum_invalid");
  let next = Math.max(minimum, amount + delta, 0);
  if (maximum != null) next = Math.min(next, maximum);
  return next;
}

/**
 * Non-mutating validation for Heal #21's before-heal modifier phase.
 * Current release support intentionally requires a turn-scoped listener limit;
 * unsupported unlimited/choice-bearing before-heal programs fail closed.
 */
export function runtimeV02PreflightBeforeHealModifiers(
  state: Record<string, unknown>,
  amount: number,
  targetDamageBefore: number,
  context: RuntimeV02BeforeHealContext,
): void {
  buildPlan(state, amount, targetDamageBefore, context);
}

/**
 * Canonical Heal #21 modifier phase for `before_heal_packet`.
 * It owns only requested-heal modification. HP mutation and the canonical
 * `after_heal_packet` event remain in tcg-match-heal-packet-v0-2.ts.
 */
export function runtimeV02ApplyBeforeHealModifiers(
  state: Record<string, unknown>,
  amount: number,
  targetDamageBefore: number,
  context: RuntimeV02BeforeHealContext,
): RuntimeV02BeforeHealModifierResult {
  const plan = buildPlan(state, amount, targetDamageBefore, context);
  let modified = nonNegativeAmount(
    amount,
    "tcg_v0_2_before_heal_amount_invalid",
  );
  const applied: RuntimeV02BeforeHealModifierResult["applied"] = [];

  for (const item of plan) {
    const before = modified;
    for (const step of item.steps) {
      modified = applyStep(modified, step);
    }
    consume(state, item.candidate, item.limit);
    applied.push({
      listener_id: listenerId(item.candidate),
      source_uid: item.candidate.source.uid,
      source_card_id: item.candidate.source.card_id,
      source_kind: item.candidate.kind,
      before_amount: before,
      after_amount: modified,
    });
  }

  return {
    requested_amount: amount,
    modified_amount: modified,
    applied,
  };
}
