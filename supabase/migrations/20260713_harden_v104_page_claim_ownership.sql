-- Keep V104 from overwriting a browser session already claimed by another connector.
-- Requires the signed-in approved owner and the matching browser secret.

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
  v_session public.code_l