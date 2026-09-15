import { structuredRuntimeAttackMetadata } from "../_shared/tcg-match-attack-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

function attack(id: string, name: string) {
  return {
    id,
    name,
    cost: [{ element: "Astral", amount: 1 }],
    base_damage: 40,
    damage_formula: null,
  };
}

function creatureEntry(
  cardId: string,
  attacks: Record<string, unknown>[],
  starbound: Record<string, unknown>,
  ability: Record<string, unknown> | null = null,
) {
  return {
    card_id: cardId,
    definition: { id: cardId, attack_1: "1 Astral — Legacy Text — 40" },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      prestige: { starbound },
      creature: { ability, attacks },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function stateWith(entry: Record<string, unknown>) {
  const cardId = String(entry.card_id || "");
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: { [cardId]: entry },
  } as Record<string, unknown>;
}

Deno.test("disabled structured Starbound metadata leaves ordinary attacks ordinary", () => {
  const entry = creatureEntry(
    "astral-ordinary",
    [attack("ordinary-hit", "Ordinary Hit")],
    { enabled: false },
  );
  const resolved = structuredRuntimeAttackMetadata(stateWith(entry), "astral-ordinary", 1);
  assertEquals(resolved?.starbound, false);
});

Deno.test("structured Starbound attack ownership follows action_id rather than printed attack text", () => {
  const entry = creatureEntry(
    "astral-starbound",
    [attack("ordinary-hit", "Ordinary Hit"), attack("stellar-finale", "Stellar Finale")],
    {
      enabled: true,
      action_kind: "attack",
      action_id: "stellar-finale",
      shared_usage_key: "starbound",
      consume: "legal_declaration_or_activation",
    },
  );
  const state = stateWith(entry);
  assertEquals(structuredRuntimeAttackMetadata(state, "astral-starbound", 1)?.starbound, false);
  assertEquals(structuredRuntimeAttackMetadata(state, "astral-starbound", 2)?.starbound, true);
});

Deno.test("Starbound Ability ownership never marks an ordinary attack as Starbound", () => {
  const entry = creatureEntry(
    "astral-starbound-ability",
    [attack("ordinary-hit", "Ordinary Hit")],
    {
      enabled: true,
      action_kind: "ability",
      action_id: "constellation-call",
      shared_usage_key: "starbound",
      consume: "legal_declaration_or_activation",
    },
    { id: "constellation-call", name: "Constellation Call" },
  );
  const resolved = structuredRuntimeAttackMetadata(stateWith(entry), "astral-starbound-ability", 1);
  assertEquals(resolved?.starbound, false);
});

Deno.test("enabled structured Starbound metadata fails closed on a non-shared usage key", () => {
  const entry = creatureEntry(
    "astral-bad-usage",
    [attack("stellar-finale", "Stellar Finale")],
    {
      enabled: true,
      action_kind: "attack",
      action_id: "stellar-finale",
      shared_usage_key: "per-card-marker",
      consume: "legal_declaration_or_activation",
    },
  );
  assertThrows(
    () => structuredRuntimeAttackMetadata(stateWith(entry), "astral-bad-usage", 1),
    "tcg_v0_2_attack_starbound_usage_key_invalid:stellar-finale",
  );
});

Deno.test("enabled structured Starbound attack fails closed when action_id is not a frozen attack", () => {
  const entry = creatureEntry(
    "astral-missing-action",
    [attack("ordinary-hit", "Ordinary Hit")],
    {
      enabled: true,
      action_kind: "attack",
      action_id: "missing-starbound-attack",
      shared_usage_key: "starbound",
      consume: "legal_declaration_or_activation",
    },
  );
  assertThrows(
    () => structuredRuntimeAttackMetadata(stateWith(entry), "astral-missing-action", 1),
    "tcg_v0_2_attack_starbound_action_missing:missing-starbound-attack",
  );
});
