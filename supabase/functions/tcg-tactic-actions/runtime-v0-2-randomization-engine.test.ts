import {
  runtimeV02ShuffleInPlace,
  runtimeV02ShuffledCopy,
  runtimeV02UniformRandomInt,
} from "../_shared/tcg-match-randomization-engine-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

Deno.test("randomization engine uses rejection sampling before modulo reduction", () => {
  const values = [0xffffffff, 5];
  let calls = 0;
  const result = runtimeV02UniformRandomInt(3, () => {
    const value = values[calls];
    calls += 1;
    return value;
  });
  assertEquals(calls, 2, "rejected uint32 must be retried");
  assertEquals(result, 2, "accepted uint32 must map inside requested range");
});

Deno.test("randomization engine validates max bounds and injected uint32 values", () => {
  for (const invalidMax of [0, -1, 1.5, 0x100000001]) {
    let message = "";
    try {
      runtimeV02UniformRandomInt(invalidMax, () => 0);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assertEquals(message, "tcg_v0_2_random_max_invalid", `invalid max ${invalidMax} must fail closed`);
  }

  for (const invalidValue of [-1, 1.5, 0x100000000]) {
    let message = "";
    try {
      runtimeV02UniformRandomInt(2, () => invalidValue);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assertEquals(message, "tcg_v0_2_random_uint32_invalid", `invalid uint32 ${invalidValue} must fail closed`);
  }
});

Deno.test("randomization engine fails closed if an injected source never leaves rejection space", () => {
  let message = "";
  try {
    runtimeV02UniformRandomInt(3, () => 0xffffffff);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assertEquals(message, "tcg_v0_2_random_rejection_guard", "permanent rejection must hit guard");
});

Deno.test("in-place shuffle is deterministic under injection and preserves array/object identity", () => {
  const a = { uid: "a" };
  const b = { uid: "b" };
  const c = { uid: "c" };
  const d = { uid: "d" };
  const values = [a, b, c, d];
  const originalArray = values;
  const requestedMaxima: number[] = [];
  const injected = [0, 1, 0];
  let cursor = 0;

  const result = runtimeV02ShuffleInPlace(values, (maxExclusive) => {
    requestedMaxima.push(maxExclusive);
    const value = injected[cursor];
    cursor += 1;
    return value;
  });

  assert(result === originalArray, "in-place shuffle must return the original array reference");
  assertEquals(requestedMaxima.join(","), "4,3,2", "Fisher-Yates must request shrinking uniform ranges");
  assert(result[0] === c && result[1] === d && result[2] === b && result[3] === a, "deterministic permutation mismatch");
  assert(new Set(result).size === 4, "shuffle must preserve each exact object once");
});

Deno.test("shuffle validates the complete injected plan before mutating", () => {
  const a = { uid: "a" };
  const b = { uid: "b" };
  const c = { uid: "c" };
  const values = [a, b, c];
  const injected = [0, 2];
  let cursor = 0;
  let message = "";
  try {
    runtimeV02ShuffleInPlace(values, () => {
      const value = injected[cursor];
      cursor += 1;
      return value;
    });
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assertEquals(cursor, 2, "late invalid index must be reached during preflight");
  assertEquals(message, "tcg_v0_2_random_index_invalid", "late out-of-range shuffle index must fail closed");
  assert(values[0] === a && values[1] === b && values[2] === c, "invalid shuffle plan must leave the entire array unchanged");
});

Deno.test("shuffled copy leaves source order untouched while preserving exact object identity", () => {
  const a = { uid: "a" };
  const b = { uid: "b" };
  const c = { uid: "c" };
  const source = [a, b, c] as const;
  const injected = [0, 0];
  let cursor = 0;

  const shuffled = runtimeV02ShuffledCopy(source, () => {
    const value = injected[cursor];
    cursor += 1;
    return value;
  });

  assert(source[0] === a && source[1] === b && source[2] === c, "source order must remain unchanged");
  assert(!Object.is(shuffled, source), "shuffled copy must return a distinct array");
  assert(shuffled[0] === b && shuffled[1] === c && shuffled[2] === a, "copy permutation mismatch");
});
