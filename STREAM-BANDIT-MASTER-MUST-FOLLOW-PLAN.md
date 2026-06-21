Stream Bandit Master Must-Follow Plan V7.13.076

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / FINAL SCAN PASS INCORPORATED / FUTURE AUTH GATE PLAN ADDED / HEADER FOOTER PROJECTOR BRIDGE PASSED / CODE FIX MACHINE OWNER SUPPORT TOOL ADDED / USER MANAGEMENT 11B ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION / AUTH GATE HELPER PASSWORD SETUP LOGIN POPUP OWNER RECOVERY INDEX SESSION WATCH HOME SESSION WATCH LIBRARY SESSION WATCH DETAILS SESSION WATCH PLAYER 1 SESSION WATCH PASSED / INDEX HOME LIBRARY DETAILS AND PLAYER 1 AUTH GATE PASSED / AUTH GATE AUTOFILL GUARD PASSED / LIBRARY BROWSER AUTOFILL FILTER ISSUE FIXED BY CENTRAL AUTH GATE HELPER / PLAYER 1 DETAILS LINK WRONG MOVIE ISSUE LOGGED FOR LATER / NEXT CONTROLLED PROTECTED PAGE ROLLOUT DECISION NEEDED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit after the full beginning-to-end scan pass. It records what the scan taught us, what is now locked, what stays separate, and what must happen before any future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

This is a source-of-truth planning document. It records the passed Header/Footer projector bridge, the approved Owner-only Code Fix Machine support helper, the accepted User Management owner-only visual exception, the auth gate helper/password setup/login-popup proof, the owner recovery path pass, the first real Index auth-gate session-watch pass, the first real Home auth-gate session-watch pass, the first controlled Library auth-gate session-watch pass, the Details auth-gate pass, the central auth-gate autofill guard pass, and the Player 1 auth-gate pass. The previous Library browser-autofill issue is now considered fixed/ticked off by the V7.13.005 central auth gate helper because the helper clears auth email/password values, removes hidden auth fields after approval, and guards search/filter/query inputs from browser email autofill. Player 1 has one non-auth page issue logged for later: the Details link from Player 1 can open a random movie title instead of the currently playing movie such as Doctor Strange. This is not an auth/account blocker; the auth gate passed. This plan does not approve SQL, RLS changes, storage policy changes, payment activation, DNS automation, production Home replacement, broad shell merging, broad auth-gate rollout, header-shell auth-gate embedding, or any additional shell-bridge rollout beyond specific tested safe passes.

1. What the full scan taught us

Stream Bandit is no longer one flat pile of test pages. It is now a platform with clear route families:

Platform / Core Watch
Creator / Library Management
Group Play
Social Media Group
Account / Settings
Web Builder
Admin / Proof
Owner / Management
User Management
Policy

The main lesson is this:

Most confusion came from old support routes still being visible, not from the current app being broken.

Therefore the correct repair pattern is:

SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
HIDE OR CANONICALIZE OLD SUPPORT ROUTES
DO NOT DELETE USEFUL OLD PAGES BLINDLY
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
IF IT WORKS AND IS OWNER-ONLY, ACCEPT SMALL VISUAL DEBT INSTEAD OF RISKING PROTECTED LOGIC
2. Source of truth hierarchy

Every future decision must follow this order:

CURRENT-APP-MANIFEST-V7-12-180.md
STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md
STREAM-BANDIT-PHASE-1-MASTER-AUDIT-SHEET-V7-13-019.md
WEB-BUILDER-MANIFEST-V7-12-252.md
STREAM-BANDIT-FIX-MEMORY-V7-13.md
STREAM-BANDIT-WHAT-CHANGED-V7-13-032.md
stream-bandit-route-registry-v7-13-001.js
stream-bandit-route-access-map-v7-12-271.js
Current page source fetched directly from GitHub or complete user-supplied full file when GitHub output is truncated
Browser smoke test result

Search results and old checkpoint text are secondary. Direct fetch beats search when they disagree. If GitHub output truncates an HTML or JavaScript file and the user has the full file, ask for the full file before changing that page. Do not predict missing HTML or JavaScript from truncated output.

3. Permanent architecture lock
Main App stays Main App

Main App owns:

Streaming
Watching
Browse
Creator submission
Review queue
Channels
Collections
Playlists
Social
Messages
Profile
Settings
Admin/proof pages
Accessibility/audio comfort

Main App Home remains:

home-global-helpers-v7-4-4-test.html

index.html remains the Platform Entry, not a replacement for Home.

Web Builder stays Web Builder

Web Builder owns:

Builder Hub
Owned Pages Manager
Studio / page canvas
Published Preview
Menu Builder
Header/Footer Builder
Form Designer
Form Inbox bridge
Assets
Planning Map
Control Map
Source Map

Current Web Builder user-facing route map:

Web Builder Hub
-> web-builder-account-control-hub-v7-12-263-test.html

Owned Pages Manager
-> web-builder-pages-manager-owned-v7-12-256-test.html

Owned Preview
-> web-builder-preview-owned-v7-12-257-test.html?page=test-page

Form Designer
-> web-builder-form-designer-owned-v7-12-258-test.html?page=test-page

Form Inbox Bridge
-> web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page

Old Web Builder pages can remain as hidden support/compatibility witnesses. They should not be exposed as the normal user route if a current owned page exists.

4. Owner group lesson

Owner is not a normal public-navigation group. It is a management/proof/diagnostic group.

The scan taught us that Owner visibility was causing confusion because old Web Builder support pages were still visible there. The fix is not deletion. The fix is to keep Owner lean.

Owner menu should currently expose only:

Form Inbox
One Machine
Code Fix Machine
Platform Control Centre
Final Shell Navigation
Brand / App Icons
Brand Image Helper
Favicon / App Icon Builder

Owner rules:

Form Inbox is the temporary Owner exception and is queued for later Social placement.
One Machine is read-only route/security/ownership proof.
Code Fix Machine is an Owner-only support helper for safe paste/search/replace/check workflows when connector tools are blocked or GitHub output is truncated. It requires exact old line/block and exact replacement line/block. It performs no Supabase writes, no SQL, no RLS, no storage actions, no live promotion and no app data mutation.
Final Shell Navigation is read-only shell/navigation proof.
Brand / App Icons is a real owner/admin global-logo upload/save page and must be preservation-first.
Brand Image Helper is preview-only and writes off.
Favicon / App Icon Builder is preview-only and writes off.
Old Web Builder support pages should not be normal Owner menu exposure.
5. User Management lesson

User Management is not a cosmetic group. It is a real owner/admin control area.

Current routes:

User Management Dashboard
-> user-management-dashboard-v7-11-2-test.html

Feature Shop / Pricing
-> plans-pricing-feature-shop-v7-11-3-test.html

Permissions Inspector
-> permissions-matrix-user-management-v7-11-4-test.html

Rules:

User Management Dashboard is protected owner/admin control work.
Feature Shop / Pricing is preview-only. It has no payment provider, no billing, no upgrades and no entitlement writes.
Permissions Inspector is read-only. It has no writes, no billing and no role changes.
6. Social lesson

Social pages are real working pages and must not be blind-patched.

Current Social group:

Social Profile
-> profile-social-v7-13-001-test.html

Friends
-> friends-social-v7-13-001-test.html

News Feed
-> news-feed-social-v7-13-001-test.html

Groups and Events
-> groups-social-v7-13-001-test.html

Rules:

Social Profile owns account/social/profile wall behavior.
Friends owns friends/messages/likes behavior.
News Feed owns post/comment/reaction/feed behavior.
Groups owns groups/events/posts behavior.
Form Inbox should be moved/renamed into Social later only after a separate controlled pass.
7. Admin lesson

Admin pages mostly exist as command, readiness, registry, health, Mux, storage-prep and backup proof/support surfaces. They are not all emergency writers.

Admin group scan passed with no broad patch needed.

Current Admin routes:

Admin Centre
Live Readiness
Current Routes Registry
Test Checklist
Tools
Health Check
Mux Manager
Storage Prep
Backup / Safety

Rules:

Do not rewrite Admin proof pages just to update version labels.
Storage Prep remains controlled and scoped.
Registry/Live Readiness/Health/Checklist are proof surfaces.
8. Route cleanup rule

Never delete an old page only because it is old.

Use this rule:

Old link found
-> decide whether it is normal user navigation or diagnostic/support evidence
-> normal user navigation uses current canonical route
-> diagnostic/support can keep old witness route if useful
-> patch only if user confusion or broken flow is proven
-> verify by direct GitHub fetch and browser smoke test
9. Protected boundaries

No future pass may touch these without explicit separate approval:

SQL
RLS
Storage policy
Payment provider
DNS automation
Production Home replacement
Player/audio/accessibility comfort
Service-role logic
Global Supabase secrets
Main App/Web Builder shell merge
Header-shell auth-gate embedding

Publishable Supabase config must remain config-only and must not be copied into docs or exposed as a secret.

10. Future Phase: Proper Supabase Sign-In Gate / No Guest Users

Status:

HELPER BUILT / TEST PAGE CREATED / RESET PASSWORD FLOW PASSED / PASSWORD SETUP TEST PASSED / SIGNED-IN APPROVED PROOF PASSED / SIGNED-OUT GATE APPEARS / LOGIN POPUP FULLY VISIBLE PASSED / LOGIN WITH NEW PASSWORD PASSED / OWNER RECOVERY PATH PASSED / INDEX AUTH GATE SESSION WATCH PASSED / HOME AUTH GATE SESSION WATCH PASSED / LIBRARY AUTH GATE SESSION WATCH PASSED / DETAILS AUTH GATE SESSION WATCH PASSED / PLAYER 1 AUTH GATE SESSION WATCH PASSED / INDEX HOME LIBRARY DETAILS AND PLAYER 1 AUTH GATE PASSED / AUTH GATE AUTOFILL GUARD PASSED / LIBRARY AUTOFILL ISSUE FIXED BY CENTRAL HELPER / PLAYER 1 DETAILS LINK WRONG MOVIE ISSUE LOGGED FOR LATER / NEXT CONTROLLED PROTECTED PAGE ROLLOUT DECISION NEEDED

Goal:

Build a proper Stream Bandit sign-in gate that blocks guest users from the app until they are signed in through Supabase Auth. This should replace casual guest browsing with a controlled login-first experience.

The gate is a controlled phase. It is not approved as a broad shell rewrite or mass page edit.

Gate experience requirements

The gate should show:

Stream Bandit logo
Welcome to Stream Bandit
Email or username field
Password field
Login button
Logout button
Create Account button or section
Reset Password flow
Existing admin/approved users only message until signup rules are approved

Behavior requirements:

No guest users through the main app.
Signed-out users stay on the gate.
Signed-out users cannot interact with app pages behind the gate.
Signed-in users can enter only after Supabase session is confirmed.
Create Account remains disabled, invite-only or controlled until public signup is explicitly approved.
Magic/reset links only help existing Supabase Auth users and do not create approved profiles by themselves.
Technical direction

Use Supabase Auth email/password login as the core method:

signInWithPassword
signOut
resetPasswordForEmail

Username login is allowed only after a safe design is chosen. Username login may require a profile lookup before sign-in, but this must not expose private emails, create a weak bypass, or leak account existence in a careless way.

Password readiness must be checked before building the gate. Existing admin users must have password login enabled in Supabase Auth, otherwise email/password login will fail even if the gate is coded correctly.

Reset password needs a safe redirect flow so the user lands back on Stream Bandit after setting a new password.

Built helper
stream-bandit-auth-gate-v7-13-001.js

Current helper status:

V7.13.005 Auth Gate / Email Password / No Guest Users / Owner Recovery / Session Watch / Autofill Guard

Current test page:

stream-bandit-auth-gate-test-v7-13-001.html

Password setup test page:

stream-bandit-password-setup-test-v7-13-001.html

Current auth gate test result:

The test page loaded the auth gate helper.
Signed-in session was detected.
Current owner/admin/platform-owner profile was approved through sb_profiles.
Decision returned allowed true.
Reason returned signed-in-approved.
The helper reported serviceRoleInBrowser false.
The helper reported publicSignup false.
The helper is not mass-applied.

Password setup test result:

Logout Test worked.
Reset Password email was sent.
Reset email opened stream-bandit-password-setup-test-v7-13-001.html.
New password was entered twice and saved.
The page returned to stream-bandit-auth-gate-test-v7-13-001.html.
Signed-in approved proof still passed after password setup.

Login popup layout test result:

The login popup now starts at the top.
The banner is visible and no longer chopped off by the top of the viewport.
Only one usable scroll area remains.
Email, Password, Login, Reset Password and Logout are visible.
Login works with the new password.
This is the best-looking functional test login page so far.

Owner recovery path test result:

Logout Test worked.
The login gate opened.
Owner Recovery Link reloaded the page without trapping Trevor.
Show Gate State returned allowed true.
Show Gate State returned signedIn false.
Show Gate State returned reason owner-recovery-test-mode.
Show Gate State returned recoveryActive true.
Show Gate State returned locked false.
The helper reported serviceRoleInBrowser false.
The helper reported publicSignup false.
Owner recovery remains temporary test mode only and lasts about 30 minutes in the browser.

Index auth gate attachment test result:

index.html was upgraded to V7.13.020 for the first real-page auth gate test.
Signed-in Index opened normally.
Header Shell sign-out was tested without manual refresh.
The Stream Bandit login gate opened and stayed up after sign-out.
Login with the new password worked from the Index gate.
Index owner recovery URL worked: index.html?sb_owner_recovery=1.
Index remained the Platform Entry and did not replace Home.
Home was not touched during the Index test.

Home auth gate attachment test result:

home-global-helpers-v7-4-4-test.html was upgraded to V7.12.159 for the second real-page auth gate test.
Signed-in Home opened normally.
Header Shell sign-out was tested without manual refresh.
The Stream Bandit login gate opened instantly and stayed up after sign-out.
Login with the new password worked from the Home gate.
Home owner recovery URL worked: home-global-helpers-v7-4-4-test.html?sb_owner_recovery=1.
Home remained the Main App Home route and did not replace Index.
Index and Home are both passed for Phase 1 auth-gate attachment.

Library auth gate attachment test result:

library-global-helpers-v7-4-8-test.html was tested as the first controlled protected-page rollout after Index and Home passed.
The auth gate script was added after the shell config script only.
Signed-in Library opened.
Library loaded 23 movies.
The previous browser saved email/password autofill issue was reproduced and then fixed centrally by stream-bandit-auth-gate-v7-13-001.js V7.13.005.
The central helper now clears auth email/password values, removes the hidden auth gate DOM after approval, and guards search/filter/query inputs from browser email autofill.
Library search/filter rows no longer need a separate page-specific autofill patch for this rollout.
Reload Library works.
Details opens.
Play opens.
Continue Watching works.
Header Shell sign-out was tested without manual refresh.
The Stream Bandit login gate opened and stayed up after sign-out.
Login with password worked from the Library gate.
The Library auth gate and Library autofill fix are both considered passed.

Details auth gate attachment test result:

details-clean-machine-v7-12-38-test.html was tested after Home and Library passed.
The auth gate script was added after the shell config script only.
Details was upgraded to V7.12.174 Auth Gate Test.
Signed-in Details opened normally.
The Details page still reads the selected Supabase movie row.
Details tabs, Play button, save buttons, cast cards, source URLs, related movies, header/footer/theme/search and clean navigation remained preserved.
The same browser autofill issue appeared after attaching the gate, proving it was a central gate pattern rather than a Details page bug.
After the central V7.13.005 auth gate autofill guard was applied, the autofill issue was fixed.
Details auth gate is considered passed.

Player 1 auth gate attachment test result:

player-one-global-helpers-v7-3-3-test.html was upgraded to V7.12.269 Auth Gate Test.
The auth gate script was added after the shell config script only.
Signed-in Player 1 opened and the auth gate worked full pass.
Player 1 playback remained available for the current title.
Player/audio comfort remained preserved, including volume, fullscreen, Picture-in-picture and audio boost controls.
Mux/HLS/direct video, YouTube and Vimeo provider handling remained preserved.
Resume, watch history, save buttons, playback monitor and source bridge logic remained preserved.
The page is not considered a full page success yet because the Details link opens a random movie title instead of the current playing title.
The observed example was Doctor Strange playing, but Details opened a different/random movie instead of Doctor Strange.
This is not an auth/account blocker. It is a Player 1 Details-link/current-row routing bug to fix later.
Player 1 auth gate is considered passed; Player 1 Details link bug is logged for a later focused page fix.

Auth gate autofill guard test result:

stream-bandit-auth-gate-v7-13-001.js was upgraded to V7.13.005.
The helper now clears auth email/password values after approved login.
The helper removes the hidden auth gate DOM after approved login instead of only hiding it.
The helper hardens page search/filter/query inputs on auth-gated pages.
The helper clears browser-injected email-looking values from search/filter/query fields unless the page intentionally has a URL search query.
This fixed the autofill issue that appeared on Library and Details after attaching the gate.
The fix was central and did not require page-by-page search/filter patches.

Current visual asset note:

Trevor wants stream_bandit_original_running_stag_MASTER_1536x1024.png used on the login page and actual gate.
The test page references that filename.
The image asset is now visible on the auth gate test page.
The actual login popup crop fix has passed on the auth gate test page.
The owner recovery path has passed on the auth gate test page.
Index gate pass is complete.
Home gate pass is complete.
Library gate pass is complete.
Details gate pass is complete.
Player 1 gate pass is complete.
Auth gate autofill guard is complete.
Library browser autofill issue is fixed/ticked off by the central helper.
Player 1 Details link wrong-movie issue is logged for later.

Passed auth-gate attachment pages:

index.html
home-global-helpers-v7-4-4-test.html
library-global-helpers-v7-4-8-test.html
details-clean-machine-v7-12-38-test.html
player-one-global-helpers-v7-3-3-test.html

Do not apply to every page from Header Shell yet. Header Shell is global navigation and loads on mixed page families. Embedding the auth gate in Header Shell would silently mass-apply the gate to Web Builder, Owner, Admin, support and diagnostic pages before each route family is explicitly approved.

Library autofill issue

Status:

FIXED / TICKED OFF / CENTRAL AUTH GATE HELPER FIX PASSED / NO SEPARATE LIBRARY PAGE PATCH NEEDED FOR THIS ISSUE

Observed behavior before fix:

When Library opened, browser saved email/password data could autofill Trevor's email into the Library localSearch filter box.
This made the Library show 0 visible rows because it filtered 23 loaded movies by the email string.
Removing the email from the filter box immediately restored the Library rows.
The auth gate itself still worked correctly.

Passed fix direction:

The issue was fixed centrally in stream-bandit-auth-gate-v7-13-001.js V7.13.005.
The helper clears auth email/password values after approval.
The helper removes the hidden auth gate DOM after approval.
The helper guards search/filter/query inputs on auth-gated pages.
The helper clears browser-injected email-looking values from search/filter/query inputs unless a real URL search query exists.
Do not add page-by-page autofill patches unless a future page proves a separate failure.
Player 1 Details link issue for later focused fix

Status:

LOGGED / NOT AUTH BLOCKER / PLAYER 1 AUTH GATE PASSED / FIX LATER IN A DEDICATED PLAYER 1 DETAILS-LINK PASS

Observed behavior:

On Player 1, clicking Details can open a random movie title instead of the currently playing title.
The observed current playing title was Doctor Strange, but the Details link opened a different/random title.
This blocks full Player 1 page success but does not block the auth gate pass.

Later fix direction:

Make a dedicated Player 1 Details-link/current-row routing pass.
Use the complete full Player 1 HTML file as the base.
Do not touch auth gate helper for this issue.
Do not touch SQL, RLS, storage, payments or Header Shell mass injection.
Preserve playback, audio boost, source bridge, resume helper, watch history and save buttons.
Check that Details links use the currently resolved movie row id, not a fallback/latest/random row id.
Check route parameter handling for id and src combinations.
Check whether direct source override keeps the real movie id when building Details URLs.
Fix only the Details-link/current-row routing behavior once this item is selected for work.
Required rollout phases
1. Confirm this plan and lock gate scope. DONE.
2. Confirm existing admin/approved user password login works in Supabase Auth. DONE: password setup and post-reset signed-in approved proof passed.
3. Decide whether username login resolves to email, profile id, or remains email-only for phase one. PHASE ONE: email-only.
4. Design reset-password redirect path. DONE FOR TEST: reset points to password setup test page.
5. Build shared auth gate helper. DONE.
6. Attach only to index.html and Home. DONE: INDEX AND HOME PASSED.
7. Test login, logout and reset password. PASSED ON TEST PAGE, INDEX, HOME, LIBRARY, DETAILS AND PLAYER 1.
8. Test signed-out user cannot pass. PASSED ON TEST PAGE, INDEX, HOME, LIBRARY, DETAILS AND PLAYER 1.
9. Test signed-in admin/approved user can pass. PASSED ON TEST PAGE, INDEX, HOME, LIBRARY, DETAILS AND PLAYER 1.
10. Add owner emergency recovery path so Trevor is not locked out during testing. PASSED ON TEST PAGE, INDEX, HOME AND LIBRARY. DETAILS AND PLAYER 1 GATE PASSED; OWNER RECOVERY CAN BE RETESTED IF NEEDED.
11. Expand to protected pages only after the first two pages pass. STARTED: LIBRARY PASSED, DETAILS PASSED, PLAYER 1 AUTH GATE PASSED, AUTOFILL GUARD PASSED. PLAYER 1 DETAILS LINK ISSUE LOGGED FOR LATER.
12. Later decide Create Account mode: public, invite-only or owner-created only. NOT DONE.
Next controlled protected page rollout target
NEXT CONTROLLED PROTECTED PAGE ROLLOUT DECISION NEEDED

Next rollout rules:

Choose one protected page at a time.
Use the complete full HTML file as the base.
Attach the auth gate script after stream-bandit-shell-v6-24.js only.
Call StreamBanditAuthGate.enforce() safely from the page helper/status loop.
Update helper status to include Auth Gate.
Do not alter SQL, RLS, storage, payment, source playback, audio boost, accessibility/player comfort or Header Shell mass injection.
Do not fix unrelated page-specific issues during an auth-gate attachment pass unless the user explicitly approves that issue as the current target.
Security rule

Frontend gate improves user flow and blocks normal guest browsing, but real data protection still depends on Supabase Auth and RLS.

This gate phase does not approve:

SQL changes
RLS changes
Storage policy changes
Service-role key in browser
Payment activation
Public signup
Mass page rewrite
Header-shell auth-gate embedding

Any backend/RLS updates for private data protection require a separate backend/security pass.

11. Shell Bridge Follow-Up Fixes

Status:

11A PASSED / 11B ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION / NO BROAD SHELL MERGE APPROVED

These are approved master-plan notes from the fresh registry backup check. 11A has passed. 11B is accepted as safe because the dashboard is owner/admin-only, the theme bridge now works, and the extra header is visual debt rather than a functional user-facing defect.

11A. Web Builder Header/Footer Builder page Web Builder identity bridge

Status:

PASSED / LOCKED / CURRENT BLOCKER CLEARED

Original observed issue:

On the Web Builder Header/Footer page, the Web Builder global avatar was not showing.
The page also had no Web Builder Hub overlay.
It should show both.

Target area:

web-builder-header-footer-code-v7-12-254-test.html

Passed behavior:

Web Builder Header/Footer page now loads the Web Builder global projector bridge.
Web Builder Header/Footer page can show the Web Builder global avatar/account identity.
Web Builder Header/Footer page can use the Web Builder Hub overlay/rail access.
The old local builder rail is hidden only when the projector is active.
The page remains Web Builder-owned and was not converted into the Main App shell.
The fix preserves Header/Footer Builder editor logic and existing sb_site_pages.settings_json.web_builder_shell writes.

Implementation lock:

The passed fix is limited to loading web-builder-global-projector-v7-12-263.js and the active-projector local rail hide rule.
Do not rewrite the builder editor.
Do not merge the Main App header/footer shell into Web Builder.
Do not change SQL, RLS, storage, auth policy, Supabase schema, or production index behavior.

Process lesson:

The Stream Bandit Code Fix Machine helped complete this blocker by allowing safe paste/search/replace/full-output checking when connector file generation and patch tools were unreliable.
Preserve the Code Fix Machine as an Owner support helper.
11B. User Management Dashboard Main App theme/global bridge

Status:

ACCEPTED / OWNER-ONLY VISUAL EXCEPTION / DO NOT REWORK UNLESS FUNCTIONAL FAILURE APPEARS

Original observed issue:

User Management Dashboard did not have Main App shell global features.
User Management Dashboard did not have the theme bridge.
It should.

First test result:

The theme projector changed the page theme correctly and proved that theme projection can reach the page.
The full Header Shell visual injection produced an extra header layer.
The page is owner/admin-only, not normal user-facing public navigation.
Protected controls still remain the priority.

Accepted decision:

Leave the current User Management dashboard bridge in place if protected controls continue working.
Do not spend another pass moving headers around only for cosmetic reasons.
The extra header is accepted visual debt because this is an owner/admin-only page.
If Refresh Me, Load Users, Delete Requests, Audit, protected route gate or update overlays fail, reopen 11B as functional.
If only the visual extra header remains, do not patch further now.

Target area:

user-management-dashboard-v7-11-2-test.html

Implementation lock:

Do not alter owner/admin RPC, audit, deletion queue, role checks or protected page logic.
Do not alter SQL, RLS, storage, auth policy, Supabase schema or Edge Function behavior.
Do not change this page into a public user-facing page.
Do not pursue visual header perfection unless it blocks owner/admin work.

Retest checklist before marking any later cleanup necessary:

1. Page opens.
2. Theme bridge applies.
3. Refresh Me works.
4. Load Users works.
5. Delete Requests opens and reads queue.
6. Audit tab still reads when owner/admin allowed.
7. Update overlays still require exact selected ID/reason.
8. Admin/owner/platform-owner delete remains blocked.
12. Current final-scan decision
FINAL SCAN PASS COMPLETE.
MANIFEST UPDATED.
WEB BUILDER MAP UPDATED.
MASTER PLAN UPDATED.
FIX MEMORY UPDATED.
WHAT CHANGED UPDATED.
AUTH GATE FUTURE PHASE HELPER BUILT AND TEST PAGE CREATED.
AUTH GATE RESET PASSWORD AND PASSWORD SETUP TEST PASSED.
AUTH GATE SIGNED-IN APPROVED PROOF PASSED.
AUTH GATE LOGIN POPUP FULL VISUAL/FUNCTION TEST PASSED.
AUTH GATE OWNER EMERGENCY RECOVERY PATH PASSED ON TEST PAGE.
AUTH GATE INDEX ATTACHMENT AND SESSION-WATCH TEST PASSED.
AUTH GATE HOME ATTACHMENT AND SESSION-WATCH TEST PASSED.
AUTH GATE LIBRARY ATTACHMENT AND SESSION-WATCH TEST PASSED.
AUTH GATE DETAILS ATTACHMENT AND SESSION-WATCH TEST PASSED.
AUTH GATE PLAYER 1 ATTACHMENT AND SESSION-WATCH TEST PASSED.
AUTH GATE AUTOFILL GUARD PASSED.
LIBRARY BROWSER AUTOFILL FILTER ISSUE IS FIXED AND TICKED OFF BY CENTRAL AUTH GATE HELPER V7.13.005.
PLAYER 1 DETAILS LINK WRONG-MOVIE ISSUE IS LOGGED FOR LATER AND IS NOT AN AUTH BLOCKER.
AUTH GATE INDEX HOME LIBRARY DETAILS AND PLAYER 1 PHASE PASSED.
HEADER SHELL AUTH-GATE EMBEDDING IS NOT APPROVED YET.
NEXT STEP: DECIDE NEXT CONTROLLED PROTECTED PAGE, NOT MASS PAGE OR HEADER-SHELL INJECTION.
HEADER/FOOTER PROJECTOR BRIDGE PASSED AND LOCKED.
CODE FIX MACHINE OWNER SUPPORT TOOL APPROVED.
USER MANAGEMENT 11B THEME BRIDGE ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION.
NEXT WORK MUST START FROM THESE DOCS, NOT FROM OLD MENU CONFUSION.
