(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG V2 Battle Controller v0.2 / Tabletop V2.4.8';
  const API_SETUP = 'tcg-private-alpha-api';
  const API_MATCH = 'tcg-match-actions';
  const state = {
    client: null,
    session: null,
    matchId: '',
    view: null,
    selectedAnchorUid: '',
    selectedHandUid: '',
    busy: false,
    poll: null
  };

  const $ = (id) => document.getElementById(id);

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

  function renderer() {
    const value = window.StreamBanditTCGCardRendererV247;
    if (!value || typeof value.renderKnownCard !== 'function' || typeof value.renderCardBack !== 'function') {
      throw new Error('TCG card renderer V2.4.7 is unavailable.');
    }
    return value;
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
      attack,
      name: String(attack.name || ('Attack ' + (index + 1)))
    })).filter((attack) => attack.slot === 1 || attack.slot === 2);
  }

  function attachmentDescriptors(creature) {
    if (!creature) return [];
    const attachments = [];
    const essence = Array.isArray(creature.essence) ? creature.essence : [];
    essence.forEach((instance) => {
      const definition = legacyDefinition(instance) || {};
      const structured = structuredDefinition(instance) || {};
      attachments.push({
        family: 'Essence',
        name: structured.name || definition.name || instance.card_id || 'Essence',
        element: structured.element || definition.element || ''
      });
    });
    if (creature.relic) {
      const definition = legacyDefinition(creature.relic) || {};
      const structured = structuredDefinition(creature.relic) || {};
      attachments.push({
        family: 'Relic',
        name: structured.name || definition.name || creature.relic.card_id || 'Relic',
        element: structured.element || definition.element || ''
      });
    }
    return attachments;
  }

  function knownCard(instance, options) {
    const opts = options || {};
    if (!instance) return '<div class="sb-zone-empty">Empty</div>';
    return renderer().renderKnownCard({
      instance,
      definition: legacyDefinition(instance) || {},
      structured: structuredDefinition(instance),
      creature: opts.creature || null,
      attachments: opts.creature ? attachmentDescriptors(opts.creature) : [],
      actions: opts.actions || [],
      interactive: !!opts.interactive,
      selected: !!opts.selected,
      anchor: opts.anchor || '',
      compact: !!opts.compact,
      art: null
    });
  }

  function creatureCard(creature, options) {
    const opts = options || {};
    if (!creature) return '<div class="sb-zone-empty">Empty</div>';
    const instance = topInstance(creature);
    const anchor = cardAnchor(creature);
    const selected = opts.primary && anchor && state.selectedAnchorUid === anchor;
    const actions = opts.primary ? attackSlots(creature).map((entry) => ({
      slot: entry.slot,
      attack: entry.attack,
      name: entry.name,
      enabled: !!opts.canAct
    })) : [];
    return knownCard(instance, {
      creature,
      actions,
      interactive: !!opts.primary,
      selected,
      anchor,
      compact: false
    });
  }

  function renderReserve(target, reserve, ownerLabel, options) {
    const node = $(target);
    if (!node) return;
    const opts = options || {};
    const handTarget = !!opts.handTarget;
    node.innerHTML = [0, 1, 2, 3].map((index) => {
      const targetAttrs = handTarget
        ? ' tabindex="0" role="button" data-play-creature-reserve-index="' + index + '" aria-label="Try selected hand card in ' + ownerLabel + ' Reserve ' + (index + 1) + '"'
        : '';
      return '<section class="sb-reserve-slot' + (handTarget ? ' is-hand-target' : '') + '"' + targetAttrs + '><span class="sb-slot-label">' +
        ownerLabel + ' Reserve ' + (index + 1) + '</span>' + creatureCard(reserve && reserve[index], {}) + '</section>';
    }).join('');
  }

  function countValue(value) {
    const count = Number(value || 0);
    return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  }

  function renderDeck(target, count, label) {
    const node = $(target);
    if (!node) return;
    const total = countValue(count);
    node.innerHTML = total
      ? renderer().renderCardBack({ label: label + ' deck', compact: false }) + '<span class="sb-count">' + total + '</span>'
      : '<div class="sb-zone-empty">Deck empty · 0</div>';
  }

  function renderDiscard(target, count, label) {
    const node = $(target);
    if (!node) return;
    const total = countValue(count);
    node.innerHTML = total
      ? renderer().renderCardBack({ label: label + ' discard', compact: false }) + '<span class="sb-count">' + total + '</span>'
      : '<div class="sb-zone-empty">Discard empty · 0</div>';
  }

  function renderRewards(target, count, label) {
    const node = $(target);
    if (!node) return;
    const remaining = Math.min(6, countValue(count));
    node.innerHTML = Array.from({ length: 6 }, (_, index) => {
      const active = index < remaining;
      return '<div class="sb-reward-slot' + (active ? '' : ' is-claimed') + '">' +
        (active ? renderer().renderCardBack({ label: label + ' Reward ' + (index + 1), compact: true }) : '') +
        '</div>';
    }).join('');
  }

  function renderOpponentHand(view) {
    const count = countValue(view.opponent && view.opponent.hand_count);
    const node = $('oppHand');
    if (node) node.innerHTML = Array.from({ length: Math.min(count, 10) }, (_, index) =>
      renderer().renderCardBack({ label: 'Opponent hand card ' + (index + 1), compact: true })
    ).join('') || '<div class="sb-zone-empty">No cards</div>';
    if ($('oppHandCount')) $('oppHandCount').textContent = String(count);
  }

  function renderYourHand(view, canPlayFromHand) {
    const hand = view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
    const node = $('yourHand');
    if (node) node.innerHTML = hand.map((instance) => {
      const uid = String(instance && instance.uid || '');
      return knownCard(instance, {
        compact: true,
        interactive: !!canPlayFromHand && !!uid,
        selected: !!uid && state.selectedHandUid === uid,
        anchor: 'hand:' + uid
      });
    }).join('') || '<div class="sb-zone-empty">No cards in hand</div>';
    if ($('yourHandCount')) $('yourHandCount').textContent = String(countValue(view.you && view.you.hand_count != null ? view.you.hand_count : hand.length));
  }

  function renderRealm(view) {
    const node = $('realmSlot');
    if (!node) return;
    node.innerHTML = view.realm
      ? knownCard(view.realm, { compact: false })
      : '<div class="sb-zone-empty">No Realm in play</div>';
  }

  function render() {
    const view = viewState();
    if (!view) return;
    const yourTurn = view.phase === 'play' && Number(view.active_seat) === Number(view.you && view.you.seat);
    const pending = !!(view.pending_attack_choice || view.pending_ability_choice || view.pending_event_listener_choice || view.pending_movement_listener_choice || view.pending_heal_listener_choice || view.pending_choice || view.pending_resolution);
    const canAttack = yourTurn && !pending && !state.busy;
    const canPlayFromHand = yourTurn && !pending && !state.busy;

    $('oppVanguard').innerHTML = creatureCard(view.opponent && view.opponent.vanguard, {});
    $('youVanguard').innerHTML = creatureCard(view.you && view.you.vanguard, { primary: true, canAct: canAttack });
    renderReserve('oppReserve', view.opponent && view.opponent.reserve, 'Opponent');
    renderReserve('youReserve', view.you && view.you.reserve, 'Your', { handTarget: !!state.selectedHandUid && canPlayFromHand });
    renderRealm(view);

    renderOpponentHand(view);
    renderYourHand(view, canPlayFromHand);
    renderDeck('oppDeck', view.opponent && view.opponent.deck_count, 'Opponent');
    renderRewards('oppRewards', view.opponent && view.opponent.rewards_count, 'Opponent');
    renderDiscard('oppDiscard', view.opponent && view.opponent.discard_count, 'Opponent');
    renderDeck('yourDeck', view.you && view.you.deck_count, 'Your');
    renderRewards('yourRewards', view.you && view.you.rewards_count, 'Your');
    renderDiscard('yourDiscard', view.you && view.you.discard_count, 'Your');

    $('turnPill').textContent = view.phase === 'complete' ? 'Match complete' : (yourTurn ? 'Your turn' : 'Opponent turn');
    $('revisionPill').textContent = 'Revision ' + revision();
    $('phasePill').textContent = String(view.phase || '—');

    if (pending) setStatus('The board is authoritative. Resolve the pending server choice before another card action.', 'wait');
    else if (state.selectedHandUid && canPlayFromHand) setStatus('Hand card selected. Choose a Reserve position; the server validates whether that card may be played there.', 'ready');
    else if (yourTurn) setStatus('Your turn. Select a hand card for Reserve placement or your active Creature for its card actions.', 'ready');
    else setStatus('Board synced. Waiting for the opponent or the next server phase.', 'wait');

    bindCardControls();
  }

  function bindCardControls() {
    document.querySelectorAll('[data-card-anchor]').forEach((card) => {
      const select = () => {
        if (state.busy) return;
        const anchor = String(card.dataset.cardAnchor || '');
        if (anchor.startsWith('hand:')) {
          const uid = anchor.slice(5);
          if (!uid) return;
          state.selectedHandUid = state.selectedHandUid === uid ? '' : uid;
          state.selectedAnchorUid = '';
        } else {
          state.selectedAnchorUid = state.selectedAnchorUid === anchor ? '' : anchor;
          state.selectedHandUid = '';
        }
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
    document.querySelectorAll('[data-play-creature-reserve-index]').forEach((slot) => {
      const activate = async () => {
        await runPlayCreatureIntent(state.selectedHandUid, Number(slot.dataset.playCreatureReserveIndex));
      };
      slot.addEventListener('click', async (event) => {
        event.stopPropagation();
        await activate();
      });
      slot.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          await activate();
        }
      });
    });
  }

  async function runPlayCreatureIntent(cardUid, reserveIndex) {
    if (!cardUid) throw new Error('Select a hand card first.');
    if (!Number.isInteger(reserveIndex) || reserveIndex < 0 || reserveIndex > 3) throw new Error('Invalid Reserve index.');
    state.busy = true;
    render();
    setStatus('Submitting the selected hand card to the authoritative play_creature owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('play_creature'), {
        card_uid: cardUid,
        reserve_index: reserveIndex
      }));
      state.selectedHandUid = '';
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
    if (state.selectedHandUid && view && view.you) {
      const hand = Array.isArray(view.you.hand) ? view.you.hand : [];
      if (!hand.some((instance) => String(instance && instance.uid || '') === state.selectedHandUid)) state.selectedHandUid = '';
    }
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
      renderer();
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
