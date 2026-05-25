# Stream Bandit Settings Studio Route Restored V7.12.59

Date: 2026-05-25

Trevor tested the Settings Studio menu route after the route fix.

Route tested:

`settings-studio-admin-shell-v6-55-test.html`

Result:

- Link worked.
- The route now opens the current passed Settings Sources / Owner Launcher instead of the temporary safety alias card.

Route now targets:

`settings-sources-owner-launcher-v7-6-6-test.html`

Commit that restored the route:

`2e4a7a09de25397e00145a91decd55bd8190a1b9`

Meaning:

- Settings Studio was not lost.
- It had been parked behind a safety alias during cleanup.
- The menu route is now restored to the passed Settings Studio / owner launcher path.
- This should appear correctly from the overlay menu once GitHub Pages cache catches up.

Current verified app status:

- Focused Keep Scope Scanner: Missing In Scope = 0.
- Menu Overlay Test Board: 50/50 load pass.
- Manual menu test found one bad route: Settings Studio.
- Settings Studio route has now been fixed and directly tested by Trevor.

Next test:

1. Hard refresh the live app/menu after GitHub Pages catches up.
2. Open the overlay menu.
3. Click Settings > Settings Studio.
4. Confirm it opens Settings Sources / Owner Launcher.
5. Continue manual group testing for any button/tab issues inside pages.

Safety rule remains:

- No deletes.
- No archive batch yet.
- No Supabase writes.
- No live/index promotion from this fix.
