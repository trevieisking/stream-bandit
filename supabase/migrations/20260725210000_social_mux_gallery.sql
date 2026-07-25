-- Stream Bandit account-owned social Mux gallery extension.
-- Additive only: existing gallery rows and storage paths are not rewritten.

begin;

alter table public.sb_profile_gallery_items
  add column if not exists mux_upload_id text,
  add column if not exists mux_asset_id text,
  add column if not exists mux_playback_id text,
  add column if not exists mux_playback_policy text,
  add column if not exists mux_status text,
  add column if not exists mux_duration_seconds double precision,
  add column if not exists mux_aspect_ratio text,
  add column if not exists mux_error_message text,
  add column if not exists mux_ready_at timestamptz;

alter table public.sb_profile_gallery_items
  drop constraint if exists sb_profile_gallery_items_media_kind_check,
  drop constraint if exists sb_profile_gallery_items_source_check,
  drop constraint if exists sb_profile_gallery_items_mux_status_check,
  drop constraint if exists sb_profile_gallery_items_mux_duration_check,
  drop constraint if exists sb_profile_gallery_items_mux_fields_check;

alter table public.sb_profile_gallery_items
  add constraint sb_profile_gallery_items_media_kind_check
    check (media_kind in ('image', 'video', 'external_video', 'mux_video')),
  add constraint sb_profile_gallery_items_mux_status_check
    check (
      mux_status is null
      or mux_status in (
        'waiting',
        'uploading',
        'preparing',
        'ready',
        'errored',
        'cancelled'
      )
    ),
  add constraint sb_profile_gallery_items_mux_duration_check
    check (mux_duration_seconds is null or mux_duration_seconds >= 0),
  add constraint sb_profile_gallery_items_source_check
    check (
      (
        media_kind in ('image', 'video')
        and storage_bucket = 'stream-bandit-profile-gallery'
        and nullif(btrim(storage_path), '') is not null
        and external_url is null
      )
      or
      (
        media_kind = 'external_video'
        and nullif(btrim(external_url), '') is not null
        and storage_path is null
        and storage_bucket is null
      )
      or
      (
        media_kind = 'mux_video'
        and storage_bucket is null
        and storage_path is null
        and external_url is null
        and nullif(btrim(mux_upload_id), '') is not null
        and mux_playback_policy = 'signed'
      )
    ),
  add constraint sb_profile_gallery_items_mux_fields_check
    check (
      (
        media_kind = 'mux_video'
        and nullif(btrim(mux_upload_id), '') is not null
        and mux_playback_policy = 'signed'
        and mux_status is not null
      )
      or
      (
        media_kind <> 'mux_video'
        and mux_upload_id is null
        and mux_asset_id is null
        and mux_playback_id is null
        and mux_playback_policy is null
        and mux_status is null
        and mux_duration_seconds is null
        and mux_aspect_ratio is null
        and mux_error_message is null
        and mux_ready_at is null
      )
    );

create unique index if not exists sb_profile_gallery_items_mux_upload_unique_idx
  on public.sb_profile_gallery_items (mux_upload_id)
  where mux_upload_id is not null;

create unique index if not exists sb_profile_gallery_items_mux_asset_unique_idx
  on public.sb_profile_gallery_items (mux_asset_id)
  where mux_asset_id is not null;

create unique index if not exists sb_profile_gallery_items_mux_playback_unique_idx
  on public.sb_profile_gallery_items (mux_playback_id)
  where mux_playback_id is not null;

create index if not exists sb_profile_gallery_items_mux_processing_idx
  on public.sb_profile_gallery_items (user_id, mux_status, created_at desc)
  where media_kind = 'mux_video';

comment on column public.sb_profile_gallery_items.mux_upload_id is
  'Mux direct-upload identifier. Required for every account-owned social Mux video.';
comment on column public.sb_profile_gallery_items.mux_asset_id is
  'Mux asset identifier populated after Mux accepts and processes the upload.';
comment on column public.sb_profile_gallery_items.mux_playback_id is
  'Signed Mux playback identifier. Playback tokens are issued only after server-side visibility checks.';
comment on column public.sb_profile_gallery_items.mux_playback_policy is
  'Playback policy for social Mux media. New social uploads are constrained to signed playback.';
comment on column public.sb_profile_gallery_items.mux_status is
  'Server-controlled Mux lifecycle: waiting, uploading, preparing, ready, errored or cancelled.';

commit;
