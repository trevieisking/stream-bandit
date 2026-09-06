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

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const output = serializeSetOneRegistry(here);
  const destination = process.argv[2];
  if (destination) fs.writeFileSync(path.resolve(process.cwd(), destination), output, 'utf8');
  else process.stdout.write(output);
}
