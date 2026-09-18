# Stream Bandit TCG — Master Plan V2.4.7 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.7.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.7.md`  
**Accepted parent:** V2.4.6 / PR #576 @ `bd2f5b30109f0927a23f4c8e380548d447cf7678`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release decision:** 🔒 HOLD PR merge, `main`, public/live and production release.

## V2.4.7-001 — parent acceptance frozen

**State:** ✅ ACCEPTED

V2.4.6 exact head passed TCG Validation #645, Migration Replay #815 attempt 2 and Functional Smoke #841 with zero review threads. It is the immutable source parent for V2.4.7. No V2.4.7 evidence may be reused from an earlier SHA.

## V2.4.7-002 — presentation gap proven

**State:** ✅ EVIDENCE ACCEPTED

The accepted Battle V2 route already had authoritative session/match transport, Vanguard, four Reserves and card-owned Attack, but the release tabletop still lacked the complete presentation surface: Reward racks, Deck/Discard areas, persistent Realm presentation, attachment presentation, reusable full-card rendering and known-card hand presentation.

The server view already exposes the safe inputs required for those surfaces. Therefore the missing owner is presentation only; no new gameplay engine or database owner is justified.

## V2.4.7-003 — pure reusable card renderer

**State:** ✅ SOURCE CANDIDATE

Added `stream-bandit-tcg-card-renderer-v2-4-7.js` as a data-driven presentation module.

Boundary:

- accepts authoritative instance/definition/structured/Creature state;
- presents generic card family/name/element/stage data;
- presents HP/damage, Shield, Withdraw Cost, conditions, Ability metadata and attachments;
- presents only action descriptors handed to it by the existing controller;
- contains no fetch/Supabase/Edge/RPC/randomness/rule-resolution authority;
- contains no current Set One card-name or card-id branches.

## V2.4.7-004 — artwork state stays truthful

**State:** ✅ SOURCE CANDIDATE / 🔒 RELEASE ART HOLD

Current structured gameplay definitions explicitly leave display/card-art outside gameplay authority. The renderer therefore supports explicit `approved`, `placeholder` and `missing` states but the battle controller supplies no invented art mapping. Current source renders Artwork pending until a separate canonical art/printing authority exists.

No visual release acceptance is claimed.

## V2.4.7-005 — complete tabletop zone skeleton

**State:** ✅ SOURCE CANDIDATE

`tcg-battle-v2.html` + `stream-bandit-tcg-battle-table-v2-4-7.css` now define source-level zones for:

- opponent hidden hand;
- opponent Deck / six Rewards / Discard;
- opponent four Reserves + Vanguard;
- centre shared Realm;
- local Vanguard + four Reserves;
- local Deck / six Rewards / Discard;
- local known hand.

The route remains board-only with no normal site header/footer/menu.

## V2.4.7-006 — authoritative projection only

**State:** ✅ SOURCE CANDIDATE

The existing battle controller now delegates card markup to the renderer and projects the extra authoritative state. It retains the same API owner names, session handling, match/revision/nonce fencing, polling and Attack command.

No new browser action is introduced. In particular, play/evolve/attach/Realm/Tactic/Ability/Withdraw remain later explicit interaction slices.

## V2.4.7-007 — hidden-zone privacy fence

**State:** ✅ SOURCE CANDIDATE

Opponent hidden zones use counts only:

- hand → `hand_count`;
- deck → `deck_count`;
- rewards → `rewards_count`;
- discard → `discard_count`.

Reward identities are never inferred. Opponent hand/Deck/Discard identities are not read by the controller.

## V2.4.7-008 — regression coverage

**State:** ✅ SOURCE CANDIDATE

Added a dedicated V2.4.7 tabletop/renderer contract covering:

- complete zone inventory;
- pure renderer ownership;
- explicit missing-art truth;
- generic HP/Shield/conditions/Withdraw/Attack presentation;
- opponent hidden-zone privacy;
- generic Essence/Relic projection;
- no card-id gameplay branch.

The existing Attack click behavior harness now loads the renderer before the controller while preserving the exact accepted authoritative Attack request and stale-revision re-sync expectations.

## V2.4.7-009 — validation fence

**State:** ✅ ACCEPTED @ `0e8887730a4af6c47d69f7089644e977bc3036fb`

Before source acceptance, the final V2.4.7 PR head must pass:

1. TCG Card Pass 2 Validation;
2. Code Labs Migration Replay from zero;
3. Code Labs V50 Functional Smoke;
4. zero material review threads;
5. bounded diff review against `bd2f5b...`.

## V2.4.7 checkpoint

**PR:** #576 remains draft/unmerged.  
**Supabase production:** no V2.4.7 database/Edge change is required or authorized.  
**`main` / GitHub Pages / public/live:** HOLD.  
**Accepted exact head:** `0e8887730a4af6c47d69f7089644e977bc3036fb` — TCG #655, Migration Replay #825 and Functional Smoke #851 all SUCCESS; zero review threads; no legacy combined statuses.  
**Next after acceptance:** V2.4.8 direct physical hand card → Reserve interaction through existing `play_creature`, with browser payload limited to `card_uid + reserve_index` plus the existing action envelope.
