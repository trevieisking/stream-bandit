import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-attack-discard-recycle-choice-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

function matchesDiscardRecycleChoiceShape(attack) {
  const steps = attack?.after_damage;
  if (!Array.isArray(steps) || steps.length !== 2) return false;
  const [select, move] = steps;
  if (select?.op !== 'SELECT_CARDS' || select?.player !== 'self' || select?.zone !== 'discard') return false;
  const selection = select?.selection;
  if (!selection || Number(selection.min) !== 0 || Number(selection.max) !== 1) return false;
  if (selection?.filters?.card_family !== 'Tactic' || selection?.filters?.tactic_subtype !== 'Device') return false;
  const selected = String(select?.as || '');
  if (!selected) return false;
  return move?.op === 'MOVE_CARDS' && move?.player === 'self' && move?.cards === `$${selected}` && move?.to === 'deck_bottom' && move?.order === 'preserve';
}

test('generic discard recycle attack-choice owner is card-id-free and attack-only', () => {
  for (const forbidden of ['grove-myceliarch', 'Mirecolossus', 'Networked Growth', 'Fungal Forage']) {
    assert.equal(owner.includes(forbidden), false, `generic discard recycle owner contains forbidden card/name authority: ${forbidden}`);
  }
  assert.ok(owner.includes('structuredRuntimeAfterDamageDiscardRecycleChoice'));
  assert.ok(owner.includes('runtimeV02CreateAttackDiscardRecycleChoice'));
  assert.ok(owner.includes('runtimeV02ResolveAttackDiscardRecycleChoice'));
  assert.ok(owner.includes('attack.after_damage'));
  assert.equal(owner.includes('creature.ability'), false, 'attack owner must not inspect active/triggered Ability programs');
});

test('frozen Set One inventory has exactly one attack in the discard recycle choice family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    for (const attack of row.definition?.creature?.attacks || []) {
      if (matchesDiscardRecycleChoiceShape(attack)) matches.push(`${row.card_id}:${attack.id}`);
    }
  }
  assert.deepEqual(matches, ['grove-myceliarch:mycelial-bloom']);
});

test('match owner wires the generic discard recycle family while keeping Grove scope narrow and Astral blockers intact', () => {
  assert.ok(match.includes('structuredRuntimeAfterDamageDiscardRecycleChoice'));
  assert.ok(match.includes('runtimeV02CreateAttackDiscardRecycleChoice'));
  assert.ok(match.includes('runtimeV02ResolveAttackDiscardRecycleChoice'));
  assert.ok(match.includes('ad?.id==="grove-myceliarch"&&(slot!==2||structuredDiscardRecycleChoice==null)'));
  assert.equal(match.includes('||ad?.id==="grove-myceliarch";'), false, 'blanket Myceliarch blocker must be replaced by the slot-2 structured gate');
  assert.ok(match.includes('ad?.id==="astral-nebulynx"&&slot===2&&structuredInspectionChoice==null'));
  assert.ok(match.includes('ad?.id==="astral-celestyr-dream-cartographer"&&slot===1&&structuredTopDeckCardChoice==null'));
});

test('discard recycle resolver stays inside the private attack-choice branch before selected-heal fallback', () => {
  const branch = match.indexOf('if(pending.kind==="select_discard_device_to_deck_bottom")');
  const recycleResolve = match.indexOf('runtimeV02ResolveAttackDiscardRecycleChoice', branch);
  const healResolve = match.indexOf('runtimeV02ResolveSelectedHealChoice', branch);
  assert.ok(branch >= 0, 'missing discard recycle attack-choice branch');
  assert.ok(recycleResolve > branch, 'discard recycle resolver must be inside the private attack-choice branch');
  assert.ok(healResolve > recycleResolve, 'selected-heal resolver must remain the later fallback kind');
});

test('pending discard recycle choice pauses before defeats and public audit never exposes discard identities', () => {
  const start = match.indexOf('if(pendingDiscardRecycleChoice)');
  const end = match.indexOf('if(pendingTopDeckCardChoice)', start);
  assert.ok(start >= 0 && end > start, 'missing pending discard recycle choice block');
  const block = match.slice(start, end);
  assert.ok(block.includes('s.phase="attack_effect_resolution"'));
  assert.ok(block.includes('runtimeV02PendingAttackChoiceView'));
  assert.equal(block.includes('scanDefeats()'), false, 'defeat scan must wait for the optional discard choice');
  assert.equal(block.includes('aftermath('), false, 'Aftermath must wait for the optional discard choice');
  for (const privateField of ['uid', 'card_id', 'options:', 'label:']) {
    assert.equal(block.includes(privateField), false, `public pending receipt must not serialize ${privateField}`);
  }
});

test('resolved discard recycle public receipt exposes counts only', () => {
  const start = match.indexOf('if(pending.kind==="select_discard_device_to_deck_bottom")');
  const end = match.indexOf('if(pending.kind==="choose_from_looked_set")', start);
  assert.ok(start >= 0 && end > start, 'missing resolved discard recycle branch');
  const block = match.slice(start, end);
  assert.ok(block.includes('selected_count:resolved.selected_count'));
  assert.ok(block.includes('moved_count:resolved.moved_count'));
  for (const privateField of ['selected_uid', 'selected_card_id', 'resolved.options', 'resolved.label']) {
    assert.equal(block.includes(privateField), false, `resolved public receipt must not expose ${privateField}`);
  }
});
