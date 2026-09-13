import {
  runtimeV02CreateActiveAbilityLiveChoice,
  type RuntimeV02PendingActiveAbilityLiveChoice,
} from "./tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02BeginImmediateActiveAbilityLiveRoute,
  type RuntimeV02ImmediateActiveAbilityLiveRouteResult,
} from "./tcg-match-active-ability-immediate-live-v0-2.ts";
import type { RuntimeV02ActiveAbilityProgramSource, RuntimeV02ActiveAbilityProgramState } from "./tcg-match-active-ability-program-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";

export type RuntimeV02ActiveAbilityLiveRouteResult<
  T extends RuntimeV02CardZoneInstance,
> =
  | {
    kind: "immediate";
    immediate: RuntimeV02ImmediateActiveAbilityLiveRouteResult<T>;
  }
  | {
    kind: "private_choice";
    choice: RuntimeV02PendingActiveAbilityLiveChoice;
  };

/**
 * Single live entry point for current structured active-Ability families.
 *
 * Order matters:
 * 1. immediate programs get first refusal and never manufacture a pending player
 *    choice merely to fit the older dispatcher contract;
 * 2. unsupported immediate programs fall through to the already-live private
 *    choice facade unchanged;
 * 3. completely unsupported families return null without mutation.
 *
 * The router owns no Ability semantics, Payment, Damage, Heal, Defeat or phase
 * transition. It only selects the already-canonical live route.
 */
export function runtimeV02BeginActiveAbilityLiveRoute<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityProgramState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityProgramSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02ActiveAbilityLiveRouteResult<T> | null {
  const immediate = runtimeV02BeginImmediateActiveAbilityLiveRoute(
    state,
    controllerSeat,
    source,
    defeatDescribe,
  );
  if (immediate) return { kind: "immediate", immediate };

  const choice = runtimeV02CreateActiveAbilityLiveChoice(
    state as Record<string, unknown>,
    controllerSeat,
    source,
    choiceId,
  );
  return choice ? { kind: "private_choice", choice } : null;
}
