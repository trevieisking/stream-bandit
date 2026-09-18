import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=path=>readFile(new URL(path,`file://${ROOT}/`),'utf8');

test('V2.4.27 Play route reaches only a server-created authoritative match',async()=>{
  const html=await read('tcg-play.html');
  const controller=await read('stream-bandit-tcg-play-controller-v2-4-27.js');
  const setup=await read('supabase/functions/tcg-private-alpha-api/index.ts');

  assert.ok(html.includes('id="tcgDeckSelect"'));
  assert.ok(html.includes('id="tcgQuickMatch"'));
  assert.ok(html.includes('stream-bandit-tcg-play-controller-v2-4-27.js'));
  assert.equal(html.includes('Start match — owner wiring pending'),false);

  assert.ok(controller.includes(".from('tcg_decks')"),'Play route must read only the signed-in owner deck surface protected by RLS');
  assert.ok(controller.includes("action: 'matchmake'"),'Play route must use the existing private-alpha matchmaking action');
  assert.ok(controller.includes("tcg-battle-v2.html"),'paired route must open the board-only battle');
  assert.ok(controller.includes("url.searchParams.set('match_id', matchId)"),'battle navigation must carry the authoritative match ID');
  assert.equal(controller.includes('tcg_server_matchmake'),false,'browser must not call or duplicate the matchmaking RPC directly');
  assert.equal(/function\s+validateDeck/i.test(controller),false,'browser must not implement deck legality');

  assert.ok(setup.includes('if(action==="matchmake")'));
  assert.ok(setup.includes('tcg_server_matchmake'));
});

test('V2.4.27 starter fallback remains server-owned and Ranked stays gated',async()=>{
  const html=await read('tcg-play.html');
  const controller=await read('stream-bandit-tcg-play-controller-v2-4-27.js');

  assert.ok(html.includes('id="tcgStarterPanel"'));
  assert.ok(controller.includes("action: 'choose_starter'"));
  assert.ok(controller.includes(".from('tcg_starter_decks')"));
  assert.ok(html.includes('Coming Soon'));
  assert.ok(html.includes('data-owner-state="gated"'));
});


test('V2.4.29 does not mistake Auth Gate startup concurrency for an approval failure',async()=>{
  const controller=await read('stream-bandit-tcg-play-controller-v2-4-27.js');
  assert.ok(controller.includes('async function resolveAuthDecision()'));
  assert.ok(controller.includes('let decision = await gate.enforce()'));
  assert.ok(controller.includes("typeof gate.decide === 'function'"));
  assert.ok(controller.includes('decision = await gate.decide()'));
  assert.ok(controller.includes('snapshot && snapshot.lastDecision ? snapshot.lastDecision : null'));
  assert.ok(controller.includes('const decision = await resolveAuthDecision()'));
  assert.equal(controller.includes("profile.role === 'admin'"),false,'Play controller must not duplicate Auth Gate approval rules');
});
