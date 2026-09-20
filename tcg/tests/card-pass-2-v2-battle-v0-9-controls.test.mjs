import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('tcg-battle-v2.html', 'utf8');
const controller = fs.readFileSync('stream-bandit-tcg-v2-battle-controller.js', 'utf8');
const matchActions = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const attackAuthority = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-authority-v0-2.ts', 'utf8');
const attackMetadata = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-v0-2.ts', 'utf8');

test('Battle v0.9 preserves accepted geometry while adding compact controls', () => {
  assert.match(html, /data-sb-tcg-battle-layout="tabletop-v0-7"/);
  assert.match(html, /data-sb-tcg-play-bindings="v0-8"/);
  assert.match(html, /data-sb-tcg-battle-controls="v0-9"/);
  assert.match(html, /id="battleMenuButton"/);
  assert.match(html, /id="quitMatchButton"/);
  assert.match(html, /id="quitMatchConfirm"/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=0-9/);
  assert.match(controller, /Stream Bandit TCG V2 Battle Controller v0\.9/);
});

test('Quit Match delegates only to the canonical concede owner', () => {
  assert.match(controller, /await callEdge\(API_MATCH, actionBase\('concede'\)\)/);
  assert.match(controller, /window\.location\.href = 'tcg-play\.html'/);
  assert.match(matchActions, /if\(action==="concede"\)/);
  assert.match(matchActions, /s\.phase="complete"/);
  assert.match(matchActions, /winner_seat:otherSeat/);
  assert.match(matchActions, /reasons:\["opponent_conceded"\]/);
  assert.match(matchActions, /commit\("concede",\{seat,winner_seat:otherSeat\}\)/);
});

test('ordinary close or reload never forfeits the match', () => {
  assert.doesNotMatch(controller, /beforeunload/);
  assert.doesNotMatch(controller, /unload[\s\S]{0,500}concede/i);
  assert.match(html, /Closing or reloading the page does not end this match/);
  assert.match(html, /Quitting ends the match immediately\. You lose and your opponent wins\./);
});

test('phone interaction is tap-first and does not require drag/drop', () => {
  assert.match(controller, /function touchPrimaryInput\(\)/);
  assert.match(controller, /draggable="' \+ \(touchPrimaryInput\(\) \? 'false' : 'true'\)/);
  assert.match(controller, /Tap card → read details → tap the glowing destination\. No dragging needed\./);
  assert.match(controller, /Dragging is not required/);
  assert.match(controller, /await runPlayHandTarget\(where, index\)/);
});

test('Attack presentation reads canonical v0.2 cost and baseline damage', () => {
  assert.match(controller, /function formatAttackCost\(attack\)/);
  assert.match(controller, /attack\.base_damage/);
  assert.match(controller, /attack\.damage_formula/);
  assert.match(controller, /formula\.base/);
  assert.match(controller, /attack\.cost/);
  assert.match(controller, /Essence ·/);
  assert.match(controller, /DMG/);
  assert.match(controller, /ends turn/);
});

test('player errors are translated while raw server code stays available for diagnostics', () => {
  assert.match(controller, /function friendlyErrorMessage\(message\)/);
  assert.match(controller, /manual_essence_already_used_this_turn/);
  assert.match(controller, /You can manually attach only 1 Essence each turn\./);
  assert.match(controller, /attack_essence_cost_not_met/);
  assert.match(controller, /node\.dataset\.errorCode = raw/);
  assert.match(controller, /That action could not be completed\. Try another legal move\./);
});

test('selected card explanation comes only from canonical card data', () => {
  assert.match(controller, /function selectedHandSummary\(\)/);
  assert.match(controller, /structuredDefinition\(instance\)/);
  assert.match(controller, /Evolves from/);
  assert.match(controller, /Ability:/);
  assert.match(controller, /Attacks:/);
  assert.match(controller, /Manual attachment: once per turn/);
  assert.doesNotMatch(controller, /if\s*\([^)]*(?:gloom-tap|shade-gloamkin|noctivane)/i);
});

test('structured-only attack bridge remains generic and fail-closed for unresolved effect windows', () => {
  assert.match(attackMetadata, /legacy_compatibility_required: boolean/);
  assert.match(attackMetadata, /effectWindows = \[attack\.on_declare, attack\.before_damage, attack\.after_damage\]/);
  assert.match(attackMetadata, /window\.length === 0/);
  assert.match(attackAuthority, /!legacy && structured\.legacy_compatibility_required/);
  assert.match(attackAuthority, /legacy\?\.raw \|\| ""/);
  assert.match(attackAuthority, /legacy\?\.effect \|\| ""/);
  assert.doesNotMatch(attackAuthority, /gloom-tap|shade-gloamkin/i);
});
