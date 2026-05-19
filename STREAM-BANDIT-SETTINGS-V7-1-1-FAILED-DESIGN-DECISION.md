# Stream Bandit Settings V7.1.1 Design Fail Decision

## Result

`settings-global-save-v7-1-1-test.html` failed Trevor's test and should not be promoted.

This is not only a code bug. It is a design-direction fail.

## Trevor observation

Settings should not repeat Theme Studio / Global Studio controls.

The page included:

- App name
- Tagline
- Login text
- Theme colours
- Large text / high contrast
- Logo image upload

But these belong in the correct specialist global control pages, not in the normal Settings page.

## Decision

Do not promote:

- `settings-global-save-v7-1-0-test.html`
- `settings-global-save-v7-1-1-test.html`

Do not forward old Settings route to these pages.

## Correct Settings role

Settings should become a global control hub, not a duplicate Theme Studio.

Settings should:

1. Show global account/profile/shell status.
2. Show whether shared theme is active globally.
3. Show whether avatar/profile helper is active globally.
4. Show whether search/menu helper is active globally.
5. Show accessibility/player comfort settings/status.
6. Show safe links to the correct specialist pages:
   - Profile Settings for profile/avatar/banner.
   - Theme Studio / Global Studio for theme, app identity, logo, and style.
   - Accessibility for comfort options.
   - Account for sign-in/session.
   - Backup/Safety before live promotion.
7. Keep any direct writes limited to true Settings-only choices after fields are confirmed.

## Correct page split

### Profile Settings

Current passed route:

- `profile-settings-complete-v7-0-4-test.html`

Owns:

- display name
- username
- channel name
- bio
- avatar_url
- banner_url

### Theme Studio / Global Studio

Owns:

- global colours
- app name
- tagline
- login text
- logo image
- favicon / app icon later
- shared style JSON

### Settings

Should own:

- global status dashboard
- settings hub navigation
- accessibility/player comfort status
- global helper status
- links to specialist controls
- only real settings that are not already owned elsewhere

## Next move

Build a new Settings Control Hub candidate, not another duplicate save form.

Suggested file:

- `settings-global-control-hub-v7-1-2-test.html`

This should load the shared shell, profile avatar, shared style, search, and show status cards plus links. It should not duplicate Theme Studio controls.
