# Stream Bandit Checkpoint — Published Preview Hazard Map V7.12.117

Date: 2026-06-05

Status: SCAN ONLY.

Target scanned:

- web-builder-shared-style-preview-v7-12-117-test.html

Current internal state found:

- V7.12.117 Published Preview Interactive TEST

This page renders saved Web Builder pages from sb_site_pages. It is less risky than Pages Manager because it does not write Supabase page rows, but it is important because it renders layout_json blocks and viewer interactions.

Reads found:

- sb_site_pages by slug
- sb_app_settings for shared style fallback

Writes found:

- no Supabase writes
- rating blocks save to localStorage only

Important behaviours to preserve:

- page slug loading from ?page=
- layout_json rendering
- form block route to Advanced Form
- rating block localStorage toy
- video/HLS rendering
- custom code contained embed block
- Builder/Form/Inbox links
- Global Search link

Route issue found:

- Settings Studio footer route uses settings-studio-admin-shell-v6-55-test.html.
- Current Theme Studio route should be web-builder-theme-studio-controls-v7-8-9-test.html.

Wrapper issue found:

- page has its own manual header and manual footer.
- future shell pass should use current Header Shell and current Footer Shell, and avoid duplicate footer.

Recommended next pass:

- V7.12.222 Published Preview Shell/Route Preservation.

Allowed next pass:

- current Header Shell
- current Footer Shell
- Theme Projector and helpers
- keep renderer logic
- keep local rating toy
- fix Theme Studio route
- remove old manual footer

Not allowed next pass:

- no Web Builder engine rewrite
- no page schema changes
- no Supabase writes
- no layout_json format changes
