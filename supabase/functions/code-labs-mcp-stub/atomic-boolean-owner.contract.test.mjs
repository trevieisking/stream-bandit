import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const boundaryUrl = new URL(
  '../../migrations/20260728150000_code_labs_atomic_boolean_boundary.sql',
  import.meta.url,
);
const hardeningUrl = new URL(
  '../../migrations/20260728170000_code_labs_atomic_workspace_engine_hardening.sql',
  import.meta.url,
);
const cleanupUrl = new URL(
  '../../migrations/20260728172000_code_labs_v50_coherent_hardening.sql',
  import.meta.url,
);

async function sources() {
  const [boundary, hardening, cleanup] = await Promise.all([
    readFile(boundaryUrl, 'utf8'),
    readFile(hardeningUrl, 'utf8'),
    readFile(cleanupUrl, 'utf8'),
  ]);
  return { boundary, hardening, cleanup, bundle: `${boundary}\n${hardening}\n${cleanup}` };
}

test('boolean owner: strict expansion helper is the final service-role owner', async () => {
  const { boundary, cleanup } = await sources();

  assert.match(boundary, /create or replace function public\.code_labs_require_jsonb_boolean/i);
  assert.match(
    boundary,
    /grant execute on function public\.code_labs_execute_workspace_action_strict[\s\S]*?to service_role/i,
  );
  assert.match(
    cleanup,
    /grant execute on function public\.code_labs_require_jsonb_boolean\(jsonb, boolean, text\)[\s\S]*?to service_role/i,
  );
});

test('boolean owner: obsolete helper is removed from the final candidate schema', async () => {
  const { cleanup } = await sources();

  assert.match(
    cleanup,
    /revoke all on function public\.code_labs_jsonb_boolean\(jsonb, boolean, text\)[\s\S]*?service_role/i,
  );
  assert.match(
    cleanup,
    /drop function if exists public\.code_labs_jsonb_boolean\(jsonb, boolean, text\)/i,
  );
});

test('boolean owner: raw atomic transaction remains unavailable to service_role', async () => {
  const { boundary } = await sources();

  assert.match(
    boundary,
    /revoke execute on function public\.code_labs_execute_workspace_action\([\s\S]*?\) from service_role/i,
  );
  assert.match(
    boundary,
    /grant execute on function public\.code_labs_execute_workspace_action_strict\([\s\S]*?\) to service_role/i,
  );
});

test('boolean owner: strict helper accepts JSON booleans but not strings', async () => {
  const { boundary } = await sources();

  assert.match(boundary, /jsonb_typeof\(p_value\) = 'boolean'/i);
  assert.doesNotMatch(boundary, /jsonb_typeof\(p_value\) = 'string'/i);
  assert.match(boundary, /writer_expected_blob_absent_invalid/i);
  assert.match(boundary, /receipt_boolean_invalid/i);
});

test('boolean owner: cleanup is owned by final hardening before deployment', async () => {
  const { cleanup } = await sources();

  assert.match(cleanup, /strict expansion helper is the sole boolean boundary/i);
  assert.match(cleanup, /drop function if exists public\.code_labs_jsonb_boolean/i);
  assert.match(cleanup, /grant execute on function public\.code_labs_require_jsonb_boolean/i);
});

test('evidence boundary: source ownership is not database execution proof', () => {
  const evidence = {
    source_contract: true,
    sql_parse: false,
    isolated_database: false,
    service_role_runtime: false,
    production_authorised: false,
  };

  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.sql_parse, false);
  assert.equal(evidence.isolated_database, false);
  assert.equal(evidence.service_role_runtime, false);
  assert.equal(evidence.production_authorised, false);
});
