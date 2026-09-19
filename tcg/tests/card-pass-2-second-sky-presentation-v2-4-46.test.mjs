import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.46 Second Sky presentation is bound to the exact canonical starter recipe',async()=>{
  const starters=JSON.parse(await read('tcg-set-one-starters-v0.2.json'));
  const secondSky=starters.starters.find(x=>x.starter_id==='deck-astral-second-sky');
  assert.ok(secondSky);
  assert.equal(secondSky.name,'Second Sky');
  assert.equal(secondSky.element,'Astral');
  assert.equal(secondSky.cards.length,21);
  assert.equal(secondSky.cards.reduce((sum,row)=>sum+row[1],0),60);

  const production=JSON.parse(await read('assets/tcg/art-direction/tcg-art-production-ledger-v1.json'));
  const rows=production.card_art_batches.batch_order.flatMap(batch=>batch.cards.map(card=>({...card,element:batch.element})));
  const byId=new Map(rows.map(x=>[x.card_id,x]));
  assert.equal(rows.filter(x=>x.element==='Astral'&&x.artwork_status==='approved').length,24);
  for(const [cardId] of secondSky.cards){
    const row=byId.get(cardId);
    assert.ok(row,cardId);
    assert.equal(row.artwork_status,'approved',cardId);
    await access(new URL(row.target_path,`file://${ROOT}/`));
  }
});

test('Second Sky product presentation is data-driven and does not own gameplay or economy mutation',async()=>{
  const src=await read('stream-bandit-tcg-product-presentation-v2-4-46.js');
  new Function(src);
  for(const token of ['tcg-product-presentation-v1.json','tcg-set-one-starters-v0.2.json','tcg-art-production-ledger-v1.json','tcg-deck-accessory-ledger-v1.json','tcg-art-manifest.json']){
    assert.ok(src.includes(token),token);
  }
  assert.equal(src.includes('supabase.from('),false);
  assert.equal(src.includes('insert('),false);
  assert.equal(src.includes('update('),false);
  assert.equal(src.includes('delete('),false);
  assert.ok(src.includes('server-owned'));
  assert.ok(src.includes('Purchase Unavailable'));
  assert.ok(src.includes('tier not assigned'));
});

test('Second Sky presentation is visible across core product surfaces while battle uses the shared art resolver',async()=>{
  const pages=['tcg-game-home.html','tcg-play.html','tcg-decks.html','tcg-collection.html','tcg-shop.html','tcg-battle-pass.html'];
  for(const page of pages){
    const html=await read(page);
    assert.ok(html.includes('stream-bandit-tcg-product-presentation-v2-4-46.js?v=2-4-46'),page);
    assert.ok(html.includes('stream-bandit-tcg-product-presentation-v2-4-46.css?v=2-4-46'),page);
    assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.css?v=2-4-31'),page);
    assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.js?v=2-4-31'),page);
  }
  const battle=await read('tcg-battle-v2.html');
  assert.ok(battle.includes('stream-bandit-tcg-art-resolver-v2-4-36.js'));
});

test('Second Sky keeps its matching cosmetic accessory contract without fabricating ownership',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json'));
  const bundle=ledger.bundles.find(x=>x.starter_id==='deck-astral-second-sky');
  assert.ok(bundle);
  assert.equal(bundle.deck_name,'Second Sky');
  assert.equal(bundle.accessories.length,3);
  assert.deepEqual(bundle.accessories.map(x=>x.accessory_type),['sleeve_set','battle_coin','deck_box']);
  assert.ok(bundle.accessories.every(x=>x.ownership_status==='not_implemented'));
  assert.ok(bundle.accessories.every(x=>x.gameplay_effect===false));
});

test('product presentation registry keeps future deck expansion data-driven',async()=>{
  const registry=JSON.parse(await read('assets/tcg/products/tcg-product-presentation-v1.json'));
  assert.equal(registry.schema,'stream-bandit-tcg-product-presentation-v1');
  assert.deepEqual(registry.featured_starter_ids,['deck-astral-second-sky']);
  assert.equal(registry.shop_featured_starter_id,'deck-astral-second-sky');
  assert.equal(registry.battle_pass.display_name,'Set One — Season 1');
  assert.equal(registry.battle_pass.tier_count,100);
  assert.equal(registry.battle_pass.reward_assignment_state,'unassigned_canonical_owner_required');
  assert.equal(registry.preview_policy.gameplay_mutation,false);
  assert.equal(registry.preview_policy.ownership_inference,false);
  assert.ok(registry.extension_rule.includes('starter_id'));
});

test('human visual pass keeps top rail labels visible and preserves card-shaped Battle Pass art',async()=>{
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.css');
  const product=await read('stream-bandit-tcg-product-presentation-v2-4-46.css');
  assert.ok(shell.includes('V2.4.47 human visual acceptance: keep the top rail labels fully visible.'));
  assert.ok(shell.includes('.tcg-client-topbar{overflow:visible}'));
  assert.ok(shell.includes('.tcg-client-nav{height:auto;align-self:stretch;overflow:visible}'));
  assert.ok(product.includes('V2.4.47 human visual acceptance: fit artwork to its presentation card instead of flattening it.'));
  assert.ok(product.includes('.tcg-product-pass-art{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain'));
  assert.ok(product.includes('.tcg-product-reward-art{width:100%;height:auto;aspect-ratio:.72;object-fit:cover'));
  assert.ok(product.includes('.tcg-product-mini-art{grid-area:art;width:78px;height:78px'));
});

test('human visual pass 2 compacts the rail and contains Play, Battle Pass and Shop artwork',async()=>{
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.css');
  const product=await read('stream-bandit-tcg-product-presentation-v2-4-46.css');
  assert.ok(shell.includes('V2.4.48 human visual pass 2: compact the top rail to the brand-card height without clipping controls.'));
  assert.ok(shell.includes('.tcg-client-nav{height:72px;align-self:center;overflow:visible}'));
  assert.ok(product.includes('V2.4.48 human visual pass 2: full-image fitting for Play, Battle Pass and Shop.'));
  assert.ok(product.includes('.tcg-product-mini-art{grid-area:art;width:52px;height:72px;min-height:0;aspect-ratio:.72;object-fit:contain'));
  assert.ok(product.includes('.tcg-product-pass-art{width:100%;height:auto;max-height:96px;aspect-ratio:16/7;object-fit:contain'));
  assert.ok(product.includes('.tcg-reward-rail{overflow-x:auto;overflow-y:hidden;align-items:stretch}'));
  assert.ok(product.includes('.tcg-product-reward{height:100%;max-height:100%;min-height:0;overflow:hidden'));
  assert.ok(product.includes('.tcg-product-shop-tile .tcg-product-showcase{width:100%;height:100%;object-fit:contain'));
});

test('human visual pass 3 gives Active Battle priority over empty Game Info space',async()=>{
  const product=await read('stream-bandit-tcg-product-presentation-v2-4-46.css');
  assert.ok(product.includes('V2.4.49 human visual pass 3: prioritize Active Battle and remove empty Game Info space.'));
  assert.ok(product.includes('grid-template-rows:minmax(0,1.45fr) minmax(0,.72fr) minmax(0,.83fr)'));
  assert.ok(product.includes('.tcg-side-stack>.tcg-frame:first-child .tcg-product-mini-art'));
  assert.ok(product.includes('width:58px;'));
  assert.ok(product.includes('height:80px;'));
  assert.ok(product.includes('.tcg-side-stack>.tcg-frame:nth-child(3) .tcg-list'));
  assert.ok(product.includes('line-height:1.28;'));
});
