# Code Labs Atomic Expand–Cutover Compatibility Contract

**Status:** authoritative Battle 2 compatibility gate for the clean recovery branch.

**Repository:** `trevieisking/stream-bandit`

**Recovery branch:** `fix/code-labs-master-recovery-atomic-engine-20260728`

This contract breaks the recurring Code Labs code/database deployment loop. It supplements the Atomic Workspace Engine Recovery Contract and controls how the database foundation, Edge Function cutover and enforcement migration may advance.

## 1. Proven live starting point

The current live system must be treated as one immutable compatibility target until an isolated replacement passes.

- `code-labs-mcp-stub` V49 is active.
- V49 uses `code_labs_reserve_workspace_state_version` and separate REST writes.
- The live database does not expose `code_labs_execute_workspace_action`.
- The live database does not contain the proposed action-run schema.
- There are no active queued or processing Writer requests at the recorded audit point.
- Existing job/file, packet/job and test/job relationships passed count-only hierarchy checks.
- Existing file and candidate hashes do not all use the proposed raw-text convention.
- PostgreSQL logs contain a prior missing-column failure for `action_reservation_id`, proving that code/schema skew has already occurred.

These facts are evidence for sequencing. They do not authorise any live mutation.

## 2. Core rule

> A schema change may reach production only when it is backward compatible with the currently deployed function. A function change may reach production only when every schema object it requires already exists. Enforcement may begin only after the new function has passed live smoke tests.

There must never be a deployed function that chooses between a legacy mutation engine and an atomic mutation engine.

The staged database may temporarily contain unused additive objects, but one deployed function version must own one mutation route only.

## 3. Four controlled phases

### Phase A — source-only recovery

Allowed:

- recovery-branch contracts;
- red and green source tests;
- migration candidates;
- atomic-only Edge Function candidate;
- isolated test fixtures;
- exact diff and static review.

Prohibited:

- production migration;
- production Edge Function deployment;
- production data backfill;
- production trigger creation;
- removal of the live reservation RPC;
- PR promotion claims based only on source inspection.

### Phase B — isolated Supabase branch

A Supabase development branch may be created only after its cost is retrieved and the user explicitly confirms that cost.

Required order:

1. create a fresh development branch from the production schema;
2. apply the backward-compatible expansion migration;
3. prove the old V49 contract still works against the expanded schema;
4. deploy the atomic-only candidate to the development branch;
5. run database rollback, replay, concurrency and fencing tests;
6. run Writer reconciliation tests against a controlled existing GitHub branch;
7. apply post-cutover enforcement only after the atomic candidate passes;
8. repeat the complete smoke suite.

No production data is required on the development branch. Fixtures must be synthetic and owner-scoped.

### Phase C — production expansion and atomic cutover

Production expansion is a separate future decision. Its minimum sequence is:

1. verify that there are no active Writer requests;
2. record exact live function version and schema inventory;
3. apply only the backward-compatible expansion migration;
4. smoke-test the still-deployed V49 function;
5. stop immediately and roll back the expansion if V49 changes behaviour;
6. deploy one atomic-only V50 function;
7. smoke-test reads, one database-only action, replay, failure rollback and connector OAuth;
8. retain V49 deployment metadata for immediate function rollback.

The V50 deployment must not contain the old reservation helper, old File Lab reservation lane, callback-based multi-REST mutation wrapper, dual-write switch, shadow-write switch or fallback mutation engine.

### Phase D — post-cutover enforcement

Only after V50 passes live smoke tests may enforcement be considered.

Enforcement may:

- revoke or remove the legacy reservation RPC;
- add guards that reject direct legacy mutation routes;
- add hierarchy triggers after compatibility proof;
- enforce Writer phase and branch proof;
- enforce canonical hash rules after a separately reviewed compatibility/backfill step.

Enforcement must not:

- silently rewrite stored hashes;
- invalidate working candidate metadata;
- alter existing completed Writer proof;
- change live rows without a counted preview and rollback plan;
- be bundled into the initial expansion migration.

## 4. Migration separation

### Expansion migration

The expansion migration may only add backward-compatible objects required by the atomic candidate:

- new nullable columns or columns with safe defaults;
- new action-run table;
- new indexes on new operation identifiers;
- new RPCs that the old function does not call;
- new grants limited to service-role execution.

It must not:

- create triggers on existing working tables;
- drop or revoke the legacy reservation RPC;
- change existing Writer statuses;
- require operation IDs on legacy rows;
- enforce a new hash convention on existing file rows;
- change current V49 REST-write semantics.

### Enforcement migration

The hardening/enforcement migration is **POST-CUTOVER ONLY**.

It may not be applied while V49 is active. Its filename or header must state that boundary explicitly, and automated tests must reject it as an expansion migration.

## 5. Hash compatibility gate

Hash format is a versioned data contract, not an implementation detail.

Before any file or candidate hash trigger is enabled:

1. inventory current hash conventions using count-only SQL;
2. define one canonical algorithm and byte encoding;
3. update the atomic client and PostgreSQL helper to the same algorithm;
4. classify existing rows as canonical, legacy-known or unknown;
5. preserve original hashes in auditable metadata or a migration ledger;
6. backfill only in an isolated database first;
7. prove that V49 can still read the expanded rows;
8. obtain a separate production decision before any live backfill.

A trigger must not reject or silently rewrite a legacy row merely because unrelated metadata is updated.

## 6. Writer compatibility gate

The database and GitHub Writer are a fenced saga, not one transaction.

Before cutover:

- there must be no active Writer requests;
- existing `pr_opened`, `closed` and `failed` rows must remain readable;
- new atomic Writer fields must be nullable for legacy rows;
- atomic rows must bind operation ID, fencing token, branch SHA, base branch, head branch, content hash, expected blob proof and Code God proof;
- Writer must reconcile an already-created commit or PR rather than create a duplicate;
- the database expansion must not force V49 to populate fields it does not know.

## 7. Rollback points

| Stage | Rollback action |
|---|---|
| Isolated expansion fails | Reset or discard the development branch; production remains unchanged |
| Isolated atomic deployment fails | Restore the previous development-branch function version |
| Production expansion breaks V49 | Revert only the additive expansion using the prepared rollback migration; do not deploy V50 |
| V50 deployment fails smoke | Restore V49 immediately; leave backward-compatible expansion objects unused |
| Enforcement fails | Revert enforcement while keeping V50 and expansion schema intact |

Rollback must never require rewriting Git history, force-pushing, deleting production rows or moving an existing GitHub branch.

## 8. Required compatibility evidence

The following evidence is required before production expansion:

- exact production schema inventory;
- exact production Edge Function version and source inventory;
- count-only data compatibility report;
- no active Writer requests;
- passing source-contract tests;
- passing disposable-database integration tests;
- passing isolated old-function-on-expanded-schema smoke;
- passing isolated atomic-function smoke;
- rollback scripts and proof;
- exact-head Code God and GitHub status evidence after a draft PR exists.

No single source of evidence may substitute for another.

## 9. Immediate Battle 2 direction

1. keep production unchanged;
2. classify the existing foundation migration as expansion candidate only;
3. classify the current hardening migration as post-cutover only;
4. add compatibility tests that reject enforcement inside expansion;
5. remove hash enforcement from the pre-cutover path;
6. standardise hash semantics in source and tests;
7. finish the atomic-only V50 candidate;
8. prepare isolated database fixtures;
9. request Supabase branch cost confirmation only when the branch bundle is ready;
10. do not open a PR until the isolated plan is coherent and source gates are green.

## 10. Completion definition

This compatibility battle passes only when the following three combinations have been proven independently:

1. old V49 + old schema;
2. old V49 + expanded schema;
3. atomic V50 + expanded schema + post-cutover enforcement.

The unsupported combination `atomic V50 + old schema` must fail closed before deployment, and `old V49 + enforcement schema` must never be attempted.
