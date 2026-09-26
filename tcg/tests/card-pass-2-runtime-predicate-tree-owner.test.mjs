import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const tree=fs.readFileSync('supabase/functions/_shared/tcg-match-predicate-tree-v0-2.ts','utf8');
const listener=fs.readFileSync('supabase/functions/_shared/tcg-match-event-listener-v0-2.ts','utf8');

test('one shared predicate-tree module owns all/any/not composition',()=>{
  assert.match(tree,/export function runtimeV02EvaluatePredicateTree/);
  assert.match(tree,/Object\.hasOwn\(value, "all"\)/);
  assert.match(tree,/Object\.hasOwn\(value, "any"\)/);
  assert.match(tree,/Object\.hasOwn\(value, "not"\)/);
  assert.match(tree,/RuntimeV02PredicateLeafEvaluator/);
});

test('Event Listener delegates boolean composition to the shared predicate tree',()=>{
  assert.match(listener,/runtimeV02EvaluatePredicateTree/);
  assert.match(listener,/type RuntimeV02PredicateLeaf/);
  assert.match(listener,/function requirementLeaf\(/);
  assert.match(listener,/function requirement\([\s\S]*?return runtimeV02EvaluatePredicateTree\(/);
  const requirement=listener.slice(listener.indexOf('function requirement('),listener.indexOf('function matches('));
  assert.doesNotMatch(requirement,/Object\.hasOwn\([^\n]*"all"/);
  assert.doesNotMatch(requirement,/Object\.hasOwn\([^\n]*"any"/);
  assert.doesNotMatch(requirement,/Object\.hasOwn\([^\n]*"not"/);
});
