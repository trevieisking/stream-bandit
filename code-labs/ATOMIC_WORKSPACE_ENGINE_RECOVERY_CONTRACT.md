# Code Labs Atomic Workspace Engine Recovery Contract

Status: authoritative recovery contract for the clean recovery branch only.

Repository: `trevieisking/stream-bandit`

Recovery branch: `fix/code-labs-master-recovery-atomic-engine-20260728`

Source commit: `d1f5723a97951c28e22651029c0fa7fe02c6d91c`

This document defines the implementation and evidence gates required before the atomic workspace engine, Writer orchestration, migration, Edge Function deployment, or Command Centre promotion can proceed.

## 1. Recovery objective

Replace the current pre-increment workspace guard with an operation engine that guarantees all of the following:

1. A failed database action consumes no workspace state version.
2. A successful database action advances the workspace state exactly once.
3. A duplicate delivery returns the original completed response and original completed workspace version.
4. A delayed duplicate never reports a later workspace version.
5. A transaction failure leaves no partial record, receipt, checkpoint, selection, workflow, candidate, handoff, Code God or Writer-request mutation.
6. A stale or interrupted worker cannot complete after a newer worker has obtained authority.
7. Every mutating workspace route uses the same operation identity, transaction and fencing rules.
8. GitHub Writer execution is recoverable and idempotent even though GitHub cannot participate in the PostgreSQL transaction.

## 2. Evidence from the rejected implementation

PR `#500` is not the recovery source of truth. It may be consulted for useful ideas, but its implementation must not be copied as a complete solution.

The exact current reviewed head was `87e2da5b2692906cded922ce36368d206cf5c2f0`. The unresolved review findings establish these required corrections:

- stale running leases must have a bounded and safe recovery route;
- legacy selection, workflow, reset and intake transitions must honour the same guard;
- a failed callback must not release an operation after partial durable side effects;
- completed replay must return the operation's original completed state version;
- source-structure tests are not database integration evidence.

## 3. Database-only action boundary

Every database-only workspace action must be committed by one PostgreSQL transaction.

The transaction must include, as applicable:

- operation-run acquisition;
- owner and selected-record validation;
- target record update or insert;
- workspace selection or workflow-step update;
- checkpoint insert;
- action receipt insert;
- candidate, Repo Desk, Code God or Writer-request metadata update;
- Writer-request queue insert;
- workspace state-version increment;
- completed operation result persistence;
- lease release.

No TypeScript sequence of separate REST writes may be described as atomic.

### Required action coverage

The transaction engine must cover all mutating internal routes, including:

- `file.intake`;
- `setup.save`;
- `project.select`;
- `file.select`;
- `job.select`;
- `packet.select`;
- `test.select`;
- `file.replace_current`;
- `repair.save`;
- `packet.build`;
- `canvas.save_candidate`;
- `candidate.save`;
- `candidate.accept` while that capability remains exposed;
- `test.record`;
- `checkpoint.create`;
- `workflow.advance`;
- `workflow.reset`;
- `repo.prepare_handoff`;
- `code_god.review`;
- `github.writer_prepare`;
- eligible undo operations.

Read-only actions must not acquire or increment workspace state.

## 4. Operation identity

The operation identity must be deterministic for equivalent delivery and different for materially different work.

The canonical identity input must include:

- owner ID;
- exact action name;
- expected workspace state version;
- canonical action arguments after undefined values are removed and object keys are sorted;
- immutable source or candidate hashes when the action depends on source content;
- exact repository, branch and path when the action concerns GitHub.

The operation identity must not depend on object key order, connector delivery ID, current clock time, random UUID generation, or a mutable workspace version read after the request began.

## 5. Transaction state machine

The durable operation record must expose explicit states. At minimum:

- `running`;
- `completed`;
- `failed_validation`;
- `interrupted`;
- `external_pending` for the Writer boundary;
- `external_applied` for GitHub success awaiting database reconciliation.

A completed record must persist:

- expected state version;
- completed state version;
- exact stored result;
- action name;
- operation identity;
- fencing token;
- completion timestamp.

A duplicate completed operation must return the stored result and stored completed state version without executing any mutation.

## 6. Fencing token

Each acquired operation must receive a monotonically increasing fencing token owned by the workspace.

Every completion, failure, reconciliation and lease-release call must prove:

- owner ID;
- operation ID;
- expected state version;
- exact fencing token.

A stale worker holding an older fencing token must be rejected even when it resumes after the lease timeout.

A different operation must not silently reclaim an interrupted operation. Recovery must either:

1. resume the same deterministic operation and fencing-safe phase; or
2. use an explicit owner-confirmed recovery action that proves no unrecorded durable effect can be duplicated.

## 7. Failure semantics

Validation must occur before durable mutation whenever possible.

For database-only actions, any exception inside the transaction must roll back:

- record changes;
- inserted versions;
- inserted receipts;
- queued Writer requests;
- metadata changes;
- workspace selection changes;
- workspace workflow changes;
- state-version changes;
- operation completion.

A failed action must therefore leave the workspace and all action-owned rows exactly as they were before the transaction.

## 8. Exact replay semantics

Completed replay must return the original operation response.

The response must include the original completed workspace version, not the current workspace version.

Example:

- operation A completes from state `800` to `801`;
- operation B later completes from `801` to `802`;
- a delayed duplicate of operation A must return `801`, not `802`.

## 9. Writer external-operation boundary

GitHub cannot be included in the PostgreSQL transaction. Writer must therefore use a durable fenced saga rather than pretending to be atomic.

### Required Writer binding

The queued request must bind immutable proof for:

- owner;
- repository;
- existing non-protected branch;
- target path;
- action type;
- complete content hash;
- expected current GitHub blob SHA for updates, or explicit absence proof for new files;
- commit message;
- pull-request title and body;
- Code God version;
- Code God PASS outcome;
- Code God handoff hash;
- Code God proposed hash;
- Code God source file ID;
- Code God review timestamp;
- operation ID;
- Writer fencing token.

### Required Writer phases

At minimum:

1. `queued`;
2. `processing` with a fencing token;
3. `github_committed` with immutable commit and content SHAs;
4. `pr_opened` with exact pull-request number, URL, base branch and head branch;
5. `completed` after database reconciliation.

### Writer retry rules

- Before committing, Writer must check whether the branch already contains the reviewed content hash at the target path.
- If the exact reviewed content is already present, Writer must reuse the existing commit proof rather than create another commit.
- After GitHub commit success, the commit SHA and content SHA must be durably recorded before any later phase is treated as complete.
- If database recording fails after GitHub success, a retry must reconcile the existing GitHub commit and must not create a second commit.
- Pull-request reuse must be restricted to the exact repository, head branch and verified default base branch.
- A stored pull-request number must be re-read and verified before replay is reported as complete.
- A stale Writer worker with an older fencing token must not update request status.

## 10. Branch creation boundary

Branch creation is an external GitHub action and follows the same fenced recovery principles.

A branch creation retry must:

- verify the exact requested branch;
- verify the exact immutable source commit;
- return the existing branch when it already points to that commit;
- fail when it exists at a different commit;
- never update or force-move an existing branch;
- never create or alter a protected branch;
- record branch proof through a fenced reconciliation step.

## 11. Required automated evidence

Source inspection alone is insufficient.

### Pure and source-contract tests

These may prove:

- canonical operation identity;
- stable argument ordering;
- action/path/hash binding;
- parser and result-shape rules;
- source routing through the new transaction engine;
- absence of the old pre-increment guard.

### Database integration tests

A disposable or isolated database must prove:

1. failed validation consumes no state;
2. forced transaction failure rolls back every mutation;
3. success advances state once;
4. immediate duplicate replays the original result;
5. delayed duplicate replays the original completed version;
6. concurrent different operation is blocked;
7. stale fencing token is rejected;
8. same-operation recovery cannot duplicate a checkpoint;
9. same-operation recovery cannot duplicate a receipt;
10. same-operation recovery cannot duplicate a Writer request;
11. selection, undo, advance, reset and intake use the same engine;
12. no legacy route can increment state outside the engine.

### Writer integration tests

A controlled test repository and branch must prove:

1. one reviewed request creates at most one content commit;
2. retry after simulated database failure reuses the existing commit;
3. retry after PR creation reuses the exact PR;
4. stored PR proof is reverified;
5. stale Writer fencing token is rejected;
6. wrong branch, wrong path, wrong hash and changed Code God proof are blocked;
7. main, merge, delete, force-push and workflow modification remain impossible.

## 12. Deployment sequence

No production migration or Edge Function deployment occurs until all branch evidence passes.

Required order:

1. add failing regression tests that express this contract;
2. implement the database transaction engine;
3. make the regression tests pass locally or in an isolated test environment;
4. implement fenced Writer reconciliation;
5. pass Writer integration tests;
6. open a draft PR from the recovery branch;
7. run Code God on the exact PR head;
8. run exact-head GitHub workflows and combined status checks;
9. resolve every material review finding on that exact head;
10. apply the migration to an isolated Supabase development branch;
11. run database integration tests there;
12. deploy the Edge Function only to the isolated branch or approved test target;
13. complete two end-to-end drills;
14. obtain a fresh PROMOTE decision for production migration and deployment;
15. migrate first, deploy second, smoke-test immediately, and retain rollback proof.

## 13. Prohibited shortcuts

The recovery must not:

- pre-increment state before the action succeeds;
- call several REST writes and label the sequence atomic;
- release an interrupted operation without proving retry safety;
- allow a different operation to reclaim an unknown partial action;
- return the current workspace version for an old completed replay;
- use source-only tests as runtime database evidence;
- reuse a Writer request without revalidating immutable Code God proof;
- create a second GitHub commit when the reviewed content already exists;
- write to `main`;
- merge, delete, force-push or modify workflows;
- apply the migration or deploy the Edge Function before isolated integration evidence passes.

## 14. Completion definition

This battle passes only when:

- every internal mutating action uses the transactional engine;
- every external GitHub action uses fenced reconciliation;
- all required source, database and Writer integration tests pass;
- a draft PR exists on the clean recovery branch;
- the exact current PR head has Code God PASS;
- exact-head workflow and combined-status evidence is present;
- there are no unresolved material review findings;
- two end-to-end drills complete without duplicate rows, commits, PRs or state increments;
- no production mutation has occurred before a separate production PROMOTE decision.
