from pathlib import Path

BASE_HEAD = "87b9accb98a3242049a8e40432511a90d4ed1c03"


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"replace guard failed {path}: expected 1, got {count}: {old[:160]}")
    p.write_text(text.replace(old, new, 1))


shared_path = "supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts"
replace_once(
    shared_path,
    '''import {
  applyRuntimeCondition,
  type ApplyConditionMode,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";''',
    '''import {
  applyRuntimeCondition,
  placeRuntimeDamage,
  type ApplyConditionMode,
  type RuntimeCreature,
} from "../tcg-tactic-actions/runtime-v0-2-core.ts";''',
)

shared = Path(shared_path)
text = shared.read_text()
marker = "export function structuredRuntimeAfterDamageRecoilEffects("
if marker in text:
    raise SystemExit("recoil owner already present")
text += r'''

export type RuntimeV02AttackRecoilEffectResult = {
  target: "$source_creature";
  damage_class: "recoil";
  amount: number;
  source_attack_id: string;
  placed: number;
  shield_prevented: 0;
};

export type RuntimeV02AttackRecoilPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackRecoilEffectResult[];
};

/**
 * Owns only structured v0.2 attack after-damage programs made entirely from
 * attack-owned DIRECT_DAMAGE recoil instructions aimed at the source creature.
 *
 * This intentionally preserves the current recoil placement rule: recoil adds
 * directly to accumulated damage and does not consume Shield. Damage-packet
 * listeners remain a separate later runtime pass; this owner does not pretend
 * those listener lifecycles are complete.
 *
 * Mixed programs and non-recoil DIRECT_DAMAGE return null so compatibility
 * authority remains whole rather than partially executing a structured list.
 */
export function structuredRuntimeAfterDamageRecoilEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
): RuntimeV02AttackRecoilPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_recoil_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_recoil_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_recoil_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_recoil_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_recoil_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_recoil_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_recoil_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_recoil_step_invalid:${attackId}:${index}`);
    if (String(step.op || "") !== "DIRECT_DAMAGE") return null;
    if (String(step.damage_class || "") !== "recoil") return null;
    rejectUnsupportedFields(
      step,
      ["op", "target", "amount", "damage_class", "source_attack_id"],
      `tcg_v0_2_attack_recoil_step_field_unsupported:${attackId}:${index}`,
    );
    if (String(step.target || "") !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_recoil_target_unsupported:${attackId}:${index}`);
    }
    const amount = Number(step.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_recoil_amount_invalid:${attackId}:${index}`);
    }
    const sourceAttackId = typeof step.source_attack_id === "string" ? step.source_attack_id.trim() : "";
    if (sourceAttackId !== attackId) {
      throw new Error(`tcg_v0_2_attack_recoil_source_attack_mismatch:${attackId}:${index}`);
    }
    return { amount, source_attack_id: sourceAttackId };
  });

  if (normalized.some((step) => step == null)) return null;

  const effects = normalized.map((raw) => {
    const step = raw!;
    const placed = placeRuntimeDamage(sourceCreature, step.amount);
    return {
      target: "$source_creature" as const,
      damage_class: "recoil" as const,
      amount: step.amount,
      source_attack_id: step.source_attack_id,
      placed,
      shield_prevented: 0 as const,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects };
}
'''
shared.write_text(text)

match_path = "supabase/functions/tcg-match-actions/index.ts"
replace_once(
    match_path,
    'import { structuredRuntimeAfterDamageConditionEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageRecoilEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
)
replace_once(
    match_path,
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard,target,opp.vanguard);',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard,target,opp.vanguard);const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);',
)
replace_once(
    match_path,
    r'if(ef.match(/place (\d+) damage on this creature/)){const m=ef.match(/place (\d+) damage on this creature/)!;directDamage(p.vanguard,Number(m[1]))}',
    r'if(structuredRecoilEffects==null&&ef.match(/place (\d+) damage on this creature/)){const m=ef.match(/place (\d+) damage on this creature/)!;directDamage(p.vanguard,Number(m[1]))}',
)
replace_once(
    match_path,
    'structured_after_damage_conditions:structuredConditionEffects,damage_dealt:',
    'structured_after_damage_conditions:structuredConditionEffects,structured_after_damage_recoil:structuredRecoilEffects,damage_dealt:',
)


deno_test = r'''import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageRecoilEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

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
    damage: 5,
    shield: 30,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "reckless-rush") {
  const cardId = "test-recoil-creature";
  return {
    turn_seq: 9,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "2 Ember — Legacy Rush — 70; place 10 damage on this creature" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Recoil Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Recoil Attack",
              cost: [{ element: "Ember", amount: 2 }],
              base_damage: 70,
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

Deno.test("attack-owned recoil is registry-driven and preserves Shield", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
  }]);
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(
    state,
    { card_id: "test-recoil-creature" },
    1,
    source,
  );
  assertEquals(result?.attack_id, "reckless-rush");
  assertEquals(result?.effects[0].damage_class, "recoil");
  assertEquals(result?.effects[0].placed, 10);
  assertEquals(result?.effects[0].shield_prevented, 0);
  assertEquals(source.damage, 15);
  assertEquals(source.shield, 30, "recoil placement must not consume Shield in this Pass C slice");
});

Deno.test("non-recoil DIRECT_DAMAGE stays on later compatibility/listener authority", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "effect",
    source_attack_id: "reckless-rush",
  }]);
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 5);
  assertEquals(source.shield, 30);
});

Deno.test("mixed after_damage programs do not partially execute recoil", () => {
  const state = stateWith([
    { op: "DIRECT_DAMAGE", target: "$source_creature", amount: 10, damage_class: "recoil", source_attack_id: "reckless-rush" },
    { op: "HEAL", target: "$source_creature", amount: 20 },
  ]);
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 5);
});

Deno.test("attack-owned recoil requires the source creature target", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$attack_target",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, creature()),
    "tcg_v0_2_attack_recoil_target_unsupported",
  );
});

Deno.test("attack-owned recoil source_attack_id must match the structured attack", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "wrong-attack",
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, creature()),
    "tcg_v0_2_attack_recoil_source_attack_mismatch",
  );
});

Deno.test("malformed owned recoil metadata fails closed", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
    surprise: true,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, creature()),
    "tcg_v0_2_attack_recoil_step_field_unsupported",
  );
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "DIRECT_DAMAGE",
    target: "$source_creature",
    amount: 10,
    damage_class: "recoil",
    source_attack_id: "reckless-rush",
  }]);
  delete state.runtime_registry_v0_2;
  const source = creature();
  const result = structuredRuntimeAfterDamageRecoilEffects(state, { card_id: "test-recoil-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 5);
});
'''

node_test = r'''import test from 'node:test';
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
  assert.ok(effectSource.includes('Damage-packet listeners remain a separate later runtime pass'));
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
'''

for path, content in [
    ("supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-recoil-effects.test.ts", deno_test),
    ("tcg/tests/card-pass-2-runtime-attack-recoil-wiring.test.mjs", node_test),
]:
    p = Path(path)
    if p.exists():
        raise SystemExit(f"new test path already exists: {path}")
    p.write_text(content)
