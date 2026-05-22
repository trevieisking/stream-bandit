# Stream Bandit Checkpoint — Control Tower Strict Route Targets V7.12.1 Passed

Date: 2026-05-22

## Passed page

- `platform-control-tower-strict-targets-v7-12-1-test.html`

Commit created:

- `a93ab3b2fade38b011a6ba0fc83e6b40f6c88217`

## Trevor confirmed full pass

Scan result shown:

- Found: `94/94`
- Needs review: `0`
- Ignored fake targets: `0`

## What V7.12.1 fixed

V7.12.0 was the correct scanner direction but its target detection was too greedy.

It sometimes treated JavaScript fragments, Supabase storage snippets, conditionals or non-page expressions as route targets.

V7.12.1 fixed this by using strict target detection:

- only clean `.html` targets are accepted
- JavaScript fragments are ignored
- Supabase/storage fragments are ignored
- function/conditional snippets are ignored
- routes without clean redirects show as `direct page`
- fake targets no longer count as failures

## Current confirmed behaviour

V7.12.1 now tracks:

- 48 menu route files
- promoted target pages behind menu routes
- current target pages
- 8 policy routes/documents
- global theme/helper status
- ownership rules

## Ownership rules preserved

- Web Builder owns global display/theme and layout.
- Policy Agreements Centre owns policy text, terms, privacy, cookies, cancellation/request wording and cookie-banner wording.
- Global Footer links only and must not duplicate policy text.
- Platform Control Tower owns diagnostics and route scanning only.
- Legacy / Reference slots may be reused later only after checking whether the old reference is still useful.

## Safety

This page is read-only:

- no writes
- no user edits
- no policy edits
- no billing
- no schema changes
- no live/index promotion

## Notes for next work

Next likely work:

1. Point the main Platform Builder / Control Tower route to V7.12.1 if not already done.
2. Build public read-only policy preview pages for footer links.
3. Add footer-link plan to Final Shell Navigation.
4. Later wire actual global footer links into the shared shell.
5. Decide which Legacy / Reference slots can be reused for future modules.
