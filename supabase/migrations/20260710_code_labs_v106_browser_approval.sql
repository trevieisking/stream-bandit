create or replace function public.code_labs_approve_sol_v106(
  p_session_id uuid,
  p_browser_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.code_labs_browser_sessions%rowtype;
  v_approval_hash text := encode(digest('SOLAPPROVE', 'sha256'), 'hex');
begin
  if v_user_id is null then
    raise exception 'Sign in to Code Labs first.';
  end if;

  if not exists (select 1 from public.code_labs_owners where user_id = v_user_id) then
    raise exception 'This Code Labs account is not an approved owner.';
  end if;

  if p_session_id is null or coalesce(p_browser_secret, '') = '' then
    raise exception 'Open and pair the Code Labs workspace first.';
  end if;

  select * into v_session
  from public.code_labs_browser_sessions
  where id = p_session_id
    and owner_id = v_user_id
    and browser_secret_hash = encode(digest(p_browser_secret, 'sha256'), 'hex')
  limit 1;

  if v_session.id is null then
    raise exception 'This Sol pairing is not valid for the signed-in owner.';
  end if;

  if v_session.status = 'paired' then
    return jsonb_build_object('ok', true, 'status', 'paired', 'message', 'Sol is already connected.');
  end if;

  if v_session.status <> 'pairing' then
    raise exception 'Create a fresh pairing first.';
  end if;

  if v_session.pairing_expires_at < now() then
    update public.code_labs_browser_sessions
      set status = 'expired', updated_at = now()
      where id = v_session.id;
    raise exception 'This pairing expired. Create a fresh pairing first.';
  end if;

  update public.code_labs_browser_sessions
  set pairing_code_hash = encode(digest(id::text || clock_timestamp()::text, 'sha256'), 'hex'),
      updated_at = now()
  where id <> v_session.id
    and pairing_code_hash = v_approval_hash;

  update public.code_labs_browser_sessions
  set pairing_code_hash = v_approval_hash,
      updated_at = now(),
      last_seen_at = now()
  where id = v_session.id;

  return jsonb_build_object(
    'ok', true,
    'status', 'approved',
    'message', 'Sol may now claim this browser session.'
  );
end;
$$;

revoke all on function public.code_labs_approve_sol_v106(uuid, text) from public;
revoke execute on function public.code_labs_approve_sol_v106(uuid, text) from anon;
grant execute on function public.code_labs_approve_sol_v106(uuid, text) to authenticated;
