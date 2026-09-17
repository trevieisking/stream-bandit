# Stream Bandit TCG — Canonical Master Plan V2.3.4

**Date:** 2026-09-17  
**Status:** active implementation checkpoint  
**Inherits:** every requirement, rule, UX authority, owner boundary, Deck Search invariant, gate and LIVE definition in `tcg-master-plan-progress-v2.3.3.md` unless explicitly changed here  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Non-negotiable authority

The original playable prototype remains the player-experience source of truth: **RESTORE, DO NOT REDESIGN**. The established 40-owner server architecture remains the gameplay authority. No debug-form redesign, card-specific helper, duplicate owner or owner #41 is authorized by this checkpoint.

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
- merge/current implementation checkpoint: `e59ee73443ed085b04175a2339b2eac3f8f8d818`.
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

## V2 presentation audio — REQUIRED FOR RELEASE 🔊

Background music and sound effects are mandatory release requirements. They are presentation systems, not gameplay-rule owners and do not create owner #41.

### Required audio behaviour
- battle background music is present in the playable release;
- appropriate UI/gameplay SFX are present for material player-visible events, including card select/play, Attack declaration/impact, damage, Shield, heal, Ability, Evolution, Essence attachment, Tactic/Relic/Realm use, Reward, turn change, victory/defeat and rejected action feedback where appropriate;
- music and SFX have user-accessible mute/unmute controls;
- music and SFX volume are independently controllable where practical;
- browser autoplay restrictions are respected: audio begins only after a permitted user interaction and is never forced around platform policy;
- mute/reduced/no-audio operation never changes legality, timers, randomization, state transitions or match outcome;
- gameplay event/state is the source for presentation cues; sound never becomes rules authority;
- audio assets must be original to Stream Bandit, licensed for use, or otherwise rights-cleared;
- reduced-motion/accessibility paths remain usable without relying on sound alone.

**V2-AUDIO-01 status:** REQUIRED / PENDING. It need not block the immediate Attack repair/proof slice, but it **must pass before public/live release**.

## Exact next operation

1. refresh exact implementation `main` from `e59ee73443ed085b04175a2339b2eac3f8f8d818`;
2. prove **V2-ATTACK-01** before expanding the action surface: reproduce a simple legal card-initiated Attack through the real V2 client/server contract and current structured card data;
3. if the real path fails, identify the exact first failing seam (card definition → client intent → deployed/source dispatcher → owner validation → atomic commit → authoritative view refresh) and repair only that owner/integration boundary;
4. require the successful proof to show damage/effect, Aftermath/turn progression and synchronized visible board state—not merely a 200 response or passing type-check;
5. once Attack is genuinely accepted, extend the same card-as-control / engine-authoritative contract to **active Ability** using the generic `use_ability` route with board position (`where`, `index`);
6. then implement reusable hand-card physical controls in bounded slices: Creature placement → Evolution target highlight/drop → Essence attachment → Relic → Realm → Ally/Device Tactic;
7. keep drag/drop and tap/select accessibility paths equivalent; illegal or rejected intents return to authoritative board state with a visible reason;
8. add V2-AUDIO-01 background music/SFX system before public/live release and gate release on working mute/volume/accessibility behaviour;
9. require exact-head validation/review before each source merge and update plan/checklist/ledger/release index after every accepted slice;
10. keep Supabase/live deployment separate from source implementation until a real two-user V2 end-to-end fence is ready.

G0R-10 remains explicitly queued and cannot be silently skipped before any live/public promotion that uses `play_tactic`.
