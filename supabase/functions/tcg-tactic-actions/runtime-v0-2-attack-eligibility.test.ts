import {
  runtimeV02AttackEligibilityBlockReason,
  runtimeV02InstallAttackEligibilityRule,
  runtimeV02NormalizeAttackEligibilityRule,
} from "../_shared/tcg-match-attack-eligibility-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function throws(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

function creature(...uids: string[]) {
  return {
    stack: uids.map((uid) => ({ uid, card_id: `card-${uid}` })),
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    conditions: {},
    flags: {},
  };
}

function state() {
  return {
    turn_seq: 12,
    turn_flags: {},
  } as Record<string, unknown>;
}

const exactRule = {
  op: "SET_ATTACK_ELIGIBILITY",
  scope: "controller_turn",
  rule: "only_final_vanguard_may_attack",
};

Deno.test("Attack Eligibility owner accepts only the frozen controller-turn final-Vanguard grammar", () => {
  equal(runtimeV02NormalizeAttackEligibilityRule(exactRule), exactRule);
  throws(
    () => runtimeV02NormalizeAttackEligibilityRule({ ...exactRule, scope: "match" }),
    "tcg_v0_2_attack_eligibility_scope_invalid",
  );
  throws(
    () => runtimeV02NormalizeAttackEligibilityRule({ ...exactRule, rule: "any_vanguard" }),
    "tcg_v0_2_attack_eligibility_rule_invalid",
  );
  throws(
    () => runtimeV02NormalizeAttackEligibilityRule({ ...exactRule, expires: "end_of_turn" }),
    "tcg_v0_2_attack_eligibility_field_unsupported:expires",
  );
});

Deno.test("Attack Eligibility owner stores the exact final Vanguard anchor after the switching program", () => {
  const s = state();
  const finalVanguard = creature("final-vanguard");
  const receipt = runtimeV02InstallAttackEligibilityRule(s, 1, finalVanguard, exactRule);
  equal(receipt, {
    turn_seq: 12,
    mode: "final_vanguard_only",
    anchor_uid: "final-vanguard",
    expires: "end_of_turn",
  });
  equal(runtimeV02AttackEligibilityBlockReason(s, 1, finalVanguard), null);

  const laterSwitch = creature("later-vanguard");
  equal(
    runtimeV02AttackEligibilityBlockReason(s, 1, laterSwitch),
    "only_final_vanguard_may_attack_this_turn",
  );
});

Deno.test("evolving the final Vanguard preserves eligibility because the anchored Creature remains in its stack", () => {
  const s = state();
  const finalVanguard = creature("final-vanguard");
  runtimeV02InstallAttackEligibilityRule(s, 1, finalVanguard, exactRule);
  const evolvedSameCreature = creature("final-vanguard", "evolution-card");
  equal(runtimeV02AttackEligibilityBlockReason(s, 1, evolvedSameCreature), null);
});

Deno.test("Attack Eligibility receipt is controller-scoped and expires automatically on the next turn", () => {
  const s = state();
  const seatOne = creature("seat-one-final");
  const seatTwo = creature("seat-two");
  runtimeV02InstallAttackEligibilityRule(s, 1, seatOne, exactRule);

  equal(runtimeV02AttackEligibilityBlockReason(s, 2, seatTwo), null);
  equal(runtimeV02AttackEligibilityBlockReason(s, 1, seatOne), null);

  s.turn_seq = 13;
  equal(
    runtimeV02AttackEligibilityBlockReason(s, 1, creature("different-next-turn")),
    null,
  );
});

Deno.test("Attack Eligibility state fails closed when current-turn receipt semantics are malformed", () => {
  const s = state();
  const vanguard = creature("final-vanguard");
  runtimeV02InstallAttackEligibilityRule(s, 1, vanguard, exactRule);
  const flags = (s.turn_flags as any)["1"].lifecycle_attack_eligibility;
  flags.mode = "unknown";
  throws(
    () => runtimeV02AttackEligibilityBlockReason(s, 1, vanguard),
    "tcg_v0_2_attack_eligibility_receipt_mode_invalid",
  );
});
