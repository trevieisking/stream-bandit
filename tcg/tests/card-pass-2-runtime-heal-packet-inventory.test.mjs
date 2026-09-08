import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const elementFiles = [
  'tcg-card-pass-2-astral.md',
  'tcg-card-pass-2-ember.md',
  'tcg-card-pass-2-gale.md',
  'tcg-card-pass-2-grove.md',
  'tcg-card-pass-2-shade.md',
  'tcg-card-pass-2-stone.md',
  'tcg-card-pass-2-tide.md',
  'tcg-card-pass-2-volt.md',
];

function count(source, needle) {
  return source.split(needle).length - 1;
}

test('frozen Set One has exactly three after_heal_packet listeners', () => {
  const byFile = Object.fromEntries(elementFiles.map((file) => [file, readFileSync(file, 'utf8')]));
  const counts = Object.fromEntries(Object.entries(byFile).map(([file, source]) => [file, count(source, '"event":"after_heal_packet"')]));
  assert.equal(Object.values(counts).reduce((sum, value) => sum + value, 0), 3);
  assert.equal(counts['tcg-card-pass-2-grove.md'], 1);
  assert.equal(counts['tcg-card-pass-2-tide.md'], 2);
  for (const file of elementFiles.filter((file) => !['tcg-card-pass-2-grove.md', 'tcg-card-pass-2-tide.md'].includes(file))) {
    assert.equal(counts[file], 0, `${file} unexpectedly gained after_heal_packet authority`);
  }

  assert.ok(byFile['tcg-card-pass-2-grove.md'].includes('"id":"symbiote-reciprocal-heal"'));
  assert.ok(byFile['tcg-card-pass-2-tide.md'].includes('"id":"tidepool-shell"'));
  assert.ok(byFile['tcg-card-pass-2-tide.md'].includes('"id":"moonlit-reef-filter"'));
});

test('heal-packet owner is generic, actual-heal-only and separate from healing math', () => {
  const packetSource = readFileSync('supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts', 'utf8');
  const coreSource = readFileSync('supabase/functions/tcg-tactic-actions/runtime-v0-2-core.ts', 'utf8');

  assert.ok(packetSource.includes('healRuntimeDamage(targetCreature, requested)'));
  assert.ok(packetSource.includes('if (actual <= 0)'));
  assert.ok(packetSource.includes('event: "after_heal_packet"'));
  assert.ok(packetSource.includes('runtime_v0_2_event_seq'));
  assert.ok(packetSource.includes('source: RuntimeV02HealPacketSource'));
  assert.ok(packetSource.includes('target: RuntimeV02HealPacketTarget'));
  assert.equal(coreSource.includes('after_heal_packet'), false, 'heal primitive must not own listener lifecycle');

  for (const cardId of ['tide-shellip', 'grove-symbiote-essence', 'tide-moonlit-reef']) {
    assert.equal(packetSource.includes(cardId), false, `generic packet owner contains card-specific authority: ${cardId}`);
  }
});
