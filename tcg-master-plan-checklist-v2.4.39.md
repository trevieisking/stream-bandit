# Stream Bandit TCG V2.4.39 Checklist — Collectible Printing & Artwork Identity

## Authority
- [x] Existing gameplay authority remains canonical card definitions keyed by `card_id`.
- [x] Existing collectible owner remains `tcg_card_printings` keyed by `printing_id`.
- [x] Repository media authority is `artwork_id` in `assets/tcg/cards/tcg-printing-art-ledger-v1.json`.
- [x] No Supabase/database write is part of this checkpoint.
- [x] No gameplay rule, attack, ability, HP, cost or deck legality changes.

## Identity model
- [x] `card_id` — gameplay identity.
- [x] `printing_id` — collectible/pull/reward identity.
- [x] `artwork_id` — exact image identity/revision.
- [x] Corrected image revisions can change `artwork_id` while keeping the collectible `printing_id`.
- [x] Distinct Alt-Art/Holo/etc. collectible versions receive distinct edition/printing IDs.

## Set One ledger
- [x] 193/193 card identities receive deterministic Standard/base printing slots.
- [x] 193/193 artwork IDs and asset paths are unique.
- [x] Artwork truth remains 0/193 approved and 193/193 missing.
- [x] Paths are split by set → element → card → edition.
- [x] No 1,000-file browser-directory dependency.

## Rarity / finish contract
- [x] Rarity families retained: Basic / Rare / Extra Rare / Mythic.
- [x] Finish families retained: Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic.
- [x] Rarity/finish/artwork variants do not change gameplay identity.
- [x] Future series may introduce new gameplay identities/mechanics.

## Acquisition contract
- [x] Collection distinguishes exact `printing_id`.
- [x] Packs must award exact `printing_id`.
- [x] Battle Pass, Shop, rewards, promos and events must grant/reference exact `printing_id`.
- [ ] Pack-pool/economy/progression owners still require implementation evidence before live grants.
- [ ] Individual printings/rarities/source channels still require content approval.

## Human visual evidence
- [x] Repo-owned topbar TCG logo renders successfully in branch-hosted screenshots.
- [ ] Final background-only art remains outstanding; current realm backdrop is fallback only.
