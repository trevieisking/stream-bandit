from pathlib import Path

BASE = "db48f58fc004691cd0fd39f089d650998203b5cc"
EFFECTS = Path("supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts")
MATCH = Path("supabase/functions/tcg-match-actions/index.ts")
DENO_TEST = Path("supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-heal-each-effects.test.ts")
NODE_TEST = Path("tcg/tests/card-pass-2-runtime-attack-heal-each-wiring.test.mjs")


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:120]!r}")
    path.write_text(text.replace(old, new, 1))


if DENO_TEST.exists() or NODE_TEST.exists():
    raise SystemExit("heal-each focused test file already exists")

effects = EFFECTS.read_text()
if "structuredRuntimeAfterDamageHealEachEffects" in effects:
    raise SystemExit("heal-each structured owner already exists")
expected_tail = '  return { attack_id: attackId, phase: "after_damage", effects: resolved };\n}'
if not effects.rstrip().endswith(expected_tail):
    raise SystemExit("attack-effects tail moved; refusing append")

heal_each_block = r'''

export type RuntimeV02AttackHealEachPredicate = {
  predicate: "reserve_count_at_least";
  controller: "self";
  count: number;
};

export type RuntimeV02AttackHealEachTargetResult = {
  reserve_index: number;
  actual_heal: number;
};

export type RuntimeV02AttackHealEachEffectResult = {
  when: RuntimeV02AttackHealEachPredicate;
  controller: "self";
  zone: "reserve";
  filters: { card_family: "Creature" };
  amount: number;
  condition_met: boolean;
  target_count: number;
  actual_heal_total: number;
  targets: RuntimeV02AttackHealEachTargetResult[];
};

export type RuntimeV02AttackHealEachPhaseResult = {
  attack_id: string;
  phase: "after_damage";
  effects: RuntimeV02AttackHealEachEffectResult[];
};

function healEachCandidate(step: Record<string, unknown>): boolean {
  if (String(step.op || "") !== "IF") return false;
  const then = step.then;
  if (!Array.isArray(then) || then.length === 0) return false;
  return then.every((raw) => {
    const item = objectRecord(raw);
    return item != null && String(item.op || "") === "HEAL_EACH";
  });
}

function healEachPredicate(
  raw: unknown,
  attackId: string,
  index: number,
): RuntimeV02AttackHealEachPredicate {
  const when = objectRecord(raw);
  if (!when) throw new Error(`tcg_v0_2_attack_heal_each_predicate_invalid:${attackId}:${index}`);
  rejectUnsupportedFields(
    when,
    ["predicate", "controller", "count"],
    `tcg_v0_2_attack_heal_each_predicate_field_unsupported:${attackId}:${index}`,
  );
  if (String(when.predicate || "") !== "reserve_count_at_least") {
    throw new Error(`tcg_v0_2_attack_heal_each_predicate_unsupported:${attackId}:${index}:${String(when.predicate || "")}`);
  }
  if (String(when.controller || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_heal_each_predicate_controller_unsupported:${attackId}:${index}`);
  }
  const count = Number(when.count);
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`tcg_v0_2_attack_heal_each_count_invalid:${attackId}:${index}`);
  }
  return { predicate: "reserve_count_at_least", controller: "self", count };
}

/**
 * Owns only deterministic structured v0.2 attack after-damage programs made
 * entirely from IF reserve_count_at_least(self) -> HEAL_EACH self Reserve
 * Creature steps.
 *
 * Selected-target healing, other zones/filters and mixed programs deliberately
 * remain on compatibility/choice authority. Every packet delegates to the same
 * healRuntimeDamage primitive used by Tactics and self-healing attacks.
 * after_heal_packet listeners remain a separate later runtime pass.
 */
export function structuredRuntimeAfterDamageHealEachEffects(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
  friendlyReserve: Array<RuntimeCreature | null | undefined>,
): RuntimeV02AttackHealEachPhaseResult | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_heal_each_requires_creature");
  }
  if (!Array.isArray(friendlyReserve)) {
    throw new Error("tcg_v0_2_attack_heal_each_reserve_required");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_heal_each_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_heal_each_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_heal_each_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_heal_each_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_heal_each_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_heal_each_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length === 0) return null;

  const normalized = attack.after_damage.map((rawStep, index) => {
    const step = objectRecord(rawStep);
    if (!step) throw new Error(`tcg_v0_2_attack_heal_each_step_invalid:${attackId}:${index}`);
    if (!healEachCandidate(step)) return null;
    rejectUnsupportedFields(
      step,
      ["op", "when", "then"],
      `tcg_v0_2_attack_heal_each_step_field_unsupported:${attackId}:${index}`,
    );
    const then = step.then as unknown[];
    if (then.length !== 1) {
      throw new Error(`tcg_v0_2_attack_heal_each_then_count_unsupported:${attackId}:${index}`);
    }
    const heal = objectRecord(then[0]);
    if (!heal) throw new Error(`tcg_v0_2_attack_heal_each_heal_step_invalid:${attackId}:${index}`);
    rejectUnsupportedFields(
      heal,
      ["op", "controller", "zone", "filters", "amount"],
      `tcg_v0_2_attack_heal_each_heal_field_unsupported:${attackId}:${index}`,
    );
    if (String(heal.controller || "") !== "self") {
      throw new Error(`tcg_v0_2_attack_heal_each_controller_unsupported:${attackId}:${index}`);
    }
    if (String(heal.zone || "") !== "reserve") {
      throw new Error(`tcg_v0_2_attack_heal_each_zone_unsupported:${attackId}:${index}`);
    }
    const filters = objectRecord(heal.filters);
    if (!filters) throw new Error(`tcg_v0_2_attack_heal_each_filters_required:${attackId}:${index}`);
    rejectUnsupportedFields(
      filters,
      ["card_family"],
      `tcg_v0_2_attack_heal_each_filter_field_unsupported:${attackId}:${index}`,
    );
    if (String(filters.card_family || "") !== "Creature") {
      throw new Error(`tcg_v0_2_attack_heal_each_card_family_unsupported:${attackId}:${index}`);
    }
    const amount = Number(heal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`tcg_v0_2_attack_heal_each_amount_invalid:${attackId}:${index}`);
    }
    return {
      when: healEachPredicate(step.when, attackId, index),
      amount,
    };
  });

  if (normalized.some((step) => step == null)) return null;

  const occupied = friendlyReserve
    .map((target, reserveIndex) => ({ target, reserveIndex }))
    .filter((entry): entry is { target: RuntimeCreature; reserveIndex: number } => entry.target != null);

  const effects = normalized.map((raw) => {
    const step = raw!;
    const conditionMet = occupied.length >= step.when.count;
    const targets = conditionMet
      ? occupied.map(({ target, reserveIndex }) => ({
        reserve_index: reserveIndex,
        actual_heal: healRuntimeDamage(target, step.amount),
      }))
      : [];
    return {
      when: step.when,
      controller: "self" as const,
      zone: "reserve" as const,
      filters: { card_family: "Creature" as const },
      amount: step.amount,
      condition_met: conditionMet,
      target_count: targets.length,
      actual_heal_total: targets.reduce((sum, target) => sum + target.actual_heal, 0),
      targets,
    };
  });

  return { attack_id: attackId, phase: "after_damage", effects };
}
'''

EFFECTS.write_text(effects.rstrip() + heal_each_block + "\n")

replace_once(
    MATCH,
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageSelfHealEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageHealEachEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageSelfHealEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
)
replace_once(
    MATCH,
    'const structuredSelfHealEffects=structuredRuntimeAfterDamageSelfHealEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);',
    'const structuredSelfHealEffects=structuredRuntimeAfterDamageSelfHealEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.vanguard);const structuredHealEachEffects=structuredRuntimeAfterDamageHealEachEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.reserve);',
)
replace_once(
    MATCH,
    'if(ef.includes("heal 20 from each friendly reserve creature")&&p.reserve.filter(Boolean).length===4)for(const cr of p.reserve)if(cr)healRuntimeDamage(cr,20);',
    'if(structuredHealEachEffects==null&&ef.includes("heal 20 from each friendly reserve creature")&&p.reserve.filter(Boolean).length===4)for(const cr of p.reserve)if(cr)healRuntimeDamage(cr,20);',
)
replace_once(
    MATCH,
    'structured_after_damage_self_heal:structuredSelfHealEffects,damage_dealt:dmg.dealt',
    'structured_after_damage_self_heal:structuredSelfHealEffects,structured_after_damage_heal_each:structuredHealEachEffects,damage_dealt:dmg.dealt',
)

DENO_TEST.write_text(r'''import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageHealEachEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";

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

function stateWith(afterDamage: unknown[], attackId = "canopy-crash") {
  const cardId = "test-heal-each-creature";
  return {
    turn_seq: 19,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, attack_1: "4 Grove — Canopy Crash — 140; heal Reserve" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Heal Each Creature",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: attackId,
              name: "Canopy Crash",
              cost: [{ element: "Grove", amount: 4 }],
              base_damage: 140,
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

function canopyProgram() {
  return [{
    op: "IF",
    when: { predicate: "reserve_count_at_least", controller: "self", count: 4 },
    then: [{
      op: "HEAL_EACH",
      controller: "self",
      zone: "reserve",
      filters: { card_family: "Creature" },
      amount: 20,
    }],
  }];
}

Deno.test("Canopy Crash-style full Reserve healing is registry-driven", () => {
  const reserve = [creature(30), creature(10), creature(0), creature(25)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    stateWith(canopyProgram()),
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result?.attack_id, "canopy-crash");
  assertEquals(result?.effects[0].condition_met, true);
  assertEquals(result?.effects[0].target_count, 4);
  assertEquals(result?.effects[0].actual_heal_total, 50);
  assertEquals(result?.effects[0].targets.map((target) => target.actual_heal).join(","), "20,10,0,20");
  assertEquals(reserve.map((target) => target.damage).join(","), "10,0,0,5");
});

Deno.test("Reserve threshold false remains structurally owned and heals nobody", () => {
  const reserve = [creature(30), creature(10), creature(25), null];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    stateWith(canopyProgram()),
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result?.effects[0].condition_met, false);
  assertEquals(result?.effects[0].target_count, 0);
  assertEquals(result?.effects[0].actual_heal_total, 0);
  assertEquals(reserve.slice(0, 3).map((target: any) => target.damage).join(","), "30,10,25");
});

Deno.test("HEAL_EACH reports actual healing per Reserve target", () => {
  const reserve = [creature(5), creature(20), creature(1), creature(40)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    stateWith(canopyProgram()),
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result?.effects[0].actual_heal_total, 46);
  assertEquals(result?.effects[0].targets.map((target) => target.actual_heal).join(","), "5,20,1,20");
  assertEquals(reserve.map((target) => target.damage).join(","), "0,0,0,20");
});

Deno.test("mixed after_damage programs do not partially execute HEAL_EACH", () => {
  const state = stateWith([
    ...canopyProgram(),
    { op: "ADD_SHIELD", target: "$source_creature", amount: 20 },
  ]);
  const reserve = [creature(30), creature(30), creature(30), creature(30)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    state,
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result, null);
  assertEquals(reserve.map((target) => target.damage).join(","), "30,30,30,30");
});

Deno.test("HEAL_EACH requires self Reserve Creature scope", () => {
  const wrongController = canopyProgram() as any[];
  wrongController[0].then[0].controller = "opponent";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(wrongController),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_controller_unsupported",
  );

  const wrongZone = canopyProgram() as any[];
  wrongZone[0].then[0].zone = "field";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(wrongZone),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_zone_unsupported",
  );
});

Deno.test("unsupported HEAL_EACH filters and amounts fail closed", () => {
  const filtered = canopyProgram() as any[];
  filtered[0].then[0].filters.element = "Grove";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(filtered),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_filter_field_unsupported",
  );

  const invalidAmount = canopyProgram() as any[];
  invalidAmount[0].then[0].amount = 0;
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(invalidAmount),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_amount_invalid",
  );
});

Deno.test("unsupported HEAL_EACH predicate fails closed", () => {
  const program = canopyProgram() as any[];
  program[0].when.predicate = "source_damaged";
  assertThrows(
    () => structuredRuntimeAfterDamageHealEachEffects(
      stateWith(program),
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    "tcg_v0_2_attack_heal_each_predicate_unsupported",
  );
});

Deno.test("self-heal and selected-target healing remain outside HEAL_EACH owner", () => {
  const selfHeal = stateWith([{
    op: "IF",
    when: { predicate: "source_damaged" },
    then: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  }]);
  assertEquals(
    structuredRuntimeAfterDamageHealEachEffects(
      selfHeal,
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    null,
  );

  const selected = stateWith([
    { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ]);
  assertEquals(
    structuredRuntimeAfterDamageHealEachEffects(
      selected,
      { card_id: "test-heal-each-creature" },
      1,
      [creature(), creature(), creature(), creature()],
    ),
    null,
  );
});

Deno.test("legacy-only matches remain on HEAL_EACH compatibility authority", () => {
  const state = stateWith(canopyProgram());
  delete state.runtime_registry_v0_2;
  const reserve = [creature(30), creature(30), creature(30), creature(30)];
  const result = structuredRuntimeAfterDamageHealEachEffects(
    state,
    { card_id: "test-heal-each-creature" },
    1,
    reserve,
  );
  assertEquals(result, null);
  assertEquals(reserve.map((target) => target.damage).join(","), "30,30,30,30");
});
''')

NODE_TEST.write_text(r'''import test from 'node:test';
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
''')

print("bounded Canopy Crash HEAL_EACH patch applied")
