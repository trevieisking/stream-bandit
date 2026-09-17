(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG V2 Battle Controller v0.2';
  const API_SETUP = 'tcg-private-alpha-api';
  const API_MATCH = 'tcg-match-actions';
  const state = {
    client: null,
    session: null,
    matchId: '',
    view: null,
    selectedAnchorUid: '',
    busy: false,
    poll: null
  };

  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function setStatus(message, kind) {
    const node = $('battleStatus');
    if (!node) return;
    node.dataset.kind = kind || 'info';
    node.textContent = message;
  }

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

  async function waitForGate() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (window.StreamBanditAuthGate && typeof window.StreamBanditAuthGate.enforce === 'function') return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  async function ensureClient() {
    if (state.client) return state.client;
    if (!(await waitForGate())) throw new Error('Stream Bandit auth gate is unavailable.');
    const decision = await window.StreamBanditAuthGate.enforce();
    if (!decision || !decision.allowed) throw new Error('Sign in with an approved Stream Bandit account to battle.');
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

  async function callEdge(slug, payload) {
    const session = await refreshSession();
    const config = shellConfig();
    const response = await fetch(endpoint(slug), {
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
    const nestedResult = data && data.result && typeof data.result === 'object' ? data.result : null;
    const rejected = data && data.ok === false ? data : (nestedResult && nestedResult.ok === false ? nestedResult : null);
    if (!response.ok || rejected) throw new Error((rejected && rejected.error) || data.error || ('HTTP ' + response.status));
    return data;
  }

  function viewState() {
    return state.view && state.view.view_state ? state.view.view_state : null;
  }

  function revision() {
    return state.view ? Number(state.view.revision || 0) : 0;
  }

  function actionBase(action) {
    return {
      action,
      match_id: state.matchId,
      client_nonce: crypto.randomUUID(),
      expected_revision: revision()
    };
  }

  function cardRow(instance) {
    const view = viewState();
    if (!view || !instance) return null;
    return view.card_index && view.card_index[instance.card_id] ? view.card_index[instance.card_id] : null;
  }

  function legacyDefinition(instance) {
    const row = cardRow(instance);
    return row ? (row.definition || row) : null;
  }

  function structuredDefinition(instance) {
    const row = cardRow(instance);
    return row && row.definition_v0_2 ? row.definition_v0_2 : null;
  }

  function topInstance(creature) {
    return creature && Array.isArray(creature.stack) && creature.stack.length
      ? creature.stack[creature.stack.length - 1]
      : null;
  }

  function topDefinition(creature) {
    return legacyDefinition(topInstance(creature)) || {};
  }

  function cardAnchor(creature) {
    const instance = topInstance(creature);
    return instance ? String(instance.uid || '') : '';
  }

  function attackSlots(creature) {
    const structured = structuredDefinition(topInstance(creature));
    const attacks = structured && structured.creature && Array.isArray(structured.creature.attacks)
      ? structured.creature.attacks
      : [];
    return attacks.map((attack, index) => ({
      slot: Number(attack.slot || index + 1),
      name: String(attack.name || ('Attack ' + (index + 1))),
      damage: Number.isFinite(Number(attack.damage)) ? Number(attack.damage) : null
    })).filter((attack) => attack.slot === 1 || attack.slot === 2);
  }

  function creatureCard(creature, options) {
    const opts = options || {};
    if (!creature) return '<div class="sb-zone-empty">Empty</div>';
    const definition = topDefinition(creature);
    const anchor = cardAnchor(creature);
    const maxHp = Math.max(0, Number(definition.hp || 0));
    const damage = Math.max(0, Number(creature.damage || 0));
    const remaining = Math.max(0, maxHp - damage);
    const selected = opts.primary && anchor && state.selectedAnchorUid === anchor;
    const attacks = opts.primary ? attackSlots(creature) : [];
    const canAct = !!opts.canAct;
    const actionRows = attacks.map((attack) => (
      '<button type="button" class="sb-card-action" data-card-intent="attack" data-attack-slot="' + attack.slot + '"' +
      (canAct ? '' : ' disabled') + '>' +
      '<span><strong>' + esc(attack.name) + '</strong><small>Attack ' + attack.slot + '</small></span>' +
      '<span class="sb-damage">' + (attack.damage == null ? '—' : esc(attack.damage)) + '</span>' +
      '</button>'
    )).join('');
    return '<article class="sb-card-control' + (selected ? ' is-selected' : '') + (opts.primary ? ' is-primary' : '') + '"' +
      (opts.primary ? ' tabindex="0" role="button" aria-pressed="' + (selected ? 'true' : 'false') + '" data-card-anchor="' + esc(anchor) + '"' : '') + '>' +
      '<header><span class="sb-stage">' + esc(definition.stage || definition.kind || 'Creature') + '</span><span class="sb-element">' + esc(definition.element || '') + '</span></header>' +
      '<h2>' + esc(definition.name || topInstance(creature)?.card_id || 'Creature') + '</h2>' +
      '<div class="sb-card-art" aria-hidden="true">🎴</div>' +
      '<div class="sb-hp"><strong>HP ' + esc(remaining) + '/' + esc(maxHp) + '</strong><span>Damage ' + esc(damage) + '</span></div>' +
      '<div class="sb-card-meta"><span>Essence ' + esc((creature.essence || []).length) + '</span><span>Shield ' + esc(creature.shield || 0) + '</span></div>' +
      (opts.primary ? '<div class="sb-card-hint">' + (selected ? 'Choose an action on this card' : 'Tap/select this card') + '</div><div class="sb-card-actions">' + actionRows + '</div>' : '') +
      '</article>';
  }

  function handCard(instance) {
    const definition = legacyDefinition(instance) || {};
    return '<article class="sb-hand-card"><strong>' + esc(definition.name || instance.card_id) + '</strong><small>' +
      esc(definition.card_family || definition.kind || '') + '</small></article>';
  }

  function renderReserve(target, reserve, ownerLabel) {
    const node = $(target);
    if (!node) return;
    node.innerHTML = [0, 1, 2, 3].map((index) => '<section class="sb-reserve-slot"><span>' + esc(ownerLabel) + ' Reserve ' + (index + 1) + '</span>' + creatureCard(reserve && reserve[index], {}) + '</section>').join('');
  }

  function render() {
    const view = viewState();
    if (!view) return;
    const yourTurn = view.phase === 'play' && Number(view.active_seat) === Number(view.you && view.you.seat);
    const pending = !!(view.pending_attack_choice || view.pending_ability_choice || view.pending_event_listener_choice || view.pending_movement_listener_choice || view.pending_heal_listener_choice || view.pending_choice || view.pending_resolution);
    const canAttack = yourTurn && !pending && !state.busy;

    $('oppVanguard').innerHTML = creatureCard(view.opponent && view.opponent.vanguard, {});
    $('youVanguard').innerHTML = creatureCard(view.you && view.you.vanguard, { primary: true, canAct: canAttack });
    renderReserve('oppReserve', view.opponent && view.opponent.reserve, 'Opponent');
    renderReserve('youReserve', view.you && view.you.reserve, 'Your');
    $('yourHand').innerHTML = (view.you && Array.isArray(view.you.hand) ? view.you.hand : []).map(handCard).join('') || '<div class="sb-zone-empty">No cards in hand</div>';
    $('turnPill').textContent = view.phase === 'complete' ? 'Match complete' : (yourTurn ? 'Your turn' : 'Opponent turn');
    $('revisionPill').textContent = 'Revision ' + revision();
    $('phasePill').textContent = String(view.phase || '—');

    if (pending) setStatus('The board is authoritative. Resolve the pending server choice before another card action.', 'wait');
    else if (yourTurn) setStatus('Your turn. Select your active Creature card; its legal card actions stay on the card face.', 'ready');
    else setStatus('Board synced. Waiting for the opponent or the next server phase.', 'wait');

    bindCardControls();
  }

  function bindCardControls() {
    document.querySelectorAll('[data-card-anchor]').forEach((card) => {
      const select = () => {
        if (state.busy) return;
        const anchor = String(card.dataset.cardAnchor || '');
        state.selectedAnchorUid = state.selectedAnchorUid === anchor ? '' : anchor;
        render();
      };
      card.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-intent]')) return;
        select();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });
    document.querySelectorAll('[data-card-intent="attack"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        await runAttackIntent(Number(button.dataset.attackSlot));
      });
    });
  }

  async function runAttackIntent(attackSlot) {
    if (attackSlot !== 1 && attackSlot !== 2) throw new Error('Invalid attack slot.');
    state.busy = true;
    render();
    setStatus('Submitting card attack to the authoritative match engine…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('attack'), { attack_slot: attackSlot }));
      await refreshMatch();
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      await refreshMatch().catch(() => {});
    } finally {
      state.busy = false;
      render();
      if (failure) setStatus(failure, 'error');
    }
  }

  async function refreshMatch() {
    if (!state.matchId) throw new Error('No match id was supplied by the battle route.');
    const response = await callEdge(API_SETUP, { action: 'match_view', match_id: state.matchId });
    state.view = response.view || response.result || null;
    if (!state.view) throw new Error('The authoritative match view was not returned.');
    const view = viewState();
    if (state.selectedAnchorUid && view && view.you && cardAnchor(view.you.vanguard) !== state.selectedAnchorUid) state.selectedAnchorUid = '';
    render();
  }

  function startPoll() {
    if (state.poll) clearInterval(state.poll);
    state.poll = setInterval(() => {
      if (!state.busy) refreshMatch().catch((error) => setStatus(error instanceof Error ? error.message : String(error), 'error'));
    }, 3000);
  }

  async function boot() {
    try {
      state.matchId = new URLSearchParams(window.location.search).get('match_id') || '';
      $('controllerVersion').textContent = VERSION;
      if (!state.matchId) throw new Error('Open this battle surface from a match route containing ?match_id=<id>.');
      await ensureClient();
      await refreshMatch();
      startPoll();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error), 'error');
    }
  }

  window.StreamBanditTCGV2BattleController = Object.freeze({
    version: VERSION,
    refresh: refreshMatch
  });

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
