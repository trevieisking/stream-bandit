# Stream Bandit — Settings Group Property Ownership Map V7

Date: 2026-05-21

## Purpose

This document records which Settings/Web Builder pages own which properties so the global-helper pass does not create duplicate or conflicting controls.

Trevor confirmed the key rule:

> If a property belongs to another page, leave it there. Do not duplicate it.

## Core rule

Do not create competing editors for the same saved property.

A page can link to an owner page or show status, but it should not save the same property unless it is the declared owner.

## Ownership map

### Profile identity owner

Owner page:

- `profile-settings-global-helpers-v7-5-8-test.html`

Route:

- `profile-settings-admin-shell-v6-56-test.html`

Saved data owner:

- `sb_profiles`

Owned properties:

- `display_name`
- `username`
- `channel_name`
- `channel_about`
- `avatar_url`
- `banner_url`

Rules:

- Existing profile row only.
- No insert/upsert for missing profile row.
- No role changes.
- No profile delete.
- Avatar/banner uploads use `stream-bandit-images/profiles/<user-id>/...`.
- After save/upload, shell account/avatar helpers refresh.

Future polish only:

- banner reposition / crop / zoom before saving.

### Global display/theme owner

Owner page:

- `web-builder-theme-studio-controls-v7-8-9-test.html`

Theme applier:

- `stream-bandit-shared-style-v7-0-2.js`

Saved data owner:

- `sb_app_settings`

Saved keys:

- `web_builder_shared_style_v7_8_8`
- `web_builder_style`
- fallback read support: `builderStyle`

Owned properties:

- accent colour
- secondary accent colour
- background colour
- card colour
- title colour
- normal text colour
- button text colour
- font family
- large text
- high contrast
- theme presets

Rules:

- Web Builder owns the global display/theme property.
- Settings must not duplicate these controls.
- Settings may link to Web Builder Theme Studio or show owner/status only.
- Do not create another page saving these same style keys.

### Shared style helper

Helper file:

- `stream-bandit-shared-style-v7-0-2.js`

Role:

- Reads the Web Builder style keys from `sb_app_settings`.
- Applies CSS variables globally to pages that include the helper.

Applies:

- `--accent`
- `--good`
- `--accent2`
- `--purple`
- `--bg`
- `--card`
- `--p`
- `--p2`
- `--title`
- `--muted`
- `--btnText`
- `--fontScale`
- `--line`
- body font family

Rules:

- It applies style only.
- It does not own editing.
- Editing remains in Web Builder Theme Studio.

### Web Builder page/layout owner

Owner page:

- `web-builder-full-edit-lock-v7-8-6-test.html`

Route:

- `web-builder-admin-shell-v6-57-test.html`

Saved data owner:

- `sb_site_pages.layout_json`
- `sb_site_pages.settings_json`
- form submissions: `sb_form_submissions.answers_json` through form save/viewer pages

Owned properties:

- builder page slug/title
- page layout blocks
- form block questions
- form question type
- required/optional state
- multiple-choice options
- block action URLs
- page publish state

Rules:

- Web Builder owns page/block/form structure.
- Do not move form block editing into Settings.
- Do not duplicate builder page editing in Platform Builder.

### Settings Platform Control Hub

Current page:

- `settings-platform-control-hub-v7-1-8-test.html`

Role:

- Feature/status/visibility map.
- Owner page links.
- Future settings JSON shape preview.

Important status:

- Current V7.1.8 page is a loader wrapper around V7.1.6 / V7.1.5.
- It is not the true global theme editor.
- It must not duplicate Web Builder Theme Studio controls.

Future owner candidate:

- feature availability/status controls only, not theme editing.

### Settings Global Bridge

Helper file:

- `stream-bandit-settings-global-v7-1-8.js`

Role:

- Reads future Settings JSON from `sb_app_settings`.
- Exposes `window.StreamBanditSettingsGlobal`.
- Provides `enabled`, `mode`, and `visible` helper methods.

Important status:

- Safe stage only.
- No redirects.
- No page hiding yet.
- No favicon replacement yet.
- No Supabase writes.

Rules:

- Bridge reads/settings status.
- It does not own theme editing.
- It should not conflict with Web Builder style keys.

### Settings Studio V6.55

Current file:

- `settings-studio-admin-shell-v6-55-test.html`

Current role:

- Interactive local preview only.
- No saved settings.
- No Supabase writes.
- Has theme-looking controls, but they are preview-only.

Important rule:

- Do not treat V6.55 Settings Studio as the true global theme owner.
- Do not make it save Web Builder theme keys unless the project deliberately changes ownership later.
- Current ownership remains with Web Builder Theme Studio.

### Platform Builder

Current file:

- `platform-builder-settings-borrow-v6-58-2-test.html`

Role:

- Platform planning/status page.
- Borrows the saved Web Builder/Theme Studio style for visual consistency.
- Read-only / no writes.

Rules:

- Do not make Platform Builder own global theme.
- Do not make Platform Builder own Web Builder page layout.
- It can show modules, services, users/access, safety gates.

### Final Shell Navigation

Current route:

- `final-shell-navigation-admin-shell-v6-59-test.html`

Current target:

- `final-shell-navigation-global-helpers-v7-2-0-test.html`

Role:

- Master menu/route guide.
- Overlay counts/status guide.
- Safe route map / readiness page.
- Borrows/applies Web Builder style.
- No writes.

Rules:

- Final Shell Navigation does not own routes by itself unless explicitly promoted later.
- It documents route state and safe checks.
- It must not edit theme/settings/page data.

## Current Settings group progress

Completed:

- Profile Settings: `profile-settings-global-helpers-v7-5-8-test.html`

Pending:

- Final Shell Navigation
- Platform Builder
- Settings
- Settings Studio
- Web Builder deep pass

## Recommended order after this ownership map

1. Final Shell Navigation — read-only guide/status page.
2. Platform Builder — read-only platform planner that borrows style.
3. Settings — feature/status map, must avoid duplicate theme editing.
4. Settings Studio — decide whether to keep as preview/status or convert into proper non-conflicting settings studio.
5. Web Builder — deep scan/pass last because it owns global display/theme and builder layout.

## Non-duplication safety locks

Do not duplicate these controls:

- Theme editor outside Web Builder Theme Studio.
- Profile avatar/banner outside Profile Settings.
- Builder layout/form editor outside Web Builder.
- Review Queue submission status controls outside Review Queue.
- Channel image controls outside Channels.
- Playlist link/artwork controls outside Playlists.

This map should be checked before upgrading any remaining Settings group page.
