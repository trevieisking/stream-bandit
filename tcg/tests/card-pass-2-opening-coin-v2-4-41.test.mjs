import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFile(new URL(p,`file://${ROOT}/`),'utf8');

test('V2.4.41 opening toss is a player call followed by one server-owned coin result',async()=>{
  const randomization=await read('supabase/functions/_shared/tcg-match-randomization-engine-v0-2.ts');
  const flow=await read('supabase/functions/_shared/tcg-match-flow-engine-v0-2.ts');
  const setup=await read('supabase/functions/tcg-private-alpha-api/index.ts');
  assert.ok(randomization.includes('export function runtimeV02FlipCoin'));
  assert.ok(randomization.includes('runtimeV02UniformRandomInt(2, source)'));
  assert.ok(flow.includes('runtimeV02ApplyOpeningCoinCall'));
  assert.ok(flow.includes('state.phase = "opening_choice"'));
  assert.ok(setup.includes('phase:"opening_coin_call"'));
  assert.ok(setup.includes('runtimeV02ApplyOpeningCoinCall(state,seat as 1|2,coinCall,runtimeV02FlipCoin)'));
  assert.equal(setup.includes('const toss=runtimeV02UniformRandomInt(2)+1'),false);
});

test('V2.4.41 browser only calls heads/tails and renders the authoritative face',async()=>{
  const controller=await read('stream-bandit-tcg-v2-battle-controller.js');
  const html=await read('tcg-battle-v2.html');
  assert.ok(controller.includes('data-lifecycle-intent="opening_coin_call"'));
  assert.ok(controller.includes('data-coin-call="heads"'));
  assert.ok(controller.includes('data-coin-call="tails"'));
  assert.ok(controller.includes("const face = side === 'heads' ? 'front' : 'back'"));
  assert.ok(controller.includes('data-coin-side='));
  assert.equal(controller.includes('Math.random'),false);
  assert.equal(controller.includes('crypto.getRandomValues'),false);
  assert.ok(html.includes('data-sb-tcg-tabletop="v2-4-41"'));
  assert.ok(html.includes('stream-bandit-tcg-v2-battle-controller.js?v=2-4-41'));
});

test('V2.4.41 Battle Coin is cosmetic and its face follows the server result',async()=>{
  const ledger=JSON.parse(await read('assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json'));
  const coin=ledger.accessory_types.find(x=>x.id==='battle_coin');
  assert.deepEqual(coin.result_face_contract,{heads:'front',tails:'back'});
  assert.equal(coin.gameplay_effect,false);
  assert.equal(coin.randomness_effect,false);
  assert.equal(ledger.safety_policy.battle_coin_never_affects_server_randomness,true);
  assert.equal(ledger.safety_policy.battle_coin_visual_face_follows_server_result,true);
  assert.equal(ledger.safety_policy.battle_coin_client_never_generates_result,true);
});

test('V2.4.41 future card-effect flips reuse Randomization without inventing the example card',async()=>{
  const match=await read('supabase/functions/tcg-match-actions/index.ts');
  const progress=await read('tcg-master-plan-progress-v2.4.41.md');
  assert.ok(match.includes('runtimeV02FlipCoin'));
  assert.equal(match.includes('function coin(){'),false);
  assert.ok(progress.includes('illustrative only'));
  assert.ok(progress.includes('no new card'));
});
