import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../tcg-card-pass-2-underworld.md', import.meta.url), 'utf8');
const grammar = JSON.parse(readFileSync(new URL('../../tcg-card-pass-2-effect-grammar-v0.2.json', import.meta.url), 'utf8'));
const packages = JSON.parse(readFileSync(new URL('../../tcg-element-packages-v0.2.json', import.meta.url), 'utf8'));

const blocks = [...source.matchAll(/```json\s*([\s\S]*?)```/g)].map((match) => JSON.parse(match[1]));
assert.ok(blocks.length >= 3, 'Underworld candidate must contain Woundling, Scarjackal and Bloodbasilisk structured blocks');

const ids = new Set();
const operations = new Set(Object.keys(grammar.operations || {}));
const predicates = new Set(grammar.predicates || []);

function visit(value, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => visit(entry, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (typeof value.op === 'string') {
    assert.ok(operations.has(value.op), `undeclared Underworld opcode ${value.op} at ${path}`);
  }
  if (typeof value.predicate === 'string') {
    assert.ok(predicates.has(value.predicate), `undeclared Underworld predicate ${value.predicate} at ${path}`);
  }
  for (const [key, entry] of Object.entries(value)) visit(entry, `${path}.${key}`);
}

function damageHistoryRequirement(minActualDamage) {
  return {
    predicate: 'damage_history_count_at_least',
    target: '$source_creature',
    source_controller: 'self',
    window: 'current_turn',
    min_actual_damage: minActualDamage,
    card_effect_only: true,
    count: 1,
  };
}

for (const card of blocks) {
  assert.equal(card.schema, 'sb-tcg-card-v0.2');
  assert.equal(card.effect_schema, 'sb-tcg-effects-v0.2');
  assert.equal(card.element, 'Underworld');
  assert.equal(typeof card.id, 'string');
  assert.ok(card.id.startsWith('underworld-'));
  assert.ok(!ids.has(card.id), `duplicate Underworld card id ${card.id}`);
  ids.add(card.id);
  assert.equal(Object.hasOwn(card, 'weakness'), false, `${card.id} must use global matchup authority`);
  visit(card, card.id);
}

const woundling = blocks.find((card) => card.id === 'underworld-woundling');
assert.ok(woundling, 'Woundling structured candidate missing');
assert.deepEqual(woundling.creature.ability.requirements, { all: [{ predicate: 'source_damaged' }] });
assert.deepEqual(woundling.creature.ability.steps, [{
  op: 'DRAIN_VITALITY',
  target: '$current_opponent_vanguard',
  amount: 10,
  heal_target: '$source_creature',
  heal_cap: 10,
}]);
assert.deepEqual(woundling.creature.attacks[0].cost, [{ element: 'Underworld', amount: 1 }]);
assert.equal(woundling.creature.attacks[0].base_damage, 20);

const scarjackal = blocks.find((card) => card.id === 'underworld-scarjackal');
assert.ok(scarjackal, 'Scarjackal structured candidate missing');
assert.equal(scarjackal.creature.stage, 'Teen');
assert.equal(scarjackal.creature.evolves_from_id, 'underworld-woundling');
assert.equal(scarjackal.creature.hp, 150);
assert.deepEqual(scarjackal.creature.ability.requirements, {
  all: [
    { predicate: 'event_attack_source_is_self' },
    damageHistoryRequirement(10),
  ],
});
assert.deepEqual(scarjackal.creature.ability.steps, [{ op: 'MODIFY_CURRENT_ATTACK_DAMAGE', delta: 20 }]);
assert.deepEqual(scarjackal.creature.attacks[0].cost, [{ element: 'Underworld', amount: 2 }]);
assert.equal(scarjackal.creature.attacks[0].base_damage, 50);
assert.deepEqual(scarjackal.creature.attacks[1].cost, [
  { element: 'Underworld', amount: 2 },
  { element: 'any', amount: 1 },
]);
assert.equal(scarjackal.creature.attacks[1].base_damage, 70);
assert.deepEqual(scarjackal.creature.attacks[1].after_damage, [{
  op: 'IF',
  when: { predicate: 'target_remains_in_play_after_damage' },
  then: [{
    op: 'DRAIN_VITALITY',
    target: '$attack_target',
    amount: 20,
    heal_target: '$source_creature',
    heal_cap: 20,
  }],
}]);

const bloodbasilisk = blocks.find((card) => card.id === 'underworld-bloodbasilisk');
assert.ok(bloodbasilisk, 'Bloodbasilisk structured candidate missing');
assert.equal(bloodbasilisk.creature.stage, 'Adult');
assert.equal(bloodbasilisk.creature.evolves_from_id, 'underworld-scarjackal');
assert.equal(bloodbasilisk.creature.hp, 290);
assert.deepEqual(bloodbasilisk.creature.ability.costs, [
  { kind: 'damage', target: '$source_creature', amount: 20 },
]);
assert.deepEqual(bloodbasilisk.creature.ability.steps, [
  { op: 'SELECT_CREATURE', controller: 'opponent', zone: 'field', count: 1, filters: {}, as: 'drain_target' },
  { op: 'DRAIN_VITALITY', target: '$drain_target', amount: 40, heal_target: '$source_creature', heal_cap: 40 },
]);
assert.equal(bloodbasilisk.creature.attacks[0].base_damage, 100);
assert.deepEqual(bloodbasilisk.creature.attacks[1].damage_formula, {
  base: 140,
  snapshot: 'legal_declaration',
  terms: [{
    kind: 'conditional_add',
    amount: 20,
    when: damageHistoryRequirement(1),
  }],
});

const underworldPackage = packages.packages.find((entry) => entry.element === 'Underworld');
assert.ok(underworldPackage, 'Underworld package record missing');
assert.equal(underworldPackage.state, 'designed_pending_structure', 'partial candidate must not promote Underworld package state');
assert.equal(underworldPackage.structured_candidate_file, null, 'partial candidate must not become registry source');
assert.equal(underworldPackage.starter.name, 'Debtbound');
assert.equal(underworldPackage.starter.state, 'designed_pending_structure');

console.log(`Underworld structured candidate checks passed for ${blocks.length} card block(s).`);
