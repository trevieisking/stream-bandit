import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const matchActions = fs.readFileSync(path.join(root, 'supabase/functions/tcg-match-actions/index.ts'), 'utf8');
const receiptMaker = fs.readFileSync(path.join(root, 'supabase/functions/_shared/tcg-match-presentation-receipt-v0-2.ts'), 'utf8');

test('canonical match commit creates one server presentation receipt before player views are persisted', () => {
  assert.match(matchActions, /runtimeV02BuildMatchPresentationReceipt\(\{event_type:eventType,payload:payload\|\|\{\},revision:next,state:s\}\)/);
  assert.match(matchActions, /const vv=views\(s,next,presentation\)/);
  assert.match(matchActions, /p_player_one_view:vv\.p1/);
  assert.match(matchActions, /p_player_two_view:vv\.p2/);
});

test('player views filter the same authoritative receipt separately for each seat', () => {
  assert.match(matchActions, /runtimeV02PresentationEnvelopeForViewer\(presentation,1\)/);
  assert.match(matchActions, /runtimeV02PresentationEnvelopeForViewer\(presentation,2\)/);
  assert.match(matchActions, /presentation,pending_resolution/);
});

test('receipt maker is event-family based and has no launch card-id branches', () => {
  assert.match(receiptMaker, /eventType\.startsWith\("attack"\)/);
  assert.match(receiptMaker, /eventType\.startsWith\("ability"\)/);
  assert.match(receiptMaker, /eventType\.startsWith\("play_creature"\)/);
  assert.match(receiptMaker, /eventType\.startsWith\("attach_essence"\)/);
  assert.doesNotMatch(receiptMaker, /card_id\s*===\s*["']/);
  assert.doesNotMatch(receiptMaker, /shuffle_seed|Math\.random|crypto\.randomUUID/);
});

test('hidden Reward movement receipt carries count but never hidden card uids', () => {
  assert.match(receiptMaker, /eventType === "take_reward"/);
  assert.match(receiptMaker, /from: anchor\(actor, "rewards"\)/);
  assert.match(receiptMaker, /to: anchor\(actor, "hand"\)/);
  const rewardBlock = receiptMaker.slice(
    receiptMaker.indexOf('eventType === "take_reward"'),
    receiptMaker.indexOf('return order;', receiptMaker.indexOf('eventType === "take_reward"'))
  );
  assert.doesNotMatch(rewardBlock, /card_uids/);
});
