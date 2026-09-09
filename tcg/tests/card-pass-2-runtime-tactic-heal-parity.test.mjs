import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const tactic = fs.readFileSync(path.join(root, 'supabase/functions/tcg-tactic-actions/index.ts'), 'utf8');
const live = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-heal-listener-live-v0-2.ts'), 'utf8');

function findCard(registry, cardId) {
  return registry.definitions.find((entry) => entry.card_id === cardId)?.definition || null;
}

function blockBetween(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0, `missing source anchor: ${start}`);
  assert.ok(b > a, `missing end anchor: ${end}`);
  return source.slice(a, b);
}

test('frozen Tide cards require generic tactic actual-heal packet parity', () => {
  const registry = buildSetOneRegistry(root);
  const olan = findCard(registry, 'tide-reef-medic-olan');
  const shellip = findCard(registry, 'tide-shellip');
  const moonlit = findCard(registry, 'tide-moonlit-reef');
  const spray = findCard(registry, 'tide-recovery-spray');
  assert.ok(olan && shellip && moonlit && spray, 'missing frozen Tide heal/listener definitions');

  assert.equal(olan.tactic?.subtype, 'Ally');
  assert.equal(olan.tactic?.program?.steps?.[1]?.op, 'HEAL_EACH');
  assert.equal(olan.tactic?.program?.steps?.[1]?.amount, 30);
  assert.deepEqual(olan.tactic?.program?.steps?.[0]?.count, { min: 0, max: 2 });

  assert.equal(shellip.creature?.ability?.event, 'after_heal_packet');
  assert.equal(shellip.creature?.ability?.requirements?.all?.[1]?.predicate, 'heal_source_is_card_effect');
  assert.equal(shellip.creature?.ability?.requirements?.all?.[2]?.predicate, 'heal_actual_amount_at_least');
  assert.equal(shellip.creature?.ability?.steps?.[0]?.op, 'ADD_SHIELD');

  const moonlitListener = moonlit.tactic?.listeners?.[0];
  assert.equal(moonlitListener?.event, 'after_heal_packet');
  assert.equal(moonlitListener?.steps?.[0]?.op, 'OPTIONAL');
  assert.equal(moonlitListener?.steps?.[0]?.steps?.[0]?.op, 'DRAW');
  assert.equal(moonlitListener?.steps?.[0]?.steps?.[1]?.op, 'CHOOSE_HAND_TO_DISCARD');

  const sprayBranches = spray.tactic?.program?.steps?.[1];
  assert.equal(sprayBranches?.then?.[1]?.op, 'HEAL');
  assert.equal(sprayBranches?.else?.[0]?.op, 'HEAL');
});

test('tactic HEAL and HEAL_EACH use the canonical v0.2 heal owner without card-specific branches', () => {
  assert.ok(tactic.includes('tcg-match-heal-packet-v0-2.ts'));
  assert.ok(tactic.includes('tcg-match-heal-listener-live-v0-2.ts'));
  assert.ok(tactic.includes('tcg-runtime-registry-v0-2.ts'));
  for (const forbidden of ['tide-reef-medic-olan', 'tide-shellip', 'tide-moonlit-reef', 'Reef Medic Olan', 'Shellip', 'Moonlit Reef']) {
    assert.equal(tactic.includes(forbidden), false, `tactic heal owner must remain card-ID/name-free: ${forbidden}`);
  }

  const helper = blockBetween(tactic, 'function applyTacticHeal(', 'function conditions(');
  assert.ok(helper.includes('if (state.runtime_registry_v0_2 == null)'));
  assert.ok(helper.includes('healRuntimeDamage(found.cr, amount)'), 'unmarked legacy matches must preserve the previous raw heal behavior');
  assert.ok(helper.includes('runtimeV02Definition(state, effect.source_card)'));
  assert.ok(helper.includes('runtimeV02Definition(state, target)'));
  assert.ok(helper.includes('applyRuntimeV02HealPacket(state, found.cr, amount'));
  assert.ok(helper.includes('action_kind: "tactic"'));
  assert.ok(helper.includes('action_id: effect.id'));
  assert.ok(helper.includes('card_uid: effect.source_card.uid'));
  assert.ok(helper.includes('card_id: effect.source_card_id'));
  assert.ok(helper.includes('creature_uid: null'));
  assert.ok(helper.includes('controller_seat: targetSeat'));
  assert.ok(helper.includes('creature_uid: target.uid'));
  assert.ok(helper.includes('where: found.where'));
  assert.ok(helper.includes('index: found.index'));

  const healBlock = blockBetween(tactic, 'if (op === "HEAL") {', 'if (op === "ADD_SHIELD"');
  const healEachBlock = blockBetween(tactic, 'if (op === "HEAL_EACH") {', 'if (op === "CHOOSE_AND_CLEAR_CONDITION")');
  for (const block of [healBlock, healEachBlock]) {
    const cursor = block.indexOf('effect.cursor++');
    const begin = block.indexOf('runtimeV02BeginTacticHealListenerContinuation');
    assert.ok(cursor >= 0 && begin > cursor, 'tactic cursor must advance before an actual-heal listener can pause');
    assert.ok(block.includes('setTacticHealResume(state, effect)'));
  }
  assert.ok(healEachBlock.includes('const packetIds: string[] = []'));
  assert.ok(healEachBlock.includes('packetIds.push(healed.packet_id)'));
});

test('tactic heal private-choice resume is bound to the exact effect cursor and seat-filtered views', () => {
  assert.ok(live.includes('| "resume_tactic_effect"'));
  assert.ok(live.includes('runtimeV02BeginTacticHealListenerContinuation'));
  assert.ok(live.includes('runtimeV02ResolveTacticHealListenerChoice'));

  const setResume = blockBetween(tactic, 'function setTacticHealResume(', 'function readTacticHealResume(');
  const readResume = blockBetween(tactic, 'function readTacticHealResume(', 'function firstRequiredCreatureTargetAvailable(');
  assert.ok(setResume.includes('effect_id: effect.id'));
  assert.ok(setResume.includes('owner_seat: effect.owner_seat'));
  assert.ok(setResume.includes('cursor: effect.cursor'));
  assert.ok(setResume.includes('turn_seq: Number(state.turn_seq || 0)'));
  assert.ok(readResume.includes('tcg_v0_2_tactic_heal_resume_stale_effect'));
  assert.ok(readResume.includes('tcg_v0_2_tactic_heal_resume_owner_changed'));
  assert.ok(readResume.includes('tcg_v0_2_tactic_heal_resume_turn_stale'));
  assert.ok(readResume.includes('tcg_v0_2_tactic_heal_resume_cursor_changed'));

  const resolver = blockBetween(tactic, 'const healPending = state.pending_heal_listener_choice', 'const pending = state.pending_choice');
  const receiptRead = resolver.indexOf('readTacticHealResume(state, effect)');
  const sharedResolve = resolver.indexOf('runtimeV02ResolveTacticHealListenerChoice');
  const receiptDelete = resolver.indexOf('delete state.pending_tactic_heal_resume');
  const interpreterResume = resolver.indexOf('executeUntilChoice(state)', receiptDelete);
  assert.ok(receiptRead >= 0 && sharedResolve > receiptRead, 'exact tactic receipt must be validated before private choice mutation');
  assert.ok(receiptDelete > sharedResolve && interpreterResume > receiptDelete, 'receipt must be released before resuming the same tactic cursor');
  assert.ok(resolver.includes('resolved.resume_seat !== effect.owner_seat'));

  const view = blockBetween(tactic, 'function makeView(', 'function views(');
  assert.ok(view.includes('runtimeV02PendingHealListenerChoiceView'));
  assert.equal(view.includes('pending_heal_listener_resume'), false, 'generic heal resume metadata stays private');
  assert.equal(view.includes('pending_tactic_heal_resume'), false, 'tactic cursor receipt stays private');

  const loop = blockBetween(tactic, 'function executeUntilChoice(', 'function applyPendingChoice(');
  assert.ok(loop.includes('!state.pending_heal_listener_choice'));
  assert.ok(loop.includes('!state.pending_movement_listener_choice'));
});
