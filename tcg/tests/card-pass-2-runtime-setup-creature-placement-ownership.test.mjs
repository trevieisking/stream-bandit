import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const setup = fs.readFileSync('supabase/functions/tcg-private-alpha-api/index.ts', 'utf8');
const creature = fs.readFileSync('supabase/functions/_shared/tcg-match-creature-engine-v0-2.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Setup keeps setup legality while Creature family owns specialist hand-to-battlefield placement', () => {
  const block = slice(setup, 'if(action==="setup_place")', 'if(action==="setup_return")');

  assert.ok(setup.includes('runtimeV02PlaceCreatureFromHand'));
  assert.ok(block.includes('if(!starterLegal(meta))'));
  assert.ok(block.includes('vanguard_occupied'));
  assert.ok(block.includes('illegal_reserve_slot'));
  assert.ok(block.includes('runtimeV02PlaceCreatureFromHand(p,seat as 1|2,uid,where as "vanguard"|"reserve",where==="reserve"?idx:null)'));

  assert.equal(block.includes('p.vanguard=creatureFrom('), false, 'Setup must not construct Vanguard Creature state directly');
  assert.equal(block.includes('p.reserve[idx]=creatureFrom('), false, 'Setup must not construct Reserve Creature state directly');
  assert.equal(block.includes('p.hand.splice('), false, 'Setup must not remove placed Creature cards directly from hand');
  assert.equal(setup.includes('function creatureFrom('), false, 'duplicate setup Creature constructor must be removed');
});

test('Creature family owns physical placement while Card-Zone remains excluded from specialist Creature destinations', () => {
  assert.ok(creature.includes('export function runtimeV02PlaceCreatureFromHand'));
  assert.ok(creature.includes('player.hand.splice(handIndex, 1)'));
  assert.ok(creature.includes('if (where === "vanguard") player.vanguard = creature'));
  assert.ok(creature.includes('else player.reserve[destinationIndex!] = creature'));
  assert.ok(creature.includes('Card-Zone is intentionally not used because creature_stack is a specialist destination'));

  for (const forbidden of ['gale-whiffin','stone-pebblit','grove-bloomhare','Creature — Baby','Creature — Mythic']) {
    assert.equal(creature.includes(forbidden), false, `Creature placement owner contains card/set legality authority: ${forbidden}`);
  }
});

test('ordinary play_creature remains an explicit next caller instead of being falsely claimed complete', () => {
  const start = match.indexOf('if(action==="play_creature")');
  const end = match.indexOf('if(action==="evolve")', start);
  assert.ok(start >= 0 && end > start);
  const block = match.slice(start, end);
  assert.ok(block.includes('p.reserve[idx]={stack:[x]'), 'ordinary play direct placement debt must stay visible until its own slice');
  assert.equal(block.includes('runtimeV02PlaceCreatureFromHand('), false, 'this setup-only caller migration must not falsely claim ordinary play was migrated');
});
