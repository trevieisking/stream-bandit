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

test('attach_relic caller remains explicit migration debt until the next Relic slice', () => {
  const block = slice(match, 'if(action==="attach_relic")', 'if(action==="play_realm")');
  assert.ok(block.includes('d.family!=="Relic"'), 'dispatcher must retain Relic legality until caller migration');
  assert.ok(block.includes('cr.relic=removeHand(p,uid)!'), 'direct physical attachment must remain visible as unresolved Relic caller debt');
  assert.ok(block.includes('td?.id==="stone-flintkin"'), 'Flintkin compatibility must remain until generic relic_attached event parity is proven');
  assert.equal(block.includes('runtimeV02AttachRelicFromHand('), false, 'foundation-only slice must not falsely claim caller migration');
});
