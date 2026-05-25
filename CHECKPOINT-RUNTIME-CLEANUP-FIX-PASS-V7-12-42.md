# Stream Bandit Runtime Cleanup Fix Pass V7.12.42

Date: 2026-05-25

Purpose: continue repairing the app safely after the V7.12.41 Runtime Keep Board found the useful cleanup split.

Current verified scanner baseline from V7.12.41:

- Repo files: 936
- HTML pages: 589
- Runtime keep files: 376
- Runtime keep pages: 352
- Docs/history: 206
- Review candidates: 351
- Strong missing refs: 34
- Ignored scanner noise: 68

Safety rule:

- No deletes in this pass.
- Only add protective aliases or fix broken references.
- Keep the backup branch `backup-before-cleanup-v7-12-38` available.
- Do not trust old menu-only scans.
- Do not treat docs/checkpoints as runtime dependencies.

Fixes already added in this pass:

- `stream-bandit-route-pointer-machine-v7-12-64-test.html` added as an old Route Pointer alias to current `stream-bandit-route-pointer-machine-v7-12-36-test.html`.
- `platform-control-tower-route-guard-proof-v7-12-63-test.html` added as an old Route Guard alias to current `platform-control-tower-route-guard-proof-v7-12-33-test.html`.
- `platform-builder-standalone-v5-80-test.html` added as an old Platform Builder alias to current `web-builder-full-edit-lock-v7-8-6-test.html`.
- `release-candidate-standalone-v5-82-test.html` added as an old Release Candidate alias to current `live-readiness-global-helpers-v7-10-2-test.html`.
- `app-shell-plan3-test.html` added as an old Plan 3 app shell alias to current Home.
- `index-plan3-rc-test.html` added as an old Plan 3 RC alias to current Home.
- `web-builder-standalone-v5-79-test.html` added as an old Web Builder alias to current `web-builder-full-edit-lock-v7-8-6-test.html`.

Next safe fixes:

1. Reduce remaining strong missing refs by fixing repeated brand/logo references.
2. Clean old alias references inside shared shell once the current aliases are proven stable.
3. Rerun `repository-runtime-keep-board-v7-12-41-test.html` after each small fix pass.
4. Do not delete the 351 review candidates until a separate archive batch is prepared and tested.
