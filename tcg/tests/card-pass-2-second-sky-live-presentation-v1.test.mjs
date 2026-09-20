import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('Second Sky live presentation release is bound to the canonical 60-card starter and approved art',async()=>{
  const starters=JSON.parse(await read('tcg-set-one-starters-v0.2.json'));
  const secondSky=starters.starters.find(x=>x.starter_id==='deck-astral-second-sky');
  assert.ok(secondSky);
  assert.equal(secondSky.name,'Second Sky');
  assert.equal(secondSky.element,'Astral');
  assert.equal(secondSky.cards.length,21);
  assert.equal(secondSky.cards.reduce((n,row)=>n+row[1],0),60);

  const production=JSON.parse(await read('assets/tcg/art-direction/tcg-art-production-ledger-v1.json'));
  const rows=production.card_art_batches.batch_order.flatMap(batch=>batch.cards.map(card=>({...card,element:batch.element})));
  const byId=new Map(rows.map(row=>[row.card_id,row]));
  assert.equal(rows.filter(row=>row.element==='Astral'&&row.artwork_status==='approved').length,24);
  for(const [cardId] of secondSky.cards){
    const row=byId.get(cardId);
    assert.ok(row,cardId);
    assert.equal(row.artwork_status,'approved',cardId);
    await access(new URL(row.target_path,`file://${ROOT}/`));
  }
});

test('accepted desktop and mobile Second Sky surfaces ship together',async()=>{
  const pages=['tcg-game-home.html','tcg-play.html','tcg-decks.html','tcg-collection.html','tcg-shop.html','tcg-battle-pass.html'];
  for(const page of pages){
    const html=await read(page);
    assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.css?v=2-4-31'),page);
    assert.ok(html.includes('stream-bandit-tcg-product-presentation-v2-4-46.css?v=2-4-55'),page);
    assert.ok(html.includes('stream-bandit-tcg-product-presentation-v2-4-46.js?v=2-4-55'),page);
    assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.js?v=2-4-31'),page);
  }
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.css');
  const product=await read('stream-bandit-tcg-product-presentation-v2-4-46.css');
  assert.ok(shell.includes('V2.4.50 mobile acceptance: full rail plus vertically scrollable complete TCG surfaces.'));
  assert.ok(shell.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
  assert.ok(shell.includes('grid-template-rows:repeat(2,44px)'));
  assert.ok(shell.includes('overflow-y:auto'));
  assert.ok(product.includes('V2.4.48 human visual pass 2: full-image fitting for Play, Battle Pass and Shop.'));
  assert.ok(product.includes('V2.4.49 human visual pass 3: prioritize Active Battle and remove empty Game Info space.'));
  assert.ok(product.includes('V2.4.50 mobile acceptance: readable complete card/product grids.'));
});

test('presentation release cannot own purchases, entitlements or gameplay mutation',async()=>{
  const src=await read('stream-bandit-tcg-product-presentation-v2-4-46.js');
  new Function(src);
  assert.equal(src.includes('supabase.from('),false);
  assert.equal(src.includes('insert('),false);
  assert.equal(src.includes('update('),false);
  assert.equal(src.includes('delete('),false);
  assert.ok(src.includes('Purchase Unavailable'));
  assert.ok(src.includes('server-owned'));
  assert.ok(src.includes('tier not assigned'));
});

test('featured starter registry remains extensible and economy-gated',async()=>{
  const registry=JSON.parse(await read('assets/tcg/products/tcg-product-presentation-v1.json'));
  assert.deepEqual(registry.featured_starter_ids,['deck-astral-second-sky']);
  assert.equal(registry.shop_featured_starter_id,'deck-astral-second-sky');
  assert.equal(registry.battle_pass.display_name,'Set One — Season 1');
  assert.equal(registry.preview_policy.gameplay_mutation,false);
  assert.equal(registry.preview_policy.ownership_inference,false);
  assert.ok(registry.extension_rule.includes('starter_id'));
});

test('canonical art manifest references repo-owned presentation assets that exist',async()=>{
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest.json'));
  const paths=[
    ...Object.values(manifest.branding),
    ...Object.values(manifest.showcases.launch),
    ...Object.values(manifest.showcases.future),
    ...Object.values(manifest.ui_reference),
    ...Object.values(manifest.runtime_backgrounds)
  ];
  for(const path of new Set(paths)){
    assert.equal(/^https?:/i.test(path),false,path);
    await access(new URL(path,`file://${ROOT}/`));
  }
});

test('core navigation targets shipped by the presentation release exist',async()=>{
  const routes=[
    'tcg-play.html','tcg-decks.html','tcg-collection.html','tcg-battle-pass.html',
    'tcg-shop.html','tcg-settings.html','tcg-packs.html','tcg-players.html','tcg-friends.html'
  ];
  for(const route of routes) await access(new URL(route,`file://${ROOT}/`));
});
