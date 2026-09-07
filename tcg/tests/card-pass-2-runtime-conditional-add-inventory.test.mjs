import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

function eventOccurred(event, extra = {}) {
  return { predicate: 'event_occurred', event, ...extra };
}

const expected = [
  {
    card_id: 'astral-comettail', attack_id: 'reward-arc', amount: 20,
    when: eventOccurred('reward_inspected', { controller: 'self', window: 'current_turn', min_count: 1 }),
  },
  {
    card_id: 'astral-orbitail', attack_id: 'predicted-hit', amount: 20,
    when: { any: [
      eventOccurred('hidden_information_viewed', { controller: 'self', window: 'current_turn', min_count: 1, filters: { zone: 'deck_top' } }),
      eventOccurred('hidden_information_viewed', { controller: 'self', window: 'current_turn', min_count: 1, filters: { zone: 'deck' } }),
    ] },
  },
  { card_id: 'ember-cinderburrow', attack_id: 'burrow-burst', amount: 20, when: { predicate: 'source_has_condition', condition: 'Scorched' } },
  { card_id: 'ember-cindercrest', attack_id: 'cinder-spiral', amount: 30, when: { predicate: 'target_has_condition', condition: 'Scorched' } },
  { card_id: 'gale-gustfox', attack_id: 'tailwind-strike', amount: 20, when: { predicate: 'source_became_vanguard_this_turn' } },
  { card_id: 'gale-zephyrhare', attack_id: 'zephyr-kick', amount: 20, when: { predicate: 'source_became_vanguard_this_turn' } },
  { card_id: 'grove-briarback', attack_id: 'thorn-rush', amount: 20, when: { predicate: 'reserve_count_at_least', controller: 'self', count: 3 } },
  { card_id: 'grove-capscout', attack_id: 'fungal-burst', amount: 20, when: { predicate: 'target_has_condition', condition: 'Venomed' } },
  { card_id: 'shade-duskstalker', attack_id: 'hidden-step', amount: 20, when: { predicate: 'hand_count_at_least', player: 'opponent', count: 5 } },
  { card_id: 'shade-hollowcrown', attack_id: 'crowned-nightmare', amount: 30, when: { predicate: 'target_has_condition', condition: 'Mindbound' } },
  { card_id: 'shade-veiljaw', attack_id: 'thought-rend', amount: 20, when: { predicate: 'target_has_any_condition' } },
  {
    card_id: 'stone-citadelhorn', attack_id: 'bastion-quake', amount: 20,
    when: eventOccurred('damage_prevented', {
      window: 'current_turn', min_count: 1,
      filters: { target: 'source_creature', prevention_kind_any: ['ability', 'relic', 'shield'] },
    }),
  },
  { card_id: 'stone-rampartusk', attack_id: 'wall-break', amount: 20, when: { predicate: 'source_has_relic' } },
  {
    card_id: 'tide-tideroar', attack_id: 'deep-current', amount: 20,
    when: eventOccurred('essence_moved', { controller: 'self', window: 'current_turn', min_count: 1, filters: { element: 'Tide' } }),
  },
  {
    card_id: 'volt-arcprowler', attack_id: 'relay-strike', amount: 20,
    when: eventOccurred('device_resolved', { controller: 'self', window: 'current_turn', min_count: 1 }),
  },
  {
    card_id: 'volt-coilclank', attack_id: 'charged-tool', amount: 20,
    when: eventOccurred('device_resolved', { controller: 'self', window: 'current_turn', min_count: 1 }),
  },
  {
    card_id: 'volt-copperkite', attack_id: 'copper-arc', amount: 20,
    when: eventOccurred('device_resolved', { controller: 'self', window: 'current_turn', min_count: 1 }),
  },
  {
    card_id: 'volt-dynamozer', attack_id: 'gridbreaker', amount: 20,
    when: { any: [
      { predicate: 'event_attack_source_has_attached_essence_kind', kind: 'temporary' },
      { predicate: 'event_attack_source_has_attached_essence_kind', kind: 'borrowed' },
    ] },
  },
].sort((a, b) => `${a.card_id}:${a.attack_id}`.localeCompare(`${b.card_id}:${b.attack_id}`));

test('frozen Set One contains exactly the reviewed 18 conditional_add attack terms', () => {
  const registry = buildSetOneRegistry(root);
  const actual = [];

  for (const row of registry.definitions) {
    const attacks = Array.isArray(row.definition?.creature?.attacks) ? row.definition.creature.attacks : [];
    for (const attack of attacks) {
      const terms = Array.isArray(attack?.damage_formula?.terms) ? attack.damage_formula.terms : [];
      for (const term of terms) {
        if (term?.kind !== 'conditional_add') continue;
        actual.push({
          card_id: row.card_id,
          attack_id: attack.id,
          amount: term.amount,
          when: term.when,
        });
      }
    }
  }

  actual.sort((a, b) => `${a.card_id}:${a.attack_id}`.localeCompare(`${b.card_id}:${b.attack_id}`));
  assert.equal(actual.length, 18, 'conditional_add inventory changed from the reviewed Set One contract');
  assert.deepEqual(actual, expected, 'conditional_add identity/predicate contract changed');
});
