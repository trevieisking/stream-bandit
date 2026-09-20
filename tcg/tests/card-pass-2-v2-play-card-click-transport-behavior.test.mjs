import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const controller = fs.readFileSync(path.join(root, 'stream-bandit-tcg-v2-battle-controller.js'), 'utf8');

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  toggle(value, force) {
    if (force === true) { this.values.add(value); return true; }
    if (force === false) { this.values.delete(value); return false; }
    if (this.values.has(value)) { this.values.delete(value); return false; }
    this.values.add(value); return true;
  }
}

class FakeHandCard {
  constructor(uid, intent) {
    this.dataset = { playHandUid: uid, playIntent: intent };
    this.listeners = new Map();
    this.classList = new FakeClassList();
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  async click() {
    const listener = this.listeners.get('click');
    assert.equal(typeof listener, 'function', 'playable hand card must bind click');
    return listener({ target: this });
  }
}

class FakeNode {
  constructor(id, document) {
    this.id = id;
    this.document = document;
    this.dataset = {};
    this.textContent = '';
    this._innerHTML = '';
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this.hidden = false;
    this.src = '';
    this.alt = '';
    this.className = '';
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  async click() {
    const listener = this.listeners.get('click');
    assert.equal(typeof listener, 'function', this.id + ' must bind click');
    return listener({ target: { closest() { return null; } } });
  }
  set innerHTML(value) {
    this._innerHTML = String(value);
    if (this.id === 'yourHand') {
      const cards = [...this._innerHTML.matchAll(/data-play-hand-uid="([^"]+)" data-play-intent="([^"]+)"/g)];
      this.document.playHandCards = cards.map((match) => new FakeHandCard(match[1], match[2]));
    }
  }
  get innerHTML() { return this._innerHTML; }
}

function playableView(revision = 17) {
  return {
    revision,
    view_state: {
      phase: 'play',
      active_seat: 1,
      personal_turns: { '1': 2, '2': 1 },
      you: {
        seat: 1,
        vanguard: {
          stack: [{ uid: 'starwhale-1', card_id: 'astral-starwhale' }],
          damage: 0,
          essence: [],
          shield: 0,
          relic: null
        },
        reserve: [null, null, null, null],
        hand: [{ uid: 'essence-hand-1', card_id: 'astral-cosmic-essence' }],
        discard: [],
        rewards_count: 6,
        deck_count: 52,
        mulligans: 0
      },
      opponent: {
        seat: 2,
        vanguard: null,
        reserve: [null, null, null, null],
        hand_count: 7,
        deck_count: 53,
        discard_count: 0,
        rewards_count: 6
      },
      card_index: {
        'astral-starwhale': {
          definition: {
            id: 'astral-starwhale',
            name: 'Starwhale',
            kind: 'Creature',
            stage: 'Standalone',
            hp: 120,
            element: 'Astral'
          },
          definition_v0_2: { creature: { attacks: [] } }
        },
        'astral-cosmic-essence': {
          definition: {
            id: 'astral-cosmic-essence',
            name: 'Cosmic Essence',
            kind: 'Essence',
            card_family: 'Essence',
            element: 'Astral'
          }
        }
      }
    }
  };
}

function makeHarness() {
  const nodes = new Map();
  const document = {
    playHandCards: [],
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, new FakeNode(id, document));
      return nodes.get(id);
    },
    querySelectorAll(selector) {
      if (selector === '[data-play-hand-uid]') return document.playHandCards;
      if (selector === '[data-play-where]') {
        return [...nodes.values()].filter((node) => node.dataset && node.dataset.playWhere);
      }
      return [];
    }
  };

  let domReady = null;
  const requests = [];
  const session = { access_token: 'test-token' };
  const client = {
    auth: {
      async getSession() { return { data: { session } }; }
    }
  };

  const window = {
    location: { search: '?match_id=match-play-bind-proof', href: 'https://example.test/tcg-battle-v2.html' },
    StreamBanditShell: {
      config() { return { url: 'https://example.supabase.co', key: 'anon-key' }; }
    },
    StreamBanditAuthGate: {
      async enforce() { return { allowed: true }; }
    },
    supabase: {
      createClient() { return client; }
    },
    addEventListener(type, listener) {
      if (type === 'DOMContentLoaded') domReady = listener;
    }
  };

  let viewCalls = 0;
  async function fetch(url, options) {
    const payload = JSON.parse(options.body || '{}');
    requests.push({ url: String(url), payload });

    if (String(url).endsWith('/functions/v1/tcg-private-alpha-api')) {
      viewCalls += 1;
      return {
        ok: true,
        status: 200,
        async json() { return { ok: true, view: playableView(17) }; }
      };
    }

    if (String(url).endsWith('/functions/v1/tcg-match-actions')) {
      return {
        ok: true,
        status: 200,
        async json() { return { ok: true, result: { ok: false, error: 'stale_revision' } }; }
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

  vm.runInNewContext(controller, context, { filename: 'stream-bandit-tcg-v2-battle-controller.js' });
  assert.equal(typeof domReady, 'function');

  return {
    document,
    nodes,
    requests,
    async boot() { await domReady(); }
  };
}

test('play-phase Essence click then Vanguard click submits authoritative attach_essence payload', async () => {
  const harness = makeHarness();
  await harness.boot();

  assert.equal(harness.document.playHandCards.length, 1, 'Essence in hand must become a playable hand control');
  assert.equal(harness.document.playHandCards[0].dataset.playIntent, 'attach_essence');

  await harness.document.playHandCards[0].click();

  const vanguardSlot = harness.nodes.get('youVanguardSlot');
  assert.equal(vanguardSlot.dataset.playWhere, 'vanguard');
  assert.equal(vanguardSlot.classList.values.has('is-play-legal'), true, 'selected Essence must highlight own Vanguard as a candidate');

  await vanguardSlot.click();

  const matchRequests = harness.requests.filter((entry) => entry.url.endsWith('/functions/v1/tcg-match-actions'));
  assert.equal(matchRequests.length, 1, 'one target click must submit exactly one match command');
  assert.deepEqual(
    JSON.parse(JSON.stringify(matchRequests[0].payload)),
    {
      action: 'attach_essence',
      match_id: 'match-play-bind-proof',
      client_nonce: 'nonce-1',
      expected_revision: 17,
      card_uid: 'essence-hand-1',
      where: 'vanguard'
    }
  );

  const status = harness.nodes.get('battleStatus');
  assert.equal(status.textContent, 'stale_revision', 'authoritative rejection must remain visible after the attempted play');
  assert.equal(status.dataset.kind, 'error');

  const viewRequests = harness.requests.filter((entry) => entry.url.endsWith('/functions/v1/tcg-private-alpha-api'));
  assert.equal(viewRequests.length, 2, 'failed hand play must re-sync the authoritative match view');
});
