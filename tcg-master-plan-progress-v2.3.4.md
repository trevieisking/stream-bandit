# Stream Bandit TCG — Canonical Master Plan V2.3.4

**Date:** 2026-09-17  
**Status:** active implementation checkpoint  
**Inherits:** every requirement, rule, UX authority, owner boundary, Deck Search invariant, gate and LIVE definition in `tcg-master-plan-progress-v2.3.3.md` unless explicitly changed here  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Non-negotiable authority

The original playable prototype remains the **in-match player-interaction** source of truth: **RESTORE, DO NOT REDESIGN THE CARD TABLE**. The established 40-owner server architecture remains the gameplay authority. No debug-form redesign, card-specific helper, duplicate owner or owner #41 is authorized by this checkpoint.

The browser interaction rule is explicit: **the card is the player control; the relevant canonical engine is the authority for the action initiated by that card.** Card tap/select/drag operations produce structured intents. The card/browser does not decide legality, costs, targets, damage, timing, listeners, state transitions, defeat resolution or Aftermath. Those rules remain owned by the canonical server engines. The browser renders authoritative returned state. A second browser rules engine is forbidden.

Examples of the boundary:
- a Creature card initiates Attack or active Ability intent; Attack/Ability and their dependent canonical owners validate and resolve it;
- an Essence card initiates attachment intent; the Essence/Card-Zone/payment boundaries remain authoritative;
- an Evolution card initiates evolution intent; the Creature/Evolution owner validates the target and transition;
- Relic, Realm, Ally and Device cards initiate their own structured action intents and resolve through their dedicated owners;
- the card is never a substitute for the engine that owns the rule.

The V2.3.3 Deck Search rule remains fully locked: every true `search.deck` has the mandatory authoritative postcondition `deck.shuffle`, with player-facing wording **Then shuffle your deck.**

## V2-G0R historical private-alpha hardening state

- **G0R-11 — Validation workflow coverage: COMPLETE ✅** — PR #565; Validation #571 SUCCESS; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.
- **G0R-07 — Matchmaking room lifetime: COMPLETE IN SOURCE ✅** — PR #566; Validation #574 + Replay #799 + Smoke #825 SUCCESS; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`.
- **G0R-08 — Setup-legal deck validation: COMPLETE IN SOURCE ✅** — PR #567 head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; Validation #586 + Replay #800 + Smoke #826 SUCCESS; merge checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- **G0R-09 — Private-room Ready concurrency: COMPLETE IN SOURCE ✅**
  - defect fixed in the authoritative Ready RPC with a room-scoped transaction advisory lock around Ready mutation + aggregate count;
  - membership and deck-validation fences preserved;
  - exact two-members/two-ready `all_ready` rule preserved;
  - PR #568 reviewed head `cc46b1fda04361105bc390c9efeddc8c475c6571`;
  - TCG Validation #597 / `35235272269`, Migration Replay #801 / `35235272316`, Functional Smoke #827 / `35235272663` all SUCCESS;
  - zero review threads; exact two-file diff;
  - merged to source main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`;
  - Supabase/live not deployed by this source merge.
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡** — only Ally/Device may enter one-shot `play_tactic`; Relic/Realm remain dedicated-owner actions; runtime guard not yet accepted.

**Accepted G0R source repairs:** **4 / 11 ✅**.

### G0R execution classification after prototype-restoration decision

The historical private-alpha runtime is compatibility/test provenance, not the finished V2 product target. Remaining G0R items stay recorded and must not be forgotten, but they do **not** block beginning the V2 prototype-restoration implementation unless the V2 path reuses the affected runtime boundary or the defect would compromise deterministic tests, security, hidden information, economy integrity or a later live promotion.

G0R-10 remains explicitly queued. No existing accepted G0R repair is reverted.

## V2 prototype restoration — IN PROGRESS 🎴

### V2-UI-01 — Card-face Attack intent/control foundation: COMPLETE IN SOURCE ✅

This checkpoint proves the player-control and transport boundary only. It does **not** prove that a real two-user Attack completes successfully.

- PR #569: `TCG V2: restore card-face attack control foundation`.
- exact reviewed head: `ba1f5ef61439d24a4e91ae96272a5d046ae9d80c`.
- merge/current implementation checkpoint at acceptance: `e59ee73443ed085b04175a2339b2eac3f8f8d818`.
- TCG Card Pass 2 Validation #608 / run `35241870575`: SUCCESS.
- exact diff: 3 additive files / no deletions.
- review threads: 0; combined legacy statuses: 0.
- added `tcg-battle-v2.html` as the additive one-screen V2 battle surface.
- added `stream-bandit-tcg-v2-battle-controller.js` as presentation + player-intent controller only.
- added focused `card-pass-2-v2-battle-card-control-attack` contract coverage.
- selecting the active Vanguard card exposes its structured Attack slots on the card face.
- Attack submits existing generic `attack` with `attack_slot`, `match_id`, fresh `client_nonce`, and `expected_revision`.
- `tcg-match-actions` and its canonical dependent owners remain authoritative for legality, payment, target resolution, damage, effects, listeners, defeat scanning and Aftermath.
- no card-name browser branches, gameplay `prompt()` / `confirm()` targeting, browser damage/payment engine or browser RNG was introduced.
- rejected actions refresh authoritative state and keep the server rejection reason visible.
- historical `t.html` remains untouched.
- Supabase, database, deployed Edge Functions, live and production were not changed.

### V2-ATTACK-01 — Real playable Attack engine path: REQUIRED / PENDING 🔒

The previous failed playable game test contained a user-observed product failure: an attempted Attack did not execute. That historical symptom is not treated as proof that every Attack sub-engine is broken, because current source includes an isolated HTTP-dispatch integration test that can commit damage and advance the turn through the real `tcg-match-actions` dispatcher. It **is** proof that we must not declare Attack complete from unit/type/contract tests alone.

Attack is accepted only after a real V2 two-user journey proves all of the following on the same authoritative match:
1. the active Creature card exposes an Attack from structured card data;
2. the player initiates the Attack from that card;
3. the intent reaches the canonical Attack route with the current revision/nonce fence;
4. the canonical engines validate turn, legality, Attack cost and target requirements;
5. the authoritative state commits the expected damage/effect outcome exactly once;
6. Shield/Conditions/listeners/choices resolve when applicable without duplicate resolution;
7. defeat scan, Reward/promotion and Aftermath occur in canonical order when applicable;
8. successful Attack hands off/advances the turn exactly as the card/rules require;
9. both clients refresh to the same committed result and visibly show the changed HP/damage/board/turn state;
10. an illegal Attack is rejected with a visible reason and no authoritative mutation.

If this proof fails, repair the **exact failed seam or authoritative owner**. Do not replace working Attack sub-engines merely because the old private-alpha game test failed, and do not hide an engine defect in browser workarounds.

Until this gate passes: **Attack gameplay = HOLD / NOT COMPLETE**.

### V2-ATTACK-00A — Authoritative commit rejection visibility: COMPLETE IN SOURCE ✅

PR #570 removed one proven silent-failure path before the full two-user Attack proof:
- reviewed head `f013637d5d6684117441deeb8a2057fab95f7454`;
- TCG Card Pass 2 Validation #614 / run `35243998846`: SUCCESS;
- exact diff: 2 files / +37 / -2; zero review threads;
- source main after merge: `d331e93f75e8c5ce6345ac030651f44c37f78866`;
- `tcg_server_commit_state` may return an authoritative logical rejection nested under an HTTP-200 Edge envelope;
- the V2 controller now recognizes nested `result.ok === false`, shows the authoritative rejection reason and re-syncs the board instead of treating an unchanged state as success;
- no Attack legality, damage, payment, target, RNG, listener or Aftermath logic moved into the browser;
- no Edge Function, migration, database, Supabase or live deployment was changed by this source repair.

This improves failure visibility but **does not complete V2-ATTACK-01**.

## V2 presentation audio — REQUIRED FOR RELEASE 🔊

Background music and sound effects are mandatory release requirements. They are presentation systems, not gameplay-rule owners and do not create owner #41.

### Required audio behaviour
- game/menu and battle background music is present where appropriate in the playable release;
- appropriate UI/gameplay SFX are present for material player-visible events, including card select/play, Attack declaration/impact, damage, Shield, heal, Ability, Evolution, Essence attachment, Tactic/Relic/Realm use, Reward, turn change, victory/defeat and rejected action feedback where appropriate;
- music and SFX have user-accessible mute/unmute controls;
- music and SFX volume are independently controllable where practical;
- browser autoplay restrictions are respected: audio begins only after a permitted user interaction and is never forced around platform policy;
- mute/reduced/no-audio operation never changes legality, timers, randomization, state transitions or match outcome;
- gameplay event/state is the source for presentation cues; sound never becomes rules authority;
- audio assets must be original to Stream Bandit, licensed for use, or otherwise rights-cleared;
- reduced-motion/accessibility paths remain usable without relying on sound alone.

**V2-AUDIO-01 status:** REQUIRED / PENDING. It need not block the immediate route-shell/Attack proof slices, but it **must pass before public/live release**.

---

## Release product screen architecture — LOCKED 🎮

### Clarification: one-screen battle, not one-page product

The original prototype's all-in-one page was acceptable as a prototype harness. It is **not** the release product architecture.

`RESTORE, DO NOT REDESIGN` applies to the **active match/card-table interaction model**: direct cards, board visibility, drag/drop or tap/select equivalents, and engine-authoritative outcomes. It does not require the real game to keep prototype navigation, authentication, deck tools, matchmaking and the battlefield on one page.

The release product must feel like a sequence of game screens with one clear responsibility each:

1. **Landing / Account** — signed-out entry, Sign In, Create Account; signed-in state offers Continue/Enter Game and Sign Out.
2. **Game Home / Main Menu** — Play, Collection, Deck Builder, Packs, Learn/Card Viewer, Progress/Season/Profile/Settings as separate destinations.
3. **Play / Mode Select** — Ranked is a dedicated choice; future Casual/Private/Friends/Practice may exist as separate modes without contaminating Ranked.
4. **Ranked** — deck selection/readiness where required plus one clear **Play** action.
5. **Matchmaking** — searching/queue state only, with safe cancel/leave behaviour.
6. **Opponent Found / Paired / Loading** — short transition that binds the authoritative `match_id` and prepares the board route.
7. **Active Match** — **board-only game screen**. No global site/menu/dashboard/debug shell around the battlefield. Only match-safe HUD/settings such as turn/phase, mute/audio, accessibility and concede/leave controls may appear.
8. **Match Result** — victory/defeat/rewards/result presentation with clean navigation back to Ranked, Play or Game Home.

Collection, Deck Builder, Packs and other non-match systems remain their own screens/routes/modules. They may share visual components and authenticated state, but they do not render inside the active battlefield.

### V2-SHELL-01 — Route-separated release game shell: REQUIRED / PENDING 🔒

Acceptance requires:
- landing/auth is separate from the signed-in game home;
- game menu/product areas are separate from active match;
- entering an active match leaves the menu shell and opens a board-only route;
- direct URL/refresh on a match route can restore authenticated match context safely;
- end-of-match returns through a result screen rather than dropping into a prototype/debug surface;
- desktop and mobile/touch navigation remain usable;
- shared auth/session state persists across screens without duplicating gameplay rules;
- no new backend merely to achieve page separation; existing Stream Bandit auth/Supabase infrastructure is reused.

### V2-MM-01 — Ranked automatic matchmaking: REQUIRED / PENDING 🔒

The required Ranked player journey is:

**Ranked → Play → Matchmaking → Opponent Found/Paired → Board**

Ranked must not expose copy/paste pairing codes, room codes or manual join-code entry.

Existing automatic matchmaking is the server authority and must be reused/adapted rather than replaced:
- `tcg-private-alpha-api` owns the current `matchmake`, `leave_matchmaking`, `claim_room_match` and match-view/setup boundary;
- `tcg-match-actions` owns authoritative in-match actions;
- `tcg-tactic-actions` retains its dedicated Tactic action ownership;
- existing database/RPC matchmaking owns queue serialization, validated deck admission and pair creation.

An internal `join_code` may remain as opaque schema compatibility data if the existing room model requires it. **It is not player-facing Ranked UX and must never be displayed, copied, typed or required in Ranked.** Existing private-room/join-code capability may remain available for a future Friends/Private mode and must not be broken by Ranked work.

V2-MM-01 acceptance requires two independently signed-in users to:
1. select Ranked and press Play;
2. enter the automatic queue through the existing matchmaking API;
3. see a clear searching state and be able to cancel safely before pairing;
4. be paired by the server without exchanging any code;
5. resolve to the same authoritative match with opposite seats;
6. see an opponent-found/paired transition;
7. enter the board-only match route with the authoritative `match_id`;
8. survive refresh/rejoin without creating a duplicate match or leaking opponent hidden information;
9. leave/timeout safely according to server state;
10. keep Private/Friends code flows separate from Ranked.

### Existing Edge Function reuse — LOCKED

The release client must **adapt and reuse the existing TCG Edge Functions**. Do not create a parallel TCG backend merely because the UI is split into screens.

- `tcg-private-alpha-api` remains the setup/account/deck/matchmaking/match-view orchestration boundary and may be edited/versioned where the release journey proves a required contract change.
- `tcg-match-actions` remains the match-action dispatcher and may be corrected where an exact authoritative gameplay seam is proven.
- `tcg-tactic-actions` remains the Tactic action boundary and may be corrected where its exact owner contract requires it.
- shared 40-owner engines remain the rules authority behind those functions.
- page routing is presentation/orchestration; it does not create gameplay owner #41.

Edge Function changes require the same rule as engine changes: **prove the exact deficiency first, then edit the existing function in place and preserve working contracts.**

## Superseding exact next operation

This section supersedes the earlier V2.3.4 `Exact next operation` ordering without erasing its requirements.

1. Use accepted implementation main `d331e93f75e8c5ce6345ac030651f44c37f78866` (PR #570) as the current source baseline.
2. Inventory current landing/auth, game-menu, TCG/product, matchmaking and battle pages/controllers before creating new files; reuse working screens/components where practical.
3. Implement **V2-SHELL-01** as a bounded release-shell slice: Landing/Auth → Game Home → Play/Ranked → Matchmaking → Paired → board-only Match → Result.
4. Implement **V2-MM-01** on that shell using the existing `tcg-private-alpha-api` automatic matchmaking actions/RPCs. Do not expose join codes in Ranked and do not break future Private/Friends code flows.
5. Keep the board's original prototype interaction authority intact inside the board-only route: cards initiate structured intents and canonical engines resolve them.
6. Use the resulting real two-user Ranked→Board journey to complete **V2-ATTACK-01**. A 200 response or unit test is insufficient; both players must visibly receive the same committed Attack result and turn progression.
7. If Attack fails, identify the first exact failing card-data/client/Edge/engine/commit/view seam before coding and repair only that authoritative boundary.
8. After Attack acceptance, extend the same card-as-control contract to active Ability, then Creature placement → Evolution → Essence → Relic → Realm → Ally/Device Tactic.
9. Complete **V2-AUDIO-01** background music/SFX and mute/volume/accessibility controls before public/live release.
10. Require exact-head validation/review after every bounded source slice and keep plan/checklist/ledger/release index synchronized.
11. Keep Supabase deployment/live promotion separate until the complete real two-user release journey passes; G0R-10 remains queued and cannot be skipped before any live path using `play_tactic`.

**Release UX definition:** the game is not accepted as release-ready merely because a prototype page can perform actions. A player must be able to enter through the real game screens, automatically find an opponent in Ranked, transition into a clean board-only match, play through the authoritative card-table interaction model, see synchronized outcomes, and leave through a result screen without encountering debug/prototype controls or manual pairing codes.
