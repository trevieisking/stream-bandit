# Stream Bandit TCG V2.4.39 Ledger — Printing & Artwork Authority

## 001 — Three identities, one chain
Every collectible card presentation follows `card_id → printing_id → artwork_id`.

## 002 — Gameplay identity
`card_id` owns rules. Different artwork, rarity or foil treatment does not create a new rules object.

## 003 — Collectible identity
`printing_id` is the exact object a player can own, pull from a pack, win from a Battle Pass/reward, receive from a promo/event or purchase through an approved shop/economy owner.

## 004 — Artwork identity
`artwork_id` uniquely identifies the exact media revision used by a printing. This is the repository lookup key for artwork.

## 005 — Existing database owner
The existing `tcg_card_printings` model remains the canonical printing owner. This checkpoint introduces no replacement table and no database write.

## 006 — Rarity
Basic / Rare / Extra Rare / Mythic remain acquisition/presentation tiers. They do not alter gameplay identity.

## 007 — Finishes and alternate art
Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic remain cosmetic collectible treatments. They may use different artwork/frame/foil presentation while sharing the same `card_id`.

## 008 — Future series
A later series may deliberately introduce new card IDs, mechanics, attacks, abilities, creature types or other rules. That is a content/rules expansion, not a cosmetic printing variant.

## 009 — Exact repository path contract
`assets/tcg/cards/set-one/<element>/<card_id>/<edition>/<artwork_id>.png`

This keeps variant growth scoped beneath each card and avoids giant browser directories.

## 010 — Base Set One slots
193 deterministic Standard/base printing and artwork IDs are reserved in the printing-art ledger. They are placeholders for identity/path only; no artwork is falsely marked complete.

## 011 — Collection / pack / reward rule
Collection, pack opening, Battle Pass, Shop, promo and event systems must reference exact `printing_id` values. Battle gameplay resolves the shared underlying `card_id`.

## 012 — Human visual evidence
Topbar TCG logo is human-accepted from the 2026-09-19 branch screenshots. Current runtime realm backdrop remains temporary and is not accepted as final background artwork.

## 013 — Open art gate
Set One remains 0/193 approved base artworks. Variant printings are added only when real artwork and acquisition/source metadata are approved.

## 014 — Creature taxonomy boundary
Creature type is structured gameplay/content metadata and will receive its own taxonomy owner. Rarity, finish and artwork do not redefine creature type.
