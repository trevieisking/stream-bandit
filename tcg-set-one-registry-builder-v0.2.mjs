import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SET_ONE_CANDIDATE_FILES = Object.freeze([
  'tcg-card-pass-2-astral.md',
  'tcg-card-pass-2-ember.md',
  'tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md',
  'tcg-card-pass-2-shade.md',
  'tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md',
  'tcg-card-pass-2-volt.md',
  'tcg-card-pass-2-founder-structured.md',
]);

function extractStructuredCards(source, sourceFile) {
  const blocks = [...source.matchAll(/```json\s*([\s\S]*?)```/g)].map((match) => match[1].trim());
  const cards = [];

  for (const block of blocks) {
    if (!block.includes('sb-tcg-card-v0.2')) continue;
    let value;
    try {
      value = JSON.parse(block);
    } catch (error) {
      throw new Error(`${sourceFile}: invalid structured card JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!value || value.schema !== 'sb-tcg-card-v0.2' || typeof value.id !== 'string') continue;
    cards.push(value);
  }

  return cards;
}

function rowFromCard(card) {
  if (card.effect_schema !== 'sb-tcg-effects-v0.2') {
    throw new Error(`${card.id}: effect_schema must be sb-tcg-effects-v0.2`);
  }
  if (!['Creature', 'Tactic', 'Essence'].includes(card.card_family)) {
    throw new Error(`${card.id}: unsupported card_family ${String(card.card_family)}`);
  }
  return {
    card_id: card.id,
    set_code: 'SB1',
    name: card.name,
    element: card.element ?? null,
    card_family: card.card_family,
    definition: card,
    rules_version: 'sb-tcg-card-v0.2',
    is_active: true,
  };
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function buildSetOneRegistry(root = process.cwd()) {
  const cards = [];
  const sourceCounts = {};

  for (const sourceFile of SET_ONE_CANDIDATE_FILES) {
    const filePath = path.join(root, sourceFile);
    const source = fs.readFileSync(filePath, 'utf8');
    const extracted = extractStructuredCards(source, sourceFile);
    sourceCounts[sourceFile] = extracted.length;
    cards.push(...extracted);
  }

  const byId = new Map();
  for (const card of cards) {
    if (byId.has(card.id)) {
      throw new Error(`duplicate Set One card id: ${card.id}`);
    }
    byId.set(card.id, card);
  }

  const orderedCards = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  const definitions = orderedCards.map(rowFromCard);

  return {
    schema: 'sb-tcg-registry-v0.2',
    registry_id: 'SB1-set-one-v0.2',
    set_code: 'SB1',
    card_schema: 'sb-tcg-card-v0.2',
    effect_schema: 'sb-tcg-effects-v0.2',
    source_files: [...SET_ONE_CANDIDATE_FILES],
    source_counts: sourceCounts,
    card_count: definitions.length,
    definitions,
  };
}

export function serializeSetOneRegistry(root = process.cwd()) {
  return `${JSON.stringify(buildSetOneRegistry(root), null, 2)}\n`;
}

export function serializeSetOneRegistryStagingSql(root = process.cwd()) {
  const registry = buildSetOneRegistry(root);
  if (registry.card_count !== 193) {
    throw new Error(`Set One staging SQL requires exactly 193 cards, received ${registry.card_count}`);
  }

  const values = registry.definitions.map((row) => {
    const definition = JSON.stringify(row.definition);
    return `  (${sqlLiteral(row.card_id)}, ${sqlLiteral(definition)}::jsonb, 'sb-tcg-card-v0.2')`;
  }).join(',\n');

  return `-- GENERATED from tcg-set-one-registry-builder-v0.2.mjs. Do not hand-edit card payloads.\n-- Stages the accepted 193-card Set One v0.2 registry beside legacy runtime definitions.\n-- Requires 20260906175800_tcg_v0_2_registry_compatibility_bridge.sql first.\n-- This migration does not insert cards and does not replace public.tcg_card_definitions.definition.\n\ncreate temporary table tcg_set_one_v0_2_stage (\n  card_id text primary key,\n  definition_v0_2 jsonb not null,\n  definition_v0_2_rules_version text not null\n);\n\ninsert into tcg_set_one_v0_2_stage(card_id, definition_v0_2, definition_v0_2_rules_version) values\n${values};\n\ndo $tcg$\ndeclare\n  v_stage_count integer;\n  v_target_count integer;\nbegin\n  if not exists (\n    select 1\n    from information_schema.columns\n    where table_schema = 'public'\n      and table_name = 'tcg_card_definitions'\n      and column_name = 'definition_v0_2'\n  ) then\n    raise exception 'tcg_v0_2_registry_bridge_required';\n  end if;\n\n  select count(*)::int into v_stage_count\n  from tcg_set_one_v0_2_stage;\n  if v_stage_count <> 193 then\n    raise exception 'tcg_v0_2_stage_count_mismatch: expected 193, got %', v_stage_count;\n  end if;\n\n  select count(*)::int into v_target_count\n  from public.tcg_card_definitions cd\n  join tcg_set_one_v0_2_stage s on s.card_id = cd.card_id\n  where cd.set_code = 'SB1' and cd.is_active;\n  if v_target_count <> 193 then\n    raise exception 'tcg_v0_2_target_match_count_mismatch: expected 193, got %', v_target_count;\n  end if;\n\n  if exists (\n    select s.card_id from tcg_set_one_v0_2_stage s\n    except\n    select cd.card_id from public.tcg_card_definitions cd\n    where cd.set_code = 'SB1' and cd.is_active\n  ) or exists (\n    select cd.card_id from public.tcg_card_definitions cd\n    where cd.set_code = 'SB1' and cd.is_active\n    except\n    select s.card_id from tcg_set_one_v0_2_stage s\n  ) then\n    raise exception 'tcg_set_one_v0_2_identity_set_mismatch';\n  end if;\nend\n$tcg$;\n\nupdate public.tcg_card_definitions cd\nset definition_v0_2 = s.definition_v0_2,\n    definition_v0_2_rules_version = s.definition_v0_2_rules_version\nfrom tcg_set_one_v0_2_stage s\nwhere cd.card_id = s.card_id\n  and cd.set_code = 'SB1'\n  and cd.is_active;\n\ndo $tcg$\ndeclare\n  v_staged integer;\nbegin\n  select count(*)::int into v_staged\n  from public.tcg_card_definitions\n  where set_code = 'SB1'\n    and is_active\n    and definition_v0_2_rules_version = 'sb-tcg-card-v0.2'\n    and definition_v0_2 ->> 'schema' = 'sb-tcg-card-v0.2'\n    and definition_v0_2 ->> 'effect_schema' = 'sb-tcg-effects-v0.2'\n    and definition_v0_2 ->> 'id' = card_id;\n\n  if v_staged <> 193 then\n    raise exception 'tcg_v0_2_post_stage_count_mismatch: expected 193, got %', v_staged;\n  end if;\nend\n$tcg$;\n\ndrop table tcg_set_one_v0_2_stage;\n`;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const args = process.argv.slice(2);
  const sqlMode = args[0] === '--sql';
  const destination = sqlMode ? args[1] : args[0];
  const output = sqlMode
    ? serializeSetOneRegistryStagingSql(here)
    : serializeSetOneRegistry(here);
  if (destination) fs.writeFileSync(path.resolve(process.cwd(), destination), output, 'utf8');
  else process.stdout.write(output);
}
