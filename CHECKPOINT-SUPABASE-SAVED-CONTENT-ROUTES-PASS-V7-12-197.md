# Stream Bandit Checkpoint — Supabase Saved Content Routes Pass V7.12.197

Date: 2026-06-03

## Status

PASS.

## Why this was needed

GitHub route truth, manifest and index were updated through V7.12.196, but Supabase `sb_site_pages` still contained old route strings inside saved builder content:

- `layout_json`
- `settings_json`

This meant the app shell could be correct while saved Web Builder pages still carried old route memory.

## Backup created first

Before route normalisation, the affected rows were backed up to:

- `sb_site_pages_route_backup_v7_12_197`

Reason:

- `V7.12.197 saved content route normalisation`

## Rows targeted

Only the affected saved page rows were targeted:

- `home-page`
- `chatterfriends-stream-bandit`
- `test-page`

No broad database rewrite was intended.

## Route replacements applied

- `home-watch-shell-v6-32-test.html` -> `home-global-helpers-v7-4-4-test.html`
- `channels-image-column-fix-v6-94-2-test.html` -> `channels-global-helpers-v7-5-3-test.html`
- `library-browse-shell-v6-41-test.html` -> `library-global-helpers-v7-4-8-test.html`
- `web-builder-shared-style-preview-v7-9-2-test.html` -> `web-builder-shared-style-preview-v7-12-117-test.html`
- `web-builder-pages-manager-v7-12-108-test.html` -> `web-builder-pages-manager-v7-12-111-test.html`
- `settings-studio-custom-templates-v7-4-3-test.html` -> `web-builder-theme-studio-controls-v7-8-9-test.html`
- `web-builder-form-save-v7-6-5-test.html` -> `web-builder-form-save-v7-12-94-test.html`
- `web-builder-form-save-v7-6-7-test.html` -> `web-builder-form-save-v7-12-94-test.html`
- `web-builder-shared-style-block-v7-9-0-test.html` -> `web-builder-shared-style-block-v7-9-2-test.html`

## Confirmed user test

- Open Web Builder -> `test-page`: PASS
- Open Published Preview -> `test-page`: PASS
- Click saved block buttons: PASS
- Click Open Form: PASS
- Click Form Inbox: PASS
- Open `home-page` preview: PASS

## Clarification about `chatterfriends-stream-bandit`

The `chatterfriends-stream-bandit` row appears to be an older duplicate/published builder page row, not the main live Home app route.

The real app Home route remains:

- `home-global-helpers-v7-4-4-test.html`

The builder preview route can still preview `home-page` or other saved `sb_site_pages` rows, but there is not yet a separate published site-version system that fully replaces the app Home page.

## Important interpretation

This pass confirmed a hidden layer:

- Static GitHub route maps can be correct.
- Shell/header/footer can be correct.
- But Supabase saved page JSON can still hold stale routes.

That is why scanning Supabase was necessary.

## Safety notes

- No Web Builder engine code was changed.
- No Pages Manager code was changed.
- No Player 2 code was changed.
- No public Home route was changed.
- No policy publication status was changed.
- Policy documents remain published for testing only.
- Supabase backup was created before route normalisation.

## Next suggested direction

Continue flow standardisation on safe/read-only pages first:

1. One Machine
2. Final Shell Navigation / Global Helper Shell
3. Permissions Matrix
4. Pricing Feature Shop

Then pause before touching dangerous owner tools:

- Form Inbox
- Advanced Form
- Pages Manager
- Movie Row Editor
- Web Builder
- Player 2
