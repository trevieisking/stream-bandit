import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.37 exposes one reusable presentation-only TCG art resolver',async()=>{
  const src=await read('stream-bandit-tcg-art-resolver-v2-4-36.js');
  for(const token of ['tcg-art-manifest.json','tcg-card-art-intake-v1.json','applyCardArt','applyPageArt','applyBranding','MutationObserver']){
    assert.ok(src.includes(token),token);
  }
  assert.equal(src.includes('gale-skyweaver.png'),false,'resolver must not hard-code individual card paths');
  assert.equal(src.includes('tcg-match-actions'),false,'art owner must not own gameplay');
  assert.equal(src.includes('tcg-private-alpha-api'),false,'art owner must not own setup/runtime API');
});

test('Set One art intake stays browser-friendly and canonical',async()=>{
  const intake=JSON.parse(await read('assets/tcg/cards/set-one/tcg-card-art-intake-v1.json'));
  assert.equal(intake.card_count,193);
  assert.equal(new Set(intake.cards.map(card=>card.card_id)).size,193);
  const counts={};
  for(const card of intake.cards){
    assert.equal(card.expected_filename,`${card.card_id}.png`);
    assert.ok(card.expected_asset_path.endsWith('/'+card.card_id+'.png'));
    counts[card.element]=(counts[card.element]||0)+1;
  }
  assert.ok(Math.max(...Object.values(counts))<1000,'no Set One element folder may approach GitHub browser 1000-entry truncation');
});

test('approved repo-owned art targets exist and do not use GitHack',async()=>{
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest.json'));
  const paths=[
    manifest.branding.primary_key_art,
    ...Object.values(manifest.ui_reference),
    ...Object.values(manifest.showcases.launch),
    ...Object.values(manifest.showcases.future)
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
  assert.ok(shell.includes('stream-bandit-tcg-art-resolver-v2-4-36.js?v=2-4-36'));
  assert.ok(shell.includes('owner.applyPageArt(body)'));
  assert.ok(shell.includes('owner.applyBranding(document)'));
});

test('art resolver decorates existing rendered cards instead of changing Card Renderer gameplay identity',async()=>{
  const resolver=await read('stream-bandit-tcg-art-resolver-v2-4-36.js');
  const renderer=await read('stream-bandit-tcg-card-renderer-v2-4-7.js');
  assert.ok(resolver.includes("querySelectorAll('.sb-tcg-card[data-card-id]')"));
  assert.ok(resolver.includes("card.querySelector('.sb-card-art')"));
  assert.ok(resolver.includes("holder.replaceChildren(img)"));
  assert.ok(renderer.includes("const VERSION = 'Stream Bandit TCG Card Renderer V2.4.10'"));
  assert.equal(renderer.includes('StreamBanditTCGArtResolver'),false);
});

test('battle adds art owner alongside accepted controller and renderer cache contracts',async()=>{
  const html=await read('tcg-battle-v2.html');
  const resolverPos=html.indexOf('stream-bandit-tcg-art-resolver-v2-4-36.js');
  const rendererPos=html.indexOf('stream-bandit-tcg-card-renderer-v2-4-7.js?v=2-4-10');
  assert.ok(resolverPos>0&&rendererPos>resolverPos);
  assert.ok(html.includes('stream-bandit-tcg-v2-battle-controller.js?v=2-4-26'));
  assert.ok(html.includes('data-sb-tcg-page="battle"'));
  assert.equal(html.includes('stream-bandit-header-shell'),false);
  assert.equal(html.includes('stream-bandit-footer-shell'),false);
});
