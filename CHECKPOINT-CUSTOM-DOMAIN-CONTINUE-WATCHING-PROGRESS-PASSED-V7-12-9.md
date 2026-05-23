# Stream Bandit Checkpoint — Custom Domain Continue Watching / Progress PASSED V7.12.9

Date: 2026-05-23

## Result

PASSED.

Trevor confirmed Continue Watching and watch progress work correctly on the HTTPS custom domain after Supabase Auth login.

## Passed checks

- Movie played on the custom domain.
- Page refresh kept the watched time.
- Going back and refreshing still showed the movie in Continue Watching.
- Resume started from the saved progress point.
- User remained signed in.
- Theme/avatar remained visible.
- Movie appeared in Continue Watching.
- Progress/resume information looked sensible.

## Note

Trevor reported the previous Continue Watching history had reset, but the new custom-domain test successfully wrote and read fresh progress.

## Meaning

This confirms the player progress/continue-watching flow survived the domain move and works with the current Supabase/Auth/custom-domain setup.

## Safety

No Supabase SQL was run.
No Supabase rows were edited manually.
No RLS policies were changed.
No live/index promotion was performed in this checkpoint.
