import {
  applyRuntimeCondition,
  applyRuntimeContinuousNumericModifiers,
  clearRuntimeCondition,
  dealRuntimeEffectDamage,
  discardRuntimeDeckTop,
  hasRuntimeCondition,
  incrementRuntimeSourceCounter,
  moveRuntimeDamage,
  placeRuntimeDamage,
  recordRuntimeEvent,
  runtimeContinuousBlocksSource,
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

Deno.test("attached continuous withdrawal math is data-driven and respects filters and floor", () => {
  const definitions: Record<string, any> = {
    reducer_filtered: {
      essence: { continuous: [{ kind: "withdrawal", target: "$attached_creature", amount: -1, minimum: 0, filters: { action_kind: "voluntary_withdrawal" } }] },
    },
    reducer: {
      essence: { continuous: [{ kind: "withdrawal", target: "$attached_creature", mode: "delta", amount: -1, minimum: 0, filters: {} }] },
    },
    increaser: {
      essence: { continuous: [{ kind: "withdrawal", target: "$attached_creature", amount: 1, minimum: 0, filters: {} }] },
    },
  };
  const lookup = (instance: any) => definitions[instance.card_id];
  const attachments = [
    { uid: "a", card_id: "reducer_filtered" },
    { uid: "b", card_id: "reducer" },
    { uid: "c", card_id: "increaser" },
  ];

  const voluntary = applyRuntimeContinuousNumericModifiers(3, attachments, lookup, "withdrawal", { action_kind: "voluntary_withdrawal" });
  assert(voluntary === 2, "structured voluntary withdrawal modifiers should compose to 2");

  const otherAction = applyRuntimeContinuousNumericModifiers(3, attachments, lookup, "withdrawal", { action_kind: "forced_switch" });
  assert(otherAction === 3, "action-kind filter should exclude only the filtered reducer");

  const floored = applyRuntimeContinuousNumericModifiers(0, attachments.slice(0, 2), lookup, "withdrawal", { action_kind: "voluntary_withdrawal" });
  assert(floored === 0, "withdrawal modifiers must respect the non-negative floor");
});

Deno.test("incoming attack damage modifiers apply from structured attached data", () => {
  const definitions: Record<string, any> = {
    armour: {
      essence: { continuous: [{ kind: "incoming_attack_damage", target: "$attached_creature", amount: -10, filters: { source_controller: "opponent" } }] },
    },
  };
  const lookup = (instance: any) => definitions[instance.card_id];
  const attachments = [{ uid: "a", card_id: "armour" }];

  const opposing = applyRuntimeContinuousNumericModifiers(80, attachments, lookup, "incoming_attack_damage", { source_controller: "opponent" });
  assert(opposing === 70, "opposing attack damage should be reduced by structured armour");

  const friendly = applyRuntimeContinuousNumericModifiers(80, attachments, lookup, "incoming_attack_damage", { source_controller: "self" });
  assert(friendly === 80, "source-controller filter must fail closed for non-opponent damage");
});

Deno.test("conditional continuous modifiers fail closed without a server predicate evaluator", () => {
  const definitions: Record<string, any> = {
    pressure: {
      essence: {
        continuous: [{
          kind: "attack_damage",
          target: "$attached_creature",
          when: { predicate: "target_has_any_condition", target: "$current_opponent_vanguard" },
          amount: 10,
          filters: { target_zone: "vanguard", target_controller: "opponent" },
        }],
      },
    },
  };
  const lookup = (instance: any) => definitions[instance.card_id];
  const attachments = [{ uid: "p", card_id: "pressure" }];
  const baseContext = { target_zone: "vanguard", target_controller: "opponent" };

  const noEvaluator = applyRuntimeContinuousNumericModifiers(100, attachments, lookup, "attack_damage", baseContext);
  assert(noEvaluator === 100, "conditional modifier must not execute without server predicate authority");

  const approved = applyRuntimeContinuousNumericModifiers(100, attachments, lookup, "attack_damage", {
    ...baseContext,
    evaluate_when: (when: any) => when?.predicate === "target_has_any_condition",
  });
  assert(approved === 110, "approved server predicate should activate structured attack modifier");

  const wrongZone = applyRuntimeContinuousNumericModifiers(100, attachments, lookup, "attack_damage", {
    target_zone: "reserve",
    target_controller: "opponent",
    evaluate_when: () => true,
  });
  assert(wrongZone === 100, "structured filter mismatch must fail closed");
});

Deno.test("source-blocking continuous effects require matching source and server predicate", () => {
  const definitions: Record<string, any> = {
    immunity: {
      essence: {
        continuous: [{
          kind: "withdrawal_increase_immunity",
          target: "$attached_creature",
          when: { predicate: "target_element_is", target: "$attached_creature", element: "Stone" },
          filters: { blocked_sources: ["opponent_card_effect", "opponent_condition"] },
        }],
      },
    },
  };
  const lookup = (instance: any) => definitions[instance.card_id];
  const attachments = [{ uid: "i", card_id: "immunity" }];

  assert(!runtimeContinuousBlocksSource(attachments, lookup, "withdrawal_increase_immunity", "opponent_condition"), "conditional immunity must fail closed without evaluator");
  assert(runtimeContinuousBlocksSource(attachments, lookup, "withdrawal_increase_immunity", "opponent_condition", { evaluate_when: () => true }), "matching blocked source should be rejected when predicate passes");
  assert(!runtimeContinuousBlocksSource(attachments, lookup, "withdrawal_increase_immunity", "self_card_effect", { evaluate_when: () => true }), "unlisted source category must not be blocked");
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
