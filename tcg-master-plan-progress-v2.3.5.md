# Stream Bandit TCG — Master Plan Progress V2.3.5

**Date:** 2026-09-17  
**Supersedes for current execution:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.5.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.5.md`  
**Release index:** `tcg-release-control-v2.4.json`

## 1. Continuity rule — mandatory

The GitHub master plan, checklist and ledger are the continuity authority for Stream Bandit TCG. Every material implementation slice must be recorded there before the result is treated as an accepted checkpoint. A timeout or new chat resumes from the latest GitHub control layer, not from memory.

Every accepted slice records the exact repository, PR/branch, reviewed head SHA, merge SHA where applicable, changed files, exact validation/review evidence, live/Supabase impact, decision and exact next operation.

## 2. Product architecture — locked

The original playable prototype remains the **in-match interaction north star**, not the release application-shell architecture.

The release game is route/screen separated:

1. **Landing / Account** — signed-out entry with Sign In and Create Account.
2. **Game Home / Main Menu** — signed-in TCG home, separate from battle.
3. **Play / Mode Select** — choose Ranked now; future Casual/Friends/Private may remain separate modes.
4. **Ranked** — Ranked-specific entry and deck selection/status.
5. **Matchmaking** — dedicated searching/cancel state.
6. **Opponent Found / Paired** — dedicated transition/loading state.
7. **Active Match** — board-only game route carrying the authoritative `match_id`.
8. **Match Result** — separate result/rematch/back-to-play screen.
9. Collection, Deck Builder, Packs, Learn/Card Viewer, Progress/Season/Profile/Settings remain menu pages outside the active match.

**Locked semantic clarification:** “one-screen battlefield” means the active card-table match is kept visible and coherent during gameplay choices. It does **not** mean the entire TCG product, authentication, menus, matchmaking, collection and debugging are placed on one HTML page.

## 3. Existing backend reuse — locked

The existing TCG backend remains authoritative and is adapted in place where evidence proves a contract change is needed:

- `tcg-private-alpha-api`
- `tcg-match-actions`
- `tcg-tactic-actions`
- existing Supabase TCG tables/RPCs, including automatic matchmaking

No parallel TCG backend, duplicate matchmaking service, browser rules engine or owner #41 is created for screen architecture.

Ranked uses the existing automatic matchmaking boundary. The player flow is **Ranked → Play → Matchmaking → Opponent Found → Board**. Ranked never asks for, copies or displays pairing/join codes. Any existing `join_code` required internally by legacy storage is opaque compatibility data only. Direct-code rooms remain isolated for a future Friends/Private mode.

## 4. V2-SHELL-01A — board-only match route accepted

### Accepted source

- repository: `trevieisking/stream-bandit`
- PR: **#571** — `TCG V2: make active match route board-only`
- reviewed head: `b7f870bf9cb0a1679f71c762a05e67901b3df0c0`
- merge commit/main: `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`
- exact validation: **TCG Card Pass 2 Validation #619**, run `35247988250` — SUCCESS
- review threads: 0
- review submissions: 0
- PR comments: 0
- legacy combined commit statuses: none found

### Exact three-file delta from pre-slice main `d331e93f75e8c5ce6345ac030651f44c37f78866`

1. `tcg-battle-v2.html` — +6 / -7
2. `tcg/tests/card-pass-2-v2-board-only-match-shell.test.mjs` — +35 / -0
3. `tcg/tests/card-pass-2-v2-battle-card-control-attack.test.mjs` — +1 / -1

The third file is the bounded correction discovered by Validation #618: the existing card-control test still asserted the retired `card-control-v0-1` page marker after the match page deliberately moved to `board-only-v0-2`. No gameplay expectation was relaxed; only the page identity assertion was synchronized with the new release-shell contract. Validation #619 then passed on the repaired exact head.

### What #571 changed

- removed the ordinary Stream Bandit header/footer shell dependencies from the active V2 match page;
- preserved the non-visual shared config bridge and theme projection;
- explicitly loaded the existing shared Auth Gate required by the battle controller;
- retained the existing authoritative battle controller unchanged;
- added regression coverage proving the match page contains no matchmaking/menu/room-code UI and still binds to authoritative `match_id` state.

### What #571 did not change

- no Edge Function;
- no SQL/migration/database data;
- no Supabase deployment;
- no Attack/gameplay rule;
- no card definition/starter/engine owner;
- no live/production deployment.

**Result:** the active match route is now board-only in source. This is one completed part of V2-SHELL-01, not completion of the release client.

## 5. V2-SHELL-01B — release navigation/screens — next implementation gate

Build the release journey as separate pages/screens that cooperate through authenticated session state and authoritative IDs. Reuse existing Stream Bandit authentication/session/config components rather than recreating auth.

### Landing / Account

- dedicated TCG-facing landing screen;
- signed-out state visibly offers **Sign In** and **Create Account**;
- existing shared email/password/session machinery is reused;
- the current shared Auth Gate explicitly has no public signup, so account creation must reuse an existing safe account-creation capability if one exists, or add the minimum supported Supabase Auth signup path only after inventory proves no existing owner;
- signed-in users route to Game Home rather than seeing battle/debug controls.

### Game Home / Main Menu

Dedicated signed-in TCG menu. Initial release destinations include Play, Collection, Deck Builder, Packs, Learn/Card Viewer, Progress/Season/Profile/Settings as implemented/available. Missing destinations may be disabled/coming-soon but must not be faked as working.

### Play / Ranked

- mode selection stays outside the match;
- Ranked entry selects/uses a legal deck and exposes one clear **Play** action;
- server remains deck-legality authority.

### Matchmaking

- dedicated searching state;
- uses existing automatic matchmaking API/RPC;
- cancellable before server pairing where supported by the existing authoritative state machine;
- no player-facing join code.

### Opponent Found / Paired

- dedicated transition after authoritative match is known;
- carries only safe presentation information;
- resolves to `tcg-battle-v2.html?match_id=<authoritative id>` (or equivalent existing safe binding) without inventing a second match identity;
- no private opponent deck/card leakage.

### Result

- separate from the board;
- authoritative outcome only;
- safe route back to Ranked/Play/Game Home.

## 6. V2-MM-01 — automatic Ranked matchmaking

The existing backend already owns automatic pairing and legal-deck validation. Client work must expose that path rather than build a new matcher.

Required end-to-end proof remains:

- two authenticated users choose legal decks;
- both enter Ranked matchmaking without exchanging codes;
- one may wait, the second completes the pair;
- both resolve the same authoritative match with opposite seats;
- paired-room recovery/rejoin remains valid;
- matched rooms do not disappear because a waiting-queue expiry elapsed;
- board opens with authoritative `match_id`;
- opponent hidden information stays protected.

## 7. V2-ATTACK-01 dependency

Real two-user Attack proof stays HOLD until the separated release journey can place two authenticated players into the same board-only match reliably. #571 did not prove Attack gameplay complete.

Once the real journey exists, prove in order:

1. legal Attack state;
2. correct structured Attack printed on active Vanguard;
3. one client intent to canonical Attack route;
4. turn/payment/target validation;
5. exact authoritative damage/effect once;
6. Shield/Condition/listener/private-choice chain;
7. defeat → Reward/promotion → Aftermath where applicable;
8. automatic turn handoff after successful Attack;
9. both clients render the same committed result;
10. illegal Attack visibly rejects with zero mutation.

If any point fails, identify the first exact seam before changing code and repair only the canonical owner/integration boundary.

## 8. Audio and complete release client

V2-AUDIO-01 remains required before public/live promotion: background music where appropriate, gameplay/UI SFX, mute, separate music/SFX volume, autoplay-safe user gesture, accessible non-audio equivalents and rights-cleared assets. Audio is presentation only and never rules authority.

After Attack proof, continue the locked card-control order: active Ability → Creature placement → Evolution → Essence → Relic → Realm → Ally/Device Tactic, followed by the remaining release-client/product gates.

## 9. Current release state

- **main source:** `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`
- **V2-SHELL-01A board-only match:** COMPLETE IN SOURCE ✅
- **V2-SHELL-01B separated release screens:** PENDING 🔒
- **V2-MM-01 automatic Ranked client journey:** PENDING 🔒
- **V2-ATTACK-01 real two-user proof:** PENDING 🔒
- **V2-AUDIO-01:** PENDING 🔒
- **Supabase/live/production:** HOLD 🔒
- **Code Labs Protected Writer / CG Repair Lab / Code God / Repo Desk:** not invoked

## 10. Exact next operation

1. Freeze `main` at `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f` for the next source inventory.
2. Inventory existing account-creation capability and TCG/menu/navigation assets before creating new pages.
3. Inventory the exact browser contract for `tcg-private-alpha-api` matchmaking actions and current deck selection source.
4. Define the minimum route file set for Landing/Account → Game Home → Play/Ranked → Matchmaking → Paired → existing board-only Match → Result.
5. Implement the first bounded V2-SHELL-01B/V2-MM-01 slice on a non-main branch with no backend mutation unless inventory proves a missing contract.
6. Validate exact head, review the complete diff, update checklist/ledger, and make the promotion decision before merge.
7. Keep Supabase/live/production HOLD until a separate evidence-backed promotion decision.
