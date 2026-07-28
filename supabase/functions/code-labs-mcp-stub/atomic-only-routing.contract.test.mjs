import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const guardedUrl = new URL('./guarded-workspace.ts', import.meta.url);
const mainUrl = new URL('./main.ts', import.meta.url);
const atomicUrl = new URL('./atomic-workspace-engine.ts', import.meta.url);

async function sources() {
  const [guarded, main, atomic] = await Promise.all([
    readFile(guardedUrl, 'utf8'),
    readFile(mainUrl, 'utf8'),
    readFile(atomicUrl, 'utf8'),
  ]);
  return { guarded, main, atomic };
}

function extractCalls(source, callee) {
  const calls = [];
  const marker = `${callee}(`;
  let cursor = 0;

  while ((cursor = source.indexOf(marker, cursor)) >= 0) {
    let index = cursor + marker.length;
    let depth = 1;
    let quote = '';
    let escaped = false;

    for (; index < source.length && depth > 0; index += 1) {
      const char = source[index];
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === quote) {
          quote = '';
        }
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      }
    }

    calls.push(source.slice(cursor, index));
    cursor = Math.max(index, cursor + marker.length);
  }

  return calls;
}

function directDatabaseMutationCalls(source) {
  return extractCalls(source, 'rest').filter((call) =>
    /code_labs_(?:workspace_state|projects|files|jobs|packets|test_runs|action_receipts|versions|write_requests)/.test(call) &&
    /method\s*:\s*["'`](?:POST|PATCH|DELETE)["'`]/.test(call)
  );
}

test('V50 routing: the strict atomic RPC remains the only internal transaction entrance', async () => {
  const { atomic } = await sources();

  assert.match(atomic, /rpc\/code_labs_execute_workspace_action_strict/);
  assert.doesNotMatch(
    atomic,
    /rest\(["'`]rpc\/code_labs_execute_workspace_action["'`]/,
    'The client must never call the raw transaction RPC.',
  );
});

test('V50 routing: guarded workspace mutations use the atomic engine only', async () => {
  const { guarded } = await sources();

  assert.match(
    guarded,
    /executeAtomicWorkspaceAction/,
    'The guarded workspace router must import and call the atomic engine.',
  );
  assert.doesNotMatch(guarded, /code_labs_reserve_workspace_state_version/);
  assert.doesNotMatch(guarded, /\breserveStateVersion\b/);
  assert.doesNotMatch(guarded, /\bguarded\s*\(/);
  assert.doesNotMatch(guarded, /\brunActionBase\b/);
});

test('V50 routing: File Lab has no separate reservation or multi-write lane', async () => {
  const { main } = await sources();

  for (const forbidden of [
    'INTAKE_RESERVATION_PREFIX',
    'intakeReservationStep',
    'intakeReserved',
    'releaseIntakeReservation',
    'intakeReceipt',
    'intakeFile',
    'actionsWithIntake',
  ]) {
    assert.doesNotMatch(
      main,
      new RegExp(`\\b${forbidden}\\b`),
      `The V50 entrypoint must not retain the separate File Lab lane: ${forbidden}`,
    );
  }
  assert.doesNotMatch(
    main,
    /String\(args\.action\s*\|\|\s*["'`]["'`]\)\s*===\s*["'`]file\.intake["'`]\s*\?/,
    'file.intake must enter the same runAction route as every other action.',
  );
});

test('V50 routing: routers perform no direct Code Labs table mutations', async () => {
  const { guarded, main } = await sources();
  const guardedWrites = directDatabaseMutationCalls(guarded);
  const mainWrites = directDatabaseMutationCalls(main);

  assert.deepEqual(
    guardedWrites,
    [],
    'guarded-workspace.ts must not mutate Code Labs tables outside the atomic RPC.',
  );
  assert.deepEqual(
    mainWrites,
    [],
    'main.ts must not mutate Code Labs tables outside the atomic RPC.',
  );
});

test('V50 routing: no fallback selector can choose between legacy and atomic engines', async () => {
  const { guarded, main } = await sources();
  const combined = `${guarded}\n${main}`;

  assert.doesNotMatch(combined, /legacy[^\n]{0,80}(?:fallback|engine|reservation)/i);
  assert.doesNotMatch(combined, /(?:fallback|prefer|use)[^\n]{0,80}legacy/i);
  assert.doesNotMatch(combined, /ATOMIC[^\n]{0,80}\?[^\n]{0,80}(?:legacy|guarded)/i);
});

test('evidence boundary: this red gate is source evidence, not runtime proof', () => {
  const evidence = {
    source_contract: true,
    current_source_expected_to_fail_until_v50_cutover: true,
    database_integration: false,
    external_github_reconciliation: false,
    deployment_authorised: false,
  };

  assert.equal(evidence.source_contract, true);
  assert.equal(evidence.current_source_expected_to_fail_until_v50_cutover, true);
  assert.equal(evidence.database_integration, false);
  assert.equal(evidence.external_github_reconciliation, false);
  assert.equal(evidence.deployment_authorised, false);
});
