import {
  runtimeV02RandomSampleHiddenZone,
} from "../_shared/tcg-match-hidden-zone-sample-v0-2.ts";

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

Deno.test("hidden-zone random sample is non-destructive and without replacement", () => {
  const zone = [
    { uid: "a" },
    { uid: "b" },
    { uid: "c" },
    { uid: "d" },
  ];
  const original = zone.map((card) => card.uid).join(",");
  const picks = [2, 0];
  const sampled = runtimeV02RandomSampleHiddenZone(zone, 2, () => picks.shift()!);
  assertEquals(sampled.map((card) => card.uid).join(","), "c,a", "deterministic sample");
  assertEquals(zone.map((card) => card.uid).join(","), original, "source zone must not mutate");
  assertEquals(new Set(sampled.map((card) => card.uid)).size, 2, "sample must be unique");
});

Deno.test("hidden-zone random sample validates exact count and available cards", () => {
  assertThrows(
    () => runtimeV02RandomSampleHiddenZone([1], -1, () => 0),
    "tcg_v0_2_hidden_sample_count_invalid",
  );
  assertThrows(
    () => runtimeV02RandomSampleHiddenZone([1], 2, () => 0),
    "tcg_v0_2_hidden_sample_insufficient_cards",
  );
});

Deno.test("hidden-zone random sample validates the authoritative RNG index", () => {
  assertThrows(
    () => runtimeV02RandomSampleHiddenZone(["a", "b"], 1, () => 2),
    "tcg_v0_2_hidden_sample_random_index_invalid",
  );
});
