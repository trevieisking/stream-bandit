import {
  runtimeV02BeginAttackDeclarationCost,
  runtimeV02ResumeAttackDeclarationCost,
} from "../_shared/tcg-match-attack-declaration-cost-v0-2.ts";
import {
  runtimeV02InstallAttackDamageModifier,
  type RuntimeV02AttackModifierCreature,
} from "../_shared/tcg-match-attack-modifier-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function card(uid: string, card_id: string) {
  return { uid, card_id };
}

function stateWithAttack(costs: unknown[]) {
  const source = card("creature-1", "underworld-source");
  const creature: RuntimeV02AttackModifierCreature & Record<string, unknown> = {
    stack: [source], essence: [], relic: null, damage: 0, shield: 0, flags: {},
  };
  const state = {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    active_seat: 1,
    card_index: {
      "underworld-source": {
        card_id: "underworld-source",
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2",
          effect_schema: "sb-tcg-effects-v0.2",
          id: "underworld-source",
          name: "Underworld Source",
          card_family: "Creature",
          creature: {
            ability: { id: "ability-1", costs: [] },
            attacks: [{
              id: "attack-1",
              cost: [{ element: "Underworld", amount: 3 }],
              costs,
            }],
          },
        },
      },
    },
    players: {
      "1": {
        vanguard: creature,
        reserve: [null, null, null, null],
        hand: [card("hand-1", "discard-me")],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
  } as Record<string, unknown>;
  return { state, source, creature };
}

function installNextAttack(state: Record<string, unknown>, creature: RuntimeV02AttackModifierCreature) {
  runtimeV02InstallAttackDamageModifier(state, creature, {
    source_uid: "buff-source",
    source_action_id: "buff-action",
    target_uid: "creature-1",
    amount: 30,
    turn_seq: 7,
    duration: {
      expires_on: ["end_of_turn"],
      max_uses: 1,
      consume_on: "legal_attack_declared",
    },
  });
}

function remainingModifiers(creature: RuntimeV02AttackModifierCreature): number {
  const records = creature.flags?.runtime_v0_2_attack_modifiers;
  return Array.isArray(records) ? records.length : 0;
}

function request(source: { uid: string; card_id: string }, creature: RuntimeV02AttackModifierCreature) {
  return {
    cost_gate: {
      controller_seat: 1 as const,
      action_kind: "attack" as const,
      action_id: "attack-1",
      source: {
        location: { where: "vanguard" as const, index: null },
        instance: source,
      },
      defeat_describe: () => ({ max_hp: 300, reward_value: 1, label: "Source" }),
    },
    modifier_creature: creature,
    consuming_action_id: "attack-command-1",
    target_uid: "creature-1",
    turn_seq: 7,
    base_damage: 100,
  };
}

Deno.test("Attack declaration consumes modifiers only after optional additional cost is fully paid", () => {
  const { state, source, creature } = stateWithAttack([{
    kind: "optional",
    as: "$paid_toll",
    costs: [{ kind: "hand_discard", player: "self", count: 1 }],
  }]);
  installNextAttack(state, creature);
  assert(remainingModifiers(creature) === 1, "modifier setup missing");

  const first = runtimeV02BeginAttackDeclarationCost(state as never, request(source, creature), "choice-1");
  assert(first.status === "player_choice_required", "optional cost did not pause");
  assert(remainingModifiers(creature) === 1, "modifier consumed before optional decision");

  const second = runtimeV02ResumeAttackDeclarationCost(
    state as never,
    request(source, creature),
    first.pending_choice,
    first.pending_choice.id,
    ["pay"],
    "choice-2",
  );
  assert(second.status === "player_choice_required", "hand selection did not pause");
  assert(remainingModifiers(creature) === 1, "modifier consumed before private hand selection");

  const third = runtimeV02ResumeAttackDeclarationCost(
    state as never,
    request(source, creature),
    second.pending_choice,
    second.pending_choice.id,
    ["hand:hand-1"],
    "choice-3",
  );
  assert(third.status === "declaration_permitted", "paid attack was not declaration permitted");
  assert(third.permit.cost_permit.variables["$paid_toll"] === true, "optional-cost variable lost");
  assert(third.permit.modifier_consumption?.bonus_damage === 30, "attack modifier was not applied");
  assert(remainingModifiers(creature) === 0, "finite attack modifier was not consumed exactly once");
  const player = (state.players as Record<string, any>)["1"];
  assert(player.hand.length === 0 && player.discard.length === 1, "additional cost was not paid");
});

Deno.test("failed additional-cost payment leaves legal-declaration modifier untouched", () => {
  const { state, source, creature } = stateWithAttack([{
    kind: "optional",
    as: "$paid_toll",
    costs: [{ kind: "hand_discard", player: "self", count: 1 }],
  }]);
  installNextAttack(state, creature);
  const first = runtimeV02BeginAttackDeclarationCost(state as never, request(source, creature), "choice-4");
  assert(first.status === "player_choice_required", "optional cost did not pause");
  const second = runtimeV02ResumeAttackDeclarationCost(
    state as never,
    request(source, creature),
    first.pending_choice,
    first.pending_choice.id,
    ["pay"],
    "choice-5",
  );
  assert(second.status === "player_choice_required", "hand selection did not pause");

  (state.players as Record<string, any>)["1"].vanguard.stack[0] = card("changed", "other-card");
  let failed = false;
  try {
    runtimeV02ResumeAttackDeclarationCost(
      state as never,
      request(source, creature),
      second.pending_choice,
      second.pending_choice.id,
      ["hand:hand-1"],
      "choice-6",
    );
  } catch (error) {
    failed = String(error).includes("source_identity_changed");
  }
  assert(failed, "stale source did not fail payment closed");
  assert(remainingModifiers(creature) === 1, "failed payment consumed legal-declaration modifier");
});
