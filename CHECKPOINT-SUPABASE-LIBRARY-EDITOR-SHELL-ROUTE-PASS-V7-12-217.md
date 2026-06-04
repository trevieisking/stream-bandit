# Stream Bandit Checkpoint — Supabase Library Editor Shell/Route Pass V7.12.217

Date: 2026-06-04

## Status

PASS.

## Page

- `supabase-library-home-header-form-fix-v7-12-34-test.html`

## Current internal state

- V7.12.217 Supabase Library Editor / Shell Route Preservation

## Commit

- `09dcff5dc7da0339ee4738a795d949346656b2f7`

## Why this checkpoint matters

This was a hazard-zone / minefield page.

It touches real Supabase movie rows and poster image storage. It is one of the user's favourite tools and must not lose existing create/edit/delete/upload logic.

This pass was intentionally limited to shell/helper preservation and route correction.

## User-tested pass

- Open Supabase Library Editor: PASS
- Header appears: PASS
- Footer appears once: PASS
- Saved counters show: PASS
- Account panel works: PASS
- Rows load from `sb_movies`: PASS
- Search works: PASS
- Status filter works: PASS
- Source filter works: PASS
- Genre filter works: PASS
- Sort works: PASS
- Clear Filters works: PASS
- Field Inventory tab opens: PASS
- Routes tab opens: PASS
- Player 2 route shows `player-2-clean-machine-v7-12-58-test.html`: PASS
- Continue Watching also worked after route correction: PASS
- Create Video overlay opens: PASS
- Create Video overlay closes: PASS
- Edit overlay opens on existing row: PASS
- All fields are still there: PASS
- Poster preview still shows: PASS
- Copy ID works: PASS
- Details opens: PASS
- Play opens Player 1: PASS
- Delete was not tested, by design, unless using a disposable row: SAFE
- Save was not tested, by design, unless using a safe/disposable row: SAFE
- Play All Visible opens current Player 2: PASS
- Debug shows version V7.12.217 and current Player 2 route: PASS

## Debug proof from user

```json
{
  "version": "V7.12.217 Supabase Library Editor / Shell Route Preservation",
  "count": 20,
  "signedIn": true,
  "admin": true,
  "profile": {
    "signedIn": true,
    "role": "admin",
    "admin": true,
    "email": "trevieisking@gmail.com"
  },
  "configSource": "StreamBanditSupabaseConfig",
  "routes": {
    "library": "library-global-helpers-v7-4-8-test.html",
    "details": "details-clean-machine-v7-12-38-test.html",
    "player1": "player-one-global-helpers-v7-3-3-test.html",
    "player2": "player-2-clean-machine-v7-12-58-test.html"
  },
  "writes": {
    "create": true,
    "update": true,
    "delete": true,
    "storageUpload": true
  },
  "storageDelete": false,
  "fieldKeys": [
    "title",
    "description",
    "mux_playback_url",
    "video_url",
    "thumbnail_url",
    "trailer_url",
    "year",
    "rating",
    "runtime_text",
    "age_rating",
    "director",
    "cast_text",
    "genres",
    "tags",
    "channel_id",
    "owner_id",
    "featured",
    "duration_seconds",
    "source_type",
    "status",
    "updated_at"
  ]
}
```

## Preserved fields

The following `sb_movies` field keys remain preserved:

- `title`
- `description`
- `mux_playback_url`
- `video_url`
- `thumbnail_url`
- `trailer_url`
- `year`
- `rating`
- `runtime_text`
- `age_rating`
- `director`
- `cast_text`
- `genres`
- `tags`
- `channel_id`
- `owner_id`
- `featured`
- `duration_seconds`
- `source_type`
- `status`
- `updated_at`

Read-only/display fields remain:

- `id`
- `created_at`
- `updated_at`

## Preserved working logic

The pass preserved the existing behaviour for:

- `sb_movies` read/load,
- create video row,
- edit/save full video form,
- create/edit verification reads,
- typed-confirmation delete flow,
- delete verification read,
- poster preview,
- poster resize to 1920 x 1080,
- poster upload to `stream-bandit-images`,
- public URL placement into `thumbnail_url`,
- filters/search/sort,
- genre filter generation,
- Copy ID,
- Details route,
- Player 1 route,
- Play All visible queue behaviour.

## Route correction

Fixed stale Player 2 route:

Old:

- `player-2-progress-helper-v6-78-9-4-test.html`

Current:

- `player-2-clean-machine-v7-12-58-test.html`

This affects:

- Player 2 constant,
- Routes tab Player 2 link,
- Play All Visible destination.

## Safety notes

Delete and Save were not casually tested because this is a real data page.

Future destructive/write tests should only use a safe disposable row.

Storage delete remains false:

- deleting a movie row does not delete poster/image files.

## Result

Supabase Library Editor remains functional and has current shell/route helpers.

This was a successful preservation pass, not a redesign.

Current recommendation:

- Do not revisit this page immediately unless a specific bug appears.
- Treat it as passed and protected.
- Next minefield pages should get the same scan-first hazard-map approach.
