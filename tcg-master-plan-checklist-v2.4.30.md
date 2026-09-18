# Stream Bandit TCG V2.4.30 Checklist — Approved-Reference Visual Convergence

## Locked authority
- [x] Seven V2.4.28 approved Play/Battle/Decks/Collection/Battle Pass/Shop/Settings references remain unchanged and authoritative.
- [x] V2.4.30 is an implementation revision, not a replacement art-direction revision.

## Client separation
- [x] Generic Stream Bandit header/footer/search/account chrome remains absent.
- [x] Global Stream Bandit theme projector removed from TCG routes.
- [x] Shared Stream Bandit config/auth capabilities remain available without owning TCG pixels.
- [x] Fixed 100dvh viewport preserved.
- [x] Only bounded internal feeds scroll.

## Visual convergence
- [x] Reusable original floating-realm backdrop added.
- [x] Reusable Stream Bandit TCG generic card-back/art-pending asset added.
- [x] Cyan/gold ornamental frames, glow, title treatment, navigation and panel language aligned across client pages.
- [x] Play layout remains deck list / match modes / status stack.
- [x] Battle remains one-screen tabletop while adopting the same visual language.
- [x] Decks / Collection / Battle Pass / Shop / Settings inherit the same client surface.
- [x] Secondary pages inherit the same fixed client shell/feed contract.

## Data truth
- [x] Supabase current-state check: 0/193 active card definitions expose approved art_url.
- [x] Supabase current-state check: 0/193 active printings expose art_url/art_storage_path.
- [x] Missing card art uses the explicit generic card-back/art-pending treatment.
- [x] Play deck counts read tcg_deck_cards quantity through existing RLS instead of hard-coding 60.
- [x] Match legality remains with the canonical server matchmaking/deck validation path.

## Acceptance
- [x] Exact-head TCG Validation passes — #753 SUCCESS.
- [x] Exact-head Migration Replay passes — #923 SUCCESS.
- [x] Exact-head Functional Smoke passes — #949 SUCCESS.
- [x] Unresolved review threads = 0.
- [ ] Human visual acceptance at target desktop viewport.
- [ ] Human signed-in Play deck feed renders real owned deck counts.
- [ ] ORDER-06 remains open for animation/audio hooks after visual acceptance.
