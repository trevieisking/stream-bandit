begin;

-- G0R-08: a deck that passes validation must be capable of entering setup.
-- The current private-alpha setup runtime treats exactly these recipe types as
-- opening/setup legal: Creature — Baby, Creature — Standalone, Creature — Mythic.
-- Preserve every existing validation rule and add only this missing invariant.
create or replace function public.tcg_server_validate_deck(p_user_id uuid, p_deck_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deck public.tcg_decks%rowtype;
  v_total integer := 0;
  v_missing integer := 0;
  v_overcopies integer := 0;
  v_mythic_overcopies integer := 0;
  v_element_mismatch integer := 0;
  v_unknown integer := 0;
  v_setup_eligible integer := 0;
  v_errors jsonb := '[]'::jsonb;
begin
  select * into v_deck
  from public.tcg_decks
  where id = p_deck_id and owner_id = p_user_id;

  if not found then
    return jsonb_build_object('ok',false,'errors',jsonb_build_array('deck_not_found_or_not_owned'));
  end if;

  select coalesce(sum(dc.quantity),0)::int,
         count(*) filter (where cd.card_id is null)::int
  into v_total, v_unknown
  from public.tcg_deck_cards dc
  left join public.tcg_card_definitions cd on cd.card_id = dc.card_id and cd.is_active
  where dc.deck_id = p_deck_id;

  select count(*)::int into v_missing
  from public.tcg_deck_cards dc
  left join public.tcg_collections c
    on c.user_id = p_user_id and c.card_id = dc.card_id
  where dc.deck_id = p_deck_id
    and coalesce(c.quantity,0) < dc.quantity;

  -- Deck-copy authority follows gameplay identity, not a global Mythic/Legendary count.
  -- Essence uses its separate global allowance; ordinary non-Essence identities max at 4;
  -- each Mythic identity maxes at 1.
  select
    (count(*) filter (where not x.essence and not x.mythic and x.qty > 4))::int,
    (count(*) filter (where x.mythic and x.qty > 1))::int
  into v_overcopies, v_mythic_overcopies
  from (
    select cd.card_id,
           sum(dc.quantity)::int as qty,
           bool_or(cd.card_family = 'Essence') as essence,
           bool_or(
             coalesce(cd.definition->>'recipe_type','') = 'Creature — Mythic'
             or coalesce(cd.definition->'traits','[]'::jsonb) ? 'Mythic'
           ) as mythic
    from public.tcg_deck_cards dc
    join public.tcg_card_definitions cd on cd.card_id = dc.card_id
    where dc.deck_id = p_deck_id
    group by cd.card_id
  ) x;

  select count(*)::int into v_element_mismatch
  from public.tcg_deck_cards dc
  join public.tcg_card_definitions cd on cd.card_id = dc.card_id
  where dc.deck_id = p_deck_id
    and cd.element not in (v_deck.primary_element, coalesce(v_deck.secondary_element,v_deck.primary_element), 'Prismatic');

  -- Opening/setup legality must match the current server-authoritative runtime.
  -- Count copies rather than identities so this remains a direct deck-content invariant.
  select coalesce(sum(dc.quantity),0)::int into v_setup_eligible
  from public.tcg_deck_cards dc
  join public.tcg_card_definitions cd
    on cd.card_id = dc.card_id
   and cd.is_active
  where dc.deck_id = p_deck_id
    and coalesce(cd.definition->>'recipe_type','') in (
      'Creature — Baby',
      'Creature — Standalone',
      'Creature — Mythic'
    );

  if v_total <> 60 then v_errors := v_errors || jsonb_build_array('deck_must_contain_exactly_60_cards'); end if;
  if v_unknown > 0 then v_errors := v_errors || jsonb_build_array('deck_contains_unknown_or_inactive_card'); end if;
  if v_missing > 0 then v_errors := v_errors || jsonb_build_array('deck_exceeds_owned_card_quantities'); end if;
  if v_overcopies > 0 then v_errors := v_errors || jsonb_build_array('deck_exceeds_four_copy_identity_limit'); end if;
  if v_mythic_overcopies > 0 then v_errors := v_errors || jsonb_build_array('deck_exceeds_one_copy_mythic_identity_limit'); end if;
  if v_element_mismatch > 0 then v_errors := v_errors || jsonb_build_array('deck_contains_cards_outside_declared_elements'); end if;
  if v_setup_eligible = 0 then v_errors := v_errors || jsonb_build_array('deck_requires_setup_eligible_creature'); end if;

  return jsonb_build_object(
    'ok', jsonb_array_length(v_errors)=0,
    'deck_id', p_deck_id,
    'total_cards', v_total,
    'setup_eligible_creature_copies', v_setup_eligible,
    'errors', v_errors
  );
end;
$$;

commit;
