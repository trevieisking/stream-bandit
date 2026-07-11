create table if not exists public.code_labs_live_connections_v107 (
  id uuid primary key,
  owner_id uuid references public.code_labs_owners(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','closed','expired')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  closed_at timestamptz
);

alter table public.code_labs_live_connections_v107 enable row level security;
revoke all on table public.code_labs_live_connections_v107 from public, anon, authenticated;

create or replace function public.code_labs_live_register_v107(p_connection_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_status text;
begin
  if p_connection_id is null then
    raise exception 'A ChatGPT session identifier is required.';
  end if;

  if not exists (
    select 1
    from public.code_labs_browser_sessions
    where status in ('pairing','paired')
      and last_seen_at > now() - interval '45 seconds'
      and coalesce(control_expires_at, pairing_expires_at) > now()
  ) then
    raise exception 'Open Sol Control, open the Code Labs workspace, and pair it before connecting ChatGPT.';
  end if;

  insert into public.code_labs_live_connections_v107 (id, status, created_at, expires_at)
  values (p_connection_id, 'pending', now(), now() + interval '10 minutes')
  on conflict (id) do update
    set created_at = case
          when code_labs_live_connections_v107.status in ('closed','expired') then now()
          else code_labs_live_connections_v107.created_at
        end,
        expires_at = case
          when code_labs_live_connections_v107.status = 'approved' then code_labs_live_connections_v107.expires_at
          else now() + interval '10 minutes'
        end,
        status = case
          when code_labs_live_connections_v107.status = 'approved' and code_labs_live_connections_v107.expires_at > now()
            then 'approved'
          else 'pending'
        end,
        closed_at = null;

  select status into v_status
  from public.code_labs_live_connections_v107
  where id = p_connection_id;

  return jsonb_build_object('ok', true, 'status', v_status, 'connection_id', p_connection_id);
end;
$$;

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

  if v_session.status = 'paired' and v_session.control_expires_at > now() then
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

  select * into v_connection
  from public.code_labs_live_connections_v107
  where status = 'pending'
    and expires_at > now()
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
    'message', 'Approval saved. Return to ChatGPT and retry the live read.'
  );
end;
$$;

create or replace function public.code_labs_live_read_v107(p_connection_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_connection public.code_labs_live_connections_v107%rowtype;
  v_session public.code_labs_browser_sessions%rowtype;
begin
  select * into v_connection
  from public.code_labs_live_connections_v107
  where id = p_connection_id
    and status = 'approved'
    and expires_at > now()
  limit 1;

  if v_connection.id is null then
    raise exception 'This ChatGPT session is waiting for browser approval.';
  end if;

  select * into v_session
  from public.code_labs_browser_sessions
  where claimed_by = p_connection_id::text
    and status = 'paired'
    and control_expires_at > now()
  order by paired_at desc
  limit 1;

  if v_session.id is null then
    raise exception 'No active browser-approved Code Labs session was found.';
  end if;

  return jsonb_build_object(
    'ok', true,
    'version', 'Code Labs Live V107 session bridge',
    'session_id', v_session.id,
    'status', v_session.status,
    'page', v_session.page_name,
    'page_url', v_session.page_url,
    'page_fingerprint', v_session.page_fingerprint,
    'last_seen_at', v_session.last_seen_at,
    'online', (v_session.last_seen_at > now() - interval '15 seconds'),
    'expires_at', v_session.control_expires_at,
    'page_snapshot', v_session.page_snapshot,
    'last_receipt', v_session.last_receipt
  );
end;
$$;

create or replace function public.code_labs_live_enqueue_v107(
  p_connection_id uuid,
  p_command jsonb,
  p_dangerous boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.code_labs_browser_sessions%rowtype;
  v_command public.code_labs_browser_commands%rowtype;
begin
  if not exists (
    select 1 from public.code_labs_live_connections_v107
    where id = p_connection_id
      and status = 'approved'
      and expires_at > now()
  ) then
    raise exception 'This ChatGPT session is not approved.';
  end if;

  select * into v_session
  from public.code_labs_browser_sessions
  where claimed_by = p_connection_id::text
    and status = 'paired'
    and control_expires_at > now()
  order by paired_at desc
  limit 1;

  if v_session.id is null then
    raise exception 'No active browser-approved Code Labs session was found.';
  end if;

  if v_session.last_seen_at < now() - interval '30 seconds' then
    raise exception 'The paired Code Labs tab is offline.';
  end if;

  if p_command is null or jsonb_typeof(p_command) <> 'object' then
    raise exception 'A valid command object is required.';
  end if;

  if pg_column_size(p_command) > 300000 then
    raise exception 'The live command is too large.';
  end if;

  insert into public.code_labs_browser_commands (
    session_id,
    requested_by,
    command,
    dangerous
  ) values (
    v_session.id,
    'code-labs-live-v107',
    p_command,
    coalesce(p_dangerous, false)
  )
  returning * into v_command;

  return jsonb_build_object(
    'ok', true,
    'version', 'Code Labs Live V107 session bridge',
    'command_id', v_command.id,
    'status', v_command.status,
    'page', v_session.page_name,
    'page_fingerprint', v_session.page_fingerprint
  );
end;
$$;

create or replace function public.code_labs_live_receipt_v107(
  p_connection_id uuid,
  p_command_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.code_labs_browser_sessions%rowtype;
  v_command public.code_labs_browser_commands%rowtype;
begin
  if not exists (
    select 1 from public.code_labs_live_connections_v107
    where id = p_connection_id
      and status = 'approved'
      and expires_at > now()
  ) then
    raise exception 'This ChatGPT session is not approved.';
  end if;

  select * into v_session
  from public.code_labs_browser_sessions
  where claimed_by = p_connection_id::text
    and status = 'paired'
    and control_expires_at > now()
  order by paired_at desc
  limit 1;

  if v_session.id is null then
    raise exception 'No active browser-approved Code Labs session was found.';
  end if;

  if p_command_id is null then
    return jsonb_build_object(
      'ok', true,
      'version', 'Code Labs Live V107 session bridge',
      'session_id', v_session.id,
      'receipt', v_session.last_receipt
    );
  end if;

  select * into v_command
  from public.code_labs_browser_commands
  where id = p_command_id
    and session_id = v_session.id
  limit 1;

  if v_command.id is null then
    raise exception 'Command receipt not found.';
  end if;

  return jsonb_build_object(
    'ok', true,
    'version', 'Code Labs Live V107 session bridge',
    'command_id', v_command.id,
    'status', v_command.status,
    'receipt', v_command.receipt,
    'error', v_command.error
  );
end;
$$;

create or replace function public.code_labs_live_close_v107(p_connection_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  select id into v_session_id
  from public.code_labs_browser_sessions
  where claimed_by = p_connection_id::text
    and status = 'paired'
  order by paired_at desc
  limit 1;

  if v_session_id is not null then
    update public.code_labs_browser_sessions
    set status = 'closed', updated_at = now()
    where id = v_session_id;

    update public.code_labs_browser_commands
    set status = 'cancelled', completed_at = now()
    where session_id = v_session_id
      and status in ('queued','running');
  end if;

  update public.code_labs_live_connections_v107
  set status = 'closed', closed_at = now(), expires_at = now()
  where id = p_connection_id;

  return jsonb_build_object('ok', true, 'status', 'closed');
end;
$$;

revoke all on function public.code_labs_live_register_v107(uuid) from public;
revoke all on function public.code_labs_approve_sol_v106(uuid, text) from public;
revoke all on function public.code_labs_live_read_v107(uuid) from public;
revoke all on function public.code_labs_live_enqueue_v107(uuid, jsonb, boolean) from public;
revoke all on function public.code_labs_live_receipt_v107(uuid, uuid) from public;
revoke all on function public.code_labs_live_close_v107(uuid) from public;

grant execute on function public.code_labs_live_register_v107(uuid) to anon, authenticated;
grant execute on function public.code_labs_approve_sol_v106(uuid, text) to authenticated;
grant execute on function public.code_labs_live_read_v107(uuid) to anon, authenticated;
grant execute on function public.code_labs_live_enqueue_v107(uuid, jsonb, boolean) to anon, authenticated;
grant execute on function public.code_labs_live_receipt_v107(uuid, uuid) to anon, authenticated;
grant execute on function public.code_labs_live_close_v107(uuid) to anon, authenticated;
