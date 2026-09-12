import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const listener = fs.readFileSync(
  'supabase/functions/_shared/tcg-match-event-listener-v0-2.ts',
  'utf8',
);

function caseBody(name, nextName) {
  const start = listener.indexOf(`case "${name}":`);
  const end = listener.indexOf(`case "${nextName}":`, start + 1);
  assert.notEqual(start, -1, `missing predicate case: ${name}`);
  assert.notEqual(end, -1, `missing following predicate case: ${nextName}`);
  return listener.slice(start, end);
}

test('Event Listener event context exposes the distinct source controller', () => {
  assert.match(listener, /source_controller_seat\?: 1 \| 2;/);
});

test('event_controller_is_opponent compares the affected controller only', () => {
  const body = caseBody(
    'event_controller_is_opponent',
    'source_controller_is_self',
  );
  assert.ok(
    body.includes(
      'event.controller_seat === (candidate.seat === 1 ? 2 : 1)',
    ),
  );
  assert.equal(body.includes('source_controller_seat'), false);
});

test('source_controller_is_self compares the effect source controller only', () => {
  const body = caseBody(
    'source_controller_is_self',
    'event_controller_is_active_seat',
  );
  assert.ok(
    body.includes('event.source_controller_seat === candidate.seat'),
  );
  assert.equal(body.includes('event.controller_seat'), false);
});
