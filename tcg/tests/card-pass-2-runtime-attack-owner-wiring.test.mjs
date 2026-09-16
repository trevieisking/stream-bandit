import test, { after } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { runtimeV02SnapshotMarker } from "../../supabase/functions/_shared/tcg-runtime-registry-v0-2.ts";

// Run the real HTTP dispatcher and domain engines. Only transport, server
// registration and random input are replaced; no live service is contacted.
let handler;
let current;
const transportKey = Symbol.for("tcg.attack-owner-test.transport");
const priorTransport = globalThis[transportKey];
const priorDeno = globalThis.Deno;
globalThis[transportKey] = () => ({
  auth: { getUser: async () => ({ data: { user: { id: "player-1" } }, error: null }) },
  from(table) {
    const data = {
      tcg_match_commands: null,
      tcg_match_state_private: { revision: 5, canonical_state: current.state },
      tcg_match_players: [{ user_id: "player-1", seat: 1 }, { user_id: "player-2", seat: 2 }],
    };
    assert.ok(Object.hasOwn(data, table), "unexpected table " + table);
    const query = {
      select() { return query; },
      eq() { return query; },
      maybeSingle: async () => ({ data: data[table], error: null }),
      then(resolve, reject) { return Promise.resolve({ data: data[table], error: null }).then(resolve, reject); },
    };
    return query;
  },
  async rpc(name, args) {
    assert.equal(name, "tcg_server_commit_state");
    current.commits.push(structuredClone(args));
    return { data: { revision: 6 }, error: null };
  },
});
globalThis.Deno = {
  env: { get: () => "local-test-placeholder" },
  serve(fn) { handler = fn; },
};
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "jsr:@supabase/supabase-js@2") {
      return {
        shortCircuit: true,
        url: 'data:text/javascript,export const createClient = (...args) => globalThis[Symbol.for("tcg.attack-owner-test.transport")](...args);',
      };
    }
    return nextResolve(specifier, context);
  },
});
await import("../../supabase/functions/tcg-match-actions/index.ts");
hooks.deregister();
after(() => {
  if (priorTransport === undefined) delete globalThis[transportKey];
  else globalThis[transportKey] = priorTransport;
  if (priorDeno === undefined) delete globalThis.Deno;
  else globalThis.Deno = priorDeno;
});

const reservePermission = { controller: "opponent", zone: "reserve", card_family: "Creature", selection: "one" };

function fixture({ structured = true, control = null, permissions = [], cardId = "test-creature" } = {}) {
  const creature = (uid) => ({
    stack: [{ uid, card_id: cardId }], essence: [], relic: null, damage: 0, shield: 0,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null }, flags: {},
  });
  const player = (seat) => ({
    seat, user_id: "player-" + seat, vanguard: creature("v" + seat),
    reserve: [creature("r" + seat), null, null, null], hand: [], discard: [], void: [],
    rewards: [{ uid: "reward" + seat, card_id: cardId }],
    deck: [{ uid: "deck" + seat, card_id: cardId }], match_flags: {}, deck_meta: {},
  });
  const state = {
    version: "test", match_id: "test-match", phase: "play", active_seat: 1,
    turn_seq: 4, first_player_seat: 2, personal_turns: { 1: 2, 2: 2 },
    players: { 1: player(1), 2: player(2) }, turn_flags: {}, pending_resolutions: [], log: [],
    card_index: {
      [cardId]: {
        card_id: cardId,
        definition: { id: cardId, name: "Test Creature", kind: "Creature", stage: "Baby", hp: 100, attack_1: "0 Any — Test Strike — 20" },
        definition_v0_2: {
          schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2", id: cardId,
          name: "Test Creature", card_family: "Creature", prestige: { starbound: { enabled: false } },
          creature: {
            attacks: [{
              id: "test-strike", name: "Test Strike", cost: [], base_damage: 20,
              damage_formula: null, target_permissions: permissions, requirements: [],
              on_declare: [], before_damage: [], after_damage: [],
            }],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  };
  if (structured) state.runtime_registry_v0_2 = runtimeV02SnapshotMarker();
  state.players[1].vanguard.conditions.control = control;
  return state;
}

async function attack(state, { random = [], ...body } = {}) {
  const original = structuredClone(state);
  const values = [...random];
  const randomOwner = crypto.getRandomValues;
  current = { state, commits: [] };
  crypto.getRandomValues = (array) => {
    assert.ok(values.length > 0, "unexpected RNG consumption");
    array[0] = values.shift();
    return array;
  };
  let response;
  try {
    response = await handler(new Request("http://local.test/tcg-match-actions", {
      method: "POST", headers: { Authorization: "Bearer local-test", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "attack", match_id: "test-match", client_nonce: "test-command", expected_revision: 5, attack_slot: 1, ...body }),
    }));
  } finally {
    crypto.getRandomValues = randomOwner;
  }
  assert.deepEqual(state, original, "handler must work on a private snapshot until atomic commit");
  assert.deepEqual(values, [], "expected RNG was not consumed");
  return { status: response.status, body: await response.json(), commits: current.commits };
}

for (const structured of [true, false]) {
  const mode = structured ? "structured" : "legacy";

  test(mode + ": Stunned preserves HTTP 400 and never commits or rolls", async () => {
    const result = await attack(fixture({ structured, control: "Stunned" }));
    assert.equal(result.status, 400);
    assert.equal(result.body.error, "stunned_cannot_attack");
    assert.equal(result.commits.length, 0);
  });

  for (const [control, amount] of [["Mindbound", 60], ["Dazed", 30]]) {
    for (const [roll, resultName] of [[0, "heads"], [1, "tails"]]) {
      test(mode + ": " + control + " " + resultName + " preserves damage, Shield, audit and Aftermath", async () => {
        const state = fixture({ structured, control });
        state.players[1].vanguard.shield = 50;
        const result = await attack(state, { random: [roll] });
        assert.equal(result.status, 200, JSON.stringify(result.body));
        assert.equal(result.commits.length, 1);
        const commit = result.commits[0];
        const next = commit.p_new_state;
        assert.equal(commit.p_event_type, roll ? "attack_condition_failed" : "attack");
        assert.deepEqual(commit.p_public_payload.randoms, [{ condition: control, result: resultName }]);
        assert.equal(next.players[1].vanguard.damage, roll ? amount : 0);
        assert.equal(next.players[1].vanguard.shield, 50);
        assert.equal(next.players[1].vanguard.conditions.control, roll && control === "Mindbound" ? control : null);
        assert.equal(next.players[2].vanguard.damage, roll ? 0 : 20);
        assert.equal(next.active_seat, 2);
        assert.equal(next.turn_seq, 5);
        assert.equal(next.players[2].hand.length, 1);
        if (roll) assert.ok(next.log.includes(control + " dealt " + amount + " to Seat 1's Vanguard and ended the attack."));
      });
    }
  }

  test(mode + ": a condition self-KO queues Rewards/promotion and pauses before Aftermath", async () => {
    const state = fixture({ structured, control: "Mindbound" });
    state.players[1].vanguard.damage = 50;
    const result = await attack(state, { random: [1] });
    assert.equal(result.status, 200, JSON.stringify(result.body));
    assert.equal(result.commits.length, 1);
    const next = result.commits[0].p_new_state;
    assert.equal(next.phase, "resolution");
    assert.equal(next.resume_after_resolution, "aftermath");
    assert.equal(next.active_seat, 1);
    assert.equal(next.players[1].vanguard, null);
    assert.deepEqual(next.pending_resolutions.map(({ kind, seat }) => ({ kind, seat })), [
      { kind: "take_reward", seat: 2 }, { kind: "promote", seat: 1 },
    ]);
  });

  for (const [pick, seat, where, index] of [[0, 1, "vanguard", null], [1, 1, "reserve", 0], [2, 2, "vanguard", null], [3, 2, "reserve", 0]]) {
    test(mode + ": Blinded redirects to battlefield slot " + pick + " with exactly one roll", async () => {
      const result = await attack(fixture({ structured, control: "Blinded" }), { random: [pick] });
      assert.equal(result.status, 200, JSON.stringify(result.body));
      assert.equal(result.commits.length, 1);
      const commit = result.commits[0];
      assert.equal(commit.p_new_state.players[1].vanguard.conditions.control, null);
      const player = commit.p_new_state.players[seat];
      assert.equal((where === "vanguard" ? player.vanguard : player.reserve[index]).damage, 20);
      assert.deepEqual(commit.p_public_payload.randoms, [
        { condition: "Blinded", target_seat: seat, target_where: where, target_index: index },
      ]);
      assert.equal(commit.p_public_payload.target_seat, seat);
      assert.equal(commit.p_public_payload.target_where, where);
      assert.equal(commit.p_public_payload.target_index, index);
    });
  }

  test(mode + ": invalid declared Reserve remains a 400 before Blinded target RNG", async () => {
    const result = await attack(fixture({ structured, control: "Blinded" }), { target_reserve_index: 0 });
    assert.equal(result.status, 400);
    assert.equal(result.body.error, "legal_opposing_reserve_target_required");
    assert.equal(result.commits.length, 0);
  });

  test(mode + ": missing declared Vanguard remains a 400 before Blinded target RNG", async () => {
    const state = fixture({ structured, control: "Blinded" });
    state.players[2].vanguard = null;
    const result = await attack(state);
    assert.equal(result.status, 400);
    assert.equal(result.body.error, "legal_attack_target_required");
    assert.equal(result.commits.length, 0);
  });
}

test("structured: a new card uses registry Reserve permissions without a card-name dispatcher", async () => {
  const result = await attack(fixture({ cardId: "future-series-test", permissions: [reservePermission] }), { target_reserve_index: 0 });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.commits[0].p_new_state.players[2].reserve[0].damage, 20);
  assert.equal(result.commits[0].p_new_state.players[2].vanguard.damage, 0);
});

test("structured: a legacy card identity does not grant Reserve permission", async () => {
  const result = await attack(fixture({ cardId: "gale-skyrend" }), { target_reserve_index: 0 });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "legal_opposing_reserve_target_required");
  assert.equal(result.commits.length, 0);
});

test("legacy: Gale Skyrend retains its existing Reserve permission", async () => {
  const result = await attack(fixture({ structured: false, cardId: "gale-skyrend" }), { target_reserve_index: 0 });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.commits[0].p_new_state.players[2].reserve[0].damage, 20);
});

test("structured: invalid or empty Reserve slots preserve the existing client error", async () => {
  for (const target_reserve_index of [-1, 4, 0.5, "invalid", 1]) {
    const result = await attack(fixture({ permissions: [reservePermission] }), { target_reserve_index });
    assert.equal(result.status, 400);
    assert.equal(result.body.error, "legal_opposing_reserve_target_required");
    assert.equal(result.commits.length, 0);
  }
});

test("attack declaration delegates condition and targeting rules to the canonical engines", () => {
  const source = readFileSync(new URL("../../supabase/functions/tcg-match-actions/index.ts", import.meta.url), "utf8");
  const action = source.slice(source.indexOf('  if(action==="attack"){'));
  assert.match(action, /runtimeV02ResolveAttackControlCondition\(/);
  assert.match(action, /runtimeV02ResolveAttackTarget\(/);
  assert.doesNotMatch(action, /cq\.control|directDamage\(p\.vanguard,(?:30|60)\)|pool\[a\[0\]%pool\.length\]/);
});
