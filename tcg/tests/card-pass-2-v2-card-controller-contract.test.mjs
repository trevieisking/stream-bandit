import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'tcg-v2-card-action-controller-v1.json'), 'utf8'));
const creatures = contract.creatures;

test('V2 card-controller contract binds exactly 22 Fairy and Underworld creatures', () => {
  assert.equal(contract.schema, 'stream-bandit-tcg-v2-card-action-controller-v1');
  assert.equal(creatures.length, 22);
  assert.equal(new Set(creatures.map((card) => card.id)).size, 22);
  assert.equal(creatures.filter((card) => card.element === 'Fairy').length, 11);
  assert.equal(creatures.filter((card) => card.element === 'Underworld').length, 11);
});

test('every creature exposes exactly two printed action slots', () => {
  for (const card of creatures) {
    assert.equal(card.hp_label, 'HP', `${card.id}: HP label`);
    assert.equal(card.withdraw_label, 'Withdraw Cost', `${card.id}: Withdraw label`);
    assert.ok(Number.isFinite(card.hp) && card.hp > 0, `${card.id}: HP value`);
    assert.ok(Number.isInteger(card.withdraw_cost) && card.withdraw_cost >= 0, `${card.id}: Withdraw value`);

    if (card.action_shape === 'Ability + Attack 1') {
      assert.ok(card.ability, `${card.id}: ability required`);
      assert.equal(card.attacks.length, 1, `${card.id}: exactly one attack with Ability`);
      assert.equal(card.attacks[0].slot, 1, `${card.id}: Attack 1 slot`);
      assert.equal(card.attacks[0].label, 'Attack 1', `${card.id}: Attack 1 label`);
    } else if (card.action_shape === 'Attack 1 + Attack 2') {
      assert.equal(card.ability, null, `${card.id}: no Ability in two-attack shape`);
      assert.equal(card.attacks.length, 2, `${card.id}: exactly two attacks`);
      assert.deepEqual(card.attacks.map((attack) => attack.slot), [1, 2], `${card.id}: sequential attack slots`);
      assert.deepEqual(card.attacks.map((attack) => attack.label), ['Attack 1', 'Attack 2'], `${card.id}: printed attack labels`);
    } else {
      assert.fail(`${card.id}: unsupported action shape ${card.action_shape}`);
    }
  }
});

test('attack, active Ability and triggered Ability bindings stay server-owned', () => {
  let activeAbilities = 0;
  let triggeredAbilities = 0;
  let twoAttackCards = 0;

  for (const card of creatures) {
    for (const attack of card.attacks) {
      assert.equal(attack.client_action, 'attack', `${card.id}:${attack.slot}: server attack route`);
      assert.equal(attack.cost_label, 'Attack Cost', `${card.id}:${attack.slot}: cost label`);
      assert.equal(attack.damage_label, 'Damage', `${card.id}:${attack.slot}: damage label`);
      assert.ok(Array.isArray(attack.cost) && attack.cost.length > 0, `${card.id}:${attack.slot}: cost`);
      assert.ok(Number.isFinite(attack.damage) && attack.damage >= 0, `${card.id}:${attack.slot}: damage`);
    }

    if (!card.ability) {
      twoAttackCards += 1;
      continue;
    }
    if (card.ability.activation === 'active') {
      activeAbilities += 1;
      assert.equal(card.ability.client_action, 'use_ability', `${card.id}: active Ability route`);
    } else if (card.ability.activation === 'triggered') {
      triggeredAbilities += 1;
      assert.equal(card.ability.client_action, null, `${card.id}: triggered Ability must not manufacture a button`);
    } else {
      assert.fail(`${card.id}: unsupported Ability activation ${card.ability.activation}`);
    }
  }

  assert.equal(activeAbilities, 8);
  assert.equal(triggeredAbilities, 9);
  assert.equal(twoAttackCards, 5);
});

test('card actions map to existing match-action commands without a browser rules engine', () => {
  assert.equal(contract.rules.primary_control_surface, 'creature_card_face');
  assert.equal(contract.rules.generic_global_attack_button_is_primary_ui, false);
  assert.equal(contract.rules.server_authoritative_legality, true);
  assert.equal(contract.server_bindings.attack.action, 'attack');
  assert.deepEqual(contract.server_bindings.attack.body_fields, ['attack_slot']);
  assert.equal(contract.server_bindings.active_ability.action, 'use_ability');
  assert.deepEqual(contract.server_bindings.active_ability.body_fields, ['where', 'index']);
  assert.equal(contract.server_bindings.withdraw.action, 'withdraw');
  assert.deepEqual(contract.server_bindings.withdraw.body_fields, ['reserve_index', 'discard_essence_uids']);
});
