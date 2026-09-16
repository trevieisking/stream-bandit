create table if not exists public.tcg_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_key text not null,
  grant_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, grant_key)
);

alter table public.tcg_grants enable row level security;
create policy "tcg grants browser deny" on public.tcg_grants
for all to authenticated using (false) with check (false);

create index if not exists tcg_grants_user_idx on public.tcg_grants(user_id, created_at desc);

create or replace function public.tcg_server_grant_starter(p_user_id uuid, p_starter_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_starter public.tcg_starter_decks%rowtype;
  v_existing public.tcg_player_profiles%rowtype;
  v_grant_id uuid;
  v_deck_id uuid;
  v_total integer;
begin
  if p_user_id is null or p_starter_id is null then
    raise exception 'user_id and starter_id are required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':tcg-starter', 0));

  select * into v_starter
  from public.tcg_starter_decks
  where starter_id = p_starter_id and is_active
  for share;

  if not found then
    raise exception 'starter_not_found';
  end if;

  select coalesce(sum((e->>'qty')::integer),0)
  into v_total
  from jsonb_array_elements(v_starter.decklist) e;

  if v_total <> 60 then
    raise exception 'starter_recipe_not_60';
  end if;

  insert into public.tcg_player_profiles(user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_existing
  from public.tcg_player_profiles
  where user_id = p_user_id
  for update;

  if v_existing.starter_granted_at is not null then
    if v_existing.chosen_starter_id is distinct from p_starter_id then
      raise exception 'starter_already_chosen';
    end if;

    select d.id into v_deck_id
    from public.tcg_decks d
    where d.owner_id = p_user_id and d.starter_id = p_starter_id
    order by d.created_at
    limit 1;

    return jsonb_build_object(
      'ok', true,
      'already_granted', true,
      'starter_id', p_starter_id,
      'deck_id', v_deck_id
    );
  end if;

  insert into public.tcg_grants(user_id, grant_key, grant_type, payload)
  values (
    p_user_id,
    'starter:' || p_starter_id,
    'starter_deck',
    jsonb_build_object('starter_id',p_starter_id,'rules_version',v_starter.rules_version,'card_total',v_total)
  )
  on conflict (user_id, grant_key) do nothing
  returning id into v_grant_id;

  if v_grant_id is null then
    raise exception 'starter_grant_receipt_conflict';
  end if;

  insert into public.tcg_collections(user_id, card_id, quantity, source)
  select p_user_id, e->>'card_id', (e->>'qty')::integer, 'starter:' || p_starter_id
  from jsonb_array_elements(v_starter.decklist) e
  on conflict (user_id, card_id) do update
  set quantity = public.tcg_collections.quantity + excluded.quantity,
      updated_at = now();

  insert into public.tcg_decks(owner_id, name, primary_element, secondary_element, starter_id, rules_version)
  values (p_user_id, v_starter.name, v_starter.element, null, p_starter_id, v_starter.rules_version)
  returning id into v_deck_id;

  insert into public.tcg_deck_cards(deck_id, card_id, quantity)
  select v_deck_id, e->>'card_id', (e->>'qty')::smallint
  from jsonb_array_elements(v_starter.decklist) e;

  update public.tcg_player_profiles
  set chosen_starter_id = p_starter_id,
      starter_granted_at = now(),
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object(
    'ok', true,
    'already_granted', false,
    'starter_id', p_starter_id,
    'deck_id', v_deck_id,
    'card_total', v_total
  );
end;
$$;

revoke all on function public.tcg_server_grant_starter(uuid,text) from public, anon, authenticated;
grant execute on function public.tcg_server_grant_starter(uuid,text) to service_role;
