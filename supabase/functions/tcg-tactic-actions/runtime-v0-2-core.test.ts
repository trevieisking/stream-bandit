import {
  applyRuntimeCondition,
  clearRuntimeCondition,
  dealRuntimeEffectDamage,
  discardRuntimeDeckTop,
  hasRuntimeCondition,
  incrementRuntimeSourceCounter,
  moveRuntimeDamage,
  placeRuntimeDamage,
  recordRuntimeEvent,
  transferRuntimeShield,
} from "./runtime-v0-2-core.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

Deno.test("condition application respects slots and immunity", () => {
  const creature: any = { damage: 0, shield: 0, flags: {} };
  assert(applyRuntimeCondition(creature, "Stunned", 7, "apply_if_empty").applied, "Stunned should apply");
  assert(hasRuntimeCondition(creature, "Stunned"), "Stunned should be present");
  const blocked = applyRuntimeCondition(creature, "Dazed", 7, "apply_if_empty");
  assert(!blocked.applied && blocked.reason === "slot_occupied", "occupied control slot should block apply_if_empty");
  assert(clearRuntimeCondition(creature, "Stunned"), "Stunned should clear");

  creature.flags.lifecycle_condition_immunity = { turn_seq: 7, conditions: ["Venomed"] };
  const immune = applyRuntimeCondition(creature, "Venomed", 7);
  assert(immune.prevented && !immune.applied, "active immunity should prevent condition");
  assert(!hasRuntimeCondition(creature, "Venomed"), "prevented condition should not appear");

  const later = applyRuntimeCondition(creature, "Venomed", 8);
  assert(later.applied && hasRuntimeCondition(creature, "Venomed"), "expired turn immunity should not block later condition");
});

Deno.test("effect damage consumes Shield and reports only HP damage through", () => {
  const creature: any = { damage: 20, shield: 30 };
  const packet = dealRuntimeEffectDamage(creature, 50);
  assert(packet.requested === 50, "requested packet mismatch");
  assert(packet.shield_prevented === 30, "Shield prevention mismatch");
  assert(packet.actual_hp_damage === 20, "actual HP damage mismatch");
  assert(creature.shield === 0, "Shield should be consumed");
  assert(creature.damage === 40, "only actual HP damage should be added");
});

Deno.test("damage placement bypasses Shield", () => {
  const creature: any = { damage: 10, shield: 60 };
  const placed = placeRuntimeDamage(creature, 40);
  assert(placed === 40, "placed amount mismatch");
  assert(creature.damage === 50, "placement should add directly to accumulated damage");
  assert(creature.shield === 60, "placement must not consume Shield");
});

Deno.test("damage movement preserves amount and bypasses destination Shield", () => {
  const source: any = { damage: 70, shield: 0 };
  const destination: any = { damage: 10, shield: 50 };
  const moved = moveRuntimeDamage(source, destination, 40);
  assert(moved === 40, "moved amount mismatch");
  assert(source.damage === 30, "source damage should be removed");
  assert(destination.damage === 50, "destination should receive moved damage");
  assert(destination.shield === 50, "moved damage must not consume Shield");
});

Deno.test("damage movement caps at source damage", () => {
  const source: any = { damage: 20, shield: 0 };
  const destination: any = { damage: 0, shield: 0 };
  const moved = moveRuntimeDamage(source, destination, 60);
  assert(moved === 20, "movement must cap at available source damage");
  assert(source.damage === 0 && destination.damage === 20, "movement conservation mismatch");
});

Deno.test("Shield transfer caps at source amount and destination capacity", () => {
  const source: any = { damage: 0, shield: 50 };
  const destination: any = { damage: 0, shield: 45 };
  const moved = transferRuntimeShield(source, destination, 30);
  assert(moved === 15, "Shield transfer should stop at cap 60");
  assert(source.shield === 35, "source Shield mismatch");
  assert(destination.shield === 60, "destination Shield cap mismatch");
});

Deno.test("source counters are deterministic state rather than card-name flags", () => {
  const creature: any = { damage: 0, shield: 0, flags: {} };
  assert(incrementRuntimeSourceCounter(creature, "pressure", 2) === 2, "first counter increment mismatch");
  assert(incrementRuntimeSourceCounter(creature, "pressure", 3) === 5, "second counter increment mismatch");
  assert(creature.flags.effect_counters.pressure === 5, "counter state missing");
});

Deno.test("deck-top discard moves exact available cards to public discard", () => {
  const player: any = {
    deck: [
      { uid: "a", card_id: "a" },
      { uid: "b", card_id: "b" },
      { uid: "c", card_id: "c" },
    ],
    discard: [],
  };
  const moved = discardRuntimeDeckTop(player, 2);
  assert(moved.map((x: any) => x.uid).join(",") === "a,b", "wrong cards discarded from top");
  assert(player.deck.map((x: any) => x.uid).join(",") === "c", "remaining deck mismatch");
  assert(player.discard.map((x: any) => x.uid).join(",") === "a,b", "discard zone mismatch");
});

Deno.test("runtime events are structured and append-only", () => {
  const state: Record<string, unknown> = {};
  const first = recordRuntimeEvent(state, "damage_placed", { amount: 20 });
  const second = recordRuntimeEvent(state, "condition_application_prevented", { condition: "Venomed" });
  assert(first.event === "damage_placed", "first event mismatch");
  assert(second.event === "condition_application_prevented", "second event mismatch");
  assert(Array.isArray(state.effect_events) && (state.effect_events as any[]).length === 2, "event ledger mismatch");
});
