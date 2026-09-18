import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

function selectionBranch() {
  const start = controller.indexOf('function bindCardControls');
  const end = controller.indexOf("document.querySelectorAll('[data-card-intent=\"play_tactic\"]')", start);
  assert.ok(start >= 0 && end > start, 'card selection branch not found');
  return controller.slice(start, end);
}

test('selecting the same hand card again cancels local selection before authoritative commit', () => {
  const branch = selectionBranch();
  assert.match(branch, /const deselect = state\.selectedHandUid === uid/);
  assert.match(branch, /state\.selectedHandUid = deselect \? '' : uid/);
  assert.match(branch, /if \(!deselect\) \{[\s\S]*runEvolutionTargetProjection\(uid\)[\s\S]*runEssenceTargetProjection\(uid\)[\s\S]*runRelicTargetProjection\(uid\)[\s\S]*runTacticPlayabilityProjection\(uid\)/);
  assert.doesNotMatch(branch, /actionBase\(/);
  assert.doesNotMatch(branch, /run(?:Evolution|Essence|Relic|Tactic|PlayRealm|PlayCreature|Attack)Intent\(/);
});

test('hand cancellation clears every local legal-target projection', () => {
  const branch = selectionBranch();
  for (const clear of [
    'clearEvolutionProjection()',
    'clearEssenceProjection()',
    'clearRelicProjection()',
    'clearTacticProjection()',
  ]) {
    assert.match(branch, new RegExp(clear.replace(/[()]/g, '\\$&')));
  }
});

test('battlefield card selection toggles off without a gameplay mutation', () => {
  const branch = selectionBranch();
  assert.match(branch, /state\.selectedAnchorUid = state\.selectedAnchorUid === anchor \? '' : anchor/);
  assert.match(branch, /state\.selectedHandUid = ''/);
  assert.doesNotMatch(branch, /callEdge\(/);
});

test('pointer and keyboard selection share the same cancel path', () => {
  const branch = selectionBranch();
  assert.match(branch, /card\.addEventListener\('click'[\s\S]*select\(\)/);
  assert.match(branch, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(branch, /event\.preventDefault\(\)[\s\S]*select\(\)/);
});

test('authoritative mutation remains separate from pre-commit selection', () => {
  assert.match(controller, /actionBase\('evolve'\)/);
  assert.match(controller, /actionBase\('attach_essence'\)/);
  assert.match(controller, /actionBase\('attach_relic'\)/);
  assert.match(controller, /actionBase\('play_tactic'\)/);
  assert.match(controller, /actionBase\('play_realm'\)/);
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /actionBase\('attack'\)/);
});
