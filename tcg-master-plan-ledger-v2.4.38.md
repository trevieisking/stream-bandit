# Stream Bandit TCG V2.4.38 Ledger

## 001 — Source-of-truth art organization
The repository now owns the uploaded TCG assets beneath `assets/tcg/` with stable semantic paths for branding, showcases, UI references and future card art.

## 002 — Full-screen reference boundary
The approved Play/Battle/Decks/Collection/Battle Pass/Shop/Settings images remain visual-design authority only. They must not be shipped as flattened clickable screens or reused as literal runtime backgrounds behind live controls.

## 003 — Clean runtime background owner
`tcg-art-manifest.json` now carries `runtime_backgrounds`. Current runtime pages use the existing clean TCG realm backdrop until separate approved background-only masters are available.

## 004 — Branding owner
The user-approved prismatic stag key art is repository-owned and available to the shared TCG presentation layer.

## 005 — Set One intake
`assets/tcg/cards/set-one/tcg-card-art-intake-v1.json` maps all 193 canonical card IDs to deterministic future PNG paths and suggested commit messages.

## 006 — Maintainability rule
Do not hard-code per-card art branches in page/controller code. Card art is projected by canonical card ID through the shared Art Resolver. Future sets receive their own set folders and remain split by element.

## 007 — Missing-art state
Current individual Set One art completion remains 0/193. Missing files visibly fall back to `Artwork pending` and never block match boot.

## 008 — Gameplay isolation
V2.4.37 restored the accepted Card Renderer and Battle Controller blobs byte-for-byte after CI proved that art readiness must not become a gameplay-boot prerequisite. V2.4.38 changes only art manifest/resolver/test presentation ownership.

## 009 — Exact product-head gate
Product head `2f0c884dc66e5a2dfc4c59f08b7217c52027f763` passed Validation #773, Migration #943 and Smoke #969 with zero review threads and zero legacy statuses.

## 010 — Release boundary
PR #576 remains draft/open/unmerged. Main/public/live/production remain HOLD. Next gate is human background/logo rendering acceptance.
