import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tacticSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');
const movementSource = fs.readFileSync('supabase/functions/_shared/tcg-match-movement-listener-v0-2.ts', 'utf8');
const authoritySource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-authority-v0-2.ts', 'utf8');
const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const loadSource = fs.readFileSync('supabase/migrations/20260906190000_tcg_v0_2_set_one_shadow_registry_load.sql', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
}

function frozenDefinitions() {
  const definitions = [];
  for (const line of loadSource.split(/\n/)) {
    const found = line.match(/, '(\{.*\})'::jsonb\),?$/);
    if (found) definitions.push(JSON.parse(found[1].replace(/''/g, "'")));
  }
  return definitions;
}

function walkRequirements(raw, out = new Set()) {
  if (!raw || typeof raw !== 'object') return out;
  if (typeof raw.predicate === 'string') out.add(raw.predicate);
  for (const item of raw.all || []) walkRequirements(item, out);
  for (const item of raw.any || []) walkRequirements(item, out);
  if (raw.not) walkRequirements(raw.not, out);
  return out;
}

function essenceMovedListeners() {
  const out = [];
  for (const definition of frozenDefinitions()) {
    const ability = definition.creature?.ability;
    if (ability?.mode === 'triggered' && ability.event === 'essence_moved') {
      out.push({ card_id: definition.id, kind: 'ability', listener: ability });
    }
    for (const listener of definition.essence?.listeners || []) {
      if (listener?.event === 'essence_moved') out.push({ card_id: definition.id, kind: 'essence', listener });
    }
    for (const listener of definition.tactic?.listeners || []) {
      if (listener?.event === 'essence_moved') out.push({ card_id: definition.id, kind: definition.tactic?.subtype || 'tactic', listener });
    }
  }
  return out;
}

test('MOVE_ATTACHED_ESSENCE uses the frozen element and creature selectors', () => {
  assert.ok(
    tacticSource.includes('if (step.element && String(definition(state, essence)?.element || "") !== String(step.element)) continue;'),
    'move owner must filter the moved Essence by step.element',
  );
  assert.equal(
    tacticSource.includes('step.filters?.element'),
    false,
    'stale nested Essence element filter must not remain',
  );
  assert.ok(
    tacticSource.includes('moveSelectorMatches(state, source, step.source_selector)'),
    'move owner must honor source_selector',
  );
  assert.ok(
    tacticSource.includes('moveSelectorMatches(state, destination, step.destination_selector)'),
    'move owner must honor destination_selector',
  );
  assert.ok(
    tacticSource.includes('step.require_destination_different_creature !== false && source.cr === destination.cr'),
    'same-creature movement must stay blocked by the frozen field',
  );
});

test('each applied movement records canonical current-turn movement metadata', () => {
  assert.ok(
    tacticSource.includes('import { recordRuntimeV02EssenceMovement } from "../_shared/tcg-match-essence-movement-v0-2.ts";'),
    'movement recorder import missing',
  );
  assert.ok(
    tacticSource.includes('source_action_id: `tactic:${effect.source_card_id}`'),
    'pending move must retain its stable source action id',
  );
  assert.ok(
    tacticSource.includes('recordRuntimeV02EssenceMovement('),
    'applied move must write the canonical movement ledger',
  );
});

test('the frozen essence_moved family is exactly Reefshell, Rillrunner and Tidal Lens', () => {
  const entries = essenceMovedListeners();
  assert.deepEqual(entries.map((entry) => entry.card_id).sort(), [
    'tide-reefshell',
    'tide-rillrunner',
    'tide-tidal-lens',
  ]);
  assert.deepEqual([...new Set(entries.flatMap((entry) => (entry.listener.steps || []).map((step) => step.op)))].sort(), [
    'ADD_ATTACK_DAMAGE_MODIFIER',
    'ADD_SHIELD',
    'HEAL',
  ]);
  const predicates = new Set();
  for (const entry of entries) walkRequirements(entry.listener.requirements, predicates);
  assert.deepEqual([...predicates].sort(), [
    'essence_move_destination_is_self',
    'essence_move_element_is',
    'essence_move_source_is_attached_creature',
    'essence_move_source_is_self',
    'source_controller_is_self',
    'target_damaged',
  ]);
  const rillrunner = entries.find((entry) => entry.card_id === 'tide-rillrunner');
  assert.deepEqual(rillrunner.listener.steps[0].duration, {
    expires_on: ['end_of_turn'],
    max_uses: 1,
    consume_on: 'legal_attack_declared',
  });
});

test('one movement-listener owner covers the full frozen essence_moved grammar without card IDs', () => {
  for (const predicate of [
    'essence_move_destination_is_self',
    'essence_move_element_is',
    'essence_move_source_is_attached_creature',
    'essence_move_source_is_self',
    'source_controller_is_self',
  ]) {
    assert.ok(movementSource.includes(`case "${predicate}"`), `missing movement predicate ${predicate}`);
  }
  assert.ok(movementSource.includes('if (op === "ADD_SHIELD")'));
  assert.ok(movementSource.includes('if (op === "ADD_ATTACK_DAMAGE_MODIFIER")'));
  assert.ok(movementSource.includes('if (op === "HEAL")'));
  assert.ok(movementSource.includes('export type RuntimeV02EssenceMovedEvent'));
  assert.ok(movementSource.includes('export function runtimeV02CreateEssenceMovedEvent'));
  for (const forbidden of ['tide-reefshell', 'tide-rillrunner', 'tide-tidal-lens', 'Reefshell', 'Rillrunner', 'Tidal Lens']) {
    assert.equal(movementSource.includes(forbidden), false, `movement owner contains card-specific authority: ${forbidden}`);
  }
});

test('tactic Essence movement dispatches the canonical event after the move and before downstream heal resume', () => {
  assert.ok(tacticSource.includes('runtimeV02CreateEssenceMovedEvent'));
  assert.ok(tacticSource.includes('movementEvents.push(runtimeV02CreateEssenceMovedEvent(movement))'));
  assert.ok(tacticSource.includes('movementFlow = runtimeV02BeginMovementListenerContinuation(state, movementEvents)'));
  const applyStart = tacticSource.indexOf('function applyPendingChoice');
  const applyEnd = tacticSource.indexOf('\nDeno.serve', applyStart);
  assert.ok(applyStart >= 0 && applyEnd > applyStart);
  const apply = tacticSource.slice(applyStart, applyEnd);
  const movementBegin = apply.indexOf('movementFlow = runtimeV02BeginMovementListenerContinuation(state, movementEvents)');
  const cursorAdvance = apply.lastIndexOf('effect.cursor++;');
  const downstreamHeal = apply.indexOf('runtimeV02BeginTacticHealListenerContinuation(state, movementFlow.emitted_heal_packet_ids');
  assert.ok(movementBegin >= 0 && cursorAdvance > movementBegin && downstreamHeal > cursorAdvance);
  assert.ok(apply.includes('setTacticMovementResume(state, effect)'));
  assert.ok(apply.includes('setTacticHealResume(state, effect)'));
});

test('Rillrunner one-use lifecycle bonus is consumed by every committed legal attack completion path', () => {
  const damage = functionSlice(matchSource, 'function attackDamage', 'function directDamage');
  assert.ok(damage.includes('const lifecycle=af.lifecycle_attack_bonus'));
  assert.ok(damage.includes('if(uses>1)lifecycle.uses=uses-1;else delete af.lifecycle_attack_bonus'));

  const aftermathStart = matchSource.indexOf('const aftermath=');
  const aftermathEnd = matchSource.indexOf('const continueResolution=', aftermathStart);
  assert.ok(aftermathStart >= 0 && aftermathEnd > aftermathStart);
  const aftermath = matchSource.slice(aftermathStart, aftermathEnd);
  assert.ok(aftermath.includes('if(cf.lifecycle_attack_bonus&&Number(cf.lifecycle_attack_bonus.turn_seq)===turn)delete cf.lifecycle_attack_bonus'));

  const attackStart = matchSource.indexOf('if(action==="attack"){');
  assert.ok(attackStart >= 0);
  const attack = matchSource.slice(attackStart);
  assert.ok(attack.includes('s.resume_after_resolution="aftermath"'));
  const failedStart = attack.indexOf('if(attackControl.status==="failed"){');
  const failedEnd = attack.indexOf('const structuredTopDeckCardChoice=', failedStart);
  assert.ok(failedStart >= 0 && failedEnd > failedStart);
  const failed = attack.slice(failedStart, failedEnd);
  assert.match(failed, /else aftermath\(seat\);\s*return json\(\{version:VERSION,result:await commit\("attack_condition_failed"/);
  assert.ok(attack.includes('if(attackControl.status==="blocked")return json({ok:false,version:VERSION,error:"stunned_cannot_attack"},400)'));
});

test('Deep Current authority consumes only the shared movement ledger at declaration', () => {
  assert.ok(
    authoritySource.includes('import { runtimeV02CurrentTurnEssenceMovements } from "./tcg-match-essence-movement-v0-2.ts";'),
    'attack authority movement reader import missing',
  );
  assert.ok(
    authoritySource.includes('predicate.event === "essence_moved"'),
    'ready conditional authority must recognize the frozen movement event',
  );
  assert.ok(
    authoritySource.includes('predicate.filters.element === "Tide"'),
    'ready conditional authority must remain restricted to the frozen Tide shape',
  );
  assert.ok(
    authoritySource.includes('...(attack.declaration_current_turn_events || [])'),
    'declaration-owned movement events must be merged into conditional evaluation',
  );
  assert.ok(
    matchSource.includes('evaluateRuntimeAttackReadyConditionalAddFormula(atk,'),
    'battle resolution must still delegate conditional damage to the shared authority',
  );
});

test('private Essence movement ledger is never serialized into tactic or match player views', () => {
  const tacticView = functionSlice(tacticSource, 'function makeView', 'function views');
  const matchView = functionSlice(matchSource, 'function makeView', 'function views');
  for (const [name, source] of [['tactic', tacticView], ['match', matchView]]) {
    assert.equal(source.includes('runtime_essence_movements_v0_2'), false, `${name} view leaked movement ledger key`);
    assert.equal(source.includes('runtimeV02CurrentTurnEssenceMovements'), false, `${name} view leaked movement reader`);
  }
});
