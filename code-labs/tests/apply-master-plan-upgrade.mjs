import { readFile, writeFile } from 'node:fs/promises';

const path = 'code-labs/CODE-LABS-V1-PLAN.md';
const before = await readFile(path, 'utf8');
const boundary = '## Build order from here\n';
const first = before.indexOf(boundary);
if (first === -1) throw new Error('Master-plan build-order boundary not found.');
if (before.indexOf(boundary, first + boundary.length) !== -1) {
  throw new Error('Master-plan build-order boundary is ambiguous.');
}
if (before.includes('## Planned upgrade: Master Plan and Exact Checklist control pages')) {
  throw new Error('Master Plan and Exact Checklist upgrade is already recorded.');
}

const section = `## Planned upgrade: Master Plan and Exact Checklist control pages

Status: approved for design and future implementation; not yet a live page, database schema, or deployment.

### Purpose

Add two linked Code Labs control pages so the signed-in user and ChatGPT can define the exact job before work begins and verify completion against that same immutable plan at the end.

1. **Master Plan page** — the single editable source of truth for the current repair or upgrade.
2. **Exact Checklist page** — a derived scanner/checker that reads only the selected Master Plan version and reports what is required, completed, failed, blocked, not run, or awaiting user confirmation.

The Exact Checklist must never silently broaden its scope to unrelated repository files, old plans, chat history, or generic recommendations. It scans the exact selected plan version only.

### Workflow placement

The pages must appear at both ends of the canonical workflow:

- **Beginning:** open or create the Master Plan before File Lab, intake, repair work, or candidate generation.
- **End:** reopen the same plan through Exact Checklist after Preview + Test, Code God, Writer, and GitHub evidence are available.

The page-role register should eventually represent this as:

- Step 0: Master Plan — define scope, requirements, preserve rules, evidence requirements, and user decisions.
- Final step: Exact Checklist — verify every plan item against exact evidence and produce PASS, HOLD, BLOCK, or NOT RUN per item.

The two menu entries may also be repeated in the final workflow area for convenience, but they must remain one page owner each rather than duplicated implementations.

### Shared user and assistant editing

Both the signed-in Code Labs user and ChatGPT may read and propose edits to the Master Plan.

Required controls:

- visible author/source for each change: user, ChatGPT, imported evidence, or system-generated;
- explicit save action;
- state-version or revision lock;
- timestamped revisions;
- plain-English change summary;
- checkpoint and rollback support;
- no silent overwrite;
- no cross-user access;
- manual copy/paste rescue when connectors are unavailable.

Assistant writes must use the protected Code Labs workspace action path and must not write directly from browser JavaScript to GitHub, Supabase service-role endpoints, or production systems.

### Plan identity and exact-scan binding

Every saved plan version should have immutable identity fields such as:

- plan ID;
- owner/workspace ID;
- revision number;
- canonical plan hash;
- created and updated timestamps;
- exact repository, branch, path, page, or feature scope;
- expected source and candidate hashes when applicable;
- required tests and evidence sources;
- preserve/do-not-touch rules;
- acceptance criteria;
- user-confirmation items.

Exact Checklist must bind to one plan ID, one revision, and one canonical hash. If the plan changes after scanning begins, the checklist becomes stale and must be regenerated. A previous PASS must never carry across to a changed plan hash.

### Checklist behaviour

Exact Checklist should derive structured items from the selected plan and track at least:

- requirement;
- owner/responsible stage;
- required evidence;
- current evidence source;
- performed;
- passed;
- failed;
- blocked;
- not run;
- awaiting user check;
- notes;
- exact commit, workflow, receipt, test, or Code God reference where relevant.

It must distinguish:

- **PASS:** exact required evidence proves the item;
- **HOLD:** evidence is pending, stale, incomplete, or unavailable;
- **BLOCK:** a required safety condition failed;
- **NOT RUN:** the required action or test has not occurred.

A HOLD must not be displayed as a failure. A cancelled or absent workflow must not be displayed as passed.

### Code God integration

Code God should read the exact Master Plan revision and Exact Checklist result as review inputs.

Code God must verify:

- plan hash and revision match the reviewed candidate and handoff;
- all required checklist items have exact evidence;
- no material plan item was omitted;
- failed, blocked, pending, and not-run items remain visible;
- a later source change, plan edit, changed head SHA, failed smoke test, or contradictory runtime result invalidates earlier PASS evidence;
- Code God cannot rewrite the plan, mark user checks complete, merge, or deploy.

Verified repair lessons and regression rules may be proposed back into a future plan revision, but they require an explicit saved revision rather than invisible memory.

### Existing checklist-builder reuse

Prefer extending the existing `code-labs/assets/code-labs-checklist-builder.js` capability rather than creating a competing checklist engine. Its present local text-builder role can become a compatibility/manual mode, while the authoritative mode reads a selected plan revision and produces plan-bound evidence.

One checklist owner must be declared in the page-role register and scanner manifest. Other pages may display read-only summaries or links only.

### Favicon and page identity

Both pages must have a visible Code Labs favicon and clear page title:

- Master Plan;
- Exact Checklist.

Reuse the approved Code Labs favicon strategy or shared shell favicon where possible. Do not create a new binary favicon file unless the repository cleanup and new-file rules are satisfied. The favicon, title, body data-page value, menu label, and page-role register entry must agree.

### Security and storage boundary

The browser may provide a local/manual draft mode, but authoritative shared plans require owner-scoped server-side storage and audit history.

Required safety boundaries:

- no service-role key or GitHub token in browser code;
- no direct main write;
- no merge, deploy, delete, or force-push capability;
- no checklist item can trigger an action merely because it is checked;
- user confirmation remains separate from automated evidence;
- secrets and credential-shaped values are redacted from plan and checklist evidence;
- all authoritative writes use state-version locking, receipts, checkpoints, and eligible undo;
- plan/checklist data remains Code Labs scoped and separate from Stream Bandit app data.

### Implementation phases

1. Add the design to the page-role register and scanner ownership map.
2. Define the plan and checklist schemas, revision/hash rules, and owner-scoped RLS contract.
3. Extend protected Code Labs actions for plan read, plan save, revision creation, checklist generation, evidence attachment, and user-check confirmation.
4. Build the Master Plan page using the shared Code Labs shell and favicon.
5. Extend the existing checklist builder into Exact Checklist authoritative mode.
6. Add beginning/end workflow navigation without creating duplicate owners.
7. Add source-contract tests for exact-plan binding, stale-plan invalidation, single ownership, favicon/page identity, and HOLD versus FAIL semantics.
8. Add isolated database tests for owner scope, state-version conflicts, revision replay, receipts, checkpoints, and rollback.
9. Add Code God tests proving exact plan/candidate/handoff binding.
10. Run user testing before any production promotion.

### Acceptance criteria

This upgrade is complete only when:

- user and assistant can read the same owner-scoped plan;
- both can propose or save visible, versioned edits through protected actions;
- the plan is available at workflow start and its checklist at workflow end;
- Exact Checklist scans only the selected plan ID, revision, and hash;
- changing the plan invalidates the old checklist;
- checklist evidence links to exact receipts, tests, commits, workflows, or Code God records;
- HOLD, BLOCK, FAIL/PASS, NOT RUN, and user-check states remain distinct;
- favicon, title, route, menu, and page-role ownership are consistent;
- no new competing workflow engine is introduced;
- no production write, merge, deployment, deletion, or direct-main capability is added.

`;

const after = before.slice(0, first) + section + before.slice(first);
await writeFile(path, after);
console.log('Added Master Plan and Exact Checklist upgrade to the authoritative Code Labs plan.');
