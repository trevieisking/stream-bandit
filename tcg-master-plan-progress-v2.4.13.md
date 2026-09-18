# Stream Bandit TCG — Master Plan Progress V2.4.13

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `ded077d7d835f37b88046e6bba7065510bebaef6`  
**Master-plan target:** INTERACT-03 Essence server legality seam  
**Gameplay-owner baseline:** 40 families retained  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Build the server-owned legal-target seam needed for physical Essence-card interaction before adding browser highlighting.

The existing Essence Attachment family remains the owner. No new gameplay owner is introduced.

## 2. Existing authority reused

The accepted Attachment engine already owns exact source removal, target anchor identity, attachment metadata, Surge/lifecycle registration, canonical attachment receipt and listener event creation. The external route starts the generic event listener continuation.

V2.4.13 adds to that same owner:
- read-only `runtimeV02ListManualEssenceAttachmentTargets`;
- final `runtimeV02ValidateManualEssenceAttachmentDeclaration`;
- additive `attach_essence_targets(card_uid)` transport.

## 3. Manual legality contract

For structured v0.2 matches:
- current manual Essence use must not already be spent this turn;
- selected source must be an Essence card in the controller hand;
- legal targets are occupied friendly Vanguard/Reserve Creature positions;
- final declaration preserves current public error precedence;
- the canonical Attachment transaction revalidates exact source/target identity before mutation.

Legacy/unmarked matches retain the existing fallback branch and card-specific compatibility behavior.

## 4. Browser boundary

No browser Essence legality is added in this slice. V2.4.14 will consume the server projection to highlight legal Creatures and submit the existing `attach_essence` command.

## 5. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required before deciding an in-place update of the existing `tcg-match-actions` Edge Function.
