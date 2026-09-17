-- Stream Bandit TCG Player Directory v0.1
-- Privacy-first, authenticated-only discovery seam. Existing profile RLS is not weakened.

create table if not exists public.tcg_player_directory_preferences (
  user_id uuid primary key references public.tcg_player_profiles(user_id) on delete cascade,
  discoverable boolean not null default false,
  show_arcade_stats boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tcg_player_directory_discoverable_idx
  on public.tcg_player_directory_preferences(user_id)
  where discoverable is true;

drop trigger if exists tcg_player_directory_preferences_updated_at on public.tcg_player_directory_preferences;
create trigger tcg_player_directory_preferences_updated_at
before update on public.tcg_player_directory_preferences
for each row execute function public.tcg_set_updated_at();

alter table public.tcg_player_directory_preferences enable row level security;

revoke all on table public.tcg_player_directory_preferences from public, anon;
grant select, insert, update on table public.tcg_player_directory_preferences to authenticated;
grant all on table public.tcg_player_directory_preferences to service_role;

drop policy if exists "tcg directory preferences select own" on public.tcg_player_directory_preferences;
drop policy if exists "tcg directory preferences insert own" on public.tcg_player_directory_preferences;
drop policy if exists "tcg directory preferences update own" on public.tcg_player_directory_preferences;

create policy "tcg directory preferences select own"
on public.tcg_player_directory_preferences
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "tcg directory preferences insert own"
on public.tcg_player_directory_preferences
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "tcg directory preferences update own"
on public.tcg_player_directory_preferences
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.tcg_search_public_players(
  p_query text default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  player_id uuid,
  username text,
  display_name text,
  avatar_url text,
  player_xp bigint,
  arcade_matches bigint,
  arcade_wins bigint,
  arcade_losses bigint,
  arcade_win_streak integer,
  arcade_best_win_streak integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := nullif(left(btrim(coalesce(p_query, '')), 80), '');
  v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 50);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  return query
  select
    tp.user_id,
    sp.username,
    sp.display_name,
    sp.avatar_url,
    case when dp.show_arcade_stats then tp.player_xp else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_matches else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_wins else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_losses else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_win_streak else null::integer end,
    case when dp.show_arcade_stats then tp.arcade_best_win_streak else null::integer end
  from public.tcg_player_profiles tp
  join public.tcg_player_directory_preferences dp
    on dp.user_id = tp.user_id and dp.discoverable is true
  join public.sb_profiles sp
    on sp.id = tp.user_id and sp.account_status = 'active'
  join public.sb_profile_social_settings ss
    on ss.user_id = tp.user_id and ss.profile_visibility = 'public'
  where v_query is null
     or sp.username ilike ('%' || v_query || '%')
     or sp.display_name ilike ('%' || v_query || '%')
  order by lower(coalesce(nullif(sp.display_name, ''), nullif(sp.username, ''), tp.user_id::text)), tp.user_id
  limit v_limit
  offset v_offset;
end;
$$;

create or replace function public.tcg_get_public_player(p_player_id uuid)
returns table (
  player_id uuid,
  username text,
  display_name text,
  avatar_url text,
  player_xp bigint,
  arcade_matches bigint,
  arcade_wins bigint,
  arcade_losses bigint,
  arcade_win_streak integer,
  arcade_best_win_streak integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  return query
  select
    tp.user_id,
    sp.username,
    sp.display_name,
    sp.avatar_url,
    case when dp.show_arcade_stats then tp.player_xp else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_matches else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_wins else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_losses else null::bigint end,
    case when dp.show_arcade_stats then tp.arcade_win_streak else null::integer end,
    case when dp.show_arcade_stats then tp.arcade_best_win_streak else null::integer end
  from public.tcg_player_profiles tp
  join public.tcg_player_directory_preferences dp
    on dp.user_id = tp.user_id and dp.discoverable is true
  join public.sb_profiles sp
    on sp.id = tp.user_id and sp.account_status = 'active'
  join public.sb_profile_social_settings ss
    on ss.user_id = tp.user_id and ss.profile_visibility = 'public'
  where tp.user_id = p_player_id
  limit 1;
end;
$$;

revoke all on function public.tcg_search_public_players(text, integer, integer) from public, anon;
revoke all on function public.tcg_get_public_player(uuid) from public, anon;
grant execute on function public.tcg_search_public_players(text, integer, integer) to authenticated, service_role;
grant execute on function public.tcg_get_public_player(uuid) to authenticated, service_role;
