import {
  runtimeV02ExecuteActiveAbilityHiddenSample,
  type RuntimeV02ActiveAbilityHiddenSampleResolution,
} from "./tcg-match-active-ability-hidden-sample-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  type RuntimeV02PendingActiveAbilityLiveChoice,
} from "./tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02BeginImmediateActiveAbilityLiveRoute,
  type RuntimeV02ImmediateActiveAbilityLiveRouteResult,
} from "./tcg-match-active-ability-immediate-live-v0-2.ts";
import type { RuntimeV02ActiveAbilityProgramSource, RuntimeV02ActiveAbilityProgramState } from "./tcg-match-active-ability-program-v0-2.ts";
import {
  runtimeV02BeginTargetedDrainActiveAbilityLiveRoute,
  type RuntimeV02TargetedDrainActiveAbilityLiveBegin,
} from "./tcg-match-active-ability-targeted-drain-live-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";

export type RuntimeV02ActiveAbilityLiveRouteResult<
  T extends RuntimeV02CardZoneInstance,
> =
  | {
    kind: "hidden_sample";
    hidden_sample: RuntimeV02ActiveAbilityHiddenSampleResolution;
  }
  | {
    kind: "immediate";
    immediate: RuntimeV02ImmediateActiveAbilityLiveRouteResult<T>;
  }
  | {
    kind: "targeted_drain_choice";
    targeted_drain: RuntimeV02TargetedDrainActiveAbilityLiveBegin<T>;
  }
  | {
    kind: "private_choice";
    choice: RuntimeV02PendingActiveAbilityLiveChoice;
  };

/**
 * Single live entry point for current structured active-Ability families.
 *
 * Order matters:
 * 1. immediate programs keep first refusal and never manufacture a pending player
 *    choice merely to fit an older dispatcher contract;
 * 2. the targeted-drain family gets its dedicated already-paid opposing-Creature
 *    choice boundary before the older generic private-choice facade is consulted;
 * 3. unrelated programs fall through to the already-live private-choice facade;
 * 4. completely unsupported families return null without mutation.
 *
 * A recognized family that is malformed fails inside its own owner rather than
 * falling through to a different family. The router owns no Ability semantics,
 * Payment, Damage, Heal, Defeat or phase transition. It only selects an existing
 * canonical live route.
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
  const hiddenSample = runtimeV02ExecuteActiveAbilityHiddenSample(
    state as Record<string, unknown>,
    controllerSeat,
    source,
  );
  if (hiddenSample) return { kind: "hidden_sample", hidden_sample: hiddenSample };

  const immediate = runtimeV02BeginImmediateActiveAbilityLiveRoute(
    state,
    controllerSeat,
    source,
    defeatDescribe,
  );
  if (immediate) return { kind: "immediate", immediate };

  const targetedDrain = runtimeV02BeginTargetedDrainActiveAbilityLiveRoute(
    state,
    controllerSeat,
    source,
    defeatDescribe,
    choiceId,
  );
  if (targetedDrain) {
    return { kind: "targeted_drain_choice", targeted_drain: targetedDrain };
  }

  const choice = runtimeV02CreateActiveAbilityLiveChoice(
    state as Record<string, unknown>,
    controllerSeat,
    source,
    choiceId,
  );
  return choice ? { kind: "private_choice", choice } : null;
}
