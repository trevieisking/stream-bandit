import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../migrations/', import.meta.url);
const foundationPath = new URL('./20260728143000_code_labs_atomic_workspace_engine.sql', root);
const finalPath = new URL('./20260728172000_code_labs_v50_coherent_hardening.sql', root);
const markers = [
  '20260728170500_code_labs_atomic_boolean_owner_cleanup.sql',
  '20260728171000_code_labs_atomic_failure_transition_cleanup.sql',
  '20260728171500_code_labs_writer_immutable_branch_sha.sql',
];

async function foundationSql() {
  return readFile(foundationPath, 'utf8');
}

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
    'writer_bounded_review_binding_invalid',
    'writer_handoff_branch_binding_invalid',
  ]);
});


test('foundation transports exact independent evidence IDs and advisory Code God scope', async () => {
  const sql = await foundationSql();
  mustContain(sql, [
    'independent_evidence_checkpoint_id',
    'independent_evidence_receipt_id',
    'independent_evidence_ids_invalid',
    'bounded_code_god_advisory_required',
    'code-labs-writer-evidence-request-v1',
    'validated_by_final_hardening_trigger',
  ]);
  assert.doesNotMatch(
    sql,
    /Atomic Code Labs request: reviewed branch and draft PR only\./,
    'The old static safety note must not survive the independent evidence cutover.',
  );
});

test('final proof trigger owns independent checkpoint, receipt, plan and checklist validation', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    'writer_independent_evidence_request_invalid',
    'writer_independent_checkpoint_invalid',
    'writer_independent_checkpoint_receipt_invalid',
    'writer_independent_checkpoint_packet_invalid',
    'writer_master_plan_binding_invalid',
    'writer_independent_evidence_binding_invalid',
    'master-checklist-independent-gate-v1',
    "v_master_plan.filename <> 'code-labs/CODE-LABS-V1-PLAN.md'",
    "metadata->'exact_checklist'->>'checklist_id'",
    "metadata->'exact_checklist'->>'checklist_version'",
  ]);
});

test('final proof trigger canonicalises safety_note and detects later tampering', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    "'kind', 'code-labs-writer-evidence-binding-v1'",
    "'checkpoint_note_hash', v_checkpoint_note_hash",
    'new.safety_note := v_evidence_binding::text',
    'writer_independent_evidence_binding_changed',
    'writer_independent_evidence_binding_too_large',
    'code_god_review_version,',
    'code_god_outcome,',
    'code_god_reviewed_at,',
    'safety_note',
  ]);
});

test('independent evidence binds current source, candidate, handoff, review and branch head', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    "v_evidence_packet->>'github_head_sha'",
    "v_evidence_packet->>'source_file_id'",
    "v_evidence_packet->>'source_hash'",
    "v_evidence_packet->>'candidate_hash'",
    "v_evidence_packet->>'handoff_hash'",
    "v_evidence_packet->>'code_god_review_version'",
    "v_evidence_packet->>'code_god_scope_outcome'",
    "v_evidence_packet->>'code_god_trust_state'",
    "public.code_labs_sha256_text(coalesce(v_checkpoint.code, ''))",
  ]);
});

test('independent check manifest and limitations cannot be empty', async () => {
  const sql = await finalSql();
  mustContain(sql, [
    "jsonb_typeof(v_evidence_packet->'checks_run') <> 'array'",
    "jsonb_array_length(v_evidence_packet->'checks_run') < 1",
    "jsonb_typeof(v_evidence_packet->'checks_not_run') <> 'array'",
    "jsonb_array_length(v_evidence_packet->'limitations') < 1",
    "jsonb_array_length(v_evidence_packet->'evidence_sources') < 1",
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
    independent_checkpoint_runtime: false,
    protected_writer_runtime: false,
    deployed: false,
  };
  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.isolated_postgres_rerun, false);
  assert.equal(evidence.full_migration_replay, false);
  assert.equal(evidence.independent_checkpoint_runtime, false);
  assert.equal(evidence.protected_writer_runtime, false);
  assert.equal(evidence.deployed, false);
});
