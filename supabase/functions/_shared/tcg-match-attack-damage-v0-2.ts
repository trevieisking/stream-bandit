import {
  applyRuntimeContinuousNumericModifiers,
  type RuntimeCardInstance,
  type RuntimeContinuousEffect,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02ApplyDamageProtections } from "./tcg-match-damage-protection-v0-2.ts";
import {
  hasRuntimeCondition,
  type RuntimeV02ConditionCreature,
} from "./tcg-match-condition-engine-v0-2.ts";
import {
  evaluateRuntimeV02SourceDamagedRequirement,
  evaluateRuntimeV02SourceHasShieldAtLeastRequirement,
  evaluateRuntimeV02TargetPrintedHpAtLeastRequirement,
  normalizeRuntimeV02TargetPrintedHpAtLeastRequirement,
} from "./tcg-match-requirement-evaluator-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02DamagePreventionKind = "ability" | "relic" | "shield";

export type RuntimeV02DamagePreventionEventSignal = {
  event: "damage_prevented";
  target: "source_creature";
  prevention_kind: RuntimeV02DamagePreventionKind;
};

export type RuntimeV02DamagePreventionDetail = {
  prevention_kind: RuntimeV02DamagePreventionKind;
  amount: number;
  source_uid: string | null;
  source_card_id: string | null;
  source_controller_seat: 1 | 2 | null;
  target_creature_uid: string;
  target_controller_seat: 1 | 2 | null;
  packet_id: string | null;
};

export type RuntimeAttackDamageCreature = {
  stack?: RuntimeCardInstance[];
  essence?: RuntimeCardInstance[];
  relic?: RuntimeCardInstance | null;
  damage?: number;
  shield?: number;
  conditions?: RuntimeV02ConditionCreature["conditions"];
  condition?: string | null;
  became_vanguard_turn?: number;
  flags?: Record<string, unknown>;
};

export type RuntimeAttackDamageContext = {
  target_zone: string;
  target_controller: "self" | "opponent";
  source_controller: "self" | "opponent";
  target_has_any_condition: boolean;
  attacker_has_any_condition?: boolean;
  target_element?: string;
  attack_id?: string;
  current_opponent_vanguard_control_condition?: string | null;
  source_controller_seat?: 1 | 2;
  target_controller_seat?: 1 | 2;
  target_creature_uid?: string;
  packet_id?: string;
};

const DAMAGE_PREVENTION_MARKER = "runtime_v0_2_damage_prevention";
const PREVIOUS_OPPONENT_PREVENTION_MARKER = "runtime_v0_2_previous_opponent_damage_prevention";
const ABILITY_CONTINUOUS_USAGE_KEY = "runtime_v0_2_attack_damage_ability_continuous_usage";
const DAMAGE_PREVENTION_KINDS = new Set<RuntimeV02DamagePreventionKind>(["ability", "relic", "shield"]);

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function attackWhenMatches(
  when: unknown,
  context: RuntimeAttackDamageContext,
): boolean {
  if (when == null) return true;
  if (!when || typeof when !== "object" || Array.isArray(when)) return false;
  const predicate = when as Record<string, unknown>;
  if (String(predicate.predicate || "") !== "target_has_any_condition") return false;
  if (predicate.target != null && String(predicate.target) !== "$current_opponent_vanguard") return false;
  return context.target_has_any_condition;
}

function structuredRuntimeProbe(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
): Record<string, unknown> | null {
  const attachments = [
    ...(Array.isArray(attacker.essence) ? attacker.essence : []),
    ...(Array.isArray(target.essence) ? target.essence : []),
  ];
  const probe = attachments[0];
  if (probe) return runtimeV02Definition(state, probe);

  const cardIndex = state.card_index;
  if (!cardIndex || typeof cardIndex !== "object" || Array.isArray(cardIndex)) return null;
  const first = Object.keys(cardIndex as Record<string, unknown>)[0];
  return first ? runtimeV02Definition(state, first) : null;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = state.turn_seq;
  if (typeof turn !== "number" || !Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_damage_prevention_turn_seq_invalid");
  }
  return turn;
}

function activeSeat(state: Record<string, unknown>): 1 | 2 | null {
  return state.active_seat === 1 || state.active_seat === 2 ? state.active_seat : null;
}

function personalTurnCount(state: Record<string, unknown>, seat: 1 | 2): number | null {
  const turns = objectRecord(state.personal_turns);
  if (!turns) return null;
  const value = turns[String(seat)];
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function preventionKinds(raw: unknown): RuntimeV02DamagePreventionKind[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new Error("tcg_v0_2_damage_prevention_kinds_invalid");
  const result: RuntimeV02DamagePreventionKind[] = [];
  for (const value of raw) {
    const kind = String(value) as RuntimeV02DamagePreventionKind;
    if (!DAMAGE_PREVENTION_KINDS.has(kind)) {
      throw new Error(`tcg_v0_2_damage_prevention_kind_invalid:${String(value)}`);
    }
    if (!result.includes(kind)) result.push(kind);
  }
  return result;
}

function sourceUid(
  instanceOrId: string | { card_id?: unknown; uid?: unknown } | null | undefined,
): string {
  const source = objectRecord(instanceOrId);
  return typeof source?.uid === "string" ? source.uid : "";
}

function creatureControllerSeat(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
): 1 | 2 | null {
  const players = objectRecord(state.players);
  if (!players) return null;
  const stack = Array.isArray(target.stack) ? target.stack : [];
  const targetUid = stack.length > 0 ? objectRecord(stack[stack.length - 1])?.uid : null;
  for (const seat of [1, 2] as const) {
    const player = objectRecord(players[String(seat)]);
    if (!player) continue;
    const reserve = Array.isArray(player.reserve) ? player.reserve : [];
    for (const rawCreature of [player.vanguard, ...reserve]) {
      if (rawCreature === target) return seat;
      const creature = objectRecord(rawCreature);
      if (!creature || typeof targetUid !== "string" || !targetUid) continue;
      const creatureStack = Array.isArray(creature.stack) ? creature.stack : [];
      if (creatureStack.some((rawInstance) => objectRecord(rawInstance)?.uid === targetUid)) return seat;
    }
  }
  return null;
}

function recordRuntimeV02DamagePrevention(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
  kind: RuntimeV02DamagePreventionKind,
  amount: number,
  context: RuntimeAttackDamageContext,
): void {
  if (!DAMAGE_PREVENTION_KINDS.has(kind)) {
    throw new Error(`tcg_v0_2_damage_prevention_kind_invalid:${kind}`);
  }
  if (!(Number(amount) > 0)) return;
  const turn = currentTurn(state);
  target.flags ||= {};
  const marker = objectRecord(target.flags[DAMAGE_PREVENTION_MARKER]);
  const kinds = marker && Number(marker.turn_seq) === turn
    ? preventionKinds(marker.kinds)
    : [];
  if (!kinds.includes(kind)) kinds.push(kind);
  target.flags[DAMAGE_PREVENTION_MARKER] = { turn_seq: turn, kinds };

  if (context.source_controller !== "opponent") return;
  const targetSeat = creatureControllerSeat(state, target);
  const opponentSeat = targetSeat === 1 ? 2 : targetSeat === 2 ? 1 : null;
  const active = activeSeat(state);
  if (!opponentSeat || active !== opponentSeat) return;
  const opponentPersonalTurn = personalTurnCount(state, opponentSeat);
  if (opponentPersonalTurn == null) return;

  const previous = objectRecord(target.flags[PREVIOUS_OPPONENT_PREVENTION_MARKER]);
  const previousKinds = previous &&
      Number(previous.opponent_seat) === opponentSeat &&
      Number(previous.opponent_personal_turn) === opponentPersonalTurn
    ? preventionKinds(previous.kinds)
    : [];
  if (!previousKinds.includes(kind)) previousKinds.push(kind);
  target.flags[PREVIOUS_OPPONENT_PREVENTION_MARKER] = {
    opponent_seat: opponentSeat,
    opponent_personal_turn: opponentPersonalTurn,
    turn_seq: turn,
    kinds: previousKinds,
  };
}

function creatureForSourceInstance(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown; uid?: unknown } | null | undefined,
): RuntimeAttackDamageCreature | null {
  const uid = sourceUid(instanceOrId);
  if (!uid) return null;
  const players = objectRecord(state.players);
  if (!players) return null;
  for (const rawPlayer of Object.values(players)) {
    const player = objectRecord(rawPlayer);
    if (!player) continue;
    const reserve = Array.isArray(player.reserve) ? player.reserve : [];
    for (const rawCreature of [player.vanguard, ...reserve]) {
      const creature = objectRecord(rawCreature) as RuntimeAttackDamageCreature | null;
      if (!creature) continue;
      const stack = Array.isArray(creature.stack) ? creature.stack : [];
      if (stack.some((rawInstance) => objectRecord(rawInstance)?.uid === uid)) return creature;
    }
  }
  return null;
}

export function runtimeV02CurrentTurnDamagePreventionEvents(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown; uid?: unknown } | null | undefined,
): RuntimeV02DamagePreventionEventSignal[] {
  const creature = creatureForSourceInstance(state, instanceOrId);
  if (!creature) return [];
  const marker = objectRecord(creature.flags?.[DAMAGE_PREVENTION_MARKER]);
  if (!marker || Number(marker.turn_seq) !== currentTurn(state)) return [];
  return preventionKinds(marker.kinds).map((kind) => ({
    event: "damage_prevented" as const,
    target: "source_creature" as const,
    prevention_kind: kind,
  }));
}

export function runtimeV02PreviousOpponentTurnDamagePreventionEvents(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown; uid?: unknown } | null | undefined,
): RuntimeV02DamagePreventionEventSignal[] {
  const creature = creatureForSourceInstance(state, instanceOrId);
  if (!creature) return [];
  const controller = creatureControllerSeat(state, creature);
  if (!controller || activeSeat(state) !== controller) return [];
  const opponentSeat = controller === 1 ? 2 : 1;
  const opponentPersonalTurn = personalTurnCount(state, opponentSeat);
  if (opponentPersonalTurn == null) return [];
  const marker = objectRecord(creature.flags?.[PREVIOUS_OPPONENT_PREVENTION_MARKER]);
  if (
    !marker ||
    Number(marker.opponent_seat) !== opponentSeat ||
    Number(marker.opponent_personal_turn) !== opponentPersonalTurn
  ) return [];
  return preventionKinds(marker.kinds).map((kind) => ({
    event: "damage_prevented" as const,
    target: "source_creature" as const,
    prevention_kind: kind,
  }));
}

function outgoingSelfAbilityEffects(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
): RuntimeContinuousEffect[] {
  const stack = Array.isArray(source.stack) ? source.stack : [];
  const top = stack[stack.length - 1];
  if (!top) return [];
  const definition = runtimeV02Definition(state, top);
  const creature = objectRecord(definition?.creature);
  const ability = objectRecord(creature?.ability);
  if (!ability || String(ability.mode || "") !== "continuous" || ability.limit != null) return [];
  const continuous = Array.isArray(ability.continuous) ? ability.continuous : [];
  return continuous
    .map((value) => objectRecord(value) as RuntimeContinuousEffect | null)
    .filter((value): value is RuntimeContinuousEffect => Boolean(value))
    .filter((effect) =>
      String(effect.kind || "") === "attack_damage" &&
      String(effect.target || "") === "$source_creature" &&
      effect.limit == null &&
      effect.consume_when == null
    );
}

function outgoingSelfAbilityWhenMatches(
  when: unknown,
  source: RuntimeAttackDamageCreature,
  context: RuntimeAttackDamageContext,
): boolean {
  if (when == null) return true;
  const predicate = objectRecord(when);
  if (!predicate) return false;
  const name = String(predicate.predicate || "");
  if (name === "source_damaged") {
    return evaluateRuntimeV02SourceDamagedRequirement(
      source,
      predicate as { predicate: "source_damaged" },
    ).matched;
  }
  if (name === "source_has_shield_at_least") {
    return evaluateRuntimeV02SourceHasShieldAtLeastRequirement(
      source,
      predicate as { predicate: "source_has_shield_at_least"; value: number },
    ).matched;
  }
  if (name === "control_condition_present") {
    const allowed = new Set(["predicate", "target"]);
    const extra = Object.keys(predicate).find((field) => !allowed.has(field));
    if (extra) {
      throw new Error(
        `tcg_v0_2_attack_damage_control_condition_field_unsupported:${extra}`,
      );
    }
    if (predicate.target !== "$current_opponent_vanguard") {
      throw new Error(
        "tcg_v0_2_attack_damage_control_condition_target_unsupported",
      );
    }
    return typeof context.current_opponent_vanguard_control_condition === "string" &&
      context.current_opponent_vanguard_control_condition.trim().length > 0;
  }
  return false;
}

function incomingSelfAbilityEffects(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
): RuntimeContinuousEffect[] {
  const stack = Array.isArray(target.stack) ? target.stack : [];
  const top = stack[stack.length - 1];
  if (!top) return [];
  const definition = runtimeV02Definition(state, top);
  const creature = objectRecord(definition?.creature);
  const ability = objectRecord(creature?.ability);
  if (!ability || String(ability.mode || "") !== "continuous" || ability.limit != null) return [];
  const continuous = Array.isArray(ability.continuous) ? ability.continuous : [];
  return continuous
    .map((value) => objectRecord(value) as RuntimeContinuousEffect | null)
    .filter((value): value is RuntimeContinuousEffect => Boolean(value))
    .filter((effect) =>
      String(effect.kind || "") === "incoming_attack_damage" &&
      String(effect.target || "") === "$source_creature"
    );
}

function selfAbilityWhenMatches(
  when: unknown,
  target: RuntimeAttackDamageCreature,
  currentAttackDamage: number,
): boolean {
  if (when == null) return true;
  const predicate = objectRecord(when);
  if (!predicate) return false;
  const kind = String(predicate.predicate || "");
  if (kind === "source_has_relic") return Boolean(target.relic);
  if (kind === "source_has_condition") {
    const condition = typeof predicate.condition === "string" ? predicate.condition.trim() : "";
    if (!condition) return false;
    return hasRuntimeCondition(target as RuntimeV02ConditionCreature, condition);
  }
  if (kind === "current_attack_damage_at_least") {
    const allowed = new Set(["predicate", "value", "stage"]);
    const unsupported = Object.keys(predicate).find((field) => !allowed.has(field));
    if (unsupported) {
      throw new Error(
        `tcg_v0_2_attack_damage_current_threshold_field_unsupported:${unsupported}`,
      );
    }
    if (String(predicate.stage || "") !== "before_shield") {
      throw new Error("tcg_v0_2_attack_damage_current_threshold_stage_unsupported");
    }
    const threshold = Number(predicate.value);
    if (!Number.isInteger(threshold) || threshold < 0) {
      throw new Error("tcg_v0_2_attack_damage_current_threshold_value_invalid");
    }
    return currentAttackDamage >= threshold;
  }
  return false;
}

type RuntimeV02AbilityContinuousLimit = {
  source: RuntimeCardInstance;
  effect_id: string;
  scope: "turn" | "match";
  count: number;
  used: number;
  turn_seq: number;
};

function sourceCreatureCardInstance(
  target: RuntimeAttackDamageCreature,
): RuntimeCardInstance | null {
  const stack = Array.isArray(target.stack) ? target.stack : [];
  return stack.length ? stack[stack.length - 1] : null;
}

function abilityContinuousUsage(
  source: RuntimeCardInstance,
  effectId: string,
  scope: "turn" | "match",
  turnSeq: number,
): number {
  const flags = objectRecord(source.effect_flags);
  if (!flags) return 0;
  const rawLedger = flags[ABILITY_CONTINUOUS_USAGE_KEY];
  if (rawLedger == null) return 0;
  const ledger = objectRecord(rawLedger);
  if (!ledger) throw new Error("tcg_v0_2_attack_damage_ability_usage_ledger_invalid");
  const rawReceipt = ledger[effectId];
  if (rawReceipt == null) return 0;
  const receipt = objectRecord(rawReceipt);
  if (!receipt) throw new Error("tcg_v0_2_attack_damage_ability_usage_receipt_invalid");
  if (String(receipt.scope || "") !== scope) {
    throw new Error("tcg_v0_2_attack_damage_ability_usage_scope_mismatch");
  }
  const used = Number(receipt.used);
  if (!Number.isInteger(used) || used < 0) {
    throw new Error("tcg_v0_2_attack_damage_ability_usage_count_invalid");
  }
  if (scope === "turn") {
    const receiptTurn = Number(receipt.turn_seq);
    if (!Number.isInteger(receiptTurn) || receiptTurn < 0) {
      throw new Error("tcg_v0_2_attack_damage_ability_usage_turn_invalid");
    }
    return receiptTurn === turnSeq ? used : 0;
  }
  return used;
}

function consumeAbilityContinuousUsage(
  source: RuntimeCardInstance,
  effectId: string,
  scope: "turn" | "match",
  turnSeq: number,
): void {
  const flags = (
    source.effect_flags && typeof source.effect_flags === "object" && !Array.isArray(source.effect_flags)
      ? source.effect_flags
      : (source.effect_flags = {})
  ) as Record<string, unknown>;
  const rawLedger = flags[ABILITY_CONTINUOUS_USAGE_KEY];
  if (rawLedger != null && !objectRecord(rawLedger)) {
    throw new Error("tcg_v0_2_attack_damage_ability_usage_ledger_invalid");
  }
  const ledger = objectRecord(rawLedger) || {};
  const used = abilityContinuousUsage(source, effectId, scope, turnSeq);
  ledger[effectId] = scope === "turn"
    ? { scope, used: used + 1, turn_seq: turnSeq }
    : { scope, used: used + 1 };
  flags[ABILITY_CONTINUOUS_USAGE_KEY] = ledger;
}

function abilityContinuousLimit(
  state: Record<string, unknown>,
  source: RuntimeCardInstance,
  effect: RuntimeContinuousEffect,
): RuntimeV02AbilityContinuousLimit | null {
  const limit = objectRecord(effect.limit);
  if (!limit) {
    if (effect.limit != null) {
      throw new Error("tcg_v0_2_attack_damage_ability_limit_invalid");
    }
    if (effect.consume_when != null) {
      throw new Error("tcg_v0_2_attack_damage_ability_consume_without_limit");
    }
    return null;
  }
  const unsupported = Object.keys(limit).find((field) => !["scope", "count", "owner"].includes(field));
  if (unsupported) {
    throw new Error(`tcg_v0_2_attack_damage_ability_limit_field_unsupported:${unsupported}`);
  }
  const scope = String(limit.scope || "");
  if (scope !== "turn" && scope !== "match") {
    throw new Error("tcg_v0_2_attack_damage_ability_limit_scope_unsupported");
  }
  if (String(limit.owner || "") !== "card_instance") {
    throw new Error("tcg_v0_2_attack_damage_ability_limit_owner_unsupported");
  }
  const count = Number(limit.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("tcg_v0_2_attack_damage_ability_limit_count_invalid");
  }
  if (String(effect.consume_when || "") !== "prevention_amount_at_least_1") {
    throw new Error("tcg_v0_2_attack_damage_ability_consume_unsupported");
  }
  const effectId = String(effect.id || "").trim();
  if (!effectId) throw new Error("tcg_v0_2_attack_damage_ability_effect_id_required");
  const turnSeq = currentTurn(state);
  return {
    source,
    effect_id: effectId,
    scope,
    count,
    used: abilityContinuousUsage(source, effectId, scope, turnSeq),
    turn_seq: turnSeq,
  };
}

function continuousFiltersMatch(
  filters: Record<string, unknown> | undefined,
  context: RuntimeAttackDamageContext,
): boolean {
  for (const [key, expected] of Object.entries(filters || {})) {
    if (!Object.hasOwn(context, key)) return false;
    const actual = context[key as keyof RuntimeAttackDamageContext];
    if (!Object.is(actual, expected) && String(actual) !== String(expected)) return false;
  }
  return true;
}

function applyOutgoingSelfAbilityDamage(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number {
  let value = Math.max(0, Number(baseValue || 0));
  for (const effect of outgoingSelfAbilityEffects(state, source)) {
    if (!outgoingSelfAbilityWhenMatches(effect.when, source, context)) continue;
    if (!continuousFiltersMatch(effect.filters, context)) continue;
    const amount = Number(effect.amount);
    if (!Number.isFinite(amount)) continue;
    const mode = effect.mode == null ? "delta" : String(effect.mode);
    if (mode === "set") value = amount;
    else if (mode === "delta") value += amount;
    else continue;
    const minimum = Number(effect.minimum);
    if (Number.isFinite(minimum)) value = Math.max(value, minimum);
    const maximum = Number(effect.maximum);
    if (Number.isFinite(maximum)) value = Math.min(value, maximum);
    value = Math.max(0, value);
  }
  return value;
}

function applyIncomingSelfAbilityDamage(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): { value: number; prevented: number } {
  let value = Math.max(0, Number(baseValue || 0));
  let prevented = 0;
  const effects = incomingSelfAbilityEffects(state, target);
  const source = effects.length ? sourceCreatureCardInstance(target) : null;
  if (effects.length && !source) {
    throw new Error("tcg_v0_2_attack_damage_ability_source_required");
  }
  for (const effect of effects) {
    const limit = abilityContinuousLimit(state, source as RuntimeCardInstance, effect);
    if (limit && limit.used >= limit.count) continue;
    if (!selfAbilityWhenMatches(effect.when, target, value)) continue;
    if (!continuousFiltersMatch(effect.filters, context)) continue;
    const amount = Number(effect.amount);
    if (!Number.isFinite(amount)) continue;
    const mode = effect.mode == null ? "delta" : String(effect.mode);
    if (mode !== "delta") continue;
    const before = value;
    value += amount;
    const minimum = Number(effect.minimum);
    if (Number.isFinite(minimum)) value = Math.max(value, minimum);
    const maximum = Number(effect.maximum);
    if (Number.isFinite(maximum)) value = Math.min(value, maximum);
    value = Math.max(0, value);
    const effectPrevented = Math.max(0, before - value);
    prevented += effectPrevented;
    if (effectPrevented > 0 && limit) {
      consumeAbilityContinuousUsage(
        limit.source,
        limit.effect_id,
        limit.scope,
        limit.turn_seq,
      );
    }
  }
  return { value, prevented };
}

function outgoingRelicContinuousEffects(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
): Array<{ source: RuntimeCardInstance; effect: RuntimeContinuousEffect }> {
  const relic = source.relic;
  if (!relic) return [];
  const definition = runtimeV02Definition(state, relic);
  const tactic = objectRecord(definition?.tactic);
  if (!tactic || String(tactic.subtype || "") !== "Relic") return [];
  const continuous = Array.isArray(tactic.continuous) ? tactic.continuous : [];
  return continuous
    .map((value) => objectRecord(value) as RuntimeContinuousEffect | null)
    .filter((value): value is RuntimeContinuousEffect => Boolean(value))
    .filter((effect) =>
      String(effect.kind || "") === "attack_damage" &&
      String(effect.target || "") === "$attached_creature"
    )
    .map((effect) => ({ source: relic, effect }));
}

function attachedCreatureDefinition(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
): Record<string, unknown> {
  const stack = Array.isArray(source.stack) ? source.stack : [];
  const top = stack[stack.length - 1];
  if (!top) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_source_required");
  const definition = runtimeV02Definition(state, top);
  if (!definition) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_source_definition_missing");
  return definition;
}

function outgoingRelicWhenMatches(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
  when: unknown,
): boolean {
  if (when == null) return true;
  const predicate = objectRecord(when);
  if (!predicate) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_when_invalid");
  const kind = String(predicate.predicate || "");
  if (kind === "target_element_is") {
    const allowed = new Set(["predicate", "target", "element"]);
    const extra = Object.keys(predicate).find((field) => !allowed.has(field));
    if (extra) throw new Error(`tcg_v0_2_attack_damage_outgoing_relic_when_field_unsupported:${extra}`);
    if (String(predicate.target || "") !== "$attached_creature") {
      throw new Error("tcg_v0_2_attack_damage_outgoing_relic_element_target_unsupported");
    }
    const element = String(predicate.element || "").trim();
    if (!element) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_element_required");
    return String(attachedCreatureDefinition(state, source).element || "") === element;
  }
  if (kind === "target_became_vanguard_this_turn") {
    const allowed = new Set(["predicate", "target"]);
    const extra = Object.keys(predicate).find((field) => !allowed.has(field));
    if (extra) throw new Error(`tcg_v0_2_attack_damage_outgoing_relic_when_field_unsupported:${extra}`);
    if (String(predicate.target || "") !== "$attached_creature") {
      throw new Error("tcg_v0_2_attack_damage_outgoing_relic_vanguard_target_unsupported");
    }
    return Number(source.became_vanguard_turn ?? -1) === currentTurn(state);
  }
  throw new Error("tcg_v0_2_attack_damage_outgoing_relic_when_unsupported");
}

function outgoingRelicCaseMatches(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
  when: unknown,
): boolean {
  const requirement = normalizeRuntimeV02TargetPrintedHpAtLeastRequirement(when);
  if (requirement.target !== "$attached_creature") {
    throw new Error("tcg_v0_2_attack_damage_outgoing_relic_hp_target_unsupported");
  }
  const definition = attachedCreatureDefinition(state, source);
  const creature = objectRecord(definition.creature);
  const hp = Number(creature?.hp ?? definition.hp ?? 0);
  return evaluateRuntimeV02TargetPrintedHpAtLeastRequirement(hp, requirement).matched;
}

function outgoingRelicAmount(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
  effect: RuntimeContinuousEffect,
): number {
  if (effect.value != null && effect.amount != null) {
    throw new Error("tcg_v0_2_attack_damage_outgoing_relic_amount_ambiguous");
  }
  if (effect.value == null) {
    const amount = Number(effect.amount);
    if (!Number.isFinite(amount)) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_amount_invalid");
    return amount;
  }
  const formula = objectRecord(effect.value);
  if (!formula) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_value_invalid");
  const unsupported = Object.keys(formula).find((field) => !["default", "cases"].includes(field));
  if (unsupported) throw new Error(`tcg_v0_2_attack_damage_outgoing_relic_value_field_unsupported:${unsupported}`);
  const fallback = Number(formula.default);
  if (!Number.isFinite(fallback)) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_default_invalid");
  if (!Array.isArray(formula.cases)) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_cases_invalid");
  for (const rawCase of formula.cases) {
    const item = objectRecord(rawCase);
    if (!item) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_case_invalid");
    const extra = Object.keys(item).find((field) => !["when", "amount"].includes(field));
    if (extra) throw new Error(`tcg_v0_2_attack_damage_outgoing_relic_case_field_unsupported:${extra}`);
    if (!outgoingRelicCaseMatches(state, source, item.when)) continue;
    const amount = Number(item.amount);
    if (!Number.isFinite(amount)) throw new Error("tcg_v0_2_attack_damage_outgoing_relic_case_amount_invalid");
    return amount;
  }
  return fallback;
}

function outgoingRelicFiltersMatch(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
  filters: Record<string, unknown> | undefined,
  context: RuntimeAttackDamageContext,
): boolean {
  const attachedDefinition = attachedCreatureDefinition(state, source);
  return continuousFiltersMatch(filters, {
    ...context,
    target_element: String(attachedDefinition.element || ""),
  });
}

function applyOutgoingRelicDamage(
  state: Record<string, unknown>,
  source: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number {
  let value = Math.max(0, Number(baseValue || 0));
  for (const { effect } of outgoingRelicContinuousEffects(state, source)) {
    if (effect.limit != null || effect.consume_when != null) {
      throw new Error("tcg_v0_2_attack_damage_outgoing_relic_limit_unsupported");
    }
    if (!outgoingRelicWhenMatches(state, source, effect.when)) continue;
    if (!outgoingRelicFiltersMatch(state, source, effect.filters, context)) continue;
    const mode = effect.mode == null ? "delta" : String(effect.mode);
    if (mode !== "delta") throw new Error("tcg_v0_2_attack_damage_outgoing_relic_mode_unsupported");
    value += outgoingRelicAmount(state, source, effect);
    const minimum = Number(effect.minimum);
    if (Number.isFinite(minimum)) value = Math.max(value, minimum);
    const maximum = Number(effect.maximum);
    if (Number.isFinite(maximum)) value = Math.min(value, maximum);
    value = Math.max(0, value);
  }
  return value;
}

const RELIC_CONTINUOUS_USAGE_KEY = "runtime_v0_2_relic_continuous_uses";

function relicContinuousEffects(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
): Array<{ source: RuntimeCardInstance; effect: RuntimeContinuousEffect }> {
  const source = target.relic;
  if (!source) return [];
  const definition = runtimeV02Definition(state, source);
  const tactic = objectRecord(definition?.tactic);
  if (!tactic || String(tactic.subtype || "") !== "Relic") return [];
  const continuous = Array.isArray(tactic.continuous) ? tactic.continuous : [];
  return continuous
    .map((value) => objectRecord(value) as RuntimeContinuousEffect | null)
    .filter((value): value is RuntimeContinuousEffect => Boolean(value))
    .filter((effect) =>
      String(effect.kind || "") === "incoming_attack_damage" &&
      String(effect.target || "") === "$attached_creature"
    )
    .map((effect) => ({ source, effect }));
}

function relicContinuousUsage(
  source: RuntimeCardInstance,
  effectId: string,
): number {
  const flags = (
    source.effect_flags && typeof source.effect_flags === "object" && !Array.isArray(source.effect_flags)
      ? source.effect_flags
      : (source.effect_flags = {})
  ) as Record<string, unknown>;
  const rawLedger = objectRecord(flags[RELIC_CONTINUOUS_USAGE_KEY]) || {};
  const raw = rawLedger[effectId] ?? 0;
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_attack_damage_relic_usage_invalid");
  }
  return count;
}

function consumeRelicContinuousUsage(
  source: RuntimeCardInstance,
  effectId: string,
): void {
  const flags = (
    source.effect_flags && typeof source.effect_flags === "object" && !Array.isArray(source.effect_flags)
      ? source.effect_flags
      : (source.effect_flags = {})
  ) as Record<string, unknown>;
  const ledger = objectRecord(flags[RELIC_CONTINUOUS_USAGE_KEY]) || {};
  ledger[effectId] = relicContinuousUsage(source, effectId) + 1;
  flags[RELIC_CONTINUOUS_USAGE_KEY] = ledger;
}

function relicContinuousLimit(
  source: RuntimeCardInstance,
  effect: RuntimeContinuousEffect,
): { effect_id: string; count: number; used: number } | null {
  const limit = objectRecord(effect.limit);
  if (!limit) {
    if (effect.consume_when != null) {
      throw new Error("tcg_v0_2_attack_damage_relic_consume_without_limit");
    }
    return null;
  }
  if (
    String(limit.scope || "") !== "attachment" ||
    String(limit.owner || "") !== "attachment"
  ) {
    throw new Error("tcg_v0_2_attack_damage_relic_limit_unsupported");
  }
  const count = Number(limit.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("tcg_v0_2_attack_damage_relic_limit_count_invalid");
  }
  if (String(effect.consume_when || "") !== "prevention_amount_at_least_1") {
    throw new Error("tcg_v0_2_attack_damage_relic_consume_unsupported");
  }
  const effectId = String(effect.id || "").trim();
  if (!effectId) throw new Error("tcg_v0_2_attack_damage_relic_effect_id_required");
  return { effect_id: effectId, count, used: relicContinuousUsage(source, effectId) };
}

function applyIncomingRelicDamage(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): { value: number; preventions: RuntimeV02DamagePreventionDetail[] } {
  let value = Math.max(0, Number(baseValue || 0));
  const preventions: RuntimeV02DamagePreventionDetail[] = [];
  for (const { source, effect } of relicContinuousEffects(state, target)) {
    if (effect.when != null) {
      throw new Error("tcg_v0_2_attack_damage_relic_when_unsupported");
    }
    if (!continuousFiltersMatch(effect.filters, context)) continue;
    const limit = relicContinuousLimit(source, effect);
    if (limit && limit.used >= limit.count) continue;
    const rawAmount = Number(effect.amount);
    if (!Number.isFinite(rawAmount)) {
      throw new Error("tcg_v0_2_attack_damage_relic_amount_invalid");
    }
    const mode = effect.mode == null ? "delta" : String(effect.mode);
    if (mode !== "delta") {
      throw new Error("tcg_v0_2_attack_damage_relic_mode_unsupported");
    }
    const before = value;
    value += rawAmount;
    const minimum = Number(effect.minimum);
    if (Number.isFinite(minimum)) value = Math.max(value, minimum);
    const maximum = Number(effect.maximum);
    if (Number.isFinite(maximum)) value = Math.min(value, maximum);
    value = Math.max(0, value);
    const prevented = Math.max(0, before - value);
    if (!(prevented > 0)) continue;
    if (limit) consumeRelicContinuousUsage(source, limit.effect_id);
    const targetTop = Array.isArray(target.stack) && target.stack.length > 0 ? target.stack[target.stack.length - 1] : null;
    const targetUid = String(context.target_creature_uid || targetTop?.uid || "").trim();
    if (!targetUid) throw new Error("tcg_v0_2_attack_damage_relic_target_uid_required");
    preventions.push({
      prevention_kind: "relic",
      amount: prevented,
      source_uid: String(source.uid || "").trim() || null,
      source_card_id: String(source.card_id || "").trim() || null,
      source_controller_seat: context.target_controller_seat ?? null,
      target_creature_uid: targetUid,
      target_controller_seat: context.target_controller_seat ?? null,
      packet_id: typeof context.packet_id === "string" && context.packet_id.trim() ? context.packet_id.trim() : null,
    });
  }
  return { value, preventions };
}

export function structuredRuntimeOutgoingAttackDamage(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number | null {
  if (!structuredRuntimeProbe(state, attacker, target)) return null;
  const attachments = Array.isArray(attacker.essence) ? attacker.essence : [];
  const definitionLookup = (instance: RuntimeCardInstance) => runtimeV02Definition(state, instance);
  let value = applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "attack_damage",
    {
      target_zone: context.target_zone,
      target_controller: context.target_controller,
      attack_id: context.attack_id,
      evaluate_when: (when: unknown) => attackWhenMatches(when, context),
    },
    0,
  );
  value = applyOutgoingRelicDamage(state, attacker, value, context);
  value = applyOutgoingSelfAbilityDamage(state, attacker, value, context);
  return value;
}

export function structuredRuntimeIncomingAttackDamageDetailed(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): { amount: number; preventions: RuntimeV02DamagePreventionDetail[] } | null {
  if (!structuredRuntimeProbe(state, attacker, target)) return null;
  const preventions: RuntimeV02DamagePreventionDetail[] = [];
  const attachments = Array.isArray(target.essence) ? target.essence : [];
  const definitionLookup = (instance: RuntimeCardInstance) => runtimeV02Definition(state, instance);
  let value = applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "incoming_attack_damage",
    { source_controller: context.source_controller },
    0,
  );

  const ability = applyIncomingSelfAbilityDamage(state, target, value, context);
  value = ability.value;
  if (ability.prevented > 0) {
    recordRuntimeV02DamagePrevention(state, target, "ability", ability.prevented, context);
    const source = Array.isArray(target.stack) && target.stack.length > 0 ? target.stack[target.stack.length - 1] : null;
    const targetUid = String(context.target_creature_uid || source?.uid || "").trim();
    if (targetUid) {
      preventions.push({
        prevention_kind: "ability",
        amount: ability.prevented,
        source_uid: source?.uid ? String(source.uid) : null,
        source_card_id: source?.card_id ? String(source.card_id) : null,
        source_controller_seat: context.target_controller_seat ?? null,
        target_creature_uid: targetUid,
        target_controller_seat: context.target_controller_seat ?? null,
        packet_id: typeof context.packet_id === "string" && context.packet_id.trim() ? context.packet_id.trim() : null,
      });
    }
  }

  const relic = applyIncomingRelicDamage(state, target, value, context);
  value = relic.value;
  for (const prevention of relic.preventions) {
    preventions.push(prevention);
    recordRuntimeV02DamagePrevention(state, target, "relic", prevention.amount, context);
  }

  if (target.flags?.runtime_v0_2_damage_protections != null) {
    const active = activeSeat(state);
    const sourceSeat = context.source_controller_seat;
    const targetSeat = context.target_controller_seat;
    const targetUid = typeof context.target_creature_uid === "string"
      ? context.target_creature_uid.trim()
      : "";
    const packetId = typeof context.packet_id === "string" ? context.packet_id.trim() : "";
    if (!active || (sourceSeat !== 1 && sourceSeat !== 2) ||
      (targetSeat !== 1 && targetSeat !== 2) || !targetUid || !packetId) {
      throw new Error("tcg_v0_2_attack_damage_protection_context_required");
    }
    const stored = runtimeV02ApplyDamageProtections(target, value, {
      turn_seq: currentTurn(state),
      active_seat: active,
      source_controller_seat: sourceSeat,
      target_controller_seat: targetSeat,
      target_creature_uid: targetUid,
      damage_class: "attack",
      packet_id: packetId,
    });
    for (const modification of stored.modifications) {
      const prevented = Math.max(0, Number(modification.amount_before) - Number(modification.amount_after));
      if (!(prevented > 0)) continue;
      if (modification.source_kind === "ability" || modification.source_kind === "relic") {
        recordRuntimeV02DamagePrevention(
          state,
          target,
          modification.source_kind,
          prevented,
          context,
        );
        preventions.push({
          prevention_kind: modification.source_kind,
          amount: prevented,
          source_uid: String(modification.source_uid || "").trim() || null,
          source_card_id: String(modification.source_card_id || "").trim() || null,
          source_controller_seat: modification.controller_seat === 1 || modification.controller_seat === 2
            ? modification.controller_seat
            : null,
          target_creature_uid: targetUid,
          target_controller_seat: targetSeat,
          packet_id: packetId,
        });
      }
    }
    value = stored.final_amount;
  }

  // Shield is consumed by the match owner immediately after this resolver returns.
  // Recording the event here preserves one canonical prevention owner without
  // changing the existing damage/Shield application order.
  const shieldPrevented = Math.min(Math.max(0, Number(target.shield || 0)), value);
  if (shieldPrevented > 0) {
    recordRuntimeV02DamagePrevention(state, target, "shield", shieldPrevented, context);
    const targetUid = String(context.target_creature_uid || target.stack?.[target.stack.length - 1]?.uid || "").trim();
    if (targetUid) {
      preventions.push({
        prevention_kind: "shield",
        amount: shieldPrevented,
        source_uid: null,
        source_card_id: null,
        source_controller_seat: context.target_controller_seat ?? null,
        target_creature_uid: targetUid,
        target_controller_seat: context.target_controller_seat ?? null,
        packet_id: typeof context.packet_id === "string" && context.packet_id.trim() ? context.packet_id.trim() : null,
      });
    }
  }

  return { amount: value, preventions };
}

export function structuredRuntimeIncomingAttackDamage(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number | null {
  const result = structuredRuntimeIncomingAttackDamageDetailed(state, attacker, target, baseValue, context);
  return result == null ? null : result.amount;
}
