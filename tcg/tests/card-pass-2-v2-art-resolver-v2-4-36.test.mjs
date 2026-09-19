import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.46 exposes one reusable presentation-only TCG art resolver',async()=>{
  const src=await read('stream-bandit-tcg-art-resolver-v2-4-36.js');
  for(const token of ['tcg-art-manifest.json','tcg-card-art-intake-v1.json','tcg-art-production-ledger-v1.json','productionRows','applyCardArt','applyPageArt','applyBranding','MutationObserver']){
    assert.ok(src.includes(token),token);
  }
  assert.equal(src.includes('gale-skyweaver.png'),false,'resolver must not hard-code individual card paths');
  assert.equal(src.includes('tcg-match-actions'),false,'art owner must not own gameplay');
  assert.equal(src.includes('tcg-private-alpha-api'),false,'art owner must not own setup/runtime API');
});

test('Set One intake binds canonical printing paths and Astral is 24/24 complete',async()=>{
  const intake=JSON.parse(await read('assets/tcg/cards/set-one/tcg-card-art-intake-v1.json'));
  assert.equal(intake.card_count,193);
  assert.equal(new Set(intake.cards.map(card=>card.card_id)).size,193);
  const counts={};
  for(const card of intake.cards){
    assert.equal(card.expected_filename,card.expected_asset_path.split('/').pop(),card.card_id);
    assert.ok(card.expected_asset_path.includes('/'+card.card_id+'/standard/'),card.expected_asset_path);
    assert.ok(card.expected_filename.endsWith('-art-v1.png'),card.expected_filename);
    counts[card.element]=(counts[card.element]||0)+1;
  }
  assert.equal(intake.cards.filter(card=>card.element==='Astral'&&card.artwork_status==='complete').length,24);
  assert.equal(intake.artwork_complete,24);
  assert.equal(intake.artwork_missing,169);
  assert.ok(Math.max(...Object.values(counts))<1000,'no Set One element folder may approach GitHub browser 1000-entry truncation');
});

test('approved repo-owned art targets exist and do not use GitHack',async()=>{
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest.json'));
  const production=JSON.parse(await read('assets/tcg/art-direction/tcg-art-production-ledger-v1.json'));
  const paths=[
    manifest.branding.primary_key_art,
    ...Object.values(manifest.runtime_backgrounds),
    ...Object.values(manifest.ui_reference),
    ...Object.values(manifest.showcases.launch),
    ...Object.values(manifest.showcases.future),
    ...production.card_art_batches.batch_order.flatMap(batch=>batch.cards.filter(card=>card.artwork_status==='approved').map(card=>card.target_path))
  ];
  for(const path of paths){
    assert.equal(/^https?:/i.test(path),false,path);
    assert.equal(path.includes('githack'),false,path);
    await access(new URL(path,`file://${ROOT}/`));
  }
});

test('page shell loads the canonical art owner without changing accepted shell identity',async()=>{
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  assert.ok(shell.includes('const VERSION="2.4.32"'));
  assert.ok(shell.includes('stream-bandit-tcg-art-resolver-v2-4-36.js?v=2-4-46'));
  assert.ok(shell.includes('owner.applyPageArt(body)'));
  assert.ok(shell.includes('owner.applyBranding(document)'));
});

test('art resolver decorates existing rendered cards instead of changing Card Renderer gameplay identity',async()=>{
  const resolver=await read('stream-bandit-tcg-art-resolver-v2-4-36.js');
  const renderer=await read('stream-bandit-tcg-card-renderer-v2-4-7.js');
  assert.ok(resolver.includes("querySelectorAll('.sb-tcg-card[data-card-id]')"));
  assert.ok(resolver.includes("card.querySelector('.sb-card-art')"));
  assert.ok(resolver.includes("holder.replaceChildren(img)"));
  assert.ok(resolver.includes("row.target_path"));
  assert.ok(renderer.includes("const VERSION = 'Stream Bandit TCG Card Renderer V2.4.10'"));
  assert.equal(renderer.includes('StreamBanditTCGArtResolver'),false);
});

test('battle adds art owner alongside accepted controller and renderer cache contracts',async()=>{
  const html=await read('tcg-battle-v2.html');
  const resolverPos=html.indexOf('stream-bandit-tcg-art-resolver-v2-4-36.js');
  const rendererPos=html.indexOf('stream-bandit-tcg-card-renderer-v2-4-7.js?v=2-4-10');
  assert.ok(resolverPos>0&&rendererPos>resolverPos);
  const controllerCache=html.match(/stream-bandit-tcg-v2-battle-controller\.js\?v=2-4-(\d+)/);
  assert.ok(controllerCache,'battle controller cache identity missing');
  assert.ok(Number(controllerCache[1])>=26,'battle controller cache identity regressed');
  assert.ok(html.includes('data-sb-tcg-page="battle"'));
  assert.equal(html.includes('stream-bandit-header-shell'),false);
  assert.equal(html.includes('stream-bandit-footer-shell'),false);
});

test('runtime backgrounds never reuse flattened UI reference compositions',async()=>{
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest.json'));
  const resolver=await read('stream-bandit-tcg-art-resolver-v2-4-36.js');
  const refs=new Set(Object.values(manifest.ui_reference));
  for(const [key,path] of Object.entries(manifest.runtime_backgrounds)){
    assert.equal(refs.has(path),false,key+' runtime background must not be a flattened UI reference');
  }
  assert.equal(resolver.includes('artManifest.ui_reference&&key&&artManifest.ui_reference[key]'),false);
  assert.ok(resolver.includes('artManifest.runtime_backgrounds'));
  assert.ok(resolver.includes('backgrounds.default'));
});
