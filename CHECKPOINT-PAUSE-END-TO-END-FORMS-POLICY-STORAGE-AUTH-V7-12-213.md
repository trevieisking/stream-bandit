# Stream Bandit Checkpoint — Pause / End-to-End Forms + Policy + Storage + Auth V7.12.213

Date: 2026-06-03

## Status

STRONG PAUSE POINT / MAJOR SUCCESS DAY.

This checkpoint records the current rollback point after a large successful pass across account access, policy editing, storage image URLs, Form Inbox, private messages and Advanced Form submission flow.

## Current stable mindset

The app is still private until deliberately opened.

Current rule:

- existing known account access only,
- no public signup from Profile/global shell,
- no destructive backend actions from frontend toys,
- preserve working Supabase logic,
- make pages useful without casually rebuilding working engines.

## Major work completed today

### 1. Profile Settings sign-out and private-auth lock

Route:

- `profile-settings-live-ready-v7-12-90-test.html`

Current internal state:

- V7.12.208

Completed:

- clear Sign Out button added,
- Profile Settings still loads current profile,
- Save Text still works,
- Avatar editor opens,
- Banner editor opens,
- magic-link flow changed to existing-users-only,
- public self-signup from Profile is blocked,
- Create button clarified as missing profile-row creation, not account creation.

Confirmed by user before final lock:

- Profile Settings opens,
- header appears,
- footer appears once,
- saved counters show,
- signed-in email displays,
- Sign Out button visible,
- Load Profile works,
- Save Text works,
- magic-link sign-in/sign-out worked in private window,
- avatar editor opens,
- banner editor opens,
- debug proved dangerous account actions are not present.

### 2. Profile Sign-In Bridge locked

File:

- `stream-bandit-profile-signin-v7-12-156.js`

Current internal state:

- V7.12.208

Completed:

- old bridge magic-link path was also locked to existing users only,
- bridge avoids duplicating native Profile page controls,
- bridge can still provide account controls where needed.

### 3. Global Account Panel added to new Header Shell

File:

- `stream-bandit-header-shell-v7-12-156.js`

Current internal state:

- V7.12.211 Header Shell / Global Account Panel

Commit:

- `e9283f70db3e2a2a4be300b07607887a0e3f0ae5`

Completed:

- Account chip in global header now opens account panel,
- current account/profile details show,
- Refresh account works,
- Profile Settings link works,
- Sign Out button visible globally,
- Menu still opens,
- Search still works,
- watchlist/favourites/likes counters still show,
- public account creation remains closed.

User test result:

- PASS.

Minor note:

- account panel side/position can feel different from the main menu drawer on some screen widths.
- user is happy to leave it because it works.

### 4. Policy Admin Editor Centre restored

Route:

- `policy-admin-documents-v7-12-120-test.html?policy=terms`

Current internal state:

- V7.12.210 Policy Admin Editor Centre

Commit:

- `9e3403d0c716b9cd463505bacd4f0934d5df1350`

Completed:

- editor/publisher flow restored,
- Save as Draft restored,
- Publish Selected Policy restored,
- Archive restored,
- Create Missing Defaults restored,
- Public Reader link restored,
- Policy Centre link restored,
- admin check retained,
- current shell helpers added,
- footer shell added,
- saved counters included.

User test result:

- signed in as admin: PASS,
- page opens: PASS,
- header appears: PASS,
- footer appears once: PASS,
- saved counters show: PASS,
- admin check passes: PASS,
- editor unlocks: PASS,
- Terms loads first: PASS,
- document list appears: PASS,
- Save as Draft works: PASS,
- Publish Selected Policy works: PASS,
- Archive works: PASS,
- Public Reader opens selected policy: PASS,
- Policy Centre opens: PASS.

Important distinction fixed:

- Storage Prep policy/rule edits are different from Policy Document Admin editing.
- Policy Admin is meant to remain usable for the owner/admin.

### 5. Storage Prep upgraded into useful image URL workshop

Route:

- `storage-prep-global-helpers-v7-10-8-test.html`

Current internal state:

- V7.12.209 Storage Prep / Image URL Workshop

Commit:

- `6874bedcbc6ad768cbdfa58a8e7ab5a6d7b6df07`

Completed:

- current shell helpers,
- image preview,
- PNG/JPEG/WEBP validation,
- 50 MB limit note,
- signed-in image upload to existing image bucket,
- public URL creation,
- URL copy,
- image URL tester,
- local browser upload history,
- copy history,
- danger zone added.

Still locked:

- no bucket creation,
- no storage rule editing,
- no deletes,
- no video uploads,
- no movie/profile/channel/page row patching,
- no live promotion.

User result:

- Storage Prep passing after being signed in fully.

Purpose confirmed:

- help the user turn images into public URLs without manually working out Supabase Storage paths.

### 6. Form Inbox + Private Messages refit and pass

Route:

- `web-builder-form-submissions-v7-12-94-test.html?page=test-page`

Current internal state:

- V7.12.212 Form Inbox + Private Messages

Commit:

- `8fd1dcf20c64618a6247e4bf5aeb8ed7d6dc5ee7`

Checkpoint:

- `CHECKPOINT-FORM-INBOX-PRIVATE-MESSAGES-PASS-V7-12-212.md`
- Commit: `a15c958a6187caad5b086b8faa4f72749640ce62`

Preserved real Supabase logic:

- form submission loading,
- answers display,
- status update new/read/archived,
- CSV export,
- private reply to form submission,
- private message insert,
- new private message,
- sent/outbox,
- spam,
- trash,
- restore,
- soft delete for me,
- raw JSON modal.

Updated:

- Header Shell,
- Footer Shell,
- Theme Projector,
- saved counters,
- global account panel support through header,
- current Builder route,
- current Advanced Form route,
- current Published Preview route,
- clearer safety/usefulness wording,
- debug proof fields.

User test result:

- Open Form Inbox: PASS,
- header appears: PASS,
- footer appears once: PASS,
- saved counters show: PASS,
- page slug is `test-page`: PASS,
- submissions load: PASS,
- stats show rows/new/read/archived/messages: PASS,
- select submission: PASS,
- answers show: PASS,
- copy answers works: PASS,
- raw JSON opens/closes: PASS,
- mark read works: PASS,
- mark new works: PASS,
- archive works: PASS,
- reply privately works: PASS,
- messages load: PASS,
- sent/outbox opens: PASS,
- inbox/spam/trash tabs open: PASS,
- new private message composer opens: PASS,
- search answers works: PASS,
- export CSV works: PASS,
- safety debug fields false: PASS.

Current judgement:

- Functional pass.
- Needs major tidy/polish later.
- Do not casually rebuild the working logic again.
- Future work should be layout/control-flow polish only unless a specific bug appears.

### 7. Advanced Form refit and end-to-end pass

Route:

- `web-builder-form-save-v7-12-94-test.html?page=test-page`

Current internal state:

- V7.12.213 Advanced Form

Commit:

- `5a1650b7e3175449e0b8d5cfc6b32655a0f94c11`

Checkpoint:

- `CHECKPOINT-ADVANCED-FORM-END-TO-END-PASS-V7-12-213.md`
- Commit: `456924822de5c28673dfbd8741184f92ac24f028`

Preserved real logic:

- loads page from `sb_site_pages`,
- finds form block inside `layout_json`,
- renders questions,
- supports short/email/phone/date/url/number fields,
- supports long text,
- supports multiple choice/radio,
- supports checkboxes,
- supports dropdown/select,
- supports yes/no,
- supports image upload answers,
- saves one complete row into `sb_form_submissions`,
- `answers_json` feeds Form Inbox,
- submitter email captured from signed-in user or answer email.

Updated:

- Header Shell,
- Footer Shell,
- Theme Projector,
- saved counters,
- current Builder route,
- current Form Inbox route,
- current Published Preview route,
- clearer submission pipeline,
- clearer safety notes,
- debug proof fields.

User test result:

- Open Advanced Form: PASS,
- header appears: PASS,
- footer appears once: PASS,
- saved counters show: PASS,
- page slug is `test-page`: PASS,
- form loads: PASS,
- questions appear: PASS,
- required fields show: PASS,
- fill form: PASS,
- Submit Form works: PASS,
- Submission result shows saved row: PASS,
- Open Form Inbox: PASS,
- new row appears there: PASS,
- answers show correctly in Inbox: PASS,
- image question upload creates URL when applicable: PASS,
- stable safety fields false: PASS.

Important debug note:

- The debug heartbeat can later show `writesSubmissions: false` and `lastSubmit: null` after the live page state changes.
- This is not treated as a functional fail because the new row appeared in Form Inbox and the answers displayed correctly.
- Future polish: store last successful submit marker more clearly.

## Current confirmed working chains

### Account access chain

- global Account panel opens,
- current account/profile shows,
- Profile Settings opens,
- Sign Out button visible,
- no public account opening from Profile/global shell.

### Policy chain

- Policy Centre opens,
- Policy Admin Editor opens for owner/admin,
- policy rows can be edited/saved/published/archived,
- Public Reader opens selected policy.

### Storage image URL chain

- Storage Prep previews image,
- uploads signed-in image to image bucket,
- creates public URL,
- URL can be copied/tested.

### Form chain

- Advanced Form loads form block from `sb_site_pages`,
- submission saves to `sb_form_submissions`,
- Form Inbox loads the new submission,
- answers display correctly,
- private reply/message tools work.

## Known polish notes

- Form Inbox is functional but visually/control-flow messy.
- Advanced Form debug should remember last successful submit more clearly.
- Global Account panel position can feel different from main menu overlay on some screen widths.
- Future polish should project global controls around working logic rather than moving/breaking page engines.

## Architecture lesson confirmed

For dangerous real-data pages, use this pattern:

- Header Shell
- proven page-specific Supabase logic
- Footer Shell
- Theme Projector
- optional page polish helper later

Do not move working data logic out of the page unless there is a deliberate helper migration plan.

## Best next candidates after pause

1. Form Inbox layout/control-page polish later, but not immediately.
2. Continue Owner/Admin pages one at a time.
3. Pages Manager may be next, but it is risky and should be scanned before any work.
4. Backup / Safety or Health Check are safer candidates if a lighter next pass is desired.
5. Web Builder remains very fragile and should not be touched casually.

## Do not casually edit next

- Web Builder publish logic,
- Pages Manager,
- Supabase Library Editor/movie rows,
- Player 2,
- Form Inbox real message writes,
- Advanced Form submission pipeline,
- Policy Admin save/publish logic,
- auth/global account logic,
- schema/RLS/storage rules.

## Current rollback statement

This is a strong pause point.

The platform now has several real owner/admin workflows functioning again:

- Account access,
- Policy editing/publishing,
- image URL workshop,
- form submission,
- form inbox/private messages.

Continue later from this checkpoint, one page or group at a time.
