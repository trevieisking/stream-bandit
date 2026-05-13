# Stream Bandit Watch Area Known Fix — Search Overlay Detail Route

Recorded after `continue-watching-watch-shell-v6-35-test.html` passed.

## Current status

Continue Watching V6.35 passed as a page test.

Passed:
- Page loads as V6.35 Continue Watching Watch Shell TEST
- Search overlay appears while typing
- Account chip appears under Stream Bandit logo
- Continue/Link Test cards work
- Details buttons on the page use `details-watch-shell-v6-33-test.html`
- Resume / Play buttons on the page use `player-watch-shell-v6-34-test.html`
- Tabs switch
- No save/clear/fake progress/write/live/index action

## Known search overlay issue

When clicking a movie result from the shared search overlay, it still opens the old Details page.

Current wrong behaviour:
- Shared search movie result opens old Details route, likely `details-menu-upgrade-v5-88-1-test.html`.

Required final behaviour:
- Shared search movie result should open the current Watch Details route:
  `details-watch-shell-v6-33-test.html?id=<movie_id>`

## Important decision

Do not fix this immediately during the Continue Watching page pass.

Reason:
- Continue Watching V6.35 itself passed.
- This is a shared search-shell routing issue, not a page-specific Continue Watching failure.
- Fix it once as a shared shell/search update after the current Watch area page pass sequence, so every page benefits cleanly.

## Later fix target

Likely file:
- `stream-bandit-shell-v6-24.js`

Likely function/area:
- shared overlay search movie result href generation

Change movie result route from old Details route to:
- `details-watch-shell-v6-33-test.html?id=<movie_id>`

Then smoke test search overlay on all Watch pages before updating the registry.
