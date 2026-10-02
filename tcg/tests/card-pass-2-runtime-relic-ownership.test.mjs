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
  assert.ok(relic.includes('runtimeV02Definition(state, source)'));
  assert.ok(relic.includes('String(tactic?.subtype || "") !== "Relic"'));
  assert.ok(relic.includes('runtimeV02ValidateManualRelicAttachmentDeclaration'));

  for (const forbidden of [
    'stone-flintkin',
    'bastion-plate',
    'shellguard-pendant',
    'gloom-locket',
    'arc-band',
  ]) {
    assert.equal(relic.includes(forbidden), false, `Relic owner contains card/subtype legality authority: ${forbidden}`);
  }
});

test('Card-Zone explicitly reserves attached_relic as a specialist destination', () => {
  assert.ok(cardZone.includes('"attached_relic"'));
  assert.ok(cardZone.includes('SPECIALIST_DESTINATION_ZONES'));
  assert.ok(cardZone.includes('tcg_v0_2_card_zone_specialist_destination_owned'));
});

test('attach_relic delegates marked runtime to generic Relic Attachment events while preserving legacy compatibility', () => {
  const block = slice(match, 'if(action==="attach_relic")', 'if(action==="play_realm")');
  const structured = block.slice(block.indexOf('if(structuredRelic){'), block.indexOf('const cr=getCr(p,where,idx)'));
  const legacy = block.slice(block.indexOf('const cr=getCr(p,where,idx)'));
  assert.ok(match.includes('runtimeV02AttachRelicFromHand,'));
  assert.ok(match.includes('runtimeV02ValidateManualRelicAttachmentDeclaration,'));
  assert.ok(match.includes('runtimeV02BeginRelicAttachmentRoute'));
  assert.ok(match.includes('from "../_shared/tcg-match-relic-attachment-route-v0-2.ts";'));
  assert.ok(structured.includes('runtimeV02ValidateManualRelicAttachmentDeclaration('), 'structured dispatcher must delegate Relic legality');
  assert.ok(structured.includes('runtimeV02BeginRelicAttachmentRoute('), 'structured dispatcher must start generic Relic Attachment event flow');
  assert.ok(structured.includes('event_listener:eventAudit'), 'structured dispatcher must retain Event Listener audit');
  assert.ok(structured.includes('heal_listener:healAudit'), 'structured dispatcher must complete canonical Heal Listener continuation');
  assert.equal(structured.includes('stone-flintkin'), false, 'marked runtime must not dispatch Flintkin by card ID');
  assert.ok(legacy.includes('d.family!=="Relic"'), 'legacy dispatcher must retain Relic legality');
  assert.ok(legacy.includes('creature_already_has_relic'), 'legacy dispatcher must preserve public occupied-slot error');
  assert.ok(legacy.includes('runtimeV02AttachRelicFromHand(p,seat as 1|2,targetInst.uid,uid)'));
  assert.ok(legacy.includes('td?.id==="stone-flintkin"'), 'unmarked legacy compatibility remains raw-heal fallback');
  assert.equal(block.includes('cr.relic=removeHand(p,uid)!'), false, 'dispatcher must not mutate Relic attachment directly');
});
