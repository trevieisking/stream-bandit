# Stream Bandit Protected Menu Overlay Addendum — Browse + Group Play V7.12.47

Date: 2026-05-25

Purpose: Trevor supplied the missing menu overlay screenshot for Browse and Group Play. This addendum protects those visible menu groups as KEEP.

Hard cleanup rule:

- These pages are KEEP.
- Child pages, helper scripts, route bridges and runtime dependencies opened from these pages are protected until separately reviewed.
- Do not delete them as review/archive candidates.
- This addendum corrects the visible menu total from the earlier manifest.

## Browse group — 5

Visible menu items:

1. Library
2. Supabase Library
3. Genres
4. Global Search
5. About

Keep intention:

- Core browsing/discovery pages.
- Supabase-first library work must stay protected.
- Search, genre routes, details/player child routes and helper pages opened from Browse are protected.

## Group Play group — 5

Visible menu items:

1. Playlists
2. Channels
3. My Channel
4. Collections
5. Player 2

Keep intention:

- Group play and creator/channel flow.
- Playlist, channel, collection and Player 2 routes are protected.
- Child pages reached from channel/profile/collection/player routes are protected until separately reviewed.

## Corrected visible menu count from supplied overlay screenshots

Previously recorded visible groups:

- Watch: 9
- Creator: 3
- Settings: 8
- Admin: 9
- User Management: 3
- Policy: 3
- Owner: 5

Added by this addendum:

- Browse: 5
- Group Play: 5

Corrected visible total:

- 50 visible menu items.

Important note:

This is still not the full runtime keep count. The full keep count remains higher because visible menu pages open other pages and depend on helper files, shared shell files, global settings bridges, player/detail routes, policy readers, admin tools and assets.

Current rule for cleanup remains:

1. Protect all 50 visible menu overlay items.
2. Protect runtime keep files/pages shown by the Runtime Keep Board.
3. Fix missing strong refs first.
4. Do not delete review candidates until a separate reviewed archive batch exists.
