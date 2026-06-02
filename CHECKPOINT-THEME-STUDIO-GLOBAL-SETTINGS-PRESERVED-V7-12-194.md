# Stream Bandit Checkpoint — Theme Studio Global Settings Preserved V7.12.194

Date: 2026-06-02

## Status

SCAN STABLE / NO EDIT MADE.

## Pages/files scanned

- `web-builder-theme-studio-controls-v7-8-9-test.html`
- `stream-bandit-theme-projector-v7-12-156.js`

## Why this was treated carefully

Theme Studio owns the global visual settings. A careless rewrite could break app-wide theme projection across Home, Watch, Settings, Group Play and other clean-shell pages.

## Theme Studio ownership confirmed

Theme Studio remains the owner route:

- `web-builder-theme-studio-controls-v7-8-9-test.html`

It writes theme data into the shared local browser keys:

- `streamBanditTheme`
- `stream-bandit-theme`
- `sbTheme`
- `sb_theme`
- `web_builder_shared_style_v7_8_8`
- `web_builder_style`

It also saves the theme to Supabase:

- table: `sb_app_settings`
- id: `stream_bandit`
- settings keys include:
  - `streamBanditTheme`
  - `web_builder_shared_style_v7_8_8`
  - `web_builder_style`
  - `builderStyle`

## Theme Projector reader confirmed

`stream-bandit-theme-projector-v7-12-156.js` reads the same local keys used by Theme Studio and projects the values through shared CSS variables:

- `--accent`
- `--accent2`
- `--bg`
- `--background`
- `--p`
- `--p2`
- `--card`
- `--card2`
- `--title`
- `--muted`
- `--textColor`
- `--btnText`
- `--buttonText`
- `--fontScale`
- `--line`

## Event bridge confirmed

Theme Studio broadcasts:

- `streambandit:theme-updated`
- storage event for `streamBanditTheme`

Theme Projector listens for:

- storage changes on known theme keys
- `streambandit:theme-updated`

## Decision

No code change was made.

Reason: the owner writer and global projector already match. Editing Theme Studio now would add risk without a proven bug.

## Safety notes

- No Theme Studio code was changed.
- No Supabase theme write path was changed.
- No global theme keys were changed.
- No Header/Footer shell code was changed.
- No Settings Hub code was changed in this scan.

Theme/global settings preservation is currently intact.
