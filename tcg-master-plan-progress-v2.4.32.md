# Stream Bandit TCG Master Plan Progress V2.4.32 — Repository-Owned Branding Assets

## Goal
Make the approved elemental stag branding a real game asset instead of a chat-only/generated-image dependency.

## Assets
- assets/tcg/branding/stream-bandit-tcg-logo-v1.webp — 640x480 primary logo.
- assets/tcg/branding/stream-bandit-tcg-emblem-v1.webp — 256x256 optimized fixed-client top-bar emblem.
- assets/tcg/tcg-art-manifest-v1.json — canonical asset path registry.

## Hosting contract
The game references repository-relative asset paths only. GitHub Pages and IONOS can serve the same files without GitHack-specific image hosting.

## UI binding
The shared TCG client shell now points its top-bar image directly to the repository-owned emblem. The missing legacy stag SVG path is retired from the TCG top-bar owner.

## Boundary
Branding/static assets only. No gameplay, database, Supabase runtime, RLS, matchmaking, card rules or economy changes.
