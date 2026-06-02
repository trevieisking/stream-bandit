# Stream Bandit Checkpoint — Settings Hub Header Counters Pass V7.12.194

Date: 2026-06-02

## Status

PASS.

## Page

- `settings-platform-control-hub-v7-12-85-test.html`

## Problem

After the Settings Hub clean-route refit, the header Watchlist / Favourites / Likes counters did not count correctly on the Settings Hub page.

## Root cause

The page still loaded the header shell and menu count helper, but the clean refit had removed the Supabase SDK / core saves path needed by the save-count helpers.

## Fix

V7.12.194 restored the count foundation on Settings Hub only:

- Added Supabase SDK.
- Added `stream-bandit-core-saves-v6-75.js`.
- Kept `stream-bandit-menu-saves-count-v6-72-1.js`.
- Added a small count refresh after page load and tab changes.

## Confirmed user test

- Watchlist counter: PASS
- Favourites counter: PASS
- Likes counter: PASS

## Safety notes

No settings writes were added.
No Theme Studio internals were changed.
No Profile Settings internals were changed.
No Web Builder internals were changed.
No shell rewrite was required.

This was a narrow Settings Hub foundation fix only.
