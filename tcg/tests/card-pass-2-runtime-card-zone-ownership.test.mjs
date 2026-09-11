import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('supabase/functions/_shared/tcg-match-card-zone-engine-v0-2.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Card-Zone Engine is generic, card-id-free and cannot absorb specialist attachment destinations', () => {
  assert.ok(engine.includes('export function runtimeV02PreflightCardZoneTransfer'));
  assert.ok(engine.includes('export function runtimeV02ApplyCardZoneTransfer'));
  assert.ok(engine.includes('tcg_v0_2_card_zone_specialist_destination_owned'));
  assert.ok(engine.includes('sourceZone.splice(0, sourceZone.length, ...remaining)'));
  assert.ok(engine.includes('destinationZone.push(...preflight.cards)'));

  for (const forbidden of [
    'volt-stormmane',
    'Stormmane',
    'storm-break',
    'Storm Break',
    'gale-breeze-essence',
    'stone-anchor-essence',
  ]) {
    assert.equal(engine.includes(forbidden), false, `Card-Zone owner contains card/name authority: ${forbidden}`);
  }
});

test('legacy Stormmane keeps mechanic legality and public error while delegating physical movement to Card-Zone Engine', () => {
  assert.ok(match.includes('import { runtimeV02ApplyCardZoneTransfer } from "../_shared/tcg-match-card-zone-engine-v0-2.ts";'));
  const block = functionSlice(
    match,
    'if(atk.metadata_source==="legacy"&&ad?.id==="volt-stormmane"',
    'const targetHpAfterDamage=',
  );

  assert.ok(block.includes('runtimeV02ApplyCardZoneTransfer('));
  assert.ok(block.includes('cause:"effect"'));
  assert.ok(block.includes('source:{controller_seat:seat as 1|2,zone:"attached_essence"'));
  assert.ok(block.includes('destination:{controller_seat:seat as 1|2,zone:"discard"'));
  assert.ok(block.includes('card_uids:[uid]'));
  assert.ok(block.includes('destination_position:"bottom"'));
  assert.ok(block.includes('stormmane_attached_essence_discard_required'));
  assert.ok(block.includes('essence_discarded_turn=Number(s.turn_seq||0)'));
  assert.ok(block.indexOf('runtimeV02ApplyCardZoneTransfer(') < block.indexOf('essence_discarded_turn='));

  for (const forbidden of [
    'p.vanguard.essence.findIndex(',
    'p.vanguard.essence.splice(',
    'p.discard.push(',
  ]) {
    assert.equal(block.includes(forbidden), false, `Stormmane regained Card-Zone mutation authority: ${forbidden}`);
  }
});

test('Stormmane delegation remains one bounded legacy caller and does not absorb structured Overcharge resolution', () => {
  const legacyStart = match.indexOf('if(atk.metadata_source==="legacy"&&ad?.id==="volt-stormmane"');
  const legacyEnd = match.indexOf('const targetHpAfterDamage=', legacyStart);
  const call = 'runtimeV02ApplyCardZoneTransfer(';
  assert.equal(match.slice(legacyStart, legacyEnd).split(call).length - 1, 1);
  assert.equal(match.slice(0, legacyStart).includes(call), false);
  assert.equal(match.slice(legacyEnd).includes(call), false);
});
