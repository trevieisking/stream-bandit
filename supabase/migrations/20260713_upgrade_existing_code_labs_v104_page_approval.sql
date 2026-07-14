-- Preserve the existing V107 approval path and add a separate direct V104 page approval RPC.
-- No tables are created or changed.

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
  v_connection public.code_labs_live_connections_v107%rowtype;
  v_pending_count integer;
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

  if v_session.status not in ('pairing', 'paired') then
    raise exception 'Create a fresh pairing first.';
  end if;

  if v_session.status = 'pairing' and v_session.pairing_expires_at < now() then
    update public.code_labs_browser_sessions
      set status = 'expired', updated_at = now()
      where id = v_session.id;
    raise exception 'This pairing expired. Create a fresh pairing first.';
  end if;

  if v_session.status = 'paired' and (v_session.control_expires_at is null or v_session.control_expires_at < now()) then
    update public.code_labs_browser_sessions
      set status = 'expired', updated_at = now()
      where id = v_session.id;
    raise exception 'This Sol connection expired. Create a fresh pairing first.';
  end if;

  update public.code_labs_live_connections_v107
  set status = 'expired', expires_at = now()
  where status = 'pending'
    and (expires_at <= now() or created_at < now() - interval '2 minutes');

  select count(*) into v_pending_count
  from public.code_labs_live_connections_v107
  where status = 'pending'
    and expires_at > now()
    and created_at >= now() - interval '2 minutes';

  if v_pending_count <> 1 then
    raise exception 'Exactly one fresh ChatGPT connection must be waiting. Return to ChatGPT, start the live connection once, then press Approve Sol.';
  end if;

  select * into v_connection
  from public.code_labs_live_connections_v107
  where status = 'pending'
    and expires_at > now()
    and created_at >= now() - interval '2 minutes'
  order by created_at desc
  limit 1
  for update skip locked;

  if v_connection.id is not null then
    update public.code_labs_live_connections_v107
    set owner_id = v_user_id,
        status = 'approved',
        approved_at = now(),
        expires_at = now() + interval '8 hours'
    where id = v_connection.id;

    update public.code_labs_browser_sessions
    set status = 'paired',
        claimed_by = v_connection.id::text,
        control_expires_at = now() + interval '8 hours',
        paired_at = now(),
        updated_at = now(),
        last_seen_at = now()
    where id = v_session.id;

    return jsonb_build_object(
      'ok', true,
      'status', 'approved',
      'message', 'Sol is connected to this browser-approved ChatGPT session.'
    );
  end if;

  raise exception 'The pending ChatGPT connection could not be claimed. Return to ChatGPT and start the live connection again.';
end;
$$;

create or replace function public.code_labs_approve_v104_page(
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

  if v_session.claimed_by is not null and v_session.claimed_by <> 'code-labs-v104' then
    raise exception 'This page session is already owned by another connector.';
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
  where id = v_session.id
    and (claimed_by is null or claimed_by = 'code-labs-v104');

  if not found then
    raise exception 'This page session is already owned by another connector.';
  end if;

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

revoke all on function public.code_labs_approve_v104_page(uuid, text) from public, anon;
grant execute on function public.code_labs_approve_v104_page(uuid, text) to authenticated;
