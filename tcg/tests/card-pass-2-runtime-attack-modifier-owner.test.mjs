import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const ownerPath = "supabase/functions/_shared/tcg-match-attack-modifier-v0-2.ts";
const owner = fs.readFileSync(ownerPath, "utf8");
const sourceFiles = [
  "tcg-card-pass-2-astral.md",
  "tcg-card-pass-2-ember.md",
  "tcg-card-pass-2-gale.md",
  "tcg-card-pass-2-grove.md",
  "tcg-card-pass-2-shade.md",
  "tcg-card-pass-2-stone.md",
  "tcg-card-pass-2-tide.md",
  "tcg-card-pass-2-volt.md",
  "tcg-card-pass-2-founder-structured.md",
];

function definitions(file) {
  const markdown = fs.readFileSync(file, "utf8");
  return [...markdown.matchAll(/```json\s*\n([\s\S]*?)\n```/g)].map((match) =>
    JSON.parse(match[1])
  );
}

function modifierSteps(value, into = []) {
  if (Array.isArray(value)) {
    for (const entry of value) modifierSteps(entry, into);
    return into;
  }
  if (!value || typeof value !== "object") return into;
  if (value.op === "ADD_ATTACK_DAMAGE_MODIFIER") into.push(value);
  for (const child of Object.values(value)) modifierSteps(child, into);
  return into;
}

const inventory = sourceFiles.flatMap((file) =>
  definitions(file).flatMap((definition) =>
    modifierSteps(definition).map((step) => ({
      card_id: definition.id,
      card_name: definition.name,
      step,
    }))
  )
);

test("frozen Set One attack-modifier inventory proves finite and reusable duration families", () => {
  assert.equal(inventory.length, 15);
  const finite = inventory.filter(({ step }) => step.duration?.max_uses !== null);
  const reusable = inventory.filter(({ step }) => step.duration?.max_uses === null);

  assert.equal(finite.length, 13);
  assert.equal(reusable.length, 2);
  assert.deepEqual(
    reusable.map(({ card_id }) => card_id).sort(),
    ["volt-courier-jett", "volt-surge-essence"],
  );
  for (const { card_id, step } of finite) {
    assert.equal(step.duration.max_uses, 1, `${card_id} must remain next-attack only`);
    assert.equal(
      step.duration.consume_on,
      "legal_attack_declared",
      `${card_id} must consume at legal declaration`,
    );
  }
  for (const { card_id, step } of reusable) {
    assert.equal(
      Object.hasOwn(step.duration, "consume_on"),
      false,
      `${card_id} must remain reusable until expiry`,
    );
  }
});

test("Ash Crown remains the single action-bound modifier completion rider", () => {
  const withRider = inventory.filter(({ step }) => step.on_consume != null);
  assert.equal(withRider.length, 1);
  assert.equal(withRider[0].card_id, "ember-pyrohorn-ash-crown");
  assert.deepEqual(withRider[0].step.on_consume, {
    bind_to_consuming_action: true,
    timing: "after_attack_effects_before_defeat_scan",
    steps: [{
      op: "DIRECT_DAMAGE",
      target: "$modifier_target",
      amount: 20,
      damage_class: "effect",
    }],
  });
});

test("Attack #14 owns generic modifier install, legal-declaration consumption and expiry", () => {
  for (const symbol of [
    "runtimeV02InstallAttackDamageModifier",
    "runtimeV02ConsumeAttackDamageModifiersOnLegalDeclaration",
    "runtimeV02ExpireAttackDamageModifiersAtEndOfTurn",
  ]) {
    assert.ok(owner.includes(`export function ${symbol}(`), `missing ${symbol}`);
  }
  for (const field of [
    "source_action_id",
    "creation_seq",
    "remaining_uses",
    "consuming_action_id",
    "modifier_target_uid",
  ]) {
    assert.ok(owner.includes(field), `missing canonical ${field}`);
  }
  assert.ok(owner.includes('consume_on === "legal_attack_declared"'));
  assert.ok(owner.includes('remainingUses === 0) nextById.delete(record.id)'));
  assert.ok(owner.includes('timing: "after_attack_effects_before_defeat_scan"'));
});

test("Attack modifier owner is card-ID/name-free and does not recreate caller lifecycle storage", () => {
  for (const { card_id, card_name } of inventory) {
    assert.equal(owner.includes(card_id), false, `card id leaked into owner: ${card_id}`);
    assert.equal(owner.includes(card_name), false, `card name leaked into owner: ${card_name}`);
  }
  assert.equal(owner.includes("lifecycle_attack_bonus"), false);
  assert.equal(owner.includes("next_attack_bonus"), false);
});

