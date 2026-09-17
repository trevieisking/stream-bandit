import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL(
  '../../supabase/migrations/20260917142500_tcg_matchmaking_locked_room_lifetime.sql',
  import.meta.url,
);
const migration = await readFile(migrationUrl, 'utf8');

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('G0R-07 keeps queue expiry on waiting rooms but not matched rooms', () => {
  const existingRoomLookup = between(
    migration,
    '-- Idempotent retry/poll: reuse this user\'s current matchmaking room.',
    'if found then',
  );

  assert.match(
    existingRoomLookup,
    /\(r\.status='waiting' and r\.expires_at > now\(\)\)/,
    'waiting-room reuse must still require an unexpired queue lifetime',
  );
  assert.match(
    existingRoomLookup,
    /or r\.status in \('locked','in_match'\)/,
    'locked/in_match rooms must remain discoverable after queue expiry',
  );
  assert.doesNotMatch(
    existingRoomLookup,
    /r\.status in \('waiting','locked','in_match'\)[\s\S]*?r\.expires_at > now\(\)/,
    'queue expiry must not gate locked/in_match room discovery',
  );
});

test('G0R-07 still closes only expired waiting queue entries', () => {
  assert.match(
    migration,
    /where room_mode='matchmaking'\s+and status='waiting'\s+and expires_at <= now\(\);/,
    'expired waiting matchmaking rooms must still be closed',
  );
});

test('G0R-07 still pairs only against unexpired waiting opponents', () => {
  const candidateLookup = between(
    migration,
    '-- Find the oldest valid opponent.',
    'if not found then',
  );

  assert.match(candidateLookup, /r\.status='waiting'/);
  assert.match(candidateLookup, /r\.expires_at > now\(\)/);
});
