# Stream Bandit Global Helpers Scan After Profile Settings V7.0.4

## Reason for scan

Trevor correctly noted that Profile Settings only matters if profile/global features are applied across the app. This scan records how the passed profile work fits into the wider shared shell/global helper puzzle.

## Passed current Profile Settings candidate

- `profile-settings-complete-v7-0-4-test.html`

Passed features:

- profile text save/load
- avatar upload/save to `sb_profiles.avatar_url`
- banner upload/save to `sb_profiles.banner_url`
- borrowed shared theme
- top-left account avatar display
- header/search polish
- no insert/upsert
- no live/index promotion

## Global helper files created during this work

- `stream-bandit-auth-avatar-v7-0-2.js`
- `stream-bandit-shared-style-v7-0-2.js`
- `profile-settings-complete-v7-0-3.js`

## Deep scan findings

### 1. Shared shell route list still points Profile Settings to the old page

File:

- `stream-bandit-shell-v6-24.js`

Current route entry still points to:

- `profile-settings-admin-shell-v6-56-test.html`

But that old page is read-only and does not save.

Correct passed candidate is now:

- `profile-settings-complete-v7-0-4-test.html`

### 2. Active route map still points Profile Settings to the old page

File:

- `STREAM-BANDIT-ACTIVE-ROUTE-MAP-V7.md`

It still lists:

- `profile-settings-admin-shell-v6-56-test.html`

This needs to be updated to the V7.0.4 candidate after Trevor approves route promotion.

### 3. New global helpers are not app-wide yet

The new helpers are currently proven on Profile Settings pages:

- `stream-bandit-auth-avatar-v7-0-2.js` reads `sb_profiles.avatar_url` and updates the top-left account/logo area.
- `stream-bandit-shared-style-v7-0-2.js` reads `sb_app_settings` and applies saved shared style.

They are not automatically included on every page yet.

### 4. Best next move

Before moving to Settings, promote the Profile Settings route safely inside the shared shell route list and route map:

- Change Profile Settings menu route from `profile-settings-admin-shell-v6-56-test.html` to `profile-settings-complete-v7-0-4-test.html`.
- Update `STREAM-BANDIT-ACTIVE-ROUTE-MAP-V7.md` to mark V7.0.4 as the current profile route.

This is a route promotion only, not live/index promotion.

### 5. Bigger global helper move comes after route promotion

After the Profile Settings route is corrected, the next wider improvement is to decide where to load the global helper pair:

- `stream-bandit-auth-avatar-v7-0-2.js`
- `stream-bandit-shared-style-v7-0-2.js`

Preferred options:

1. Add them to the shared shell pattern so active pages inherit profile avatar + theme automatically.
2. If shared shell cannot safely load them yet, add them to active pages as each page passes final run.

Avoid random patching page by page without the menu overlay checklist.

## Decision

Profile Settings V7.0.4 is passed but not fully connected globally until the shared route list points to it.

Next recommended action:

- Safe route promotion for Profile Settings only.

No index/live promotion yet.
