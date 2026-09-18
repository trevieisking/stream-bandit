import test from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');
const core=['tcg-play.html','tcg-decks.html','tcg-collection.html','tcg-battle-pass.html','tcg-shop.html','tcg-settings.html'];
test('V2.4.28 locks the six-route TCG client nav including Battle Pass and Shop',async()=>{const js=await read('stream-bandit-tcg-page-shell-v2-4-3.js');for(const x of [['Battle','tcg-play.html'],['Decks','tcg-decks.html'],['Collection','tcg-collection.html'],['Battle Pass','tcg-battle-pass.html'],['Shop','tcg-shop.html'],['Settings','tcg-settings.html']]){assert.ok(js.includes(`label:"${x[0]}"`));assert.ok(js.includes(`href:"${x[1]}"`));await access(new URL(x[1],`file://${ROOT}/`));}});
test('TCG client viewport is fixed and only explicit feeds scroll',async()=>{const css=await read('stream-bandit-tcg-page-shell-v2-4-3.css');assert.match(css,/html,body\{[^}]*overflow:hidden/);assert.ok(css.includes('.tcg-client{'));assert.ok(css.includes('height:100dvh'));assert.match(css,/\.tcg-client-stage\{[^}]*overflow:hidden/);assert.match(css,/\.tcg-feed\{[^}]*overflow:auto/);});
test('core pages use TCG shell but never render website header/footer shell',async()=>{for(const p of core){const html=await read(p);assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.js'));assert.ok(html.includes('stream-bandit-auth-gate-v7-13-001.js'));assert.equal(html.includes('stream-bandit-header-shell-v7-12-156.js'),false);assert.equal(html.includes('stream-bandit-footer-shell-v7-12-156.js'),false);}});
test('battle uses TCG-owned game nav and fixed-screen CSS without website chrome',async()=>{const html=await read('tcg-battle-v2.html');const css=await read('stream-bandit-tcg-battle-table-v2-4-7.css');assert.ok(html.includes('class="sb-game-nav"'));assert.ok(html.includes('tcg-battle-pass.html'));assert.equal(html.includes('stream-bandit-header-shell-v7-12-156.js'),false);assert.equal(html.includes('stream-bandit-footer-shell-v7-12-156.js'),false);assert.ok(css.includes('height:100dvh'));assert.ok(css.includes('.sb-game-nav{'));});
test('visual authority fingerprints all seven approved references',async()=>{const md=await read('tcg-visual-authority-v2.4.28.md');for(const sha of ['54865d2301ad013cc6391ad13f59af65596a1bac9a1e1a1918bd7652f577f2a5','b273438d760e540cddca3e0a675b71736bbc0376ec5f1ec99bed66b3aa11cf73','fd033dda73ebfc302d5963e075f826a1ad1bd6a8a69e73fade86955e8ffc88d5','bc67b65d0cc8a4cabf97cdac4614b23f3c52ee2f01f1f74053feaa71f68da86c','9be366dd25c2ce132f8df05890de7502662a893c61388e78df1c6d167fc37137','5c188a82c43c6406536d8cc9b45a692f24552d4aee69ced1d6ad25a7a09b2b97','97aed0d704f0adb760e598d6092ec625e84699f0004f2b3d4ccda6f5ff8a5ad1'])assert.ok(md.includes(sha));});

test('secondary TCG routes use one bounded internal content feed instead of document scrolling',async()=>{
  const js=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  const css=await read('stream-bandit-tcg-page-shell-v2-4-3.css');
  assert.ok(js.includes('main.classList.add("tcg-secondary-page")'));
  assert.ok(js.includes('feed.className="tcg-secondary-feed tcg-feed"'));
  assert.ok(js.includes('Array.from(main.children).forEach(child=>feed.appendChild(child))'));
  assert.ok(js.includes('main.classList.add("has-subnav")'));
  assert.match(css,/\.tcg-secondary-page\{[^}]*grid-template-rows:minmax\(0,1fr\)/);
  assert.match(css,/\.tcg-secondary-page\.has-subnav\{[^}]*grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(css,/\.tcg-secondary-page\{[^}]*overflow:hidden/);
  assert.match(css,/\.tcg-secondary-feed\{[^}]*overflow:auto/);
});


test('V2.4.30 owns its visual background and generic art-pending assets without global theme projection',async()=>{
  const css=await read('stream-bandit-tcg-page-shell-v2-4-3.css');
  const battleCss=await read('stream-bandit-tcg-battle-table-v2-4-7.css');
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  await access(new URL('assets/tcg-realm-client-backdrop-v2-4-30.svg',`file://${ROOT}/`));
  await access(new URL('assets/tcg-card-back-v2-4-30.svg',`file://${ROOT}/`));
  assert.ok(css.includes('assets/tcg-realm-client-backdrop-v2-4-30.svg'));
  assert.ok(css.includes('assets/tcg-card-back-v2-4-30.svg'));
  assert.ok(battleCss.includes('assets/tcg-realm-client-backdrop-v2-4-30.svg'));
  assert.ok(battleCss.includes('assets/tcg-card-back-v2-4-30.svg'));
  assert.ok(shell.includes('sbTcgVisualAuthority="v2-4-28"'));
  assert.ok(shell.includes('sbTcgVisualImplementation="v2-4-30"'));
  for(const p of core){
    const html=await read(p);
    assert.equal(html.includes('stream-bandit-theme-projector'),false,p+' must not load the global visual projector');
    assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.css?v=2-4-30'));
    assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.js?v=2-4-30'));
  }
});
