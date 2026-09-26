import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');
const cardRenderer = fs.readFileSync(path.join(root, 'stream-bandit-tcg-card-renderer-v2-4-51.js'), 'utf8');
const displayRegistry = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'tcg', 'cards', 'set-one', 'tcg-card-display-registry-v1.json'), 'utf8'));

class FakeFieldCard {
  constructor() {
    this.dataset = {
      inspectFieldOwner: 'you',
      inspectFieldWhere: 'vanguard',
      inspectFieldIndex: '',
      cardAnchor: 'stardot-1'
    };
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  async triggerClick() {
    const listener = this.listeners.get('click');
    assert.equal(typeof listener, 'function', 'compact Vanguard must bind inspect click');
    return listener({ target: { closest() { return null; } } });
  }
}

class FakeButton {
  constructor(slot) {
    this.dataset = { attackSlot: String(slot) };
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  async triggerClick() {
    const listener = this.listeners.get('click');
    assert.equal(typeof listener, 'function', 'rendered Attack control must bind a click listener');
    return listener({ stopPropagation() {} });
  }
}

class FakeNode {
  constructor(id, document) {
    this.id = id;
    this.document = document;
    this.dataset = {};
    this.textContent = '';
    this._innerHTML = '';
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    if (this.id === 'youVanguard') {
      this.document.fieldCards = this._innerHTML.includes('data-inspect-field-owner="you"')
        ? [new FakeFieldCard()]
        : [];
    }
    if (this.id === 'cardInspector') {
      const slots = [...this._innerHTML.matchAll(/data-card-intent="attack" data-attack-slot="(\d+)"/g)]
        .map((match) => Number(match[1]));
      this.document.attackButtons = slots.map((slot) => new FakeButton(slot));
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

function playableView(revision = 41) {
  return {
    revision,
    view_state: {
      phase: 'play',
      active_seat: 1,
      you: {
        seat: 1,
        vanguard: {
          stack: [{ uid: 'stardot-1', card_id: 'astral-stardot' }],
          damage: 0,
          essence: [{ uid: 'essence-1' }, { uid: 'essence-2' }],
          shield: 0
        },
        reserve: [],
        hand: []
      },
      opponent: { vanguard: null, reserve: [] },
      card_index: {
        'astral-stardot': {
          definition: {
            name: 'Stardot',
            hp: 50,
            stage: 'Baby',
            element: 'Astral'
          },
          definition_v0_2: {
            card_family: 'Creature',
            creature: {
              hp: 50,
              attacks: [{ id: 'star-ping', name: 'Star Ping', cost: [{ element: 'Astral', amount: 1 }], base_damage: 20, damage_formula: null, requirements: [], on_declare: [], before_damage: [], after_damage: [] }]
            }
          }
        }
      }
    }
  };
}

function makeHarness() {
  const nodes = new Map();
  const document = {
    baseURI: 'https://example.test/tcg-battle-v2.html',
    attackButtons: [],
    fieldCards: [],
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, new FakeNode(id, document));
      return nodes.get(id);
    },
    querySelectorAll(selector) {
      if (selector === '[data-card-intent="attack"]') return document.attackButtons;
      if (selector === '[data-inspect-field-owner]') return document.fieldCards;
      if (selector === '[data-card-anchor]') return [];
      return [];
    }
  };

  let domReady = null;
  const requests = [];
  const session = { access_token: 'test-token' };
  const client = {
    auth: {
      async getSession() {
        return { data: { session } };
      }
    }
  };

  const window = {
    location: { search: '?match_id=match-click-proof' },
    StreamBanditShell: {
      config() {
        return { url: 'https://example.supabase.co', key: 'anon-key' };
      }
    },
    StreamBanditAuthGate: {
      async enforce() {
        return { allowed: true };
      }
    },
    supabase: {
      createClient() {
        return client;
      }
    },
    addEventListener(type, listener) {
      if (type === 'DOMContentLoaded') domReady = listener;
    }
  };

  let matchViewCalls = 0;
  async function fetch(url, options = {}) {
    if (String(url).endsWith('/assets/tcg/cards/set-one/tcg-card-display-registry-v1.json')) {
      return { ok: true, status: 200, async json() { return displayRegistry; } };
    }
    const payload = JSON.parse(options.body || '{}');
    requests.push({ url: String(url), options, payload });

    if (String(url).endsWith('/functions/v1/tcg-private-alpha-api')) {
      matchViewCalls += 1;
      return {
        ok: true,
        status: 200,
        async json() {
          return { ok: true, view: playableView(matchViewCalls === 1 ? 41 : 41) };
        }
      };
    }

    if (String(url).endsWith('/functions/v1/tcg-match-actions')) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { ok: true, result: { ok: false, error: 'stale_revision' } };
        }
      };
    }

    throw new Error('Unexpected fetch: ' + url);
  }

  let nonceCounter = 0;
  const context = {
    window,
    document,
    fetch,
    crypto: {
      randomUUID() {
        nonceCounter += 1;
        return 'nonce-' + nonceCounter;
      }
    },
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
    setInterval() { return 1; },
    clearInterval() {},
    console
  };

  vm.runInNewContext(cardRenderer, context, { filename: 'stream-bandit-tcg-card-renderer-v2-4-51.js' });
  vm.runInNewContext(controller, context, { filename: 'stream-bandit-tcg-v2-battle-controller.js' });
  assert.equal(typeof domReady, 'function', 'controller must register its DOMContentLoaded boot');

  return {
    document,
    nodes,
    requests,
    async boot() { await domReady(); }
  };
}

test('rendered V2 card Attack click posts authoritative Attack payload and surfaces nested rejection', async () => {
  const harness = makeHarness();
  await harness.boot();

  assert.equal(harness.document.attackButtons.length, 0, 'compact Vanguard must not permanently consume board space with Attack rows');
  assert.equal(harness.document.fieldCards.length, 1, 'compact Vanguard must remain inspectable');
  await harness.document.fieldCards[0].triggerClick();
  assert.equal(harness.document.attackButtons.length, 1, 'full inspector must render the authoritative Attack control');
  await harness.document.attackButtons[0].triggerClick();

  const attackRequests = harness.requests.filter((entry) =>
    entry.url.endsWith('/functions/v1/tcg-match-actions') && entry.payload.action === 'attack'
  );
  assert.equal(attackRequests.length, 1, 'one card click must submit exactly one Attack command');
  assert.deepEqual(
    JSON.parse(JSON.stringify(attackRequests[0].payload)),
    {
      action: 'attack',
      match_id: 'match-click-proof',
      client_nonce: 'nonce-2',
      expected_revision: 41,
      attack_slot: 1
    }
  );

  const status = harness.nodes.get('battleStatus');
  assert.equal(status.textContent, 'The board changed before that action completed. The latest state has been refreshed.', 'nested authoritative rejection must become useful player guidance');
  assert.equal(status.dataset.kind, 'error');
  assert.equal(status.dataset.errorCode, 'stale_revision', 'raw server code remains available for diagnostics');

  const viewRequests = harness.requests.filter((entry) => entry.url.endsWith('/functions/v1/tcg-private-alpha-api'));
  assert.equal(viewRequests.length, 2, 'failed Attack must re-sync authoritative match state once after the initial load');
});


test('blocked Attack remains inspectable, explains insufficient Essence, and never disguises resolution timing', () => {
  assert.match(cardRenderer, /data-attack-blocked-reason=/);
  assert.match(cardRenderer, /Needs more matching Essence/);
  assert.match(cardRenderer, /Turn ends after full resolution/);
  assert.match(controller, /Attack blocked —/);
  assert.match(controller, /Attach more matching Essence until the Attack cost orbs are covered/);
  assert.match(controller, /if \(blockedReason\) \{[\s\S]*?setStatus\([\s\S]*?return;[\s\S]*?\}[\s\S]*?await runAttackIntent/);
});
