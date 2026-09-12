import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts', 'utf8');

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

test('apply and record-only heal paths share one packet-construction owner', () => {
  assert.ok(source.includes('export function recordRuntimeV02HealPacket('));
  assert.ok(source.includes('export function applyRuntimeV02HealPacket('));
  assert.ok(source.includes('function appendVerifiedHealPacket('));
  assert.equal(count(source, 'const packet: RuntimeV02HealPacket = {'), 1, 'canonical packet shape must have one construction owner');
  assert.ok(source.includes('return appendVerifiedHealPacket(state, envelope, actual);'));
  assert.ok(source.includes('const packet = appendVerifiedHealPacket(state, envelope, actual);'));
});

test('record-only bridge fails closed on impossible actual healing', () => {
  assert.ok(source.includes('actual > requested'));
  assert.ok(source.includes('tcg_v0_2_heal_packet_actual_amount_invalid'));
  assert.ok(source.includes('verifiedActualAmount(actualAmountValue, requested)'));
});

test('canonical record bridge stays generic and card-ID-free', () => {
  for (const cardId of [
    'tide-shellip',
    'grove-symbiote-essence',
    'tide-moonlit-reef',
    'tide-tideroar',
    'tide-rillrunner',
    'tide-reefback',
  ]) {
    assert.equal(source.includes(cardId), false, `heal packet bridge contains card-specific authority: ${cardId}`);
  }
});
