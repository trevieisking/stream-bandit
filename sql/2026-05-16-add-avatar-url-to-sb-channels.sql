-- Stream Bandit V6.94.2 Channels avatar support
-- Purpose: allow sb_channels to store a separate avatar/logo image.
-- Current table already has image_url, which is being used as the channel banner/cover.
-- This adds avatar_url so the channel avatar circle can persist separately.

alter table public.sb_channels
add column if not exists avatar_url text;

comment on column public.sb_channels.avatar_url is
'Public channel avatar/logo image URL used by Stream Bandit channel pages.';
