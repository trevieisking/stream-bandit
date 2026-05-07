# Stream Bandit V5.20.2 Stable Checkpoint

Current stable checkpoint: Stream Bandit V5.20.2 - Full Tools Page plus Backup Notes Builder Live.

Current live Tools page:

`tools-v5-20-2.html`

Live Tools link script:

`assets/stream-bandit-v5-14-6-live-tools-link.js`

Confirmed live Tools target:

`TOOLS_URL = 'tools-v5-20-2.html'`

## Rollback pages

Keep these fallback pages available:

- `tools-v5-19-2.html` - Full Tools plus Cast Formatter fallback
- `tools-v5-18-1.html` - Safety Polish fallback
- `tools-v5-18.html` - Release Safety Checker fallback
- `tools-v5-17.html` - Earlier stable Tools fallback

Extra test pages kept for history:

- `tools-v5-19.html` - Cast Formatter isolated test
- `tools-v5-19-1.html` - Dead-click test route kept for history
- `tools-v5-20.html` - Tool Move Planner test
- `tools-v5-20-1.html` - Backup Notes isolated test

## Live Tools tabs in V5.20.2

- Release Safety
- Backup Notes
- Cast Formatter
- Link Audit
- Image Checker
- Size Checker
- Mux / HLS
- Metadata
- Rating
- Runtime
- Future

## Tests passed before promotion

- V5.20.2 page loaded directly
- All tabs clicked and switched correctly
- Release Safety passed
- Link Audit passed
- Backup Notes built and copied notes correctly
- Cast Formatter passed
- Image Checker quick test passed
- Size Checker quick test passed
- Mux / HLS helper quick test passed
- Metadata helper quick test passed
- Rating helper quick test passed
- Runtime helper quick test passed
- Live app opened normally
- Live Tools button opened the promoted page after refresh

## Read-only Supabase checks reported

- `movies` - 0 rows visible to this key
- `sb_movies` - 9 rows visible to this key
- `sb_channels` - 7 rows visible to this key
- `sb_profiles` - 1 row visible to this key

## Areas intentionally left alone

V5.20.2 did not change the active app areas such as Settings, Admin page behaviour, Movie Manager behaviour, movie data, player behaviour, Mux assets, Sound Booster, user saves, database tables, or storage policies.

## Project rule going forward

Keep helper utilities on standalone Tools pages when possible. Good Tools-page candidates include text formatters, cast formatter, image checker, size checker, rating calculator, runtime converter, Mux/HLS note helper, backup notes builder, and link/release safety audits.

Core app behaviour should stay protected unless it is deliberately planned and separately tested.

## Next recommended route

Treat V5.20.2 as a stable checkpoint before more changes.

Next possible upgrades after a rest and smoke test:

1. V5.21 Admin cleanup audit - read-only check for leftover duplicate helper panels.
2. V5.21 Mux/HLS Row Checker - standalone Tools page only, no secret tokens and no app writes.

Safe method remains: create a separate test page first, test direct page, run safety and link audits, keep the previous live Tools page as rollback, and promote only after all tests pass.
