import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const grammar = JSON.parse(fs.readFileSync(path.join(root, 'tcg-card-pass-2-effect-grammar-v0.2.json'), 'utf8'));

function validateCost(cost) {
  assert.ok(cost && typeof cost === 'object' && !Array.isArray(cost), 'cost must be an object');
  const kind = cost.kind;
  if (grammar.costs[kind]) {
    for (const field of grammar.costs[kind].required) assert.ok(Object.hasOwn(cost, field), `${kind} missing ${field}`);
    return;
  }
  const composition = grammar.cost_composition[kind];
  assert.ok(composition, `unknown cost kind ${kind}`);
  for (const field of composition.required) assert.ok(Object.hasOwn(cost, field), `${kind} missing ${field}`);
  if (kind === 'choice') {
    assert.ok(Array.isArray(cost.options) && cost.options.length >= 2, 'choice requires at least two options');
    for (const option of cost.options) {
      assert.ok(Array.isArray(option) && option.length >= 1, 'each choice option is a non-empty cost sequence');
      option.forEach(validateCost);
    }
  } else if (kind === 'optional') {
    assert.ok(Array.isArray(cost.costs) && cost.costs.length >= 1, 'optional requires a non-empty cost sequence');
    assert.equal(typeof cost.as, 'string');
    cost.costs.forEach(validateCost);
  }
}

test('Card Pass v0.2 costs stay separate from effect opcodes and map to canonical owners', () => {
  assert.deepEqual(grammar.costs.damage, { required: ['target', 'amount'], optional: [] });
  assert.deepEqual(grammar.costs.hand_discard, { required: ['player', 'count'], optional: ['filters'] });
  assert.equal(grammar.cost_policy.payment_owner, 'payment');
  assert.equal(grammar.cost_policy.damage_mutation_owner, 'damage');
  assert.equal(grammar.cost_policy.damage_defeat_owner, 'defeat');
  assert.equal(grammar.cost_policy.hand_discard_mutation_owner, 'card_zone');
  assert.equal(grammar.cost_policy.emit_event, 'card_cost_paid');
});

test('Underworld release cost shapes are expressible without PAY opcodes', () => {
  validateCost({ kind: 'damage', target: '$source_creature', amount: 20 });
  validateCost({ kind: 'optional', as: 'toll_paid', costs: [
    { kind: 'hand_discard', player: 'self', count: 1 },
  ] });
  validateCost({ kind: 'choice', options: [
    [{ kind: 'hand_discard', player: 'self', count: 2 }],
    [{ kind: 'damage', target: '$source_creature', amount: 40 }],
  ] });
});
