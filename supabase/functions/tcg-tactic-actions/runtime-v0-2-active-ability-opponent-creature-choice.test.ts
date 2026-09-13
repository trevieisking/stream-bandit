import {
  runtimeV02BuildActiveAbilityOpponentCreatureChoice,
  runtimeV02PendingActiveAbilityOpponentCreatureChoiceView,
  runtimeV02ResolveActiveAbilityOpponentCreatureChoice,
} from "../_shared/tcg-match-active-ability-opponent-creature-choice-v0-2.ts";
import {
  runtimeV02RecordActiveAbilityUse,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";

type Inst = { uid: string; card_id: string };

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

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

const ABILITY_ID = "target-drain-proof";
const SOURCE = { uid: "source:uid", card_id: "underworld-source" };
const OPP_VANGUARD = { uid: "opp-vanguard:uid", card_id: "opp-vanguard" };
const OPP_RESERVE = { uid: "opp-reserve:uid", card_id: "opp-reserve" };
const OPP_RESERVE_2 = { uid: "opp-reserve-2:uid", card_id: "opp-reserve-2" };

function creature(instance: Inst) {
  return {
    stack: [instance],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
  };
}

function state(options: { receipt?: boolean; targets?: boolean } = {}) {
  const current = {
    turn_seq: 14,
    active_seat: 1 as const,
    players: {
      "1": {
        vanguard: creature(SOURCE),
        reserve: [null, null, null, null],
        hand: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: options.targets === false ? null : creature(OPP_VANGUARD),
        reserve: options.targets === false
          ? [null, null, null, null]
          : [null, creature(OPP_RESERVE), null, creature(OPP_RESERVE_2)],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
  } as Record<string, unknown>;
  if (options.receipt !== false) {
    runtimeV02RecordActiveAbilityUse(current, 1, ABILITY_ID);
  }
  return current;
}

function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: { ...SOURCE },
  };
}

Deno.test("Ability opponent-creature choice snapshots every opposing field Creature after activation receipt", () => {
  const current = state();
  const pending = runtimeV02BuildActiveAbilityOpponentCreatureChoice(
    current,
    1,
    ABILITY_ID,
    source(),
    "opponent-choice-1",
  );

  assertEquals(pending.kind, "select_one_opposing_creature");
  assertEquals(pending.options.length, 3);
  assertEquals(pending.options[0].id, `opponent:vanguard:${OPP_VANGUARD.uid}`);
  assertEquals(pending.options[1].id, `opponent:reserve:1:${OPP_RESERVE.uid}`);
  assertEquals(pending.options[2].id, `opponent:reserve:3:${OPP_RESERVE_2.uid}`);

  const controllerView = runtimeV02PendingActiveAbilityOpponentCreatureChoiceView(pending, 1);
  const opponentView = runtimeV02PendingActiveAbilityOpponentCreatureChoiceView(pending, 2);
  assert(controllerView && "options" in controllerView, "controller options missing");
  assertEquals(controllerView.options.length, 3);
  assert(opponentView && "waiting" in opponentView && opponentView.waiting === true, "opponent view leaked choice options");
});

Deno.test("Ability opponent-creature choice resolves one anchored opposing Reserve target", () => {
  const current = state();
  const pending = runtimeV02BuildActiveAbilityOpponentCreatureChoice(
    current,
    1,
    ABILITY_ID,
    source(),
    "opponent-choice-2",
  );
  const selected = pending.options.find((option) => option.anchor_uid === OPP_RESERVE.uid);
  assert(selected, "expected opposing Reserve option missing");

  const resolved = runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
    pending,
    1,
    pending.id,
    [selected.id],
    current,
  );
  assertEquals(resolved.ability_id, ABILITY_ID);
  assertEquals(resolved.target.controller_seat, 2);
  assertEquals(resolved.target.where, "reserve");
  assertEquals(resolved.target.index, 1);
  assertEquals(resolved.target.anchor_uid, OPP_RESERVE.uid);
  assertEquals(resolved.target.card_id, OPP_RESERVE.card_id);
});

Deno.test("Ability opponent-creature choice requires completed activation before target choice", () => {
  const current = state({ receipt: false });
  assertThrows(
    () => runtimeV02BuildActiveAbilityOpponentCreatureChoice(
      current,
      1,
      ABILITY_ID,
      source(),
      "opponent-choice-3",
    ),
    "limit_receipt_missing",
  );
});

Deno.test("Ability opponent-creature choice fails closed when the opposing field target set changes", () => {
  const current = state();
  const pending = runtimeV02BuildActiveAbilityOpponentCreatureChoice(
    current,
    1,
    ABILITY_ID,
    source(),
    "opponent-choice-4",
  );
  const players = current.players as Record<string, any>;
  players["2"].reserve[1] = null;

  assertThrows(
    () => runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
      pending,
      1,
      pending.id,
      [pending.options[0].id],
      current,
    ),
    "target_set_changed",
  );
});

Deno.test("Ability opponent-creature choice fails closed when the source identity changes", () => {
  const current = state();
  const pending = runtimeV02BuildActiveAbilityOpponentCreatureChoice(
    current,
    1,
    ABILITY_ID,
    source(),
    "opponent-choice-5",
  );
  const players = current.players as Record<string, any>;
  players["1"].vanguard.stack[0] = { uid: "changed:uid", card_id: "changed-source" };

  assertThrows(
    () => runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
      pending,
      1,
      pending.id,
      [pending.options[0].id],
      current,
    ),
    "source_changed",
  );
});

Deno.test("Ability opponent-creature choice rejects an empty opposing field", () => {
  const current = state({ targets: false });
  assertThrows(
    () => runtimeV02BuildActiveAbilityOpponentCreatureChoice(
      current,
      1,
      ABILITY_ID,
      source(),
      "opponent-choice-6",
    ),
    "target_unavailable",
  );
});

Deno.test("Ability opponent-creature choice remains controller-bound and turn-bound", () => {
  const current = state();
  const pending = runtimeV02BuildActiveAbilityOpponentCreatureChoice(
    current,
    1,
    ABILITY_ID,
    source(),
    "opponent-choice-7",
  );
  assertThrows(
    () => runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
      pending,
      2,
      pending.id,
      [pending.options[0].id],
      current,
    ),
    "not_yours",
  );
  current.turn_seq = 15;
  assertThrows(
    () => runtimeV02ResolveActiveAbilityOpponentCreatureChoice(
      pending,
      1,
      pending.id,
      [pending.options[0].id],
      current,
    ),
    "turn_changed",
  );
});
