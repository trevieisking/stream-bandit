# Stream Bandit V5.22.1 Stable Checkpoint

Current stable checkpoint:

`Stream Bandit V5.22.1 - Supabase Trailer Details Fix Live`

## Live app

Live entry file:

`index.html`

Current live title:

`Stream Bandit V5.22.1 Stable`

## What changed in V5.22.1

V5.22.1 promoted the Supabase trailer details display fix.

The Trailer tab on Supabase Details can now display trailer links saved through the Supabase Movie Manager instead of showing `No trailer added yet` when a saved trailer URL exists.

Live now loads:

`assets/stream-bandit-v5-22-1-supabase-trailer-details-fix.js`

## Confirmed test result

User confirmed the trailer fix worked correctly before promotion.

Recommended smoke test path:

1. Open live Stream Bandit.
2. Hard refresh.
3. Go to Library.
4. Open a movie with a saved trailer link, such as Crime 101.
5. Open the Trailer tab.
6. Confirm the trailer displays.
7. Open another movie without a trailer and confirm it still handles the empty trailer state safely.

## Current protected player setup

The current live player setup remains based on the V5.21.12 clean player controls work.

Live uses:

- `assets/stream-bandit-v5-21-5-player-comfort-fixed.js`
- `assets/stream-bandit-v5-21-12-clean-player-controls.js`

The old V5.11.9 Sound Booster is not loaded live because it caused the native player volume to snap back to maximum.

Current player rule:

- Custom Stream Bandit volume overlay is the main volume control.
- Sound Booster boost selector controls accessibility/louder audio boost.
- Native browser/player volume bar can be ignored.

## Current Tools setup

Live Tools page remains:

`tools-v5-20-2.html`

Live Tools link script remains:

`assets/stream-bandit-v5-14-6-live-tools-link.js`

## Recent stable checkpoints leading here

- V5.20.2 - Full Tools Page plus Backup Notes Builder Live
- V5.21.3 - Backup Page Tidy Overlay Live
- V5.21.12 - Clean Player Controls Live
- V5.22.1 - Supabase Trailer Details Fix Live

## Areas intentionally left alone

V5.22.1 did not change:

- Supabase database tables
- Movie row save logic
- Mux assets
- Player source loading
- Watchlist, Likes or Favourites saves
- Settings logic
- Admin permissions
- Tools page route
- Backup tidy overlay

## Next recommended route

Keep running full smoke tests after V5.22.1.

Next likely tidy/fix targets:

1. Accessibility page tidy, to match the new clean player controls and remove old/confusing player boost wording.
2. Supabase Movie Manager polish, if trailer/media fields need clearer labels.
3. Continue page-by-page tidy work using the same method: test route first, smoke test, then promote only after passing.
