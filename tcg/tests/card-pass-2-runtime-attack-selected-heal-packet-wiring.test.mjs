import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const choiceSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-choice-v0-2.ts', 'utf8');
const adapterSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-heal-packet-v0-2.ts', 'utf8');
const healPacketSource = fs.readFileSync('supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts', 'utf8');

function assertInOrder(source, needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = source.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('live selected-heal choice delegates to the canonical apply-and-record heal boundary', () => {
  assert.ok(choiceSource.includes('applyRuntimeV02AttackSelectedHealPacket('));
  assert.ok(adapterSource.includes('export function applyRuntimeV02AttackSelectedHealPacket('));
  assert.ok(adapterSource.includes('return applyRuntimeV02HealPacket('));
  assert.ok(healPacketSource.includes('const actual = healRuntimeDamage(targetCreature, requested);'));
  assert.ok(choiceSource.includes('emitted_packet_ids: emittedPacketIds'));
});

test('selected-heal packet source and target are rebound from canonical battlefield authority before healing', () => {
  assert.ok(adapterSource.includes('const sourceCreatureRecord = objectRecord(player.vanguard);'));
  assert.ok(adapterSource.includes('assertAttackOwnedBySource(state, source, attackId);'));
  assert.ok(adapterSource.includes('fieldCreature !== context.target_creature'));
  assert.ok(adapterSource.includes('uid !== anchor'));
  assertInOrder(adapterSource, [
    'const source = bindSource(state, {',
    'assertAttackOwnedBySource(state, source, attackId);',
    'const target = bindFriendlyFieldTarget(state, controllerSeat, context);',
    'return applyRuntimeV02HealPacket(',
  ], 'selected-heal binding must complete before canonical healing');
});

test('selected-heal packet authority is generic and contains no Set One card identity', () => {
  assert.ok(!adapterSource.includes('tide-tideroar'));
  assert.ok(!adapterSource.includes('"deep-current"'));
  assert.ok(!adapterSource.includes('moonlit-reef'));
  assert.ok(!adapterSource.includes('canopy-crash'));
});

test('match action supplies canonical state and audits packet ids without becoming a packet owner', () => {
  assert.ok(matchSource.includes('runtimeV02ResolveSelectedHealChoice(pending,seat as 1|2,String(body.choice_id||""),ids,friendlyFieldEntries(p,s),s)'));
  assert.ok(matchSource.includes('emitted_packet_ids:resolved.emitted_packet_ids'));
  assert.ok(!matchSource.includes('applyRuntimeV02AttackSelectedHealPacket'));
  assert.ok(!matchSource.includes('applyRuntimeV02HealPacket'));
  assert.ok(!matchSource.includes('recordRuntimeV02HealPacket'));
});

test('live and metadata-only selected-heal paths remain mutually exclusive so healing cannot double-apply', () => {
  assertInOrder(choiceSource, [
    'const packetResolution = state',
    '? applyRuntimeV02AttackSelectedHealPacket(',
    ': null;',
    'const actualHeal = packetResolution',
    '? packetResolution.actual_heal',
    ': healRuntimeDamage(entry.creature, choice.amount);',
  ], 'selected-heal live/metadata authority split changed');
});

test('revision, nonce replay and pending-choice guards remain ahead of selected-heal mutation', () => {
  assertInOrder(matchSource, [
    'const {data:prior,error:priorErr}=await admin.from("tcg_match_commands")',
    'if(prior)return json({ok:true,version:VERSION,replayed:true',
    'if(revision!==expected)return json({ok:false,version:VERSION,error:"stale_revision"',
    'if(action==="resolve_attack_choice")',
    's.phase!=="attack_effect_resolution"',
    'runtimeV02ResolveSelectedHealChoice(',
    'delete s.pending_attack_choice',
  ], 'selected-heal replay/revision ordering changed');
});
