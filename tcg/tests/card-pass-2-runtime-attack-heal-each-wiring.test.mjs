import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const effectSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');
const groveSource = fs.readFileSync('tcg-card-pass-2-grove.md', 'utf8');
const tideSource = fs.readFileSync('tcg-card-pass-2-tide.md', 'utf8');

function assertInOrder(needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = matchSource.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('structured HEAL_EACH executes after attack damage and before its legacy fallback', () => {
  assert.ok(matchSource.includes('structuredRuntimeAfterDamageHealEachEffects'));
  assertInOrder([
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(',
    'const structuredShieldEffects=structuredRuntimeAfterDamageShieldEffects(',
    'const structuredSelfHealEffects=structuredRuntimeAfterDamageSelfHealEffects(',
    'const structuredHealEachEffects=structuredRuntimeAfterDamageHealEachEffects(',
    'if(structuredHealEachEffects==null&&ef.includes("heal 20 from each friendly reserve creature")',
    'const n=scanDefeats()',
  ], 'structured after-damage HEAL_EACH ordering changed');
});

test('legacy Canopy Crash English is gated and structured ownership is auditable', () => {
  assert.ok(
    matchSource.includes('if(structuredHealEachEffects==null&&ef.includes("heal 20 from each friendly reserve creature")'),
    'legacy Reserve healing fallback is not gated by structured ownership',
  );
  assert.ok(
    matchSource.includes('structured_after_damage_heal_each:structuredHealEachEffects'),
    'structured HEAL_EACH audit field missing',
  );
});

test('HEAL_EACH owner is deliberately narrow and keeps heal listeners for a later pass', () => {
  assert.ok(effectSource.includes('String(item.op || "") === "HEAL_EACH"'));
  assert.ok(effectSource.includes('["op", "controller", "zone", "filters", "amount"]'));
  assert.ok(effectSource.includes('String(heal.controller || "") !== "self"'));
  assert.ok(effectSource.includes('String(heal.zone || "") !== "reserve"'));
  assert.ok(effectSource.includes('["card_family"]'));
  assert.ok(effectSource.includes('String(filters.card_family || "") !== "Creature"'));
  assert.ok(effectSource.includes('const conditionMet = occupied.length >= step.when.count;'));
  assert.ok(effectSource.includes('reserve_index: reserveIndex'));
  assert.ok(effectSource.includes('after_heal_packet listeners remain a separate later runtime pass'));
});

test('frozen Set One has exactly one attack-owned Canopy Crash HEAL_EACH program', () => {
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
  const program = '"after_damage":[{"op":"IF","when":{"predicate":"reserve_count_at_least","controller":"self","count":4},"then":[{"op":"HEAL_EACH","controller":"self","zone":"reserve","filters":{"card_family":"Creature"},"amount":20}]}]';
  assert.equal(source.split(program).length - 1, 1);
  assert.ok(groveSource.includes('"id":"canopy-crash","name":"Canopy Crash"'));
  assert.ok(groveSource.includes(program));
});

test('Deep Current selected-target heal stays outside this deterministic owner', () => {
  assert.ok(tideSource.includes('"id":"deep-current","name":"Deep Current"'));
  assert.ok(tideSource.includes('"after_damage":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"damaged":true},"as":"heal_target"},{"op":"HEAL","target":"$heal_target","amount":30}]'));
  assert.ok(matchSource.includes('if(ad?.id==="tide-tideroar"&&ef.includes("heal 30 from one friendly creature"))'));
});
