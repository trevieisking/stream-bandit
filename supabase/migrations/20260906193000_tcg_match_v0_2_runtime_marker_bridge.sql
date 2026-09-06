-- Stream Bandit TCG v0.2 canonical-state runtime marker bridge.
--
-- Purpose:
-- - preserve legacy definition as gameplay fallback/current authority;
-- - stamp runtime_registry_v0_2 only after every match card sidecar is proven
--   identical to the exact frozen shadow-registry definition;
-- - fail closed on declared-but-invalid registry metadata or incomplete/corrupt sidecars;
-- - preserve idempotent initialization for matches already installed before this bridge.

create or replace function public.tcg_server_install_initial_state(
  p_match_id uuid,
  p_canonical_state jsonb,
  p_player_one_id uuid,
  p_player_one_view jsonb,
  p_player_two_id uuid,
  p_player_two_view jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_match public.tcg_matches%rowtype;
  v_room_id uuid;
  v_state jsonb;
  v_registry_declared boolean := false;
  v_registry_ready boolean := false;
  v_card_index_count integer := 0;
  v_invalid_sidecars integer := 0;
begin
  select * into v_match from public.tcg_matches where id=p_match_id for update;
  if not found then return jsonb_build_object('ok',false,'error','match_not_found'); end if;
  v_room_id := v_match.room_id;

  if not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_one_id)
     or not exists (select 1 from public.tcg_match_players where match_id=p_match_id and user_id=p_player_two_id)
     or p_player_one_id=p_player_two_id then
    return jsonb_build_object('ok',false,'error','view_users_not_match_participants');
  end if;

  -- Preserve the existing idempotent retry contract. Old initialized matches remain valid
  -- legacy-only snapshots and are never retroactively marked as v0.2 authority.
  if exists (select 1 from public.tcg_match_state_private where match_id=p_match_id) then
    return jsonb_build_object('ok',true,'already_initialized',true,'match_id',p_match_id);
  end if;

  if p_canonical_state is null or jsonb_typeof(p_canonical_state) <> 'object' then
    return jsonb_build_object('ok',false,'error','canonical_state_object_required');
  end if;
  v_state := p_canonical_state;

  select exists(
    select 1
    from public.tcg_registry_versions rv
    where rv.registry_id='SB1-set-one-v0.2'
  ) into v_registry_declared;

  select exists(
    select 1
    from public.tcg_registry_versions rv
    where rv.registry_id='SB1-set-one-v0.2'
      and rv.set_code='SB1'
      and rv.card_schema='sb-tcg-card-v0.2'
      and rv.effect_schema='sb-tcg-effects-v0.2'
      and rv.card_count=193
      and rv.registry_sha256='b1bc874a6d3707f5c93cd4067994a12111416da636cb15048d10e109829b1c00'
      and rv.is_runtime_authority=false
  ) into v_registry_ready;

  if v_registry_declared and not v_registry_ready then
    return jsonb_build_object('ok',false,'error','tcg_v0_2_registry_metadata_mismatch');
  end if;

  if v_registry_ready then
    if jsonb_typeof(v_state->'card_index') <> 'object' then
      return jsonb_build_object('ok',false,'error','tcg_v0_2_snapshot_card_index_required');
    end if;

    select count(*)::int into v_card_index_count
    from jsonb_each(v_state->'card_index');
    if v_card_index_count <= 0 then
      return jsonb_build_object('ok',false,'error','tcg_v0_2_snapshot_card_index_empty');
    end if;

    select count(*)::int into v_invalid_sidecars
    from jsonb_each(v_state->'card_index') as e(card_id,entry)
    left join public.tcg_card_definition_versions cv
      on cv.registry_id='SB1-set-one-v0.2'
     and cv.card_id=e.card_id
     and cv.set_code='SB1'
     and cv.card_schema='sb-tcg-card-v0.2'
     and cv.effect_schema='sb-tcg-effects-v0.2'
    where cv.card_id is null
       or jsonb_typeof(e.entry) <> 'object'
       or e.entry->'definition_v0_2' is distinct from cv.definition
       or coalesce(e.entry->'definition_v0_2'->>'id','') <> e.card_id
       or coalesce(e.entry->'definition_v0_2'->>'schema','') <> 'sb-tcg-card-v0.2'
       or coalesce(e.entry->'definition_v0_2'->>'effect_schema','') <> 'sb-tcg-effects-v0.2'
       or coalesce(e.entry->>'definition_v0_2_rules_version','') <> 'sb-tcg-card-v0.2';

    if v_invalid_sidecars <> 0 then
      return jsonb_build_object(
        'ok',false,
        'error','tcg_v0_2_snapshot_sidecar_mismatch',
        'invalid_count',v_invalid_sidecars
      );
    end if;

    v_state := jsonb_set(
      v_state,
      '{runtime_registry_v0_2}',
      jsonb_build_object(
        'registry_id','SB1-set-one-v0.2',
        'set_code','SB1',
        'card_schema','sb-tcg-card-v0.2',
        'effect_schema','sb-tcg-effects-v0.2',
        'card_count',193,
        'registry_sha256','b1bc874a6d3707f5c93cd4067994a12111416da636cb15048d10e109829b1c00',
        'runtime_authority',false,
        'source','match_initial_state_install'
      ),
      true
    );
  else
    -- A caller cannot manufacture a v0.2 marker when the frozen registry is absent.
    v_state := v_state - 'runtime_registry_v0_2';
  end if;

  insert into public.tcg_match_state_private(match_id,revision,canonical_state,rng_state)
  values (p_match_id,0,v_state,jsonb_build_object('source','edge-webcrypto-v0.1'))
  on conflict (match_id) do nothing;

  if not found then
    return jsonb_build_object('ok',true,'already_initialized',true,'match_id',p_match_id);
  end if;

  insert into public.tcg_match_views(match_id,user_id,revision,view_state)
  values
    (p_match_id,p_player_one_id,0,p_player_one_view),
    (p_match_id,p_player_two_id,0,p_player_two_view)
  on conflict (match_id,user_id) do update set revision=excluded.revision,view_state=excluded.view_state,updated_at=now();

  update public.tcg_rooms set status='in_match' where id=v_room_id;
  update public.tcg_matches set started_at=coalesce(started_at,now()),revision=0,status='setup' where id=p_match_id;

  return jsonb_build_object('ok',true,'already_initialized',false,'match_id',p_match_id,'revision',0,'status','setup');
end;
$$;

revoke all on function public.tcg_server_install_initial_state(uuid,jsonb,uuid,jsonb,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.tcg_server_install_initial_state(uuid,jsonb,uuid,jsonb,uuid,jsonb) to service_role;
