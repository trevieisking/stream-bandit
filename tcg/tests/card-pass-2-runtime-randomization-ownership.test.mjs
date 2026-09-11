import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const randomization = fs.readFileSync('supabase/functions/_shared/tcg-match-randomization-engine-v0-2.ts', 'utf8');
const privateAlpha = fs.readFileSync('supabase/functions/tcg-private-alpha-api/index.ts', 'utf8');
const tactic = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');
const matchActions = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Randomization Engine remains generic and owns only uniform choice/permutation mechanics', () => {
  assert.ok(randomization.includes('export function runtimeV02UniformRandomInt'));
  assert.ok(randomization.includes('export function runtimeV02ShuffleInPlace'));
  assert.ok(randomization.includes('export function runtimeV02ShuffledCopy'));
  assert.ok(randomization.includes('crypto.getRandomValues(value)'));
  assert.ok(randomization.includes('const acceptanceLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;'));

  for (const forbidden of [
    'discard',
    'deck_bottom',
    'deck_top',
    'attached_essence',
    'card_id',
    'Forager',
  ]) {
    assert.equal(randomization.includes(forbidden), false, `Randomization owner absorbed zone/card authority: ${forbidden}`);
  }
});

test('private-alpha opening deck, mulligan and toss delegate randomness to the shared engine', () => {
  assert.ok(privateAlpha.includes('import { runtimeV02ShuffledCopy, runtimeV02UniformRandomInt } from "../_shared/tcg-match-randomization-engine-v0-2.ts";'));
  assert.ok(privateAlpha.includes('return runtimeV02ShuffledCopy(out)'));
  assert.ok(privateAlpha.includes('deck=runtimeV02ShuffledCopy([...deck,...hand])'));
  assert.ok(privateAlpha.includes('const toss=runtimeV02UniformRandomInt(2)+1'));

  for (const forbidden of [
    'function secureInt(',
    'function shuffle<',
    'crypto.getRandomValues(',
  ]) {
    assert.equal(privateAlpha.includes(forbidden), false, `private-alpha regained duplicate randomness authority: ${forbidden}`);
  }
});

test('match-actions delegates in-battle random outcomes while preserving identity UUID generation', () => {
  assert.ok(matchActions.includes('import { runtimeV02UniformRandomInt } from "../_shared/tcg-match-randomization-engine-v0-2.ts";'));

  const coinBlock = functionSlice(matchActions, 'function coin(){', 'function maxHp');
  assert.ok(coinBlock.includes('runtimeV02UniformRandomInt(2)'));
  assert.equal(coinBlock.includes('crypto.getRandomValues'), false, 'coin outcomes must come from Randomization Engine');

  const randomTargetBlock = functionSlice(
    matchActions,
    'if(attackControl.target_mode==="random_all_creatures"){',
    'const targetSeat=resolvedTarget.seat',
  );
  assert.ok(randomTargetBlock.includes('poolSize=>runtimeV02UniformRandomInt(poolSize)'));
  assert.equal(randomTargetBlock.includes('crypto.getRandomValues'), false, 'random target index must come from Randomization Engine');

  assert.equal(matchActions.includes('crypto.getRandomValues('), false, 'match-actions must not regain raw gameplay RNG ownership');
  assert.ok(matchActions.includes('function randomCodeSafe(){return crypto.randomUUID()}'), 'UUID identity generation must remain separate from gameplay randomness');
});

test('Tactic shuffle stays distinct from explicit deck-bottom movement', () => {
  const shuffleBlock = functionSlice(
    tactic,
    'if (op === "SHUFFLE_DECK") {',
    'if (op === "MOVE_CARDS" && step.selection && step.from) {',
  );
  assert.ok(shuffleBlock.includes('runtimeV02ShuffleInPlace(player.deck as Inst[])'));
  assert.equal(shuffleBlock.includes('runtimeV02ApplyCardZoneTransfer('), false, 'shuffle must not become a card-zone transfer');

  const discardRecycleBlock = functionSlice(
    tactic,
    '} else if (apply === "move_from_zone") {',
    '} else if (apply === "ordered_move") {',
  );
  assert.ok(discardRecycleBlock.includes('String(context.from) !== "discard"'));
  assert.ok(discardRecycleBlock.includes('String(context.destination) !== "deck_bottom"'));
  assert.ok(discardRecycleBlock.includes('destination_position: "bottom"'));
  assert.equal(discardRecycleBlock.includes('runtimeV02Shuffle'), false, 'put-on-bottom must not silently shuffle the deck');
});
