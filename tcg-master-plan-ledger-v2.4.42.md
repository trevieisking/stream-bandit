# Stream Bandit TCG V2.4.42 Ledger — Artwork Production Ownership

## 001 — Uploaded source archive
The prior 18 uploaded original PNGs are already classified: 1 brand/key-art, 8 launch showcases, 2 future showcases and 7 UI references. Do not repeatedly re-intake or recompress them.

## 002 — Background production owner
`assets/tcg/art-direction/tcg-art-production-ledger-v1.json` reserves exact final background paths. Until real background-only masters are approved, `assets/tcg-realm-client-backdrop-v2-4-30.svg` remains the shared fallback.

## 003 — Screenshot boundary
Full-screen Play/Battle/Decks/Collection/Battle Pass/Shop/Settings compositions remain visual references. They are not runtime background masters and must not put duplicate fake controls beneath real DOM controls.

## 004 — Card-art identity
Artwork continues to resolve through `card_id -> printing_id -> artwork_id`. Gameplay is still owned by `card_id`; collectible ownership by `printing_id`; exact media by `artwork_id`.

## 005 — First production batch
`SB1-ASTRAL-CREATURES-01` contains the 11 Astral Creature identities only. It is a design/production batch, not a gameplay batch.

## 006 — Evolution continuity
Stardot -> Orbitail -> Cosmarch and Moonbit -> Comettail -> Nebulynx must read visually as continuous lineages. Standalone creatures retain distinct silhouettes.

## 007 — Raw-art contract
Base artwork is clean art only: no baked card frame, HP, attacks, abilities, rarity label, buttons or client chrome. Presentation owners add those layers.

## 008 — Variant boundary
Standard/base artwork comes first. Shine/Holo/Full-Art/Alt-Art/Signature variants reuse the same `card_id` and receive distinct printing/art identities only when real variant content is approved.

## 009 — Rarity boundary
Basic/Rare/Extra Rare/Mythic remain valid acquisition tiers, but V2.4.42 does not assign them to the 193 printings. Production currently has no populated rarity values.

## 010 — Release boundary
PR #576 branch source only; main/live/production/Supabase remain unchanged.
