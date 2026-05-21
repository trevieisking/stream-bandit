# Stream Bandit Checkpoint — Group Play Done Pages

Date: 2026-05-21

Trevor confirmed these three Group Play pages are done from the current global-helper run.

## Done pages confirmed by screenshot/test

### Collections

Current passed page:

- `collections-global-helpers-v7-5-1-test.html`

Observed status:

- V7.5.1 Collections Global Helpers TEST
- global theme is applied
- account/avatar loaded
- shared style loaded
- settings bridge loaded
- collections list loads
- selected collection loads videos
- Play All Collection uses Player 2 global route
- manager tools remain protected on old V6.95.2 manager
- no direct writes on the V7.5.1 browse/global shell

### My Channel

Current passed page:

- `my-channel-global-helpers-v7-5-0-test.html`

Observed status:

- V7.5.0 My Channel Global Helpers TEST
- view-only creator dashboard
- global theme/avatar/account helpers loaded
- Player 2 queue available through Play All
- dashboard stats load
- workflow links show Submit, Review, Approved to Movies, Channel Manager
- page remains view-only; editing stays with manager pages

### Player 2

Current passed page:

- `player-2-progress-helper-v6-78-9-4-test.html`

Observed status:

- V6.78.9.4 Player 2 Global Carry TEST
- queue mode loads
- account/avatar/shared style/settings bridge loaded
- progress logic kept from V6.78.9.3 pattern
- Player 1 import avoided/protected
- queue/up next works
- playback/progress monitor visible

## Important Player 2 route rule

Current group-play Player 2 route should be:

- `player-2-progress-helper-v6-78-9-4-test.html`

Queue carry keys to preserve:

- `streamBanditQueueV1`
- `streamBanditUpNextV1`
- `streamBanditPlayer2Queue`

## Menu map rule

After confirming these pages are done, scan matching menu routes and make sure they point to the passed pages:

- Collections route should open `collections-global-helpers-v7-5-1-test.html`
- My Channel route should open `my-channel-global-helpers-v7-5-0-test.html`
- Player 2 route should open `player-2-progress-helper-v6-78-9-4-test.html` or route cleanly to it

Do not promote live `index.html` yet.
