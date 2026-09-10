import {
  registerStructuredRuntimeEssenceAttachmentLifecycleState,
  structuredRuntimeAftermathEssenceDisposition,
} from "../_shared/tcg-match-surge-lifecycle-v0-2.ts";

function equal(actual: unknown, expected: unknown, message = "values differ"): void {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
}

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

function definition(id: string, lifecycle: Record<string, unknown> | null) {
  return {
    schema: "sb-tcg-card-v0.2",
    effect_schema: "sb-tcg-effects-v0.2",
    id,
    name: id,
    card_family: "Essence",
    element: "Volt",
    creature: null,
    essence: {
      subtype: "Special",
      provides: [{ element: "Volt", amount: 1 }],
      attach_requirements: [],
      on_attach: [],
      listeners: [],
      continuous: [],
      lifecycle,
    },
    tactic: null,
  };
}

function state(): Record<string, unknown> {
  const temporary = definition("temporary-essence", {
    on_attach_set_state: {
      kind: "temporary",
      expires: "controller_aftermath",
      destination_on_expire: "discard",
    },
  });
  const ordinary = definition("ordinary-essence", null);
  return {
    runtime_registry_v0_2: { ...marker },
    card_index: {
      "temporary-essence": { definition_v0_2: temporary },
      "ordinary-essence": { definition_v0_2: ordinary },
    },
  };
}

Deno.test("lifecycle-only attachment registration preserves temporary disposition without executing listener effects", () => {
  const match = state();
  const attached: any = { uid: "temp-uid", card_id: "temporary-essence", attached_turn: 12 };
  const registered = registerStructuredRuntimeEssenceAttachmentLifecycleState(match, attached, 12);
  equal(registered, true);
  equal(attached.effect_flags.runtime_v0_2_attachment_lifecycle.source_uid, "temp-uid");
  equal(attached.effect_flags.runtime_v0_2_attachment_lifecycle.attached_turn, 12);
  equal(structuredRuntimeAftermathEssenceDisposition(match, attached, 12), "discard");
});

Deno.test("ordinary structured Essence has no lifecycle state and remains attached", () => {
  const match = state();
  const attached: any = { uid: "ordinary-uid", card_id: "ordinary-essence", attached_turn: 12 };
  equal(registerStructuredRuntimeEssenceAttachmentLifecycleState(match, attached, 12), false);
  equal(attached.effect_flags, undefined);
  equal(structuredRuntimeAftermathEssenceDisposition(match, attached, 12), "keep");
});
