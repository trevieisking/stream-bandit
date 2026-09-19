# Stream Bandit TCG Progress V2.4.42 — Art Production Blueprint / Astral Creature Batch 1

V2.4.42 returns the master-plan loop to artwork after the accepted V2.4.41 coin foundation.

## Recovered art track

The 18 user-uploaded original PNGs are already organised without recompression:
- 1 branding/key-art master
- 8 launch starter showcases
- 2 future-concept showcases
- 7 locked UI visual references

The temporary `assets/tcg/uploads/` intake is clear except for its instructions file. Those originals are not moved again.

## Final background gate

Final clean background-only masters remain open. The current SVG realm backdrop stays a fallback only. Eight deterministic final-background slots are now reserved for default plus Play, Battle, Decks, Collection, Battle Pass, Shop and Settings.

A final background master must contain atmosphere/art only: no baked navigation, buttons, labels, card frames or page copy.

## Card-art production

The existing identity chain remains:

`card_id -> printing_id -> artwork_id`

V2.4.42 starts controlled card-art design with **SB1-ASTRAL-CREATURES-01**, the 11 Astral Creature identities. Every entry has:
- canonical card/printing/artwork identity
- deterministic repository path
- a bounded visual brief
- Standard/base finish only
- rarity deliberately unassigned until content approval

No gameplay rules are duplicated into artwork metadata.

## Source image contract

Raw art is separate from the card frame/UI and should preserve a center-safe focal subject so the same master survives Battle, Collection and Deck compact crops. The approved full-screen screenshots stay design references only.

## Supabase truth

Production `tcg_card_printings` still has 193 active printings and 0 populated art URLs/storage paths/rarity/frame/foil values. No Supabase write is made in V2.4.42.

## Release boundary

PR #576 branch only. No merge, main, live, production or Supabase deployment is part of this checkpoint.
