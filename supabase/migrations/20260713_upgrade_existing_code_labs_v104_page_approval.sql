-- Upgrade the existing Code Labs page approval function for direct V104 use.
-- V104 binds only to its own fixed connector identity.
-- Legacy/V107 pending sessions are never auto-claimed.
-- Creates no new function or table.

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
begin
  if v_user_id is null then
    raise exception 'Sign in to Code Labs first.';
  end if;

  if not exists (
    select 1 from public.code_labs_owners where user_id = v_user_id
  ) then
    raise exception 'This Code Labs account is not an approved owner.';
  end if;

  if p_session_id is null or coalesce(p_browser_secret, '') = '' then
    raise exception 'A live Code Labs page session is required.';
  end if;

  select * into v_session
  from public.code_labs_browser_sessions
  where id = p_session_id
    and owner_id = v_user_id
    and browser_secret_hash = encode(digest(p_browser_secret, 'sha256'), 'hex')
  limit 1;

  if v_session.id is null then
    raise exception 'This live Code Labs page session is not valid for the signed-in owner.';
  end if;

  if v_session.status not in ('pairing', 'paired') then
    raise exception 'Create a fresh live Code Labs page session first.';
  end if;

  if v_session.status = 'pairing' and v_session.pairing_expires_at < now() then
    update public.code_labs_browser_sessions
      set status = 'expired', updated_at = now()
      where id = v_session.id;
    raise exception 'This live Code Labs page session expired.';
  end if;

  if v_session.status = 'paired'
     and (v_session.control_expires_at is null or v_session.control_expires_at < now()) then
    update public.code_labs_browser_sessions
      set status = 'expired', updated_at = now()
      where id = v_session.id;
    raise exception 'This live Code Labs page session expired.';
  end if;

  update public.code_labs_browser_sessions
  set status = 'paired',
      claimed_by = 'code-labs-v104',
      control_expires_at = now() + interval '8 hours',
      paired_at = coalesce(paired_at, now()),
      updated_at = now(),
      last_seen_at = now()
  where id = v_session.id;

  return jsonb_build_object(
    'ok', true,
    'status', 'approved',
    'connector', 'code-labs-v104',
    'message', 'The signed-in Code Labs page is approved for the existing V104 connector.'
  );
end;
$$;

revoke all on function public.code_labs_approve_sol_v106(uuid, text) from public, anon;
grant execute on function public.code_labs_approve_sol_v106(uuid, text) to authenticated;
