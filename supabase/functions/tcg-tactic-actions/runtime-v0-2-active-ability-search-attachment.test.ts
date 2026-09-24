import { assertEquals, assertThrows } from "jsr:@std/assert";
import {
  runtimeV02CurrentTurnActiveAbilityUseCount,
} from "../_shared/tcg-match-active-ability-choice-v0-2.ts";
import {
  runtimeV02CreateActiveAbilityLiveChoice,
  runtimeV02PendingActiveAbilityLiveChoiceView,
  runtimeV02ResolveActiveAbilityLiveChoice,
} from "../_shared/tcg-match-active-ability-live-v0-2.ts";
import {
  runtimeV02ResumeSearchSelectionAttachment,
  structuredRuntimeSearchSelectionAttachmentActiveAbility,
} from "../_shared/tcg-match-active-ability-search-attachment-v0-2.ts";
import {
  runtimeV02CurrentTurnHiddenInformationViews,
} from "../_shared/tcg-match-hidden-information-v0-2.ts";
import { runtimeV02SnapshotMarker } from "../_shared/tcg-runtime-registry-v0-2.ts";

function card(uid: string, card_id: string) {
  return { uid, card_id };
}

function envelope(
  id: string,
  name: string,
  cardFamily: string,
  element: string | null,
) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name,
    card_family: cardFamily,
    ...(element ? { element } : {}),
    traits: [],
  };
}

function searchAttachmentAbility() {
  return {
    id: "search-new-element",
    name: "Search New Element",
    mode: "active",
    event: null,
    timing: "own_turn",
    limit: { scope: "turn", count: 1, owner: "controller" },
    requirements: [{ predicate: "source_is_current_friendly_vanguard" }],
    costs: [],
    steps: [
      {
        op: "SEARCH_DECK",
        player: "self",
        reveal: "public",
        selection: {
          min: 0,
          max: 1,
          filters: {
            card_family: "Essence",
            essence_subtype: "Basic",
            element_not_in_query: {
              query: "attached_essence_elements",
              target: "$source_creature",
              distinct: true,
              allowed_elements: ["Astral", "Ember", "Volt"],
            },
          },
        },
        declared_target_count: 1,
        hidden_fail_allowed: true,
        destination: "effect_owned_selection",
        as: "new_essence",
      },
      {
        op: "ATTACH_ESSENCE_FROM_SELECTION",
        cards: "$new_essence",
        target: "$source_creature",
        manual_attachment: false,
        attachment_state: {
          kind: "normal",
          expires: "none",
          destination_on_expire: "none",
        },
      },
      { op: "SHUFFLE_DECK", player: "self" },
    ],
  };
}

function creature(
  uid: string,
  cardId: string,
  essence: Array<{ uid: string; card_id: string }> = [],
) {
  return {
    stack: [card(uid, cardId)],
    essence,
    relic: null,
    damage: 0,
    shield: 0,
    flags: {},
  };
}

function essenceDefinition(id: string, element: string) {
  return {
    card_id: id,
    definition_v0_2: {
      ...envelope(id, id, "Essence", element),
      creature: null,
      tactic: null,
      essence: {
        subtype: "Basic",
        provides: [{ element, amount: 1 }],
        attach_requirements: [],
        on_attach: [],
        continuous: [],
        listeners: [],
        lifecycle: null,
      },
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}

function state() {
  const sourceId = "test-search-attachment-source";
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    turn_seq: 44,
    active_seat: 1,
    phase: "play",
    effect_events: [],
    pending_resolutions: [],
    players: {
      "1": {
        vanguard: creature(
          "source-uid",
          sourceId,
          [card("astral-attached-uid", "astral-basic")],
        ),
        reserve: [null, null, null, null],
        deck: [
          card("astral-deck-uid", "astral-basic"),
          card("ember-deck-uid", "ember-basic"),
          card("other-deck-uid", "other-tactic"),
        ],
        hand: [],
        discard: [],
        rewards: [],
      },
      "2": {
        vanguard: null,
        reserve: [null, null, null, null],
        deck: [],
        hand: [],
        discard: [],
        rewards: [],
      },
    },
    card_index: {
      [sourceId]: {
        card_id: sourceId,
        definition_v0_2: {
          ...envelope(sourceId, "Search Source", "Creature", "Astral"),
          creature: {
            stage: "Standalone",
            hp: 200,
            withdrawal: 2,
            reward_value: 1,
            ability: searchAttachmentAbility(),
            attacks: [],
          },
          essence: null,
          tactic: null,
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
      "astral-basic": essenceDefinition("astral-basic", "Astral"),
      "ember-basic": essenceDefinition("ember-basic", "Ember"),
      "other-tactic": {
        card_id: "other-tactic",
        definition_v0_2: {
          ...envelope("other-tactic", "Other Tactic", "Tactic", "Volt"),
          creature: null,
          essence: null,
          tactic: {
            subtype: "Device",
            requirements: null,
            program: [],
            listeners: [],
            continuous: [],
          },
        },
        definition_v0_2_rules_version: "sb-tcg-card-v0.2",
      },
    },
  } as Record<string, unknown> & any;
}

function source() {
  return {
    where: "vanguard" as const,
    index: null,
    instance: card("source-uid", "test-search-attachment-source"),
  };
}

Deno.test("search-selection attachment descriptor is operation-shaped and preserves logical effect-owned selection", () => {
  const descriptor = structuredRuntimeSearchSelectionAttachmentActiveAbility(
    state(),
    { card_id: "test-search-attachment-source" },
  );
  if (!descriptor) throw new Error("descriptor required");
  assertEquals(descriptor.ability_id, "search-new-element");
  assertEquals(descriptor.search.destination, "effect_owned_selection");
  assertEquals(descriptor.search.as, "new_essence");
  assertEquals(descriptor.attach.cards, "$new_essence");
  assertEquals(descriptor.attach.attachment_kind, "normal");
  assertEquals(descriptor.shuffle, { player: "self" });
});

Deno.test("search-selection attachment requirement rejects a non-Vanguard source before consuming the turn limit", () => {
  const s = state();
  assertThrows(
    () => runtimeV02CreateActiveAbilityLiveChoice(
      s,
      1,
      {
        where: "reserve" as const,
        index: 0,
        instance: card("source-uid", "test-search-attachment-source"),
      },
      "reserve-source-choice",
    ),
    Error,
    "tcg_v0_2_search_attachment_source_must_be_vanguard",
  );
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "search-new-element"),
    0,
  );
});

Deno.test("live active-Ability search choice is private and excludes already-attached Essence elements", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    source(),
    "search-choice",
  );
  if (!pending || pending.kind !== "search_attach_essence_from_selection") {
    throw new Error("search attachment choice required");
  }
  assertEquals(
    runtimeV02CurrentTurnActiveAbilityUseCount(s, 1, "search-new-element"),
    1,
  );
  assertEquals(
    runtimeV02PendingActiveAbilityLiveChoiceView(pending, 2),
    {
      id: "search-choice",
      seat: 1,
      kind: "search_attach_essence_from_selection",
      waiting: true,
    },
  );
  assertEquals(
    runtimeV02PendingActiveAbilityLiveChoiceView(pending, 1),
    {
      id: "search-choice",
      seat: 1,
      kind: "search_attach_essence_from_selection",
      prompt: "Search your deck for up to one eligible Basic Essence",
      min: 0,
      max: 1,
      options: [{ id: "card:ember-deck-uid", label: "ember-basic", card_id: "ember-basic" }],
    },
  );
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(s, 1), [
    { turn_seq: 44, controller_seat: 1, zone: "deck" },
  ]);
  assertEquals(runtimeV02CurrentTurnHiddenInformationViews(s, 2), []);
});

Deno.test("selected searched Essence remains physically in deck until owner #22 attaches it", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    source(),
    "attach-choice",
  );
  if (!pending || pending.kind !== "search_attach_essence_from_selection") {
    throw new Error("search attachment choice required");
  }
  assertEquals(
    s.players["1"].deck.map((entry: any) => entry.uid),
    ["astral-deck-uid", "ember-deck-uid", "other-deck-uid"],
  );

  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "attach-choice",
    ["card:ember-deck-uid"],
    s,
  );
  if (
    resolved.kind !== "search_selection_attachment" ||
    resolved.stage !== "attachment_resolved"
  ) {
    throw new Error("attachment resolution required");
  }
  assertEquals(resolved.attachment_flow.status, "complete");
  assertEquals(
    s.players["1"].vanguard.essence.map((entry: any) => entry.uid),
    ["astral-attached-uid", "ember-deck-uid"],
  );
  assertEquals(
    s.players["1"].deck.map((entry: any) => entry.uid).sort(),
    ["astral-deck-uid", "other-deck-uid"],
  );
  assertEquals(resolved.resume.kind, "search_selection_attachment_after_attachment");

  const resumed = runtimeV02ResumeSearchSelectionAttachment(s, resolved.resume);
  assertEquals(resumed, {
    kind: "search_selection_attachment_after_attachment",
    ability_id: "search-new-element",
    selected_essence_count: 1,
    attached_essence_count: 1,
    shuffled: true,
  });
  assertEquals(
    s.players["1"].deck.map((entry: any) => entry.uid).sort(),
    ["astral-deck-uid", "other-deck-uid"],
  );
});

Deno.test("zero-selection search path shuffles without attaching", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    source(),
    "zero-choice",
  );
  if (!pending || pending.kind !== "search_attach_essence_from_selection") {
    throw new Error("search attachment choice required");
  }
  const resolved = runtimeV02ResolveActiveAbilityLiveChoice(
    pending,
    1,
    "zero-choice",
    [],
    s,
  );
  assertEquals(resolved, {
    kind: "search_selection_attachment",
    stage: "complete",
    ability_id: "search-new-element",
    selected_essence_count: 0,
    attached_essence_count: 0,
    shuffled: true,
    emitted_packet_ids: [],
  });
  assertEquals(
    s.players["1"].vanguard.essence.map((entry: any) => entry.uid),
    ["astral-attached-uid"],
  );
  assertEquals(
    s.players["1"].deck.map((entry: any) => entry.uid).sort(),
    ["astral-deck-uid", "ember-deck-uid", "other-deck-uid"],
  );
});

Deno.test("search-selection attachment rejects a selected card that becomes dynamically ineligible before mutation", () => {
  const s = state();
  const pending = runtimeV02CreateActiveAbilityLiveChoice(
    s,
    1,
    source(),
    "stale-choice",
  );
  if (!pending || pending.kind !== "search_attach_essence_from_selection") {
    throw new Error("search attachment choice required");
  }
  s.players["1"].vanguard.essence.push(card("ember-new-attached", "ember-basic"));
  assertThrows(
    () => runtimeV02ResolveActiveAbilityLiveChoice(
      pending,
      1,
      "stale-choice",
      ["card:ember-deck-uid"],
      s,
    ),
    Error,
    "selected_card_changed",
  );
  assertEquals(
    s.players["1"].deck.map((entry: any) => entry.uid),
    ["astral-deck-uid", "ember-deck-uid", "other-deck-uid"],
  );
});
