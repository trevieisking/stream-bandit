import {
  applyRuntimeContinuousNumericModifiers,
  type RuntimeCardInstance,
  type RuntimeContinuousEffect,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02DamagePreventionKind = "ability" | "relic" | "shield";

export type RuntimeV02DamagePreventionEventSignal = {
  event: "damage_prevented";
  target: "source_creature";
  prevention_kind: RuntimeV02DamagePreventionKind;
};

export type RuntimeAttackDamageCreature = {
  stack?: RuntimeCardInstance[];
  essence?: RuntimeCardInstance[];
  relic?: RuntimeCardInstance | null;
  shield?: number;
  flags?: Record<string, unknown>;
};

export type RuntimeAttackDamageContext = {
  target_zone: string;
  target_controller: "self" | "opponent";
  source_controller: "self" | "opponent";
  target_has_any_condition: boolean;
};

const DAMAGE_PREVENTION_MARKER = "runtime_v0_2_damage_prevention";
const PREVIOUS_OPPONENT_PREVENTION_MARKER = "runtime_v0_2_previous_opponent_damage_prevention";
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
      String(effect.target || "") === "$source_creature" &&
      effect.limit == null &&
      effect.consume_when == null
    );
}

function selfAbilityWhenMatches(
  when: unknown,
  target: RuntimeAttackDamageCreature,
): boolean {
  if (when == null) return true;
  const predicate = objectRecord(when);
  if (!predicate) return false;
  if (String(predicate.predicate || "") === "source_has_relic") return Boolean(target.relic);
  return false;
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

function applyIncomingSelfAbilityDamage(
  state: Record<string, unknown>,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): { value: number; prevented: number } {
  let value = Math.max(0, Number(baseValue || 0));
  let prevented = 0;
  for (const effect of incomingSelfAbilityEffects(state, target)) {
    if (!selfAbilityWhenMatches(effect.when, target)) continue;
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
    prevented += Math.max(0, before - value);
  }
  return { value, prevented };
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
  return applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "attack_damage",
    {
      target_zone: context.target_zone,
      target_controller: context.target_controller,
      evaluate_when: (when: unknown) => attackWhenMatches(when, context),
    },
    0,
  );
}

export function structuredRuntimeIncomingAttackDamage(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number | null {
  if (!structuredRuntimeProbe(state, attacker, target)) return null;
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
  }

  // Shield is consumed by the match owner immediately after this resolver returns.
  // Recording the event here preserves one canonical prevention owner without
  // changing the existing damage/Shield application order.
  const shieldPrevented = Math.min(Math.max(0, Number(target.shield || 0)), value);
  if (shieldPrevented > 0) {
    recordRuntimeV02DamagePrevention(state, target, "shield", shieldPrevented, context);
  }

  return value;
}
