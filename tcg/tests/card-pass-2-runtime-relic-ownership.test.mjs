import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const relic = fs.readFileSync('supabase/functions/_shared/tcg-match-relic-engine-v0-2.ts', 'utf8');
const cardZone = fs.readFileSync('supabase/functions/_shared/tcg-match-card-zone-engine-v0-2.ts', 'utf8');
const match = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function slice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

test('Relic family owns specialist hand-to-attached_relic mutation without card-specific authority', () => {
  assert.ok(relic.includes('export function runtimeV02AttachRelicFromHand'));
  assert.ok(relic.includes('player.hand.splice(sourceIndex, 1)[0]'));
  assert.ok(relic.includes('target.creature.relic = attached'));
  assert.ok(relic.includes('tcg_v0_2_relic_attachment_destination_occupied'));
  assert.ok(relic.includes('event_name: "relic_attached"'));
  assert.ok(relic.includes('Card-Zone intentionally rejects attached_relic'));

  for (const forbidden of [
    'stone-flintkin',
    'bastion-plate',
    'shellguard-pendant',
    'gloom-locket',
    'arc-band',
    'Relic"',
  ]) {
    assert.equal(relic.includes(forbidden), false, `Relic owner contains card/subtype legality authority: ${forbidden}`);
  }
});

test('Card-Zone explicitly reserves attached_relic as a specialist destination', () => {
  assert.ok(cardZone.includes('"attached_relic"'));
  assert.ok(cardZone.includes('SPECIALIST_DESTINATION_ZONES'));
  assert.ok(cardZone.includes('tcg_v0_2_card_zone_specialist_destination_owned'));
});

test('attach_relic delegates physical mutation to Relic while preserving legality and temporary Flintkin compatibility', () => {
  const block = slice(match, 'if(action==="attach_relic")', 'if(action==="play_realm")');
  assert.ok(match.includes('import { runtimeV02AttachRelicFromHand } from "../_shared/tcg-match-relic-engine-v0-2.ts";'));
  assert.ok(block.includes('d.family!=="Relic"'), 'dispatcher must retain Relic legality');
  assert.ok(block.includes('creature_already_has_relic'), 'dispatcher must preserve public occupied-slot error');
  assert.ok(block.includes('runtimeV02AttachRelicFromHand(p,seat as 1|2,targetInst.uid,uid)'));
  assert.equal(block.includes('cr.relic=removeHand(p,uid)!'), false, 'dispatcher must not mutate Relic attachment directly');
  assert.ok(block.includes('td?.id==="stone-flintkin"'), 'Flintkin compatibility must remain until generic relic_attached event parity is proven');
});
