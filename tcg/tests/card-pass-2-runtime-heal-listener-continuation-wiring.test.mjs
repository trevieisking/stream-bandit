import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const continuationSource = fs.readFileSync('supabase/functions/_shared/tcg-match-heal-listener-continuation-v0-2.ts', 'utf8');
const dispatchSource = fs.readFileSync('supabase/functions/_shared/tcg-match-heal-listener-dispatch-v0-2.ts', 'utf8');

test('nested heal continuation is a separate iterative lifecycle owner above the accepted single-packet dispatcher', () => {
  assert.ok(continuationSource.includes('dispatchRuntimeV02AfterHealPacket(state, packet.id)'));
  assert.ok(continuationSource.includes('runtimeV02CurrentTurnHealPackets(state)'));
  assert.equal((continuationSource.match(/continueRuntimeV02AfterHealPackets\(/g) || []).length, 1, 'continuation must never recursively call itself');
  assert.equal(dispatchSource.includes('continueRuntimeV02AfterHealPackets'), false, 'single-packet dispatcher must not call continuation recursively');
});

test('continuation owns ordering only and never becomes a second healing or listener-effect owner', () => {
  for (const forbidden of ['healRuntimeDamage', 'applyRuntimeV02HealPacket', 'recordRuntimeV02HealPacket', 'addRuntimeShield']) {
    assert.equal(continuationSource.includes(forbidden), false, `continuation must not own ${forbidden}`);
  }
  assert.ok(continuationSource.includes('queue.sort((a, b) => a.sequence - b.sequence'));
  assert.ok(continuationSource.includes('processed.has(packet.id)'));
  assert.ok(continuationSource.includes('queued.has(nested.id)'));
  assert.ok(continuationSource.includes('nested.sequence <= packet.sequence'));
});

test('root and listener-emitted packet ids are rebound to the canonical current-turn packet ledger', () => {
  assert.ok(continuationSource.includes('const byId = packetsById(state)'));
  assert.ok(continuationSource.includes('tcg_v0_2_heal_continuation_packet_not_found'));
  assert.ok(continuationSource.includes('tcg_v0_2_heal_continuation_duplicate_root_packet_id'));
  assert.ok(continuationSource.includes('tcg_v0_2_heal_continuation_duplicate_emitted_packet_id'));
  assert.ok(continuationSource.includes('tcg_v0_2_heal_continuation_non_forward_packet'));
});

test('OPTIONAL listeners pause continuation without resolving the private choice in this tick', () => {
  assert.ok(continuationSource.includes('status: "player_choice_required"'));
  assert.ok(continuationSource.includes('blocked_packet_id: packet.id'));
  assert.ok(continuationSource.includes('remaining_packet_ids: queue.map((item) => item.id)'));
  assert.equal(continuationSource.includes('DRAW'), false);
  assert.equal(continuationSource.includes('CHOOSE_HAND_TO_DISCARD'), false);
  assert.equal(continuationSource.includes('pending_attack_choice'), false);
});

test('continuation remains generic and contains no frozen listener or Set One card identity', () => {
  for (const identity of [
    'tide-shellip',
    'grove-symbiote-essence',
    'tide-moonlit-reef',
    'deep-current',
    'canopy-crash',
  ]) {
    assert.equal(continuationSource.includes(identity), false, `generic continuation must not hard-code ${identity}`);
  }
});
