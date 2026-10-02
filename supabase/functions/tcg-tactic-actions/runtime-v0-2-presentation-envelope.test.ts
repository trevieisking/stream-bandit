import {
  runtimeV02BuildPresentationEnvelope,
  runtimeV02PresentationEnvelopeForViewer,
} from "../_shared/tcg-match-presentation-envelope-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  let error: unknown = null;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  assert(error instanceof Error, `expected error ${expected}`);
  assertEquals(error.message, expected, "unexpected error message");
}

const sample = {
  schema: "tcg-presentation-envelope-v1",
  receipt_id: "rev-42-attack",
  revision: 42,
  action_kind: "attack",
  continuation_id: "attack:42",
  cues: [
    {
      id: "impact",
      order: 20,
      family: "impact",
      audience: { kind: "public" },
      intensity: "hero",
      target: { seat: 2, zone: "vanguard" },
    },
    {
      id: "private-search",
      order: 10,
      family: "choice",
      audience: { kind: "seat", seat: 1 },
      choice: { choice_id: "search-1", min: 0, max: 3, selected_count: 0 },
    },
    {
      id: "activation",
      order: 0,
      family: "source_activation",
      audience: { kind: "public" },
      source: { seat: 1, zone: "vanguard" },
    },
  ],
};

Deno.test("presentation envelope sorts cues deterministically and preserves generic families", () => {
  const envelope = runtimeV02BuildPresentationEnvelope(sample);
  assertEquals(envelope.cues.map((cue) => cue.id).join(","), "activation,private-search,impact", "cue order");
  assertEquals(envelope.action_kind, "attack", "action kind");
  assertEquals(envelope.continuation_id, "attack:42", "continuation identity");
});

Deno.test("viewer filtering removes private cues without changing public choreography", () => {
  const seatOne = runtimeV02PresentationEnvelopeForViewer(sample, 1);
  const seatTwo = runtimeV02PresentationEnvelopeForViewer(sample, 2);
  assertEquals(seatOne.cues.length, 3, "seat one sees own private cue plus public cues");
  assertEquals(seatTwo.cues.length, 2, "seat two sees public cues only");
  assertEquals(seatTwo.cues.map((cue) => cue.id).join(","), "activation,impact", "seat two cue identities");
});

Deno.test("presentation envelope rejects unknown effect families and invalid viewer seats", () => {
  assertThrows(
    () => runtimeV02BuildPresentationEnvelope({
      ...sample,
      cues: [{ id: "bad", family: "calculate_damage", audience: { kind: "public" } }],
    }),
    "tcg_presentation_cue_family_invalid",
  );
  assertThrows(
    () => runtimeV02PresentationEnvelopeForViewer(sample, 3 as 1),
    "tcg_presentation_viewer_seat_invalid",
  );
});

Deno.test("presentation choice count is data driven rather than hard coded to three", () => {
  const envelope = runtimeV02BuildPresentationEnvelope({
    ...sample,
    receipt_id: "choice-five",
    action_kind: "search",
    cues: [{
      id: "choice",
      family: "choice",
      audience: { kind: "seat", seat: 1 },
      choice: { choice_id: "search-five", min: 2, max: 5, selected_count: 2 },
    }],
  });
  assertEquals(envelope.cues[0].choice?.min, 2, "minimum selection");
  assertEquals(envelope.cues[0].choice?.max, 5, "maximum selection");
});

Deno.test("presentation schema owns no gameplay calculation fields", () => {
  const envelope = runtimeV02BuildPresentationEnvelope(sample);
  const serialized = JSON.stringify(envelope);
  assert(!serialized.includes("calculate_damage"), "schema must not calculate damage");
  assert(!serialized.includes("legal_if"), "schema must not contain browser legality");
  assert(!serialized.includes("shuffle_seed"), "schema must not carry shuffle RNG");
});
