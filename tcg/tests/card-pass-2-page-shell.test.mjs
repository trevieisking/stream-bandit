import test from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');
const primary=[['Battle','tcg-play.html'],['Decks','tcg-decks.html'],['Collection','tcg-collection.html'],['Battle Pass','tcg-battle-pass.html'],['Shop','tcg-shop.html'],['Settings','tcg-settings.html']];
const account=['tcg-account.html','tcg-account-profile.html','tcg-account-security.html','tcg-account-privacy.html','tcg-account-notifications.html','tcg-account-preferences.html','tcg-account-leave.html','tcg-account-delete.html'];
const social=['tcg-players.html','tcg-player-profile.html','tcg-friends.html','tcg-friend-requests.html','tcg-blocked.html'];
test('V2.4.28 primary TCG client route manifest is complete',async()=>{const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');for(const [label,href] of primary){assert.ok(shell.includes(`label:"${label}"`));assert.ok(shell.includes(`href:"${href}"`));await access(new URL(href,`file://${ROOT}/`));}});
test('standalone pages reuse TCG client shell and auth functions without website chrome',async()=>{for(const [,href] of primary){const html=await read(href);assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.css'));assert.ok(html.includes('stream-bandit-tcg-page-shell-v2-4-3.js'));assert.ok(html.includes('stream-bandit-auth-gate-v7-13-001.js'));assert.equal(html.includes('stream-bandit-header-shell-v7-12-156.js'),false);assert.equal(html.includes('stream-bandit-footer-shell-v7-12-156.js'),false);assert.equal(html.includes('stream-bandit-theme-projector'),false);}});
test('Account and social families stay real routes and unsafe writes stay gated',async()=>{for(const href of [...account,...social])await access(new URL(href,`file://${ROOT}/`));for(const href of ['tcg-account-leave.html','tcg-account-delete.html','tcg-account-preferences.html','tcg-friend-requests.html','tcg-blocked.html']){const html=await read(href);assert.ok(html.includes('data-owner-state="gated"'));assert.ok(html.includes('aria-disabled="true"'));}const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');assert.ok(shell.includes('{key:"find",label:"Find Players",href:"tcg-players.html"}'));});
test('active battle remains free of normal website header/footer chrome',async()=>{const battle=await read('tcg-battle-v2.html');assert.equal(battle.includes('stream-bandit-header-shell-v7-12-156.js'),false);assert.equal(battle.includes('stream-bandit-footer-shell-v7-12-156.js'),false);assert.ok(battle.includes('data-sb-tcg-v2-battle="board-only-v0-2"'));});

test('V2.4.30 TCG-owned visual client assets exist and public pages keep shared auth without shared visual chrome',async()=>{
  await access(new URL('assets/tcg-realm-client-backdrop-v2-4-30.svg',`file://${ROOT}/`));
  await access(new URL('assets/tcg-card-back-v2-4-30.svg',`file://${ROOT}/`));
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  assert.ok(shell.includes('const VERSION="2.4.32"'));
});


const tcgClientPages=[
  'tcg-play.html','tcg-decks.html','tcg-collection.html','tcg-battle-pass.html','tcg-shop.html','tcg-settings.html',
  'tcg-battle-v2.html','tcg-game-home.html','tcg-packs.html','tcg-progress.html','tcg-learn.html',
  ...account,...social
];

test('V2.4.31 TCG routes use config-only bridge and can never boot the Stream Bandit website shell',async()=>{
  const bridge=await read('stream-bandit-tcg-config-v2-4-31.js');
  assert.ok(bridge.includes('StreamBanditSupabaseConfig'));
  assert.equal(bridge.includes('stream-bandit-header-shell'),false);
  assert.equal(bridge.includes('stream-bandit-footer-shell'),false);
  assert.equal(bridge.includes('stream-bandit-theme-projector'),false);
  assert.equal(bridge.includes('StreamBanditRoutes'),false);
  assert.equal(bridge.includes('ensureFoundation'),false);
  assert.equal(bridge.includes('loadScript('),false);
  for(const href of tcgClientPages){
    const html=await read(href);
    assert.equal(html.includes('stream-bandit-shell-v6-24.js'),false,href+' must not boot the website shell');
    assert.equal(html.includes('stream-bandit-theme-projector'),false,href+' must not load the website theme projector');
    assert.ok(html.includes('stream-bandit-tcg-config-v2-4-31.js'),href+' must load the config-only bridge');
  }
});

test('V2.4.31 Settings stays inside the TCG route namespace',async()=>{
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  const settings=await read('tcg-settings.html');
  const bridge=await read('stream-bandit-tcg-config-v2-4-31.js');
  assert.ok(shell.includes('{key:"settings",label:"Settings",href:"tcg-settings.html"}'));
  assert.equal(shell.includes('settings-platform-control-hub'),false);
  assert.equal(settings.includes('settings-platform-control-hub'),false);
  assert.equal(bridge.includes('settings-platform-control-hub'),false);
});


test('V2.4.32 uses repository-owned TCG branding assets with no legacy topbar logo path',async()=>{
  const shell=await read('stream-bandit-tcg-page-shell-v2-4-3.js');
  const manifest=JSON.parse(await read('assets/tcg/tcg-art-manifest-v1.json'));
  await access(new URL('assets/tcg/branding/stream-bandit-tcg-logo-v1.webp',`file://${ROOT}/`));
  await access(new URL('assets/tcg/branding/stream-bandit-tcg-emblem-v1.webp',`file://${ROOT}/`));
  assert.ok(shell.includes('assets/tcg/branding/stream-bandit-tcg-emblem-v1.webp'));
  assert.equal(shell.includes('assets/stream-bandit-original-stag-logo-v7-12-7.svg'),false);
  assert.equal(JSON.stringify(manifest).includes('raw.githack.com'),false);
  assert.equal(manifest.branding.primary_logo.path,'assets/tcg/branding/stream-bandit-tcg-logo-v1.webp');
  assert.equal(manifest.branding.topbar_emblem.path,'assets/tcg/branding/stream-bandit-tcg-emblem-v1.webp');
});
