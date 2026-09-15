import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const effectSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');
const choiceSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-choice-v0-2.ts', 'utf8');
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

test('frozen Deep Current owns exactly one damaged-friendly selected heal program', () => {
  const program = '"after_damage":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"damaged":true},"as":"heal_target"},{"op":"HEAL","target":"$heal_target","amount":30}]';
  const files = ['tcg-card-pass-2-astral.md','tcg-card-pass-2-ember.md','tcg-card-pass-2-gale.md','tcg-card-pass-2-grove.md','tcg-card-pass-2-shade.md','tcg-card-pass-2-stone.md','tcg-card-pass-2-tide.md','tcg-card-pass-2-volt.md'];
  const all = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  assert.equal(all.split(program).length - 1, 1);
  assert.ok(tideSource.includes('"id":"deep-current","name":"Deep Current"'));
  assert.ok(tideSource.includes(program));
});

test('structured selected-heal parser is narrow and heal listeners remain later', () => {
  assert.ok(effectSource.includes('structuredRuntimeAfterDamageSelectedHealChoice'));
  assert.ok(effectSource.includes('String(select.controller || "") !== "self"'));
  assert.ok(effectSource.includes('String(select.zone || "") !== "field"'));
  assert.ok(effectSource.includes('filters.damaged !== true'));
  assert.ok(effectSource.includes('String(heal.target || "") !== target'));
  assert.ok(effectSource.includes('after_heal_packet listeners remain a separate later lifecycle pass'));
});

test('attack-choice owner is private, anchor-bound and actual-heal authoritative', () => {
  assert.ok(choiceSource.includes('select_damaged_friendly_creature_heal'));
  assert.ok(choiceSource.includes('waiting: true'));
  assert.ok(choiceSource.includes('choice.id !== choiceId'));
  assert.ok(choiceSource.includes('candidate.anchor_uid === option.anchor_uid'));
  assert.ok(choiceSource.includes('target_position_changed'));
  assert.ok(choiceSource.includes('target_not_damaged'));
  assert.ok(choiceSource.includes('applyRuntimeV02AttackSelectedHealPacket('));
  assert.ok(choiceSource.includes(': healRuntimeDamage(entry.creature, choice.amount);'));
  assert.ok(choiceSource.includes('emitted_packet_ids: emittedPacketIds'));
  assert.ok(!choiceSource.includes('heal_where'), 'structured attack choice must not trust legacy heal_where input');
  assert.ok(!choiceSource.includes('heal_index'), 'structured attack choice must not trust legacy heal_index input');
});

test('match view and resolve command expose one reconnect-safe attack-choice action with selected-heal kind routing', () => {
  assert.ok(matchSource.includes('pending_attack_choice:runtimeV02PendingAttackChoiceView(s.pending_attack_choice||null,viewerSeat as 1|2)'));
  assertInOrder([
    'if(action==="concede")',
    'if(action==="resolve_attack_choice")',
    'if(action==="take_reward")',
    'if(s.phase!=="play"||Number(s.active_seat)!==seat)',
  ], 'attack choice must resolve before ordinary play-phase gating');
  assert.ok(matchSource.includes('s.phase!=="attack_effect_resolution"'));
  assert.ok(matchSource.includes('const selectedPending=pending as RuntimeV02PendingAttackChoice'));
  assert.ok(matchSource.includes('runtimeV02ResolveSelectedHealChoice(selectedPending,seat as 1|2,String(body.choice_id||""),ids,friendlyFieldEntries(p,s),s)'));
  assert.ok(matchSource.includes('delete s.pending_attack_choice'));
  assert.ok(matchSource.includes('commit("resolve_attack_choice"'));
});

test('Deep Current now creates a real post-damage choice and gates the old body target fallback', () => {
  assertInOrder([
    'const dmg=attackDamage(',
    'const structuredHealEachEffects=structuredRuntimeAfterDamageHealEachEffects(',
    'const structuredSelectedHealChoice=structuredRuntimeAfterDamageSelectedHealChoice(',
    'if(structuredSelectedHealChoice==null&&ad?.id==="tide-tideroar"',
    'const pendingSelectedHeal=structuredSelectedHealChoice?runtimeV02CreateSelectedHealChoice(',
    's.phase="attack_effect_resolution"',
    'commit("attack_pending_choice"',
  ], 'selected heal choice ordering changed');
  assert.ok(matchSource.includes('structured_after_damage_selected_heal:selectedHealAudit'));
  assert.ok(matchSource.includes('legal_target_count:pendingSelectedHeal?.options.length||0'));
});

test('attack choice remains separate from defeat reward/promotion resolution authority', () => {
  assert.ok(matchSource.includes('const queue=()=>{s.pending_resolutions=s.pending_resolutions||[]'));
  assert.ok(matchSource.includes('q.kind!=="take_reward"'));
  assert.ok(matchSource.includes('q.kind!=="promote"'));
  assert.ok(!choiceSource.includes('pending_resolutions'));
});
