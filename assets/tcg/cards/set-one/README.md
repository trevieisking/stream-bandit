# Stream Bandit TCG — Set One card artwork intake

This folder is the canonical intake target for individual Set One card artwork.

## Frozen card set

- 193 total Set One identities
- 89 Creature cards
- 72 Tactic cards
- 32 Essence cards
- 24 cards each for Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt
- 1 Prismatic founder identity

The exact per-card filename, destination and suggested commit message live in:

`tcg-card-art-intake-v1.json`

## Upload naming rule

Use the canonical card ID exactly:

`<card_id>.png`

Example:

`gale-skyweaver.png`

goes to:

`assets/tcg/cards/set-one/gale/gale-skyweaver.png`

Suggested commit message:

`TCG art: add gale-skyweaver`

## Important

Do not hard-code 193 image filenames into game pages.

The future Card Art owner/renderer should resolve art generically by canonical `card_id` through the manifest. Missing art must remain detectable rather than silently mapped to the wrong card.

Artwork is presentation data. Structured card definitions remain gameplay/rules authority.
