-- Manic Records audience metrics.
-- Persistent viewed count lives in Postgres. Active viewers use Supabase Realtime Presence in the browser.

begin;

alter table public.manic_tracks
  add column if not exists view_count bigint not null default 0;

alter table public.manic_tracks
  drop constraint if exists manic_tracks_view_count_check;

alter table public.manic_tracks
  add constraint manic_tracks_view_count_check check (view_count >= 0);

create or replace function public.manic_increment_track_view(p_track_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  update public.manic_tracks
     set view_count = view_count + 1,
         updated_at = now()
   where id = p_track_id
     and (
       (visibility = 'public' and status = 'published')
       or created_by = auth.uid()
     )
  returning view_count into v_count;

  if v_count is null then
    raise exception 'Track is not viewable';
  end if;

  return v_count;
end;
$$;

revoke all on function public.manic_increment_track_view(uuid) from public;
grant execute on function public.manic_increment_track_view(uuid) to anon, authenticated;

comment on function public.manic_increment_track_view(uuid) is
  'Atomically increments Manic Records viewed count for a public published track or the signed-in owner private track.';

commit;
