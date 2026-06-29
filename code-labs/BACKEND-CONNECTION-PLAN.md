# Code Labs V89 Backend / ChatGPT Connection Plan

## Current checkpoint

Checkpoint branch:

```text
checkpoint-code-labs-v88-before-backend-20260629
```

This is the rollback point before backend work.

Current live Code Labs already has:

- compact polished browser workflow
- File Lab read-only GitHub loader
- Rescue Room and Workflow Hub repair packet flow
- Patch Desk full-file save and compare flow
- Preview + Test and Checkpoints
- Repo Desk action choice
- GitHub Writer add, change, and exact cleanup handoffs
- GitHub Tracker PR and preview tracking
- Supabase Repair History working on the live domain
- Connection Guide for one-link, one-screenshot support

The browser workbench must not be broken. Existing working features are preserved by default.

## Problem to solve

Code Labs can already prepare the right instructions for ChatGPT, GitHub, and Supabase. The missing layer is a controlled backend / ChatGPT app connection so ChatGPT can safely read Code Labs jobs and perform approved GitHub/Supabase actions without the user copying every packet by hand.

The browser must not store GitHub write tokens, Supabase service-role keys, OpenAI API keys, or other privileged secrets.

## Target architecture

```text
Code Labs browser workbench
  -> Code Labs backend / MCP server
  -> ChatGPT App / Apps SDK integration
  -> GitHub branch and PR tools
  -> Supabase Code Labs history tools
```

The browser stays a safe workbench. The backend holds protected secrets and only exposes controlled tools. ChatGPT uses the app/backend layer to act on approved Code Labs jobs.

## Official platform direction

The OpenAI Apps SDK is the platform path for apps that extend ChatGPT. OpenAI's Apps SDK docs describe planning use cases, defining tools, designing components, setting up a server, building a ChatGPT UI, authenticating users, managing state, deploying, connecting from ChatGPT, testing the integration, and submitting the app.

The Code Labs plan follows that order: plan first, read-only backend second, controlled writes later.

## Non-negotiable safety rules

1. Do not break any working Code Labs page.
2. Do not touch Stream Bandit app files unless the user explicitly starts a separate Stream Bandit repair.
3. Do not place GitHub tokens, Supabase service-role keys, or OpenAI API keys in browser JavaScript.
4. Do not commit directly to `main` from the normal Code Labs flow.
5. GitHub writes must use a branch and pull request.
6. Delete/remove must be exact path only and require proof.
7. Supabase schema/RLS/auth changes must have reviewed SQL and a rollback plan.
8. Start read-only. Add writes only after read-only works.

## Phase 0: preserve the checkpoint

Goal: make sure the current live milestone can be restored.

Already done:

- checkpoint branch exists from live main.
- add/edit/delete GitHub drill passed.
- Supabase Repair History works on live pages.

Future rollback rule:

```text
If backend connection work breaks Code Labs pages, revert to checkpoint-code-labs-v88-before-backend-20260629.
```

## Phase 1: backend/app design only

Goal: define what the backend will do before writing backend code.

Deliverables:

- app tool list
- permission model
- data model map
- GitHub action map
- Supabase action map
- user confirmation checkpoints
- failure and rollback rules

No code behaviour changes in this phase.

## Phase 2: read-only backend prototype

Goal: ChatGPT can read context safely.

Allowed tools:

### `get_code_labs_status`

Returns current Code Labs project/job summary from Supabase.

### `list_code_labs_jobs`

Lists recent repair jobs for the signed-in user.

### `get_code_labs_job`

Reads one repair job, file metadata, checkpoints, packets, and test runs.

### `read_github_file`

Reads a public or user-approved GitHub file by repo, branch, and path.

### `prepare_repair_packet`

Creates the repair handoff text from saved Code Labs state.

Restrictions:

- no file writes
- no branch creation
- no deletes
- no Supabase schema changes
- no secret exposure

Pass condition:

ChatGPT can read a Code Labs job and explain what it would do next without changing anything.

## Phase 3: Supabase history tools

Goal: ChatGPT can help with repair history without repo writes.

Allowed tools:

### `save_repair_history`

Saves a Code Labs repair/job event for the signed-in user.

### `load_repair_history`

Loads saved jobs, versions, packets, tests, and audit events.

### `append_audit_event`

Adds a small audit note to a job.

Restrictions:

- only user-owned Code Labs rows
- no Stream Bandit table writes
- no service-role access from browser
- no schema changes inside normal use

Pass condition:

Live Code Labs can save and load history, and ChatGPT can read the same history through the backend.

## Phase 4: GitHub branch and PR tools

Goal: ChatGPT can do the same safe GitHub work we proved manually.

Allowed tools:

### `create_github_branch`

Creates a branch from main or from a selected source branch.

### `add_github_file`

Adds one target path with a full file body.

### `update_github_file`

Replaces one target path with a full file body.

### `delete_github_file`

Deletes one verified target path only after proof is present.

### `open_github_pr`

Opens a PR and returns the PR link and preview/test link.

Restrictions:

- no direct main commits
- one target file per operation at first
- exact path lock required
- delete proof required
- no real Code Labs page delete unless explicitly approved
- no Stream Bandit file changes unless user starts a Stream Bandit-specific repair

Pass condition:

The backend can repeat the proven drill: add temporary file, preview, update it, preview, delete exact file, confirm gone.

## Phase 5: ChatGPT App / Apps SDK layer

Goal: make Code Labs callable inside ChatGPT with a simple UI.

App components:

- current repair status card
- job picker
- repair packet viewer
- GitHub Writer action card
- PR/preview tracker card
- Supabase history card

User actions:

- choose job
- ask ChatGPT to inspect
- approve branch creation
- approve add/change/delete handoff
- paste or open preview link
- mark pass/fail

Pass condition:

A user can open ChatGPT, use the Code Labs app, pick a job, and ask for read-only review without leaving the safe workflow.

## Phase 6: controlled writes inside ChatGPT

Goal: after read-only and review flows work, ChatGPT can create a branch/PR from the app.

Write confirmation gates:

1. user chooses action
2. user locks repo/branch/path
3. user confirms full file body or delete proof
4. ChatGPT summarizes intended change
5. user approves
6. backend creates branch/commit/PR
7. user tests preview
8. user approves merge separately

Merge should remain a separate explicit confirmation.

## Minimal backend endpoints

These names are implementation suggestions. Final framework can be Node/TypeScript, Supabase Edge Functions, or another secure server.

```text
GET  /api/code-labs/status
GET  /api/code-labs/jobs
GET  /api/code-labs/jobs/:id
POST /api/code-labs/jobs/:id/audit
POST /api/github/read-file
POST /api/github/create-branch
POST /api/github/add-file
POST /api/github/update-file
POST /api/github/delete-file
POST /api/github/open-pr
```

## Suggested tool schema outline

```json
{
  "tool": "update_github_file",
  "input": {
    "repo": "trevieisking/stream-bandit",
    "source_branch": "main",
    "working_branch": "code-labs-change-example",
    "target_path": "code-labs/example.html",
    "full_file_body": "...",
    "user_confirmation": true
  }
}
```

Delete must be separate:

```json
{
  "tool": "delete_github_file",
  "input": {
    "repo": "trevieisking/stream-bandit",
    "working_branch": "code-labs-cleanup-example",
    "target_path": "code-labs/test-page-do-not-merge.html",
    "delete_proof": "Temporary test file created only for the safe drill.",
    "user_confirmation": true
  }
}
```

## Environment variables / secrets

Server only:

```text
GITHUB_APP_ID or GITHUB_TOKEN
GITHUB_PRIVATE_KEY if using GitHub App auth
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY, server only if needed
OPENAI_API_KEY, server only if needed
APP_SESSION_SECRET
```

Browser allowed:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
public app config
```

Browser forbidden:

```text
GitHub write token
Supabase service role key
OpenAI API key
private signing keys
```

## Database mapping

Existing Code Labs tables should remain the first source of truth:

- `code_labs_projects`
- `code_labs_files`
- `code_labs_jobs`
- `code_labs_versions`
- `code_labs_packets`
- `code_labs_test_runs`
- `code_labs_audit_log`

Possible future table:

```text
code_labs_github_actions
```

Suggested columns:

```text
id
owner_id
job_id
action: read | add | change | delete | review
repo
source_branch
working_branch
target_path
pr_url
preview_url
status: prepared | branch_created | pr_open | test_passed | test_failed | merged | reverted
created_at
updated_at
```

Do not add this table until the backend tool plan is approved.

## Testing plan

### Test A: read-only app connection

1. open app/backend test page
2. sign in or use existing session
3. list Code Labs jobs
4. read one job
5. read a GitHub file
6. return a repair summary
7. no writes happen

### Test B: Supabase history connection

1. save repair history on live Code Labs
2. backend reads the same job
3. backend appends audit note
4. live page loads the note

### Test C: GitHub write drill

1. add temporary file on branch
2. preview temporary file
3. edit same temporary file on branch
4. preview edit
5. delete exact temporary file
6. confirm only temporary file is gone
7. merge only after pass

## Decision gates

Do not move from one phase to the next until the previous one passes.

- Phase 1 plan approved by user
- Phase 2 read-only prototype passes
- Phase 3 Supabase history read/save passes
- Phase 4 GitHub add/edit/delete drill passes through backend
- Phase 5 ChatGPT app read-only integration passes
- Phase 6 controlled writes pass

## Recommendation

Build V90 as a read-only backend proof. Do not start GitHub write automation yet.

V90 should only prove:

```text
ChatGPT/backend can read Code Labs job state and GitHub file context without changing anything.
```

Only after that should Code Labs add controlled branch and PR write tools.
