(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG Play Controller V2.4.27';
  const API_SETUP = 'tcg-private-alpha-api';
  const POLL_MS = 2000;
  const state = {
    client: null,
    session: null,
    queueTimer: null,
    queueBusy: false,
    selectedDeckId: ''
  };

  const $ = (id) => document.getElementById(id);

  function shellConfig() {
    try {
      if (window.StreamBanditShell && typeof window.StreamBanditShell.config === 'function') {
        const config = window.StreamBanditShell.config();
        if (config && config.url && config.key) return config;
      }
    } catch (_) {}
    const config = window.StreamBanditSupabaseConfig || window.StreamBanditShellConfig || {};
    return {
      url: window.SUPABASE_URL || config.url || '',
      key: window.SUPABASE_KEY || config.key || config.anonKey || config.anon_key || ''
    };
  }

  function setStatus(message, kind) {
    const node = $('tcgPlayStatus');
    if (!node) return;
    node.textContent = message;
    node.className = 'tcg-state' + (kind === 'ok' ? ' ok' : '');
  }

  async function waitForGate() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (window.StreamBanditAuthGate && typeof window.StreamBanditAuthGate.enforce === 'function') return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  async function ensureClient() {
    if (state.client && state.session) return state.client;
    if (!(await waitForGate())) throw new Error('Stream Bandit auth gate is unavailable.');
    const decision = await window.StreamBanditAuthGate.enforce();
    if (!decision || !decision.allowed) throw new Error('Sign in with an approved Stream Bandit account to play.');
    const config = shellConfig();
    if (!config.url || !config.key) throw new Error('Supabase public configuration is unavailable.');
    state.client = window.supabase.createClient(config.url, config.key);
    const result = await state.client.auth.getSession();
    state.session = result.data && result.data.session ? result.data.session : null;
    if (!state.session) throw new Error('A signed-in session is required.');
    return state.client;
  }

  async function refreshSession() {
    const client = await ensureClient();
    const result = await client.auth.getSession();
    state.session = result.data && result.data.session ? result.data.session : null;
    if (!state.session) throw new Error('Session expired. Sign in again.');
    return state.session;
  }

  function endpoint(slug) {
    return String(shellConfig().url || '').replace(/\/$/, '') + '/functions/v1/' + slug;
  }

  function serverError(data, fallback) {
    const nested = data && data.result && typeof data.result === 'object' ? data.result : null;
    const rejected = data && data.ok === false ? data : (nested && nested.ok === false ? nested : null);
    if (!rejected) return fallback;
    const validation = rejected.validation && Array.isArray(rejected.validation.errors)
      ? rejected.validation.errors.filter(Boolean).join(', ')
      : '';
    return String(rejected.error || fallback) + (validation ? ': ' + validation : '');
  }

  async function callSetup(payload) {
    const session = await refreshSession();
    const config = shellConfig();
    const response = await fetch(endpoint(API_SETUP), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token,
        apikey: config.key
      },
      body: JSON.stringify(payload)
    });
    let data = {};
    try { data = await response.json(); } catch (_) { data = { ok: false, error: 'non_json_edge_response' }; }
    const nested = data && data.result && typeof data.result === 'object' ? data.result : null;
    if (!response.ok || (data && data.ok === false) || (nested && nested.ok === false)) {
      throw new Error(serverError(data, 'request_failed'));
    }
    return data;
  }

  function option(select, value, label) {
    const node = document.createElement('option');
    node.value = value;
    node.textContent = label;
    select.appendChild(node);
  }

  function setMatchControls(enabled) {
    const select = $('tcgDeckSelect');
    const button = $('tcgQuickMatch');
    if (select) select.disabled = !enabled;
    if (button) button.disabled = !enabled || !String(select && select.value || '').trim();
  }

  async function loadStarters() {
    const client = await ensureClient();
    const panel = $('tcgStarterPanel');
    const select = $('tcgStarterSelect');
    const button = $('tcgClaimStarter');
    if (!panel || !select || !button) return;
    panel.hidden = false;
    select.disabled = true;
    button.disabled = true;
    select.innerHTML = '';
    option(select, '', 'Choose a starter…');

    const { data, error } = await client
      .from('tcg_starter_decks')
      .select('starter_id,element,name,deck_size')
      .eq('is_active', true)
      .order('element', { ascending: true });
    if (error) throw error;

    for (const starter of data || []) {
      option(select, String(starter.starter_id || ''), String(starter.element || '') + ' — ' + String(starter.name || starter.starter_id || 'Starter'));
    }
    select.disabled = !(data && data.length);
    button.disabled = true;
    select.onchange = () => { button.disabled = !String(select.value || '').trim(); };
  }

  async function loadDecks(preferredDeckId) {
    const client = await ensureClient();
    const select = $('tcgDeckSelect');
    const starterPanel = $('tcgStarterPanel');
    if (!select) return;

    select.disabled = true;
    select.innerHTML = '';
    option(select, '', 'Loading your decks…');

    const { data, error } = await client
      .from('tcg_decks')
      .select('id,name,primary_element,secondary_element,starter_id,rules_version,updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;

    select.innerHTML = '';
    if (!data || !data.length) {
      option(select, '', 'No owned deck yet');
      if (starterPanel) starterPanel.hidden = false;
      setMatchControls(false);
      setStatus('Choose a starter deck before entering Quick Match.');
      await loadStarters();
      return;
    }

    option(select, '', 'Choose a deck…');
    for (const deck of data) {
      const elements = deck.secondary_element
        ? String(deck.primary_element) + ' / ' + String(deck.secondary_element)
        : String(deck.primary_element || 'Unknown');
      option(select, String(deck.id), String(deck.name || 'Deck') + ' · ' + elements);
    }

    const preferred = String(preferredDeckId || '').trim();
    if (preferred && data.some((deck) => String(deck.id) === preferred)) select.value = preferred;
    if (!select.value && data.length === 1) select.value = String(data[0].id);

    state.selectedDeckId = String(select.value || '');
    select.disabled = false;
    select.onchange = () => {
      state.selectedDeckId = String(select.value || '');
      const button = $('tcgQuickMatch');
      if (button) button.disabled = !state.selectedDeckId || state.queueBusy;
    };
    if (starterPanel) starterPanel.hidden = true;
    setMatchControls(true);
    setStatus('Choose your deck, then find an opponent.', 'ok');
  }

  async function claimStarter() {
    const select = $('tcgStarterSelect');
    const button = $('tcgClaimStarter');
    const starterId = String(select && select.value || '').trim();
    if (!starterId || !button) return;

    button.disabled = true;
    setStatus('Granting your starter deck through the server owner…');
    try {
      const data = await callSetup({ action: 'choose_starter', starter_id: starterId });
      const result = data && data.result && typeof data.result === 'object' ? data.result : {};
      const deckId = String(result.deck_id || '').trim();
      await loadDecks(deckId);
      setStatus('Starter ready. You can enter Quick Match now.', 'ok');
    } catch (error) {
      setStatus('Starter grant failed: ' + (error && error.message ? error.message : String(error)));
      button.disabled = false;
    }
  }

  function matchIdFrom(data) {
    const result = data && data.result && typeof data.result === 'object' ? data.result : {};
    const match = data && data.match && typeof data.match === 'object' ? data.match : {};
    return String(match.match_id || result.match_id || '').trim();
  }

  function openBattle(matchId) {
    if (!matchId) throw new Error('paired_match_missing_match_id');
    const url = new URL('tcg-battle-v2.html', window.location.href);
    url.search = '';
    url.searchParams.set('match_id', matchId);
    window.location.assign(url.toString());
  }

  async function queueTick(deckId) {
    if (!state.queueBusy) return;
    try {
      const data = await callSetup({ action: 'matchmake', deck_id: deckId });
      const result = data && data.result && typeof data.result === 'object' ? data.result : {};
      const matchId = matchIdFrom(data);
      if (result.paired === true || result.state === 'matched' || matchId) {
        setStatus('Opponent found. Opening the authoritative battle…', 'ok');
        state.queueBusy = false;
        openBattle(matchId);
        return;
      }
      setStatus('Waiting for an opponent… Keep this page open. The server queue remains authoritative.', 'ok');
      state.queueTimer = window.setTimeout(() => queueTick(deckId), POLL_MS);
    } catch (error) {
      state.queueBusy = false;
      setMatchControls(true);
      setStatus('Quick Match failed: ' + (error && error.message ? error.message : String(error)));
    }
  }

  async function startMatchmaking() {
    const select = $('tcgDeckSelect');
    const deckId = String(select && select.value || '').trim();
    if (!deckId || state.queueBusy) return;
    state.selectedDeckId = deckId;
    state.queueBusy = true;
    setMatchControls(false);
    setStatus('Entering the server Quick Match queue…');
    await queueTick(deckId);
  }

  async function boot() {
    const button = $('tcgQuickMatch');
    const starterButton = $('tcgClaimStarter');
    if (button) button.addEventListener('click', startMatchmaking);
    if (starterButton) starterButton.addEventListener('click', claimStarter);
    try {
      await ensureClient();
      await loadDecks('');
    } catch (error) {
      setMatchControls(false);
      setStatus(VERSION + ' could not start: ' + (error && error.message ? error.message : String(error)));
    }
  }

  window.addEventListener('beforeunload', () => {
    if (state.queueTimer) window.clearTimeout(state.queueTimer);
    state.queueBusy = false;
  });
  window.addEventListener('DOMContentLoaded', boot);
})();
