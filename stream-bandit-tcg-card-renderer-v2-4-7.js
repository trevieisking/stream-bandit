(function () {
  'use strict';

  const VERSION = 'Stream Bandit TCG Card Renderer V2.4.36';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function numberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function cardFamily(definition, structured) {
    return String(
      (structured && structured.card_family) ||
      (definition && (definition.card_family || definition.kind)) ||
      'Card'
    );
  }

  function creatureDefinition(definition, structured) {
    if (structured && structured.creature && typeof structured.creature === 'object') return structured.creature;
    return definition && typeof definition === 'object' ? definition : {};
  }

  function cardName(instance, definition, structured) {
    return String(
      (structured && structured.name) ||
      (definition && definition.name) ||
      (instance && instance.card_id) ||
      'Card'
    );
  }

  function cardElement(definition, structured) {
    return String((structured && structured.element) || (definition && definition.element) || 'Neutral');
  }

  function artMarkup(art, name) {
    const hasUrl = !!(art && art.url);
    const state = hasUrl && art.state === 'approved'
      ? 'approved'
      : (hasUrl && art.state === 'candidate'
        ? 'candidate'
        : (art && art.state === 'placeholder' ? 'placeholder' : 'missing'));
    if (state === 'approved' || state === 'candidate') {
      const candidate = state === 'candidate' ? ' data-sb-tcg-card-art="candidate"' : '';
      return '<div class="sb-card-art is-' + state + '" data-art-state="' + state + '"><img src="' + esc(art.url) + '" alt="' + esc(name) + ' artwork"' + candidate + ' loading="lazy" decoding="async"></div>';
    }
    const label = state === 'placeholder' ? 'Development artwork' : 'Artwork pending';
    return '<div class="sb-card-art is-' + state + '" data-art-state="' + state + '" aria-label="' + esc(label) + '"><span>' + esc(label) + '</span></div>';
  }

  function attackDamageLabel(attack) {
    if (!attack || typeof attack !== 'object') return '—';
    const fixed = numberOrNull(attack.base_damage);
    if (fixed != null) return String(fixed);
    const compatibility = numberOrNull(attack.damage);
    if (compatibility != null) return String(compatibility);
    return attack.damage_formula ? 'Variable' : '—';
  }

  function costLabel(cost) {
    if (!Array.isArray(cost) || !cost.length) return 'No printed cost';
    return cost.map((entry) => {
      if (!entry || typeof entry !== 'object') return '';
      const amount = numberOrNull(entry.amount);
      const element = String(entry.element || 'Essence');
      return (amount == null ? '' : String(amount) + ' ') + element;
    }).filter(Boolean).join(' + ') || 'Printed cost';
  }

  function attackActionMarkup(action) {
    const attack = action && action.attack ? action.attack : {};
    const slot = Number(action && action.slot);
    if (slot !== 1 && slot !== 2) return '';
    const name = String(attack.name || action.name || ('Attack ' + slot));
    const disabled = action && action.enabled === false ? ' disabled' : '';
    return '<button type="button" class="sb-card-action" data-card-intent="attack" data-attack-slot="' + slot + '"' + disabled + '>' +
      '<span><strong>' + esc(name) + '</strong><small>Attack ' + slot + ' · ' + esc(costLabel(attack.cost)) + '</small></span>' +
      '<span class="sb-damage">' + esc(attackDamageLabel(attack)) + '</span>' +
      '</button>';
  }

  function contextActionMarkup(action) {
    if (!action || typeof action !== 'object') return '';
    const intent = String(action.intent || '');
    if (!intent || intent === 'attack') return attackActionMarkup(action);
    const label = String(action.label || 'Action');
    const detail = String(action.detail || intent.replace(/_/g, ' '));
    const disabled = action.enabled === false ? ' disabled' : '';
    const where = action.where == null ? '' : ' data-action-where="' + esc(action.where) + '"';
    const index = action.index == null ? '' : ' data-action-index="' + esc(action.index) + '"';
    return '<button type="button" class="sb-card-action" data-card-intent="' + esc(intent) + '"' + where + index + disabled + '>' +
      '<span><strong>' + esc(label) + '</strong><small>' + esc(detail) + '</small></span>' +
      '</button>';
  }

  function abilityMarkup(ability) {
    if (!ability || typeof ability !== 'object') return '';
    const name = String(ability.name || 'Ability');
    const mode = String(ability.mode || ability.activation || 'ability');
    return '<div class="sb-card-ability" data-ability-mode="' + esc(mode) + '">' +
      '<strong>' + esc(name) + '</strong><span>' + esc(mode) + ' Ability</span>' +
      '</div>';
  }

  function conditionsMarkup(conditions) {
    if (!conditions || typeof conditions !== 'object') return '';
    const active = Object.entries(conditions).filter((entry) => {
      const value = entry[1];
      if (value == null || value === false || value === 0) return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });
    if (!active.length) return '';
    return '<div class="sb-card-conditions" aria-label="Conditions">' + active.map(([name]) =>
      '<span class="sb-condition">' + esc(name) + '</span>'
    ).join('') + '</div>';
  }

  function attachmentsMarkup(attachments) {
    if (!Array.isArray(attachments) || !attachments.length) return '';
    return '<div class="sb-card-attachments" aria-label="Attached cards">' + attachments.map((item) => {
      const family = String(item.family || 'Attachment');
      const name = String(item.name || 'Attached card');
      const element = item.element ? ' · ' + String(item.element) : '';
      return '<span class="sb-attachment" data-attachment-family="' + esc(family.toLowerCase()) + '">' +
        '<strong>' + esc(name) + '</strong><small>' + esc(family + element) + '</small>' +
        '</span>';
    }).join('') + '</div>';
  }

  function creatureStatsMarkup(creature, creatureDef) {
    const maxHp = Math.max(0, numberOrNull(creatureDef.hp) || 0);
    const damage = Math.max(0, numberOrNull(creature && creature.damage) || 0);
    const remaining = Math.max(0, maxHp - damage);
    const shield = Math.max(0, numberOrNull(creature && creature.shield) || 0);
    const withdrawal = Math.max(0, numberOrNull(creatureDef.withdrawal) ?? numberOrNull(creatureDef.withdraw_cost) ?? 0);
    return '<div class="sb-card-stats">' +
      '<span class="sb-hp"><strong>HP ' + esc(remaining) + '/' + esc(maxHp) + '</strong><small>Damage ' + esc(damage) + '</small></span>' +
      '<span><strong>Shield ' + esc(shield) + '</strong><small>Withdraw Cost ' + esc(withdrawal) + '</small></span>' +
      '</div>';
  }

  function renderKnownCard(options) {
    const opts = options || {};
    const instance = opts.instance || null;
    const definition = opts.definition || {};
    const structured = opts.structured || null;
    const family = cardFamily(definition, structured);
    const name = cardName(instance, definition, structured);
    const element = cardElement(definition, structured);
    const creatureDef = creatureDefinition(definition, structured);
    const stage = family === 'Creature'
      ? String(creatureDef.stage || definition.stage || 'Creature')
      : family;
    const selected = !!opts.selected;
    const interactive = !!opts.interactive;
    const compact = !!opts.compact;
    const anchor = String(opts.anchor || (instance && instance.uid) || '');
    const actions = Array.isArray(opts.actions) ? opts.actions : [];
    const actionRows = actions.map(contextActionMarkup).filter(Boolean).join('');
    const classes = [
      'sb-tcg-card',
      'sb-card-family-' + family.toLowerCase(),
      interactive ? 'is-primary' : '',
      selected ? 'is-selected' : '',
      compact ? 'is-compact' : ''
    ].filter(Boolean).join(' ');
    const interactiveAttrs = interactive
      ? ' tabindex="0" role="button" aria-pressed="' + (selected ? 'true' : 'false') + '" data-card-anchor="' + esc(anchor) + '"'
      : '';
    const ability = family === 'Creature' ? creatureDef.ability : null;
    const artOwner = window.StreamBanditTCGArtResolverV2436;
    const resolvedArt = opts.art || (artOwner && typeof artOwner.cardArt === 'function'
      ? artOwner.cardArt(instance, structured, definition)
      : null);

    return '<article class="' + classes + '" data-card-family="' + esc(family) + '" data-card-id="' + esc(instance && instance.card_id) + '"' + interactiveAttrs + '>' +
      '<header class="sb-card-topline"><span class="sb-stage">' + esc(stage) + '</span><span class="sb-element">' + esc(element) + '</span></header>' +
      '<h2>' + esc(name) + '</h2>' +
      artMarkup(resolvedArt, name) +
      (family === 'Creature' ? creatureStatsMarkup(opts.creature || {}, creatureDef) : '') +
      (family === 'Creature' ? conditionsMarkup(opts.creature && opts.creature.conditions) : '') +
      abilityMarkup(ability) +
      attachmentsMarkup(opts.attachments) +
      (interactive ? '<div class="sb-card-hint">' + (selected ? 'Choose an action on this card' : 'Tap/select this card') + '</div>' : '') +
      (interactive ? '<div class="sb-card-actions">' + actionRows + '</div>' : '') +
      '</article>';
  }

  function renderCardBack(options) {
    const opts = options || {};
    const label = String(opts.label || 'Hidden card');
    const compact = opts.compact !== false;
    return '<div class="sb-card-back' + (compact ? ' is-compact' : '') + '" aria-label="' + esc(label) + '">' +
      '<span class="sb-card-back-mark">SB</span><small>' + esc(label) + '</small>' +
      '</div>';
  }

  window.StreamBanditTCGCardRendererV247 = Object.freeze({
    version: VERSION,
    renderKnownCard,
    renderCardBack
  });
})();
