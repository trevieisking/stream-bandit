import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const engine = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-essence-attachment-engine-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

test('existing Essence Attachment owner exposes one read-only manual target projection and final declaration validator', () => {
  assert.match(engine, /runtimeV02ListManualEssenceAttachmentTargets/);
  assert.match(engine, /runtimeV02ValidateManualEssenceAttachmentDeclaration/);
  assert.match(engine, /manual_essence_already_used_this_turn/);
  assert.match(engine, /essence_card_required/);
  assert.match(engine, /target_creature_not_found/);
});

test('attach_essence_targets is non-mutating and delegates to the existing Essence owner', () => {
  const start = match.indexOf('if(action==="attach_essence_targets")');
  const end = match.indexOf('if(action==="use_ability")', start);
  assert.ok(start >= 0 && end > start, 'attach_essence_targets action missing');
  const branch = match.slice(start, end);
  assert.match(branch, /runtimeV02ListManualEssenceAttachmentTargets/);
  assert.doesNotMatch(branch, /await commit\(/);
  assert.doesNotMatch(branch, /\.essence\.push/);
  assert.doesNotMatch(branch, /removeHand/);
});

test('structured manual attach revalidates through shared Essence legality before the attachment transaction', () => {
  const start = match.indexOf('if(action==="attach_essence")');
  const end = match.indexOf('if(action==="attach_relic")', start);
  assert.ok(start >= 0 && end > start, 'attach_essence action missing');
  const branch = match.slice(start, end);
  const validate = branch.indexOf('runtimeV02ValidateManualEssenceAttachmentDeclaration');
  const route = branch.indexOf('runtimeV02BeginExternalEssenceAttachmentRoute');
  assert.ok(validate >= 0 && route > validate, 'structured legality must precede attachment mutation route');
  const structuredEnd = branch.indexOf('if(Number(flags.manual_essence_turn', route);
  assert.ok(structuredEnd > route, 'legacy fallback boundary missing');
  const structured = branch.slice(0, structuredEnd);
  assert.doesNotMatch(structured, /d\.kind!==\"Essence\"/);
  assert.doesNotMatch(structured, /target_creature_not_found\"\},400/);
});

test('legacy unmarked Essence fallback remains present and card-specific compatibility effects stay isolated there', () => {
  const start = match.indexOf('if(action==="attach_essence")');
  const end = match.indexOf('if(action==="attach_relic")', start);
  const branch = match.slice(start, end);
  assert.match(branch, /if\(!inst\|\|!d\|\|d\.kind!==\"Essence\"\)/);
  assert.match(branch, /ember-smolder-essence/);
  assert.match(branch, /tide-puddlepip/);
});

test('manual Essence legality stays server-side when later browser transport consumes the projection', () => {
  const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
  assert.match(controller, /actionBase\('attach_essence_targets'\)/);
  assert.match(controller, /actionBase\('attach_essence'\)/);
  assert.doesNotMatch(controller, /manual_essence_turn/);
  assert.doesNotMatch(controller, /manual_essence_already_used_this_turn/);
  assert.doesNotMatch(controller, /card_family\s*===?\s*['"]Essence['"]/);
});
