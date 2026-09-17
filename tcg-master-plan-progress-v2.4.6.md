# Stream Bandit TCG — Canonical Master Plan V2.4.6

**Plan date:** 2026-09-17  
**Status:** verified-live Directory backend + bounded Players/Profile/Privacy UI wiring  
**Inherits:** `tcg-master-plan-progress-v2.4.5.md` and all earlier authority  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.6.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.6.md`  
**Accepted V2.4.5 source head:** PR #576 @ `b8479c2998e4ed66525dd6e9b17fc07bc49ab232`  
**Release decision:** 🔒 HOLD `main`, GitHub Pages/public and the full live TCG release until inherited V2.4/V2.4.1 end-to-end gates pass.

## 0. V2.4.5 production acceptance

The exact V2.4.5 head passed the required immutable gate:

- TCG Card Pass 2 Validation #635 — SUCCESS;
- Code Labs Migration Replay #805 — SUCCESS;
- Functional Smoke #831 — SUCCESS;
- material review threads — 0.

The reviewed `tcg_player_directory_v0_1` migration was then promoted to production only. Supabase recorded migration `20260917213104_tcg_player_directory_v0_1`.

Post-deploy proof confirmed:

- `public.tcg_player_directory_preferences` exists with RLS and authenticated own-row SELECT/INSERT/UPDATE policies;
- `tcg_private.player_directory_projection` exists with RLS and authenticated read-only access;
- both public Directory RPCs are `SECURITY INVOKER`, authenticated executable, anon/service-role non-executable;
- all three private privileged routines are `SECURITY DEFINER` but are non-executable by browser/service roles;
- all four projection refresh triggers exist and are enabled;
- the fresh security-advisor baseline gained zero new Directory exposed-`SECURITY DEFINER` warnings;
- the only new performance-advisor item is the freshly-created Directory opt-in index being unused before real traffic.

This satisfies the V2.4.5 rule that UI wiring must wait for verified production deployment.

## 1. V2-DIRECTORY-UI-01 — one reusable browser Directory controller

V2.4.6 adds `stream-bandit-tcg-player-directory-v2-4-6.js` as a thin presentation/data adapter. It is not a gameplay owner and does not create owner family #41.

The controller may use only:

- `public.tcg_search_public_players(...)` for bounded discovery;
- `public.tcg_get_public_player(uuid)` for one approved public profile;
- the signed-in user's own `public.tcg_player_directory_preferences` row for opt-in settings.

It must not browse `tcg_player_profiles`, `sb_profiles`, `sb_profile_social_settings`, `sb_user_friends`, `sb_user_blocks` or any private projection directly. It must not contain a service-role path.

## 2. Players surface

`tcg-players.html` becomes the canonical TCG discovery UI:

- authenticated search only;
- search is bounded to 25 rows per browser request while the server remains capped at 50;
- returned public strings are rendered through DOM text nodes/textContent;
- each result links to the canonical public TCG profile route by player UUID;
- no friend/block/challenge write is performed from search.

## 3. Public TCG Player Profile

`tcg-player-profile.html` reads one UUID from the route and resolves it only through `tcg_get_public_player`.

If the player is no longer eligible/discoverable, the route fails closed with a not-discoverable state. Friend and future Challenge/Invite controls remain disabled until scoped TCG social owners exist.

## 4. Account Privacy

`tcg-account-privacy.html` now owns the user-facing controls for the already-live Directory preference row:

- Discoverable defaults false at the database authority;
- Show arcade/progression statistics is independently controllable;
- the signed-in user can load and upsert only their own preference row through existing RLS;
- turning discoverability off removes the projection through the database trigger owner;
- shared Stream Bandit profile privacy remains an additional mandatory server-side gate.

TCG-specific blocking remains gated. General Stream Bandit block/friend state is not borrowed as TCG authority.

## 5. Validation rule

The V2.4.6 UI slice is source-only on the existing non-main PR branch until its exact head passes:

1. Card Pass 2 Directory UI regression contract;
2. TCG Card Pass 2 Validation;
3. zero-to-current Migration Replay;
4. Functional Smoke;
5. zero unresolved material review threads.

No new Supabase migration or Edge Function deployment is required for V2.4.6. Production Directory backend remains the accepted V2.4.5 owner.

## 6. Release boundary and next gameplay priority

V2.4.6 does not authorize merging PR #576 or publishing the whole TCG. The inherited end-to-end playable gate remains authoritative:

`Sign in → Game Home → deck → Ranked/matchmaking → opponent → corrected board → cards control play/place/evolve/attack/ability/withdraw → End Turn → full match resolution → Result → back to game pages.`

After V2.4.6 is accepted at exact head, the next implementation priority returns to the shortest missing link in that gameplay path. Existing engines, 193-card data, eight launch starters, the 40-owner architecture and card-owned battlefield controls remain protected.
