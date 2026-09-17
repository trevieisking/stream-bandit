import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../../supabase/migrations/20260917144500_tcg_private_room_ready_concurrency.sql', import.meta.url),
  'utf8',
);
const privateAlpha = await readFile(
  new URL('../../supabase/functions/tcg-private-alpha-api/index.ts', import.meta.url),
  'utf8',
);

function indexOfOrFail(source, needle) {
  const index = source.indexOf(needle);
  assert.notEqual(index, -1, `missing contract fragment: ${needle}`);
  return index;
}

test('G0R-09 serializes Ready write plus aggregate count per room', () => {
  const lock = "perform pg_advisory_xact_lock(hashtextextended(p_room_id::text || ':ready',0));";
  const update = 'update public.tcg_room_members';
  const count = 'select count(*)::int, count(*) filter (where ready)::int';

  const lockIndex = indexOfOrFail(migration, lock);
  const updateIndex = indexOfOrFail(migration, update);
  const countIndex = indexOfOrFail(migration, count);

  assert.ok(lockIndex < updateIndex, 'room-scoped lock must be acquired before Ready mutation');
  assert.ok(updateIndex < countIndex, 'Ready mutation must occur before all-ready aggregate');
});

test('G0R-09 preserves deck validation and membership fences', () => {
  assert.match(migration, /not_room_member/);
  assert.match(migration, /tcg_server_validate_deck\(p_user_id,p_deck_id\)/);
  assert.match(migration, /invalid_deck/);
});

test('G0R-09 all_ready remains exactly two members and two ready members', () => {
  assert.match(migration, /'all_ready',\(v_count=2 and v_ready_count=2\)/);
});

test('G0R-09 private-alpha initializes the match from the true all_ready result', () => {
  assert.match(
    privateAlpha,
    /if\(action==="set_ready"\)[\s\S]*?if\(r\?\.all_ready\)match=await initialize\(room\)/,
  );
});

test('G0R-09 lock is transaction-scoped and room-scoped, not a global mutex', () => {
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /p_room_id::text \|\| ':ready'/);
  assert.doesNotMatch(migration, /stream-bandit-tcg-ready-global/);
});
