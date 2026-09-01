-- Lightweight Manic Records playlists. Music stays isolated from sb_playlist_movies.
begin;

create table if not exists public.manic_playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.sb_profiles(id) on delete cascade,
  name text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manic_playlists_name_check check (char_length(btrim(name)) between 1 and 80),
  constraint manic_playlists_owner_name_key unique (owner_id, name)
);

create table if not exists public.manic_playlist_tracks (
  playlist_id uuid not null references public.manic_playlists(id) on delete cascade,
  track_id uuid not null references public.manic_tracks(id) on delete cascade,
  sort_order integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create index if not exists manic_playlists_owner_idx on public.manic_playlists(owner_id);
create index if not exists manic_playlist_tracks_track_idx on public.manic_playlist_tracks(track_id);
create index if not exists manic_playlist_tracks_playlist_sort_idx on public.manic_playlist_tracks(playlist_id, sort_order, added_at);

alter table public.manic_playlists enable row level security;
alter table public.manic_playlist_tracks enable row level security;

drop policy if exists "manic playlists visible" on public.manic_playlists;
create policy "manic playlists visible"
on public.manic_playlists for select
using (
  is_public
  or owner_id = auth.uid()
  or (auth.uid() is not null and public.sb_is_admin_or_owner())
);

drop policy if exists "manic playlists insert own" on public.manic_playlists;
create policy "manic playlists insert own"
on public.manic_playlists for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "manic playlists update own" on public.manic_playlists;
create policy "manic playlists update own"
on public.manic_playlists for update to authenticated
using (owner_id = auth.uid() or public.sb_is_admin_or_owner())
with check (owner_id = auth.uid() or public.sb_is_admin_or_owner());

drop policy if exists "manic playlists delete own" on public.manic_playlists;
create policy "manic playlists delete own"
on public.manic_playlists for delete to authenticated
using (owner_id = auth.uid() or public.sb_is_admin_or_owner());

drop policy if exists "manic playlist tracks visible" on public.manic_playlist_tracks;
create policy "manic playlist tracks visible"
on public.manic_playlist_tracks for select
using (
  exists (
    select 1 from public.manic_playlists p
    where p.id = playlist_id
      and (
        p.is_public
        or p.owner_id = auth.uid()
        or (auth.uid() is not null and public.sb_is_admin_or_owner())
      )
  )
);

drop policy if exists "manic playlist tracks insert own" on public.manic_playlist_tracks;
create policy "manic playlist tracks insert own"
on public.manic_playlist_tracks for insert to authenticated
with check (
  exists (
    select 1 from public.manic_playlists p
    where p.id = playlist_id
      and (p.owner_id = auth.uid() or public.sb_is_admin_or_owner())
  )
);

drop policy if exists "manic playlist tracks update own" on public.manic_playlist_tracks;
create policy "manic playlist tracks update own"
on public.manic_playlist_tracks for update to authenticated
using (
  exists (
    select 1 from public.manic_playlists p
    where p.id = playlist_id
      and (p.owner_id = auth.uid() or public.sb_is_admin_or_owner())
  )
)
with check (
  exists (
    select 1 from public.manic_playlists p
    where p.id = playlist_id
      and (p.owner_id = auth.uid() or public.sb_is_admin_or_owner())
  )
);

drop policy if exists "manic playlist tracks delete own" on public.manic_playlist_tracks;
create policy "manic playlist tracks delete own"
on public.manic_playlist_tracks for delete to authenticated
using (
  exists (
    select 1 from public.manic_playlists p
    where p.id = playlist_id
      and (p.owner_id = auth.uid() or public.sb_is_admin_or_owner())
  )
);

grant select on public.manic_playlists to anon, authenticated;
grant insert, update, delete on public.manic_playlists to authenticated;
grant select on public.manic_playlist_tracks to anon, authenticated;
grant insert, update, delete on public.manic_playlist_tracks to authenticated;

commit;
