# Stream Bandit — Supabase Library Clean Editor V6.93 Handoff

## Current clean checkpoint

**Current test page:** `supabase-library-clean-editor-v6-93-0-test.html`

**Status:** Passed Trevor's manual tests for the complex Supabase Library editor flow.

This page was created after the V6.92 wrapper-on-wrapper save tests became too fragile. The rule going forward is:

> No more wrapper patches for Supabase Library. Use full working standalone pages only.

## What saved the build

The old live app/Admin Supabase flow from **V4.9.1 Admin Supabase Layout Restore** was used as the reference pattern.

Useful old code pattern recovered:

```js
var movie = {
  title: title,
  description: sb491Val('sb491Desc'),
  video_url: url,
  mux_playback_url: /stream\.mux\.com/i.test(url) ? url : '',
  thumbnail_url: sb491Val('sb491Thumb'),
  trailer_url: sb491Val('sb491Trailer'),
  year: sb491Val('sb491Year'),
  rating: sb491Val('sb491Rating'),
  runtime_text: sb491Val('sb491Runtime'),
  age_rating: sb491Val('sb491Age'),
  genres: genres,
  tags: tags,
  channel_id: ch,
  owner_id: sbSession.user.id,
  featured: !!(byId('sb491Featured') && byId('sb491Featured').checked),
  source_type: sb491SourceType(url),
  status: 'published'
};

var ins = await c.from('sb_movies').insert(movie).select('*').single();
```

The useful idea was not the old page layout. The useful idea was the **clean movie object** and simple Supabase write flow.

## What changed in V6.93.0

V6.93.0 keeps the current overlay/editor UI, but stops using the broken layered patch method.

Key changes:

- Full standalone page, not wrapper-on-wrapper.
- Clean movie object builder.
- Create Video uses clean insert logic inspired by V4.9.1 Admin Quick Add.
- Edit Video uses raw Supabase REST `PATCH`.
- PATCH requests use `Prefer: return=minimal`.
- After save, page verifies by re-reading `sb_movies` fresh.
- Details, Player 1, Player 2 routes are protected and unchanged.

Protected routes:

```text
Details: details-artwork-16x9-v6-77-7-test.html
Player 1: player-watch-shell-v6-34-test.html
Player 2: player-2-progress-helper-v6-78-9-3-test.html
```

## Tests passed on V6.93.0

Manual tests passed:

- Rating save passed.
- Trailer URL save passed, with a slight delay before Details reflected it.
- Description save passed.
- Runtime save passed.
- Director save passed.
- Genres save passed.
- Tags save passed.
- Small cast save passed.
- Full/large cast save passed.
- Details page rendered saved metadata from Supabase.
- Details page rendered cast cards.
- Library cards and filters remained usable.

## Cast note

Large cast saving works. Do not block full cast saves.

Recommended future improvement:

- Save full `cast_text` to Supabase.
- On Details, display only first 72–80 cast cards by default.
- Add a note like `+ X more cast entries` if more are available.
- Optionally add a Cast Cleaner button in the Library editor to convert scraped cast text into clean `Name as Role` lines.

## Important rule going forward

Do not promote live/index yet.

Before promotion:

1. Code-scan V6.93.0.
2. Run one more route smoke test:
   - Details
   - Player 1
   - Player 2 Play All Visible
   - Create Video test row
   - Delete From Library / hidden status
3. Confirm registry/live routes separately.
4. Backup.
5. Trevor explicitly approves live promotion.

## Why V6.92 failed

The V6.92 chain used wrappers that loaded older pages and replaced script strings. That caused inconsistent behaviour and made debugging difficult.

The lesson:

> For complex pages like Supabase Library, use clean full pages only. Do not keep patching wrapper pages.
