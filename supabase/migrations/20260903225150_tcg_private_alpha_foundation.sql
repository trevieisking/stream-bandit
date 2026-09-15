create table if not exists public.tcg_card_definitions (
  card_id text primary key,
  set_code text not null default 'SB1',
  name text not null,
  element text,
  card_family text not null check (card_family in ('Creature','Tactic','Essence')),
  definition jsonb not null,
  art_url text,
  rules_version text not null default 'set-one-v0.6.1',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tcg_starter_decks (
  starter_id text primary key,
  element text not null check (element in ('Ember','Tide','Grove','Volt','Stone','Gale','Shade','Astral')),
  name text not null,
  deck_box text,
  identity text,
  signature_effect text,
  deck_size smallint not null default 60 check (deck_size = 60),
  decklist jsonb not null,
  rules_version text not null default 'set-one-v0.6.1',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tcg_player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chosen_starter_id text references public.tcg_starter_decks(starter_id),
  starter_granted_at timestamptz,
  bandit_tokens bigint not null default 0 check (bandit_tokens >= 0),
  battle_pass_tickets bigint not null default 0 check (battle_pass_tickets >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tcg_collections (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null references public.tcg_card_definitions(card_id) on delete restrict,
  quantity integer not null default 0 check (quantity >= 0),
  source text not null default 'system',
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table if not exists public.tcg_decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  primary_element text not null check (primary_element in ('Ember','Tide','Grove','Volt','Stone','Gale','Shade','Astral')),
  secondary_element text check (secondary_element is null or secondary_element in ('Ember','Tide','Grove','Volt','Stone','Gale','Shade','Astral')),
  starter_id text references public.tcg_starter_decks(starter_id),
  rules_version text not null default 'set-one-v0.6.1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tcg_deck_cards (
  deck_id uuid not null references public.tcg_decks(id) on delete cascade,
  card_id text not null references public.tcg_card_definitions(card_id) on delete restrict,
  quantity smallint not null check (quantity between 1 and 60),
  primary key (deck_id, card_id)
);

create table if not exists public.tcg_rooms (
  id uuid primary key default gen_random_uuid(),
  join_code text not null unique check (join_code ~ '^[A-Z2-9]{6}$'),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting','locked','in_match','closed')),
  max_players smallint not null default 2 check (max_players = 2),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '6 hours'),
  closed_at timestamptz
);

create table if not exists public.tcg_room_members (
  room_id uuid not null references public.tcg_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat smallint not null check (seat in (1,2)),
  selected_deck_id uuid references public.tcg_decks(id) on delete set null,
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id),
  unique (room_id, seat)
);

create table if not exists public.tcg_matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.tcg_rooms(id) on delete restrict,
  rules_version text not null default 'set-one-v0.6.1',
  status text not null default 'setup' check (status in ('setup','active','finished','abandoned')),
  revision bigint not null default 0 check (revision >= 0),
  active_seat smallint check (active_seat is null or active_seat in (1,2)),
  winner_user_id uuid references auth.users(id) on delete set null,
  finish_reason text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.tcg_match_players (
  match_id uuid not null references public.tcg_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat smallint not null check (seat in (1,2)),
  deck_id uuid references public.tcg_decks(id) on delete set null,
  deck_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  primary key (match_id, user_id),
  unique (match_id, seat)
);

create table if not exists public.tcg_match_state_private (
  match_id uuid primary key references public.tcg_matches(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  canonical_state jsonb not null default '{}'::jsonb,
  rng_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.tcg_match_views (
  match_id uuid not null references public.tcg_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  view_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create table if not exists public.tcg_match_events (
  match_id uuid not null references public.tcg_matches(id) on delete cascade,
  seq bigint not null check (seq > 0),
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  public_payload jsonb not null default '{}'::jsonb,
  audience_user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (match_id, seq)
);

create table if not exists public.tcg_match_commands (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.tcg_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  client_nonce uuid not null,
  expected_revision bigint not null check (expected_revision >= 0),
  command_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','applied','rejected')),
  result jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (match_id, user_id, client_nonce)
);

create index if not exists tcg_decks_owner_idx on public.tcg_decks(owner_id);
create index if not exists tcg_rooms_host_status_idx on public.tcg_rooms(host_user_id, status);
create index if not exists tcg_room_members_user_idx on public.tcg_room_members(user_id);
create index if not exists tcg_match_players_user_idx on public.tcg_match_players(user_id);
create index if not exists tcg_match_views_user_idx on public.tcg_match_views(user_id, match_id);
create index if not exists tcg_match_events_audience_idx on public.tcg_match_events(match_id, audience_user_id, seq);
create index if not exists tcg_match_commands_nonce_idx on public.tcg_match_commands(match_id, user_id, client_nonce);

create or replace function public.tcg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.tcg_room_is_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tcg_room_members m
    where m.room_id = p_room_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.tcg_match_is_participant(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tcg_match_players p
    where p.match_id = p_match_id and p.user_id = auth.uid()
  );
$$;

revoke all on function public.tcg_room_is_member(uuid) from public;
revoke all on function public.tcg_match_is_participant(uuid) from public;
grant execute on function public.tcg_room_is_member(uuid) to authenticated;
grant execute on function public.tcg_match_is_participant(uuid) to authenticated;

create trigger tcg_card_definitions_updated_at before update on public.tcg_card_definitions for each row execute function public.tcg_set_updated_at();
create trigger tcg_starter_decks_updated_at before update on public.tcg_starter_decks for each row execute function public.tcg_set_updated_at();
create trigger tcg_player_profiles_updated_at before update on public.tcg_player_profiles for each row execute function public.tcg_set_updated_at();
create trigger tcg_collections_updated_at before update on public.tcg_collections for each row execute function public.tcg_set_updated_at();
create trigger tcg_decks_updated_at before update on public.tcg_decks for each row execute function public.tcg_set_updated_at();
create trigger tcg_match_state_private_updated_at before update on public.tcg_match_state_private for each row execute function public.tcg_set_updated_at();
create trigger tcg_match_views_updated_at before update on public.tcg_match_views for each row execute function public.tcg_set_updated_at();

alter table public.tcg_card_definitions enable row level security;
alter table public.tcg_starter_decks enable row level security;
alter table public.tcg_player_profiles enable row level security;
alter table public.tcg_collections enable row level security;
alter table public.tcg_decks enable row level security;
alter table public.tcg_deck_cards enable row level security;
alter table public.tcg_rooms enable row level security;
alter table public.tcg_room_members enable row level security;
alter table public.tcg_matches enable row level security;
alter table public.tcg_match_players enable row level security;
alter table public.tcg_match_state_private enable row level security;
alter table public.tcg_match_views enable row level security;
alter table public.tcg_match_events enable row level security;
alter table public.tcg_match_commands enable row level security;

create policy "tcg card definitions authenticated read" on public.tcg_card_definitions for select to authenticated using (is_active);
create policy "tcg starter decks authenticated read" on public.tcg_starter_decks for select to authenticated using (is_active);
create policy "tcg player profile select own" on public.tcg_player_profiles for select to authenticated using (user_id = auth.uid());
create policy "tcg collections select own" on public.tcg_collections for select to authenticated using (user_id = auth.uid());

create policy "tcg decks select own" on public.tcg_decks for select to authenticated using (owner_id = auth.uid());
create policy "tcg decks insert own" on public.tcg_decks for insert to authenticated with check (owner_id = auth.uid());
create policy "tcg decks update own" on public.tcg_decks for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "tcg decks delete own" on public.tcg_decks for delete to authenticated using (owner_id = auth.uid());

create policy "tcg deck cards select own" on public.tcg_deck_cards for select to authenticated using (exists (select 1 from public.tcg_decks d where d.id = deck_id and d.owner_id = auth.uid()));
create policy "tcg deck cards insert own" on public.tcg_deck_cards for insert to authenticated with check (exists (select 1 from public.tcg_decks d where d.id = deck_id and d.owner_id = auth.uid()));
create policy "tcg deck cards update own" on public.tcg_deck_cards for update to authenticated using (exists (select 1 from public.tcg_decks d where d.id = deck_id and d.owner_id = auth.uid())) with check (exists (select 1 from public.tcg_decks d where d.id = deck_id and d.owner_id = auth.uid()));
create policy "tcg deck cards delete own" on public.tcg_deck_cards for delete to authenticated using (exists (select 1 from public.tcg_decks d where d.id = deck_id and d.owner_id = auth.uid()));

create policy "tcg rooms participant read" on public.tcg_rooms for select to authenticated using (public.tcg_room_is_member(id));
create policy "tcg room members participant read" on public.tcg_room_members for select to authenticated using (public.tcg_room_is_member(room_id));
create policy "tcg matches participant read" on public.tcg_matches for select to authenticated using (public.tcg_match_is_participant(id));
create policy "tcg match views own read" on public.tcg_match_views for select to authenticated using (user_id = auth.uid() and public.tcg_match_is_participant(match_id));
create policy "tcg match events participant read" on public.tcg_match_events for select to authenticated using (public.tcg_match_is_participant(match_id) and (audience_user_id is null or audience_user_id = auth.uid()));

-- No browser write/read policies are deliberately created for canonical match state,
-- match player deck snapshots, or command processing. Trusted server code owns them.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.tcg_match_views;
    alter publication supabase_realtime add table public.tcg_match_events;
  end if;
end $$;
