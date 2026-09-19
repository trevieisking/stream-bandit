import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../../',import.meta.url);
const controller=await readFile(new URL('stream-bandit-tcg-player-directory-v2-4-6.js',root),'utf8');
const players=await readFile(new URL('tcg-players.html',root),'utf8');
const profile=await readFile(new URL('tcg-player-profile.html',root),'utf8');
const privacy=await readFile(new URL('tcg-account-privacy.html',root),'utf8');

test('Players and public profile use only canonical Directory RPCs',()=>{
  assert.match(controller,/\.rpc\('tcg_search_public_players'/);
  assert.match(controller,/\.rpc\('tcg_get_public_player'/);
  for(const forbidden of ['tcg_player_profiles','sb_profiles','sb_profile_social_settings','sb_user_friends','sb_user_blocks']){
    assert.equal(controller.includes("from('"+forbidden+"')"),false,`UI must not browse ${forbidden}`);
  }
  assert.equal(controller.includes('service_role'),false,'browser controller must not contain a service-role path');
});

test('Directory preferences stay own-row, opt-in and private-by-default in UI',()=>{
  assert.match(controller,/from\('tcg_player_directory_preferences'\)/);
  assert.match(controller,/discoverable:\s*!!discoverable\.checked/);
  assert.match(controller,/show_arcade_stats:\s*!!showStats\.checked/);
  assert.match(privacy,/id="tcgDirectoryDiscoverable"[^>]*disabled/);
  assert.match(privacy,/id="tcgDirectoryShowStats"[^>]*disabled/);
  assert.match(privacy,/private remains the default/i);
});

test('Directory controller is mounted only on the three intended TCG surfaces',()=>{
  for(const html of [players,profile,privacy]){
    assert.match(html,/stream-bandit-tcg-player-directory-v2-4-6\.js/);
  }
  assert.match(players,/id="tcgPlayerSearchForm"/);
  assert.match(players,/id="tcgPlayerResults"/);
  assert.match(profile,/id="tcgPublicPlayerProfile"/);
  assert.match(privacy,/id="tcgDirectoryPrivacySave"/);
});

test('unowned TCG social writes remain visibly gated',()=>{
  assert.match(profile,/Add friend — unavailable/);
  assert.match(profile,/disabled aria-disabled="true" data-owner-state="gated"/);
  assert.match(privacy,/TCG-specific blocking remains gated/);
  assert.equal(controller.includes("from('sb_user_friends')"),false);
  assert.equal(controller.includes("from('sb_user_blocks')"),false);
});

test('search is bounded by the browser and server owner remains authoritative',()=>{
  assert.match(controller,/p_limit:\s*25/);
  assert.match(controller,/p_offset:\s*0/);
  assert.match(players,/autocomplete="off"/);
  assert.match(controller,/textContent\s*=/,'rendering must use textContent for returned public strings');
});
