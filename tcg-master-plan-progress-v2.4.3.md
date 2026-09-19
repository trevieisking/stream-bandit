# Stream Bandit TCG — Canonical Master Plan V2.4.3

**Plan date:** 2026-09-17  
**Status:** standalone outside-match route foundation implementation on V2.4.2  
**Inherits:** `tcg-master-plan-progress-v2.4.2.md` in full  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.3.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.3.md`  
**Route guide:** `TCG-PAGE-ROUTE-OWNER-GUIDE-V2-4-3.md`  
**Exact source base:** `main` @ `bf3579b7f2021df8b53c441ca32f25ec6484286b`  
**Release decision:** 🔒 HOLD public/live/production.

## 1. V2.4.3 implementation result

V2.4.3 implements the first bounded application-shell slice accepted by V2.4.2: one reusable outside-match TCG page shell; the canonical eleven-link primary rail; real standalone routes for every primary destination; standalone Account and Players/Friends family routes; reuse of the existing Stream Bandit Auth Gate/theme/header/footer; active-route `aria-current="page"`; touch-scrollable navigation; and disabled/unwired states where a server owner is missing.

`tcg-battle-v2.html` remains isolated from the outside-match application shell. This slice creates no Supabase schema/function/data write and no gameplay owner #41.

## 2. Canonical primary routes

`Game Home · Play · Collection · Decks · Packs · Players · Friends · Learn · Progress · Settings · Account`

Routes:

`tcg-game-home.html · tcg-play.html · tcg-collection.html · tcg-decks.html · tcg-packs.html · tcg-players.html · tcg-friends.html · tcg-learn.html · tcg-progress.html · tcg-settings.html · tcg-account.html`

No Shop route is introduced.

## 3. Owner boundary

Route shells are presentation. They do not acquire gameplay/service authority. Collection/deck/pack/progression values are not fabricated; Directory searches stay gated until a public-safe TCG-member authority exists; friendship/block writes stay gated until TCG-scoped owners exist; security reuses existing auth; Leave TCG and whole-account deletion remain gated until their reviewed lifecycles are wired.

## 4. Validation

`tcg/tests/card-pass-2-page-shell.test.mjs` protects exact primary routes, standalone file existence, shared shell/auth/header/footer reuse, unsafe-write gating, Find Players → one Players route, and battle isolation.

## 5. Next bounded implementation order

V2.4.1 visual authority remains inherited. After this shell foundation is accepted, proceed one owner/page family at a time without displacing the premium card renderer/tabletop restoration release gates: Directory → TCG Friends → TCG Blocks → approved Account/Profile/Security wiring → scoped notifications/preferences → Leave TCG lifecycle → whole-account deletion lifecycle.

**Public/live/production remains HOLD until inherited V2.4/V2.4.1 release gates pass.**
