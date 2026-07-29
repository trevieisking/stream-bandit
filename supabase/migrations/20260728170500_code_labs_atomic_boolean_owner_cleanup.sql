-- POST-CUTOVER CLEANUP ONLY.
-- This compatibility cleanup is folded into the final hardening migration before any deployment decision.
-- The authoritative final owner remains 20260728172000_code_labs_v50_coherent_hardening.sql.

begin;

-- Remove the obsolete string-coercing boolean helper and leave the strict
-- expansion helper as the only service-role boolean boundary.
revoke all on function public.code_labs_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated, service_role;
drop function if exists public.code_labs_jsonb_boolean(jsonb, boolean, text);

revoke all on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  to service_role;

commit;
