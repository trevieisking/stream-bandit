import {
  runtimeV02ListManualEssenceAttachmentTargets,
  runtimeV02ValidateManualEssenceAttachmentDeclaration,
} from "../_shared/tcg-match-essence-attachment-engine-v0-2.ts";
import { TCG_RUNTIME_REGISTRY_V0_2 } from "../_shared/tcg-runtime-registry-v0-2.ts";

function definition(id: string, family: string) {
  return {
    id,
    schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
    effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
    card_family: family,
    element: family === "Essence" ? "Tide" : "Gale",
  };
}
function creature(uid: string, cardId: string) {
  return {
    stack: [{ uid, card_id: cardId }],
    essence: [],
    relic: null,
    damage: 0,
    shield: 0,
    flags: {},
  };
}
function state() {
  return {
    runtime_registry_v0_2: {
      registry_id: TCG_RUNTIME_REGISTRY_V0_2.registry_id,
      set_code: TCG_RUNTIME_REGISTRY_V0_2.set_code,
      card_schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
      effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
      card_count: TCG_RUNTIME_REGISTRY_V0_2.card_count,
      registry_sha256: TCG_RUNTIME_REGISTRY_V0_2.sha256,
      runtime_authority: false,
    },
    turn_seq: 7,
    turn_flags: { "1": {} },
    card_index: {
      essence: { definition_v0_2: definition("essence", "Essence") },
      creature: { definition_v0_2: definition("creature", "Creature") },
    },
    players: {
      "1": {
        hand: [
          { uid: "essence-hand", card_id: "essence" },
          { uid: "creature-hand", card_id: "creature" },
        ],
        vanguard: creature("vanguard-anchor", "creature"),
        reserve: [creature("reserve-anchor", "creature"), null, null, null],
      },
      "2": { hand: [], vanguard: null, reserve: [null, null, null, null] },
    },
  } as Record<string, unknown>;
}

Deno.test("manual Essence target projection is read-only and lists occupied friendly Creature positions", () => {
  const s = state();
  const before = JSON.stringify(s);
  const result = runtimeV02ListManualEssenceAttachmentTargets(s, 1, "essence-hand");
  if (!result.eligible) throw new Error("Essence card should be eligible");
  const targets = result.legal_targets.map((target) => [target.where, target.index, target.anchor_uid]);
  const expected = [
    ["vanguard", null, "vanguard-anchor"],
    ["reserve", 0, "reserve-anchor"],
  ];
  if (JSON.stringify(targets) !== JSON.stringify(expected)) throw new Error("manual Essence targets mismatch");
  if (JSON.stringify(s) !== before) throw new Error("manual Essence projection mutated state");
});

Deno.test("manual Essence target projection preserves once-per-turn and card-family fences", () => {
  const used = state();
  (used.turn_flags as Record<string, Record<string, unknown>>)["1"].manual_essence_turn = 7;
  const spent = runtimeV02ListManualEssenceAttachmentTargets(used, 1, "essence-hand");
  if (spent.eligible || spent.reason !== "manual_essence_already_used_this_turn") {
    throw new Error("manual Essence turn limit missing");
  }
  const wrong = runtimeV02ListManualEssenceAttachmentTargets(state(), 1, "creature-hand");
  if (wrong.eligible || wrong.reason !== "essence_card_required") {
    throw new Error("manual Essence family fence missing");
  }
});

Deno.test("final manual Essence declaration preserves public error precedence and exact target identity", () => {
  const spent = state();
  (spent.turn_flags as Record<string, Record<string, unknown>>)["1"].manual_essence_turn = 7;
  const spentResult = runtimeV02ValidateManualEssenceAttachmentDeclaration(spent, 1, "essence-hand", "vanguard", null);
  if (spentResult.ok || spentResult.error !== "manual_essence_already_used_this_turn") throw new Error("turn-limit error drifted");

  const missingTarget = runtimeV02ValidateManualEssenceAttachmentDeclaration(state(), 1, "essence-hand", "reserve", 3);
  if (missingTarget.ok || missingTarget.error !== "target_creature_not_found") throw new Error("target error drifted");

  const wrongCard = runtimeV02ValidateManualEssenceAttachmentDeclaration(state(), 1, "creature-hand", "vanguard", null);
  if (wrongCard.ok || wrongCard.error !== "essence_card_required") throw new Error("Essence source error drifted");

  const legal = runtimeV02ValidateManualEssenceAttachmentDeclaration(state(), 1, "essence-hand", "reserve", 0);
  if (!legal.ok || legal.target_creature_uid !== "reserve-anchor" || legal.where !== "reserve" || legal.index !== 0) {
    throw new Error("legal manual Essence declaration rejected");
  }
});
