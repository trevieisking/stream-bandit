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

function classifiedExactlyOnce(groups, grammarValues, label) {
  const implemented = groups?.implemented || [];
  const partial = groups?.partial || [];
  const missing = groups?.missing || [];
  const all = [...implemented, ...partial, ...missing];
  const duplicates = all.filter((value, index) => all.indexOf(value) !== index);
  assert.deepEqual(
    sorted(new Set(duplicates)),
    [],
    `duplicate runtime ${label} capability classifications: ${sorted(new Set(duplicates)).join(', ')}`,
  );

  const declared = sorted(grammarValues);
  const classified = sorted(all);
  assert.deepEqual(classified, declared, [
    `runtime ${label} inventory drift`,
    `grammar-only: ${declared.filter((value) => !classified.includes(value)).join(', ') || '<none>'}`,
    `inventory-only: ${classified.filter((value) => !declared.includes(value)).join(', ') || '<none>'}`,
  ].join('\n'));
}

test('every v0.2 grammar operation is classified exactly once by runtime capability status', () => {
  classifiedExactlyOnce(capabilities.operations, Object.keys(grammar.operations || {}), 'operation');
  assert.equal(capabilities.completion.all_grammar_operations_classified, true);
});

test('every v0.2 grammar predicate is classified exactly once by runtime capability status', () => {
  classifiedExactlyOnce(capabilities.predicates, grammar.predicates || [], 'predicate');
  assert.equal(capabilities.completion.all_grammar_predicates_classified, true);
});

test('partial predicate classifications carry explicit legacy-equivalent evidence', () => {
  const partial = sorted(capabilities.predicates?.partial || []);
  const explained = sorted(Object.keys(capabilities.known_legacy_predicate_equivalents || {}));
  assert.deepEqual(explained, partial, [
    'partial predicate evidence drift',
    `partial without explanation: ${partial.filter((value) => !explained.includes(value)).join(', ') || '<none>'}`,
    `explanation without partial classification: ${explained.filter((value) => !partial.includes(value)).join(', ') || '<none>'}`,
  ].join('\n'));
});

test('runtime parity cannot be claimed while partial or missing operations or predicates remain', () => {
  const partialOperations = capabilities.operations?.partial || [];
  const missingOperations = capabilities.operations?.missing || [];
  const partialPredicates = capabilities.predicates?.partial || [];
  const missingPredicates = capabilities.predicates?.missing || [];

  if (partialOperations.length || missingOperations.length) {
    assert.equal(capabilities.completion.all_set_one_operations_implemented, false);
  }
  if (partialPredicates.length || missingPredicates.length) {
    assert.equal(capabilities.completion.all_set_one_predicates_implemented, false);
  }
  if (partialOperations.length || missingOperations.length || partialPredicates.length || missingPredicates.length) {
    assert.equal(capabilities.completion.runtime_interpreter_parity, false);
  }
});

test('attack runtime debt remains explicitly visible until removed', () => {
  const debt = capabilities.attack_runtime_debt || {};
  if (debt.printed_english_parser_present || debt.card_id_gameplay_branches_present) {
    assert.equal(capabilities.completion.zero_card_specific_runtime_branches, false);
    assert.equal(capabilities.completion.zero_printed_english_runtime_parsing, false);
  }
});
