# Code Labs V171 smoke and SEO audit

Generated: 2026-07-09
Branch: code-labs-v171-audit

## Purpose

Record the smoke/full-test findings before applying wording or SEO fixes. This is an audit-only checkpoint so the next repair can be small and reviewed.

## What failed in the tool stream

The first GitHub branch creation attempts were blocked by the connector safety layer, not by the repository or by Code Labs. The branch name was retried with a simpler safe name and succeeded:

- Failed: longer names with smoke/SEO wording.
- Passed: `code-labs-v171-audit`.

No GitHub file was changed by the failed attempts.

A later attempt to call `Code_Labs_V104.save_code_labs_write_request` failed because the direct Code Labs tool recipient expired/disappeared from the active tool registry. After rediscovery, only GitHub remained in the active direct tool namespace for writes. GitHub branch/PR workflow still works.

## Source checks used

- GitHub main and branch metadata.
- Code Labs V104 live page reads.
- Code Labs V104 saved context / Supabase-backed repair-history reads.
- User screenshot of Setup page.
- Previously uploaded Code Labs scan notes.

## Smoke test result

The live Code Labs pages below returned HTTP 200 through Code Labs V104 read-only checks:

- index.html
- setup.html
- file-lab.html
- rescue-room.html
- packet-builder.html
- buddy-canvas.html
- v20.html
- patch-desk.html
- patch-lab.html
- preview-test.html
- checkpoints.html
- repo-desk.html
- publish-prep.html
- github-tracker.html
- connection-guide.html
- read-only-proof.html
- about.html
- checklist-builder.html
- help.html
- faq.html
- saved-files.html

## Confirmed passes

- V139 Buddy Page Bridge is present on the main workflow pages where expected.
- Saved Files Manager is now serving the V170 shell and loads V139.
- Repo Desk now has correct `data-page="repo-desk"` on live.
- V20 and Repo Desk now have noscript fallbacks.
- GitHub Writer and GitHub Tracker have explicit SEO title/description/keyword metadata.
- Code Labs V104 context read works and shows saved Code Labs/Supabase repair history rows.

## Findings that need fixing later

### 1. Setup wording is now stale / confusing

The Setup page UI still says:

- `Manual paste mode`
- `GitHub later`
- `Supabase later`
- `Manual mode means you copy and paste code yourself. It is the safest first version and works even when tools are blocked.`

That wording is no longer correct enough because Code Labs now uses GitHub, Supabase-backed saved history, Buddy Canvas, Saved Files, and V139 Buddy Page Bridge.

Recommended wording:

- `Manual + Buddy assisted`
- `GitHub connector ready`
- `Supabase history ready`

Replace the note with something like:

`Code Labs can work manually, but GitHub connector and Supabase repair history are now active support lanes. Browser pages still do not write GitHub directly; Buddy/GitHub connector handles branch and PR work.`

### 2. Project Picker wording is also stale

The base app still describes GitHub/Supabase as future connector modes. This should be updated after Setup.

### 3. Some noscript headings are generic

Several pages still show a generic noscript heading like `Code Labs` instead of the exact page title:

- patch-desk.html
- patch-lab.html
- preview-test.html

This is not a functional blocker but is poor clarity and light SEO/accessibility debt.

### 4. Static index links are incomplete

The static Home page links do not include every current Code Labs page, especially Saved Files, Connection Guide, Read Only Proof, Checklist Builder, and Workflow Hub. JavaScript nav helps, but static/no-JS discovery should be updated.

### 5. V139 is not on every utility page

V139 is now on the main workflow and Saved Files pages. Some fully static utility pages may still not load it directly, including Connection Guide, Read-Only Proof, and Checklist Builder. Decide whether those utility pages also need Buddy Read Packet controls.

### 6. Help page SEO is thin

Help page lacks a meta description/keywords block compared with FAQ/About/GitHub Writer/GitHub Tracker.

## Suggested next PR scope

Title: `Refresh Code Labs Setup wording and SEO clarity`

Small safe changes only:

1. Update Setup mode labels and note.
2. Update Project Picker future wording to current connector wording.
3. Improve generic noscript headings on Patch Desk, Patch Lab, and Preview + Test.
4. Add Saved Files and other current utility links to static Home.
5. Add Help meta description/keywords.
6. Decide whether V139 should be added to Connection Guide, Read-Only Proof, and Checklist Builder.

## Safety notes

- Do not touch Stream Bandit app pages in this PR.
- Do not change Supabase schema/RLS/storage/auth/payments/secrets.
- Do not merge functional edits until branch preview passes.
- Use GitHub branch/PR only.
