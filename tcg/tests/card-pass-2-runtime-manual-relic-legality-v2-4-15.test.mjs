import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const engine = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-relic-engine-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

test('Relic owner exposes read-only projection and final declaration validation', () => {
  assert.match(engine, /export function runtimeV02ListManualRelicAttachmentTargets/);
  assert.match(engine, /export function runtimeV02ValidateManualRelicAttachmentDeclaration/);
  assert.match(engine, /card_family \|\| ""\) !== "Tactic"/);
  assert.match(engine, /tactic\?\.subtype \|\| ""\) !== "Relic"/);
  assert.match(engine, /creature\.relic == null/);
});

test('Match Actions delegates structured Relic projection and declaration legality', () => {
  assert.match(match, /action==="attach_relic_targets"/);
  assert.match(match, /runtimeV02ListManualRelicAttachmentTargets\(s,seat as 1\|2,uid\)/);
  assert.match(match, /runtimeV02ValidateManualRelicAttachmentDeclaration\(s,seat as 1\|2,uid,where,idx\)/);
  assert.match(match, /runtimeV02AttachRelicFromHand\(p,seat as 1\|2,legality\.target_creature_uid,uid\)/);
  assert.match(match, /td\?\.id==="stone-flintkin"/);
});

test('Relic legality stays server-side when the later browser transport consumes the projection', () => {
  assert.match(controller, /actionBase\('attach_relic_targets'\)/);
  assert.match(controller, /actionBase\('attach_relic'\)/);
  assert.doesNotMatch(controller, /subtype\s*===?\s*['"]Relic['"]/);
  assert.doesNotMatch(controller, /creature_already_has_relic/);
  assert.doesNotMatch(controller, /relic_card_required/);
});
