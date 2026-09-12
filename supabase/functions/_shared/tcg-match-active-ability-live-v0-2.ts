import {
  runtimeV02CreateActiveAbilityRewardChoice,
  runtimeV02PendingActiveAbilityChoiceView,
  runtimeV02RecordActiveAbilityUse,
  runtimeV02ResolveActiveAbilityRewardChoice,
  structuredRuntimeActiveAbilityRewardInspection,
  type RuntimeV02PendingActiveAbilityChoice,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02BuildActiveAbilitySelectedHealChoice,
  runtimeV02PendingActiveAbilitySelectedHealChoiceView,
  runtimeV02ResolveActiveAbilitySelectedHealChoice,
  structuredRuntimeActiveAbilitySelectedHeal,
  type RuntimeV02PendingActiveAbilitySelectedHealChoice,
} from "./tcg-match-active-ability-selected-heal-v0-2.ts";

type RuntimeFieldWhere = "vanguard" | "reserve";

type RuntimeV02ActiveAbilitySource = {
  where: RuntimeFieldWhere;
  index: number | null;
  instance: unknown;
};

export type RuntimeV02PendingActiveAbilityLiveChoice =
  | RuntimeV02PendingActiveAbilityChoice
  | RuntimeV02PendingActiveAbilitySelectedHealChoice;

export type RuntimeV02ActiveAbilityLiveResolution =
  | {
    kind: "inspect_one_reward";
    ability_id: string;
    reward_inspected_count: 1;
    emitted_packet_ids: [];
  }
  | {
    kind: "heal_one_damaged_friendly_creature";
    ability_id: string;
    requested_heal: number;
    actual_heal: number;
    emitted_packet_ids: string[];
  };

/**
 * Creates one live active-Ability choice by delegating to the existing exact
 * family recognizers and semantic owners. Reward inspection continues through
 * its established owner. Selected healing performs its pure preflight first,
 * then consumes the same canonical once-per-turn receipt writer used by Reward
 * inspection before the pending choice is returned to tcg-match-actions.
 */
export function runtimeV02CreateActiveAbilityLiveChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilitySource,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityLiveChoice | null {
  const instance = source.instance as { card_id?: unknown } | null | undefined;
  const rewardDescriptor = structuredRuntimeActiveAbilityRewardInspection(state, instance);
  if (rewardDescriptor) {
    return runtimeV02CreateActiveAbilityRewardChoice(
      state,
      controllerSeat,
      rewardDescriptor,
      source,
      choiceId,
    );
  }

  const selectedHealDescriptor = structuredRuntimeActiveAbilitySelectedHeal(state, instance);
  if (!selectedHealDescriptor) return null;

  const pending = runtimeV02BuildActiveAbilitySelectedHealChoice(
    state,
    controllerSeat,
    selectedHealDescriptor,
    source,
    choiceId,
  );
  runtimeV02RecordActiveAbilityUse(
    state,
    controllerSeat,
    selectedHealDescriptor.ability_id,
  );
  return pending;
}

/** Viewer boundary for every currently live active-Ability private choice. */
export function runtimeV02PendingActiveAbilityLiveChoiceView(
  choice: RuntimeV02PendingActiveAbilityLiveChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  if (!choice) return null;
  if (choice.kind === "inspect_one_reward") {
    return runtimeV02PendingActiveAbilityChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "heal_one_damaged_friendly_creature") {
    return runtimeV02PendingActiveAbilitySelectedHealChoiceView(choice, viewerSeat);
  }
  throw new Error("tcg_v0_2_active_ability_live_choice_kind_unsupported");
}

/**
 * Resolves one live active-Ability choice while preserving the semantic owner
 * for each family. The facade never runs heal listeners or changes match phase;
 * those remain tcg-match-actions orchestration responsibilities.
 */
export function runtimeV02ResolveActiveAbilityLiveChoice(
  choice: RuntimeV02PendingActiveAbilityLiveChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityLiveResolution {
  if (choice.kind === "inspect_one_reward") {
    const resolved = runtimeV02ResolveActiveAbilityRewardChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
    return {
      kind: choice.kind,
      ability_id: resolved.ability_id,
      reward_inspected_count: resolved.reward_inspected_count,
      emitted_packet_ids: [],
    };
  }
  if (choice.kind === "heal_one_damaged_friendly_creature") {
    const resolved = runtimeV02ResolveActiveAbilitySelectedHealChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
    return {
      kind: choice.kind,
      ability_id: resolved.ability_id,
      requested_heal: resolved.requested_heal,
      actual_heal: resolved.actual_heal,
      emitted_packet_ids: resolved.emitted_packet_ids,
    };
  }
  throw new Error("tcg_v0_2_active_ability_live_choice_kind_unsupported");
}
