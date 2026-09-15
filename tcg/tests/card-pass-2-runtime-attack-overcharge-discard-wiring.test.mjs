import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSetOneRegistry } from '../../tcg-set-one-registry-builder-v0.2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const owner = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-attack-overcharge-discard-choice-v0-2.ts'), 'utf8');
const match = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const arcade = fs.readFileSync(path.join(root, 't.html'), 'utf8');
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'tcg-runtime-capabilities-v0.2.json'), 'utf8'));

function matchesOverchargeDiscardCondition(attack) {
  const onDeclare = attack?.on_declare;
  const beforeDamage = attack?.before_damage;
  const afterDamage = attack?.after_damage;
  if (!Array.isArray(onDeclare) || onDeclare.length !== 1 || !Array.isArray(beforeDamage) || beforeDamage.length !== 0) return false;
  if (!Array.isArray(afterDamage) || afterDamage.length !== 1) return false;
  const record = onDeclare[0];
  if (record?.op !== 'RECORD_EVENT' || typeof record?.event !== 'string' || !record.event) return false;
  if (record?.when?.predicate !== 'event_attack_source_attached_essence_count_at_least') return false;
  if (!Number.isInteger(Number(record?.when?.count)) || Number(record.when.count) < 1) return false;
  const outer = afterDamage[0];
  if (outer?.op !== 'IF' || outer?.when?.predicate !== 'event_occurred' || outer?.when?.event !== record.event) return false;
  if (outer?.when?.controller !== 'self' || outer?.when?.window !== 'current_action' || Number(outer?.when?.min_count) !== 1) return false;
  if (!Array.isArray(outer?.then) || outer.then.length !== 2) return false;
  const discard = outer.then[0];
  const survived = outer.then[1];
  if (discard?.op !== 'DISCARD_ATTACHED_ESSENCE' || discard?.target !== '$source_creature') return false;
  if (Number(discard?.selection?.min) !== 1 || Number(discard?.selection?.max) !== 1) return false;
  if (!discard?.selection?.filters || Object.keys(discard.selection.filters).length !== 0) return false;
  if (survived?.op !== 'IF' || survived?.when?.predicate !== 'target_remains_in_play_after_damage') return false;
  if (!Array.isArray(survived?.then) || survived.then.length !== 1) return false;
  const condition = survived.then[0];
  return condition?.op === 'APPLY_CONDITION' && condition?.target === '$attack_target' && typeof condition?.condition === 'string';
}

test('overcharge discard/condition attack owner is data-driven and card-id-free', () => {
  for (const forbidden of ['volt-stormmane', 'storm-break', 'Stormmane', 'Storm Break', 'Thunder Claw']) {
    assert.equal(owner.includes(forbidden), false, `generic overcharge owner contains card/name authority: ${forbidden}`);
  }
  assert.ok(owner.includes('structuredRuntimeAfterDamageOverchargeDiscardCondition'));
  assert.ok(owner.includes('runtimeV02AttackOverchargeTriggered'));
  assert.ok(owner.includes('runtimeV02CreateAttackOverchargeDiscardChoice'));
  assert.ok(owner.includes('runtimeV02ResolveAttackOverchargeDiscardChoice'));
});

test('frozen Set One inventory has exactly one attack in the declaration-threshold discard/condition family', () => {
  const registry = buildSetOneRegistry(root);
  const matches = [];
  for (const row of registry.definitions) {
    for (const attack of row.definition?.creature?.attacks || []) {
      if (matchesOverchargeDiscardCondition(attack)) matches.push(`${row.card_id}:${attack.id}`);
    }
  }
  assert.deepEqual(matches, ['volt-stormmane:storm-break']);
});

test('Stormmane Thunder Claw stays plain while Storm Break preserves its exact frozen 130-damage overcharge program', () => {
  const registry = buildSetOneRegistry(root);
  const row = registry.definitions.find((entry) => entry.card_id === 'volt-stormmane');
  assert.ok(row, 'missing frozen Volt Stormmane definition');
  const attacks = row.definition?.creature?.attacks || [];
  assert.equal(attacks[0]?.id, 'thunder-claw');
  assert.equal(attacks[0]?.base_damage, 80);
  assert.deepEqual(attacks[0]?.on_declare, []);
  assert.deepEqual(attacks[0]?.after_damage, []);
  assert.equal(matchesOverchargeDiscardCondition(attacks[0]), false);
  assert.equal(attacks[1]?.id, 'storm-break');
  assert.equal(attacks[1]?.base_damage, 130);
  assert.equal(attacks[1]?.damage_formula, null);
  assert.equal(matchesOverchargeDiscardCondition(attacks[1]), true);
});

test('live match owner snapshots the threshold before damage, suppresses legacy English authority for structured matches and resolves after damage', () => {
  assert.ok(match.includes('tcg-match-attack-overcharge-discard-choice-v0-2.ts'));
  assert.ok(match.includes('const structuredOverchargeDiscard=structuredRuntimeAfterDamageOverchargeDiscardCondition('));
  assert.ok(match.includes('const structuredOverchargeTriggered=structuredOverchargeDiscard?runtimeV02AttackOverchargeTriggered('));
  assert.ok(match.includes('structuredOverchargeDiscard==null&&ef.includes("becomes stunned")'));
  assert.ok(match.includes('atk.metadata_source==="legacy"&&ef.includes("4 or more essence")'));
  assert.ok(match.includes('atk.metadata_source==="legacy"&&ad?.id==="volt-stormmane"'));
  assert.equal(match.includes('if(ad?.id==="volt-stormmane"&&'), false, 'marked v0.2 Stormmane must not pass through the old whole-card fallback');

  const snapshot = match.indexOf('const structuredOverchargeTriggered=');
  const damage = match.indexOf('const dmg=attackDamage(', snapshot);
  const createPending = match.indexOf('runtimeV02CreateAttackOverchargeDiscardChoice(', damage);
  const pendingReturn = match.indexOf('if(pendingOverchargeDiscard)', createPending);
  const defeatScan = match.indexOf('const n=scanDefeats()', pendingReturn);
  assert.ok(snapshot >= 0 && damage > snapshot, 'overcharge threshold must be snapshotted before attack damage');
  assert.ok(createPending > damage, 'discard choice must be created only after attack damage');
  assert.ok(pendingReturn > createPending, 'pending attack choice must be surfaced after creation');
  assert.ok(defeatScan > pendingReturn, 'defeat scanning must wait until the after-damage discard choice resolves');
});

test('resolved overcharge public receipt exposes only structural outcome and never the selected Essence identity', () => {
  const branchStart = match.indexOf('if(pending.kind==="discard_attached_essence_then_condition")');
  const branchEnd = match.indexOf('const selectedPending=pending as RuntimeV02PendingAttackChoice', branchStart);
  assert.ok(branchStart >= 0 && branchEnd > branchStart, 'overcharge resolve branch missing');
  const branch = match.slice(branchStart, branchEnd);
  assert.ok(branch.includes('discarded_count:1'));
  assert.ok(branch.includes('target_remained_after_damage:resolved.target_remained_after_damage'));
  assert.ok(branch.includes('condition_applied:resolved.condition_applied'));
  assert.equal(branch.includes('discarded_uid:'), false, 'public resolve receipt must not expose selected Essence UID');
  assert.equal(branch.includes('discarded_card_id:'), false, 'public resolve receipt must not expose selected Essence card ID');
});

test('Arcade Lab routes structured attack choices to the match owner and keeps the old Stormmane pre-prompt legacy-only', () => {
  assert.ok(arcade.includes('function structuredDef(inst)'));
  assert.ok(arcade.includes('function structuredAttack(cr,slot)'));
  assert.ok(arcade.includes("if(v.pending_attack_choice)return{pending:v.pending_attack_choice,owner:'match',action:'resolve_attack_choice'}"));
  assert.ok(arcade.includes("if(route.owner==='tactic')await tacticAction(route.action"));
  assert.ok(arcade.includes('else await battleAction(route.action'));
  assert.ok(arcade.includes("v.phase==='effect_resolution'||v.phase==='attack_effect_resolution'"));
  assert.ok(arcade.includes("if(!structured&&String(d.id||'')==='volt-stormmane'"));
});

test('bounded Storm Break owner does not falsely claim generic RECORD_EVENT, IF, discard, condition or predicate parity', () => {
  for (const op of ['RECORD_EVENT', 'IF', 'DISCARD_ATTACHED_ESSENCE', 'APPLY_CONDITION']) {
    assert.ok(capabilities.operations.missing.includes(op), `${op} must remain missing generic parity`);
  }
  for (const predicate of ['event_attack_source_attached_essence_count_at_least', 'event_occurred', 'target_remains_in_play_after_damage']) {
    assert.ok(capabilities.predicates.missing.includes(predicate), `${predicate} must remain missing generic parity`);
  }
  assert.equal(capabilities.completion.runtime_interpreter_parity, false);
  assert.equal(capabilities.completion.zero_card_specific_runtime_branches, false);
});
