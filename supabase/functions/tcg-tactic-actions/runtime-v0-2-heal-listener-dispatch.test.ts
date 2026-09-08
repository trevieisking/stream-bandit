import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";
import { applyRuntimeV02HealPacket } from "../_shared/tcg-match-heal-packet-v0-2.ts";
import { dispatchRuntimeV02AfterHealPacket } from "../_shared/tcg-match-heal-listener-dispatch-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function assertThrows(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) { const message = error instanceof Error ? error.message : String(error); if (!message.includes(fragment)) throw error; return; }
  throw new Error(`expected error containing ${fragment}`);
}

type Inst = { uid: string; card_id: string; effect_flags?: Record<string, unknown> };
const inst = (uid: string, card_id: string): Inst => ({ uid, card_id });
const creature = (top: Inst, damage: number, essence: Inst[] = []) => ({ stack: [top], essence, relic: null, damage, shield: 0, conditions: { scorched: false, venomed: 0, control: null, modifier: null }, flags: {} });
function card(id: string, body: Record<string, unknown>) { return { schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2", id, name: id, traits: [], pack_only: false, deck_limit: { scope: "identity", max: 4 }, prestige: { starbound: { enabled: false } }, ...body }; }

function state() {
  const source = inst("grove-source-uid", "test-grove-source"), symbiote = inst("symbiote-uid", "test-symbiote"), shellip = inst("shellip-uid", "test-shellip"), moonlit = inst("moonlit-uid", "test-moonlit");
  const definitions: Record<string, unknown> = {
    "test-grove-source": card("test-grove-source", { card_family: "Creature", element: "Grove", creature: { stage: "Teen", ability: null, attacks: [] }, essence: null, tactic: null }),
    "test-shellip": card("test-shellip", { card_family: "Creature", element: "Tide", creature: { stage: "Baby", ability: { id: "tidepool-shell", name: "Tidepool Shell", mode: "triggered", event: "after_heal_packet", timing: "own_turn", limit: { scope: "turn", count: 1, owner: "card_instance" }, requirements: { all: [{ predicate: "heal_packet_target_is_self" }, { predicate: "heal_source_is_card_effect" }, { predicate: "heal_actual_amount_at_least", value: 1 }] }, costs: [], steps: [{ op: "ADD_SHIELD", target: "$source_creature", amount: 10 }] }, attacks: [] }, essence: null, tactic: null }),
    "test-symbiote": card("test-symbiote", { card_family: "Essence", element: "Grove", creature: null, essence: { subtype: "Special", provides: [{ element: "Grove", amount: 1 }], attach_requirements: [], on_attach: [], continuous: [], lifecycle: null, listeners: [{ id: "symbiote-reciprocal-heal", event: "after_heal_packet", requirements: { all: [{ predicate: "heal_packet_source_is_attached_creature" }, { predicate: "heal_packet_target_controller_is_self" }, { predicate: "heal_packet_target_is_not_source" }, { any: [{ predicate: "heal_packet_source_action_kind_is", action_kind: "ability" }, { predicate: "heal_packet_source_action_kind_is", action_kind: "attack" }] }, { predicate: "target_stage_in", target: "$attached_creature", stages: ["Teen", "Adult"] }, { predicate: "target_element_is", target: "$attached_creature", element: "Grove" }] }, limit: { scope: "turn", count: 1, owner: "attachment" }, steps: [{ op: "HEAL", target: "$attached_creature", amount: 10 }] }] }, tactic: null }),
    "test-moonlit": card("test-moonlit", { card_family: "Tactic", element: "Tide", creature: null, essence: null, tactic: { subtype: "Realm", program: { schema: "sb-tcg-effects-v0.2", discard_after_resolve: false, steps: [] }, continuous: [], listeners: [{ id: "moonlit-reef-filter", event: "after_heal_packet", controller_scope: "any", requirements: { all: [{ predicate: "heal_actual_amount_at_least", value: 1 }, { predicate: "heal_target_element_is", element: "Tide" }, { predicate: "heal_controller_is_active_seat" }, { predicate: "heal_source_is_card_effect" }] }, limit: { scope: "turn", count: 1, owner: "event_controller" }, steps: [{ op: "OPTIONAL", player: "$event_controller", steps: [{ op: "DRAW", player: "$event_controller", count: 1 }, { op: "CHOOSE_HAND_TO_DISCARD", player: "$event_controller", count: 1 }] }] }] } }),
  };
  const s = { runtime_registry_v0_2: runtimeV02SnapshotMarker(), turn_seq: 12, active_seat: 1, effect_events: [], card_index: Object.fromEntries(Object.entries(definitions).map(([cardId, definition]) => [cardId, { card_id: cardId, definition_v0_2: definition, definition_v0_2_rules_version: "sb-tcg-card-v0.2" }])), players: { "1": { vanguard: creature(source, 20, [symbiote]), reserve: [creature(shellip, 20), null, null, null] }, "2": { vanguard: null, reserve: [null, null, null, null] } }, realm: { card: moonlit, owner_seat: 1, played_turn: 10 } } as Record<string, unknown>;
  return { s, symbiote, shellip, moonlit };
}

function attackHealShellip(s: Record<string, unknown>) {
  const p = (s.players as any)["1"], source = p.vanguard, target = p.reserve[0];
  return applyRuntimeV02HealPacket(s, target, 30, { source: { controller_seat: 1, action_kind: "attack", action_id: "deep-current", card_effect: true, card_uid: source.stack[0].uid, card_id: source.stack[0].card_id, creature_uid: source.stack[0].uid }, target: { controller_seat: 1, creature_uid: target.stack[0].uid, card_uid: target.stack[0].uid, card_id: target.stack[0].card_id, element: "Tide", where: "reserve", index: 0 } }).packet!;
}

Deno.test("after-heal dispatcher resolves Shellip and Symbiote while deferring Moonlit", () => {
  const { s, symbiote, shellip, moonlit } = state(), packet = attackHealShellip(s), result = dispatchRuntimeV02AfterHealPacket(s, packet.id)!;
  const p = (s.players as any)["1"];
  assertEquals(result.resolved.map((item: any) => item.listener_id), ["symbiote-reciprocal-heal", "tidepool-shell"]);
  assertEquals(result.deferred.map((item: any) => item.listener_id), ["moonlit-reef-filter"]);
  assertEquals(result.deferred[0].chooser_seat, 1);
  assertEquals(result.emitted_packet_ids, ["heal:12:2"]);
  assertEquals(p.vanguard.damage, 10); assertEquals(p.reserve[0].shield, 10);
  assertEquals((s.effect_events as any[]).map((event) => event.id), ["heal:12:1", "heal:12:2"]);
  assertEquals(Object.values((symbiote.effect_flags as any).runtime_v0_2_listener_limits)[0].count, 1);
  assertEquals(Object.values((shellip.effect_flags as any).runtime_v0_2_listener_limits)[0].count, 1);
  assertEquals(moonlit.effect_flags, undefined, "deferred Realm choice must not consume its limit early");
});

Deno.test("source instance turn limits block a second trigger and reset next turn", () => {
  const { s } = state(); dispatchRuntimeV02AfterHealPacket(s, attackHealShellip(s).id);
  const p = (s.players as any)["1"]; p.reserve[0].damage = 10;
  const sameTurn = dispatchRuntimeV02AfterHealPacket(s, attackHealShellip(s).id)!;
  assertEquals(sameTurn.resolved.length, 0); assertEquals(sameTurn.limited.map((item: any) => item.listener_id), ["symbiote-reciprocal-heal", "tidepool-shell"]);
  s.turn_seq = 13; p.reserve[0].damage = 10; p.vanguard.damage = 10;
  const nextTurn = dispatchRuntimeV02AfterHealPacket(s, attackHealShellip(s).id)!;
  assertEquals(nextTurn.resolved.map((item: any) => item.listener_id), ["symbiote-reciprocal-heal", "tidepool-shell"]);
});

Deno.test("one persisted packet cannot execute non-choice listeners twice", () => {
  const { s } = state(), packet = attackHealShellip(s);
  const first = dispatchRuntimeV02AfterHealPacket(s, packet.id)!, second = dispatchRuntimeV02AfterHealPacket(s, packet.id)!;
  assertEquals(first.resolved.length, 2); assertEquals(second.resolved.length, 0);
  assertEquals(second.already_resolved.map((item: any) => item.listener_id), ["symbiote-reciprocal-heal", "tidepool-shell"]);
  assertEquals(second.deferred.map((item: any) => item.listener_id), ["moonlit-reef-filter"]);
});

Deno.test("nested Symbiote healing emits a packet but parent dispatch does not recurse", () => {
  const { s } = state(), parent = dispatchRuntimeV02AfterHealPacket(s, attackHealShellip(s).id)!;
  assertEquals(parent.emitted_packet_ids, ["heal:12:2"]);
  const nested = dispatchRuntimeV02AfterHealPacket(s, "heal:12:2")!;
  assertEquals(nested.resolved.length, 0); assertEquals(nested.deferred.length, 0);
});

Deno.test("malformed listener metadata fails closed and legacy state stays outside authority", () => {
  const bad = state(), shellDef = (bad.s.card_index as any)["test-shellip"].definition_v0_2;
  shellDef.creature.ability.requirements.all[0] = { predicate: "invented_heal_predicate" };
  const packet = attackHealShellip(bad.s);
  assertThrows(() => dispatchRuntimeV02AfterHealPacket(bad.s, packet.id), "predicate_unsupported");
  const legacy = state(), legacyPacket = attackHealShellip(legacy.s); delete legacy.s.runtime_registry_v0_2;
  assertEquals(dispatchRuntimeV02AfterHealPacket(legacy.s, legacyPacket.id), null);
});
