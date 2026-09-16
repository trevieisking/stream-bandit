import type {
  RuntimeV02CreatureState,
} from "../_shared/tcg-match-creature-engine-v0-2.ts";
import type { RuntimeV02CardZoneInstance } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";
import { runtimeV02CreateRegistryDefeatDescribe } from "../_shared/tcg-match-defeat-registry-v0-2.ts";
import { TCG_RUNTIME_REGISTRY_V0_2 } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function card(uid: string, cardId: string): RuntimeV02CardZoneInstance {
  return { uid, card_id: cardId };
}

function creature(instance: RuntimeV02CardZoneInstance): RuntimeV02CreatureState<RuntimeV02CardZoneInstance> {
  return { stack: [instance], essence: [], relic: null, damage: 0 };
}

function definition(
  id: string,
  name: string,
  hp: number,
  rewardValue: number,
): Record<string, unknown> {
  return {
    id,
    name,
    schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
    effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
    card_family: "Creature",
    creature: {
      hp,
      reward_value: rewardValue,
    },
  };
}

function state(definitions: Record<string, Record<string, unknown>>): Record<string, unknown> {
  return {
    runtime_registry_v0_2: {
      registry_id: TCG_RUNTIME_REGISTRY_V0_2.registry_id,
      set_code: TCG_RUNTIME_REGISTRY_V0_2.set_code,
      card_schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
      effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
      card_count: TCG_RUNTIME_REGISTRY_V0_2.card_count,
      registry_sha256: TCG_RUNTIME_REGISTRY_V0_2.sha256,
      runtime_authority: false,
    },
    card_index: Object.fromEntries(
      Object.entries(definitions).map(([cardId, structured]) => [
        cardId,
        {
          definition: {
            id: cardId,
            name: "legacy-copy-must-not-own-defeat",
            hp: 999,
            reward_value: 99,
          },
          definition_v0_2: structured,
        },
      ]),
    ),
  };
}

Deno.test("Defeat registry adapter reads structured Creature HP, reward value and label", () => {
  const cardId = "underworld-woundling";
  const match = state({
    [cardId]: definition(cardId, "Woundling", 70, 1),
  });
  const describe = runtimeV02CreateRegistryDefeatDescribe(match);

  assertEquals(
    describe(creature(card("woundling-1", cardId)), 1, "vanguard", null),
    { max_hp: 70, reward_value: 1, label: "Woundling" },
  );
});

Deno.test("Defeat registry adapter preserves explicit structured multi-reward values", () => {
  const cardId = "future-mythic";
  const match = state({
    [cardId]: definition(cardId, "Future Mythic", 320, 2),
  });
  const describe = runtimeV02CreateRegistryDefeatDescribe(match);

  assertEquals(
    describe(creature(card("mythic-1", cardId)), 2, "reserve", 1),
    { max_hp: 320, reward_value: 2, label: "Future Mythic" },
  );
});

Deno.test("Defeat registry adapter ignores legacy flattened HP and reward fields", () => {
  const cardId = "structured-owner";
  const match = state({
    [cardId]: definition(cardId, "Structured Owner", 140, 1),
  });
  const describe = runtimeV02CreateRegistryDefeatDescribe(match);

  assertEquals(
    describe(creature(card("structured-1", cardId)), 1, "reserve", 0),
    { max_hp: 140, reward_value: 1, label: "Structured Owner" },
  );
});

Deno.test("Defeat registry adapter fails closed on malformed structured Creature values", () => {
  const hpCard = "bad-hp";
  const rewardCard = "bad-reward";
  const missingDefinition = "missing-definition";
  const match = state({
    [hpCard]: definition(hpCard, "Bad HP", 0, 1),
    [rewardCard]: definition(rewardCard, "Bad Reward", 100, 0),
  });
  const describe = runtimeV02CreateRegistryDefeatDescribe(match);

  assertThrows(
    () => describe(creature(card("bad-hp-1", hpCard)), 1, "vanguard", null),
    `tcg_v0_2_defeat_registry_hp_invalid:${hpCard}`,
  );
  assertThrows(
    () => describe(creature(card("bad-reward-1", rewardCard)), 1, "vanguard", null),
    `tcg_v0_2_defeat_registry_reward_value_invalid:${rewardCard}`,
  );
  assertThrows(
    () => describe(creature(card("missing-1", missingDefinition)), 1, "vanguard", null),
    `tcg_v0_2_defeat_registry_definition_required:${missingDefinition}`,
  );
});

Deno.test("Defeat registry adapter rejects empty Creature stacks", () => {
  const match = state({
    "valid-card": definition("valid-card", "Valid Card", 100, 1),
  });
  const describe = runtimeV02CreateRegistryDefeatDescribe(match);
  const empty: RuntimeV02CreatureState<RuntimeV02CardZoneInstance> = {
    stack: [],
    essence: [],
    relic: null,
    damage: 0,
  };

  assertThrows(
    () => describe(empty, 1, "vanguard", null),
    "tcg_v0_2_defeat_registry_stack_required",
  );
});
