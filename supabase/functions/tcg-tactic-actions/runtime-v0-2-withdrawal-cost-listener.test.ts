import {
  runtimeV02ResolveVoluntaryWithdrawalCostListeners,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function inst(uid: string, cardId: string) {
  return { uid, card_id: cardId };
}

function card(id: string, body: Record<string, unknown>) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    traits: [],
    pack_only: false,
    deck_limit: { scope: "identity", max: 4 },
    prestige: { starbound: { enabled: false } },
    ...body,
  };
}

function creatureDefinition(id: string) {
  return card(id, {
    card_family: "Creature",
    element: "Gale",
    creature: {
      creature_types: [],
      stage: "Standalone",
      evolves_from_id: null,
      hp: 100,
      withdrawal: 2,
      reward_value: 1,
      resistance: null,
      matchup_override: null,
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  });
}

function realmDefinition() {
  return card("test-wind-realm", {
    card_family: "Tactic",
    element: "Gale",
    creature: null,
    essence: null,
    tactic: {
      subtype: "Realm",
      play_requirements: [],
      program: {
        schema: "sb-tcg-effects-v0.2",
        discard_after_resolve: false,
        steps: [],
      },
      listeners: [{
        id: "first-withdrawal-reducer",
        event: "before_voluntary_withdrawal_cost",
        controller_scope: "any",
        requirements: {
          all: [{ predicate: "event_active_seat_is_controller" }],
        },
        limit: { scope: "turn", count: 1, owner: "event_controller" },
        steps: [{
          op: "MODIFY_CURRENT_WITHDRAWAL_COST",
          delta: -1,
          minimum: 0,
        }],
      }],
      continuous: [],
    },
  });
}

function field(instance: { uid: string; card_id: string }) {
  return {
    stack: [instance],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null },
    flags: {},
  };
}

function state() {
  const vanguard = inst("vanguard-1", "test-vanguard-1");
  const nextVanguard = inst("vanguard-2", "test-vanguard-2");
  const opponent = inst("opponent", "test-opponent");
  const realm = inst("realm-uid", "test-wind-realm");
  const definitions = [
    creatureDefinition("test-vanguard-1"),
    creatureDefinition("test-vanguard-2"),
    creatureDefinition("test-opponent"),
    realmDefinition(),
  ];
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 7,
    active_seat: 1,
    effect_events: [],
    card_index: Object.fromEntries(definitions.map((definition: any) => [
      definition.id,
      {
        card_id: definition.id,
        definition_v0_2: definition,
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    ])),
    players: {
      "1": {
        vanguard: field(vanguard),
        reserve: [field(nextVanguard), null, null, null],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
    realm: {
      card: realm,
      owner_seat: 2,
      played_turn: 5,
    },
  } as Record<string, unknown>;
}

function resolve(
  s: Record<string, unknown>,
  sourceUid: string,
  baseCost: number,
) {
  return runtimeV02ResolveVoluntaryWithdrawalCostListeners(s, {
    controller_seat: 1,
    source_creature_uid: sourceUid,
    base_cost: baseCost,
    action_id: "withdraw",
  })!;
}

Deno.test("before-withdrawal Realm modifier reduces the active controller cost generically", () => {
  const s = state();
  const result = resolve(s, "vanguard-1", 2);
  equal(result.schema, "sb-tcg-voluntary-withdrawal-cost-v0.2");
  equal(result.base_cost, 2);
  equal(result.cost, 1);
  equal(result.applications.length, 1);
  equal(result.applications[0].listener_id, "first-withdrawal-reducer");
  equal(result.applications[0].requested_delta, -1);
  equal(result.applications[0].applied_delta, -1);
  equal(result.applications[0].limit_consumed, true);
});

Deno.test("read-only preview on a cloned state cannot consume the authoritative turn limit", () => {
  const s = state();
  const previewState = structuredClone(s);
  equal(resolve(previewState, "vanguard-1", 2).cost, 1);
  equal(s.runtime_v0_2_event_listener_state, undefined);
  equal(s.effect_events, []);

  const authoritative = resolve(s, "vanguard-1", 2);
  equal(authoritative.cost, 1);
  equal(authoritative.applications[0].replayed, false);
});

Deno.test("event-controller turn limit blocks a second source in the same turn and resets next turn", () => {
  const s = state();
  equal(resolve(s, "vanguard-1", 2).cost, 1);

  const player = (s.players as any)["1"];
  const prior = player.vanguard;
  player.vanguard = player.reserve[0];
  player.reserve[0] = prior;

  const blocked = resolve(s, "vanguard-2", 2);
  equal(blocked.cost, 2);
  equal(blocked.applications, []);

  s.turn_seq = 8;
  const reset = resolve(s, "vanguard-2", 2);
  equal(reset.cost, 1);
  equal(reset.applications.length, 1);
});

Deno.test("inactive controller fails the active-seat predicate without consuming the listener", () => {
  const s = state();
  s.active_seat = 2;
  const inactive = resolve(s, "vanguard-1", 2);
  equal(inactive.cost, 2);
  equal(inactive.applications, []);

  s.active_seat = 1;
  const active = resolve(s, "vanguard-1", 2);
  equal(active.cost, 1);
  equal(active.applications.length, 1);
});

Deno.test("minimum zero is respected and the matching first-withdrawal listener still resolves", () => {
  const s = state();
  const result = resolve(s, "vanguard-1", 0);
  equal(result.cost, 0);
  equal(result.applications.length, 1);
  equal(result.applications[0].applied_delta, 0);
  equal(result.applications[0].limit_consumed, true);
});
