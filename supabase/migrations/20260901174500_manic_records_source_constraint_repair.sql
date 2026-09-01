-- Manic Records source constraint convergence.
-- Production retained the original V1 url|mux source checks even though the
-- live uploader and the newer foundation schema use storage-backed audio.
-- Preserve legacy URL audio and Mux video while accepting validated Storage
-- metadata for audio uploads. Drop both historical source-constraint names so
-- production and databases replayed from repository migrations converge.

begin;

alter table public.manic_tracks
  drop constraint if exists manic_tracks_source_fields;

alter table public.manic_tracks
  drop constraint if exists manic_tracks_source_check;

alter table public.manic_tracks
  drop constraint if exists manic_tracks_source_type_check;

alter table public.manic_tracks
  add constraint manic_tracks_source_type_check
  check (source_type in ('url','storage','mux'));

alter table public.manic_tracks
  add constraint manic_tracks_source_fields
  check (
    (
      media_kind = 'audio'
      and source_type = 'url'
      and nullif(btrim(audio_url),'') is not null
    )
    or
    (
      media_kind = 'audio'
      and source_type = 'storage'
      and audio_bucket in ('manic-records-public-audio','manic-records-audio')
      and nullif(btrim(audio_storage_path),'') is not null
    )
    or
    (
      media_kind = 'video'
      and source_type = 'mux'
      and (
        nullif(btrim(mux_playback_id),'') is not null
        or nullif(btrim(video_url),'') is not null
        or nullif(btrim(mux_upload_id),'') is not null
      )
    )
  );

commit;
