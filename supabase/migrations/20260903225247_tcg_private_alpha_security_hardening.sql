create schema if not exists tcg_private;
revoke all on schema tcg_private from public, anon;
grant usage on schema tcg_private to authenticated;

create or replace function tcg_private.room_is_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.tcg_room_members m
    where m.room_id = p_room_id and m.user_id = auth.uid()
  );
$$;

create or replace function tcg_private.match_is_participant(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.tcg_match_players p
    where p.match_id = p_match_id and p.user_id = auth.uid()
  );
$$;

revoke all on function tcg_private.room_is_member(uuid) from public, anon;
revoke all on function tcg_private.match_is_participant(uuid) from public, anon;
grant execute on function tcg_private.room_is_member(uuid) to authenticated;
grant execute on function tcg_private.match_is_participant(uuid) to authenticated;

drop policy if exists "tcg rooms participant read" on public.tcg_rooms;
drop policy if exists "tcg room members participant read" on public.tcg_room_members;
drop policy if exists "tcg matches participant read" on public.tcg_matches;
drop policy if exists "tcg match views own read" on public.tcg_match_views;
drop policy if exists "tcg match events participant read" on public.tcg_match_events;

create policy "tcg rooms participant read" on public.tcg_rooms
for select to authenticated
using (tcg_private.room_is_member(id));

create policy "tcg room members participant read" on public.tcg_room_members
for select to authenticated
using (tcg_private.room_is_member(room_id));

create policy "tcg matches participant read" on public.tcg_matches
for select to authenticated
using (tcg_private.match_is_participant(id));

create policy "tcg match views own read" on public.tcg_match_views
for select to authenticated
using (user_id = auth.uid() and tcg_private.match_is_participant(match_id));

create policy "tcg match events participant read" on public.tcg_match_events
for select to authenticated
using (tcg_private.match_is_participant(match_id) and (audience_user_id is null or audience_user_id = auth.uid()));

-- Explicit browser-deny policies make the server-only boundary visible to audits.
create policy "tcg match state browser deny" on public.tcg_match_state_private
for all to authenticated using (false) with check (false);
create policy "tcg match players browser deny" on public.tcg_match_players
for all to authenticated using (false) with check (false);
create policy "tcg match commands browser deny" on public.tcg_match_commands
for all to authenticated using (false) with check (false);

drop function if exists public.tcg_room_is_member(uuid);
drop function if exists public.tcg_match_is_participant(uuid);
