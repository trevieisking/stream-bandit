import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-table-v2-4-7.css'), 'utf8');

test('selected hand cards ask the live Tactic owner for playability without browser subtype rules', () => {
  assert.match(controller, /const API_TACTIC = 'tcg-tactic-actions'/);
  assert.match(controller, /actionBase\('play_tactic_legality'\)/);
  assert.match(controller, /projected\.eligible === true/);
  assert.doesNotMatch(controller, /tactic_subtype_uses_dedicated_owner/);
  assert.doesNotMatch(controller, /first_player_cannot_play_ally_on_first_turn/);
  assert.doesNotMatch(controller, /tactic_play_requirement_not_met/);
  assert.doesNotMatch(controller, /required_tactic_target_unavailable/);
  assert.doesNotMatch(controller, /required_tactic_resource_unavailable/);
  assert.doesNotMatch(controller, /subtype\s*===?\s*['"](Ally|Device|Realm|Relic)['"]/);
});

test('server eligibility exposes Play Tactic as an action on the selected hand card', () => {
  const start = controller.indexOf('function renderYourHand');
  const end = controller.indexOf('function renderPhaseControls', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /state\.tacticProjectionUid === uid && state\.tacticEligible/);
  assert.match(branch, /intent: 'play_tactic'/);
  assert.match(branch, /label: 'Play Tactic'/);
  assert.match(branch, /actions: tacticAction/);
});

test('Play Tactic commits through the existing Tactic owner and refreshes authoritative state', () => {
  const start = controller.indexOf('async function runTacticIntent');
  const end = controller.indexOf('async function runPendingChoiceIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /callEdge\(API_TACTIC/);
  assert.match(branch, /actionBase\('play_tactic'\)/);
  assert.match(branch, /card_uid: cardUid/);
  assert.match(branch, /await refreshMatch\(\)/);
});

test('generic choice panel preserves authoritative Tactic choice routing after later interaction families are added', () => {
  const helperStart = controller.indexOf('function pendingActionChoice');
  const helperEnd = controller.indexOf('function yourCreatureAt', helperStart);
  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  const helper = controller.slice(helperStart, helperEnd);
  assert.match(helper, /view\.pending_choice/);
  assert.match(helper, /view\.phase === 'effect_resolution' \? 'tactic' : 'match'/);
  assert.match(helper, /action: view\.phase === 'effect_resolution' \? 'resolve_choice'/);

  const renderStart = controller.indexOf('function renderActionChoice');
  const renderEnd = controller.indexOf('function renderRealm', renderStart);
  assert.ok(renderStart >= 0 && renderEnd > renderStart);
  const render = controller.slice(renderStart, renderEnd);
  for (const field of ['pending.min', 'pending.max', 'pending.mode', 'pending.options', 'option.id', 'option.label', 'pending.waiting']) {
    assert.match(render, new RegExp(field.replace('.', '\\.')));
  }
  assert.match(html, /id="tacticChoicePanel"/);
  assert.match(css, /\.sb-tactic-choice-option/);
});

test('Tactic-owned pending choices still submit resolve_choice to the Tactic owner', () => {
  const start = controller.indexOf('async function runPendingChoiceIntent');
  const end = controller.indexOf('async function runAbilityIntent', start);
  assert.ok(start >= 0 && end > start);
  const branch = controller.slice(start, end);
  assert.match(branch, /pendingActionChoice\(viewState\(\)\)/);
  assert.match(branch, /actionBase\(route\.action\)/);
  assert.match(branch, /choice_id: String\(pending\.id/);
  assert.match(branch, /choice_ids: choiceIds/);
  assert.match(branch, /route\.owner === 'tactic'/);
  assert.match(branch, /callEdge\(API_TACTIC/);
});

test('Tactic projection keeps precedence before generic Creature Realm fallback only when server eligible', () => {
  assert.match(controller, /const tacticMode = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode/);
  assert.match(controller, /const playHandTarget = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode && !tacticMode/);
  assert.match(controller, /runTacticPlayabilityProjection\(uid\)/);
  assert.match(controller, /actionBase\('play_creature'\)/);
  assert.match(controller, /actionBase\('play_realm'\)/);
});

test('V2.4.19 Tactic delivery remains accepted after later tabletop cache versions', () => {
  const marker = html.match(/data-sb-tcg-tabletop="v2-4-(\d+)"/);
  assert.ok(marker, 'tabletop version marker missing');
  assert.ok(Number(marker[1]) >= 19, 'tabletop must not regress below V2.4.19');
  assert.match(html, /stream-bandit-tcg-battle-table-v2-4-7\.css\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-\d+/);
  assert.match(html, /stream-bandit-tcg-card-renderer-v2-4-7\.js\?v=2-4-10/);
});
