# Stream Bandit Master Must-Follow Plan V7.13.074

Date: 2026-06-21

Status: MASTER GOVERNING PLAN / FINAL SCAN PASS INCORPORATED / FUTURE AUTH GATE PLAN ADDED / HEADER FOOTER PROJECTOR BRIDGE PASSED / CODE FIX MACHINE OWNER SUPPORT TOOL ADDED / USER MANAGEMENT 11B ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION / AUTH GATE HELPER PASSWORD SETUP LOGIN POPUP OWNER RECOVERY INDEX SESSION WATCH HOME SESSION WATCH AND LIBRARY SESSION WATCH TEST PASSED / INDEX HOME AND LIBRARY AUTH GATE PASSED / LIBRARY BROWSER AUTOFILL FILTER ISSUE LOGGED AS LATER SPECIFIC FIX / NEXT CONTROLLED PROTECTED PAGE ROLLOUT DECISION NEEDED / MUST FOLLOW BEFORE FUTURE PAGE OR SCHEMA WORK

Purpose: this document is the project-level source plan for Stream Bandit after the full beginning-to-end scan pass. It records what the scan taught us, what is now locked, what stays separate, and what must happen before any future page, shell, registry, Web Builder, Owner, Admin, Social, User Management, storage, payment, database, authentication-gate or shell-bridge work.

This is a source-of-truth planning document. It records the passed Header/Footer projector bridge, the approved Owner-only Code Fix Machine support helper, the accepted User Management owner-only visual exception, the auth gate helper/password setup/login-popup proof, the owner recovery path pass, the first real Index auth-gate session-watch pass, the first real Home auth-gate session-watch pass, and the first controlled Library auth-gate session-watch pass. The Library pass has one non-blocking browser-autofill issue: saved browser email/password data may still autofill the Library filter/search box on initial page load. Removing the autofilled email restores the 23 movie rows and the auth-gate flow passes. This autofill behavior is logged for a later specific Library/autofill isolation fix and must not be mixed into the current auth-gate rollout pass. This plan does not approve SQL, RLS changes, storage policy changes, payment activation, DNS automation, production Home replacement, broad shell merging, broad auth-gate rollout, header-shell auth-gate embedding, or any additional shell-bridge rollout beyond specific tested safe passes.

## 1. What the full scan taught us

Stream Bandit is no longer one flat pile of test pages. It is now a platform with clear route families:

```text
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
```

The main lesson is this:

```text
Most confusion came from old support routes still being visible, not from the current app being broken.
```

Therefore the correct repair pattern is:

```text
SCAN
MAP
LOCK
PATCH ONLY WHAT FAILS
HIDE OR CANONICALIZE OLD SUPPORT ROUTES
DO NOT DELETE USEFUL OLD PAGES BLINDLY
FULL-PAGE REPLACE ONLY WHEN PATCHING IS UNSAFE
IF IT WORKS AND IS OWNER-ONLY, ACCEPT SMALL VISUAL DEBT INSTEAD OF RISKING PROTECTED LOGIC
```

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

### Main App stays Main App

Main App owns:

```text
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
```

Main App Home remains:

```text
home-global-helpers-v7-4-4-test.html
```

`index.html` remains the Platform Entry, not a replacement for Home.

### Web Builder stays Web Builder

Web Builder owns:

```text
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
```

Current Web Builder user-facing route map:

```text
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
```

Old Web Builder pages can remain as hidden support/compatibility witnesses. They should not be exposed as the normal user route if a current owned page exists.

## 4. Owner group lesson

Owner is not a normal public-navigation group. It is a management/proof/diagnostic group.

The scan taught us that Owner visibility was causing confusion because old Web Builder support pages were still visible there. The fix is not deletion. The fix is to keep Owner lean.

Owner menu should currently expose only:

```text
Form Inbox
One Machine
Code Fix Machine
Platform Control Centre
Final Shell Navigation
Brand / App Icons
Brand Image Helper
Favicon / App Icon Builder
```

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

```text
User Management Dashboard
-> user-management-dashboard-v7-11-2-test.html

Feature Shop / Pricing
-> plans-pricing-feature-shop-v7-11-3-test.html

Permissions Inspector
-> permissions-matrix-user-management-v7-11-4-test.html
```

Rules:

- User Management Dashboard is protected owner/admin control work.
- Feature Shop / Pricing is preview-only. It has no payment provider, no billing, no upgrades and no entitlement writes.
- Permissions Inspector is read-only. It has no writes, no billing and no role changes.

## 6. Social lesson

Social pages are real working pages and must not be blind-patched.

Current Social group:

```text
Social Profile
-> profile-social-v7-13-001-test.html

Friends
-> friends-social-v7-13-001-test.html

News Feed
-> news-feed-social-v7-13-001-test.html

Groups and Events
-> groups-social-v7-13-001-test.html
```

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

```text
Admin Centre
Live Readiness
Current Routes Registry
Test Checklist
Tools
Health Check
Mux Manager
Storage Prep
Backup / Safety
```

Rules:

- Do not rewrite Admin proof pages just to update version labels.
- Storage Prep remains controlled and scoped.
- Registry/Live Readiness/Health/Checklist are proof surfaces.

## 8. Route cleanup rule

Never delete an old page only because it is old.

Use this rule:

```text
Old link found
-> decide whether it is normal user navigation or diagnostic/support evidence
-> normal user navigation uses current canonical route
-> diagnostic/support can keep old witness route if useful
-> patch only if user confusion or broken flow is proven
-> verify by direct GitHub fetch and browser smoke test
```

## 9. Protected boundaries

No future pass may touch these without explicit separate approval:

```text
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
```

Publishable Supabase config must remain config-only and must not be copied into docs or exposed as a secret.

## 10. Future Phase: Proper Supabase Sign-In Gate / No Guest Users

Status:

```text
HELPER BUILT / TEST PAGE CREATED / RESET PASSWORD FLOW PASSED / PASSWORD SETUP TEST PASSED / SIGNED-IN APPROVED PROOF PASSED / SIGNED-OUT GATE APPEARS / LOGIN POPUP FULLY VISIBLE PASSED / LOGIN WITH NEW PASSWORD PASSED / OWNER RECOVERY PATH PASSED / INDEX AUTH GATE SESSION WATCH PASSED / HOME AUTH GATE SESSION WATCH PASSED / LIBRARY AUTH GATE SESSION WATCH PASSED / INDEX HOME AND LIBRARY AUTH GATE PASSED / LIBRARY BROWSER AUTOFILL FILTER ISSUE LOGGED FOR LATER / NEXT CONTROLLED PROTECTED PAGE ROLLOUT DECISION NEEDED
```

Goal:

Build a proper Stream Bandit sign-in gate that blocks guest users from the app until they are signed in through Supabase Auth. This should replace casual guest browsing with a controlled login-first experience.

The gate is a controlled phase. It is not approved as a broad shell rewrite or mass page edit.

### Gate experience requirements

The gate should show:

```text
Stream Bandit logo
Welcome to Stream Bandit
Email or username field
Password field
Login button
Logout button
Create Account button or section
Reset Password flow
Existing admin/approved users only message until signup rules are approved
```

Behavior requirements:

```text
No guest users through the main app.
Signed-out users stay on the gate.
Signed-out users cannot interact with app pages behind the gate.
Signed-in users can enter only after Supabase session is confirmed.
Create Account remains disabled, invite-only or controlled until public signup is explicitly approved.
Magic/reset links only help existing Supabase Auth users and do not create approved profiles by themselves.
```

### Technical direction

Use Supabase Auth email/password login as the core method:

```text
signInWithPassword
signOut
resetPasswordForEmail
```

Username login is allowed only after a safe design is chosen. Username login may require a profile lookup before sign-in, but this must not expose private emails, create a weak bypass, or leak account existence in a careless way.

Password readiness must be checked before building the gate. Existing admin users must have password login enabled in Supabase Auth, otherwise email/password login will fail even if the gate is coded correctly.

Reset password needs a safe redirect flow so the user lands back on Stream Bandit after setting a new password.

### Built helper

```text
stream-bandit-auth-gate-v7-13-001.js
```

Current test page:

```text
stream-bandit-auth-gate-test-v7-13-001.html
```

Password setup test page:

```text
stream-bandit-password-setup-test-v7-13-001.html
```

Current auth gate test result:

```text
The test page loaded the auth gate helper.
Signed-in session was detected.
Current owner/admin/platform-owner profile was approved through sb_profiles.
Decision returned allowed true.
Reason returned signed-in-approved.
The helper reported serviceRoleInBrowser false.
The helper reported publicSignup false.
The helper is not mass-applied.
```

Password setup test result:

```text
Logout Test worked.
Reset Password email was sent.
Reset email opened stream-bandit-password-setup-test-v7-13-001.html.
New password was entered twice and saved.
The page returned to stream-bandit-auth-gate-test-v7-13-001.html.
Signed-in approved proof still passed after password setup.
```

Login popup layout test result:

```text
The login popup now starts at the top.
The banner is visible and no longer chopped off by the top of the viewport.
Only one usable scroll area remains.
Email, Password, Login, Reset Password and Logout are visible.
Login works with the new password.
This is the best-looking functional test login page so far.
```

Owner recovery path test result:

```text
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
```

Index auth gate attachment test result:

```text
index.html was upgraded to V7.13.020 for the first real-page auth gate test.
Signed-in Index opened normally.
Header Shell sign-out was tested without manual refresh.
The Stream Bandit login gate opened and stayed up after sign-out.
Login with the new password worked from the Index gate.
Index owner recovery URL worked: index.html?sb_owner_recovery=1.
Index remained the Platform Entry and did not replace Home.
Home was not touched during the Index test.
```

Home auth gate attachment test result:

```text
home-global-helpers-v7-4-4-test.html was upgraded to V7.12.159 for the second real-page auth gate test.
Signed-in Home opened normally.
Header Shell sign-out was tested without manual refresh.
The Stream Bandit login gate opened instantly and stayed up after sign-out.
Login with the new password worked from the Home gate.
Home owner recovery URL worked: home-global-helpers-v7-4-4-test.html?sb_owner_recovery=1.
Home remained the Main App Home route and did not replace Index.
Index and Home are both passed for Phase 1 auth-gate attachment.
```

Library auth gate attachment test result:

```text
library-global-helpers-v7-4-8-test.html was tested as the first controlled protected-page rollout after Index and Home passed.
The auth gate script was added after the shell config script only.
Signed-in Library opened.
Library loaded 23 movies.
Browser saved email/password autofill can still place Trevor's email into the Library local filter/search input on initial page load.
When the autofilled email is removed from the filter/search input, all 23 Library rows reappear.
Reload Library works after clearing the autofilled filter value.
Details opens after clearing the autofilled filter value.
Play opens after clearing the autofilled filter value.
Continue Watching works.
Header Shell sign-out was tested without manual refresh.
The Stream Bandit login gate opened and stayed up after sign-out.
Login with password worked from the Library gate.
The Library auth gate itself is considered passed.
The remaining browser-autofill filter issue is not a gate blocker and is logged for a later specific Library/autofill isolation fix.
Do not mix the autofill fix into the broad auth-gate rollout pass.
```

Current visual asset note:

```text
Trevor wants stream_bandit_original_running_stag_MASTER_1536x1024.png used on the login page and actual gate.
The test page references that filename.
The image asset is now visible on the auth gate test page.
The actual login popup crop fix has passed on the auth gate test page.
The owner recovery path has passed on the auth gate test page.
Index gate pass is complete.
Home gate pass is complete.
Library gate pass is complete with a non-blocking browser-autofill filter issue logged for later.
```

Passed auth-gate attachment pages:

```text
index.html
home-global-helpers-v7-4-4-test.html
library-global-helpers-v7-4-8-test.html
```

Do not apply to every page from Header Shell yet. Header Shell is global navigation and loads on mixed page families. Embedding the auth gate in Header Shell would silently mass-apply the gate to Web Builder, Owner, Admin, support and diagnostic pages before each route family is explicitly approved.

### Library autofill issue for later specific fix

Status:

```text
LOGGED / NON-BLOCKING FOR AUTH GATE PASS / FIX LATER IN A DEDICATED LIBRARY AUTOFILL PASS
```

Observed behavior:

```text
When Library opens, browser saved email/password data may autofill Trevor's email into the Library localSearch filter box.
This makes the Library show 0 visible rows because it is filtering 23 loaded movies by the email string.
Removing the email from the filter box immediately restores the Library rows.
The auth gate still works correctly.
```

Later fix direction:

```text
Make a dedicated Library autofill isolation pass.
Use the complete full Library HTML file as the base.
Do not use truncated GitHub output for HTML/JS edits.
Consider a delayed clear of localSearch after browser autofill fires.
Consider using a less login-like input name and hidden decoy fields if needed.
Consider checking document.activeElement before clearing so genuine user searches are not erased.
Do not mix this fix into auth gate rollout unless it becomes a blocker.
```

### Required rollout phases

```text
1. Confirm this plan and lock gate scope. DONE.
2. Confirm existing admin/approved user password login works in Supabase Auth. DONE: password setup and post-reset signed-in approved proof passed.
3. Decide whether username login resolves to email, profile id, or remains email-only for phase one. PHASE ONE: email-only.
4. Design reset-password redirect path. DONE FOR TEST: reset points to password setup test page.
5. Build shared auth gate helper. DONE.
6. Attach only to index.html and Home. DONE: INDEX AND HOME PASSED.
7. Test login, logout and reset password. PASSED ON TEST PAGE, INDEX, HOME AND LIBRARY.
8. Test signed-out user cannot pass. PASSED ON TEST PAGE, INDEX, HOME AND LIBRARY.
9. Test signed-in admin/approved user can pass. PASSED ON TEST PAGE, INDEX, HOME AND LIBRARY.
10. Add owner emergency recovery path so Trevor is not locked out during testing. PASSED ON TEST PAGE, INDEX AND HOME. LIBRARY GATE TEST PASSED; OWNER RECOVERY CAN BE RETESTED IF NEEDED.
11. Expand to protected pages only after the first two pages pass. STARTED: LIBRARY PASSED WITH NON-BLOCKING AUTOFILL ISSUE LOGGED.
12. Later decide Create Account mode: public, invite-only or owner-created only. NOT DONE.
```

### Security rule

Frontend gate improves user flow and blocks normal guest browsing, but real data protection still depends on Supabase Auth and RLS.

This gate phase does not approve:

```text
SQL changes
RLS changes
Storage policy changes
Service-role key in browser
Payment activation
Public signup
Mass page rewrite
Header-shell auth-gate embedding
```

Any backend/RLS updates for private data protection require a separate backend/security pass.

## 11. Shell Bridge Follow-Up Fixes

Status:

```text
11A PASSED / 11B ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION / NO BROAD SHELL MERGE APPROVED
```

These are approved master-plan notes from the fresh registry backup check. 11A has passed. 11B is accepted as safe because the dashboard is owner/admin-only, the theme bridge now works, and the extra header is visual debt rather than a functional user-facing defect.

### 11A. Web Builder Header/Footer Builder page Web Builder identity bridge

Status:

```text
PASSED / LOCKED / CURRENT BLOCKER CLEARED
```

Original observed issue:

```text
On the Web Builder Header/Footer page, the Web Builder global avatar was not showing.
The page also had no Web Builder Hub overlay.
It should show both.
```

Target area:

```text
web-builder-header-footer-code-v7-12-254-test.html
```

Passed behavior:

```text
Web Builder Header/Footer page now loads the Web Builder global projector bridge.
Web Builder Header/Footer page can show the Web Builder global avatar/account identity.
Web Builder Header/Footer page can use the Web Builder Hub overlay/rail access.
The old local builder rail is hidden only when the projector is active.
The page remains Web Builder-owned and was not converted into the Main App shell.
The fix preserves Header/Footer Builder editor logic and existing sb_site_pages.settings_json.web_builder_shell writes.
```

Implementation lock:

```text
The passed fix is limited to loading web-builder-global-projector-v7-12-263.js and the active-projector local rail hide rule.
Do not rewrite the builder editor.
Do not merge the Main App header/footer shell into Web Builder.
Do not change SQL, RLS, storage, auth policy, Supabase schema, or production index behavior.
```

Process lesson:

```text
The Stream Bandit Code Fix Machine helped complete this blocker by allowing safe paste/search/replace/full-output checking when connector file generation and patch tools were unreliable.
Preserve the Code Fix Machine as an Owner support helper.
```

### 11B. User Management Dashboard Main App theme/global bridge

Status:

```text
ACCEPTED / OWNER-ONLY VISUAL EXCEPTION / DO NOT REWORK UNLESS FUNCTIONAL FAILURE APPEARS
```

Original observed issue:

```text
User Management Dashboard did not have Main App shell global features.
User Management Dashboard did not have the theme bridge.
It should.
```

First test result:

```text
The theme projector changed the page theme correctly and proved that theme projection can reach the page.
The full Header Shell visual injection produced an extra header layer.
The page is owner/admin-only, not normal user-facing public navigation.
Protected controls still remain the priority.
```

Accepted decision:

```text
Leave the current User Management dashboard bridge in place if protected controls continue working.
Do not spend another pass moving headers around only for cosmetic reasons.
The extra header is accepted visual debt because this is an owner/admin-only page.
If Refresh Me, Load Users, Delete Requests, Audit, protected route gate or update overlays fail, reopen 11B as functional.
If only the visual extra header remains, do not patch further now.
```

Target area:

```text
user-management-dashboard-v7-11-2-test.html
```

Implementation lock:

```text
Do not alter owner/admin RPC, audit, deletion queue, role checks or protected page logic.
Do not alter SQL, RLS, storage, auth policy, Supabase schema or Edge Function behavior.
Do not change this page into a public user-facing page.
Do not pursue visual header perfection unless it blocks owner/admin work.
```

Retest checklist before marking any later cleanup necessary:

```text
1. Page opens.
2. Theme bridge applies.
3. Refresh Me works.
4. Load Users works.
5. Delete Requests opens and reads queue.
6. Audit tab still reads when owner/admin allowed.
7. Update overlays still require exact selected ID/reason.
8. Admin/owner/platform-owner delete remains blocked.
```

## 12. Current final-scan decision

```text
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
LIBRARY BROWSER AUTOFILL FILTER ISSUE IS LOGGED AS NON-BLOCKING AND MUST BE FIXED LATER IN A DEDICATED LIBRARY AUTOFILL PASS.
AUTH GATE INDEX HOME AND LIBRARY PHASE PASSED.
HEADER SHELL AUTH-GATE EMBEDDING IS NOT APPROVED YET.
NEXT STEP: DECIDE NEXT CONTROLLED PROTECTED PAGE, NOT MASS PAGE OR HEADER-SHELL INJECTION.
HEADER/FOOTER PROJECTOR BRIDGE PASSED AND LOCKED.
CODE FIX MACHINE OWNER SUPPORT TOOL APPROVED.
USER MANAGEMENT 11B THEME BRIDGE ACCEPTED WITH OWNER-ONLY VISUAL EXCEPTION.
NEXT WORK MUST START FROM THESE DOCS, NOT FROM OLD MENU CONFUSION.
```
