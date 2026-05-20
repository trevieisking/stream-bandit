# Stream Bandit Table Note

Date: 2026-05-21

Table name: public.sb_submissions

Purpose: video submission and admin review queue data.

Observed fields from Supabase screenshots:

id
submitter_id
channel_name
title
description
video_url
thumbnail_url
trailer_url
age_rating
kids_suitable
genres
reason
status
decline_reason
reviewed_by
reviewed_at
created_at
updated_at

Project rule: keep this table. Do not rebuild it or delete it. Future Submit Video and Review Queue code should preserve the full row shape.

Related tables still to inspect for the separate custom form issue:

public.sb_form_submissions
public.sb_site_pages
