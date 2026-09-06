import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

const candidateFiles = [
  'tcg-card-pass-2-astral.md',
  'tcg-card-pass-2-ember.md',
  'tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md',
  'tcg-card-pass-2-shade.md',
  'tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md',
  'tcg-card-pass-2-volt.md',
  'tcg-card-pass-2-founder-structured.md'
];

const grammar = JSON.parse(fs.readFileSync(path.join(root, 'tcg-card-pass-2-effect-grammar-v0.2.json'), 'utf8'));

function extractCards(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const blocks = [...source.matchAll(/```json\s*([\s\S]*?)```/g)].map((match) => match[1].trim());
  const cards = [];
  for (const block of blocks) {
    if (!block.includes('sb-tcg-card-v0.2')) continue;
    const value = JSON.parse(block);
    if (value && value.schema === 'sb-tcg-card-v0.2' && typeof value.id === 'string') cards.push(value);
  }
  return cards;
}

const cards = candidateFiles.flatMap(extractCards);

function walk(value, visitor, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visitor, [...pathParts, index]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  visitor(value, pathParts);
  for (const [key, child] of Object.entries(value)) walk(child, visitor, [...pathParts, key]);
}

function locateCard(card, parts) {
  return `${card.id}:${parts.join('.') || '<root>'}`;
}

test('every used opcode is declared and satisfies its required parameter contract', () => {
  const declared = grammar.operations;
  const used = new Set();

  for (const card of cards) {
    walk(card, (node, parts) => {
      if (typeof node.op !== 'string') return;
      used.add(node.op);
      const contract = declared[node.op];
      assert.ok(contract, `${locateCard(card, parts)} uses undeclared opcode ${node.op}`);
      for (const field of contract.required ?? []) {
        assert.ok(Object.hasOwn(node, field), `${locateCard(card, parts)} opcode ${node.op} missing required parameter ${field}`);
      }
    });
  }

  assert.ok(used.size > 0, 'expected at least one opcode in the 193-card candidate inventory');
});

test('every used predicate is declared by the v0.2 grammar', () => {
  const declared = new Set(grammar.predicates);
  const used = new Set();

  for (const card of cards) {
    walk(card, (node, parts) => {
      if (typeof node.predicate !== 'string') return;
      used.add(node.predicate);
      assert.ok(declared.has(node.predicate), `${locateCard(card, parts)} uses undeclared predicate ${node.predicate}`);
    });
  }

  assert.ok(used.size > 0, 'expected at least one predicate in the 193-card candidate inventory');
});

test('conditions used by structured effects come from the locked condition registry', () => {
  const allowed = new Set(grammar.condition_names);
  const conditionKeys = new Set(['condition']);

  for (const card of cards) {
    walk(card, (node, parts) => {
      for (const key of conditionKeys) {
        if (typeof node[key] !== 'string') continue;
        const value = node[key];
        if (value.startsWith('$')) continue;
        if (allowed.has(value)) continue;
        const isClearlyConditionContext =
          typeof node.op === 'string' && ['APPLY_CONDITION', 'CLEAR_CONDITION', 'ADD_CONDITION_IMMUNITY'].includes(node.op) ||
          typeof node.predicate === 'string' && node.predicate.includes('condition');
        if (isClearlyConditionContext) assert.fail(`${locateCard(card, parts)} uses undeclared condition ${value}`);
      }
    });
  }
});

test('runtime-bearing candidate structures contain no routine per-card Weakness authority', () => {
  for (const card of cards) {
    walk(card, (node, parts) => {
      assert.equal(Object.hasOwn(node, 'weakness'), false, `${locateCard(card, parts)} contains forbidden weakness field`);
    });
  }
});
