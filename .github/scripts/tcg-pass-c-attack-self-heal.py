from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one replacement, found {count}: {old[:80]!r}")
    file.write_text(text.replace(old, new, 1))


def append_block(path: str, block: str) -> None:
    file = Path(path)
    text = file.read_text().rstrip()
    file.write_text(text + "\n\n" + block.strip() + "\n")


core = "supabase/functions/tcg-tactic-actions/runtime-v0-2-core.ts"
effects = "supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts"
match = "supabase/functions/tcg-match-actions/index.ts"
tactic = "supabase/functions/tcg-tactic-actions/index.ts"

replace_once(
    core,
    '''export function addRuntimeShield(
  creature: RuntimeCreature,
  amount: number,
  shieldCap = 60,
): number {
  const previous = Number(creature.shield || 0);
  const increment = Math.max(0, Number(amount || 0));
  const cap = Math.max(0, Number(shieldCap || 0));
  const next = Math.min(cap, Math.max(0, previous + increment));
  creature.shield = next;
  return Math.max(0, next - Math.max(0, previous));
}
''',
    '''export function addRuntimeShield(
  creature: RuntimeCreature,
  amount: number,
  shieldCap = 60,
): number {
  const previous = Number(creature.shield || 0);
  const increment = Math.max(0, Number(amount || 0));
  const cap = Math.max(0, Number(shieldCap || 0));
  const next = Math.min(cap, Math.max(0, previous + increment));
  creature.shield = next;
  return Math.max(0, next - Math.max(0, previous));
}

export function healRuntimeDamage(
  creature: RuntimeCreature,
  amount: number,
): number {
  const previous = Math.max(0, Number(creature.damage || 0));
  const requested = Math.max(0, Number(amount || 0));
  const next = Math.max(0, previous - requested);
  creature.damage = next;
  return previous - next;
}
''',
)

replace_once(
    effects,
    '''  addRuntimeShield,
  applyRuntimeCondition,
  placeRuntimeDamage,
''',
    '''  addRuntimeShield,
  applyRuntimeCondition,
  healRuntimeDamage,
  placeRuntimeDamage,
''',
)

append_block(
    effects,
    r'''
export type RuntimeV02AttackSelfHealPredicate =
  | { predicate: "source_damaged" }
  | { predicate: "source_has_shield_at_least"; value: number };

export type RuntimeV02AttackSelfHealEffectResult = {
  target: "$source_creature";
  when: RuntimeV02AttackSelfHealPredicate;
  amount: number;
  condition_met: boolean;
  actual_heal: number;
};

export type RuntimeV02AttackSelfHealPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackSelfHealEffectResult[];
};

function selfHealCandidate(step: Record<string, unknown>): boolean {
  if (String(step.op || "") !== "IF") return false;
  const then = step.then;
  if (!Array.isArray(then) || then.length === 0) return false;
  return then.every((raw) => {
    const item = objectRecord(raw);
    return item != null && String(item.op || "") === "HEAL";
  });
}

function selfHealPredicate(
  raw: unknown,
  attackId: string,
  index: number,
): RuntimeV02AttackSelfHealPredicate {
  const when = objectRecord(raw);
  if (!when) throw new Error(`tcg_v0_2_attack_self_heal_predicate_invalid:${attackId}:${index}`);
  const predicate = String(when.predicate || "");
  if (predicate === "source_damaged") {
    rejectUnsupportedFields(
      when,
      ["predicate"],
      `tcg_v0_2_attack_self_heal_predicate_field_unsupported:${attackId}:${index}`,
    );
    return { predicate: "source_damaged" };
  }
  if (predicate === "source_has_shield_at_least") {
    rejectUnsupportedFields(
      when,
      ["predicate", "value"],
      `tcg_v0_2_attack_self_heal_predicate_field_unsupported:${attackId}:${index}`,
    );
    const value = Number(when.value);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`tcg_v0_2_attack_self_heal_shield_threshold_invalid:${attackId}:${index}`);
    }
    return { predicate: "source_has_shield_at_least", value };
  }
  throw new Error(`tcg_v0_2_attack_self_heal_predicate_unsupported:${attackId}:${index}:${predicate}`);
}

function selfHealConditionMatches(
  when: RuntimeV02AttackSelfHealPredicate,
  sourceCreature: RuntimeCreature,
): boolean {
  if (when.predicate === "source_damaged") {
    return Math.max(0, Number(sourceCreature.damage || 0)) > 0;
  }
  return Math.max(0, Number(sourceCreature.shield || 0)) >= when.value;
}

/**
 * Owns only deterministic structured v0.2 attack after-damage programs made
 * entirely from IF -> HEAL $source_creature steps using source_damaged or
 * source_has_shield_at_least predicates.
 *
 * HEAL_EACH, selected-target healing and mixed programs deliberately remain on
 * compatibility/choice authority. Healing itself delegates to healRuntimeDamage
 * so Tactic, legacy match actions and structured attacks share one state owner.
 * after_heal_packet listeners remain a later runtime pass; this slice preserves
 * the existing state transition without pretending listener parity is complete.
 */
export function structuredRuntimeAfterDamageSelfHealEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
): RuntimeV02AttackSelfHealPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_self_heal_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_self_heal_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_self_heal_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_self_heal_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_self_heal_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_self_heal_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_self_heal_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_self_heal_step_invalid:${attackId}:${index}`);
    if (!selfHealCandidate(step)) return null;
    rejectUnsupportedFields(
      step,
      ["op", "when", "then"],
      `tcg_v0_2_attack_self_heal_step_field_unsupported:${attackId}:${index}`,
    );
    const then = step.then as unknown[];
    if (then.length !== 1) {
      throw new Error(`tcg_v0_2_attack_self_heal_then_count_unsupported:${attackId}:${index}`);
    }
    const heal = objectRecord(then[0]);
    if (!heal) throw new Error(`tcg_v0_2_attack_self_heal_heal_step_invalid:${attackId}:${index}`);
    rejectUnsupportedFields(
      heal,
      ["op", "target", "amount"],
      `tcg_v0_2_attack_self_heal_heal_field_unsupported:${attackId}:${index}`,
    );
    if (String(heal.target || "") !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_self_heal_target_unsupported:${attackId}:${index}`);
    }
    const amount = Number(heal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_self_heal_amount_invalid:${attackId}:${index}`);
    }
    return {
      when: selfHealPredicate(step.when, attackId, index),
      amount,
    };
  });

  if (normalized.some((step) => step == null)) return null;

  const resolved = normalized.map((raw) => {
    const step = raw!;
    const conditionMet = selfHealConditionMatches(step.when, sourceCreature);
    const actualHeal = conditionMet ? healRuntimeDamage(sourceCreature, step.amount) : 0;
    return {
      target: "$source_creature" as const,
      when: step.when,
      amount: step.amount,
      condition_met: conditionMet,
      actual_heal: actualHeal,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects: resolved };
}
''',
)

replace_once(
    match,
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageSelfHealEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
)
replace_once(
    match,
    'import { addRuntimeShield } from "../tcg-tactic-actions/runtime-v0-2-core.ts";',
    'import { addRuntimeShield, healRuntimeDamage } from "../tcg-tactic-actions/runtime-v0-2-core.ts";',
)
replace_once(
    match,
    'function heal(cr:Cr,n:number){cr.damage=Math.max(0,Number(cr.damage||0)-n)}\n',
    '',
)

match_path = Path(match)
match_text = match_path.read_text()
match_text = match_text.replace('heal(', 'healRuntimeDamage(')
old = 'const structuredShieldEffects=structuredRuntimeAfterDamageShieldEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);'
new = old + 'const structuredSelfHealEffects=structuredRuntimeAfterDamageSelfHealEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);'
if match_text.count(old) != 1:
    raise SystemExit(f"{match}: structured Shield anchor count {match_text.count(old)}")
match_text = match_text.replace(old, new, 1)
old = 'if(ef.includes("heal 10 from this creature"))healRuntimeDamage(p.vanguard,10);'
new = 'if(structuredSelfHealEffects==null&&ef.includes("heal 10 from this creature"))healRuntimeDamage(p.vanguard,10);'
if match_text.count(old) != 1:
    raise SystemExit(f"{match}: heal-10 fallback anchor count {match_text.count(old)}")
match_text = match_text.replace(old, new, 1)
old = 'if(ef.includes("if this creature has shield, heal 20 from it")&&Number(p.vanguard.shield||0)>0)healRuntimeDamage(p.vanguard,20);'
new = 'if(structuredSelfHealEffects==null&&ef.includes("if this creature has shield, heal 20 from it")&&Number(p.vanguard.shield||0)>0)healRuntimeDamage(p.vanguard,20);'
if match_text.count(old) != 1:
    raise SystemExit(f"{match}: shield-heal fallback anchor count {match_text.count(old)}")
match_text = match_text.replace(old, new, 1)
old = 'structured_after_damage_shield:structuredShieldEffects,damage_dealt:'
new = 'structured_after_damage_shield:structuredShieldEffects,structured_after_damage_self_heal:structuredSelfHealEffects,damage_dealt:'
if match_text.count(old) != 1:
    raise SystemExit(f"{match}: self-heal audit anchor count {match_text.count(old)}")
match_text = match_text.replace(old, new, 1)
match_path.write_text(match_text)

replace_once(
    tactic,
    'import { addRuntimeShield, clearRuntimeCondition, hasRuntimeCondition, runtimeConditions } from "./runtime-v0-2-core.ts";',
    'import { addRuntimeShield, clearRuntimeCondition, hasRuntimeCondition, healRuntimeDamage, runtimeConditions } from "./runtime-v0-2-core.ts";',
)
replace_once(
    tactic,
    '''function heal(cr: Cr, amount: number) {
  cr.damage = Math.max(0, Number(cr.damage || 0) - Math.max(0, amount));
}
''',
    '',
)
tactic_path = Path(tactic)
tactic_text = tactic_path.read_text().replace('heal(', 'healRuntimeDamage(')
tactic_path.write_text(tactic_text)

Path("supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-self-heal-effects.test.ts").write_text(r'''import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageSelfHealEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import { healRuntimeDamage } from "./runtime-v0-2-core.ts";

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

function creature(damage = 0, shield = 0) {
  return {
    damage,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "self-heal-attack") {
  const cardId = "test-self-heal-creature";
  return {
    turn_seq: 15,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "2 Tide — Self Heal — 60; heal" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Self Heal Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Self Heal Attack",
              cost: [{ element: "Tide", amount: 2 }],
              base_damage: 60,
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

Deno.test("shared heal primitive reports actual healing and never goes below zero", () => {
  const source = creature(7);
  assertEquals(healRuntimeDamage(source, 10), 7);
  assertEquals(source.damage, 0);
  assertEquals(healRuntimeDamage(source, 10), 0);
  assertEquals(source.damage, 0);
  assertEquals(healRuntimeDamage(source, -10), 0);
  assertEquals(source.damage, 0);
});

Deno.test("Rushing Wake-style source_damaged self-heal is registry-driven", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }], "rushing-wake");
  const source = creature(30);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result?.attack_id, "rushing-wake");
  assertEquals(result?.effects[0].condition_met, true);
  assertEquals(result?.effects[0].actual_heal, 10);
  assertEquals(source.damage, 20);
});

Deno.test("source_damaged self-heal remains structurally owned when condition is false", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }], "rushing-wake");
  const source = creature(0);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result?.effects[0].condition_met, false);
  assertEquals(result?.effects[0].actual_heal, 0);
  assertEquals(source.damage, 0);
});

Deno.test("Guarded Surge-style Shield predicate heals only while threshold is met", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_has_shield_at_least", value: 1 },
    then: [{ op: "HEAL", target: "$source_creature", amount: 20 }],
  }], "guarded-surge");
  const source = creature(35, 10);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result?.effects[0].condition_met, true);
  assertEquals(result?.effects[0].actual_heal, 20);
  assertEquals(source.damage, 15);

  const noShield = creature(35, 0);
  const noShieldResult = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, noShield);
  assertEquals(noShieldResult?.effects[0].condition_met, false);
  assertEquals(noShieldResult?.effects[0].actual_heal, 0);
  assertEquals(noShield.damage, 35);
});

Deno.test("mixed after_damage programs do not partially execute self-healing", () => {
  const state = stateWith([
    {
      op: "IF",
      when: { predicate: "source_damaged" },
      then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
    },
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
  ]);
  const source = creature(30);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 30);
});

Deno.test("unsupported owned self-heal predicate fails closed", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 1 },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    "tcg_v0_2_attack_self_heal_predicate_unsupported",
  );
});

Deno.test("owned self-heal requires source creature target", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$attack_target", amount: 10 }],
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    "tcg_v0_2_attack_self_heal_target_unsupported",
  );
});

Deno.test("invalid owned self-heal amount fails closed", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 0 }],
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    "tcg_v0_2_attack_self_heal_amount_invalid",
  );
});

Deno.test("selected-target and HEAL_EACH programs stay outside this owner", () => {
  const selected = stateWith([
    { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ]);
  assertEquals(
    structuredRuntimeAfterDamageSelfHealEffects(selected, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    null,
  );
  const each = stateWith([{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 4 },
    then: [{ op: "HEAL_EACH", controller: "self", zone: "reserve", filters: { card_family: "Creature" }, amount: 20 }],
  }]);
  assertEquals(
    structuredRuntimeAfterDamageSelfHealEffects(each, { card_id: "test-self-heal-creature" }, 1, creature(30)),
    null,
  );
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  delete state.runtime_registry_v0_2;
  const source = creature(30);
  const result = structuredRuntimeAfterDamageSelfHealEffects(state, { card_id: "test-self-heal-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.damage, 30);
});
''')

Path("tcg/tests/card-pass-2-runtime-attack-self-heal-wiring.test.mjs").write_text(r'''import test from 'node:test';
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
  assert.ok(tacticSource.includes('healRuntimeDamage(found.cr, Number(step.amount || 0))'), 'tactic HEAL is not using shared primitive');
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
''')

print("Pass C deterministic self-heal patch applied")
