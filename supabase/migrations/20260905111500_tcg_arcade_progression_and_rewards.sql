begin;

-- Arcade is the first playable progression mode. Ranked is reserved by the
-- contract but no ranked rating mutation is enabled by this migration.
alter table public.tcg_rooms
  add column if not exists play_mode text not null default 'arcade';

alter table public.tcg_rooms
  drop constraint if exists tcg_rooms_play_mode_check;

alter table public.tcg_rooms
  add constraint tcg_rooms_play_mode_check
  check (play_mode in ('arcade','ranked'));

alter table public.tcg_matches
  add column if not exists play_mode text not null default 'arcade';

alter table public.tcg_matches
  drop constraint if exists tcg_matches_play_mode_check;

alter table public.tcg_matches
  add constraint tcg_matches_play_mode_check
  check (play_mode in ('arcade','ranked'));

alter table public.tcg_player_profiles
  add column if not exists player_xp bigint not null default 0,
  add column if not exists arcade_matches bigint not null default 0,
  add column if not exists arcade_wins bigint not null default 0,
  add column if not exists arcade_losses bigint not null default 0,
  add column if not exists arcade_win_streak integer not null default 0,
  add column if not exists arcade_best_win_streak integer not null default 0;

alter table public.tcg_player_profiles
  drop constraint if exists tcg_player_profiles_player_xp_check,
  drop constraint if exists tcg_player_profiles_arcade_matches_check,
  drop constraint if exists tcg_player_profiles_arcade_wins_check,
  drop constraint if exists tcg_player_profiles_arcade_losses_check,
  drop constraint if exists tcg_player_profiles_arcade_win_streak_check,
  drop constraint if exists tcg_player_profiles_arcade_best_win_streak_check;

alter table public.tcg_player_profiles
  add constraint tcg_player_profiles_player_xp_check check (player_xp >= 0),
  add constraint tcg_player_profiles_arcade_matches_check check (arcade_matches >= 0),
  add constraint tcg_player_profiles_arcade_wins_check check (arcade_wins >= 0),
  add constraint tcg_player_profiles_arcade_losses_check check (arcade_losses >= 0),
  add constraint tcg_player_profiles_arcade_win_streak_check check (arcade_win_streak >= 0),
  add constraint tcg_player_profiles_arcade_best_win_streak_check check (arcade_best_win_streak >= 0);

create table if not exists public.tcg_mode_reward_config (
  play_mode text primary key,
  participation_xp bigint not null default 0 check (participation_xp >= 0),
  win_bonus_xp bigint not null default 0 check (win_bonus_xp >= 0),
  winner_shop_coins bigint not null default 0 check (winner_shop_coins >= 0),
  loser_shop_coins bigint not null default 0 check (loser_shop_coins >= 0),
  winner_battle_pass_tokens bigint not null default 0 check (winner_battle_pass_tokens >= 0),
  loser_battle_pass_tokens bigint not null default 0 check (loser_battle_pass_tokens >= 0),
  winner_trade_tokens bigint not null default 0 check (winner_trade_tokens >= 0),
  loser_trade_tokens bigint not null default 0 check (loser_trade_tokens >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint tcg_mode_reward_config_play_mode_check check (play_mode in ('arcade','ranked'))
);

insert into public.tcg_mode_reward_config(
  play_mode,
  participation_xp,
  win_bonus_xp,
  winner_shop_coins,
  loser_shop_coins,
  winner_battle_pass_tokens,
  loser_battle_pass_tokens,
  winner_trade_tokens,
  loser_trade_tokens,
  is_active
)
values ('arcade',50,50,25,10,0,0,0,0,true)
on conflict (play_mode) do update
set participation_xp=excluded.participation_xp,
    win_bonus_xp=excluded.win_bonus_xp,
    winner_shop_coins=excluded.winner_shop_coins,
    loser_shop_coins=excluded.loser_shop_coins,
    winner_battle_pass_tokens=excluded.winner_battle_pass_tokens,
    loser_battle_pass_tokens=excluded.loser_battle_pass_tokens,
    winner_trade_tokens=excluded.winner_trade_tokens,
    loser_trade_tokens=excluded.loser_trade_tokens,
    is_active=excluded.is_active,
    updated_at=now();

create table if not exists public.tcg_match_rewards (
  match_id uuid not null references public.tcg_matches(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  play_mode text not null,
  result text not null check (result in ('win','loss')),
  xp_awarded bigint not null default 0 check (xp_awarded >= 0),
  shop_coins_awarded bigint not null default 0 check (shop_coins_awarded >= 0),
  battle_pass_tokens_awarded bigint not null default 0 check (battle_pass_tokens_awarded >= 0),
  trade_tokens_awarded bigint not null default 0 check (trade_tokens_awarded >= 0),
  awarded_at timestamptz not null default now(),
  primary key (match_id,user_id)
);

create index if not exists tcg_match_rewards_user_awarded_idx
  on public.tcg_match_rewards(user_id,awarded_at desc);

alter table public.tcg_mode_reward_config enable row level security;
alter table public.tcg_match_rewards enable row level security;

drop policy if exists "tcg mode reward config authenticated read" on public.tcg_mode_reward_config;
create policy "tcg mode reward config authenticated read"
  on public.tcg_mode_reward_config
  for select
  to authenticated
  using (is_active);

drop policy if exists "tcg match rewards select own" on public.tcg_match_rewards;
create policy "tcg match rewards select own"
  on public.tcg_match_rewards
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.tcg_mode_reward_config from public,anon,authenticated;
revoke all on table public.tcg_match_rewards from public,anon,authenticated;
grant select on table public.tcg_mode_reward_config to authenticated;
grant select on table public.tcg_match_rewards to authenticated;
grant all on table public.tcg_mode_reward_config to service_role;
grant all on table public.tcg_match_rewards to service_role;

create or replace function public.tcg_level_from_xp(p_xp bigint)
returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select greatest(1, least(100, 1 + floor(greatest(coalesce(p_xp,0),0)::numeric / 500)::integer));
$$;

revoke all on function public.tcg_level_from_xp(bigint) from public,anon;
grant execute on function public.tcg_level_from_xp(bigint) to authenticated,service_role;

create or replace function public.tcg_server_award_match_rewards(p_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_match public.tcg_matches%rowtype;
  v_room public.tcg_rooms%rowtype;
  v_cfg public.tcg_mode_reward_config%rowtype;
  v_player record;
  v_result text;
  v_xp bigint;
  v_shop bigint;
  v_battle bigint;
  v_trade bigint;
  v_inserted boolean;
  v_awarded integer := 0;
begin
  select * into v_match
  from public.tcg_matches
  where id=p_match_id
  for update;

  if not found then
    return jsonb_build_object('ok',false,'error','match_not_found');
  end if;

  if v_match.status <> 'finished' or v_match.winner_user_id is null then
    return jsonb_build_object('ok',false,'error','match_not_finished');
  end if;

  select * into v_room
  from public.tcg_rooms
  where id=v_match.room_id;

  if not found then
    return jsonb_build_object('ok',false,'error','room_not_found');
  end if;

  -- Only automatic matchmaking earns Arcade progression. Private rooms remain
  -- valid for friend/testing battles but cannot be farmed for economy rewards.
  if v_room.room_mode <> 'matchmaking' or v_match.play_mode <> 'arcade' then
    return jsonb_build_object('ok',true,'eligible',false,'awarded',0);
  end if;

  select * into v_cfg
  from public.tcg_mode_reward_config
  where play_mode=v_match.play_mode and is_active;

  if not found then
    return jsonb_build_object('ok',false,'error','reward_config_missing');
  end if;

  for v_player in
    select user_id from public.tcg_match_players where match_id=p_match_id order by seat
  loop
    v_result := case when v_player.user_id=v_match.winner_user_id then 'win' else 'loss' end;
    v_xp := v_cfg.participation_xp + case when v_result='win' then v_cfg.win_bonus_xp else 0 end;
    v_shop := case when v_result='win' then v_cfg.winner_shop_coins else v_cfg.loser_shop_coins end;
    v_battle := case when v_result='win' then v_cfg.winner_battle_pass_tokens else v_cfg.loser_battle_pass_tokens end;
    v_trade := case when v_result='win' then v_cfg.winner_trade_tokens else v_cfg.loser_trade_tokens end;

    insert into public.tcg_match_rewards(
      match_id,user_id,play_mode,result,xp_awarded,shop_coins_awarded,battle_pass_tokens_awarded,trade_tokens_awarded
    )
    values (p_match_id,v_player.user_id,v_match.play_mode,v_result,v_xp,v_shop,v_battle,v_trade)
    on conflict (match_id,user_id) do nothing
    returning true into v_inserted;

    if coalesce(v_inserted,false) then
      insert into public.tcg_player_profiles(user_id)
      values (v_player.user_id)
      on conflict (user_id) do nothing;

      update public.tcg_player_profiles
      set player_xp=player_xp+v_xp,
          shop_coins=shop_coins+v_shop,
          battle_pass_tokens=battle_pass_tokens+v_battle,
          trade_tokens=trade_tokens+v_trade,
          arcade_matches=arcade_matches+1,
          arcade_wins=arcade_wins + case when v_result='win' then 1 else 0 end,
          arcade_losses=arcade_losses + case when v_result='loss' then 1 else 0 end,
          arcade_win_streak=case when v_result='win' then arcade_win_streak+1 else 0 end,
          arcade_best_win_streak=case when v_result='win' then greatest(arcade_best_win_streak,arcade_win_streak+1) else arcade_best_win_streak end,
          updated_at=now()
      where user_id=v_player.user_id;

      v_awarded := v_awarded + 1;
    end if;

    v_inserted := false;
  end loop;

  return jsonb_build_object('ok',true,'eligible',true,'awarded',v_awarded);
end;
$$;

revoke all on function public.tcg_server_award_match_rewards(uuid) from public,anon,authenticated;
grant execute on function public.tcg_server_award_match_rewards(uuid) to service_role;

create or replace function public.tcg_server_commit_state(
  p_match_id uuid,
  p_actor_user_id uuid,
  p_client_nonce uuid,
  p_expected_revision bigint,
  p_command_type text,
  p_new_state jsonb,
  p_player_one_id uuid,
  p_player_one_view jsonb,
  p_player_two_id uuid,
  p_player_two_view jsonb,
  p_event_type text,
  p_public_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_state public.tcg_match_state_private%rowtype;
  v_existing public.tcg_match_commands%rowtype;
  v_new_revision bigint;
  v_result jsonb;
  v_phase text;
  v_active_seat smallint;
  v_winner_seat smallint;
  v_winner_user_id uuid;
  v_finish_reason text;
  v_rewards jsonb;
begin
  if not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_actor_user_id) then
    return jsonb_build_object('ok',false,'error','actor_not_match_participant');
  end if;

  select * into v_existing
  from public.tcg_match_commands
  where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;

  if found then
    return coalesce(v_existing.result,jsonb_build_object('ok',false,'error','command_already_received')) || jsonb_build_object('duplicate',true);
  end if;

  insert into public.tcg_match_commands(match_id,user_id,client_nonce,expected_revision,command_type,payload,status)
  values (p_match_id,p_actor_user_id,p_client_nonce,p_expected_revision,p_command_type,'{}'::jsonb,'received');

  select * into v_state
  from public.tcg_match_state_private
  where match_id=p_match_id
  for update;

  if not found then
    v_result := jsonb_build_object('ok',false,'error','match_state_not_initialized');
    update public.tcg_match_commands set status='rejected',result=v_result,resolved_at=now()
    where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;
    return v_result;
  end if;

  if v_state.revision <> p_expected_revision then
    v_result := jsonb_build_object('ok',false,'error','stale_revision','expected',v_state.revision,'received',p_expected_revision);
    update public.tcg_match_commands set status='rejected',result=v_result,resolved_at=now()
    where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;
    return v_result;
  end if;

  if not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_one_id and seat=1)
     or not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_two_id and seat=2) then
    v_result := jsonb_build_object('ok',false,'error','view_users_do_not_match_seats');
    update public.tcg_match_commands set status='rejected',result=v_result,resolved_at=now()
    where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;
    return v_result;
  end if;

  v_new_revision := v_state.revision + 1;
  v_phase := coalesce(p_new_state->>'phase','');

  update public.tcg_match_state_private
  set canonical_state=p_new_state,revision=v_new_revision,updated_at=now()
  where match_id=p_match_id;

  insert into public.tcg_match_views(match_id,user_id,revision,view_state)
  values
    (p_match_id,p_player_one_id,v_new_revision,p_player_one_view),
    (p_match_id,p_player_two_id,v_new_revision,p_player_two_view)
  on conflict (match_id,user_id) do update
  set revision=excluded.revision,view_state=excluded.view_state,updated_at=now();

  if v_phase='complete' then
    begin
      v_winner_seat := nullif(p_new_state->'result'->>'winner_seat','')::smallint;
    exception when others then
      v_winner_seat := null;
    end;

    if v_winner_seat not in (1,2) then
      v_result := jsonb_build_object('ok',false,'error','complete_state_requires_valid_winner');
      raise exception using message=v_result::text;
    end if;

    select user_id into v_winner_user_id
    from public.tcg_match_players
    where match_id=p_match_id and seat=v_winner_seat;

    v_finish_reason := coalesce(p_new_state->'result'->>'reason','complete');

    update public.tcg_matches
    set revision=v_new_revision,
        status='finished',
        active_seat=null,
        winner_user_id=v_winner_user_id,
        finish_reason=v_finish_reason,
        finished_at=coalesce(finished_at,now())
    where id=p_match_id;

    update public.tcg_rooms
    set status='closed',closed_at=coalesce(closed_at,now())
    where id=(select room_id from public.tcg_matches where id=p_match_id);

    v_rewards := public.tcg_server_award_match_rewards(p_match_id);
  elsif v_phase='active' then
    begin
      v_active_seat := nullif(p_new_state->>'active_seat','')::smallint;
    exception when others then
      v_active_seat := null;
    end;

    update public.tcg_matches
    set revision=v_new_revision,
        status='active',
        active_seat=case when v_active_seat in (1,2) then v_active_seat else active_seat end,
        started_at=coalesce(started_at,now())
    where id=p_match_id;
  else
    update public.tcg_matches set revision=v_new_revision where id=p_match_id;
  end if;

  insert into public.tcg_match_events(match_id,seq,actor_user_id,event_type,public_payload,audience_user_id)
  values (p_match_id,v_new_revision,p_actor_user_id,p_event_type,coalesce(p_public_payload,'{}'::jsonb),null);

  v_result := jsonb_build_object('ok',true,'revision',v_new_revision,'event_type',p_event_type);
  if v_rewards is not null then
    v_result := v_result || jsonb_build_object('rewards',v_rewards);
  end if;

  update public.tcg_match_commands
  set status='applied',result=v_result,resolved_at=now()
  where match_id=p_match_id and user_id=p_actor_user_id and client_nonce=p_client_nonce;

  return v_result;
end;
$$;

revoke all on function public.tcg_server_commit_state(uuid,uuid,uuid,bigint,text,jsonb,uuid,jsonb,uuid,jsonb,text,jsonb) from public,anon,authenticated;
grant execute on function public.tcg_server_commit_state(uuid,uuid,uuid,bigint,text,jsonb,uuid,jsonb,uuid,jsonb,text,jsonb) to service_role;

commit;