import {
  runtimeV02DamageAmount,
  runtimeV02DamageObject,
  runtimeV02DamageString,
  runtimeV02DamageTurn,
  runtimeV02NormalizeDamagePacketContext,
  type RuntimeV02BeforeDamagePacketResult,
  type RuntimeV02DamagePacketCandidate,
  type RuntimeV02DamagePacketContext,
  type RuntimeV02DamagePacketLookup,
  type RuntimeV02DamagePacketModification,
  type RuntimeV02ResolvedDamagePacketContext,
} from "./tcg-match-damage-packet-context-v0-2.ts";
import {
  runtimeV02DamagePacketCandidates,
  runtimeV02DamagePacketListenerId,
  runtimeV02DamagePacketTargetField,
} from "./tcg-match-damage-packet-source-v0-2.ts";

type Limit = { count: number; owner: "card_instance" | "attachment"; key: string };
const LIMITS = "runtime_v0_2_damage_packet_limits";
const RECEIPTS = "runtime_v0_2_damage_packet_receipts";

function requirement(
  raw: unknown,
  packet: RuntimeV02DamagePacketContext,
  candidate: RuntimeV02DamagePacketCandidate,
  amount: number,
): boolean {
  const value = runtimeV02DamageObject(raw);
  if (!value) throw new Error("tcg_v0_2_damage_packet_requirement_invalid");
  if (Object.hasOwn(value, "all")) {
    if (Object.keys(value).length !== 1 || !Array.isArray(value.all)) {
      throw new Error("tcg_v0_2_damage_packet_all_invalid");
    }
    return value.all.every((item) => requirement(item, packet, candidate, amount));
  }
  if (Object.hasOwn(value, "any")) {
    if (Object.keys(value).length !== 1 || !Array.isArray(value.any) || !value.any.length) {
      throw new Error("tcg_v0_2_damage_packet_any_invalid");
    }
    return value.any.some((item) => requirement(item, packet, candidate, amount));
  }
  if (Object.hasOwn(value, "not")) {
    if (Object.keys(value).length !== 1) throw new Error("tcg_v0_2_damage_packet_not_invalid");
    return !requirement(value.not, packet, candidate, amount);
  }

  const predicate = runtimeV02DamageString(
    value.predicate,
    "tcg_v0_2_damage_packet_predicate_required",
  );
  switch (predicate) {
    case "damage_packet_target_is_attached_creature":
      return !!candidate.field && candidate.field.top.uid === packet.target_creature_uid;
    case "damage_packet_class_is":
      return packet.damage_class === runtimeV02DamageString(
        value.damage_class,
        "tcg_v0_2_damage_packet_predicate_class_required",
      );
    case "damage_packet_condition_is":
      return packet.condition === runtimeV02DamageString(
        value.condition,
        "tcg_v0_2_damage_packet_predicate_condition_required",
      );
    case "damage_packet_source_controller_is_opponent":
      return packet.source_controller_seat != null &&
        packet.source_controller_seat !== candidate.seat;
    case "damage_packet_target_zone_is":
      return packet.target_zone === runtimeV02DamageString(
        value.zone,
        "tcg_v0_2_damage_packet_predicate_zone_required",
      );
    case "damage_packet_amount_at_least":
      return amount >= runtimeV02DamageAmount(
        value.value ?? value.amount,
        "tcg_v0_2_damage_packet_predicate_amount_invalid",
      );
    case "source_in_play":
      return candidate.kind === "realm" || candidate.field != null;
    case "source_controller_is_self":
      return packet.source_controller_seat === candidate.seat;
    default:
      throw new Error(`tcg_v0_2_damage_packet_predicate_unsupported:${predicate}`);
  }
}

function matches(
  packet: RuntimeV02DamagePacketContext,
  candidate: RuntimeV02DamagePacketCandidate,
  amount: number,
): boolean {
  const timing = candidate.listener.timing;
  if (
    timing != null &&
    !["any", "passive", "attack", "aftermath"].includes(String(timing))
  ) {
    throw new Error("tcg_v0_2_damage_packet_timing_unsupported");
  }
  return candidate.listener.requirements == null ||
    requirement(candidate.listener.requirements, packet, candidate, amount);
}

function sourceState(
  candidate: RuntimeV02DamagePacketCandidate,
  key: typeof LIMITS | typeof RECEIPTS,
  create = false,
): Record<string, unknown> | null {
  if (candidate.source.effect_flags == null) {
    if (!create) return null;
    candidate.source.effect_flags = {};
  }
  const flags = runtimeV02DamageObject(candidate.source.effect_flags);
  if (!flags) throw new Error("tcg_v0_2_damage_packet_source_flags_invalid");
  if (flags[key] == null) {
    if (!create) return null;
    flags[key] = {};
  }
  const state = runtimeV02DamageObject(flags[key]);
  if (!state) throw new Error("tcg_v0_2_damage_packet_source_state_invalid");
  return state;
}

function receiptKey(
  candidate: RuntimeV02DamagePacketCandidate,
  packet: RuntimeV02ResolvedDamagePacketContext,
): string {
  return `${runtimeV02DamagePacketListenerId(candidate)}:${packet.packet_id}`;
}
function alreadyResolved(
  candidate: RuntimeV02DamagePacketCandidate,
  packet: RuntimeV02ResolvedDamagePacketContext,
): boolean {
  const raw = runtimeV02DamageObject(
    sourceState(candidate, RECEIPTS)?.[receiptKey(candidate, packet)],
  );
  if (!raw) return false;
  if (
    String(raw.packet_id || "") !== packet.packet_id ||
    String(raw.listener_id || "") !== runtimeV02DamagePacketListenerId(candidate) ||
    Number(raw.turn_seq) !== packet.turn_seq
  ) {
    throw new Error("tcg_v0_2_damage_packet_receipt_invalid");
  }
  return true;
}
function markResolved(
  candidate: RuntimeV02DamagePacketCandidate,
  packet: RuntimeV02ResolvedDamagePacketContext,
): void {
  sourceState(candidate, RECEIPTS, true)![receiptKey(candidate, packet)] = {
    packet_id: packet.packet_id,
    listener_id: runtimeV02DamagePacketListenerId(candidate),
    turn_seq: packet.turn_seq,
  };
}
function limit(candidate: RuntimeV02DamagePacketCandidate): Limit | null {
  const raw = runtimeV02DamageObject(candidate.listener.limit);
  if (!raw) return null;
  if (String(raw.scope || "") !== "turn") {
    throw new Error("tcg_v0_2_damage_packet_limit_scope_unsupported");
  }
  const count = Number(raw.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("tcg_v0_2_damage_packet_limit_count_invalid");
  }
  const owner = String(raw.owner || "") as Limit["owner"];
  let ownerKey: string;
  if (owner === "card_instance") {
    ownerKey = `card_instance:${candidate.source.uid}`;
  } else if (owner === "attachment") {
    if (
      (candidate.kind !== "essence" && candidate.kind !== "relic") ||
      !candidate.field
    ) {
      throw new Error("tcg_v0_2_damage_packet_attachment_limit_requires_attachment");
    }
    ownerKey = `attachment:${candidate.source.uid}:${candidate.field.top.uid}`;
  } else {
    throw new Error(`tcg_v0_2_damage_packet_limit_owner_unsupported:${String(raw.owner || "")}`);
  }
  return {
    count,
    owner,
    key: `${runtimeV02DamagePacketListenerId(candidate)}:${ownerKey}`,
  };
}
function used(candidate: RuntimeV02DamagePacketCandidate, rule: Limit, turn: number): number {
  const raw = runtimeV02DamageObject(sourceState(candidate, LIMITS)?.[rule.key]);
  if (!raw) return 0;
  const rawTurn = Number(raw.turn_seq);
  const count = Number(raw.count);
  if (!Number.isInteger(rawTurn) || !Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_damage_packet_limit_state_invalid");
  }
  return rawTurn === turn ? count : 0;
}
function consume(
  candidate: RuntimeV02DamagePacketCandidate,
  rule: Limit,
  turn: number,
): void {
  const current = used(candidate, rule, turn);
  if (current >= rule.count) {
    throw new Error("tcg_v0_2_damage_packet_limit_already_consumed");
  }
  sourceState(candidate, LIMITS, true)![rule.key] = {
    turn_seq: turn,
    count: current + 1,
    owner: rule.owner,
    listener_id: runtimeV02DamagePacketListenerId(candidate),
  };
}
function steps(candidate: RuntimeV02DamagePacketCandidate): Record<string, unknown>[] {
  if (!Array.isArray(candidate.listener.steps) || !candidate.listener.steps.length) {
    throw new Error("tcg_v0_2_damage_packet_steps_required");
  }
  return candidate.listener.steps.map((raw, index) => {
    const step = runtimeV02DamageObject(raw);
    if (!step) throw new Error(`tcg_v0_2_damage_packet_step_invalid:${index}`);
    if (String(step.op || "") !== "MODIFY_CURRENT_DAMAGE_PACKET") {
      throw new Error(
        `tcg_v0_2_damage_packet_step_unsupported:${String(step.op || "")}`,
      );
    }
    return step;
  });
}

export function runtimeV02ResolveBeforeDamagePacketInternal(
  state: Record<string, unknown>,
  amount: number,
  rawContext: RuntimeV02DamagePacketContext,
  lookup: RuntimeV02DamagePacketLookup,
): RuntimeV02BeforeDamagePacketResult {
  const requested = runtimeV02DamageAmount(
    amount,
    "tcg_v0_2_damage_packet_amount_invalid",
  );
  const packet: RuntimeV02ResolvedDamagePacketContext = {
    ...runtimeV02NormalizeDamagePacketContext(rawContext),
    turn_seq: runtimeV02DamageTurn(state),
  };
  runtimeV02DamagePacketTargetField(state, packet, lookup);

  let current = requested;
  const modifications: RuntimeV02DamagePacketModification[] = [];
  const limited: Array<{ listener_id: string; source_uid: string }> = [];
  const already: Array<{ listener_id: string; source_uid: string }> = [];

  for (const candidate of runtimeV02DamagePacketCandidates(state, lookup)) {
    if (!matches(packet, candidate, current)) continue;
    if (alreadyResolved(candidate, packet)) {
      already.push({
        listener_id: runtimeV02DamagePacketListenerId(candidate),
        source_uid: candidate.source.uid,
      });
      continue;
    }
    const rule = limit(candidate);
    if (rule && used(candidate, rule, packet.turn_seq) >= rule.count) {
      limited.push({
        listener_id: runtimeV02DamagePacketListenerId(candidate),
        source_uid: candidate.source.uid,
      });
      continue;
    }

    for (const step of steps(candidate)) {
      const before = current;
      const delta = Number(step.delta);
      if (!Number.isFinite(delta)) {
        throw new Error("tcg_v0_2_damage_packet_modifier_delta_invalid");
      }
      const minimum = runtimeV02DamageAmount(
        step.minimum,
        "tcg_v0_2_damage_packet_modifier_minimum_invalid",
      );
      current = Math.max(minimum, current + delta);
      modifications.push({
        listener_id: runtimeV02DamagePacketListenerId(candidate),
        source_uid: candidate.source.uid,
        source_card_id: candidate.source.card_id,
        source_kind: candidate.kind,
        controller_seat: candidate.seat,
        amount_before: before,
        delta,
        minimum,
        amount_after: current,
      });
    }
    markResolved(candidate, packet);
    if (rule) consume(candidate, rule, packet.turn_seq);
  }

  return {
    packet_id: packet.packet_id,
    requested_amount: requested,
    final_amount: current,
    modifications,
    limited,
    already_resolved: already,
  };
}
