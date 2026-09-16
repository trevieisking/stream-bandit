import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const source = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-heal-listener-dispatch-v0-2.ts'), 'utf8');

test('dispatcher consumes persisted canonical heal packets and structured registry metadata', () => {
  assert.match(source, /runtimeV02CurrentTurnHealPackets\(s\)/);
  assert.match(source, /runtimeV02Definition\(s,i\)/);
  assert.match(source, /applyRuntimeV02HealPacket\(s,f\.cr,n/);
  assert.match(source, /addRuntimeShield\(f\.cr,n\)/);
  assert.ok(source.includes('after_heal_packet'));
});

test('all frozen heal-listener predicates are generic and card IDs are not hard-coded', () => {
  for (const predicate of [
    'heal_packet_target_is_self', 'heal_source_is_card_effect', 'heal_actual_amount_at_least',
    'heal_packet_source_is_attached_creature', 'heal_packet_target_controller_is_self',
    'heal_packet_target_is_not_source', 'heal_packet_source_action_kind_is', 'target_stage_in',
    'target_element_is', 'heal_target_element_is', 'heal_controller_is_active_seat',
  ]) assert.ok(source.includes(predicate), `missing predicate ${predicate}`);
  for (const identity of ['tide-shellip', 'grove-symbiote-essence', 'tide-moonlit-reef']) {
    assert.equal(source.includes(identity), false, `generic dispatcher must not hard-code ${identity}`);
  }
});

test('once-per-turn authority and packet replay receipts are stored on the real source instance', () => {
  assert.ok(source.includes('c.source.effect_flags={}'));
  assert.ok(source.includes('runtime_v0_2_listener_limits'));
  assert.ok(source.includes('runtime_v0_2_listener_receipts'));
  assert.ok(source.includes("'card_instance:'+c.source.uid"));
  assert.ok(source.includes("'attachment:'+c.source.uid"));
  assert.ok(source.includes("ID(c)+':'+p.id"));
});

test('OPTIONAL listener programs are deferred and nested heals are not recursively dispatched', () => {
  assert.ok(source.includes("reason:'player_choice_required'"));
  assert.ok(source.includes("String(x.op||'')==='OPTIONAL'"));
  assert.ok(source.includes('chooser_seat:CH(opt,c,p)'));
  assert.equal((source.match(/dispatchRuntimeV02AfterHealPacket\(/g) || []).length, 1, 'dispatcher must not recursively call itself');
});

test('unsupported listener shapes fail closed and legacy states stay outside structured authority', () => {
  assert.ok(source.includes('tcg_v0_2_heal_listener_predicate_unsupported'));
  assert.ok(source.includes('tcg_v0_2_heal_listener_limit_scope_unsupported'));
  assert.ok(source.includes('tcg_v0_2_heal_listener_step_unsupported'));
  assert.ok(source.includes('tcg_v0_2_heal_listener_mixed_choice_program_unsupported'));
  assert.match(source, /if\(!on\(s\)\)return null/);
});
