import {
  runtimeV02EssenceAttachedSnapshotPredicate,
  type RuntimeV02EssenceAttachedEligibilitySnapshot,
  type RuntimeV02EssenceAttachedPredicateContext,
} from "../_shared/tcg-match-essence-attachment-eligibility-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function snapshot(attachmentKind: string): RuntimeV02EssenceAttachedEligibilitySnapshot {
  return {
    event: {
      event_id: "attach:borrowed:1",
      event: "essence_attached",
      subject_uid: "volt-essence-uid",
      subject_card_id: "volt-test-essence",
      controller_seat: 1,
      origin_zone: "effect_owned_selection",
      destination_zone: "field",
      destination_index: null,
      phase: "build",
      source_action_id: "borrowed-attachment-test",
      source_card_uid: "volt-essence-uid",
      action_kind: "essence_attachment",
      turn_seq: 7,
      attachment_target_uid: "railhorn-uid",
      attachment_kind: attachmentKind,
    },
    active_seat: 1,
    target: {
      controller_seat: 1,
      uid: "railhorn-uid",
      zone: "vanguard",
      index: null,
      element: "Volt",
      stage: "Standalone",
      damaged: false,
      conditions: [],
    },
    subject: {
      uid: "volt-essence-uid",
      card_id: "volt-test-essence",
      card_family: "Essence",
      element: "Volt",
      essence_subtype: "Special",
    },
    voluntary_withdrawal_legal_with_incoming: false,
  };
}

const context: RuntimeV02EssenceAttachedPredicateContext = {
  source_uid: "railhorn-uid",
  source_controller_seat: 1,
  source_creature_uid: "railhorn-uid",
};

Deno.test("event_attachment_kind_is matches borrowed attachment snapshot exactly", () => {
  const borrowed = snapshot("borrowed");

  assertEquals(
    runtimeV02EssenceAttachedSnapshotPredicate(
      borrowed,
      { predicate: "event_attachment_kind_is", kind: "borrowed" },
      context,
    ),
    true,
    "borrowed attachment must satisfy borrowed requirement",
  );

  assertEquals(
    runtimeV02EssenceAttachedSnapshotPredicate(
      borrowed,
      { predicate: "event_attachment_kind_is", kind: "temporary" },
      context,
    ),
    false,
    "borrowed attachment must not satisfy temporary requirement",
  );
});

Deno.test("event_attachment_kind_is keeps temporary and ordinary kinds distinct", () => {
  assertEquals(
    runtimeV02EssenceAttachedSnapshotPredicate(
      snapshot("temporary"),
      { predicate: "event_attachment_kind_is", kind: "temporary" },
      context,
    ),
    true,
    "temporary attachment must satisfy temporary requirement",
  );

  assertEquals(
    runtimeV02EssenceAttachedSnapshotPredicate(
      snapshot("normal"),
      { predicate: "event_attachment_kind_is", kind: "borrowed" },
      context,
    ),
    false,
    "ordinary attachment must not satisfy borrowed requirement",
  );
});
