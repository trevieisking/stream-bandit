# Stream Bandit — Submit Video Cautious Review

Checkpoint name:

`Submit Video - Cautious Review`

## Decision

Do not rebuild the Submit Video page right now.

## Reason

Submit Video is a mixed page:

- it is user-facing because creators/users may submit a video link,
- it is connected to the admin Review Queue,
- it includes Supabase submission writes,
- it includes poster image upload to Supabase Storage,
- it includes genre selection and safety/rules confirmation.

This page took time to get working correctly with Review Queue, so layout changes should be cautious.

## Current page condition

The page is functional and understandable:

- Supabase Submit Video intro explains the route,
- Load my Supabase submissions works,
- Review Queue button exists,
- strict rules are visible,
- submission form is clear,
- poster upload is present,
- genre picker is present,
- confirmation checkbox is present,
- send to Supabase review queue button is present.

## Menu placement note

Submit Video is not purely admin-only.

It is a creator/user submission page, but Stream Bandit currently has no separate Creator group in the sidebar. Because of that, keep it where it is for now unless a later menu pass adds a Creator section.

Possible future menu section:

`Creator`

Suggested contents if added later:

- Submit Video
- My Channel
- Review Queue only if admin role is shown

## Protected areas

Do not change lightly:

- submission save logic,
- Supabase submission rows,
- Review Queue connection,
- poster upload to Supabase Storage,
- genre checkbox binding,
- new genre request field,
- age rating / kids suitability fields,
- confirmation checkbox,
- submit button behaviour,
- admin approval flow.

## Recommendation

Leave Submit Video as-is for now.

If tidied later, use a dedicated test only and split visually into tabs without changing form logic:

- Rules
- Submit Link
- Poster
- Genres
- Safety

Do not promote any Submit Video tidy until a full submit-to-review-queue test passes.
