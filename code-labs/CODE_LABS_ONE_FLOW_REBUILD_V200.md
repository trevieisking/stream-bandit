# Code Labs One-Flow Rebuild V200

## Purpose

Rebuild Code Labs as a kind, non-coder-first repair workbench while preserving every working feature. Code Labs remains separate from Stream Bandit application data and pages.

## User promise

The normal user flow is:

1. Saved Files / File Lab — upload, load, select and edit one complete source file.
2. Rescue Room — describe the fault and preserve rules.
3. Packet Builder — build the repair context.
4. Patch Lab — apply or validate a precise repair when needed.
5. Send to Buddy Lane — hand the complete validated file to ChatGPT.
6. ChatGPT handles branch, commit, pull request, review, deployment and receipts through one Code Labs connector.

The user is not required to operate Repo Desk, GitHub Writer or GitHub Tracker. Those pages remain advanced diagnostics until parity is proven, then may be retired from the normal menu.

## Three shells

### Header shell
- Code Labs identity
- current numbered step
- current project, repository, path and branch
- connector health
- Sol read-only help bubble

### Page shell
- Buddy Lane directly beneath the header
- plain-English instructions
- the page's unique working feature
- validation and receipt panel

### Footer shell
- previous and next workflow step
- checkpoint and safety state
- latest receipt
- Help and Sol entry points

## One connector

The visible connector is named Code Labs. It owns these approved capabilities:

- read active page and safe fields
- write approved page fields
- run V139/V140 exposed safe actions
- undo latest page write
- load repository files
- create branches
- create, update and remove files on non-protected branches
- open and inspect pull requests
- request and resolve review work
- merge only after explicit confirmation and clean gates
- read Code Labs Supabase context
- save full-file Buddy Lane handoffs
- deploy Code Labs Edge Functions after review
- return immutable receipts

The user does not choose between V104, V107, GitHub and Supabase connectors during normal use.

## Sol

Sol is read-only. Sol may:

- read the current Code Labs page packet
- explain the current step
- identify missing fields
- explain errors and receipts
- suggest the next safe action

Sol may not write GitHub, Supabase rows, page fields, branches, pull requests, deployments or merges.

## Saved Files and File Lab merge

`code-labs/saved-files.html` becomes the file entry and management page. It must:

- upload a local text/code file
- paste or edit a complete source file
- load an existing Code Labs Supabase file
- load a GitHub file read-only through the connector
- show filename, repository, path, source branch, character count and source hash
- save to