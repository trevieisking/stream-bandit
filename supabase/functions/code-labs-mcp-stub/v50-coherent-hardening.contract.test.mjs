import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../migrations/', import.meta.url);
const finalPath = new URL('./20260728172000_code_labs_v50_coherent_hardening.sql', root);
const markers = [
  '20260728170500_code_labs_atomic_boolean_owner_cleanup.sql',
  '20260728171000_code_labs_atomic_failure_transition_cleanup.sql',
  '20260728171500_code_labs_writer_immutable_branch_sha.sql',
];

async function finalSql() {
  return readFile(finalPath, 'utf8');
}

function mustContain(source, markersToFind) {
  for (const marker of markersToFind) {
    assert.ok(source.includes(marker), `missing contract marker: ${marker}`);
  }
}

test('coherent hardening owns the exact immutable branch SHA pair and compatibility alias', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    'add column if not exists github_base_sha text',
    'add column if not exists github_head_sha text',
    'github_head_branch_sha = github_head_sha',
    'new.github_base_sha := v_base_sha',
    'new.github_head_sha := v_head_sha',
    'new.github_head_branch_sha := v_head_sha',
  ]);
});

test('untrusted supplied proof conflicts fail closed before canonical values are assigned', async () => {
  const sql = await finalSql();
  const assignment = sql.indexOf('new.github_base_sha := v_base_sha');
  for (const marker of [
    'writer_base_sha_conflict',
    'writer_head_sha_conflict',
    'writer_head_sha_alias_conflict',
    'writer_branch_verified_at_conflict',
  ]) {
    const position = sql.indexOf(marker);
    assert.ok(position >= 0, `missing ${marker}`);
    assert.ok(position < assignment, `${marker} must be checked before canonical assignment`);
  }
});

test('proof trigger revalidates every authority-bearing identity field', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    'requested_by,',
    'repo,',
    'path,',
    'operation_id,',
    'github_base_sha,',
    'github_head_sha,',
    'code_god_source_file_id',
  ]);
});

test('strict boolean helper is the sole post-cutover boolean owner', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    'drop function if exists public.code_labs_jsonb_boolean',
    'code_labs_require_jsonb_boolean(jsonb, boolean, text)',
    'grant execute on function public.code_labs_require_jsonb_boolean',
  ]);
  assert.doesNotMatch(sql, /create\s+or\s+replace\s+function\s+public\.code_labs_jsonb_boolean/i);
});

test('final failure transition preserves action identity and distinct validation/interruption fences', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    'operation_identity_mutation_forbidden',
    "new.status = 'failed_validation'",
    'new.fencing_token := null',
    "new.status in ('failed_validation', 'interrupted')",
    'v_fencing_token < 1',
    'operation_failure_fence_failed',
  ]);
});

test('protected branches and exact content/blob proofs remain fail closed', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    "'main', 'master', 'production', 'live', 'gh-pages'",
    'writer_protected_branch_invalid',
    'writer_content_hash_invalid',
    'writer_expected_blob_invalid',
    'writer_review_binding_invalid',
    'writer_handoff_branch_binding_invalid',
  ]);
});

test('earlier cleanup/finaliser files are marker-only and cannot compete for ownership', async () => {
  const forbidden = /\b(create|alter|drop|grant|revoke)\b[\s\S]{0,80}\b(function|trigger|constraint|table)\b/i;
  for (const name of markers) {
    const source = await readFile(new URL(`./${name}`, root), 'utf8');
    assert.match(source, /Folded into 20260728172000_code_labs_v50_coherent_hardening\.sql/);
    assert.doesNotMatch(source, forbidden, `${name} must be marker-only`);
  }
});

test('evidence boundary remains source-only', () => {
  const evidence = {
    source_contract: true,
    isolated_postgres_rerun: false,
    full_migration_replay: false,
    deployed: false,
  };
  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.isolated_postgres_rerun, false);
  assert.equal(evidence.full_migration_replay, false);
  assert.equal(evidence.deployed, false);
});
