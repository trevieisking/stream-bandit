import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const source = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-presentation-v1.js'), 'utf8');
const battle = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

function loadPresentation() {
  const window = {
    setTimeout: (fn) => {
      fn();
      return 1;
    },
    matchMedia: () => ({ matches: false })
  };
  vm.runInNewContext(source, { window, globalThis: window, Set, Promise, Number, String, Array });
  return window.StreamBanditTCGBattlePresentation;
}

test('presentation foundation exposes one generic revision-bound choreography queue', async () => {
  const api = loadPresentation();
  assert.equal(api.schema, 'tcg-presentation-envelope-v1');
  const engine = api.create({ reducedMotion: true });
  const seen = [];
  const result = engine.ingest({
    schema: 'tcg-presentation-envelope-v1',
    receipt_id: 'r10',
    revision: 10,
    action_kind: 'attack',
    cues: [
      { id: 'impact', order: 2, family: 'impact', intensity: 'hero' },
      { id: 'source', order: 0, family: 'source_activation' },
      { id: 'target', order: 1, family: 'target_focus' }
    ]
  });
  assert.equal(result.accepted, true);
  await engine.flush((cue) => seen.push(cue.id));
  assert.deepEqual(seen, ['source', 'target', 'impact']);
});

test('newer authoritative revision cancels stale queued choreography', async () => {
  const api = loadPresentation();
  const engine = api.create({ reducedMotion: true });
  engine.ingest({
    schema: 'tcg-presentation-envelope-v1',
    receipt_id: 'r4',
    revision: 4,
    action_kind: 'draw',
    cues: [{ id: 'draw', family: 'zone_move' }]
  });
  engine.cancelToRevision(5);
  const stale = engine.ingest({
    schema: 'tcg-presentation-envelope-v1',
    receipt_id: 'r4-again',
    revision: 4,
    action_kind: 'draw',
    cues: [{ id: 'stale', family: 'zone_move' }]
  });
  assert.equal(stale.accepted, false);
  assert.equal(stale.reason, 'stale_revision');
  assert.equal(engine.snapshot().queued, 0);
});

test('receipt replay suppression prevents polling from replaying the same animation', () => {
  const api = loadPresentation();
  const engine = api.create({ reducedMotion: true });
  const envelope = {
    schema: 'tcg-presentation-envelope-v1',
    receipt_id: 'same-receipt',
    revision: 12,
    action_kind: 'ability',
    cues: [{ id: 'ability', family: 'ability' }]
  };
  assert.equal(engine.ingest(envelope).accepted, true);
  const duplicate = engine.ingest(envelope);
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, 'duplicate_receipt');
});

test('Battle loads the choreography foundation before the existing authoritative controller', () => {
  const presentationIndex = battle.indexOf('stream-bandit-tcg-battle-presentation-v1.js');
  const controllerIndex = battle.indexOf('stream-bandit-tcg-v2-battle-controller.js');
  assert.ok(presentationIndex >= 0);
  assert.ok(controllerIndex > presentationIndex);
  assert.match(controller, /StreamBanditTCGBattlePresentation/);
  assert.doesNotMatch(source, /card_id\s*===|shuffle_seed|calculate_damage|legal_if/);
});
