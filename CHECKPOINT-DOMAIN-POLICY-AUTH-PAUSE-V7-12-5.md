# Stream Bandit Checkpoint — Domain Connected / Policy Preview Pause V7.12.5

Date: 2026-05-22

## Current safe status

The custom domain is now reaching Stream Bandit over HTTP:

- `http://chatterfriendsstreambandit.co.uk/`

GitHub Pages still shows HTTPS / DNS certificate checks in progress. Do not force anything while that settles.

## DNS / domain notes

IONOS DNS has been set for GitHub Pages:

- four root A records for GitHub Pages
- one `www` CNAME to `trevieisking.github.io`
- mail records were preserved

The repository still has the root `CNAME` file for the custom domain.

## Current page being tested

Footer policy route checker:

- `control-tower-footer-policy-previews-v7-12-5-test.html`

V7.12.5 fixed the page direction by restoring a fuller top shell/header, search and avatar hook.

## Test result so far

Safe logged-out checks are okay:

- page loads
- global helper scripts show loaded
- footer preview route scan works
- route scan finds 6/6
- read-only safety is preserved

## Pending issue

Full global property testing is pending because the user was logged out during the custom-domain transition.

Pending until HTTPS/Supabase auth redirect is settled:

- magic-link login should return to the same page
- account/avatar should show correctly on the custom domain
- user's saved global theme/profile state should display exactly like the older stable helper pages

Do not spend the last magic-link attempt while the domain/auth setup is still settling.

## Design note from Trevor

Global helper display should be closer to the older helper status style used on pages like the Home helper page:

- Account sync loaded
- Avatar helper loaded
- Shared style loaded
- Settings bridge loaded safely with source

## Recommended next actions

1. Treat V7.12.5 as a safe checkpoint, not a full pass yet.
2. Pause full login/avatar/theme tests until HTTPS and auth redirects are ready.
3. Keep working on read-only checks or non-auth tasks.
4. Possible next focus areas: IONOS mailbox setup, Supabase readiness, Mux readiness, code scan for obvious bugs, or admin/source notes.
5. Return to policy/footer global testing once login is stable on the custom domain.

## Safety

Do not touch IONOS DNS again unless there is a confirmed problem.
Do not remove the custom domain in GitHub Pages.
Do not enable HTTPS until GitHub shows it is ready.
Do not use the last magic-link attempt during the settling period.
No live/index promotion from this checkpoint.
