import {
  runtimeV02CreateActiveAbilityRewardChoice,
  runtimeV02PendingActiveAbilityChoiceView,
  runtimeV02RecordActiveAbilityUse,
  runtimeV02ResolveActiveAbilityRewardChoice,
  structuredRuntimeActiveAbilityRewardInspection,
  type RuntimeV02PendingActiveAbilityChoice,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityDeckReadingChoice,
  runtimeV02PendingActiveAbilityDeckReadingChoiceView,
  runtimeV02ResolveActiveAbilityDeckReadingChoice,
  structuredRuntimeActiveAbilityDeckReading,
  type RuntimeV02ActiveAbilityDeckReadingResolution,
  type RuntimeV02PendingActiveAbilityDeckReadingChoice,
} from "./tcg-match-active-ability-deck-reading-v0-2.ts";
import {
  runtimeV02CreateActiveAbilitySupplyChoice,
  runtimeV02PendingActiveAbilitySupplyChoiceView,
  runtimeV02ResolveActiveAbilitySupplyChoice,
  structuredRuntimeActiveAbilitySupply,
  type RuntimeV02ActiveAbilitySupplyChoiceResolution,
  type RuntimeV02PendingActiveAbilitySupplyChoice,
} from "./tcg-match-active-ability-supply-v0-2.ts";
import {
  runtimeV02BuildActiveAbilitySelectedHealChoice,
  runtimeV02PendingActiveAbilitySelectedHealChoiceView,
  runtimeV02ResolveActiveAbilitySelectedHealChoice,
  structuredRuntimeActiveAbilitySelectedHeal,
  type RuntimeV02PendingActiveAbilitySelectedHealChoice,
} from "./tcg-match-active-ability-selected-heal-v0-2.ts";
import {
  runtimeV02BuildActiveAbilitySelectedModifierChoice,
  runtimeV02PendingActiveAbilitySelectedModifierChoiceView,
  runtimeV02ResolveActiveAbilitySelectedModifierChoice,
  structuredRuntimeActiveAbilitySelectedModifier,
  type RuntimeV02ActiveAbilitySelectedModifierResolution,
  type RuntimeV02PendingActiveAbilitySelectedModifierChoice,
} from "./tcg-match-active-ability-selected-modifier-v0-2.ts";

type RuntimeFieldWhere = "vanguard" | "reserve";

type RuntimeV02ActiveAbilitySource = {
  where: RuntimeFieldWhere;
  index: number | null;
  instance: unknown;
};

export type RuntimeV02PendingActiveAbilityLiveChoice =
  | RuntimeV02PendingActiveAbilitySupplyChoice
  | RuntimeV02PendingActiveAbilityDeckReadingChoice
  | RuntimeV02PendingActiveAbilityChoice
  | RuntimeV02PendingActiveAbilitySelectedHealChoice
  | RuntimeV02PendingActiveAbilitySelectedModifierChoice;

export type RuntimeV02ActiveAbilityLiveResolution =
  | RuntimeV02ActiveAbilitySupplyChoiceResolution
  | RuntimeV02ActiveAbilityDeckReadingResolution
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
  }
  | RuntimeV02ActiveAbilitySelectedModifierResolution;

/**
 * Creates one live active-Ability choice by delegating to exact family
 * recognizers and semantic owners. Every family performs pure preflight before
 * the same canonical once-per-turn receipt writer is consumed.
 */
export function runtimeV02CreateActiveAbilityLiveChoice(
  state: Record<string, unknown>,
  controllerSeat: 1 | 2,
  source: RuntimeV02ActiveAbilitySource,
  choiceId: string = crypto.randomUUID(),
): RuntimeV02PendingActiveAbilityLiveChoice | null {
  const instance = source.instance as { card_id?: unknown } | null | undefined;
  const supplyDescriptor = structuredRuntimeActiveAbilitySupply(state, instance);
  if (supplyDescriptor) {
    const pending = runtimeV02CreateActiveAbilitySupplyChoice(
      state,
      controllerSeat,
      supplyDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      supplyDescriptor.ability_id,
    );
    return pending;
  }

  const deckReadingDescriptor = structuredRuntimeActiveAbilityDeckReading(state, instance);
  if (deckReadingDescriptor) {
    const pending = runtimeV02CreateActiveAbilityDeckReadingChoice(
      state,
      controllerSeat,
      deckReadingDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      deckReadingDescriptor.ability_id,
    );
    return pending;
  }

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
  if (selectedHealDescriptor) {
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

  const selectedModifierDescriptor = structuredRuntimeActiveAbilitySelectedModifier(state, instance);
  if (!selectedModifierDescriptor) return null;
  const pending = runtimeV02BuildActiveAbilitySelectedModifierChoice(
    state,
    controllerSeat,
    selectedModifierDescriptor,
    source,
    choiceId,
  );
  runtimeV02RecordActiveAbilityUse(
    state,
    controllerSeat,
    selectedModifierDescriptor.ability_id,
  );
  return pending;
}

/** Viewer boundary for every currently live active-Ability private choice. */
export function runtimeV02PendingActiveAbilityLiveChoiceView(
  choice: RuntimeV02PendingActiveAbilityLiveChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  if (!choice) return null;
  if (choice.kind === "select_reserve_target_and_optional_discard_essence") {
    return runtimeV02PendingActiveAbilitySupplyChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "inspect_opponent_deck_top_then_optional_bottom") {
    return runtimeV02PendingActiveAbilityDeckReadingChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "inspect_one_reward") {
    return runtimeV02PendingActiveAbilityChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "heal_one_damaged_friendly_creature") {
    return runtimeV02PendingActiveAbilitySelectedHealChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "modify_one_friendly_creature") {
    return runtimeV02PendingActiveAbilitySelectedModifierChoiceView(choice, viewerSeat);
  }
  throw new Error("tcg_v0_2_active_ability_live_choice_kind_unsupported");
}

/**
 * Resolves one live active-Ability choice while preserving the semantic owner
 * for each family. The facade never owns Attack, Damage/Protection, heal
 * listener or match-phase semantics.
 */
export function runtimeV02ResolveActiveAbilityLiveChoice(
  choice: RuntimeV02PendingActiveAbilityLiveChoice,
  controllerSeat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  state: Record<string, unknown>,
): RuntimeV02ActiveAbilityLiveResolution {
  if (choice.kind === "select_reserve_target_and_optional_discard_essence") {
    return runtimeV02ResolveActiveAbilitySupplyChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  if (choice.kind === "inspect_opponent_deck_top_then_optional_bottom") {
    return runtimeV02ResolveActiveAbilityDeckReadingChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
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
  if (choice.kind === "modify_one_friendly_creature") {
    return runtimeV02ResolveActiveAbilitySelectedModifierChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  throw new Error("tcg_v0_2_active_ability_live_choice_kind_unsupported");
}
