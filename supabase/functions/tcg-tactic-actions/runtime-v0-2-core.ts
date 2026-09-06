export type RuntimeConditions = {
  scorched: boolean;
  venomed: number;
  control: string | null;
  modifier: string | null;
};

export type RuntimeCreature = {
  damage: number;
  shield: number;
  conditions?: RuntimeConditions | Record<string, unknown>;
  condition?: string | null;
  flags?: Record<string, unknown>;
};

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

const CONTROL_CONDITIONS = new Set(["Stunned", "Dazed", "Rooted", "Blinded", "Mindbound"]);
const MODIFIER_CONDITIONS = new Set(["Silenced", "Drenched", "Crushed"]);
const CONDITION_NAMES = new Set([
  "Scorched", "Venomed", "Blinded", "Mindbound", "Dazed",
  "Stunned", "Rooted", "Silenced", "Crushed", "Drenched",
]);

export function runtimeConditions(creature: RuntimeCreature): RuntimeConditions {
  const current = creature.conditions as Partial<RuntimeConditions> | undefined;
  const normalized: RuntimeConditions = {
    scorched: Boolean(current?.scorched),
    venomed: Math.max(0, Number(current?.venomed || 0)),
    control: current?.control ? String(current.control) : null,
    modifier: current?.modifier ? String(current.modifier) : null,
  };
  creature.conditions = normalized;
  return normalized;
}

export function hasRuntimeCondition(creature: RuntimeCreature, condition?: string): boolean {
  const current = runtimeConditions(creature);
  if (condition === "Scorched") return current.scorched;
  if (condition === "Venomed") return current.venomed > 0;
  if (condition) return current.control === condition || current.modifier === condition;
  return current.scorched || current.venomed > 0 || Boolean(current.control) || Boolean(current.modifier);
}

export function clearRuntimeCondition(creature: RuntimeCreature, condition: string): boolean {
  const current = runtimeConditions(creature);
  if (condition === "Scorched" && current.scorched) {
    current.scorched = false;
    return true;
  }
  if (condition === "Venomed" && current.venomed > 0) {
    current.venomed = 0;
    return true;
  }
  if (current.control === condition) {
    current.control = null;
    return true;
  }
  if (current.modifier === condition) {
    current.modifier = null;
    return true;
  }
  return false;
}

function activeConditionImmunity(creature: RuntimeCreature, condition: string, turnSeq: number): boolean {
  const immunity = (creature.flags as Record<string, unknown> | undefined)?.lifecycle_condition_immunity as Record<string, unknown> | undefined;
  if (!immunity) return false;
  if (Number(immunity.turn_seq) !== Number(turnSeq)) return false;
  const listed = Array.isArray(immunity.conditions)
    ? immunity.conditions.map((value) => String(value))
    : immunity.condition != null
    ? [String(immunity.condition)]
    : [];
  return listed.includes(condition);
}

export type ApplyConditionMode = "apply" | "apply_if_empty" | "apply_if_empty_or_same" | "replace";

export function applyRuntimeCondition(
  creature: RuntimeCreature,
  condition: string,
  turnSeq: number,
  mode: ApplyConditionMode = "apply",
): { applied: boolean; prevented: boolean; reason?: string } {
  if (!CONDITION_NAMES.has(condition)) throw new Error(`unknown_condition:${condition}`);
  if (activeConditionImmunity(creature, condition, turnSeq)) {
    return { applied: false, prevented: true, reason: "condition_immunity" };
  }

  const current = runtimeConditions(creature);
  if (condition === "Scorched") {
    if ((mode === "apply_if_empty" || mode === "apply_if_empty_or_same") && current.scorched) {
      return mode === "apply_if_empty_or_same" ? { applied: true, prevented: false } : { applied: false, prevented: false, reason: "slot_occupied" };
    }
    current.scorched = true;
    return { applied: true, prevented: false };
  }
  if (condition === "Venomed") {
    if (mode === "apply_if_empty" && current.venomed > 0) return { applied: false, prevented: false, reason: "slot_occupied" };
    current.venomed = Math.max(10, current.venomed);
    return { applied: true, prevented: false };
  }

  const slot = CONTROL_CONDITIONS.has(condition) ? "control" : MODIFIER_CONDITIONS.has(condition) ? "modifier" : null;
  if (!slot) throw new Error(`condition_slot_missing:${condition}`);
  const previous = current[slot];
  if (mode === "apply_if_empty" && previous) return { applied: false, prevented: false, reason: "slot_occupied" };
  if (mode === "apply_if_empty_or_same" && previous && previous !== condition) {
    return { applied: false, prevented: false, reason: "slot_occupied" };
  }
  if (mode !== "replace" && mode !== "apply" && previous && previous !== condition) {
    return { applied: false, prevented: false, reason: "slot_occupied" };
  }
  current[slot] = condition;
  return { applied: true, prevented: false };
}

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
