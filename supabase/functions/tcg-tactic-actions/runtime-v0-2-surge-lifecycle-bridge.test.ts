import {
  applyStructuredRuntimeEssenceAttachmentLifecycle,
  clearStructuredRuntimeAttachmentAttackBonusesAtAftermath,
  structuredRuntimeAftermathEssenceDisposition,
  structuredRuntimeAttachmentAttackBonus,
} from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const surgeDefinition = {
  schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  id: "volt-surge-essence",
  name: "Surge Essence",
  card_family: "Essence",
  element: "Volt",
  essence: {
    subtype: "Special",
    provides: [{ element: "Volt", amount: 1 }],
    attach_requirements: [],
    on_attach: [],
    listeners: [{
      id: "surge-attach-burst",
      event: "essence_attached",
      requirements: {
        all: [
          { predicate: "source_is_self" },
          { predicate: "event_origin_zone_is", zone: "hand" },
          { predicate: "target_element_is", target: "$attached_creature", element: "Volt" },
        ],
      },
      limit: null,
      steps: [{
        op: "ADD_ATTACK_DAMAGE_MODIFIER",
        target: "$attached_creature",
        amount: 20,
        duration: { expires_on: ["end_of_turn"], max_uses: null },
      }],
    }],
    continuous: [],
    lifecycle: {
      on_attach_set_state: {
        kind: "temporary",
        expires: "controller_aftermath",
        destination_on_expire: "discard",
      },
    },
  },
  creature: null,
  tactic: null,
};

const basicDefinition = {
  schema: "sb-tcg-card-v0.2",
  effect_schema: "sb-tcg-effects-v0.2",
  id: "volt-basic-essence",
  name: "Volt Essence",
  card_family: "Essence",
  element: "Volt",
  essence: { subtype: "Basic", provides: [{ element: "Volt", amount: 1 }], attach_requirements: [], on_attach: [], listeners: [], continuous: [], lifecycle: null },
  creature: null,
  tactic: null,
};

function structuredState(extra: Record<string, any> = {}) {
  const definitions: Record<string, any> = {
    "volt-surge-essence": surgeDefinition,
    "volt-basic-essence": basicDefinition,
    ...extra,
  };
  const card_index: Record<string, any> = {};
  for (const [id, definition_v0_2] of Object.entries(definitions)) {
    card_index[id] = { definition: { id }, definition_v0_2, definition_v0_2_rules_version: "sb-tcg-card-v0.2" };
  }
  return {
    runtime_registry_v0_2: {
      registry_id: "SB1-set-one-v0.2",
      set_code: "SB1",
      card_schema: "sb-tcg-card-v0.2",
      effect_schema: "sb-tcg-effects-v0.2",
      card_count: 193,
      registry_sha256: "8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f",
      runtime_authority: false,
      source: "match_initialization_snapshot",
    },
    card_index,
  } as Record<string, unknown>;
}

Deno.test("legacy-only match keeps Surge lifecycle resolver on legacy fallback", () => {
  const state: Record<string, unknown> = { card_index: { "volt-surge-essence": { definition: { id: "volt-surge-essence" } } } };
  const creature: any = { essence: [], flags: {} };
  const surge: any = { uid: "surge-1", card_id: "volt-surge-essence", attached_turn: 7 };
  const result = applyStructuredRuntimeEssenceAttachmentLifecycle(state, creature, surge, "Volt", "hand", 7);
  assert(result === null, "legacy match must stay on fallback");
  assert(structuredRuntimeAttachmentAttackBonus(state, creature, 7) === null, "legacy attack bonus must stay on fallback");
  assert(structuredRuntimeAftermathEssenceDisposition(state, surge, 7) === null, "legacy aftermath must stay on fallback");
});

Deno.test("structured Surge grants +20 on hand attachment to a Volt creature and owns state by Inst.uid", () => {
  const state = structuredState();
  const creature: any = { essence: [], flags: {} };
  const surge: any = { uid: "surge-uid-42", card_id: "volt-surge-essence", attached_turn: 12 };
  creature.essence.push(surge);
  const result = applyStructuredRuntimeEssenceAttachmentLifecycle(state, creature, surge, "Volt", "hand", 12);
  assert(result?.attack_bonus === 20, "Surge should grant +20 on valid Volt hand attachment");
  assert(result?.lifecycle_registered === true, "Surge lifecycle should register");
  const modifier = creature.flags.runtime_v0_2_attack_modifiers?.[0];
  assert(modifier?.source_uid === "surge-uid-42", "attack modifier must be owned by the exact Surge instance uid");
  assert(modifier?.amount === 20 && modifier?.turn_seq === 12, "attack modifier payload mismatch");
  const lifecycle = surge.effect_flags?.runtime_v0_2_attachment_lifecycle;
  assert(lifecycle?.source_uid === "surge-uid-42", "lifecycle state must be owned by the exact Surge instance uid");
  assert(lifecycle?.expires === "controller_aftermath" && lifecycle?.destination_on_expire === "discard", "lifecycle expiry mismatch");
  assert(structuredRuntimeAttachmentAttackBonus(state, creature, 12) === 20, "structured attack should receive Surge +20");
});

Deno.test("structured Surge on non-Volt target gets no burst but still remains temporary", () => {
  const state = structuredState();
  const creature: any = { essence: [], flags: {} };
  const surge: any = { uid: "surge-nonvolt", card_id: "volt-surge-essence", attached_turn: 3 };
  creature.essence.push(surge);
  const result = applyStructuredRuntimeEssenceAttachmentLifecycle(state, creature, surge, "Stone", "hand", 3);
  assert(result?.attack_bonus === 0, "non-Volt target must not get Surge burst");
  assert(result?.lifecycle_registered === true, "Surge lifecycle is unconditional on target element");
  assert(structuredRuntimeAftermathEssenceDisposition(state, surge, 3) === "discard", "temporary Surge should still discard at controller Aftermath");
});

Deno.test("structured Surge bonus expires and cleanup removes only current-turn modifiers", () => {
  const state = structuredState();
  const creature: any = { essence: [], flags: {} };
  const surge: any = { uid: "surge-clean", card_id: "volt-surge-essence", attached_turn: 9 };
  creature.essence.push(surge);
  applyStructuredRuntimeEssenceAttachmentLifecycle(state, creature, surge, "Volt", "hand", 9);
  creature.flags.runtime_v0_2_attack_modifiers.push({ source_uid: "future", amount: 30, turn_seq: 10, expires_on: ["end_of_turn"], max_uses: null });
  assert(structuredRuntimeAttachmentAttackBonus(state, creature, 9) === 20, "current turn Surge bonus mismatch");
  assert(clearStructuredRuntimeAttachmentAttackBonusesAtAftermath(state, creature, 9) === true, "current-turn modifier should be cleared");
  assert(structuredRuntimeAttachmentAttackBonus(state, creature, 9) === 0, "expired Surge bonus must not remain");
  assert(structuredRuntimeAttachmentAttackBonus(state, creature, 10) === 30, "future-turn modifier must not be removed by earlier cleanup");
});

Deno.test("structured Aftermath discards the exact Surge instance from any field zone only on its registered turn", () => {
  const state = structuredState();
  const creature: any = { essence: [], flags: {} };
  const surge: any = { uid: "reserve-surge", card_id: "volt-surge-essence", attached_turn: 22 };
  creature.essence.push(surge);
  applyStructuredRuntimeEssenceAttachmentLifecycle(state, creature, surge, "Volt", "hand", 22);
  assert(structuredRuntimeAftermathEssenceDisposition(state, surge, 21) === "keep", "Surge must not expire before its registered Aftermath");
  assert(structuredRuntimeAftermathEssenceDisposition(state, surge, 22) === "discard", "Surge must discard at its controller Aftermath regardless of field slot");
  const basic: any = { uid: "basic-1", card_id: "volt-basic-essence", attached_turn: 22 };
  assert(structuredRuntimeAftermathEssenceDisposition(state, basic, 22) === "keep", "ordinary Essence must remain attached");
});

Deno.test("marked structured Surge lifecycle fails closed if source-owned lifecycle state is missing or snapshot is mixed", () => {
  const state = structuredState();
  const surge: any = { uid: "broken-surge", card_id: "volt-surge-essence", attached_turn: 5 };
  let missingState = false;
  try {
    structuredRuntimeAftermathEssenceDisposition(state, surge, 5);
  } catch (error) {
    missingState = String(error).includes("tcg_v0_2_attachment_lifecycle_state_missing:broken-surge");
  }
  assert(missingState, "structured lifecycle must fail closed when source-owned state is absent");

  const mixed = structuredState();
  (mixed.card_index as any)["volt-basic-essence"].definition_v0_2 = null;
  let mixedFailed = false;
  try {
    applyStructuredRuntimeEssenceAttachmentLifecycle(mixed, { essence: [], flags: {} }, { uid: "surge-mixed", card_id: "volt-surge-essence" }, "Volt", "hand", 5);
  } catch (error) {
    mixedFailed = String(error).includes("tcg_v0_2_snapshot_definition_missing:volt-basic-essence");
  }
  assert(mixedFailed, "mixed marked snapshot must fail closed");
});
