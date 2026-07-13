# Code Labs One-Flow Rebuild V200

## Purpose

Rebuild Code Labs as one simple, non-coder-first repair workflow while preserving working features. Code Labs remains separate from Stream Bandit application pages, login, routes and production data.

## Normal workflow

1. Home — understand the current project and next safe step.
2. Setup — choose the project and repository.
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

## One visible connector

The visible connector is named Code Labs. It may:

- read the active page and approved fields
- write the smallest approved field set
- run exposed safe actions
- undo the latest page write
- read repository files
- create or update non-protected branches
- create, update or remove files on non-protected branches
- open, inspect and review pull requests
- merge only after explicit confirmation and clean gates
- read Code Labs Supabase context
- save complete-file Buddy Lane handoffs
- deploy Code Labs Edge Functions only after review and explicit confirmation
- return receipts

The user does not choose repeatedly between V104, V107, GitHub and Supabase.

## Sol

Sol is read-only. Sol may:

- read the current Code Labs page packet
- explain the current step
- identify missing fields
- explain errors and receipts
- suggest the next safe action

Sol may not write GitHub, Supabase rows, branches, pull requests, deployments, merges or page fields.

## Saved Files

`code-labs/saved-files.html` is the normal file entry and management page. It must:

- upload a local code or text file
- paste or edit a complete source file
- load an existing Code Labs Supabase file
- load a GitHub file read-only through the connector
- show filename, repository, path, branch, size and source hash
- keep local uploads separate from saved Supabase edit targets
- validate complete-file input before workflow state changes
- reject snippets, patch recipes and unified diffs
- send one complete file to Buddy Lane

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

Buddy Canvas may hydrate only from a matching fresh token and must consume that token once.

## Safety boundaries

- branch and pull request only; never direct `main`
- no browser-side GitHub write
- no automatic delete, deploy, publish or merge
- dangerous actions require explicit confirmation
- Code Labs files and tables only
- no Stream Bandit application files or tables
- no secrets exposed in UI, logs or receipts
- failed validation must not mutate workflow state

## Acceptance gates

Before merge:

- JavaScript syntax checks pass
- Codex review is clean
- all review threads are resolved
- Saved Files local upload works
- saved-row load and Save restoration work
- local upload clears the saved-row edit target
- invalid content leaves workflow state unchanged
- repository ownership and path remain correct
- double-click Send creates one handoff
- Buddy Canvas hydration is one-time
- no duplicate Buddy Lane or Sol panels
- mobile layout is usable
- owner visual smoke test passes
- no Supabase migration or Stream Bandit change is mixed into this batch

## Parked later work

These ideas are approved for a later reviewed phase and are not part of this foundation PR:

- File Relationship Scanner
- Project Integrity Reviewer
- Tool Station

They should reuse existing Helper Route Map logic and remain read-only by default until a separate plan, review and acceptance gate are complete.
