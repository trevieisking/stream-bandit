# Stream Bandit Watch Area Decision — Continue Watching Resume Progress V6.35

Recorded after `continue-watching-watch-shell-v6-35-test.html` passed.

## Decision

For the current Watch-area shell audit, Continue Watching is allowed to pass without resuming the exact timestamp yet.

## Why

The V6.35 Continue Watching test is a read-only route/shell safety page. Its required job at this stage is:

- show Continue Watching rows or Link Test cards clearly
- keep progress read-only
- avoid fake progress writes
- avoid save/clear/migration actions
- use current Details route: `details-watch-shell-v6-33-test.html`
- use current Player route: `player-watch-shell-v6-34-test.html`
- keep shared search overlay and auth/profile shell working

Exact timestamp resume needs a separate player/progress wiring pass because it involves both sides:

1. Player must read a resume time safely from URL/profile/progress data.
2. Player must later save progress safely, likely only after auth/profile save rules are final.
3. Continue Watching must hand off the timestamp to the Player route.

## Current acceptable behaviour

`continue-watching-watch-shell-v6-35-test.html` may open:

`player-watch-shell-v6-34-test.html?id=<movie_id>`

without a timestamp.

That means it resumes the movie selection, not the exact playback position.

## Required future final behaviour

Before final live replacement, Continue Watching should eventually open something like:

`player-watch-shell-v6-34-test.html?id=<movie_id>&t=<seconds>`

or use a safe Supabase/user progress source after auth/profile save rules are approved.

## Status

Do not block the Watch-area page sequence on exact timestamp resume yet.

Continue to the next Watch page: Watch History.
