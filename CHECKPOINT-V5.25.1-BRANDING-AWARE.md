# Stream Bandit V5.25.1 Branding-Aware Colour Checkpoint

Checkpoint name:

`Stream Bandit V5.25.1 - Branding Controls Active Colours`

## Status

V5.25.1 is live as a tiny visual polish.

The active tab/button styling now follows the Settings > Branding accent colours where available.

## What changed

The previous pink tab polish was changed into a branding-aware accent polish.

File:

`assets/stream-bandit-v5-25-1-pink-tab-polish.js`

The patch now:

- reads Accent colour 1 and Accent colour 2 from the Branding page inputs when available,
- uses those colours for active tabs/buttons,
- falls back to Stream Bandit pink/purple if no branding values are found,
- keeps Settings > Branding as the controlling page for app accent colours.

## User confirmation

User confirmed they love the result because the colours are now customisable everywhere.

## Protected areas / not touched

No changes were made to:

- player,
- Sound Booster,
- custom volume overlay,
- Continue Watching progress logic,
- Supabase saves,
- movie rows,
- database tables,
- Mux,
- Tools Quality audit logic.

## Current direction

Continue page tidying one page at a time, but keep existing working pages intact when they already look good.

For future visual polish, prefer branding-aware styling over hard-coded colours.
