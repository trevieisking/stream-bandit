# Web Builder Supabase Connection Map V7.12.264

Date: 2026-06-09

Purpose: map the safe Supabase connection plan for Web Builder before changing Web Builder page code.

This is a planning/checkpoint file only.

No app code changed in this step.
No schema changed in this step.
No storage changed in this step.
No debug panels removed in this step.

## Current safe base

Current pre-connection checkpoint:

- `V7.12.263.8 Web Builder Doorway + Registry + Manifest + Index Alignment` - PASS.
- Registry scan: `50/50` routes OK.
- Protected file scan: `16/16` files OK.
- Main app Web Builder doorway: `web-builder-account-control-hub-v7-12-263-test.html`.
- Old live studio route redirects to the Web Builder Hub.
- Form Inbox and Advanced Form remain preserved from both the main app and Web Builder.

## Supabase tables already present

Main tables useful for this pass:

- `sb_site_pages` - Web Builder pages and page layout source.
- `sb_form_submissions` - Web Builder-owned form inbox submissions.
- `sb_private_messages` - private/owner message intent/message flow.
- `sb_profiles` - Auth profile, role and ownership checks.
- `sb_app_settings` - app/theme/settings source.
- `sb_submissions` - creator video submissions.
- `sb_movies` - published library movies.
- `sb_channels` - channel choices/ownership.

## Existing main app Supabase patterns to reuse

### Supabase Library Editor

Route:

- `supabase-library-home-header-form-fix-v7-12-34-test.html`

Working pattern:

- Uses Supabase SDK.
- Reads Supabase config from the shell/config bridge.
- Reads Auth session and `sb_profiles`.
- Checks admin role.
- Reads `sb_movies`.
- Creates/updates/deletes `sb_movies` with readback verification.
- Uploads poster images to `stream-bandit-images`.
- Keeps debug visible.

Use this as the write/readback model.

### Submit Video

Route:

- `submit-video-clean-machine-v7-12-79-test.html`

Working pattern:

- Creator submits pending rows to `sb_submissions`.
- Does not write directly to `sb_movies`.
- Review Queue is the publish gate.
- Uploads optional poster image.
- Keeps action log/debug visible.

Use this as the safe user-write-to-review pattern.

### Review Queue

Route:

- `review-queue-clean-machine-v7-12-80-publish-test.html`

Working pattern:

- Reads `sb_submissions`.
- Approves/declines rows in `sb_submissions`.
- Publishes approved rows into `sb_movies`.
- Reads `sb_channels` for channel choices.
- Uses admin role checks.
- Keeps debug visible.

Use this as the admin-gated publish pattern.

### Profile Settings

Route:

- `profile-settings-live-ready-v7-12-90-test.html`

Working pattern:

- Existing-user-only Auth magic link.
- Reads/writes `sb_profiles`.
- Uploads avatar/banner image to `stream-bandit-images`.
- Keeps app branding and profile/avatar ownership separate.

Use this as the Auth/profile/storage ownership pattern.

## Existing Web Builder-connected base

### Owned Preview

Route:

- `web-builder-preview-owned-v7-12-257-test.html?page=landing`

Current behavior:

- Reads `sb_site_pages` by `slug`.
- Renders `layout_json` blocks.
- Does not write to Supabase.
- Does not load Stream Bandit app shell.
- Keeps Web Builder projector/branding.
- Keeps debug visible.

Use this as the first Web Builder read model.

### Owned Form Designer

Route:

- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`

Current behavior:

- Supabase SDK is already loaded.
- Web Builder projector is connected.
- Form preview, local test, real submit, owned inbox links are already present.
- Destination routing is already designed.

Use this as the first Web Builder save/load form model.

### Owned Form Inbox

Route:

- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`

Current behavior:

- Web Builder-owned inbox route is present.
- Soft remove/archive pass already proven.
- Should remain connected to `sb_form_submissions`.

Use this as the Web Builder output/read model.

## Safe connection order

### Step 1 - Map only

Status: this file.

- No code changes.
- No schema changes.
- No storage changes.
- No debug removal.

### Step 2 - Tiny stale route fix

Target file:

- `stream-bandit-shell-v6-24.js`

Planned route-only change:

- `builder` -> `web-builder-account-control-hub-v7-12-263-test.html`
- `builderStudio` -> `web-builder-account-control-hub-v7-12-263-test.html`

Reason:

- The legacy shell bridge still exposes old Web Builder live studio route values.
- Many older pages use this file for Supabase config.
- Change must be route-only and must not affect Supabase URL/key/config bridge.

### Step 3 - Owned Pages Manager read pass

Target route:

- `web-builder-pages-manager-owned-v7-12-256-test.html`

Goal:

- Read page list from `sb_site_pages`.
- Keep local fallback visible.
- Do not delete rows.
- Do not write rows in first pass.
- Debug must show count/read source/error.

### Step 4 - Owned Preview verification pass

Target route:

- `web-builder-preview-owned-v7-12-257-test.html?page=landing`

Goal:

- Verify `sb_site_pages` read by slug.
- Verify `layout_json` render.
- Keep read-only.
- Keep debug visible.

### Step 5 - Form Designer save/load pass

Target route:

- `web-builder-form-designer-owned-v7-12-258-test.html?page=landing`

Goal:

- Load page/form layout from `sb_site_pages`.
- Save form layout back to `sb_site_pages.layout_json` only after explicit button press.
- Verify save with readback.
- Keep local draft fallback.
- Keep debug visible.

### Step 6 - Owned Form Inbox proof pass

Target route:

- `web-builder-form-inbox-owned-v7-12-258-test.html?page=landing`

Goal:

- Confirm real submissions load from `sb_form_submissions`.
- Confirm soft remove/archive still works.
- Confirm filters still work.
- Keep debug visible.

### Step 7 - Polish after proof

Only after all Supabase connection passes:

- Hide debug behind an Admin/Debug overlay or small button.
- Do not fully remove debug until final live promotion passes.
- Do not delete old connected routes until the Web Builder-owned replacements are fully proven.

## Known stale route target

This file still needs a tiny route-only fix later:

- `stream-bandit-shell-v6-24.js`

Current stale values:

- `web-builder-live-studio-v7-12-116-test.html?page=test-page`

Target value:

- `web-builder-account-control-hub-v7-12-263-test.html`

Do not change the Supabase config bridge in that file.

## Future AI helper note

The future app-guide AI/helper should be last.

It should know:

- `index.html`
- `CURRENT-APP-MANIFEST-V7-12-180.md`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`
- `all-pages-version-registry-v7-12-122-current-routes-test.html`
- key help text for each final page

Do not build it until routes/pages stop moving.
It may need backend/RAG or a maintained JSON help map.
