import {
  runtimeV02ListManualRelicAttachmentTargets,
  runtimeV02ValidateManualRelicAttachmentDeclaration,
} from "../_shared/tcg-match-relic-engine-v0-2.ts";
import { TCG_RUNTIME_REGISTRY_V0_2 } from "../_shared/tcg-runtime-registry-v0-2.ts";

function definition(id: string, family: string, subtype = "") {
  return {
    id,
    schema: TCG_RUNTIME_REGISTRY_V0_2.card_schema,
    effect_schema: TCG_RUNTIME_REGISTRY_V0_2.effect_schema,
    card_family: family,
    tactic: family === "Tactic" ? { subtype, play_requirements: [] } : null,
  };
}
function creature(uid: string, cardId: string, relic: { uid: string; card_id: string } | null = null) {
  return { stack: [{ uid, card_id: cardId }], essence: [], relic, damage: 0, shield: 0, flags: {} };
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
    card_index: {
      relic: { definition_v0_2: definition("relic", "Tactic", "Relic") },
      tactic: { definition_v0_2: definition("tactic", "Tactic", "Standard") },
      creature: { definition_v0_2: definition("creature", "Creature") },
      occupied: { definition_v0_2: definition("occupied", "Tactic", "Relic") },
    },
    players: {
      "1": {
        hand: [
          { uid: "relic-hand", card_id: "relic" },
          { uid: "tactic-hand", card_id: "tactic" },
        ],
        vanguard: creature("vanguard-anchor", "creature"),
        reserve: [
          creature("reserve-anchor", "creature"),
          creature("occupied-anchor", "creature", { uid: "old-relic", card_id: "occupied" }),
          null,
          null,
        ],
      },
      "2": { hand: [], vanguard: null, reserve: [null, null, null, null] },
    },
  } as Record<string, unknown>;
}

Deno.test("manual Relic projection is read-only and returns only empty friendly Creature Relic slots", () => {
  const s = state();
  const before = JSON.stringify(s);
  const result = runtimeV02ListManualRelicAttachmentTargets(s, 1, "relic-hand");
  if (!result.eligible) throw new Error("Relic should be eligible");
  const actual = result.legal_targets.map((target) => [target.where, target.index, target.anchor_uid]);
  const expected = [["vanguard", null, "vanguard-anchor"], ["reserve", 0, "reserve-anchor"]];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("manual Relic targets mismatch");
  if (JSON.stringify(s) !== before) throw new Error("manual Relic projection mutated state");
});

Deno.test("manual Relic projection owns Tactic/Relic subtype identity", () => {
  const wrong = runtimeV02ListManualRelicAttachmentTargets(state(), 1, "tactic-hand");
  if (wrong.eligible || wrong.reason !== "relic_card_required") throw new Error("Relic subtype fence missing");
});

Deno.test("final manual Relic declaration preserves public error precedence and exact target identity", () => {
  const missingTarget = runtimeV02ValidateManualRelicAttachmentDeclaration(state(), 1, "relic-hand", "reserve", 3);
  if (missingTarget.ok || missingTarget.error !== "target_creature_not_found") throw new Error("target error drifted");

  const occupied = runtimeV02ValidateManualRelicAttachmentDeclaration(state(), 1, "relic-hand", "reserve", 1);
  if (occupied.ok || occupied.error !== "creature_already_has_relic") throw new Error("occupied error drifted");

  const wrongCard = runtimeV02ValidateManualRelicAttachmentDeclaration(state(), 1, "tactic-hand", "vanguard", null);
  if (wrongCard.ok || wrongCard.error !== "relic_card_required") throw new Error("Relic source error drifted");

  const legal = runtimeV02ValidateManualRelicAttachmentDeclaration(state(), 1, "relic-hand", "reserve", 0);
  if (!legal.ok || legal.target_creature_uid !== "reserve-anchor" || legal.where !== "reserve" || legal.index !== 0) {
    throw new Error("legal manual Relic declaration rejected");
  }
});
