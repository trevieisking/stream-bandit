from pathlib import Path

BASE = "c693095101872f8d5e347b9371c68119d5f5defe"
EFFECTS = Path("supabase/functions/_shared/tcg-match-attack-effects-v0-2.ts")
CHOICE = Path("supabase/functions/_shared/tcg-match-attack-choice-v0-2.ts")
MATCH = Path("supabase/functions/tcg-match-actions/index.ts")
DENO_TEST = Path("supabase/functions/tcg-tactic-actions/runtime-v0-2-attack-selected-heal-choice.test.ts")
NODE_TEST = Path("tcg/tests/card-pass-2-runtime-attack-selected-heal-wiring.test.mjs")


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:160]!r}")
    path.write_text(text.replace(old, new, 1))


if CHOICE.exists() or DENO_TEST.exists() or NODE_TEST.exists():
    raise SystemExit("selected-heal permanent file already exists")

effects = EFFECTS.read_text()
if "structuredRuntimeAfterDamageSelectedHealChoice" in effects:
    raise SystemExit("selected-heal structured parser already exists")

selected_heal_block = r'''
export type RuntimeV02AttackSelectedHealChoice = {
  attack_id: string;
  phase: "after_damage";
  selection: {
    controller: "self";
    zone: "field";
    count: 1;
    filters: { damaged: true };
    as: string;
  };
  heal: {
    target: string;
    amount: number;
  };
};

/**
 * Owns only the deterministic structured after-damage choice program:
 * SELECT_CREATURE(self, field, exactly one damaged creature) followed by
 * HEAL $selected. It describes the choice but deliberately does not select or
 * heal a target; the revision-checked attack-choice owner performs that work.
 *
 * Mixed programs and other selectors remain outside this owner. Marked v0.2
 * metadata that matches this program family but is malformed fails closed.
 * after_heal_packet listeners remain a separate later lifecycle pass.
 */
export function structuredRuntimeAfterDamageSelectedHealChoice(
  state: Record<string, unknown>,
  instanceOrId: string | { card_id?: unknown } | null | undefined,
  attackSlot: number,
): RuntimeV02AttackSelectedHealChoice | null {
  const definition = runtimeV02Definition(state, instanceOrId);
  if (!definition) return null;
  if (String(definition.card_family || "") !== "Creature") {
    throw new Error("tcg_v0_2_attack_selected_heal_requires_creature");
  }

  const creature = objectRecord(definition.creature);
  if (!creature) throw new Error("tcg_v0_2_attack_selected_heal_creature_required");
  const attacks = creature.attacks;
  if (!Array.isArray(attacks)) throw new Error("tcg_v0_2_attack_selected_heal_attacks_required");
  if (!Number.isInteger(attackSlot) || attackSlot < 1 || attackSlot > attacks.length) {
    throw new Error("tcg_v0_2_attack_selected_heal_slot_invalid");
  }

  const attack = objectRecord(attacks[attackSlot - 1]);
  if (!attack) throw new Error("tcg_v0_2_attack_selected_heal_attack_invalid");
  const attackId = typeof attack.id === "string" ? attack.id.trim() : "";
  if (!attackId) throw new Error("tcg_v0_2_attack_selected_heal_attack_id_required");
  if (!Array.isArray(attack.after_damage)) {
    throw new Error(`tcg_v0_2_attack_selected_heal_after_damage_required:${attackId}`);
  }
  if (attack.after_damage.length !== 2) return null;

  const select = objectRecord(attack.after_damage[0]);
  const heal = objectRecord(attack.after_damage[1]);
  if (!select || !heal) return null;
  if (String(select.op || "") !== "SELECT_CREATURE" || String(heal.op || "") !== "HEAL") return null;

  rejectUnsupportedFields(
    select,
    ["op", "controller", "zone", "count", "filters", "as"],
    `tcg_v0_2_attack_selected_heal_select_field_unsupported:${attackId}`,
  );
  if (String(select.controller || "") !== "self") {
    throw new Error(`tcg_v0_2_attack_selected_heal_controller_unsupported:${attackId}`);
  }
  if (String(select.zone || "") !== "field") {
    throw new Error(`tcg_v0_2_attack_selected_heal_zone_unsupported:${attackId}`);
  }
  if (Number(select.count) !== 1 || !Number.isInteger(Number(select.count))) {
    throw new Error(`tcg_v0_2_attack_selected_heal_count_unsupported:${attackId}`);
  }
  const filters = objectRecord(select.filters);
  if (!filters) throw new Error(`tcg_v0_2_attack_selected_heal_filters_required:${attackId}`);
  rejectUnsupportedFields(
    filters,
    ["damaged"],
    `tcg_v0_2_attack_selected_heal_filter_field_unsupported:${attackId}`,
  );
  if (filters.damaged !== true) {
    throw new Error(`tcg_v0_2_attack_selected_heal_damaged_filter_required:${attackId}`);
  }
  const variable = typeof select.as === "string" ? select.as.trim() : "";
  if (!variable) throw new Error(`tcg_v0_2_attack_selected_heal_variable_required:${attackId}`);

  rejectUnsupportedFields(
    heal,
    ["op", "target", "amount"],
    `tcg_v0_2_attack_selected_heal_heal_field_unsupported:${attackId}`,
  );
  const target = `$${variable}`;
  if (String(heal.target || "") !== target) {
    throw new Error(`tcg_v0_2_attack_selected_heal_target_mismatch:${attackId}`);
  }
  const amount = Number(heal.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`tcg_v0_2_attack_selected_heal_amount_invalid:${attackId}`);
  }

  return {
    attack_id: attackId,
    phase: "after_damage",
    selection: {
      controller: "self",
      zone: "field",
      count: 1,
      filters: { damaged: true },
      as: variable,
    },
    heal: { target, amount },
  };
}
'''
EFFECTS.write_text(effects.rstrip() + "\n\n" + selected_heal_block.strip() + "\n")

CHOICE.write_text(r'''import { healRuntimeDamage, type RuntimeCreature } from "../tcg-tactic-actions/runtime-v0-2-core.ts";
import type { RuntimeV02AttackSelectedHealChoice } from "./tcg-match-attack-effects-v0-2.ts";

export type RuntimeV02FriendlyFieldEntry = {
  where: "vanguard" | "reserve";
  index: number | null;
  creature: RuntimeCreature;
  anchor_uid: string;
  label: string;
};

export type RuntimeV02AttackSelectedHealChoiceOption = {
  id: string;
  label: string;
  anchor_uid: string;
  where: "vanguard" | "reserve";
  index: number | null;
};

export type RuntimeV02PendingAttackChoice = {
  id: string;
  seat: 1 | 2;
  kind: "select_damaged_friendly_creature_heal";
  attack_id: string;
  prompt: string;
  min: 1;
  max: 1;
  amount: number;
  options: RuntimeV02AttackSelectedHealChoiceOption[];
};

export type RuntimeV02AttackSelectedHealResolution = {
  attack_id: string;
  choice_id: string;
  option_id: string;
  target_where: "vanguard" | "reserve";
  target_index: number | null;
  target_anchor_uid: string;
  target_label: string;
  amount: number;
  actual_heal: number;
};

function validateDescriptor(descriptor: RuntimeV02AttackSelectedHealChoice): void {
  if (descriptor.phase !== "after_damage") throw new Error("tcg_v0_2_attack_choice_phase_unsupported");
  if (descriptor.selection.controller !== "self") throw new Error("tcg_v0_2_attack_choice_controller_unsupported");
  if (descriptor.selection.zone !== "field") throw new Error("tcg_v0_2_attack_choice_zone_unsupported");
  if (descriptor.selection.count !== 1) throw new Error("tcg_v0_2_attack_choice_count_unsupported");
  if (descriptor.selection.filters.damaged !== true) throw new Error("tcg_v0_2_attack_choice_damaged_filter_required");
  if (!descriptor.selection.as || descriptor.heal.target !== `$${descriptor.selection.as}`) {
    throw new Error("tcg_v0_2_attack_choice_variable_mismatch");
  }
  if (!Number.isFinite(descriptor.heal.amount) || descriptor.heal.amount <= 0) {
    throw new Error("tcg_v0_2_attack_choice_amount_invalid");
  }
}

function validateEntries(entries: RuntimeV02FriendlyFieldEntry[]): void {
  const anchors = entries.map((entry) => String(entry.anchor_uid || ""));
  if (anchors.some((anchor) => !anchor)) throw new Error("tcg_v0_2_attack_choice_anchor_required");
  if (new Set(anchors).size !== anchors.length) throw new Error("tcg_v0_2_attack_choice_anchor_duplicate");
}

export function runtimeV02CreateSelectedHealChoice(
  seat: 1 | 2,
  descriptor: RuntimeV02AttackSelectedHealChoice,
  entries: RuntimeV02FriendlyFieldEntry[],
  choiceId = crypto.randomUUID(),
): RuntimeV02PendingAttackChoice | null {
  validateDescriptor(descriptor);
  validateEntries(entries);
  if (!choiceId) throw new Error("tcg_v0_2_attack_choice_id_required");

  const legal = entries.filter((entry) => Math.max(0, Number(entry.creature.damage || 0)) > 0);
  if (!legal.length) return null;
  const options = legal.map((entry) => ({
    id: `creature:${seat}:${entry.anchor_uid}`,
    label: entry.label || "Creature",
    anchor_uid: entry.anchor_uid,
    where: entry.where,
    index: entry.index,
  }));
  return {
    id: choiceId,
    seat,
    kind: "select_damaged_friendly_creature_heal",
    attack_id: descriptor.attack_id,
    prompt: "Choose a damaged friendly creature",
    min: 1,
    max: 1,
    amount: descriptor.heal.amount,
    options,
  };
}

export function runtimeV02PendingAttackChoiceView(
  choice: RuntimeV02PendingAttackChoice | null | undefined,
  viewerSeat: 1 | 2,
) {
  if (!choice) return null;
  if (choice.seat !== viewerSeat) {
    return { id: choice.id, seat: choice.seat, kind: choice.kind, waiting: true };
  }
  return {
    id: choice.id,
    seat: choice.seat,
    kind: choice.kind,
    prompt: choice.prompt,
    min: choice.min,
    max: choice.max,
    options: choice.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

export function runtimeV02ResolveSelectedHealChoice(
  choice: RuntimeV02PendingAttackChoice,
  seat: 1 | 2,
  choiceId: string,
  choiceIds: string[],
  entries: RuntimeV02FriendlyFieldEntry[],
): RuntimeV02AttackSelectedHealResolution {
  validateEntries(entries);
  if (choice.kind !== "select_damaged_friendly_creature_heal") {
    throw new Error("tcg_v0_2_attack_choice_kind_unsupported");
  }
  if (choice.seat !== seat) throw new Error("tcg_v0_2_attack_choice_not_yours");
  if (!choiceId || choice.id !== choiceId) throw new Error("tcg_v0_2_attack_choice_stale_id");
  if (!Array.isArray(choiceIds) || choiceIds.length !== 1 || new Set(choiceIds).size !== 1) {
    throw new Error("tcg_v0_2_attack_choice_exactly_one_required");
  }
  const option = choice.options.find((candidate) => candidate.id === choiceIds[0]);
  if (!option) throw new Error("tcg_v0_2_attack_choice_unknown_option");
  const entry = entries.find((candidate) => candidate.anchor_uid === option.anchor_uid);
  if (!entry) throw new Error("tcg_v0_2_attack_choice_target_missing");
  if (entry.where !== option.where || entry.index !== option.index) {
    throw new Error("tcg_v0_2_attack_choice_target_position_changed");
  }
  if (Math.max(0, Number(entry.creature.damage || 0)) <= 0) {
    throw new Error("tcg_v0_2_attack_choice_target_not_damaged");
  }
  const actualHeal = healRuntimeDamage(entry.creature, choice.amount);
  return {
    attack_id: choice.attack_id,
    choice_id: choice.id,
    option_id: option.id,
    target_where: entry.where,
    target_index: entry.index,
    target_anchor_uid: entry.anchor_uid,
    target_label: entry.label || option.label || "Creature",
    amount: choice.amount,
    actual_heal: actualHeal,
  };
}
''')

replace_once(
    MATCH,
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageHealEachEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageSelfHealEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";',
    'import { structuredRuntimeAfterDamageConditionEffects, structuredRuntimeAfterDamageHealEachEffects, structuredRuntimeAfterDamageRecoilEffects, structuredRuntimeAfterDamageSelectedHealChoice, structuredRuntimeAfterDamageSelfHealEffects, structuredRuntimeAfterDamageShieldEffects } from "../_shared/tcg-match-attack-effects-v0-2.ts";\nimport { runtimeV02CreateSelectedHealChoice, runtimeV02PendingAttackChoiceView, runtimeV02ResolveSelectedHealChoice, type RuntimeV02PendingAttackChoice } from "../_shared/tcg-match-attack-choice-v0-2.ts";',
)

all_cr = 'function allCr(p:any){const out:{where:string,index:number|null,cr:Cr}[]=[];if(p.vanguard)out.push({where:"vanguard",index:null,cr:p.vanguard});for(let i=0;i<4;i++)if(p.reserve?.[i])out.push({where:"reserve",index:i,cr:p.reserve[i]});return out}'
replace_once(
    MATCH,
    all_cr,
    all_cr + '\nfunction friendlyFieldEntries(p:any,s:any){return allCr(p).map((x:any)=>{const inst=x.cr?.stack?.length?x.cr.stack[x.cr.stack.length-1]:null;const anchor=String(inst?.uid||"");if(!anchor)throw new Error("tcg_v0_2_attack_choice_anchor_required");return{where:x.where==="reserve"?"reserve":"vanguard",index:x.where==="reserve"?Number(x.index):null,creature:x.cr,anchor_uid:anchor,label:String(top(x.cr,s)?.name||"Creature")}})}',
)

replace_once(
    MATCH,
    'pending_resolution:s.pending_resolutions?.[0]?{kind:s.pending_resolutions[0].kind,seat:s.pending_resolutions[0].seat,count:s.pending_resolutions[0].count||null}:null,private_reward_inspection:',
    'pending_resolution:s.pending_resolutions?.[0]?{kind:s.pending_resolutions[0].kind,seat:s.pending_resolutions[0].seat,count:s.pending_resolutions[0].count||null}:null,pending_attack_choice:runtimeV02PendingAttackChoiceView(s.pending_attack_choice||null,viewerSeat as 1|2),private_reward_inspection:',
)

resolve_handler = r'''
  if(action==="resolve_attack_choice"){
   const pending=s.pending_attack_choice as RuntimeV02PendingAttackChoice|null;if(s.phase!=="attack_effect_resolution"||!pending)return json({ok:false,version:VERSION,error:"no_attack_choice_pending"},400);const ids=Array.isArray(body.choice_ids)?body.choice_ids.map((x:any)=>String(x)):[];let resolved;try{resolved=runtimeV02ResolveSelectedHealChoice(pending,seat as 1|2,String(body.choice_id||""),ids,friendlyFieldEntries(p,s))}catch(error){const message=error instanceof Error?error.message:String(error);const status=message==="tcg_v0_2_attack_choice_not_yours"?403:message==="tcg_v0_2_attack_choice_stale_id"?409:400;return json({ok:false,version:VERSION,error:message},status)}delete s.pending_attack_choice;log(`Seat ${seat} healed ${resolved.actual_heal} damage from ${resolved.target_label} after ${pending.attack_id}.`);const n=scanDefeats();if(n>0){s.phase="resolution";s.resume_after_resolution="aftermath"}else aftermath(seat);return json({version:VERSION,result:await commit("resolve_attack_choice",{seat,attack_id:pending.attack_id,kind:pending.kind,target_where:resolved.target_where,target_index:resolved.target_index,amount:resolved.amount,actual_heal:resolved.actual_heal})})
  }
'''
replace_once(MATCH, '\n  if(action==="take_reward"){', '\n' + resolve_handler + '\n  if(action==="take_reward"){')

replace_once(
    MATCH,
    'const structuredHealEachEffects=structuredRuntimeAfterDamageHealEachEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.reserve);',
    'const structuredHealEachEffects=structuredRuntimeAfterDamageHealEachEffects(s,p.vanguard.stack[p.vanguard.stack.length-1],slot,p.reserve);const structuredSelectedHealChoice=structuredRuntimeAfterDamageSelectedHealChoice(s,p.vanguard.stack[p.vanguard.stack.length-1],slot);',
)

replace_once(
    MATCH,
    'if(ad?.id==="tide-tideroar"&&ef.includes("heal 30 from one friendly creature"))',
    'if(structuredSelectedHealChoice==null&&ad?.id==="tide-tideroar"&&ef.includes("heal 30 from one friendly creature"))',
)

pending_block = r'''   const pendingSelectedHeal=structuredSelectedHealChoice?runtimeV02CreateSelectedHealChoice(seat as 1|2,structuredSelectedHealChoice,friendlyFieldEntries(p,s)):null;const selectedHealAudit=structuredSelectedHealChoice?{...structuredSelectedHealChoice,legal_target_count:pendingSelectedHeal?.options.length||0,pending:!!pendingSelectedHeal}:null;
   if(pendingSelectedHeal){s.pending_attack_choice=pendingSelectedHeal;s.phase="attack_effect_resolution";return json({version:VERSION,result:await commit("attack_pending_choice",{seat,attack_slot:slot,attack_name:atk.name,base_damage:atk.damage,formula_bonus_damage:formulaBonus,bonus_damage:formulaBonus+bonus,structured_count_add:countAddEvaluation,structured_conditional_add:conditionalAddEvaluation,structured_after_damage_conditions:structuredConditionEffects,structured_after_damage_recoil:structuredRecoilEffects,structured_after_damage_shield:structuredShieldEffects,structured_after_damage_self_heal:structuredSelfHealEffects,structured_after_damage_heal_each:structuredHealEachEffects,structured_after_damage_selected_heal:selectedHealAudit,damage_dealt:dmg.dealt,shield_prevented:dmg.blocked,target_seat:targetSeat,target_where:targetWhere,target_index:targetIndex,randoms}),pending_attack_choice:runtimeV02PendingAttackChoiceView(pendingSelectedHeal,seat as 1|2)})}
'''
replace_once(MATCH, '   const wantsSwitch=ef.includes("switch this creature with a reserve creature")||ef.includes("move this creature to reserve after damage");', pending_block + '   const wantsSwitch=ef.includes("switch this creature with a reserve creature")||ef.includes("move this creature to reserve after damage");')

replace_once(
    MATCH,
    'structured_after_damage_heal_each:structuredHealEachEffects,damage_dealt:dmg.dealt',
    'structured_after_damage_heal_each:structuredHealEachEffects,structured_after_damage_selected_heal:selectedHealAudit,damage_dealt:dmg.dealt',
)

DENO_TEST.write_text(r'''import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { structuredRuntimeAfterDamageSelectedHealChoice } from "../_shared/tcg-match-attack-effects-v0-2.ts";
import {
  runtimeV02CreateSelectedHealChoice,
  runtimeV02PendingAttackChoiceView,
  runtimeV02ResolveSelectedHealChoice,
  type RuntimeV02FriendlyFieldEntry,
} from "../_shared/tcg-match-attack-choice-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
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

function creature(damage = 0) {
  return {
    damage,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  } as any;
}

function deepCurrentProgram() {
  return [
    { op: "SELECT_CREATURE", controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    { op: "HEAL", target: "$heal_target", amount: 30 },
  ];
}

function stateWith(afterDamage: unknown[]) {
  const cardId = "test-deep-current-creature";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: cardId,
          name: "Test Tideroar",
          card_family: "Creature",
          creature: {
            attacks: [{
              id: "deep-current",
              name: "Deep Current",
              cost: [{ element: "Tide", amount: 3 }],
              base_damage: 110,
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

function entry(where: "vanguard" | "reserve", index: number | null, anchor: string, label: string, damage: number): RuntimeV02FriendlyFieldEntry {
  return { where, index, anchor_uid: anchor, label, creature: creature(damage) };
}

Deno.test("Deep Current selected heal descriptor is registry-driven and pure", () => {
  const state = stateWith(deepCurrentProgram());
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(state, { card_id: "test-deep-current-creature" }, 1);
  assertEquals(descriptor, {
    attack_id: "deep-current",
    phase: "after_damage",
    selection: { controller: "self", zone: "field", count: 1, filters: { damaged: true }, as: "heal_target" },
    heal: { target: "$heal_target", amount: 30 },
  });
});

Deno.test("pending attack choice exposes only damaged friendly creatures and stays private", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const entries = [
    entry("vanguard", null, "v1", "Tideroar", 40),
    entry("reserve", 0, "r1", "Puddlepip", 0),
    entry("reserve", 2, "r3", "Reefback", 10),
  ];
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  assertEquals(choice.options.map((option) => option.id), ["creature:1:v1", "creature:1:r3"]);
  assertEquals(runtimeV02PendingAttackChoiceView(choice, 2), {
    id: "choice-1",
    seat: 1,
    kind: "select_damaged_friendly_creature_heal",
    waiting: true,
  });
  assertEquals((runtimeV02PendingAttackChoiceView(choice, 1) as any).options.length, 2);
});

Deno.test("no damaged friendly creature means no pending heal choice", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, [entry("vanguard", null, "v1", "Tideroar", 0)], "choice-1");
  assertEquals(choice, null);
});

Deno.test("resolving selected heal is revision-choice bound and reports actual healing", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const entries = [entry("vanguard", null, "v1", "Tideroar", 12), entry("reserve", 0, "r1", "Rillrunner", 50)];
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  const result = runtimeV02ResolveSelectedHealChoice(choice, 1, "choice-1", ["creature:1:v1"], entries);
  assertEquals(result.actual_heal, 12);
  assertEquals(entries[0].creature.damage, 0);
  assertEquals(result.target_where, "vanguard");
  assertEquals(result.target_index, null);
});

Deno.test("selected heal rejects wrong seat, stale choice, unknown option and no-longer-damaged target", () => {
  const descriptor = structuredRuntimeAfterDamageSelectedHealChoice(stateWith(deepCurrentProgram()), { card_id: "test-deep-current-creature" }, 1)!;
  const entries = [entry("vanguard", null, "v1", "Tideroar", 20)];
  const choice = runtimeV02CreateSelectedHealChoice(1, descriptor, entries, "choice-1")!;
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 2, "choice-1", ["creature:1:v1"], entries), "not_yours");
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 1, "old-choice", ["creature:1:v1"], entries), "stale_id");
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 1, "choice-1", ["creature:1:missing"], entries), "unknown_option");
  entries[0].creature.damage = 0;
  assertThrows(() => runtimeV02ResolveSelectedHealChoice(choice, 1, "choice-1", ["creature:1:v1"], entries), "target_not_damaged");
});

Deno.test("malformed selected-heal metadata fails closed while mixed programs remain outside this owner", () => {
  const wrongController = deepCurrentProgram() as any[];
  wrongController[0].controller = "opponent";
  assertThrows(() => structuredRuntimeAfterDamageSelectedHealChoice(stateWith(wrongController), { card_id: "test-deep-current-creature" }, 1), "controller_unsupported");

  const wrongFilter = deepCurrentProgram() as any[];
  wrongFilter[0].filters.damaged = false;
  assertThrows(() => structuredRuntimeAfterDamageSelectedHealChoice(stateWith(wrongFilter), { card_id: "test-deep-current-creature" }, 1), "damaged_filter_required");

  const wrongTarget = deepCurrentProgram() as any[];
  wrongTarget[1].target = "$other";
  assertThrows(() => structuredRuntimeAfterDamageSelectedHealChoice(stateWith(wrongTarget), { card_id: "test-deep-current-creature" }, 1), "target_mismatch");

  const mixed = [...deepCurrentProgram(), { op: "ADD_SHIELD", target: "$source_creature", amount: 10 }];
  assertEquals(structuredRuntimeAfterDamageSelectedHealChoice(stateWith(mixed), { card_id: "test-deep-current-creature" }, 1), null);
});

Deno.test("legacy-only match state remains on compatibility authority", () => {
  const state = stateWith(deepCurrentProgram());
  delete state.runtime_registry_v0_2;
  assertEquals(structuredRuntimeAfterDamageSelectedHealChoice(state, { card_id: "test-deep-current-creature" }, 1), null);
});
''')

NODE_TEST.write_text(r'''import test from 'node:test';
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
  assert.ok(choiceSource.includes('const actualHeal = healRuntimeDamage(entry.creature, choice.amount)'));
});

test('match view and resolve command expose one reconnect-safe attack-choice path', () => {
  assert.ok(matchSource.includes('pending_attack_choice:runtimeV02PendingAttackChoiceView(s.pending_attack_choice||null,viewerSeat as 1|2)'));
  assertInOrder([
    'if(action==="concede")',
    'if(action==="resolve_attack_choice")',
    'if(action==="take_reward")',
    'if(s.phase!=="play"||Number(s.active_seat)!==seat)',
  ], 'attack choice must resolve before ordinary play-phase gating');
  assert.ok(matchSource.includes('s.phase!=="attack_effect_resolution"'));
  assert.ok(matchSource.includes('runtimeV02ResolveSelectedHealChoice(pending,seat as 1|2,String(body.choice_id||""),ids,friendlyFieldEntries(p,s))'));
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
''')

# Normalize every generated text file to exactly one EOF newline.
for path in [EFFECTS, CHOICE, MATCH, DENO_TEST, NODE_TEST]:
    path.write_text(path.read_text().rstrip() + "\n")

print("bounded Deep Current selected-heal choice patch applied")
