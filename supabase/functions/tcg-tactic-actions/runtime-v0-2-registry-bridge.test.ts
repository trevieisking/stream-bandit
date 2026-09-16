import {
  TCG_RUNTIME_REGISTRY_V0_2,
  assertRuntimeV02MatchSnapshot,
  assertRuntimeV02RegistryMetadata,
  attachRuntimeV02Definitions,
  buildRuntimeV02DefinitionIndex,
  runtimeV02Definition,
  runtimeV02RegistryUnavailable,
  runtimeV02SnapshotMarker,
} from "../_shared/tcg-runtime-registry-v0-2.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(message.includes(expected), `expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

function metadata(overrides: Record<string, unknown> = {}) {
  return {
    registry_id: TCG_RUNTIME_REGISTRY_V0_2.registry_id,
    set_code: TCG_RUNTIME_REGISTRY_V0_2.set_code,
    card_schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
    effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
    card_count: TCG_RUNTIME_REGISTRY_V0_2.card_count,
    registry_sha256: TCG_RUNTIME_REGISTRY_V0_2.sha256,
    is_runtime_authority: false,
    ...overrides,
  };
}

function row(cardId: string, overrides: Record<string, unknown> = {}) {
  return {
    registry_id: TCG_RUNTIME_REGISTRY_V0_2.registry_id,
    card_id: cardId,
    set_code: TCG_RUNTIME_REGISTRY_V0_2.set_code,
    card_schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
    effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
    definition: {
      id: cardId,
      schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
      effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
      card_family: "Essence",
      essence: { continuous: [] },
    },
    ...overrides,
  };
}

Deno.test("registry metadata is bound to the exact frozen non-authoritative SB1 identity", () => {
  const accepted = assertRuntimeV02RegistryMetadata(metadata());
  assert(accepted.registry_id === TCG_RUNTIME_REGISTRY_V0_2.registry_id, "registry id mismatch");
  assertThrows(
    () => assertRuntimeV02RegistryMetadata(metadata({ registry_sha256: "0".repeat(64) })),
    "tcg_v0_2_registry_metadata_mismatch:registry_sha256",
  );
  assertThrows(
    () => assertRuntimeV02RegistryMetadata(metadata({ is_runtime_authority: true })),
    "tcg_v0_2_registry_metadata_mismatch:is_runtime_authority",
  );
});

Deno.test("definition index requires every match card and validates structured identity", () => {
  const rows = [row("card-a"), row("card-b")];
  const index = buildRuntimeV02DefinitionIndex(rows, ["card-a", "card-b"]);
  assert(index["card-a"].id === "card-a", "card-a missing from index");
  assert(index["card-b"].id === "card-b", "card-b missing from index");

  assertThrows(
    () => buildRuntimeV02DefinitionIndex([row("card-a")], ["card-a", "card-b"]),
    "tcg_v0_2_registry_missing_match_cards:card-b",
  );
  assertThrows(
    () => buildRuntimeV02DefinitionIndex([row("card-a", { definition: { id: "wrong", schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2" } })], ["card-a"]),
    "tcg_v0_2_registry_definition_id_mismatch:card-a",
  );
});

Deno.test("snapshot attachment preserves legacy definitions and adds v0.2 beside them", () => {
  const cardIndex: Record<string, Record<string, unknown>> = {
    "card-a": { card_id: "card-a", definition: { recipe_type: "legacy" } },
    "card-b": { card_id: "card-b", definition: { recipe_type: "legacy" } },
  };
  const definitions = buildRuntimeV02DefinitionIndex([row("card-a"), row("card-b")], ["card-a", "card-b"]);
  attachRuntimeV02Definitions(cardIndex, definitions);

  assert((cardIndex["card-a"].definition as any).recipe_type === "legacy", "legacy definition must remain untouched");
  assert((cardIndex["card-a"].definition_v0_2 as any).id === "card-a", "structured definition should be attached beside legacy");
  assert(cardIndex["card-a"].definition_v0_2_rules_version === "sb-tcg-card-v0.2", "structured rules version missing");
});

Deno.test("match snapshot marker makes structured definitions fail closed when incomplete", () => {
  const cardIndex: Record<string, Record<string, unknown>> = {
    "card-a": { card_id: "card-a", definition: { recipe_type: "legacy" } },
  };
  const legacyOnlyState: Record<string, unknown> = { card_index: cardIndex };
  assert(assertRuntimeV02MatchSnapshot(legacyOnlyState) === false, "legacy state without marker must remain valid");
  assert(runtimeV02Definition(legacyOnlyState, "card-a") === null, "legacy-only state should not claim v0.2 definition");

  const definitions = buildRuntimeV02DefinitionIndex([row("card-a")], ["card-a"]);
  attachRuntimeV02Definitions(cardIndex, definitions);
  const state: Record<string, unknown> = { runtime_registry_v0_2: runtimeV02SnapshotMarker(), card_index: cardIndex };
  assert(assertRuntimeV02MatchSnapshot(state), "complete snapshot should validate");
  assert(runtimeV02Definition(state, "card-a")?.id === "card-a", "snapshot definition lookup failed");

  delete cardIndex["card-a"].definition_v0_2;
  assertThrows(() => assertRuntimeV02MatchSnapshot(state), "tcg_v0_2_snapshot_definition_missing:card-a");
});

Deno.test("only genuine missing-registry relation errors qualify for legacy fallback", () => {
  assert(runtimeV02RegistryUnavailable({ code: "42P01", message: "relation public.tcg_registry_versions does not exist" }), "postgres missing relation should fall back");
  assert(runtimeV02RegistryUnavailable({ code: "PGRST205", message: "Could not find the table public.tcg_registry_versions in the schema cache" }), "PostgREST missing table should fall back");
  assert(!runtimeV02RegistryUnavailable({ code: "42501", message: "permission denied for tcg_registry_versions" }), "permission failures must not be treated as absence");
  assert(!runtimeV02RegistryUnavailable(new Error("network timeout")), "unrelated failures must not silently fall back");
});
