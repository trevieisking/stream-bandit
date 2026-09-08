import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adapterSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-heal-packet-v0-2.ts', 'utf8');
const packetSource = fs.readFileSync('supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts', 'utf8');

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

test('structured attack heal adapter records through the canonical record-only packet owner', () => {
  assert.ok(adapterSource.includes('recordRuntimeV02HealPacket'));
  assert.ok(adapterSource.includes('export function recordRuntimeV02AttackSelfHealPackets('));
  assert.equal(adapterSource.includes('applyRuntimeV02HealPacket'), false, 'adapter must not apply healing a second time');
  assert.equal(adapterSource.includes('healRuntimeDamage('), false, 'adapter must not become another healing owner');
  assert.equal(count(adapterSource, 'recordRuntimeV02HealPacket(state, requested, actual,'), 1);
  assert.ok(packetSource.includes('export function recordRuntimeV02HealPacket('));
});

test('packet binding is canonical-field and top-instance based', () => {
  assert.ok(adapterSource.includes('fieldCreature !== context.source_creature'));
  assert.ok(adapterSource.includes('tcg_v0_2_attack_heal_packet_source_creature_binding_mismatch'));
  assert.ok(adapterSource.includes('tcg_v0_2_attack_heal_packet_source_identity_mismatch'));
  assert.ok(adapterSource.includes('runtimeV02Definition(state, { card_id: cardId })'));
  assert.ok(adapterSource.includes('definition.card_family || "") !== "Creature"'));
  assert.ok(adapterSource.includes('definition.element'));
});

test('adapter preserves attack source authority and self-target identity', () => {
  assert.ok(adapterSource.includes('action_kind: "attack"'));
  assert.ok(adapterSource.includes('action_id: attackId'));
  assert.ok(adapterSource.includes('card_effect: true'));
  assert.ok(adapterSource.includes('creature_uid: source.uid'));
  assert.ok(adapterSource.includes('where: source.where'));
  assert.ok(adapterSource.includes('index: source.index'));
  assert.ok(adapterSource.includes('if (!effect || effect.target !== "$source_creature")'));
});

test('adapter is Set One card-ID-free and reusable by future self-heal attacks', () => {
  for (const cardId of [
    'tide-rillrunner',
    'tide-reefback',
    'tide-tideroar',
    'tide-shellip',
    'tide-moonlit-reef',
    'grove-symbiote-essence',
  ]) {
    assert.equal(adapterSource.includes(cardId), false, `adapter contains card-specific authority: ${cardId}`);
  }
});
