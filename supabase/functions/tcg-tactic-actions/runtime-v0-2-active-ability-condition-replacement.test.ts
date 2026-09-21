import {
  runtimeV02ExecuteActiveAbilityConditionReplacement,
  structuredRuntimeActiveAbilityConditionReplacement,
} from "../_shared/tcg-match-active-ability-condition-replacement-v0-2.ts";
import { runtimeV02CurrentTurnActiveAbilityUseCount } from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeConditions } from "../_shared/tcg-match-condition-engine-v0-2.ts";
import {
  runtimeV02ConditionProtectionCount,
  runtimeV02InstallConditionProtection,
} from "../_shared/tcg-match-condition-protection-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertThrows(fn: () => unknown, expected: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) {
      throw new Error(`expected ${expected}, got ${message}`);
    }
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

type Inst = { uid: string; card_id: string };

const SOURCE_ID = "condition-replacement-source";
const SOURCE_UID = "condition-replacement-source:uid";
const TARGET_ID = "condition-replacement-target";
const TARGET_UID = "condition-replacement-target:uid";

function hollowCommand(overrides: Record<string, unknown> = {}) {
  return {
    id: "hollow-command-proof",
    name: "Hollow Command Proof",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [{
        predicate: "control_condition_present",
        target: "$current_opponent_vanguard",
        exclude_condition: "Mindbound",
      }],
    },
    costs: [],
    steps: [{
      op: "REPLACE_CONTROL_CONDITION",
      target: "$current_opponent_vanguard",
      condition: "Mindbound",
      allow_if_empty: false,
      replace_existing: true,
    }],
    ...overrides,
  };
}

function definition(
  cardId: string,
  hp: number,
  ability: Record<string, unknown> | null = null,
) {
  return {
    card_id: cardId,
    definition: { id: cardId },
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id: cardId,
      name: cardId,
      card_family: "Creature",
      element: cardId === SOURCE_ID ? "Shade" : "Stone",
      creature: {
        stage: "Adult",
        hp,
        reward_value: 1,
        ability,
        attacks: [],
      },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function creature(
  uid: string,
  cardId: string,
  control: string | null,
) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    conditions: {
      scorched: false,
      venomed: 0,
      control,
      modifier: null,
    },
    condition: null,
    flags: {},
  };
}

function state(
  control: string | null = "Dazed",
  ability: Record<string, unknown> = hollowCommand(),
) {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 12,
    active_seat: 1 as const,
    effect_events: [] as Record<string, unknown>[],
    pending_resolutions: [] as Record<string, unknown>[],
    players: {
      "1": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(SOURCE_UID, SOURCE_ID, null),
        reserve: [null, null, null, null],
      },
      "2": {
        deck: [] as Inst[],
        hand: [] as Inst[],
        discard: [] as Inst[],
        rewards: [] as Inst[],
        vanguard: creature(TARGET_UID, TARGET_ID, control),
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      [SOURCE_ID]: definition(SOURCE_ID, 270, ability),
      [TARGET_ID]: definition(TARGET_ID, 100),
    },
  };
}

function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: { uid: SOURCE_UID, card_id: SOURCE_ID },
  };
}

function defeatDescribe(cr: { stack: Inst[] }) {
  const cardId = cr.stack[cr.stack.length - 1].card_id;
  return {
    max_hp: cardId === SOURCE_ID ? 270 : 100,
    reward_value: 1,
    label: cardId,
  };
}

Deno.test("generic active condition replacement delegates activation and Condition ownership without card identity dispatch", () => {
  const s = state("Dazed");
  const descriptor = structuredRuntimeActiveAbilityConditionReplacement(
    s,
    source().instance,
  );
  if (!descriptor) throw new Error("condition replacement descriptor required");
  assertEquals(descriptor.ability_id, "hollow-command-proof");
  assertEquals(descriptor.requirement.predicate, "control_condition_present");
  assertEquals(descriptor.requirement.exclude_condition, "Mindbound");
  assertEquals(descriptor.step.op, "REPLACE_CONTROL_CONDITION");

  const result = runtimeV02ExecuteActiveAbilityConditionReplacement(
    s,
    1,
    source(),
    defeatDescribe,
  );
  if (!result) throw new Error("condition replacement result required");
  assertEquals(result.kind, "replace_opponent_vanguard_control_condition");
  assertEquals(result.previous_condition, "Dazed");
  assertEquals(result.requested_condition, "Mindbound");
  assertEquals(result.resulting_condition, "Mindbound");
  assertEquals(result.applied, true);
  assertEquals(result.prevented, false);
  assertEquals(result.activation_permit.cost_permit.additional_cost_count, 0);
  assertEquals(
    runtimeConditions(s.players["2"].vanguard).control,
    "Mindbound",
  );
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "hollow-command-proof"),
    1,
  );
});

Deno.test("missing opponent control condition fails before the once-per-turn receipt", () => {
  const s = state(null);
  assertThrows(
    () => runtimeV02ExecuteActiveAbilityConditionReplacement(
      s,
      1,
      source(),
      defeatDescribe,
    ),
    "requirements_not_met:control_condition_missing",
  );
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "hollow-command-proof"),
    0,
  );
  assertEquals(runtimeConditions(s.players["2"].vanguard).control, null);
});

Deno.test("excluded replacement condition fails before the once-per-turn receipt", () => {
  const s = state("Mindbound");
  assertThrows(
    () => runtimeV02ExecuteActiveAbilityConditionReplacement(
      s,
      1,
      source(),
      defeatDescribe,
    ),
    "requirements_not_met:excluded_condition",
  );
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "hollow-command-proof"),
    0,
  );
  assertEquals(
    runtimeConditions(s.players["2"].vanguard).control,
    "Mindbound",
  );
});

Deno.test("shared active Ability turn limit blocks a second otherwise-legal replacement", () => {
  const s = state("Dazed");
  const first = runtimeV02ExecuteActiveAbilityConditionReplacement(
    s,
    1,
    source(),
    defeatDescribe,
  );
  if (!first) throw new Error("first condition replacement required");
  runtimeConditions(s.players["2"].vanguard).control = "Blinded";
  assertThrows(
    () => runtimeV02ExecuteActiveAbilityConditionReplacement(
      s,
      1,
      source(),
      defeatDescribe,
    ),
    "tcg_v0_2_active_ability_activation_cost_turn_limit_reached",
  );
  assertEquals(runtimeConditions(s.players["2"].vanguard).control, "Blinded");
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "hollow-command-proof"),
    1,
  );
});

Deno.test("Condition protection prevents Mindbound while the legal Ability use remains spent", () => {
  const s = state("Dazed");
  runtimeV02InstallConditionProtection(s.players["2"].vanguard, {
    protection_id: "mindbound-proof",
    source_action_id: "condition-guard",
    source_uid: "condition-guard:uid",
    source_card_id: "condition-guard-card",
    source_controller_seat: 2,
    target_controller_seat: 2,
    installed_turn_seq: 12,
    condition_names: ["Mindbound"],
    condition_slot: null,
    source_controller: "opponent",
    card_effect_only: true,
    max_uses: 1,
    expires_on: "start_of_controller_next_turn",
  });

  const result = runtimeV02ExecuteActiveAbilityConditionReplacement(
    s,
    1,
    source(),
    defeatDescribe,
  );
  if (!result) throw new Error("protected condition replacement result required");
  assertEquals(result.applied, false);
  assertEquals(result.prevented, true);
  assertEquals(result.reason, "condition_protection");
  assertEquals(result.protection_id, "mindbound-proof");
  assertEquals(result.previous_condition, "Dazed");
  assertEquals(result.resulting_condition, "Dazed");
  assertEquals(runtimeConditions(s.players["2"].vanguard).control, "Dazed");
  assertEquals(runtimeV02ConditionProtectionCount(s.players["2"].vanguard), 0);
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "hollow-command-proof"),
    1,
  );
});

Deno.test("recognized replacement family fails closed on operation mode drift", () => {
  const malformed = hollowCommand({
    steps: [{
      op: "REPLACE_CONTROL_CONDITION",
      target: "$current_opponent_vanguard",
      condition: "Mindbound",
      allow_if_empty: true,
      replace_existing: true,
    }],
  });
  const s = state("Dazed", malformed);
  assertThrows(
    () => structuredRuntimeActiveAbilityConditionReplacement(s, source().instance),
    "step_mode_unsupported",
  );
});
