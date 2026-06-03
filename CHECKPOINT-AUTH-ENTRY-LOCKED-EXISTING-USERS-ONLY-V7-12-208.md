# Stream Bandit Checkpoint — Auth Entry Locked Existing Users Only V7.12.208

Date: 2026-06-03

## Status

PASS / AUTH ENTRY LOCKED.

This checkpoint records the sign-in/sign-out side quest and the public signup safety lock.

## Goal

Keep Stream Bandit private until launch-ready.

Current desired behaviour:

- existing users can sign in,
- existing users can sign out,
- unknown public visitors should not be able to create Auth accounts from the Profile page,
- dangerous account actions remain locked,
- the app stays safe while it is still a private toy/prototype.

## Files updated

### Profile Settings

- `profile-settings-live-ready-v7-12-90-test.html`
- Current internal state: V7.12.208

Profile now includes:

- clear Sign Out button,
- existing-user-only magic-link sign-in,
- `shouldCreateUser: false`,
- public signup wording locked,
- Load Profile,
- Save Text,
- Avatar/Banner editors,
- Create Missing Profile Row for already signed-in existing Auth users only,
- Spare Test Guide,
- debug proof fields.

### Profile Sign-In Bridge

- `stream-bandit-profile-signin-v7-12-156.js`
- Current internal state: V7.12.208

Reason for update:

The old bridge still had magic-link code without the existing-user-only lock. It has now been updated so it also uses:

```js
shouldCreateUser: false
```

The bridge also avoids duplicating the native Profile page account panel when the V7.12.208 Profile page already has its own controls.

## Confirmed user test before final lock

User confirmed Profile Settings V7.12.207 worked:

- Open Profile Settings: PASS
- Header appears: PASS
- Footer appears once: PASS
- Saved counters show: PASS
- Signed-in email displays: PASS
- Sign Out button visible: PASS
- Load Profile works: PASS
- Save Text works: PASS
- Magic links tested in private window: PASS
- Sign in/out flow works: PASS
- Avatar editor opens: PASS
- Banner editor opens: PASS
- Debug shows `authAdmin: false` and `realDelete: false`: PASS

## V7.12.208 security correction

The user clarified they want sign-in/sign-out only right now, not public account creation.

Important Supabase behaviour:

- magic-link sign-in can create users by default if signup is enabled,
- setting `shouldCreateUser: false` prevents this page from creating new Auth users.

Applied correction:

- Profile Settings magic-link call now uses `shouldCreateUser: false`.
- Profile Sign-In Bridge magic-link call now uses `shouldCreateUser: false`.
- UI text now says existing users only.
- Create button wording now says Create Missing Profile Row, not Create Account.

## Current safety state

Auth entry state:

- existing-user sign-in: allowed
- sign-out: allowed
- public self-signup from Profile page: blocked
- Auth Admin creation: not present
- Auth Admin delete: not present
- service-role key in frontend: not present
- role promotion from Profile: not present
- billing: not present

## Important caveat

This locks the Profile page and the profile sign-in bridge. Before public launch, a wider scan should still be performed for any future/old auth entry code if new auth pages are added.

## Current private prototype rule

Stream Bandit remains private until deliberately opened.

Useful toys are allowed, but dangerous actions must either be:

- locked,
- warning-only,
- local simulation only,
- or backend/RLS controlled later.

## Decision

Auth side quest is complete enough to continue main flow.

Next steps can return to app polish / user-management / Supabase connection work without worrying that Profile is silently creating public users.
