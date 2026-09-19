# Stream Bandit TCG V2.4.43 Ledger — Set One Art-Batch Ownership

## 011 — Locked batch sequence
Set One art production is split into exactly **25** deterministic batches: Creature, Essence and Tactic for each of the eight launch elements, then the single Prismatic Founder Creature batch.

## 012 — Exact source chain
The batch catalogue is derived from the frozen 193-card intake map, the 193-record printing/art ledger and Card Pass 2 structured definitions. No card identity is invented by the art layer.

## 013 — Coverage invariant
Every Set One `card_id` appears exactly once across the batch sequence. Every batch card reuses its canonical Standard `printing_id`, `artwork_id` and repository path from the printing/art ledger.

## 014 — Brief boundary
Visual briefs may use element language plus card identity, Creature stage/evolution lineage, Ability name and attack names as art-direction cues. They do not copy gameplay logic into the art layer and never become rules authority.

## 015 — Historical compatibility
The V2.4.42 `card_art_batches.first_batch` object remains intact so the accepted regression contract stays valid. V2.4.43 adds the full ordered batch catalogue without replacing that historical owner.

## 016 — Truthful completion semantics
**193/193 blueprint-ready does not mean 193/193 artwork-complete.** Real approved PNG masters remain **0/193**. A brief or reserved path can never satisfy an artwork approval checkbox.

## 017 — Variant boundary
This pass remains Standard/base only. Holo, foil, full-art, alt-art, signature and other collectible variants are future printing/art identities and cannot alter the underlying gameplay `card_id`.

## 018 — Rarity boundary
Rarity remains null/unassigned throughout this pass. Art production does not invent Basic/Rare/Extra Rare/Mythic assignments.

## 019 — Runtime boundary
The Art Resolver, Card Renderer, Battle Controller, page shells and gameplay owners are unchanged. No 193-card hard-coded browser list is introduced.

## 020 — Release boundary
V2.4.43 is PR #576 branch-source only. `main`, public Pages, live, production and Supabase remain unchanged.
