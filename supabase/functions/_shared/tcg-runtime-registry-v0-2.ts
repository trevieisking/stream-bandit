export const TCG_RUNTIME_REGISTRY_V0_2 = Object.freeze({
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  sha256: "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
});

export type RuntimeRegistryMetadata = {
  registry_id?: unknown;
  set_code?: unknown;
  card_schema?: unknown;
  effect_schema?: unknown;
  card_count?: unknown;
  registry_sha256?: unknown;
  is_runtime_authority?: unknown;
  [key: string]: unknown;
};

export type RuntimeRegistryRow = {
  registry_id?: unknown;
  card_id?: unknown;
  set_code?: unknown;
  card_schema?: unknown;
  effect_schema?: unknown;
  definition?: unknown;
  [key: string]: unknown;
};

export type RuntimeCardIndex = Record<string, Record<string, unknown>>;
export type RuntimeV02DefinitionIndex = Record<string, Record<string, unknown>>;

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function errorCode(error: unknown): string {
  const record = objectRecord(error);
  return record?.code == null ? "" : String(record.code);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  const record = objectRecord(error);
  return record?.message == null ? String(error || "") : String(record.message);
}

export function runtimeV02RegistryUnavailable(error: unknown): boolean {
  const code = errorCode(error);
  if (code === "42P01" || code === "PGRST205") return true;
  const message = errorMessage(error).toLowerCase();
  const namesRegistryTable = message.includes("tcg_registry_versions") || message.includes("tcg_card_definition_versions");
  const unavailableLanguage = message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find the table");
  return namesRegistryTable && unavailableLanguage;
}

export function assertRuntimeV02RegistryMetadata(raw: unknown): RuntimeRegistryMetadata {
  const metadata = objectRecord(raw) as RuntimeRegistryMetadata | null;
  if (!metadata) throw new Error("tcg_v0_2_registry_metadata_required");

  const expected = TCG_RUNTIME_REGISTRY_V0_2;
  const checks: Array<[string, unknown, unknown]> = [
    ["registry_id", metadata.registry_id, expected.registry_id],
    ["set_code", metadata.set_code, expected.set_code],
    ["card_schema", metadata.card_schema, expected.card_schema],
    ["effect_schema", metadata.effect_schema, expected.effect_schema],
    ["card_count", Number(metadata.card_count), expected.card_count],
    ["registry_sha256", metadata.registry_sha256, expected.sha256],
    ["is_runtime_authority", Boolean(metadata.is_runtime_authority), false],
  ];
  for (const [field, actual, wanted] of checks) {
    if (actual !== wanted) throw new Error(`tcg_v0_2_registry_metadata_mismatch:${field}`);
  }
  return metadata;
}

export function buildRuntimeV02DefinitionIndex(
  rows: unknown,
  requiredCardIds: string[],
): RuntimeV02DefinitionIndex {
  if (!Array.isArray(rows)) throw new Error("tcg_v0_2_registry_rows_required");
  const expected = TCG_RUNTIME_REGISTRY_V0_2;
  const required = [...new Set((requiredCardIds || []).map((value) => String(value)).filter(Boolean))].sort();
  const index: RuntimeV02DefinitionIndex = {};

  for (const raw of rows) {
    const row = objectRecord(raw) as RuntimeRegistryRow | null;
    if (!row) throw new Error("tcg_v0_2_registry_row_invalid");
    const cardId = String(row.card_id || "");
    if (!cardId) throw new Error("tcg_v0_2_registry_row_card_id_required");
    if (index[cardId]) throw new Error(`tcg_v0_2_registry_duplicate_card:${cardId}`);
    if (String(row.registry_id || "") !== expected.registry_id) throw new Error(`tcg_v0_2_registry_row_registry_mismatch:${cardId}`);
    if (String(row.set_code || "") !== expected.set_code) throw new Error(`tcg_v0_2_registry_row_set_mismatch:${cardId}`);
    if (String(row.card_schema || "") !== expected.card_schema) throw new Error(`tcg_v0_2_registry_row_card_schema_mismatch:${cardId}`);
    if (String(row.effect_schema || "") !== expected.effect_schema) throw new Error(`tcg_v0_2_registry_row_effect_schema_mismatch:${cardId}`);

    const definition = objectRecord(row.definition);
    if (!definition) throw new Error(`tcg_v0_2_registry_definition_required:${cardId}`);
    if (String(definition.id || "") !== cardId) throw new Error(`tcg_v0_2_registry_definition_id_mismatch:${cardId}`);
    if (String(definition.schema || "") !== expected.card_schema) throw new Error(`tcg_v0_2_registry_definition_schema_mismatch:${cardId}`);
    if (String(definition.effect_schema || "") !== expected.effect_schema) throw new Error(`tcg_v0_2_registry_definition_effect_schema_mismatch:${cardId}`);
    index[cardId] = definition;
  }

  const missing = required.filter((cardId) => !index[cardId]);
  if (missing.length) throw new Error(`tcg_v0_2_registry_missing_match_cards:${missing.join(",")}`);
  return index;
}

export function attachRuntimeV02Definitions(
  cardIndex: RuntimeCardIndex,
  definitions: RuntimeV02DefinitionIndex,
): RuntimeCardIndex {
  for (const [cardId, definition] of Object.entries(definitions)) {
    const entry = cardIndex[cardId];
    if (!entry) throw new Error(`tcg_v0_2_snapshot_card_index_missing:${cardId}`);
    entry.definition_v0_2 = definition;
    entry.definition_v0_2_rules_version = TCG_RUNTIME_REGISTRY_V0_2.card_schema;
  }
  return cardIndex;
}

export function runtimeV02SnapshotMarker(): Record<string, unknown> {
  const expected = TCG_RUNTIME_REGISTRY_V0_2;
  return {
    registry_id: expected.registry_id,
    set_code: expected.set_code,
    card_schema: expected.card_schema,
    effect_schema: expected.effect_schema,
    card_count: expected.card_count,
    registry_sha256: expected.sha256,
    runtime_authority: false,
    source: "match_initialization_snapshot",
  };
}

export function assertRuntimeV02MatchSnapshot(state: Record<string, unknown>): boolean {
  const marker = objectRecord(state.runtime_registry_v0_2);
  if (!marker) return false;
  const expected = TCG_RUNTIME_REGISTRY_V0_2;
  const markerChecks: Array<[string, unknown, unknown]> = [
    ["registry_id", marker.registry_id, expected.registry_id],
    ["set_code", marker.set_code, expected.set_code],
    ["card_schema", marker.card_schema, expected.card_schema],
    ["effect_schema", marker.effect_schema, expected.effect_schema],
    ["card_count", Number(marker.card_count), expected.card_count],
    ["registry_sha256", marker.registry_sha256, expected.sha256],
    ["runtime_authority", Boolean(marker.runtime_authority), false],
  ];
  for (const [field, actual, wanted] of markerChecks) {
    if (actual !== wanted) throw new Error(`tcg_v0_2_snapshot_marker_mismatch:${field}`);
  }

  const cardIndex = objectRecord(state.card_index) as RuntimeCardIndex | null;
  if (!cardIndex) throw new Error("tcg_v0_2_snapshot_card_index_required");
  for (const [cardId, rawEntry] of Object.entries(cardIndex)) {
    const entry = objectRecord(rawEntry);
    const definition = objectRecord(entry?.definition_v0_2);
    if (!definition) throw new Error(`tcg_v0_2_snapshot_definition_missing:${cardId}`);
    if (String(definition.id || "") !== cardId) throw new Error(`tcg_v0_2_snapshot_definition_id_mismatch:${cardId}`);
    if (String(definition.schema || "") !== expected.card_schema) throw new Error(`tcg_v0_2_snapshot_definition_schema_mismatch:${cardId}`);
    if (String(definition.effect_schema || "") !== expected.effect_schema) throw new Error(`tcg_v0_2_snapshot_definition_effect_schema_mismatch:${cardId}`);
  }
  return true;
}

export function runtimeV02Definition(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
): Record<string, unknown> | null {
  if (!assertRuntimeV02MatchSnapshot(state)) return null;
  const cardId = typeof instanceOrId === "string" ? instanceOrId : String(instanceOrId?.card_id || "");
  if (!cardId) return null;
  const cardIndex = state.card_index as RuntimeCardIndex;
  return objectRecord(cardIndex[cardId]?.definition_v0_2);
}
