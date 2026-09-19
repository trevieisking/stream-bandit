# Stream Bandit TCG V2.4.30 Ledger

## V2.4.30-001 — Visual authority unchanged
The seven approved V2.4.28 reference hashes remain the art-direction source of truth. V2.4.30 only implements toward them.

## V2.4.30-002 — TCG-owned visual layer
Added one reusable floating-realm SVG backdrop and one reusable generic card-back/art-pending SVG. Shared page and battle CSS consume those assets. No page-specific duplicate visual engine was added.

## V2.4.30-003 — Website visual separation
TCG HTML routes remove the global Stream Bandit theme projector. Existing shared config/auth scripts remain where required as capability dependencies only.

## V2.4.30-004 — Card-art truth
Supabase current state showed 0/193 active card definitions with art_url and 0/193 active printings with art_url/art_storage_path. The generic card-back is therefore explicitly a fallback, not a claim of approved per-card artwork.

## V2.4.30-005 — Deck-count truth
Play deck rows now sum the signed-in owner's RLS-visible tcg_deck_cards.quantity rows. The display no longer hard-codes 60. This read-only count does not replace tcg_server_validate_deck or matchmaking validation.

## V2.4.30-006 — Work-order effect
Shell look/feel receives a substantive implementation slice, but ORDER-06 is not complete because animation/audio hooks and human visual acceptance remain open.

## Release boundary
PR #576 draft only. No main/public/live/Supabase runtime promotion in this checkpoint.


## V2.4.30-007 — Exact-head automated acceptance
Product candidate `ee7364396e3f8c7d16685c4d5cbd6772184c042c` passed TCG Validation #753, Migration Replay #923 and Functional Smoke #949. PR #576 had zero unresolved review threads and no legacy combined statuses at review time. Human visual acceptance remains the next gate.
