# Stream Bandit V7 Recovery Bottom Checkpoint

This is the end-of-recovery checkpoint after the long context was recovered and the project direction was rebuilt.

## Current state

We are back on a safe working base. The broken work from the bad run was rolled off `main`, and the repo has been documented instead of patched randomly.

The important recovery/planning files now saved are:

- `STREAM-BANDIT-REPO-CLEANUP-INVENTORY-V7.md`
- `STREAM-BANDIT-ACTIVE-ROUTE-MAP-V7.md`
- `STREAM-BANDIT-ASSETS-CLEANUP-INVENTORY-V7.md`
- `STREAM-BANDIT-SHARED-STYLE-PATTERN-V7.md`
- `STREAM-BANDIT-GLOBAL-PAGES-ASSESSMENT-V7.md`

## Confirmed working shared-style/settings pattern

These pages are confirmed or strongly identified as using the right shared style/settings behaviour:

- `final-shell-navigation-style-borrow-v6-59-3-test.html`
- `live-readiness-style-borrow-v6-60-5-test.html`
- `test-checklist-admin-shell-v6-62-test.html`
- `tools-page-admin-shell-v6-63-test.html`
- `health-check-admin-shell-v6-64-test.html`
- `mux-manager-admin-shell-v6-65-test.html`
- `storage-prep-admin-shell-v6-66-test.html`
- `backup-safety-admin-shell-v6-67-test.html`

These show the working global style pattern:

- Supabase SDK loaded where needed
- shared shell loaded
- menu/search shell active
- account/profile shell active where relevant
- saved style borrowed from `sb_app_settings`
- style key `web_builder_shared_style_v7_8_8`
- fallback key `web_builder_style`

## Global pages recovered assessment

### Account/Login

Use:

- `account-landing-sync-v6-72-2-test.html`

Status:

- Basically working.
- Shared shell/header/search/account present.
- Auth/profile state reads Supabase session and `sb_profiles`.
- Uses borrowed style.
- Do not rebuild.
- Verify only.

### Profile Settings

Use:

- `profile-settings-admin-shell-v6-56-test.html`

Status:

- Shell/search/account present.
- Currently read-only/locked.
- Must become functional because profile is global.
- Needs real safe profile save/upload work later.
- Images are uploads.

### Settings

Use:

- `settings-admin-shell-v6-54-test.html`

Status:

- Shell/search/account present.
- Currently read-only/locked.
- Must become functional because settings should affect all pages/global shell.

### Settings Studio

Use:

- `settings-studio-admin-shell-v6-55-test.html`

Status:

- Local preview works.
- Currently no real save.
- Should be upgraded or aligned with Theme Studio, not duplicated again.

### Theme Studio

Use:

- `web-builder-theme-studio-controls-v7-8-9-test.html`

Status:

- Proven shared-style save/load engine.
- Saves to `sb_app_settings`.
- Uses `web_builder_shared_style_v7_8_8` and `web_builder_style`.
- Do not rebuild randomly.
- Use this save/load pattern for global settings upgrades.

## Main recovered rules

1. Use the menu overlay as the master checklist.
2. Do global pages first, then dependent pages.
3. Apply the working shared style/settings pattern across pages.
4. Do not patch randomly.
5. Do not rebuild working pages.
6. Do not create duplicate settings pages.
7. Do not leave normal safe buttons locked/dead.
8. Read-only pages are only acceptable if they are true safety/reference pages.
9. Images are uploads.
10. Videos are URLs/Mux/HLS/embed/direct URLs.
11. Do not promote live/index until final backup, smoke test and Trevor approval.

## Correct continuation order

1. Account/Login: verify only, no rebuild.
2. Shared auth/Supabase SDK issue if it still appears.
3. Profile Settings: make functional safe global profile page.
4. Settings: make functional safe global settings page.
5. Settings Studio: align/merge with Theme Studio save pattern.
6. Theme Studio V7.8.9: keep as style engine and polish links if needed.
7. Accessibility/player comfort.
8. Supabase Library / Storage Prep.
9. Admin Centre / permissions / policy.
10. Watch/Browse/Creator pages from active route map.
11. Web Builder chain and registry.
12. Live Readiness and Backup/Safety.
13. Only then consider live/index promotion.

## Known caution

Some pages may load `stream-bandit-auth-profile-v6-31.js` without loading the Supabase SDK first. If the account panel says `Supabase client not available`, fix the shared cause or add the SDK line before the auth helper on affected pages.

Do not treat that as a reason to rebuild the page.

## We are at the bottom

This checkpoint represents the recovered bottom of the bad patch. The next session should continue from this file plus `STREAM-BANDIT-GLOBAL-PAGES-ASSESSMENT-V7.md`.
