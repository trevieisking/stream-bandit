# Stream Bandit Global Pages Assessment V7

Purpose: record the recovered status of the most important global pages from Trevor's screenshots and pasted code. This is documentation only. No app files are changed by this document.

## Recovered global page status

### 1. Account/Login

Active candidate:

- `account-landing-sync-v6-72-2-test.html`

Observed status:

- Shared shell/header appears.
- Search bar appears.
- Account header appears.
- Supabase SDK is loaded at the top.
- Shared shell scripts are loaded.
- Auth/profile helper is loaded.
- Auth sync helper is loaded.
- Borrowed style loader exists.
- `Reload borrowed style` button exists.
- `Refresh account` button exists.
- `Sync header` button exists.
- Page can show signed-in dashboard.
- Page reads Supabase Auth and `sb_profiles`.
- No app data writes except auth sign-in/logout action.

Decision:

- This page is close to pass/current.
- Do not rebuild it.
- Keep it as the account foundation candidate.
- Only revisit if header account sync fails or Supabase email-link limit blocks testing.

### 2. Profile Settings

Current file:

- `profile-settings-admin-shell-v6-56-test.html`

Observed status:

- Shared shell/header appears.
- Search appears.
- Account panel appears.
- Supabase SDK is loaded.
- Auth helper is loaded.
- Page says safe profile map only.
- Page is read-only.
- Save/upload/profile buttons are locked.
- It maps profile requirements but does not perform real profile saves.
- It says avatar/banner upload is future work.

Problem:

- This cannot remain final as a read-only page.
- Profile Settings is a global dependency page.
- It must eventually handle real global profile state.
- Avatar/banner/profile images should follow Rule 4: images are uploads.

Decision:

- This is a priority upgrade page after Account/Login.
- Upgrade should preserve the good shell layout but add real safe profile functions.
- Normal safe buttons should work.
- Dangerous actions such as delete profile can stay protected.

Required future functionality:

- Read Supabase Auth session.
- Read current `sb_profiles` row.
- Save display name / username / channel name / bio where schema allows.
- Upload avatar image to Supabase Storage if bucket/policy supports it.
- Upload banner image to Supabase Storage if bucket/policy supports it.
- Save public image URLs back to profile/app profile fields only after schema is confirmed.
- Update shared header/profile chip after save.

### 3. Settings

Current file:

- `settings-admin-shell-v6-54-test.html`

Observed status:

- Shared shell/header appears.
- Search appears.
- Account appears.
- Supabase SDK is loaded.
- Auth helper is loaded.
- Page is read-only.
- Save/upload/settings buttons are locked.
- It maps branding/theme/player/accessibility/profile/channel settings.
- It says settings should affect all pages through shared shell later.

Problem:

- This cannot remain final as a read-only map page.
- Settings is a global dependency page.
- Safe settings controls should work instead of staying locked.

Decision:

- Upgrade after Profile Settings.
- Use the working shared-style pattern from style-borrow pages.
- Use `sb_app_settings` row `stream_bandit` for global settings where appropriate.
- Normal safe buttons should save/load/apply.
- Dangerous/live actions stay protected.

Required future functionality:

- Save global app identity/settings to `sb_app_settings`.
- Load global settings on page load.
- Apply settings to the page and shared shell.
- Preserve accessibility/audio/player comfort values.
- Do not break current player comfort and audio boost.

### 4. Settings Studio

Current file:

- `settings-studio-admin-shell-v6-55-test.html`

Observed status:

- Shared shell/header appears.
- Search appears.
- Account appears.
- Supabase SDK is loaded.
- Auth helper is loaded.
- Local preview works.
- Tabs work.
- It says local preview only.
- Save/upload/publish actions are locked.

Problem:

- This page is useful as a preview, but final global controls must save.
- It should not remain local-preview-only if it is meant to control global settings.

Decision:

- Merge the useful preview controls with the real shared style save/load pattern from Theme Studio V7.8.9.
- Do not create a third duplicate settings page.
- Decide whether Settings Studio or Web Builder Theme Studio is the official global style owner, then keep one clear active route.

Required future functionality:

- Load `sb_app_settings`.
- Save global shared style.
- Save app identity where appropriate.
- Apply preview immediately.
- Keep no-op/dead buttons out of the final page.

### 5. Web Builder Theme Studio Controls

Current file:

- `web-builder-theme-studio-controls-v7-8-9-test.html`

Observed status:

- Supabase SDK loaded.
- Shared shell loaded.
- Reads and writes `sb_app_settings`.
- Uses row id `stream_bandit`.
- Uses shared style key `web_builder_shared_style_v7_8_8`.
- Also writes fallback key `web_builder_style`.
- Presets work.
- Large text and high contrast are part of the saved style.
- Save Shared Style works.
- Load Shared Style works.
- Theme JSON debug works.

Problem:

- This is the working style saver, but it is not yet the full global identity/profile/settings owner.
- It may not include the account/profile helper and full shared shell pieces consistently.
- Links still reference some older Web Builder checkpoints in the page copy.

Decision:

- Treat V7.8.9 as the proven style-save engine.
- Do not rebuild it randomly.
- Use its save/load code as the pattern for Settings / Settings Studio upgrades.
- Later polish links to the current Web Builder chain from V7.9.8.

## Correct next build order from this assessment

1. Account/Login: keep and verify, no rebuild.
2. Profile Settings: upgrade from read-only to functional safe profile/global-profile page.
3. Settings: upgrade from read-only to functional safe global settings page.
4. Settings Studio: upgrade from local preview to saved global controls or merge with Theme Studio.
5. Theme Studio V7.8.9: keep as the style save/load engine and align route links.
6. Then move to Accessibility and the rest of the active route map.

## Key rule confirmed

The final run must not leave normal safe functions locked or inactive.

Read-only is acceptable only for true safety/reference pages.

Pages that are meant to control global app behaviour must become real functional pages.

## Media rule confirmed

Images are uploads.

Videos are URLs.

This affects profile/avatar/banner/logo/poster/backdrop/channel art/playlist art/collection art.
