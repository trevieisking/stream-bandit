# Code Labs latest smoke test receipt

Status: user visual bug pass confirmed.

Date: 2026-07-09
Branch: code-labs-v174-cache-layout-consistency
Scope: Code Labs pages only.

## User confirmation

Trevor tested the visible Code Labs pages after the V173 menu stability merge and reported that he could not find a bug.

## Assistant smoke-test summary

- Code Labs V104 context read passed.
- GitHub main source read passed.
- Supabase table list read passed.
- 21 Code Labs pages returned HTTP 200.
- V173 menu stability is on main.
- V172.4 page polish no longer owns or moves the sidebar menu.
- Code Labs Supabase tables exist and contain live rows.

## Pages checked

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
- saved-files.html
- connection-guide.html
- read-only-proof.html
- about.html
- checklist-builder.html
- help.html
- faq.html

## Remaining V174 polish target

- Standardize Code Labs helper cache keys.
- Keep cl-nav.js as the single menu owner.
- Add missing Buddy Page Bridge / GitHub connector request support to remaining thin pages where safe.
- Improve Help page static SEO.
- Do not change Stream Bandit app files.
- Do not change Supabase schema, RLS, auth, storage, buckets, or secrets.

## Safety

This receipt is a checkpoint record only. It does not promote live app changes, change Supabase schema, or merge a PR.
