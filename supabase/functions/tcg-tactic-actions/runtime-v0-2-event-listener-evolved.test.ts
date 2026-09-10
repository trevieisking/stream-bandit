import {
  runtimeV02BeginEventListenerContinuation,
  runtimeV02CreateCreatureEvolvedEvent,
  runtimeV02PendingEventListenerChoiceView,
  runtimeV02PrivateEventInspectionView,
  runtimeV02ResolveEventListenerChoice,
} from "../_shared/tcg-match-event-listener-v0-2.ts";
import { runtimeV02PrivateRewardInspectionView } from "../_shared/tcg-match-reward-inspection-v0-2.ts";
import { runtimeV02CurrentTurnHiddenInformationViews } from "../_shared/tcg-match-hidden-information-v0-2.ts";
import { runtimeV02CurrentTurnEssenceAttachmentEvents } from "../_shared/tcg-match-essence-attachment-event-v0-2.ts";

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}
function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

type Ability = Record<string, unknown>;
type Inst = { uid: string; card_id: string; attached_turn?: number; effect_flags?: Record<string, unknown> };

const marker = {
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  registry_sha256: "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
  runtime_authority: false,
  source: "test",
};

function evolvedAbility(id: string, requirements: Record<string, unknown>, steps: Record<string, unknown>[]): Ability {
  return { id, name: id, mode: "triggered", event: "creature_evolved", timing: "own_turn", limit: null, requirements, costs: [], steps };
}
function creatureDefinition(id: string, name: string, element: string, ability: Ability | null = null) {
  return {
    schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2", id, name,
    card_family: "Creature", element,
    creature: { stage: "Teen", hp: 160, withdrawal: 1, ability, attacks: [] }, essence: null, tactic: null,
  };
}
function essenceDefinition(id: string, name: string, subtype = "Basic", element = "Volt") {
  return {
    schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2", id, name,
    card_family: "Essence", element, creature: null,
    essence: { subtype, provides: [element], listeners: [], continuous: [], lifecycle: null }, tactic: null,
  };
}
function tacticDefinition(id: string, name: string, subtype = "Device") {
  return {
    schema: "sb-tcg-card-v0.2", effect_schema: "sb-tcg-effects-v0.2", id, name,
    card_family: "Tactic", element: "Neutral", creature: null, essence: null,
    tactic: { subtype, program: { steps: [] }, listeners: [], continuous: [] },
  };
}
function instance(uid: string, cardId: string): Inst { return { uid, card_id: cardId }; }
function field(card: Inst, damage = 0, shield = 0) {
  return {
    stack: [card], essence: [], relic: null, damage, shield, condition: null,
    conditions: { scorched: false, venomed: 0, control: null, modifier: null }, flags: {},
    entered_turn: 6, evolved_turn: 7,
  };
}
function baseState(
  sourceDefinition: Record<string, unknown>,
  options: {
    sourceDamage?: number; sourceShield?: number;
    extraReserve?: Array<{ inst: Inst; definition: Record<string, unknown>; damage?: number }>;
    hand?: Inst[]; handDefinitions?: Record<string, unknown>[];
    discard?: Inst[]; discardDefinitions?: Record<string, unknown>[];
    deck?: Inst[]; deckDefinitions?: Record<string, unknown>[];
    rewards?: Inst[]; rewardDefinitions?: Record<string, unknown>[];
    opponentHand?: Inst[]; opponentHandDefinitions?: Record<string, unknown>[];
    opponentControl?: string | null; opponentFlags?: Record<string, unknown>;
    turnFlags?: Record<string, unknown>;
  } = {},
): Record<string, unknown> {
  const source = instance("source-uid", String(sourceDefinition.id));
  const ownVanguard = instance("own-vanguard-uid", "test-own-vanguard");
  const opponentVanguard = instance("opponent-vanguard-uid", "test-opponent-vanguard");
  const definitions = [
    sourceDefinition,
    creatureDefinition("test-own-vanguard", "Own Vanguard", String(sourceDefinition.element || "Gale")),
    creatureDefinition("test-opponent-vanguard", "Opponent Vanguard", "Shade"),
    ...(options.extraReserve || []).map((entry) => entry.definition),
    ...(options.handDefinitions || []), ...(options.discardDefinitions || []),
    ...(options.deckDefinitions || []), ...(options.rewardDefinitions || []),
    ...(options.opponentHandDefinitions || []),
  ];
  const cardIndex = Object.fromEntries(definitions.map((definition) => [String(definition.id), { definition_v0_2: definition }]));
  const reserve: unknown[] = [field(source, options.sourceDamage || 0, options.sourceShield || 0), null, null, null];
  for (const [i, entry] of (options.extraReserve || []).entries()) reserve[i + 1] = field(entry.inst, entry.damage || 0);
  const opponent = field(opponentVanguard) as any;
  opponent.conditions.control = options.opponentControl || null;
  opponent.flags = { ...(options.opponentFlags || {}) };
  return {
    turn_seq: 7, active_seat: 1, runtime_registry_v0_2: { ...marker }, effect_events: [],
    turn_flags: options.turnFlags || {}, card_index: cardIndex, realm: null,
    players: {
      "1": { vanguard: field(ownVanguard), reserve, hand: options.hand || [], deck: options.deck || [], discard: options.discard || [], rewards: options.rewards || [] },
      "2": { vanguard: opponent, reserve: [null, null, null, null], hand: options.opponentHand || [], deck: [], discard: [], rewards: [] },
    },
  };
}
function begin(state: Record<string, unknown>) {
  const event = runtimeV02CreateCreatureEvolvedEvent(state, 1, "source-uid", "reserve", 0);
  return runtimeV02BeginEventListenerContinuation(state, [event]);
}

Deno.test("Cragroller and Reefback add exactly 20 Shield through the generic evolved listener", () => {
  for (const [id, name] of [["stone-cragroller", "Cragroller"], ["tide-reefback", "Reefback"]]) {
    const source = creatureDefinition(id, name, id.startsWith("stone") ? "Stone" : "Tide", evolvedAbility("guard", { all: [{ predicate: "event_subject_is_source" }] }, [{ op: "ADD_SHIELD", target: "$source_creature", amount: 20 }]));
    const state = baseState(source);
    equal(begin(state).status, "complete");
    equal((state.players as any)["1"].reserve[0].shield, 20);
  }
});

Deno.test("Briarback conditionally heals 30 and emits the canonical heal packet", () => {
  const extra = instance("extra-uid", "test-extra");
  const source = creatureDefinition("grove-briarback", "Briarback", "Grove", evolvedAbility("growing-wall", { all: [{ predicate: "event_subject_is_source" }] }, [{ op: "IF", when: { predicate: "reserve_count_at_least", controller: "self", count: 2 }, then: [{ op: "HEAL", target: "$source_creature", amount: 30 }] }]));
  const state = baseState(source, { sourceDamage: 40, extraReserve: [{ inst: extra, definition: creatureDefinition("test-extra", "Extra", "Grove") }] });
  const flow = begin(state);
  equal(flow.status, "complete");
  equal((state.players as any)["1"].reserve[0].damage, 10);
  equal(flow.emitted_heal_packet_ids.length, 1);
});

Deno.test("Bristleflare optional self-damage respects Shield and resumes into DRAW once", () => {
  const drawn = instance("drawn-uid", "test-drawn");
  const source = creatureDefinition("ember-bristleflare", "Bristleflare", "Ember", evolvedAbility("heat-up", { all: [{ predicate: "event_subject_is_source" }] }, [{ op: "OPTIONAL", player: "self", steps: [{ op: "DIRECT_DAMAGE", target: "$source_creature", amount: 10, damage_class: "effect" }, { op: "DRAW", player: "self", count: 1 }] }]));
  const state = baseState(source, { sourceShield: 5, deck: [drawn], deckDefinitions: [tacticDefinition("test-drawn", "Drawn")] });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "optional");
  const done = runtimeV02ResolveEventListenerChoice(state, 1, pending.pending_choice!.id, ["accept"]);
  equal(done.status, "complete");
  equal((state.players as any)["1"].reserve[0].shield, 0);
  equal((state.players as any)["1"].reserve[0].damage, 5);
  equal((state.players as any)["1"].hand[0].uid, "drawn-uid");
});

Deno.test("Capscout selects at most one Device from discard and moves it to deck bottom", () => {
  const device = instance("device-uid", "test-device");
  const source = creatureDefinition("grove-capscout", "Capscout", "Grove", evolvedAbility("fungal-forage", { all: [{ predicate: "event_subject_is_source" }] }, [{ op: "SELECT_CARDS", player: "self", zone: "discard", selection: { min: 0, max: 1, filters: { card_family: "Tactic", tactic_subtype: "Device" } }, as: "foraged" }, { op: "MOVE_CARDS", player: "self", cards: "$foraged", to: "deck_bottom", order: "preserve" }]));
  const state = baseState(source, { discard: [device], discardDefinitions: [tacticDefinition("test-device", "Device")] });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "select_cards");
  const done = runtimeV02ResolveEventListenerChoice(state, 1, pending.pending_choice!.id, ["card:device-uid"]);
  equal(done.status, "complete");
  equal((state.players as any)["1"].discard.length, 0);
  equal((state.players as any)["1"].deck.at(-1).uid, "device-uid");
});

Deno.test("Comettail Reward inspection is private and resumable without moving Reward cards", () => {
  const rewards = [instance("r1", "reward-1"), instance("r2", "reward-2")];
  const source = creatureDefinition("astral-comettail", "Comettail", "Astral", evolvedAbility("comet-survey", { all: [{ predicate: "source_is_self" }] }, [{ op: "INSPECT_ZONE", player: "self", zone: "rewards", selection: { min: 0, max: 2, filters: {}, distinct: true }, visibility: "controller_private", return_policy: "same_position", as: "inspected_rewards" }]));
  const state = baseState(source, { rewards, rewardDefinitions: [tacticDefinition("reward-1", "R1"), tacticDefinition("reward-2", "R2")] });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "inspect_rewards");
  equal((runtimeV02PendingEventListenerChoiceView(pending.pending_choice, 2) as any).waiting, true);
  const done = runtimeV02ResolveEventListenerChoice(state, 1, pending.pending_choice!.id, ["reward:0", "reward:1"]);
  equal(done.status, "complete");
  equal((state.players as any)["1"].rewards.length, 2);
  equal(runtimeV02PrivateRewardInspectionView(state, 1)?.cards.length, 2);
  equal(runtimeV02PrivateRewardInspectionView(state, 2), null);
});

Deno.test("Orbitail privately looks at the top two and resumes player-chosen ordering without replay", () => {
  const top = instance("top-uid", "top-card"), next = instance("next-uid", "next-card"), third = instance("third-uid", "third-card");
  const defs = [tacticDefinition("top-card", "Top"), tacticDefinition("next-card", "Next"), tacticDefinition("third-card", "Third")];
  const source = creatureDefinition("astral-orbitail", "Orbitail", "Astral", evolvedAbility("orbit-check", { all: [{ predicate: "source_is_self" }] }, [{ op: "LOOK_TOP", player: "self", count: 2, as: "looked" }, { op: "RETURN_SET_TO_DECK_TOP", player: "self", cards: "$looked", order: "player_choice" }]));
  const state = baseState(source, { deck: [top, next, third], deckDefinitions: defs });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "order_cards");
  equal(runtimeV02PrivateEventInspectionView(state, 1)?.cards.length, 2);
  equal(runtimeV02PrivateEventInspectionView(state, 2), null);
  const done = runtimeV02ResolveEventListenerChoice(state, 1, pending.pending_choice!.id, ["card:next-uid", "card:top-uid"]);
  equal(done.status, "complete");
  equal((state.players as any)["1"].deck[0].uid, "next-uid");
  equal((state.players as any)["1"].deck[1].uid, "top-uid");
  equal((state.players as any)["1"].deck[2].uid, "third-uid");
});

Deno.test("Duskstalker samples one opponent hand card server-side and exposes it only to the controller", () => {
  const a = instance("opp-a", "opp-a-card"), b = instance("opp-b", "opp-b-card");
  const source = creatureDefinition("shade-duskstalker", "Duskstalker", "Shade", evolvedAbility("hidden-tell", { all: [{ predicate: "event_subject_is_source" }, { predicate: "hand_count_at_least", controller: "opponent", count: 1 }] }, [{ op: "RANDOM_SAMPLE_HIDDEN_ZONE", player: "opponent", zone: "hand", count: { min: 1, max: 1 }, rng_owner: "match", visibility: "controller_private", as: "sampled" }]));
  const state = baseState(source, { opponentHand: [a, b], opponentHandDefinitions: [tacticDefinition("opp-a-card", "A"), tacticDefinition("opp-b-card", "B")] });
  equal(begin(state).status, "complete");
  const view = runtimeV02PrivateEventInspectionView(state, 1);
  equal(view?.zone, "hand");
  equal(view?.cards.length, 1);
  assert(["opp-a", "opp-b"].includes(String(view?.cards[0].uid)));
  equal(runtimeV02PrivateEventInspectionView(state, 2), null);
  equal(runtimeV02CurrentTurnHiddenInformationViews(state, 1).length, 0);
});

Deno.test("Veiljaw applies Dazed only through the canonical empty control-slot condition owner", () => {
  const source = creatureDefinition("shade-veiljaw", "Veiljaw", "Shade", evolvedAbility("frayed-thought", { all: [{ predicate: "event_subject_is_source" }, { predicate: "control_condition_slot_empty", target: "$current_opponent_vanguard" }] }, [{ op: "APPLY_CONDITION", target: "$current_opponent_vanguard", condition: "Dazed", mode: "apply_if_empty" }]));
  const state = baseState(source);
  equal(begin(state).status, "complete");
  equal((state.players as any)["2"].vanguard.conditions.control, "Dazed");
  const immune = baseState(source, { opponentFlags: { lifecycle_condition_immunity: { turn_seq: 7, conditions: ["Dazed"], expires: "aftermath" } } });
  equal(begin(immune).status, "complete");
  equal((immune.players as any)["2"].vanguard.conditions.control, null);
});

Deno.test("Arcprowler attaches only a Basic Volt Essence from hand without consuming the manual attachment turn", () => {
  const basic = instance("basic-uid", "volt-basic"), special = instance("special-uid", "volt-special");
  const source = creatureDefinition("volt-arcprowler", "Arcprowler", "Volt", evolvedAbility("charge-relay", { all: [{ predicate: "event_subject_is_source" }] }, [{ op: "ATTACH_ESSENCE_FROM_ZONE", player: "self", zone: "hand", selection: { min: 0, max: 1, filters: { card_family: "Essence", essence_subtype: "Basic", element: "Volt" } }, target: "$source_creature", manual_attachment: false }]));
  const state = baseState(source, { hand: [basic, special], handDefinitions: [essenceDefinition("volt-basic", "Basic Volt"), essenceDefinition("volt-special", "Special Volt", "Special")] });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "attach_essence");
  equal(pending.pending_choice?.options.length, 1);
  equal(pending.pending_choice?.options[0].id, "card:basic-uid");
  const done = runtimeV02ResolveEventListenerChoice(state, 1, pending.pending_choice!.id, ["card:basic-uid"]);
  equal(done.status, "complete");
  equal((state.players as any)["1"].reserve[0].essence[0].uid, "basic-uid");
  equal((state.turn_flags as any)["1"]?.manual_essence_turn, undefined);
  const events = runtimeV02CurrentTurnEssenceAttachmentEvents(state, 1);
  equal(events.length, 1); equal(events[0].origin_zone, "hand"); equal(events[0].attachment_kind, "effect_driven");
});

Deno.test("Coilclank requires a resolved Device this turn and marks its discard attachment temporary", () => {
  const source = creatureDefinition("volt-coilclank", "Coilclank", "Volt", evolvedAbility("charge-capacitor", { all: [{ predicate: "event_subject_is_source" }, { predicate: "event_occurred", event: "device_resolved", controller: "self", window: "current_turn", min_count: 1 }] }, [{ op: "ATTACH_ESSENCE_FROM_ZONE", player: "self", zone: "discard", selection: { min: 0, max: 1, filters: { card_family: "Essence", essence_subtype: "Basic", element: "Volt" } }, target: "$source_creature", manual_attachment: false, attachment_state: { kind: "temporary", expires: "controller_aftermath", destination_on_expire: "discard" } }]));
  const noDevice = baseState(source, { discard: [instance("basic-a", "volt-basic")], discardDefinitions: [essenceDefinition("volt-basic", "Basic Volt")] });
  equal(begin(noDevice).status, "complete");
  equal((noDevice.players as any)["1"].reserve[0].essence.length, 0);
  const state = baseState(source, { discard: [instance("basic-b", "volt-basic")], discardDefinitions: [essenceDefinition("volt-basic", "Basic Volt")], turnFlags: { "1": { device_turn: 7 } } });
  const pending = begin(state);
  equal(pending.pending_choice?.kind, "attach_essence");
  const done = runtimeV02ResolveEventListenerChoice(state, 1, pending.pending_choice!.id, ["card:basic-b"]);
  equal(done.status, "complete");
  const attached = (state.players as any)["1"].reserve[0].essence[0];
  equal(attached.uid, "basic-b"); equal(attached.effect_flags.discard_during_target_aftermath, true);
  const events = runtimeV02CurrentTurnEssenceAttachmentEvents(state, 1);
  equal(events.length, 1); equal(events[0].origin_zone, "discard");
});
