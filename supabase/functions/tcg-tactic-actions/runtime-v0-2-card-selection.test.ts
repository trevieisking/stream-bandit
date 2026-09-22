import {
  runtimeV02CardSelectionOptions,
  runtimeV02NormalizeSelectCardsStep,
  runtimeV02RebindSelectedCards,
  runtimeV02ResolveSelectCards,
} from "../_shared/tcg-match-card-selection-v0-2.ts";
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
function definition(id: string, family: string, element: string, subtype: string | null = null) {
  return {
    card_id: id,
    definition_v0_2: {
      schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      id,
      name: id,
      card_family: family,
      element,
      creature: null,
      tactic: family === "Tactic" ? { subtype, program: null, listeners: [], continuous: [] } : null,
      essence: family === "Essence" ? { subtype, provides: [], continuous: [], listeners: [] } : null,
    },
    definition_v0_2_rules_version: "sb-tcg-card-v0.2",
  };
}
function state() {
  return {
    runtime_registry_v0_2: runtimeV02SnapshotMarker(),
    card_index: {
      "device-a": definition("device-a", "Tactic", "Grove", "Device"),
      "device-b": definition("device-b", "Tactic", "Volt", "Device"),
      "ally-a": definition("ally-a", "Tactic", "Grove", "Ally"),
      "volt-basic": definition("volt-basic", "Essence", "Volt", "Basic"),
      "tide-basic": definition("tide-basic", "Essence", "Tide", "Basic"),
    },
    players: {
      "1": {
        discard: [
          { uid: "d1", card_id: "device-a" },
          { uid: "d2", card_id: "device-b" },
          { uid: "a1", card_id: "ally-a" },
          { uid: "v1", card_id: "volt-basic" },
          { uid: "t1", card_id: "tide-basic" },
        ],
      },
      "2": { discard: [] },
    },
  } as Record<string, any>;
}

Deno.test("SELECT_CARDS owner freezes discard selection grammar and Device filters", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeSelectCardsStep({
    op: "SELECT_CARDS",
    player: "self",
    zone: "discard",
    selection: {
      min: 0,
      max: 2,
      filters: { card_family: "Tactic", tactic_subtype: "Device" },
    },
    as: "foraged",
  });
  equal(descriptor, {
    player: "self",
    zone: "discard",
    min: 0,
    max: 2,
    filters: { card_family: "Tactic", tactic_subtype: "Device" },
    as: "foraged",
  });
  equal(
    runtimeV02CardSelectionOptions(s, 1, descriptor).map((option) => option.id),
    ["card:d1", "card:d2"],
  );
});

Deno.test("SELECT_CARDS owner filters Basic element Essence generically", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeSelectCardsStep({
    op: "SELECT_CARDS",
    player: "self",
    zone: "discard",
    selection: {
      min: 1,
      max: 1,
      filters: {
        card_family: "Essence",
        essence_subtype: "Basic",
        element: "Volt",
      },
    },
    as: "charge",
  });
  const options = runtimeV02CardSelectionOptions(s, 1, descriptor);
  equal(options.map((option) => option.ref), [{
    uid: "v1",
    card_id: "volt-basic",
    zone_owner_seat: 1,
    zone: "discard",
  }]);
});

Deno.test("SELECT_CARDS resolution rebinds exact current zone identity and filters before continuation", () => {
  const s = state();
  const descriptor = runtimeV02NormalizeSelectCardsStep({
    op: "SELECT_CARDS",
    player: "self",
    zone: "discard",
    selection: {
      min: 0,
      max: 2,
      filters: { card_family: "Tactic", tactic_subtype: "Device" },
    },
    as: "foraged",
  });
  const refs = runtimeV02CardSelectionOptions(s, 1, descriptor).map((option) => option.ref);
  equal(runtimeV02ResolveSelectCards(s, 1, descriptor, refs), refs);

  (s.players as any)["1"].discard = (s.players as any)["1"].discard.filter((card:any) => card.uid !== "d2");
  throws(
    () => runtimeV02ResolveSelectCards(s, 1, descriptor, refs),
    "card_stale",
  );
});

Deno.test("selected-card rebind rejects stale card-id reuse and duplicate refs", () => {
  const s = state();
  const ref = {
    uid: "d1",
    card_id: "device-a",
    zone_owner_seat: 1 as const,
    zone: "discard" as const,
  };
  equal(runtimeV02RebindSelectedCards(s, [ref]), [ref]);
  throws(
    () => runtimeV02RebindSelectedCards(s, [{ ...ref, card_id: "device-b" }]),
    "card_stale",
  );
  throws(
    () => runtimeV02RebindSelectedCards(s, [ref, ref]),
    "ref_duplicate",
  );
});

Deno.test("SELECT_CARDS grammar fails closed outside the frozen discard/filter family", () => {
  throws(
    () => runtimeV02NormalizeSelectCardsStep({
      op: "SELECT_CARDS",
      player: "self",
      zone: "hand",
      selection: { min: 0, max: 1, filters: {} },
      as: "x",
    }),
    "zone_unsupported",
  );
  throws(
    () => runtimeV02NormalizeSelectCardsStep({
      op: "SELECT_CARDS",
      player: "self",
      zone: "discard",
      selection: { min: 0, max: 1, filters: { mystery: true } },
      as: "x",
    }),
    "filter_unsupported",
  );
});
