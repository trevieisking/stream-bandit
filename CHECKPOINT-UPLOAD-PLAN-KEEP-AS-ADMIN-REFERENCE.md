# Stream Bandit — Upload Plan Keep As Admin Reference

Checkpoint name:

`Upload Plan - Keep As Admin Reference`

## Decision

Do not tidy or rebuild the Upload Plan page for now.

## Reason

Upload Plan is an admin reference page, not a normal public user page.

It explains the storage route for Stream Bandit:

- Mux for real video streaming
- Supabase Storage for images such as posters, banners, avatars and thumbnails
- Browser/local upload only for private testing

## Current page condition

The page is clear enough as a reference guide:

- the storage setup is explained
- the recommended order is shown
- future movie row fields are visible
- image upload route is explained
- video route is explained

## Recommendation

Keep as-is for now.

It is lower priority than public-facing browse and watch pages.

If tidied later, use light tabs only:

- Overview
- Storage Plan
- Recommended Order
- Future Fields
- Safety

## Protected areas

Do not change any storage, upload, Mux, Supabase, movie row, player, Sound Booster or database logic from this page tidy pass.

## Next recommended page

Continue page tidy checks on safer pages.

Recommended next target:

`Local Storage` or `Storage Prep`, then decide whether they are admin-only and can be left alone.
