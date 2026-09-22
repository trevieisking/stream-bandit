import fs from "node:fs";

const tactic = fs.readFileSync("supabase/functions/tcg-tactic-actions/index.ts", "utf8");
const owner = fs.readFileSync("supabase/functions/_shared/tcg-match-card-selection-v0-2.ts", "utf8");
const grove = fs.readFileSync("tcg-card-pass-2-grove.md", "utf8");
const tide = fs.readFileSync("tcg-card-pass-2-tide.md", "utf8");
const volt = fs.readFileSync("tcg-card-pass-2-volt.md", "utf8");

const all = [grove, tide, volt].join("\n");
const selectCardsCount = (all.match(/"op":"SELECT_CARDS"/g) || []).length;
if (selectCardsCount !== 7) {
  throw new Error(`frozen SELECT_CARDS inventory drifted: ${selectCardsCount} !== 7`);
}

for (const marker of [
  '"id":"grove-forager-nia"',
  '"selection":{"min":0,"max":2,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}}',
  '"cards":"$foraged","to":"deck_bottom","order":"player_choice"',
  '"id":"volt-quickcharge-cell"',
  '"selection":{"min":1,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}}',
  '"cards":"$charge","target":"$charge_target","manual_attachment":false',
  '"kind":"temporary","expires":"controller_aftermath","destination_on_expire":"discard"',
]) {
  if (!all.includes(marker)) throw new Error(`frozen Tactic SELECT_CARDS marker missing: ${marker}`);
}

for (const marker of [
  'tcg-match-card-selection-v0-2.ts',
  'if (op === "SELECT_CARDS")',
  'apply: "select_cards"',
  'runtimeV02ResolveSelectCards(',
  'runtimeV02RebindSelectedCards(',
  'runtimeV02PreflightCardZoneTransfer(',
  'runtimeV02CommitCardZoneTransfer(',
  'kind: "order_selected_cards"',
  'apply: "move_selected_cards"',
  'if (op === "ATTACH_ESSENCE_FROM_ZONE" && step.cards != null)',
  'runtimeV02NormalizeEffectAttachmentState(step.attachment_state)',
  'runtimeV02BeginExternalEssenceAttachmentRoute(',
]) {
  if (!tactic.includes(marker)) throw new Error(`Tactic SELECT_CARDS wiring marker missing: ${marker}`);
}

for (const marker of [
  "runtimeV02NormalizeSelectCardsStep",
  "runtimeV02CardSelectionOptions",
  "runtimeV02ResolveSelectCards",
  "runtimeV02RebindSelectedCards",
]) {
  if (!owner.includes(marker)) throw new Error(`Card Selection owner marker missing: ${marker}`);
}

for (const forbidden of [
  "grove-forager-nia",
  "Forager Nia",
  "volt-quickcharge-cell",
  "Quickcharge Cell",
]) {
  if (tactic.includes(forbidden) || owner.includes(forbidden)) {
    throw new Error(`card identity leaked into runtime dispatch: ${forbidden}`);
  }
}

process.stdout.write("V2.4.94 Tactic SELECT_CARDS wiring is generic and engine-owned.\n");
