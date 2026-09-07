from pathlib import Path

BASE_HEAD = "564fdf24480a55fd70fd8cd19a71e7c58d7ec7f0"


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"replace guard failed {path}: expected 1, got {count}: {old[:140]}")
    p.write_text(text.replace(old, new, 1))


module = r'''import {
  applyRuntimeCondition,
  type ApplyConditionMode,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import { runtimeV02Definition } from "./tcg-runtime-registry-v0-2.ts";

export type RuntimeV02AttackConditionTarget =
  | "$source_creature"
  | "$attack_target"
  | "$current_opponent_vanguard";

export type RuntimeV02AttackConditionEffectResult = {
  target: RuntimeV02AttackConditionTarget;
  condition: string;
  mode: ApplyConditionMode;
  applied: boolean;
  prevented: boolean;
  reason: string | null;
};

export type RuntimeV02AttackConditionPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackConditionEffectResult[];
};

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function rejectUnsupportedFields(
  value: Record<string, unknown>,
  allowed: string[],
  error: string,
): void {
  const keys = new Set(allowed);
  const extra = Object.keys(value).find((key) => !keys.has(key));
  if (extra) throw new Error(`${error}:${extra}`);
}

function currentTurn(state: Record<string, unknown>): number {
  const value = state.turn_seq;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("tcg_v0_2_attack_condition_turn_seq_invalid");
  }
  return value;
}

function mode(value: unknown, attackId: string, index: number): ApplyConditionMode {
  if (value == null) return "apply";
  const normalized = String(value) as ApplyConditionMode;
  if (!["apply", "apply_if_empty", "apply_if_empty_or_same", "replace"].includes(normalized)) {
    throw new Error(`tcg_v0_2_attack_condition_mode_unsupported:${attackId}:${index}:${String(value)}`);
  }
  return normalized;
}

function targetToken(value: unknown, attackId: string, index: number): RuntimeV02AttackConditionTarget {
  const target = String(value || "") as RuntimeV02AttackConditionTarget;
  if (
    target !== "$source_creature" &&
    target !== "$attack_target" &&
    target !== "$current_opponent_vanguard"
  ) {
    throw new Error(`tcg_v0_2_attack_condition_target_unsupported:${attackId}:${index}:${String(value)}`);
  }
  return target;
}

function resolveTarget(
  target: RuntimeV02AttackConditionTarget,
  sourceCreature: RuntimeCreature,
  attackTarget: RuntimeCreature,
  currentOpponentVanguard: RuntimeCreature | null | undefined,
): RuntimeCreature {
  if (target === "$source_creature") return sourceCreature;
  if (target === "$attack_target") return attackTarget;
  if (!currentOpponentVanguard) throw new Error("tcg_v0_2_attack_condition_opponent_vanguard_missing");
  return currentOpponentVanguard;
}

/**
 * Owns only structured v0.2 after-damage programs made entirely from
 * APPLY_CONDITION steps. Mixed programs deliberately return null so the current
 * compatibility path remains authoritative until the other opcodes migrate.
 *
 * Marked v0.2 metadata is fail-closed: malformed condition steps throw instead
 * of falling through to printed English.
 */
export function structuredRuntimeAfterDamageConditionEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
  attackTarget: RuntimeCreature,
  currentOpponentVanguard: RuntimeCreature | null | undefined,
): RuntimeV02AttackConditionPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_condition_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_condition_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_condition_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_condition_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_condition_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_condition_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_condition_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_condition_step_invalid:${attackId}:${index}`);
    if (String(step.op || "") !== "APPLY_CONDITION") return null;
    rejectUnsupportedFields(
      step,
      ["op", "target", "condition", "mode"],
      `tcg_v0_2_attack_condition_step_field_unsupported:${attackId}:${index}`,
    );
    const condition = typeof step.condition === "string" ? step.condition.trim() : "";
    if (!condition) throw new Error(`tcg_v0_2_attack_condition_name_required:${attackId}:${index}`);
    return {
      target: targetToken(step.target, attackId, index),
      condition,
      mode: mode(step.mode, attackId, index),
    };
  });

  if (normalized.some((step) => step == null)) return null;

  const turn = currentTurn(state);
  const effects = normalized.map((raw) => {
    const step = raw!;
    const target = resolveTarget(step.target, sourceCreature, attackTarget, currentOpponentVanguard);
    const result = applyRuntimeCondition(target, step.condition, turn, step.mode);
    return {
      target: step.target,
      condition: step.condition,
      mode: step.mode,
      applied: result.applied,
      prevented: result.prevented,
      reason: result.reason || null,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects };
}
'''


deno_test = r'''import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageConditionEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function creature() {
  return {
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "condition-strike") {
  const cardId = "test-condition-creature";
  return {
    turn_seq: 7,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "1 Shade — Legacy — 50" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Condition Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Condition Strike",
              cost: [{ element: "Shade", amount: 1 }],
              base_damage: 50,
              damage_formula: null,
              requirements: [],
              on_declare: [],
              before_damage: [],
              after_damage: afterDamage,
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown>;
}

Deno.test("condition-only after_damage applies to the actual attack target", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  const source = creature();
  const target = creature();
  const opponentVanguard = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    source,
    target,
    opponentVanguard,
  );
  assertEquals(result?.attack_id, "condition-strike");
  assertEquals(result?.effects[0].applied, true);
  assertEquals(target.conditions.modifier, "Crushed");
  assertEquals(opponentVanguard.conditions.modifier, null);
});

Deno.test("source-creature condition effects are registry-driven", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$source_creature",
    condition: "Scorched",
    mode: "apply_if_empty",
  }], "overheat");
  const source = creature();
  const target = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    source,
    target,
    creature(),
  );
  assertEquals(result?.effects[0].condition, "Scorched");
  assertEquals(source.conditions.scorched, true);
  assertEquals(target.conditions.scorched, false);
});

Deno.test("current-opponent-vanguard target does not alias a Reserve attack target", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$current_opponent_vanguard",
    condition: "Silenced",
    mode: "apply_if_empty",
  }], "dark-forecast");
  const source = creature();
  const reserveTarget = creature();
  const opponentVanguard = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    source,
    reserveTarget,
    opponentVanguard,
  );
  assertEquals(result?.effects[0].applied, true);
  assertEquals(opponentVanguard.conditions.modifier, "Silenced");
  assertEquals(reserveTarget.conditions.modifier, null);
});

Deno.test("apply_if_empty preserves an occupied condition slot", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  const target = creature();
  target.conditions.modifier = "Silenced";
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result?.effects[0].applied, false);
  assertEquals(result?.effects[0].reason, "slot_occupied");
  assertEquals(target.conditions.modifier, "Silenced");
});

Deno.test("condition immunity prevents the structured attack condition", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  const target = creature();
  target.flags.lifecycle_condition_immunity = { turn_seq: 7, conditions: ["Crushed"] };
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result?.effects[0].prevented, true);
  assertEquals(result?.effects[0].reason, "condition_immunity");
  assertEquals(target.conditions.modifier, null);
});

Deno.test("mixed after_damage programs remain on compatibility authority and do not partially execute", () => {
  const state = stateWith([
    { op: "APPLY_CONDITION", target: "$attack_target", condition: "Crushed", mode: "apply_if_empty" },
    { op: "HEAL", target: "$source_creature", amount: 20 },
  ]);
  const target = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result, null);
  assertEquals(target.conditions.modifier, null);
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
  }]);
  delete state.runtime_registry_v0_2;
  const target = creature();
  const result = structuredRuntimeAfterDamageConditionEffects(
    state,
    { card_id: "test-condition-creature" },
    1,
    creature(),
    target,
    creature(),
  );
  assertEquals(result, null);
  assertEquals(target.conditions.modifier, null);
});

Deno.test("malformed owned condition metadata fails closed", () => {
  const state = stateWith([{
    op: "APPLY_CONDITION",
    target: "$attack_target",
    condition: "Crushed",
    mode: "apply_if_empty",
    surprise: true,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageConditionEffects(
      state,
      { card_id: "test-condition-creature" },
      1,
      creature(),
      creature(),
      creature(),
    ),
    "tcg_v0_2_attack_condition_step_field_unsupported",
  );
});
'''


node_test = r'''import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const matchSource = fs.readFileSync('supabase/functions/tcg-match-actions/index.ts', 'utf8');
const conditionSource = fs.readFileSync('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts', 'utf8');

function assertInOrder(needles, message) {
  let cursor = -1;
  for (const needle of needles) {
    const next = matchSource.indexOf(needle, cursor + 1);
    assert.notEqual(next, -1, `${message}: missing ${needle}`);
    assert.ok(next > cursor, `${message}: out of order ${needle}`);
    cursor = next;
  }
}

test('condition-only after_damage programs execute through the structured owner before legacy effects', () => {
  assert.ok(
    matchSource.includes('import { structuredRuntimeAfterDamageConditionEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";'),
    'structured attack condition owner import missing',
  );
  assertInOrder([
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(',
    'if(structuredConditionEffects==null&&ef.includes("this creature becomes scorched"))',
    'const n=scanDefeats()',
  ], 'structured after-damage condition ordering changed');
});

test('every legacy English condition application is gated by structured ownership', () => {
  const fragments = [
    'this creature becomes scorched',
    'becomes blinded',
    'becomes venomed',
    'becomes rooted',
    'becomes silenced',
    'becomes mindbound',
    'becomes crushed',
    'becomes drenched',
    'becomes stunned',
  ];
  for (const fragment of fragments) {
    assert.ok(
      matchSource.includes(`if(structuredConditionEffects==null&&ef.includes("${fragment}")`),
      `legacy condition fallback is not gated: ${fragment}`,
    );
  }
});

test('attack audit records structured condition ownership separately', () => {
  assert.ok(
    matchSource.includes('structured_after_damage_conditions:structuredConditionEffects'),
    'structured after-damage condition audit missing',
  );
});

test('the condition owner is deliberately narrow and fail-closed', () => {
  assert.ok(conditionSource.includes('if (String(step.op || "") !== "APPLY_CONDITION") return null;'));
  assert.ok(conditionSource.includes('["op", "target", "condition", "mode"]'));
  assert.ok(conditionSource.includes('applyRuntimeCondition(target, step.condition, turn, step.mode)'));
  assert.ok(conditionSource.includes('Mixed programs deliberately return null'));
});
'''

Path('supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts').write_text(module)
Path('supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-condition-effects.test.ts').write_text(deno_test)
Path('tcg/tests/card-pass-2-runtime-attack-condition-wiring.test.mjs').write_text(node_test)

match_path = 'supabase/functions/tcg-match-actions/index.ts'
replace_once(
    match_path,
    'import { runtimeV02PrivateRewardInspectionView, structuredRuntimeEvolutionRewardInspection } from "../_shared/tcg-match-reward-inspection-v0-2.ts";\n',
    'import { runtimeV02PrivateRewardInspectionView, structuredRuntimeEvolutionRewardInspection } from "../_shared/tcg-match-reward-inspection-v0-2.ts";\nimport { structuredRuntimeAfterDamageConditionEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";\n',
)
replace_once(
    match_path,
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus,{target_zone:targetWhere,target_controller:relation,source_controller:relation});log(`Seat ${seat}\'s ${ad?.name||"Vanguard"} used ${atk.name} for ${dmg.dealt} damage (${dmg.blocked} Shield prevented).`);',
    'const dmg=attackDamage(p.vanguard,target,s,formulaBase+bonus,{target_zone:targetWhere,target_controller:relation,source_controller:relation});log(`Seat ${seat}\'s ${ad?.name||"Vanguard"} used ${atk.name} for ${dmg.dealt} damage (${dmg.blocked} Shield prevented).`);const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard,target,opp.vanguard);',
)

for fragment in [
    'this creature becomes scorched',
    'becomes blinded',
    'becomes venomed',
    'becomes rooted',
    'becomes silenced',
    'becomes mindbound',
    'becomes crushed',
    'becomes drenched',
    'becomes stunned',
]:
    replace_once(
        match_path,
        f'if(ef.includes("{fragment}"))',
        f'if(structuredConditionEffects==null&&ef.includes("{fragment}"))',
    )

replace_once(
    match_path,
    'structured_count_add:countAddEvaluation,structured_conditional_add:conditionalAddEvaluation,damage_dealt:dmg.dealt',
    'structured_count_add:countAddEvaluation,structured_conditional_add:conditionalAddEvaluation,structured_after_damage_conditions:structuredConditionEffects,damage_dealt:dmg.dealt',
)
