# Stream Bandit V5.23.2 Stable Checkpoint

Current stable checkpoint:

`Stream Bandit V5.23.2 - Accessibility Details-Style Tidy Live`

## Live app

Live entry file:

`index.html`

Current live title:

`Stream Bandit V5.23.2 Stable`

Live GitHub Pages route:

`https://trevieisking.github.io/stream-bandit/`

## What changed

V5.23.2 promotes the tested Accessibility tidy page to live.

The Accessibility page now uses a clean Details-style layout:

- wide hero card,
- neat tabs,
- one clean panel at a time,
- Sound Booster tab,
- Display tab,
- Shortcuts tab,
- Save / checklist tab.

## Important protected rule

The player itself was not changed.

Accessibility now matches/explains the protected player setup:

- custom Stream Bandit volume overlay controls normal volume,
- Sound Booster controls extra accessibility gain for quiet videos,
- Sound Booster supports up to 400% boost,
- player code and volume behaviour remain protected.

## Tested before promotion

User completed smoke tests and confirmed things work.

Tests included:

- Accessibility page opens,
- tabs click correctly,
- Sound Booster wording matches current player,
- Display tab works,
- Shortcuts tab works,
- Save/checklist tab works,
- player still opens and plays,
- Details page still works,
- general live checklist tests still pass.

## Live scripts after V5.23.2

Live `index.html` now loads:

- `assets/stream-bandit-app.js`
- `assets/stream-bandit-v5-5-1-supabase-cast-manager.js`
- `assets/stream-bandit-v5-6-menu-organiser.js`
- `assets/stream-bandit-v5-6-2-settings-logo.js`
- `assets/stream-bandit-v5-11-8-final-boss-controller.js`
- `assets/stream-bandit-v5-12-1-manager-layout-hotfix.js`
- `assets/stream-bandit-v5-14-6-live-tools-link.js`
- `assets/stream-bandit-v5-21-3-backup-tidy-overlay.js`
- `assets/stream-bandit-v5-21-5-player-comfort-fixed.js`
- `assets/stream-bandit-v5-21-12-clean-player-controls.js`
- `assets/stream-bandit-v5-22-1-supabase-trailer-details-fix.js`
- `assets/stream-bandit-v5-22-13-details-buttons-only.js`
- `assets/stream-bandit-v5-23-2-accessibility-details-style.js`

## Safe rollback

If V5.23.2 caused problems, rollback would mean removing this line from live `index.html`:

`assets/stream-bandit-v5-23-2-accessibility-details-style.js`

Fallback checkpoint:

`Stream Bandit V5.22.13 - Supabase Details Buttons Polish Live`

## Next recommended work

Next safe course of action:

1. Move Quality Tools helpers into the standalone Tools Page flow.
2. Continue one page at a time.
3. Test route first, then promote only after smoke tests pass.

Quality Tools rule:

- Quality helpers belong on standalone Tools pages unless they genuinely need active page logic.
- Do not embed quality helpers back into Admin, Settings, Manager, Details, Player or other active pages.
