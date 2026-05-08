# Stream Bandit — Supabase Migration Admin Import Tool

Checkpoint name:

`Supabase Migration - Admin Import Tool Review`

## What this page is for

Supabase Migration is an admin-only recovery/import tool.

It was built during the move from browser/local Stream Bandit data into Supabase.

Its purpose is to import an old Stream Bandit backup JSON file into Supabase safely.

## Main functions

1. Load backup JSON
   - Upload a Stream Bandit backup JSON file.
   - Or paste backup JSON into the text box.

2. Preview before import
   - Reads the backup file first.
   - Lets the admin check what would be imported before pressing import.

3. Import to Supabase
   - Imports the previewed JSON data into Supabase.
   - Uses duplicate protection so existing movie titles/channels are skipped instead of duplicated.
   - Does not delete browser/local data.

4. Optional progress/user data import
   - Can import admin watch progress, favourites, likes and watchlist where movie matches are found.

5. Optional data-image thumbnail/logo import
   - Can include embedded data-image thumbnails/logos in Supabase rows.
   - Usually leave off for cleaner storage.

## User-facing status

This page is not for normal users.

It should stay admin-only because it can import data into Supabase.

## Current recommendation

Do not remove it.

Do not make it public/user-facing.

It can be lightly tidied with tabs later if desired, but it is lower priority than public browse/watch pages.

Possible tabs if tidied later:

- Overview
- Load Backup
- Preview
- Import
- Safety

## Protected areas

Do not change live import logic lightly.

Protected:

- JSON parsing
- preview logic
- duplicate protection
- Supabase inserts/imports
- progress/watchlist/favourites/likes import
- backup handling
- admin/session checks

## Current decision

Leave Supabase Migration as an admin-only tool for now unless the page becomes confusing or visually too busy.

If tidied, use tabs only to separate existing sections, not to alter the import behaviour.
