import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const grammar = JSON.parse(fs.readFileSync(path.join(root, 'tcg-card-pass-2-effect-grammar-v0.2.json'), 'utf8'));

test('selective condition and damage protection use explicit v0.2 operation contracts', () => {
  assert.deepEqual(grammar.operations.ADD_CONDITION_PROTECTION, {
    required: ['target', 'duration'],
    optional: ['condition_slot', 'conditions', 'source_controller', 'card_effect_only'],
  });
  assert.deepEqual(grammar.operations.ADD_DAMAGE_PROTECTION, {
    required: ['target', 'damage_classes', 'reduce_amount', 'duration'],
    optional: ['source_controller', 'minimum'],
  });
});
