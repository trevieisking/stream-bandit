import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const engine = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-evolution-legality-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');

test('Creature/Evolution family owns one shared evolution legality engine', () => {
  assert.match(engine, /runtimeV02ListLegalEvolutionTargets/);
  assert.match(engine, /runtimeV02ValidateEvolutionDeclaration/);
  for (const error of [
    'evolution_locked_on_first_personal_turn',
    'target_creature_not_found',
    'teen_or_adult_required',
    'evolution_predecessor_mismatch',
    'stack_entered_or_evolved_this_turn',
    'one_evolution_per_stack_per_turn',
  ]) assert.match(engine, new RegExp(error));
});

test('evolve_targets is read-only and uses the shared legality owner', () => {
  const start = match.indexOf('if(action==="evolve_targets")');
  const end = match.indexOf('if(action==="use_ability")', start);
  assert.ok(start >= 0 && end > start, 'evolve_targets action missing');
  const branch = match.slice(start, end);
  assert.match(branch, /runtimeV02ListLegalEvolutionTargets/);
  assert.match(branch, /card_uid/);
  assert.doesNotMatch(branch, /await commit\(/);
  assert.doesNotMatch(branch, /runtimeV02EvolveCreatureFromHand/);
});

test('authoritative evolve commit revalidates through the same legality engine before mutation', () => {
  const start = match.indexOf('if(action==="evolve")');
  const end = match.indexOf('if(action==="attach_essence")', start);
  assert.ok(start >= 0 && end > start, 'evolve action missing');
  const branch = match.slice(start, end);
  const legality = branch.indexOf('runtimeV02ValidateEvolutionDeclaration');
  const mutation = branch.indexOf('runtimeV02EvolveCreatureFromHand');
  assert.ok(legality >= 0 && mutation > legality, 'legality must precede evolution mutation');
  assert.doesNotMatch(branch, /d\.kind!==\"Creature\"/);
  assert.doesNotMatch(branch, /evolution_predecessor_mismatch\"\},400/);
});

test('evolution target projection does not create a browser or database owner', () => {
  assert.doesNotMatch(engine, /fetch\s*\(/);
  assert.doesNotMatch(engine, /supabase/i);
  assert.doesNotMatch(engine, /service_role/i);
  assert.doesNotMatch(engine, /Math\.random/);
});
