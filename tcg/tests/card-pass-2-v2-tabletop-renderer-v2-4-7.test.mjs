import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const surface = fs.readFileSync(path.join(root, 'tcg-battle-v2.html'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'stream-bandit-tcg-card-renderer-v2-4-7.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'stream-bandit-tcg-battle-table-v2-4-7.css'), 'utf8');

test('V2.4.7 tabletop surface contains every master-plan board zone without site chrome', () => {
  for (const id of [
    'oppHand', 'oppDeck', 'oppRewards', 'oppDiscard', 'oppReserve', 'oppVanguard',
    'realmSlot', 'youVanguard', 'youReserve', 'yourDeck', 'yourRewards', 'yourDiscard', 'yourHand'
  ]) assert.match(surface, new RegExp(`id="${id}"`), `missing tabletop zone ${id}`);

  assert.match(surface, /stream-bandit-tcg-battle-table-v2-4-7\.css/);
  assert.match(surface, /stream-bandit-tcg-card-renderer-v2-4-7\.js/);
  assert.match(surface, /aria-label="One-screen battlefield"/);
  assert.doesNotMatch(surface, /stream-bandit-header-shell|stream-bandit-footer-shell/i);
  assert.match(css, /grid-template-columns:repeat\(6/);
  assert.match(css, /grid-template-columns:repeat\(4/);
});

test('one pure reusable renderer owns card presentation and no network or gameplay authority', () => {
  for (const forbidden of [
    /\bfetch\s*\(/,
    /supabase/i,
    /tcg-match-actions/i,
    /tcg-private-alpha-api/i,
    /service_role/i,
    /Math\.random\s*\(/
  ]) assert.doesNotMatch(renderer, forbidden);

  for (const cardId of [
    'gale-skyrend', 'tide-tideroar', 'volt-stormmane', 'astral-cosmarch',
    'astral-nebulynx', 'grove-myceliarch'
  ]) assert.doesNotMatch(renderer, new RegExp(cardId, 'i'), `${cardId} must not enter renderer authority`);

  assert.match(renderer, /structured\.card_family/);
  assert.match(renderer, /structured\.creature/);
  assert.match(renderer, /creature\.conditions/);
  assert.match(renderer, /Withdraw Cost/);
  assert.match(renderer, /attack\.base_damage/);
  assert.match(renderer, /attack\.damage/);
});

test('art truth is explicit and missing art is not falsely presented as approved', () => {
  const window = {};
  vm.runInNewContext(renderer, { window }, { filename: 'stream-bandit-tcg-card-renderer-v2-4-7.js' });
  const html = window.StreamBanditTCGCardRendererV247.renderKnownCard({
    instance: { uid: 'card-1', card_id: 'test-card' },
    definition: {},
    structured: {
      name: 'Test Creature',
      card_family: 'Creature',
      element: 'Astral',
      creature: {
        stage: 'Baby', hp: 50, withdrawal: 1, ability: null,
        attacks: [{ name: 'Test Attack', base_damage: 20, cost: [{ element: 'Astral', amount: 1 }] }]
      }
    },
    creature: { damage: 10, shield: 5, conditions: { Dazed: true }, essence: [], relic: null },
    actions: [{ slot: 1, attack: { name: 'Test Attack', base_damage: 20, cost: [{ element: 'Astral', amount: 1 }] }, enabled: true }],
    interactive: true,
    anchor: 'card-1',
    art: null
  });

  assert.match(html, /data-art-state="missing"/);
  assert.doesNotMatch(html, /data-art-state="approved"/);
  assert.match(html, /HP 40\/50/);
  assert.match(html, /Shield 5/);
  assert.match(html, /Withdraw Cost 1/);
  assert.match(html, /Dazed/);
  assert.match(html, /data-card-intent="attack" data-attack-slot="1"/);
  assert.match(html, /20/);
});

test('tabletop uses only authoritative public counts for opponent hidden zones', () => {
  assert.match(controller, /view\.opponent && view\.opponent\.hand_count/);
  assert.match(controller, /view\.opponent && view\.opponent\.deck_count/);
  assert.match(controller, /view\.opponent && view\.opponent\.discard_count/);
  assert.match(controller, /view\.opponent && view\.opponent\.rewards_count/);
  assert.doesNotMatch(controller, /view\.opponent\.hand\b/);
  assert.doesNotMatch(controller, /view\.opponent\.discard\b/);
  assert.match(controller, /Array\.from\(\{ length: 6 \}/);
  assert.match(controller, /renderCardBack/);
});

test('authoritative Creature attachment and visible-state projection remains generic', () => {
  assert.match(controller, /creature\.essence/);
  assert.match(controller, /creature\.relic/);
  assert.match(renderer, /creature && creature\.shield/);
  assert.match(renderer, /creature && creature\.damage/);
  assert.match(renderer, /creature && opts\.creature\.conditions/);
  assert.doesNotMatch(controller, /if\s*\([^)]*(?:card_id|\.id)[^)]*===/i);
});
