# Stream Bandit Safe Checkpoint — Creator Group

Date: 2026-05-21

## Safe checkpoint decision

Creator group is now safe/current for this global-helper pass.

The group contains:

- Rules
- Submit Video
- Review Queue

All three have passed Trevor's browser tests and their route wrappers have been promoted to the new direct global helper pages.

## Standing rules preserved

- No live `index.html` promotion yet.
- No Supabase schema changes.
- No iframe wrappers for passed pages.
- No patching stable pages directly except small route-wrapper promotion after test pass.
- Old useful fallback pages remain available.
- Check menu overlay as the project map.
- Save checkpoint notes after each pass.

## Creator routes now promoted

### Rules

Route file:

- `rules-creator-shell-v6-50-test.html`

Now opens:

- `rules-global-helpers-v7-5-5-test.html`

Status:

- read-only rulebook
- full global helper stack
- current theme/account/avatar/search
- no writes

### Submit Video

Route file:

- `submit-video-creator-shell-v6-49-test.html`

Now opens:

- `submit-video-global-helpers-v7-5-6-test.html`

Status:

- reads channels from `sb_channels`
- recent submissions read from `sb_submissions`
- poster upload to Supabase Storage bucket `stream-bandit-images`
- poster public URL fills `thumbnail_url`
- creates pending `sb_submissions` rows
- no write to `sb_movies`

Checkpoint:

- `CHECKPOINT-SUBMIT-VIDEO-V7-5-6-PASSED-PROMOTED.md`

### Review Queue

Route file:

- `review-queue-creator-shell-v6-51-test.html`

Now opens:

- `review-queue-global-helpers-v7-5-7-test.html`

Status:

- reads `sb_submissions`
- approve works
- decline works
- decline reason saves into `decline_reason`
- request changes works
- save status/dropdown works
- delete with typed confirmation works
- no write to `sb_movies`

Checkpoint:

- `CHECKPOINT-REVIEW-QUEUE-V7-5-7-PASSED-PROMOTED.md`

## Real Supabase table shapes used

### sb_submissions

Known fields from Trevor's table dump and page work:

- `id`
- `submitter_id`
- `channel_name`
- `title`
- `description`
- `video_url`
- `thumbnail_url`
- `trailer_url`
- `age_rating`
- `kids_suitable`
- `genres`
- `reason`
- `status`
- `decline_reason`
- `reviewed_by`
- `reviewed_at`
- `created_at`
- `updated_at`

### sb_channels

Known fields from Trevor's table dump and Channels pass:

- `id`
- `name`
- `description`
- `owner_id`
- `image_url`
- `avatar_url`
- `is_official`
- `created_at`
- `updated_at`

## Main fixed issue

Old Review Queue bug:

- Reject button was unreliable because old code used `rejected` while the real table/status flow uses `declined` and `decline_reason`.

Fixed in:

- `review-queue-global-helpers-v7-5-7-test.html`

The action is now named Decline and writes the real status/reason.

## Fallback pages preserved

Do not delete yet:

- `rules-creator-rulebook-v7-2-1-test.html`
- `submit-video-poster-url-fix-v6-98-2-test.html`
- `review-queue-status-delete-v6-99-0-test.html`

## Larger safe base after this checkpoint

Current safe groups now include:

- Watch group
- Browse group
- Group Play group
- Creator group

Next recommended action:

- Scan the menu overlay again and choose the next group after Creator.
- Likely candidates: Settings group or Admin group.
- Settings/Web Builder/Platform Builder are heavy and should be scanned deeply before any edits.
