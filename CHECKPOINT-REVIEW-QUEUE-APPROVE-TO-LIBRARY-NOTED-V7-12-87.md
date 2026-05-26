# Stream Bandit Checkpoint — Review Queue approve-to-library bridge noted

Date: 2026-05-26

## What Trevor confirmed

The current Review Queue form is correct for its present wording: it says there is no publish button yet and it is status/delete only.

## What the Supabase check found

- `How to Train Your Dragon` exists in `sb_submissions`.
- Its status is `approved`.
- It has a thumbnail URL and video URL.
- It does not exist in `sb_movies`.

## Meaning

Supabase Library is not failing to show it. Supabase Library reads from `sb_movies`, so approved submissions will only appear in the public/front Library after a publish/copy bridge creates the `sb_movies` row.

## Do not fix during the current Supabase Library footer pass

Trevor asked not to fix this immediately. Keep it noted for a later creator/review queue pass.

## Later bridge requirement

When this task is picked up later, Review Queue approve should optionally:

1. Save `sb_submissions.status = approved`.
2. Create a matching `sb_movies` row if one does not already exist.
3. Copy title, description, thumbnail URL, video URL, trailer URL, genres, age rating and owner/submitter information where available.
4. Set `sb_movies.status = published`.
5. Verify the inserted movie by reading `sb_movies` back.
6. Prevent duplicate movies if approve is pressed twice.

## Current work continues

Continue the Browse group pass. Supabase Library should be scanned and preserved carefully because it owns create/edit/upload/save/hide tools and the `stream-bandit-images` bucket workflow.
