import {
  runtimeV02InitialAttackAfterDamageFinishedResume,
  runtimeV02InstallAttackAfterDamageFinishedContinuation,
  runtimeV02ResolveAttackAfterDamageFinishedChoice,
  runtimeV02ResumeAttackAfterDamageFinishedProgram,
  structuredRuntimeAttackAfterDamageFinishedProgram,
} from "../_shared/tcg-match-attack-after-damage-finished-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function inst(uid: string, card_id: string) { return { uid, card_id }; }
function cr(uid: string, card_id: string, damage = 0, essence: any[] = []) {
  return { stack: [inst(uid, card_id)], essence, relic: null, damage, shield: 0, flags: {} };
}
function creatureDef(id: string, element: string, attacks: unknown[] = []) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id, name: id, card_family: "Creature", element,
      creature: { stage: "Standalone", hp: 200, withdrawal: 2, ability: null, attacks },
      essence: null, tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function essenceDef(id: string) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id, name: id, card_family: "Essence", element: "Tide",
      creature: null, tactic: null,
      essence: { subtype: "Basic", provides: [{ element: "Tide", amount: 1 }], continuous: [], listeners: [] },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function programAttack() {
  return {
    id: "test-vault",
    name: "Test Vault",
    cost: [{ element: "Tide", amount: 1 }],
    damage_element: "source_creature",
    base_damage: 10,
    requirements: [], on_declare: [], before_damage: [],
    after_damage_finished: [
      {
        op: "MOVE_ATTACHED_ESSENCE", controller: "self", element: "Tide",
        count: { min: 0, max: 3 },
        source_selector: { zone: "field", filters: { card_family: "Creature", element: "Tide" } },
        destination_selector: { zone: "field", filters: { card_family: "Creature", element: "Tide" } },
        require_destination_different_creature: true, as: "moves",
      },
      {
        op: "SELECT_CREATURE", controller: "self", zone: "field",
        count: { min: 0, max: 2 },
        filters: { element: "Tide", damaged: true, participated_in_moves: "$moves" },
        as: "heals",
      },
      { op: "HEAL_EACH", targets: "$heals", amount: 30 },
      {
        op: "OPTIONAL", player: "self", steps: [
          { op: "SELECT_CREATURE", controller: "self", zone: "reserve", count: 1, filters: {}, as: "switch" },
          { op: "SWITCH_WITH_VANGUARD", player: "self", target: "$switch" },
        ],
      },
    ],
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 9,
    active_seat: 1,
    effect_events: [],
    players: {
      "1": {
        vanguard: cr("src", "test-source", 10, [inst("e1", "tide-e1")]),
        reserve: [
          cr("r1", "test-r1", 40, [inst("e2", "tide-e2")]),
          cr("r2", "test-r2", 20, []),
          cr("r3", "test-r3", 0, []),
          null,
        ],
      },
      "2": { vanguard: cr("opp", "test-opp"), reserve: [null, null, null, null] },
    },
    card_index: {
      "test-source": creatureDef("test-source", "Tide", [programAttack()]),
      "test-r1": creatureDef("test-r1", "Tide"),
      "test-r2": creatureDef("test-r2", "Tide"),
      "test-r3": creatureDef("test-r3", "Tide"),
      "test-opp": creatureDef("test-opp", "Stone"),
      "tide-e1": essenceDef("tide-e1"),
      "tide-e2": essenceDef("tide-e2"),
    },
  } as Record<string, any>;
}

Deno.test("after-damage-finished mixed program is recognized by operation grammar, not card id", () => {
  const s = state();
  const descriptor = structuredRuntimeAttackAfterDamageFinishedProgram(s, { card_id: "test-source" }, 1);
  equal(descriptor, {
    attack_id: "test-vault",
    phase: "after_damage_finished",
    move: { element: "Tide", min: 0, max: 3, as: "moves" },
    heal_each: {
      element: "Tide", damaged: true, participated_in_moves: "$moves",
      min: 0, max: 2, as: "heals", amount: 30,
    },
    optional_switch: { min: 0, max: 1 },
  });
});

Deno.test("movement choice preflights then records canonical Essence movement receipts", () => {
  const s = state();
  const descriptor = structuredRuntimeAttackAfterDamageFinishedProgram(s, { card_id: "test-source" }, 1)!;
  runtimeV02InstallAttackAfterDamageFinishedContinuation(
    s,
    runtimeV02InitialAttackAfterDamageFinishedResume(s, 1, descriptor, inst("src", "test-source")),
  );
  const start = runtimeV02ResumeAttackAfterDamageFinishedProgram(s, "moves-choice");
  equal(start.pending_choice.stage, "moves");
  const moveId = "move:e1:src:r1";
  const resolved = runtimeV02ResolveAttackAfterDamageFinishedChoice(
    start.pending_choice, 1, "moves-choice", [moveId], s,
  );
  if (resolved.stage !== "moves_resolved") throw new Error("moves stage required");
  equal(resolved.movement_count, 1);
  equal(resolved.movement_receipts[0].source_action_id, "test-vault");
  equal((s.players as any)["1"].vanguard.essence.length, 0);
  equal((s.players as any)["1"].reserve[0].essence.map((x:any)=>x.uid).sort(), ["e1","e2"]);
});

Deno.test("post-movement resume offers only damaged participating Tide Creatures", () => {
  const s = state();
  const descriptor = structuredRuntimeAttackAfterDamageFinishedProgram(s, { card_id: "test-source" }, 1)!;
  runtimeV02InstallAttackAfterDamageFinishedContinuation(
    s,
    runtimeV02InitialAttackAfterDamageFinishedResume(s, 1, descriptor, inst("src", "test-source")),
  );
  const start = runtimeV02ResumeAttackAfterDamageFinishedProgram(s, "moves-choice");
  const moves = runtimeV02ResolveAttackAfterDamageFinishedChoice(
    start.pending_choice, 1, "moves-choice", ["move:e1:src:r1"], s,
  );
  if (moves.stage !== "moves_resolved") throw new Error("moves stage required");
  runtimeV02InstallAttackAfterDamageFinishedContinuation(s, moves.resume);
  const next = runtimeV02ResumeAttackAfterDamageFinishedProgram(s, "heal-choice");
  equal(next.pending_choice.stage, "heal_each");
  equal(next.pending_choice.options.map((x:any)=>x.id), ["heal:r1","heal:src"]);
  equal(next.pending_choice.min, 0);
  equal(next.pending_choice.max, 2);
});

Deno.test("HEAL_EACH preflights all targets and emits one canonical packet per selected Creature", () => {
  const s = state();
  const descriptor = structuredRuntimeAttackAfterDamageFinishedProgram(s, { card_id: "test-source" }, 1)!;
  const resume = runtimeV02InitialAttackAfterDamageFinishedResume(s, 1, descriptor, inst("src", "test-source"));
  resume.stage = "after_moves";
  resume.movement_receipts = [
    { turn_seq: 9, controller_seat: 1, source_creature_uid: "src", destination_creature_uid: "r1", essence_uid: "e1", element: "Tide", source_action_id: "test-vault" },
  ];
  runtimeV02InstallAttackAfterDamageFinishedContinuation(s, resume);
  const next = runtimeV02ResumeAttackAfterDamageFinishedProgram(s, "heal-choice");
  const healed = runtimeV02ResolveAttackAfterDamageFinishedChoice(
    next.pending_choice, 1, "heal-choice", ["heal:src","heal:r1"], s,
  );
  if (healed.stage !== "heal_each_resolved") throw new Error("heal stage required");
  equal(healed.actual_heal_total, 40);
  equal(healed.actual_heals, [
    { target_uid: "src", requested_heal: 30, actual_heal: 10 },
    { target_uid: "r1", requested_heal: 30, actual_heal: 30 },
  ]);
  equal(healed.emitted_packet_ids, ["heal:9:1","heal:9:2"]);

  const s2 = state();
  const resume2 = runtimeV02InitialAttackAfterDamageFinishedResume(s2, 1, descriptor, inst("src", "test-source"));
  resume2.stage = "after_moves";
  resume2.movement_receipts = structuredClone(resume.movement_receipts);
  runtimeV02InstallAttackAfterDamageFinishedContinuation(s2, resume2);
  const stale = runtimeV02ResumeAttackAfterDamageFinishedProgram(s2, "stale-heal");
  (s2.players as any)["1"].reserve[0].damage = 0;
  const before = (s2.players as any)["1"].vanguard.damage;
  throws(
    () => runtimeV02ResolveAttackAfterDamageFinishedChoice(
      stale.pending_choice, 1, "stale-heal", ["heal:src","heal:r1"], s2,
    ),
    "heal_target_changed",
  );
  equal((s2.players as any)["1"].vanguard.damage, before);
  equal((s2.effect_events as any[]).length, 0);
});

Deno.test("post-heal resume offers optional Reserve switch and delegates mutation to Atomic Switch", () => {
  const s = state();
  const descriptor = structuredRuntimeAttackAfterDamageFinishedProgram(s, { card_id: "test-source" }, 1)!;
  const resume = runtimeV02InitialAttackAfterDamageFinishedResume(s, 1, descriptor, inst("src", "test-source"));
  resume.stage = "after_heal";
  runtimeV02InstallAttackAfterDamageFinishedContinuation(s, resume);
  const next = runtimeV02ResumeAttackAfterDamageFinishedProgram(s, "switch-choice");
  equal(next.pending_choice.stage, "optional_switch");
  equal(next.pending_choice.min, 0);
  equal(next.pending_choice.max, 1);

  const skipped = runtimeV02ResolveAttackAfterDamageFinishedChoice(
    next.pending_choice, 1, "switch-choice", [], s,
  );
  if (skipped.stage !== "optional_switch_resolved") throw new Error("switch stage required");
  equal(skipped.selected_count, 0);
  equal(skipped.switch_result, null);

  runtimeV02InstallAttackAfterDamageFinishedContinuation(s, resume);
  const again = runtimeV02ResumeAttackAfterDamageFinishedProgram(s, "switch-choice-2");
  const switched = runtimeV02ResolveAttackAfterDamageFinishedChoice(
    again.pending_choice, 1, "switch-choice-2", ["switch:0:r1"], s,
  );
  if (switched.stage !== "optional_switch_resolved") throw new Error("switch stage required");
  equal(switched.selected_count, 1);
  equal((s.players as any)["1"].vanguard.stack[0].uid, "r1");
  equal((s.players as any)["1"].reserve[0].stack[0].uid, "src");
  if (!switched.switch_result || switched.switch_result.events.length < 1) {
    throw new Error("Atomic Switch movement events required");
  }
});
