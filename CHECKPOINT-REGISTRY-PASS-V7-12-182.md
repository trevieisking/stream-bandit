# Stream Bandit Checkpoint — V7.12.182 Registry Pass

Date: 2026-06-02

## Browser test result

User tested the rebuilt Current Routes Registry and supplied the copied registry report.

## Passed report

Version:

- `V7.12.182 Current Routes Registry / 53 Active Route Truth`

Counts:

- Overlay entries: 53
- Unique URLs: 48
- Route scan: 48/48
- Route issues: 0
- Protected file scan: 13/13
- Protected file issues: 0

Timestamp from registry report:

- `2026-06-02T09:16:32.716Z`

## Active group counts

- Watch: 10
- Browse: 4
- Creator: 3
- Group Play: 5
- Settings: 4
- Policy: 3
- Admin: 9
- Owner: 12
- User Management: 3

Total active entries: 53.

## Important route truth confirmed

Group Play:

- Collections: `collections-clean-machine-v7-12-51-test.html`
- Player 2: `player-2-clean-machine-v7-12-58-test.html`

Owner cleanup:

- Clean Machine Menu is removed from active Owner routes.
- Route Pointer Machine is removed from active Owner routes.
- Owner group is now 12 active entries.

Registry rules confirmed:

- Deleted Owner machines are removed from the active menu.
- Root icon checks are not active route truth.
- Test slot remains `collections-header-shell-v7-12-180-test.html`.

## Protected files confirmed loaded 200

- `stream-bandit-header-shell-v7-12-156.js`
- `stream-bandit-footer-shell-v7-12-156.js`
- `stream-bandit-theme-projector-v7-12-156.js`
- `stream-bandit-settings-global-v7-1-8.js`
- `stream-bandit-brand-logo-v7-12-12.js`
- `stream-bandit-menu-saves-count-v6-72-1.js`
- `stream-bandit-core-saves-v6-75.js`
- `live-readiness-search-supabase-fallback-v7-12-130.js`
- `stream-bandit-profile-signin-v7-12-156.js`
- `stream-bandit-shell-v6-24.js`
- `collections-clean-machine-v7-12-50-test.html`
- `CURRENT-APP-MANIFEST-V7-12-180.md`
- `collections-header-shell-v7-12-180-test.html`

## Result

V7.12.182 Registry is a confirmed pass.

Next safe step:

- Check `index.html` browser view shows V7.12.182 and 53 active entries.
- Then check `stream-bandit-one-machine-v7-12-73-test.html` still reports 53 active entries / 48 unique URLs without route accumulation.
- Do not touch page groups until this registry/index/One Machine foundation remains confirmed.
