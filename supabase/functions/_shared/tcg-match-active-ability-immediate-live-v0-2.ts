import {
  runtimeV02ExecuteActiveAbilityDrainProgram,
  type RuntimeV02ActiveAbilityDrainResolution,
  type RuntimeV02ActiveAbilityProgramSource,
  type RuntimeV02ActiveAbilityProgramState,
} from "./tcg-match-active-ability-program-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import {
  runtimeV02BeginAbilityHealListenerContinuation,
  runtimeV02BeginResolutionMovementHealListenerContinuation,
  type RuntimeV02HealListenerFlow,
} from "./tcg-match-heal-listener-live-v0-2.ts";

export type RuntimeV02ImmediateActiveAbilityResumeKind =
  | "return_to_play"
  | "resume_resolution_queue";

export type RuntimeV02ImmediateActiveAbilityLiveRouteResult<
  T extends RuntimeV02CardZoneInstance,
> = {
  kind: "immediate_active_ability";
  resolution: RuntimeV02ActiveAbilityDrainResolution<T>;
  heal_listener: RuntimeV02HealListenerFlow;
  resume_kind: RuntimeV02ImmediateActiveAbilityResumeKind;
  resolution_queue_required: boolean;
};

/**
 * Begins the generic live route for an active Ability that resolves immediately
 * rather than asking the player to make a private follow-up choice.
 *
 * Ownership remains deliberately narrow:
 * - Active Ability owns activation/program orchestration;
 * - Damage/Heal/Defeat owners mutate their own domains;
 * - the existing Heal live facade owns any private after-heal listener choice;
 * - tcg-match-actions remains the phase/HTTP/resolution-queue coordinator.
 *
 * The current Heal facade exposes the resolution-queue resume contract through
 * its historical movement-named wrapper. That wrapper only records the generic
 * `resume_resolution_queue` receipt; it does not own movement or phase changes.
 */
export function runtimeV02BeginImmediateActiveAbilityLiveRoute<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityProgramState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityProgramSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02ImmediateActiveAbilityLiveRouteResult<T> | null {
  const resolution = runtimeV02ExecuteActiveAbilityDrainProgram(
    state,
    controllerSeat,
    source,
    defeatDescribe,
  );
  if (!resolution) return null;

  const resolutionQueueRequired =
    resolution.damage_result.defeat.defeated_count > 0;
  const resumeKind: RuntimeV02ImmediateActiveAbilityResumeKind =
    resolutionQueueRequired ? "resume_resolution_queue" : "return_to_play";
  const healListener = resolutionQueueRequired
    ? runtimeV02BeginResolutionMovementHealListenerContinuation(
      state as Record<string, unknown>,
      resolution.emitted_packet_ids,
      controllerSeat,
    )
    : runtimeV02BeginAbilityHealListenerContinuation(
      state as Record<string, unknown>,
      resolution.emitted_packet_ids,
      controllerSeat,
    );

  return {
    kind: "immediate_active_ability",
    resolution,
    heal_listener: healListener,
    resume_kind: resumeKind,
    resolution_queue_required: resolutionQueueRequired,
  };
}
