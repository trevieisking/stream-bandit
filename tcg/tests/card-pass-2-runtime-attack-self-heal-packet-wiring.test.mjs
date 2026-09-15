import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const effectSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');
const adapterSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-heal-packet-v0-2.ts', 'utf8');

function count(source, needle) {
  return source.split(needle).length - 1;
}

test('structured self-heal runtime records packets inside its existing single call site', () => {
  assert.equal(
    count(matchSource, 'const structuredSelfHealEffects=structuredRuntimeAfterDamageSelfHealEffects('),
    1,
    'match runtime must keep exactly one structured self-heal execution call',
  );
  assert.ok(effectSource.includes('recordRuntimeV02AttackSelfHealPackets'));
  assert.ok(effectSource.includes('const packetContext = selfHealPacketContext(state, instanceOrId, sourceCreature);'));
  assert.ok(effectSource.includes('emitted_packet_ids: []'));
  assert.ok(effectSource.includes('.map((packet) => packet.id)'));
});

test('match audit automatically carries packet ids without creating a second packet owner', () => {
  assert.ok(
    count(matchSource, 'structured_after_damage_self_heal:structuredSelfHealEffects') >= 2,
    'pending and completed attack audit paths must retain the structured self-heal result',
  );
  assert.equal(
    matchSource.includes('recordRuntimeV02AttackSelfHealPackets'),
    false,
    'match action file must not become a second packet recorder',
  );
});

test('packet wiring remains generic and record-only', () => {
  assert.ok(adapterSource.includes('recordRuntimeV02HealPacket'));
  assert.equal(adapterSource.includes('healRuntimeDamage('), false);
  assert.equal(adapterSource.includes('applyRuntimeV02HealPacket('), false);
  for (const cardId of [
    'rushing-wake',
    'guarded-surge',
    'tide-shellip',
    'tide-symbiote',
    'moonlit-reef',
  ]) {
    assert.equal(adapterSource.includes(cardId), false, `adapter hard-coded ${cardId}`);
  }
});

test('HEAL_EACH and selected-heal packet wiring remain separate later slices', () => {
  const selfHealStart = effectSource.indexOf('export function structuredRuntimeAfterDamageSelfHealEffects(');
  const healEachStart = effectSource.indexOf('export function structuredRuntimeAfterDamageHealEachEffects(');
  const selectedStart = effectSource.indexOf('export function structuredRuntimeAfterDamageSelectedHealChoice(');
  assert.ok(selfHealStart >= 0 && healEachStart > selfHealStart && selectedStart > healEachStart);
  const selfHealSlice = effectSource.slice(selfHealStart, healEachStart);
  assert.ok(selfHealSlice.includes('recordRuntimeV02AttackSelfHealPackets'));
  assert.equal(effectSource.slice(healEachStart, selectedStart).includes('recordRuntimeV02AttackSelfHealPackets'), false);
});
