import { assertEquals, assertThrows } from "jsr:@std/assert";
import { runtimeV02NormalizeEffectAttachmentState } from "../_shared/tcg-match-essence-attachment-state-v0-2.ts";

Deno.test("effect attachment state defaults to normal ownership metadata", () => {
  assertEquals(runtimeV02NormalizeEffectAttachmentState(null), {
    state: null,
    transaction: { attachment_kind: "normal" },
  });
});

for (const kind of ["temporary", "borrowed"] as const) {
  Deno.test(`effect attachment state accepts ${kind} controller-AFTERMATH discard`, () => {
    assertEquals(runtimeV02NormalizeEffectAttachmentState({
      kind,
      expires: "controller_aftermath",
      destination_on_expire: "discard",
    }), {
      state: {
        kind,
        expires: "controller_aftermath",
        destination_on_expire: "discard",
      },
      transaction: {
        attachment_kind: kind,
        effect_flags: {
          discard_during_target_aftermath: true,
          runtime_v0_2_effect_attachment_state: {
            kind,
            expires: "controller_aftermath",
            destination_on_expire: "discard",
          },
        },
      },
    });
  });
}

Deno.test("effect attachment state fails closed on undeclared grammar", () => {
  assertThrows(
    () => runtimeV02NormalizeEffectAttachmentState({
      kind: "loaned",
      expires: "controller_aftermath",
      destination_on_expire: "discard",
    }),
    Error,
    "kind_unsupported:loaned",
  );
  assertThrows(
    () => runtimeV02NormalizeEffectAttachmentState({
      kind: "temporary",
      expires: "end_of_turn",
      destination_on_expire: "discard",
    }),
    Error,
    "expiry_unsupported:end_of_turn",
  );
  assertThrows(
    () => runtimeV02NormalizeEffectAttachmentState({
      kind: "borrowed",
      expires: "controller_aftermath",
      destination_on_expire: "hand",
    }),
    Error,
    "destination_unsupported:hand",
  );
  assertThrows(
    () => runtimeV02NormalizeEffectAttachmentState({
      kind: "temporary",
      expires: "controller_aftermath",
      destination_on_expire: "discard",
      mystery: true,
    }),
    Error,
    "field_unsupported:mystery",
  );
});
