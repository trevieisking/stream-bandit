# Stream Bandit Checkpoint — Global Pass / Menu Map / Supabase Library

Date: 2026-05-21

## Big rule from this session

The menu overlay is the map. After a page passes, the matching menu/route must be checked before moving on.

Correct order going forward:

1. Scan the current menu route.
2. Create or test the page safely.
3. Trevor tests the checklist.
4. Only after pass, promote the route/menu target.
5. Re-read the promoted route for final code check.
6. Leave a checkpoint note.

Do not promote live `index.html` until final RC, backup, full smoke test and explicit approval.

## Global settings rule

All main pages must carry the shared global setup:

- menu shell
- account/profile state
- auth sync
- avatar helper
- shared style/theme helper
- settings global bridge
- saved Stream Bandit theme/look
- correct account/avatar/header behaviour

A page is not considered passed if it only works functionally but still shows old theme/account/avatar behaviour.

## Supabase Library result

This was the hard page because it is not just a browse page. It has real editor tools:

- Supabase `sb_movies` loading
- search/filter/sort
- create video
- edit video overlay
- poster upload to `stream-bandit-images`
- raw REST PATCH save
- verify-read after save
- hide/delete-from-library by setting status hidden
- Details buttons
- Player 1 buttons
- Player 2 Play All queue

Several unsafe approaches were rejected:

- iframe wrapper was not acceptable because the old page inside it kept old theme/account/avatar behaviour
- loader patch was not acceptable as a final route target
- direct full rebuild was needed

Final passed direct page:

- `supabase-library-clean-editor-v6-93-3-test.html`

Promoted route:

- `supabase-library-browse-shell-v6-43-test.html`

The route now opens:

- `supabase-library-clean-editor-v6-93-3-test.html`

Commit for route promotion:

- `3d6231f41830171927c719e67ea660c242c3e9b9`

Trevor test results for V6.93.3:

- Page loads: PASS
- Theme matches global theme: PASS
- Account/avatar appears correctly: PASS
- Helper status shows account/avatar/shared style/settings bridge loaded: PASS
- Movies load: PASS
- Search/filter works: PASS
- Details opens `details-global-helpers-v7-3-1-test.html`: PASS
- Play opens `player-one-global-helpers-v7-3-3-test.html`: PASS
- Play All opens Player 2 V6.78.9.4 and queue works: PASS
- Edit one safe field on a test movie and Save: PASS
- Confirm it verifies and updates: PASS
- Poster upload tested deliberately: PASS
- Delete From Library/hide tested deliberately: PASS

Routes used by V6.93.3:

- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Player 2: `player-2-progress-helper-v6-78-9-4-test.html`

Queue keys used for Player 2:

- `streamBanditQueueV1`
- `streamBanditUpNextV1`
- `streamBanditPlayer2Queue`

Stable old fallback kept:

- `supabase-library-clean-editor-v6-93-0-test.html`

## Web Builder result

Form builder was investigated and confirmed as Web Builder only, not Supabase Library.

Important table:

- `public.sb_form_submissions`

Important columns observed:

- `id`
- `page_slug`
- `form_title`
- `form_key`
- `block_id`
- `block_title`
- `answers_json`
- `submitter_id`
- `submitter_email`
- `status`
- `created_at`

Important rule:

- Full form answers belong together inside `answers_json`.
- Do not save one form field at a time as separate partial state unless deliberately editing the builder.

Web Builder structured form editor passed:

- `web-builder-full-edit-lock-v7-8-6-test.html`

Trevor test result:

- Load page: PASS
- Select Form / Contact block: PASS
- Change question label: PASS
- Change question type: PASS
- Change Required/Optional: PASS
- Add options for multiple choice: PASS
- Add another question: PASS
- Move a question up/down: PASS
- Save + Publish: PASS
- Reload page: PASS
- All form question settings stayed saved together: PASS
- Preview/form submit worked: PASS
- `sb_form_submissions.answers_json` received the full answers object: PASS

Menu Web Builder route connected:

- `web-builder-admin-shell-v6-57-test.html`

It now opens:

- `web-builder-full-edit-lock-v7-8-6-test.html?page=test-page`

Commit:

- `ddf462c6f31e62479ff5e60e64e4e00f4bf30b40`

## Form Submit result

Passed global helper form submit page:

- `web-builder-form-save-v7-6-7-test.html`

Old route promoted by redirect:

- `web-builder-form-save-v7-6-5-test.html`

Now forwards to:

- `web-builder-form-save-v7-6-7-test.html`

Commit:

- `141b0e335769f574cfa578b0f3f2ccd6e15bd46e`

Trevor test result:

- Page loads: PASS
- Global helper status shows loaded: PASS
- Form loads from `test-page`: PASS
- Fill every question: PASS
- Submit form: PASS
- Success message shows: PASS
- `sb_form_submissions.answers_json` contains full answers object: PASS
- Account/email still saves when signed in: PASS

## Genres result

Passed global helper Genres page:

- `genres-global-helpers-v7-5-4-test.html`

Promoted route:

- `genres-browse-shell-v6-44-test.html`

Now opens:

- `genres-global-helpers-v7-5-4-test.html`

Commit:

- `a510c96e1904d7fcc7e3b8a344fbaa1b10933f27`

Trevor test result:

- Page loads: PASS
- Global helper status shows loaded: PASS
- Genre list loads: PASS
- Click a genre: PASS
- Movies show: PASS
- Details opens V7.3.1: PASS
- Play opens Player 1 V7.3.3: PASS
- Play All opens Player 2 V6.78.9.4: PASS
- Queue works: PASS

## Earlier completed global helper pages from this run

Trevor provided the current passed list at the start of this continuation:

- Home: `stream-bandit/home-global-helpers-v7-4-4-test.html`
- Details: `details-global-helpers-v7-3-1-test.html`
- Player 1: `player-one-global-helpers-v7-3-3-test.html`
- Continue Watching: `continue-watching-global-helpers-v7-3-9-test.html`
- Watch History: `watch-history-global-helpers-v7-4-0-test.html`
- Watchlist: `watchlist-global-helpers-v7-3-5-test.html`
- My Favorites: `favourites-global-helpers-v7-3-6-test.html`
- Liked: `likes-global-helpers-v7-3-7-test.html`
- Accessibility: `accessibility-global-helpers-v7-4-2-test.html`
- Library: `library-global-helpers-v7-4-8-test.html`
- Global Search: `global-search-global-helpers-v7-4-9-test.html`
- About Us: `about-global-helpers-v7-4-7-test.html`

Missed pages from that list were handled in this session:

- Genres: handled and promoted
- Supabase Library: handled and promoted after V6.93.3 passed

## Supabase submission table note

Important video submission/review table:

- `public.sb_submissions`

Observed columns:

- `id`
- `submitter_id`
- `channel_name`
- `title`
- `description`
- `video_url`
- `thumbnail_url`
- `trailer_url`
- `age_rating`
- `kids_suitable`
- `genres`
- `reason`
- `status`
- `decline_reason`
- `reviewed_by`
- `reviewed_at`
- `created_at`
- `updated_at`

Rule:

- Keep this table.
- It is Submit Video / Review Queue data.
- Do not rebuild or delete it.
- Save/create full submission payloads, but admin review actions can patch review fields.

## Current safe status at bedtime

Passed and promoted:

- Genres route
- Supabase Library route
- Form Submit route
- Web Builder menu route

Passed as test page:

- Web Builder structured form editor V7.8.6

Still unchanged:

- live `index.html`
- production/live promotion
- Supabase schema
- stable fallback pages

## Next session recommended map

Start with the menu overlay and continue one group at a time.

Recommended next actions:

1. Re-open menu overlay and identify the next group after Browse/Web Builder/Supabase Library.
2. Check each route points to the latest passed page.
3. Continue global-helper pass across remaining menu groups.
4. Confirm global settings carry on every page.
5. Confirm account/avatar/header consistency on every page.
6. Confirm player routes stay current:
   - Details V7.3.1
   - Player 1 V7.3.3
   - Player 2 V6.78.9.4
7. Final registry/version pass.
8. Full smoke test.
9. Backup.
10. Promote live only with explicit approval.

## Critical lesson from Supabase Library

Do not promote a route just because the page functionally loads. It must also pass:

- global theme
- account state
- avatar carry
- menu shell
- saved settings bridge
- page-specific tools
- route correctness
- final code check

The iframe/loader attempt was not acceptable. The correct solution was a direct full page rebuild.
