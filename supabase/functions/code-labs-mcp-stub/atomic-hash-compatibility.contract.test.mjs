import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL(
  '../../migrations/20260728170000_code_labs_atomic_workspace_engine_hardening.sql',
  import.meta.url,
);

async function migration() {
  return await readFile(migrationUrl, 'utf8');
}

function stripDollarQuotedBodies(source) {
  const opener = /\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/g;
  let output = '';
  let cursor = 0;
  let match;

  while ((match = opener.exec(source))) {
    const delimiter = match[0];
    const closing = source.indexOf(delimiter, opener.lastIndex);
    if (closing < 0) return output + source.slice(cursor);
    output += source.slice(cursor, match.index);
    output += `${delimiter}/* body omitted */${delimiter}`;
    cursor = closing + delimiter.length;
    opener.lastIndex = cursor;
  }

  return output + source.slice(cursor);
}

test('legacy hash gate: non-atomic rows return unchanged', async () => {
  const sql = await migration();

  assert.match(
    sql,
    /if v_operation_text is null and v_fence_text is null then\s+return new;/i,
    'Legacy and non-atomic updates must remain readable and unchanged.',
  );
  assert.match(
    sql,
    /if v_operation_text is null or v_fence_text is null then[\s\S]*?atomic_hash_operation_invalid/i,
    'Partial transaction context must fail closed.',
  );
});

test('legacy hash gate: atomic context is bound to a running fenced operation', async () => {
  const sql = await migration();

  assert.match(sql, /current_setting\('code_labs\.operation_id', true\)/i);
  assert.match(sql, /current_setting\('code_labs\.fencing_token', true\)/i);
  assert.match(
    sql,
    /from public\.code_labs_action_runs r[\s\S]*?r\.owner_id = new\.owner_id[\s\S]*?r\.operation_id = v_operation_id[\s\S]*?r\.status = 'running'[\s\S]*?r\.fencing_token = v_fencing_token/i,
    'The trigger must verify the durable running action and exact fence.',
  );
});

test('legacy hash gate: metadata-only updates do not rewrite source or candidate hashes', async () => {
  const sql = await migration();

  assert.match(sql, /v_source_changed boolean := false/i);
  assert.match(sql, /v_candidate_changed boolean := false/i);
  assert.match(sql, /if v_source_changed then[\s\S]*?v_canonical_source_hash/i);
  assert.match(sql, /if v_candidate_changed then[\s\S]*?v_canonical_candidate_hash/i);
  assert.doesNotMatch(
    sql,
    /begin\s+new\.current_hash := public\.code_labs_sha256_text/i,
    'The trigger must not unconditionally replace current_hash on every watched update.',
  );
});

test('legacy hash gate: changed atomic content uses sha256-utf8-v1', async () => {
  const sql = await migration();

  assert.match(sql, /v_hash_version constant text := 'sha256-utf8-v1'/i);
  assert.match(
    sql,
    /v_canonical_source_hash := public\.code_labs_sha256_text\(coalesce\(new\.current_code, ''\)\)/i,
  );
  assert.match(
    sql,
    /v_canonical_candidate_hash := public\.code_labs_sha256_text\(v_candidate\)/i,
  );
  assert.match(sql, /'hash_version', v_hash_version/i);
  assert.match(sql, /'candidate_hash_version', v_hash_version/i);
});

test('legacy hash gate: previous hash evidence is preserved before canonical replacement', async () => {
  const sql = await migration();

  assert.match(sql, /'legacy_hash', old\.current_hash/i);
  assert.match(sql, /'legacy_hash_version'/i);
  assert.match(sql, /'legacy_candidate_hash', v_old_metadata->>'candidate_hash'/i);
  assert.match(sql, /'candidate_legacy_hash_version'/i);
  assert.match(sql, /'legacy-unclassified'/i);
});

test('legacy hash gate: migration application performs no top-level file backfill', async () => {
  const sql = await migration();
  const topLevelSql = stripDollarQuotedBodies(sql);

  assert.doesNotMatch(
    topLevelSql,
    /update\s+public\.code_labs_files/i,
    'Post-cutover installation must not silently rewrite existing file rows.',
  );
});

test('evidence boundary: source contract is not disposable-database proof', () => {
  const evidence = {
    source_contract: true,
    legacy_row_runtime: false,
    metadata_only_runtime: false,
    rollback_runtime: false,
    concurrency_runtime: false,
    production_authorised: false,
  };

  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.legacy_row_runtime, false);
  assert.equal(evidence.metadata_only_runtime, false);
  assert.equal(evidence.rollback_runtime, false);
  assert.equal(evidence.concurrency_runtime, false);
  assert.equal(evidence.production_authorised, false);
});
