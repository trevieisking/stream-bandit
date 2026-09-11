import type {
  RuntimeV02ConditionCreature,
  RuntimeV02ConditionState,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";

export type RuntimeConditions = RuntimeV02ConditionState;
export type RuntimeCreature = RuntimeV02ConditionCreature;

export type RuntimeCardInstance = {
  uid: string;
  card_id: string;
  [key: string]: unknown;
};

export type RuntimePlayerZones = {
  deck: RuntimeCardInstance[];
  discard: RuntimeCardInstance[];
};

export type RuntimeContinuousEffect = {
  id?: string;
  kind?: string;
  target?: string;
  when?: unknown;
  amount?: number;
  mode?: string;
  minimum?: number;
  maximum?: number;
  filters?: Record<string, unknown>;
  [key: string]: unknown;
};

export type RuntimeAttachedContinuousEffect = {
  source: RuntimeCardInstance;
  effect: RuntimeContinuousEffect;
};

export type RuntimeDefinitionLookup = (instance: RuntimeCardInstance) => unknown;

export type RuntimeContinuousContext = Record<string, unknown> & {
  evaluate_when?: (when: unknown) => boolean;
};

// Compatibility facade: condition semantics and condition state types live in
// the dedicated condition domain. Existing callers may keep importing these
// names from runtime core while the runtime is migrated domain-by-domain.
export {
  applyRuntimeCondition,
  clearRuntimeCondition,
  hasRuntimeCondition,
  runtimeConditions,
  type ApplyConditionMode,
} from "../_shared/tcg-match-condition-engine-v0-2.ts";

export function dealRuntimeEffectDamage(
  creature: RuntimeCreature,
  amount: number,
): { requested: number; shield_prevented: number; actual_hp_damage: number } {
  const requested = Math.max(0, Number(amount || 0));
  const shield = Math.max(0, Number(creature.shield || 0));
  const shieldPrevented = Math.min(shield, requested);
  const actual = requested - shieldPrevented;
  creature.shield = shield - shieldPrevented;
  creature.damage = Math.max(0, Number(creature.damage || 0)) + actual;
  return { requested, shield_prevented: shieldPrevented, actual_hp_damage: actual };
}

export function placeRuntimeDamage(creature: RuntimeCreature, amount: number): number {
  const placed = Math.max(0, Number(amount || 0));
  creature.damage = Math.max(0, Number(creature.damage || 0)) + placed;
  return placed;
}

export function addRuntimeShield(
  creature: RuntimeCreature,
  amount: number,
  shieldCap = 60,
): number {
  const previous = Number(creature.shield || 0);
  const increment = Math.max(0, Number(amount || 0));
  const cap = Math.max(0, Number(shieldCap || 0));
  const next = Math.min(cap, Math.max(0, previous + increment));
  creature.shield = next;
  return Math.max(0, next - Math.max(0, previous));
}

export function healRuntimeDamage(
  creature: RuntimeCreature,
  amount: number,
): number {
  const previous = Math.max(0, Number(creature.damage || 0));
  const requested = Math.max(0, Number(amount || 0));
  const next = Math.max(0, previous - requested);
  creature.damage = next;
  return previous - next;
}

export function moveRuntimeDamage(
  source: RuntimeCreature,
  destination: RuntimeCreature,
  amount: number,
): number {
  const requested = Math.max(0, Number(amount || 0));
  const movable = Math.min(Math.max(0, Number(source.damage || 0)), requested);
  source.damage = Math.max(0, Number(source.damage || 0)) - movable;
  destination.damage = Math.max(0, Number(destination.damage || 0)) + movable;
  return movable;
}

export function transferRuntimeShield(
  source: RuntimeCreature,
  destination: RuntimeCreature,
  amount: number,
  shieldCap = 60,
): number {
  const requested = Math.max(0, Number(amount || 0));
  const sourceShield = Math.max(0, Number(source.shield || 0));
  const destinationShield = Math.max(0, Number(destination.shield || 0));
  const capacity = Math.max(0, Number(shieldCap || 0) - destinationShield);
  const moved = Math.min(requested, sourceShield, capacity);
  source.shield = sourceShield - moved;
  destination.shield = destinationShield + moved;
  return moved;
}

function runtimeWhenMatches(when: unknown, context: RuntimeContinuousContext): boolean {
  if (when == null) return true;
  const evaluator = context.evaluate_when;
  return typeof evaluator === "function" && evaluator(when) === true;
}

function runtimeFilterValueMatches(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    return expected.some((value) => Object.is(value, actual) || String(value) === String(actual));
  }
  if (expected != null && typeof expected === "object") return false;
  return Object.is(actual, expected) || (actual != null && expected != null && String(actual) === String(expected));
}

function runtimeContinuousFiltersMatch(
  filters: Record<string, unknown> | undefined,
  context: RuntimeContinuousContext,
  ignoredKeys: string[] = [],
): boolean {
  const ignored = new Set(ignoredKeys);
  for (const [key, expected] of Object.entries(filters || {})) {
    if (ignored.has(key)) continue;
    if (!Object.hasOwn(context, key)) return false;
    if (!runtimeFilterValueMatches(context[key], expected)) return false;
  }
  return true;
}

export function collectRuntimeAttachedContinuousEffects(
  attachments: RuntimeCardInstance[],
  definitionLookup: RuntimeDefinitionLookup,
  kind: string,
): RuntimeAttachedContinuousEffect[] {
  const result: RuntimeAttachedContinuousEffect[] = [];
  for (const source of attachments || []) {
    const definition = definitionLookup(source) as Record<string, unknown> | null | undefined;
    const essence = definition?.essence as Record<string, unknown> | null | undefined;
    const continuous = Array.isArray(essence?.continuous) ? essence.continuous : [];
    for (const raw of continuous) {
      if (!raw || typeof raw !== "object") continue;
      const effect = raw as RuntimeContinuousEffect;
      if (String(effect.kind || "") !== kind) continue;
      const target = effect.target == null ? "$attached_creature" : String(effect.target);
      if (target !== "$attached_creature") continue;
      result.push({ source, effect });
    }
  }
  return result;
}

export function applyRuntimeContinuousNumericModifiers(
  baseValue: number,
  attachments: RuntimeCardInstance[],
  definitionLookup: RuntimeDefinitionLookup,
  kind: string,
  context: RuntimeContinuousContext = {},
  floor = 0,
): number {
  const minimumFloor = Number.isFinite(Number(floor)) ? Number(floor) : 0;
  let value = Number.isFinite(Number(baseValue)) ? Number(baseValue) : minimumFloor;

  for (const { effect } of collectRuntimeAttachedContinuousEffects(attachments, definitionLookup, kind)) {
    if (!runtimeWhenMatches(effect.when, context)) continue;
    if (!runtimeContinuousFiltersMatch(effect.filters, context)) continue;

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
  }

  return Math.max(minimumFloor, value);
}

export function runtimeContinuousBlocksSource(
  attachments: RuntimeCardInstance[],
  definitionLookup: RuntimeDefinitionLookup,
  kind: string,
  sourceCategory: string,
  context: RuntimeContinuousContext = {},
): boolean {
  for (const { effect } of collectRuntimeAttachedContinuousEffects(attachments, definitionLookup, kind)) {
    if (!runtimeWhenMatches(effect.when, context)) continue;
    const filters = effect.filters || {};
    const blocked = Array.isArray(filters.blocked_sources) ? filters.blocked_sources.map((value) => String(value)) : [];
    if (!blocked.includes(sourceCategory)) continue;
    if (!runtimeContinuousFiltersMatch(filters, context, ["blocked_sources"])) continue;
    return true;
  }
  return false;
}

export function incrementRuntimeSourceCounter(
  creature: RuntimeCreature,
  counterId: string,
  amount: number,
): number {
  creature.flags ||= {};
  const flags = creature.flags as Record<string, unknown>;
  const counters = (flags.effect_counters ||= {}) as Record<string, number>;
  const next = Math.max(0, Number(counters[counterId] || 0) + Number(amount || 0));
  counters[counterId] = next;
  return next;
}

export function discardRuntimeDeckTop(player: RuntimePlayerZones, count: number): RuntimeCardInstance[] {
  const n = Math.min(Math.max(0, Number(count || 0)), player.deck.length);
  const moved = player.deck.splice(0, n);
  player.discard.push(...moved);
  return moved;
}

export function recordRuntimeEvent(
  state: Record<string, unknown>,
  event: string,
  payload: Record<string, unknown> = {},
): Record<string, unknown> {
  if (!event) throw new Error("runtime_event_name_required");
  const events = (state.effect_events ||= []) as Record<string, unknown>[];
  const entry = { event, ...payload };
  events.push(entry);
  return entry;
}
