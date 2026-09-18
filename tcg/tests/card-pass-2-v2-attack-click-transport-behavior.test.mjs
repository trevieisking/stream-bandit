import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const renderer = fs.readFileSync(path.join(root, 'stream-bandit-tcg-card-renderer-v2-4-7.js'), 'utf8');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

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
    if (this.id !== 'youVanguard') return;
    const slots = [...this._innerHTML.matchAll(/data-card-intent="attack" data-attack-slot="(\d+)"/g)]
      .map((match) => Number(match[1]));
    this.document.attackButtons = slots.map((slot) => new FakeButton(slot));
  }

  get innerHTML() {
    return this._innerHTML;
  }

  replaceChildren(...children) {
    this._innerHTML = children.map((child) => String(child && child.textContent || '')).join('');
  }

  closest() {
    return null;
  }
}

function playableView(revision = 41) {
  return {
    revision,
    view_state: {
      phase: 'play',
      active_seat: 1,
      realm: null,
      you: {
        seat: 1,
        vanguard: {
          stack: [{ uid: 'starwhale-1', card_id: 'astral-starwhale' }],
          damage: 0,
          essence: [{ uid: 'essence-1' }, { uid: 'essence-2' }],
          relic: null,
          shield: 0,
          conditions: {}
        },
        reserve: [],
        hand: [],
        hand_count: 0,
        deck_count: 48,
        discard_count: 0,
        rewards_count: 6
      },
      opponent: {
        vanguard: null,
        reserve: [],
        hand_count: 0,
        deck_count: 48,
        discard_count: 0,
        rewards_count: 6
      },
      card_index: {
        'astral-starwhale': {
          definition: {
            name: 'Starwhale',
            hp: 120,
            stage: 'Creature',
            element: 'Astral'
          },
          definition_v0_2: {
            name: 'Starwhale',
            card_family: 'Creature',
            element: 'Astral',
            creature: {
              stage: 'Standalone',
              hp: 120,
              withdrawal: 1,
              ability: null,
              attacks: [{ slot: 1, name: 'Gravity Song', damage: 40 }]
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
    attackButtons: [],
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, new FakeNode(id, document));
      return nodes.get(id);
    },
    querySelectorAll(selector) {
      if (selector === '[data-card-intent="attack"]') return document.attackButtons;
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
  async function fetch(url, options) {
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
    URLSearchParams,
    setTimeout,
    clearTimeout,
    setInterval() { return 1; },
    clearInterval() {},
    console
  };

  vm.runInNewContext(renderer, context, { filename: 'stream-bandit-tcg-card-renderer-v2-4-7.js' });
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

  assert.equal(harness.document.attackButtons.length, 1, 'playable Vanguard should render one Attack control');
  await harness.document.attackButtons[0].triggerClick();

  const attackRequests = harness.requests.filter((entry) => entry.url.endsWith('/functions/v1/tcg-match-actions'));
  assert.equal(attackRequests.length, 1, 'one card click must submit exactly one Attack command');
  assert.deepEqual(
    JSON.parse(JSON.stringify(attackRequests[0].payload)),
    {
      action: 'attack',
      match_id: 'match-click-proof',
      client_nonce: 'nonce-1',
      expected_revision: 41,
      attack_slot: 1
    }
  );

  const status = harness.nodes.get('battleStatus');
  assert.equal(status.textContent, 'stale_revision', 'nested authoritative rejection must remain visible to the player');
  assert.equal(status.dataset.kind, 'error');

  const viewRequests = harness.requests.filter((entry) => entry.url.endsWith('/functions/v1/tcg-private-alpha-api'));
  assert.equal(viewRequests.length, 2, 'failed Attack must re-sync authoritative match state once after the initial load');
});
