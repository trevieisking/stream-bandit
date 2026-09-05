create table if not exists public.tcg_card_printings (
  printing_id text primary key,
  card_id text not null references public.tcg_card_definitions(card_id) on update cascade on delete restrict,
  set_code text not null default 'SB1',
  card_number integer,
  edition_code text not null default 'standard',
  display_name text,
  rarity text,
  art_url text,
  art_storage_path text,
  frame_variant text,
  foil_variant text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tcg_card_printings_card_number_positive check (card_number is null or card_number > 0),
  constraint tcg_card_printings_card_edition_unique unique (card_id, edition_code)
);

create unique index if not exists tcg_card_printings_one_default_per_card
  on public.tcg_card_printings(card_id)
  where is_default;

create index if not exists tcg_card_printings_card_id_idx
  on public.tcg_card_printings(card_id);

alter table public.tcg_card_printings enable row level security;

create policy "tcg card printings authenticated read"
  on public.tcg_card_printings
  for select
  to authenticated
  using (is_active);

grant select on public.tcg_card_printings to authenticated;
revoke insert, update, delete on public.tcg_card_printings from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tcg-card-art',
  'tcg-card-art',
  true,
  10485760,
  array['image/png','image/jpeg','image/webp']::text[]
)
on conflict (id) do nothing;