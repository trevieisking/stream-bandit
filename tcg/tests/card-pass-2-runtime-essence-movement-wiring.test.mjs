import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tacticSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');
const authoritySource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-authority-v0-2.ts', 'utf8');
const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');

function functionSlice(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing ${start}`);
  assert.notEqual(to, -1, `missing ${end}`);
  return source.slice(from, to);
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
