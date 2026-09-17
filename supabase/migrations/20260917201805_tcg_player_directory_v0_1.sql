-- Stream Bandit TCG Player Directory v0.1
-- Privacy-first, authenticated-only discovery seam. Existing profile RLS is not weakened.
-- V2.4.5 hardening keeps privileged reads in non-exposed tcg_private objects;
-- the public browser RPCs are SECURITY INVOKER only.

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

-- Safe projection lives outside exposed API schemas. Browser roles cannot mutate it.
grant usage on schema tcg_private to authenticated, service_role;

create table if not exists tcg_private.player_directory_projection (
  user_id uuid primary key references public.tcg_player_profiles(user_id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  player_xp bigint,
  arcade_matches bigint,
  arcade_wins bigint,
  arcade_losses bigint,
  arcade_win_streak integer,
  arcade_best_win_streak integer,
  updated_at timestamptz not null default now()
);

alter table tcg_private.player_directory_projection enable row level security;
revoke all on table tcg_private.player_directory_projection from public, anon, authenticated, service_role;
grant select on table tcg_private.player_directory_projection to authenticated;
grant all on table tcg_private.player_directory_projection to service_role;

drop policy if exists "tcg directory projection authenticated read" on tcg_private.player_directory_projection;
create policy "tcg directory projection authenticated read"
on tcg_private.player_directory_projection
for select to authenticated
using (true);

create or replace function tcg_private.refresh_player_directory_projection(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is null then
    return;
  end if;

  delete from tcg_private.player_directory_projection
  where user_id = p_user_id;

  insert into tcg_private.player_directory_projection (
    user_id,
    username,
    display_name,
    avatar_url,
    player_xp,
    arcade_matches,
    arcade_wins,
    arcade_losses,
    arcade_win_streak,
    arcade_best_win_streak,
    updated_at
  )
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
    case when dp.show_arcade_stats then tp.arcade_best_win_streak else null::integer end,
    now()
  from public.tcg_player_profiles tp
  join public.tcg_player_directory_preferences dp
    on dp.user_id = tp.user_id and dp.discoverable is true
  join public.sb_profiles sp
    on sp.id = tp.user_id and sp.account_status = 'active'
  join public.sb_profile_social_settings ss
    on ss.user_id = tp.user_id and ss.profile_visibility = 'public'
  where tp.user_id = p_user_id;
end;
$$;

create or replace function tcg_private.refresh_player_directory_user_id_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform tcg_private.refresh_player_directory_projection(old.user_id);
    return old;
  end if;

  perform tcg_private.refresh_player_directory_projection(new.user_id);
  return new;
end;
$$;

create or replace function tcg_private.refresh_player_directory_profile_id_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform tcg_private.refresh_player_directory_projection(old.id);
    return old;
  end if;

  perform tcg_private.refresh_player_directory_projection(new.id);
  return new;
end;
$$;

revoke all on function tcg_private.refresh_player_directory_projection(uuid) from public, anon, authenticated, service_role;
revoke all on function tcg_private.refresh_player_directory_user_id_trigger() from public, anon, authenticated, service_role;
revoke all on function tcg_private.refresh_player_directory_profile_id_trigger() from public, anon, authenticated, service_role;

drop trigger if exists tcg_directory_refresh_from_preferences on public.tcg_player_directory_preferences;
create trigger tcg_directory_refresh_from_preferences
after insert or update or delete on public.tcg_player_directory_preferences
for each row execute function tcg_private.refresh_player_directory_user_id_trigger();

drop trigger if exists tcg_directory_refresh_from_tcg_profile on public.tcg_player_profiles;
create trigger tcg_directory_refresh_from_tcg_profile
after insert or update or delete on public.tcg_player_profiles
for each row execute function tcg_private.refresh_player_directory_user_id_trigger();

drop trigger if exists tcg_directory_refresh_from_social_settings on public.sb_profile_social_settings;
create trigger tcg_directory_refresh_from_social_settings
after insert or update or delete on public.sb_profile_social_settings
for each row execute function tcg_private.refresh_player_directory_user_id_trigger();

drop trigger if exists tcg_directory_refresh_from_shared_profile on public.sb_profiles;
create trigger tcg_directory_refresh_from_shared_profile
after insert or update or delete on public.sb_profiles
for each row execute function tcg_private.refresh_player_directory_profile_id_trigger();

-- Public Data API seam: invoker-only, bounded, and backed only by the safe projection.
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
language sql
stable
security invoker
set search_path = ''
as $$
  with args as (
    select
      nullif(left(btrim(coalesce(p_query, '')), 80), '') as q,
      least(greatest(coalesce(p_limit, 25), 1), 50) as lim,
      greatest(coalesce(p_offset, 0), 0) as off
  )
  select
    d.user_id,
    d.username,
    d.display_name,
    d.avatar_url,
    d.player_xp,
    d.arcade_matches,
    d.arcade_wins,
    d.arcade_losses,
    d.arcade_win_streak,
    d.arcade_best_win_streak
  from tcg_private.player_directory_projection d
  cross join args a
  where (select auth.uid()) is not null
    and (
      a.q is null
      or d.username ilike ('%' || a.q || '%')
      or d.display_name ilike ('%' || a.q || '%')
    )
  order by lower(coalesce(nullif(d.display_name, ''), nullif(d.username, ''), d.user_id::text)), d.user_id
  limit (select lim from args)
  offset (select off from args);
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
language sql
stable
security invoker
set search_path = ''
as $$
  select
    d.user_id,
    d.username,
    d.display_name,
    d.avatar_url,
    d.player_xp,
    d.arcade_matches,
    d.arcade_wins,
    d.arcade_losses,
    d.arcade_win_streak,
    d.arcade_best_win_streak
  from tcg_private.player_directory_projection d
  where (select auth.uid()) is not null
    and d.user_id = p_player_id
  limit 1;
$$;

revoke all on function public.tcg_search_public_players(text, integer, integer) from public, anon, service_role;
revoke all on function public.tcg_get_public_player(uuid) from public, anon, service_role;
grant execute on function public.tcg_search_public_players(text, integer, integer) to authenticated;
grant execute on function public.tcg_get_public_player(uuid) to authenticated;
