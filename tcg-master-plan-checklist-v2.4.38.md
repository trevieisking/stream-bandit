# Stream Bandit TCG V2.4.38 Checklist — Canonical Art Foundation

## Repository art ownership
- [x] 18 uploaded original PNG assets classified into branding, launch showcases, future showcases and locked UI references.
- [x] Original uploaded image blobs preserved; organization used path/name moves rather than redraw/recompression.
- [x] Stable `assets/tcg/tcg-art-manifest.json` authority uses repository-relative paths.
- [x] Full-screen UI compositions are visual reference authority only, never flattened interactive runtime screens.
- [x] Runtime backgrounds resolve only from clean background masters.

## Set One card-art scalability
- [x] Canonical Set One intake contains 193/193 unique card IDs.
- [x] Family counts remain 89 Creature / 72 Tactic / 32 Essence.
- [x] Each card has an exact canonical PNG path and suggested commit message.
- [x] Card folders are split by set and element for GitHub-browser maintainability.
- [x] Generic Art Resolver resolves by canonical card ID without 193 hard-coded branches.
- [x] Missing art safely remains `Artwork pending`.
- [ ] Individual Set One art complete: 0/193 → target 193/193.

## Gameplay isolation
- [x] Art Resolver is presentation-only.
- [x] Accepted Card Renderer gameplay blob unchanged.
- [x] Accepted Battle Controller gameplay blob unchanged.
- [x] Artwork loading never blocks match boot.

## Exact product-head evidence
- [x] Product head: `2f0c884dc66e5a2dfc4c59f08b7217c52027f763`.
- [x] TCG Card Pass 2 Validation #773 — SUCCESS.
- [x] Code Labs Migration Replay #943 — SUCCESS.
- [x] Code Labs V50 Functional Smoke #969 — SUCCESS.
- [x] Review threads — 0.
- [x] Legacy combined statuses — 0.
- [ ] Human branch-hosted background/logo visual check.
- [ ] Main/live/public promotion remains HOLD.
