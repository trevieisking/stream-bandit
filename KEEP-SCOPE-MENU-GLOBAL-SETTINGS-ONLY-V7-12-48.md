# Stream Bandit Keep Scope — Menu Overlay + Global Settings Children Only V7.12.48

Date: 2026-05-25

Purpose: Trevor clarified the cleanup target in plain English.

## Trevor's corrected keep rule

Keep:

1. The visible overlay menu pages.
2. The global/settings pages.
3. The buttons, tabs, child pages, helper pages and route links that those pages lead to.

Everything else:

- Not needed right now.
- Must go to REVIEW / future archive list.
- Must not be deleted blindly.

## Why this matters

The app cleanup became confusing because there are three different ideas of 'active':

1. Menu active — visible in the overlay menu.
2. Runtime active — reachable by scripts/helper routes.
3. Historical active — mentioned in old docs/checkpoints/test pages.

For the current cleanup, the human product truth is:

> Keep the menu overlay app and global/settings control routes. Keep the pages they actually open. Everything else is not needed right now.

## Protected visible menu groups

### Watch

- Home
- Details
- Player 1
- Continue Watching
- Watch History
- Watchlist
- Favourites
- Liked
- Accessibility

### Browse

- Library
- Supabase Library
- Genres
- Global Search
- About

### Group Play

- Playlists
- Channels
- My Channel
- Collections
- Player 2

### Creator

- Submit Video
- Rules
- Review Queue

### Settings

- Settings
- Settings Studio
- Profile Settings
- Web Builder
- Clean Machine Menu
- Route Guard Proof
- Route Pointer Machine
- Final Shell Navigation

### Admin

- Admin Centre
- Live Readiness
- All Pages Version Registry
- Test Checklist
- Tools Page
- Health Check
- Mux Manager
- Storage Prep
- Backup / Safety

### User Management

- User Dashboard Concept
- Fair Pricing Matrix
- Permissions Matrix

### Policy

- Policy & FAQ Centre
- Policy Admin Editor
- Published Policy Proof

### Owner

- One Machine
- Platform Control Centre
- Brand / App Icons
- Brand Image Helper
- Favicon / App Icon Builder

## Protected child/dependency rule

For every page above, keep:

- direct links from buttons
- tab destinations
- settings studio/control links
- route guard and route pointer destinations
- policy reader pages opened by policy centre
- details/player routes opened by Home/Library/Search/Genres
- profile/channel/collection/player routes opened by Group Play
- admin child tools opened by Admin Centre/Settings Hub
- required helper scripts and shared global JS/CSS/assets

## Cleanup classification from now

### KEEP

- Menu overlay pages.
- Global/settings/control pages.
- Child routes directly opened from those pages.
- Shared helper files needed by those pages.
- Current Supabase/Mux/storage/brand/auth helpers needed by those pages.

### REVIEW / NOT NEEDED RIGHT NOW

- old standalone experiments
- duplicate old upgrade pages
- museum/dev pages not reached from the protected scope
- old Plan 3 / V5 / V6 pages not used by the protected scope
- scanner report files once a newer scanner replaces them
- docs/checkpoints that are only historical notes

### DO NOT DELETE YET

Even if something is REVIEW / NOT NEEDED RIGHT NOW, do not delete it until:

1. The focused keep scanner confirms it is outside the protected scope.
2. The file is listed in a small archive batch.
3. A backup/restore point exists.
4. Trevor approves that archive batch or asks for it.

## Next machine needed

Build or use a focused scanner that starts from the protected menu/global/settings roots only and reports:

- KEEP: visible roots
- KEEP: child pages opened from roots
- KEEP: helper scripts/assets used by those pages
- REVIEW: outside the focused app scope
- MISSING: broken links inside the focused scope

This is different from the broad runtime scanner because the broad runtime scanner may keep too many old/historical routes.
