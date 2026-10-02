import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const elements = ['astral','ember','gale','grove','shade','stone','tide','volt'];
const cards = [];
for (const element of elements) {
  const source = fs.readFileSync(`tcg-card-pass-2-${element}.md`, 'utf8');
  for (const match of source.matchAll(/```json\s*([\s\S]*?)```/g)) {
    const card = JSON.parse(match[1]);
    if (card?.schema === 'sb-tcg-card-v0.2') cards.push(card);
  }
}
function walk(value, path, card, out) {
  if (Array.isArray(value)) {
    value.forEach((entry,index)=>walk(entry,`${path}.${index}`,card,out));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (value.op === 'APPLY_CONDITION') {
    out.push({ card_id: card.id, path, condition: value.condition, mode: value.mode });
  }
  for (const [key,child] of Object.entries(value)) {
    walk(child, path ? `${path}.${key}` : key, card, out);
  }
}
const uses = [];
for (const card of cards) walk(card, '', card, uses);

const eventSource = fs.readFileSync('supabase/functions/_shared/tcg-match-event-listener-v0-2.ts','utf8');
const attackSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts','utf8');
const overchargeSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-overcharge-discard-choice-v0-2.ts','utf8');
const conditionalSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-conditional-condition-v0-2.ts','utf8');
const tacticSource = fs.readFileSync('supabase/functions/tcg-tactic-actions/index.ts','utf8');

test('frozen Release 1 APPLY_CONDITION inventory remains exactly 20 with the two accepted modes', () => {
  assert.equal(uses.length, 20);
  const conditionCounts = {};
  const modeCounts = {};
  for (const row of uses) {
    conditionCounts[row.condition] = (conditionCounts[row.condition] || 0) + 1;
    modeCounts[row.mode] = (modeCounts[row.mode] || 0) + 1;
  }
  assert.deepEqual(conditionCounts, {
    Scorched:2, Blinded:2, Venomed:2, Rooted:2, Silenced:2,
    Dazed:4, Crushed:3, Drenched:1, Stunned:2,
  });
  assert.deepEqual(modeCounts, { apply_if_empty:19, apply_if_empty_or_same:1 });
});

test('structured condition producers delegate application to source-aware Condition owner #19', () => {
  for (const [label,source] of [
    ['Event Listener', eventSource],
    ['direct Attack', attackSource],
    ['Stormmane overcharge Attack', overchargeSource],
    ['conditional Attack', conditionalSource],
    ['Tactic', tacticSource],
  ]) {
    assert.match(source, /applyRuntimeConditionWithContext\(/, `${label} is not using source-aware Condition ownership`);
  }
  assert.match(eventSource, /source_controller_seat: candidate\.seat/);
  assert.match(eventSource, /target_controller_seat: target\.seat/);
  assert.match(tacticSource, /source_controller_seat: sourceSeat as 1 \| 2/);
  assert.match(tacticSource, /target_controller_seat: targetSeat as 1 \| 2/);
  assert.match(attackSource, /target_controller_seat: target\.controller_seat/);
  assert.match(overchargeSource, /target_controller_seat: choice\.target_seat/);
});

test('structured producer files remain card-identity-free', () => {
  const runtime = [eventSource,attackSource,overchargeSource,conditionalSource,tacticSource].join('\n');
  for (const row of uses) {
    assert.equal(runtime.includes(row.card_id), false, `runtime dispatch contains frozen card id ${row.card_id}`);
  }
});

test('bound attack target is accepted generically without card-specific handling', () => {
  assert.match(attackSource, /\| "\$bound_attack_target"/);
  assert.match(attackSource, /target === "\$attack_target" \|\| target === "\$bound_attack_target"/);
});
