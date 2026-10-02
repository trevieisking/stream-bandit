import {
  hasRuntimeCondition,
  runtimeContinuousBlocksSource,
  type RuntimeCardInstance,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

const STATE_KEY = "runtime_v0_2_withdrawal_modifier_state";

type Seat = 1 | 2;

type ModifierRecord = {
  id: string;
  installed_turn_seq: number;
  source_controller_seat: Seat;
  target_controller_seat: Seat;
  target_personal_turn_at_install: number;
  source_card_uid: string;
  source_action_id: string;
  mode: "set" | "delta";
  amount: number;
  minimum: number;
  maximum_after_this_source: number | null;
  source_category: string | null;
  expires_on: "end_of_turn" | "controller_aftermath" | "target_controller_aftermath_started";
  max_uses: number | null;
  consume_on: "legal_voluntary_withdrawal_declared" | null;
  uses: number;
};

export type RuntimeV02WithdrawalModifierInstallInput = {
  source_controller_seat: Seat;
  target_controller_seat: Seat;
  source_card_uid: string;
  source_action_id: string;
};

export type RuntimeV02WithdrawalModifierApplication = {
  modifier_id: string;
  before_cost: number;
  after_cost: number;
  requested_delta: number;
  applied_delta: number;
  blocked_by_increase_immunity: boolean;
  source_category: string | null;
};

export type RuntimeV02WithdrawalModifierResolution = {
  base_cost: number;
  cost: number;
  applications: RuntimeV02WithdrawalModifierApplication[];
  consumable_modifier_ids: string[];
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredSeat(value: unknown, error: string): Seat {
  const seat = Number(value);
  if (seat !== 1 && seat !== 2) throw new Error(error);
  return seat as Seat;
}

function currentTurn(state: Record<string, unknown>): number {
  const turn = Number(state.turn_seq ?? 0);
  if (!Number.isInteger(turn) || turn < 0) {
    throw new Error("tcg_v0_2_withdrawal_modifier_turn_invalid");
  }
  return turn;
}

function personalTurn(state: Record<string, unknown>, seat: Seat): number {
  const turns = objectRecord(state.personal_turns);
  const value = Number(turns?.[String(seat)] ?? 0);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_withdrawal_modifier_personal_turn_invalid");
  }
  return value;
}

function creatureFlags(creature: RuntimeCreature): Record<string, unknown> {
  creature.flags ||= {};
  return creature.flags as Record<string, unknown>;
}

function modifierState(creature: RuntimeCreature): { modifiers: ModifierRecord[] } {
  const flags = creatureFlags(creature);
  const raw = objectRecord(flags[STATE_KEY]);
  if (raw) {
    if (!Array.isArray(raw.modifiers)) {
      throw new Error("tcg_v0_2_withdrawal_modifier_state_invalid");
    }
    return raw as { modifiers: ModifierRecord[] };
  }
  const fresh = { modifiers: [] as ModifierRecord[] };
  flags[STATE_KEY] = fresh;
  return fresh;
}

function topUid(creature: RuntimeCreature): string {
  const raw = creature as unknown as Record<string, unknown>;
  const stack = Array.isArray(raw.stack) ? raw.stack : [];
  const top = objectRecord(stack[stack.length - 1]);
  const uid = String(top?.uid || "").trim();
  if (!uid) throw new Error("tcg_v0_2_withdrawal_modifier_target_uid_required");
  return uid;
}

function allowedStepFields(step: Record<string, unknown>): void {
  const allowed = new Set([
    "op",
    "target",
    "minimum",
    "duration",
    "mode",
    "amount",
    "delta",
    "maximum_after_this_source",
    "source_category",
  ]);
  const unsupported = Object.keys(step).find((key) => !allowed.has(key));
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_step_field_unsupported:${unsupported}`,
    );
  }
  if (String(step.op || "") !== "SET_WITHDRAWAL_MODIFIER") {
    throw new Error("tcg_v0_2_withdrawal_modifier_op_required");
  }
  if (typeof step.target !== "string" || !String(step.target).trim()) {
    throw new Error("tcg_v0_2_withdrawal_modifier_target_required");
  }
}

function amountWhenMatches(
  when: unknown,
  creature: RuntimeCreature,
): boolean {
  const predicate = objectRecord(when);
  if (!predicate) {
    throw new Error("tcg_v0_2_withdrawal_modifier_amount_case_when_required");
  }
  if (String(predicate.predicate || "") !== "target_has_condition") {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_amount_predicate_unsupported:${String(predicate.predicate || "")}`,
    );
  }
  const condition = String(predicate.condition || "").trim();
  if (!condition) {
    throw new Error("tcg_v0_2_withdrawal_modifier_amount_condition_required");
  }
  return hasRuntimeCondition(creature, condition);
}

function numericAmount(
  raw: unknown,
  creature: RuntimeCreature,
): number {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
      throw new Error("tcg_v0_2_withdrawal_modifier_amount_invalid");
    }
    return raw;
  }
  const formula = objectRecord(raw);
  if (!formula) {
    throw new Error("tcg_v0_2_withdrawal_modifier_amount_invalid");
  }
  const allowed = new Set(["default", "cases"]);
  const unsupported = Object.keys(formula).find((key) => !allowed.has(key));
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_amount_field_unsupported:${unsupported}`,
    );
  }
  const fallback = Number(formula.default);
  if (!Number.isInteger(fallback)) {
    throw new Error("tcg_v0_2_withdrawal_modifier_amount_default_invalid");
  }
  if (!Array.isArray(formula.cases)) {
    throw new Error("tcg_v0_2_withdrawal_modifier_amount_cases_required");
  }
  for (const rawCase of formula.cases) {
    const item = objectRecord(rawCase);
    if (!item) {
      throw new Error("tcg_v0_2_withdrawal_modifier_amount_case_invalid");
    }
    const unsupportedCase = Object.keys(item).find((key) =>
      !["when", "amount"].includes(key)
    );
    if (unsupportedCase) {
      throw new Error(
        `tcg_v0_2_withdrawal_modifier_amount_case_field_unsupported:${unsupportedCase}`,
      );
    }
    if (!amountWhenMatches(item.when, creature)) continue;
    const value = Number(item.amount);
    if (!Number.isInteger(value)) {
      throw new Error("tcg_v0_2_withdrawal_modifier_amount_case_invalid");
    }
    return value;
  }
  return fallback;
}

function normalizeDuration(
  raw: unknown,
): Pick<ModifierRecord, "expires_on" | "max_uses" | "consume_on"> {
  const duration = objectRecord(raw);
  if (!duration) {
    throw new Error("tcg_v0_2_withdrawal_modifier_duration_required");
  }
  const unsupported = Object.keys(duration).find((key) =>
    !["expires_on", "max_uses", "consume_on"].includes(key)
  );
  if (unsupported) {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_duration_field_unsupported:${unsupported}`,
    );
  }
  if (!Array.isArray(duration.expires_on) || duration.expires_on.length !== 1) {
    throw new Error("tcg_v0_2_withdrawal_modifier_expiry_required");
  }
  const expiresOn = String(duration.expires_on[0] || "");
  if (
    ![
      "end_of_turn",
      "controller_aftermath",
      "target_controller_aftermath_started",
    ].includes(expiresOn)
  ) {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_expiry_unsupported:${expiresOn}`,
    );
  }
  let maxUses: number | null = null;
  if (duration.max_uses != null) {
    const value = Number(duration.max_uses);
    if (!Number.isInteger(value) || value < 1) {
      throw new Error("tcg_v0_2_withdrawal_modifier_max_uses_invalid");
    }
    maxUses = value;
  }
  let consumeOn: "legal_voluntary_withdrawal_declared" | null = null;
  if (duration.consume_on != null) {
    if (
      String(duration.consume_on) !== "legal_voluntary_withdrawal_declared"
    ) {
      throw new Error("tcg_v0_2_withdrawal_modifier_consume_on_unsupported");
    }
    consumeOn = "legal_voluntary_withdrawal_declared";
  }
  if (consumeOn && maxUses == null) {
    throw new Error(
      "tcg_v0_2_withdrawal_modifier_consume_requires_max_uses",
    );
  }
  return {
    expires_on: expiresOn as ModifierRecord["expires_on"],
    max_uses: maxUses,
    consume_on: consumeOn,
  };
}

function normalizeRecord(
  state: Record<string, unknown>,
  creature: RuntimeCreature,
  step: Record<string, unknown>,
  input: RuntimeV02WithdrawalModifierInstallInput,
): ModifierRecord {
  allowedStepFields(step);
  const sourceSeat = requiredSeat(
    input.source_controller_seat,
    "tcg_v0_2_withdrawal_modifier_source_seat_invalid",
  );
  const targetSeat = requiredSeat(
    input.target_controller_seat,
    "tcg_v0_2_withdrawal_modifier_target_seat_invalid",
  );
  const sourceCardUid = String(input.source_card_uid || "").trim();
  const sourceActionId = String(input.source_action_id || "").trim();
  if (!sourceCardUid) {
    throw new Error("tcg_v0_2_withdrawal_modifier_source_uid_required");
  }
  if (!sourceActionId) {
    throw new Error("tcg_v0_2_withdrawal_modifier_source_action_required");
  }

  const modeRaw = step.mode == null
    ? (step.delta != null ? "delta" : "set")
    : String(step.mode);
  if (modeRaw !== "set" && modeRaw !== "delta") {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_mode_unsupported:${modeRaw}`,
    );
  }
  const amountRaw = modeRaw === "delta"
    ? (step.delta ?? step.amount)
    : step.amount;
  const amount = numericAmount(amountRaw, creature);
  const minimum = Number(step.minimum);
  if (!Number.isInteger(minimum) || minimum < 0) {
    throw new Error("tcg_v0_2_withdrawal_modifier_minimum_invalid");
  }
  let maximum: number | null = null;
  if (step.maximum_after_this_source != null) {
    maximum = Number(step.maximum_after_this_source);
    if (!Number.isInteger(maximum) || maximum < minimum) {
      throw new Error(
        "tcg_v0_2_withdrawal_modifier_maximum_after_source_invalid",
      );
    }
  }
  const sourceCategory = step.source_category == null
    ? null
    : String(step.source_category);
  if (
    sourceCategory != null &&
    !["self_card_effect", "opponent_card_effect", "opponent_condition"].includes(
      sourceCategory,
    )
  ) {
    throw new Error(
      `tcg_v0_2_withdrawal_modifier_source_category_unsupported:${sourceCategory}`,
    );
  }
  const duration = normalizeDuration(step.duration);
  const installedTurn = currentTurn(state);
  const targetUid = topUid(creature);
  return {
    id:
      `withdrawal-modifier:${installedTurn}:${sourceActionId}:${sourceCardUid}:${targetUid}`,
    installed_turn_seq: installedTurn,
    source_controller_seat: sourceSeat,
    target_controller_seat: targetSeat,
    target_personal_turn_at_install: personalTurn(state, targetSeat),
    source_card_uid: sourceCardUid,
    source_action_id: sourceActionId,
    mode: modeRaw,
    amount,
    minimum,
    maximum_after_this_source: maximum,
    source_category: sourceCategory,
    ...duration,
    uses: 0,
  };
}

function recordStillPotentiallyLive(
  state: Record<string, unknown>,
  record: ModifierRecord,
): boolean {
  const turn = currentTurn(state);
  if (
    record.expires_on === "end_of_turn" ||
    record.expires_on === "controller_aftermath"
  ) {
    return turn <= record.installed_turn_seq;
  }
  const targetPersonal = personalTurn(state, record.target_controller_seat);
  return targetPersonal <= record.target_personal_turn_at_install + 1;
}

function effectiveSourceCategory(record: ModifierRecord): string | null {
  if (record.source_category == null) return null;
  if (record.source_category === "self_card_effect") {
    return record.source_controller_seat === record.target_controller_seat
      ? "self_card_effect"
      : "opponent_card_effect";
  }
  return record.source_category;
}

function increaseBlocked(
  state: Record<string, unknown>,
  creature: RuntimeCreature,
  targetElement: string,
  record: ModifierRecord,
): boolean {
  const category = effectiveSourceCategory(record);
  if (!category) return false;
  const raw = creature as unknown as Record<string, unknown>;
  const attachments = Array.isArray(raw.essence)
    ? raw.essence as RuntimeCardInstance[]
    : [];
  if (attachments.length === 0) return false;
  const definitionLookup = (instance: RuntimeCardInstance) =>
    runtimeV02Definition(state, instance);
  return runtimeContinuousBlocksSource(
    attachments,
    definitionLookup,
    "withdrawal_increase_immunity",
    category,
    {
      action_kind: "voluntary_withdrawal",
      target_element: targetElement,
      evaluate_when: (when: unknown) => {
        if (when == null) return true;
        const predicate = objectRecord(when);
        if (!predicate) return false;
        if (String(predicate.predicate || "") !== "target_element_is") {
          return false;
        }
        if (
          predicate.target != null &&
          String(predicate.target) !== "$attached_creature"
        ) return false;
        return String(predicate.element || "") === targetElement;
      },
    },
  );
}

export function runtimeV02InstallWithdrawalModifier(
  state: Record<string, unknown>,
  creature: RuntimeCreature,
  step: Record<string, unknown>,
  input: RuntimeV02WithdrawalModifierInstallInput,
): ModifierRecord {
  const record = normalizeRecord(state, creature, step, input);
  const holder = modifierState(creature);
  holder.modifiers = holder.modifiers.filter((entry) =>
    entry && entry.id !== record.id && recordStillPotentiallyLive(state, entry)
  );
  holder.modifiers.push(record);
  return { ...record };
}

export function runtimeV02ResolveWithdrawalModifierCost(
  state: Record<string, unknown>,
  creature: RuntimeCreature,
  targetControllerSeat: Seat,
  targetElement: string,
  baseCost: number,
): RuntimeV02WithdrawalModifierResolution {
  const targetSeat = requiredSeat(
    targetControllerSeat,
    "tcg_v0_2_withdrawal_modifier_target_seat_invalid",
  );
  if (!Number.isInteger(baseCost) || baseCost < 0) {
    throw new Error("tcg_v0_2_withdrawal_modifier_base_cost_invalid");
  }
  const holder = modifierState(creature);
  holder.modifiers = holder.modifiers.filter((record) =>
    record && recordStillPotentiallyLive(state, record)
  );

  let cost = baseCost;
  const applications: RuntimeV02WithdrawalModifierApplication[] = [];
  const consumable: string[] = [];
  for (const record of holder.modifiers) {
    if (record.target_controller_seat !== targetSeat) continue;
    if (record.max_uses != null && record.uses >= record.max_uses) continue;
    const before = cost;
    let after = record.mode === "set" ? record.amount : before + record.amount;
    after = Math.max(record.minimum, after, 0);
    if (record.maximum_after_this_source != null) {
      after = Math.min(after, record.maximum_after_this_source);
    }
    let blocked = false;
    if (after > before && increaseBlocked(state, creature, targetElement, record)) {
      after = before;
      blocked = true;
    }
    cost = after;
    applications.push({
      modifier_id: record.id,
      before_cost: before,
      after_cost: after,
      requested_delta: record.mode === "delta"
        ? record.amount
        : record.amount - before,
      applied_delta: after - before,
      blocked_by_increase_immunity: blocked,
      source_category: effectiveSourceCategory(record),
    });
    if (
      record.consume_on === "legal_voluntary_withdrawal_declared" &&
      record.max_uses != null
    ) {
      consumable.push(record.id);
    }
  }
  return {
    base_cost: baseCost,
    cost,
    applications,
    consumable_modifier_ids: consumable,
  };
}

export function runtimeV02ConsumeWithdrawalModifiers(
  creature: RuntimeCreature,
  modifierIds: string[],
  event: "legal_voluntary_withdrawal_declared",
): string[] {
  if (!Array.isArray(modifierIds)) {
    throw new Error("tcg_v0_2_withdrawal_modifier_consume_ids_invalid");
  }
  const ids = new Set(modifierIds.map(String));
  const holder = modifierState(creature);
  const consumed: string[] = [];
  const next: ModifierRecord[] = [];
  for (const record of holder.modifiers) {
    if (
      !ids.has(record.id) ||
      record.consume_on !== event ||
      record.max_uses == null
    ) {
      next.push(record);
      continue;
    }
    const uses = record.uses + 1;
    consumed.push(record.id);
    if (uses < record.max_uses) next.push({ ...record, uses });
  }
  holder.modifiers = next;
  return consumed;
}

function allCreatures(player: Record<string, unknown>): RuntimeCreature[] {
  const out: RuntimeCreature[] = [];
  const vanguard = player.vanguard;
  if (vanguard && typeof vanguard === "object" && !Array.isArray(vanguard)) {
    out.push(vanguard as RuntimeCreature);
  }
  if (Array.isArray(player.reserve)) {
    for (const creature of player.reserve) {
      if (creature && typeof creature === "object" && !Array.isArray(creature)) {
        out.push(creature as RuntimeCreature);
      }
    }
  }
  return out;
}

export function runtimeV02ExpireWithdrawalModifiersAtAftermath(
  state: Record<string, unknown>,
  aftermathSeat: Seat,
): string[] {
  const seat = requiredSeat(
    aftermathSeat,
    "tcg_v0_2_withdrawal_modifier_aftermath_seat_invalid",
  );
  const players = objectRecord(state.players);
  if (!players) throw new Error("tcg_v0_2_withdrawal_modifier_players_required");
  const removed: string[] = [];
  for (const ownerSeat of [1, 2] as const) {
    const player = objectRecord(players[String(ownerSeat)]);
    if (!player) continue;
    for (const creature of allCreatures(player)) {
      const flags = creature.flags as Record<string, unknown> | undefined;
      const raw = flags ? objectRecord(flags[STATE_KEY]) : null;
      if (!raw) continue;
      if (!Array.isArray(raw.modifiers)) {
        throw new Error("tcg_v0_2_withdrawal_modifier_state_invalid");
      }
      const next: ModifierRecord[] = [];
      for (const record of raw.modifiers as ModifierRecord[]) {
        const expire = record.expires_on === "end_of_turn"
          ? record.installed_turn_seq === currentTurn(state)
          : record.expires_on === "controller_aftermath"
          ? record.source_controller_seat === seat
          : record.target_controller_seat === seat;
        if (expire) removed.push(record.id);
        else next.push(record);
      }
      raw.modifiers = next;
      if (next.length === 0 && flags) delete flags[STATE_KEY];
    }
  }
  return removed;
}
