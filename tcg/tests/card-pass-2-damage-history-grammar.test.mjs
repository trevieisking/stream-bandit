import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const grammar = JSON.parse(
  await readFile(
    new URL("../../tcg-card-pass-2-effect-grammar-v0.2.json", import.meta.url),
    "utf8",
  ),
);

test("Card Pass grammar declares the generic current-turn damage-history predicate", () => {
  assert.ok(
    grammar.predicates.includes("damage_history_count_at_least"),
    "damage_history_count_at_least must be declared before Scarjackal/Red Ledger candidates use it",
  );
});
