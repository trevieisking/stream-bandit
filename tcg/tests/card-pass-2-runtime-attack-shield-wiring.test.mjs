import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const tacticSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');
const coreSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/runtime-v0-2-core.ts', 'utf8');
const effectSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');

function assertInOrder(needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = matchSource.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('structured Shield gain executes after attack damage and before legacy Shield fallback', () => {
  assert.ok(matchSource.includes('structuredRuntimeAfterDamageShieldEffects'));
  assertInOrder([
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(',
    'const structuredShieldEffects=structuredRuntimeAfterDamageShieldEffects(',
    'const sm=ef.match(/gain (\\d+) shield/)',
    'if(structuredShieldEffects==null&&sm)addRuntimeShield(p.vanguard,Number(sm[1]))',
    'const n=scanDefeats()',
  ], 'structured after-damage Shield ordering changed');
});

test('legacy Shield English is gated and structured ownership is auditable', () => {
  assert.ok(
    matchSource.includes('if(structuredShieldEffects==null&&sm)addRuntimeShield(p.vanguard,Number(sm[1]))'),
    'legacy Shield fallback is not gated by structured ownership',
  );
  assert.ok(
    matchSource.includes('structured_after_damage_shield:structuredShieldEffects'),
    'structured Shield audit field missing',
  );
});

test('Shield addition has one shared 60-cap primitive across match and tactic engines', () => {
  assert.ok(coreSource.includes('export function addRuntimeShield('), 'shared Shield primitive missing');
  assert.ok(coreSource.includes('const next = Math.min(cap, Math.max(0, previous + increment));'));
  assert.equal(matchSource.includes('function addShield('), false, 'match local Shield owner survived');
  assert.equal(tacticSource.includes('function addShield('), false, 'tactic local Shield owner survived');
  assert.ok(matchSource.includes('addRuntimeShield('), 'match engine is not using shared Shield primitive');
  assert.ok(tacticSource.includes('addRuntimeShield(found.cr, Number(step.amount || 0))'), 'tactic engine is not using shared Shield primitive');
  assert.ok(effectSource.includes('addRuntimeShield(sourceCreature, step.amount)'), 'structured attack Shield owner bypasses shared primitive');
});

test('the Shield attack owner is deliberately narrow and leaves listeners for a later pass', () => {
  assert.ok(effectSource.includes('if (String(step.op || "") !== "ADD_SHIELD") return null;'));
  assert.ok(effectSource.includes('["op", "target", "amount"]'));
  assert.ok(effectSource.includes('String(step.target || "") !== "$source_creature"'));
  assert.ok(effectSource.includes('shield_gained listeners remain a separate later runtime pass'));
});

test('the frozen Set One has exactly one attack-owned ADD_SHIELD after_damage program', () => {
  const files = [
    'tcg-card-pass-2-astral.md',
    'tcg-card-pass-2-ember.md',
    'tcg-card-pass-2-gale.md',
    'tcg-card-pass-2-grove.md',
    'tcg-card-pass-2-shade.md',
    'tcg-card-pass-2-stone.md',
    'tcg-card-pass-2-tide.md',
    'tcg-card-pass-2-volt.md',
  ];
  const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  const matches = [...source.matchAll(/"after_damage":\[\{"op":"ADD_SHIELD","target":"\$source_creature","amount":(\d+)\}\]/g)]
    .map((match) => Number(match[1]));
  assert.deepEqual(matches, [20]);
  assert.ok(source.includes('{"id":"gravity-shell","name":"Gravity Shell","cost":[{"element":"Astral","amount":3}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"ADD_SHIELD","target":"$source_creature","amount":20}]}'));
});
