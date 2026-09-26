import {
  runtimeV02CreateActiveAbilityHandAttachmentDamageChoice,
  runtimeV02PendingActiveAbilityHandAttachmentDamageChoiceView,
  runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice,
  runtimeV02ResumeActiveAbilityHandAttachmentDamage,
  structuredRuntimeActiveAbilityHandAttachmentDamage,
} from "../_shared/tcg-match-active-ability-hand-attachment-damage-v0-2.ts";
import {
  runtimeV02RecordActiveAbilityUse,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function throws(fn: () => unknown, fragment: string) {
  try { fn(); } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}
function inst(uid: string, card_id: string) { return { uid, card_id }; }
function cr(uid: string, card_id: string, damage = 0) {
  return { stack: [inst(uid, card_id)], essence: [], relic: null, damage, shield: 0, flags: {} };
}
function creatureDef(id: string, element: string, ability: unknown = null) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Creature",
      element,
      creature: {
        stage: "Standalone",
        hp: 100,
        withdrawal: 0,
        reward_value: 1,
        ability,
        attacks: [],
      },
      essence: null,
      tactic: null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function essenceDef(id: string, element: string) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: "Essence",
      element,
      creature: null,
      tactic: null,
      essence: {
        subtype: "Basic",
        provides: [{ element, amount: 1 }],
        continuous: [],
        listeners: [],
      },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function ability() {
  return {
    id: "test-feed",
    name: "Test Feed",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: {
      all: [
        {
          predicate: "legal_card_available",
          controller: "self",
          zone: "hand",
          filters: {
            card_family: "Essence",
            essence_subtype: "Basic",
            element: "Ember",
          },
        },
        {
          predicate: "legal_card_available",
          controller: "self",
          zone: "field",
          filters: {
            card_family: "Creature",
            element: "Ember",
            damaged: true,
          },
        },
      ],
    },
    costs: [],
    steps: [
      {
        op: "SELECT_CREATURE",
        controller: "self",
        zone: "field",
        count: 1,
        filters: { element: "Ember", damaged: true },
        as: "feed_target",
      },
      {
        op: "ATTACH_ESSENCE_FROM_ZONE",
        player: "self",
        zone: "hand",
        selection: {
          min: 1,
          max: 1,
          filters: {
            card_family: "Essence",
            essence_subtype: "Basic",
            element: "Ember",
          },
        },
        target: "$feed_target",
      },
      {
        op: "DIRECT_DAMAGE",
        target: "$feed_target",
        amount: 10,
        damage_class: "effect",
      },
    ],
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 12,
    active_seat: 1,
    effect_events: [],
    players: {
      "1": {
        hand: [
          inst("ember-e", "ember-basic"),
          inst("tide-e", "tide-basic"),
        ],
        vanguard: cr("source", "test-source", 0),
        reserve: [
          cr("ember-target", "test-ember-target", 30),
          cr("ember-clean", "test-ember-clean", 0),
          cr("tide-target", "test-tide-target", 20),
          null,
        ],
      },
      "2": {
        hand: [],
        vanguard: cr("opp", "test-opp", 0),
        reserve: [null, null, null, null],
      },
    },
    card_index: {
      "test-source": creatureDef("test-source", "Ember", ability()),
      "test-ember-target": creatureDef("test-ember-target", "Ember"),
      "test-ember-clean": creatureDef("test-ember-clean", "Ember"),
      "test-tide-target": creatureDef("test-tide-target", "Tide"),
      "test-opp": creatureDef("test-opp", "Stone"),
      "ember-basic": essenceDef("ember-basic", "Ember"),
      "tide-basic": essenceDef("tide-basic", "Tide"),
    },
  } as Record<string, any>;
}
function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: inst("source", "test-source"),
  };
}

Deno.test("hand attachment + DIRECT_DAMAGE active Ability is recognized generically", () => {
  const s = state();
  equal(
    structuredRuntimeActiveAbilityHandAttachmentDamage(
      s,
      { card_id: "test-source" },
    ),
    {
      ability_id: "test-feed",
      timing: "own_turn",
      limit: { scope: "turn", count: 1, owner: "controller" },
      element: "Ember",
      target: {
        controller: "self",
        zone: "field",
        count: 1,
        damaged: true,
      },
      essence: {
        controller: "self",
        zone: "hand",
        card_family: "Essence",
        essence_subtype: "Basic",
        element: "Ember",
      },
      damage_step: {
        op: "DIRECT_DAMAGE",
        target: "$feed_target",
        amount: 10,
        damage_class: "effect",
      },
    },
  );
});

Deno.test("first private choice offers only damaged same-element friendly Creatures", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityHandAttachmentDamage(
    s,
    { card_id: "test-source" },
  )!;
  const pending = runtimeV02CreateActiveAbilityHandAttachmentDamageChoice(
    s,
    1,
    descriptor,
    source(),
    "target-choice",
  );
  equal(pending.stage, "target");
  equal(pending.options.map((option) => option.id), [
    "target:ember-target",
  ]);
  equal(
    runtimeV02PendingActiveAbilityHandAttachmentDamageChoiceView(pending, 2),
    {
      id: "target-choice",
      seat: 1,
      kind: "select_target_then_hand_essence_direct_damage",
      waiting: true,
    },
  );
});

Deno.test("target then Essence choices attach canonically before any direct damage", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityHandAttachmentDamage(
    s,
    { card_id: "test-source" },
  )!;
  const pending = runtimeV02CreateActiveAbilityHandAttachmentDamageChoice(
    s,
    1,
    descriptor,
    source(),
    "target-choice",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const targetResolved = runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
    pending,
    1,
    "target-choice",
    ["target:ember-target"],
    s,
  );
  if (targetResolved.stage !== "essence_choice_required") {
    throw new Error("essence choice required");
  }
  equal(
    targetResolved.pending_choice.options.map((option) => option.id),
    ["essence:ember-e"],
  );
  const beforeDamage = (s.players as any)["1"].reserve[0].damage;
  const attached = runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
    targetResolved.pending_choice,
    1,
    targetResolved.pending_choice.id,
    ["essence:ember-e"],
    s,
  );
  if (attached.stage !== "attachment_resolved") {
    throw new Error("attachment result required");
  }
  equal((s.players as any)["1"].hand.map((card:any) => card.uid), ["tide-e"]);
  equal((s.players as any)["1"].reserve[0].essence.map((card:any) => card.uid), ["ember-e"]);
  equal((s.players as any)["1"].reserve[0].damage, beforeDamage);
  equal(attached.attachment_flow.status, "complete");
});

Deno.test("post-attachment resume applies one canonical DIRECT_DAMAGE packet, then final resume is mutation-free", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityHandAttachmentDamage(
    s,
    { card_id: "test-source" },
  )!;
  const pending = runtimeV02CreateActiveAbilityHandAttachmentDamageChoice(
    s,
    1,
    descriptor,
    source(),
    "target-choice",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const targetResolved = runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
    pending,
    1,
    "target-choice",
    ["target:ember-target"],
    s,
  );
  if (targetResolved.stage !== "essence_choice_required") throw new Error("essence choice required");
  const attached = runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
    targetResolved.pending_choice,
    1,
    targetResolved.pending_choice.id,
    ["essence:ember-e"],
    s,
  );
  if (attached.stage !== "attachment_resolved") throw new Error("attachment result required");

  const damage = runtimeV02ResumeActiveAbilityHandAttachmentDamage(
    s,
    attached.resume,
  );
  if (damage.stage !== "direct_damage_resolved") {
    throw new Error("direct damage resolution required");
  }
  equal(damage.requested_amount, 10);
  equal(damage.final_amount, 10);
  equal(damage.actual_hp_damage, 10);
  equal((s.players as any)["1"].reserve[0].damage, 40);
  equal((s.effect_events as any[]).slice(-2).map((event) => event.event), [
    "before_damage_packet",
    "after_damage_packet",
  ]);

  const eventCount = (s.effect_events as any[]).length;
  const final = runtimeV02ResumeActiveAbilityHandAttachmentDamage(
    s,
    damage.resume,
  );
  equal(final.stage, "complete");
  equal(final.packet_id, damage.packet_id);
  equal((s.effect_events as any[]).length, eventCount);
  equal((s.players as any)["1"].reserve[0].damage, 40);
});

Deno.test("stale target fails before physical attachment or damage mutation", () => {
  const s = state();
  const descriptor = structuredRuntimeActiveAbilityHandAttachmentDamage(
    s,
    { card_id: "test-source" },
  )!;
  const pending = runtimeV02CreateActiveAbilityHandAttachmentDamageChoice(
    s,
    1,
    descriptor,
    source(),
    "target-choice",
  );
  runtimeV02RecordActiveAbilityUse(s, 1, descriptor.ability_id);
  const targetResolved = runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
    pending,
    1,
    "target-choice",
    ["target:ember-target"],
    s,
  );
  if (targetResolved.stage !== "essence_choice_required") throw new Error("essence choice required");
  (s.players as any)["1"].reserve[0].damage = 0;
  throws(
    () => runtimeV02ResolveActiveAbilityHandAttachmentDamageChoice(
      targetResolved.pending_choice,
      1,
      targetResolved.pending_choice.id,
      ["essence:ember-e"],
      s,
    ),
    "target_changed",
  );
  equal((s.players as any)["1"].hand.map((card:any) => card.uid), [
    "ember-e",
    "tide-e",
  ]);
  equal((s.players as any)["1"].reserve[0].essence, []);
  equal((s.effect_events as any[]).length, 0);
});
