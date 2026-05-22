# Stream Bandit Checkpoint — Supabase Auth Redirects for Custom Domain V7.12.5

Date: 2026-05-22

## Purpose

Supabase Auth URL Configuration has been updated so magic-link/login redirects can support the GitHub Pages address and the new Stream Bandit custom domain.

This was done because the custom domain transition caused login/magic-link testing to become unsafe until the redirect allow-list was expanded.

## Site URL

Site URL was left unchanged for safety:

```txt
https://trevieisking.github.io/stream-bandit/
```

Do not change Site URL until HTTPS/domain behaviour is fully stable and intentionally promoted.

## Redirect URLs now listed

```txt
https://trevieisking.github.io/stream-bandit/
http://chatterfriendsstreambandit.co.uk/
http://chatterfriendsstreambandit.co.uk/**
http://www.chatterfriendsstreambandit.co.uk/**
https://trevieisking.github.io/stream-bandit/**
https://chatterfriendsstreambandit.co.uk/**
https://www.chatterfriendsstreambandit.co.uk/**
```

Total redirect URLs shown: 7.

## Why these exist

- Root GitHub Pages URL remains the safe original Site URL.
- GitHub wildcard supports direct test-page returns.
- HTTP custom-domain entries support the current pre-HTTPS transition.
- HTTPS custom-domain entries are prepared for once GitHub certificate/Enforce HTTPS is ready.
- `www` entries are included because IONOS DNS has a `www` CNAME pointing to GitHub Pages.

## Current testing rule

Do not use the final/limited magic-link attempt yet.

Wait until:

1. GitHub Pages HTTPS is ready or clearly stable.
2. Enforce HTTPS can be enabled safely.
3. Custom domain resolves consistently.
4. Then run one careful login test from the page that needs global account/theme/avatar testing.

## Page currently waiting for full authenticated retest

```txt
control-tower-footer-policy-previews-v7-12-5-test.html
```

Safe logged-out checks are okay, but full pass is pending account/avatar/theme verification after auth is stable.

## Safety notes

- No SQL was run.
- No tables were edited.
- No RLS policies were changed.
- No Site URL change was made.
- No magic-link test was spent after redirect setup.
- No live/index promotion from this checkpoint.
