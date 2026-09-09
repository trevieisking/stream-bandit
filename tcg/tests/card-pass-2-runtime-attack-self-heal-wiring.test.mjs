import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const tacticSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts', 'utf8');
const coreSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/runtime-v0-2-core.ts', 'utf8');
const effectSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');
const healPacketSource = fs.readFileSync('supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts', 'utf8');

function assertInOrder(needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = matchSource.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('structured self-heal executes after attack damage and before English healing fallback', () => {
  assert.ok(matchSource.includes('structuredRuntimeAfterDamageSelfHealEffects'));
  assertInOrder([
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(',
    'const structuredShieldEffects=structuredRuntimeAfterDamageShieldEffects(',
    'const structuredSelfHealEffects=structuredRuntimeAfterDamageSelfHealEffects(',
    'if(structuredSelfHealEffects==null&&ef.includes("heal 10 from this creature"))',
    'if(structuredSelfHealEffects==null&&ef.includes("if this creature has shield, heal 20 from it")',
    'const n=scanDefeats()',
  ], 'structured after-damage self-heal ordering changed');
});

test('legacy self-heal English is gated and structured ownership is auditable', () => {
  assert.ok(matchSource.includes('if(structuredSelfHealEffects==null&&ef.includes("heal 10 from this creature"))'));
  assert.ok(matchSource.includes('if(structuredSelfHealEffects==null&&ef.includes("if this creature has shield, heal 20 from it")'));
  assert.ok(matchSource.includes('structured_after_damage_self_heal:structuredSelfHealEffects'));
});

test('healing has one shared primitive across match, tactic and structured attack engines', () => {
  assert.ok(coreSource.includes('export function healRuntimeDamage('), 'shared healing primitive missing');
  assert.ok(coreSource.includes('const next = Math.max(0, previous - requested);'));
  assert.equal(matchSource.includes('function heal('), false, 'match local healing owner survived');
  assert.equal(tacticSource.includes('function heal('), false, 'tactic local healing owner survived');
  assert.ok(matchSource.includes('healRuntimeDamage('), 'match engine is not using shared healing primitive');
  assert.ok(tacticSource.includes('healRuntimeDamage(found.cr, amount)'), 'legacy tactic heal fallback is not using shared primitive');
  assert.ok(tacticSource.includes('applyRuntimeV02HealPacket(state, found.cr, amount'), 'v0.2 tactic heal is not using canonical packet owner');
  assert.ok(healPacketSource.includes('healRuntimeDamage(targetCreature, requested)'), 'canonical heal-packet owner bypasses shared primitive');
  assert.ok(effectSource.includes('healRuntimeDamage(sourceCreature, step.amount)'), 'structured self-heal bypasses shared primitive');
});

test('self-heal owner is deliberately narrow and leaves packet listeners for later', () => {
  assert.ok(effectSource.includes('String(step.op || "") !== "IF"'));
  assert.ok(effectSource.includes('String(item.op || "") === "HEAL"'));
  assert.ok(effectSource.includes('predicate === "source_damaged"'));
  assert.ok(effectSource.includes('predicate === "source_has_shield_at_least"'));
  assert.ok(effectSource.includes('String(heal.target || "") !== "$source_creature"'));
  assert.ok(effectSource.includes('after_heal_packet listeners remain a later runtime pass'));
});

test('frozen Set One has exactly two deterministic conditional source self-heal attacks', () => {
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
  const matches = [...source.matchAll(/"after_damage":\[\{"op":"IF","when":\{"predicate":"(source_damaged|source_has_shield_at_least)"(?:,"value":(\d+))?\},"then":\[\{"op":"HEAL","target":"\$source_creature","amount":(\d+)\}\]\}\]/g)]
    .map((match) => ({ predicate: match[1], value: match[2] ? Number(match[2]) : null, amount: Number(match[3]) }));
  assert.deepEqual(matches, [
    { predicate: 'source_damaged', value: null, amount: 10 },
    { predicate: 'source_has_shield_at_least', value: 1, amount: 20 },
  ]);
  assert.ok(source.includes('{"id":"rushing-wake","name":"Rushing Wake"'));
  assert.ok(source.includes('{"id":"guarded-surge","name":"Guarded Surge"'));
});

test('choice healing and HEAL_EACH remain outside this tick', () => {
  const tide = fs.readFileSync('tcg-card-pass-2-tide.md', 'utf8');
  const grove = fs.readFileSync('tcg-card-pass-2-grove.md', 'utf8');
  assert.ok(tide.includes('"id":"deep-current"'));
  assert.ok(tide.includes('"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"damaged":true},"as":"heal_target"'));
  assert.ok(grove.includes('"id":"canopy-crash"'));
  assert.ok(grove.includes('"op":"HEAL_EACH","controller":"self","zone":"reserve"'));
  assert.equal(effectSource.includes('HEAL_EACH, selected-target healing'), true);
});