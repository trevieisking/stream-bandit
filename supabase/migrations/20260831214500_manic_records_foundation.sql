-- Stream Bandit Manic Records foundation.
-- Idempotent, privacy-aware tables and storage for the dedicated music feed.

begin;

create table if not exists public.manic_tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text,
  artist text,
  genre text not null default 'other',
  media_kind text not null default 'audio',
  source_type text not null default 'storage',
  cover_url text,
  cover_bucket text,
  cover_storage_path text,
  content_rating text not null default 'child_friendly',
  visibility text not null default 'public',
  status text not null default 'published',
  created_by uuid not null references auth.users(id) on delete cascade,
  audio_url text,
  audio_bucket text,
  audio_storage_path text,
  video_url text,
  mux_upload_id text,
  mux_asset_id text,
  mux_playback_id text,
  duration_seconds numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manic_tracks_slug_key unique (slug),
  constraint manic_tracks_media_kind_check check (media_kind in ('audio','video')),
  constraint manic_tracks_source_type_check check (source_type in ('storage','mux')),
  constraint manic_tracks_content_rating_check check (content_rating in ('child_friendly','explicit')),
  constraint manic_tracks_visibility_check check (visibility in ('public','private')),
  constraint manic_tracks_status_check check (status in ('published','archived')),
  constraint manic_tracks_source_check check (
    (media_kind = 'audio' and source_type = 'storage' and audio_bucket in ('manic-records-public-audio','manic-records-audio') and nullif(btrim(audio_storage_path),'') is not null and mux_playback_id is null)
    or
    (media_kind = 'video' and source_type = 'mux' and nullif(btrim(mux_playback_id),'') is not null and audio_storage_path is null)
  ),
  constraint manic_tracks_owner_audio_path_check check (
    audio_storage_path is null or split_part(audio_storage_path,'/',1) = created_by::text
  ),
  constraint manic_tracks_owner_cover_path_check check (
    cover_storage_path is null or split_part(cover_storage_path,'/',1) = created_by::text
  ),
  constraint manic_tracks_audio_privacy_check check (
    media_kind <> 'audio'
    or (visibility = 'public' and audio_bucket = 'manic-records-public-audio' and nullif(btrim(audio_url),'') is not null)
    or (visibility = 'private' and audio_bucket = 'manic-records-audio' and audio_url is null)
  ),
  constraint manic_tracks_cover_privacy_check check (
    cover_storage_path is null
    or (visibility = 'public' and cover_bucket = 'manic-records-public-covers' and nullif(btrim(cover_url),'') is not null)
    or (visibility = 'private' and cover_bucket = 'manic-records-covers' and cover_url is null)
  )
);

create index if not exists manic_tracks_public_feed_idx
  on public.manic_tracks (visibility, status, created_at desc);
create index if not exists manic_tracks_owner_idx
  on public.manic_tracks (created_by, created_at desc);

create table if not exists public.manic_track_comments (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.manic_tracks(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint manic_track_comments_body_check check (char_length(btrim(body)) between 1 and 1200)
);

create index if not exists manic_track_comments_track_idx
  on public.manic_track_comments (track_id, created_at);

create table if not exists public.manic_track_likes (
  track_id uuid not null references public.manic_tracks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (track_id, user_id)
);

alter table public.manic_tracks enable row level security;
alter table public.manic_track_comments enable row level security;
alter table public.manic_track_likes enable row level security;

revoke all on table public.manic_tracks from anon, authenticated;
revoke all on table public.manic_track_comments from anon, authenticated;
revoke all on table public.manic_track_likes from anon, authenticated;
grant select on table public.manic_tracks to anon, authenticated;
grant insert, update, delete on table public.manic_tracks to authenticated;
grant select on table public.manic_track_comments to anon, authenticated;
grant insert, update, delete on table public.manic_track_comments to authenticated;
grant select on table public.manic_track_likes to anon, authenticated;
grant insert, delete on table public.manic_track_likes to authenticated;

drop policy if exists manic_tracks_select_visible on public.manic_tracks;
create policy manic_tracks_select_visible
on public.manic_tracks
for select
to anon, authenticated
using (
  (visibility = 'public' and status = 'published')
  or (auth.uid() is not null and created_by = auth.uid())
);

drop policy if exists manic_tracks_insert_own on public.manic_tracks;
create policy manic_tracks_insert_own
on public.manic_tracks
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists manic_tracks_update_own on public.manic_tracks;
create policy manic_tracks_update_own
on public.manic_tracks
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists manic_tracks_delete_own on public.manic_tracks;
create policy manic_tracks_delete_own
on public.manic_tracks
for delete
to authenticated
using (created_by = auth.uid());

drop policy if exists manic_track_comments_select_visible on public.manic_track_comments;
create policy manic_track_comments_select_visible
on public.manic_track_comments
for select
to anon, authenticated
using (
  exists (
    select 1 from public.manic_tracks t
    where t.id = track_id
      and ((t.visibility = 'public' and t.status = 'published') or (auth.uid() is not null and t.created_by = auth.uid()))
  )
);

drop policy if exists manic_track_comments_insert_visible on public.manic_track_comments;
create policy manic_track_comments_insert_visible
on public.manic_track_comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.manic_tracks t
    where t.id = track_id
      and ((t.visibility = 'public' and t.status = 'published') or t.created_by = auth.uid())
  )
);

drop policy if exists manic_track_comments_update_own on public.manic_track_comments;
create policy manic_track_comments_update_own
on public.manic_track_comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists manic_track_comments_delete_own on public.manic_track_comments;
create policy manic_track_comments_delete_own
on public.manic_track_comments
for delete
to authenticated
using (author_id = auth.uid());

drop policy if exists manic_track_likes_select_visible on public.manic_track_likes;
create policy manic_track_likes_select_visible
on public.manic_track_likes
for select
to anon, authenticated
using (
  exists (
    select 1 from public.manic_tracks t
    where t.id = track_id
      and ((t.visibility = 'public' and t.status = 'published') or (auth.uid() is not null and t.created_by = auth.uid()))
  )
);

drop policy if exists manic_track_likes_insert_visible on public.manic_track_likes;
create policy manic_track_likes_insert_visible
on public.manic_track_likes
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.manic_tracks t
    where t.id = track_id
      and ((t.visibility = 'public' and t.status = 'published') or t.created_by = auth.uid())
  )
);

drop policy if exists manic_track_likes_delete_own on public.manic_track_likes;
create policy manic_track_likes_delete_own
on public.manic_track_likes
for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
  ('manic-records-public-audio','manic-records-public-audio',true,524288000,array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a','audio/ogg']::text[]),
  ('manic-records-audio','manic-records-audio',false,524288000,array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a','audio/ogg']::text[]),
  ('manic-records-public-covers','manic-records-public-covers',true,20971520,array['image/jpeg','image/png','image/webp']::text[]),
  ('manic-records-covers','manic-records-covers',false,20971520,array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Owner-only writes to all Manic Records buckets.
drop policy if exists "Manic Records upload own" on storage.objects;
create policy "Manic Records upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('manic-records-public-audio','manic-records-audio','manic-records-public-covers','manic-records-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Manic Records update own" on storage.objects;
create policy "Manic Records update own"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('manic-records-public-audio','manic-records-audio','manic-records-public-covers','manic-records-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('manic-records-public-audio','manic-records-audio','manic-records-public-covers','manic-records-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Manic Records delete own" on storage.objects;
create policy "Manic Records delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('manic-records-public-audio','manic-records-audio','manic-records-public-covers','manic-records-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Private-object reads are owner-only. Public buckets are served by Supabase's public object route.
drop policy if exists "Manic Records private read own" on storage.objects;
create policy "Manic Records private read own"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('manic-records-audio','manic-records-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

comment on table public.manic_tracks is 'Dedicated Stream Bandit Manic Records music metadata with public/private visibility.';
comment on table public.manic_track_comments is 'Comments attached only to Manic Records tracks visible under track RLS.';
comment on table public.manic_track_likes is 'Per-user likes attached only to Manic Records tracks visible under track RLS.';

commit;
