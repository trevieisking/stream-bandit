import { runtimeV02UniformRandomInt } from "./tcg-match-randomization-engine-v0-2.ts";

export type RuntimeV02HiddenZoneRandomIndex = (maxExclusive: number) => number;

/**
 * Selects an exact number of distinct entries from a hidden zone without
 * mutating or reordering the source zone. The caller remains responsible for
 * any later authoritative movement of the sampled cards.
 */
export function runtimeV02RandomSampleHiddenZone<T>(
  zone: readonly T[],
  count: number,
  randomIndex: RuntimeV02HiddenZoneRandomIndex = (maxExclusive) =>
    runtimeV02UniformRandomInt(maxExclusive),
): T[] {
  if (!Array.isArray(zone)) throw new Error("tcg_v0_2_hidden_sample_zone_invalid");
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("tcg_v0_2_hidden_sample_count_invalid");
  }
  if (count > zone.length) {
    throw new Error("tcg_v0_2_hidden_sample_insufficient_cards");
  }
  const available = zone.map((_, index) => index);
  const selected: T[] = [];
  for (let pick = 0; pick < count; pick += 1) {
    const poolIndex = randomIndex(available.length);
    if (!Number.isInteger(poolIndex) || poolIndex < 0 || poolIndex >= available.length) {
      throw new Error("tcg_v0_2_hidden_sample_random_index_invalid");
    }
    const sourceIndex = available.splice(poolIndex, 1)[0];
    selected.push(zone[sourceIndex]);
  }
  return selected;
}
