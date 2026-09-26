import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const presentation=read('stream-bandit-tcg-product-presentation-v2-4-46.js');
const css=read('stream-bandit-tcg-product-presentation-v2-4-46.css');
const rendererCss=read('stream-bandit-tcg-card-renderer-v2-4-51.css');
const decks=read('tcg-decks.html');
const collection=read('tcg-collection.html');
const battlePass=read('tcg-battle-pass.html');

test('Decks and Collection canonical card tiles are keyboard/click inspectable',()=>{
  assert.match(presentation,/data-sb-tcg-inspect-card=/);
  assert.match(presentation,/tabindex="0" role="button" aria-label="Inspect/);
  assert.match(presentation,/function bindInspection\(owner\)/);
  assert.match(presentation,/function openInspector\(cardId\)/);
  assert.match(presentation,/renderCard\(cardId,\{mode:'inspect'\}\)/);
  assert.match(presentation,/owner\.hydrate\(document\);bindInspection\(owner\)/);
  assert.match(decks,/stream-bandit-tcg-product-presentation-v2-4-46\.js\?v=2-4-55/);
  assert.match(collection,/stream-bandit-tcg-product-presentation-v2-4-46\.js\?v=2-4-55/);
});

test('Battle Pass card-backed reward samples carry canonical card identity into the same inspector',()=>{
  assert.match(presentation,/tcg-product-reward[\s\S]*?data-card-id=/);
  assert.match(presentation,/data-sb-tcg-inspect-card=/);
  assert.match(presentation,/Tap or click to inspect/);
  assert.match(battlePass,/stream-bandit-tcg-product-presentation-v2-4-46\.js\?v=2-4-55/);
});

test('shared inspect face prioritizes readable moves and abilities without creating a second card engine',()=>{
  assert.match(rendererCss,/\.sb-card-face--inspect\{/);
  assert.match(rendererCss,/grid-template-rows:auto minmax\(0,\.78fr\) minmax\(0,1\.42fr\) auto/);
  assert.match(rendererCss,/\.sb-card-face--inspect \.sb-card-rules\{max-height:none;overflow-y:auto/);
  assert.match(css,/\.tcg-card-inspector\{/);
  assert.match(css,/\.tcg-card-inspector-panel\{/);
  assert.doesNotMatch(presentation,/Math\.random\s*\(/);
  assert.doesNotMatch(presentation,/\.from\(['"]sb_/);
});

test('product inspection remains read-only presentation',()=>{
  assert.doesNotMatch(presentation,/insert\s*\(/);
  assert.doesNotMatch(presentation,/upsert\s*\(/);
  assert.doesNotMatch(presentation,/delete\s*\(/);
  assert.doesNotMatch(presentation,/update\s*\(/);
  assert.match(presentation,/cardTile\(card,quantity\)/);
  assert.match(presentation,/mountDecks\(\)/);
  assert.match(presentation,/mountCollection\(\)/);
  assert.match(presentation,/mountBattlePass\(\)/);
});
