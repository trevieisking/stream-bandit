import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

const elementFiles = {
  Astral: 'tcg-card-pass-2-astral.md',
  Ember: 'tcg-card-pass-2-ember.md',
  Gale: 'tcg-card-pass-2-gale.md',
  Grove: 'tcg-card-pass-2-grove.md',
  Shade: 'tcg-card-pass-2-shade.md',
  Stone: 'tcg-card-pass-2-stone.md',
  Tide: 'tcg-card-pass-2-tide.md',
  Volt: 'tcg-card-pass-2-volt.md'
};

const founderFile = 'tcg-card-pass-2-founder-structured.md';
const validator = JSON.parse(fs.readFileSync(path.join(root, 'tcg-card-pass-2-validator-v0.2.json'), 'utf8'));
const starters = JSON.parse(fs.readFileSync(path.join(root, 'tcg-set-one-starters-v0.2.json'), 'utf8'));

function extractCards(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const blocks = [...source.matchAll(/```json\s*([\s\S]*?)```/g)].map((match) => match[1].trim());
  const cards = [];
  for (const block of blocks) {
    if (!block.includes('sb-tcg-card-v0.2')) continue;
    let value;
    try {
      value = JSON.parse(block);
    } catch (error) {
      assert.fail(`${relativePath} contains a v0.2 JSON block that does not parse: ${error.message}`);
    }
    if (value && value.schema === 'sb-tcg-card-v0.2' && typeof value.id === 'string') cards.push(value);
  }
  return cards;
}

const cardsByElement = Object.fromEntries(
  Object.entries(elementFiles).map(([element, file]) => [element, extractCards(file)])
);
const founderCards = extractCards(founderFile);
const allCards = [...Object.values(cardsByElement).flat(), ...founderCards];
const byId = new Map(allCards.map((card) => [card.id, card]));

function isMythic(card) {
  return Array.isArray(card.traits) && card.traits.includes('Mythic');
}

function starboundEnabled(card) {
  return card?.prestige?.starbound?.enabled === true;
}

function countFamily(cards, family) {
  return cards.filter((card) => card.card_family === family).length;
}

function assertCreature(card) {
  const c = card.creature;
  assert.ok(c, `${card.id}: Creature must have creature object`);
  assert.ok(['Baby', 'Teen', 'Adult', 'Standalone'].includes(c.stage), `${card.id}: invalid stage ${c.stage}`);
  assert.ok(Number.isInteger(c.hp) && c.hp >= 40 && c.hp <= 390, `${card.id}: HP ${c.hp} outside 40-390`);
  assert.ok(Number.isInteger(c.withdrawal) && c.withdrawal >= 0, `${card.id}: invalid withdrawal`);
  assert.ok(Number.isInteger(c.reward_value) && c.reward_value >= 1, `${card.id}: invalid reward_value`);
  assert.ok(Array.isArray(c.creature_types), `${card.id}: creature_types must be an array`);
  assert.ok(Object.hasOwn(c, 'resistance'), `${card.id}: resistance must be explicit`);
  assert.ok(Object.hasOwn(c, 'matchup_override'), `${card.id}: matchup_override must be explicit`);
  assert.ok(!Object.hasOwn(c, 'weakness'), `${card.id}: routine per-card weakness is forbidden`);
  assert.ok(Array.isArray(c.attacks) && c.attacks.length >= 1, `${card.id}: Creature needs at least one attack`);
  assert.ok(c.ability && typeof c.ability.name === 'string' && c.ability.name.length > 0, `${card.id}: Creature needs one named Ability`);

  if (c.stage === 'Teen' || c.stage === 'Adult') {
    assert.equal(typeof c.evolves_from_id, 'string', `${card.id}: ${c.stage} must evolve from a card id`);
  } else {
    assert.equal(c.evolves_from_id, null, `${card.id}: ${c.stage} must not have evolves_from_id`);
  }

  if (isMythic(card)) {
    assert.equal(card.deck_limit?.scope, 'identity', `${card.id}: Mythic uses identity deck limit`);
    assert.equal(card.deck_limit?.max, 1, `${card.id}: Mythic identity max is 1`);
    assert.equal(c.stage, 'Standalone', `${card.id}: current Set One Mythic must be Standalone, not a Mythic stage`);
    assert.equal(c.reward_value, 2, `${card.id}: current Set One Mythic reward value must be 2`);
  } else {
    assert.equal(c.reward_value, 1, `${card.id}: ordinary Creature reward value must be 1`);
  }
}

function assertNonCreature(card) {
  if (card.card_family === 'Essence') {
    assert.ok(card.essence, `${card.id}: Essence must have essence object`);
    assert.equal(card.creature, null, `${card.id}: Essence creature must be null`);
    assert.equal(card.tactic, null, `${card.id}: Essence tactic must be null`);
    assert.equal(card.deck_limit?.scope, 'global_essence_allowance', `${card.id}: Essence must delegate to global allowance`);
  } else if (card.card_family === 'Tactic') {
    assert.ok(card.tactic, `${card.id}: Tactic must have tactic object`);
    assert.ok(['Ally', 'Device', 'Relic', 'Realm'].includes(card.tactic.subtype), `${card.id}: invalid tactic subtype`);
    assert.equal(card.creature, null, `${card.id}: Tactic creature must be null`);
    assert.equal(card.essence, null, `${card.id}: Tactic essence must be null`);
    assert.equal(card.deck_limit?.scope, 'identity', `${card.id}: Tactic must use identity limit`);
    assert.ok(card.deck_limit.max <= 4, `${card.id}: ordinary identity max may not exceed 4`);
  } else {
    assert.fail(`${card.id}: unknown family ${card.card_family}`);
  }
}

test('consolidated validator carries current matchup authority', () => {
  assert.equal(validator.validator_id, 'sb-tcg-validator-v0.2');
  assert.equal(validator.global_rules.routine_per_card_weakness_forbidden, true);
  assert.equal(validator.global_rules.weakness_multiplier, 2);
  assert.equal(validator.global_rules.weakness_applies_to, 'attack_damage_only');
  assert.equal(validator.global_rules.weakness_max_applications_per_attack, 1);
  assert.equal(validator.global_rules.prismatic_matchup_default, 'neutral');
  assert.deepEqual(validator.global_rules.set_one_elements, Object.keys(elementFiles));
});

test('eight elemental candidates are exactly 24 identities with 11/4/9 shape', () => {
  for (const [element, cards] of Object.entries(cardsByElement)) {
    assert.equal(cards.length, 24, `${element}: expected 24 structured cards, got ${cards.length}`);
    assert.equal(countFamily(cards, 'Creature'), 11, `${element}: expected 11 Creatures`);
    assert.equal(countFamily(cards, 'Essence'), 4, `${element}: expected 4 Essence`);
    assert.equal(countFamily(cards, 'Tactic'), 9, `${element}: expected 9 Tactics`);
    assert.equal(cards.filter((card) => card.pack_only === true).length, 3, `${element}: expected exactly 3 pack-only identities`);
    assert.equal(cards.filter(isMythic).length, 1, `${element}: expected exactly one Mythic identity`);
    assert.equal(cards.filter(starboundEnabled).length, 1, `${element}: expected exactly one Starbound identity`);
    for (const card of cards) assert.equal(card.element, element, `${card.id}: element mismatch`);
  }
});

test('Founder supplies the 193rd structured identity and remains neutral by default', () => {
  assert.equal(founderCards.length, 1, `Founder file must contain exactly one structured card, got ${founderCards.length}`);
  const founder = founderCards[0];
  assert.equal(founder.id, 'prismatic-stream-bandit-prismatic-founder');
  assert.equal(founder.element, 'Prismatic');
  assert.equal(founder.card_family, 'Creature');
  assert.equal(founder.creature.resistance, null);
  assert.equal(founder.creature.matchup_override, null);
  assert.ok(!Object.hasOwn(founder.creature, 'weakness'), 'Founder must not carry routine per-card Weakness');
  assert.equal(isMythic(founder), true);
  assert.equal(starboundEnabled(founder), true);
});

test('Set One has 193 unique structured identities', () => {
  assert.equal(allCards.length, 193, `expected 193 structured identities, got ${allCards.length}`);
  assert.equal(byId.size, 193, 'all Set One card ids must be unique');
});

test('all card envelopes and Creature invariants are structurally valid', () => {
  for (const card of allCards) {
    assert.equal(card.schema, 'sb-tcg-card-v0.2', `${card.id}: wrong card schema`);
    assert.equal(card.effect_schema, 'sb-tcg-effects-v0.2', `${card.id}: wrong effect schema`);
    assert.ok(['Creature', 'Essence', 'Tactic'].includes(card.card_family), `${card.id}: invalid family`);
    assert.equal(typeof card.pack_only, 'boolean', `${card.id}: pack_only must be boolean`);
    assert.ok(card.prestige?.starbound && typeof card.prestige.starbound.enabled === 'boolean', `${card.id}: explicit Starbound yes/no required`);

    if (card.card_family === 'Creature') assertCreature(card);
    else assertNonCreature(card);
  }
});

test('all Teen and Adult evolution references resolve to the correct prior stage and element', () => {
  for (const card of allCards.filter((card) => card.card_family === 'Creature')) {
    const c = card.creature;
    if (c.stage !== 'Teen' && c.stage !== 'Adult') continue;
    const parent = byId.get(c.evolves_from_id);
    assert.ok(parent, `${card.id}: missing evolves_from ${c.evolves_from_id}`);
    assert.equal(parent.card_family, 'Creature', `${card.id}: evolves_from must be Creature`);
    assert.equal(parent.element, card.element, `${card.id}: evolution crosses element unexpectedly`);
    assert.equal(parent.creature.stage, c.stage === 'Teen' ? 'Baby' : 'Teen', `${card.id}: predecessor stage mismatch`);
  }
});

test('normal non-Essence identity limits do not exceed four and Mythic identities equal one', () => {
  for (const card of allCards) {
    if (card.card_family === 'Essence') continue;
    assert.equal(card.deck_limit?.scope, 'identity', `${card.id}: non-Essence must use identity limit`);
    if (isMythic(card)) assert.equal(card.deck_limit.max, 1, `${card.id}: Mythic max must be one`);
    else assert.ok(card.deck_limit.max <= 4, `${card.id}: ordinary identity max exceeds four`);
  }
});

test('eight exact starters resolve against structured candidates and preserve 60/21/22/18/20 shape', () => {
  const expected = starters.expected;
  assert.equal(starters.starters.length, expected.starter_count, 'starter count mismatch');
  assert.deepEqual(starters.starters.map((starter) => starter.element).sort(), Object.keys(elementFiles).sort());

  for (const starter of starters.starters) {
    assert.equal(starter.cards.length, expected.identities_per_starter, `${starter.name}: identity count mismatch`);
    assert.equal(new Set(starter.cards.map(([id]) => id)).size, expected.identities_per_starter, `${starter.name}: duplicate identity rows`);
    assert.equal(starter.cards.reduce((sum, [, qty]) => sum + qty, 0), expected.cards_per_starter, `${starter.name}: total cards mismatch`);

    const familyTotals = { Creature: 0, Essence: 0, Tactic: 0 };
    let mythicCopies = 0;

    for (const [id, qty] of starter.cards) {
      const card = byId.get(id);
      assert.ok(card, `${starter.name}: missing candidate id ${id}`);
      assert.equal(card.element, starter.element, `${starter.name}: ${id} has wrong element`);
      assert.equal(card.pack_only, false, `${starter.name}: pack-only card ${id} is not allowed`);
      assert.ok(Number.isInteger(qty) && qty > 0, `${starter.name}: invalid quantity for ${id}`);
      familyTotals[card.card_family] += qty;
      if (isMythic(card)) mythicCopies += qty;
      if (card.card_family !== 'Essence') assert.ok(qty <= card.deck_limit.max, `${starter.name}: ${id} exceeds identity limit`);
    }

    assert.deepEqual(familyTotals, {
      Creature: expected.creature_cards,
      Essence: expected.essence_cards,
      Tactic: expected.tactic_cards
    }, `${starter.name}: family totals mismatch`);
    assert.equal(mythicCopies, expected.mythic_copies_per_starter, `${starter.name}: Mythic copy count mismatch`);
  }
});

test('Prismatic Founder is not included in any elemental starter', () => {
  const founderId = 'prismatic-stream-bandit-prismatic-founder';
  for (const starter of starters.starters) {
    assert.equal(starter.cards.some(([id]) => id === founderId), false, `${starter.name}: Founder must not be in starter`);
  }
});
