# Stream Bandit Checkpoint — Pages Manager Hazard Map V7.12.111

Date: 2026-06-05

Status: SCAN ONLY.

Target scanned:

- web-builder-pages-manager-v7-12-111-test.html

Current internal state found:

- V7.12.111 Web Builder Pages Manager TEST

This page is a minefield page because it works with real Web Builder page rows in sb_site_pages and controls page slug, title, status, layout_json, settings_json and navigation metadata.

Important functions found and must be preserved:

- client
- helperStatus
- nav
- routes
- setLinks
- fill
- formRow
- filtered
- render
- loadPages
- savePage
- softDeletePage
- restorePage
- permanentDeletePage
- newPage
- clearForm
- wire

Important stale route links found:

- Builder currently points to web-builder-live-studio-v7-12-97-test.html and should point to web-builder-live-studio-v7-12-116-test.html.
- Preview currently points to web-builder-shared-style-preview-v7-9-2-test.html and should point to web-builder-shared-style-preview-v7-12-117-test.html.
- Settings Studio footer currently points to settings-studio-admin-shell-v6-55-test.html and should point to web-builder-theme-studio-controls-v7-8-9-test.html.

Recommended next pass:

- V7.12.220 Pages Manager Shell/Route Preservation Pass.

Allowed next pass:

- keep existing sb_site_pages field keys and page-row workflow,
- keep the current guarded page-management controls,
- update stale routes,
- add current header/footer/theme/count/search helpers,
- add debug route proof.

Not allowed next pass:

- no Web Builder engine rewrite,
- no Published Preview rewrite,
- no new Supabase fields,
- no route promotion beyond this page,
- no database structure changes.
