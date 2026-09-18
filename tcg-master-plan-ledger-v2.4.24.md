# Stream Bandit TCG — Master Plan V2.4.24 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.24.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.24.md`  
**Continuity parent:** `90df200bdbc136ff59724498c047c7c36d5c498d`.

## V2.4.24-001 — gap proven

**State:** ✅

Canonical Stage 3 still requires Reward/promotion resolution feedback. Match view exposes `pending_resolution`, and Match v6 already owns `take_reward` and `promote`, but the V2 battlefield has no controls for either.

## V2.4.24-002 — Reward selection candidate

**State:** ✅ SOURCE CANDIDATE

Face-down Reward slots become position-selectable only for local `take_reward` resolution. Selection is local/cancellable. Confirm sends only the selected positions to the existing Match owner.

## V2.4.24-003 — mandatory promotion candidate

**State:** ✅ SOURCE CANDIDATE

During local `promote` resolution, occupied Reserve cards become highlighted selectable targets. Selection is local/cancellable and explicit confirmation sends the Reserve index to the existing Match owner.

The board explicitly communicates defeated Vanguard → mandatory promotion.

## V2.4.24-004 — continuation preservation

**State:** ✅ SOURCE CANDIDATE

Promotion-triggered movement/heal listener choices continue through the existing generic authoritative choice router. No new continuation UI or rules are introduced.

## V2.4.24-005 — hidden information / authority

**State:** ✅

Reward identities remain hidden. Browser does not compute defeat, Reward value, resolution order or promotion legality.

## V2.4.24-006 — validation

**State:** 🔄

Hold acceptance until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.
