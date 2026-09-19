import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.39 printing art ledger has one deterministic base slot per Set One identity',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/cards/tcg-printing-art-ledger-v1.json'));
  assert.equal(ledger.schema,'stream-bandit-tcg-printing-art-ledger-v1');
  assert.equal(ledger.base_printings.length,193);
  assert.equal(new Set(ledger.base_printings.map(x=>x.card_id)).size,193);
  assert.equal(new Set(ledger.base_printings.map(x=>x.printing_id)).size,193);
  assert.equal(new Set(ledger.base_printings.map(x=>x.artwork_id)).size,193);
  assert.equal(new Set(ledger.base_printings.map(x=>x.asset_path)).size,193);
  assert.equal(ledger.status_counts.artworks_approved,0);
  assert.equal(ledger.status_counts.artworks_missing,193);
});

test('printing variants cannot silently change gameplay identity',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/cards/tcg-printing-art-ledger-v1.json'));
  assert.equal(ledger.variant_policy.printing_can_change_rules,false);
  assert.equal(ledger.variant_policy.rarity_can_change_rules,false);
  assert.equal(ledger.variant_policy.finish_can_change_rules,false);
  assert.equal(ledger.variant_policy.alternate_art_can_change_rules,false);
  assert.equal(ledger.variant_policy.future_series_may_introduce_new_gameplay_card_ids,true);
  for(const row of ledger.base_printings){
    assert.equal(row.gameplay_identity_changes,false,row.printing_id);
    assert.equal(row.edition_code,'standard',row.printing_id);
    assert.ok(row.asset_path.includes('/'+row.card_id+'/standard/'),row.asset_path);
  }
});

test('existing Stream Bandit rarity and finish vocabularies remain canonical',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/cards/tcg-printing-art-ledger-v1.json'));
  assert.deepEqual(ledger.rarity_tiers.map(x=>x.id),['basic','rare','extra_rare','mythic']);
  assert.deepEqual(ledger.finish_types.map(x=>x.id),['standard','shine','holo','full_art_shine','alt_art','signature_mythic']);
});

test('main art manifest points to printing-art ledger',async()=>{
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest.json'));
  assert.equal(manifest.printing_art_ledger,'assets/tcg/cards/tcg-printing-art-ledger-v1.json');
  assert.ok(manifest.policy.printing_identity_rule.includes('card_id'));
  assert.ok(manifest.policy.printing_identity_rule.includes('printing_id'));
  assert.ok(manifest.policy.printing_identity_rule.includes('artwork_id'));
});
