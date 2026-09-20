(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG V2 Battle Controller v0.8';
  const API_SETUP = 'tcg-private-alpha-api';
  const API_MATCH = 'tcg-match-actions';
  const API_TACTIC = 'tcg-tactic-actions';
  const SETUP_RECIPES = new Set(['Creature — Baby', 'Creature — Standalone', 'Creature — Mythic']);

  const state = {
    client: null,
    session: null,
    matchId: '',
    view: null,
    selectedAnchorUid: '',
    selectedHandUid: '',
    selectedChoiceIds: [],
    pendingChoiceId: '',
    opponentProfileId: '',
    opponentProfile: null,
    busy: false,
    poll: null,
    overlayKey: ''
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

  async function resolveAuthDecision() {
    if (!(await waitForGate())) throw new Error('Stream Bandit auth gate is unavailable.');
    const gate = window.StreamBanditAuthGate;
    let decision = await gate.enforce();
    if (!decision && typeof gate.decide === 'function') decision = await gate.decide();
    if (!decision && typeof gate.state === 'function') {
      for (let attempt = 0; attempt < 40 && !decision; attempt += 1) {
        const snapshot = gate.state();
        decision = snapshot && snapshot.lastDecision ? snapshot.lastDecision : null;
        if (!decision) await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    return decision;
  }

  async function ensureClient() {
    if (state.client) return state.client;
    const decision = await resolveAuthDecision();
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

  function opponentLabel(profile) {
    const value = profile || {};
    return String(value.display_name || value.username || value.channel_name || 'Opponent').trim() || 'Opponent';
  }

  function opponentHandle(profile) {
    const value = profile || {};
    if (value.username) return '@' + String(value.username).trim();
    if (value.channel_name) return String(value.channel_name).trim();
    return 'Matched player';
  }

  function safeAvatarUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const parsed = new URL(raw, window.location.href);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
    } catch (_) {
      return '';
    }
  }

  function renderOpponentProfile() {
    const profile = state.opponentProfile || null;
    const label = opponentLabel(profile);
    const handle = opponentHandle(profile);
    const name = $('oppName');
    const handleNode = $('oppHandle');
    const fallback = $('oppAvatarFallback');
    const frame = $('oppAvatarFrame');
    const image = $('oppAvatar');
    if (name) name.textContent = label;
    if (handleNode) handleNode.textContent = handle;
    const initials = label.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'VS';
    if (fallback) fallback.textContent = initials;
    const avatar = safeAvatarUrl(profile && profile.avatar_url);
    if (!frame || !image || !fallback) return;
    if (!avatar) {
      frame.hidden = true;
      fallback.hidden = false;
      if (typeof image.removeAttribute === 'function') image.removeAttribute('src');
      else image.src = '';
      image.alt = '';
      return;
    }
    image.onload = () => {
      frame.hidden = false;
      fallback.hidden = true;
    };
    image.onerror = () => {
      frame.hidden = true;
      fallback.hidden = false;
      if (typeof image.removeAttribute === 'function') image.removeAttribute('src');
      else image.src = '';
    };
    image.alt = label + ' profile picture';
    image.src = avatar;
  }

  async function syncOpponentProfile(opponentUserId) {
    const id = String(opponentUserId || '').trim();
    if (!id) {
      state.opponentProfileId = '';
      state.opponentProfile = null;
      renderOpponentProfile();
      return;
    }
    if (id === state.opponentProfileId) {
      renderOpponentProfile();
      return;
    }
    state.opponentProfileId = id;
    state.opponentProfile = null;
    renderOpponentProfile();
    try {
      const client = await ensureClient();
      const result = await client
        .from('sb_profiles')
        .select('id,username,display_name,channel_name,avatar_url')
        .eq('id', id)
        .maybeSingle();
      if (!result.error && result.data && String(result.data.id || '') === id) state.opponentProfile = result.data;
    } catch (_) {
      state.opponentProfile = null;
    }
    renderOpponentProfile();
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

  function recipeType(instance) {
    const definition = legacyDefinition(instance) || {};
    return String(definition.recipe_type || definition.recipeType || '');
  }

  function setupCandidate(instance) {
    return SETUP_RECIPES.has(recipeType(instance));
  }

  function activePlayTurn(view) {
    return !!(
      view &&
      view.phase === 'play' &&
      Number(view.active_seat) === Number(view.you && view.you.seat) &&
      !hasPendingAction(view) &&
      !state.busy
    );
  }

  function handIntent(instance) {
    const definition = legacyDefinition(instance) || {};
    const kind = String(definition.kind || definition.card_family || '');
    const family = String(definition.family || definition.tactic_subtype || '');
    const stage = String(definition.stage || '');
    if (kind === 'Creature') {
      if (['Baby', 'Standalone', 'Mythic'].includes(stage)) return 'play_creature';
      if (['Teen', 'Adult'].includes(stage)) return 'evolve';
    }
    if (kind === 'Essence') return 'attach_essence';
    if (kind === 'Tactic' && family === 'Relic') return 'attach_relic';
    if (kind === 'Tactic' && family === 'Realm') return 'play_realm';
    if (kind === 'Tactic' || String(definition.card_family || '') === 'Tactic') return 'play_tactic';
    return '';
  }

  function selectedHandInstance() {
    const view = viewState();
    const hand = view && view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
    return hand.find((row) => String(row.uid || '') === state.selectedHandUid) || null;
  }

  function selectedHandDefinition() {
    const instance = selectedHandInstance();
    return instance ? (legacyDefinition(instance) || {}) : {};
  }

  function selectedHandIntent() {
    const instance = selectedHandInstance();
    return instance ? handIntent(instance) : '';
  }

  function selectedHandUidSafe() {
    return selectedHandInstance() ? state.selectedHandUid : '';
  }

  function selectedHandName() {
    const instance = selectedHandInstance();
    const definition = instance ? (legacyDefinition(instance) || {}) : {};
    return instance ? String(definition.name || instance.card_id || 'Selected card') : '';
  }

  function ownCreatureAt(where, index) {
    const view = viewState();
    if (!view || !view.you) return null;
    if (where === 'vanguard') return view.you.vanguard || null;
    if (where === 'reserve' && Number.isInteger(index) && index >= 0 && index < 4) {
      return Array.isArray(view.you.reserve) ? (view.you.reserve[index] || null) : null;
    }
    return null;
  }

  function playTargetLegal(where, index, creature) {
    const view = viewState();
    if (!activePlayTurn(view) || !state.selectedHandUid) return false;
    const intent = selectedHandIntent();
    if (intent === 'play_creature') return where === 'reserve' && !creature;
    if (intent === 'attach_essence') return !!creature;
    if (intent === 'attach_relic') return !!creature && !creature.relic;
    if (intent === 'evolve') {
      if (!creature) return false;
      const definition = selectedHandDefinition();
      const prior = topDefinition(creature) || {};
      return String(definition.evolves_from_id || '') === String(prior.id || topInstance(creature)?.card_id || '');
    }
    return false;
  }

  function directHandIntent(intent) {
    return intent === 'play_realm' || intent === 'play_tactic';
  }

  function playInstruction(intent) {
    if (intent === 'play_creature') return 'Drop or tap an empty Reserve slot.';
    if (intent === 'evolve') return 'Drop or tap the matching Creature to evolve it.';
    if (intent === 'attach_essence') return 'Drop or tap one of your Creatures to attach this Essence.';
    if (intent === 'attach_relic') return 'Drop or tap a Creature without a Relic.';
    if (intent === 'play_realm') return 'Use Play Realm to send this card to the authoritative Realm owner.';
    if (intent === 'play_tactic') return 'Use Play Tactic; any required server choice will appear here.';
    return 'Select a playable card.';
  }

  function currentServerChoice(view) {
    if (!view) return null;
    if (view.pending_choice) return { source: 'tactic', endpoint: API_TACTIC, action: 'resolve_choice', choice: view.pending_choice };
    if (view.phase === 'effect_resolution' && view.pending_movement_listener_choice) {
      return { source: 'tactic', endpoint: API_TACTIC, action: 'resolve_choice', choice: view.pending_movement_listener_choice };
    }
    if (view.phase === 'effect_resolution' && view.pending_heal_listener_choice) {
      return { source: 'tactic', endpoint: API_TACTIC, action: 'resolve_choice', choice: view.pending_heal_listener_choice };
    }
    if (view.pending_event_listener_choice) {
      return { source: 'match', endpoint: API_MATCH, action: 'resolve_event_listener_choice', choice: view.pending_event_listener_choice };
    }
    if (view.pending_movement_listener_choice) {
      return { source: 'match', endpoint: API_MATCH, action: 'resolve_movement_listener_choice', choice: view.pending_movement_listener_choice };
    }
    if (view.pending_heal_listener_choice) {
      return { source: 'match', endpoint: API_MATCH, action: 'resolve_heal_listener_choice', choice: view.pending_heal_listener_choice };
    }
    return null;
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
    const attackRows = attacks.map((attack) => (
      '<button type="button" class="sb-card-action" data-card-intent="attack" data-attack-slot="' + attack.slot + '"' +
      (canAct ? '' : ' disabled') + '>' +
      '<span><strong>' + esc(attack.name) + '</strong><small>Attack ' + attack.slot + '</small></span>' +
      '<span class="sb-damage">' + (attack.damage == null ? '—' : esc(attack.damage)) + '</span>' +
      '</button>'
    )).join('');
    const setupReturn = opts.setupReturn
      ? '<button type="button" class="sb-card-action setup-return" data-setup-return="' + esc(opts.setupReturn.where) + '" data-setup-index="' + esc(opts.setupReturn.index == null ? '' : opts.setupReturn.index) + '"><span><strong>Return to hand</strong><small>Adjust setup</small></span><span>↩</span></button>'
      : '';
    const cardId = String((topInstance(creature) && topInstance(creature).card_id) || '');
    return '<div class="sb-card-wrap' + (selected ? ' is-selected' : '') + (opts.setupReturn ? ' has-setup-return' : '') + '">' +
      '<article class="sb-tcg-card sb-card-control' + (selected ? ' is-selected' : '') + (opts.primary ? ' is-primary' : '') + '" data-card-id="' + esc(cardId) + '"' +
      (opts.primary ? ' tabindex="0" role="button" aria-pressed="' + (selected ? 'true' : 'false') + '" data-card-anchor="' + esc(anchor) + '"' : '') + '>' +
      '<div class="sb-card-art" aria-hidden="true">🎴</div>' +
      '<div class="sb-card-head"><span>' + esc(definition.stage || definition.kind || 'Creature') + '</span><span>' + esc(definition.element || '') + '</span></div>' +
      '<div class="sb-card-name">' + esc(definition.name || (topInstance(creature) && topInstance(creature).card_id) || 'Creature') + '</div>' +
      '<div class="sb-card-foot"><span>HP ' + esc(remaining) + '/' + esc(maxHp) + '</span><span>E ' + esc((creature.essence || []).length) + ' · S ' + esc(creature.shield || 0) + '</span></div>' +
      '</article>' +
      '<div class="sb-card-actions">' + attackRows + setupReturn + '</div>' +
      '</div>';
  }

  function handCard(instance) {
    const definition = legacyDefinition(instance) || {};
    const cardId = String(instance && instance.card_id || '');
    const uid = String(instance && instance.uid || '');
    const view = viewState();
    const yourSetup = !!(view && view.phase === 'setup' && Number(view.setup_turn_seat) === Number(view.you && view.you.seat));
    const setupPlayable = yourSetup && setupCandidate(instance);
    const playIntent = activePlayTurn(view) ? handIntent(instance) : '';
    const playPlayable = !!playIntent;
    const selected = (setupPlayable || playPlayable) && state.selectedHandUid === uid;
    const classes =
      (setupPlayable ? ' is-setup-candidate' : '') +
      (playPlayable ? ' is-play-candidate' : '') +
      (selected ? (yourSetup ? ' is-setup-selected' : ' is-play-selected') : '');
    let attributes = '';
    if (setupPlayable) {
      attributes =
        ' tabindex="0" role="button" aria-pressed="' + (selected ? 'true' : 'false') +
        '" data-setup-hand-uid="' + esc(uid) + '"';
    } else if (playPlayable) {
      attributes =
        ' tabindex="0" role="button" aria-pressed="' + (selected ? 'true' : 'false') +
        '" data-play-hand-uid="' + esc(uid) + '" data-play-intent="' + esc(playIntent) + '" draggable="true"';
    }
    return '<article class="sb-tcg-card sb-hand-card' + classes + '" data-card-id="' + esc(cardId) + '"' + attributes + '>' +
      '<div class="sb-card-art" aria-hidden="true">🎴</div>' +
      '<div class="sb-card-head"><span>' + esc(definition.card_family || definition.kind || '') + '</span><span>' + esc(definition.element || '') + '</span></div>' +
      '<div class="sb-card-name">' + esc(definition.name || cardId) + '</div>' +
      '<div class="sb-card-foot"><span>' + esc(recipeType(instance) || 'Card') + '</span><span></span></div>' +
      '</article>';
  }

  function setupReturnOptions(where, index) {
    const view = viewState();
    const yourSetup = !!(view && view.phase === 'setup' && Number(view.setup_turn_seat) === Number(view.you && view.you.seat));
    return yourSetup ? { where, index } : null;
  }

  function renderReserve(target, reserve, ownerLabel, own) {
    const node = $(target);
    if (!node) return;
    const view = viewState();
    const yourSetup = !!(own && view && view.phase === 'setup' && Number(view.setup_turn_seat) === Number(view.you && view.you.seat));
    const hasVanguard = !!(view && view.you && view.you.vanguard);
    node.innerHTML = [0, 1, 2, 3].map((index) => {
      const creature = reserve && reserve[index];
      const setupDestination = yourSetup && hasVanguard && !creature && state.selectedHandUid
        ? ' data-setup-destination="reserve" data-setup-index="' + index + '"'
        : '';
      const playLegal = !!(own && playTargetLegal('reserve', index, creature));
      const playDestination = own
        ? ' data-play-where="reserve" data-play-index="' + index + '"'
        : '';
      const legalClass =
        (setupDestination ? ' sb-setup-destination is-legal' : '') +
        (playLegal ? ' sb-play-destination is-play-legal' : '');
      return '<section class="sb-reserve-slot' + legalClass + '"' + setupDestination + playDestination + '><span>' +
        esc(ownerLabel) + ' Reserve ' + (index + 1) + '</span>' +
        creatureCard(creature, { setupReturn: own && creature ? setupReturnOptions('reserve', index) : null }) +
        '</section>';
    }).join('');
  }

  function renderRewardStack(target, count) {
    const node = $(target);
    if (!node) return;
    const safe = Math.max(0, Math.min(6, Number(count || 0)));
    node.innerHTML = Array.from({ length: 6 }, (_, index) =>
      '<span class="sb-reward-card' + (index >= safe ? ' is-empty' : '') + '" aria-hidden="true"></span>'
    ).join('');
  }

  function setText(id, value) {
    const node = $(id);
    if (node) node.textContent = String(value == null ? '—' : value);
  }

  function selectedSetupName() {
    const view = viewState();
    const hand = view && view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
    const instance = hand.find((row) => String(row.uid || '') === state.selectedHandUid);
    const definition = instance ? legacyDefinition(instance) || {} : {};
    return instance ? String(definition.name || instance.card_id || 'Selected card') : '';
  }

  function hasPendingAction(view) {
    return !!(
      view && (
        view.pending_attack_choice ||
        view.pending_ability_choice ||
        view.pending_event_listener_choice ||
        view.pending_movement_listener_choice ||
        view.pending_heal_listener_choice ||
        view.pending_choice ||
        view.pending_resolution
      )
    );
  }

  function renderVanguardSetupTarget() {
    const view = viewState();
    const slot = $('youVanguardSlot');
    if (!slot) return;
    const yourSetup = !!(view && view.phase === 'setup' && Number(view.setup_turn_seat) === Number(view.you && view.you.seat));
    const creature = view && view.you ? view.you.vanguard : null;
    const empty = !creature;
    const setupLegal = !!(yourSetup && empty && state.selectedHandUid);
    const playLegal = playTargetLegal('vanguard', null, creature);
    slot.className =
      'sb-vanguard-slot' +
      (setupLegal ? ' sb-setup-destination is-legal' : '') +
      (playLegal ? ' sb-play-destination is-play-legal' : '');
    if (setupLegal) {
      slot.dataset.setupDestination = 'vanguard';
      slot.dataset.setupIndex = '';
    } else {
      delete slot.dataset.setupDestination;
      delete slot.dataset.setupIndex;
    }
    slot.dataset.playWhere = 'vanguard';
    slot.dataset.playIndex = '';
  }

  function renderOverlay() {
    const node = $('battleOverlay');
    const view = viewState();
    if (!node || !view) return;
    const youSeat = Number(view.you && view.you.seat);
    const phase = String(view.phase || '');
    const selectedName = selectedHandName();
    const selectedIntent = selectedHandIntent();
    const pending = hasPendingAction(view);
    const yourTurn = phase === 'play' && Number(view.active_seat) === youSeat;
    const serverChoice = currentServerChoice(view);

    if (serverChoice && serverChoice.choice && !serverChoice.choice.waiting) {
      const choiceId = String(serverChoice.choice.id || '');
      if (state.pendingChoiceId !== choiceId) {
        state.pendingChoiceId = choiceId;
        state.selectedChoiceIds = [];
      }
    } else if (!serverChoice) {
      state.pendingChoiceId = '';
      state.selectedChoiceIds = [];
    }

    const key = [
      phase,
      revision(),
      view.toss_winner_seat,
      view.setup_turn_seat,
      state.selectedHandUid,
      state.pendingChoiceId,
      state.selectedChoiceIds.join(','),
      !!(view.you && view.you.vanguard),
      pending,
      yourTurn,
      view.result && view.result.winner_seat
    ].join(':');
    if (key === state.overlayKey) return;
    state.overlayKey = key;

    if (serverChoice && serverChoice.choice) {
      const choice = serverChoice.choice;
      if (choice.waiting) {
        node.innerHTML =
          '<div class="sb-phase-card">' +
          '<div class="sb-phase-copy"><strong>Opponent choice</strong><small>Waiting for the other player to resolve the server choice.</small></div>' +
          '</div>';
        return;
      }
      const options = Array.isArray(choice.options) ? choice.options : [];
      const selected = new Set(state.selectedChoiceIds);
      const optionHtml = options.map((option) => {
        const id = String(option.id || '');
        const on = selected.has(id);
        const order = state.selectedChoiceIds.indexOf(id);
        return '<button type="button" class="sb-choice-option' + (on ? ' is-selected' : '') +
          '" data-server-choice-option="' + esc(id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
          (order >= 0 && String(choice.mode || '') === 'order' ? '<b>' + (order + 1) + '</b> ' : '') +
          esc(option.label || id) + '</button>';
      }).join('');
      const min = Math.max(0, Number(choice.min || 0));
      const max = Math.max(min, Number(choice.max == null ? min : choice.max));
      const count = state.selectedChoiceIds.length;
      const canConfirm = count >= min && count <= max;
      node.innerHTML =
        '<div class="sb-phase-card sb-choice-card">' +
        '<div class="sb-phase-copy"><strong>' + esc(choice.prompt || 'Choose') + '</strong>' +
        '<small>Select ' + esc(min) + (max !== min ? '–' + esc(max) : '') + ' option' + (max === 1 ? '' : 's') + '. The server remains authoritative.</small></div>' +
        '<div class="sb-choice-options">' + optionHtml + '</div>' +
        '<div class="sb-phase-actions"><button type="button" class="sb-phase-action ready" data-server-choice-confirm="1"' +
        (canConfirm ? '' : ' disabled') + '>Confirm</button></div>' +
        '</div>';
      return;
    }

    if (phase === 'opening_choice') {
      const won = Number(view.toss_winner_seat) === youSeat;
      node.innerHTML =
        '<div class="sb-phase-card">' +
        '<div class="sb-coin" aria-label="Server-authoritative opening toss"><img src="stream_bandit_stag_icon_32.png" alt=""></div>' +
        '<div class="sb-phase-copy"><strong>' + (won ? 'You won the opening toss' : 'Opponent won the opening toss') + '</strong>' +
        '<small>' + (won ? 'Choose who takes the first turn.' : 'The toss winner is choosing who takes the first turn.') + '</small></div>' +
        (won
          ? '<div class="sb-phase-actions"><button type="button" class="sb-phase-action" data-opening-choice="first">Go First</button><button type="button" class="sb-phase-action alt" data-opening-choice="second">Go Second</button></div>'
          : '') +
        '</div>';
      return;
    }

    if (phase === 'setup') {
      const yourSetup = Number(view.setup_turn_seat) === youSeat;
      const hasVanguard = !!(view.you && view.you.vanguard);
      node.innerHTML =
        '<div class="sb-phase-card">' +
        '<div class="sb-phase-copy"><strong>' + (yourSetup ? 'Set your opening field' : 'Opponent is setting their opening field') + '</strong>' +
        '<small>' + (yourSetup
          ? (!hasVanguard
            ? (selectedName ? selectedName + ' selected — tap Your Vanguard first.' : 'Choose an eligible Creature for Your Vanguard first.')
            : (selectedName ? selectedName + ' selected — tap an open Reserve slot, or confirm your setup.' : 'Vanguard ready. Add optional Reserves or confirm your setup.'))
          : 'Your board stays visible while the server waits for their setup.') + '</small></div>' +
        (yourSetup
          ? '<div class="sb-phase-actions"><button type="button" class="sb-phase-action ready" data-setup-ready="1"' + (hasVanguard ? '' : ' disabled') + '>Confirm Setup</button></div>'
          : '') +
        '</div>';
      return;
    }

    if (phase === 'play') {
      const selectedCopy = yourTurn && selectedName
        ? selectedName + ' selected — ' + playInstruction(selectedIntent)
        : (yourTurn ? 'Select or drag a card from your hand, use your field controls, or pass.' : 'Your field stays synced while the opponent acts.');
      const directButton = yourTurn && selectedHandUidSafe() && directHandIntent(selectedIntent)
        ? '<button type="button" class="sb-phase-action ready" data-play-direct="' + esc(selectedIntent) + '">' +
          (selectedIntent === 'play_realm' ? 'Play Realm' : 'Play Tactic') + '</button>'
        : '';
      node.innerHTML =
        '<div class="sb-phase-card sb-turn-card">' +
        '<div class="sb-phase-copy"><strong>' + (yourTurn ? 'Your turn' : 'Opponent turn') + '</strong>' +
        '<small>' + (pending ? 'Resolve the current server choice before another action.' : selectedCopy) + '</small></div>' +
        (yourTurn
          ? '<div class="sb-phase-actions">' + directButton +
            '<button type="button" class="sb-phase-action end-turn" data-end-turn="1"' + ((pending || state.busy) ? ' disabled' : '') + '>End Turn</button></div>'
          : '') +
        '</div>';
      return;
    }

    if (phase === 'complete') {
      const winnerSeat = Number(view.result && view.result.winner_seat);
      const won = winnerSeat && winnerSeat === youSeat;
      const reasons = view.result && Array.isArray(view.result.reasons) ? view.result.reasons.join(' · ') : '';
      node.innerHTML =
        '<div class="sb-phase-card">' +
        '<div class="sb-phase-copy"><strong class="sb-result-title ' + (won ? 'sb-result-win' : 'sb-result-loss') + '">' + (won ? 'VICTORY' : 'DEFEAT') + '</strong>' +
        '<small>' + esc(reasons || 'Match complete') + '</small></div>' +
        '<div class="sb-phase-actions"><button type="button" class="sb-phase-action ready" data-result-continue="1">Continue</button></div>' +
        '</div>';
      return;
    }

    node.innerHTML = '';
  }

  function render() {
    const view = viewState();
    if (!view) return;
    renderOpponentProfile();

    const youSeat = Number(view.you && view.you.seat);
    const yourTurn = view.phase === 'play' && Number(view.active_seat) === youSeat;
    const pending = hasPendingAction(view);
    const canAttack = yourTurn && !pending && !state.busy;
    const yourSetup = view.phase === 'setup' && Number(view.setup_turn_seat) === youSeat;

    $('oppVanguard').innerHTML = creatureCard(view.opponent && view.opponent.vanguard, {});
    $('youVanguard').innerHTML = creatureCard(view.you && view.you.vanguard, {
      primary: view.phase === 'play',
      canAct: canAttack,
      setupReturn: view.you && view.you.vanguard ? setupReturnOptions('vanguard', null) : null
    });
    renderReserve('oppReserve', view.opponent && view.opponent.reserve, 'Opponent', false);
    renderReserve('youReserve', view.you && view.you.reserve, 'Your', true);
    renderVanguardSetupTarget();

    const hand = view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
    $('yourHand').innerHTML = hand.map(handCard).join('') || '<div class="sb-zone-empty">No cards in hand</div>';

    renderRewardStack('oppRewards', view.opponent && view.opponent.rewards_count);
    renderRewardStack('yourRewards', view.you && view.you.rewards_count);
    setText('oppHandCount', view.opponent && view.opponent.hand_count);
    setText('oppDeck', view.opponent && view.opponent.deck_count);
    setText('oppDiscard', view.opponent && view.opponent.discard_count);
    setText('yourDeck', view.you && view.you.deck_count);
    setText('yourDiscard', view.you && Array.isArray(view.you.discard) ? view.you.discard.length : 0);
    setText('yourMulligans', view.you && view.you.mulligans);

    const realm = $('realmPill');
    if (realm) {
      const realmValue = view.realm && typeof view.realm === 'object'
        ? (view.realm.name || view.realm.card_name || 'Realm')
        : (view.realm || 'Stream Bandit TCG');
      realm.textContent = String(realmValue);
    }

    const turnPill = $('turnPill');
    if (turnPill) {
      if (view.phase === 'opening_choice') turnPill.textContent = 'Opening toss';
      else if (view.phase === 'setup') turnPill.textContent = yourSetup ? 'Your setup' : 'Opponent setup';
      else if (view.phase === 'complete') turnPill.textContent = 'Match complete';
      else turnPill.textContent = yourTurn ? 'Your turn' : 'Opponent turn';
    }
    setText('revisionPill', 'Revision ' + revision());
    setText('phasePill', String(view.phase || '—'));

    const help = $('handHelp');
    if (help) {
      if (yourSetup) {
        const hasVanguard = !!(view.you && view.you.vanguard);
        help.textContent = !hasVanguard
          ? (state.selectedHandUid ? 'Now tap Your Vanguard.' : 'Choose your Vanguard Creature first.')
          : (state.selectedHandUid ? 'Now tap an open Reserve slot.' : 'Add optional Reserves or confirm setup.');
      }
      else if (view.phase === 'opening_choice') help.textContent = 'Opening hand dealt by the server.';
      else help.textContent = 'Select cards directly from your hand.';
    }

    if (state.busy) setStatus('Waiting for the authoritative server…', 'busy');
    else if (view.phase === 'opening_choice') {
      if (Number(view.toss_winner_seat) === youSeat) setStatus('Server toss complete. Choose whether to go first or second.', 'ready');
      else setStatus('Server toss complete. Waiting for the toss winner to choose first or second.', 'wait');
    } else if (view.phase === 'setup') {
      if (yourSetup) setStatus('Your setup turn. Place a Vanguard, optionally place Reserves, then confirm.', 'ready');
      else setStatus('Opponent setup in progress. Your board remains synced.', 'wait');
    } else if (view.phase === 'complete') {
      setStatus('Match complete.', 'ready');
    } else if (pending) {
      setStatus('The board is authoritative. Resolve the pending server choice before another card action.', 'wait');
    } else if (yourTurn) {
      setStatus('Your turn. Use your card controls, attack if legal, or End Turn to pass.', 'ready');
    } else {
      setStatus('Board synced. Waiting for the opponent or the next server phase.', 'wait');
    }

    renderOverlay();
    bindCardControls();
    bindPhaseControls();
  }

  function bindCardControls() {
    document.querySelectorAll('[data-card-anchor]').forEach((card) => {
      const select = () => {
        if (state.busy) return;
        const anchor = String(card.dataset.cardAnchor || '');
        state.selectedAnchorUid = state.selectedAnchorUid === anchor ? '' : anchor;
        state.overlayKey = '';
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

  function bindPhaseControls() {
    document.querySelectorAll('[data-opening-choice]').forEach((button) => {
      button.addEventListener('click', async () => {
        await runOpeningChoice(String(button.dataset.openingChoice || ''));
      });
    });

    document.querySelectorAll('[data-setup-hand-uid]').forEach((card) => {
      const select = () => {
        if (state.busy) return;
        const uid = String(card.dataset.setupHandUid || '');
        state.selectedHandUid = state.selectedHandUid === uid ? '' : uid;
        state.overlayKey = '';
        render();
        if (state.selectedHandUid && window.matchMedia && window.matchMedia('(max-width: 640px), (hover: none) and (pointer: coarse)').matches) {
          window.requestAnimationFrame(() => {
            const current = viewState();
            const hasVanguard = !!(current && current.you && current.you.vanguard);
            const target = hasVanguard ? $('youReserve') : $('youVanguardSlot');
            if (target && typeof target.scrollIntoView === 'function') {
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }
      };
      card.addEventListener('click', select);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    document.querySelectorAll('[data-setup-destination]').forEach((slot) => {
      slot.addEventListener('click', async () => {
        if (!state.selectedHandUid || state.busy) return;
        await runSetupPlace(
          state.selectedHandUid,
          String(slot.dataset.setupDestination || ''),
          slot.dataset.setupIndex === '' || slot.dataset.setupIndex == null ? null : Number(slot.dataset.setupIndex)
        );
      });
    });

    document.querySelectorAll('[data-setup-return]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const where = String(button.dataset.setupReturn || '');
        const raw = button.dataset.setupIndex;
        await runSetupReturn(where, raw === '' || raw == null ? null : Number(raw));
      });
    });

    document.querySelectorAll('[data-setup-ready]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runSetupReady();
      });
    });

    document.querySelectorAll('[data-end-turn]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runEndTurn();
      });
    });

    document.querySelectorAll('[data-result-continue]').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = 'tcg-play.html';
      });
    });
  }

  async function runAuthoritativeSetupAction(action, extra, busyMessage) {
    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus(busyMessage, 'busy');
    let failure = '';
    try {
      await callEdge(API_SETUP, Object.assign(actionBase(action), extra || {}));
      state.selectedHandUid = '';
      await refreshMatch();
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      await refreshMatch().catch(() => {});
    } finally {
      state.busy = false;
      state.overlayKey = '';
      render();
      if (failure) setStatus(failure, 'error');
    }
  }

  async function runOpeningChoice(choice) {
    if (choice !== 'first' && choice !== 'second') return;
    await runAuthoritativeSetupAction(
      'opening_choice',
      { choice },
      'Submitting the toss winner\'s first/second choice to the server…'
    );
  }

  async function runSetupPlace(cardUid, where, index) {
    if (!cardUid || (where !== 'vanguard' && where !== 'reserve')) return;
    const payload = { card_uid: cardUid, where };
    if (where === 'reserve') payload.index = index;
    await runAuthoritativeSetupAction('setup_place', payload, 'Placing the selected Creature through the server setup owner…');
  }

  async function runSetupReturn(where, index) {
    if (where !== 'vanguard' && where !== 'reserve') return;
    const payload = { where };
    if (where === 'reserve') payload.index = index;
    await runAuthoritativeSetupAction('setup_return', payload, 'Returning the setup Creature to your hand…');
  }

  async function runSetupReady() {
    await runAuthoritativeSetupAction('setup_ready', {}, 'Locking your opening field through the server Match Flow owner…');
  }

  async function runEndTurn() {
    const view = viewState();
    const youSeat = Number(view && view.you && view.you.seat);
    if (
      !view ||
      view.phase !== 'play' ||
      Number(view.active_seat) !== youSeat ||
      hasPendingAction(view) ||
      state.busy
    ) return;

    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus('Ending your turn through the authoritative turn lifecycle…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, actionBase('end_turn'));
      state.selectedAnchorUid = '';
      await refreshMatch();
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      await refreshMatch().catch(() => {});
    } finally {
      state.busy = false;
      state.overlayKey = '';
      render();
      if (failure) setStatus(failure, 'error');
    }
  }

  async function runAttackIntent(attackSlot) {
    if (attackSlot !== 1 && attackSlot !== 2) throw new Error('Invalid attack slot.');
    state.busy = true;
    state.overlayKey = '';
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
      state.overlayKey = '';
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

    if (state.selectedAnchorUid && view && view.you && cardAnchor(view.you.vanguard) !== state.selectedAnchorUid) {
      state.selectedAnchorUid = '';
    }
    if (state.selectedHandUid) {
      const hand = view && view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
      if (!hand.some((row) => String(row.uid || '') === state.selectedHandUid)) state.selectedHandUid = '';
    }
    if (view && view.phase !== 'setup') state.selectedHandUid = '';

    render();
    syncOpponentProfile(view && view.opponent && view.opponent.user_id).catch(() => {});
  }

  function startPoll() {
    if (state.poll) clearInterval(state.poll);
    state.poll = setInterval(() => {
      if (!state.busy) refreshMatch().catch((error) => setStatus(error instanceof Error ? error.message : String(error), 'error'));
    }, 2000);
  }

  async function boot() {
    try {
      state.matchId = new URLSearchParams(window.location.search).get('match_id') || '';
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
