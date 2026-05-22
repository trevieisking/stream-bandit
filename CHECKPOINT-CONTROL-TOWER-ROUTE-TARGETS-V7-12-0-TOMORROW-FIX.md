# Stream Bandit Checkpoint — Control Tower Route + Target Scanner V7.12.0

Date: 2026-05-21

## Current page to continue from

- `platform-control-tower-route-targets-v7-12-0-test.html`

Commit created:

- `19aafa03893003b0d2f8df805b95289882f4ac18`

## Trevor confirmed this is the correct scanner direction

This V7.12.0 scanner is the one to continue with tomorrow.

It now checks:

- the 48 menu route files
- the target page each route actually opens
- current promoted target pages
- the 8 policy routes/documents
- global theme/helper status
- ownership rules

## Why this page matters

Previous Control Tower versions mostly checked old menu route wrapper files.

That hid the newer built pages behind old route names.

V7.12.0 fixes the idea by showing both layers:

1. Menu route file
2. Target page it forwards/opens

Examples it now exposes:

- `user-dashboard-concept-v6-68-test.html` -> `user-management-dashboard-v7-11-2-test.html`
- `plans-pricing-matrix-v6-69-test.html` -> `plans-pricing-feature-shop-v7-11-3-test.html`
- `permissions-matrix-v6-70-test.html` -> `permissions-matrix-user-management-v7-11-4-test.html`
- `policy-faq-centre-v6-71-test.html` -> `policy-agreements-centre-v7-11-6-test.html`
- `tools-page-admin-shell-v6-63-test.html` -> `tools-page-global-helpers-v7-10-1-test.html`

## Current scan result shown by Trevor

- Found: `87/94`
- Needs review: `7`

The 7 review items are tomorrow's fix list.

## Issues visible from Trevor's screenshots

The target scanner is working, but some target detection is too greedy and catches non-route JavaScript fragments instead of real HTML page targets.

Examples visible in the screenshots:

- Supabase Library target shows a JavaScript fragment beginning with `$(`
- Playlists target shows a Supabase storage expression fragment
- Channels target shows an avatar/banner JavaScript expression fragment
- Submit Video target shows a storage expression fragment
- Web Builder target shows `isForm?`
- Platform Builder target shows a broken expression fragment

These should not count as real target pages.

## Tomorrow's required fix

Redo target extraction rules so they only accept real `.html` route targets.

Target detection should ignore:

- JavaScript expressions
- Supabase storage paths
- function calls
- conditional fragments
- non-html strings
- malformed partial strings

Target detection should accept:

- `meta refresh` URLs ending in `.html`
- `window.location.href = "...html"`
- `location.replace("...html")`
- safe anchor hrefs ending in `.html`

If no clean target exists, show:

- `direct page`

instead of marking a fake target as failed.

## Expected tomorrow result

After fixing target extraction:

- false review items should drop
- real broken routes should remain visible
- legacy/reference review should be separated from current app blockers
- scanner should clearly show current app routes vs old legacy/fallback routes

## Ownership rules preserved

- Web Builder owns global display/theme and page/form layout.
- Policy Agreements Centre owns policy text, terms, privacy, cookies, cancellation wording and cookie banner wording.
- Global footer links only and does not duplicate policy text.
- Platform Control Tower owns diagnostics and route scanning only.
- Legacy / Reference slots may be reused later only after checking whether the old page is still useful.

## Footer/policy future note

Tomorrow/later:

- build public read-only policy preview pages for footer links
- keep editable policy docs for Trevor/admin/solicitor review
- global footer should link to preview pages, not duplicate policy text
- Control Tower should eventually track preview pages too

## Safety

No live/index promotion.
No billing changes.
No policy legal finalisation.
No user account changes.
No schema changes.
No destructive action.
