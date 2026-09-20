import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const commitMigration = fs.readFileSync(path.join(root, 'supabase/migrations/20260903225859_tcg_atomic_match_command_commit.sql'), 'utf8');

test('authoritative match commit may reject stale revisions as logical JSON', () => {
  assert.match(commitMigration, /jsonb_build_object\('ok',false,'error','stale_revision'/);
  assert.match(commitMigration, /return v_result;/);
});

test('V2 transport treats nested authoritative commit rejection as failure', () => {
  assert.doesNotThrow(() => new Function(controller));
  assert.match(controller, /const nestedResult = data && data\.result && typeof data\.result === 'object' \? data\.result : null;/);
  assert.match(controller, /nestedResult && nestedResult\.ok === false/);
  assert.match(controller, /throw new Error\(\(rejected && rejected\.error\) \|\| data\.error/);
});

test('Attack rejection re-syncs authoritative state and preserves visible reason', () => {
  assert.match(controller, /failure = error instanceof Error \? error\.message : String\(error\);\s*await refreshMatch\(\)\.catch\(\(\) => \{\}\);/s);
  assert.match(controller, /if \(failure\) setActionFailure\(failure\);/);
});

test('repair remains transport-only and does not move Attack rules into browser', () => {
  assert.match(controller, /callEdge\(API_MATCH, Object\.assign\(actionBase\('attack'\), \{ attack_slot: attackSlot \}\)\)/);
  assert.doesNotMatch(controller, /stale_revision[^\n]*(?:retry|damage|cost|target)/i);
  assert.doesNotMatch(controller, /if\s*\([^)]*(?:card_id|\.id)[^)]*===/i);
});
