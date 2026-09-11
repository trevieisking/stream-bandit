import { runtimeV02BeginExternalEssenceAttachmentRoute } from "../_shared/tcg-match-essence-attachment-route-v0-2.ts";
import { runtimeV02CurrentTurnEssenceAttachmentEvents } from "../_shared/tcg-match-essence-attachment-event-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function throws(fn: () => unknown, expected: string): void {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(expected)) throw new Error(`expected ${expected}, got ${message}`);
    return;
  }
  throw new Error(`expected throw containing ${expected}`);
}

type Inst = { uid: string; card_id: string; attached_turn?: number; effect_flags?: Record<string, unknown> };

const marker = {
  registry_id: "SB1-set-one-v0.2",
  set_code: "SB1",
  card_schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  card_count: 193,
  registry_sha256:
    "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
  runtime_authority: false,
  source: "test",
};

function creatureDefinition(id: string, name: string, element: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Creature",
    element,
    creature: {
      stage: "Baby",
      withdrawal: 0,
      ability: null,
      attacks: [],
    },
    essence: null,
    tactic: null,
  };
}

function essenceDefinition(id: string, name: string) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: "Essence",
    element: "Tide",
    creature: null,
    essence: {
      subtype: "Basic",
      listeners: [{
        id: "route-heal-listener",
        event: "essence_attached",
        requirements: {
          all: [
            { predicate: "source_is_self" },
            { predicate: "event_attachment_target_is_source" },
          ],
        },
        steps: [{ op: "HEAL", target: "$attached_creature", amount: 20 }],
      }],
      continuous: [],
    },
    tactic: null,
  };
}

function field(card: Inst, essence: Inst[] = [], damage = 0) {
  return {
    stack: [card],
    essence,
    relic: null,
    damage,
    shield: 0,
    condition: null,
    conditions: {
      scorched: false,
      venomed: 0,
      control: null,
      modifier: null,
    },
    flags: {},
  };
}

function state(options: {
  preAttached?: boolean;
  sourceZone?: "hand" | "discard" | "deck";
} = {}): Record<string, unknown> {
  const target: Inst = { uid: "target-uid", card_id: "test-target" };
  const attached: Inst = { uid: "essence-uid", card_id: "test-tide-essence" };
  const opponent: Inst = { uid: "opponent-uid", card_id: "test-opponent" };
  const definitions = [
    creatureDefinition("test-target", "Target", "Tide"),
    essenceDefinition("test-tide-essence", "Test Tide Essence"),
    creatureDefinition("test-opponent", "Opponent", "Shade"),
  ];
  const preAttached = options.preAttached ?? true;
  const sourceZone = options.sourceZone || "hand";
  const sourceZones: Record<string, Inst[]> = { hand: [], discard: [], deck: [] };
  if (!preAttached) sourceZones[sourceZone].push(attached);
  return {
    turn_seq: 9,
    active_seat: 1,
    runtime_registry_v0_2: { ...marker },
    effect_events: [],
    turn_flags: { "1": {}, "2": {} },
    card_index: Object.fromEntries(definitions.map((definition) => [
      definition.id,
      { definition_v0_2: definition },
    ])),
    realm: null,
    players: {
      "1": {
        vanguard: field(target, preAttached ? [attached] : [], 30),
        reserve: [null, null, null, null],
        hand: sourceZones.hand,
        deck: sourceZones.deck,
        discard: sourceZones.discard,
        rewards: [],
      },
      "2": {
        vanguard: field(opponent),
        reserve: [null, null, null, null],
        hand: [],
        deck: [],
        discard: [],
        rewards: [],
      },
    },
  };
}

Deno.test("external attachment route composes canonical receipt, event and generic continuation", () => {
  const match = state();
  const result = runtimeV02BeginExternalEssenceAttachmentRoute(
    match,
    1,
    "target-uid",
    { uid: "essence-uid", card_id: "test-tide-essence" },
    "hand",
    "manual_essence",
    {
      attachment_kind: "normal",
      phase: "play",
      action_kind: "manual_essence",
    },
  );

  equal(result.flow.status, "complete");
  equal((match.players as any)["1"].vanguard.damage, 10);
  equal(result.receipt.source_card_uid, "essence-uid");
  equal(result.receipt.target_creature_uid, "target-uid");
  equal(result.listener_event.event, "essence_attached");
  equal(result.listener_event.subject_uid, "essence-uid");
  equal(result.listener_event.attachment_target_uid, "target-uid");
  equal(result.listener_event.action_kind, "manual_essence");
  equal(result.flow.processed_listener_keys.length, 1);

  const ledger = runtimeV02CurrentTurnEssenceAttachmentEvents(match, 1);
  equal(ledger.length, 1);
  equal(ledger[0].id, result.receipt.id);
});

Deno.test("external attachment route preserves effect-driven attachment metadata", () => {
  const match = state();
  const result = runtimeV02BeginExternalEssenceAttachmentRoute(
    match,
    1,
    "target-uid",
    { uid: "essence-uid", card_id: "test-tide-essence" },
    "discard",
    "test-effect",
    {
      attachment_kind: "temporary",
      phase: "play",
      action_kind: "effect_driven",
    },
  );

  equal(result.flow.status, "complete");
  equal(result.receipt.origin_zone, "discard");
  equal(result.receipt.attachment_kind, "temporary");
  equal(result.listener_event.origin_zone, "discard");
  equal(result.listener_event.attachment_kind, "temporary");
  equal(result.listener_event.action_kind, "effect_driven");
});

Deno.test("UID transaction path owns source removal, exact-instance attachment, lifecycle metadata and event dispatch", () => {
  const match = state({ preAttached: false, sourceZone: "hand" });
  const player = (match.players as any)["1"];
  const exactSource = player.hand[0];
  const result = runtimeV02BeginExternalEssenceAttachmentRoute(
    match,
    1,
    "target-uid",
    "essence-uid",
    "hand",
    "manual_essence",
    {
      attachment_kind: "normal",
      phase: "play",
      action_kind: "manual_essence",
    },
  );

  equal(player.hand.length, 0, "canonical source zone must lose the attached card");
  equal(player.vanguard.essence.length, 1, "target must receive exactly one Essence");
  equal(player.vanguard.essence[0], exactSource, "attachment must preserve exact instance identity");
  equal(player.vanguard.essence[0].attached_turn, 9, "route must own attached_turn metadata");
  equal(result.attached_card, exactSource, "route must return the exact attached instance");
  equal(result.lifecycle_registered, false, "basic Essence has no temporary lifecycle state");
  equal(result.receipt.source_card_uid, "essence-uid");
  equal(result.listener_event.destination_index, null);
  equal(result.flow.status, "complete");
  equal(player.vanguard.damage, 10, "attached listener must run after physical attachment");
});

Deno.test("UID transaction path resolves discard source and applies caller-declared instance flags inside the owner", () => {
  const match = state({ preAttached: false, sourceZone: "discard" });
  const player = (match.players as any)["1"];
  const result = runtimeV02BeginExternalEssenceAttachmentRoute(
    match,
    1,
    "target-uid",
    "essence-uid",
    "discard",
    "test-effect",
    {
      attachment_kind: "effect_generated",
      phase: "effect_resolution",
      action_kind: "effect_driven",
      effect_flags: {
        discard_during_target_aftermath: true,
        attachment_kind: "effect_generated",
      },
    },
  );

  equal(player.discard.length, 0);
  equal(player.vanguard.essence.length, 1);
  equal(result.receipt.origin_zone, "discard");
  equal(result.receipt.attachment_kind, "effect_generated");
  equal(player.vanguard.essence[0].effect_flags.discard_during_target_aftermath, true);
  equal(player.vanguard.essence[0].effect_flags.attachment_kind, "effect_generated");
});

Deno.test("UID transaction path fails before source mutation when identity is stale", () => {
  const match = state({ preAttached: false, sourceZone: "hand" });
  const player = (match.players as any)["1"];
  const exactSource = player.hand[0];
  throws(
    () => runtimeV02BeginExternalEssenceAttachmentRoute(
      match,
      1,
      "target-uid",
      "missing-essence-uid",
      "hand",
      "manual_essence",
      { attachment_kind: "normal", phase: "play", action_kind: "manual_essence" },
    ),
    "tcg_v0_2_attachment_route_source_missing",
  );
  equal(player.hand.length, 1);
  equal(player.hand[0], exactSource);
  equal(player.vanguard.essence.length, 0);
  equal(runtimeV02CurrentTurnEssenceAttachmentEvents(match, 1).length, 0);
});
