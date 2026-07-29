import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../migrations/', import.meta.url);

async function read(name) {
  return await readFile(new URL(name, root), 'utf8');
}

test('failure fence: strict wrapper owns the workspace lock outside the raw call', async () => {
  const boundary = await read('20260728150000_code_labs_atomic_boolean_boundary.sql');

  const lock = boundary.indexOf('from public.code_labs_workspace_state s');
  const rawCall = boundary.indexOf('v_result := public.code_labs_execute_workspace_action(');
  assert.ok(lock >= 0 && rawCall > lock, 'The workspace lock must be acquired before the raw transaction call.');
  assert.match(boundary, /for update;[\s\S]*?set_config\('code_labs\.operation_id'/i);
  assert.match(boundary, /workspace_fencing_token \+ 1/i);
});

test('failure fence: validation failures stay free while interruptions retain the attempted fence', async () => {
  const boundary = await read('20260728150000_code_labs_atomic_boolean_boundary.sql');

  assert.match(boundary, /coalesce\(v_result->>'status', ''\) = 'interrupted'/i);
  assert.match(boundary, /set fencing_token = v_reserved_fencing_token/i);
  assert.match(boundary, /operation_failure_fence_persistence_failed/i);
  assert.doesNotMatch(
    boundary,
    /update public\.code_labs_workspace_state[\s\S]*?workspace_fencing_token/i,
    'Failure persistence must not advance workspace state or its completed fence.',
  );
});

test('failure fence: service_role cannot bypass the wrapper', async () => {
  const boundary = await read('20260728150000_code_labs_atomic_boolean_boundary.sql');

  assert.match(boundary, /revoke execute on function public\.code_labs_execute_workspace_action[\s\S]*?from service_role/i);
  assert.match(boundary, /revoke insert, update, delete on table public\.code_labs_action_runs[\s\S]*?from service_role/i);
  assert.match(boundary, /grant execute on function public\.code_labs_execute_workspace_action_strict[\s\S]*?to service_role/i);
});

test('failure fence: final guard separates validation failure from interruption', async () => {
  const cleanup = await read('20260728172000_code_labs_v50_coherent_hardening.sql');

  assert.match(cleanup, /if new\.status = 'failed_validation' then[\s\S]*?new\.fencing_token := null/i);
  assert.match(cleanup, /else[\s\S]*?current_setting\('code_labs\.fencing_token', true\)/i);
  assert.match(cleanup, /new\.fencing_token := v_fencing_token/i);
  assert.match(cleanup, /operation_identity_mutation_forbidden/i);
  assert.doesNotMatch(
    cleanup,
    /old\.fencing_token is null[\s\S]*?operation_failure_fence_failed/i,
    'A first interrupted attempt may need to persist a fence that the raw inner block rolled back.',
  );
});

test('failure fence: failed result identity and stored evidence are mandatory', async () => {
  const cleanup = await read('20260728172000_code_labs_v50_coherent_hardening.sql');

  assert.match(cleanup, /v_operation_id is distinct from old\.operation_id/i);
  assert.match(cleanup, /new\.completed_state_version is not null/i);
  assert.match(cleanup, /new\.stored_result is null/i);
  assert.match(cleanup, /new\.stored_result->>'status'/i);
  assert.match(cleanup, /jsonb_set\([\s\S]*?'\{fencing_token\}'/i);
});

test('evidence boundary: source checks do not prove PostgreSQL runtime behaviour', () => {
  const evidence = {
    source_contract: true,
    postgres_exception_fixture: false,
    concurrent_interruption_fixture: false,
    retry_fixture: false,
    production_authorised: false,
  };

  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.postgres_exception_fixture, false);
  assert.equal(evidence.concurrent_interruption_fixture, false);
  assert.equal(evidence.retry_fixture, false);
  assert.equal(evidence.production_authorised, false);
});
