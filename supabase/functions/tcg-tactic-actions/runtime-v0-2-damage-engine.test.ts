import {
  runtimeV02AddShield,
  runtimeV02DealEffectDamage,
  runtimeV02MoveDamage,
  runtimeV02PlaceDamage,
  runtimeV02TransferShield,
} from "../_shared/tcg-match-damage-engine-v0-2.ts";

function assertEquals(actual: unknown, expected: unknown, message = "values differ") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => unknown, fragment: string) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(fragment)) throw error;
    return;
  }
  throw new Error(`expected error containing ${fragment}`);
}

Deno.test("Damage/Shield Engine consumes Shield before effect HP damage", () => {
  const creature = { damage: 10, shield: 30 };
  const receipt = runtimeV02DealEffectDamage(creature, 50);
  assertEquals(receipt, {
    kind: "effect_damage",
    requested_amount: 50,
    shield_prevented: 30,
    actual_hp_damage: 20,
  });
  assertEquals(creature, { damage: 30, shield: 0 });
});

Deno.test("Damage/Shield Engine placement bypasses Shield", () => {
  const creature = { damage: 10, shield: 30 };
  const receipt = runtimeV02PlaceDamage(creature, 40);
  assertEquals(receipt.actual_damage_placed, 40);
  assertEquals(creature, { damage: 50, shield: 30 });
});

Deno.test("Damage/Shield Engine supports partial friendly wound movement", () => {
  const source = { damage: 20, shield: 40 };
  const destination = { damage: 5, shield: 60 };
  const receipt = runtimeV02MoveDamage(source, destination, 30, { allow_partial: true });
  assertEquals(receipt.actual_damage_moved, 20);
  assertEquals(source, { damage: 0, shield: 40 });
  assertEquals(destination, { damage: 25, shield: 60 });
});

Deno.test("Damage/Shield Engine minimum-moved gate fails before mutation", () => {
  const source = { damage: 10, shield: 0 };
  const destination = { damage: 0, shield: 0 };
  assertThrows(
    () => runtimeV02MoveDamage(source, destination, 40, { allow_partial: true, minimum_moved: 20 }),
    "tcg_v0_2_damage_move_minimum_unmet",
  );
  assertEquals(source, { damage: 10, shield: 0 });
  assertEquals(destination, { damage: 0, shield: 0 });
});

Deno.test("Damage/Shield Engine requires explicit hostile movement opt-in", () => {
  const source = { damage: 40, shield: 0 };
  const destination = { damage: 0, shield: 0 };
  assertThrows(
    () => runtimeV02MoveDamage(source, destination, 40, {
      allow_partial: true,
      source_controller_seat: 1,
      destination_controller_seat: 2,
    }),
    "tcg_v0_2_damage_move_opposing_destination_forbidden",
  );
  assertEquals(source, { damage: 40, shield: 0 });
  assertEquals(destination, { damage: 0, shield: 0 });

  const receipt = runtimeV02MoveDamage(source, destination, 40, {
    allow_partial: true,
    source_controller_seat: 1,
    destination_controller_seat: 2,
    allow_opposing_destination: true,
  });
  assertEquals(receipt.actual_damage_moved, 40);
  assertEquals(source, { damage: 0, shield: 0 });
  assertEquals(destination, { damage: 40, shield: 0 });
});

Deno.test("Damage/Shield Engine supports survival-sensitive destination caps", () => {
  const source = { damage: 30, shield: 0 };
  const destination = { damage: 50, shield: 0 };
  const receipt = runtimeV02MoveDamage(source, destination, 30, {
    allow_partial: true,
    destination_damage_cap: 59,
  });
  assertEquals(receipt.actual_damage_moved, 9);
  assertEquals(source, { damage: 21, shield: 0 });
  assertEquals(destination, { damage: 59, shield: 0 });
});

Deno.test("Damage/Shield Engine Shield gain and transfer obey the shared cap", () => {
  const source = { damage: 0, shield: 50 };
  const destination = { damage: 0, shield: 55 };
  const gain = runtimeV02AddShield(destination, 20);
  assertEquals(gain.actual_shield_gained, 5);
  assertEquals(destination.shield, 60);

  destination.shield = 40;
  const transfer = runtimeV02TransferShield(source, destination, 30);
  assertEquals(transfer.actual_shield_transferred, 20);
  assertEquals(source.shield, 30);
  assertEquals(destination.shield, 60);
});
