(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG V2 Battle Controller v0.2 / Tabletop V2.4.26';
  const API_SETUP = 'tcg-private-alpha-api';
  const API_MATCH = 'tcg-match-actions';
  const API_TACTIC = 'tcg-tactic-actions';
  const state = {
    client: null,
    session: null,
    matchId: '',
    view: null,
    selectedAnchorUid: '',
    selectedHandUid: '',
    evolutionProjectionUid: '',
    evolutionEligible: false,
    evolutionTargets: [],
    evolutionProjectionBusy: false,
    essenceProjectionUid: '',
    essenceEligible: false,
    essenceTargets: [],
    essenceProjectionBusy: false,
    relicProjectionUid: '',
    relicEligible: false,
    relicTargets: [],
    relicProjectionBusy: false,
    tacticProjectionUid: '',
    tacticEligible: false,
    tacticProjectionBusy: false,
    playProjectionUid: '',
    playTargets: [],
    playProjectionBusy: false,
    actionChoiceIds: [],
    fieldActionRevision: -1,
    fieldActionsBusy: false,
    fieldActionError: '',
    abilitySources: [],
    fieldWithdraw: { eligible: false, reason: '', cost: null, legal_targets: [], payment_options: [] },
    withdrawMode: false,
    withdrawTargetIndex: null,
    withdrawPaymentUids: [],
    resolutionKey: '',
    rewardPositions: [],
    promotionReserveIndex: null,
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

  function evolutionTargetKey(where, index) {
    return String(where || '') + ':' + (index == null ? 'vanguard' : String(index));
  }

  function clearEvolutionProjection() {
    state.evolutionProjectionUid = '';
    state.evolutionEligible = false;
    state.evolutionTargets = [];
    state.evolutionProjectionBusy = false;
  }

  function legalEvolutionTarget(where, index) {
    const key = evolutionTargetKey(where, index);
    return state.evolutionTargets.some((target) =>
      target && evolutionTargetKey(target.where, target.index) === key
    );
  }

  function clearEssenceProjection() {
    state.essenceProjectionUid = '';
    state.essenceEligible = false;
    state.essenceTargets = [];
    state.essenceProjectionBusy = false;
  }

  function legalEssenceTarget(where, index) {
    const key = evolutionTargetKey(where, index);
    return state.essenceTargets.some((target) =>
      target && evolutionTargetKey(target.where, target.index) === key
    );
  }

  function clearRelicProjection() {
    state.relicProjectionUid = '';
    state.relicEligible = false;
    state.relicTargets = [];
    state.relicProjectionBusy = false;
  }

  function legalRelicTarget(where, index) {
    const key = evolutionTargetKey(where, index);
    return state.relicTargets.some((target) =>
      target && evolutionTargetKey(target.where, target.index) === key
    );
  }

  function clearTacticProjection() {
    state.tacticProjectionUid = '';
    state.tacticEligible = false;
    state.tacticProjectionBusy = false;
  }

  function clearPlayProjection() {
    state.playProjectionUid = '';
    state.playTargets = [];
    state.playProjectionBusy = false;
  }

  function legalPlayCreatureTarget(index) {
    if (state.playProjectionBusy || state.playProjectionUid !== state.selectedHandUid || !Number.isInteger(index)) return false;
    return state.playTargets.some((target) =>
      target && target.kind === 'reserve' && target.reserve_index === index
    );
  }

  function legalPlayRealmTarget() {
    if (state.playProjectionBusy || state.playProjectionUid !== state.selectedHandUid) return false;
    return state.playTargets.some((target) => target && target.kind === 'realm');
  }

  function pendingActionChoice(view) {
    if (!view) return null;
    if (view.pending_attack_choice) return { pending: view.pending_attack_choice, owner: 'match', action: 'resolve_attack_choice' };
    if (view.pending_ability_choice) return { pending: view.pending_ability_choice, owner: 'match', action: 'resolve_ability_choice' };
    if (view.pending_event_listener_choice) return { pending: view.pending_event_listener_choice, owner: 'match', action: 'resolve_event_listener_choice' };
    if (view.pending_movement_listener_choice) {
      return {
        pending: view.pending_movement_listener_choice,
        owner: view.phase === 'effect_resolution' ? 'tactic' : 'match',
        action: view.phase === 'effect_resolution' ? 'resolve_choice' : 'resolve_movement_listener_choice'
      };
    }
    if (view.pending_heal_listener_choice) {
      return {
        pending: view.pending_heal_listener_choice,
        owner: view.phase === 'effect_resolution' ? 'tactic' : 'match',
        action: view.phase === 'effect_resolution' ? 'resolve_choice' : 'resolve_heal_listener_choice'
      };
    }
    if (view.pending_choice) return { pending: view.pending_choice, owner: 'tactic', action: 'resolve_choice' };
    return null;
  }

  function yourCreatureAt(view, where, index) {
    if (!view || !view.you) return null;
    if (where === 'vanguard') return view.you.vanguard || null;
    if (where === 'reserve' && Number.isInteger(index) && index >= 0 && index <= 3) {
      return Array.isArray(view.you.reserve) ? (view.you.reserve[index] || null) : null;
    }
    return null;
  }

  function fieldHasAnchor(view, anchorUid) {
    if (!anchorUid || !view || !view.you) return false;
    if (cardAnchor(view.you.vanguard) === anchorUid) return true;
    const reserve = Array.isArray(view.you.reserve) ? view.you.reserve : [];
    return reserve.some((creature) => cardAnchor(creature) === anchorUid);
  }

  function clearWithdrawMode() {
    state.withdrawMode = false;
    state.withdrawTargetIndex = null;
    state.withdrawPaymentUids = [];
  }

  function clearFieldActionProjection() {
    state.fieldActionRevision = -1;
    state.fieldActionsBusy = false;
    state.fieldActionError = '';
    state.abilitySources = [];
    state.fieldWithdraw = { eligible: false, reason: '', cost: null, legal_targets: [], payment_options: [] };
  }

  function resolutionDescriptor(view) {
    if (!view || view.phase !== 'resolution' || !view.pending_resolution) return null;
    const pending = view.pending_resolution;
    const seat = Number(pending.seat);
    const kind = String(pending.kind || '');
    if ((seat !== 1 && seat !== 2) || (kind !== 'take_reward' && kind !== 'promote')) return null;
    const countRaw = Number(pending.count);
    return {
      kind,
      seat,
      count: Number.isInteger(countRaw) && countRaw >= 0 ? countRaw : 0
    };
  }

  function ownResolution(view) {
    const pending = resolutionDescriptor(view);
    const seat = Number(view && view.you && view.you.seat);
    return pending && pending.seat === seat ? pending : null;
  }

  function syncResolutionSelection(view) {
    const pending = resolutionDescriptor(view);
    const key = pending ? [revision(), pending.kind, pending.seat, pending.count].join(':') : '';
    if (state.resolutionKey !== key) {
      state.resolutionKey = key;
      state.rewardPositions = [];
      state.promotionReserveIndex = null;
    }
  }

  function fieldActionsFresh() {
    return state.fieldActionRevision === revision();
  }

  function legalAbilitySource(where, index, anchorUid) {
    if (!fieldActionsFresh() || !anchorUid) return false;
    return state.abilitySources.some((source) =>
      source &&
      source.where === where &&
      (where === 'vanguard' ? source.index === null : source.index === index) &&
      source.anchor_uid === anchorUid
    );
  }

  function printedActiveAbility(creature) {
    const instance = topInstance(creature);
    const structured = instance ? structuredDefinition(instance) : null;
    const ability = structured && structured.creature && typeof structured.creature === 'object'
      ? structured.creature.ability
      : null;
    return !!ability && typeof ability === 'object' && String(ability.mode || '').toLowerCase() === 'active';
  }

  function abilityContextAction(creature, where, index) {
    if (!creature || !fieldActionsFresh() || !printedActiveAbility(creature)) return null;
    const anchor = cardAnchor(creature);
    if (!anchor) return null;
    if (legalAbilitySource(where, index, anchor)) {
      return {
        intent: 'use_ability',
        label: 'Use Ability',
        detail: 'Ability ready · server projected',
        where,
        index
      };
    }
    return {
      intent: 'ability_status',
      label: 'Ability locked',
      detail: 'Not server-available now',
      where,
      index,
      enabled: false
    };
  }

  function legalWithdrawTarget(index) {
    if (!fieldActionsFresh() || !Number.isInteger(index)) return false;
    const view = viewState();
    const creature = yourCreatureAt(view, 'reserve', index);
    const anchor = cardAnchor(creature);
    return !!anchor && state.fieldWithdraw.legal_targets.some((target) =>
      target && target.reserve_index === index && target.anchor_uid === anchor
    );
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
    const contextActions = Array.isArray(opts.contextActions) ? opts.contextActions : [];
    const selected = anchor && state.selectedAnchorUid === anchor;
    const actions = [];
    if (opts.primary) {
      actions.push(...attackSlots(creature).map((entry) => ({
        slot: entry.slot,
        attack: entry.attack,
        name: entry.name,
        enabled: !!opts.canAct
      })));
    }
    actions.push(...contextActions);
    return knownCard(instance, {
      creature,
      actions,
      interactive: !!opts.primary || contextActions.length > 0,
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
    const playCreatureTargets = !!opts.playCreatureTargets;
    const setupReturn = !!opts.setupReturn;
    const evolutionTargets = !!opts.evolutionTargets;
    const essenceTargets = !!opts.essenceTargets;
    const relicTargets = !!opts.relicTargets;
    const abilityActions = !!opts.abilityActions;
    const withdrawTargets = !!opts.withdrawTargets;
    const promotionTargets = !!opts.promotionTargets;
    node.innerHTML = [0, 1, 2, 3].map((index) => {
      const creature = reserve && reserve[index];
      const playCreatureTarget = playCreatureTargets && !creature && legalPlayCreatureTarget(index);
      const evolutionTarget = evolutionTargets && !!creature && legalEvolutionTarget('reserve', index);
      const essenceTarget = essenceTargets && !!creature && legalEssenceTarget('reserve', index);
      const relicTarget = relicTargets && !!creature && legalRelicTarget('reserve', index);
      const withdrawTarget = withdrawTargets && !!creature && legalWithdrawTarget(index);
      const promotionTarget = promotionTargets && !!creature;
      const targetAttrs = evolutionTarget
        ? ' tabindex="0" role="button" data-evolve-target-where="reserve" data-evolve-target-index="' + index + '" aria-label="Evolve selected card onto ' + ownerLabel + ' Reserve ' + (index + 1) + '"'
        : (essenceTarget
          ? ' tabindex="0" role="button" data-essence-target-where="reserve" data-essence-target-index="' + index + '" aria-label="Attach selected Essence to ' + ownerLabel + ' Reserve ' + (index + 1) + '"'
          : (relicTarget
            ? ' tabindex="0" role="button" data-relic-target-where="reserve" data-relic-target-index="' + index + '" aria-label="Attach selected Relic to ' + ownerLabel + ' Reserve ' + (index + 1) + '"'
            : (withdrawTarget
              ? ' tabindex="0" role="button" data-withdraw-target-index="' + index + '" aria-label="Choose ' + ownerLabel + ' Reserve ' + (index + 1) + ' as the server-projected Withdrawal target"'
              : (promotionTarget
                ? ' tabindex="0" role="button" data-promotion-reserve-index="' + index + '" aria-label="Select ' + ownerLabel + ' Reserve ' + (index + 1) + ' for mandatory promotion"'
                : (playCreatureTarget
                  ? ' tabindex="0" role="button" data-play-creature-reserve-index="' + index + '" aria-label="Play selected card to server-projected ' + ownerLabel + ' Reserve ' + (index + 1) + '"'
                  : (handTarget
                    ? ' tabindex="0" role="button" data-setup-place-where="reserve" data-setup-place-index="' + index + '" aria-label="Try selected hand card in ' + ownerLabel + ' Reserve ' + (index + 1) + ' during setup"'
                    : ''))))));
      const contextActions = [];
      if (setupReturn && creature) {
        contextActions.push({ intent: 'setup_return', label: 'Return to hand', detail: 'Setup placement', where: 'reserve', index });
      }
      if (abilityActions && creature) {
        const abilityAction = abilityContextAction(creature, 'reserve', index);
        if (abilityAction) contextActions.push(abilityAction);
      }
      return '<section class="sb-reserve-slot' + ((handTarget || playCreatureTarget) ? ' is-hand-target' : '') + (evolutionTarget ? ' is-evolution-target' : '') + (essenceTarget ? ' is-essence-target' : '') + (relicTarget ? ' is-relic-target' : '') + (withdrawTarget ? ' is-withdraw-target' : '') + (withdrawTarget && state.withdrawTargetIndex === index ? ' is-withdraw-target-selected' : '') + (promotionTarget ? ' is-promotion-target' : '') + (promotionTarget && state.promotionReserveIndex === index ? ' is-promotion-selected' : '') + '"' + targetAttrs + '><span class="sb-slot-label">' +
        ownerLabel + ' Reserve ' + (index + 1) + '</span>' + creatureCard(creature, { contextActions }) + '</section>';
    }).join('');
  }

  function renderYourVanguard(creature, options) {
    const node = $('youVanguard');
    if (!node) return;
    const opts = options || {};
    const contextActions = [];
    if (opts.setupReturn && creature) {
      contextActions.push({ intent: 'setup_return', label: 'Return to hand', detail: 'Setup Vanguard', where: 'vanguard' });
    }
    if (opts.abilityAction && creature) {
      const abilityAction = abilityContextAction(creature, 'vanguard', null);
      if (abilityAction) contextActions.push(abilityAction);
    }
    if (opts.withdrawAction && creature && state.fieldWithdraw.eligible === true) {
      const cost = Number(state.fieldWithdraw.cost);
      contextActions.push({
        intent: 'withdraw',
        label: 'Withdraw',
        detail: 'Server cost ' + (Number.isInteger(cost) && cost >= 0 ? cost : '—') + ' Essence',
        where: 'vanguard'
      });
    }
    const card = creatureCard(creature, { primary: !!opts.primary, canAct: !!opts.canAct, contextActions });
    const evolutionTarget = !!opts.evolutionTargets && !!creature && legalEvolutionTarget('vanguard', null);
    const essenceTarget = !!opts.essenceTargets && !!creature && legalEssenceTarget('vanguard', null);
    const relicTarget = !!opts.relicTargets && !!creature && legalRelicTarget('vanguard', null);
    if (evolutionTarget) {
      node.innerHTML = '<div class="sb-vanguard-hand-target is-evolution-target" tabindex="0" role="button" data-evolve-target-where="vanguard" aria-label="Evolve selected card onto your Vanguard">' + card + '</div>';
    } else if (essenceTarget) {
      node.innerHTML = '<div class="sb-vanguard-hand-target is-essence-target" tabindex="0" role="button" data-essence-target-where="vanguard" aria-label="Attach selected Essence to your Vanguard">' + card + '</div>';
    } else if (relicTarget) {
      node.innerHTML = '<div class="sb-vanguard-hand-target is-relic-target" tabindex="0" role="button" data-relic-target-where="vanguard" aria-label="Attach selected Relic to your Vanguard">' + card + '</div>';
    } else if (opts.handTarget) {
      node.innerHTML = '<div class="sb-vanguard-hand-target is-hand-target" tabindex="0" role="button" data-setup-place-where="vanguard" aria-label="Try selected hand card as your Vanguard during setup">' + card + '</div>';
    } else {
      node.innerHTML = card;
    }
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

  function renderRewards(target, count, label, options) {
    const node = $(target);
    if (!node) return;
    const opts = options || {};
    const selectable = !!opts.selectable;
    const remaining = Math.min(6, countValue(count));
    node.innerHTML = Array.from({ length: 6 }, (_, index) => {
      const active = index < remaining;
      const selected = active && selectable && state.rewardPositions.includes(index);
      const attrs = active && selectable
        ? ' tabindex="0" role="button" data-reward-position="' + index + '" aria-pressed="' + (selected ? 'true' : 'false') + '" aria-label="Select face-down Reward position ' + (index + 1) + '"'
        : '';
      return '<div class="sb-reward-slot' + (active ? '' : ' is-claimed') + (active && selectable ? ' is-resolution-target' : '') + (selected ? ' is-resolution-selected' : '') + '"' + attrs + '>' +
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
      const tacticAction = !!uid && state.tacticProjectionUid === uid && state.tacticEligible
        ? [{
            intent: 'play_tactic',
            label: 'Play Tactic',
            detail: 'Server-authorized Tactic'
          }]
        : [];
      return knownCard(instance, {
        compact: true,
        interactive: !!canPlayFromHand && !!uid,
        selected: !!uid && state.selectedHandUid === uid,
        anchor: 'hand:' + uid,
        actions: tacticAction
      });
    }).join('') || '<div class="sb-zone-empty">No cards in hand</div>';
    if ($('yourHandCount')) $('yourHandCount').textContent = String(countValue(view.you && view.you.hand_count != null ? view.you.hand_count : hand.length));
  }

  function resultReasonLabel(value) {
    return String(value || '').replace(/_/g, ' ').replace(/[^A-Za-z0-9 -]/g, '').trim();
  }

  function resultDescriptor(view) {
    if (!view || !view.result || typeof view.result !== 'object') return null;
    const seat = Number(view.you && view.you.seat);
    const winnerSeat = Number(view.result.winner_seat);
    const reasons = Array.isArray(view.result.reasons)
      ? view.result.reasons.map(resultReasonLabel).filter(Boolean)
      : [];
    const reason = resultReasonLabel(view.result.reason);
    if (winnerSeat === 1 || winnerSeat === 2) {
      return {
        outcome: winnerSeat === seat ? 'Victory' : 'Defeat',
        winner_seat: winnerSeat,
        reasons
      };
    }
    if (view.phase === 'overtime_pending') {
      return {
        outcome: 'Overtime pending',
        winner_seat: null,
        reasons: reason ? [reason] : []
      };
    }
    return null;
  }

  function renderPhaseControls(view) {
    const node = $('phaseControls');
    if (!node) return;
    const seat = Number(view.you && view.you.seat);
    const resolution = resolutionDescriptor(view);
    const localResolution = ownResolution(view);
    const result = resultDescriptor(view);
    let markup = '';
    if (view.phase === 'complete' && result) {
      markup = '<span data-match-result="complete"><strong>' + result.outcome + '</strong>' +
        (result.reasons.length ? ' · ' + result.reasons.join(' · ') : ' · Match complete') + '</span>';
    } else if (view.phase === 'overtime_pending' && result) {
      markup = '<span data-match-result="overtime"><strong>Overtime pending</strong>' +
        (result.reasons.length ? ' · ' + result.reasons.join(' · ') : '') + '</span>';
    } else if (view.phase === 'opening_choice') {
      if (Number(view.toss_winner_seat) === seat) {
        markup = '<span>Opening toss won. Choose turn order:</span>' +
          '<button type="button" data-lifecycle-intent="opening_choice" data-choice="first">Go first</button>' +
          '<button type="button" data-lifecycle-intent="opening_choice" data-choice="second">Go second</button>';
      } else {
        markup = '<span>Waiting for the toss winner to choose who goes first.</span>';
      }
    } else if (view.phase === 'setup') {
      if (Number(view.setup_turn_seat) === seat) {
        markup = '<span>Your setup turn. Place a Vanguard and any Reserve starters, then lock setup.</span>' +
          '<button type="button" data-lifecycle-intent="setup_ready">Setup ready</button>';
      } else {
        markup = '<span>Waiting for the other player to finish setup.</span>';
      }
    } else if (view.phase === 'resolution' && resolution) {
      if (!localResolution) {
        markup = '<span>Waiting for the other player to resolve ' + (resolution.kind === 'take_reward' ? 'Reward Cards' : 'mandatory promotion') + '.</span>';
      } else if (localResolution.kind === 'take_reward') {
        const count = localResolution.count;
        const selected = state.rewardPositions.length;
        markup = '<span>Take ' + count + ' Reward Card' + (count === 1 ? '' : 's') + ': select face-down Reward positions (' + selected + '/' + count + ').</span>' +
          '<button type="button" data-resolution-intent="take_reward"' + (selected === count ? '' : ' disabled') + '>Take selected Reward' + (count === 1 ? '' : 's') + '</button>';
      } else if (localResolution.kind === 'promote') {
        const selected = Number.isInteger(state.promotionReserveIndex);
        markup = '<span>Your Vanguard was defeated. Select a highlighted Reserve Creature for mandatory promotion.</span>' +
          '<button type="button" data-resolution-intent="promote"' + (selected ? '' : ' disabled') + '>Confirm promotion</button>';
      }
    }
    node.innerHTML = markup;
    node.hidden = !markup;
  }

  function renderActionChoice(view) {
    const panel = $('tacticChoicePanel');
    const prompt = $('tacticChoicePrompt');
    const rule = $('tacticChoiceRule');
    const optionsNode = $('tacticChoiceOptions');
    const submit = $('tacticChoiceSubmit');
    const cancel = $('actionChoiceCancel');
    if (!panel || !prompt || !rule || !optionsNode || !submit || !cancel) return;

    const route = pendingActionChoice(view);
    const pending = route && route.pending ? route.pending : null;

    if (!pending && state.withdrawMode) {
      panel.hidden = false;
      cancel.hidden = false;
      cancel.onclick = () => {
        clearWithdrawMode();
        render();
      };
      submit.textContent = 'Confirm Withdraw';

      const projected = state.fieldWithdraw || {};
      const costRaw = Number(projected.cost);
      const cost = Number.isInteger(costRaw) && costRaw >= 0 ? costRaw : 0;
      const paymentOptions = Array.isArray(projected.payment_options) ? projected.payment_options : [];
      const validIds = new Set(paymentOptions.map((option) => String(option && option.uid || '')).filter(Boolean));
      state.withdrawPaymentUids = state.withdrawPaymentUids.filter((uid) => validIds.has(uid));
      const targetReady = legalWithdrawTarget(state.withdrawTargetIndex);
      if (!targetReady) state.withdrawTargetIndex = null;

      prompt.textContent = 'Withdraw Vanguard';
      rule.textContent = (targetReady ? 'Reserve ' + (state.withdrawTargetIndex + 1) + ' selected' : 'Choose a green Reserve target') +
        ' · select exactly ' + cost + ' projected Essence.';
      optionsNode.replaceChildren();

      paymentOptions.forEach((option) => {
        const uid = String(option && option.uid || '');
        if (!uid) return;
        const selected = state.withdrawPaymentUids.includes(uid);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sb-tactic-choice-option' + (selected ? ' is-selected' : '');
        button.dataset.withdrawPaymentUid = uid;
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        button.textContent = String(option && option.label || option && option.card_id || 'Essence');
        button.onclick = () => {
          const index = state.withdrawPaymentUids.indexOf(uid);
          if (index >= 0) state.withdrawPaymentUids.splice(index, 1);
          else if (state.withdrawPaymentUids.length < cost) state.withdrawPaymentUids.push(uid);
          renderActionChoice(viewState());
        };
        optionsNode.appendChild(button);
      });

      submit.disabled = !targetReady || state.withdrawPaymentUids.length !== cost;
      submit.onclick = submit.disabled ? null : async () => {
        await runWithdrawIntent();
      };
      return;
    }

    if (!pending) {
      panel.hidden = true;
      state.actionChoiceIds = [];
      optionsNode.replaceChildren();
      submit.disabled = true;
      submit.onclick = null;
      submit.textContent = 'Confirm choice';
      cancel.hidden = true;
      cancel.onclick = null;
      return;
    }

    clearWithdrawMode();
    panel.hidden = false;
    cancel.hidden = true;
    cancel.onclick = null;
    submit.textContent = 'Confirm choice';

    const waiting = pending.waiting === true;
    if (waiting) {
      prompt.textContent = 'Waiting for the other player to resolve ' + String(pending.kind || 'the card choice') + '.';
      rule.textContent = 'The authoritative gameplay owner is waiting on the other seat.';
      optionsNode.replaceChildren();
      submit.disabled = true;
      submit.onclick = null;
      state.actionChoiceIds = [];
      return;
    }

    const minRaw = Number(pending.min);
    const maxRaw = Number(pending.max);
    const min = Number.isInteger(minRaw) && minRaw >= 0 ? minRaw : 0;
    const max = Number.isInteger(maxRaw) && maxRaw >= min ? maxRaw : min;
    const mode = String(pending.mode || 'select');
    const options = Array.isArray(pending.options)
      ? pending.options.map((option) => ({
          id: String(option && option.id || ''),
          label: String(option && option.label || option && option.id || '')
        })).filter((option) => option.id)
      : [];
    const validIds = new Set(options.map((option) => option.id));
    state.actionChoiceIds = state.actionChoiceIds.filter((id) => validIds.has(id));

    prompt.textContent = String(pending.prompt || pending.kind || 'Resolve card choice');
    rule.textContent = 'Choose ' + min + ' to ' + max + (mode === 'order' ? ' in order.' : '.');
    optionsNode.replaceChildren();

    options.forEach((option) => {
      const selectedIndex = state.actionChoiceIds.indexOf(option.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'sb-tactic-choice-option' + (selectedIndex >= 0 ? ' is-selected' : '');
      button.dataset.actionChoiceId = option.id;
      button.setAttribute('aria-pressed', selectedIndex >= 0 ? 'true' : 'false');

      const label = document.createElement('span');
      label.textContent = option.label;
      button.appendChild(label);

      if (mode === 'order' && selectedIndex >= 0) {
        const order = document.createElement('strong');
        order.className = 'sb-tactic-choice-order';
        order.textContent = String(selectedIndex + 1);
        button.appendChild(order);
      }

      button.onclick = () => {
        const currentRoute = pendingActionChoice(viewState());
        const current = currentRoute && currentRoute.pending ? currentRoute.pending : null;
        if (!current || current.waiting === true || String(current.id || '') !== String(pending.id || '')) return;
        const existingIndex = state.actionChoiceIds.indexOf(option.id);
        if (existingIndex >= 0) state.actionChoiceIds.splice(existingIndex, 1);
        else if (mode === 'order' || state.actionChoiceIds.length < max) state.actionChoiceIds.push(option.id);
        renderActionChoice(viewState());
      };
      optionsNode.appendChild(button);
    });

    submit.disabled = state.actionChoiceIds.length < min || state.actionChoiceIds.length > max;
    submit.onclick = submit.disabled ? null : async () => {
      await runPendingChoiceIntent();
    };
  }

  function renderRealm(view, realmTarget) {
    const node = $('realmSlot');
    if (!node) return;
    const target = node.closest('.sb-realm-slot');
    if (target) {
      target.classList.toggle('is-hand-target', !!realmTarget);
      if (realmTarget) {
        target.setAttribute('tabindex', '0');
        target.setAttribute('role', 'button');
        target.setAttribute('data-play-realm-target', 'true');
        target.setAttribute('aria-label', 'Play selected card to the server-projected shared Realm slot');
      } else {
        target.removeAttribute('tabindex');
        target.removeAttribute('role');
        target.removeAttribute('data-play-realm-target');
        target.removeAttribute('aria-label');
      }
    }
    node.innerHTML = view.realm
      ? knownCard(view.realm, { compact: false })
      : '<div class="sb-zone-empty">No Realm in play</div>';
  }

  function render() {
    const view = viewState();
    if (!view) return;
    const seat = Number(view.you && view.you.seat);
    const yourTurn = view.phase === 'play' && Number(view.active_seat) === seat;
    const yourSetup = view.phase === 'setup' && Number(view.setup_turn_seat) === seat;
    const yourOpeningChoice = view.phase === 'opening_choice' && Number(view.toss_winner_seat) === seat;
    const localResolution = ownResolution(view);
    const rewardResolution = !!localResolution && localResolution.kind === 'take_reward';
    const promotionResolution = !!localResolution && localResolution.kind === 'promote';
    const pending = !!(view.pending_attack_choice || view.pending_ability_choice || view.pending_event_listener_choice || view.pending_movement_listener_choice || view.pending_heal_listener_choice || view.pending_choice || view.pending_resolution);
    const projectedFieldActions = fieldActionsFresh();
    const localWithdraw = state.withdrawMode && projectedFieldActions;
    const canAttack = yourTurn && !pending && !state.busy && !localWithdraw;
    const canPlayFromHand = yourTurn && !pending && !state.busy && !localWithdraw;
    const canSetup = yourSetup && !pending && !state.busy;
    const canSelectFromHand = canPlayFromHand || canSetup;
    const setupHandTarget = !!state.selectedHandUid && canSetup;
    const selectedPlayCard = !!state.selectedHandUid && canPlayFromHand;
    const evolutionMode = selectedPlayCard && state.evolutionProjectionUid === state.selectedHandUid && state.evolutionEligible;
    const essenceMode = selectedPlayCard && !evolutionMode && state.essenceProjectionUid === state.selectedHandUid && state.essenceEligible;
    const relicMode = selectedPlayCard && !evolutionMode && !essenceMode && state.relicProjectionUid === state.selectedHandUid && state.relicEligible;
    const tacticMode = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode && state.tacticProjectionUid === state.selectedHandUid && state.tacticEligible;
    const directPlayMode = selectedPlayCard && !evolutionMode && !essenceMode && !relicMode && !tacticMode &&
      state.playProjectionUid === state.selectedHandUid && !state.playProjectionBusy &&
      !state.evolutionProjectionBusy && !state.essenceProjectionBusy && !state.relicProjectionBusy && !state.tacticProjectionBusy;
    const playCreatureTargets = directPlayMode && state.playTargets.some((target) => target && target.kind === 'reserve');
    const playRealmTarget = directPlayMode && legalPlayRealmTarget();

    $('oppVanguard').innerHTML = creatureCard(view.opponent && view.opponent.vanguard, {});
    renderYourVanguard(view.you && view.you.vanguard, {
      primary: view.phase === 'play',
      canAct: canAttack,
      handTarget: setupHandTarget,
      evolutionTargets: evolutionMode,
      essenceTargets: essenceMode,
      relicTargets: relicMode,
      setupReturn: canSetup,
      abilityAction: projectedFieldActions && yourTurn && !pending && !state.busy && !localWithdraw,
      withdrawAction: projectedFieldActions && yourTurn && !pending && !state.busy && !localWithdraw
    });
    renderReserve('oppReserve', view.opponent && view.opponent.reserve, 'Opponent');
    renderReserve('youReserve', view.you && view.you.reserve, 'Your', {
      handTarget: setupHandTarget,
      playCreatureTargets,
      evolutionTargets: evolutionMode,
      essenceTargets: essenceMode,
      relicTargets: relicMode,
      setupReturn: canSetup,
      abilityActions: projectedFieldActions && yourTurn && !pending && !state.busy && !localWithdraw,
      withdrawTargets: localWithdraw,
      promotionTargets: promotionResolution
    });
    renderRealm(view, playRealmTarget);

    renderOpponentHand(view);
    renderYourHand(view, canSelectFromHand);
    renderDeck('oppDeck', view.opponent && view.opponent.deck_count, 'Opponent');
    renderRewards('oppRewards', view.opponent && view.opponent.rewards_count, 'Opponent');
    renderDiscard('oppDiscard', view.opponent && view.opponent.discard_count, 'Opponent');
    renderDeck('yourDeck', view.you && view.you.deck_count, 'Your');
    renderRewards('yourRewards', view.you && view.you.rewards_count, 'Your', { selectable: rewardResolution });
    renderDiscard('yourDiscard', view.you && view.you.discard_count, 'Your');
    renderPhaseControls(view);
    renderActionChoice(view);

    if (view.phase === 'complete') $('turnPill').textContent = 'Match complete';
    else if (view.phase === 'overtime_pending') $('turnPill').textContent = 'Overtime pending';
    else if (view.phase === 'opening_choice') $('turnPill').textContent = yourOpeningChoice ? 'Your opening choice' : 'Opening choice';
    else if (view.phase === 'setup') $('turnPill').textContent = yourSetup ? 'Your setup' : 'Opponent setup';
    else if (view.phase === 'resolution') $('turnPill').textContent = localResolution ? 'Your resolution' : 'Resolution';
    else $('turnPill').textContent = yourTurn ? 'Your turn' : 'Opponent turn';
    $('revisionPill').textContent = 'Revision ' + revision();
    $('phasePill').textContent = String(view.phase || '—');

    const terminalResult = resultDescriptor(view);
    if (view.phase === 'complete' && terminalResult) {
      setStatus(terminalResult.outcome + '. Match complete' + (terminalResult.reasons.length ? ' · ' + terminalResult.reasons.join(' · ') : '') + '.', 'ready');
    }
    else if (view.phase === 'overtime_pending' && terminalResult) {
      setStatus('Overtime pending. The authoritative Match Flow owner has not declared a winner.', 'wait');
    }
    else if (view.phase === 'resolution' && localResolution && localResolution.kind === 'take_reward') {
      setStatus('Reward resolution: choose exactly ' + localResolution.count + ' face-down Reward position' + (localResolution.count === 1 ? '' : 's') + ', then confirm.', 'ready');
    }
    else if (view.phase === 'resolution' && localResolution && localResolution.kind === 'promote') {
      setStatus('Mandatory promotion: your Vanguard was defeated. Choose a highlighted Reserve Creature, then confirm.', 'ready');
    }
    else if (view.phase === 'resolution' && resolutionDescriptor(view)) setStatus('Waiting for the other player to finish mandatory resolution.', 'wait');
    else if (pending) setStatus('The board is authoritative. Resolve the pending server choice before another card action.', 'wait');
    else if (state.withdrawMode) {
      const cost = Number(state.fieldWithdraw && state.fieldWithdraw.cost);
      setStatus('Withdraw selected. Choose a green Reserve target and exactly ' + (Number.isInteger(cost) && cost >= 0 ? cost : 0) + ' projected Essence, then confirm or cancel.', 'ready');
    }
    else if (yourTurn && state.fieldActionError) setStatus('Card-action projection unavailable: ' + state.fieldActionError, 'error');
    else if (view.phase === 'opening_choice' && yourOpeningChoice) setStatus('You won the opening toss. Choose whether to go first or second.', 'ready');
    else if (view.phase === 'opening_choice') setStatus('Waiting for the toss winner to choose turn order.', 'wait');
    else if (view.phase === 'setup' && canSetup && state.selectedHandUid) setStatus('Setup card selected. Choose your Vanguard or a Reserve position; the server validates starter and slot legality.', 'ready');
    else if (view.phase === 'setup' && canSetup) setStatus('Your setup turn. Select a hand card to place, return a setup Creature from its card, or lock setup when ready.', 'ready');
    else if (view.phase === 'setup') setStatus('Waiting for the other player to finish setup.', 'wait');
    else if (state.selectedHandUid && (state.evolutionProjectionBusy || state.essenceProjectionBusy || state.relicProjectionBusy || state.tacticProjectionBusy || state.playProjectionBusy) && canPlayFromHand) setStatus('Checking legal card destinations with the authoritative gameplay owners…', 'busy');
    else if (state.selectedHandUid && canPlayFromHand && state.evolutionEligible && !state.evolutionTargets.length) setStatus('Evolution card selected. The server reports no legal Creature stack this turn.', 'wait');
    else if (state.selectedHandUid && canPlayFromHand && state.evolutionEligible) setStatus('Evolution card selected. Choose a green Creature stack; the server will revalidate before committing.', 'ready');
    else if (state.selectedHandUid && canPlayFromHand && state.essenceEligible && !state.essenceTargets.length) setStatus('Essence card selected. The server reports no legal Creature target this turn.', 'wait');
    else if (state.selectedHandUid && canPlayFromHand && state.essenceEligible) setStatus('Essence card selected. Choose a green Creature target; the server will revalidate before attaching.', 'ready');
    else if (state.selectedHandUid && canPlayFromHand && state.relicEligible && !state.relicTargets.length) setStatus('Relic card selected. The server reports no Creature with an empty Relic slot.', 'wait');
    else if (state.selectedHandUid && canPlayFromHand && state.relicEligible) setStatus('Relic card selected. Choose a green Creature target; the server will revalidate before attaching.', 'ready');
    else if (state.selectedHandUid && canPlayFromHand && state.tacticEligible) setStatus('Tactic card selected. Use Play Tactic on the selected card; the server will revalidate before committing.', 'ready');
    else if (state.selectedHandUid && canPlayFromHand && directPlayMode && state.playTargets.length) setStatus('Hand card selected. Choose a highlighted server-projected board destination; the server will revalidate before committing.', 'ready');
    else if (state.selectedHandUid && canPlayFromHand && state.playProjectionUid === state.selectedHandUid && !state.playProjectionBusy) setStatus('The server reports no legal direct board destination for the selected card.', 'wait');
    else if (state.selectedHandUid && canPlayFromHand) setStatus('Checking the selected card with the authoritative gameplay owners…', 'busy');
    else if (yourTurn) setStatus('Your turn. Select a hand card for a board destination or your active Creature for its card actions.', 'ready');
    else setStatus('Board synced. Waiting for the opponent or the next server phase.', 'wait');

    bindCardControls();
  }

  function bindCardControls() {
    document.querySelectorAll('[data-card-anchor]').forEach((card) => {
      const select = () => {
        if (state.busy || state.withdrawMode) return;
        const anchor = String(card.dataset.cardAnchor || '');
        if (anchor.startsWith('hand:')) {
          const uid = anchor.slice(5);
          if (!uid) return;
          const deselect = state.selectedHandUid === uid;
          state.selectedHandUid = deselect ? '' : uid;
          state.selectedAnchorUid = '';
          clearEvolutionProjection();
          clearEssenceProjection();
          clearRelicProjection();
          clearTacticProjection();
      clearPlayProjection();
          render();
          if (!deselect) {
            Promise.all([
              runEvolutionTargetProjection(uid),
              runEssenceTargetProjection(uid),
              runRelicTargetProjection(uid),
              runTacticPlayabilityProjection(uid),
              runPlayCardTargetProjection(uid)
            ]).catch((error) => {
              setStatus(error instanceof Error ? error.message : String(error), 'error');
            });
          }
          return;
        }
        state.selectedAnchorUid = state.selectedAnchorUid === anchor ? '' : anchor;
        state.selectedHandUid = '';
        clearEvolutionProjection();
        clearEssenceProjection();
        clearRelicProjection();
        clearTacticProjection();
      clearPlayProjection();
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
    document.querySelectorAll('[data-card-intent="play_tactic"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        await runTacticIntent(state.selectedHandUid);
      });
    });
    document.querySelectorAll('[data-card-intent="attack"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        await runAttackIntent(Number(button.dataset.attackSlot));
      });
    });
    document.querySelectorAll('[data-card-intent="use_ability"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const where = String(button.dataset.actionWhere || '');
        const index = button.dataset.actionIndex == null || button.dataset.actionIndex === '' ? null : Number(button.dataset.actionIndex);
        await runAbilityIntent(where, index);
      });
    });
    document.querySelectorAll('[data-card-intent="withdraw"]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        startWithdrawMode();
      });
    });
    document.querySelectorAll('[data-card-intent="setup_return"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const where = String(button.dataset.actionWhere || '');
        const index = button.dataset.actionIndex == null || button.dataset.actionIndex === ''
          ? null
          : Number(button.dataset.actionIndex);
        await runSetupReturnIntent(where, index);
      });
    });
    document.querySelectorAll('[data-lifecycle-intent="opening_choice"]').forEach((button) => {
      button.addEventListener('click', async () => {
        await runOpeningChoiceIntent(String(button.dataset.choice || ''));
      });
    });
    document.querySelectorAll('[data-lifecycle-intent="setup_ready"]').forEach((button) => {
      button.addEventListener('click', async () => {
        await runSetupReadyIntent();
      });
    });
    document.querySelectorAll('[data-resolution-intent="take_reward"]').forEach((button) => {
      button.addEventListener('click', async () => {
        await runTakeRewardIntent();
      });
    });
    document.querySelectorAll('[data-resolution-intent="promote"]').forEach((button) => {
      button.addEventListener('click', async () => {
        await runPromotionIntent();
      });
    });
    document.querySelectorAll('[data-reward-position]').forEach((reward) => {
      const select = () => {
        const pending = ownResolution(viewState());
        if (!pending || pending.kind !== 'take_reward' || state.busy) return;
        const position = Number(reward.dataset.rewardPosition);
        if (!Number.isInteger(position) || position < 0) return;
        const existing = state.rewardPositions.indexOf(position);
        if (existing >= 0) state.rewardPositions.splice(existing, 1);
        else if (state.rewardPositions.length < pending.count) state.rewardPositions.push(position);
        render();
      };
      reward.addEventListener('click', (event) => {
        event.stopPropagation();
        select();
      });
      reward.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          select();
        }
      });
    });
    document.querySelectorAll('[data-promotion-reserve-index]').forEach((target) => {
      const select = () => {
        const pending = ownResolution(viewState());
        if (!pending || pending.kind !== 'promote' || state.busy) return;
        const index = Number(target.dataset.promotionReserveIndex);
        if (!Number.isInteger(index) || index < 0 || index > 3) return;
        state.promotionReserveIndex = state.promotionReserveIndex === index ? null : index;
        render();
      };
      target.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-intent]')) return;
        event.stopPropagation();
        select();
      });
      target.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          select();
        }
      });
    });
    document.querySelectorAll('[data-setup-place-where]').forEach((target) => {
      const activate = async () => {
        const where = String(target.dataset.setupPlaceWhere || '');
        const index = target.dataset.setupPlaceIndex == null || target.dataset.setupPlaceIndex === ''
          ? null
          : Number(target.dataset.setupPlaceIndex);
        await runSetupPlaceIntent(state.selectedHandUid, where, index);
      };
      target.addEventListener('click', async (event) => {
        if (event.target.closest('[data-card-intent], [data-card-anchor]')) return;
        event.stopPropagation();
        await activate();
      });
      target.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          await activate();
        }
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
    document.querySelectorAll('[data-evolve-target-where]').forEach((target) => {
      const activate = async () => {
        const where = String(target.dataset.evolveTargetWhere || '');
        const index = target.dataset.evolveTargetIndex == null || target.dataset.evolveTargetIndex === ''
          ? null
          : Number(target.dataset.evolveTargetIndex);
        await runEvolutionIntent(state.selectedHandUid, where, index);
      };
      target.addEventListener('click', async (event) => {
        if (event.target.closest('[data-card-intent]')) return;
        event.stopPropagation();
        await activate();
      });
      target.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          await activate();
        }
      });
    });
    document.querySelectorAll('[data-essence-target-where]').forEach((target) => {
      const activate = async () => {
        const where = String(target.dataset.essenceTargetWhere || '');
        const index = target.dataset.essenceTargetIndex == null || target.dataset.essenceTargetIndex === ''
          ? null
          : Number(target.dataset.essenceTargetIndex);
        await runEssenceIntent(state.selectedHandUid, where, index);
      };
      target.addEventListener('click', async (event) => {
        if (event.target.closest('[data-card-intent]')) return;
        event.stopPropagation();
        await activate();
      });
      target.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          await activate();
        }
      });
    });
    document.querySelectorAll('[data-relic-target-where]').forEach((target) => {
      const activate = async () => {
        const where = String(target.dataset.relicTargetWhere || '');
        const index = target.dataset.relicTargetIndex == null || target.dataset.relicTargetIndex === '' ? null : Number(target.dataset.relicTargetIndex);
        await runRelicIntent(state.selectedHandUid, where, index);
      };
      target.addEventListener('click', async (event) => {
        if (event.target.closest('[data-card-intent]')) return;
        event.stopPropagation();
        await activate();
      });
      target.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); event.stopPropagation(); await activate();
        }
      });
    });
    document.querySelectorAll('[data-withdraw-target-index]').forEach((target) => {
      const activate = () => {
        const index = Number(target.dataset.withdrawTargetIndex);
        if (!legalWithdrawTarget(index)) return;
        state.withdrawTargetIndex = index;
        render();
      };
      target.addEventListener('click', (event) => {
        if (event.target.closest('[data-card-intent]')) return;
        event.stopPropagation();
        activate();
      });
      target.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          activate();
        }
      });
    });
    document.querySelectorAll('[data-play-realm-target]').forEach((target) => {
      const activate = async () => {
        await runPlayRealmIntent(state.selectedHandUid);
      };
      target.addEventListener('click', async (event) => {
        event.stopPropagation();
        await activate();
      });
      target.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          await activate();
        }
      });
    });
  }

  async function runTakeRewardIntent() {
    const pending = ownResolution(viewState());
    if (!pending || pending.kind !== 'take_reward') throw new Error('Reward resolution is not currently yours.');
    const positions = [...new Set(state.rewardPositions)].sort((a, b) => a - b);
    if (positions.length !== pending.count) throw new Error('Select exactly the Reward positions requested by the server.');
    state.busy = true;
    render();
    setStatus('Submitting Reward selection to the authoritative Reward/Card-Zone owners…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('take_reward'), { reward_positions: positions }));
      state.rewardPositions = [];
      state.resolutionKey = '';
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

  async function runPromotionIntent() {
    const pending = ownResolution(viewState());
    const index = Number(state.promotionReserveIndex);
    if (!pending || pending.kind !== 'promote') throw new Error('Mandatory promotion is not currently yours.');
    const view = viewState();
    const reserve = view && view.you && Array.isArray(view.you.reserve) ? view.you.reserve : [];
    if (!Number.isInteger(index) || index < 0 || index > 3 || !reserve[index]) throw new Error('Select an occupied Reserve Creature to promote.');
    state.busy = true;
    render();
    setStatus('Submitting mandatory promotion to the authoritative Defeat/Movement owners…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('promote'), { reserve_index: index }));
      state.promotionReserveIndex = null;
      state.resolutionKey = '';
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

  async function runOpeningChoiceIntent(choice) {
    state.busy = true;
    render();
    setStatus('Submitting opening turn order to the authoritative setup owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_SETUP, Object.assign(actionBase('opening_choice'), { choice }));
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

  async function runSetupPlaceIntent(cardUid, where, index) {
    if (!cardUid) throw new Error('Select a hand card first.');
    state.busy = true;
    render();
    setStatus('Submitting setup placement to the authoritative setup owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_SETUP, Object.assign(actionBase('setup_place'), {
        card_uid: cardUid,
        where,
        index
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

  async function runSetupReturnIntent(where, index) {
    state.busy = true;
    render();
    setStatus('Returning setup Creature through the authoritative setup owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_SETUP, Object.assign(actionBase('setup_return'), {
        where,
        index
      }));
      state.selectedAnchorUid = '';
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

  async function runSetupReadyIntent() {
    state.busy = true;
    render();
    setStatus('Locking setup through the authoritative match-flow owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_SETUP, actionBase('setup_ready'));
      state.selectedHandUid = '';
      state.selectedAnchorUid = '';
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

  async function runEvolutionTargetProjection(cardUid) {
    const view = viewState();
    const seat = Number(view && view.you && view.you.seat);
    const canProject = !!cardUid && view && view.phase === 'play' && Number(view.active_seat) === seat && !state.busy;
    if (!canProject) return;
    state.evolutionProjectionUid = cardUid;
    state.evolutionProjectionBusy = true;
    state.evolutionEligible = false;
    state.evolutionTargets = [];
    render();
    try {
      const response = await callEdge(API_MATCH, Object.assign(actionBase('evolve_targets'), {
        card_uid: cardUid
      }));
      if (state.selectedHandUid !== cardUid) return;
      const projected = response && response.result && typeof response.result === 'object' ? response.result : {};
      state.evolutionProjectionUid = cardUid;
      state.evolutionEligible = projected.eligible === true;
      state.evolutionTargets = state.evolutionEligible && Array.isArray(projected.legal_targets)
        ? projected.legal_targets.map((target) => ({
            where: String(target && target.where || ''),
            index: target && target.index == null ? null : Number(target.index),
            anchor_uid: String(target && target.anchor_uid || '')
          })).filter((target) =>
            (target.where === 'vanguard' && target.index === null) ||
            (target.where === 'reserve' && Number.isInteger(target.index) && target.index >= 0 && target.index <= 3)
          )
        : [];
    } finally {
      if (state.selectedHandUid === cardUid) {
        state.evolutionProjectionBusy = false;
        render();
      }
    }
  }

  async function runEvolutionIntent(cardUid, where, index) {
    if (!cardUid) throw new Error('Select an Evolution card first.');
    if (!legalEvolutionTarget(where, index)) throw new Error('That Creature stack is not in the server-projected Evolution target list.');
    state.busy = true;
    render();
    setStatus('Submitting Evolution to the authoritative Creature/Evolution owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('evolve'), {
        card_uid: cardUid,
        where,
        index
      }));
      state.selectedHandUid = '';
      clearEvolutionProjection();
      clearEssenceProjection();
      clearRelicProjection();
      clearTacticProjection();
      clearPlayProjection();
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

  async function runEssenceTargetProjection(cardUid) {
    const view = viewState();
    const seat = Number(view && view.you && view.you.seat);
    const canProject = !!cardUid && view && view.phase === 'play' && Number(view.active_seat) === seat && !state.busy;
    if (!canProject) return;
    state.essenceProjectionUid = cardUid;
    state.essenceProjectionBusy = true;
    state.essenceEligible = false;
    state.essenceTargets = [];
    render();
    try {
      const response = await callEdge(API_MATCH, Object.assign(actionBase('attach_essence_targets'), {
        card_uid: cardUid
      }));
      if (state.selectedHandUid !== cardUid) return;
      const projected = response && response.result && typeof response.result === 'object' ? response.result : {};
      state.essenceProjectionUid = cardUid;
      state.essenceEligible = projected.eligible === true;
      state.essenceTargets = state.essenceEligible && Array.isArray(projected.legal_targets)
        ? projected.legal_targets.map((target) => ({
            where: String(target && target.where || ''),
            index: target && target.index == null ? null : Number(target.index),
            anchor_uid: String(target && target.anchor_uid || '')
          })).filter((target) =>
            (target.where === 'vanguard' && target.index === null) ||
            (target.where === 'reserve' && Number.isInteger(target.index) && target.index >= 0 && target.index <= 3)
          )
        : [];
    } finally {
      if (state.selectedHandUid === cardUid) {
        state.essenceProjectionBusy = false;
        render();
      }
    }
  }

  async function runEssenceIntent(cardUid, where, index) {
    if (!cardUid) throw new Error('Select an Essence card first.');
    if (!legalEssenceTarget(where, index)) throw new Error('That Creature is not in the server-projected Essence target list.');
    state.busy = true;
    render();
    setStatus('Submitting Essence attachment to the authoritative Essence Attachment owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('attach_essence'), {
        card_uid: cardUid,
        where,
        index
      }));
      state.selectedHandUid = '';
      clearEvolutionProjection();
      clearEssenceProjection();
      clearRelicProjection();
      clearTacticProjection();
      clearPlayProjection();
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

  async function runRelicTargetProjection(cardUid) {
    const view = viewState();
    const seat = Number(view && view.you && view.you.seat);
    const canProject = !!cardUid && view && view.phase === 'play' && Number(view.active_seat) === seat && !state.busy;
    if (!canProject) return;
    state.relicProjectionUid = cardUid;
    state.relicProjectionBusy = true;
    state.relicEligible = false;
    state.relicTargets = [];
    render();
    try {
      const response = await callEdge(API_MATCH, Object.assign(actionBase('attach_relic_targets'), { card_uid: cardUid }));
      if (state.selectedHandUid !== cardUid) return;
      const projected = response && response.result && typeof response.result === 'object' ? response.result : {};
      state.relicProjectionUid = cardUid;
      state.relicEligible = projected.eligible === true;
      state.relicTargets = state.relicEligible && Array.isArray(projected.legal_targets)
        ? projected.legal_targets.map((target) => ({
            where: String(target && target.where || ''),
            index: target && target.index == null ? null : Number(target.index),
            anchor_uid: String(target && target.anchor_uid || '')
          })).filter((target) =>
            (target.where === 'vanguard' && target.index === null) ||
            (target.where === 'reserve' && Number.isInteger(target.index) && target.index >= 0 && target.index <= 3)
          )
        : [];
    } finally {
      if (state.selectedHandUid === cardUid) {
        state.relicProjectionBusy = false;
        render();
      }
    }
  }

  async function runRelicIntent(cardUid, where, index) {
    if (!cardUid) throw new Error('Select a Relic card first.');
    if (!legalRelicTarget(where, index)) throw new Error('That Creature is not in the server-projected Relic target list.');
    state.busy = true;
    render();
    setStatus('Submitting Relic attachment to the authoritative Relic owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('attach_relic'), { card_uid: cardUid, where, index }));
      state.selectedHandUid = '';
      clearEvolutionProjection();
      clearEssenceProjection();
      clearRelicProjection();
      clearTacticProjection();
      clearPlayProjection();
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

  async function runPlayCardTargetProjection(cardUid) {
    const view = viewState();
    const seat = Number(view && view.you && view.you.seat);
    const canProject = !!cardUid && view && view.phase === 'play' && Number(view.active_seat) === seat && !state.busy;
    if (!canProject) return;
    state.playProjectionUid = cardUid;
    state.playProjectionBusy = true;
    state.playTargets = [];
    render();
    try {
      const response = await callEdge(API_MATCH, Object.assign(actionBase('play_card_targets'), {
        card_uid: cardUid
      }));
      if (state.selectedHandUid !== cardUid) return;
      const projected = response && response.result && typeof response.result === 'object' ? response.result : {};
      state.playProjectionUid = cardUid;
      state.playTargets = Array.isArray(projected.legal_targets)
        ? projected.legal_targets.map((target) => {
            const kind = String(target && target.kind || '');
            if (kind === 'realm') return { kind: 'realm' };
            if (kind === 'reserve') {
              const reserveIndex = Number(target && target.reserve_index);
              if (Number.isInteger(reserveIndex) && reserveIndex >= 0 && reserveIndex <= 3) {
                return { kind: 'reserve', reserve_index: reserveIndex };
              }
            }
            return null;
          }).filter(Boolean)
        : [];
    } finally {
      if (state.selectedHandUid === cardUid) {
        state.playProjectionBusy = false;
        render();
      }
    }
  }

  async function runTacticPlayabilityProjection(cardUid) {
    const view = viewState();
    const seat = Number(view && view.you && view.you.seat);
    const canProject = !!cardUid && view && view.phase === 'play' && Number(view.active_seat) === seat && !state.busy;
    if (!canProject) return;
    state.tacticProjectionUid = cardUid;
    state.tacticProjectionBusy = true;
    state.tacticEligible = false;
    render();
    try {
      const response = await callEdge(API_TACTIC, Object.assign(actionBase('play_tactic_legality'), {
        card_uid: cardUid
      }));
      if (state.selectedHandUid !== cardUid) return;
      const projected = response && response.result && typeof response.result === 'object' ? response.result : {};
      state.tacticProjectionUid = cardUid;
      state.tacticEligible = projected.eligible === true;
    } finally {
      if (state.selectedHandUid === cardUid) {
        state.tacticProjectionBusy = false;
        render();
      }
    }
  }

  async function runTacticIntent(cardUid) {
    if (!cardUid) throw new Error('Select a hand card first.');
    if (state.tacticProjectionUid !== cardUid || !state.tacticEligible) {
      throw new Error('The selected card is not server-authorized for the generic Tactic owner.');
    }
    state.busy = true;
    render();
    setStatus('Submitting Tactic play to the authoritative Tactic owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_TACTIC, Object.assign(actionBase('play_tactic'), {
        card_uid: cardUid
      }));
      state.selectedHandUid = '';
      state.actionChoiceIds = [];
      clearEvolutionProjection();
      clearEssenceProjection();
      clearRelicProjection();
      clearTacticProjection();
      clearPlayProjection();
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

  async function runPendingChoiceIntent() {
    const route = pendingActionChoice(viewState());
    const pending = route && route.pending ? route.pending : null;
    if (!pending || pending.waiting === true) throw new Error('No authoritative card choice is yours to resolve.');
    const minRaw = Number(pending.min);
    const maxRaw = Number(pending.max);
    const min = Number.isInteger(minRaw) && minRaw >= 0 ? minRaw : 0;
    const max = Number.isInteger(maxRaw) && maxRaw >= min ? maxRaw : min;
    const choiceIds = [...state.actionChoiceIds];
    if (choiceIds.length < min || choiceIds.length > max) throw new Error('Select the number of choices requested by the server.');
    state.busy = true;
    render();
    setStatus('Submitting card choice to the authoritative gameplay owner…', 'busy');
    let failure = '';
    try {
      const payload = Object.assign(actionBase(route.action), {
        choice_id: String(pending.id || ''),
        choice_ids: choiceIds
      });
      if (route.owner === 'tactic') await callEdge(API_TACTIC, payload);
      else await callEdge(API_MATCH, payload);
      state.actionChoiceIds = [];
      await refreshMatch();
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      state.actionChoiceIds = choiceIds;
      await refreshMatch().catch(() => {});
    } finally {
      state.busy = false;
      render();
      if (failure) setStatus(failure, 'error');
    }
  }

  async function runAbilityIntent(where, index) {
    const view = viewState();
    const creature = yourCreatureAt(view, where, index);
    const anchor = cardAnchor(creature);
    if (!legalAbilitySource(where, index, anchor)) throw new Error('That card is not in the server-projected Active Ability source list.');
    state.busy = true;
    render();
    setStatus('Submitting Ability to the authoritative Ability owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('use_ability'), { where, index }));
      state.selectedAnchorUid = '';
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

  function startWithdrawMode() {
    if (!fieldActionsFresh() || state.fieldWithdraw.eligible !== true) throw new Error('Withdrawal is not currently server-eligible.');
    const view = viewState();
    state.selectedHandUid = '';
    state.selectedAnchorUid = cardAnchor(view && view.you && view.you.vanguard);
    clearEvolutionProjection();
    clearEssenceProjection();
    clearRelicProjection();
    clearTacticProjection();
      clearPlayProjection();
    state.withdrawMode = true;
    state.withdrawTargetIndex = null;
    state.withdrawPaymentUids = [];
    render();
  }

  async function runWithdrawIntent() {
    if (!state.withdrawMode || !fieldActionsFresh() || state.fieldWithdraw.eligible !== true) {
      throw new Error('Withdrawal projection is no longer current.');
    }
    const targetIndex = Number(state.withdrawTargetIndex);
    if (!legalWithdrawTarget(targetIndex)) throw new Error('Choose a server-projected Reserve target.');
    const costRaw = Number(state.fieldWithdraw.cost);
    const cost = Number.isInteger(costRaw) && costRaw >= 0 ? costRaw : 0;
    const validPayments = new Set(state.fieldWithdraw.payment_options.map((option) => String(option && option.uid || '')).filter(Boolean));
    const paymentUids = [...new Set(state.withdrawPaymentUids.map(String))];
    if (paymentUids.length !== cost || paymentUids.some((uid) => !validPayments.has(uid))) {
      throw new Error('Choose exactly the server-projected Withdrawal Essence payment.');
    }

    state.busy = true;
    render();
    setStatus('Submitting Withdrawal to the authoritative Withdrawal/Payment owners…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('withdraw'), {
        reserve_index: targetIndex,
        discard_essence_uids: paymentUids
      }));
      clearWithdrawMode();
      state.selectedAnchorUid = '';
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

  async function runFieldActionProjection() {
    const view = viewState();
    const seat = Number(view && view.you && view.you.seat);
    const canProject = view && view.phase === 'play' && Number(view.active_seat) === seat;
    if (!canProject) {
      clearFieldActionProjection();
      clearWithdrawMode();
      return;
    }

    const expectedRevision = revision();
    state.fieldActionsBusy = true;
    state.fieldActionError = '';
    try {
      const response = await callEdge(API_MATCH, actionBase('field_actions'));
      if (revision() !== expectedRevision) return;
      const projected = response && response.result && typeof response.result === 'object' ? response.result : {};
      state.abilitySources = Array.isArray(projected.ability_sources)
        ? projected.ability_sources.map((source) => ({
            where: String(source && source.where || ''),
            index: source && source.index == null ? null : Number(source.index),
            anchor_uid: String(source && source.anchor_uid || '')
          })).filter((source) =>
            !!source.anchor_uid &&
            ((source.where === 'vanguard' && source.index === null) ||
             (source.where === 'reserve' && Number.isInteger(source.index) && source.index >= 0 && source.index <= 3))
          )
        : [];

      const withdraw = projected && projected.withdraw && typeof projected.withdraw === 'object' ? projected.withdraw : {};
      const costRaw = Number(withdraw.cost);
      const cost = Number.isInteger(costRaw) && costRaw >= 0 ? costRaw : null;
      const legalTargets = Array.isArray(withdraw.legal_targets)
        ? withdraw.legal_targets.map((target) => ({
            reserve_index: Number(target && target.reserve_index),
            anchor_uid: String(target && target.anchor_uid || '')
          })).filter((target) =>
            Number.isInteger(target.reserve_index) && target.reserve_index >= 0 && target.reserve_index <= 3 && !!target.anchor_uid
          )
        : [];
      const paymentOptions = Array.isArray(withdraw.payment_options)
        ? withdraw.payment_options.map((option) => ({
            uid: String(option && option.uid || ''),
            card_id: String(option && option.card_id || ''),
            label: String(option && option.label || option && option.card_id || 'Essence')
          })).filter((option) => option.uid)
        : [];

      state.fieldWithdraw = {
        eligible: withdraw.eligible === true,
        reason: String(withdraw.reason || ''),
        cost,
        legal_targets: legalTargets,
        payment_options: paymentOptions
      };
      state.fieldActionRevision = expectedRevision;
      const validPayments = new Set(paymentOptions.map((option) => option.uid));
      state.withdrawPaymentUids = state.withdrawPaymentUids.filter((uid) => validPayments.has(uid));
      if (!legalWithdrawTarget(Number(state.withdrawTargetIndex))) state.withdrawTargetIndex = null;
      if (state.fieldWithdraw.eligible !== true) clearWithdrawMode();
    } catch (error) {
      clearFieldActionProjection();
      clearWithdrawMode();
      state.fieldActionError = error instanceof Error ? error.message : String(error);
    } finally {
      state.fieldActionsBusy = false;
    }
  }

  async function runPlayRealmIntent(cardUid) {
    if (!cardUid) throw new Error('Select a hand card first.');
    if (!legalPlayRealmTarget()) throw new Error('The shared Realm slot is not in the current server-projected direct-play target list.');
    state.busy = true;
    render();
    setStatus('Submitting the selected hand card to the authoritative play_realm owner…', 'busy');
    let failure = '';
    try {
      await callEdge(API_MATCH, Object.assign(actionBase('play_realm'), {
        card_uid: cardUid
      }));
      state.selectedHandUid = '';
      clearEvolutionProjection();
      clearEssenceProjection();
      clearRelicProjection();
      clearTacticProjection();
      clearPlayProjection();
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

  async function runPlayCreatureIntent(cardUid, reserveIndex) {
    if (!cardUid) throw new Error('Select a hand card first.');
    if (!Number.isInteger(reserveIndex) || reserveIndex < 0 || reserveIndex > 3) throw new Error('Invalid Reserve index.');
    if (!legalPlayCreatureTarget(reserveIndex)) throw new Error('That Reserve slot is not in the current server-projected direct-play target list.');
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
      clearEvolutionProjection();
      clearEssenceProjection();
      clearRelicProjection();
      clearTacticProjection();
      clearPlayProjection();
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
    syncResolutionSelection(view);
    if (state.selectedAnchorUid && !fieldHasAnchor(view, state.selectedAnchorUid)) state.selectedAnchorUid = '';
    if (state.selectedHandUid && view && view.you) {
      const hand = Array.isArray(view.you.hand) ? view.you.hand : [];
      if (!hand.some((instance) => String(instance && instance.uid || '') === state.selectedHandUid)) {
        state.selectedHandUid = '';
        clearEvolutionProjection();
        clearEssenceProjection();
        clearRelicProjection();
        clearTacticProjection();
      clearPlayProjection();
      }
    }
    const pending = !!(view && (view.pending_attack_choice || view.pending_ability_choice || view.pending_event_listener_choice || view.pending_movement_listener_choice || view.pending_heal_listener_choice || view.pending_choice || view.pending_resolution));
    if (!view || view.phase !== 'play' || Number(view.active_seat) !== Number(view.you && view.you.seat) || pending) clearWithdrawMode();
    await runFieldActionProjection();
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
