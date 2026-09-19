# Stream Bandit TCG Master Plan Progress V2.4.38 — Canonical Art Foundation

## Accepted product checkpoint
PR #576 product head `2f0c884dc66e5a2dfc4c59f08b7217c52027f763` is accepted for the art-foundation slice.

Exact-head evidence:
- TCG Card Pass 2 Validation #773 — SUCCESS
- Code Labs Migration Replay #943 — SUCCESS
- Code Labs V50 Functional Smoke #969 — SUCCESS
- unresolved review threads — 0
- legacy combined statuses — 0

## What changed
The TCG now has one repository-owned art path authority and one presentation-only Art Resolver. The resolver applies clean runtime background masters, repo-owned branding and future per-card art without becoming a gameplay owner.

The seven approved full-screen client compositions remain immutable design references. They are not used as flattened CSS backgrounds because doing so would duplicate controls/text behind the real interactive DOM.

## Card-art pipeline
Set One is frozen at 193 canonical card IDs:
- 89 Creature
- 72 Tactic
- 32 Essence

Each identity has an exact future image path beneath `assets/tcg/cards/set-one/<element>/`. No individual card art is falsely marked complete: current count remains 0/193.

## Hosting/browser contract
All paths are repository-relative for GitHub Pages and IONOS. Art folders are deliberately split so normal GitHub browser navigation stays below the 1,000-entry directory-display truncation.

## Safety boundary
No gameplay rule, database schema, RLS policy, Supabase deployment, matchmaking owner, economy owner or card definition was changed by V2.4.38.

## Next target
Human visual verification of the clean runtime backdrop and approved repo-owned TCG stag/logo. After that, begin controlled Set One artwork batches while the generic resolver handles display automatically.
