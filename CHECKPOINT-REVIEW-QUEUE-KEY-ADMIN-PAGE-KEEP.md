# Stream Bandit — Review Queue Key Admin Page Keep

Checkpoint name:

`Review Queue - Key Admin Page Keep`

## Decision

Keep the Review Queue page as-is for now.

## Reason

Review Queue is a key admin workflow page. It connects directly to Submit Video and controls whether submitted videos are approved into the Supabase movie library or declined.

This page took time to get working correctly, especially the submission load, filter and review flow. Because of that, it should not be visually rebuilt during the current tidy pass.

## Current page condition

The page is functional and clear:

- Load / refresh Supabase submissions works
- Submit test video link exists
- Supabase Manager link exists
- status counts are visible
- Pending / Approved / Declined filter works
- search box exists
- admin can review submissions from this page

## User-facing status

This page is admin-only.

Users submit videos through Submit Video. Admin reviews them here.

## Protected areas

Do not change lightly:

- Supabase submissions read logic
- status filter
- search filter
- approve flow
- decline flow
- edit-before-approve flow
- link to Submit Video
- link to Supabase Manager
- Review Queue counts
- Submit Video connection
- Supabase movie insert/approval logic

## Recommendation

Do not tidy/rebuild this page right now.

If it is polished later, use a dedicated test and only make light visual changes. Do not move/rebuild form or approval logic unless a full Submit Video -> Review Queue -> Approve -> Library test is completed.

## Next recommended page

Continue with lower-risk pages:

- Health Check
- Test Checklist

These are check/status pages and should be safer to keep as-is or lightly review.
