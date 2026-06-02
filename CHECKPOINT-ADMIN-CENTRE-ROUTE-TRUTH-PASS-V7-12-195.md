# Stream Bandit Checkpoint — Admin Centre Route Truth Pass V7.12.195

Date: 2026-06-02

## Status

FUNCTIONAL PASS / POLISH LATER.

## Page

- `admin-centre-command-deck-v7-12-121-test.html`

## What was fixed

The Admin Centre route map was corrected from the old registry route:

- `all-pages-version-registry-v7-1-4-full-test.html`

To the current registry route:

- `all-pages-version-registry-v7-12-122-current-routes-test.html`

## Confirmed user test

- Open Admin Centre: PASS
- Click Current Registry: PASS
- Current Registry opens `all-pages-version-registry-v7-12-122-current-routes-test.html`: PASS
- Run Admin Route Check: PASS
- Header/menu/search behaviour remains functional: PASS

## Confirmed Admin Centre copied map

- Live Readiness -> `live-readiness-global-helpers-v7-10-2-test.html`
- Current Registry -> `all-pages-version-registry-v7-12-122-current-routes-test.html`
- Test Checklist -> `test-checklist-global-helpers-v7-10-5-test.html`
- Health Check -> `health-check-global-helpers-v7-10-6-test.html`
- Backup / Safety -> `backup-safety-global-helpers-v7-10-9-test.html`
- Tools -> `tools-page-original-global-pass-v7-12-136-test.html`
- Mux Manager -> `mux-manager-global-helpers-v7-10-7-test.html`
- Storage Prep -> `storage-prep-global-helpers-v7-10-8-test.html`
- Web Builder -> `web-builder-live-studio-v7-12-116-test.html?page=test-page`
- Theme Studio -> `web-builder-theme-studio-controls-v7-8-9-test.html`
- Settings Hub -> `settings-platform-control-hub-v7-12-85-test.html`
- Policy Centre -> `policy-documents-centre-v7-12-119-test.html`
- Home -> `home-global-helpers-v7-4-4-test.html`

## Preserved behaviour

- Admin Centre URL stayed the same.
- Menu-scroll stabiliser preserved.
- Theme refresh preserved.
- Full search fallback preserved.
- Admin route check preserved.
- No Supabase logic touched.
- No admin tool internals touched.

## Known note

The page may still need visual polish later, but current route truth and functional behaviour passed.
