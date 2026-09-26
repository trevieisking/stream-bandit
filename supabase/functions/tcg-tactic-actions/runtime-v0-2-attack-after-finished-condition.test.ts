import {
  runtimeV02InstallAttackAfterFinishedConditionContinuation,
  runtimeV02ResolveAttackAfterFinishedConditionContinuation,
  structuredRuntimeAfterAttackFinishedConditionEffects,
} from "../_shared/tcg-match-attack-after-finished-condition-v0-2.ts";
import {
  runtimeV02ConditionProtectionCount,
  runtimeV02InstallConditionProtection,
} from "../_shared/tcg-match-condition-protection-v0-2.ts";
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
function cr(uid: string, card_id: string) {
  return {
    stack: [inst(uid, card_id)],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}
function sourceDefinition(after: unknown[] = [{
  op: "APPLY_CONDITION",
  target: "$current_opponent_vanguard",
  condition: "Blinded",
  mode: "apply_if_empty",
}]) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id: "test-after-finished-source",
    name: "Test After Finished Source",
    card_family: "Creature",
    element: "Gale",
    creature: {
      stage: "Adult",
      hp: 200,
      attacks: [{
        id: "eye-shaped-attack",
        name: "Eye Shaped Attack",
        cost: [],
        base_damage: 80,
        damage_formula: null,
        requirements: [],
        on_declare: [],
        before_damage: [],
        after_damage: [{
          op: "OPTIONAL",
          player: "self",
          steps: [],
        }],
        after_attack_finished: after,
      }],
    },
  };
}
function state(after?: unknown[]) {
  const sourceId = "test-after-finished-source";
  const oldTargetId = "old-target";
  const newTargetId = "new-target";
  const source = cr("source-uid", sourceId);
  const oldTarget = cr("old-target-uid", oldTargetId);
  const replacement = cr("new-target-uid", newTargetId);
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 11,
    active_seat: 1,
    players: {
      "1": { vanguard: source, reserve: [null, null, null, null] },
      "2": { vanguard: oldTarget, reserve: [replacement, null, null, null] },
    },
    card_index: {
      [sourceId]: { card_id: sourceId, definition_v0_2: sourceDefinition(after) },
      [oldTargetId]: { card_id: oldTargetId, definition_v0_2: {
        schema:"sb-tcg-card-v0.2",effect_schema:"sb-tcg-effects-v0.2",id:oldTargetId,name:"Old Target",card_family:"Creature",element:"Stone",creature:{stage:"Standalone",hp:100,attacks:[]}
      }},
      [newTargetId]: { card_id: newTargetId, definition_v0_2: {
        schema:"sb-tcg-card-v0.2",effect_schema:"sb-tcg-effects-v0.2",id:newTargetId,name:"New Target",card_family:"Creature",element:"Stone",creature:{stage:"Standalone",hp:100,attacks:[]}
      }},
    },
  } as Record<string, any>;
}

Deno.test("pure after_attack_finished condition program is parsed without claiming after_damage_finished families", () => {
  const s = state();
  equal(structuredRuntimeAfterAttackFinishedConditionEffects(s, inst("source-uid","test-after-finished-source"), 1), {
    attack_id:"eye-shaped-attack",
    attack_slot:1,
    phase:"after_attack_finished",
    effect:{
      target:"$current_opponent_vanguard",
      condition:"Blinded",
      mode:"apply_if_empty",
    },
  });
  const mixed = state([{ op:"DRAW", player:"self", count:1 }]);
  equal(structuredRuntimeAfterAttackFinishedConditionEffects(mixed, inst("source-uid","test-after-finished-source"), 1), null);
});

Deno.test("continuation resolves against current opponent Vanguard after source switch", () => {
  const s = state();
  runtimeV02InstallAttackAfterFinishedConditionContinuation(
    s,
    inst("source-uid","test-after-finished-source"),
    1,
    1,
    "attack:11:1:eye-shaped-attack:source-uid",
  );
  const own = s.players["1"];
  own.reserve[0] = own.vanguard;
  own.vanguard = cr("replacement-own-uid","new-target");
  const opponent = s.players["2"];
  const old = opponent.vanguard;
  opponent.vanguard = opponent.reserve[0];
  opponent.reserve[0] = old;
  const result = runtimeV02ResolveAttackAfterFinishedConditionContinuation(s);
  equal(result?.applied, true);
  equal(result?.target_controller_seat, 2);
  equal(opponent.vanguard.conditions.control, "Blinded");
  equal(old.conditions.control, null);
  equal(s.pending_attack_after_finished_condition, undefined);
});

Deno.test("after-finished condition honors matching opponent-card protection", () => {
  const s = state();
  const target = s.players["2"].vanguard;
  runtimeV02InstallConditionProtection(target, {
    protection_id:"after-finished-protection",
    source_action_id:"protection-source",
    source_uid:"protection-uid",
    source_card_id:"protection-card",
    source_controller_seat:2,
    target_controller_seat:2,
    installed_turn_seq:11,
    condition_names:[],
    condition_slot:"control",
    source_controller:"opponent",
    card_effect_only:true,
    max_uses:1,
    expires_on:"start_of_controller_next_turn",
  });
  runtimeV02InstallAttackAfterFinishedConditionContinuation(
    s,
    inst("source-uid","test-after-finished-source"),
    1,
    1,
    "attack:11:1:eye-shaped-attack:source-uid",
  );
  const result = runtimeV02ResolveAttackAfterFinishedConditionContinuation(s);
  equal(result?.applied, false);
  equal(result?.prevented, true);
  equal(result?.reason, "condition_protection");
  equal(target.conditions.control, null);
  equal(runtimeV02ConditionProtectionCount(target), 0);
});

Deno.test("continuation fails closed on stale turn, source or occupied receipt", () => {
  let s = state();
  runtimeV02InstallAttackAfterFinishedConditionContinuation(
    s, inst("source-uid","test-after-finished-source"), 1, 1, "attack-a",
  );
  throws(() => runtimeV02InstallAttackAfterFinishedConditionContinuation(
    s, inst("source-uid","test-after-finished-source"), 1, 1, "attack-b",
  ), "continuation_collision");

  s = state();
  runtimeV02InstallAttackAfterFinishedConditionContinuation(
    s, inst("source-uid","test-after-finished-source"), 1, 1, "attack-a",
  );
  s.turn_seq = 12;
  throws(() => runtimeV02ResolveAttackAfterFinishedConditionContinuation(s), "turn_changed");

  s = state();
  runtimeV02InstallAttackAfterFinishedConditionContinuation(
    s, inst("source-uid","test-after-finished-source"), 1, 1, "attack-a",
  );
  s.players["1"].vanguard = cr("changed-source","test-after-finished-source");
  throws(() => runtimeV02ResolveAttackAfterFinishedConditionContinuation(s), "source_changed");
});
