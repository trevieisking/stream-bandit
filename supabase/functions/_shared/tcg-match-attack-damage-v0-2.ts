import {
  applyRuntimeContinuousNumericModifiers,
  type RuntimeCardInstance,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeAttackDamageCreature = {
  essence?: RuntimeCardInstance[];
};

export type RuntimeAttackDamageContext = {
  target_zone: string;
  target_controller: "self" | "opponent";
  source_controller: "self" | "opponent";
  target_has_any_condition: boolean;
};

function attackWhenMatches(
  when: unknown,
  context: RuntimeAttackDamageContext,
): boolean {
  if (when == null) return true;
  if (!when || typeof when !== "object" || Array.isArray(when)) return false;
  const predicate = when as Record<string, unknown>;
  if (String(predicate.predicate || "") !== "target_has_any_condition") return false;
  if (predicate.target != null && String(predicate.target) !== "$current_opponent_vanguard") return false;
  return context.target_has_any_condition;
}

function structuredRuntimeProbe(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
): Record<string, unknown> | null {
  const attachments = [
    ...(Array.isArray(attacker.essence) ? attacker.essence : []),
    ...(Array.isArray(target.essence) ? target.essence : []),
  ];
  const probe = attachments[0];
  if (probe) return runtimeV02Definition(state, probe);

  const cardIndex = state.card_index;
  if (!cardIndex || typeof cardIndex !== "object" || Array.isArray(cardIndex)) return null;
  const first = Object.keys(cardIndex as Record<string, unknown>)[0];
  return first ? runtimeV02Definition(state, first) : null;
}

export function structuredRuntimeOutgoingAttackDamage(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number | null {
  if (!structuredRuntimeProbe(state, attacker, target)) return null;
  const attachments = Array.isArray(attacker.essence) ? attacker.essence : [];
  const definitionLookup = (instance: RuntimeCardInstance) => runtimeV02Definition(state, instance);
  return applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "attack_damage",
    {
      target_zone: context.target_zone,
      target_controller: context.target_controller,
      evaluate_when: (when: unknown) => attackWhenMatches(when, context),
    },
    0,
  );
}

export function structuredRuntimeIncomingAttackDamage(
  state: Record<string, unknown>,
  attacker: RuntimeAttackDamageCreature,
  target: RuntimeAttackDamageCreature,
  baseValue: number,
  context: RuntimeAttackDamageContext,
): number | null {
  if (!structuredRuntimeProbe(state, attacker, target)) return null;
  const attachments = Array.isArray(target.essence) ? target.essence : [];
  const definitionLookup = (instance: RuntimeCardInstance) => runtimeV02Definition(state, instance);
  return applyRuntimeContinuousNumericModifiers(
    baseValue,
    attachments,
    definitionLookup,
    "incoming_attack_damage",
    { source_controller: context.source_controller },
    0,
  );
}
