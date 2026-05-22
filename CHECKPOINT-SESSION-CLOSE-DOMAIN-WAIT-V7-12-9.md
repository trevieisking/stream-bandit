# Stream Bandit Checkpoint — Session Close / Domain Wait V7.12.9

Date: 2026-05-22

## Session status

Trevor is stopping for the evening while GitHub Pages custom domain DNS/HTTPS continues to settle.

## Important rule

Do not work around the account/login barrier.

Wait until the domain/HTTPS/Auth state is stable before spending more magic-link/login attempts.

## Current domain status

GitHub Pages custom domain/DNS/HTTPS is still pending/checking.

Safe action: wait.

Do not click random DNS/GitHub/IONOS settings while it is settling.

## Safe passed checkpoints from today

- Supabase schema scan passed for core tables.
- IONOS email was created and tested successfully.
- Supabase Auth redirect URLs were expanded for GitHub Pages and custom domain routes.
- V7.12.6 helper-status clarity test passed.
- V7.12.9 profile assets proof passed.

## Important non-passes / do not use as final proof

- V7.12.7 visual brand proof failed because the logo did not load correctly.
- V7.12.8 visual brand proof is not a valid pass because it used a GitHub-created test asset instead of the real Supabase app logo.

## Correct asset rules

Avatar = logged-in profile/account image.
Banner = profile/channel banner.
Brand logo = app/global logo from Supabase app settings logoUrl/logo.

## Current useful URLs

Profile assets proof:

```txt
profile-assets-proof-v7-12-9-test.html
```

Safe helper-status pass:

```txt
control-tower-footer-policy-previews-v7-12-6-test.html
```

## Next session plan

1. Check GitHub Pages custom domain DNS/HTTPS status.
2. Wait for successful DNS/HTTPS before login testing.
3. Do one careful Supabase magic-link test only when stable.
4. Re-test account/profile/avatar/theme on the custom domain.
5. Use real Supabase app settings logoUrl/logo for any brand-logo proof.
6. No live/index promotion until tests pass.

## Safety

No Supabase SQL was run.
No Supabase rows were edited.
No RLS policies were changed.
No live/index promotion.
