import {
  runtimeV02CreateActiveAbilityRewardChoice,
  runtimeV02PendingActiveAbilityChoiceView,
  runtimeV02RecordActiveAbilityUse,
  runtimeV02ResolveActiveAbilityRewardChoice,
  structuredRuntimeActiveAbilityRewardInspection,
  type RuntimeV02PendingActiveAbilityChoice,
} from "./tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateSearchSelectionAttachmentChoice,
  runtimeV02PendingSearchSelectionAttachmentChoiceView,
  runtimeV02ResolveSearchSelectionAttachmentChoice,
  structuredRuntimeSearchSelectionAttachmentActiveAbility,
  type RuntimeV02PendingSearchSelectionAttachmentChoice,
  type RuntimeV02SearchSelectionAttachmentResolution,
} from "./tcg-match-active-ability-search-attachment-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityDeckReadingChoice,
  runtimeV02PendingActiveAbilityDeckReadingChoiceView,
  runtimeV02ResolveActiveAbilityDeckReadingChoice,
  structuredRuntimeActiveAbilityDeckReading,
  type RuntimeV02ActiveAbilityDeckReadingResolution,
  type RuntimeV02PendingActiveAbilityDeckReadingChoice,
} from "./tcg-match-active-ability-deck-reading-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityDeckPlanningChoice,
  runtimeV02PendingActiveAbilityDeckPlanningChoiceView,
  runtimeV02ResolveActiveAbilityDeckPlanningChoice,
  structuredRuntimeActiveAbilityDeckPlanning,
  type RuntimeV02ActiveAbilityDeckPlanningResolution,
  type RuntimeV02PendingActiveAbilityDeckPlanningChoice,
} from "./tcg-match-active-ability-deck-planning-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityEssenceRedistributionChoice,
  runtimeV02PendingActiveAbilityEssenceRedistributionChoiceView,
  runtimeV02ResolveActiveAbilityEssenceRedistributionChoice,
  structuredRuntimeActiveAbilityEssenceRedistribution,
  type RuntimeV02ActiveAbilityEssenceRedistributionResolution,
  type RuntimeV02PendingActiveAbilityEssenceRedistributionChoice,
} from "./tcg-match-active-ability-essence-redistribution-v0-2.ts";
import {
  runtimeV02CreateActiveAbilitySupplyChoice,
  runtimeV02PendingActiveAbilitySupplyChoiceView,
  runtimeV02ResolveActiveAbilitySupplyChoice,
  structuredRuntimeActiveAbilitySupply,
  type RuntimeV02ActiveAbilitySupplyChoiceResolution,
  type RuntimeV02PendingActiveAbilitySupplyChoice,
} from "./tcg-match-active-ability-supply-v0-2.ts";
import {
  runtimeV02CreateActiveAbilitySupplyAttachmentChoice,
  runtimeV02PendingActiveAbilitySupplyAttachmentChoiceView,
  runtimeV02ResolveActiveAbilitySupplyAttachmentChoice,
  structuredRuntimeActiveAbilitySupplyAttachment,
  type RuntimeV02ActiveAbilitySupplyAttachmentResolution,
  type RuntimeV02PendingActiveAbilitySupplyAttachmentChoice,
} from "./tcg-match-active-ability-supply-attachment-v0-2.ts";
import {
  runtimeV02PendingPaidSelfAttachmentChoiceView,
  type RuntimeV02PendingPaidSelfAttachmentChoice,
} from "./tcg-match-active-ability-paid-attachment-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityHandAttachmentDamageChoice,
  runtimeV02PendingActiveAbilityHandAttachmentDamageChoiceView,
  runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice,
  structuredRuntimeActiveAbilityHandAttachmentDamage,
  type RuntimeV02ActiveAbilityHandAttachmentDamageChoiceResolution,
  type RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice,
} from "./tcg-match-active-ability-hand-attachment-damage-v0-2.ts";
import {
  runtimeV02BuildActiveAbilitySelectedHealChoice,
  runtimeV02BuildActiveAbilitySelectedHealEachChoice,
  runtimeV02PendingActiveAbilitySelectedHealChoiceView,
  runtimeV02PendingActiveAbilitySelectedHealEachChoiceView,
  runtimeV02ResolveActiveAbilitySelectedHealChoice,
  runtimeV02ResolveActiveAbilitySelectedHealEachChoice,
  structuredRuntimeActiveAbilitySelectedHeal,
  structuredRuntimeActiveAbilitySelectedHealEach,
  type RuntimeV02ActiveAbilitySelectedHealEachResolution,
  type RuntimeV02PendingActiveAbilitySelectedHealChoice,
  type RuntimeV02PendingActiveAbilitySelectedHealEachChoice,
} from "./tcg-match-active-ability-selected-heal-v0-2.ts";
import {
  runtimeV02BuildActiveAbilitySelectedModifierChoice,
  runtimeV02PendingActiveAbilitySelectedModifierChoiceView,
  runtimeV02ResolveActiveAbilitySelectedModifierChoice,
  structuredRuntimeActiveAbilitySelectedModifier,
  type RuntimeV02ActiveAbilitySelectedModifierResolution,
  type RuntimeV02PendingActiveAbilitySelectedModifierChoice,
} from "./tcg-match-active-ability-selected-modifier-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityShieldTransferChoice,
  runtimeV02PendingActiveAbilityShieldTransferChoiceView,
  runtimeV02ResolveActiveAbilityShieldTransferChoice,
  structuredRuntimeActiveAbilityShieldTransfer,
  type RuntimeV02ActiveAbilityShieldTransferResolution,
  type RuntimeV02PendingActiveAbilityShieldTransferChoice,
} from "./tcg-match-active-ability-shield-transfer-v0-2.ts";

type RuntimeFieldWhere = "vanguard" | "reserve";

type RuntimeV02ActiveAbilitySource = {
  where: RuntimeFieldWhere;
  index: number | null;
  instance: unknown;
};

export type RuntimeV02PendingActiveAbilityLiveChoice =
  | RuntimeV02PendingActiveAbilityEssenceRedistributionChoice
  | RuntimeV02PendingActiveAbilitySupplyChoice
  | RuntimeV02PendingActiveAbilitySupplyAttachmentChoice
  | RuntimeV02PendingPaidSelfAttachmentChoice
  | RuntimeV02PendingActiveAbilityHandAttachmentDamageChoice
  | RuntimeV02PendingSearchSelectionAttachmentChoice
  | RuntimeV02PendingActiveAbilityDeckReadingChoice
  | RuntimeV02PendingActiveAbilityDeckPlanningChoice
  | RuntimeV02PendingActiveAbilityChoice
  | RuntimeV02PendingActiveAbilitySelectedHealChoice
  | RuntimeV02PendingActiveAbilitySelectedHealEachChoice
  | RuntimeV02PendingActiveAbilitySelectedModifierChoice
  | RuntimeV02PendingActiveAbilityShieldTransferChoice;

export type RuntimeV02ActiveAbilityLiveResolution =
  | RuntimeV02ActiveAbilityEssenceRedistributionResolution
  | RuntimeV02ActiveAbilitySupplyChoiceResolution
  | RuntimeV02ActiveAbilitySupplyAttachmentResolution
  | RuntimeV02ActiveAbilityHandAttachmentDamageChoiceResolution
  | RuntimeV02SearchSelectionAttachmentResolution
  | RuntimeV02ActiveAbilityDeckReadingResolution
  | RuntimeV02ActiveAbilityDeckPlanningResolution
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
  | RuntimeV02ActiveAbilitySelectedHealEachResolution
  | RuntimeV02ActiveAbilitySelectedModifierResolution
  | RuntimeV02ActiveAbilityShieldTransferResolution;

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
  const redistributionDescriptor = structuredRuntimeActiveAbilityEssenceRedistribution(state, instance);
  if (redistributionDescriptor) {
    const pending = runtimeV02CreateActiveAbilityEssenceRedistributionChoice(
      state,
      controllerSeat,
      redistributionDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      redistributionDescriptor.ability_id,
    );
    return pending;
  }

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

  const supplyAttachmentDescriptor = structuredRuntimeActiveAbilitySupplyAttachment(
    state,
    instance,
  );
  if (supplyAttachmentDescriptor) {
    const pending = runtimeV02CreateActiveAbilitySupplyAttachmentChoice(
      state,
      controllerSeat,
      supplyAttachmentDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      supplyAttachmentDescriptor.ability_id,
    );
    return pending;
  }

  const handAttachmentDamageDescriptor =
    structuredRuntimeActiveAbilityHandAttachmentDamage(state, instance);
  if (handAttachmentDamageDescriptor) {
    const pending = runtimeV02CreateActiveAbilityHandAttachmentDamageChoice(
      state,
      controllerSeat,
      handAttachmentDamageDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      handAttachmentDamageDescriptor.ability_id,
    );
    return pending;
  }

  const searchAttachmentDescriptor =
    structuredRuntimeSearchSelectionAttachmentActiveAbility(state, instance);
  if (searchAttachmentDescriptor) {
    const pending = runtimeV02CreateSearchSelectionAttachmentChoice(
      state,
      controllerSeat,
      searchAttachmentDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      searchAttachmentDescriptor.ability_id,
    );
    return pending;
  }

  const deckPlanningDescriptor = structuredRuntimeActiveAbilityDeckPlanning(
    state,
    instance,
  );
  if (deckPlanningDescriptor) {
    const pending = runtimeV02CreateActiveAbilityDeckPlanningChoice(
      state,
      controllerSeat,
      deckPlanningDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      deckPlanningDescriptor.ability_id,
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

  const selectedHealEachDescriptor = structuredRuntimeActiveAbilitySelectedHealEach(
    state,
    instance,
  );
  if (selectedHealEachDescriptor) {
    const pending = runtimeV02BuildActiveAbilitySelectedHealEachChoice(
      state,
      controllerSeat,
      selectedHealEachDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      selectedHealEachDescriptor.ability_id,
    );
    return pending;
  }

  const shieldTransferDescriptor = structuredRuntimeActiveAbilityShieldTransfer(
    state,
    instance,
  );
  if (shieldTransferDescriptor) {
    const pending = runtimeV02CreateActiveAbilityShieldTransferChoice(
      state,
      controllerSeat,
      shieldTransferDescriptor,
      source,
      choiceId,
    );
    runtimeV02RecordActiveAbilityUse(
      state,
      controllerSeat,
      shieldTransferDescriptor.ability_id,
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
  if (choice.kind === "redistribute_attached_essence_then_conditional_heal") {
    return runtimeV02PendingActiveAbilityEssenceRedistributionChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "select_reserve_target_and_optional_discard_essence") {
    return runtimeV02PendingActiveAbilitySupplyChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "select_discard_essence_then_friendly_target") {
    return runtimeV02PendingActiveAbilitySupplyAttachmentChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "paid_self_attachment") {
    return runtimeV02PendingPaidSelfAttachmentChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "select_target_then_hand_essence_direct_damage") {
    return runtimeV02PendingActiveAbilityHandAttachmentDamageChoiceView(
      choice,
      viewerSeat,
    );
  }
  if (choice.kind === "search_attach_essence_from_selection") {
    return runtimeV02PendingSearchSelectionAttachmentChoiceView(
      choice,
      viewerSeat,
    );
  }
  if (choice.kind === "plan_own_deck_top") {
    return runtimeV02PendingActiveAbilityDeckPlanningChoiceView(
      choice,
      viewerSeat,
    );
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
  if (choice.kind === "heal_each_selected_damaged_friendly_creature") {
    return runtimeV02PendingActiveAbilitySelectedHealEachChoiceView(
      choice,
      viewerSeat,
    );
  }
  if (choice.kind === "modify_one_friendly_creature") {
    return runtimeV02PendingActiveAbilitySelectedModifierChoiceView(choice, viewerSeat);
  }
  if (choice.kind === "transfer_shield_between_friendly_creatures") {
    return runtimeV02PendingActiveAbilityShieldTransferChoiceView(
      choice,
      viewerSeat,
    );
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
  if (choice.kind === "redistribute_attached_essence_then_conditional_heal") {
    return runtimeV02ResolveActiveAbilityEssenceRedistributionChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  if (choice.kind === "select_reserve_target_and_optional_discard_essence") {
    return runtimeV02ResolveActiveAbilitySupplyChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  if (choice.kind === "select_discard_essence_then_friendly_target") {
    return runtimeV02ResolveActiveAbilitySupplyAttachmentChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  if (choice.kind === "select_target_then_hand_essence_direct_damage") {
    return runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  if (choice.kind === "search_attach_essence_from_selection") {
    return runtimeV02ResolveSearchSelectionAttachmentChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  if (choice.kind === "plan_own_deck_top") {
    return runtimeV02ResolveActiveAbilityDeckPlanningChoice(
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
  if (choice.kind === "heal_each_selected_damaged_friendly_creature") {
    return runtimeV02ResolveActiveAbilitySelectedHealEachChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
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
  if (choice.kind === "transfer_shield_between_friendly_creatures") {
    return runtimeV02ResolveActiveAbilityShieldTransferChoice(
      choice,
      controllerSeat,
      choiceId,
      choiceIds,
      state,
    );
  }
  throw new Error("tcg_v0_2_active_ability_live_choice_kind_unsupported");
}
