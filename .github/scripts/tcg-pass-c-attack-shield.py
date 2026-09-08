from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text()


def write(path: str, text: str) -> None:
    Path(path).write_text(text)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


# 1) Promote Shield addition into the existing shared runtime core.
core_path = "supabase/functions/tcg-tactic-actions/runtime-v0-2-core.ts"
core = read(core_path)
if "export function addRuntimeShield(" in core:
    raise SystemExit("shared Shield primitive already exists")
marker = "export function moveRuntimeDamage("
if core.count(marker) != 1:
    raise SystemExit("shared Shield insertion marker drifted")
helper = '''export function addRuntimeShield(\n  creature: RuntimeCreature,\n  amount: number,\n  shieldCap = 60,\n): number {\n  const previous = Number(creature.shield || 0);\n  const increment = Math.max(0, Number(amount || 0));\n  const cap = Math.max(0, Number(shieldCap || 0));\n  const next = Math.min(cap, Math.max(0, previous + increment));\n  creature.shield = next;\n  return Math.max(0, next - Math.max(0, previous));\n}\n\n'''
core = core.replace(marker, helper + marker, 1)
write(core_path, core)


# 2) Make the Tactic interpreter use the same shared Shield primitive.
tactic_path = "supabase/functions/tcg-tactic-actions/index.ts"
tactic = read(tactic_path)
tactic = replace_once(
    tactic,
    'import { clearRuntimeCondition, hasRuntimeCondition, runtimeConditions } from "./runtime-v0-2-core.ts";',
    'import { addRuntimeShield, clearRuntimeCondition, hasRuntimeCondition, runtimeConditions } from "./runtime-v0-2-core.ts";',
    "tactic shared-core import",
)
tactic = replace_once(
    tactic,
    '''function addShield(cr: Cr, amount: number) {\n  cr.shield = Math.min(60, Math.max(0, Number(cr.shield || 0) + Math.max(0, amount)));\n}\n''',
    "",
    "tactic local addShield owner",
)
tactic = replace_once(
    tactic,
    'else if (op === "ADD_SHIELD") addShield(found.cr, Number(step.amount || 0));',
    'else if (op === "ADD_SHIELD") addRuntimeShield(found.cr, Number(step.amount || 0));',
    "tactic ADD_SHIELD execution",
)
if "function addShield(" in tactic:
    raise SystemExit("tactic local Shield owner survived")
write(tactic_path, tactic)


# 3) Add the narrow attack-owned ADD_SHIELD executor beside condition/recoil owners.
effects_path = "supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts"
effects = read(effects_path)
effects = replace_once(
    effects,
    '''import {\n  applyRuntimeCondition,\n  placeRuntimeDamage,''',
    '''import {\n  addRuntimeShield,\n  applyRuntimeCondition,\n  placeRuntimeDamage,''',
    "attack-effects shared-core import",
)
if "structuredRuntimeAfterDamageShieldEffects" in effects:
    raise SystemExit("structured attack Shield owner already exists")
shield_owner = r'''

export type RuntimeV02AttackShieldEffectResult = {
  target: "$source_creature";
  amount: number;
  actual_gain: number;
  shield_cap: 60;
};

export type RuntimeV02AttackShieldPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackShieldEffectResult[];
};

/**
 * Owns only structured v0.2 attack after-damage programs made entirely from
 * ADD_SHIELD instructions aimed at the source creature.
 *
 * Shield addition itself is delegated to addRuntimeShield so Tactic, legacy
 * match actions and structured attacks share the same 60-Shield cap owner.
 * shield_gained listeners remain a separate later runtime pass; this slice
 * preserves the current state transition without claiming listener parity.
 *
 * Mixed programs deliberately return null so compatibility authority remains
 * whole rather than partially executing a structured list.
 */
export function structuredRuntimeAfterDamageShieldEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  sourceCreature: RuntimeCreature,
): RuntimeV02AttackShieldPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_shield_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_shield_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_shield_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_shield_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_shield_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_shield_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_shield_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_shield_step_invalid:${attackId}:${index}`);
    if (String(step.op || "") !== "ADD_SHIELD") return null;
    rejectUnsupportedFields(
      step,
      ["op", "target", "amount"],
      `tcg_v0_2_attack_shield_step_field_unsupported:${attackId}:${index}`,
    );
    if (String(step.target || "") !== "$source_creature") {
      throw new Error(`tcg_v0_2_attack_shield_target_unsupported:${attackId}:${index}`);
    }
    const amount = Number(step.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_shield_amount_invalid:${attackId}:${index}`);
    }
    return { amount };
  });

  if (normalized.some((step) => step == null)) return null;

  const resolved = normalized.map((raw) => {
    const step = raw!;
    const actualGain = addRuntimeShield(sourceCreature, step.amount);
    return {
      target: "$source_creature" as const,
      amount: step.amount,
      actual_gain: actualGain,
      shield_cap: 60 as const,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects: resolved };
}
'''
effects = effects.rstrip() + shield_owner + "\n"
write(effects_path, effects)


# 4) Wire match actions to the shared Shield primitive and structured attack owner.
match_path = "supabase/functions/tcg-match-actions/index.ts"
match = read(match_path)
match = replace_once(
    match,
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageRecoilEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";\nimport { addRuntimeShield } from "../tcg-tactic-actions/runtime-v0-2-core.ts";',
    "match structured-effects import",
)
match = replace_once(
    match,
    'function addShield(cr:Cr,n:number){cr.shield=Math.min(60,Math.max(0,Number(cr.shield||0)+n))}\n',
    "",
    "match local addShield owner",
)
if match.count("addShield(") != 2:
    raise SystemExit(f"match addShield call inventory drifted: {match.count('addShield(')}")
match = match.replace("addShield(", "addRuntimeShield(")
match = replace_once(
    match,
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard,target,opp.vanguard);const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);',
    'const structuredConditionEffects=structuredRuntimeAfterDamageConditionEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard,target,opp.vanguard);const structuredRecoilEffects=structuredRuntimeAfterDamageRecoilEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);const structuredShieldEffects=structuredRuntimeAfterDamageShieldEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);',
    "match structured Shield execution",
)
match = replace_once(
    match,
    'const sm=ef.match(/gain (\\d+) shield/);if(sm)addRuntimeShield(p.vanguard,Number(sm[1]));',
    'const sm=ef.match(/gain (\\d+) shield/);if(structuredShieldEffects==null&&sm)addRuntimeShield(p.vanguard,Number(sm[1]));',
    "match legacy Shield fallback gate",
)
match = replace_once(
    match,
    'structured_after_damage_recoil:structuredRecoilEffects,damage_dealt:dmg.dealt',
    'structured_after_damage_recoil:structuredRecoilEffects,structured_after_damage_shield:structuredShieldEffects,damage_dealt:dmg.dealt',
    "match structured Shield audit",
)
if "function addShield(" in match:
    raise SystemExit("match local Shield owner survived")
write(match_path, match)


# 5) Focused Deno semantics: shared cap + narrow attack ownership.
deno_test = r'''import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import { addRuntimeShield } from "./runtime-v0-2-core.ts";

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

function creature(shield = 0) {
  return {
    damage: 0,
    shield,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function stateWith(afterDamage: unknown[], attackId = "gravity-shell") {
  const cardId = "test-shield-creature";
  return {
    turn_seq: 12,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "3 Astral — Gravity Shell — 80; gain 20 Shield" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Shield Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Shield Attack",
              cost: [{ element: "Astral", amount: 3 }],
              base_damage: 80,
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

Deno.test("shared Shield primitive preserves the 60 cap and reports actual gain", () => {
  const source = creature(55);
  assertEquals(addRuntimeShield(source, 20), 5);
  assertEquals(source.shield, 60);
  assertEquals(addRuntimeShield(source, 20), 0);
  assertEquals(source.shield, 60);
  assertEquals(addRuntimeShield(source, -10), 0);
  assertEquals(source.shield, 60);
});

Deno.test("Gravity Shell-style attack Shield gain is registry-driven", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
  }]);
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(
    state,
    { card_id: "test-shield-creature" },
    1,
    source,
  );
  assertEquals(result?.attack_id, "gravity-shell");
  assertEquals(result?.effects[0].amount, 20);
  assertEquals(result?.effects[0].actual_gain, 20);
  assertEquals(result?.effects[0].shield_cap, 60);
  assertEquals(source.shield, 30);
});

Deno.test("structured attack Shield gain reports only real capacity at the cap", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
  }]);
  const source = creature(55);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result?.effects[0].actual_gain, 5);
  assertEquals(source.shield, 60);
});

Deno.test("non-ADD_SHIELD after_damage stays on compatibility authority", () => {
  const state = stateWith([{ op: "HEAL", target: "$source_creature", amount: 20 }]);
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.shield, 10);
});

Deno.test("mixed after_damage programs do not partially execute Shield gain", () => {
  const state = stateWith([
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
    { op: "HEAL", target: "$source_creature", amount: 20 },
  ]);
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.shield, 10);
});

Deno.test("attack-owned Shield gain requires the source creature target", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$attack_target",
    amount: 20,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, creature()),
    "tcg_v0_2_attack_shield_target_unsupported",
  );
});

Deno.test("malformed owned Shield metadata fails closed", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
    surprise: true,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, creature()),
    "tcg_v0_2_attack_shield_step_field_unsupported",
  );
});

Deno.test("invalid owned Shield amount fails closed", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 0,
  }]);
  assertThrows(
    () => structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, creature()),
    "tcg_v0_2_attack_shield_amount_invalid",
  );
});

Deno.test("legacy-only matches remain on compatibility authority", () => {
  const state = stateWith([{
    op: "ADD_SHIELD",
    target: "$source_creature",
    amount: 20,
  }]);
  delete state.runtime_registry_v0_2;
  const source = creature(10);
  const result = structuredRuntimeAfterDamageShieldEffects(state, { card_id: "test-shield-creature" }, 1, source);
  assertEquals(result, null);
  assertEquals(source.shield, 10);
});
'''
write("supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-shield-effects.test.ts", deno_test)


# 6) Source wiring and exact frozen inventory proof.
node_test = r'''import test from 'node:test';
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
'''
write("tcg/tests/card-pass-2-runtime-attack-shield-wiring.test.mjs", node_test)

print("Pass C attack Shield patch applied")
