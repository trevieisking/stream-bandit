# Stream Bandit TCG Progress V2.4.39 — Collectible Printing & Artwork Identity

## Why this checkpoint exists
The approved collection direction requires many collectible forms of the same gameplay card: rarity treatments, Shine/Holo finishes, Full-Art, Alt-Art, prestige printings, Battle Pass/shop/promotional versions and future art variants.

This must increase collection depth without duplicating gameplay logic.

## Locked identity chain
`card_id → printing_id → artwork_id`

- `card_id`: gameplay rules/stats/attacks/abilities.
- `printing_id`: collectible object owned/pulled/rewarded.
- `artwork_id`: exact repository media asset/revision.

A printing variant never silently changes gameplay. New mechanics belong to a genuinely new card identity/series.

## Existing owner reused
The repository already defines `public.tcg_card_printings`; V2.4.39 documents and extends that owner rather than creating a parallel printing system.

## Art ledger
`assets/tcg/cards/tcg-printing-art-ledger-v1.json` seeds 193 deterministic Standard/base printing slots and exact future paths. Current truthful artwork state remains 0/193 approved.

## Human visual review
The 2026-09-19 branch screenshots confirm the repo-owned TCG logo/topbar branding renders. The dark realm background currently visible is not promoted as final background art; final background-only assets remain open.

## Safety
No Supabase write/deployment is performed. No gameplay/runtime/economy/progression mutation is included.

## Next implementation sequence
1. verify V2.4.39 repository controls in CI;
2. keep final background-art gate open;
3. begin card artwork batches using ledger-assigned IDs/paths;
4. later bind Collection/Packs/Battle Pass/Shop to printing IDs through their proven owners.
