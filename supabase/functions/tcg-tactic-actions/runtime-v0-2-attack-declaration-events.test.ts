import {
  runtimeV02EvaluateAttackDeclarationRecordEvents,
} from "../_shared/tcg-match-attack-declaration-events-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}
function assertThrows(fn: () => unknown, expected: string) {
  let error: unknown = null;
  try { fn(); } catch (caught) { error = caught; }
  assert(error instanceof Error, `expected error ${expected}`);
  assertEquals(error.message, expected, "unexpected error");
}

Deno.test("Attack declaration RECORD_EVENT supports attached-Essence count threshold", () => {
  const events = runtimeV02EvaluateAttackDeclarationRecordEvents([
    {
      op: "RECORD_EVENT",
      event: "storm-break-overcharged",
      when: {
        predicate: "event_attack_source_attached_essence_count_at_least",
        count: 4,
      },
    },
  ], { essence: [{}, {}, {}, {}] }, []);
  assertEquals(events["storm-break-overcharged"], 1, "threshold event");
});

Deno.test("Attack declaration RECORD_EVENT supports attached borrowed Essence kind", () => {
  const events = runtimeV02EvaluateAttackDeclarationRecordEvents([
    {
      op: "RECORD_EVENT",
      event: "chainstorm-borrowed",
      when: {
        predicate: "event_attack_source_has_attached_essence_kind",
        kind: "borrowed",
      },
    },
  ], { essence: [{}] }, ["borrowed"]);
  assertEquals(events["chainstorm-borrowed"], 1, "borrowed event");
});

Deno.test("Attack declaration event collector emits nothing when predicates are false", () => {
  const events = runtimeV02EvaluateAttackDeclarationRecordEvents([
    {
      op: "RECORD_EVENT",
      event: "storm-break-overcharged",
      when: {
        predicate: "event_attack_source_attached_essence_count_at_least",
        count: 4,
      },
    },
    {
      op: "RECORD_EVENT",
      event: "chainstorm-borrowed",
      when: {
        predicate: "event_attack_source_has_attached_essence_kind",
        kind: "borrowed",
      },
    },
  ], { essence: [{}, {}] }, []);
  assertEquals(Object.keys(events).length, 0, "no declaration events");
});

Deno.test("Attack declaration event collector fails closed on unsupported operation and predicate", () => {
  assertThrows(
    () => runtimeV02EvaluateAttackDeclarationRecordEvents(
      [{ op: "DRAW" }],
      { essence: [] },
      [],
    ),
    "tcg_v0_2_attack_declaration_op_unsupported:DRAW",
  );
  assertThrows(
    () => runtimeV02EvaluateAttackDeclarationRecordEvents([
      { op: "RECORD_EVENT", event: "x", when: { predicate: "unknown" } },
    ], { essence: [] }, []),
    "tcg_v0_2_attack_declaration_predicate_unsupported:unknown",
  );
});
