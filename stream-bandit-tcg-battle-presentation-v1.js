(function (root) {
  'use strict';

  const VERSION = 'Stream Bandit TCG Battle Presentation v1.0';
  const SCHEMA = 'tcg-presentation-envelope-v1';
  const FAMILIES = new Set([
    'zone_move',
    'choice',
    'source_activation',
    'target_focus',
    'payment',
    'attack_windup',
    'ability',
    'impact',
    'damage',
    'shield_delta',
    'heal',
    'condition',
    'listener_trigger',
    'defeat',
    'reward_followup',
    'turn_continuation',
    'shuffle',
    'notice'
  ]);
  const PACE = { micro: 90, standard: 180, hero: 320 };

  function asRevision(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : null;
  }

  function normalizeCue(raw, index) {
    if (!raw || typeof raw !== 'object') return null;
    const family = String(raw.family || '');
    if (!FAMILIES.has(family)) return null;
    const id = String(raw.id || '').trim();
    if (!id) return null;
    const order = Number.isInteger(Number(raw.order)) && Number(raw.order) >= 0 ? Number(raw.order) : index;
    const intensity = ['micro', 'standard', 'hero'].includes(String(raw.intensity || ''))
      ? String(raw.intensity)
      : 'standard';
    return {
      id,
      order,
      family,
      intensity,
      label: raw.label == null ? '' : String(raw.label),
      source: raw.source && typeof raw.source === 'object' ? raw.source : null,
      target: raw.target && typeof raw.target === 'object' ? raw.target : null,
      movement: raw.movement && typeof raw.movement === 'object' ? raw.movement : null,
      state_delta: raw.state_delta && typeof raw.state_delta === 'object' ? raw.state_delta : null,
      choice: raw.choice && typeof raw.choice === 'object' ? raw.choice : null
    };
  }

  function normalizeEnvelope(raw) {
    if (!raw || typeof raw !== 'object' || raw.schema !== SCHEMA) return null;
    const receiptId = String(raw.receipt_id || '').trim();
    const actionKind = String(raw.action_kind || '').trim();
    const revision = asRevision(raw.revision);
    if (!receiptId || !actionKind || revision == null || !Array.isArray(raw.cues)) return null;
    const cues = raw.cues.map(normalizeCue).filter(Boolean).sort((left, right) =>
      left.order - right.order || left.id.localeCompare(right.id)
    );
    return {
      schema: SCHEMA,
      receipt_id: receiptId,
      revision,
      action_kind: actionKind,
      continuation_id: raw.continuation_id == null ? '' : String(raw.continuation_id),
      cues
    };
  }

  function prefersReducedMotion() {
    try {
      return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {
      return false;
    }
  }

  function create(options) {
    const config = options && typeof options === 'object' ? options : {};
    const reducedMotion = config.reducedMotion == null ? prefersReducedMotion() : !!config.reducedMotion;
    const seen = new Set();
    let currentRevision = 0;
    let generation = 0;
    let queue = [];
    let flushing = false;

    function syncRevision(value) {
      const revision = asRevision(value);
      if (revision == null) return false;
      if (revision > currentRevision) {
        currentRevision = revision;
        queue = queue.filter((item) => item.revision >= revision);
        generation += 1;
      }
      return true;
    }

    function ingest(raw) {
      const envelope = normalizeEnvelope(raw);
      if (!envelope) return { accepted: false, reason: 'invalid_envelope', queued: 0 };
      if (envelope.revision < currentRevision) return { accepted: false, reason: 'stale_revision', queued: 0 };
      syncRevision(envelope.revision);
      if (seen.has(envelope.receipt_id)) return { accepted: false, reason: 'duplicate_receipt', queued: 0 };
      seen.add(envelope.receipt_id);
      const items = envelope.cues.map((cue) => ({
        receipt_id: envelope.receipt_id,
        revision: envelope.revision,
        action_kind: envelope.action_kind,
        continuation_id: envelope.continuation_id,
        cue
      }));
      queue.push(...items);
      queue.sort((left, right) =>
        left.revision - right.revision ||
        left.cue.order - right.cue.order ||
        left.cue.id.localeCompare(right.cue.id)
      );
      return { accepted: true, reason: 'queued', queued: items.length };
    }

    function cancelToRevision(value) {
      const revision = asRevision(value);
      if (revision == null) return false;
      currentRevision = Math.max(currentRevision, revision);
      queue = [];
      generation += 1;
      return true;
    }

    function paceFor(cue) {
      if (reducedMotion) return 0;
      return PACE[cue && cue.intensity] || PACE.standard;
    }

    async function flush(handler) {
      if (flushing) return { completed: false, reason: 'already_flushing', remaining: queue.length };
      flushing = true;
      const ownGeneration = generation;
      const onCue = typeof handler === 'function' ? handler : null;
      try {
        while (queue.length && ownGeneration === generation) {
          const item = queue.shift();
          if (!item || item.revision < currentRevision) continue;
          if (onCue) {
            await onCue(item.cue, {
              receipt_id: item.receipt_id,
              revision: item.revision,
              action_kind: item.action_kind,
              continuation_id: item.continuation_id,
              reducedMotion
            });
          }
          const delay = paceFor(item.cue);
          if (delay > 0 && ownGeneration === generation) {
            await new Promise((resolve) => root.setTimeout(resolve, delay));
          }
        }
        return {
          completed: ownGeneration === generation,
          reason: ownGeneration === generation ? 'drained' : 'cancelled_by_newer_state',
          remaining: queue.length
        };
      } finally {
        flushing = false;
      }
    }

    function snapshot() {
      return {
        version: VERSION,
        schema: SCHEMA,
        current_revision: currentRevision,
        queued: queue.length,
        seen_receipts: seen.size,
        reduced_motion: reducedMotion,
        flushing
      };
    }

    return {
      version: VERSION,
      schema: SCHEMA,
      syncRevision,
      ingest,
      flush,
      cancelToRevision,
      snapshot
    };
  }

  root.StreamBanditTCGBattlePresentation = {
    version: VERSION,
    schema: SCHEMA,
    normalizeEnvelope,
    create
  };
})(typeof window !== 'undefined' ? window : globalThis);
