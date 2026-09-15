import {
  applyRuntimeContinuousNumericModifiers,
  runtimeContinuousBlocksSource,
  type RuntimeCardInstance,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeWithdrawalCreature = {
  essence?: RuntimeCardInstance[];
};

function withdrawalWhenMatches(when: unknown, targetElement: string): boolean {
  if (when == null) return true;
  if (!when || typeof when !== "object" || Array.isArray(when)) return false;
  const predicate = when as Record<string, unknown>;
  if (String(predicate.predicate || "") !== "target_element_is") return false;
  if (predicate.target != null && String(predicate.target) !== "$attached_creature") return false;
  return String(predicate.element || "") === targetElement;
}

export function structuredRuntimeWithdrawalBaseCost(
  state: Record<string, unknown>,
  creature: RuntimeWithdrawalCreature,
  baseValue: number,
  targetElement: string,
  crushed: boolean,
): number | null {
  const attachments = Array.isArray(creature.essence) ? creature.essence : [];
  const probe = attachments[0];
  const structuredProbe = probe ? runtimeV02Definition(state, probe) : (() => {
    const cardIndex = state.card_index;
    if (!cardIndex || typeof cardIndex !== "object" || Array.isArray(cardIndex)) return null;
    const first = Object.keys(cardIndex as Record<string, unknown>)[0];
    return first ? runtimeV02Definition(state, first) : null;
  })();
  if (!structuredProbe) return null;

  const definitionLookup = (instance: RuntimeCardInstance) => runtimeV02Definition(state, instance);
  const context = {
    action_kind: "voluntary_withdrawal",
    target_element: targetElement,
    evaluate_when: (when: unknown) => withdrawalWhenMatches(when, targetElement),
  };

  let value = applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "withdrawal",
    context,
    0,
  );

  if (crushed) {
    const blocked = runtimeContinuousBlocksSource(
      attachments,
      definitionLookup,
      "withdrawal_increase_immunity",
      "opponent_condition",
      context,
    );
    if (!blocked) value += 1;
  }

  return Math.max(0, value);
}
