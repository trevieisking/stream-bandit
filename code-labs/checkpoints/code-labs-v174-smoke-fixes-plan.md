# Code Labs V174 smoke fixes plan

## Trigger

Trevor visually tested Code Labs after V173 menu stability and reported no visible bugs found.

## Goal

Turn the smoke-test recommendations into a small branch/PR that improves consistency without changing Stream Bandit app pages or Supabase schema.

## Planned fixes

1. Standardize Code Labs page helper cache keys so live pages consistently request the V173 stable menu helper and V172.4 page polish helper.
2. Add the shared stable nav helper to thin/static Code Labs pages where the page already has a `.nav` sidebar, so cl-nav.js remains the single menu owner.
3. Add Buddy Page Bridge support to thin/static utility pages where it is safe, so Buddy can read page context and build GitHub connector request packets.
4. Add static SEO metadata to Help.
5. Preserve read-only proof behavior and all existing local/Supabase/GitHub handoff logic.

## Explicit non-goals

- No Stream Bandit app page changes.
- No live promotion merge without Trevor pass.
- No Supabase schema, RLS, auth, storage, bucket, or secret changes.
- No direct browser GitHub writes.

## Test checklist

- All Code Labs pages load with HTTP 200.
- Sidebar menu stays stable after page load.
- Patch Lab 1-6 order remains correct.
- Buddy Page Bridge remains visible where expected.
- GitHub connector request lane remains visible where expected.
- Saved Files still loads its manager helper.
- Read-Only Proof still preserves its V90 buttons and read-only behavior.
