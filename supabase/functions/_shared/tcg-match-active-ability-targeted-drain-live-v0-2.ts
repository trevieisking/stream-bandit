import {
  runtimeV02BeginActiveAbilityTargetedDrain,
  runtimeV02ResolveActiveAbilityTargetedDrain,
  type RuntimeV02ActiveAbilityTargetedDrainBegin,
  type RuntimeV02ActiveAbilityTargetedDrainResolution,
  type RuntimeV02ActiveAbilityTargetedDrainSource,
  type RuntimeV02ActiveAbilityTargetedDrainState,
} from "./tcg-match-active-ability-targeted-drain-v0-2.ts";
import {
  runtimeV02PendingActiveAbilityOpponentCreatureChoiceView,
  type RuntimeV02PendingActiveAbilityOpponentCreatureChoice,
} from "./tcg-match-active-ability-opponent-creature-choice-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type { RuntimeV02DefeatDescribe } from "./tcg-match-defeat-engine-v0-2.ts";
import {
  runtimeV02BeginAbilityHealListenerContinuation,
  runtimeV02BeginResolutionMovementHealListenerContinuation,
  type RuntimeV02HealListenerFlow,
} from "./tcg-match-heal-listener-live-v0-2.ts";

export type RuntimeV02TargetedDrainActiveAbilityResumeKind =
  | "return_to_play"
  | "resume_resolution_queue";

export type RuntimeV02TargetedDrainActiveAbilityLiveBegin<
  T extends RuntimeV02CardZoneInstance,
> = {
  kind: "targeted_drain_choice";
  activation: RuntimeV02ActiveAbilityTargetedDrainBegin<T>;
  pending_choice: RuntimeV02PendingActiveAbilityOpponentCreatureChoice;
};

export type RuntimeV02TargetedDrainActiveAbilityLiveResolution = {
  kind: "targeted_drain_resolved";
  resolution: RuntimeV02ActiveAbilityTargetedDrainResolution;
  heal_listener: RuntimeV02HealListenerFlow;
  resume_kind: RuntimeV02TargetedDrainActiveAbilityResumeKind;
  resolution_queue_required: boolean;
};

/**
 * Begins the live private-choice boundary for the reusable targeted-drain
 * active-Ability family. Payment and the once-per-turn receipt are completed by
 * the targeted-drain Ability owner before this facade exposes the anchored
 * opposing-Creature choice. The facade owns no Payment, Damage, Heal or Defeat
 * mutation.
 */
export function runtimeV02BeginTargetedDrainActiveAbilityLiveRoute<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityTargetedDrainState<T>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilityTargetedDrainSource,
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02TargetedDrainActiveAbilityLiveBegin<T> | null {
  const activation = runtimeV02BeginActiveAbilityTargetedDrain(
    state,
    controllerSeat,
    source,
    defeatDescribe,
    choiceId,
  );
  if (!activation) return null;
  return {
    kind: "targeted_drain_choice",
    activation,
    pending_choice: activation.pending_choice,
  };
}

/** Viewer boundary for the targeted-drain opposing-Creature choice. */
export function runtimeV02PendingTargetedDrainActiveAbilityChoiceView(
  choice: RuntimeV02PendingActiveAbilityOpponentCreatureChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  return runtimeV02PendingActiveAbilityOpponentCreatureChoiceView(choice, viewerSeat);
}

/**
 * Resolves only the already-paid targeted-drain effect stage, then hands any
 * emitted heal packet to the existing Heal-listener live owner. If the drain
 * defeated a Creature, the resume contract is the existing resolution queue;
 * otherwise the actor returns to ordinary play after the canonical heal-listener
 * queue is clear. tcg-match-actions remains the phase and resolution coordinator.
 */
export function runtimeV02ResolveTargetedDrainActiveAbilityLiveRoute<
  T extends RuntimeV02CardZoneInstance,
>(
  state: RuntimeV02ActiveAbilityTargetedDrainState<T>,
  pending: RuntimeV02PendingActiveAbilityOpponentCreatureChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  selectedIds: string[],
  defeatDescribe: RuntimeV02DefeatDescribe<T>,
): RuntimeV02TargetedDrainActiveAbilityLiveResolution {
  const resolution = runtimeV02ResolveActiveAbilityTargetedDrain(
    state,
    pending,
    controllerSeat,
    choiceId,
    selectedIds,
    defeatDescribe,
  );

  const resolutionQueueRequired =
    resolution.damage_result.defeat.defeated_count > 0;
  const resumeKind: RuntimeV02TargetedDrainActiveAbilityResumeKind =
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
    kind: "targeted_drain_resolved",
    resolution,
    heal_listener: healListener,
    resume_kind: resumeKind,
    resolution_queue_required: resolutionQueueRequired,
  };
}
