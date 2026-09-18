# Stream Bandit TCG — Master Plan V2.4.8 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.8.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.8.md`  
**Accepted functional parent:** V2.4.7 @ `0e8887730a4af6c47d69f7089644e977bc3036fb`  
**Continuity parent:** `bc721a31ec1f5a48dd7910993177b402ab4d4fdf`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release decision:** 🔒 HOLD PR merge / `main` / public / live / production release.

## V2.4.8-001 — V2.4.7 acceptance synchronized

**State:** ✅ ACCEPTED

GitHub PR comment source-of-truth records V2.4.7 accepted at `0e888773...`: TCG #655, Migration Replay #825 and Functional Smoke #851 all succeeded, review threads were zero and no legacy combined statuses existed. `bc721a31...` changed checklist continuity only.

## V2.4.8-002 — existing server command selected

**State:** ✅ EVIDENCE ACCEPTED

The next master-plan target is direct hand → Reserve. Existing `tcg-match-actions: play_creature` already owns the required mutation and legality. Its public payload inputs are `card_uid` and `reserve_index` beyond the shared match/revision/nonce envelope.

No browser rules engine or new gameplay owner is justified.

## V2.4.8-003 — hand selection projection

**State:** ✅ SOURCE CANDIDATE

Known local hand instances become presentation-selectable only while the accepted authoritative turn/pending/busy fence permits a card action. Selection uses the visible instance UID only and is mutually exclusive with Vanguard card selection.

## V2.4.8-004 — Reserve placement target

**State:** ✅ SOURCE CANDIDATE

All four local Reserve positions become explicit presentation targets after a hand card is selected. The client does not filter the card by type/stage and does not decide whether a Reserve is legally empty. The server remains fail-closed.

## V2.4.8-005 — authoritative transport and re-sync

**State:** ✅ SOURCE CANDIDATE

`runPlayCreatureIntent` submits:

- `action: play_creature`;
- `match_id`;
- `client_nonce`;
- `expected_revision`;
- `card_uid`;
- `reserve_index`.

Both success and rejection re-fetch authoritative match state. No gameplay mutation is performed in the browser.

## V2.4.8-006 — regression contract

**State:** ✅ SOURCE CANDIDATE

A dedicated Card Pass 2 regression contract proves:

- payload minimality;
- server ownership of slot/type/stage/listener legality;
- card-identity-free presentation selection;
- authoritative re-sync after success/rejection;
- absence of client Baby/Standalone/Mythic or empty-slot rules.

## V2.4.8-007 — validation fence

**State:** 🔄 FRESH EXACT-HEAD EVIDENCE REQUIRED

Before V2.4.8 source acceptance, the final PR head must pass:

1. TCG Card Pass 2 Validation;
2. Code Labs Migration Replay from zero;
3. Code Labs V50 Functional Smoke;
4. zero material review threads;
5. bounded diff review from `bc721a31...`.

## V2.4.8 checkpoint

**PR:** #576 remains draft/unmerged.  
**Supabase production:** no V2.4.8 database or Edge deployment is required.  
**`main` / GitHub Pages / public/live:** HOLD.  
**Next after acceptance:** re-read the Master Plan and take the next smallest direct-card interaction backed by an existing canonical server owner.
