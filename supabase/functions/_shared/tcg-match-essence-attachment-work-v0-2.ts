import {
  runtimeV02EssenceAttachedSnapshotPredicate,
  runtimeV02SnapshotEssenceAttachedEligibility,
  type RuntimeV02EssenceAttachedEligibilitySnapshot,
  type RuntimeV02EssenceAttachedPredicateContext,
} from "./tcg-match-essence-attachment-eligibility-v0-2.ts";
import type { RuntimeV02EssenceAttachedListenerEvent } from "./tcg-match-essence-attachment-event-v0-2.ts";

export type RuntimeV02EssenceAttachedCandidateDescriptor = {
  kind: "ability" | "essence" | "relic" | "realm";
  source: { uid: string; card_id: string };
  source_controller_seat: 1 | 2;
  source_creature_uid: string | null;
  listener: Record<string, unknown>;
};

export type RuntimeV02FrozenEssenceAttachedWorkItem = {
  kind: RuntimeV02EssenceAttachedCandidateDescriptor["kind"];
  source: { uid: string; card_id: string };
  source_controller_seat: 1 | 2;
  source_creature_uid: string | null;
  listener_id: string;
  listener: Record<string, unknown>;
};

export type RuntimeV02EssenceAttachedTriggerPlan = {
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot;
  work: RuntimeV02FrozenEssenceAttachedWorkItem[];
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

function requirementMatches(
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot,
  raw: unknown,
  context: RuntimeV02EssenceAttachedPredicateContext,
): boolean {
  const value = objectRecord(raw);
  if (!value) {
    throw new Error("tcg_v0_2_attachment_trigger_requirement_invalid");
  }

  if (Object.hasOwn(value, "all")) {
    if (Object.keys(value).length !== 1 || !Array.isArray(value.all)) {
      throw new Error("tcg_v0_2_attachment_trigger_all_invalid");
    }
    return value.all.every((item) => requirementMatches(snapshot, item, context));
  }

  if (Object.hasOwn(value, "any")) {
    if (
      Object.keys(value).length !== 1 || !Array.isArray(value.any) ||
      value.any.length === 0
    ) {
      throw new Error("tcg_v0_2_attachment_trigger_any_invalid");
    }
    return value.any.some((item) => requirementMatches(snapshot, item, context));
  }

  if (Object.hasOwn(value, "not")) {
    if (Object.keys(value).length !== 1) {
      throw new Error("tcg_v0_2_attachment_trigger_not_invalid");
    }
    return !requirementMatches(snapshot, value.not, context);
  }

  const predicate = requiredString(
    value.predicate,
    "tcg_v0_2_attachment_trigger_predicate_required",
  );
  const result = runtimeV02EssenceAttachedSnapshotPredicate(
    snapshot,
    value,
    context,
  );
  if (result == null) {
    throw new Error(
      `tcg_v0_2_attachment_trigger_predicate_unsupported:${predicate}`,
    );
  }
  return result;
}

function timingMatches(
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot,
  candidate: RuntimeV02EssenceAttachedCandidateDescriptor,
): boolean {
  const timing = String(candidate.listener.timing || "any");
  if (timing === "own_turn") {
    return candidate.source_controller_seat === snapshot.active_seat;
  }
  if (timing === "any" || timing === "any_turn" || timing === "passive") {
    return true;
  }
  throw new Error(
    `tcg_v0_2_attachment_trigger_timing_unsupported:${timing}`,
  );
}

function controllerScopeMatches(
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot,
  candidate: RuntimeV02EssenceAttachedCandidateDescriptor,
): boolean {
  const raw = candidate.listener.controller_scope;
  if (raw == null || raw === "any") return true;
  if (raw === "self") {
    return candidate.source_controller_seat === snapshot.event.controller_seat;
  }
  throw new Error(
    `tcg_v0_2_attachment_trigger_controller_scope_unsupported:${String(raw)}`,
  );
}

export function runtimeV02EssenceAttachedCandidateEligibleAtTrigger(
  snapshot: RuntimeV02EssenceAttachedEligibilitySnapshot,
  candidate: RuntimeV02EssenceAttachedCandidateDescriptor,
): boolean {
  if (String(candidate.listener.event || "") !== "essence_attached") {
    return false;
  }
  if (!candidate.source?.uid || !candidate.source.card_id) {
    throw new Error("tcg_v0_2_attachment_trigger_source_invalid");
  }
  if (candidate.source_controller_seat !== 1 && candidate.source_controller_seat !== 2) {
    throw new Error("tcg_v0_2_attachment_trigger_source_seat_invalid");
  }
  requiredString(
    candidate.listener.id,
    "tcg_v0_2_attachment_trigger_listener_id_required",
  );
  if (!timingMatches(snapshot, candidate)) return false;
  if (!controllerScopeMatches(snapshot, candidate)) return false;
  if (candidate.listener.requirements == null) return true;
  return requirementMatches(snapshot, candidate.listener.requirements, {
    source_uid: candidate.source.uid,
    source_controller_seat: candidate.source_controller_seat,
    source_creature_uid: candidate.source_creature_uid,
  });
}

/**
 * Builds the immutable attachment-listener work set at trigger time. The
 * returned listener descriptors are cloned so later field movement, condition
 * changes or registry-object mutation cannot add or remove work retroactively.
 */
export function runtimeV02BuildEssenceAttachedTriggerPlan(
  state: Record<string, unknown>,
  event: RuntimeV02EssenceAttachedListenerEvent,
  candidates: RuntimeV02EssenceAttachedCandidateDescriptor[],
): RuntimeV02EssenceAttachedTriggerPlan {
  if (!Array.isArray(candidates)) {
    throw new Error("tcg_v0_2_attachment_trigger_candidates_required");
  }
  const snapshot = runtimeV02SnapshotEssenceAttachedEligibility(state, event);
  const work = candidates
    .filter((candidate) =>
      runtimeV02EssenceAttachedCandidateEligibleAtTrigger(snapshot, candidate)
    )
    .map((candidate) => ({
      kind: candidate.kind,
      source: {
        uid: requiredString(
          candidate.source.uid,
          "tcg_v0_2_attachment_trigger_source_uid_required",
        ),
        card_id: requiredString(
          candidate.source.card_id,
          "tcg_v0_2_attachment_trigger_source_card_id_required",
        ),
      },
      source_controller_seat: candidate.source_controller_seat,
      source_creature_uid: candidate.source_creature_uid == null
        ? null
        : requiredString(
          candidate.source_creature_uid,
          "tcg_v0_2_attachment_trigger_source_creature_uid_invalid",
        ),
      listener_id: requiredString(
        candidate.listener.id,
        "tcg_v0_2_attachment_trigger_listener_id_required",
      ),
      listener: structuredClone(candidate.listener),
    } satisfies RuntimeV02FrozenEssenceAttachedWorkItem));

  return structuredClone({ snapshot, work } satisfies RuntimeV02EssenceAttachedTriggerPlan);
}
