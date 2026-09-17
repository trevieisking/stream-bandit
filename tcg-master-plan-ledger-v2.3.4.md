# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Accepted source baseline

- G0R-11 COMPLETE — PR #565; Validation #571; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.
- G0R-07 COMPLETE — PR #566; Validation #574 / Replay #799 / Smoke #825; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`.
- G0R-08 COMPLETE — PR #567; Validation #586 / Replay #800 / Smoke #826; merge checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- G0R-09 COMPLETE — PR #568; Validation #597 / Replay #801 / Smoke #827; merge/current main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`.
- Accepted G0R source repairs: **4/11**.
- G0R-10 remains PROVEN / QUEUED and is not dropped.

## V2.3.4-008 — G0R-09 defect proven

Exact source `supabase/migrations/20260903225626_tcg_private_room_lobby.sql` at main `042559e252cfa49ad425d9f57fa01a678b2a3fe9` defined `tcg_server_set_room_ready` with member check, deck validation, Ready row update, aggregate count, then `all_ready=(v_count=2 and v_ready_count=2)` with no per-room serialization. Two simultaneous transactions could each count before the other Ready write committed. The private-alpha API initializes only when a Ready response returns `r?.all_ready`.

**Owner decision:** repair concurrency in the authoritative room Ready function, not browser retry logic.

## V2.3.4-009 — G0R-09 bounded implementation

Created branch `fix/tcg-g0r-09-ready-concurrency` from exact main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.

Migration commit `4c08c8528677aef8a58955a91e1a05f7227f5854` added `20260917144500_tcg_private_room_ready_concurrency.sql`:
- additive `CREATE OR REPLACE` only;
- preserved member and deck-validation fences;
- acquired a room-scoped transaction advisory lock immediately before Ready mutation + aggregate count;
- key derives from `p_room_id::text || ':ready'`, so unrelated rooms do not share one global mutex;
- preserved exact two-members/two-ready `all_ready` rule;
- rewrote no existing data.

Focused test/head commit `cc46b1fda04361105bc390c9efeddc8c475c6571` added `tcg/tests/card-pass-2-g0r-09-private-room-ready-concurrency.test.mjs` and locked the mutation/count ordering, room-scoped transaction lock, preserved validation fences and private-alpha `r?.all_ready -> initialize(room)` dependency.

Opening/final reviewed diff:
- 2 commits;
- 2 files;
- +105 / -0.

## V2.3.4-010 — G0R-09 acceptance

Exact reviewed head: `cc46b1fda04361105bc390c9efeddc8c475c6571`.

Acceptance evidence:
- TCG Card Pass 2 Validation #597 / run `35235272269` — SUCCESS;
- Code Labs Migration Replay #801 / run `35235272316` — SUCCESS;
- Code Labs V50 Functional Smoke #827 / run `35235272663` — SUCCESS;
- review threads — 0;
- combined legacy commit statuses — none found;
- exact changed-file list remained the additive migration + focused test only;
- main remained `042559e252cfa49ad425d9f57fa01a678b2a3fe9` immediately before merge.

Promotion decision: **PROMOTE ✅ source merge**.

PR #568 was marked ready and merged from the expected head. Merge/current-main checkpoint: `2bc55ecd6d626a465cd483ee2e889ceb6177c280`.

Supabase/runtime/live/production were not deployed or mutated by this source merge and remain HOLD.

## Promotion state at V2.3.4-010

- G0R-09 source merge: **PROMOTE COMPLETE ✅**
- accepted source main: `2bc55ecd6d626a465cd483ee2e889ceb6177c280`
- accepted G0R source repairs: **4/11**
- Supabase/runtime/live/production: **HOLD / unchanged**
- Code Labs Writer / CG Repair Lab / Code God: **not invoked**

## Historical next operation at V2.3.4-010

Refresh exact main `2bc55ecd6d626a465cd483ee2e889ceb6177c280` and prove the next safest remaining V2-G0R defect from current source. Prefer an additive/replay-safe repair. G0R-10 remains explicitly queued until a safe bounded runtime mutation path is available.

---

## V2.3.4-011 — Prototype-restoration path supersedes G0R-first sequencing

Product direction was clarified after the failed private-alpha test: the private-alpha runtime is historical compatibility/test provenance, not the target player experience. The canonical destination remains the original prototype interaction model with the 40 established server owners.

Authority rule locked:
- **cards initiate player actions; canonical engines own and resolve the rules for those actions;**
- the browser/card is an intent and presentation surface, not a duplicate rules engine;
- no owner #41 is created for UI or one card.

Remaining G0R debt remains recorded. G0R-10 stays explicitly queued. G0R items that protect security, hidden information, economy integrity, reused V2 boundaries or live promotion remain mandatory when their boundary is reached.

## V2.3.4-012 — V2-UI-01 card-face Attack intent foundation accepted in source

PR #569 created the first bounded V2 prototype-restoration implementation slice from exact main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`.

Accepted evidence:
- reviewed head `ba1f5ef61439d24a4e91ae96272a5d046ae9d80c`;
- Validation #608 / run `35241870575` — SUCCESS;
- exact diff: 3 additive files / 0 deletions;
- review threads: 0;
- combined legacy statuses: 0;
- merged source main: `e59ee73443ed085b04175a2339b2eac3f8f8d818`.

The slice added:
- `tcg-battle-v2.html`;
- `stream-bandit-tcg-v2-battle-controller.js`;
- `tcg/tests/card-pass-2-v2-battle-card-control-attack.test.mjs`.

Accepted meaning is deliberately narrow: the active Creature card can expose structured Attack slots and submit the existing generic `attack` intent with `attack_slot`, current `match_id`, a fresh nonce and expected revision. The server engine remains authoritative. Historical `t.html`, Supabase and deployed TCG functions were not changed.

## V2.3.4-013 — Attack completion classification corrected

The earlier shorthand “Card-face Attack control COMPLETE” was too broad when read as gameplay completion.

Fresh reconciliation:
- the user reported that the previous playable game test would not Attack;
- current source includes `card-pass-2-runtime-attack-owner-wiring.test.mjs`, which exercises the real HTTP dispatcher with transport/RNG replaced and proves isolated structured/legacy Attack cases can commit damage and advance the turn;
- therefore the evidence does **not** support declaring the entire Attack engine broken;
- equally, isolated tests and PR #569 do **not** prove the real two-user V2 Attack path works.

Correct classification:
- **V2-UI-01 card→Attack intent/control foundation: COMPLETE IN SOURCE ✅**;
- **V2-ATTACK-01 real playable Attack engine path: REQUIRED / PENDING 🔒**;
- **Attack gameplay overall: HOLD / NOT COMPLETE** until real two-user proof exists.

Required completion fence: structured Attack visible on the active card → card-initiated intent → canonical legality/cost/target validation → exactly-one state commit → expected damage/effects → canonical listener/defeat/Reward/promotion/Aftermath ordering → correct turn progression → both clients render the same committed result. Illegal Attack must reject visibly with no mutation.

If the proof fails, identify and repair the exact failing engine/integration seam. Browser workaround logic is not an acceptable substitute for a canonical owner repair.

## V2.3.4-014 — Background music and sound effects become mandatory release requirements

Audio was found to be insufficiently represented as a concrete release requirement. It is now explicitly required.

Locked audio boundary:
- background battle music required for public/live release;
- gameplay/UI SFX required for material visible events, including Attack, damage, Shield, heal, Ability, Evolution, Essence attachment, Tactic/Relic/Realm, Reward, turn transition and match end where appropriate;
- mute/unmute required;
- separate music/SFX volume controls required where practical;
- browser autoplay rules must be respected and never bypassed;
- audio cannot affect legality, RNG, timers, state transitions or match outcome;
- event/state drives sound presentation, never the reverse;
- audio assets must be original, licensed or otherwise rights-cleared;
- muted gameplay must remain fully understandable and accessible;
- audio presentation does not justify owner #41.

**V2-AUDIO-01: REQUIRED / PENDING.** It is not the immediate Attack-engine repair priority, but it is a hard gate before public/live release.

## Current promotion state

- accepted implementation main: `e59ee73443ed085b04175a2339b2eac3f8f8d818`
- V2-UI-01 card→Attack intent foundation: **COMPLETE IN SOURCE ✅**
- V2-ATTACK-01 real playable Attack path: **HOLD / PENDING 🔒**
- V2-AUDIO-01: **REQUIRED / PENDING 🔊**
- accepted historical G0R source repairs: **4/11**
- G0R-10: **PROVEN / QUEUED**
- Supabase/runtime/live/production: **HOLD / unchanged**
- Code Labs Writer / CG Repair Lab / Code God: **not invoked**

## Exact next operation

Freeze implementation main `e59ee73443ed085b04175a2339b2eac3f8f8d818` and prove V2-ATTACK-01 through the simplest real structured card Attack path before extending to active Ability. If the real path fails, identify the exact first failing seam before coding, repair only that canonical owner/integration boundary, and require deterministic regression plus visible two-client state proof. After Attack acceptance, continue Ability and hand-card physical controls. V2-AUDIO-01 must be completed before public/live promotion. G0R-10 remains queued and cannot be silently skipped before a live path using `play_tactic`.
