import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildSetOneRegistry,
  serializeSetOneRegistry,
} from './tcg-set-one-registry-builder-v0.2.mjs';

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNullable(value) {
  return value == null ? 'null' : sqlLiteral(value);
}

export function serializeSetOneShadowRegistrySql(root = process.cwd()) {
  const registry = buildSetOneRegistry(root);
  if (registry.card_count !== 193) {
    throw new Error(`Set One shadow registry requires exactly 193 cards, received ${registry.card_count}`);
  }

  const registryBytes = serializeSetOneRegistry(root);
  const digest = createHash('sha256').update(registryBytes).digest('hex');
  const values = registry.definitions.map((row) => {
    const definition = JSON.stringify(row.definition);
    return `  (${sqlLiteral(registry.registry_id)}, ${sqlLiteral(row.card_id)}, ${sqlLiteral(row.set_code)}, ${sqlLiteral(row.name)}, ${sqlNullable(row.element)}, ${sqlLiteral(row.card_family)}, ${sqlLiteral(registry.card_schema)}, ${sqlLiteral(registry.effect_schema)}, ${sqlLiteral(definition)}::jsonb)`;
  }).join(',\n');

  return `-- GENERATED from the frozen Set One v0.2 registry builder. Do not hand-edit card payloads.\n-- Requires 20260906183000_tcg_v0_2_shadow_registry.sql first.\n-- Stages the exact 193-card structured registry in server-only version tables.\n-- Does not read, insert, update or delete public.tcg_card_definitions.\n-- Does not make v0.2 runtime authority.\n\ninsert into public.tcg_registry_versions(\n  registry_id, set_code, card_schema, effect_schema, card_count, registry_sha256, is_runtime_authority\n) values (\n  ${sqlLiteral(registry.registry_id)},\n  ${sqlLiteral(registry.set_code)},\n  ${sqlLiteral(registry.card_schema)},\n  ${sqlLiteral(registry.effect_schema)},\n  ${registry.card_count},\n  ${sqlLiteral(digest)},\n  false\n)\non conflict (registry_id) do update\nset set_code = excluded.set_code,\n    card_schema = excluded.card_schema,\n    effect_schema = excluded.effect_schema,\n    card_count = excluded.card_count,\n    registry_sha256 = excluded.registry_sha256,\n    is_runtime_authority = false,\n    updated_at = now();\n\ninsert into public.tcg_card_definition_versions(\n  registry_id, card_id, set_code, name, element, card_family, card_schema, effect_schema, definition\n) values\n${values}\non conflict (registry_id, card_id) do update\nset set_code = excluded.set_code,\n    name = excluded.name,\n    element = excluded.element,\n    card_family = excluded.card_family,\n    card_schema = excluded.card_schema,\n    effect_schema = excluded.effect_schema,\n    definition = excluded.definition,\n    updated_at = now();\n\ndo $tcg$\ndeclare\n  v_count integer;\n  v_bad integer;\n  v_digest text;\n  v_authority boolean;\nbegin\n  select card_count, registry_sha256, is_runtime_authority\n    into v_count, v_digest, v_authority\n  from public.tcg_registry_versions\n  where registry_id = ${sqlLiteral(registry.registry_id)};\n\n  if v_count <> 193 then\n    raise exception 'tcg_v0_2_shadow_registry_metadata_count_mismatch: expected 193, got %', v_count;\n  end if;\n  if v_digest <> ${sqlLiteral(digest)} then\n    raise exception 'tcg_v0_2_shadow_registry_digest_mismatch';\n  end if;\n  if coalesce(v_authority, false) then\n    raise exception 'tcg_v0_2_shadow_registry_must_not_be_runtime_authority';\n  end if;\n\n  select count(*)::int into v_count\n  from public.tcg_card_definition_versions\n  where registry_id = ${sqlLiteral(registry.registry_id)};\n  if v_count <> 193 then\n    raise exception 'tcg_v0_2_shadow_registry_row_count_mismatch: expected 193, got %', v_count;\n  end if;\n\n  select count(*)::int into v_bad\n  from public.tcg_card_definition_versions\n  where registry_id = ${sqlLiteral(registry.registry_id)}\n    and (\n      set_code <> ${sqlLiteral(registry.set_code)}\n      or card_schema <> ${sqlLiteral(registry.card_schema)}\n      or effect_schema <> ${sqlLiteral(registry.effect_schema)}\n      or definition ->> 'id' <> card_id\n      or definition ->> 'name' <> name\n      or definition ->> 'card_family' <> card_family\n      or definition ->> 'schema' <> card_schema\n      or definition ->> 'effect_schema' <> effect_schema\n    );\n  if v_bad <> 0 then\n    raise exception 'tcg_v0_2_shadow_registry_structured_row_mismatch: % invalid rows', v_bad;\n  end if;\nend\n$tcg$;\n`;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const destination = process.argv[2];
  const output = serializeSetOneShadowRegistrySql(here);
  if (destination) fs.writeFileSync(path.resolve(process.cwd(), destination), output, 'utf8');
  else process.stdout.write(output);
}
