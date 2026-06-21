# Stream Bandit Master Must-Follow Plan V7.13.077

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / FINAL SCAN PASS INCORPORATED / AUTH GATE CONTROLLED ROLLOUT UPDATED / HEADER FOOTER PROJECTOR BRIDGE PASSED / CODE FIX MACHINE OWNER SUPPORT TOOL ADDED / USER MANAGEMENT 11B ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION / INDEX HOME LIBRARY DETAILS PLAYER 1 AND CONTINUE WATCHING AUTH GATE PASSED / WATCH HISTORY AUTH GATE ATTACHED PENDING BROWSER SMOKE TEST / AUTH GATE AUTOFILL GUARD PASSED / LIBRARY BROWSER AUTOFILL FILTER ISSUE FIXED BY CENTRAL AUTH GATE HELPER / PLAYER 1 DETAILS LINK WRONG MOVIE ISSUE LOGGED FOR LATER / HEADER SHELL MASS AUTH GATE NOT APPROVED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit. It records what is locked, what passed, what is pending, what stays separate, and what must happen before any future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

This is a source-of-truth planning document. It records the passed Header/Footer projector bridge, the approved Owner-only Code Fix Machine support helper, the accepted User Management owner-only visual exception, the auth gate helper/password setup/login-popup proof, the owner recovery path pass, the Index auth-gate pass, the Home auth-gate pass, the Library auth-gate pass, the Details auth-gate pass, the Player 1 auth-gate pass, the Continue Watching auth-gate pass, the Watch History auth-gate attachment now pending browser smoke test, and the central auth-gate autofill guard pass. Player 1 has one non-auth page issue logged for later: its Details link can open a random movie title instead of the currently playing movie such as Doctor Strange. This is not an auth/account blocker. This plan does not approve SQL, RLS changes, storage policy changes, payment activation, DNS automation, production Home replacement, broad shell merging, broad auth-gate rollout, Header Shell auth-gate embedding, or broad shell-bridge rollout beyond specific tested safe passes.

## 1. What the full scan taught us

Stream Bandit is no longer one flat pile of test pages. It is now a platform with clear route families:

- Platform / Core Watch
- Creator / Library Management
- Group Play
- Social Media Group
- Account / Settings
- Web Builder
- Admin / Proof
- Owner / Management
- User Management
- Policy

The main lesson is this: most confusion came from old support routes still being visible, not from the current app being broken.

Correct repair pattern:

- scan
- map
- lock
- patch only what fails
- hide or canonicalize old support routes
- do not delete useful old pages blindly
- full-page replace only when patching is unsafe
- if it works and is owner-only, accept small visual debt instead of risking protected logic

## 2. Source of truth hierarchy

Every future decision must follow this order:

1. `CURRENT-APP-MANIFEST-V7-12-180.md`
2. `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`
3. `STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md`
4. `WEB-BUILDER-MANIFEST-V7-12-252.md`
5. `STREAM-BANDIT-FIX-MEMORY-V7-13.md`
6. `STREAM-BANDIT-WHAT-CHANGED-V7-13-032.md`
7. `stream-bandit-route-registry-v7-13-001.js`
8. `stream-bandit-route-access-map-v7-12-271.js`
9. Current page source fetched directly from GitHub or complete user-supplied full file when GitHub output is truncated
10. Browser smoke test result

Search results and old checkpoint text are secondary. Direct fetch beats search when they disagree. If GitHub output truncates an HTML or JavaScript file and the user has the full file, ask for the full file before changing that page. Do not predict missing HTML or JavaScript from truncated output.

## 3. Permanent architecture lock

Main App owns streaming, watching, browse, creator submission, review queue, channels, collections, playlists, social, messages, profile, settings, admin/proof pages and accessibility/audio comfort.

Main App Home remains:

`home-global-helpers-v7-4-4-test.html`

`index.html` remains the Platform Entry, not a replacement for Home.

Web Builder stays Web Builder. It owns Builder Hub, Owned Pages Manager, Studio/page canvas, Published Preview, Menu Builder, Header/Footer Builder, Form Designer, Form Inbox bridge, Assets, Planning Map, Control Map and Source Map.

Current Web Builder user-facing route map:

- Web Builder Hub: `web-builder-account-control-hub-v7-12-263-test.html`
- Owned Pages Manager: `web-builder-pages-manager-owned-v7-12-256-test.html`
- Owned Preview: `web-builder-preview-owned-v7-12-257-test.html?page=test-page`
- Form Designer: `web-builder-form-designer-owned-v7-12-258-test.html?page=test-page`
- Form Inbox Bridge: `web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page`

Old Web Builder pages can remain as hidden support/compatibility witnesses. They should not be exposed as the normal user route if a current owned page exists.

## 4. Owner group lesson

Owner is not a normal public-navigation group. It is a management/proof/diagnostic group.

Owner menu should currently expose only:

- Form Inbox
- One Machine
- Code Fix Machine
- Platform Control Centre
- Final Shell Navigation
- Brand / App Icons
- Brand Image Helper
- Favicon / App Icon Builder

Owner rules:

- Form Inbox is the temporary Owner exception and is queued for later Social placement.
- One Machine is read-only route/security/ownership proof.
- Code Fix Machine is an Owner-only support helper for safe paste/search/replace/check workflows when connector tools are blocked or GitHub output is truncated. It requires exact old line/block and exact replacement line/block. It performs no Supabase writes, no SQL, no RLS, no storage actions, no live promotion and no app data mutation.
- Final Shell Navigation is read-only shell/navigation proof.
- Brand / App Icons is a real owner/admin global-logo upload/save page and must be preservation-first.
- Brand Image Helper is preview-only and writes off.
- Favicon / App Icon Builder is preview-only and writes off.
- Old Web Builder support pages should not be normal Owner menu exposure.

## 5. User Management lesson

User Management is not a cosmetic group. It is a real owner/admin control area.

Current routes:

- User Management Dashboard: `user-management-dashboard-v7-11-2-test.html`
- Feature Shop / Pricing: `plans-pricing-feature-shop-v7-11-3-test.html`
- Permissions Inspector: `permissions-matrix-user-management-v7-11-4-test.html`

Rules:

- User Management Dashboard is protected owner/admin control work.
- Feature Shop / Pricing is preview-only. It has no payment provider, no billing, no upgrades and no entitlement writes.
- Permissions Inspector is read-only. It has no writes, no billing and no role changes.

## 6. Social lesson

Social pages are real working pages and must not be blind-patched.

Current Social group:

- Social Profile: `profile-social-v7-13-001-test.html`
- Friends: `friends-social-v7-13-001-test.html`
- News Feed: `news-feed-social-v7-13-001-test.html`
- Groups and Events: `groups-social-v7-13-001-test.html`

Rules:

- Social Profile owns account/social/profile wall behavior.
- Friends owns friends/messages/likes behavior.
- News Feed owns post/comment/reaction/feed behavior.
- Groups owns groups/events/posts behavior.
- Form Inbox should be moved/renamed into Social later only after a separate controlled pass.

## 7. Admin lesson

Admin pages mostly exist as command, readiness, registry, health, Mux, storage-prep and backup proof/support surfaces. They are not all emergency writers.

Admin group scan passed with no broad patch needed.

Current Admin routes:

- Admin Centre
- Live Readiness
- Current Routes Registry
- Test Checklist
- Tools
- Health Check
- Mux Manager
- Storage Prep
- Backup / Safety

Rules:

- Do not rewrite Admin proof pages just to update version labels.
- Storage Prep remains controlled and scoped.
- Registry, Live Readiness, Health and Checklist are proof surfaces.

## 8. Route cleanup rule

Never delete an old page only because it is old.

Use this rule:

Old link found -> decide whether it is normal user navigation or diagnostic/support evidence -> normal user navigation uses current canonical route -> diagnostic/support can keep old witness route if useful -> patch only if user confusion or broken flow is proven -> verify by direct GitHub fetch and browser smoke test.

## 9. Protected boundaries

No future pass may touch these without explicit separate approval:

- SQL
- RLS
- storage policy
- payment provider
- DNS automation
- production Home replacement
- player/audio/accessibility comfort
- private backend credentials in browser
- private Supabase credentials
- Main App/Web Builder shell merge
- Header Shell auth-gate embedding

Publishable Supabase config must remain config-only and must not be copied into docs as a secret.

## 10. Future Phase: Proper Supabase Sign-In Gate / No Guest Users

Status:

HELPER BUILT / TEST PAGE CREATED / RESET PASSWORD FLOW PASSED / PASSWORD SETUP TEST PASSED / SIGNED-IN APPROVED PROOF PASSED / SIGNED-OUT GATE APPEARS / LOGIN POPUP FULLY VISIBLE PASSED / LOGIN WITH NEW PASSWORD PASSED / OWNER RECOVERY PATH PASSED / INDEX AUTH GATE PASSED / HOME AUTH GATE PASSED / LIBRARY AUTH GATE PASSED / DETAILS AUTH GATE PASSED / PLAYER 1 AUTH GATE PASSED / CONTINUE WATCHING AUTH GATE PASSED / WATCH HISTORY AUTH GATE ATTACHED PENDING BROWSER SMOKE TEST / AUTH GATE AUTOFILL GUARD PASSED / LIBRARY AUTOFILL ISSUE FIXED BY CENTRAL HELPER / PLAYER 1 DETAILS LINK WRONG MOVIE ISSUE LOGGED FOR LATER

Goal: build a proper Stream Bandit sign-in gate that blocks guest users from the app until they are signed in through Supabase Auth. This should replace casual guest browsing with a controlled login-first experience.

The gate is a controlled phase. It is not approved as a broad shell rewrite or mass page edit.

### Built helper

`stream-bandit-auth-gate-v7-13-001.js`

Current helper status:

`V7.13.005 Auth Gate / Email Password / No Guest Users / Owner Recovery / Session Watch / Autofill Guard`

Current test page:

`stream-bandit-auth-gate-test-v7-13-001.html`

Password setup test page:

`stream-bandit-password-setup-test-v7-13-001.html`

### Passed auth gate results

Index auth gate attachment test result:

- `index.html` was upgraded to V7.13.020 for the first real-page auth gate test.
- Signed-in Index opened normally.
- Header Shell sign-out was tested without manual refresh.
- The login gate opened and stayed up after sign-out.
- Login with the new password worked from the Index gate.
- Index owner recovery URL worked: `index.html?sb_owner_recovery=1`.
- Index remained the Platform Entry and did not replace Home.

Home auth gate attachment test result:

- `home-global-helpers-v7-4-4-test.html` was upgraded to V7.12.159 for the second real-page auth gate test.
- Signed-in Home opened normally.
- Header Shell sign-out was tested without manual refresh.
- The login gate opened instantly and stayed up after sign-out.
- Login with the new password worked from the Home gate.
- Home owner recovery URL worked: `home-global-helpers-v7-4-4-test.html?sb_owner_recovery=1`.
- Home remained the Main App Home route and did not replace Index.

Library auth gate attachment test result:

- `library-global-helpers-v7-4-8-test.html` was tested as the first controlled protected-page rollout after Index and Home passed.
- Signed-in Library opened.
- Library loaded 23 movies.
- The browser saved email/password autofill issue was reproduced and then fixed centrally by `stream-bandit-auth-gate-v7-13-001.js` V7.13.005.
- Reload Library works.
- Details opens.
- Play opens.
- Continue Watching works.
- Header Shell sign-out, gate display, and login all passed.

Details auth gate attachment test result:

- `details-clean-machine-v7-12-38-test.html` was tested after Home and Library passed.
- Details was upgraded to V7.12.174 Auth Gate Test.
- Signed-in Details opened normally.
- Details tabs, Play button, save buttons, cast cards, source URLs, related movies, header/footer/theme/search and clean navigation remained preserved.
- The central V7.13.005 auth gate autofill guard fixed the autofill issue.

Player 1 auth gate attachment test result:

- `player-one-global-helpers-v7-3-3-test.html` was upgraded to V7.12.269 Auth Gate Test.
- Signed-in Player 1 opened and the auth gate worked full pass.
- Playback, player comfort, volume, fullscreen, Picture-in-picture and audio boost controls remained preserved.
- Mux/HLS/direct video, YouTube and Vimeo provider handling remained preserved.
- Resume, watch history, save buttons, playback monitor and source bridge logic remained preserved.
- Player 1 has a separate Details-link/current-row routing bug logged for later.

Continue Watching auth gate attachment test result:

- `continue-watching-global-helpers-v7-3-9-test.html` was upgraded to V7.12.231 Auth Gate Test.
- The auth gate script was added directly after the shell script only.
- The helper now calls `StreamBanditAuthGate.enforce()` from the existing helper loop.
- Helper status now shows Auth Gate.
- Helper state now records `authGate` true/false.
- Trevor confirmed a perfect pass.
- Read-only progress, dedupe, resume links, save buttons, Details links and clean navigation remained preserved.

Watch History auth gate attachment status:

- `watch-history-global-helpers-v7-4-0-test.html` was upgraded to V7.12.227 Auth Gate Test.
- The auth gate script was added directly after the shell script only.
- The helper now calls `StreamBanditAuthGate.enforce()` from the existing helper loop.
- Helper status now shows Auth Gate.
- Debug state now records `authGate` true/false.
- Read-only history/progress, dedupe, resume links, save buttons, Details links and theme tabs were preserved in code.
- Browser smoke test is pending Trevor's current test result.

Auth gate autofill guard test result:

- `stream-bandit-auth-gate-v7-13-001.js` was upgraded to V7.13.005.
- The helper clears auth email/password values after approved login.
- The helper removes the hidden auth gate DOM after approved login instead of only hiding it.
- The helper hardens page search/filter/query inputs on auth-gated pages.
- The helper clears browser-injected email-looking values from search/filter/query fields unless a real URL search query exists.
- This fixed the autofill issue that appeared on Library and Details after attaching the gate.

Current visual asset note:

- Trevor wants `stream_bandit_original_running_stag_MASTER_1536x1024.png` used on the login page and actual gate.
- The image asset is visible on the auth gate test page.
- The login popup crop fix passed on the auth gate test page.
- Owner recovery passed on the auth gate test page.

Passed auth-gate attachment pages:

- `index.html`
- `home-global-helpers-v7-4-4-test.html`
- `library-global-helpers-v7-4-8-test.html`
- `details-clean-machine-v7-12-38-test.html`
- `player-one-global-helpers-v7-3-3-test.html`
- `continue-watching-global-helpers-v7-3-9-test.html`

Pending auth-gate attachment page test:

- `watch-history-global-helpers-v7-4-0-test.html`

Do not apply to every page from Header Shell yet. Header Shell is global navigation and loads on mixed page families. Embedding the auth gate in Header Shell would silently mass-apply the gate to Web Builder, Owner, Admin, support and diagnostic pages before each route family is explicitly approved.

### Library autofill issue

Status: fixed, ticked off, central auth gate helper fix passed, no separate Library page patch needed for this issue.

### Player 1 Details link issue for later focused fix

Status: logged, not an auth blocker, Player 1 auth gate passed, fix later in a dedicated Player 1 Details-link pass.

Observed behavior:

- On Player 1, clicking Details can open a random movie title instead of the currently playing title.
- The observed current playing title was Doctor Strange, but Details opened a different/random title.
- This blocks full Player 1 page success but does not block the auth gate pass.

Later fix direction:

- Make a dedicated Player 1 Details-link/current-row routing pass.
- Use the complete full Player 1 HTML file as the base.
- Do not touch auth gate helper for this issue.
- Do not touch SQL, RLS, storage, payments or Header Shell mass injection.
- Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.
- Check that Details links use the currently resolved movie row id, not a fallback/latest/random row id.
- Check route parameter handling for id and src combinations.
- Check whether direct source override keeps the real movie id when building Details URLs.
- Fix only the Details-link/current-row routing behavior once this item is selected for work.

### Required rollout phases

1. Confirm this plan and lock gate scope. DONE.
2. Confirm existing admin/approved user password login works in Supabase Auth. DONE.
3. Phase one username decision: email-only. DONE.
4. Design reset-password redirect path. DONE FOR TEST.
5. Build shared auth gate helper. DONE.
6. Attach only to Index and Home first. DONE.
7. Test login, logout and reset password. PASSED ON TEST PAGE, INDEX, HOME, LIBRARY, DETAILS, PLAYER 1 AND CONTINUE WATCHING. WATCH HISTORY PENDING.
8. Test signed-out user cannot pass. PASSED ON TEST PAGE, INDEX, HOME, LIBRARY, DETAILS, PLAYER 1 AND CONTINUE WATCHING. WATCH HISTORY PENDING.
9. Test signed-in admin/approved user can pass. PASSED ON TEST PAGE, INDEX, HOME, LIBRARY, DETAILS, PLAYER 1 AND CONTINUE WATCHING. WATCH HISTORY PENDING.
10. Owner emergency recovery path is available for testing if needed.
11. Expand to protected pages one at a time only. STARTED AND CONTINUING.
12. Later decide Create Account mode: public, invite-only or owner-created only. NOT DONE.

### Next controlled protected page rollout target

Current immediate target: finish browser smoke test for `watch-history-global-helpers-v7-4-0-test.html`.

Next rollout rules:

- Choose one protected page at a time.
- Use the complete full HTML file as the base.
- Attach the auth gate script after `stream-bandit-shell-v6-24.js` only.
- Call `StreamBanditAuthGate.enforce()` safely from the page helper/status loop.
- Update helper status to include Auth Gate.
- Do not alter SQL, RLS, storage, payment, source playback, audio boost, accessibility/player comfort or Header Shell mass injection.
- Do not fix unrelated page-specific issues during an auth-gate attachment pass unless the user explicitly approves that issue as the current target.

## 11. Shell Bridge Follow-Up Fixes

Status: 11A passed; 11B accepted with owner-only visual exception; no broad shell merge approved.

11A Web Builder Header/Footer Builder page Web Builder identity bridge: passed and locked.

11B User Management Dashboard Main App theme/global bridge: accepted with owner-only visual exception. Do not rework unless a functional failure appears.

## 12. Current final-scan decision

- Final scan pass complete.
- Manifest updated.
- Web Builder map updated.
- Master Plan updated.
- Auth gate helper built and tested.
- Auth gate reset/password setup passed.
- Auth gate Index passed.
- Auth gate Home passed.
- Auth gate Library passed.
- Auth gate Details passed.
- Auth gate Player 1 passed.
- Auth gate Continue Watching passed.
- Auth gate Watch History attached and pending Trevor browser smoke test.
- Auth gate autofill guard passed.
- Library browser autofill filter issue is fixed and ticked off by central auth gate helper V7.13.005.
- Player 1 Details link wrong-movie issue is logged for later and is not an auth blocker.
- Header Shell auth-gate embedding is not approved yet.
- Next step: finish Watch History browser smoke test, then decide the next controlled protected page. No mass page or Header Shell injection.
- Header/Footer projector bridge passed and locked.
- Code Fix Machine Owner support tool approved.
- User Management 11B theme bridge accepted with owner-only visual exception.
- Next work must start from these docs, not from old menu confusion.
