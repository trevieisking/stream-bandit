import fs from "node:fs";
import assert from "node:assert/strict";

const ledger=JSON.parse(fs.readFileSync("assets/tcg/art-direction/tcg-art-production-ledger-v1.json","utf8"));
const manifest=JSON.parse(fs.readFileSync("assets/tcg/tcg-art-manifest.json","utf8"));

assert.equal(ledger.schema,"stream-bandit-tcg-art-production-ledger-v1");
assert.equal(ledger.uploaded_original_archive.total_original_pngs,18);
assert.equal(
  ledger.uploaded_original_archive.branding_key_art+
  ledger.uploaded_original_archive.launch_showcases+
  ledger.uploaded_original_archive.future_showcases+
  ledger.uploaded_original_archive.ui_references,
  18
);

const backgrounds=ledger.background_production.slots;
assert.equal(backgrounds.length,8);
assert.equal(new Set(backgrounds.map(x=>x.id)).size,8);
assert.equal(new Set(backgrounds.map(x=>x.target_path)).size,8);
assert.ok(backgrounds.every(x=>x.status==="missing_final"));
assert.ok(backgrounds.every(x=>x.current_fallback==="assets/tcg-realm-client-backdrop-v2-4-30.svg"));

const batch=ledger.card_art_batches.first_batch;
assert.equal(batch.id,"SB1-ASTRAL-CREATURES-01");
assert.equal(batch.element,"Astral");
assert.equal(batch.card_family,"Creature");
assert.equal(batch.count,11);
assert.equal(batch.cards.length,11);
assert.equal(batch.rarity_assignment_status,"unassigned_pending_content_approval");
assert.equal(new Set(batch.cards.map(x=>x.card_id)).size,11);
assert.equal(new Set(batch.cards.map(x=>x.printing_id)).size,11);
assert.equal(new Set(batch.cards.map(x=>x.artwork_id)).size,11);
assert.equal(new Set(batch.cards.map(x=>x.target_path)).size,11);
assert.ok(batch.cards.every(x=>x.target_path.startsWith("assets/tcg/cards/set-one/astral/")));
assert.ok(batch.cards.every(x=>x.target_path.endsWith("-art-v1.png")));
assert.ok(batch.cards.every(x=>typeof x.brief==="string" && x.brief.length>40));

assert.equal(manifest.version,"6");
assert.equal(manifest.art_production_ledger,"assets/tcg/art-direction/tcg-art-production-ledger-v1.json");
assert.equal(manifest.runtime_backgrounds.default,"assets/tcg-realm-client-backdrop-v2-4-30.svg");

console.log("V2.4.42 art production ledger: PASS");
