import type { RuntimeV02CardZoneInstance } from "./tcg-match-card-zone-engine-v0-2.ts";
import type {
  RuntimeV02DefeatDescribe,
  RuntimeV02DefeatDescription,
} from "./tcg-match-defeat-engine-v0-2.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredString(value: unknown, error: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(error);
  return text;
}

/**
 * Defeat-domain adapter from the structured v0.2 card registry into the existing
 * canonical Defeat engine description contract.
 *
 * This adapter owns no defeat mutation, reward queueing or card movement. It only
 * reads the structured Creature definition already attached to the match snapshot
 * and supplies max HP, explicit reward value and display label to Defeat. Callers
 * such as Damage/Ability/Event Listener can therefore share one structured source
 * of truth instead of re-implementing HP/reward lookup rules.
 */
export function runtimeV02CreateRegistryDefeatDescribe<
  T extends RuntimeV02CardZoneInstance,
>(state: Record<string, unknown>): RuntimeV02DefeatDescribe<T> {
  if (!state || typeof state !== "object") {
    throw new Error("tcg_v0_2_defeat_registry_state_required");
  }

  return (creature): RuntimeV02DefeatDescription => {
    if (!creature || !Array.isArray(creature.stack) || creature.stack.length < 1) {
      throw new Error("tcg_v0_2_defeat_registry_stack_required");
    }
    const top = creature.stack[creature.stack.length - 1];
    const cardId = requiredString(
      top?.card_id,
      "tcg_v0_2_defeat_registry_card_id_required",
    );
    const definition = runtimeV02Definition(state, top);
    if (!definition) {
      throw new Error(`tcg_v0_2_defeat_registry_definition_required:${cardId}`);
    }
    if (String(definition.card_family || "") !== "Creature") {
      throw new Error(`tcg_v0_2_defeat_registry_creature_required:${cardId}`);
    }
    const creatureDefinition = objectRecord(definition.creature);
    if (!creatureDefinition) {
      throw new Error(`tcg_v0_2_defeat_registry_creature_definition_required:${cardId}`);
    }

    const maxHp = Number(creatureDefinition.hp);
    if (!Number.isFinite(maxHp) || maxHp <= 0) {
      throw new Error(`tcg_v0_2_defeat_registry_hp_invalid:${cardId}`);
    }
    const rewardValue = Number(creatureDefinition.reward_value);
    if (!Number.isInteger(rewardValue) || rewardValue < 1) {
      throw new Error(`tcg_v0_2_defeat_registry_reward_value_invalid:${cardId}`);
    }
    const label = requiredString(
      definition.name,
      `tcg_v0_2_defeat_registry_name_required:${cardId}`,
    );

    return {
      max_hp: maxHp,
      reward_value: rewardValue,
      label,
    };
  };
}
