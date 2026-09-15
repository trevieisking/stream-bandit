import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const effectsSource = readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');
const packetSource = readFileSync('supabase/functions/_shared/tcg-match-attack-heal-packet-v0-2.ts', 'utf8');
const matchSource = readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

test('HEAL_EACH structured owner records canonical packets through one adapter', () => {
  assert.ok(effectsSource.includes('recordRuntimeV02AttackHealEachPackets'));
  assert.ok(effectsSource.includes('emitted_packet_ids: string[];'));
  assert.ok(effectsSource.includes('const packetContext = healEachPacketContext(state, instanceOrId, friendlyReserve);'));
  assert.ok(effectsSource.includes('result.emitted_packet_ids = recordRuntimeV02AttackHealEachPackets('));
  assert.equal(count(effectsSource, 'recordRuntimeV02AttackHealEachPackets('), 1, 'HEAL_EACH owner must append packets from one call site');
});

test('canonical Reserve/source binding is validated before HEAL_EACH damage mutation', () => {
  const binding = effectsSource.indexOf('const packetContext = healEachPacketContext(state, instanceOrId, friendlyReserve);');
  const occupied = effectsSource.indexOf('const occupied = friendlyReserve', binding);
  const healing = effectsSource.indexOf('actual_heal: healRuntimeDamage(target, step.amount)', occupied);
  assert.ok(binding >= 0 && occupied > binding && healing > occupied, 'packet identity binding must precede HEAL_EACH healing');
});

test('HEAL_EACH packet adapter validates all targets before appending event packets', () => {
  assert.ok(packetSource.includes('export function recordRuntimeV02AttackHealEachPackets('));
  assert.ok(packetSource.includes('if (actual > 0) records.push({ requested, actual, target: boundTarget });'));
  const totalCheck = packetSource.indexOf('tcg_v0_2_attack_heal_each_packet_actual_total_mismatch');
  const packetLoop = packetSource.indexOf('for (const record of records)');
  assert.ok(totalCheck >= 0 && packetLoop > totalCheck, 'all HEAL_EACH result validation must finish before packet append');
  assert.equal(packetSource.includes('healRuntimeDamage'), false, 'packet adapter must never heal a Creature again');
  assert.equal(packetSource.includes('applyRuntimeV02HealPacket'), false, 'packet adapter must remain record-only');
});

test('HEAL_EACH packet authority stays generic and card-ID-free', () => {
  for (const token of ['canopy-crash', 'grove-canopy', 'tide-shellip', 'grove-symbiote-essence', 'tide-moonlit-reef']) {
    assert.equal(packetSource.includes(token), false, `packet adapter contains card-specific authority: ${token}`);
  }
});

test('existing match action automatically carries HEAL_EACH emitted packet IDs in its structured audit', () => {
  assert.ok(matchSource.includes('structuredRuntimeAfterDamageHealEachEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.reserve)'));
  assert.ok(matchSource.includes('structured_after_damage_heal_each:structuredHealEachEffects'));
  assert.equal(matchSource.includes('recordRuntimeV02AttackHealEachPackets'), false, 'match action must not become a second HEAL_EACH packet owner');
});
