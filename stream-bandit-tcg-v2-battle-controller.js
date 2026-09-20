(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG V2 Battle Controller v0.16-compact-tabletop';
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
    inspectedCard: null,
    selectedChoiceIds: [],
    pendingChoiceId: '',
    selectedRewardPositions: [],
    pendingResolutionKey: '',
    opponentProfileId: '',
    opponentProfile: null,
    busy: false,
    poll: null,
    overlayKey: '',
    fieldActions: null
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

  function setupTargetLegal(where, index) {
    const view = viewState();
    if (
      !view ||
      view.phase !== 'setup' ||
      Number(view.setup_turn_seat) !== Number(view.you && view.you.seat) ||
      !state.selectedHandUid
    ) return false;
    const instance = selectedHandInstance();
    if (!instance || !setupCandidate(instance)) return false;
    if (where === 'vanguard') return !(view.you && view.you.vanguard);
    if (where === 'reserve') {
      if (!(view.you && view.you.vanguard)) return false;
      if (!Number.isInteger(index) || index < 0 || index >= 4) return false;
      const reserve = Array.isArray(view.you && view.you.reserve) ? view.you.reserve : [];
      return !reserve[index];
    }
    return false;
  }

  function directHandIntent(intent) {
    return intent === 'play_realm' || intent === 'play_tactic';
  }

  function playInstruction(intent) {
    const touch = touchPrimaryInput();
    const lead = touch ? 'Hold then drag to, or tap,' : 'Drop or tap';
    if (intent === 'play_creature') return lead + ' an empty Reserve slot.';
    if (intent === 'evolve') return lead + ' the matching Creature to evolve it.';
    if (intent === 'attach_essence') return lead + ' one of your Creatures to attach this Essence.';
    if (intent === 'attach_relic') return lead + ' a Creature without a Relic.';
    if (intent === 'play_realm') return 'Use Play Realm to send this card to the authoritative Realm owner.';
    if (intent === 'play_tactic') return 'Use Play Tactic; any required server choice will appear here.';
    return touch ? 'Tap a playable card, or hold it to drag.' : 'Select a playable card.';
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

  function cardRenderer() {
    return window.StreamBanditTCGCardRendererV2451 || null;
  }

  function cardNameById(cardId) {
    const id = String(cardId || '');
    const renderer = cardRenderer();
    if (renderer && typeof renderer.getCard === 'function') {
      const record = renderer.getCard(id);
      if (record && record.name) return String(record.name);
      if (record && record.definition && record.definition.name) return String(record.definition.name);
    }
    const view = viewState();
    const row = view && view.card_index && id ? view.card_index[id] : null;
    const legacy = row ? (row.definition || row) : null;
    return String((legacy && legacy.name) || (row && row.name) || id || 'Card');
  }

  function abilityReadyFor(where, index, creature) {
    const anchor = cardAnchor(creature);
    if (!anchor || !state.fieldActions || !Array.isArray(state.fieldActions.ability_sources)) return false;
    return state.fieldActions.ability_sources.some((source) =>
      String(source && source.anchor_uid || '') === anchor &&
      String(source && source.where || '') === String(where || '') &&
      (String(where || '') !== 'reserve' || Number(source && source.index) === Number(index))
    );
  }

  function renderCardFace(cardId, options) {
    const renderer = cardRenderer();
    if (renderer && typeof renderer.renderCard === 'function') return renderer.renderCard(cardId, options || {});
    return '<article class="sb-card-face sb-card-face--missing"><div class="sb-card-art-pending"><strong>' +
      esc(cardNameById(cardId) || cardId || 'Card') + '</strong><small>Card renderer loading</small></div></article>';
  }

  const ESSENCE_ELEMENT_ORDER = ['Astral', 'Ember', 'Gale', 'Grove', 'Shade', 'Stone', 'Tide', 'Volt', 'Any'];

  function normalizeEssenceElement(value) {
    const raw = String(value || 'Any').trim();
    const match = ESSENCE_ELEMENT_ORDER.find((name) => name.toLowerCase() === raw.toLowerCase());
    return match || raw || 'Any';
  }

  function attachedEssenceUnits(creature) {
    const attached = Array.isArray(creature && creature.essence) ? creature.essence : [];
    const totals = new Map();
    const renderer = cardRenderer();
    for (const instance of attached) {
      if (!instance || !instance.card_id) continue;
      let definition = structuredDefinition(instance);
      if (!definition && renderer && typeof renderer.getCard === 'function') {
        const record = renderer.getCard(String(instance.card_id || ''));
        definition = record && record.definition ? record.definition : null;
      }
      const essence = definition && definition.essence && typeof definition.essence === 'object'
        ? definition.essence
        : null;
      const provides = essence && Array.isArray(essence.provides) ? essence.provides : [];
      if (provides.length) {
        for (const part of provides) {
          const element = normalizeEssenceElement(part && part.element);
          const amount = Math.max(0, Math.floor(Number(part && part.amount) || 0));
          if (!amount) continue;
          totals.set(element, (totals.get(element) || 0) + amount);
        }
        continue;
      }
      const legacy = legacyDefinition(instance) || {};
      const element = normalizeEssenceElement(legacy.element || legacy.energy_type || 'Any');
      totals.set(element, (totals.get(element) || 0) + 1);
    }
    return [...totals.entries()]
      .map(([element, count]) => ({ element, count }))
      .sort((a, b) => {
        const ai = ESSENCE_ELEMENT_ORDER.indexOf(a.element);
        const bi = ESSENCE_ELEMENT_ORDER.indexOf(b.element);
        if (ai !== bi) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
        return a.element.localeCompare(b.element);
      });
  }

  function liveCreatureStatus(creature, cardId, essenceUnits) {
    const structured = structuredDefinition(topInstance(creature)) || {};
    const maxHp = Math.max(0, Number(structured.creature && structured.creature.hp || 0));
    const damage = Math.max(0, Number(creature && creature.damage || 0));
    const remaining = Math.max(0, maxHp - damage);
    const unitTotal = (Array.isArray(essenceUnits) ? essenceUnits : []).reduce((sum, row) => sum + Math.max(0, Number(row && row.count) || 0), 0);
    const sourceCount = Array.isArray(creature && creature.essence) ? creature.essence.length : 0;
    const essenceCount = unitTotal || sourceCount;
    const shield = Math.max(0, Number(creature && creature.shield || 0));
    return '<div class="sb-card-live-status" data-card-id="' + esc(cardId) + '">' +
      '<span>HP <strong>' + esc(remaining) + '/' + esc(maxHp) + '</strong></span>' +
      '<span>Essence <strong>' + esc(essenceCount) + '</strong></span>' +
      '<span>Shield <strong>' + esc(shield) + '</strong></span>' +
      '</div>';
  }

  function syncEssenceRailCompression() {
    document.querySelectorAll('[data-essence-rail]').forEach((rail) => {
      if (!rail || !rail.classList) return;
      rail.classList.remove('is-compressed');
      const expanded = typeof rail.querySelector === 'function'
        ? rail.querySelector('[data-essence-expanded]')
        : null;
      const available = Number(rail.clientWidth || 0);
      const required = Number(expanded && expanded.scrollWidth || 0);
      if (available > 0 && required > available) rail.classList.add('is-compressed');
    });
  }

  function attackStatesFor(canAct) {
    const fallbackReason = canAct ? 'attack_readiness_unavailable' : 'not_active_player';
    const out = {
      1: { eligible: false, reason: fallbackReason },
      2: { eligible: false, reason: fallbackReason }
    };
    const rows = state.fieldActions && Array.isArray(state.fieldActions.attacks)
      ? state.fieldActions.attacks
      : [];
    for (const row of rows) {
      const slot = Number(row && row.slot);
      if (slot !== 1 && slot !== 2) continue;
      out[slot] = {
        eligible: row && row.eligible === true,
        reason: row && row.reason ? String(row.reason) : null
      };
    }
    return out;
  }

  function creatureCard(creature, options) {
    const opts = options || {};
    if (!creature) return '<div class="sb-zone-empty">Empty</div>';
    const anchor = cardAnchor(creature);
    const selected = !!(opts.primary && anchor && state.selectedAnchorUid === anchor);
    const instance = topInstance(creature);
    const cardId = String(instance && instance.card_id || '');
    const essenceUnits = attachedEssenceUnits(creature);
    const face = renderCardFace(cardId, {
      mode: 'compact',
      attachedEssenceUnits: essenceUnits
    });
    const inspectOwner = opts.own ? 'you' : 'opponent';
    const inspectIndex = opts.index == null ? '' : String(opts.index);
    const inspectAttrs =
      ' tabindex="0" role="button" data-inspect-field-owner="' + inspectOwner +
      '" data-inspect-field-where="' + esc(opts.where || '') +
      '" data-inspect-field-index="' + esc(inspectIndex) + '"';
    const setupReturn = opts.setupReturn
      ? '<button type="button" class="sb-card-action setup-return" data-setup-return="' + esc(opts.setupReturn.where) + '" data-setup-index="' + esc(opts.setupReturn.index == null ? '' : opts.setupReturn.index) + '"><span><strong>Return to hand</strong><small>Adjust setup</small></span><span>↩</span></button>'
      : '';
    return '<div class="sb-card-wrap' + (selected ? ' is-selected' : '') + (opts.setupReturn ? ' has-setup-return' : '') + '">' +
      '<div class="sb-card-control sb-card-control-shell' + (selected ? ' is-selected' : '') + (opts.primary ? ' is-primary' : '') + '"' +
      inspectAttrs +
      (opts.primary ? ' aria-pressed="' + (selected ? 'true' : 'false') + '" data-card-anchor="' + esc(anchor) + '"' : '') + '>' +
      face + liveCreatureStatus(creature, cardId, essenceUnits) +
      '</div>' +
      (setupReturn ? '<div class="sb-card-actions">' + setupReturn + '</div>' : '') +
      '</div>';
  }

  function inspectedFieldCreature(view, inspected) {
    if (!view || !inspected || inspected.kind !== 'field') return null;
    const player = inspected.owner === 'opponent' ? view.opponent : view.you;
    if (!player) return null;
    if (inspected.where === 'vanguard') return player.vanguard || null;
    if (inspected.where === 'reserve' && Number.isInteger(inspected.index) && inspected.index >= 0 && inspected.index < 4) {
      return Array.isArray(player.reserve) ? (player.reserve[inspected.index] || null) : null;
    }
    return null;
  }

  function renderSelectedCardInspector(view, canAct) {
    const node = $('cardInspector');
    if (!node) return;
    const inspected = state.inspectedCard;
    if (!inspected) {
      node.hidden = true;
      node.innerHTML = '';
      return;
    }

    let instance = null;
    let creature = null;
    let ownField = false;
    let where = '';
    let index = null;
    if (inspected.kind === 'hand') {
      const hand = view && view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
      instance = hand.find((row) => String(row.uid || '') === String(inspected.uid || '')) || null;
    } else if (inspected.kind === 'field') {
      creature = inspectedFieldCreature(view, inspected);
      instance = topInstance(creature);
      ownField = inspected.owner === 'you';
      where = String(inspected.where || '');
      index = inspected.index == null ? null : Number(inspected.index);
    }

    if (!instance) {
      state.inspectedCard = null;
      node.hidden = true;
      node.innerHTML = '';
      return;
    }

    const cardId = String(instance.card_id || '');
    const isOwnVanguard = !!(creature && ownField && where === 'vanguard');
    const abilityReady = isOwnVanguard && abilityReadyFor('vanguard', null, creature);
    const essenceUnits = creature ? attachedEssenceUnits(creature) : [];
    const face = renderCardFace(cardId, {
      mode: 'battle',
      abilityReady,
      interactiveAbility: !!abilityReady,
      abilityWhere: isOwnVanguard ? 'vanguard' : '',
      abilityIndex: null,
      interactiveAttacks: isOwnVanguard,
      attackStates: isOwnVanguard ? attackStatesFor(!!canAct) : null,
      attachedEssenceUnits: essenceUnits
    });
    node.hidden = false;
    node.innerHTML =
      '<button type="button" class="sb-card-inspector-backdrop" data-card-inspector-close="1" aria-label="Close card details"></button>' +
      '<section class="sb-card-inspector-panel" role="dialog" aria-modal="true" aria-label="' + esc(cardNameById(cardId) || 'Card') + ' card details">' +
      '<button type="button" class="sb-card-inspector-close" data-card-inspector-close="1" aria-label="Close card details">×</button>' +
      '<div class="sb-card-inspector-card">' + face + (creature ? liveCreatureStatus(creature, cardId, essenceUnits) : '') + '</div>' +
      '</section>';
  }

  function touchPrimaryInput() {
    return !!(
      window.matchMedia &&
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );
  }

  function handCard(instance) {
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
        '" data-play-hand-uid="' + esc(uid) + '" data-play-intent="' + esc(playIntent) +
        '" draggable="' + (touchPrimaryInput() ? 'false' : 'true') + '"';
    }
    return '<div class="sb-hand-card sb-hand-card-shell' + classes + '" data-card-id="' + esc(cardId) + '" data-inspect-hand-uid="' + esc(uid) + '"' + attributes + '>' +
      renderCardFace(cardId, { mode: 'compact' }) +
      '</div>';
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
    const youSeat = Number(view && view.you && view.you.seat);
    const yourSetup = !!(own && view && view.phase === 'setup' && Number(view.setup_turn_seat) === youSeat);
    const hasVanguard = !!(view && view.you && view.you.vanguard);
    const yourPromotion = !!(
      own &&
      view &&
      view.phase === 'resolution' &&
      view.pending_resolution &&
      String(view.pending_resolution.kind || '') === 'promote' &&
      Number(view.pending_resolution.seat) === youSeat &&
      !hasVanguard
    );
    node.innerHTML = [0, 1, 2, 3].map((index) => {
      const creature = reserve && reserve[index];
      const setupAvailable = !!(yourSetup && hasVanguard && !creature);
      const setupDestination = setupAvailable
        ? ' data-setup-destination="reserve" data-setup-index="' + index + '"'
        : '';
      const setupLegal = !!(setupAvailable && state.selectedHandUid && setupTargetLegal('reserve', index));
      const playLegal = !!(own && playTargetLegal('reserve', index, creature));
      const playDestination = own
        ? ' data-play-where="reserve" data-play-index="' + index + '"'
        : '';
      const promotionLegal = !!(yourPromotion && creature);
      const promotionDestination = promotionLegal ? ' data-promote-index="' + index + '"' : '';
      const legalClass =
        (setupAvailable ? ' sb-setup-destination' : '') +
        (setupLegal ? ' is-legal' : '') +
        (playLegal ? ' sb-play-destination is-play-legal' : '') +
        (promotionLegal ? ' sb-resolution-destination is-legal' : '');
      return '<section class="sb-reserve-slot' + legalClass + '"' + setupDestination + playDestination + promotionDestination + '><span>' +
        esc(ownerLabel) + ' Reserve ' + (index + 1) + '</span>' +
        creatureCard(creature, { own, where: 'reserve', index, setupReturn: own && creature ? setupReturnOptions('reserve', index) : null }) +
        '</section>';
    }).join('');
  }

  function pendingResolutionKey(view) {
    const pending = view && view.pending_resolution;
    if (!pending) return '';
    return [
      String(pending.kind || ''),
      Number(pending.seat || 0),
      Number(pending.count || 0),
      Number(view.you && view.you.rewards_count || 0),
      Number(view.opponent && view.opponent.rewards_count || 0)
    ].join(':');
  }

  function syncPendingResolutionSelection(view) {
    const key = pendingResolutionKey(view);
    if (key === state.pendingResolutionKey) return;
    state.pendingResolutionKey = key;
    state.selectedRewardPositions = [];
  }

  function renderRewardStack(target, count, own) {
    const node = $(target);
    if (!node) return;
    const view = viewState();
    const safe = Math.max(0, Math.min(6, Number(count || 0)));
    const youSeat = Number(view && view.you && view.you.seat);
    const pending = view && view.pending_resolution;
    const selectable = !!(
      own &&
      pending &&
      String(pending.kind || '') === 'take_reward' &&
      Number(pending.seat) === youSeat
    );
    const selected = new Set(state.selectedRewardPositions);
    node.innerHTML = Array.from({ length: 6 }, (_, index) => {
      const empty = index >= safe;
      if (selectable && !empty) {
        const on = selected.has(index);
        return '<button type="button" class="sb-reward-card is-selectable' + (on ? ' is-selected' : '') +
          '" data-reward-position="' + index + '" aria-pressed="' + (on ? 'true' : 'false') +
          '" aria-label="Reward Card ' + (index + 1) + '"></button>';
      }
      return '<span class="sb-reward-card' + (empty ? ' is-empty' : '') + '" aria-hidden="true"></span>';
    }).join('');
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
    const setupAvailable = !!(yourSetup && empty);
    const setupLegal = !!(setupAvailable && state.selectedHandUid && setupTargetLegal('vanguard', null));
    const playLegal = playTargetLegal('vanguard', null, creature);
    slot.className =
      'sb-vanguard-slot' +
      (setupAvailable ? ' sb-setup-destination' : '') +
      (setupLegal ? ' is-legal' : '') +
      (playLegal ? ' sb-play-destination is-play-legal' : '');
    if (setupAvailable) {
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
      state.pendingResolutionKey,
      state.selectedRewardPositions.join(','),
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

    const resolution = view.pending_resolution || null;
    if (resolution) {
      const resolutionSeat = Number(resolution.seat || 0);
      const yours = resolutionSeat === youSeat;
      const kind = String(resolution.kind || '');
      if (kind === 'take_reward') {
        const required = Math.max(0, Number(resolution.count || 0));
        const selectedCount = state.selectedRewardPositions.length;
        node.innerHTML =
          '<div class="sb-phase-card sb-choice-card">' +
          '<div class="sb-phase-copy"><strong>' + (yours ? 'Take Reward Card' + (required === 1 ? '' : 's') : 'Opponent Reward choice') + '</strong>' +
          '<small>' + (yours
            ? 'Select exactly ' + esc(required) + ' face-down Reward Card' + (required === 1 ? '' : 's') + ' from your Reward pile. The selected card' + (required === 1 ? '' : 's') + ' move to your hand, then resolution continues.'
            : 'Waiting for the opponent to take ' + esc(required) + ' Reward Card' + (required === 1 ? '' : 's') + '.') + '</small></div>' +
          (yours
            ? '<div class="sb-phase-actions"><button type="button" class="sb-phase-action ready" data-take-reward-confirm="1"' +
              (selectedCount === required ? '' : ' disabled') + '>Take ' + esc(required) + ' Reward' + (required === 1 ? '' : 's') + '</button></div>'
            : '') +
          '</div>';
        return;
      }
      if (kind === 'promote') {
        node.innerHTML =
          '<div class="sb-phase-card">' +
          '<div class="sb-phase-copy"><strong>' + (yours ? 'Choose your new Vanguard' : 'Opponent promotion') + '</strong>' +
          '<small>' + (yours
            ? 'Your Vanguard was defeated. Select one highlighted Reserve Creature to promote to Vanguard.'
            : 'Waiting for the opponent to promote one of their Reserve Creatures to Vanguard.') + '</small></div>' +
          '</div>';
        return;
      }
      node.innerHTML =
        '<div class="sb-phase-card"><div class="sb-phase-copy"><strong>Resolving match state</strong>' +
        '<small>The authoritative server is resolving ' + esc(kind || 'the pending action') + '.</small></div></div>';
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
            ? (selectedName
              ? selectedName + (touchPrimaryInput() ? ' selected — hold-drag to Your Vanguard, or tap Your Vanguard.' : ' selected — tap Your Vanguard first.')
              : 'Choose an eligible Creature for Your Vanguard first.')
            : (selectedName
              ? selectedName + (touchPrimaryInput() ? ' selected — hold-drag to an open Reserve slot, or tap it; then confirm your setup.' : ' selected — tap an open Reserve slot, or confirm your setup.')
              : 'Vanguard ready. Add optional Reserves or confirm your setup.'))
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
        : (yourTurn
          ? (touchPrimaryInput()
            ? 'Tap a card, or hold then drag it to a highlighted destination; field controls remain available.'
            : 'Select or drag a card from your hand, use your field controls, or pass.')
          : 'Your field stays synced while the opponent acts.');
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
        '<div class="sb-phase-actions"><button type="button" class="sb-phase-action ready" data-result-continue="1">Back to Matchmaking</button></div>' +
        '</div>';
      return;
    }

    node.innerHTML = '';
  }

  function render() {
    const view = viewState();
    if (!view) return;
    renderOpponentProfile();
    syncPendingResolutionSelection(view);

    const youSeat = Number(view.you && view.you.seat);
    const yourTurn = view.phase === 'play' && Number(view.active_seat) === youSeat;
    const pending = hasPendingAction(view);
    const canAttack = yourTurn && !pending && !state.busy;
    const yourSetup = view.phase === 'setup' && Number(view.setup_turn_seat) === youSeat;

    $('oppVanguard').innerHTML = creatureCard(view.opponent && view.opponent.vanguard, { own: false, where: 'vanguard', index: null });
    $('youVanguard').innerHTML = creatureCard(view.you && view.you.vanguard, {
      own: true,
      where: 'vanguard',
      index: null,
      primary: view.phase === 'play',
      canAct: canAttack,
      setupReturn: view.you && view.you.vanguard ? setupReturnOptions('vanguard', null) : null
    });
    renderReserve('oppReserve', view.opponent && view.opponent.reserve, 'Opponent', false);
    renderReserve('youReserve', view.you && view.you.reserve, 'Your', true);
    renderVanguardSetupTarget();
    renderSelectedCardInspector(view, canAttack);

    const hand = view.you && Array.isArray(view.you.hand) ? view.you.hand : [];
    $('yourHand').innerHTML = hand.map(handCard).join('') || '<div class="sb-zone-empty">No cards in hand</div>';

    renderRewardStack('oppRewards', view.opponent && view.opponent.rewards_count, false);
    renderRewardStack('yourRewards', view.you && view.you.rewards_count, true);
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
      else if (view.phase === 'resolution') turnPill.textContent = 'Resolution';
      else turnPill.textContent = yourTurn ? 'Your turn' : 'Opponent turn';
    }
    setText('revisionPill', 'Revision ' + revision());
    setText('phasePill', String(view.phase || '—'));
    const quitButton = $('quitMatchButton');
    if (quitButton) quitButton.disabled = state.busy || view.phase === 'complete';

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
    } else if (view.pending_resolution) {
      const resolution = view.pending_resolution;
      const yours = Number(resolution.seat) === youSeat;
      const kind = String(resolution.kind || '');
      if (kind === 'take_reward') {
        setStatus(yours ? 'Choose the required Reward Card(s), then confirm.' : 'Waiting for the opponent to take Reward Card(s).', yours ? 'ready' : 'wait');
      } else if (kind === 'promote') {
        setStatus(yours ? 'Choose a highlighted Reserve Creature to become your Vanguard.' : 'Waiting for the opponent to promote a Reserve Creature.', yours ? 'ready' : 'wait');
      } else {
        setStatus('The authoritative server is resolving the pending match action.', 'wait');
      }
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
    syncEssenceRailCompression();
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(syncEssenceRailCompression);
    }
  }

  function syncPlayTargetDom() {
    document.querySelectorAll('[data-play-where]').forEach((target) => {
      const where = String(target.dataset.playWhere || '');
      const raw = target.dataset.playIndex;
      const index = raw === '' || raw == null ? null : Number(raw);
      const legal = playTargetLegal(where, index, ownCreatureAt(where, index));
      target.classList.toggle('sb-play-destination', !!state.selectedHandUid);
      target.classList.toggle('is-play-legal', legal);
    });
  }

  function syncSetupTargetDom() {
    document.querySelectorAll('[data-setup-destination]').forEach((target) => {
      const where = String(target.dataset.setupDestination || '');
      const raw = target.dataset.setupIndex;
      const index = raw === '' || raw == null ? null : Number(raw);
      target.classList.toggle('is-legal', setupTargetLegal(where, index));
    });
  }

  function clearTouchDragHover() {
    document.querySelectorAll('.is-touch-drag-over').forEach((node) => {
      if (node && node.classList) node.classList.remove('is-touch-drag-over');
    });
  }

  function touchPoint(event, changed) {
    const list = changed ? event && event.changedTouches : event && event.touches;
    const point = list && list.length ? list[0] : null;
    return point ? { x: Number(point.clientX), y: Number(point.clientY) } : null;
  }

  function touchDropTarget(mode, x, y) {
    if (!document.elementFromPoint) return null;
    const hit = document.elementFromPoint(x, y);
    if (!hit || typeof hit.closest !== 'function') return null;
    return hit.closest(mode === 'setup' ? '[data-setup-destination]' : '[data-play-where]');
  }

  function touchTargetCoordinates(target, mode) {
    if (!target || !target.dataset) return null;
    if (mode === 'setup') {
      const where = String(target.dataset.setupDestination || '');
      const raw = target.dataset.setupIndex;
      return { where, index: raw === '' || raw == null ? null : Number(raw) };
    }
    const where = String(target.dataset.playWhere || '');
    const raw = target.dataset.playIndex;
    return { where, index: raw === '' || raw == null ? null : Number(raw) };
  }

  function touchTargetLegal(target, mode) {
    const coords = touchTargetCoordinates(target, mode);
    if (!coords) return false;
    if (mode === 'setup') return setupTargetLegal(coords.where, coords.index);
    return playTargetLegal(coords.where, coords.index, ownCreatureAt(coords.where, coords.index));
  }

  function bindTouchHandDrag(card, mode) {
    if (!touchPrimaryInput() || !card || typeof card.addEventListener !== 'function') return;
    if (mode === 'play' && directHandIntent(String(card.dataset.playIntent || ''))) return;
    const uid = String(mode === 'setup' ? card.dataset.setupHandUid || '' : card.dataset.playHandUid || '');
    if (!uid) return;

    let gesture = null;
    const holdMs = 170;
    const cancelDistance = 10;

    const clearTimer = () => {
      if (gesture && gesture.timer) {
        clearTimeout(gesture.timer);
        gesture.timer = null;
      }
    };

    const cleanupVisuals = () => {
      clearTouchDragHover();
      if (card.classList) card.classList.remove('is-dragging', 'is-touch-dragging');
      if (typeof card.removeAttribute === 'function') card.removeAttribute('aria-grabbed');
    };

    const cancelGesture = (rerender) => {
      clearTimer();
      const wasActive = !!(gesture && gesture.active);
      gesture = null;
      cleanupVisuals();
      if (wasActive && rerender) {
        state.overlayKey = '';
        render();
      }
    };

    const activate = () => {
      if (!gesture || gesture.active || state.busy) return;
      gesture.active = true;
      gesture.timer = null;
      state.selectedHandUid = uid;
      state.selectedAnchorUid = '';
      state.inspectedCard = null;
      state.overlayKey = '';
      if (card.classList) card.classList.add('is-dragging', 'is-touch-dragging', mode === 'setup' ? 'is-setup-selected' : 'is-play-selected');
      if (typeof card.setAttribute === 'function') card.setAttribute('aria-grabbed', 'true');
      if (mode === 'setup') syncSetupTargetDom();
      else syncPlayTargetDom();
      setStatus('Drag the selected card to a highlighted legal destination, or release and use tap mode.', 'ready');
    };

    card.addEventListener('touchstart', (event) => {
      if (state.busy || gesture || !event.touches || event.touches.length !== 1) return;
      const point = touchPoint(event, false);
      if (!point) return;
      gesture = {
        startX: point.x,
        startY: point.y,
        active: false,
        timer: setTimeout(activate, holdMs)
      };
    }, { passive: true });

    card.addEventListener('touchmove', (event) => {
      if (!gesture) return;
      const point = touchPoint(event, false);
      if (!point) return;
      if (!gesture.active) {
        const dx = point.x - gesture.startX;
        const dy = point.y - gesture.startY;
        if (Math.hypot(dx, dy) > cancelDistance) cancelGesture(false);
        return;
      }
      if (event.cancelable) event.preventDefault();
      clearTouchDragHover();
      const target = touchDropTarget(mode, point.x, point.y);
      if (target && touchTargetLegal(target, mode) && target.classList) target.classList.add('is-touch-drag-over');
    }, { passive: false });

    card.addEventListener('touchend', async (event) => {
      if (!gesture) return;
      clearTimer();
      if (!gesture.active) {
        gesture = null;
        return;
      }
      if (event.cancelable) event.preventDefault();
      const point = touchPoint(event, true);
      const target = point ? touchDropTarget(mode, point.x, point.y) : null;
      const legal = !!(target && touchTargetLegal(target, mode));
      const coords = legal ? touchTargetCoordinates(target, mode) : null;
      card.__sbTouchDragSuppressClick = true;
      cleanupVisuals();
      gesture = null;

      if (legal && coords) {
        if (mode === 'setup') await runSetupPlace(uid, coords.where, coords.index);
        else await runPlayHandTarget(coords.where, coords.index);
        return;
      }
      state.overlayKey = '';
      render();
    }, { passive: false });

    card.addEventListener('touchcancel', () => cancelGesture(true), { passive: true });
  }

  function bindCardControls() {
    document.querySelectorAll('[data-card-inspector-close]').forEach((button) => {
      button.addEventListener('click', (event) => {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
        if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
        state.inspectedCard = null;
        state.selectedAnchorUid = '';
        state.overlayKey = '';
        render();
      });
    });

    document.querySelectorAll('[data-inspect-field-owner]').forEach((card) => {
      const inspect = () => {
        if (state.busy) return;
        const owner = String(card.dataset.inspectFieldOwner || '');
        const where = String(card.dataset.inspectFieldWhere || '');
        const rawIndex = String(card.dataset.inspectFieldIndex || '');
        const index = rawIndex === '' ? null : Number(rawIndex);
        state.inspectedCard = { kind: 'field', owner, where, index };
        state.selectedAnchorUid = owner === 'you' && where === 'vanguard'
          ? String(card.dataset.cardAnchor || '')
          : '';
        state.overlayKey = '';
        render();
      };
      card.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-intent],[data-setup-return]')) return;
        inspect();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inspect();
        }
      });
    });

    document.querySelectorAll('[data-card-intent="attack"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const blockedReason = String(button.dataset.attackBlockedReason || '');
        if (blockedReason) {
          const guidance = blockedReason === 'Needs more matching Essence'
            ? ' Attach more matching Essence until the Attack cost orbs are covered.'
            : '';
          setStatus('Attack blocked — ' + blockedReason + '.' + guidance, 'wait');
          return;
        }
        await runAttackIntent(Number(button.dataset.attackSlot));
      });
    });

    document.querySelectorAll('[data-card-intent="ability"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const where = String(button.dataset.abilityWhere || '');
        const rawIndex = String(button.dataset.abilityIndex || '');
        const index = rawIndex === '' ? null : Number(rawIndex);
        await runAbilityIntent(where, index);
      });
    });

    document.querySelectorAll('[data-play-hand-uid]').forEach((card) => {
      const select = () => {
        if (card.__sbTouchDragSuppressClick) {
          card.__sbTouchDragSuppressClick = false;
          return;
        }
        if (state.busy) return;
        const uid = String(card.dataset.playHandUid || '');
        state.selectedHandUid = state.selectedHandUid === uid ? '' : uid;
        state.selectedAnchorUid = '';
        state.inspectedCard = { kind: 'hand', uid };
        state.overlayKey = '';
        render();
        if (state.selectedHandUid && window.matchMedia && window.matchMedia('(max-width: 640px), (hover: none) and (pointer: coarse)').matches) {
          window.requestAnimationFrame(() => {
            const intent = selectedHandIntent();
            const target = intent === 'play_creature' ? $('youReserve') : $('youVanguardSlot');
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
      card.addEventListener('dragstart', (event) => {
        if (state.busy) {
          event.preventDefault();
          return;
        }
        state.selectedHandUid = String(card.dataset.playHandUid || '');
        state.selectedAnchorUid = '';
        state.inspectedCard = null;
        state.overlayKey = '';
        card.classList.add('is-dragging', 'is-play-selected');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', state.selectedHandUid);
          event.dataTransfer.setData('application/x-stream-bandit-card', state.selectedHandUid);
        }
        syncPlayTargetDom();
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        syncPlayTargetDom();
      });
      bindTouchHandDrag(card, 'play');
    });

    document.querySelectorAll('[data-play-where]').forEach((target) => {
      const where = String(target.dataset.playWhere || '');
      const raw = target.dataset.playIndex;
      const index = raw === '' || raw == null ? null : Number(raw);

      target.addEventListener('dragover', (event) => {
        if (!playTargetLegal(where, index, ownCreatureAt(where, index))) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      });

      target.addEventListener('drop', async (event) => {
        event.preventDefault();
        if (state.busy) return;
        const uid = event.dataTransfer
          ? String(event.dataTransfer.getData('application/x-stream-bandit-card') || event.dataTransfer.getData('text/plain') || '')
          : '';
        if (uid) state.selectedHandUid = uid;
        if (!playTargetLegal(where, index, ownCreatureAt(where, index))) {
          state.overlayKey = '';
          render();
          return;
        }
        await runPlayHandTarget(where, index);
      });

      target.addEventListener('click', async (event) => {
        if (!state.selectedHandUid || state.busy) return;
        if (event.target.closest('[data-card-intent],[data-setup-return]')) return;
        if (!playTargetLegal(where, index, ownCreatureAt(where, index))) return;
        await runPlayHandTarget(where, index);
      });
    });
  }

  function bindPhaseControls() {
    document.querySelectorAll('[data-inspect-hand-uid]').forEach((card) => {
      if (card.hasAttribute && (card.hasAttribute('data-play-hand-uid') || card.hasAttribute('data-setup-hand-uid'))) return;
      card.addEventListener('click', () => {
        if (state.busy) return;
        state.inspectedCard = { kind: 'hand', uid: String(card.dataset.inspectHandUid || '') };
        state.overlayKey = '';
        render();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (state.busy) return;
          state.inspectedCard = { kind: 'hand', uid: String(card.dataset.inspectHandUid || '') };
          state.overlayKey = '';
          render();
        }
      });
    });


    document.querySelectorAll('[data-opening-choice]').forEach((button) => {
      button.addEventListener('click', async () => {
        await runOpeningChoice(String(button.dataset.openingChoice || ''));
      });
    });

    document.querySelectorAll('[data-setup-hand-uid]').forEach((card) => {
      const select = () => {
        if (card.__sbTouchDragSuppressClick) {
          card.__sbTouchDragSuppressClick = false;
          return;
        }
        if (state.busy) return;
        const uid = String(card.dataset.setupHandUid || '');
        state.selectedHandUid = state.selectedHandUid === uid ? '' : uid;
        state.inspectedCard = { kind: 'hand', uid };
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
      bindTouchHandDrag(card, 'setup');
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

    document.querySelectorAll('[data-play-direct]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runDirectHandPlay(String(button.dataset.playDirect || ''));
      });
    });

    document.querySelectorAll('[data-reward-position]').forEach((button) => {
      button.addEventListener('click', () => {
        const view = viewState();
        const pending = view && view.pending_resolution;
        const youSeat = Number(view && view.you && view.you.seat);
        if (
          state.busy ||
          !pending ||
          String(pending.kind || '') !== 'take_reward' ||
          Number(pending.seat) !== youSeat
        ) return;
        const required = Math.max(0, Number(pending.count || 0));
        const position = Number(button.dataset.rewardPosition);
        if (!Number.isInteger(position) || position < 0) return;
        const current = [...state.selectedRewardPositions];
        const existing = current.indexOf(position);
        if (existing >= 0) current.splice(existing, 1);
        else if (required === 1) current.splice(0, current.length, position);
        else if (current.length < required) current.push(position);
        state.selectedRewardPositions = current;
        state.overlayKey = '';
        render();
      });
    });

    document.querySelectorAll('[data-take-reward-confirm]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runTakeReward();
      });
    });

    document.querySelectorAll('[data-promote-index]').forEach((slot) => {
      slot.addEventListener('click', async (event) => {
        if (state.busy || event.target.closest('[data-card-intent],[data-setup-return]')) return;
        await runPromote(Number(slot.dataset.promoteIndex));
      });
    });

    document.querySelectorAll('[data-server-choice-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const view = viewState();
        const routed = currentServerChoice(view);
        const choice = routed && routed.choice;
        if (!choice || choice.waiting) return;
        const id = String(button.dataset.serverChoiceOption || '');
        const current = [...state.selectedChoiceIds];
        const existing = current.indexOf(id);
        if (existing >= 0) current.splice(existing, 1);
        else {
          const max = Math.max(1, Number(choice.max || 1));
          if (max === 1) current.splice(0, current.length, id);
          else if (current.length < max) current.push(id);
        }
        state.selectedChoiceIds = current;
        state.overlayKey = '';
        render();
      });
    });

    document.querySelectorAll('[data-server-choice-confirm]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runServerChoice();
      });
    });

    document.querySelectorAll('[data-end-turn]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runEndTurn();
      });
    });

    document.querySelectorAll('[data-concede]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!button.disabled) await runConcede();
      });
    });

    document.querySelectorAll('[data-result-continue]').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = 'tcg-play.html';
      });
    });
  }

  async function runConcede() {
    const view = viewState();
    if (!view || view.phase === 'complete' || state.busy) return;
    state.busy = true;
    state.overlayKey = '';
    const settings = $('battleSettings');
    if (settings) settings.open = false;
    render();
    setStatus('Conceding this match through the authoritative server…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, actionBase('concede'));
      state.selectedHandUid = '';
      state.selectedAnchorUid = '';
      state.selectedChoiceIds = [];
      state.pendingChoiceId = '';
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

  async function runPlayCommand(endpointName, action, payload, busyMessage) {
    const view = viewState();
    if (!activePlayTurn(view)) return;
    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus(busyMessage, 'busy');
    let failure = '';
    try {
      await callEdge(endpointName, Object.assign(actionBase(action), payload || {}));
      state.selectedHandUid = '';
      state.selectedChoiceIds = [];
      state.pendingChoiceId = '';
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

  async function runPlayHandTarget(where, index) {
    const view = viewState();
    const instance = selectedHandInstance();
    const intent = selectedHandIntent();
    const creature = ownCreatureAt(where, index);
    if (!instance || !playTargetLegal(where, index, creature)) return;
    const cardUid = String(instance.uid || '');
    if (!cardUid) return;

    if (intent === 'play_creature') {
      await runPlayCommand(
        API_MATCH,
        'play_creature',
        { card_uid: cardUid, reserve_index: Number(index) },
        'Playing the selected Creature through the authoritative Creature owner…'
      );
      return;
    }

    if (intent === 'evolve') {
      const payload = { card_uid: cardUid, where };
      if (where === 'reserve') payload.index = Number(index);
      await runPlayCommand(
        API_MATCH,
        'evolve',
        payload,
        'Evolving the selected Creature through the authoritative Creature owner…'
      );
      return;
    }

    if (intent === 'attach_essence') {
      const payload = { card_uid: cardUid, where };
      if (where === 'reserve') payload.index = Number(index);
      await runPlayCommand(
        API_MATCH,
        'attach_essence',
        payload,
        'Attaching Essence through the authoritative Essence attachment route…'
      );
      return;
    }

    if (intent === 'attach_relic') {
      const payload = { card_uid: cardUid, where };
      if (where === 'reserve') payload.index = Number(index);
      await runPlayCommand(
        API_MATCH,
        'attach_relic',
        payload,
        'Attaching Relic through the authoritative Relic owner…'
      );
    }
  }

  async function runDirectHandPlay(requestedIntent) {
    const instance = selectedHandInstance();
    const intent = selectedHandIntent();
    if (!instance || intent !== requestedIntent || !directHandIntent(intent)) return;
    const cardUid = String(instance.uid || '');
    if (!cardUid) return;
    if (intent === 'play_realm') {
      await runPlayCommand(
        API_MATCH,
        'play_realm',
        { card_uid: cardUid },
        'Playing Realm through the authoritative Realm owner…'
      );
      return;
    }
    if (intent === 'play_tactic') {
      await runPlayCommand(
        API_TACTIC,
        'play_tactic',
        { card_uid: cardUid },
        'Playing Tactic through the authoritative Tactic interpreter…'
      );
    }
  }

  async function runTakeReward() {
    const view = viewState();
    const pending = view && view.pending_resolution;
    const youSeat = Number(view && view.you && view.you.seat);
    const required = Math.max(0, Number(pending && pending.count || 0));
    const positions = [...state.selectedRewardPositions];
    if (
      !view ||
      !pending ||
      String(pending.kind || '') !== 'take_reward' ||
      Number(pending.seat) !== youSeat ||
      positions.length !== required ||
      state.busy
    ) return;

    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus('Moving the selected Reward Card(s) to your hand…', 'busy');
    let failure = '';
    try {
      await callEdge(
        API_MATCH,
        Object.assign(actionBase('take_reward'), { reward_positions: positions })
      );
      state.selectedRewardPositions = [];
      state.pendingResolutionKey = '';
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

  async function runPromote(reserveIndex) {
    const view = viewState();
    const pending = view && view.pending_resolution;
    const youSeat = Number(view && view.you && view.you.seat);
    const reserve = view && view.you && Array.isArray(view.you.reserve) ? view.you.reserve : [];
    if (
      !view ||
      !pending ||
      String(pending.kind || '') !== 'promote' ||
      Number(pending.seat) !== youSeat ||
      !Number.isInteger(reserveIndex) ||
      reserveIndex < 0 ||
      reserveIndex > 3 ||
      !reserve[reserveIndex] ||
      state.busy
    ) return;

    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus('Promoting the selected Reserve Creature to Vanguard…', 'busy');
    let failure = '';
    try {
      await callEdge(
        API_MATCH,
        Object.assign(actionBase('promote'), { reserve_index: reserveIndex })
      );
      state.pendingResolutionKey = '';
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

  async function runServerChoice() {
    const view = viewState();
    const routed = currentServerChoice(view);
    const choice = routed && routed.choice;
    if (!routed || !choice || choice.waiting || state.busy) return;
    const ids = [...state.selectedChoiceIds];
    const min = Math.max(0, Number(choice.min || 0));
    const max = Math.max(min, Number(choice.max == null ? min : choice.max));
    if (ids.length < min || ids.length > max) return;

    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus('Resolving the server choice…', 'busy');
    let failure = '';
    try {
      await callEdge(
        routed.endpoint,
        Object.assign(actionBase(routed.action), {
          choice_id: String(choice.id || ''),
          choice_ids: ids
        })
      );
      state.selectedChoiceIds = [];
      state.pendingChoiceId = '';
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
      state.inspectedCard = null;
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

  async function runAbilityIntent(where, index) {
    const view = viewState();
    const youSeat = Number(view && view.you && view.you.seat);
    if (
      !view ||
      view.phase !== 'play' ||
      Number(view.active_seat) !== youSeat ||
      hasPendingAction(view) ||
      state.busy ||
      !['vanguard', 'reserve'].includes(String(where || ''))
    ) return;
    state.busy = true;
    state.overlayKey = '';
    render();
    setStatus('Using the selected card Ability through the authoritative match engine…', 'busy');
    let failure = '';
    try {
      const payload = Object.assign(actionBase('use_ability'), { where: String(where) });
      if (where === 'reserve') payload.index = Number(index);
      await callEdge(API_MATCH, payload);
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

  async function refreshFieldActions() {
    const view = viewState();
    const youSeat = Number(view && view.you && view.you.seat);
    const eligible = !!(
      view &&
      view.phase === 'play' &&
      Number(view.active_seat) === youSeat &&
      !hasPendingAction(view)
    );
    if (!eligible) {
      state.fieldActions = null;
      return;
    }
    try {
      const response = await callEdge(API_MATCH, actionBase('field_actions'));
      state.fieldActions = response && response.result && typeof response.result === 'object' ? response.result : null;
    } catch (_) {
      state.fieldActions = null;
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
    if (view) {
      const youSeat = Number(view.you && view.you.seat);
      const mayKeepHandSelection =
        view.phase === 'setup' ||
        (view.phase === 'play' && Number(view.active_seat) === youSeat && !hasPendingAction(view));
      if (!mayKeepHandSelection) state.selectedHandUid = '';
    }

    await refreshFieldActions();
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
      const renderer = cardRenderer();
      if (!renderer || typeof renderer.ready !== 'function') throw new Error('The shared TCG card renderer is unavailable.');
      await renderer.ready();
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
