import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.40 accessory ledger covers the exact eight active starters',async()=>{
  const starters=JSON.parse(await read('tcg-set-one-starters-v0.2.json'));
  const ledger=JSON.parse(await read('assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json'));
  assert.equal(ledger.bundles.length,8);
  assert.deepEqual(
    new Set(ledger.bundles.map(x=>x.starter_id)),
    new Set(starters.starters.map(x=>x.starter_id))
  );
});

test('each official starter has exactly sleeve coin and box with unique artwork identities',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json'));
  const all=ledger.bundles.flatMap(x=>x.accessories);
  assert.equal(all.length,24);
  assert.equal(new Set(all.map(x=>x.accessory_id)).size,24);
  assert.equal(new Set(all.map(x=>x.artwork_id)).size,24);
  assert.equal(new Set(all.map(x=>x.asset_path)).size,24);
  for(const bundle of ledger.bundles){
    assert.deepEqual(bundle.accessories.map(x=>x.accessory_type).sort(),['battle_coin','deck_box','sleeve_set']);
    for(const item of bundle.accessories)assert.equal(item.gameplay_effect,false,item.accessory_id);
    const coin=bundle.accessories.find(x=>x.accessory_type==='battle_coin');
    assert.equal(coin.randomness_effect,false,coin.accessory_id);
  }
});

test('ownership and shop policy stays owner-backed and duplicate-safe',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json'));
  assert.equal(ledger.ownership_policy.official_starter_deck_includes_matching_sleeve_set,true);
  assert.equal(ledger.ownership_policy.official_starter_deck_includes_matching_battle_coin,true);
  assert.equal(ledger.ownership_policy.official_starter_deck_includes_matching_deck_box,true);
  assert.equal(ledger.ownership_policy.grant_is_idempotent,true);
  assert.equal(ledger.ownership_policy.custom_user_built_deck_creates_new_accessory_identity,false);
  assert.equal(ledger.ownership_policy.duplicate_shop_purchase_of_owned_accessory,false);
  assert.equal(ledger.ownership_policy.unowned_accessory_shop_availability_required,true);
  assert.equal(ledger.ownership_policy.prices_and_currency_require_canonical_economy_owner,true);
});

test('Shop visibly reserves sleeves coins boxes and accessory bundles without inventing prices',async()=>{
  const html=await read('tcg-shop.html');
  for(const label of ['Card Sleeves','Battle Coins','Deck Boxes','Accessory Bundles'])assert.ok(html.includes(label),label);
  assert.ok(html.includes('No local prices, currency, pack odds or reward grants are fabricated.'));
  assert.ok(html.includes('Purchase Unavailable'));
});

test('main art manifest links the accessory artwork ledger',async()=>{
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest.json'));
  assert.equal(manifest.accessory_art_ledger,'assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json');
  assert.ok(manifest.policy.accessory_identity_rule.includes('sleeve'));
  assert.ok(manifest.policy.accessory_identity_rule.includes('battle coin'));
  assert.ok(manifest.policy.accessory_identity_rule.includes('deck box'));
});
