import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.36 exposes one reusable TCG art resolver',async()=>{
  const src=await read('stream-bandit-tcg-art-resolver-v2-4-36.js');
  for(const token of ['tcg-art-manifest.json','tcg-card-art-intake-v1.json','cardArt','applyPageArt','applyBranding']){
    assert.ok(src.includes(token),token);
  }
  assert.equal(src.includes('gale-skyweaver.png'),false,'resolver must not hard-code individual card paths');
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

test('page shell loads canonical art owner and brand source generically',async()=>{
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  assert.ok(shell.includes('stream-bandit-tcg-art-resolver-v2-4-36.js?v=2-4-36'));
  assert.ok(shell.includes('data-sb-tcg-brand-art="primary"'));
  assert.ok(shell.includes('owner.applyPageArt(body)'));
  assert.ok(shell.includes('owner.applyBranding(document)'));
});

test('card renderer resolves by canonical card id with missing-art fallback',async()=>{
  const renderer=await read('stream-bandit-tcg-card-renderer-v2-4-7.js');
  assert.ok(renderer.includes('StreamBanditTCGArtResolverV2436'));
  assert.ok(renderer.includes('artOwner.cardArt(instance, structured, definition)'));
  assert.ok(renderer.includes('data-sb-tcg-card-art="candidate"'));
  assert.ok(renderer.includes('Artwork pending'));
});

test('battle loads art owner before renderer and preserves standalone game chrome',async()=>{
  const html=await read('tcg-battle-v2.html');
  const controller=await read('stream-bandit-tcg-v2-battle-controller.js');
  const resolverPos=html.indexOf('stream-bandit-tcg-art-resolver-v2-4-36.js');
  const rendererPos=html.indexOf('stream-bandit-tcg-card-renderer-v2-4-7.js');
  assert.ok(resolverPos>0&&rendererPos>resolverPos);
  assert.ok(html.includes('data-sb-tcg-page="battle"'));
  assert.ok(html.includes('data-sb-tcg-brand-art="primary"'));
  assert.ok(controller.includes('await art.ready()'));
  assert.ok(controller.includes('art.applyPageArt(document.body)'));
  assert.ok(controller.includes('art.applyBranding(document)'));
  assert.equal(html.includes('stream-bandit-header-shell'),false);
  assert.equal(html.includes('stream-bandit-footer-shell'),false);
});
