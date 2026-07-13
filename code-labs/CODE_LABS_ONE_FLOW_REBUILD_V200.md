# Code Labs One-Flow Rebuild V200

## Purpose

Rebuild Code Labs as one simple, non-coder-first repair workflow while preserving working features. Code Labs remains separate from Stream Bandit application pages, login, routes and production data.

## Normal workflow

1. Home — understand the current project and next safe step.
2. Setup — choose and save the independent project repository.
3. Saved Files — upload, load, select or edit one complete source file.
4. Rescue Room — describe the fault and preserve rules.
5. Packet Builder — collect the repair context.
6. Patch Lab — apply or validate the complete repair.
7. Buddy Lane — hand the complete validated file to ChatGPT.
8. Preview + Test — check behavior before live use.
9. Checkpoints — preserve rollback proof and receipts.
10. Help — explain the workflow and safe next action.

Repo Desk, GitHub Writer and GitHub Tracker are advanced diagnostics, not required steps for the user.

## Three shells

### Header shell

- Code Labs identity
- current numbered step
- project, repository, path and branch
- connector status
- Sol entry point

### Page shell

- Buddy Lane directly below the header
- plain-English instructions
- the page's unique feature
- validation, receipt and next-step area

### Footer shell

- previous and next step
- checkpoint status
- latest safety receipt
- Help and Sol entry points

## Foundation connector boundary

For PR #343, the visible Code Labs connector may:

- read the active page and approved fields
- write the smallest approved page-field set
- run exposed safe actions
- undo the latest page-field write
- read repository files through ChatGPT
- create or update non-protected branches
- create or update complete files on non-protected branches
- open, inspect and review pull requests
- return receipts

For this foundation batch it may not delete files, deploy, publish or merge. Those actions require separate reviewed phases and explicit confirmation.

## Sol

Sol is read-only. Sol may:

- read the current Code Labs page packet
- explain the current step
- identify missing fields
- explain errors and receipts
- suggest the next safe action

Sol may not write GitHub, Supabase rows, branches, pull requests, deployments, merges or page fields.

## Saved Files foundation behavior

`code-labs/saved-files.html` is the normal file entry and management page for this foundation. It must:

- upload a local code or text file
- paste or edit a complete source file
- load an existing Code Labs Supabase saved-file row
- show saved-row filename, project/path context and saved size/hash where available
- preserve repository, target path and branch context in workflow state
- keep local uploads separate from saved Supabase edit targets
- preserve the independent Setup repository for local files
- validate complete-file input before workflow state changes
- reject snippets, patch recipes and unified diffs
- send one complete file to Buddy Lane

A GitHub read-only file picker inside Saved Files is a later implementation slice and is not claimed by PR #343.

## Buddy Lane handoff

A handoff must include:

- repository
- target path
- source branch
- requested repair branch
- complete source file
- complete fixed file
- hashes and character counts
- branch/PR-only safety flags
- a one-time handoff token
- creation and expiry timestamps

Buddy Canvas may hydrate only from a matching token created within the previous 15 minutes. It must consume that token once. Expired tokens are removed without changing workflow state.

## Safety boundaries

- branch and pull request only; never direct `main`
- no browser-side GitHub write
- no automatic delete, deploy, publish or merge
- dangerous actions require explicit confirmation in later phases
- Code Labs files and tables only
- no Stream Bandit application files or tables
- no secrets exposed in UI, logs or receipts
- failed validation must not mutate workflow state
- a local upload must never inherit a previously selected saved-row repository

## Acceptance gates

Before merge:

- JavaScript syntax checks pass
- Codex review is clean
- all review threads are resolved
- Saved Files local upload works
- saved-row load and Save restoration work
- local upload clears the saved-row edit target
- local upload uses the independent Setup repository
- invalid content leaves workflow state unchanged
- repository ownership and path remain correct
- double-click Send creates one handoff
- expired handoffs are rejected without state mutation
- Buddy Canvas hydration is one-time
- the V200 menu remains stable after legacy helper timers
- no duplicate Buddy Lane or Sol panels
- mobile layout is usable
- owner visual smoke test passes
- no Supabase migration or Stream Bandit change is mixed into this batch

## Parked later work

These ideas are approved for later reviewed phases and are not part of this foundation PR:

- GitHub read-only file picker inside Saved Files
- File Relationship Scanner
- Project Integrity Reviewer
- Tool Station
- deployment and merge controls
- file deletion controls

They should reuse existing Helper Route Map logic where relevant and remain read-only by default until separate plans, reviews and acceptance gates are complete.
