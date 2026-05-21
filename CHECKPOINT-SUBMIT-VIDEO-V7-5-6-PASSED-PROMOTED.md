# Stream Bandit Checkpoint — Submit Video V7.5.6 Passed + Promoted

Date: 2026-05-21

## Page passed

Passed direct global test page:

- `submit-video-global-helpers-v7-5-6-test.html`

## Route promoted

Route file:

- `submit-video-creator-shell-v6-49-test.html`

Now opens:

- `submit-video-global-helpers-v7-5-6-test.html`

Route promotion commit:

- `f60f9c3031a53245eb6583b49231590c920971de`

## Trevor test result

Trevor confirmed:

- Page loads: PASS
- Theme matches global theme: PASS
- Account/avatar appears correctly: PASS
- Helper status shows account/avatar/shared style/settings bridge loaded: PASS
- Recent submissions load: PASS
- Open Submission Form: PASS
- Fill fields: PASS
- Poster upload fills URL and preview: PASS
- Submit creates one pending `sb_submissions` row only: PASS
- Review Queue link opens old Review route: PASS
- Rules link opens current Rules route: PASS

Notes from Trevor:

- Channel dropdown was not clearly visible in the screenshot, but this does not block the pass because the form submitted successfully and the row reached `sb_submissions`.
- Trevor also tested the old Review Queue page after this. Approve/submit style actions still function, but the reject button does not work. Reject can still be handled through the word picker/status box and Save. This bug belongs to the Review Queue page and should be fixed in the next Creator pass.

## Preserved Submit Video functions

V7.5.6 preserved and upgraded:

- direct full page, no iframe wrapper
- global helper stack
- account/avatar/shared style/settings helper status
- recent `sb_submissions` read
- channel dropdown read from `sb_channels`
- poster upload to Supabase Storage bucket `stream-bandit-images`
- poster public URL fill into `thumbnail_url`
- form submit into `sb_submissions`
- status set to `pending`
- no write to `sb_movies`
- Review Queue route link
- Rules route link
- global search route link

## Real table shape protected

The page is based on the real `sb_submissions` shape Trevor provided:

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

## Safe status

- Live `index.html` not promoted
- Supabase schema unchanged
- Public movie rows are not created by Submit Video
- Old stable Submit page remains available as fallback:
  - `submit-video-poster-url-fix-v6-98-2-test.html`

## Creator group status after this checkpoint

Creator group global-helper pass:

- Rules: passed and promoted to `rules-global-helpers-v7-5-5-test.html`
- Submit Video: passed and promoted to `submit-video-global-helpers-v7-5-6-test.html`
- Review Queue: next

## Next target

Build Review Queue global helper page next.

Important bug to fix during Review Queue pass:

- reject button does not work on the old Review Queue page
- status word picker + Save works
- preserve approve/status/save/delete functions while fixing reject button
