export type RuntimeV02RandomUint32Source = () => number;
export type RuntimeV02RandomIndexSource = (maxExclusive: number) => number;

const UINT32_RANGE = 0x100000000;
const UINT32_MAX = UINT32_RANGE - 1;
const REJECTION_GUARD = 1024;

function runtimeV02AssertRandomUint32(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
    throw new Error("tcg_v0_2_random_uint32_invalid");
  }
}

export function runtimeV02SecureRandomUint32(): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0];
}

export function runtimeV02UniformRandomInt(
  maxExclusive: number,
  source: RuntimeV02RandomUint32Source = runtimeV02SecureRandomUint32,
): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
    throw new Error("tcg_v0_2_random_max_invalid");
  }

  const acceptanceLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  for (let attempt = 0; attempt < REJECTION_GUARD; attempt += 1) {
    const value = source();
    runtimeV02AssertRandomUint32(value);
    if (value < acceptanceLimit) return value % maxExclusive;
  }
  throw new Error("tcg_v0_2_random_rejection_guard");
}

export function runtimeV02ShuffleInPlace<T>(
  values: T[],
  randomIndex: RuntimeV02RandomIndexSource = (maxExclusive) => runtimeV02UniformRandomInt(maxExclusive),
): T[] {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const selectedIndex = randomIndex(index + 1);
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > index) {
      throw new Error("tcg_v0_2_random_index_invalid");
    }
    [values[index], values[selectedIndex]] = [values[selectedIndex], values[index]];
  }
  return values;
}

export function runtimeV02ShuffledCopy<T>(
  values: readonly T[],
  randomIndex: RuntimeV02RandomIndexSource = (maxExclusive) => runtimeV02UniformRandomInt(maxExclusive),
): T[] {
  const copy = [...values];
  return runtimeV02ShuffleInPlace(copy, randomIndex);
}
