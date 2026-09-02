-- Manic Records creator-controlled free downloads.
-- Additive and idempotent: existing tracks remain non-downloadable until their creator opts in.

begin;

alter table public.manic_tracks
  add column if not exists allow_download boolean not null default false,
  add column if not exists download_count bigint not null default 0;

-- Downloads are only meaningful for public audio. Existing rows are normalised before the guard is installed.
update public.manic_tracks
set allow_download = false
where (media_kind <> 'audio' or visibility <> 'public')
  and allow_download = true;

alter table public.manic_tracks
  drop constraint if exists manic_tracks_download_count_check;

alter table public.manic_tracks
  add constraint manic_tracks_download_count_check
  check (download_count >= 0);

alter table public.manic_tracks
  drop constraint if exists manic_tracks_download_media_check;

alter table public.manic_tracks
  drop constraint if exists manic_tracks_download_eligibility_check;

alter table public.manic_tracks
  add constraint manic_tracks_download_eligibility_check
  check (allow_download = false or (media_kind = 'audio' and visibility = 'public'));

-- Supabase object deletion returns deleted rows, so authenticated creators need owner-scoped
-- select access to public-object rows. Existing private-object read policies remain authoritative.
drop policy if exists "Manic Records object read own" on storage.objects;
create policy "Manic Records object read own"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('manic-records-public-audio','manic-records-public-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.manic_increment_track_download(p_track_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_download_count bigint;
begin
  update public.manic_tracks
  set download_count = download_count + 1
  where id = p_track_id
    and media_kind = 'audio'
    and visibility = 'public'
    and status = 'published'
    and allow_download = true
  returning download_count into v_download_count;

  if v_download_count is null then
    raise exception using
      errcode = '42501',
      message = 'Track is not available for public download.';
  end if;

  return v_download_count;
end;
$function$;

revoke all on function public.manic_increment_track_download(uuid) from public;
grant execute on function public.manic_increment_track_download(uuid) to anon, authenticated;

comment on column public.manic_tracks.allow_download is
  'Creator opt-in for free public audio downloads. Video remains stream-only.';

comment on column public.manic_tracks.download_count is
  'Successful public download attempts recorded through manic_increment_track_download.';

comment on function public.manic_increment_track_download(uuid) is
  'Atomically increments a download count only for public, published, creator-enabled audio.';

commit;
