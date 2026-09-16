import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import {
  runtimeV02ApplyMoveDamageProgram,
  type RuntimeV02DamageProgramCreatureRef,
  type RuntimeV02DamageProgramState,
  type RuntimeV02MoveDamageProgramResult,
} from "./tcg-match-damage-program-v0-2.ts";
import { runtimeV02CreateRegistryDefeatDescribe } from "./tcg-match-defeat-registry-v0-2.ts";

export type RuntimeV02EventListenerMoveDamageSource = {
  event_id: string;
  listener_id: string;
  step_index: number;
  kind: "ability" | "essence" | "relic" | "realm";
  controller_seat: 1 | 2;
  source_card_uid: string;
  source_card_id: string;
  source_creature_uid: string | null;
};

export type RuntimeV02EventListenerMoveDamageStep = {
  op: "MOVE_DAMAGE";
  from: unknown;
  to: unknown;
  amount: number;
  allow_partial?: boolean;
  minimum_moved?: number;
  allow_opposing_destination?: boolean;
  destination_damage_cap?: number | null;
  as?: string;
};

export type RuntimeV02EventListenerMoveDamageRequest = {
  source: RuntimeV02EventListenerMoveDamageSource;
  step: RuntimeV02EventListenerMoveDamageStep | Record<string, unknown>;
  from: RuntimeV02DamageProgramCreatureRef;
  to: RuntimeV02DamageProgramCreatureRef;
};

export type RuntimeV02EventListenerMoveDamageResolution = {
  damage: RuntimeV02MoveDamageProgramResult;
  result_variable: string | null;
};

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

function nonNegativeInteger(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(error);
  return number;
}

function positiveAmount(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(error);
  return number;
}

function nonNegativeAmount(value: unknown, error: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(error);
  return number;
}

function optionalBoolean(value: unknown, error: string): boolean | undefined {
  if (value == null) return undefined;
  if (typeof value !== "boolean") throw new Error(error);
  return value;
}

function requireBinding(value: unknown, error: string): void {
  if (typeof value === "string" && value.trim()) return;
  if (objectRecord(value)) return;
  throw new Error(error);
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: readonly string[],
  error: string,
): void {
  const set = new Set(allowed);
  const unsupported = Object.keys(value).find((key) => !set.has(key));
  if (unsupported) throw new Error(`${error}:${unsupported}`);
}

function normalizedSource(raw: RuntimeV02EventListenerMoveDamageSource) {
  if (!raw || typeof raw !== "object") {
    throw new Error("tcg_v0_2_event_listener_move_damage_source_required");
  }
  const eventId = requiredString(
    raw.event_id,
    "tcg_v0_2_event_listener_move_damage_event_id_required",
  );
  const listenerId = requiredString(
    raw.listener_id,
    "tcg_v0_2_event_listener_move_damage_listener_id_required",
  );
  const kind = String(raw.kind || "") as RuntimeV02EventListenerMoveDamageSource["kind"];
  if (!["ability", "essence", "relic", "realm"].includes(kind)) {
    throw new Error("tcg_v0_2_event_listener_move_damage_kind_invalid");
  }
  if (raw.controller_seat !== 1 && raw.controller_seat !== 2) {
    throw new Error("tcg_v0_2_event_listener_move_damage_controller_invalid");
  }
  const sourceCreatureUid = raw.source_creature_uid == null
    ? null
    : requiredString(
      raw.source_creature_uid,
      "tcg_v0_2_event_listener_move_damage_source_creature_uid_invalid",
    );

  return {
    event_id: eventId,
    listener_id: listenerId,
    step_index: nonNegativeInteger(
      raw.step_index,
      "tcg_v0_2_event_listener_move_damage_step_index_invalid",
    ),
    kind,
    controller_seat: raw.controller_seat,
    source_card_uid: requiredString(
      raw.source_card_uid,
      "tcg_v0_2_event_listener_move_damage_source_card_uid_required",
    ),
    source_card_id: requiredString(
      raw.source_card_id,
      "tcg_v0_2_event_listener_move_damage_source_card_id_required",
    ),
    source_creature_uid: sourceCreatureUid,
  };
}

function normalizedStep(raw: RuntimeV02EventListenerMoveDamageRequest["step"]) {
  const step = objectRecord(raw);
  if (!step) throw new Error("tcg_v0_2_event_listener_move_damage_step_required");
  rejectUnsupportedFields(
    step,
    [
      "op",
      "from",
      "to",
      "amount",
      "allow_partial",
      "minimum_moved",
      "allow_opposing_destination",
      "destination_damage_cap",
      "as",
    ],
    "tcg_v0_2_event_listener_move_damage_step_field_unsupported",
  );
  if (step.op !== "MOVE_DAMAGE") {
    throw new Error("tcg_v0_2_event_listener_move_damage_step_op_invalid");
  }
  requireBinding(
    step.from,
    "tcg_v0_2_event_listener_move_damage_from_binding_required",
  );
  requireBinding(
    step.to,
    "tcg_v0_2_event_listener_move_damage_to_binding_required",
  );

  const resultVariable = step.as == null
    ? null
    : requiredString(
      step.as,
      "tcg_v0_2_event_listener_move_damage_result_variable_invalid",
    );
  const destinationCap = step.destination_damage_cap == null
    ? null
    : nonNegativeAmount(
      step.destination_damage_cap,
      "tcg_v0_2_event_listener_move_damage_destination_cap_invalid",
    );
  const minimumMoved = step.minimum_moved == null
    ? undefined
    : nonNegativeAmount(
      step.minimum_moved,
      "tcg_v0_2_event_listener_move_damage_minimum_invalid",
    );

  return {
    amount: positiveAmount(
      step.amount,
      "tcg_v0_2_event_listener_move_damage_amount_invalid",
    ),
    allow_partial: optionalBoolean(
      step.allow_partial,
      "tcg_v0_2_event_listener_move_damage_allow_partial_invalid",
    ) ?? false,
    minimum_moved: minimumMoved,
    allow_opposing_destination: optionalBoolean(
      step.allow_opposing_destination,
      "tcg_v0_2_event_listener_move_damage_allow_opposing_invalid",
    ) ?? false,
    destination_damage_cap: destinationCap,
    result_variable: resultVariable,
  };
}

/**
 * Generic Event Listener -> Damage owner bridge for sb-tcg-effects-v0.2
 * MOVE_DAMAGE.
 *
 * Event Listener owns only program sequencing and resolved target bindings. Damage
 * owns the wound transfer transaction, and Defeat owns all resulting lifecycle,
 * Reward and Card-Zone consequences. This adapter contains no card IDs or names.
 */
export function runtimeV02ApplyEventListenerMoveDamage<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02DamageProgramState<T>,
  request: RuntimeV02EventListenerMoveDamageRequest,
): RuntimeV02EventListenerMoveDamageResolution {
  const source = normalizedSource(request.source);
  const step = normalizedStep(request.step);
  const damage = runtimeV02ApplyMoveDamageProgram(state, {
    identity: {
      source_action_id:
        `event-listener:${source.event_id}:${source.listener_id}`,
      source_step_index: source.step_index,
      source_card_uid: source.source_card_uid,
      source_card_id: source.source_card_id,
      source_creature_uid: source.source_creature_uid,
      action_kind: source.kind,
      controller_seat: source.controller_seat,
    },
    from: request.from,
    to: request.to,
    amount: step.amount,
    allow_partial: step.allow_partial,
    minimum_moved: step.minimum_moved,
    allow_opposing_destination: step.allow_opposing_destination,
    destination_damage_cap: step.destination_damage_cap,
    defeat_describe: runtimeV02CreateRegistryDefeatDescribe<T>(
      state as Record<string, unknown>,
    ),
  });

  return {
    damage,
    result_variable: step.result_variable,
  };
}
