create or replace function tcg_private.make_join_code()
returns text
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  select translate(
    substr(md5(gen_random_uuid()::text || clock_timestamp()::text || random()::text),1,6),
    '0123456789abcdef',
    '23456789ABCDEFGH'
  );
$$;
revoke all on function tcg_private.make_join_code() from public, anon, authenticated;