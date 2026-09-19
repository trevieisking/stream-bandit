import fs from "node:fs";
import assert from "node:assert/strict";

const ledger=JSON.parse(fs.readFileSync("assets/tcg/art-direction/tcg-art-production-ledger-v1.json","utf8"));
const intake=JSON.parse(fs.readFileSync("assets/tcg/cards/set-one/tcg-card-art-intake-v1.json","utf8"));
const printing=JSON.parse(fs.readFileSync("assets/tcg/cards/tcg-printing-art-ledger-v1.json","utf8"));

assert.equal(ledger.schema,"stream-bandit-tcg-art-production-ledger-v1");
assert.equal(ledger.version,"1.1.0");
assert.equal(ledger.card_art_batches.first_batch.id,"SB1-ASTRAL-CREATURES-01");
assert.equal(ledger.card_art_batches.first_batch.cards.length,11);

const batches=ledger.card_art_batches.batch_order;
assert.equal(batches.length,25);
assert.deepEqual(batches.map(x=>x.sequence),Array.from({length:25},(_,i)=>i+1));
assert.ok(batches.every(x=>x.status==="production_blueprint_complete_art_missing"));
assert.ok(batches.every(x=>x.approved_art_count===0));
assert.ok(batches.every(x=>x.rarity_assignment_status==="unassigned_pending_content_approval"));
assert.ok(batches.every(x=>x.finish==="standard"));

const cards=batches.flatMap(x=>x.cards);
assert.equal(cards.length,193);
assert.equal(new Set(cards.map(x=>x.card_id)).size,193);
assert.equal(new Set(cards.map(x=>x.printing_id)).size,193);
assert.equal(new Set(cards.map(x=>x.artwork_id)).size,193);
assert.equal(new Set(cards.map(x=>x.target_path)).size,193);
assert.ok(cards.every(x=>typeof x.brief==="string" && x.brief.length>40));
assert.ok(cards.every(x=>x.artwork_status==="missing"));

const intakeIds=new Set(intake.cards.map(x=>x.card_id));
assert.equal(intakeIds.size,193);
assert.deepEqual(new Set(cards.map(x=>x.card_id)),intakeIds);

const printingById=new Map(printing.base_printings.map(x=>[x.card_id,x]));
assert.equal(printingById.size,193);
for(const card of cards){
  const p=printingById.get(card.card_id);
  assert.ok(p,card.card_id);
  assert.equal(card.printing_id,p.printing_id,card.card_id);
  assert.equal(card.artwork_id,p.artwork_id,card.card_id);
  assert.equal(card.target_path,p.asset_path,card.card_id);
  assert.equal(p.artwork_status,"missing",card.card_id);
}

const expectedElements={Astral:24,Ember:24,Gale:24,Grove:24,Shade:24,Stone:24,Tide:24,Volt:24,Prismatic:1};
for(const [element,count] of Object.entries(expectedElements)){
  assert.equal(cards.filter(x=>printingById.get(x.card_id).element===element).length,count,element);
}
const expectedFamilies={Creature:89,Essence:32,Tactic:72};
for(const [family,count] of Object.entries(expectedFamilies)){
  assert.equal(cards.filter(x=>printingById.get(x.card_id).card_family===family).length,count,family);
}

assert.equal(ledger.card_art_batches.production_ready_card_count,193);
assert.equal(ledger.card_art_batches.total_base_art_approved,0);
assert.equal(ledger.card_art_batches.set_one_blueprint_complete,true);
assert.equal(ledger.card_art_batches.actual_art_completion,false);
assert.equal(ledger.background_production.final_backgrounds_approved,0);

console.log("V2.4.43 Set One art batch blueprint: PASS");
