export type RuntimeV02PresentationSeat = 1 | 2;

export type RuntimeV02PresentationAudience =
  | { kind: "public" }
  | { kind: "seat"; seat: RuntimeV02PresentationSeat };

export type RuntimeV02PresentationIntensity = "micro" | "standard" | "hero";

export type RuntimeV02PresentationAnchor = {
  seat?: RuntimeV02PresentationSeat;
  zone: string;
  index?: number | null;
  card_uid?: string | null;
  card_id?: string | null;
};

export type RuntimeV02PresentationMovement = {
  from: RuntimeV02PresentationAnchor;
  to: RuntimeV02PresentationAnchor;
  card_uids?: string[];
  count?: number;
};

export type RuntimeV02PresentationStateDelta = {
  damage?: number;
  shield?: number;
  heal?: number;
  count?: number;
  condition?: string | null;
  from?: string | number | null;
  to?: string | number | null;
};

export type RuntimeV02PresentationChoice = {
  choice_id: string;
  min: number;
  max: number;
  selected_count?: number;
  legal_target_keys?: string[];
};

export type RuntimeV02PresentationCue = {
  id: string;
  order: number;
  family:
    | "zone_move"
    | "choice"
    | "source_activation"
    | "target_focus"
    | "payment"
    | "attack_windup"
    | "ability"
    | "impact"
    | "damage"
    | "shield_delta"
    | "heal"
    | "condition"
    | "listener_trigger"
    | "defeat"
    | "reward_followup"
    | "turn_continuation"
    | "shuffle"
    | "notice";
  audience: RuntimeV02PresentationAudience;
  intensity?: RuntimeV02PresentationIntensity;
  label?: string | null;
  source?: RuntimeV02PresentationAnchor | null;
  target?: RuntimeV02PresentationAnchor | null;
  movement?: RuntimeV02PresentationMovement | null;
  state_delta?: RuntimeV02PresentationStateDelta | null;
  choice?: RuntimeV02PresentationChoice | null;
};

export type RuntimeV02PresentationEnvelope = {
  schema: "tcg-presentation-envelope-v1";
  receipt_id: string;
  revision: number;
  action_kind: string;
  continuation_id?: string | null;
  cues: RuntimeV02PresentationCue[];
};

const FAMILIES = new Set<RuntimeV02PresentationCue["family"]>([
  "zone_move",
  "choice",
  "source_activation",
  "target_focus",
  "payment",
  "attack_windup",
  "ability",
  "impact",
  "damage",
  "shield_delta",
  "heal",
  "condition",
  "listener_trigger",
  "defeat",
  "reward_followup",
  "turn_continuation",
  "shuffle",
  "notice",
]);

function fail(code: string): never {
  throw new Error(code);
}

function cleanText(value: unknown, code: string): string {
  const text = String(value ?? "").trim();
  if (!text) fail(code);
  return text;
}

function cleanSeat(value: unknown, code: string): RuntimeV02PresentationSeat {
  const seat = Number(value);
  if (seat !== 1 && seat !== 2) fail(code);
  return seat as RuntimeV02PresentationSeat;
}

function cleanNonNegativeInteger(value: unknown, code: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) fail(code);
  return number;
}

function cleanAnchor(raw: unknown, code: string): RuntimeV02PresentationAnchor {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail(code);
  const value = raw as Record<string, unknown>;
  const anchor: RuntimeV02PresentationAnchor = {
    zone: cleanText(value.zone, `${code}_zone_required`),
  };
  if (value.seat != null) anchor.seat = cleanSeat(value.seat, `${code}_seat_invalid`);
  if (value.index != null) anchor.index = cleanNonNegativeInteger(value.index, `${code}_index_invalid`);
  if (value.card_uid != null) anchor.card_uid = cleanText(value.card_uid, `${code}_card_uid_invalid`);
  if (value.card_id != null) anchor.card_id = cleanText(value.card_id, `${code}_card_id_invalid`);
  return anchor;
}

function cleanAudience(raw: unknown): RuntimeV02PresentationAudience {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("tcg_presentation_audience_required");
  const value = raw as Record<string, unknown>;
  const kind = String(value.kind || "");
  if (kind === "public") return { kind: "public" };
  if (kind === "seat") return { kind: "seat", seat: cleanSeat(value.seat, "tcg_presentation_audience_seat_invalid") };
  fail("tcg_presentation_audience_kind_invalid");
}

function cleanMovement(raw: unknown): RuntimeV02PresentationMovement | null {
  if (raw == null) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("tcg_presentation_movement_invalid");
  const value = raw as Record<string, unknown>;
  const movement: RuntimeV02PresentationMovement = {
    from: cleanAnchor(value.from, "tcg_presentation_movement_from"),
    to: cleanAnchor(value.to, "tcg_presentation_movement_to"),
  };
  if (value.card_uids != null) {
    if (!Array.isArray(value.card_uids)) fail("tcg_presentation_movement_card_uids_invalid");
    movement.card_uids = value.card_uids.map((uid) => cleanText(uid, "tcg_presentation_movement_card_uid_invalid"));
  }
  if (value.count != null) movement.count = cleanNonNegativeInteger(value.count, "tcg_presentation_movement_count_invalid");
  return movement;
}

function cleanStateDelta(raw: unknown): RuntimeV02PresentationStateDelta | null {
  if (raw == null) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("tcg_presentation_state_delta_invalid");
  const value = raw as Record<string, unknown>;
  const delta: RuntimeV02PresentationStateDelta = {};
  for (const key of ["damage", "shield", "heal", "count"] as const) {
    if (value[key] != null) {
      const number = Number(value[key]);
      if (!Number.isFinite(number)) fail(`tcg_presentation_state_delta_${key}_invalid`);
      delta[key] = number;
    }
  }
  if (value.condition !== undefined) delta.condition = value.condition == null ? null : String(value.condition);
  if (value.from !== undefined) delta.from = value.from == null ? null : (typeof value.from === "number" ? value.from : String(value.from));
  if (value.to !== undefined) delta.to = value.to == null ? null : (typeof value.to === "number" ? value.to : String(value.to));
  return delta;
}

function cleanChoice(raw: unknown): RuntimeV02PresentationChoice | null {
  if (raw == null) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("tcg_presentation_choice_invalid");
  const value = raw as Record<string, unknown>;
  const min = cleanNonNegativeInteger(value.min, "tcg_presentation_choice_min_invalid");
  const max = cleanNonNegativeInteger(value.max, "tcg_presentation_choice_max_invalid");
  if (max < min) fail("tcg_presentation_choice_range_invalid");
  const choice: RuntimeV02PresentationChoice = {
    choice_id: cleanText(value.choice_id, "tcg_presentation_choice_id_required"),
    min,
    max,
  };
  if (value.selected_count != null) {
    choice.selected_count = cleanNonNegativeInteger(value.selected_count, "tcg_presentation_choice_selected_count_invalid");
  }
  if (value.legal_target_keys != null) {
    if (!Array.isArray(value.legal_target_keys)) fail("tcg_presentation_choice_legal_targets_invalid");
    choice.legal_target_keys = value.legal_target_keys.map((target) =>
      cleanText(target, "tcg_presentation_choice_legal_target_invalid")
    );
  }
  return choice;
}

function cleanCue(raw: unknown, index: number): RuntimeV02PresentationCue {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("tcg_presentation_cue_invalid");
  const value = raw as Record<string, unknown>;
  const family = String(value.family || "") as RuntimeV02PresentationCue["family"];
  if (!FAMILIES.has(family)) fail("tcg_presentation_cue_family_invalid");
  const intensity = value.intensity == null ? "standard" : String(value.intensity);
  if (!["micro", "standard", "hero"].includes(intensity)) fail("tcg_presentation_cue_intensity_invalid");
  const cue: RuntimeV02PresentationCue = {
    id: cleanText(value.id, "tcg_presentation_cue_id_required"),
    order: value.order == null ? index : cleanNonNegativeInteger(value.order, "tcg_presentation_cue_order_invalid"),
    family,
    audience: cleanAudience(value.audience),
    intensity: intensity as RuntimeV02PresentationIntensity,
  };
  if (value.label !== undefined) cue.label = value.label == null ? null : String(value.label);
  if (value.source != null) cue.source = cleanAnchor(value.source, "tcg_presentation_source");
  if (value.target != null) cue.target = cleanAnchor(value.target, "tcg_presentation_target");
  if (value.movement != null) cue.movement = cleanMovement(value.movement);
  if (value.state_delta != null) cue.state_delta = cleanStateDelta(value.state_delta);
  if (value.choice != null) cue.choice = cleanChoice(value.choice);
  return cue;
}

export function runtimeV02BuildPresentationEnvelope(raw: unknown): RuntimeV02PresentationEnvelope {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("tcg_presentation_envelope_invalid");
  const value = raw as Record<string, unknown>;
  if (value.schema !== "tcg-presentation-envelope-v1") fail("tcg_presentation_schema_invalid");
  const revision = cleanNonNegativeInteger(value.revision, "tcg_presentation_revision_invalid");
  if (!Array.isArray(value.cues)) fail("tcg_presentation_cues_invalid");
  const cues = value.cues.map(cleanCue).sort((left, right) =>
    left.order - right.order || left.id.localeCompare(right.id)
  );
  return {
    schema: "tcg-presentation-envelope-v1",
    receipt_id: cleanText(value.receipt_id, "tcg_presentation_receipt_id_required"),
    revision,
    action_kind: cleanText(value.action_kind, "tcg_presentation_action_kind_required"),
    continuation_id: value.continuation_id == null ? null : String(value.continuation_id),
    cues,
  };
}

export function runtimeV02PresentationEnvelopeForViewer(
  raw: unknown,
  viewerSeat: RuntimeV02PresentationSeat,
): RuntimeV02PresentationEnvelope {
  const seat = cleanSeat(viewerSeat, "tcg_presentation_viewer_seat_invalid");
  const envelope = runtimeV02BuildPresentationEnvelope(raw);
  return {
    ...envelope,
    cues: envelope.cues.filter((cue) =>
      cue.audience.kind === "public" || cue.audience.seat === seat
    ),
  };
}
