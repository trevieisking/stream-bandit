import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const grammar = JSON.parse(fs.readFileSync(path.join(root, 'tcg-card-pass-2-effect-grammar-v0.2.json'), 'utf8'));
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'tcg-runtime-capabilities-v0.2.json'), 'utf8'));

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

test('every v0.2 grammar operation is classified exactly once by runtime capability status', () => {
  const groups = capabilities.operations || {};
  const implemented = groups.implemented || [];
  const partial = groups.partial || [];
  const missing = groups.missing || [];
  const all = [...implemented, ...partial, ...missing];
  const duplicates = all.filter((value, index) => all.indexOf(value) !== index);
  assert.deepEqual(sorted(new Set(duplicates)), [], `duplicate runtime capability classifications: ${sorted(new Set(duplicates)).join(', ')}`);

  const grammarOps = sorted(Object.keys(grammar.operations || {}));
  const classified = sorted(all);
  assert.deepEqual(classified, grammarOps, [
    'runtime operation inventory drift',
    `grammar-only: ${grammarOps.filter((op) => !classified.includes(op)).join(', ') || '<none>'}`,
    `inventory-only: ${classified.filter((op) => !grammarOps.includes(op)).join(', ') || '<none>'}`,
  ].join('\n'));
});

test('runtime parity cannot be claimed while partial or missing operations remain', () => {
  const partial = capabilities.operations?.partial || [];
  const missing = capabilities.operations?.missing || [];
  if (partial.length || missing.length) {
    assert.equal(capabilities.completion.runtime_interpreter_parity, false);
    assert.equal(capabilities.completion.all_set_one_operations_implemented, false);
  }
});

test('attack runtime debt remains explicitly visible until removed', () => {
  const debt = capabilities.attack_runtime_debt || {};
  if (debt.printed_english_parser_present || debt.card_id_gameplay_branches_present) {
    assert.equal(capabilities.completion.zero_card_specific_runtime_branches, false);
    assert.equal(capabilities.completion.zero_printed_english_runtime_parsing, false);
  }
});
