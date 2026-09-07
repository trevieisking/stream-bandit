import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
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

test('structured recoil executes after attack damage and before legacy recoil fallback', () => {
  assert.ok(
    matchSource.includes('structuredRuntimeAfterDamageRecoilEffects'),
    'structured recoil owner import/wiring missing',
  );
  assertInOrder([
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(',
    'if(structuredRecoilEffects==null&&ef.match(/place (\\d+) damage on this creature/))',
    'const n=scanDefeats()',
  ], 'structured recoil ordering changed');
});

test('legacy recoil English is gated and the attack audit records structured recoil', () => {
  assert.ok(
    matchSource.includes('if(structuredRecoilEffects==null&&ef.match(/place (\\d+) damage on this creature/))'),
    'legacy recoil fallback is not gated by structured ownership',
  );
  assert.ok(
    matchSource.includes('structured_after_damage_recoil:structuredRecoilEffects'),
    'structured recoil audit field missing',
  );
});

test('recoil owner is deliberately narrow and preserves placement semantics', () => {
  assert.ok(effectSource.includes('if (String(step.op || "") !== "DIRECT_DAMAGE") return null;'));
  assert.ok(effectSource.includes('if (String(step.damage_class || "") !== "recoil") return null;'));
  assert.ok(effectSource.includes('String(step.target || "") !== "$source_creature"'));
  assert.ok(effectSource.includes('sourceAttackId !== attackId'));
  assert.ok(effectSource.includes('placeRuntimeDamage(sourceCreature, step.amount)'));
  assert.ok(effectSource.includes('Damage-packet') && effectSource.includes('listeners remain a separate later runtime pass'));
});

test('the frozen Set One has exactly two attack-owned recoil after_damage programs', () => {
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
  const matches = [...source.matchAll(/"after_damage":\[\{"op":"DIRECT_DAMAGE","target":"\$source_creature","amount":(\d+),"damage_class":"recoil","source_attack_id":"([^"]+)"\}\]/g)]
    .map((match) => [match[2], Number(match[1])])
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  assert.deepEqual(matches, [
    ['meltline-charge', 20],
    ['reckless-rush', 10],
  ]);
});
