import assert from "node:assert/strict";
import { runtimeV02BeginRelicAttachmentRoute } from "../_shared/tcg-match-relic-attachment-route-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

const schema = "sb-tcg-card-v0.2";
const effectSchema = "sb-tcg-effects-v0.2";
const inst = (uid: string, card_id: string) => ({ uid, card_id });

function layeredHide() {
  return {
    id: "layered-hide",
    name: "Layered Hide",
    mode: "triggered",
    event: "relic_attached",
    timing: "any_turn",
    limit: null,
    requirements: {
      all: [
        { predicate: "event_attachment_target_is_source" },
        { predicate: "target_damaged", target: "$source_creature" },
      ],
    },
    costs: [],
    steps: [{ op: "HEAL", target: "$source_creature", amount: 10 }],
  };
}

function creatureDef(id: string, ability: Record<string, unknown> | null = null) {
  return {
    schema,
    effect_schema: effectSchema,
    id,
    name: id,
    card_family: "Creature",
    element: "Stone",
    creature: { stage: "Baby", withdrawal: 1, ability, attacks: [] },
    essence: null,
    tactic: null,
  };
}

function relicDef(id: string) {
  return {
    schema,
    effect_schema: effectSchema,
    id,
    name: id,
    card_family: "Tactic",
    element: "Stone",
    creature: null,
    essence: null,
    tactic: {
      subtype: "Relic",
      program: { steps: [] },
      listeners: [],
      continuous: [],
    },
  };
}

function creature(uid: string, card_id: string, damage = 0) {
  return {
    stack: [inst(uid, card_id)],
    essence: [],
    relic: null,
    damage,
    shield: 0,
    conditions: {
      scorched: false,
      venomed: 0,
      control: null,
      modifier: null,
    },
    flags: {},
  };
}

function state() {
  const relic = inst("relic-uid", "test-relic");
  const flintkin = creature("flintkin-uid", "stone-flintkin", 20);
  const other = creature("other-uid", "stone-other", 20);
  const ownVanguard = creature("vanguard-uid", "stone-vanguard", 0);
  const opponent = creature("opponent-uid", "shade-opponent", 0);
  const definitions = [
    creatureDef("stone-flintkin", layeredHide()),
    creatureDef("stone-other"),
    creatureDef("stone-vanguard"),
    {
      ...creatureDef("shade-opponent"),
      element: "Shade",
    },
    relicDef("test-relic"),
  ];
  return {
    relic,
    flintkin,
    other,
    state: {
      turn_seq: 11,
      active_seat: 1,
      phase: "play",
      runtime_registry_v0_2: runtimeV02SnapshotMarker(),
      card_index: Object.fromEntries(
        definitions.map((definition) => [
          definition.id,
          { definition_v0_2: definition },
        ]),
      ),
      players: {
        "1": {
          hand: [relic],
          deck: [],
          discard: [],
          rewards: [],
          vanguard: ownVanguard,
          reserve: [flintkin, other, null, null],
          realm: null,
        },
        "2": {
          hand: [],
          deck: [],
          discard: [],
          rewards: [],
          vanguard: opponent,
          reserve: [null, null, null, null],
          realm: null,
        },
      },
      turn_flags: { "1": {}, "2": {} },
      effect_events: [],
    } as Record<string, unknown>,
  };
}

Deno.test("Relic Attachment route triggers Flintkin Layered Hide through generic event ownership", () => {
  const fixture = state();
  const result = runtimeV02BeginRelicAttachmentRoute(
    fixture.state,
    1,
    "flintkin-uid",
    fixture.relic.uid,
    "manual_relic",
    { phase: "play", action_kind: "manual_relic" },
  );

  assert.equal(fixture.flintkin.relic?.uid, "relic-uid");
  assert.equal(fixture.flintkin.damage, 10);
  assert.equal(result.listener_event.event, "relic_attached");
  assert.equal(result.listener_event.attachment_target_uid, "flintkin-uid");
  assert.equal(result.flow.status, "complete");
  assert.equal(result.flow.emitted_heal_packet_ids.length, 1);
  assert.equal(result.flow.processed_listener_keys.length, 1);
  assert.match(result.flow.processed_listener_keys[0], /layered-hide/);
});

Deno.test("Relic Attachment route rejects Flintkin Layered Hide when a different Creature receives the Relic", () => {
  const fixture = state();
  const result = runtimeV02BeginRelicAttachmentRoute(
    fixture.state,
    1,
    "other-uid",
    fixture.relic.uid,
    "manual_relic",
    { phase: "play", action_kind: "manual_relic" },
  );

  assert.equal(fixture.other.relic?.uid, "relic-uid");
  assert.equal(fixture.flintkin.damage, 20);
  assert.equal(fixture.other.damage, 20);
  assert.equal(result.flow.status, "complete");
  assert.equal(result.flow.emitted_heal_packet_ids.length, 0);
  assert.equal(result.flow.processed_listener_keys.length, 0);
});
