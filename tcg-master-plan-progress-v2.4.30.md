# Stream Bandit TCG Master Plan Progress V2.4.30 — Approved-Reference Visual Convergence

## Goal
Move the functioning V2.4.29 client materially closer to the seven user-approved 1672×941 concept screens without changing those references, inventing card artwork, or moving gameplay authority into the browser.

## Implemented visual system
- original reusable `assets/tcg-realm-client-backdrop-v2-4-30.svg`: floating islands, waterfalls, moonlit towers and magical energy;
- original reusable `assets/tcg-card-back-v2-4-30.svg`: explicit generic Stream Bandit TCG card-back/art-pending treatment;
- one shared TCG client stylesheet owns realm backdrop, top navigation, page titles, cyan/gold ornamental frames, buttons, feeds and card placeholders;
- Battle adopts the same backdrop/frame language without changing its controller/runtime;
- global Stream Bandit theme projector is removed from TCG HTML routes so the TCG owns its visual output.

## Data/art truth
Supabase readback at this checkpoint:
- active card definitions: 193; non-empty `art_url`: 0;
- active card printings: 193; non-empty `art_url` or `art_storage_path`: 0.

Therefore V2.4.30 does not manufacture identity-specific artwork. Generic card-back treatment is the truthful fallback until an authoritative art source is populated.

## Play deck visual truth
The prior presentation printed `60` on every deck row. V2.4.30 replaces that with a read-only RLS-protected `tcg_deck_cards(deck_id,quantity)` projection and sums quantity for display only. This does not determine legality; server matchmaking/deck validation remains final authority.

## Protected boundaries
No migration, schema, RLS policy, Edge Function, gameplay runtime, card definition, economy, matchmaking or master rules change.
V2.4.28 visual references remain immutable.

## Release boundary
PR #576 stays draft/unmerged. main, Pages/public and full-live remain HOLD until exact-head CI plus human visual/gameplay acceptance.
ORDER-06 remains open because animation/audio hooks are still outstanding even after this look/feel slice.


## Exact-head automated acceptance
Accepted product candidate: `ee7364396e3f8c7d16685c4d5cbd6772184c042c`
- TCG Card Pass 2 Validation #753 — SUCCESS
- Code Labs Migration Replay #923 — SUCCESS
- Code Labs V50 Functional Smoke #949 — SUCCESS
- unresolved review threads — 0
- legacy combined statuses — none

Human visual acceptance and signed-in owned-deck rendering remain deliberately open. No public/live promotion follows from automated acceptance alone.
