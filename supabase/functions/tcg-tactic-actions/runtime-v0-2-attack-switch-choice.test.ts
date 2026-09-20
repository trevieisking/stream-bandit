import {
  runtimeV02CreateAttackReserveSwitchChoice,
  runtimeV02ResolveAttackReserveSwitchChoice,
  type RuntimeV02AttackReserveSwitchDescriptor,
} from "../_shared/tcg-match-attack-switch-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function equal(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

const descriptor: RuntimeV02AttackReserveSwitchDescriptor = {
  attack_id: "backdraft",
  phase: "after_damage",
  when: { predicate: "reserve_count_at_least", controller: "self", count: 1 },
  selection: { controller: "self", zone: "reserve", count: 1, as: "switch_target" },
  switch: { player: "self", target: "$switch_target", action_kind: "attack" },
};

function def(id: string, name: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element: "Gale",
    creature: { stage: "Standalone", attacks: [] },
    essence: null,
    tactic: null,
  };
}

function field(uid: string, cardId: string) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

function state(withReserve = true): Record<string, unknown> {
  return {
    turn_seq: 8,
    active_seat: 1,
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      source: { definition_v0_2: def("source", "Slipwing") },
      reserve_a: { definition_v0_2: def("reserve_a", "Windling") },
      reserve_b: { definition_v0_2: def("reserve_b", "Sky Cub") },
    },
    players: {
      "1": {
        vanguard: field("source-uid", "source"),
        reserve: withReserve
          ? [field("a-uid", "reserve_a"), field("b-uid", "reserve_b"), null, null]
          : [null, null, null, null],
      },
      "2": {
        vanguard: field("opp-uid", "reserve_a"),
        reserve: [null, null, null, null],
      },
    },
  };
}

Deno.test("Attack Reserve switch choice is created only when shared IF matches", () => {
  const yes = state(true);
  const choice = runtimeV02CreateAttackReserveSwitchChoice(
    yes,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source" },
    "switch-choice",
  );
  assert(choice, "choice should be created");
  equal(choice.kind, "select_friendly_reserve_to_switch", "kind");
  equal(choice.options.length, 2, "legal Reserve options");
  equal(choice.options[0].label, "Windling", "first label");

  const no = state(false);
  const absent = runtimeV02CreateAttackReserveSwitchChoice(
    no,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source" },
    "switch-choice-no",
  );
  equal(absent, null, "IF false should not create a choice");
});

Deno.test("Attack Reserve switch resolution rebinds anchors and delegates to Atomic Switch", () => {
  const current = state(true);
  const choice = runtimeV02CreateAttackReserveSwitchChoice(
    current,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source" },
    "switch-choice",
  );
  assert(choice, "choice should be created");
  const selected = choice.options[1];
  const resolved = runtimeV02ResolveAttackReserveSwitchChoice(
    choice,
    1,
    choice.id,
    [selected.id],
    current,
  );
  equal(resolved.reserve_index, 1, "selected reserve index");
  const player = (current.players as any)["1"];
  equal(player.vanguard.stack[0].uid, "b-uid", "selected Reserve became Vanguard");
  equal(player.reserve[1].stack[0].uid, "source-uid", "old Vanguard moved to Reserve");
  equal(resolved.switch_result.events.length, 2, "canonical movement events");
  equal(resolved.switch_result.events[0].event, "moved_to_reserve", "first movement event");
  equal(resolved.switch_result.events[1].event, "became_vanguard", "second movement event");
});

Deno.test("Attack Reserve switch choice rejects stale or wrong-seat resolution", () => {
  const current = state(true);
  const choice = runtimeV02CreateAttackReserveSwitchChoice(
    current,
    1,
    descriptor,
    { uid: "source-uid", card_id: "source" },
    "switch-choice",
  );
  assert(choice, "choice should be created");
  let wrongSeat = "";
  try {
    runtimeV02ResolveAttackReserveSwitchChoice(choice, 2, choice.id, [choice.options[0].id], current);
  } catch (error) {
    wrongSeat = error instanceof Error ? error.message : String(error);
  }
  equal(wrongSeat, "tcg_v0_2_attack_switch_choice_not_yours", "wrong-seat guard");

  current.turn_seq = 9;
  let stale = "";
  try {
    runtimeV02ResolveAttackReserveSwitchChoice(choice, 1, choice.id, [choice.options[0].id], current);
  } catch (error) {
    stale = error instanceof Error ? error.message : String(error);
  }
  equal(stale, "tcg_v0_2_attack_switch_choice_turn_changed", "turn stale guard");
});
